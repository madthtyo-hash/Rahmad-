/*!
 * Kartu Digital — Mesin Mode Navigasi Tamu (Gulir / Snap / Slide & efek premium)
 * ---------------------------------------------------------------------------
 * Dipakai oleh tema yang belum punya mesin navigasi sendiri.
 * (Sage Blossom & Jawa Heritage memakai mesin bawaan di halamannya masing-masing.)
 *
 * Cara pakai:
 *   <script src="vendor/nav-mode.js"></script>   <!-- sebelum studio-api.js -->
 *
 * Mode bisa dipilih lewat:
 *   1. Link undangan   : undangan-wisuda.html?mode=cube
 *   2. Studio Admin    : tersimpan sebagai "navMode" undangan (studio-api.js
 *                        memanggil window.setMode() saat hydrate).
 *
 * Mode: scroll (bawaan) · snap · slide · fade · flip · zoom · up · cube · blur
 * Kelas yang dipakai sama dengan tema Sage/Jawa:
 *   body.mode-<nama>, body.pager, html.snap, .dots, .slide-arrow
 */
(function () {
  'use strict';

  if (window.__kdNavModeSiap) return;          // jangan dipasang dua kali
  window.__kdNavModeSiap = true;

  var MODES = ['scroll', 'snap', 'slide', 'fade', 'flip', 'zoom', 'up', 'cube', 'blur'];
  var PAGER = ['slide', 'fade', 'flip', 'zoom', 'up', 'cube', 'blur'];

  // Kalau tema sudah punya mesin sendiri (Sage/Jawa), jangan diganggu.
  if (typeof window.setMode === 'function' || document.getElementById('dots')) return;

  var CSS = [
    '/* ---------- Mode navigasi (dipasang otomatis oleh vendor/nav-mode.js) ---------- */',
    'body.pager{overflow:hidden}',
    'body.pager .frame{height:100vh;overflow:hidden;perspective:1400px}',
    'body.pager .frame>section{display:none;height:100vh;overflow-y:auto;-webkit-overflow-scrolling:touch}',
    'body.pager .frame>section.active{display:block}',
    'body.pager .frame>section.closing.active{display:flex;flex-direction:column;justify-content:center}',
    'body.pager .frame>*:not(section){display:none}',  /* strip dekoratif; yang ada tombolnya dipindah ke bagian terakhir */
    '.kd-nav-dots{position:fixed;left:50%;transform:translateX(-50%);bottom:92px;z-index:89;display:none;gap:6px}',
    'body.pager .kd-nav-dots{display:flex}',
    '.kd-nav-dots button{width:10px;height:10px;padding:0;border:0;border-radius:50%;' +
      'background:rgba(0,0,0,.22);cursor:pointer;transition:.2s;display:block}',
    '.kd-nav-dots button.on{background:currentColor;transform:scale(1.3)}',
    '.kd-nav-arrow{position:fixed;top:50%;transform:translateY(-50%);z-index:89;width:42px;height:42px;' +
      'border-radius:50%;background:rgba(255,255,255,.94);border:1px solid rgba(0,0,0,.12);color:inherit;' +
      'font-size:20px;line-height:1;cursor:pointer;display:none;align-items:center;justify-content:center;' +
      'box-shadow:0 6px 16px rgba(0,0,0,.18)}',
    'body.pager .kd-nav-arrow{display:flex}',
    '.kd-nav-prev{left:calc(50% - 232px)}',
    '.kd-nav-next{right:calc(50% - 232px)}',
    '@media(max-width:520px){.kd-nav-prev{left:8px}.kd-nav-next{right:8px}}',
    /* Efek transisi per mode */
    'body.mode-slide .frame>section{animation:kdSlideIn .45s ease}',
    'body.mode-fade .frame>section{animation:kdFadeIn .65s ease}',
    'body.mode-flip .frame>section{animation:kdFlipIn .65s cubic-bezier(.4,0,.2,1)}',
    'body.mode-zoom .frame>section{animation:kdZoomIn .55s ease}',
    'body.mode-up .frame>section{animation:kdUpIn .5s ease}',
    'body.mode-cube .frame>section{animation:kdCubeIn .6s cubic-bezier(.4,0,.2,1)}',
    'body.mode-blur .frame>section{animation:kdBlurIn .6s ease}',
    '@keyframes kdSlideIn{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:none}}',
    '@keyframes kdFadeIn{from{opacity:0}to{opacity:1}}',
    '@keyframes kdFlipIn{from{opacity:.35;transform:rotateY(-40deg)}to{opacity:1;transform:rotateY(0)}}',
    '@keyframes kdZoomIn{from{opacity:0;transform:scale(1.18)}to{opacity:1;transform:scale(1)}}',
    '@keyframes kdUpIn{from{opacity:0;transform:translateY(70px)}to{opacity:1;transform:none}}',
    '@keyframes kdCubeIn{from{opacity:0;transform:rotateY(88deg) scale(.92)}to{opacity:1;transform:rotateY(0) scale(1)}}',
    '@keyframes kdBlurIn{from{opacity:0;filter:blur(16px)}to{opacity:1;filter:blur(0)}}',
    /* Snap: gulir biasa tapi mengunci per bagian */
    'html.snap{scroll-snap-type:y mandatory}',
    'body.mode-snap .frame>section{scroll-snap-align:start}',
    '@media(prefers-reduced-motion:reduce){body[class*="mode-"] .frame>section{animation:none!important}}'
  ].join('\n');

  function suntikCss() {
    if (document.getElementById('kdNavStyle')) return;
    var st = document.createElement('style');
    st.id = 'kdNavStyle';
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  var seksi = [];
  var ke = 0;
  var dotsWrap = null;

  function pagerAktif() {
    return PAGER.some(function (m) { return document.body.classList.contains('mode-' + m); });
  }

  function goSlide(i) {
    if (!seksi.length) return;
    ke = Math.max(0, Math.min(seksi.length - 1, i));
    seksi.forEach(function (s, idx) {
      s.classList.toggle('active', idx === ke);
      if (idx === ke) s.scrollTop = 0;          // mulai dari atas tiap bagian
    });
    if (dotsWrap) {
      Array.prototype.forEach.call(dotsWrap.children, function (d, idx) {
        d.classList.toggle('on', idx === ke);
        if (idx === ke) d.setAttribute('aria-current', 'true');
        else d.removeAttribute('aria-current');
      });
    }
  }

  // Strip di luar <section> (mis. footer kredit) dipindah ke bagian terakhir
  // supaya tetap terbaca di mode per-halaman, lalu dikembalikan saat mode gulir.
  // Elemen yang sudah dipindah dicatat di daftar, karena setelah dipindah ia
  // bukan lagi anak langsung .frame.
  var dipindah = [];

  function kandidatStrip() {
    var frame = document.querySelector('.frame');
    var hasil = [];
    if (frame) {
      Array.prototype.slice.call(frame.children).forEach(function (el) {
        if (el.tagName !== 'SECTION') hasil.push(el);
      });
    }
    // jaring pengaman: strip kredit yang berada di luar .frame
    Array.prototype.slice.call(document.querySelectorAll('.footstrip, .kd-credit')).forEach(function (el) {
      if (!el.closest || !el.closest('section')) {
        if (hasil.indexOf(el) < 0 && !el.closest('.kd-credit, .footstrip')) hasil.push(el);
      }
    });
    return hasil;
  }

  function rapikanStrip(pager) {
    if (pager) {
      if (!seksi.length) return;
      var terakhir = seksi[seksi.length - 1];
      kandidatStrip().forEach(function (el) {
        if (!el.querySelector('a, button')) return;          // strip dekoratif → cukup disembunyikan CSS
        if (!el.__kdAsal) {
          el.__kdAsal = { parent: el.parentNode, next: el.nextSibling };
          dipindah.push(el);
        }
        if (el.parentNode !== terakhir) terakhir.appendChild(el);
      });
    } else if (dipindah.length) {
      dipindah.forEach(function (el) {
        if (!el.__kdAsal) return;
        el.__kdAsal.parent.insertBefore(el, el.__kdAsal.next);
        delete el.__kdAsal;
      });
      dipindah = [];
    }
  }

  function setMode(mode) {
    if (MODES.indexOf(mode) < 0) mode = 'scroll';
    // Bersihkan SEMUA kelas mode (termasuk up/cube/blur) — ini yang dulu bocor.
    MODES.forEach(function (m) { document.body.classList.remove('mode-' + m); });
    document.body.classList.add('mode-' + mode);
    document.documentElement.classList.toggle('snap', mode === 'snap');
    var pager = PAGER.indexOf(mode) > -1;
    document.body.classList.toggle('pager', pager);
    rapikanStrip(pager);
    if (pager) goSlide(ke);
    else seksi.forEach(function (s) { s.classList.remove('active'); });
    window.kdNavMode = mode;
    return mode;
  }

  function siapkanKontrol() {
    var frame = document.querySelector('.frame');
    if (!frame || !seksi.length) return;
    if (dotsWrap) return;

    dotsWrap = document.createElement('div');
    dotsWrap.className = 'kd-nav-dots';
    dotsWrap.setAttribute('role', 'group');
    dotsWrap.setAttribute('aria-label', 'Navigasi bagian undangan');
    seksi.forEach(function (_, i) {
      var d = document.createElement('button');
      d.type = 'button';
      d.className = 'kd-dot';
      d.setAttribute('aria-label', 'Bagian ' + (i + 1) + ' dari ' + seksi.length);
      d.addEventListener('click', function () { goSlide(i); });
      dotsWrap.appendChild(d);
    });
    document.body.appendChild(dotsWrap);

    [['kd-nav-prev', '‹', -1, 'Bagian sebelumnya'], ['kd-nav-next', '›', 1, 'Bagian berikutnya']]
      .forEach(function (info) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'kd-nav-arrow ' + info[0];
        b.textContent = info[1];
        b.setAttribute('aria-label', info[3]);
        b.addEventListener('click', function () { goSlide(ke + info[2]); });
        document.body.appendChild(b);
      });

    // geser/swipe di HP
    var tx = null;
    document.addEventListener('touchstart', function (e) {
      if (pagerAktif() && !dihalangi()) tx = e.touches[0].clientX;
    }, { passive: true });
    document.addEventListener('touchend', function (e) {
      if (tx === null) return;
      var dx = e.changedTouches[0].clientX - tx;
      tx = null;
      if (Math.abs(dx) > 60) goSlide(ke + (dx < 0 ? 1 : -1));
    }, { passive: true });

    // panah keyboard di laptop/desktop
    document.addEventListener('keydown', function (e) {
      if (!pagerAktif() || dihalangi()) return;
      var tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'ArrowRight') goSlide(ke + 1);
      if (e.key === 'ArrowLeft') goSlide(ke - 1);
    });
  }

  // Jangan bajak panah saat galeri/lightbox sedang terbuka.
  function dihalangi() {
    var lb = document.getElementById('lightbox');
    return !!(lb && lb.classList.contains('show'));
  }

  function modeDariLink() {
    var q;
    try { q = new URLSearchParams(location.search).get('mode'); } catch (e) { q = null; }
    return MODES.indexOf(q) > -1 ? q : null;
  }

  var sudahMulai = false;

  function mulai() {
    if (sudahMulai) return true;                 // sekali saja (aman dipanggil berulang)
    var calon = Array.prototype.slice.call(document.querySelectorAll('.frame > section'));
    if (!calon.length) return false;             // struktur tak dikenal → biarkan apa adanya
    sudahMulai = true;
    seksi = calon;
    suntikCss();
    siapkanKontrol();
    setMode(modeDariLink() || 'scroll');
    return true;
  }

  // Dipakai studio-api.js saat memuat navMode tersimpan (tanpa ?mode= di link).
  // Catatan: dipanggil saat DOM mungkin belum selesai diurai, jadi mode yang
  // diminta diterapkan SETELAH inisialisasi — bukan ditimpa DOMContentLoaded.
  window.setMode = function (mode) {
    if (!mulai()) return mode;                   // belum ada bagian yang bisa dinavigasi
    if (!dotsWrap) siapkanKontrol();
    return setMode(mode);
  };
  window.kdGoSlide = goSlide;
  window.kdNavMode = 'scroll';

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { mulai(); });
  else mulai();
})();
