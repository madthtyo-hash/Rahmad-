#!/usr/bin/env node
/**
 * Kartu Digital — Uji Aksesibilitas otomatis (axe-core + jsdom).
 *
 * Cara pakai:
 *     npm install            # sekali saja (memasang jsdom + axe-core)
 *     node tools/a11y-test.js
 *
 * Yang diuji:
 *   1. Halaman depan (landing), Studio Admin, dan ke-13 halaman tema diperiksa
 *      memakai mesin audit axe-core: tidak boleh ada pelanggaran berisiko
 *      "serious" atau "critical" (nama tombol, label form, peran ARIA, dsb).
 *   2. Cek perilaku aksesibilitas yang tidak terlihat oleh axe:
 *        - tab editor Studio memakai pola tablist/tab/tabpanel + panah keyboard,
 *        - kotak Galeri berupa dialog (role="dialog", aria-modal),
 *        - foto galeri bisa dibuka dengan keyboard (Enter),
 *        - pilihan kehadiran RSVP berupa <button> asli, bukan <div>,
 *        - isian form RSVP dan tombol salin rekening punya nama untuk pembaca layar,
 *        - tombol musik halaman depan bisa dinyalakan/dimatikan (aria-pressed).
 *
 * Server Node dijalankan otomatis di port uji (tidak mengganggu server Anda).
 * Uji ini TIDAK menyentuh Supabase dan TIDAK mengubah data/studio-db.json.
 */
'use strict';

const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

let JSDOM, VirtualConsole;
try {
  ({ JSDOM, VirtualConsole } = require('jsdom'));
} catch (e) {
  console.log('\n  ! Modul "jsdom" belum terpasang, uji aksesibilitas dilewati.');
  console.log('    Pasang dulu:  npm install\n');
  process.exit(0);
}

let axeSource;
try {
  axeSource = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
} catch (e) {
  console.log('\n  ! Modul "axe-core" belum terpasang, uji aksesibilitas dilewati.');
  console.log('    Pasang dulu:  npm install\n');
  process.exit(0);
}

const ROOT = path.dirname(__dirname);
let PORT = Number(process.env.A11Y_TEST_PORT || 3232);
let BASE = 'http://127.0.0.1:' + PORT;

// Halaman tema yang punya pemutar musik & galeri (semua tema di katalog).
const TEMA = [
  'undangan-sage.html', 'undangan-jawa.html', 'undangan-demo.html',
  'undangan-iceblue.html', 'undangan-midnight.html', 'undangan-khitanan.html',
  'undangan-iceblue-khitanan.html', 'undangan-aqiqah.html', 'undangan-ultah.html',
  'undangan-iceblue-ultah.html', 'undangan-wisuda.html', 'undangan-premium.html',
  'undangan-platinum.html'
];

let lulus = 0, gagal = 0;
const ok = (m) => { lulus++; console.log('  \u2713 ' + m); };
const bad = (m) => { gagal++; console.log('  \u2717 ' + m); };
function cek(m, cond, extra) {
  if (cond) ok(m + (extra ? ' \u2014 ' + extra : ''));
  else bad(m + (extra ? ' \u2014 ' + extra : ''));
}

// ---------- server uji ----------
// Port bisa masih dipakai sisa proses uji sebelumnya: cari port bebas berikutnya.
async function portBebas(port) {
  const net = require('net');
  return new Promise((resolve) => {
    const uji = net.createServer();
    uji.once('error', () => resolve(false));
    uji.once('listening', () => uji.close(() => resolve(true)));
    uji.listen(port, '127.0.0.1');
  });
}

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

// ---------- stub browser (audio & jaringan offline) ----------
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
  window.fetch = () => Promise.resolve({
    ok: false, status: 0,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve('')
  });
  window.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 16);
}

