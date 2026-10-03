# Kartu Digital (kartudigital.my.id)

Platform Undangan Digital Elegan — Pernikahan, Khitanan, Aqiqah, Ulang Tahun, Wisuda & Tema Premium.

## Fitur Utama & Pembaruan Terbaru
- **Studio Admin (`studio.html`)**: Tampilan baru mobile-first yang tetap rapi di desktop — laci menu (☰), bilah atas, hero, **tab pil: Data Utama · Tema & Visual · Galeri Foto · Lokasi & Map · Fitur Ekstra**, kartu-kartu rapi, sakelar on/off, serta **bilah aksi bawah** (Simpan Perubahan & Bagikan Link Tamu). Semua fitur lama tetap ada: live preview, 13 tema, amplop digital, RSVP, dan generator link tamu WhatsApp (`?to=Nama+Tamu`).
- **Backend Studio (`server.js`, `studio-api.js`, `data/studio-db.json`)**: Mesin sinkronisasi data REST API (`/api/*`) sekaligus Cloud LocalSync untuk GitHub Pages (`kartudigital.my.id`).
- **Database Online Opsional (`supabase/`, `supabase-config.json`)**: Integrasi Supabase — RSVP & daftar tamu dari HP tamu mana pun tersimpan ke satu database online, lengkap dengan skema SQL, RLS, dan panduan pasang di [`supabase/README.md`](supabase/README.md). Nonaktif secara default (tanpa `url`/`anonKey` website tetap jalan seperti biasa). Di Studio tersedia tombol **🧪 Uji Lengkap (5 bagian)** — memeriksa konfigurasi, skema, izin RSVP, privasi nomor HP tamu, dan keamanan undangan, tanpa mengubah data.
- **Tema Pernikahan**:
  - `undangan-sage.html` — Sage Blossom ⭐
  - `undangan-jawa.html` — Jawa Heritage ✨
  - `undangan-demo.html` — Blush & Emerald Floral
  - `undangan-iceblue.html` — Ice Blue Floral ❄ (animasi salju, countdown, love story, galeri lightbox)
  - `undangan-midnight.html` — Midnight Emerald 🌙 **(BARU: love story, ornamen emas, FX kelip bintang)**
- **Tema Khitanan**:
  - `undangan-khitanan.html` — Al-Fatih Islamic Gold 🕌
  - `undangan-iceblue-khitanan.html` — Ice Blue Barakah ❄ (rundown acara + doa & ucapan)
- **Kategori Baru — Tema Aqiqah & Tasyakuran Bayi 🍼**:
  - `undangan-aqiqah.html` — Aqiqah Rahmah 🍼 **(BARU: ayat & doa aqiqah, rundown prosesi, kado digital)**
- **Kategori Baru — Tema Wisuda & Kelulusan 🎓**:
  - `undangan-wisuda.html` — Grand Graduation 🎓 **(BARU: profil wisudawan, pencapaian, animasi konfeti)**
- **Tema Ulang Tahun**:
  - `undangan-ultah.html` — Sweet Wonder Party 🎂
  - `undangan-iceblue-ultah.html` — Ice Blue Party ❄ (agenda pesta, games & ice cream party)
- **Tema Premium Eksklusif**:
  - `undangan-premium.html` — Royal Gold Luxury 👑 (dengan QR Check-In Buku Tamu VIP)
  - `undangan-platinum.html` — Platinum Marble 👑 **(BARU: VIP Access Pass + QR Check-In, reservasi Gala Dinner & fasilitas VIP)**
- **Musik Latar MP3 🎵**: 6 lagu bebas royalti di `musik/` (Romantis, Lembut Islami, Ninabobo, Prosesi Wisuda, Ceria Pesta, Jawa Pentatonik). Pilih per undangan di tab **Tema & Visual → Musik Latar Undangan** (atau tempel link MP3 sendiri / "tanpa musik"), dan pilih lagu halaman depan di tab **Fitur Ekstra → Musik Halaman Depan**. Tombol musik muncul otomatis di undangan maupun di halaman depan.
- **Upload Foto**: Upload foto cover, foto profil, dan multi-foto galeri lightbox dengan kompresi otomatis.
- **Pengaturan Amplop Digital**: Kelola multi-rekening bank & e-wallet (BCA, Mandiri, BRI, BNI, BSI, DANA, GoPay, OVO), tombol salin rekening, dan konfirmasi WhatsApp (`6285196755675`).
- **Pengaturan RSVP**: Pengaturan batas waktu konfirmasi, kuota tamu, rekap kehadiran real-time, buku tamu ucapan & doa, serta Export CSV.

## Pemeriksa & Uji (untuk pengembang)

- `python3 tools/audit.py` — memeriksa 9 bagian: syntax JS/JSON, struktur HTML, link lokal,
  registrasi tema di Studio, hook tema baru, katalog, aturan nomor WhatsApp & link Studio,
  footer/meta, serta skema & migrasi Supabase.
- `node tools/test-cloud.js` — menguji lapisan Supabase Cloud (tarik/kirim data, pemetaan RSVP,
  penolakan kunci rahasia, fallback saat offline) memakai jaringan tiruan — aman, tanpa
  menyentuh database sungguhan.
- `node tools/ui-test.js` — uji UI nyata memakai jsdom: memuat halaman undangan sungguhan lalu
  memeriksa hydrate data Studio (nama di cover, foto, rekening amplop, galeri, batas RSVP, buku
  ucapan), interaksi tamu (buka undangan, countdown, lightbox, kirim RSVP, salin rekening),
  pemutar musik MP3 per undangan & halaman depan, kategori & label Studio Admin, koleksi yang
  dikelompokkan per kategori, serta filter katalog halaman depan. Perlu `npm install` sekali
  (jsdom sebagai devDependency); server uji dijalankan otomatis di port `3131`
  (`UI_TEST_PORT=3232` untuk mengganti). Uji ini tidak menyentuh Supabase dan tidak mengubah
  `data/studio-db.json`.
- `node tools/a11y-test.js` — uji aksesibilitas otomatis (axe-core): halaman depan, Studio Admin,
  dan ke-13 halaman tema diperiksa pelanggaran berisiko *serious/critical* (nama tombol, label
  form, peran ARIA), ditambah cek perilaku keyboard: tab editor Studio (panah kiri/kanan), kotak
  Galeri (`role="dialog"`, Escape, fokus terkunci & kembali ke foto asal), pilihan kehadiran RSVP,
  dan tombol musik. Perlu `npm install` (axe-core sebagai devDependency); port uji `3232`
  (`A11Y_TEST_PORT=3333` untuk mengganti).
- `npm test` — menjalankan pemeriksa berurutan: audit → cloud → UI → aksesibilitas.
- `python3 tools/make-thumbs.py` — membuat ulang 13 thumbnail katalog di `thumbs/` (butuh ImageMagick).
- `python3 tools/make-music.py` — membuat ulang 6 lagu MP3 bebas royalti di `musik/` (butuh `pip install lameenc`).
- `node tools/check-cloud.js` — memeriksa koneksi ke project Supabase **asli** yang sudah diisi
  di `supabase-config.json`: skema, izin RSVP, privasi daftar tamu (nomor HP), dan sifat
  read-only undangan. Aman diulang karena tidak menulis data.

Integrasi Supabase opsional dijelaskan lengkap di [`supabase/README.md`](supabase/README.md).
