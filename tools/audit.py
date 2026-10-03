#!/usr/bin/env python3
"""
Pemeriksa kualitas repo Kartu Digital.

Cara pakai:
    cd /home/user/Rahmad-
    python3 tools/audit.py

Memeriksa 9 bagian: syntax JS/JSON, struktur HTML, link lokal, registrasi tema di
Studio, hook tema baru, katalog, aturan nomor WhatsApp & link Studio, footer/meta,
serta integrasi Supabase (schema.sql, migrasi, config.toml, panduan).
"""
import base64, glob, json, os, re, subprocess, sys, tomllib, xml.dom.minidom

os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
gagal, peringatan = [], []
def ok(m): print(f'  \u2713 {m}')
def bad(m): print(f'  \u2717 {m}'); gagal.append(m)
def warn(m): print(f'  ! {m}'); peringatan.append(m)

TEMPLATES = ['undangan-sage.html','undangan-jawa.html','undangan-demo.html','undangan-khitanan.html',
             'undangan-ultah.html','undangan-premium.html','undangan-iceblue.html',
             'undangan-iceblue-khitanan.html','undangan-iceblue-ultah.html',
             'undangan-midnight.html','undangan-aqiqah.html','undangan-wisuda.html','undangan-platinum.html']
NEW = TEMPLATES[-4:]
PAGES = ['index.html','landing.html','studio.html'] + TEMPLATES
BANNED = ['6281234567890','6282128718485','0812-3456-7890']
sc = lambda h: re.sub(r'<!--.*?-->', '', h, flags=re.S)
# Hanya blok JavaScript: data terstruktur (application/ld+json) dilewati.
scripts = lambda h: re.findall(r'<script(?![^>]*\bsrc=)(?![^>]*application/ld\+json)[^>]*>(.*?)</script>', sc(h), re.S)
rd = lambda f: open(f, encoding='utf-8').read()

print('\n== 1. Syntax: JS & JSON ==')
for f in ['server.js','studio-api.js']:
    r = subprocess.run(['node','--check',f], capture_output=True, text=True)
    ok(f'{f} OK') if r.returncode == 0 else bad(f'{f}: {r.stderr.strip().splitlines()[-1]}')
for f in sorted(glob.glob('tools/*.js')):
    r = subprocess.run(['node','--check',f], capture_output=True, text=True)
    ok(f'{f} OK') if r.returncode == 0 else bad(f'{f}: {r.stderr.strip().splitlines()[-1]}')
for f in PAGES:
    tmp = f'/tmp/_audit_{f}.js'
    open(tmp,'w',encoding='utf-8').write('\n;\n'.join(scripts(rd(f))))
    r = subprocess.run(['node','--check',tmp], capture_output=True, text=True)
    ok(f'{f}: JS inline OK') if r.returncode == 0 else bad(f'{f}: JS error \u2192 {r.stderr.strip().splitlines()[-1]}')
for f in ['package.json','data/studio-db.json','supabase-config.json']:
    try: json.loads(rd(f)); ok(f'{f} JSON valid')
    except Exception as e: bad(f'{f}: {e}')

print('\n== 2. Struktur tag HTML ==')
VOID = {'meta','link','br','hr','img','input','source','area','base','col','embed','param','track','wbr'}
for f in PAGES:
    h = sc(rd(f)); stack, err = [], None
    for close, name, attrs, selfc in re.findall(r'<(/?)([a-zA-Z][a-zA-Z0-9]*)([^>]*?)(/?)>', h):
        n = name.lower()
        if n in VOID or selfc == '/' or n == '!doctype': continue
        if close:
            if stack and stack[-1] == n: stack.pop()
            else: err = f'</{n}> tidak cocok'; break
        else: stack.append(n)
    if err: bad(f'{f}: {err}')
    elif stack: bad(f'{f}: belum ditutup: {stack[:3]}')
    else: ok(f'{f}: tag seimbang')

print('\n== 3. Link lokal & template ==')
miss = []
for f in PAGES:
    for href in re.findall(r'(?:href|src)="([^"]+)"', sc(rd(f))):
        if href.startswith(('http','mailto:','tel:','#','data:','//')): continue
        p = href.split('?')[0].split('#')[0]
        if not re.fullmatch(r'[A-Za-z0-9_][A-Za-z0-9_./\-]*\.(html|htm|jpg|jpeg|png|webp|gif|svg|css|js|mp3|ico|json)', p): continue
        if not os.path.exists(p): miss.append(f'{f} \u2192 {href}')
[bad(f'link hilang: {m}') for m in miss] if miss else ok('tidak ada link lokal yang hilang')
for f in TEMPLATES: ok(f'{f} ada ({os.path.getsize(f)//1024} KB)')

