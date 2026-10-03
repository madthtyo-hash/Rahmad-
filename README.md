# Kartu Digital (kartudigital.my.id)

Platform Undangan Digital Elegan — Pernikahan, Khitanan, Ulang Tahun & Tema Premium.

## Fitur Utama & Pembaruan Terbaru
- **Studio Admin (`studio.html`)**: Dashboard kelola semua tema & detail undangan, live preview, serta generator link tamu WhatsApp (`?to=Nama+Tamu`).
- **Backend Studio (`server.js`, `studio-api.js`, `data/studio-db.json`)**: Mesin sinkronisasi data REST API (`/api/*`) sekaligus Cloud LocalSync untuk GitHub Pages (`kartudigital.my.id`).
- **Database Online Opsional (`supabase/`, `supabase-config.json`)**: Integrasi Supabase — RSVP & daftar tamu dari HP tamu mana pun tersimpan ke satu database online, lengkap dengan skema SQL, RLS, dan panduan pasang di [`supabase/README.md`](supabase/README.md). Nonaktif secara default (tanpa `url`/`anonKey` website tetap jalan seperti biasa).
- **Tema Pernikahan**:
  - `undangan-sage.html` — Sage Blossom ⭐
  - `undangan-jawa.html` — Jawa Heritage ✨
  - `undangan-demo.html` — Blush & Emerald Floral
  - `undangan-iceblue.html` — Ice Blue Floral ❄ (BARU: animasi salju, countdown, love story, galeri lightbox)
- **Tema Khitanan**:
  - `undangan-khitanan.html` — Al-Fatih Islamic Gold 🕌
  - `undangan-iceblue-khitanan.html` — Ice Blue Barakah ❄ (BARU: rundown acara + doa & ucapan)
- **Tema Ulang Tahun**:
  - `undangan-ultah.html` — Sweet Wonder Party 🎂
  - `undangan-iceblue-ultah.html` — Ice Blue Party ❄ (BARU: agenda pesta, games & ice cream party)
- **Tema Premium Eksklusif**:
  - `undangan-premium.html` — Royal Gold Luxury 👑 (dengan QR Check-In Buku Tamu VIP)
- **Upload Foto**: Upload foto cover, foto profil, dan multi-foto galeri lightbox dengan kompresi otomatis.
- **Pengaturan Amplop Digital**: Kelola multi-rekening bank & e-wallet (BCA, Mandiri, BRI, BNI, BSI, DANA, GoPay, OVO), tombol salin rekening, dan konfirmasi WhatsApp (`6285196755675`).
- **Pengaturan RSVP**: Pengaturan batas waktu konfirmasi, kuota tamu, rekap kehadiran real-time, buku tamu ucapan & doa, serta Export CSV.
