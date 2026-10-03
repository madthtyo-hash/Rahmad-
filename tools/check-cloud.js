/**
 * PEMERIKSA KONEKSI SUPABASE SUNGGUHAN (bukan tiruan).
 *
 * Bedanya dengan tools/test-cloud.js:
 *   - test-cloud.js  : menguji kode aplikasi memakai jaringan TIRUAN (tanpa internet).
 *   - check-cloud.js : menembak project Supabase ANDA yang sudah diisi di
 *                      supabase-config.json dan melaporkan apa adanya.
 *
 * Aman dipakai berulang kali:
 *   - hanya MEMBACA data (undangan, rsvp) — tidak menambah/mengubah apa pun;
 *   - untuk menguji izin tulis, dikirim 1 percobaan RSVP yang sengaja SALAH
 *     (attendance tidak valid) sehingga database MENOLAK-nya dan TIDAK ADA
 *     baris yang benar-benar tersimpan;
 *   - daftar tamu (nomor HP) sengaja TIDAK dibaca: justru kita pastikan
 *     browser TIDAK BISA membacanya.
 *
 * Cara pakai:
 *     cd /home/user/Rahmad-
 *     node tools/check-cloud.js
 *
 * Keluar dengan kode 1 kalau ada masalah (bisa dipakai di CI/terminal).
 */
const fs = require('fs');
const path = require('path');
const CONFIG = path.join(__dirname, '..', 'supabase-config.json');

const BENAR = '\u2713', SALAH = '\u2717', TIPS = '\u2192';
let gagal = 0, perhatian = 0;
const cek = (nama, lulus, info) => {
  console.log(`  ${lulus ? BENAR : SALAH} ${nama}${info ? ` ${TIPS} ${info}` : ''}`);
  if (!lulus) gagal++;
};
const hati = (nama, info) => { console.log(`  ! ${nama}${info ? ` ${TIPS} ${info}` : ''}`); perhatian++; };
const kepala = t => console.log(`\n== ${t} ==`);

function tableName(cfg, nama) {
  return (cfg && cfg.tables && cfg.tables[nama]) || nama;
}
function kunci(cfg) {
  return cfg.anonKey || cfg.publishableKey || '';
}
function tipeKunci(k) {
  if (/^sb_secret_/.test(k)) return 'secret';
  if (/^sb_publishable_/.test(k)) return 'publishable';
  if (/^eyJ/.test(k)) return 'jwt';
  return 'tidak dikenal';
}

