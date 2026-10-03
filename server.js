/**
 * Backend Studio Server — Kartu Digital (kartudigital.my.id)
 * Menyediakan REST API untuk Studio Admin, Upload Foto, Pengaturan Amplop Digital,
 * Pengaturan RSVP, serta menyajikan file statis undangan & landing page.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';
const ROOT_DIR = __dirname;
// Bisa diarahkan ke berkas lain untuk pengujian (STUDIO_DB=/tmp/db.json node server.js)
const DB_PATH = process.env.STUDIO_DB || path.join(ROOT_DIR, 'data', 'studio-db.json');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg',
  '.ico': 'image/x-icon'
};

function readDb() {
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    return { version: '2.0.0', updatedAt: new Date().toISOString(), settings: {}, invitations: [], rsvps: [] };
  }
}

function writeDb(db) {
  db.updatedAt = new Date().toISOString();
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
  return db;
}

// ==================== WHATSAPP (gateway opsional) ====================
// Konfigurasi ada di wa-config.json (tidak ikut ter-commit karena berisi token).
// Tanpa gateway, Studio tetap bisa memakai tautan wa.me — lihat /api/wa.
const WA_CONFIG_PATH = process.env.WA_CONFIG || path.join(ROOT_DIR, 'wa-config.json');
const WA_LOG_PATH = process.env.WA_LOG || path.join(ROOT_DIR, 'data', 'wa-log.json');

const WA_DEFAULT = {
  enabled: false,
  provider: 'fonnte',
  token: '',
  apiUrl: '',
  adminWhatsapp: '6285196755675',
  countryCode: '62',
  notifyAdminOnRsvp: true,
  templateUndangan: 'Halo {tamu}, kami mengundang Anda ke acara {acara} pada {tanggal}.\nUndangan lengkap: {link}',
  templateRsvp: '\ud83d\udce9 RSVP BARU\n{acara}\nNama: {tamu}\nStatus: {status}\nJumlah tamu: {jumlah}\nUcapan: {pesan}\nUndangan: {link}'
};

function readWaConfig() {
  try {
    const raw = fs.readFileSync(WA_CONFIG_PATH, 'utf8');
    const data = JSON.parse(raw);
    return Object.assign({}, WA_DEFAULT, data);
  } catch (err) {
    return Object.assign({}, WA_DEFAULT);
  }
}

function tulisWaConfig(patch) {
  const cfg = Object.assign(readWaConfig(), patch || {});
  fs.writeFileSync(WA_CONFIG_PATH, JSON.stringify(cfg, null, 2), 'utf8');
  return cfg;
}

// 0812-3456-7890 / +62 812 3456 7890 → 6281234567890
function normalisasiNomor(nomor, negara) {
  let n = String(nomor || '').replace(/[^0-9+]/g, '');
  if (!n) return '';
  if (n.startsWith('+')) n = n.slice(1);
  const kode = String(negara || '62').replace(/[^0-9]/g, '') || '62';
  if (n.startsWith('0')) n = kode + n.slice(1);
  else if (!n.startsWith(kode)) n = kode + n;
  return n;
}

function waStatusPublik(cfg) {
  cfg = cfg || readWaConfig();
  const token = String(cfg.token || '');
  return {
    aktif: !!cfg.enabled && !!token,
    enabled: !!cfg.enabled,
    provider: cfg.provider || 'fonnte',
    tokenTerpasang: !!token,
    tokenSamar: token ? ('\u2022\u2022\u2022\u2022' + token.slice(-4)) : '',
    apiUrl: cfg.apiUrl || '',
    adminWhatsapp: normalisasiNomor(cfg.adminWhatsapp, cfg.countryCode),
    notifyAdminOnRsvp: !!cfg.notifyAdminOnRsvp,
    templateUndangan: cfg.templateUndangan,
    templateRsvp: cfg.templateRsvp,
    configPath: 'wa-config.json',
    modeGratis: 'link'   // wa.me selalu tersedia tanpa token
  };
}

function isiTemplate(template, data) {
  return String(template || '').replace(/\{(\w+)\}/g, function (m, kunci) {
    return data[kunci] === undefined || data[kunci] === null ? '' : String(data[kunci]);
  });
}

async function kirimViaGateway(target, message, cfg) {
  cfg = cfg || readWaConfig();
  const token = String(cfg.token || '');
  if (!cfg.enabled) return { ok: false, error: 'Gateway WhatsApp belum diaktifkan (wa-config.json: enabled)', kode: 'nonaktif' };
  if (!token) return { ok: false, error: 'Token gateway belum diisi di wa-config.json', kode: 'tanpa-token' };

  const provider = String(cfg.provider || 'fonnte').toLowerCase();
  const nomor = normalisasiNomor(target, cfg.countryCode);
  if (!nomor) return { ok: false, error: 'Nomor tujuan tidak valid', kode: 'nomor' };

  let url = cfg.apiUrl;
  let opsi;

  if (provider === 'fonnte') {
    url = url || 'https://api.fonnte.com/send';
    opsi = {
      method: 'POST',
      headers: { Authorization: token, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ target: nomor, message: message, countryCode: String(cfg.countryCode || '62') }).toString()
    };
  } else if (provider === 'wablas') {
    url = url || 'https://console.wablas.com/api/send-message';
    opsi = {
      method: 'POST',
      headers: { Authorization: token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: nomor, message: message })
    };
  } else if (provider === 'whacenter') {
    url = url || 'https://api.whacenter.com/api/send';
    opsi = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ device_id: token, number: nomor, message: message })
    };
  } else {
    if (!url) return { ok: false, error: 'provider "custom" butuh apiUrl di wa-config.json', kode: 'tanpa-url' };
    opsi = {
      method: 'POST',
      headers: { Authorization: token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: nomor, phone: nomor, message: message })
    };
  }

  try {
    const kontrol = new AbortController();
    const timer = setTimeout(() => kontrol.abort(), 15000);
    const resp = await fetch(url, Object.assign({ signal: kontrol.signal }, opsi));
    clearTimeout(timer);
    const teks = await resp.text();
    let data = null;
    try { data = JSON.parse(teks); } catch (e) { data = { raw: teks.slice(0, 300) }; }
    const gagalPesan = data && (data.status === false || data.success === false || data.status === 'false');
    const ok = resp.ok && !gagalPesan;
    catatWa({ target: nomor, ok: ok, provider: provider, keterangan: ok ? 'terkirim' : ('gagal: HTTP ' + resp.status) });
    return { ok: ok, kode: ok ? 'terkirim' : 'gagal', provider: provider, httpStatus: resp.status, respons: data };
  } catch (err) {
    catatWa({ target: nomor, ok: false, provider: provider, keterangan: 'error: ' + (err.message || 'gagal') });
    return { ok: false, kode: 'error', error: 'Gagal menghubungi gateway: ' + (err.message || 'tidak diketahui') };
  }
}

// Riwayat singkat pengiriman (maks 100) — untuk ditampilkan di Studio.
function catatWa(entri) {
  try {
    let log = [];
    try { log = JSON.parse(fs.readFileSync(WA_LOG_PATH, 'utf8')); } catch (e) { log = []; }
    if (!Array.isArray(log)) log = [];
    log.unshift(Object.assign({ waktu: new Date().toISOString() }, entri));
    fs.mkdirSync(path.dirname(WA_LOG_PATH), { recursive: true });
    fs.writeFileSync(WA_LOG_PATH, JSON.stringify(log.slice(0, 100), null, 2), 'utf8');
  } catch (err) { /* log tidak penting — jangan sampai mengganggu pengiriman */ }
}

