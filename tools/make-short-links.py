#!/usr/bin/env python3
"""
Membuat halaman pengalih link pendek untuk setiap undangan.

Cara pakai:
    python3 tools/make-short-links.py

Menghasilkan folder u/<slug>/index.html untuk tiap undangan di data/studio-db.json,
mis. folder u/rahma-dika/ → bisa dibuka lewat https://kartudigital.my.id/u/rahma-dika
dan otomatis mengalihkan ke halaman tema yang benar:

    /u/rahma-dika  →  /undangan-sage.html?id=sage-rahma-dika

Halaman pengalih ini:
- meneruskan parameter lain (?to=Nama+Tamu, ?mode=, ?fx=, ?checkin=) ke undangan;
- memuat judul, deskripsi, dan gambar pratinjau (og:*) supaya rapi saat dibagikan di WhatsApp;
- memakai canonical + noindex supaya tidak dianggap duplikat oleh mesin pencari.

Jalankan ulang setiap kali ada undangan baru, lalu unggah/commit folder u/.
Server Node (server.js) juga sudah punya rute /u/<slug> sendiri, jadi link pendek
tetap jalan walau folder ini belum dibuat.
"""
import json, os, re, shutil, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

DB_PATH = os.environ.get('STUDIO_DB', 'data/studio-db.json')
OUT_DIR = 'u'
MARKER = 'dibuat otomatis oleh tools/make-short-links.py'

BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
         'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
KATEGORI_SATU_NAMA = ['khitanan', 'ultah', 'aqiqah', 'wisuda']


def esc(teks):
    return (str(teks or '')
            .replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
            .replace('"', '&quot;'))


def nama_acara(inv):
    if inv.get('secondaryName') and inv.get('category') not in KATEGORI_SATU_NAMA:
        return '%s & %s' % (inv.get('primaryName', ''), inv.get('secondaryName', ''))
    return inv.get('primaryName') or inv.get('title') or inv.get('theme') or 'Undangan Digital'


def tanggal_indonesia(iso):
    m = re.match(r'^(\d{4})-(\d{2})-(\d{2})$', str(iso or ''))
    if not m:
        return ''
    return '%d %s %s' % (int(m.group(3)), BULAN[int(m.group(2)) - 1], m.group(1))


def slug_dari(inv):
    slug = str(inv.get('slug') or inv.get('id') or '').strip().lower()
    return re.sub(r'[^a-z0-9-]+', '-', slug).strip('-')


def halaman(inv, domain, brand):
    slug = slug_dari(inv)
    tema = inv.get('themeFile') or ('undangan-%s.html' % inv.get('category', 'sage'))
    tujuan_relatif = '../../%s?id=%s' % (tema, inv.get('id', slug))
    tujuan = 'https://%s/%s?id=%s' % (domain, tema, inv.get('id', slug))
    acara_asli = nama_acara(inv)
    acara = esc(acara_asli)
    tanggal = tanggal_indonesia(inv.get('eventDate'))
    lokasi = esc(inv.get('venueName') or '')
    keterangan = ' '.join([b for b in [tanggal, ('di ' + lokasi) if lokasi else ''] if b])
    cover = ((inv.get('photos') or {}).get('cover') or 'foto-cover.jpg').lstrip('/')
    gambar = 'https://%s/%s' % (domain, cover)
    deskripsi = ('Undangan digital %s%s. Buka undangan lengkap: galeri, lokasi, RSVP, dan '
                 'simpan ke kalender.' % (acara_asli, (' — ' + keterangan) if keterangan else ''))
    return '''<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<!-- {marker} — jangan diedit manual, jalankan ulang skripnya bila ada perubahan -->
<title>Undangan {acara} — {brand}</title>
<link rel="canonical" href="{tujuan}">
<meta name="robots" content="noindex,follow">
<meta http-equiv="refresh" content="0; url={relatif}">
<meta property="og:type" content="website">
<meta property="og:title" content="Undangan {acara} — {brand}">
<meta property="og:description" content="{deskripsi}">
<meta property="og:image" content="{gambar}">
<meta property="og:url" content="{tujuan}">
<meta name="twitter:card" content="summary_large_image">
<script>
  // Teruskan ?to=Nama+Tamu, ?mode=, ?fx=, dan ?checkin= ke halaman undangan.
  location.replace('{relatif}' + location.search);
</script>
</head>
<body style="font-family:system-ui,Segoe UI,Roboto,sans-serif;text-align:center;padding:60px 20px;color:#2b2b2b">
  <p style="font-size:15px">Mengalihkan ke undangan <b>{acara}</b>…</p>
  <p><a href="{relatif}" style="display:inline-block;margin-top:8px;padding:10px 20px;border-radius:999px;
    background:#1e7a4d;color:#fff;text-decoration:none;font-weight:700">Buka Undangan</a></p>
</body>
</html>
'''.format(marker=MARKER, acara=acara, brand=esc(brand), tujuan=tujuan, relatif=tujuan_relatif,
           deskripsi=esc(deskripsi), gambar=gambar)


def main():
    if not os.path.exists(DB_PATH):
        sys.exit('Berkas %s tidak ditemukan.' % DB_PATH)
    with open(DB_PATH, encoding='utf-8') as f:
        db = json.load(f)

    settings = db.get('settings') or {}
    domain = settings.get('domain') or 'kartudigital.my.id'
    if os.path.exists('CNAME'):
        with open('CNAME', encoding='utf-8') as f:
            cname = f.read().strip()
        if cname:
            domain = cname
    brand = settings.get('brandName') or 'Kartu Digital'

    invs = db.get('invitations') or []
    if not os.path.isdir(OUT_DIR):
        os.makedirs(OUT_DIR)

    dibuat = []
    for inv in invs:
        slug = slug_dari(inv)
        if not slug:
            continue
        folder = os.path.join(OUT_DIR, slug)
        if not os.path.isdir(folder):
            os.makedirs(folder)
        with open(os.path.join(folder, 'index.html'), 'w', encoding='utf-8') as f:
            f.write(halaman(inv, domain, brand))
        dibuat.append((slug, inv.get('id'), inv.get('themeFile')))

    # Bersihkan folder lama yang sudah tidak dipakai (hanya yang punya penanda skrip ini).
    aktif = set(s for s, _, _ in dibuat)
    dihapus = []
    for nama in sorted(os.listdir(OUT_DIR)):
        folder = os.path.join(OUT_DIR, nama)
        berkas = os.path.join(folder, 'index.html')
        if not os.path.isdir(folder) or nama in aktif or not os.path.exists(berkas):
            continue
        with open(berkas, encoding='utf-8') as f:
            if MARKER in f.read():
                shutil.rmtree(folder)
                dihapus.append(nama)

    print('Link pendek dibuat untuk %d undangan (domain %s):' % (len(dibuat), domain))
    for slug, inv_id, tema in dibuat:
        print('  /u/%-22s -> %s?id=%s' % (slug, tema, inv_id))
    if dihapus:
        print('Folder basi dihapus: %s' % ', '.join(dihapus))
    print('\nContoh pemakaian: https://%s/u/%s' % (domain, dibuat[0][0] if dibuat else 'rahma-dika'))


if __name__ == '__main__':
    main()
