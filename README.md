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
- **Pemeriksaan & Hasil Undangan 🧾 (di Studio Admin)**: tab **Pemeriksaan** menampilkan daftar periksa otomatis 12 butir (nama, tanggal & jam, lokasi, link Maps, foto cover, galeri, rekening amplop, musik, RSVP, QR check-in, status undangan) beserta skor kelengkapan, catatan admin, dan tombol **Tampilkan Hasil Undangan** yang memuat undangan asli langsung di dalam Studio (iframe, lengkap dengan mode navigasi & efeknya). Status per undangan: **Menunggu Dicek / Disetujui / Perlu Revisi / Draf** + waktu pemeriksaan terakhir, tersimpan di database Studio.
- **Koleksi Studio berkelompok 🗂️**: koleksi di Studio bisa dikelompokkan **per Kategori** (6 kategori), **per Tanggal Acara** (urut bulan, mis. November 2026 → Desember 2026), atau **per Status Pemeriksaan** (Perlu Revisi → Menunggu Dicek → Disetujui → Draf), dengan filter kategori yang tetap bisa dipakai bersamaan. Tiap kartu menampilkan lencana status, ringkasan kelengkapan (mis. `12/12`), catatan admin, dan tombol **Cek & Hasil**.
- **Mode Navigasi Tamu 🧭 (9 mode, semua tema)**: Gulir normal, Snap per bagian, Slide horizontal, dan 6 efek premium (Fade sinematik, Buku 3D flip, Zoom halus, Naik, Kubus 3D, Blur). Pilih per undangan di tab **Tema & Visual → Mode Navigasi Tamu**, atau kunci lewat link `undangan-*.html?mode=cube`. Mode tersimpan di Studio ikut terbaca otomatis saat tamu membuka undangan (`?mode=` pada link tetap menang).
  - Sage Blossom & Jawa Heritage memakai mesin navigasi bawaan di halamannya.
  - 11 tema lain memakai mesin bersama [`vendor/nav-mode.js`](vendor/nav-mode.js) — tombol panah, titik bagian, geser/swipe, dan panah keyboard otomatis tersedia di mode per-halaman.
- **Musik Latar MP3 🎵**: 6 lagu bebas royalti di `musik/` (Romantis, Lembut Islami, Ninabobo, Prosesi Wisuda, Ceria Pesta, Jawa Pentatonik). Pilih per undangan di tab **Tema & Visual → Musik Latar Undangan** (atau tempel link MP3 sendiri / "tanpa musik"), dan pilih lagu halaman depan di tab **Fitur Ekstra → Musik Halaman Depan**. Tombol musik muncul otomatis di undangan maupun di halaman depan.
- **Upload Foto**: Upload foto cover, foto profil, dan multi-foto galeri lightbox dengan kompresi otomatis.
- **Pengaturan Amplop Digital**: Kelola multi-rekening bank & e-wallet (BCA, Mandiri, BRI, BNI, BSI, DANA, GoPay, OVO), tombol salin rekening, dan konfirmasi WhatsApp (`6285196755675`).
- **Pengaturan RSVP**: Pengaturan batas waktu konfirmasi, kuota tamu, rekap kehadiran real-time, buku tamu ucapan & doa, serta Export CSV.
  Setelah tamu mengirim RSVP, muncul tawaran satu ketuk **"Kabari lewat WhatsApp"** ke admin (teks sudah terisi nama, status, jumlah tamu, dan ucapan).
- **QR Check-In Buku Tamu 🎫 (semua tema)**: kartu QR asli (pustaka MIT di `vendor/qrcode.js`, hasilnya sudah diuji cocok dengan pembaca QR) berisi tautan check-in + kode unik `KD-XXXXXX` per undangan. Panitia memindai QR untuk mencatat kehadiran, dan tamu bisa menekan **Tandai Hadir** agar langsung masuk rekap RSVP. Bisa dinyalakan/dimatikan per undangan di tab **Tema & Visual → QR Check-In Buku Tamu**.
- **Satu Link untuk Semua Tamu 🔗**: kartu **Link Undangan & Cara Bagikan** di tab Fitur Ekstra — link bersih tanpa nama tamu untuk pelanggan & semua tamu, plus blok **Bagikan ke Semua Tamu Sekaligus** (satu pesan, banyak nomor via gateway atau WhatsApp). Link per nama tamu tetap ada sebagai opsi terlipat. Detail formatnya di [`docs/format-link-undangan.md`](docs/format-link-undangan.md).
- **Koneksi WhatsApp 📲 (di Studio Admin, tab Fitur Ekstra)**: dua cara kirim, pilih sesuai kebutuhan.
  - **Mode Link WhatsApp — gratis & selalu siap, tanpa token.** Studio membuat tautan `wa.me` berisi pesan undangan yang sudah terisi (nama tamu, acara, tanggal, lokasi, link undangan), lalu membuka WhatsApp/Web WhatsApp. Ada tombol **Kirim WA** di tiap baris tamu pada generator tamu massal.
  - **Mode Gateway otomatis — opsional.** Salin `wa-config.example.json` → `wa-config.json`, isi `token` + provider (**Fonnte** (default), **Wablas**, **Whacenter**, atau **custom** dengan `apiUrl` sendiri), lalu set `"enabled": true` dan mulai ulang server. Setelah itu Studio bisa mengirim **langsung tanpa membuka tab WhatsApp** — tombol **Kirim Semua via Gateway** mengirim ke semua tamu yang sudah diisi nomornya (jeda 350 ms tiap pesan), tombol **Uji Koneksi** mengirim pesan uji ke nomor admin, dan **RSVP baru otomatis dikabarkan ke nomor admin** (bisa dimatikan). Kolom pengaturan: nomor admin, saklar notifikasi RSVP, provider/API URL/token, kode negara (default `62`), dan template pesan (kode `{tamu} {acara} {tanggal} {lokasi} {link}`).
  - **Aman**: `wa-config.json` dan `data/wa-log.json` masuk `.gitignore` (tidak pernah ikut ter-commit/push), token hanya tersimpan di server dan ke browser hanya dikirim versi samar (`••••1234`), dan bila gateway nonaktif/gagal kirim, Studio otomatis jatuh ke mode link **gratis** supaya undangan tetap terkirim.
