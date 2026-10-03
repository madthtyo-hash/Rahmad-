#!/usr/bin/env python3
"""
Pembuat musik latar Kartu Digital — semua disintesis sendiri, bebas royalti.

Cara pakai:
    pip install lameenc          # sekali saja (encoder MP3 murni Python)
    python3 tools/make-music.py  # hasil: folder musik/*.mp3

6 lagu pendek (loop ± 30-34 detik) untuk ditempel di undangan maupun halaman depan:
    romantis.mp3   pernikahan (bawaan halaman depan)
    khitanan.mp3   walimatul khitan
    aqiqah.mp3     tasyakuran bayi (ninabobo)
    wisuda.mp3     prosesi wisuda
    pesta.mp3      ulang tahun
    jawa.mp3       adat Jawa (pentatonik pelengkap)

Tidak ada file pihak ketiga: seluruh nada dibuat skrip ini.
"""
import math, os, struct, sys

try:
    import lameenc
except ImportError:
    sys.exit('lameenc belum terpasang. Jalankan: pip install lameenc')

SR = 44100
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'musik')


def midi(n):
    """Frekuensi nada MIDI."""
    return 440.0 * (2 ** ((n - 69) / 12.0))


def osc(wave, phase):
    if wave == 'sine':
        return math.sin(phase)
    if wave == 'triangle':
        x = (phase / (2 * math.pi)) % 1.0
        return 4 * abs(x - 0.5) - 1
    if wave == 'square':
        return 1.0 if math.sin(phase) >= 0 else -1.0
    x = (phase / (2 * math.pi)) % 1.0
    return 2 * x - 1


def tambah(buf, start, dur, freq, vol, wave='sine', attack=0.02, release=0.25, vibrato=0.0):
    """Tulis satu nada dengan amplop alami ke buffer."""
    n0, n = int(start * SR), int(dur * SR)
    for i in range(n):
        idx = n0 + i
        if idx >= len(buf):
            break
        t = i / SR
        if t < attack:
            env = t / attack
        elif t > dur - release:
            env = max(0.0, (dur - t) / release)
        else:
            env = 1.0
        env *= math.exp(-0.55 * t / max(dur, 0.01))
        f = freq * (1 + vibrato * math.sin(2 * math.pi * 5.2 * t))
        buf[idx] += vol * env * osc(wave, 2 * math.pi * f * t)


def gema(buf, delay=0.22, decay=0.28, ulang=3):
    """Gema sederhana supaya suara tidak kering."""
    for k in range(1, ulang + 1):
        d = int(delay * k * SR)
        g = decay ** k
        for i in range(len(buf) - d):
            buf[i + d] += buf[i] * g


