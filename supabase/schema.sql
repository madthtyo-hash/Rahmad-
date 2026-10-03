-- ============================================================
--  KARTU DIGITAL — DATABASE SUPABASE v4 (Ice Blue 3-in-1)
--  Untuk: undangan Pernikahan, Khitanan, Ulang Tahun anak
--  Cara pakai: Supabase > SQL Editor > New query > Paste > Run
--
--  Catatan penting:
--  - Kolom "payload" (jsonb) menyimpan konfigurasi LENGKAP satu
--    undangan persis seperti format Studio (foto, galeri, amplop,
--    QRIS, RSVP, rundown, dsb). Kolom lain hanya salinan ringkas
--    supaya mudah dicari/difilter lewat query.
--  - Semua perintah aman dijalankan berulang kali (idempotent).
-- ============================================================

-- 1. Enable UUID -------------------------------------------------
create extension if not exists "uuid-ossp";

-- 2. Tabel utama undangan ---------------------------------------
create table if not exists invitations (
  id            uuid primary key default uuid_generate_v4(),
  slug          text unique not null,
  external_id   text,                               -- id dari Studio lokal (iceblue-adi-lina, dst)
  event_type    text not null check (event_type in ('pernikahan','khitanan','ultah')),
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

-- 3. Tabel tamu undangan ----------------------------------------
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

-- 6. Auto-update kolom updated_at -------------------------------
create or replace function kd_touch_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_invitations_updated on invitations;
create trigger trg_invitations_updated
  before update on invitations
  for each row execute function kd_touch_updated_at();

-- 7. Tampilan publik tamu (nomor HP TIDAK ikut tampil) ----------
--    Tabel guests langsung tidak bisa dibaca publik; yang publik
--    hanya view ini supaya data pribadi tamu tidak bocor.
create or replace view guests_public as
  select id, invitation_id, invitation_slug, name, group_name,
         slug_personal, checked_in, created_at
  from guests;

grant select on guests_public to anon, authenticated;

-- 8. RLS (biar bisa diakses dari undangan-iceblue.html) --------
alter table invitations enable row level security;
alter table guests      enable row level security;
alter table rsvp        enable row level security;

-- undangan: publik boleh baca & boleh tulis (Studio memakai anon key)
drop policy if exists "public read"       on invitations;
create policy "public read"       on invitations for select using (true);
drop policy if exists "public write"      on invitations;
create policy "public write"      on invitations for insert with check (true);
drop policy if exists "public update"     on invitations;
create policy "public update"     on invitations for update using (true) with check (true);
drop policy if exists "public delete"     on invitations;
create policy "public delete"     on invitations for delete using (true);

-- rsvp: publik boleh kirim & baca ucapan
drop policy if exists "public insert rsvp" on rsvp;
create policy "public insert rsvp" on rsvp for insert with check (true);
drop policy if exists "public read rsvp"   on rsvp;
create policy "public read rsvp"   on rsvp for select using (true);
drop policy if exists "public update rsvp" on rsvp;
create policy "public update rsvp" on rsvp for update using (true) with check (true);
drop policy if exists "public delete rsvp" on rsvp;
create policy "public delete rsvp" on rsvp for delete using (true);

-- tamu: publik boleh menambah (generator tamu dari Studio)
--       publik TIDAK boleh select tabel mentah — pakai view guests_public
drop policy if exists "public insert guests" on guests;
create policy "public insert guests" on guests for insert with check (true);
drop policy if exists "public update guests" on guests;
create policy "public update guests" on guests for update using (true) with check (true);
drop policy if exists "public delete guests" on guests;
create policy "public delete guests" on guests for delete using (true);

-- 9. Contoh data awal (3 jenis acara, tema Ice Blue) -----------
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
   'Frosty Garden Cafe', 'https://www.google.com/maps/search/?api=1&query=Dago+ Bandung')
on conflict (slug) do nothing;

-- 10. OPSIONAL: realtime RSVP (langsung muncul tanpa refresh)
--     Hapus tanda -- di bawah kalau mau mencoba.
-- alter publication supabase_realtime add table rsvp;

-- ============================================================
--  BLOK HARDENING (opsional, lebih aman)
--  Jalankan blok ini kalau ingin mematikan akses tulis publik.
--  Setelah dijalankan, hanya user yang LOGIN ke Supabase
--  (role "authenticated") yang bisa mengubah data dari Studio.
-- ============================================================
-- drop policy if exists "public write"  on invitations;
-- drop policy if exists "public update" on invitations;
-- drop policy if exists "public delete" on invitations;
-- create policy "auth write"  on invitations for insert to authenticated with check (true);
-- create policy "auth update" on invitations for update to authenticated using (true) with check (true);
-- create policy "auth delete" on invitations for delete to authenticated using (true);
-- drop policy if exists "public delete rsvp" on rsvp;
-- drop policy if exists "public update rsvp" on rsvp;
-- create policy "auth delete rsvp" on rsvp for delete to authenticated using (true);
-- drop policy if exists "public insert guests" on guests;
-- drop policy if exists "public update guests" on guests;
-- drop policy if exists "public delete guests" on guests;
-- create policy "auth write guests" on guests for insert to authenticated with check (true);
-- create policy "auth update guests" on guests for update to authenticated using (true) with check (true);
-- create policy "auth delete guests" on guests for delete to authenticated using (true);