- **Simpan ke Kalender 📅 (semua tema)**: tombol `.ics` (Google/Apple/Outlook Calendar) + tautan **Google Calendar**, otomatis dari tanggal, jam resepsi, lokasi, dan judul undangan.

## Format Link Undangan (keluaran domain)

Bentuk tautan yang dibuat Studio Admin: **`https://<domain>/<tema>.html?id=<id-undangan>&to=<nama-tamu>&mode=<navigasi>&fx=<animasi>`**
— mis. `https://kartudigital.my.id/undangan-sage.html?id=sage-rahma-dika&to=Bapak+Budi&mode=scroll&fx=kelopak`.
Domain mengikuti tempat Studio dibuka (`window.location.origin` + path), jadi pindah domain atau
pasang di subfolder **link ikut menyesuaikan sendiri**; tanpa `?id=` halaman memakai undangan bawaan tema.
Daftar lengkap parameter (`id`, `to`/`tamu`, `mode`, `fx`, `checkin`), 13 berkas tema + ID bawaannya,
serta format link WhatsApp (`wa.me`), QR check-in, `.ics`/Google Calendar, dan notifikasi RSVP admin ada di
[`docs/format-link-undangan.md`](docs/format-link-undangan.md).

## Link Undangan & Cara Bagikan 🔗 (di Studio Admin)

**Satu link untuk semua tamu** — pilih undangan → tab **Fitur Ekstra** → kartu **🔗 Link Undangan & Cara Bagikan**:

- **📤 Serah Terima ke Pelanggan** — masukkan nama pemesan + nomor WhatsApp-nya (tersimpan di database), lalu
  **Salin Link** / **Salin Pesan** / kirim lewat WhatsApp atau **Kirim Otomatis** (gateway). Link yang sama
  dipakai pelanggan untuk mengecek dan membagikan ke semua tamunya: `…undangan-<tema>.html?id=<id>`.
- **📢 Bagikan ke Semua Tamu Sekaligus** — satu pesan untuk semua tamu (tanpa memilih nama): tempel daftar nomor
  WhatsApp (satu per baris, boleh disertai nama), lalu **Kirim ke Semua Nomor** lewat gateway, atau **Buka
  WhatsApp** dengan pesan siap untuk dikirim ke grup / banyak penerima sekaligus. Ada juga **Salin Pesan**.
- **Opsional — link & pesan dengan nama tiap tamu** (terlipat): untuk kasus khusus seperti tamu VIP yang namanya
  harus tampil di sampul (`?to=Nama+Tamu`), lengkap dengan generator nama massal.

Halaman undangan **menyegarkan datanya sendiri** dari server/Supabase/`data/studio-db.json` saat dibuka, jadi
pelanggan & tamu selalu melihat versi terakhir (termasuk mode navigasi dan efek dekorasi pilihan Studio).

## Link Pendek `/u/<slug>` 🔗

Setiap undangan punya link pendek yang otomatis mengalihkan ke halaman tema yang benar, mis.
**`https://kartudigital.my.id/u/rahma-dika`** → `/undangan-sage.html?id=sage-rahma-dika`.
Parameter lain ikut diteruskan (`?to=Nama+Tamu`, `?mode=`, `?fx=`, `?checkin=`), jadi link pendek bisa
dipakai untuk semua keperluan berbagi — praktis ditempel di WhatsApp, status, atau undangan cetak.

- Jalan di dua tempat: **server Node** punya rute `/u/<slug>` (302 + halaman penjelasan kalau slug salah),
  dan **GitHub Pages** memakai folder `u/<slug>/index.html` berisi pengalih + pratinjau WhatsApp (`og:*`).
- Perbarui dengan **`npm run short-links`** (atau `python3 tools/make-short-links.py`) setelah menambah undangan.
- Di Studio, kolom **🔗 Link Pendek** sudah tersedia di blok Serah Terima, dan bisa diganti dengan layanan
  sendiri (bit.ly/s.id) lewat kolom **Pakai Link Pendek Sendiri**. Detailnya di
  [`docs/format-link-undangan.md`](docs/format-link-undangan.md).