print('\n== 4. Registrasi tema di Backend Studio ==')
db = json.loads(rd('data/studio-db.json')); js = rd('studio-api.js')
ids_js = re.findall(r"\n        id: '([^']+)',\n        slug: '[^']+',", js)
ids_json = [i['id'] for i in db['invitations']]
ok(f'{len(ids_json)} undangan') if len(ids_json) == 13 else bad(f'{len(ids_json)} undangan (harus 13)')
ok('id undangan JSON == JS') if ids_js == ids_json else bad(f'id beda: {ids_js} vs {ids_json}')
rj = re.findall(r"^\s+id: '(rsvp-\d+)',$", js, re.M); rj2 = [r['id'] for r in db['rsvps']]
ij = re.findall(r"^\s+invitationId: '([^']+)',$", js, re.M); ij2 = [r['invitationId'] for r in db['rsvps']]
ok(f'rsvp JS == JSON ({len(rj2)} data)') if (rj == rj2 and ij == ij2) else bad('rsvp tidak sinkron')
prob = []
for i in db['invitations']:
    if not os.path.exists(i['themeFile']): prob.append(i['themeFile'])
    for p in [i['photos']['cover']] + i['photos']['gallery']:
        if not os.path.exists(p): prob.append(p)
[bad(f'file hilang: {p}') for p in prob] if prob else ok('semua themeFile & foto tersedia')
wa = sorted({i['amplop']['whatsappConfirm'] for i in db['invitations']})
ok(f'whatsappConfirm = {wa}') if wa == ['6285196755675'] else bad(f'whatsappConfirm tidak standar: {wa}')

print('\n== 5. Tema baru terhubung Studio ==')
for f in NEW:
    h = sc(rd(f))
    m = re.search(r"hydrateInvitationPage\('([^']+)'\)", h)
    ok(f'{f}: hydrate({m.group(1)})') if m and any(i['id'] == m.group(1) for i in db['invitations']) else bad(f'{f}: hydrate id tidak terdaftar')
    nb = len(re.findall(r'data-studio(?:-href|-img)?="', h))
    ok(f'{f}: {nb} binding data-studio') if nb >= 8 else bad(f'{f}: binding cuma {nb}')
    need = ['studioAmplopList','studioAmplopWa','rsvpForm','rName','rCount','rsvpMsg','wishList','studioRsvpDeadline']
    kurang = [n for n in need if f'id="{n}"' not in h]
    ok(f'{f}: elemen amplop & RSVP lengkap') if not kurang else bad(f'{f}: kurang {kurang}')
    ok(f'{f}: studio-api.js dimuat') if 'studio-api.js' in h else bad(f'{f}: studio-api.js tidak dimuat')
    used = set(re.findall(r"getElementById\('([^']+)'\)", h))
    hil = [i for i in used if f'id="{i}"' not in h]
    ok(f'{f}: semua {len(used)} id JS ada di HTML') if not hil else bad(f'{f}: id tanpa elemen {hil}')

print('\n== 6. Katalog & studio ==')
idx, land, st = rd('index.html'), rd('landing.html'), rd('studio.html')
ok('index.html == landing.html') if idx == land else bad('index.html != landing.html')
for nm, h in [('index.html', idx), ('landing.html', land)]:
    for t in NEW: ok(f'{nm} \u2192 {t}') if t in h else bad(f'{nm}: tidak menautkan {t}')
    ok(f'{nm}: "13 Tema"') if '13 Tema' in h else bad(f'{nm}: badge bukan 13')
for t in NEW: ok(f'studio.html: opsi {t}') if t in st else bad(f'studio.html: opsi {t} hilang')
ok('studio.html: "Semua Tema (13)"') if 'Semua Tema (13)' in st else bad('studio.html: jumlah tema bukan 13')

print('\n== 7. Aturan nomor WA, link Studio, nama lama ==')
alld = {f: rd(f) for f in PAGES}
hit = [f for f, h in alld.items() if any(b in h for b in BANNED)]
[bad(f'nomor lama di {f}') for f in hit] if hit else ok('tidak ada nomor WhatsApp lama')
pub = [f for f in PAGES if f != 'studio.html']
ls = [f for f in pub if re.search(r'href="[^"]*studio\.html', alld[f])]
[bad(f'link studio.html di {f}') for f in ls] if ls else ok(f'{len(pub)} halaman publik bersih dari link studio.html')
ok('studio.html tetap ada') if os.path.exists('studio.html') else bad('studio.html hilang')
sr = [f for f in PAGES if 'rahmad' in alld[f].lower()]
[bad(f'"Rahmad" masih ada di {f}') for f in sr] if sr else ok('tidak ada sisa nama lama "Rahmad"')