def tulis_mp3(nama, buf, bitrate=56):
    puncak = max(1e-9, max(abs(x) for x in buf))
    skala = 0.89 / puncak
    pcm = bytearray()
    for x in buf:
        pcm += struct.pack('<h', int(max(-1.0, min(1.0, x * skala)) * 32767))
    enc = lameenc.Encoder()
    enc.set_bit_rate(bitrate)
    enc.set_in_sample_rate(SR)
    enc.set_channels(1)
    enc.set_quality(4)
    data = enc.encode(bytes(pcm)) + enc.flush()
    with open(os.path.join(OUT, nama), 'wb') as f:
        f.write(data)
    print('  %-14s %5.1f detik  %4d KB' % (nama, len(buf) / SR, len(data) // 1024))


# ---------- Resep tiap lagu ----------------------------------------------
# melodi/bass: pasangan (nada MIDI, panjang dalam beat)
LAGU = [
    dict(nama='romantis.mp3', panjang=34, beat=1.15, wave='triangle', vol=.34, bass_vol=.26,
         mel=[(74, 1), (76, 1), (78, 1.5), (74, 1.5), (71, 1), (73, 1), (69, 2), (71, 1), (74, 1), (76, 2), (74, 1), (73, 1)],
         bass=[(38, 3), (45, 3), (47, 3), (42, 3), (43, 3), (38, 3), (43, 3), (45, 3)]),
    dict(nama='khitanan.mp3', panjang=34, beat=1.05, wave='sine', vol=.32, bass_vol=.24, bass_wave='triangle',
         mel=[(69, 2), (72, 1), (74, 1), (72, 2), (69, 2), (67, 1), (65, 1), (69, 3), (72, 1), (69, 1), (67, 2), (65, 2)],
         bass=[(38, 4), (45, 4), (43, 4), (41, 4), (38, 4)]),
    dict(nama='aqiqah.mp3', panjang=32, beat=1.25, wave='sine', vol=.30, bass_vol=.22,
         attack=.06, release=.5,
         mel=[(76, 2), (74, 1), (72, 1), (69, 2), (72, 2), (74, 2), (72, 1), (69, 1), (67, 2), (69, 3)],
         bass=[(45, 4), (41, 4), (43, 4), (45, 4), (40, 4)]),
    dict(nama='wisuda.mp3', panjang=34, beat=0.95, wave='triangle', vol=.31, bass_vol=.25,
         mel=[(72, 1), (76, 1), (79, 2), (77, 1), (76, 1), (72, 2), (74, 1), (77, 1), (81, 2), (79, 2)],
         bass=[(48, 4), (55, 4), (53, 4), (48, 4), (50, 4)]),
    dict(nama='pesta.mp3', panjang=30, beat=0.72, wave='triangle', vol=.30, bass_vol=.26, bass_wave='square',
         mel=[(60, .75), (60, .25), (62, 1), (60, 1), (65, 1), (64, 2),
              (60, .75), (60, .25), (62, 1), (60, 1), (67, 1), (65, 2),
              (60, .75), (60, .25), (72, 1), (69, 1), (65, 1), (64, 1), (62, 2),
              (70, .75), (70, .25), (69, 1), (65, 1), (67, 1), (65, 2)],
         bass=[(48, 3), (53, 3), (48, 3), (53, 3), (41, 3), (48, 3), (46, 3), (53, 3), (48, 4)]),
    dict(nama='jawa.mp3', panjang=34, beat=1.3, wave='triangle', vol=.30, bass_vol=.30,
         attack=.03, release=.4, bass_release=1.2,
         mel=[(62, 2), (65, 1), (68, 1), (70, 2), (74, 1), (70, 1), (68, 2), (65, 2), (62, 3)],
         bass=[(38, 6), (42, 6), (45, 6), (40, 6)]),
]


def bangun_lagu(resep):
    """Susun satu lagu dari resepnya."""
    buf = [0.0] * (resep['panjang'] * SR)
    mel, bass = resep['mel'], resep['bass']
    putaran = sum(d for _, d in mel) * resep['beat']
    t = 0.0
    while t < resep['panjang'] - 3:
        tt = t
        for n, d in mel:
            tambah(buf, tt, d * resep['beat'] * .97, midi(n), resep['vol'],
                   resep['wave'], attack=resep.get('attack', .02),
                   release=resep.get('release', .25), vibrato=.0035)
            tt += d * resep['beat']
        tt = t
        for n, d in bass:
            tambah(buf, tt, d * resep['beat'] * .96, midi(n), resep['bass_vol'],
                   resep.get('bass_wave', 'sine'), attack=resep.get('attack', .04),
                   release=resep.get('bass_release', .4))
            tt += d * resep['beat']
        t += putaran
    gema(buf)
    return buf


if __name__ == '__main__':
    if not os.path.isdir(OUT):
        os.makedirs(OUT)
    print('\nMembuat musik latar di musik/ ...')
    for resep in LAGU:
        tulis_mp3(resep['nama'], bangun_lagu(resep))
    print('Selesai — semua lagu disintesis sendiri (tools/make-music.py).\n')
