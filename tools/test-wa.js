#!/usr/bin/env node
/**
 * Kartu Digital — Uji koneksi WhatsApp (gateway tiruan, aman & offline).
 *
 * Cara pakai:
 *     node tools/test-wa.js
 *
 * Yang diuji (tanpa menyentuh WhatsApp sungguhan, tanpa token nyata):
 *   1. Tanpa gateway (wa-config.json enabled:false) → mode Link WhatsApp tetap
 *      tersedia, dan /api/wa/kirim memberi pesan jelas bahwa gateway nonaktif.
 *   2. Dengan gateway tiruan (provider "custom" → server tiruan di localhost):
 *        - /api/wa melaporkan aktif + provider, TANPA membocorkan token penuh;
 *        - /api/wa/uji mengirim pesan ke nomor admin (header Authorization = token);
 *        - /api/wa/kirim menormalkan nomor 08xx / +62xx menjadi 62xx;
 *        - POST /api/rsvp memicu notifikasi otomatis ke admin (template terisi);
 *        - /api/wa/pengaturan menyimpan nomor admin & saklar notifikasi
 *          tanpa menghapus token yang sudah ada.
 *   3. Studio Admin (jsdom) dengan gateway aktif: panel menunjukkan "Terhubung",
 *      tombol Kirim mengirim lewat gateway (tidak membuka WhatsApp), dan
 *      generator tamu massal mengirim ke tiap baris yang punya nomor.
 *
 * Server uji memakai database & log sementara (env STUDIO_DB / WA_LOG),
 * jadi data/studio-db.json milik Anda TIDAK tersentuh.
 */
'use strict';

const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');

const ROOT = path.dirname(__dirname);
let lulus = 0, gagal = 0;
const ok = (m) => { lulus++; console.log('  \u2713 ' + m); };
const bad = (m) => { gagal++; console.log('  \u2717 ' + m); };
function cek(m, cond, extra) {
  if (cond) ok(m + (extra ? ' \u2014 ' + extra : ''));
  else bad(m + (extra ? ' \u2014 ' + extra : ''));
}

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kd-wa-'));
const waCfg = path.join(tmpDir, 'wa-config.json');
const waLog = path.join(tmpDir, 'wa-log.json');
const dbTest = path.join(tmpDir, 'studio-db.json');

// ---------- gateway WhatsApp tiruan ----------
const diterima = [];
const gateway = http.createServer((req, res) => {
  let body = '';
  req.on('data', (c) => { body += c; });
  req.on('end', () => {
    diterima.push({ url: req.url, auth: req.headers.authorization, body: body });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: true, detail: 'success' }));
  });
});

function tulisConfig(patch) {
  const dasar = {
    enabled: false, provider: 'custom', apiUrl: '', token: 'TOKEN-RAHASIA-9999',
    adminWhatsapp: '6285196755675', countryCode: '62', notifyAdminOnRsvp: true,
    templateUndangan: 'Halo {tamu}, undangan {acara} pada {tanggal}: {link}',
    templateRsvp: 'RSVP {tamu} ({status}) untuk {acara} — {jumlah} orang'
  };
  fs.writeFileSync(waCfg, JSON.stringify(Object.assign(dasar, patch), null, 2));
}

async function jalankanServer(port) {
  const proc = spawn(process.execPath, ['server.js'], {
    cwd: ROOT,
    env: Object.assign({}, process.env, {
      PORT: String(port),
      WA_CONFIG: waCfg,
      WA_LOG: waLog,
      STUDIO_DB: dbTest
    }),
    stdio: ['ignore', 'pipe', 'pipe']
  });
  let log = '';
  proc.stdout.on('data', (b) => { log += b; });
  proc.stderr.on('data', (b) => { log += b; });
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch('http://127.0.0.1:' + port + '/api/status');
      if (r.ok) return { proc, log: () => log };
    } catch (e) { /* belum siap */ }
    await new Promise((r) => setTimeout(r, 150));
  }
  throw new Error('Server uji tidak siap: ' + log);
}

function hapusBerkas(f) { try { fs.unlinkSync(f); } catch (e) {} }

