# Format Link & Keluaran Undangan (Domain)

Dokumen ini menjelaskan **bentuk keluaran tautan** yang dibuat Studio Admin: tautan undangan
untuk tamu, tautan QR check-in, tautan WhatsApp, dan tautan kalender — lengkap dengan domain
yang dipakai.

---

## 1. Format dasar tautan undangan

```
https://<domain>/<berkas-tema>.html?id=<id-undangan>&to=<nama-tamu>&mode=<mode-navigasi>&fx=<animasi>
```

Contoh nyata (tamu "Bapak Budi Santoso" pada undangan `sage-rahma-dika`):

```
https://kartudigital.my.id/undangan-sage.html?id=sage-rahma-dika&to=Bapak+Budi+Santoso&mode=scroll&fx=kelopak
```

Versi paling singkat pun sah (tanpa personalisasi, memakai setelan yang tersimpan di Studio):

```
https://kartudigital.my.id/undangan-sage.html?id=sage-rahma-dika
```

## 2. Arti tiap parameter

| Parameter | Wajib | Isi | Contoh |
|---|---|---|---|
| `id` | opsional | ID undangan di database Studio (`data/studio-db.json`). **Kalau dikosongkan**, halaman memakai undangan bawaan tema itu (lihat tabel tema). | `sage-rahma-dika` |
| `to` | opsional | Nama tamu yang tampil di sampul depan ("Kepada Yth. …") dan dipakai juga di QR check-in serta notifikasi RSVP. Alias: `tamu`. Spasi boleh ditulis `+` atau `%20`. | `Bapak+Budi+Santoso` |
| `mode` | opsional | Mode navigasi tamu: `scroll` (bawaan) · `snap` · `slide` · `fade` · `flip` · `zoom` · `up` · `cube` · `blur`. **Nilai di link menang** atas setelan `navMode` di Studio. | `cube` |
| `fx` | opsional | Animasi dekorasi jatuh: `kelopak` (bawaan) · `kilau` · `salju` · `bintang` · `konfeti` · `balon` · `kupu` · `daun` · `off`. | `konfeti` |
| `checkin` | otomatis | Kode check-in `KD-XXXXXX` (6 angka) yang ditanam di dalam QR buku tamu. Dipakai saat panitia memindai QR. | `KD-481920` |

Urutan parameter bebas. Tanda `&` tidak boleh ditulis mentah di dalam nama tamu — Studio selalu
meng-encode (`encodeURIComponent`) nilai yang diisi.

## 3. Dari mana domainnya diambil?

Domain **mengikuti alamat tempat Studio dibuka** (`window.location.origin + path`), bukan dari
`settings.domain` di database:

| Studio dibuka di | Link yang dihasilkan |
|---|---|
| `https://kartudigital.my.id/studio.html` | `https://kartudigital.my.id/undangan-sage.html?id=…` |
| `https://kartudigital.github.io/Rahmad-/studio.html` | `https://kartudigital.github.io/Rahmad-/undangan-sage.html?id=…` |
| `http://localhost:3000/studio.html` | `http://localhost:3000/undangan-sage.html?id=…` |
| subfolder `https://domain.com/undangan/studio.html` | `https://domain.com/undangan/undangan-sage.html?id=…` |

Artinya: **pindah domain = link ikut pindah sendiri**, tanpa perlu ubah setelan apa pun. Repo ini
sudah memuat berkas `CNAME` berisi `kartudigital.my.id`, jadi di GitHub Pages tautan otomatis
berawalan domain itu. Kolom `settings.domain` di `data/studio-db.json` hanya catatan merek
(tidak dipakai merakit tautan).

## 4. Daftar berkas tema & ID bawaannya

