-- ============================================================
--  KARTU DIGITAL — DATABASE SUPABASE v6 (13 Tema: + Aqiqah & Wisuda)
--  Untuk: undangan Pernikahan, Khitanan, Aqiqah, Ulang Tahun anak & Wisuda
--  Cara pakai (pilih salah satu):
--    A. OTOMATIS via GitHub Integration — file ini sama persis dengan
--       supabase/migrations/20261003013708_kartu_digital_init.sql,
--       jadi cukup push/merge ke branch main (lihat supabase/README.md).
--    B. MANUAL — Supabase > SQL Editor > New query > Paste isi file ini > Run.
--
--  ✅ AMAN DIJALANKAN ULANG — kalau Anda sudah pernah menjalankan
--     versi sebelumnya, cukup jalankan file ini lagi untuk
--     membereskan semua temuan Security Advisor.
--
--  Perubahan v5 → v6 (kategori acara baru):
--   1. Kolom event_type kini juga menerima `aqiqah` dan `wisuda`
--      (bagian 2b melebarkan batasannya, aman untuk database lama).
--   2. Contoh data awal ditambah 2 baris: aqiqah & wisuda.
--
--  Perubahan v4 → v5 (perbaikan keamanan):
--   1. View publik `guests_public` DIHAPUS  → hilang temuan CRITICAL
--      "Security Definer View". Daftar tamu kini privat sepenuhnya
--      (dari browser hanya bisa MENAMBAH tamu, tidak membaca).
--   2. Fungsi trigger diberi `search_path` tetap → hilang temuan
--      "Function Search Path Mutable".
--   3. Kebijakan tulis publik yang tidak perlu dicabut:
--      - invitations → read-only (publik hanya boleh membaca)
--      - rsvp        → publik hanya boleh TAMBAH + BACA
--      - guests      → publik hanya boleh TAMBAH
--      Sisa peringatan "RLS Policy Always True" hanya pada 4 baris
--      yang memang harus publik (baca undangan & kirim RSVP).
-- ============================================================

-- 1. Enable UUID -------------------------------------------------
create extension if not exists "uuid-ossp";