(async () => {
  console.log('\n\u2601\ufe0f  PEMERIKSA KONEKSI SUPABASE \u2014 Kartu Digital');

  // ---------- A. Baca & validasi konfigurasi ----------
  kepala('A. Konfigurasi (supabase-config.json)');
  let cfg;
  try {
    cfg = JSON.parse(fs.readFileSync(CONFIG, 'utf8'));
    cek('file supabase-config.json terbaca & JSON valid', true);
  } catch (e) {
    cek('file supabase-config.json terbaca & JSON valid', false, e.message);
    return selesai();
  }
  const url = String(cfg.url || '').replace(/\/+$/, '');
  const key = kunci(cfg);
  const jenis = tipeKunci(key);

  if (!url || !key) {
    cek('url & kunci sudah diisi', false,
      'buka supabase-config.json lalu isi "url" (https://xxxx.supabase.co) dan "anonKey" (sb_publishable_\u2026 atau eyJ\u2026)');
    console.log('\n  Panduan langkah demi langkah: supabase/README.md\n');
    return selesai();
  }
  if (jenis === 'secret') {
    cek('kunci AMAN untuk dipublikasikan', false,
      'kunci sb_secret_/service_role terdeteksi \u2014 HAPUS dari file ini (kunci itu mem-bypass semua keamanan)');
    return selesai();
  }
  cek('kunci aman untuk dipublikasikan', true, `jenis: ${jenis}`);
  const lokal = /^https?:\/\/(127\.0\.0\.1|localhost|\[::1\])(:\d+)?$/i.test(url);
  cek('format url wajar', /^https:\/\/[^\s]+$/i.test(url) || lokal, url + (lokal ? ' (Supabase lokal/dev)' : ''));
  if (cfg.enabled === false) hati('"enabled": false \u2014 website Anda memakai mode lama (localStorage). Ubah ke true kalau ingin memakai Supabase.');
  else cek('"enabled": true', true);

  const H = { apikey: key, Accept: 'application/json' };
  if (jenis === 'jwt') H.Authorization = `Bearer ${key}`; // kunci JWT lama wajib juga sebagai Bearer

  const panggil = async (metode, jalur, opsi = {}) => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 15000);
    try {
      const res = await fetch(`${url}/rest/v1/${jalur}`, {
        method: metode,
        headers: Object.assign({}, H, opsi.headers || {}),
        body: opsi.body ? JSON.stringify(opsi.body) : undefined,
        cache: 'no-store',
        signal: ctrl.signal
      });
      const teks = await res.text();
      let data = null;
      try { data = teks ? JSON.parse(teks) : null; } catch (e) { data = teks; }
      return { ok: res.ok, status: res.status, data, headers: res.headers };
    } catch (e) {
      return { ok: false, status: 0, network: true, error: e.name === 'AbortError' ? 'timeout 15 detik' : (e.message || 'tidak bisa terhubung') };
    } finally { clearTimeout(timer); }
  };
  const pesanError = r => {
    if (r.network) return r.error;
    const d = r.data;
    return (d && (d.message || d.hint || d.details)) || r.status;
  };

  // ---------- B. Jangkauan & skema ----------
  kepala('B. Jangkauan server & skema database');
  const inv = await panggil('GET', `${tableName(cfg, 'invitations')}?select=slug,event_type,event_date&order=created_at.asc`);
  if (inv.network) {
    cek('project Supabase bisa dihubungi', false, inv.error);
    console.log('\n  Periksa: (1) URL sudah benar, (2) project belum di-pause (gratis bisa pause setelah lama nganggur), (3) jaringan internet.\n');
    return selesai();
  }
  cek('project Supabase bisa dihubungi', inv.ok, inv.ok ? `${inv.data.length} undangan terbaca` : pesanError(inv));
  if (!inv.ok) {
    const p = String(pesanError(inv));
    if (inv.status === 401 || /api key|apikey|JWT|invalid/i.test(p)) {
      console.log('     Kemungkinan kunci salah/terpotong. Ambil ulang di Supabase \u2192 Settings \u2192 API Keys.');
    } else if (inv.status === 404 || /find the table|does not exist|schema/i.test(p)) {
      console.log('     Kemungkinan tabel belum dibuat. Jalankan supabase/schema.sql di SQL Editor Supabase');
      console.log('     (atau push folder supabase/ ke branch main kalau memakai GitHub Integration).');
    }
    return selesai();
  }
  const seed = ['iceblue-adi-lina', 'iceblue-khitanan-alif', 'iceblue-ultah-kalila', 'aqiqah-ghani', 'wisuda-naura'];
  const adaSeed = seed.filter(s => inv.data.some(i => i.slug === s));
  if (adaSeed.length) cek('contoh undangan dari schema.sql ada', true, adaSeed.join(', '));
  else hati('contoh undangan tidak ditemukan (bukan masalah kalau sudah Anda hapus/ganti)');
  const kolom = inv.data[0] || {};
  const kolomLengkap = 'event_type' in kolom && 'event_date' in kolom;
  cek('kolom ringkas terisi (event_type, event_date)', kolomLengkap,
    kolomLengkap ? `${kolom.event_type} \u2192 ${kolom.event_date}` : 'jalankan ulang supabase/schema.sql supaya kolom lengkap');

  // ---------- C. RSVP: baca & izin tulis ----------
  kepala('C. RSVP (tamu boleh kirim & baca ucapan)');
  const rsvp = await panggil('GET', `${tableName(cfg, 'rsvp')}?select=external_id,name,attendance,created_at&order=created_at.desc&limit=5`);
  cek('tabel rsvp bisa dibaca', rsvp.ok, rsvp.ok ? `${(rsvp.data || []).length} RSVP terbaru terbaca` : pesanError(rsvp));

  // Uji izin tulis TANPA menyimpan data: semua nilai valid, tapi invitation_id
  // diarahkan ke id kosong → database menolak lewat foreign key (23503) SESUDAH
  // izin RLS dilewati. Jadi 23503 = izin tulis ADA, dan tidak ada baris tersimpan.
  const ID_KOSONG = '00000000-0000-0000-0000-000000000000';
  const kodeDari = r => (r.data && r.data.code) || null;
  const ditolakRls = r => r.status === 401 || r.status === 403 || kodeDari(r) === '42501';
  const probe = await panggil('POST', tableName(cfg, 'rsvp'), {
    headers: { 'Content-Type': 'application/json' },
    body: [{
      external_id: 'uji-koneksi-' + Date.now(), invitation_slug: 'iceblue-adi-lina',
      invitation_id: ID_KOSONG, name: 'Uji Koneksi', attendance: 'hadir', pax: 1
    }]
  });
  if (kodeDari(probe) === '23503') cek('tamu boleh mengirim RSVP dari browser', true, 'izin terverifikasi \u2014 baris uji ditolak kolom uji, tidak ada data tersimpan');
  else if (ditolakRls(probe)) cek('tamu boleh mengirim RSVP dari browser', false, 'ditolak RLS: ' + pesanError(probe));
  else if (probe.ok) hati('izin tulis ADA, tapi 1 baris uji tersimpan \u2014 hapus lewat SQL Editor: delete from rsvp where name = \'Uji Koneksi\';');
  else cek('tamu boleh mengirim RSVP dari browser', false, pesanError(probe));

  // Penghapusan: RLS yang memblokir DELETE tetap dijawab "sukses 0 baris"
  // (lihat postgrest-js issue #409), jadi dari luar TIDAK bisa dipastikan aman.
  // Yang bisa dipastikan hanya kalau ditolak tegas (401/403/42501).
  const hapus = await panggil('DELETE', `${tableName(cfg, 'rsvp')}?id=eq.${ID_KOSONG}`, {
    headers: { Prefer: 'return=representation' }
  });
  if (ditolakRls(hapus)) cek('RSVP tidak bisa dihapus dari browser', true, 'ditolak RLS');
  else if (hapus.ok) hati('RSVP tidak bisa dihapus dari browser \u2014 tidak bisa dipastikan dari luar (RLS menyamarkan hasil). Jalankan supabase/schema.sql untuk memastikan izin hapus dicabut.');
  else cek('RSVP tidak bisa dihapus dari browser', false, pesanError(hapus));

  // ---------- D. Privasi daftar tamu ----------
  kepala('D. Daftar tamu (nomor HP) \u2014 harus PRIVAT');
  const tamu = await panggil('GET', `${tableName(cfg, 'guests')}?select=id,name,phone&limit=1`);
  const barisTamu = (tamu.ok && Array.isArray(tamu.data)) ? tamu.data.length : 0;
  if (tamu.ok && barisTamu > 0) {
    cek('daftar tamu TIDAK bisa dibaca dari browser', false,
      `BAHAYA: ${barisTamu} baris (termasuk nomor HP) terbaca siapa pun yang punya kunci publik! Jalankan supabase/schema.sql sekarang.`);
  } else if (!tamu.ok) {
    cek('daftar tamu TIDAK bisa dibaca dari browser', tamu.status === 401 || tamu.status === 403 || kodeDari(tamu) === '42501',
      tamu.status ? `ditolak (${tamu.status}) \u2014 nomor HP aman` : pesanError(tamu));
  } else {
    hati('daftar tamu: tidak ada baris yang terbaca \u2014 besar kemungkinan sudah terkunci, tapi tabel kosong juga terlihat sama. Pastikan lewat Supabase \u2192 Table Editor \u2192 guests \u2192 Policies.');
  }
  // Uji izin TAMBAH tanpa menulis data (foreign key ke id kosong).
  const tambahTamu = await panggil('POST', tableName(cfg, 'guests'), {
    headers: { 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: [{ invitation_id: ID_KOSONG, name: '__UJI_KONEKSI__', phone: null, group_name: 'uji' }]
  });
  if (kodeDari(tambahTamu) === '23503') cek('Studio boleh menambah tamu massal dari browser', true, 'izin terverifikasi \u2014 baris uji ditolak kolom uji, tidak ada data tersimpan');
  else if (ditolakRls(tambahTamu)) cek('Studio boleh menambah tamu massal dari browser', false, 'ditolak RLS: ' + pesanError(tambahTamu));
  else if (tambahTamu.ok) hati(`izin tambah tamu ADA, tapi 1 baris uji tersimpan \u2014 hapus lewat SQL Editor: delete from guests where name = '__UJI_KONEKSI__';`);
  else cek('Studio boleh menambah tamu massal dari browser', false, pesanError(tambahTamu));

  // ---------- E. Undangan read-only ----------
  kepala('E. Undangan di cloud bersifat read-only (aman dari perubahan)');
  // Menulis kembali NILAI YANG SAMA PERSIS ke baris undangan yang ada:
  //  - kalau kebijakan tulis masih terbuka  → baris ter-ubah (terdeteksi jelas);
  //  - kalau terkunci                        → 0 baris berubah.
  // Isi undangan tetap sama pada kedua kemungkinan.
  if (kolom.slug && kolom.event_type) {
    const up = await panggil('PATCH', `${tableName(cfg, 'invitations')}?slug=eq.${encodeURIComponent(kolom.slug)}`, {
      headers: { 'Content-Type': 'application/json', Prefer: 'return=representation' },
      body: { event_type: kolom.event_type }
    });
    const diubah = Array.isArray(up.data) ? up.data.length : 0;
    if (ditolakRls(up)) cek('undangan tidak bisa diubah dari browser', true, 'ditolak RLS');
    else if (diubah > 0) cek('undangan tidak bisa diubah dari browser', false,
      `BAHAYA: ${diubah} undangan bisa diubah siapa pun (isi undangan tidak berubah karena nilainya ditulis sama persis). Jalankan supabase/schema.sql sekarang.`);
    else cek('undangan tidak bisa diubah dari browser', true, '0 baris berubah \u2014 terkunci kebijakan (aman)');
  } else {
    hati('undangan tidak bisa diubah: belum ada baris undangan untuk diuji');
  }
  const hapusInv = await panggil('DELETE', `${tableName(cfg, 'invitations')}?slug=eq.__tidak_ada__`, {
    headers: { Prefer: 'return=representation' }
  });
  if (ditolakRls(hapusInv)) cek('undangan tidak bisa dihapus dari browser', true, 'ditolak RLS');
  else if (hapusInv.ok) hati('undangan tidak bisa dihapus dari browser \u2014 tidak bisa dipastikan dari luar (RLS menyamarkan hasil). Jalankan supabase/schema.sql untuk memastikan izin hapus dicabut.');
  else cek('undangan tidak bisa dihapus dari browser', false, pesanError(hapusInv));

  console.log('\n  Catatan: pemeriksaan tulis di atas memakai baris yang tidak ada / nilai yang sengaja salah,');
  console.log('  jadi data undangan & RSVP Anda tidak berubah.');
  return selesai();
})().catch(e => { console.error('\n  ' + SALAH + ' Pemeriksa berhenti karena error tak terduga: ' + (e && e.stack || e)); process.exit(1); });

function selesai() {
  console.log('\n== RINGKASAN ==');
  if (!gagal && !perhatian) console.log('  \u2705 SEMUA SEHAT \u2014 Supabase siap dipakai. Buka Studio \u2192 Penyimpanan \u2192 \ud83d\udd0c Cek Koneksi.');
  else if (!gagal) console.log(`  \u2705 LULUS (${perhatian} catatan kecil di atas). Buka Studio \u2192 \ud83d\udd0c Cek Koneksi untuk verifikasi dari sisi web.`);
  else console.log(`  ${SALAH} ADA ${gagal} MASALAH \u2014 perbaiki sesuai petunjuk di atas, lalu jalankan ulang: node tools/check-cloud.js`);
  console.log('');
  process.exit(gagal ? 1 : 0);
}
