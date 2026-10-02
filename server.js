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
const DB_PATH = path.join(ROOT_DIR, 'data', 'studio-db.json');

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
          return sendJson(res, 201, { ok: true, rsvp: entry });
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
