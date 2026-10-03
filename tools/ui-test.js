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
 *      yang menyesuaikan kategori, koleksi yang dikelompokkan per kategori,
 *      filter koleksi, serta efek dekorasi terbaca saat mengedit undangan.
 *   4. Katalog halaman depan: pengelompokan per kategori (6 kelompok),
 *      filter kategori, dan efek tampilan awal (percikan, pita tema,
 *      angka statistik, kartu muncul saat di-scroll).
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
    // jsdom belum mengimplementasikan pemutaran audio/video — bukan error halaman.
    if (/Not implemented: HTMLMediaElement/i.test(m)) return;
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
    // ---- musik MP3 dari Studio ----
    const audioStudio = d.getElementById('studioMusicAudio');
    cek('pemutar MP3 Studio memakai lagu pilihan (musicUrl)',
      !!audioStudio && String(audioStudio.getAttribute('src') || '').endsWith(inv.musicUrl),
      audioStudio ? audioStudio.getAttribute('src') : 'elemen tidak ada');
    const btnMusik = d.getElementById('musicBtn');
    cek('tombol musik tersedia', !!btnMusik);
    if (btnMusik) {
      btnMusik.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
      cek('klik tombol musik menyalakan pemutar', btnMusik.classList.contains('playing'));
      btnMusik.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
      cek('klik kedua mematikan pemutar', !btnMusik.classList.contains('playing'));
    }
    cek('window.musikMain diarahkan ke pemutar MP3', typeof w.musikMain === 'function');

    // ---- QR check-in buku tamu (semua tema) ----
    const checkin = d.getElementById('studioCheckin');
    cek('kartu QR check-in tampil di undangan', !!checkin);
    if (checkin) {
      const qrSvg = checkin.querySelector('#studioCheckinQr svg');
      cek('QR check-in dirender sebagai gambar QR asli', !!qrSvg && qrSvg.innerHTML.length > 200);
      cek('kode check-in berformat KD-XXXXXX',
        /^KD-\d{6}$/.test(checkin.querySelector('#studioCheckinCode').textContent.trim()),
        checkin.querySelector('#studioCheckinCode').textContent.trim());
      checkin.querySelector('#studioCheckinHadir').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
      await new Promise((r) => setTimeout(r, 200));
      cek('tombol "Tandai Hadir" mencatat kehadiran ke RSVP',
        /tercatat/.test(checkin.querySelector('#studioCheckinStatus').textContent),
        checkin.querySelector('#studioCheckinStatus').textContent.trim().slice(0, 50));
    }

    // ---- Tombol simpan ke kalender ----
    const kalender = d.getElementById('studioKalender');
    const ics = d.getElementById('studioKalenderIcs');
    cek('tombol Simpan ke Kalender (.ics) tersedia', !!kalender && !!ics);
    if (ics) {
      const isiIcs = decodeURIComponent(ics.getAttribute('href') || '');
      cek('berkas .ics memuat agenda & lokasi acara',
        isiIcs.indexOf('BEGIN:VCALENDAR') > -1 && isiIcs.indexOf('DTSTART') > -1 &&
        isiIcs.indexOf(inv.venueName) > -1,
        (ics.getAttribute('download') || '') + ' · ' + isiIcs.slice(0, 15));
    }
    cek('tautan Google Calendar tersedia',
      !!d.getElementById('studioKalenderGoogle') &&
      /calendar\.google\.com/.test(d.getElementById('studioKalenderGoogle').getAttribute('href') || ''));

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

    const barWa = d.getElementById('studioRsvpWa');
    cek('setelah RSVP muncul tawaran kabari admin lewat WhatsApp',
      !!barWa && !!barWa.querySelector('a') &&
      /wa\.me\/6285196755675/.test(barWa.querySelector('a').getAttribute('href') || ''),
      barWa ? barWa.textContent.trim().slice(0, 45) : 'tidak ada');
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

    // ---- Koleksi di Studio: dikelompokkan per kategori (sama seperti halaman depan) ----
    const grupKoleksi = Array.from(d.querySelectorAll('#projectListGrid .collection-group'));
    const kartu = d.querySelectorAll('#projectListGrid article.project');
    cek('koleksi Studio dikelompokkan jadi 6 kategori', grupKoleksi.length === 6, grupKoleksi.length + ' kelompok');
    cek('koleksi Studio menampilkan 13 undangan', kartu.length === 13, kartu.length + ' kartu');
    cek('setiap kelompok koleksi punya judul + penghitung',
      grupKoleksi.every((g) => g.querySelector('.collection-group-head h3 .count') &&
        /Undangan$/.test(g.querySelector('.collection-group-head h3 .count').textContent.trim())),
      grupKoleksi.map((g) => g.getAttribute('data-cat') + ':' +
        g.querySelector('.collection-group-head .count').textContent.trim().split(' ')[0]).join(', '));
    const baru = Array.from(kartu).filter((k) => /Midnight Emerald|Aqiqah Rahmah|Grand Graduation|Platinum Marble/.test(k.textContent));
    cek('4 tema baru muncul di katalog studio', baru.length === 4, baru.length + ' kartu');

    // filter koleksi di Studio
    const klikKoleksi = (cat) => d.querySelector('#collectionFilter button[data-cat="' + cat + '"]')
      .dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
    klikKoleksi('aqiqah');
    cek('filter koleksi Aqiqah \u2192 1 kelompok, 1 kartu',
      d.querySelectorAll('#projectListGrid .collection-group').length === 1 &&
      d.querySelectorAll('#projectListGrid article.project').length === 1);
    klikKoleksi('wisuda');
    cek('filter koleksi Wisuda \u2192 menampilkan Grand Graduation',
      /Grand Graduation/.test(d.getElementById('projectListGrid').textContent));
    klikKoleksi('all');
    cek('kembali ke Semua Tema \u2192 13 kartu lagi',
      d.querySelectorAll('#projectListGrid article.project').length === 13);

    // ---- Efek dekorasi baru tersedia & terbaca saat mengedit undangan ----
    const fxOpts = Array.from(d.getElementById('fFxMode').options).map((o) => o.value);
    cek('opsi efek konfeti (tema Wisuda) tersedia di Studio', fxOpts.includes('konfeti'), fxOpts.join(', '));
    const pilihUndangan = (id) => {
      const sel = d.getElementById('activeInvitationSelect');
      sel.value = id;
      sel.dispatchEvent(new w.Event('change', { bubbles: true }));
    };
    pilihUndangan('wisuda-naura');
    cek('edit undangan Wisuda \u2192 template & efek konfeti terisi',
      d.getElementById('fThemeFile').value === 'undangan-wisuda.html' && d.getElementById('fFxMode').value === 'konfeti',
      d.getElementById('fThemeFile').value + ' / fx=' + d.getElementById('fFxMode').value);
    pilihUndangan('midnight-dirga-amara');
    cek('edit undangan Midnight \u2192 efek bintang terisi', d.getElementById('fFxMode').value === 'bintang',
      'fx=' + d.getElementById('fFxMode').value);
    pilihUndangan('platinum-revan-kiara');
    cek('edit undangan Platinum \u2192 template premium terisi',
      d.getElementById('fThemeFile').value === 'undangan-platinum.html' &&
      d.getElementById('fCategory').value === 'premium',
      d.getElementById('fThemeFile').value + ' / ' + d.getElementById('fCategory').value);
    // ---- Musik: per undangan & halaman depan ----
    const selMusik = d.getElementById('fMusicUrl');
    cek('Studio punya pilihan musik undangan (#fMusicUrl)', !!selMusik);
    if (selMusik) {
      const nilai = Array.from(selMusik.options).map((o) => o.value);
      cek('pilihan musik undangan memuat 6 lagu + bawaan + tanpa musik',
        nilai.length === 8 && nilai.indexOf('') > -1 && nilai.indexOf('off') > -1 &&
        nilai.filter((v) => /^musik\/.+\.mp3$/.test(v)).length === 6, nilai.length + ' opsi');
      const invAktif = w.StudioBackend.getInvitation(d.getElementById('activeInvitationSelect').value) || {};
      cek('lagu undangan yang sedang diedit terpilih di form',
        selMusik.value === (invAktif.musicUrl || '') ||
        (d.getElementById('fMusicCustom') || {}).value === (invAktif.musicUrl || ''),
        selMusik.value + ' / ' + ((d.getElementById('fMusicCustom') || {}).value || '-'));
    }
    const selCheckin = d.getElementById('fCheckin');
    cek('Studio punya pilihan QR Check-In', !!selCheckin &&
      Array.from(selCheckin.options).map((o) => o.value).join(',') === 'on,off');
    if (selCheckin) {
      cek('status QR check-in undangan aktif terbaca di form', selCheckin.value === 'on', selCheckin.value);
    }
    cek('Studio punya kartu Musik Halaman Depan', !!d.getElementById('card-musikdepan'));
    const selDepan = d.getElementById('fFrontMusic');
    cek('pilihan musik halaman depan tersedia', !!selDepan);
    if (selDepan) {
      const nilaiDepan = Array.from(selDepan.options).map((o) => o.value);
      cek('musik halaman depan bisa dipilih/dimatikan (+ 6 lagu)',
        nilaiDepan.indexOf('off') > -1 && nilaiDepan.filter((v) => /^musik\/.+\.mp3$/.test(v)).length === 6,
        nilaiDepan.length + ' opsi');
      cek('nilai terpilih mengikuti pengaturan Studio',
        selDepan.value === ((w.StudioBackend.getSettings() || {}).frontMusic || 'musik/romantis.mp3'),
        selDepan.value);
      selDepan.value = 'musik/jawa.mp3';
      d.getElementById('saveFrontMusicBtn').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
      await new Promise((r) => setTimeout(r, 150));
      cek('tombol simpan menyimpan musik halaman depan ke database',
        w.StudioBackend.getSettings().frontMusic === 'musik/jawa.mp3',
        w.StudioBackend.getSettings().frontMusic);
      selDepan.value = 'musik/romantis.mp3';
      d.getElementById('saveFrontMusicBtn').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
      await new Promise((r) => setTimeout(r, 150));
    }

    cek('tidak ada error JS di Studio', errors.length === 0, errors.slice(0, 2).join(' | ') || 'bersih');
  } finally {
    dom.window.close();
  }
}