## Paket Harga

- **Hemat Rp79.000** (6 bulan), **Premium Rp149.000** (1 tahun + Studio Admin), **Eksklusif Rp299.000** (domain sendiri + tema Royal/Platinum).
- **Paket Spesial Aqiqah & Wisuda Rp69.000** — khusus tema `undangan-aqiqah.html` & `undangan-wisuda.html`, sudah termasuk musik MP3 pilihan, QR check-in buku tamu, dan tombol Simpan ke Kalender.

## Pemeriksa & Uji (untuk pengembang)

- `python3 tools/audit.py` — memeriksa 9 bagian: syntax JS/JSON, struktur HTML, link lokal,
  koneksi WhatsApp (contoh konfigurasi, `.gitignore`, endpoint, penyamaran token, panel Studio),
  registrasi tema di Studio, hook tema baru, katalog, aturan nomor WhatsApp & link Studio,
  footer/meta, serta skema & migrasi Supabase.
- `node tools/test-cloud.js` — menguji lapisan Supabase Cloud (tarik/kirim data, pemetaan RSVP,
  penolakan kunci rahasia, fallback saat offline) memakai jaringan tiruan — aman, tanpa
  menyentuh database sungguhan.
- `node tools/ui-test.js` — uji UI nyata memakai jsdom: memuat halaman undangan sungguhan lalu
  memeriksa hydrate data Studio (nama di cover, foto, rekening amplop, galeri, batas RSVP, buku
  ucapan), interaksi tamu (buka undangan, countdown, lightbox, kirim RSVP, salin rekening),
  pemutar musik MP3 per undangan & halaman depan, kategori & label Studio Admin, koleksi yang
  dikelompokkan per kategori/tanggal/status, pemeriksaan kelengkapan + status admin + pratinjau hasil
  undangan di Studio, filter katalog halaman depan, serta **mode navigasi tamu di 13 tema**
  (mode dari link & dari Studio, panah/titik/geser, dan pembersihan kelas mode saat berganti mode). Perlu `npm install` sekali
  (jsdom sebagai devDependency); server uji dijalankan otomatis di port `3131`
  (`UI_TEST_PORT=3232` untuk mengganti). Uji ini tidak menyentuh Supabase dan tidak mengubah
  `data/studio-db.json`.
- `node tools/test-wa.js` — uji integrasi WhatsApp **tanpa jaringan sungguhan**: menyalakan server uji
  di port `3471` (+ gateway tiruan di `3472`) dengan database, log, dan konfigurasi sementara
  (`STUDIO_DB`/`WA_LOG`/`WA_CONFIG` di folder `tmp/`), lalu memeriksa 26 hal: mode link tetap jalan saat
  gateway mati, penolakan kirim dengan pesan jelas, penyamaran token, normalisasi nomor `08xx` → `62xx`,
  pengiriman lewat gateway (header `Authorization`), riwayat pengiriman, notifikasi RSVP otomatis beserta
  saklarnya, penyimpanan pengaturan tanpa menghapus token, sampai panel WhatsApp & tombol kirim massal di
  Studio (jsdom). Tidak menyentuh `wa-config.json` maupun `data/studio-db.json`.
- `node tools/a11y-test.js` — uji aksesibilitas otomatis (axe-core): halaman depan, Studio Admin,
  dan ke-13 halaman tema diperiksa pelanggaran berisiko *serious/critical* (nama tombol, label
  form, peran ARIA), ditambah cek perilaku keyboard: tab editor Studio (panah kiri/kanan), kotak
  Galeri (`role="dialog"`, Escape, fokus terkunci & kembali ke foto asal), pilihan kehadiran RSVP,
  dan tombol musik. Perlu `npm install` (axe-core sebagai devDependency); port uji `3232`
  (`A11Y_TEST_PORT=3333` untuk mengganti).
- `npm test` — menjalankan pemeriksa berurutan: audit → cloud → WhatsApp → UI → aksesibilitas.
  (`npm run test:wa` untuk menjalankan uji WhatsApp saja.)
- `python3 tools/make-short-links.py` — membuat ulang halaman pengalih link pendek di `u/<slug>/`
  (jalankan setiap kali ada undangan baru, lalu commit foldernya).
- `python3 tools/make-thumbs.py` — membuat ulang 13 thumbnail katalog di `thumbs/` (butuh ImageMagick).
- `python3 tools/make-music.py` — membuat ulang 6 lagu MP3 bebas royalti di `musik/` (butuh `pip install lameenc`).
- `node tools/check-cloud.js` — memeriksa koneksi ke project Supabase **asli** yang sudah diisi
  di `supabase-config.json`: skema, izin RSVP, privasi daftar tamu (nomor HP), dan sifat
  read-only undangan. Aman diulang karena tidak menulis data.

Integrasi Supabase opsional dijelaskan lengkap di [`supabase/README.md`](supabase/README.md).