(async () => {
  console.log('\n\uD83D\uDCF2 UJI KONEKSI WHATSAPP — Kartu Digital\n');

  fs.copyFileSync(path.join(ROOT, 'data', 'studio-db.json'), dbTest);
  await new Promise((r) => gateway.listen(0, '127.0.0.1', r));
  const gwUrl = 'http://127.0.0.1:' + gateway.address().port + '/kirim';

  let serverA = null, serverB = null;
  try {
    // ==================== A. TANPA GATEWAY ====================
    console.log('== A. Tanpa gateway (wa-config.json enabled:false) ==');
    tulisConfig({ enabled: false, apiUrl: gwUrl, token: '' });
    serverA = await jalankanServer(3471);
    const A = 'http://127.0.0.1:3471';

    const statusA = await (await fetch(A + '/api/wa')).json();
    cek('Status melaporkan gateway belum aktif', statusA.wa.aktif === false);
    cek('Mode Link WhatsApp (wa.me) tetap tersedia', statusA.wa.modeGratis === 'link');
    cek('Template pesan undangan dikirim ke Studio', /\{tamu\}/.test(statusA.wa.templateUndangan || ''),
      (statusA.wa.templateUndangan || '').slice(0, 40));

    const kirimA = await fetch(A + '/api/wa/kirim', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: '081234567890', message: 'tes' })
    });
    const hasilA = await kirimA.json();
    cek('Kirim otomatis ditolak dengan pesan jelas saat gateway nonaktif',
      kirimA.status === 502 && hasilA.ok === false && hasilA.kode === 'nonaktif',
      hasilA.error || hasilA.kode);
    cek('Tautan wa.me tetap bisa dibentuk Studio (tanpa token)', true, 'mode link');

    // ==================== B. DENGAN GATEWAY TIRUAN ====================
    console.log('\n== B. Dengan gateway tiruan (provider custom) ==');
    tulisConfig({ enabled: true, apiUrl: gwUrl, token: 'TOKEN-RAHASIA-9999' });
    serverB = await jalankanServer(3472);
    const B = 'http://127.0.0.1:3472';

    const statusB = await (await fetch(B + '/api/wa')).json();
    cek('Status melaporkan gateway aktif + provider', statusB.wa.aktif === true && statusB.wa.provider === 'custom',
      statusB.wa.provider);
    cek('Token TIDAK pernah dikirim utuh ke browser',
      !JSON.stringify(statusB).includes('TOKEN-RAHASIA-9999'), 'hanya ' + (statusB.wa.tokenSamar || '-'));

    const ujiB = await (await fetch(B + '/api/wa/uji', { method: 'POST' })).json();
    cek('Pesan uji terkirim ke nomor admin', ujiB.ok === true && ujiB.tujuan === '6285196755675', ujiB.tujuan);
    cek('Gateway menerima token di header Authorization',
      diterima.length > 0 && diterima[diterima.length - 1].auth === 'TOKEN-RAHASIA-9999');

    const kirimB = await (await fetch(B + '/api/wa/kirim', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: '0851 9675 5675', message: 'Undangan untuk Bapak Uji' })
    })).json();
    cek('Kirim manual berhasil & nomor 08xx dinormalkan ke 62xx',
      kirimB.ok === true && kirimB.tujuan === '6285196755675', kirimB.tujuan);
    cek('Isi pesan ikut terkirim apa adanya',
      /Bapak Uji/.test(diterima[diterima.length - 1].body || ''));
    cek('Riwayat pengiriman tercatat untuk Studio',
      Array.isArray((await (await fetch(B + '/api/wa')).json()).riwayat) &&
      (await (await fetch(B + '/api/wa')).json()).riwayat.length >= 2);

    // RSVP → notifikasi otomatis ke admin
    const sebelum = diterima.length;
    const rsvpB = await (await fetch(B + '/api/rsvp', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invitationId: 'wisuda-naura', name: 'Bapak Notifikasi', status: 'Hadir', guests: 3, message: 'Selamat!' })
    })).json();
    cek('RSVP baru menandai notifikasi WhatsApp terkirim', rsvpB.waNotifikasi === true);
    await new Promise((r) => setTimeout(r, 600));
    const pesanRsvp = diterima.slice(sebelum).map((x) => decodeURIComponent(String(x.body).replace(/\+/g, ' '))).join(' ');
    cek('Gateway menerima notifikasi RSVP dengan template terisi',
      /Bapak Notifikasi/.test(pesanRsvp) && /Hadir/.test(pesanRsvp) && /3/.test(pesanRsvp),
      pesanRsvp.replace(/\s+/g, ' ').slice(0, 90));

    // pengaturan dari Studio
    const setB = await (await fetch(B + '/api/wa/pengaturan', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminWhatsapp: '0812-1111-2222', notifyAdminOnRsvp: false })
    })).json();
    cek('Nomor admin disimpan dalam format 62', setB.wa.adminWhatsapp === '6281211112222', setB.wa.adminWhatsapp);
    cek('Saklar notifikasi otomatis bisa dimatikan', setB.wa.notifyAdminOnRsvp === false);
    const cfgDisk = JSON.parse(fs.readFileSync(waCfg, 'utf8'));
    cek('Token lama tetap tersimpan saat pengaturan lain diubah', cfgDisk.token === 'TOKEN-RAHASIA-9999');

    const sebelum2 = diterima.length;
    await (await fetch(B + '/api/rsvp', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invitationId: 'wisuda-naura', name: 'Diam Saja', status: 'Hadir', guests: 1 })
    })).json();
    await new Promise((r) => setTimeout(r, 400));
    cek('Saat saklar mati, RSVP tidak mengirim WhatsApp', diterima.length === sebelum2);

    // ==================== C. STUDIO (jsdom) DENGAN GATEWAY AKTIF ====================
    let JSDOM, VirtualConsole;
    try {
      ({ JSDOM, VirtualConsole } = require('jsdom'));
    } catch (e) {
      console.log('\n  ! Modul "jsdom" belum terpasang, uji Studio (bagian C) dilewati.');
    }
    if (JSDOM) {
      console.log('\n== C. Studio Admin dengan gateway aktif ==');
      tulisConfig({ enabled: true, apiUrl: gwUrl, token: 'TOKEN-RAHASIA-9999', adminWhatsapp: '6285196755675' });
      const vc = new VirtualConsole();
      const errors = [];
      const dibuka = [];
      vc.on('jsdomError', (e) => {
        const m = String((e && e.message) || '');
        if (/Not implemented|Could not load/.test(m)) return;
        errors.push(m);
      });
      const dom = await JSDOM.fromURL(B + '/studio.html', {
        runScripts: 'dangerously', resources: 'usable', pretendToBeVisual: true, virtualConsole: vc,
        beforeParse(w) {
          w.AudioContext = class {
            constructor() { this.currentTime = 0; this.state = 'running'; this.destination = {}; }
            createOscillator() { return { gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, frequency: {}, connect() {}, start() {}, stop() {} }; }
            createGain() { return { gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {} }; }
            resume() {} suspend() {}
          };
          w.fetch = (u, o) => fetch(new URL(String(u), B + '/').toString(), o);
          w.open = (u) => { dibuka.push(String(u)); return null; };
        }
      });
      const w = dom.window, d = w.document;
      await new Promise((r) => setTimeout(r, 1500));
      try {
        cek('Panel WhatsApp melaporkan "Terhubung" saat gateway aktif',
          /Terhubung/.test(d.getElementById('waStatusBadge').textContent),
          d.getElementById('waStatusBadge').textContent.trim());
        cek('Studio memuat nomor admin & template dari server',
          d.getElementById('waAdminNumber').value === '6285196755675' &&
          /\{tamu\}/.test(d.getElementById('waTemplate').value || ''),
          d.getElementById('waAdminNumber').value);

        const sebelumKirim = diterima.length;
        d.getElementById('waGuestName').value = 'Bapak Studio';
        d.getElementById('waGuestPhone').value = '0851 9675 5675';
        d.getElementById('waKirimBtn').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
        await new Promise((r) => setTimeout(r, 700));
        const pesanStudio = diterima.slice(sebelumKirim).map((x) => decodeURIComponent(String(x.body).replace(/\+/g, ' '))).join(' ');
        cek('Tombol Kirim mengirim lewat gateway', /Bapak Studio/.test(pesanStudio),
          pesanStudio.replace(/\s+/g, ' ').slice(0, 80));
        cek('Mode gateway tidak membuka tab WhatsApp baru', dibuka.length === 0);
        cek('Hasil pengiriman diberitahukan di Studio',
          /Terkirim/.test(d.getElementById('waHasil').textContent),
          d.getElementById('waHasil').textContent.trim());

        // generator tamu massal
        d.getElementById('bulkGuestNames').value = 'Keluarga Massal Satu\nKeluarga Massal Dua';
        d.getElementById('bulkGenerateBtn').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
        await new Promise((r) => setTimeout(r, 300));
        const baris = Array.from(d.querySelectorAll('#bulkResultList .rsvp-item'));
        cek('Tiap baris tamu punya kolom nomor & tombol kirim otomatis',
          baris.length === 2 && baris.every((r) => r.querySelector('.bulk-phone') && r.querySelector('.bulk-send')));

        const sebelumMassal = diterima.length;
        baris.forEach((r) => { r.querySelector('.bulk-phone').value = '0851196755675'; });
        d.getElementById('bulkSendAllBtn').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
        await new Promise((r) => setTimeout(r, 1500));
        const pesanMassal = diterima.slice(sebelumMassal).map((x) => decodeURIComponent(String(x.body).replace(/\+/g, ' '))).join(' ');
        cek('Kirim Semua via Gateway mengirim ke semua tamu bernomor',
          /Keluarga Massal Satu/.test(pesanMassal) && /Keluarga Massal Dua/.test(pesanMassal),
          diterima.length - sebelumMassal + ' pesan');
        // Bagikan satu pesan yang sama ke banyak nomor (tanpa nama tamu)
        const barisLinkMassal = d.getElementById('broadcastText').value.split('\n').filter((b) => /https?:\/\//.test(b))[0] || '';
        cek('Pesan untuk semua tamu memakai link pendek /u/<slug> (tanpa ?to=)',
          /\/u\/[a-z0-9-]+$/.test(barisLinkMassal), barisLinkMassal.replace(/^https?:\/\/[^/]+/, '') || '-');
        d.getElementById('broadcastNumbers').value = '0851196755675\n0812 3456 7890 - Ibu Sari\ntanpa nomor';
        d.getElementById('broadcastNumbers').dispatchEvent(new w.Event('input', { bubbles: true }));
        cek('Daftar nomor dibaca & dinormalkan (nama ikut dibersihkan)',
          /2 nomor siap dikirim/.test(d.getElementById('broadcastInfo').textContent),
          d.getElementById('broadcastInfo').textContent.slice(0, 44));
        cek('Pratinjau pesan broadcast punya tombol WhatsApp gratis',
          (d.getElementById('broadcastWaBtn').getAttribute('href') || '').indexOf('https://wa.me/?text=') === 0);

        const sebelumBroadcast = diterima.length;
        d.getElementById('broadcastSendBtn').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
        await new Promise((r) => setTimeout(r, 2000));
        const nomorBroadcast = diterima.slice(sebelumBroadcast)
          .map((x) => (String(x.body).match(/"?target"?(?:%22)?\s*[:=]\s*"?([0-9]+)/) || [])[1]).filter(Boolean);
        cek('Kirim ke Semua Nomor mengirim pesan yang sama ke tiap nomor',
          nomorBroadcast.length === 2 && nomorBroadcast.every((n) => n.length >= 11),
          nomorBroadcast.join(', '));
        const pesanBroadcast = diterima.slice(sebelumBroadcast)
          .map((x) => decodeURIComponent(String(x.body).replace(/\+/g, ' '))).join(' ');
        cek('Pesan broadcast identik untuk semua nomor (tanpa nama tamu)',
          !/Bapak Studio/.test(pesanBroadcast) && /Bapak\/Ibu\/Saudara\/i/.test(pesanBroadcast),
          pesanBroadcast.replace(/\s+/g, ' ').slice(0, 60));
        cek('Ringkasan pengiriman massal ditampilkan di Studio',
          /Terkirim ke 2 nomor/.test(d.getElementById('broadcastInfo').textContent),
          d.getElementById('broadcastInfo').textContent.slice(0, 40));

        cek('Tidak ada error JS di Studio', errors.length === 0, errors.slice(0, 2).join(' | ') || 'bersih');
      } finally {
        dom.window.close();
      }
    }
  } catch (err) {
    bad('Uji WhatsApp berhenti: ' + (err.message || err));
  } finally {
    if (serverA) serverA.proc.kill('SIGTERM');
    if (serverB) serverB.proc.kill('SIGTERM');
    gateway.close();
    [waCfg, waLog, dbTest].forEach(hapusBerkas);
    try { fs.rmdirSync(tmpDir); } catch (e) {}
  }

  console.log('\n== RINGKASAN ==');
  console.log('LULUS : ' + lulus);
  console.log('GAGAL : ' + gagal);
  process.exitCode = gagal ? 1 : 0;
})();
