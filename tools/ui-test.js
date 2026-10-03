#!/usr/bin/env node
/**
 * Kartu Digital — Uji UI nyata (jsdom) untuk halaman undangan, Studio Admin
 * dan katalog halaman depan.
 *
 * Cara pakai:
 *     npm install            # sekali saja (memasang jsdom)
 *     node tools/ui-test.js
 *
 * Yang diuji (bukan sekadar cek teks):
 *   1. Halaman undangan dimuat sungguhan lalu di-hydrate dari database Studio:
 *      nama pasangan/anak di cover, tanggal, foto cover kustom, daftar rekening
 *      amplop, galeri, batas RSVP, dan buku ucapan.
 *   2. Interaksi tamu: buka undangan, countdown berjalan, lightbox galeri,
 *      kirim RSVP (ucapan masuk daftar + pesan terima kasih), salin rekening.
 *   3. Studio Admin: 13 template tema, kategori aqiqah & wisuda, label field
 *      yang menyesuaikan kategori, katalog koleksi.
 *   4. Katalog halaman depan: filter per kategori.
 *
 * Server Node dijalankan otomatis di port uji (tidak mengganggu server Anda),
 * jadi tidak perlu menyiapkan apa pun. Uji ini TIDAK menyentuh Supabase dan
 * TIDAK mengubah data/studio-db.json (jaringan diganti tiruan offline).
 */
'use strict';

const path = require('path');
const { spawn } = require('child_process');

let JSDOM, VirtualConsole;
try {
  ({ JSDOM, VirtualConsole } = require('jsdom'));
} catch (e) {
  console.log('\n  ! Modul "jsdom" belum terpasang, uji UI dilewati.');
  console.log('    Pasang dulu:  npm install\n');
  process.exit(0);
}

const ROOT = path.dirname(__dirname);
const PORT = Number(process.env.UI_TEST_PORT || 3131);
const BASE = 'http://127.0.0.1:' + PORT;

let lulus = 0, gagal = 0;
const ok = (m) => { lulus++; console.log('  \u2713 ' + m); };
const bad = (m) => { gagal++; console.log('  \u2717 ' + m); };
function cek(m, cond, extra) {
  if (cond) ok(m + (extra ? ' \u2014 ' + extra : ''));
  else bad(m + (extra ? ' \u2014 ' + extra : ''));
}

// ---------- server uji ----------
async function tungguServer(ms) {
  const batas = Date.now() + ms;
  while (Date.now() < batas) {
    try {
      const r = await fetch(BASE + '/api/status');
      if (r.ok) return true;
    } catch (e) { /* belum siap */ }
    await new Promise((r) => setTimeout(r, 200));
  }
  return false;
}

// ---------- stub browser ----------
function stubWindow(window) {
  class FakeNode {
    constructor() {
      this.gain = { setValueAtTime() {}, exponentialRampToValueAtTime() {} };
      this.frequency = {};
      this.type = '';
    }
    connect() {} start() {} stop() {}
  }
  window.AudioContext = class {
    constructor() { this.currentTime = 0; this.state = 'running'; this.destination = {}; }
    createOscillator() { return new FakeNode(); }
    createGain() { return new FakeNode(); }
    resume() {} suspend() {}
  };
  // Tiruan jaringan offline: halaman tetap jalan, tidak ada data yang ditulis.
  window.fetch = () => Promise.resolve({
    ok: false, status: 0,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve('')
  });
  window.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 16);
}

async function buka(url) {
  const vc = new VirtualConsole();
  const errors = [];
  vc.on('jsdomError', (e) => {
    const m = String((e && e.message) || '');
    // Kegagalan memuat aset eksternal (font Google/CDN) bukan error kode halaman.
    if (/Could not load (link|script|img)|Could not parse CSS/i.test(m) &&
        /fonts\.googleapis|fonts\.gstatic/.test(m)) return;
    errors.push('jsdomError: ' + m);
  });
  const dom = await JSDOM.fromURL(url, {
    runScripts: 'dangerously',
    resources: 'usable',
    pretendToBeVisual: true,
    virtualConsole: vc,
    beforeParse: stubWindow
  });
  await new Promise((r) => {
    if (dom.window.document.readyState === 'complete') return r();
    dom.window.addEventListener('load', r);
    setTimeout(r, 8000);
  });
  await new Promise((r) => setTimeout(r, 350));
  return { dom, w: dom.window, d: dom.window.document, errors };
}

