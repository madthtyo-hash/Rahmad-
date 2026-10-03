#!/usr/bin/env python3
"""
Membuat thumbnail katalog (hemat data ~78%) dari foto cover asli.

Cara pakai:
    python3 tools/make-thumbs.py        # butuh ImageMagick (perintah: convert)

Menghasilkan folder thumbs/<nama>.jpg berukuran 400px (kualitas 68) untuk 13
pratinjau katalog di index.html/landing.html, sementara halaman undangan tetap
memakai foto ukuran penuh.
"""
import glob, os, shutil, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
OUT = 'thumbs'

if not shutil.which('convert'):
    sys.exit('ImageMagick (convert) tidak ditemukan. Pasang dulu: apt install imagemagick')

if not os.path.isdir(OUT):
    os.makedirs(OUT)

total = 0
for f in sorted(glob.glob('foto-*.jpg')):
    keluar = os.path.join(OUT, f)
    subprocess.run(['convert', f, '-resize', '400x', '-quality', '68', '-strip', keluar], check=True)
    total += os.path.getsize(keluar)
    print('  %-40s %4d KB' % (keluar, os.path.getsize(keluar) // 1024))
print('\n%d thumbnail = %d KB (asli: %d KB)' % (
    len(glob.glob(OUT + '/*.jpg')), total // 1024,
    sum(os.path.getsize(f) for f in glob.glob('foto-*.jpg')) // 1024))