function bacaWaLog(batas) {
  try {
    const log = JSON.parse(fs.readFileSync(WA_LOG_PATH, 'utf8'));
    return Array.isArray(log) ? log.slice(0, batas || 20) : [];
  } catch (err) { return []; }
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(body);
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => {
      data += chunk;
      if (data.length > 15 * 1024 * 1024) {
        reject(new Error('Payload terlalu besar (maks 15MB)'));
      }
    });
    req.on('end', () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch (e) {
        reject(new Error('Format JSON tidak valid'));
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    return res.end();
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = decodeURIComponent(parsedUrl.pathname || '/');

  // ==================== REST API BACKEND STUDIO ====================
  if (pathname.startsWith('/api/')) {
    try {
      const db = readDb();

      // GET /api/status
      if (pathname === '/api/status' && req.method === 'GET') {
        const totalViews = (db.invitations || []).reduce((acc, i) => acc + (Number(i.views) || 0), 0);
        const hadirCount = (db.rsvps || []).filter(r => r.status === 'Hadir').length;
        return sendJson(res, 200, {
          ok: true,
          mode: 'backend-server',
          updatedAt: db.updatedAt,
          wa: { aktif: waStatusPublik().aktif, provider: waStatusPublik().provider },
          stats: {
            totalInvitations: (db.invitations || []).length,
            activeInvitations: (db.invitations || []).filter(i => i.status === 'Aktif').length,
            totalViews,
            totalRsvps: (db.rsvps || []).length,
            hadirCount
          }
        });
      }

      // GET /api/db (full snapshot) & PUT /api/db (sync full state)
      if (pathname === '/api/db') {
        if (req.method === 'GET') {
          return sendJson(res, 200, { ok: true, db });
        }
        if (req.method === 'PUT' || req.method === 'POST') {
          const body = await parseBody(req);
          if (body && Array.isArray(body.invitations)) {
            db.invitations = body.invitations;
          }
          if (body && Array.isArray(body.rsvps)) {
            db.rsvps = body.rsvps;
          }
          if (body && body.settings) {
            db.settings = Object.assign({}, db.settings, body.settings);
          }
          writeDb(db);
          return sendJson(res, 200, { ok: true, db });
        }
      }

      // GET /api/invitations & POST /api/invitations
      if (pathname === '/api/invitations') {
        if (req.method === 'GET') {
          const cat = parsedUrl.query.category;
          const list = cat && cat !== 'all'
            ? db.invitations.filter(i => i.category === cat || (cat === 'premium' && i.isPremium))
            : db.invitations;
          return sendJson(res, 200, { ok: true, invitations: list });
        }
        if (req.method === 'POST') {
          const body = await parseBody(req);
          if (!body.id) {
            body.id = 'inv-' + Date.now();
          }
          const idx = db.invitations.findIndex(i => i.id === body.id || (body.slug && i.slug === body.slug));
          if (idx > -1) {
            db.invitations[idx] = Object.assign({}, db.invitations[idx], body);
          } else {
            db.invitations.unshift(body);
          }
          writeDb(db);
          return sendJson(res, 200, { ok: true, invitation: body });
        }
      }

      // GET / PUT / DELETE /api/invitations/:id
      if (pathname.startsWith('/api/invitations/')) {
        const id = pathname.replace('/api/invitations/', '');
        const idx = db.invitations.findIndex(i => i.id === id || i.slug === id);
        if (req.method === 'GET') {
          if (idx === -1) return sendJson(res, 404, { ok: false, error: 'Undangan tidak ditemukan' });
          return sendJson(res, 200, { ok: true, invitation: db.invitations[idx] });
        }
        if (req.method === 'PUT') {
          const body = await parseBody(req);
          if (idx === -1) {
            body.id = id;
            db.invitations.unshift(body);
            writeDb(db);
            return sendJson(res, 200, { ok: true, invitation: body });
          }
          db.invitations[idx] = Object.assign({}, db.invitations[idx], body);
          writeDb(db);
          return sendJson(res, 200, { ok: true, invitation: db.invitations[idx] });
        }
        if (req.method === 'DELETE') {
          if (idx === -1) return sendJson(res, 404, { ok: false, error: 'Undangan tidak ditemukan' });
          const removed = db.invitations.splice(idx, 1)[0];
          writeDb(db);
          return sendJson(res, 200, { ok: true, removed });
        }
      }

      // GET / POST /api/rsvp
      if (pathname === '/api/rsvp') {
        if (req.method === 'GET') {
          const invId = parsedUrl.query.invitationId;
          const list = invId
            ? db.rsvps.filter(r => r.invitationId === invId)
            : db.rsvps;
          return sendJson(res, 200, { ok: true, rsvps: list });
        }
        if (req.method === 'POST') {
          const body = await parseBody(req);
          const entry = {
            id: body.id || ('rsvp-' + Date.now()),
            invitationId: body.invitationId || 'sage-rahma-dika',
            name: (body.name || 'Tamu Undangan').trim(),
            status: body.status || 'Hadir',
            guests: Number(body.guests) || 1,
            phone: (body.phone || '').trim(),
            message: (body.message || '').trim(),
            createdAt: body.createdAt || new Date().toISOString()
          };
          db.rsvps.unshift(entry);
          writeDb(db);

          // Kalau gateway WhatsApp aktif: kabari admin otomatis (tidak menahan balasan).
          const waCfg = readWaConfig();
          let waTerkirim = false;
          if (waCfg.enabled && waCfg.notifyAdminOnRsvp && waCfg.token) {
            const inv = (db.invitations || []).find(i => i.id === entry.invitationId) || {};
            const acara = inv.title || inv.theme || 'Undangan Digital';
            const dataPesan = {
              acara: acara,
              tamu: entry.name,
              status: entry.status,
              jumlah: entry.guests,
              pesan: entry.message || '-',
              link: inv.slug ? ('https://kartudigital.my.id/' + inv.slug) : ''
            };
            const pesan = isiTemplate(waCfg.templateRsvp, dataPesan);
            waTerkirim = true;
            kirimViaGateway(waCfg.adminWhatsapp, pesan, waCfg).catch(() => {});
          }

          return sendJson(res, 201, { ok: true, rsvp: entry, waNotifikasi: waTerkirim });
        }
      }

      // DELETE /api/rsvp/:id
      if (pathname.startsWith('/api/rsvp/') && req.method === 'DELETE') {
        const id = pathname.replace('/api/rsvp/', '');
        const idx = db.rsvps.findIndex(r => r.id === id);
        if (idx === -1) return sendJson(res, 404, { ok: false, error: 'Data RSVP tidak ditemukan' });
        const removed = db.rsvps.splice(idx, 1)[0];
        writeDb(db);
        return sendJson(res, 200, { ok: true, removed });
      }

      // ==================== WHATSAPP: status, uji, kirim, pengaturan ====================
      if (pathname === '/api/wa' && req.method === 'GET') {
        return sendJson(res, 200, { ok: true, wa: waStatusPublik(), riwayat: bacaWaLog(10) });
      }

      if (pathname === '/api/wa/uji' && req.method === 'POST') {
        const cfg = readWaConfig();
        const nomor = normalisasiNomor(cfg.adminWhatsapp, cfg.countryCode);
        if (!nomor) return sendJson(res, 400, { ok: false, error: 'Nomor admin WhatsApp belum diatur' });
        const hasil = await kirimViaGateway(nomor, '\u2705 Uji koneksi WhatsApp dari Studio Kartu Digital. Kalau pesan ini masuk, gateway sudah siap dipakai.', cfg);
        return sendJson(res, hasil.ok ? 200 : 502, { ok: hasil.ok, tujuan: nomor, hasil });
      }

      if (pathname === '/api/wa/kirim' && req.method === 'POST') {
        const body = await parseBody(req);
        const cfg = readWaConfig();
        const pesan = body.message || isiTemplate(body.template || cfg.templateUndangan, body.data || {});
        if (!pesan) return sendJson(res, 400, { ok: false, error: 'Isi pesan kosong' });
        const hasil = await kirimViaGateway(body.target || body.phone, pesan, cfg);
        return sendJson(res, hasil.ok ? 200 : 502, Object.assign({ ok: hasil.ok, tujuan: normalisasiNomor(body.target || body.phone, cfg.countryCode), pesan }, hasil));
      }

      if (pathname === '/api/wa/pengaturan' && req.method === 'POST') {
        const body = await parseBody(req);
        const boleh = ['adminWhatsapp', 'notifyAdminOnRsvp', 'enabled', 'provider', 'apiUrl', 'token', 'countryCode', 'templateUndangan', 'templateRsvp'];
        const patch = {};
        boleh.forEach(k => { if (body[k] !== undefined) patch[k] = body[k]; });
        if (patch.adminWhatsapp !== undefined) {
          patch.adminWhatsapp = normalisasiNomor(patch.adminWhatsapp, patch.countryCode || readWaConfig().countryCode);
        }
        const cfg = tulisWaConfig(patch);
        return sendJson(res, 200, { ok: true, wa: waStatusPublik(cfg) });
      }

      // POST /api/upload (accepts dataUrl & returns usable URL/dataUrl)
      if (pathname === '/api/upload' && req.method === 'POST') {
        const body = await parseBody(req);
        if (!body.dataUrl) {
          return sendJson(res, 400, { ok: false, error: 'dataUrl diperlukan' });
        }
        return sendJson(res, 200, {
          ok: true,
          url: body.dataUrl,
          name: body.name || 'uploaded-photo.jpg'
        });
      }

      return sendJson(res, 404, { ok: false, error: 'Endpoint API tidak ditemukan' });
    } catch (err) {
      return sendJson(res, 500, { ok: false, error: err.message || 'Internal Server Error' });
    }
  }

  // ==================== STATIC FILE SERVER ====================
  let safePath = path.normalize(pathname).replace(/^(\.\.[/\\])+/, '');
  if (safePath === '/' || safePath === '\\') safePath = '/index.html';
  const filePath = path.join(ROOT_DIR, safePath);

  if (!filePath.startsWith(ROOT_DIR)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('404 Not Found');
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Kartu Digital Backend Studio berjalan di http://${HOST}:${PORT}`);
});
