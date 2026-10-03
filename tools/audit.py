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
import base64, glob, json, os, re, subprocess, sys, tomllib

os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
gagal, peringatan = [], []
def ok(m): print(f'  \u2713 {m}')
def bad(m): print(f'  \u2717 {m}'); gagal.append(m)
def warn(m): print(f'  ! {m}'); peringatan.append(m)

TEMPLATES = ['undangan-sage.html','undangan-jawa.html','undangan-demo.html','undangan-khitanan.html',
             'undangan-ultah.html','undangan-premium.html','undangan-iceblue.html',
             'undangan-iceblue-khitanan.html','undangan-iceblue-ultah.html']
NEW = TEMPLATES[-3:]
PAGES = ['index.html','landing.html','studio.html'] + TEMPLATES
BANNED = ['6281234567890','6282128718485','0812-3456-7890']
sc = lambda h: re.sub(r'<!--.*?-->', '', h, flags=re.S)
scripts = lambda h: re.findall(r'<script(?![^>]*\bsrc=)[^>]*>(.*?)</script>', sc(h), re.S)
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
ok(f'{len(ids_json)} undangan') if len(ids_json) == 9 else bad(f'{len(ids_json)} undangan (harus 9)')
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
    ok(f'{nm}: "9 Tema"') if '9 Tema' in h else bad(f'{nm}: badge bukan 9')
for t in NEW: ok(f'studio.html: opsi {t}') if t in st else bad(f'studio.html: opsi {t} hilang')
ok('studio.html: "Semua Tema (9)"') if 'Semua Tema (9)' in st else bad('studio.html: jumlah tema bukan 9')

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

for hook in ['cloudApi','pullFromCloud','pushAllToCloud','pushGuestsToCloud','cloudKeyInfo','sb_publishable_','read-only']:
    ok(f'studio-api.js: {hook}') if hook in js else bad(f'studio-api.js tidak memuat {hook}')
ok('tamu tidak dibaca dari browser') if 'guests_public' not in js else bad('studio-api.js masih membaca view guests_public')
for hook in ['cloudTestBtn','cloudPushBtn','cloudPullBtn','cloudStatusText']:
    ok(f'studio.html: {hook}') if hook in st else bad(f'studio.html tidak memuat {hook}')
ok('tools/check-cloud.js ada (pemeriksa koneksi project asli)') if os.path.exists('tools/check-cloud.js') else warn('tools/check-cloud.js tidak ada')
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