print('\n== 8. Footer & meta tema baru ==')
for f in NEW:
    h = rd(f)
    uji = [('credit Kartu Digital', 'Kartu Digital (kartudigital.my.id)' in h),
           ('nomor 0851-9675-5675', '0851-9675-5675' in h),
           ('Pesan Undangan \u2192 index.html', re.search(r'Pesan Undangan[\s\S]{0,160}index\.html|href="index\.html"[\s\S]{0,160}Pesan Undangan', h) is not None),
           ('og:title/desc/image', all(x in h for x in ['og:title','og:description','og:image'])),
           ('favicon', 'rel="icon"' in h or 'rel="shortcut icon"' in h),
           ('wa.me/6285196755675', 'wa.me/6285196755675' in h)]
    [ok(f'{f}: {n}') if c else bad(f'{f}: {n} TIDAK ADA') for n, c in uji]

print('\n== 8b. SEO: sitemap, robots, data terstruktur ==')
ada_sitemap = os.path.exists('sitemap.xml')
ada_robots = os.path.exists('robots.txt')
ok('sitemap.xml tersedia') if ada_sitemap else bad('sitemap.xml TIDAK ADA')
ok('robots.txt tersedia') if ada_robots else bad('robots.txt TIDAK ADA')
if ada_sitemap:
    sm = rd('sitemap.xml')
    try: xml.dom.minidom.parseString(sm); ok('sitemap.xml XML valid')
    except Exception as e: bad('sitemap.xml tidak valid: %s' % e)
    url_sitemap = re.findall(r'<loc>(.*?)</loc>', sm)
    ok('sitemap memuat 14 URL (beranda + 13 tema)') if len(url_sitemap) == 14 else bad('sitemap memuat %d URL' % len(url_sitemap))
    kurang = [f for f in TEMPLATES if not any(u.endswith(f) for u in url_sitemap)]
    ok('semua 13 tema ada di sitemap') if not kurang else bad('tema belum masuk sitemap: %s' % ', '.join(kurang))
if ada_robots:
    rb = rd('robots.txt')
    ok('robots.txt menunjuk sitemap') if 'Sitemap:' in rb and 'sitemap.xml' in rb else bad('robots.txt tanpa baris Sitemap')
    ok('robots.txt menutup studio admin') if 'Disallow: /studio.html' in rb else bad('robots.txt belum menutup /studio.html')
for f in ['index.html', 'landing.html']:
    h = rd(f)
    m = re.search(r'<script type="application/ld\+json">\s*(.*?)\s*</script>', h, re.S)
    if not m:
        bad(f'{f}: data terstruktur JSON-LD tidak ada'); continue
    try:
        ld = json.loads(m.group(1))
        graf = ld.get('@graph', [])
        tipe = [x.get('@type') for x in graf]
        datar = [t if isinstance(t, str) else '/'.join(t) for t in tipe]
        ok(f'{f}: JSON-LD valid ({", ".join(datar)})')
        ok(f'{f}: memuat LocalBusiness + FAQPage') if any('LocalBusiness' in d for d in datar) and 'FAQPage' in datar else bad(f'{f}: JSON-LD belum memuat LocalBusiness & FAQPage')
        il = [x for x in graf if x.get('@type') == 'ItemList']
        ok(f'{f}: ItemList katalog 13 tema') if il and il[0].get('numberOfItems') == 13 and len(il[0].get('itemListElement', [])) == 13 else bad(f'{f}: ItemList katalog tidak lengkap')
    except Exception as e:
        bad(f'{f}: JSON-LD tidak bisa dibaca: {e}')

tema_kanonikal = [f for f in TEMPLATES if 'rel="canonical"' not in rd(f)]
ok('13 tema punya tautan kanonikal') if not tema_kanonikal else bad('tanpa kanonikal: %s' % ', '.join(tema_kanonikal))
tema_ld, tema_ld_rusak = [], []
for f in TEMPLATES:
    m = re.search(r'<script type="application/ld\+json">\s*(.*?)\s*</script>', rd(f), re.S)
    if not m:
        tema_ld.append(f); continue
    try:
        ld = json.loads(m.group(1))
        if ld.get('@type') == 'Event' and ld.get('startDate') and (ld.get('location') or {}).get('name'):
            tema_ld_rusak.append('')  # penanda lolos
        else:
            tema_ld_rusak.append(f)
    except Exception:
        tema_ld_rusak.append(f)