async function ujiKatalog() {
  console.log('\n== C. Katalog halaman depan: kelompok kategori, filter & efek ==');
  const { dom, w, d, errors } = await buka(BASE + '/index.html');
  try {
    const grup = Array.from(d.querySelectorAll('#katalogGrid .tema-group'));
    const harusnya = { pernikahan: 5, khitanan: 2, aqiqah: 1, ultah: 2, wisuda: 1, premium: 2 };
    cek('katalog dikelompokkan jadi 6 kategori', grup.length === 6, grup.length + ' kelompok');

    let cocok = true;
    const ringkas = [];
    grup.forEach((g) => {
      const kat = g.getAttribute('data-cat');
      const jml = g.querySelectorAll('.tema-card').length;
      ringkas.push(kat + '=' + jml);
      if (harusnya[kat] !== jml) cocok = false;
    });
    cek('jumlah tema tiap kelompok sesuai', cocok, ringkas.join(', '));
    cek('setiap kelompok punya judul & penghitung tema',
      grup.every((g) => g.querySelector('.group-head h3 .count') &&
        /Tema$/.test(g.querySelector('.group-head h3 .count').textContent.trim())));
    cek('total 13 kartu tema di katalog', d.querySelectorAll('#katalogGrid .tema-card').length === 13);
    cek('4 kartu tema baru tertaut ke file yang benar',
      ['undangan-midnight.html', 'undangan-aqiqah.html', 'undangan-wisuda.html', 'undangan-platinum.html']
        .every((f) => d.querySelectorAll('#katalogGrid a[href="' + f + '"]').length === 1));

    const klik = (f) => d.querySelector('#katalogFilter button[data-filter="' + f + '"]')
      .dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
    const tampil = () => grup.filter((g) => !g.classList.contains('hide'));
    const label = (s) => s.getAttribute('data-cat');

    klik('aqiqah');
    cek('filter Aqiqah \u2192 hanya kelompok Aqiqah', tampil().length === 1 && label(tampil()[0]) === 'aqiqah');
    cek('informasi jumlah ikut berubah',
      /Menampilkan <b>1 tema<\/b>/.test(d.getElementById('katalogCount').innerHTML),
      d.getElementById('katalogCount').textContent.trim());
    klik('wisuda');
    cek('filter Wisuda \u2192 hanya kelompok Wisuda', tampil().length === 1 && label(tampil()[0]) === 'wisuda');
    klik('premium');
    cek('filter Premium \u2192 hanya kelompok Premium', tampil().length === 1 && label(tampil()[0]) === 'premium');
    klik('pernikahan');
    cek('filter Pernikahan \u2192 5 tema', tampil()[0].querySelectorAll('.tema-card').length === 5);
    klik('all');
    cek('filter Semua Tema \u2192 6 kelompok tampil lagi', tampil().length === 6);
    cek('informasi jumlah kembali 13 tema', /<b>13 tema<\/b>/.test(d.getElementById('katalogCount').innerHTML),
      d.getElementById('katalogCount').textContent.trim());

    // ---- efek tampilan awal ----
    cek('percikan emas di hero dibuat', d.querySelectorAll('#sparkleLayer .sparkle').length > 0,
      d.querySelectorAll('#sparkleLayer .sparkle').length + ' percikan');
    cek('pita nama tema berjalan terisi 13 tema (digandakan)', d.querySelectorAll('#temaTrack span').length === 26,
      d.querySelectorAll('#temaTrack span').length + ' item');
    cek('chip tema baru tampil di tampilan awal',
      d.querySelectorAll('.hero-chips .hero-chip').length === 2 && !!d.querySelector('#grup-aqiqah') && !!d.querySelector('#grup-wisuda'));
    cek('lencana melayang di dekat mockup HP ada', !!d.querySelector('.phone-badge'));
    cek('semua kartu sudah siap efek muncul-saat-scroll',
      d.querySelectorAll('#katalogGrid .tema-card.reveal.visible').length === 13,
      d.querySelectorAll('#katalogGrid .tema-card.reveal.visible').length + ' kartu');
    const angka = Array.from(d.querySelectorAll('.hero-stats b[data-count]')).map((el) => el.textContent.trim());
    cek('statistik menampilkan angka akhir', angka.join(' | ') === '500+ | 13 Tema | 6 Kategori', angka.join(' | '));
    const btnDepan = d.getElementById('landingMusicBtn');
    const audioDepan = d.getElementById('landingMusic');
    cek('halaman depan punya tombol musik & elemen audio', !!btnDepan && !!audioDepan);
    cek('lagu halaman depan default musik/romantis.mp3',
      !!audioDepan && /musik\/romantis\.mp3$/.test(audioDepan.getAttribute('src') || ''),
      audioDepan ? audioDepan.getAttribute('src') : '-');
    if (btnDepan) {
      btnDepan.dispatchEvent(new (d.defaultView.MouseEvent)('click', { bubbles: true }));
      cek('klik Putar Musik mengubah label menjadi "Hentikan Musik"',
        d.getElementById('landingMusicLabel').textContent.trim() === 'Hentikan Musik');
      btnDepan.dispatchEvent(new (d.defaultView.MouseEvent)('click', { bubbles: true }));
    }
    const paket = d.querySelector('.paket-spesial');
    cek('halaman depan punya paket spesial Aqiqah & Wisuda', !!paket);
    if (paket) {
      cek('paket spesial menyebut harga Rp69.000 dan tema baru',
        /Rp69\.000/.test(paket.textContent) && /Aqiqah/.test(paket.textContent) &&
        /(Graduation|Wisuda)/.test(paket.textContent));
      cek('tombol pesan paket spesial mengarah ke WhatsApp admin',
        /wa\.me\/6285196755675/.test((paket.querySelector('a') || {}).getAttribute
          ? paket.querySelector('a').getAttribute('href') : ''));
    }
    cek('tidak ada error JS di halaman depan', errors.length === 0, errors.slice(0, 2).join(' | ') || 'bersih');
  } finally {
    dom.window.close();
  }
}

