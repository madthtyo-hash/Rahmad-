# ☁️ Supabase — Database Online Kartu Digital

Folder ini menyiapkan **database online** supaya RSVP & daftar tamu dari HP tamu mana pun
tersimpan ke satu tempat dan bisa dipantau dari Studio Admin.

> **Opsional 100%.** Selama `supabase-config.json` belum diisi, website tetap jalan seperti
> sekarang (localStorage + `data/studio-db.json`). Tidak ada error, tidak ada request tambahan.

---

## Kenapa perlu?

| Tanpa Supabase (sekarang) | Dengan Supabase |
|---|---|
| RSVP tamu tersimpan di HP tamu itu sendiri | Semua RSVP masuk ke 1 database online |
| Admin harus lihat RSVP dari HP masing-masing | Admin buka Studio → semua RSVP & tamu terkumpul |
| Ganti HP = data tamu hilang (kecuali backup manual) | Data aman di cloud |

---

## Langkah pasang (sekali saja, ±5 menit)

### 1. Buat project Supabase
1. Buka <https://supabase.com> → daftar/masuk → **New project**.
2. Isi nama project, database password (simpan sendiri), pilih region **Singapore** (paling dekat).
3. Tunggu ±2 menit sampai project selesai dibuat.

### 2. Jalankan skema database
1. Di dashboard Supabase → menu **SQL Editor** → **New query**.
2. Buka file [`schema.sql`](schema.sql) di folder ini, **copy semua isinya**, paste ke SQL Editor.
3. Klik **Run**. Harus muncul `Success. No rows returned`.
4. Cek menu **Table Editor** → harus ada tabel `invitations`, `guests`, `rsvp`
   (plus view `guests_public`).

### 3. Ambil URL & kunci
1. Menu **Settings** → **API Keys** (project lama: **Settings** → **API**).
2. Copy **Project URL** (contoh: `https://abcdefgh.supabase.co`).
3. Copy **Publishable key** — diawali **`sb_publishable_...`**
   (project lama: kolom **anon public**, diawali `eyJ...`). Keduanya didukung aplikasi ini.

> ⚠️ **PENTING:** yang dipakai hanya **Publishable / anon public**.
> **JANGAN pernah** memakai/publikasikan **Secret key** (`sb_secret_...`) atau
> **`service_role`** — itu kunci rahasia penuh yang bisa menghapus seluruh database
> dan memang dirancang untuk kode server saja, bukan untuk browser.

### 4. Isi config di repo ini
Buka file **`supabase-config.json`** di root repo, isi seperti ini:

```json
{
  "enabled": true,
  "url": "https://abcdefgh.supabase.co",
  "anonKey": "eyJhbGciOi...anon...",
  "tables": { "invitations": "invitations", "guests": "guests", "rsvp": "rsvp" },
  "pullOnLoad": true
}
```

Commit + push. Selesai — tidak perlu ubah file HTML apa pun.

### 5. Cek dari Studio
1. Buka `https://kartudigital.my.id/studio.html`.
2. Klik tab **Penyimpanan Lokal HP & Backup Folder**.
3. Klik **🔌 Cek Koneksi** → harus muncul “Supabase terhubung & siap dipakai”.
   (Status akan menampilkan jenis kunci yang dipakai, mis. `kunci: publishable`.)
4. Klik **⬆ Kirim ke Supabase** untuk memindahkan undangan + RSVP yang sudah ada.
5. Buka undangan dari HP lain → kirim RSVP → klik **⬇ Ambil dari Supabase** di Studio → RSVP muncul.

---

## Cara kerja singkat

```
Tamu buka undangan  →  kirim RSVP  →  POST ke Supabase (tabel rsvp, hanya boleh TAMBAH)
                                    ↘ tetap disimpan lokal di HP tamu (cadangan offline)
Admin buka Studio   →  tarik data  →  GET dari Supabase → tampil di dashboard
Admin ubah undangan →  simpan      →  PUT api/db (lokal) + upsert ke Supabase
Daftar tamu massal  →  kirim       →  INSERT ke tabel guests (hanya menambah, isi tetap privat)
```

- **Undangan** dibaca dari Supabase (termasuk contoh 3 tema yang dibuat saat menjalankan
  `schema.sql`). Di cloud, undangan bersifat **read-only** dari browser — jadi tidak ada
  pihak yang bisa mengubah/menghapus undangan Anda, tapi juga artinya tombol Kirim tidak
  ikut mengunggah undangan (cukup tampilkan peringatan halus, RSVP & tamu tetap terkirim).
- **RSVP** memakai `external_id` unik sehingga aman dikirim berulang (tidak dobel).
- **Tamu** hanya bisa **ditambah**, tidak bisa dibaca dari browser — jadi **nomor HP tamu
  tidak mungkin diunduh siapa pun**, walau punya kunci publik.

---

## Keamanan (baca ini)

### Arti temuan Supabase Security Advisor

Setelah menjalankan `schema.sql` versi **v5**, sebagian besar temuan sudah hilang sendiri
(file ini aman dijalankan ulang). Sisa peringatan yang muncul **memang disengaja**:

| Temuan | Status | Penjelasan |
|---|---|---|
| Security Definer View (`guests_public`) | ✅ hilang di v5 | view publiknya sudah dihapus |
| Function Search Path Mutable (`kd_touch_updated_at`) | ✅ hilang di v5 | fungsi diberi `search_path` tetap |
| RLS Policy Always True — `invitations` (baca) | ⚠️ disengaja | undangan memang harus bisa dilihat semua tamu |
| RLS Policy Always True — `rsvp` (tambah & baca) | ⚠️ disengaja | tamu harus bisa kirim & melihat ucapan |
| RLS Policy Always True — `guests` (tambah) | ⚠️ disengaja | Studio perlu menambah tamu dari generator massal |

Yang **tidak** lagi boleh dilakukan publik (sudah dicabut di v5): mengubah/menghapus
undangan, menghapus RSVP, dan mengubah/menghapus/membaca daftar tamu.

### Catatan kunci

Kunci **publishable/anon** memang publik dan dilindungi **RLS**.

Catatan teknis: aplikasi mengirim kunci di header `apikey`. Kunci lama berformat JWT juga
dikirim di header `Authorization: Bearer`. Kunci berbentuk **`sb_secret_`** otomatis
**ditolak** oleh aplikasi (fitur keamanan) supaya tidak pernah ikut terpublikasikan.

Kalau Anda ingin lebih ketat lagi (mis. agar tidak ada yang bisa menambah tamu sembarangan):

1. Aktifkan **Authentication → Providers → Email** di Supabase, buat 1 akun admin.
2. Jalankan blok **BLOK HARDENING** di bagian bawah `schema.sql` (hapus tanda `--` lalu Run)
   → semua penulisan hanya untuk user yang login.
3. Beri tahu saya kalau mau saya tambahkan **layar login admin** di `studio.html`
   supaya tombol kirim/ambil otomatis memakai sesi login itu.

Catatan kecil lainnya:
- RSVP & tamu tetap boleh ditambah publik (memang begitu cara kerja undangan digital).
  Risikonya hanya spam; kalau nanti jadi masalah, bisa ditambah rate-limit/turnstile
  (bilang saja kalau mau dibuatkan).
- `music_url` tidak diisi dari sisi aplikasi karena musik tema sudah dibuat sendiri di
  dalam file HTML (tanpa file/CDN luar).

---

## Kalau ingin mematikan kembali

Ubah `supabase-config.json` → `"enabled": false` (atau kosongkan `url`).
Website langsung kembali ke mode lama tanpa error, dan data lokal tetap utuh.