ok('13 tema punya JSON-LD Event lengkap') if not tema_ld and not any(tema_ld_rusak) else bad('JSON-LD Event bermasalah: %s' % ', '.join([x for x in tema_ld + tema_ld_rusak if x]))

print('\n== 8c. Fitur nilai jual: QR check-in, kalender, notifikasi WA, paket ==')
ok('vendor/qrcode.js tersedia (pustaka QR)') if os.path.exists('vendor/qrcode.js') else bad('vendor/qrcode.js TIDAK ADA')
vendor_ok = re.search(r'QR Code Generator for JavaScript', rd('vendor/qrcode.js')) is not None and 'MIT' in rd('vendor/qrcode.js')
ok('pustaka QR memuat lisensi MIT') if vendor_ok else bad('header lisensi pustaka QR hilang')
tema_qr = [f for f in TEMPLATES if 'vendor/qrcode.js' not in rd(f)]
ok('13 tema memuat vendor/qrcode.js') if not tema_qr else bad('tanpa vendor/qrcode.js: %s' % ', '.join(tema_qr))
api = rd('studio-api.js')
for nama, syarat in [('kodeCheckin', 'function kodeCheckin'),
                     ('terapkanCheckIn', 'function terapkanCheckIn'),
                     ('terapkanKalender (.ics)', 'function terapkanKalender'),
                     ('notifikasi RSVP ke WA admin', 'function tampilkanNotifikasiWa')]:
    ok('studio-api/Studio: %s' % nama) if syarat in api else bad('tidak ditemukan: %s' % syarat)
studio = rd('studio.html')
ok('Studio punya opsi QR Check-In') if 'id="fCheckin"' in studio else bad('Studio tanpa opsi QR Check-In')
ok('Studio menyimpan pilihan QR Check-In') if 'inv.checkin' in studio else bad('Studio tidak menyimpan pilihan QR Check-In')
for f in ['index.html', 'landing.html']:
    h = rd(f)
    ok('%s: paket spesial Aqiqah & Wisuda' % f) if 'paket-spesial' in h and 'Rp69.000' in h else bad('%s: paket spesial Aqiqah/Wisuda tidak ada' % f)

print('\n== 8d. Mode navigasi tamu (Gulir/Snap/Slide + premium) ==')
nav_ok = os.path.exists('vendor/nav-mode.js')
ok('vendor/nav-mode.js tersedia (mesin navigasi bersama)') if nav_ok else bad('vendor/nav-mode.js TIDAK ADA')
if nav_ok:
    nav = rd('vendor/nav-mode.js')
    ok('memuat 9 mode navigasi') if all("'%s'" % m in nav for m in ['scroll','snap','slide','fade','flip','zoom','up','cube','blur']) else bad('mode navigasi belum lengkap')
    ok('setMode membersihkan seluruh kelas mode (bug kelas bocor)') if 'MODES.forEach' in nav and "classList.remove('mode-' + m)" in nav else bad('setMode tidak membersihkan semua kelas mode')
    ok('menerapkan navMode tersimpan lewat window.setMode') if 'window.setMode = function' in nav else bad('window.setMode tidak ada')
tanpa_mesin = []
for f in TEMPLATES:
    h = rd(f)
    if 'vendor/nav-mode.js' not in h and 'function setMode(' not in h:
        tanpa_mesin.append(f)
ok('13 tema punya mesin navigasi (bawaan atau vendor/nav-mode.js)') if not tanpa_mesin else bad('tanpa mesin navigasi: %s' % ', '.join(tanpa_mesin))
for f in ['undangan-sage.html', 'undangan-jawa.html']:
    h = rd(f)
    pembersih = re.search(r'setMode\(mode\)\{[\s\S]{0,400}?validModes\.forEach', h)
    ok('%s: setMode membersihkan semua kelas mode' % f) if pembersih else bad('%s: pembersihan kelas mode lama (up/cube/blur) belum lengkap' % f)
api_nav = rd('studio-api.js')
ok('studio-api.js menerapkan navMode dari Studio') if 'window.setMode(inv.navMode)' in api_nav else bad('studio-api.js tidak menerapkan navMode tersimpan')
ok('link ?mode= tetap menang atas navMode tersimpan') if 'var modeLink = new URLSearchParams' in api_nav else bad('pemeriksaan ?mode= tidak ada')

