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

### 2. Pasang skema database — pilih salah satu

**Cara A — Connect GitHub (otomatis, sekali set lalu lupakan)**
1. Buka **Project Settings → Integrations** → cari **GitHub Integration** → **Authorize GitHub**.
2. Pilih repository **`madthtyo-hash/Rahmad-`**.
3. Isi **Working directory** = `.` (titik — karena folder `supabase/` ada di root repo).
4. Aktifkan **Deploy to production**, pastikan production branch = **`main`**.
5. Klik **Enable integration**.
   Setelah itu setiap kali `supabase/migrations/*.sql` di-push/merge ke `main`,
   Supabase menjalankan migrasinya sendiri — tidak perlu paste SQL lagi.

> Syaratnya: folder `supabase/` (berisi `config.toml` + `migrations/`) harus sudah ada di
> branch **`main`**. Kalau masih di branch PR, merge dulu PR-nya.

**Cara B — Paste manual (paling cepat)**
1. Di dashboard Supabase → menu **SQL Editor** → **New query**.
2. Buka file [`schema.sql`](schema.sql) di folder ini, **copy semua isinya**, paste ke SQL Editor.
3. Klik **Run**. Harus muncul `Success. No rows returned`.
4. Cek menu **Table Editor** → harus ada tabel `invitations`, `guests`, `rsvp`.

> Dua cara ini isinya sama: `schema.sql` = salinan untuk paste manual,
> [`migrations/20261003013708_kartu_digital_init.sql`](migrations/20261003013708_kartu_digital_init.sql)
> = file migrasi untuk integrasi GitHub (isinya identik).
> Skemanya **aman dijalankan berulang kali**, jadi kalau sudah pernah paste manual
> lalu GitHub integration jalan, tidak akan error dan tidak menggandakan data.

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
  "anonKey": "sb_publishable_xxxxxxxxxxxx",
  "tables": { "invitations": "invitations", "guests": "guests", "rsvp": "rsvp" },
  "pullOnLoad": true
}
```

> Nilai `anonKey` boleh diisi **Publishable key** (`sb_publishable_...`) atau
> **anon key lama** (`eyJ...`) — keduanya didukung.

Commit + push. Selesai — tidak perlu ubah file HTML apa pun.

### 5. Cek dari Studio
1. Buka `https://kartudigital.my.id/studio.html`.
2. Klik tab **Penyimpanan Lokal HP & Backup Folder**.
3. Klik **🔌 Cek Koneksi** → harus muncul “Supabase terhubung & siap dipakai”.
   (Status akan menampilkan jenis kunci yang dipakai, mis. `kunci: publishable`.)
4. Klik **⬆ Kirim ke Supabase** untuk memindahkan undangan + RSVP yang sudah ada.
5. Buka undangan dari HP lain → kirim RSVP → klik **⬇ Ambil dari Supabase** di Studio → RSVP muncul.

### 6. Cek otomatis dari komputer (opsional, disarankan)

Mau bukti lengkap dalam sekali jalan — termasuk memastikan **nomor HP tamu benar-benar tidak
bisa diunduh** dan **undangan tidak bisa diubah** orang lain? Jalankan:

```bash
cd /home/user/Rahmad-
node tools/check-cloud.js
```

Alat ini menembak project Supabase Anda yang asli dan memeriksa 5 hal: konfigurasi, jangkauan
server + skema, izin RSVP, privasi daftar tamu, dan sifat read-only undangan.
**Aman diulang kapan saja** — hanya membaca data, sedangkan uji izin tulis memakai baris
yang sengaja salah/kolom kosong sehingga **tidak ada satu pun baris yang tersimpan**.
Keluar dengan kode `1` kalau ada masalah (bisa dipakai di GitHub Actions nanti).

Contoh hasil kalau semuanya beres:

```
== C. RSVP (tamu boleh kirim & baca ucapan) ==
  ✓ tabel rsvp bisa dibaca → 5 RSVP terbaru terbaca
  ✓ tamu boleh mengirim RSVP dari browser → ditolak karena nilai uji (bukan karena izin)
== D. Daftar tamu (nomor HP) — harus PRIVAT ==
  ✓ daftar tamu TIDAK bisa dibaca dari browser → ditolak (401) — nomor HP aman
== RINGKASAN ==
  ✅ SEMUA SEHAT — Supabase siap dipakai.
```

### Kalau ada masalah (pemecahan cepat)

| Gejala di `node tools/check-cloud.js` | Artinya | Tindakan |
|---|---|---|
| `url & kunci sudah diisi ✗` | config masih kosong | isi langkah 4 di atas |
| `kunci AMAN untuk dipublikasikan ✗` | kunci `sb_secret_`/`service_role` terpasang | **hapus**, pakai Publishable/anon |
| `project Supabase bisa dihubungi ✗` → `fetch failed`/`timeout` | URL salah, internet mati, atau project di-pause | cek URL, buka dashboard Supabase (project gratis bisa pause) |
| `→ Kemungkinan kunci salah/terpotong` (HTTP 401) | kunci salah salin | salin ulang dari **Settings → API Keys** |
| `→ Kemungkinan tabel belum dibuat` (HTTP 404) | `schema.sql` belum dijalankan | jalankan langkah 2 (Cara A atau B) |
| `daftar tamu TIDAK bisa dibaca ✓✗` / `BAHAYA` | RLS tidak aktif | jalankan ulang `supabase/schema.sql` |
| `undangan tidak bisa diubah ✗` | masih ada kebijakan tulis lama | jalankan ulang `supabase/schema.sql` (bagian 7 mencabutnya) |

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

## Mengubah skema di kemudian hari

Jangan edit file migrasi yang sudah pernah dijalankan (Supabase menganggapnya sudah diterapkan).
Buat migrasi **baru**:

```bash
npx supabase migration new nama_perubahannya   # membuat file kosong ber-timestamp
# tulis SQL-nya di file itu, lalu commit + push
```

Kalau memakai **Cara B (paste manual)**, cukup tulis perubahannya di SQL Editor
(lalu rapikan `schema.sql` di repo supaya tetap sinkron).

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