async function buka(url, tunggu = 500) {
  const vc = new VirtualConsole();
  const errors = [];
  vc.on('jsdomError', (e) => {
    const m = String((e && e.message) || '');
    if (/Could not load (link|script|img)|Could not parse CSS/i.test(m) &&
        /fonts\.googleapis|fonts\.gstatic/.test(m)) return;
    if (/Not implemented: HTMLMediaElement/i.test(m)) return; // play/pause belum ada di jsdom
    if (/Not implemented: Window's scrollTo/i.test(m)) return;   // jsdom belum punya scrollTo beropsi
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
  await new Promise((r) => setTimeout(r, tunggu));
  return { dom, w: dom.window, d: dom.window.document, errors };
}

// ---------- audit axe ----------
async function audit(w, d) {
  w.eval(axeSource);
  const hasil = await w.axe.run(d, {
    // jsdom tidak menghitung warna; kontras diuji manual di server nyata.
    rules: { 'color-contrast': { enabled: false } }
  });
  const serius = hasil.violations.filter((v) => ['serious', 'critical'].includes(v.impact));
  return { serius, ringan: hasil.violations.filter((v) => !['serious', 'critical'].includes(v.impact)) };
}

function ringkasSerius(serius) {
  return serius.map((v) => v.id + ' (' + v.nodes.length + ')').join(', ');
}

// ---------- uji halaman ----------
async function ujiHalaman(file, label, opsi = {}) {
  const { dom, w, d, errors } = await buka(BASE + '/' + file, opsi.tunggu || 500);
  try {
    const { serius, ringan } = await audit(w, d);
    cek(label + ': tanpa pelanggaran serius (axe-core)',
      serius.length === 0,
      serius.length ? ringkasSerius(serius) : 'bersih' + (ringan.length ? ' \u00b7 catatan ringan: ' + ringan.map((v) => v.id).join(', ') : ''));
    if (opsi.periksa) opsi.periksa({ dom, w, d, errors });
  } finally {
    dom.window.close();
  }
}

// ---------- jalur utama ----------
(async () => {
  for (let i = 0; i < 6; i++) {
    if (await portBebas(PORT + i)) { PORT += i; BASE = 'http://127.0.0.1:' + PORT; break; }
  }
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
      console.log('    Coba: A11Y_TEST_PORT=3333 node tools/a11y-test.js\n');
      process.exit(1);
    }

    console.log('\n== A. Halaman depan: audit + tombol musik ==');
    await ujiHalaman('index.html', 'Halaman depan', {
      tunggu: 700,
      periksa({ d, errors }) {
        const btn = d.getElementById('landingMusicBtn');
        const audio = d.getElementById('landingMusic');
        cek('Halaman depan punya tombol musik', !!btn && !!audio);
        cek('Tombol musik punya nama untuk pembaca layar',
          !!btn && btn.getAttribute('aria-label') === 'Putar atau hentikan musik latar');
        cek('Lagu bawaan halaman depan = musik/romantis.mp3',
          !!audio && /musik\/romantis\.mp3$/.test(audio.getAttribute('src') || ''));
        if (btn) {
          btn.dispatchEvent(new (d.defaultView.MouseEvent)('click', { bubbles: true }));
          cek('Klik tombol musik mengubah status jadi \u201cHentikan Musik\u201d',
            d.getElementById('landingMusicLabel').textContent.trim() === 'Hentikan Musik');
          cek('Status aria-pressed ikut berubah', btn.getAttribute('aria-pressed') === 'true');
          btn.dispatchEvent(new (d.defaultView.MouseEvent)('click', { bubbles: true }));
          cek('Klik kedua mengembalikan ke \u201cPutar Musik\u201d',
            d.getElementById('landingMusicLabel').textContent.trim() === 'Putar Musik');
        }
        cek('Landing = salinan index.html (tanpa error JS)', errors.length === 0,
          errors.slice(0, 2).join(' | ') || 'bersih');
      }
    });
    await ujiHalaman('landing.html', 'Halaman landing');

    console.log('\n== B. Studio Admin: audit + pola tab & keyboard ==');
    await ujiHalaman('studio.html', 'Studio Admin', {
      tunggu: 900,
      periksa({ d }) {
        const tablist = d.querySelector('.editor-tabs');
        const tabs = Array.from(d.querySelectorAll('.editor-tabs [role="tab"]'));
        const panels = d.querySelectorAll('[role="tabpanel"]');
        cek('Daftar tab memakai pola ARIA tablist', !!tablist && tablist.getAttribute('role') === 'tablist');
        cek('Semua 6 tombol tab punya role="tab" + aria-selected', tabs.length === 6 &&
          tabs.every((t) => t.hasAttribute('aria-selected')), tabs.length + ' tombol');
        cek('Setiap tab punya panel role="tabpanel"', panels.length === 6, panels.length + ' panel');
        if (tabs[0]) {
          tabs[0].dispatchEvent(new (d.defaultView.KeyboardEvent)('keydown', { key: 'ArrowRight', bubbles: true }));
          cek('Panah kanan memindah tab aktif ke \u201cTema & Visual\u201d',
            (d.querySelector('.editor-tabs [role="tab"][aria-selected="true"]') || {}).id === 'tabbtn-tema',
            (d.querySelector('.editor-tabs [role="tab"][aria-selected="true"]') || {}).id);
        }
        // Panel Pemeriksaan: daftar periksa & pratinjau hasil harus ramah pembaca layar
        const daftarPeriksa = Array.from(d.querySelectorAll('#periksaList li'));
        cek('Daftar periksa kelengkapan terisi', daftarPeriksa.length >= 10, daftarPeriksa.length + ' butir');
        cek('Setiap butir periksa punya label teks', daftarPeriksa.every((li) => li.textContent.trim().length > 6));
        const iframeHasil = d.getElementById('hasilPreviewFrame');
        cek('Pratinjau hasil undangan (iframe) punya judul untuk pembaca layar',
          !!iframeHasil && iframeHasil.getAttribute('title') === 'Pratinjau hasil undangan');
        const selStatus = d.getElementById('fReviewStatus');
        cek('Pilihan status pemeriksaan admin punya label',
          !!selStatus && !!d.querySelector('label[for="fReviewStatus"]'));
        const noteAdmin = d.getElementById('fReviewNote');
        cek('Catatan admin punya label', !!noteAdmin && !!d.querySelector('label[for="fReviewNote"]'));

        // Panel WhatsApp: semua isian harus punya label untuk pembaca layar
        const fieldWa = ['waGuestName', 'waGuestPhone', 'waTemplate', 'waAdminNumber', 'waAutoRsvp'];
        cek('Isian panel WhatsApp punya label pembaca layar',
          fieldWa.every((id) => !!d.querySelector('label[for="' + id + '"]')), fieldWa.join(', '));
        const fieldBroadcast = ['broadcastText', 'broadcastNumbers'];
        cek('Isian blok Bagikan ke Semua Tamu punya label',
          fieldBroadcast.every((id) => !!d.querySelector('label[for="' + id + '"]')), fieldBroadcast.join(', '));
        const fieldPendek = ['clientShortUrl', 'clientShortCustom'];
        cek('Isian link pendek punya label pembaca layar',
          fieldPendek.every((id) => !!d.querySelector('label[for="' + id + '"]')), fieldPendek.join(', '));
        const fieldPelanggan = ['clientName', 'clientPhone', 'clientUrl', 'clientText'];
        cek('Isian blok Serah Terima ke Pelanggan punya label',
          fieldPelanggan.every((id) => !!d.querySelector('label[for="' + id + '"]')), fieldPelanggan.join(', '));
        const statusWa = d.getElementById('waStatusBadge');
        cek('Status koneksi WhatsApp tampil sebagai teks',
          !!statusWa && statusWa.textContent.trim().length > 5, statusWa ? statusWa.textContent.trim() : '-');

        cek('Tombol bersalin (copy) di daftar undangan punya label', (() => {
          const a = d.querySelectorAll('.copy-mini');
          return a.length === 0 || Array.from(a).every((b) => b.hasAttribute('aria-label'));
        })());
      }
    });

    console.log('\n== C. Ke-13 halaman tema: audit + interaksi keyboard ==');
    for (const file of TEMA) {
      await ujiHalaman(file, file.replace('undangan-', '').replace('.html', ''), {
        tunggu: 700,
        periksa({ w, d }) {
          const lb = d.getElementById('lightbox');
          if (lb) {
            cek(file + ': kotak Galeri = dialog ARIA',
              lb.getAttribute('role') === 'dialog' && lb.getAttribute('aria-modal') === 'true');
            const close = d.getElementById('lbClose');
            cek(file + ': tombol tutup galeri punya nama',
              !!close && !!close.getAttribute('aria-label'));
            const gal = Array.from(d.querySelectorAll('.gal-item'));
            cek(file + ': foto galeri bisa dijangkau keyboard',
              gal.length > 0 && gal.every((g) => g.getAttribute('tabindex') === '0' && g.getAttribute('role') === 'button'),
              gal.length + ' foto');
          }
          const pill = Array.from(d.querySelectorAll('.pills .pill'));
          if (pill.length) {
            cek(file + ': pilihan kehadiran RSVP berupa <button>', pill.every((p) => p.tagName === 'BUTTON'),
              pill.map((p) => p.tagName).join('/'));
            cek(file + ': kelompok pilihan kehadiran punya label',
              (d.querySelector('.pills') || {}).getAttribute && d.querySelector('.pills').getAttribute('aria-label') === 'Status kehadiran');
          }
          ['rName', 'rCount', 'rsvpMsg'].forEach((id) => {
            const el = d.getElementById(id);
            if (el) cek(file + ': isian #' + id + ' punya label pembaca layar', !!el.getAttribute('aria-label'));
          });
          const salin = Array.from(d.querySelectorAll('.copy-mini, .copy-btn'));
          cek(file + ': setiap tombol salin rekening punya nama',
            salin.length > 0 && salin.every((b) => b.getAttribute('aria-label') || b.textContent.trim()),
            salin.length + ' tombol');
          // Titik navigasi mode per-halaman harus punya nama untuk pembaca layar
          const titik = Array.from(d.querySelectorAll('.kd-nav-dots button, .dots i'));
          if (titik.length) {
            cek(file + ': titik navigasi bagian punya nama',
              titik.every((t) => t.tagName === 'BUTTON' && !!t.getAttribute('aria-label')) ||
              titik.every((t) => !!t.getAttribute('aria-label')),
              titik.length + ' titik');
          }
          const panah = Array.from(d.querySelectorAll('.kd-nav-arrow, .slide-arrow'));
          if (panah.length) {
            cek(file + ': tombol panah navigasi punya nama',
              panah.every((b) => !!b.getAttribute('aria-label')), panah.length + ' tombol');
          }

          // QR check-in & tombol kalender harus bisa dipakai pembaca layar
          const checkin = d.getElementById('studioCheckin');
          if (checkin) {
            const qrWadah = checkin.querySelector('#studioCheckinQr');
            cek(file + ': kotak QR punya label pembaca layar',
              !!qrWadah && !!qrWadah.getAttribute('aria-label'));
            const tombolCheckin = Array.from(checkin.querySelectorAll('button, a'));
            cek(file + ': tombol QR check-in semuanya punya nama',
              tombolCheckin.length >= 3 && tombolCheckin.every((b) => b.textContent.trim().length > 2),
              tombolCheckin.length + ' tombol');
          }
          const kal = d.getElementById('studioKalender');
          if (kal) {
            const tautanKal = Array.from(kal.querySelectorAll('a'));
            cek(file + ': tombol Simpan ke Kalender punya nama',
              tautanKal.length === 2 && tautanKal.every((a) => a.textContent.trim().length > 4),
              tautanKal.map((a) => a.textContent.trim()).join(' / '));
          }
          const barWa = d.getElementById('studioRsvpWa');
          if (barWa) {
            cek(file + ': tawaran kabari WhatsApp punya nama jelas',
              /Kabari lewat WhatsApp/.test(barWa.textContent));
          }

          // Musik mengikuti pilihan Studio (sampel DB memakai berkas MP3)
          const musik = d.getElementById('musicBtn');
          cek(file + ': tombol musik ada & punya nama', !!musik && !!musik.getAttribute('aria-label'),
            musik ? musik.getAttribute('aria-label') : 'tidak ada');
        }
      });
    }

    console.log('\n== D. Lightbox: Escape & fokus kembali ==');
    {
      const { dom, d } = await buka(BASE + '/undangan-wisuda.html', 800);
      try {
        const Ev = (t) => new (d.defaultView[t])('');
        const gal = d.querySelector('.gal-item');
        const lb = d.getElementById('lightbox');
        if (!gal || !lb) {
          bad('Halaman wisuda punya galeri & lightbox untuk diuji');
        } else {
          const jeda = () => new Promise((r) => setTimeout(r, 30));
          gal.dispatchEvent(new (d.defaultView.MouseEvent)('click', { bubbles: true }));
          cek('Klik foto membuka kotak galeri (class "show")', lb.classList.contains('show'));
          await jeda();
          cek('Fokus otomatis pindah ke tombol tutup', d.activeElement === d.getElementById('lbClose'),
            d.activeElement ? d.activeElement.id || d.activeElement.tagName : '-');
          d.dispatchEvent(new (d.defaultView.KeyboardEvent)('keydown', { key: 'Escape', bubbles: true }));
          await jeda();
          cek('Tombol Escape menutup kotak galeri', !lb.classList.contains('show'));
          cek('Fokus kembali ke foto yang dibuka', d.activeElement === gal,
            d.activeElement ? d.activeElement.className || d.activeElement.tagName : '-');
        }
      } finally {
        dom.window.close();
      }
    }

    console.log('\n== RINGKASAN ==');
    console.log('LULUS : ' + lulus);
    console.log('GAGAL : ' + gagal);
    process.exitCode = gagal ? 1 : 0;
  } finally {
    server.kill('SIGTERM');
    setTimeout(() => server.kill('SIGKILL'), 1500).unref();
  }
})();