print('\n== 8e. Studio: koleksi per kategori/tanggal/status & pemeriksaan admin ==')
for hook, nama in [('id="collectionView"', 'pemilih pengelompokan koleksi (kategori/tanggal/status)'),
                   ('data-view="tanggal"', 'opsi kelompok tanggal acara'),
                   ('data-view="status"', 'opsi kelompok status pemeriksaan'),
                   ('id="koleksiRingkas"', 'ringkasan koleksi (disetujui/menunggu/revisi)'),
                   ('id="tab-periksa"', 'tab Pemeriksaan'),
                   ('id="periksaList"', 'daftar periksa kelengkapan'),
                   ('id="fReviewStatus"', 'pilihan status pemeriksaan admin'),
                   ('id="fReviewNote"', 'catatan admin'),
                   ('id="hasilPreviewFrame"', 'pratinjau hasil undangan (iframe)'),
                   ('id="hasilPreviewBtn"', 'tombol Tampilkan Hasil Undangan')]:
    ok(f'{nama} ada') if hook in st else bad(f'{nama} tidak ada')
for fn in ['function periksaKelengkapan', 'periksaKelengkapan: periksaKelengkapan',
           'function renderPemeriksaan', 'function muatHasilUndangan', 'function kelompokKoleksi']:
    ok('studio-api/studio.html: %s' % fn) if (fn in rd('studio-api.js') or fn in st) else bad('%s tidak ditemukan' % fn)
for sumber, isi in [('studio-api.js', api if False else rd('studio-api.js')), ('data/studio-db.json', rd('data/studio-db.json'))]:
    kurang = isi.count('reviewStatus')
    ok('%s memuat reviewStatus (%d undangan)' % (sumber, kurang)) if kurang >= 13 else warn('%s: reviewStatus baru %d' % (sumber, kurang))
for st_key in ['revisi', 'menunggu', 'disetujui']:
    ok('DEFAULT_DB memuat status "%s"' % st_key) if "reviewStatus: '%s'" % st_key in rd('studio-api.js') else bad('status "%s" tidak ada di seed bawaan' % st_key)

print('\n== 8f. Koneksi WhatsApp (gateway opsional + link gratis) ==')
ok('wa-config.example.json tersedia') if os.path.exists('wa-config.example.json') else bad('wa-config.example.json TIDAK ADA')
if os.path.exists('wa-config.example.json'):
    try:
        contoh = json.loads(rd('wa-config.example.json'))
        ok('contoh konfigurasi memuat provider/token/admin') if all(k in contoh for k in ['provider', 'token', 'adminWhatsapp']) else bad('contoh konfigurasi kurang lengkap')
        ok('contoh konfigurasi default nonaktif (aman)') if contoh.get('enabled') is False else warn('contoh konfigurasi tidak diawali enabled:false')
    except Exception as e:
        bad('wa-config.example.json tidak bisa dibaca: %s' % e)
gi = rd('.gitignore')
ok('wa-config.json tidak ikut ter-commit') if 'wa-config.json' in gi else bad('wa-config.json belum masuk .gitignore')
ok('log pengiriman WhatsApp diabaikan git') if 'wa-log.json' in gi else warn('data/wa-log.json belum diabaikan')
srv = rd('server.js')
for nama, pola in [('normalisasi nomor Indonesia', 'function normalisasiNomor'),
                   ('gateway Fonnte', "provider === 'fonnte'"),
                   ('gateway Wablas', "provider === 'wablas'"),
                   ('gateway Whacenter', "provider === 'whacenter'"),
                   ('provider custom (apiUrl sendiri)', 'provider "custom" butuh apiUrl'),
                   ('endpoint status /api/wa', "pathname === '/api/wa' && req.method === 'GET'"),
                   ('endpoint kirim /api/wa/kirim', "pathname === '/api/wa/kirim'"),
                   ('endpoint uji /api/wa/uji', "pathname === '/api/wa/uji'"),
                   ('endpoint pengaturan /api/wa/pengaturan', "pathname === '/api/wa/pengaturan'"),
                   ('notifikasi RSVP otomatis ke admin', 'notifyAdminOnRsvp'),
                   ('token disamarkan untuk browser', 'tokenSamar')]:
    ok('server.js: %s' % nama) if pola in srv else bad('server.js tidak memuat %s' % nama)
ok('token TIDAK pernah dikirim utuh ke browser') if 'tokenSamar' in srv and 'token: cfg.token' not in srv else bad('periksa pengiriman token ke browser')
st = rd('studio.html')
for hook, nama in [('id="card-wa"', 'panel Koneksi WhatsApp'),
                   ('id="waKirimBtn"', 'tombol kirim link undangan ke tamu'),
                   ('id="waUjiBtn"', 'tombol uji koneksi'),
                   ('id="waTemplate"', 'template pesan undangan'),
                   ('id="waAdminNumber"', 'nomor admin WhatsApp'),
                   ('id="waAutoRsvp"', 'saklar notifikasi RSVP otomatis'),
                   ('id="bulkSendAllBtn"', 'tombol kirim massal via gateway'),
                   ('bulk-phone', 'kolom nomor tamu di generator massal')]:
    ok('%s ada' % nama) if hook in st else bad('%s tidak ada' % nama)
