# Catatan Lanjutan (untuk sesi berikutnya)

Status terakhir: **4 Oktober 2026** — PR #6 sudah **MERGED ke `main`** (squash commit `8403221`).
Semua uji hijau: audit 0/0 · cloud 0 · WhatsApp 32/0 · ui 494/0 · a11y 217/0.

## Yang sudah selesai
- 4 tema baru (13 tema total) + halaman depan & katalog 6 kategori
- Studio: koleksi per kategori, tab Pemeriksaan (12 butir + status admin + pratinjau)
- WhatsApp: mode link gratis + gateway otomatis (Fonnte/Wablas/Whacenter/custom)
- Satu link untuk semua tamu + kirim massal ke banyak nomor + serah terima pelanggan
- Link pendek `/u/<slug>` (rute server 302 + pengalih statis untuk GitHub Pages)
- Halaman undangan menyegarkan data terbaru otomatis; QR/kalender/RSVP selalu membawa `?id=`

## Tawaran yang belum dikerjakan (menunggu keputusan)
1. **Pengingat otomatis tamu yang belum RSVP** (H-1 / H-3) lewat gateway WhatsApp.
2. **Filter rentang tanggal + ekspor CSV** untuk rekap pemeriksaan di Studio.
3. **Switcher mode navigasi untuk tamu** (`.mode-bar`) di Sage & Jawa.
4. Menambah mode `up` dan `blur` ke pilihan `#fNavMode` di Studio (mesin navigasi sudah mendukung).
5. **Gabung daftar nama tamu → langsung dapat semua link** (isi nama + nomor sekaligus).

## Perlu dijalankan dari komputer sendiri (sandbox tidak bisa akses internet publik)
- `node tools/check-cloud.js` — memeriksa keamanan project Supabase **asli** (RLS undangan, privasi nomor HP).
- Bila menambah undangan baru: `npm run short-links` lalu commit folder `u/`.

## Perintah harian
```bash
npm install          # sekali saja
npm start            # server Studio di http://localhost:3000
npm test             # audit → cloud → WhatsApp → UI → aksesibilitas
```