| Tema | Berkas | ID bawaan (kalau `?id=` kosong) |
|---|---|---|
| Sage Blossom ⭐ | `undangan-sage.html` | `sage-rahma-dika` |
| Jawa Heritage ✨ | `undangan-jawa.html` | `jawa-ratri-galih` |
| Blush & Emerald Floral | `undangan-demo.html` | `emerald-raka-laras` |
| Ice Blue Floral ❄ | `undangan-iceblue.html` | `iceblue-adi-lina` |
| Midnight Emerald 🌙 | `undangan-midnight.html` | `midnight-dirga-amara` |
| Al-Fatih Islamic Gold 🕌 | `undangan-khitanan.html` | `khitan-zidan` |
| Ice Blue Barakah ❄ | `undangan-iceblue-khitanan.html` | `iceblue-khitanan-alif` |
| Sweet Wonder Party 🎂 | `undangan-ultah.html` | `ultah-kanaya` |
| Ice Blue Party ❄ | `undangan-iceblue-ultah.html` | `iceblue-ultah-kalila` |
| Aqiqah Rahmah 🍼 | `undangan-aqiqah.html` | `aqiqah-ghani` |
| Grand Graduation 🎓 | `undangan-wisuda.html` | `wisuda-naura` |
| Royal Gold Luxury 👑 | `undangan-premium.html` | `premium-alvaro-clara` |
| Platinum Marble 👑 | `undangan-platinum.html` | `platinum-revan-kiara` |

> Satu berkas tema bisa menampung **banyak undangan** (klien berbeda). Karena itu setiap link
> yang dibagikan sebaiknya selalu menyertakan `?id=` — tanpa `id`, halaman jatuh ke undangan
> bawaan tema tersebut.

## 5. Link yang dikirim ke pelanggan (pemesan)

Yang dikirim ke **pelanggan** bukan link bertamu, melainkan **link bersih** — tanpa `to=`,
karena nama tamu baru diisi saat link itu dibagikan ke tamu:

```
https://kartudigital.my.id/undangan-wisuda.html?id=wisuda-naura
```

Bedanya dengan link tamu:

| | Link pelanggan | Link tamu |
|---|---|---|
| Bentuk | `…html?id=<id>` | `…html?id=<id>&to=<nama-tamu>&mode=…&fx=…` |
| Untuk siapa | pemesan (untuk dicek & disetujui) | satu tamu tertentu |
| Nama di sampul | "Tamu Undangan" (netral) | nama tamu itu |
| Dipakai berapa kali | sekali per pesanan (bisa dipakai berkali-kali) | sekali per tamu |

Di Studio, buka tab **Fitur Ekstra → kartu 🔗 Link Tamu & Undangan Personal → blok 📤 Serah Terima ke Pelanggan**.
Isi nama pemesan + nomor WhatsApp-nya (opsional, tersimpan di database), lalu:

- **📋 Salin Link** → link bersih di atas, siap dikirim/di-WhatsApp ke pelanggan;
- **📋 Salin Pesan** → pesan serah terima siap pakai (sudah berisi judul acara, tanggal, lokasi, dan link);
- **💬 Kirim ke WhatsApp Pelanggan** → membuka WhatsApp ke nomor pelanggan (kalau nomornya diisi) atau daftar kontak;
- **📤 Kirim Otomatis** → lewat gateway WhatsApp kalau `wa-config.json` sudah aktif.

Isi pesan yang dihasilkan Studio:

```
Halo Bapak Andi 👋

Undangan digital *Naura Salsabila* sudah siap ✨
📅 Sabtu, 5 Desember 2026 pukul 10.00 WIB
📍 Auditorium Kampus Merdeka, Bandung

Silakan cek tampilannya dulu di link ini:
https://kartudigital.my.id/undangan-wisuda.html?id=wisuda-naura

Kalau sudah sesuai, link di atas siap dibagikan ke para tamu.
Mau sekalian dibuatkan link dengan nama tiap tamu (nama muncul otomatis di sampul)? Cukup balas daftar namanya ya 🙏

Terima kasih,
Kartu Digital
```