api = rd('studio-api.js')
for pola, nama in [('waApi', 'objek StudioBackend.wa'), ('function waTautan', 'pembuat tautan wa.me'),
                   ('function waKirim', 'pengirim lewat server'), ('function waBersihkanNomor', 'normalisasi nomor di browser')]:
    ok('studio-api.js: %s' % nama) if pola in api else bad('studio-api.js tidak memuat %s' % nama)

print('\n== 8g. Dokumen format link undangan ==')
if os.path.exists('docs/format-link-undangan.md'):
    dok = rd('docs/format-link-undangan.md')
    ok('dokumen format link undangan tersedia') if 'https://<domain>/<berkas-tema>.html' in dok else bad('dokumen tidak memuat format dasar')
    for pola, nama in [('wa.me', 'format link WhatsApp'), ('checkin=KD-XXXXXX', 'format QR check-in'),
                       ('calendar.google.com', 'format Google Calendar'), ('?id=', 'penjelasan parameter id'),
                       ('window.location.origin', 'penjelasan asal domain')]:
        ok('dokumen: %s dijelaskan' % nama) if pola in dok else bad('dokumen tidak menjelaskan %s' % nama)
    ok('README menautkan dokumen format link') if 'docs/format-link-undangan.md' in rd('README.md') else bad('README belum menautkan dokumen')
    tema = ['undangan-sage.html', 'undangan-jawa.html', 'undangan-demo.html', 'undangan-iceblue.html',
            'undangan-midnight.html', 'undangan-khitanan.html', 'undangan-iceblue-khitanan.html',
            'undangan-ultah.html', 'undangan-iceblue-ultah.html', 'undangan-aqiqah.html',
            'undangan-wisuda.html', 'undangan-premium.html', 'undangan-platinum.html']
    kurang = [t for t in tema if t not in dok]
    ok('dokumen memuat 13 berkas tema') if not kurang else bad('tema belum ada di dokumen: %s' % ', '.join(kurang))
else:
    bad('docs/format-link-undangan.md TIDAK ADA')

api = rd('studio-api.js')
ok('tautanUndanganSaatIni dipakai untuk QR/kalender/RSVP') if api.count('tautanUndanganSaatIni(') >= 4 else bad('helper tautanUndanganSaatIni belum dipakai menyeluruh')
ok('nomor admin WhatsApp dibaca dari pengaturan Studio') if 'function nomorAdminWa' in api else bad('nomor admin masih dipatok di kode')
ok('QR check-in memuat id undangan (bukan tema bawaan saja)') if "setAttribute('data-checkin-url'" in api else warn('QR check-in tidak menyimpan tautan untuk diperiksa')

print('\n== 9. Supabase: skema, migrasi, integrasi GitHub ==')
cfg = json.loads(rd('supabase-config.json'))
kunci = str(cfg.get('anonKey') or cfg.get('publishableKey') or '')
if kunci.startswith('sb_secret_'): bad('SECRET key di supabase-config.json!')
elif cfg.get('enabled') is False and not cfg.get('url'): ok('config default nonaktif (aman)')
else: ok('config Supabase terisi')
sql_penuh = rd('supabase/schema.sql')
sql = '\n'.join(l for l in sql_penuh.splitlines() if not l.strip().startswith('--'))  # abaikan komentar
for n in ['invitations','guests','rsvp','row level security','search_path','security invoker','drop view if exists public.guests_public']:
    ok(f'schema: {n}') if n in (sql_penuh.lower()) else bad(f'schema tidak memuat {n}')
ok('tidak ada view publik (temuan CRITICAL hilang)') if 'create view' not in sql_penuh.lower() else bad('masih membuat view publik')
pol_inv = re.findall(r'create policy\s+"[^"]+"\s+on invitations\s+for\s+(insert|update|delete)', sql)
ok('undangan read-only di cloud') if not pol_inv else bad(f'kebijakan tulis undangan: {pol_inv}')
pol_rsvp = sorted(re.findall(r'create policy\s+"[^"]+"\s+on rsvp\s+for\s+(\w+)', sql))
ok('rsvp hanya insert + select') if pol_rsvp == ['insert','select'] else bad('kebijakan rsvp: ' + str(pol_rsvp))
pol_g = re.findall(r'create policy\s+"[^"]+"\s+on guests\s+for\s+(\w+)', sql)
ok('guests hanya insert') if pol_g == ['insert'] else bad('kebijakan guests: ' + str(pol_g))
ok('schema kurung seimbang') if sql_penuh.count('(') == sql_penuh.count(')') else bad('kurung tidak seimbang')
ok('tidak ada nama lama "Bapak Rahmad"') if 'Bapak Rahmad' not in sql_penuh else bad('schema masih pakai nama lama')
ok('tidak ada CDN Pixabay') if 'cdn.pixabay.com' not in sql_penuh else bad('masih ada CDN musik')