// ---------- uji ----------
async function ujiUndangan(dbMap, file, invId, berpasangan) {
  console.log('\n\u2014 ' + file);
  const inv = dbMap[invId];
  const { dom, w, d, errors } = await buka(BASE + '/' + file);
  try {
    cek('StudioBackend tersedia', !!w.StudioBackend);
    const h1 = d.querySelector('.cover h1');
    const namaHarus = (berpasangan.includes(invId) && inv.secondaryName)
      ? inv.primaryName + ' & ' + inv.secondaryName : inv.primaryName;
    cek('nama di cover diambil dari database', h1 && h1.textContent.trim() === namaHarus,
      h1 && h1.textContent.trim());
    const dot = (inv.eventDate || '').split('-').reverse().join(' . ');
    const dateEl = d.querySelector('.cover .date');
    cek('tanggal cover format titik', dateEl && dateEl.textContent.trim() === dot,
      dateEl && dateEl.textContent.trim());
    const coverStyle = d.getElementById('studioDynamicCoverStyle');
    cek('foto cover kustom dari Studio dipakai',
      coverStyle && coverStyle.textContent.includes(inv.photos.cover));
    const bank = d.querySelectorAll('#studioAmplopList .bank-card');
    cek('rekening amplop dirender dari database', bank.length === inv.amplop.accounts.length,
      bank.length + ' rekening: ' + Array.from(bank).map((b) => b.querySelector('.bank-logo').textContent).join(', '));
    cek('nomor rekening sesuai', bank[0] && bank[0].querySelector('.num').textContent === inv.amplop.accounts[0].number);
    const gal = d.querySelectorAll('.gal-item');
    cek('galeri terisi (minimal 5 foto)', gal.length >= 5, gal.length + ' foto');
    cek('foto galeri pertama = galeri database', gal[0].getAttribute('data-src') === inv.photos.gallery[0]);
    cek('tombol konfirmasi transfer memakai nomor WhatsApp admin',
      (d.getElementById('studioAmplopWa').getAttribute('href') || '').includes('https://wa.me/6285196755675'));
    cek('batas RSVP terisi dari database', d.getElementById('studioRsvpDeadline').textContent.trim().length > 5,
      d.getElementById('studioRsvpDeadline').textContent.trim());
    const wishes = d.querySelectorAll('#wishList .wish');
    cek('buku ucapan terisi dari RSVP tersimpan', wishes.length >= 1, wishes.length + ' ucapan');

    // ---- interaksi tamu ----
    d.getElementById('openBtn').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
    cek('tombol buka undangan membuka cover',
      d.getElementById('cover').classList.contains('opened') && !d.body.classList.contains('locked'));
    cek('countdown berjalan (angka 2 digit)', /^\d{2,}$/.test(d.getElementById('cdD').textContent),
      'hari: ' + d.getElementById('cdD').textContent);

    d.querySelector('.gal-item').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
    cek('klik foto membuka lightbox', d.getElementById('lightbox').classList.contains('show') &&
      d.getElementById('lbImg').getAttribute('src') === inv.photos.gallery[0]);
    d.getElementById('lbClose').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
    cek('lightbox bisa ditutup', !d.getElementById('lightbox').classList.contains('show'));

    const sebelum = d.querySelectorAll('#wishList .wish').length;
    d.getElementById('rName').value = 'Tamu Uji Arena';
    d.getElementById('rsvpMsg').value = 'Selamat ya, undangannya keren!';
    d.querySelectorAll('.pill')[1].dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
    d.getElementById('rsvpForm').dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true }));
    const sesudah = d.querySelectorAll('#wishList .wish');
    const teksWish = sesudah[0] ? sesudah[0].textContent : '';
    cek('RSVP terkirim: ucapan baru masuk daftar',
      sesudah.length === sebelum + 1 && teksWish.includes('Tamu Uji Arena'), teksWish.slice(0, 46));
    cek('status pilihan ikut tersimpan', teksWish.includes('Tidak Hadir'));
    cek('pesan terima kasih tampil', d.getElementById('rsvpOk').style.display === 'block');

    const copy = d.querySelector('.copy-mini');
    copy.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
    cek('tombol salin rekening bereaksi', copy.textContent.includes('Tersalin'));

    cek('tidak ada error JS saat halaman dipakai', errors.length === 0,
      errors.slice(0, 2).join(' | ') || 'bersih');
  } finally {
    dom.window.close();
  }
}