// ---------- D. Mode navigasi tamu (Gulir / Snap / Slide / premium) ----------
async function ujiNavigasi() {
  console.log('\n== D. Mode navigasi tamu: 13 tema, kelas mode bersih ==');
  const TEMA = [
    'undangan-sage.html', 'undangan-jawa.html', 'undangan-demo.html', 'undangan-iceblue.html',
    'undangan-midnight.html', 'undangan-khitanan.html', 'undangan-iceblue-khitanan.html',
    'undangan-aqiqah.html', 'undangan-ultah.html', 'undangan-iceblue-ultah.html',
    'undangan-wisuda.html', 'undangan-premium.html', 'undangan-platinum.html'
  ];
  const kelasMode = (d) => Array.from(d.body.classList).filter((c) => c.indexOf('mode-') === 0)
    .map((c) => c.replace('mode-', '')).sort().join(',');

  for (const file of TEMA) {
    const singkat = file.replace('undangan-', '').replace('.html', '');
    const { dom, w, d, errors } = await buka(BASE + '/' + file + '?mode=cube');
    try {
      // 1. Link ?mode= harus dihormati di semua tema
      cek(singkat + ': ?mode=cube → kelas body mode-cube + pager',
        kelasMode(d) === 'cube' && d.body.classList.contains('pager'), kelasMode(d) || '(kosong)');
      cek(singkat + ': mode per-halaman menampilkan tepat 1 bagian aktif',
        d.querySelectorAll('.frame > section.active').length === 1,
        d.querySelectorAll('.frame > section.active').length + ' bagian');
      cek(singkat + ': tombol panah kiri/kanan tersedia dalam mode per-halaman',
        d.querySelectorAll('.kd-nav-arrow, .slide-arrow').length === 2);
      cek(singkat + ': titik navigasi sejumlah bagian undangan',
        d.querySelectorAll('.kd-nav-dots button, .dots i').length ===
        d.querySelectorAll('.frame > section').length,
        d.querySelectorAll('.kd-nav-dots button, .dots i').length + ' titik');

      // 2. Klik panah berikutnya benar-benar berpindah bagian
      const panah = d.querySelector('.kd-nav-next, .arrow-right');
      const sebelum = Array.prototype.indexOf.call(d.querySelectorAll('.frame > section'),
        d.querySelector('.frame > section.active'));
      panah.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
      const sesudah = Array.prototype.indexOf.call(d.querySelectorAll('.frame > section'),
        d.querySelector('.frame > section.active'));
      cek(singkat + ': tombol panah pindah ke bagian berikutnya', sesudah === sebelum + 1,
        sebelum + ' → ' + sesudah);

      // 3a. Strip kredit yang tadinya di luar bagian harus ikut terlihat di mode per-halaman
      const stripKandidat = Array.from(d.querySelectorAll('.footstrip, .kd-credit'))
        .filter((el) => el.querySelector('a, button'));
      if (stripKandidat.length) {
        cek(singkat + ': strip kredit ikut masuk ke bagian di mode per-halaman',
          stripKandidat.every((el) => !!el.closest('.frame > section')));
      }

      // 3. REGRESI BUG: pindah ke gulir harus melepas SEMUA kelas mode (dulu up/cube/blur bocor)
      const ganti = w.setMode || (w.StudioBackend && w.StudioBackend.setMode);
      cek(singkat + ': fungsi setMode tersedia untuk ganti mode', typeof ganti === 'function');
      if (typeof ganti === 'function') {
        ganti('scroll');
        cek(singkat + ': setMode("scroll") hanya menyisakan mode-scroll',
          kelasMode(d) === 'scroll', kelasMode(d));
        cek(singkat + ': keluar dari mode per-halaman (pager dilepas)',
          !d.body.classList.contains('pager'));
        cek(singkat + ': tanpa sisa bagian aktif saat gulir normal',
          d.querySelectorAll('.frame > section.active').length === 0);
        ganti('slide');
        cek(singkat + ': pindah ke slide → mode-slide saja (tanpa sisa mode-scroll)',
          kelasMode(d) === 'slide', kelasMode(d));
        ganti('scroll');
        if (stripKandidat.length) {
          cek(singkat + ': strip kredit dikembalikan saat gulir normal (tanpa sisa penanda)',
            stripKandidat.every((el) => !el.__kdAsal && !!el.closest('.frame')));
          const footstripPulang = d.querySelectorAll('.frame > .footstrip').length;
          if (d.querySelector('.footstrip')) {
            cek(singkat + ': footer strip kembali jadi anak langsung .frame', footstripPulang > 0,
              footstripPulang + ' footer di luar bagian');
          }
        }
      }
      cek(singkat + ': tidak ada error JS di mode navigasi', errors.length === 0,
        errors.slice(0, 2).join(' | ') || 'bersih');
    } finally {
      dom.window.close();
    }
  }

  // 4. Snap & mode tersimpan dari Studio
  const sn = await buka(BASE + '/undangan-wisuda.html?mode=snap');
  try {
    cek('mode snap menandai <html> dengan kelas snap', sn.d.documentElement.classList.contains('snap'));
    cek('mode snap tidak memakai tata letak per-halaman', !sn.d.body.classList.contains('pager'));
  } finally { sn.dom.window.close(); }

  const simpan = await buka(BASE + '/undangan-premium.html');
  try {
    const invNav = simpan.w.StudioBackend.getInvitation('premium-alvaro-clara').navMode;
    cek('navMode tersimpan di Studio diterapkan tanpa ?mode= di link',
      kelasMode(simpan.d) === invNav, 'DB: ' + invNav + ' · halaman: ' + (kelasMode(simpan.d) || '-'));
  } finally { simpan.dom.window.close(); }
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
    await ujiNavigasi();

    console.log('\n== RINGKASAN ==');
    console.log('LULUS : ' + lulus);
    console.log('GAGAL : ' + gagal);
    process.exitCode = gagal ? 1 : 0;
  } finally {
    server.kill('SIGTERM');
    setTimeout(() => server.kill('SIGKILL'), 1500).unref();
  }
})();