**Penting — link bersih tetap tampil terbaru.** Saat dibuka, halaman undangan menarik data
terbaru dari server Studio / Supabase / berkas `data/studio-db.json` (sekali, otomatis), lalu
menerapkan ulang setelan undangan itu — jadi pelanggan dan tamu melihat versi terakhir
(nama, foto, lokasi, mode navigasi, dan efek dekorasi) walau membukanya dari perangkat lain.
Setelan efek dekorasi berlaku di tema yang punya mesin efek (Sage Blossom & Jawa Heritage);
11 tema lain memakai efek khasnya masing-masing. Kalau ada `?mode=`/`?fx=` di link, nilai di
link selalu menang atas setelan Studio.

## 6. Keluaran lain (bukan halaman undangan)

| Keluaran | Format | Dibuat di |
|---|---|---|
| Link WA per tamu (mode link) | `https://wa.me/<nomor62>?text=<pesan-encode>` | Panel **Koneksi WhatsApp** & tombol **Kirim WA** di generator tamu massal |
| Link WA tanpa nomor (pilih kontak sendiri) | `https://wa.me/?text=<pesan-encode>` | Tombol **Bagikan ke WhatsApp** di kartu Bagikan Link |
| QR check-in buku tamu | `https://<domain>/<berkas-tema>.html?id=<id-undangan>&checkin=KD-XXXXXX&to=<nama-tamu>` | Kartu QR di undangan + tab Tema & Visual (saklar QR check-in) |
| Berkas kalender `.ics` | berkas `<slug>.ics` (di-download; isinya `SUMMARY`, `LOCATION`, `DESCRIPTION`, `URL` = tautan undangan `?id=`) | Tombol **Simpan ke Kalender (.ics)** |
| Google Calendar | `https://calendar.google.com/calendar/render?action=TEMPLATE&text=<judul>&dates=<YYYYMMDDTHHmmss>/<YYYYMMDDTHHmmss>&location=<lokasi>&details=<tautan undangan>` | Tombol **Google Calendar** |
| Notifikasi RSVP ke admin | `https://wa.me/<nomor-admin>?text=RSVP+baru+…+Undangan:+<tautan+undangan>` | Otomatis setelah tamu mengirim RSVP |
| Kirim otomatis via gateway | Bukan URL — server memanggil API provider (Fonnte/Wablas/Whacenter/custom), isi pesannya tetap memuat tautan undangan di atas | Panel **Koneksi WhatsApp** |

Nomor admin pada dua keluaran WhatsApp di atas diambil dari **pengaturan Studio**
(`settings.adminWhatsapp`); kalau belum diisi, dipakai nomor bawaan `6285196755675`.

## 7. Contoh lengkap alur

```
Studio  →  Bagikan Link Tamu
   ↓
https://kartudigital.my.id/undangan-wisuda.html?id=wisuda-naura&to=Ibu+Sari&mode=snap&fx=konfeti
   ↓  (dikirim lewat WhatsApp / gateway)
Tamu membuka link  →  nama "Ibu Sari" tampil di sampul
   ↓
QR check-in di undangan berisi:
https://kartudigital.my.id/undangan-wisuda.html?id=wisuda-naura&checkin=KD-507341&to=Ibu+Sari
   ↓
Panitia memindai QR  →  kehadiran tercatat di rekap RSVP Studio
```

## 8. Uji cepat

```bash
# 1) Pastikan halaman & database menjawab
curl -s "http://localhost:3000/undangan-sage.html?id=sage-rahma-dika" -o /dev/null -w "%{http_code}\n"
curl -s "http://localhost:3000/api/db" | head -c 120

# 2) Undangan tersimpan lengkap (termasuk status pemeriksaan admin)
node tools/ui-test.js        # memeriksa ?id=, mode, fx, QR, kalender, RSVP
python3 tools/audit.py       # memeriksa struktur & format tautan di kode
```

Semua tautan di dokumen ini dihasilkan otomatis oleh `studio-api.js`
(`tautanUndanganSaatIni`, `wa.tautan`) dan generator di `studio.html`
(`updateShareGenerator`, `buildGuestLink`) — jadi formatnya selalu konsisten antara
Studio, halaman undangan, dan pesan WhatsApp.