async function ujiStudio() {
  console.log('\n== B. Studio Admin: kategori & tema baru ==');
  const { dom, w, d, errors } = await buka(BASE + '/studio.html');
  try {
    const opsi = Array.from(d.querySelectorAll('#fThemeFile option'));
    cek('dropdown tema berisi 13 template', opsi.length === 13, opsi.length + ' opsi');
    const nilai = opsi.map((o) => o.value);
    ['undangan-midnight.html', 'undangan-aqiqah.html', 'undangan-wisuda.html', 'undangan-platinum.html']
      .forEach((t) => cek('tema ' + t + ' terdaftar di Studio', nilai.includes(t)));
    const kat = Array.from(d.getElementById('fCategory').options).map((o) => o.value);
    cek('kategori aqiqah & wisuda tersedia', kat.includes('aqiqah') && kat.includes('wisuda'), kat.join(', '));
    cek('label chip tema = 13 Tema', /13 Tema/.test(d.body.textContent));

    const ganti = (cat) => {
      const sel = d.getElementById('fCategory');
      sel.value = cat;
      sel.dispatchEvent(new w.Event('input', { bubbles: true }));
    };
    ganti('aqiqah');
    cek('pilih Aqiqah \u2192 template otomatis', d.getElementById('fThemeFile').value === 'undangan-aqiqah.html');
    cek('label field menyesuaikan Aqiqah',
      d.getElementById('lblPrimaryName').textContent === 'Nama Bayi', d.getElementById('lblPrimaryName').textContent);
    ganti('wisuda');
    cek('pilih Wisuda \u2192 template otomatis', d.getElementById('fThemeFile').value === 'undangan-wisuda.html');
    cek('label field menyesuaikan Wisuda',
      d.getElementById('lblPrimaryName').textContent === 'Nama Wisudawan + Gelar', d.getElementById('lblPrimaryName').textContent);
    ganti('pernikahan');
    cek('kembali ke Pernikahan \u2192 label mempelai lagi',
      d.getElementById('lblPrimaryName').textContent === 'Nama Panggilan Mempelai 1');

    const kartu = d.querySelectorAll('#projectListGrid article.project');
    cek('katalog studio menampilkan 13 undangan', kartu.length === 13, kartu.length + ' kartu');
    const baru = Array.from(kartu).filter((k) => /Midnight Emerald|Aqiqah Rahmah|Grand Graduation|Platinum Marble/.test(k.textContent));
    cek('4 tema baru muncul di katalog studio', baru.length === 4, baru.length + ' kartu');
    cek('tidak ada error JS di Studio', errors.length === 0, errors.slice(0, 2).join(' | ') || 'bersih');
  } finally {
    dom.window.close();
  }
}

async function ujiKatalog() {
  console.log('\n== C. Katalog halaman depan: filter kategori ==');
  const { dom, w, d, errors } = await buka(BASE + '/index.html');
  try {
    const kartu = Array.from(d.querySelectorAll('#katalogGrid .tema-card'));
    cek('katalog berisi 13 kartu tema', kartu.length === 13, kartu.length + ' kartu');
    cek('4 kartu tema baru tertaut ke file yang benar',
      ['undangan-midnight.html', 'undangan-aqiqah.html', 'undangan-wisuda.html', 'undangan-platinum.html']
        .every((f) => d.querySelectorAll('#katalogGrid a[href="' + f + '"]').length === 1));
    const klik = (f) => d.querySelector('#katalogFilter button[data-filter="' + f + '"]')
      .dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
    const terlihat = () => kartu.filter((k) => k.style.display !== 'none').length;
    klik('aqiqah'); cek('filter Aqiqah menampilkan 1 tema', terlihat() === 1, terlihat() + ' tema');
    klik('wisuda'); cek('filter Wisuda menampilkan 1 tema', terlihat() === 1, terlihat() + ' tema');
    klik('premium'); cek('filter Premium menampilkan 2 tema', terlihat() === 2, terlihat() + ' tema');
    klik('pernikahan'); cek('filter Pernikahan menampilkan 5 tema', terlihat() === 5, terlihat() + ' tema');
    klik('all'); cek('filter Semua Tema kembali 13', terlihat() === 13, terlihat() + ' tema');
    cek('tidak ada error JS di halaman depan', errors.length === 0, errors.slice(0, 2).join(' | ') || 'bersih');
  } finally {
    dom.window.close();
  }
}

(async () => {
  const server = spawn(process.execPath, ['server.js'], {
    cwd: ROOT,
    env: Object.assign({}, process.env, { PORT: String(PORT) }),
    stdio: ['ignore', 'pipe', 'pipe']
  });
  let logServer = '';
  server.stdout.on('data', (b) => { logServer += b.toString(); });
  server.stderr.on('data', (b) => { logServer += b.toString(); });

  try {
    const siap = await tungguServer(10000);
    if (!siap) {
      console.log('\n  \u2717 Server uji gagal dijalankan di port ' + PORT);
      console.log('    ' + logServer.trim().split('\n').slice(-2).join('\n    '));
      console.log('    Coba: UI_TEST_PORT=3232 node tools/ui-test.js\n');
      process.exit(1);
    }

    const db = await (await fetch(BASE + '/api/db')).json();
    const dbMap = Object.fromEntries(db.db.invitations.map((i) => [i.id, i]));

    console.log('\n== A. Halaman undangan: muat, hydrate dari database, & interaksi tamu ==');
    const berpasangan = ['midnight-dirga-amara', 'platinum-revan-kiara', 'iceblue-adi-lina'];
    const daftar = [
      ['undangan-midnight.html', 'midnight-dirga-amara'],
      ['undangan-aqiqah.html', 'aqiqah-ghani'],
      ['undangan-wisuda.html', 'wisuda-naura'],
      ['undangan-platinum.html', 'platinum-revan-kiara'],
      ['undangan-iceblue.html', 'iceblue-adi-lina']
    ];
    for (const [file, id] of daftar) await ujiUndangan(dbMap, file, id, berpasangan);
    await ujiStudio();
    await ujiKatalog();

    console.log('\n== RINGKASAN ==');
    console.log('LULUS : ' + lulus);
    console.log('GAGAL : ' + gagal);
    process.exitCode = gagal ? 1 : 0;
  } finally {
    server.kill('SIGTERM');
    setTimeout(() => server.kill('SIGKILL'), 1500).unref();
  }
})();