-- 2. Tabel utama undangan ---------------------------------------
create table if not exists invitations (
  id            uuid primary key default uuid_generate_v4(),
  slug          text unique not null,
  external_id   text,                               -- id dari Studio lokal (iceblue-adi-lina, dst)
  event_type    text not null check (event_type in ('pernikahan','khitanan','ultah','aqiqah','wisuda')),
  theme         text default 'iceblue',
  theme_file    text,                               -- undangan-iceblue.html
  is_premium    boolean default false,
  status        text default 'Aktif',
  views         int default 0,
  title         text,
  -- pernikahan
  groom_name    text,
  bride_name    text,
  -- khitanan / ultah
  child_name    text,
  parents_name  text,
  -- umum
  quote         text,
  event_date    date not null,
  event_time    time default '08:00',
  akad_time     text,
  resepsi_time  text,
  venue_name    text,
  venue_maps    text,
  music_url     text,
  payload       jsonb default '{}'::jsonb,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- 2b. Pastikan kategori acara terbaru diizinkan (aman untuk DB lama) --
--  Kalau project Supabase Anda sudah terlanjur dibuat dengan versi lama,
--  batasan event_type di bawah ini akan diperbarui otomatis.
alter table invitations drop constraint if exists invitations_event_type_check;
alter table invitations add constraint invitations_event_type_check
  check (event_type in ('pernikahan','khitanan','ultah','aqiqah','wisuda'));

-- 3. Tabel tamu undangan (privat) -------------------------------
create table if not exists guests (
  id             uuid primary key default uuid_generate_v4(),
  invitation_id  uuid references invitations(id) on delete cascade,
  invitation_slug text,                              -- salinan slug, aman walau undangan dihapus
  name           text not null,
  phone          text,
  group_name     text default 'keluarga',
  slug_personal  text,                               -- untuk link ?to=Nama
  checked_in     boolean default false,
  checked_in_at  timestamptz,
  created_at     timestamptz default now()
);

-- 4. Tabel RSVP + Ucapan (jadi satu biar simple) ----------------
create table if not exists rsvp (
  id             uuid primary key default uuid_generate_v4(),
  external_id    text unique,                        -- id dari Studio lokal (rsvp-7, dst)
  invitation_id  uuid references invitations(id) on delete cascade,
  invitation_slug text not null,                     -- undangan mana yang di-RSVP
  guest_id       uuid references guests(id) on delete set null,
  name           text not null,
  attendance     text check (attendance in ('hadir','tidak_hadir','ragu')),
  pax            int default 1,
  phone          text,
  message        text,
  created_at     timestamptz default now()
);

-- 5. Index biar cepat -------------------------------------------
create index if not exists idx_invitations_slug   on invitations(slug);
create index if not exists idx_guests_invitation  on guests(invitation_slug);
create index if not exists idx_rsvp_invitation    on rsvp(invitation_slug);
create index if not exists idx_rsvp_created       on rsvp(created_at desc);

-- 6. Auto-update kolom updated_at (search_path dikunci) ---------
create or replace function public.kd_touch_updated_at() returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = pg_catalog.now();
  return new;
end;
$$;

drop trigger if exists trg_invitations_updated on invitations;
create trigger trg_invitations_updated
  before update on invitations
  for each row execute function public.kd_touch_updated_at();

-- 7. BERSIHKAN SISA VERSI LAMA (perbaikan Security Advisor) -----
-- 7a. Hapus view publik yang memicu temuan CRITICAL
drop view if exists public.guests_public;

-- 7b. Cabut kebijakan tulis yang berlebihan
drop policy if exists "public write"        on invitations;
drop policy if exists "public update"       on invitations;
drop policy if exists "public delete"       on invitations;
drop policy if exists "public update rsvp"  on rsvp;
drop policy if exists "public delete rsvp"  on rsvp;
drop policy if exists "public update guests" on guests;
drop policy if exists "public delete guests" on guests;
drop policy if exists "public read guests"   on guests;

-- 8. RLS + kebijakan final --------------------------------------
alter table invitations enable row level security;
alter table guests      enable row level security;
alter table rsvp        enable row level security;

-- UNDANGAN: publik boleh BACA saja (tidak bisa diubah dari browser)
drop policy if exists "public read" on invitations;
create policy "public read" on invitations for select using (true);

-- RSVP: publik boleh TAMBAH ucapan & BACA ucapan (tidak bisa hapus/ubah)
drop policy if exists "public insert rsvp" on rsvp;
create policy "public insert rsvp" on rsvp for insert with check (true);
drop policy if exists "public read rsvp"   on rsvp;
create policy "public read rsvp"   on rsvp for select using (true);

-- TAMU: publik hanya boleh TAMBAH (generator tamu dari Studio).
-- Isi tabel — termasuk nomor HP — TIDAK dapat dibaca dari browser.
drop policy if exists "public insert guests" on guests;
create policy "public insert guests" on guests for insert with check (true);

-- 9. Contoh data awal (5 jenis acara) ---------------------------
insert into invitations
  (slug, external_id, event_type, theme, theme_file, groom_name, bride_name,
   child_name, parents_name, event_date, akad_time, resepsi_time, venue_name, venue_maps)
values
  ('iceblue-adi-lina', 'iceblue-adi-lina', 'pernikahan', 'Ice Blue Floral', 'undangan-iceblue.html',
   'Adi', 'Lina', null, 'Putra dari Bapak H. Fadillah & Ibu Hj. Nurhayati',
   '2026-12-14', '08.00 - 10.00 WIB', '11.00 - 14.00 WIB',
   'The Ice Blue Hall', 'https://www.google.com/maps/search/?api=1&query=Gatot+Subroto+Jakarta'),
  ('iceblue-khitanan-alif', 'iceblue-khitanan-alif', 'khitanan', 'Ice Blue Barakah', 'undangan-iceblue-khitanan.html',
   null, null, 'M. Alif Fadhlan', 'Putra dari Bapak Andri Saputra & Ibu Fitri Handayani',
   '2026-11-22', '09.00 - 11.00 WIB', '11.00 - 14.00 WIB',
   'Aula Al-Ikhlas', 'https://www.google.com/maps/search/?api=1&query=Cihampelas+Bandung'),
  ('iceblue-ultah-kalila', 'iceblue-ultah-kalila', 'ultah', 'Ice Blue Party', 'undangan-iceblue-ultah.html',
   null, null, 'Kalila Zahra', 'Putri dari Bapak Rizky Pratama & Ibu Anisa Rahmawati',
   '2026-12-06', '15.00 - 16.30 WIB', '16.30 - 19.00 WIB',
   'Frosty Garden Cafe', 'https://www.google.com/maps/search/?api=1&query=Dago+Bandung'),
  ('aqiqah-ghani', 'aqiqah-ghani', 'aqiqah', 'Aqiqah Rahmah', 'undangan-aqiqah.html',
   null, null, 'Muhammad Ghani Alaric', 'Putra dari Bapak Fajar Nugraha & Ibu Salsabila Putri',
   '2026-11-08', '08.00 - 10.00 WIB', '10.00 - 13.00 WIB',
   'Masjid Nurul Iman', 'https://www.google.com/maps/search/?api=1&query=Cihampelas+Bandung'),
  ('wisuda-naura', 'wisuda-naura', 'wisuda', 'Grand Graduation', 'undangan-wisuda.html',
   null, null, 'Naura Safira, S.Ked', 'Putri dari Bapak Drs. Ahmad Fauzi & Ibu Hj. Lilis Suryani',
   '2026-12-05', '08.00 - 11.00 WIB', '12.00 - 15.00 WIB',
   'Graha Sabha Universitas Nusantara', 'https://www.google.com/maps/search/?api=1&query=Dipatiukur+Bandung')
on conflict (slug) do nothing;

-- 10. OPSIONAL: realtime RSVP (langsung muncul tanpa refresh)
-- alter publication supabase_realtime add table rsvp;

-- ============================================================
--  BLOK HARDENING — opsional, kalau ingin lebih ketat lagi
--  Aktifkan kalau nanti Studio punya login admin (Supabase Auth).
--  Setelah dijalankan, hanya user yang LOGIN yang bisa menambah tamu,
--  mengubah undangan, dan menghapus RSVP.
-- ============================================================
-- drop policy if exists "public insert guests" on guests;
-- create policy "auth insert guests" on guests for insert to authenticated with check (true);
-- create policy "auth update guests" on guests for update to authenticated using (true) with check (true);
-- create policy "auth delete guests" on guests for delete to authenticated using (true);
-- create policy "auth read guests"   on guests for select to authenticated using (true);
-- create policy "auth write"  on invitations for insert to authenticated with check (true);
-- create policy "auth update" on invitations for update to authenticated using (true) with check (true);
-- create policy "auth delete" on invitations for delete to authenticated using (true);
-- create policy "auth delete rsvp" on rsvp for delete to authenticated using (true);
-- create policy "auth update rsvp" on rsvp for update to authenticated using (true) with check (true);
