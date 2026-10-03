/**
 * Uji lapisan Supabase Cloud di studio-api.js TANPA menyentuh database sungguhan.
 * Semua permintaan jaringan dipalsukan (mock), jadi aman dijalankan kapan saja.
 *
 * Cara pakai:
 *     cd /home/user/Rahmad-
 *     node tools/test-cloud.js
 */
const fs = require('fs');
const path = require('path');
const SRC = path.join(__dirname, '..', 'studio-api.js');
const CONFIG = path.join(__dirname, '..', 'supabase-config.json');

function makeEnv(configJson, routes) {
  const calls = [], store = {};
  global.window = {};
  global.localStorage = {
    getItem: k => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: k => { delete store[k]; }
  };
  global.fetch = async (url, opts = {}) => {
    calls.push({ url, method: opts.method || 'GET', headers: opts.headers || {}, body: opts.body ? JSON.parse(opts.body) : null });
    const resp = (ok, body, status) => ({ ok, status: status || (ok ? 200 : 403), text: async () => JSON.stringify(body), json: async () => JSON.parse(JSON.stringify(body)) });
    if (url.startsWith('supabase-config.json')) return resp(true, configJson);
    for (const r of routes) {
      if (!url.startsWith(r.match)) continue;
      if (r.method && r.method !== (opts.method || 'GET')) continue;
      return resp(r.ok !== false, r.body, r.status);
    }
    return resp(false, { message: 'Tidak ada rute mock' });
  };
  global.document = { getElementById: () => null, querySelectorAll: () => [], createElement: () => ({ style: {}, setAttribute() {} }) };
  global.navigator = {};
  delete require.cache[require.resolve(SRC)];
  require(SRC);
  return { calls, backend: global.window.StudioBackend };
}