ok('supabase/config.toml ada') if os.path.exists('supabase/config.toml') else bad('supabase/config.toml tidak ada')
if os.path.exists('supabase/config.toml'):
    try:
        t = tomllib.load(open('supabase/config.toml','rb'))
        ok('config.toml valid TOML')
        ok('config.toml project_id = kartu-digital') if t.get('project_id') == 'kartu-digital' else warn('project_id: ' + str(t.get('project_id')))
        ok('config.toml auth.site_url = kartudigital.my.id') if t.get('auth',{}).get('site_url') == 'https://kartudigital.my.id' else warn('auth.site_url: ' + str(t.get('auth',{}).get('site_url')))
    except Exception as e: bad('config.toml bukan TOML valid: ' + str(e))
mig = sorted(glob.glob('supabase/migrations/*.sql'))
ok(f'folder migrations berisi {len(mig)} migrasi') if mig else bad('supabase/migrations kosong')
if mig:
    nama = os.path.basename(mig[-1])
    ok('nama migrasi ber-timestamp: ' + nama) if re.match(r'^\d{14}_[a-z0-9_]+\.sql$', nama) else bad('nama migrasi tidak standar: ' + nama)
    ok('migrasi byte-identical dengan schema.sql') if rd(mig[-1]) == rd('supabase/schema.sql') else bad('isi migrasi berbeda dari schema.sql')
ok('supabase/.gitignore ada') if os.path.exists('supabase/.gitignore') else warn('supabase/.gitignore tidak ada')

for hook in ['cloudApi','pullFromCloud','pushAllToCloud','pushGuestsToCloud','cloudKeyInfo','sb_publishable_','read-only','selfTest']:
    ok(f'studio-api.js: {hook}') if hook in js else bad(f'studio-api.js tidak memuat {hook}')
ok('tamu tidak dibaca dari browser') if 'guests_public' not in js else bad('studio-api.js masih membaca view guests_public')
ok('selfTest memakai uji foreign key (tanpa menyimpan data)') if "'23503'" in js else warn('selfTest tidak memakai uji foreign key')
ok('selfTest jujur soal penghapusan RLS') if 'tidak bisa dipastikan dari luar' in js else warn('selfTest tidak menjelaskan keterbatasan uji hapus')
for hook in ['cloudTestBtn','cloudSelfTestBtn','cloudSelfTestBox','renderSelfTest','cloudPushBtn','cloudPullBtn','cloudStatusText']:
    ok(f'studio.html: {hook}') if hook in st else bad(f'studio.html tidak memuat {hook}')
ok('tools/check-cloud.js ada (pemeriksa koneksi project asli)') if os.path.exists('tools/check-cloud.js') else warn('tools/check-cloud.js tidak ada')
if os.path.exists('tools/ui-test.js'):
    ok('tools/ui-test.js ada (uji UI jsdom)')
    ui = rd('tools/ui-test.js')
    ok('uji UI memuat halaman undangan baru') if all(t in ui for t in ['undangan-midnight.html','undangan-aqiqah.html','undangan-wisuda.html','undangan-platinum.html']) else bad('uji UI belum memuat 4 tema baru')
    ok('uji UI memakai port uji sendiri (tidak bentrok server dev)') if 'UI_TEST_PORT' in ui else warn('uji UI tidak menyediakan UI_TEST_PORT')
    cek_pkg = json.loads(rd('package.json'))
    ok('package.json menyediakan skrip test:ui') if 'test:ui' in (cek_pkg.get('scripts') or {}) else warn('package.json belum punya skrip test:ui')
    ok('jsdom terdaftar sebagai devDependency') if 'jsdom' in (cek_pkg.get('devDependencies') or {}) else warn('jsdom belum terdaftar di devDependencies')
else:
    warn('tools/ui-test.js tidak ada (uji UI dilewati)')