(async () => {
  let gagal = 0;
  const cek = (n, c, i = '') => { console.log((c ? '  ✓ ' : '  ✗ ') + n + (i ? ' → ' + i : '')); if (!c) gagal++; };
  const routes = [
    { match: 'https://demo.supabase.co/rest/v1/invitations', ok: true, body: [] },
    { match: 'https://demo.supabase.co/rest/v1/rsvp', ok: true, body: [] }
  ];

  // Dipakai untuk menguji perilaku "belum diisi" secara pasti, apa pun isi file asli.
  const CFG_KOSONG = { enabled: false, url: '', anonKey: '' };
  const cfgRepo = JSON.parse(fs.readFileSync(CONFIG, 'utf8'));
  console.log('\n(Catatan: supabase-config.json di repo = ' +
    (cfgRepo.enabled && cfgRepo.url ? 'TERISI → ' + cfgRepo.url : 'belum diisi') + ')');

  console.log('\n== A. Config default (belum diisi) ==');
  let env = makeEnv(CFG_KOSONG, routes);
  cek('cloud.isConfigured() = false', env.backend.cloud.isConfigured() === false);
  cek('push ditolak dengan pesan jelas', (await env.backend.cloud.push(env.backend.getDb())).ok === false);
  cek('tidak ada request ke Supabase', !env.calls.some(c => c.url.includes('supabase.co')));

  console.log('\n== B. Publishable key diterima, secret ditolak ==');
  env = makeEnv({ enabled: true, url: 'https://demo.supabase.co', anonKey: 'sb_publishable_OK', tables: {} }, routes);
  await env.backend.cloud.init();
  cek('publishable dikenali', env.backend.cloud.status().configured === true && env.backend.cloud.status().keyType === 'publishable');
  const errAsli = console.error; console.error = () => {};
  const env2 = makeEnv({ enabled: true, url: 'https://demo.supabase.co', anonKey: 'sb_secret_JANGAN', tables: {} }, routes);
  await env2.backend.cloud.init();
  console.error = errAsli;
  cek('secret key ditolak + pesan jelas', env2.backend.cloud.status().configured === false && /RAHASIA/.test(env2.backend.cloud.status().pesan));
  cek('secret key tidak menghubungi Supabase', !env2.calls.some(c => c.url.includes('supabase.co')));

  console.log('\n== C. Tarik data: undangan + RSVP, tamu TIDAK diambil ==');
  env = makeEnv({ enabled: true, url: 'https://demo.supabase.co', anonKey: 'sb_publishable_OK', tables: {} }, [
    { match: 'https://demo.supabase.co/rest/v1/invitations', body: [
      { slug: 'cloud-baru', external_id: 'cloud-baru', event_type: 'khitanan', theme_file: 'undangan-iceblue-khitanan.html',
        child_name: 'Alif', event_date: '2026-11-22',
        payload: { themeFile: 'undangan-iceblue-khitanan.html', category: 'khitanan', primaryName: 'Alif',
                   photos: { cover: 'foto-iceblue-khitanan-cover.jpg', gallery: [] },
                   amplop: { enabled: true, accounts: [] }, rsvp: { enabled: true } } }
    ] },
    { match: 'https://demo.supabase.co/rest/v1/rsvp', body: [
      { id: 'u1', external_id: 'rsvp-901', invitation_slug: 'cloud-baru', name: 'Om Budi', attendance: 'hadir', pax: 2, message: 'Hadir', created_at: '2026-10-03T04:00:00Z' }
    ] }
  ]);
  const pull = await env.backend.cloud.pull();
  cek('pull berhasil', pull.ok === true, JSON.stringify({ inv: pull.invitations, rsvp: pull.rsvps }));
  cek('undangan cloud masuk lokal', env.backend.getDb().invitations.some(i => i.id === 'cloud-baru'));
  cek('RSVP cloud masuk & status dipetakan', env.backend.getDb().rsvps.some(r => r.id === 'rsvp-901' && r.status === 'Hadir'));
  cek('TIDAK ada request ke tabel tamu', !env.calls.some(c => c.url.includes('guest')));
  cek('undangan lokal lama tetap ada', env.backend.getDb().invitations.length >= 9);

  console.log('\n== D. Kirim data ke Supabase ==');
  const push = await env.backend.cloud.push(env.backend.getDb());
  const invCall = env.calls.filter(c => c.method === 'POST' && c.url.includes('/invitations')).pop();
  const rsvpCall = env.calls.filter(c => c.method === 'POST' && c.url.includes('/rsvp')).pop();
  cek('push berhasil', push.ok === true, JSON.stringify({ inv: push.invitations, rsvp: push.rsvps, warn: push.warning }));
  cek('undangan dikirim dengan on_conflict=slug', !!invCall && invCall.body.length >= 9);
  cek('kolom ringkas terisi (Adi/2026-12-14)', (() => {
    const r = invCall.body.find(x => x.slug === 'iceblue-adi-lina');
    return r && r.groom_name === 'Adi' && r.event_date === '2026-12-14' && r.payload && Array.isArray(r.payload.photos.gallery);
  })());
  cek('RSVP memakai nilai SQL & invitation_slug', rsvpCall.body.every(r => ['hadir','tidak_hadir','ragu'].includes(r.attendance) && typeof r.invitation_slug === 'string'));

  console.log('\n== E. Undangan read-only (ditolak cloud) → RSVP tetap terkirim ==');
  env = makeEnv({ enabled: true, url: 'https://demo.supabase.co', anonKey: 'sb_publishable_OK', tables: {} }, [
    { match: 'https://demo.supabase.co/rest/v1/invitations', ok: false, body: { message: 'violates row-level security policy' } },
    { match: 'https://demo.supabase.co/rest/v1/rsvp', ok: true, body: [] }
  ]);
  const push2 = await env.backend.cloud.push(env.backend.getDb());
  cek('tetap sukses sebagian', push2.ok === true && push2.rsvps > 0);
  cek('ada catatan read-only', /read-only/.test(push2.warning || ''), push2.warning);

  console.log('\n== F. RSVP tamu dari halaman undangan ==');
  env = makeEnv({ enabled: true, url: 'https://demo.supabase.co', anonKey: 'sb_publishable_OK', tables: {} }, routes);
  const item = await env.backend.addRsvp({ invitationId: 'iceblue-adi-lina', name: 'Tamu Uji', status: 'Tidak Hadir', guests: 2, message: 'Maaf' });
  const post = env.calls.filter(c => c.method === 'POST' && c.url.includes('/rsvp')).pop();
  cek('RSVP tersimpan lokal', env.backend.getDb().rsvps.some(r => r.id === item.id));
  cek('RSVP terkirim ke Supabase (tidak_hadir)', !!post && post.body.some(r => r.external_id === item.id && r.attendance === 'tidak_hadir'));
  cek('kunci hanya di header apikey', post.headers.apikey === 'sb_publishable_OK' && !post.headers.Authorization);

  console.log('\n== G. Supabase mati → fallback REST API Server ==');
  env = makeEnv({ enabled: true, url: 'https://demo.supabase.co', anonKey: 'sb_publishable_OK', tables: {} }, [
    { match: 'https://demo.supabase.co/rest/v1/', ok: false, body: { message: 'gagal' } },
    { match: 'api/db', body: { ok: true, db: { version: '2.0.0',
      invitations: [{ id: 'dari-server', slug: 'dari-server', themeFile: 'undangan-iceblue.html', category: 'pernikahan', primaryName: 'Server', photos: { gallery: [] } }], rsvps: [] } } }
  ]);
  const fb = await env.backend.sync();
  cek('jatuh ke REST API Server', fb.mode === 'REST API Server', fb.mode);
  cek('data dari server tetap masuk', env.backend.getDb().invitations.some(i => i.id === 'dari-server'));

  console.log('\n== H. Uji lengkap dari Studio (cloud.selfTest) ==');
  const cfgAktif = { enabled: true, url: 'https://demo.supabase.co', anonKey: 'sb_publishable_OK', tables: {} };
  const ruteSehat = [
    { match: 'https://demo.supabase.co/rest/v1/invitations?select=slug,event_type,event_date', body: [
      { slug: 'iceblue-adi-lina', event_type: 'pernikahan', event_date: '2026-12-14' }] },
    { match: 'https://demo.supabase.co/rest/v1/rsvp?select=', body: [] },
    { match: 'https://demo.supabase.co/rest/v1/guests?select=', ok: false, status: 401, body: { code: '42501', message: 'permission denied for table guests' } },
    { match: 'https://demo.supabase.co/rest/v1/rsvp', method: 'POST', ok: false, status: 409, body: { code: '23503', message: 'insert or update violates foreign key constraint' } },
    { match: 'https://demo.supabase.co/rest/v1/guests', method: 'POST', ok: false, status: 409, body: { code: '23503', message: 'insert or update violates foreign key constraint' } },
    { match: 'https://demo.supabase.co/rest/v1/', body: [] }
  ];
  env = makeEnv(cfgAktif, ruteSehat);
  const uji = await env.backend.cloud.selfTest();
  const itemUji = nama => uji.bagian.reduce((a, b) => a.concat(b.items), []).find(i => i.nama === nama) || null;
  cek('selfTest selesai & melaporkan 5 bagian', uji.bagian.length === 5, uji.bagian.map(b => b.judul).join(' | '));
  cek('tanpa item gagal pada setup sehat', uji.gagal === 0, JSON.stringify(uji.bagian.map(b => b.items.filter(i => i.lulus === false).map(i => i.nama))));
  cek('izin kirim RSVP terverifikasi lewat kode 23503', (itemUji('tamu bisa mengirim RSVP dari browser') || {}).lulus === true);
  cek('nomor HP tamu dinyatakan aman (ditolak 401/42501)', (itemUji('daftar tamu TIDAK bisa dibaca dari browser') || {}).lulus === true);
  cek('undangan dinyatakan terkunci dari perubahan', (itemUji('undangan tidak bisa diubah dari browser') || {}).lulus === true);
  cek('penghapusan dilaporkan sebagai catatan (bukan klaim aman)', (itemUji('RSVP tidak bisa dihapus dari browser') || {}).lulus === null);
  cek('kunci hanya di header apikey (selfTest)', env.calls.every(c => !c.headers.Authorization && (c.headers.apikey === undefined || c.headers.apikey === 'sb_publishable_OK')));

  console.log('\n-- H2. Kondisi berbahaya harus TERDETEKSI (bukan lulus) --');
  const ruteBahaya = [
    { match: 'https://demo.supabase.co/rest/v1/invitations', method: 'PATCH', ok: true, status: 200, body: [{ slug: 'iceblue-adi-lina' }] },
    { match: 'https://demo.supabase.co/rest/v1/guests?select=', ok: true, status: 200, body: [{ id: 'g1', name: 'Budi', phone: '0812' }] },
    { match: 'https://demo.supabase.co/rest/v1/invitations?select=slug,event_type,event_date', body: [{ slug: 'iceblue-adi-lina', event_type: 'pernikahan', event_date: '2026-12-14' }] },
    { match: 'https://demo.supabase.co/rest/v1/rsvp?select=', body: [] },
    { match: 'https://demo.supabase.co/rest/v1/rsvp', method: 'POST', ok: false, status: 409, body: { code: '23503', message: 'violates foreign key constraint' } },
    { match: 'https://demo.supabase.co/rest/v1/guests', method: 'POST', ok: false, status: 409, body: { code: '23503', message: 'violates foreign key constraint' } },
    { match: 'https://demo.supabase.co/rest/v1/', body: [] }
  ];
  env = makeEnv(cfgAktif, ruteBahaya);
  const ujiBahaya = await env.backend.cloud.selfTest();
  const itemBahaya = nama => ujiBahaya.bagian.reduce((a, b) => a.concat(b.items), []).find(i => i.nama === nama) || null;
  cek('selfTest GAGAL saat nomor HP tamu terbaca publik', ujiBahaya.ok === false && (itemBahaya('daftar tamu TIDAK bisa dibaca dari browser') || {}).lulus === false);
  cek('selfTest GAGAL saat undangan bisa diubah publik', (itemBahaya('undangan tidak bisa diubah dari browser') || {}).lulus === false,
    (itemBahaya('undangan tidak bisa diubah dari browser') || {}).info);

  console.log('\n-- H3. Konfigurasi kosong → uji berhenti dengan pesan jelas --');
  env = makeEnv(CFG_KOSONG, ruteSehat);
  const ujiKosong = await env.backend.cloud.selfTest();
  cek('selfTest menolak berjalan & memberi petunjuk', ujiKosong.ok === false && /supabase-config\.json/.test(JSON.stringify(ujiKosong.bagian)));
  cek('tidak ada request ke Supabase saat config kosong', !env.calls.some(c => c.url.includes('supabase.co')));

  console.log('\n== RINGKASAN ==\nGAGAL: ' + gagal);
  process.exit(gagal ? 1 : 0);
})();