if os.path.exists('tools/check-cloud.js'):
    cc = rd('tools/check-cloud.js')
    ok('check-cloud.js menolak kunci rahasia') if 'sb_secret_' in cc else bad('check-cloud.js tidak memeriksa kunci rahasia')
    ok('check-cloud.js menguji privasi daftar tamu') if 'guests' in cc and 'PRIVAT' in cc else bad('check-cloud.js tidak menguji privasi tamu')
rmd = rd('supabase/README.md')
ok('panduan menyebut publishable key') if 'sb_publishable_' in rmd else warn('panduan belum menyebut publishable key')
ok('panduan memuat pemeriksa koneksi') if 'tools/check-cloud.js' in rmd else warn('panduan belum menyebut tools/check-cloud.js')
ok('panduan menjelaskan Security Advisor') if 'Security Advisor' in rmd else warn('panduan belum menjelaskan Security Advisor')
for kata in ['Connect GitHub', 'Deploy to production', 'npx supabase migration new', 'Working directory']:
    ok(f'panduan memuat "{kata}"') if kata in rmd else warn(f'panduan belum memuat "{kata}"')
ok('README utama menautkan panduan') if 'supabase/README.md' in rd('README.md') else warn('README utama belum menautkan')

print('\n== 10. Studio: struktur tampilan & id yang dipakai JS ==')
st_ids_used = set(re.findall(r"\$\('([^']+)'\)", st)) | set(re.findall(r"getElementById\('([^']+)'\)", st))
st_ids_have = set(re.findall(r'id="([^"]+)"', st))
st_hilang = sorted(i for i in st_ids_used if i not in st_ids_have)
ok(f'semua {len(st_ids_used)} id yang dipakai JS studio.html tersedia') if not st_hilang else bad(f'id hilang di studio.html: {st_hilang}')
tabs = re.findall(r'data-tab="([^"]+)"', st)
panes = re.findall(r'class="[^"]*tab-pane[^"]*" id="([^"]+)"', st)
ok(f'{len(tabs)} tab pil: ' + ', '.join(tabs)) if len(tabs) == 6 else bad(f'tab pil: {tabs}')
ok('setiap tab punya panel isi (cocok)') if sorted(tabs) == sorted(panes) else bad(f'tab vs panel beda: {tabs} vs {panes}')
for nama in ['Data Utama', 'Tema &amp; Visual', 'Galeri Foto', 'Lokasi &amp; Map', 'Fitur Ekstra', 'Pemeriksaan']:
    ok(f'label tab "{nama}" ada') if nama in st else bad(f'label tab {nama} hilang')
for cid in ['card-amplop', 'card-rsvp', 'card-share', 'card-storage']:
    ok(f'kartu {cid} ada di tab Fitur Ekstra') if f'id="{cid}"' in st else bad(f'{cid} hilang')
for hook, nama in [('class="actionbar"', 'bilah aksi bawah'),
                   ('id="sidebarBackdrop"', 'laci menu + latar gelap'),
                   ('id="stickySaveBtn"', 'tombol Simpan Perubahan'),
                   ('id="stickyShareBtn"', 'tombol Bagikan Link Tamu'),
                   ('class="chip"', 'label kecil di judul kartu')]:
    ok(f'{nama} ada') if hook in st else bad(f'{nama} tidak ada')
kolom_wajib = ['fCategory','fTitle','fStatus','fPrimaryName','fSecondaryName','fFullName1','fParents1','fFullName2','fParents2',
               'fEventDate','fAkadTime','fResepsiTime','fQuote','fThemeFile','fNavMode','fFxMode',
               'fVenueName','fVenueAddress','fMapsUrl','fAmplopEnabled','fAmplopWa','fGiftAddress','fAmplopNote',
               'fRsvpEnabled','fRsvpDeadline','fRsvpMaxGuests']
kolom_hilang = [k for k in kolom_wajib if f'id="{k}"' not in st]
ok(f'semua {len(kolom_wajib)} kolom isian tetap ada') if not kolom_hilang else bad(f'kolom hilang: {kolom_hilang}')

py = [f for f in os.listdir('.') if f.endswith('.py')] + sorted(glob.glob('tools/*.py'))
if py:
    r = subprocess.run([sys.executable,'-m','py_compile'] + py, capture_output=True, text=True)
    ok(f'py_compile OK ({len(py)} file .py)') if r.returncode == 0 else bad('py_compile gagal: ' + r.stderr.splitlines()[-1])
else: warn('tidak ada file .py — py_compile tidak berlaku')

print('\n== RINGKASAN ==')
print(f'GAGAL: {len(gagal)}')
for g in gagal: print(f'   \u2717 {g}')
print(f'PERINGATAN: {len(peringatan)}')
for p in peringatan: print(f'   ! {p}')
sys.exit(1 if gagal else 0)
