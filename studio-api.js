/**
 * Kartu Digital — Universal Backend Studio Engine (studio-api.js)
 * Menghubungkan Studio Admin (studio.html) dengan REST API Backend (/api/*)
 * serta penyimpanan persisten lokal (localStorage + data/studio-db.json)
 * agar berjalan penuh baik di server Node.js maupun GitHub Pages (kartudigital.my.id).
 */
(function (window) {
  'use strict';

  var STORAGE_KEY = 'kd_studio_db_v2';

  var DEFAULT_DB = {
    version: '2.0.0',
    updatedAt: '2026-10-02T15:00:00.000Z',
    settings: {
      brandName: 'Kartu Digital',
      domain: 'kartudigital.my.id',
      adminWhatsapp: '6282128718485',
      defaultCurrency: 'IDR'
    },
    invitations: [
      {
        id: 'sage-rahma-dika',
        slug: 'rahma-dika',
        category: 'pernikahan',
        theme: 'Sage Blossom',
        themeFile: 'undangan-sage.html',
        isPremium: false,
        status: 'Aktif',
        views: 184,
        title: 'The Wedding Of',
        primaryName: 'Rahma',
        secondaryName: 'Dika',
        fullName1: 'Rahmawati, S.E.',
        parents1: 'Putri dari Bapak Ahmad Santoso & Ibu Siti Nurhayati',
        fullName2: 'Dika Pratama, S.T.',
        parents2: 'Putra dari Bapak Budi Hartono & Ibu Maria Ulfa',
        quote: 'Bersama dalam cinta, menuju ridha-Nya.',
        eventDate: '2026-10-12',
        akadTime: '08.00 – 10.00 WIB',
        resepsiTime: '11.00 – 15.00 WIB',
        venueName: 'Gedung Serbaguna Sariwangi',
        venueAddress: 'Jl. Terusan Jakarta No. 123, Bandung',
        mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Sariwangi+Bandung',
        navMode: 'scroll',
        fxMode: 'kelopak',
        musicUrl: 'musik.mp3',
        photos: {
          cover: 'foto-rahma-cover.jpg',
          photo1: 'foto-rahma-cover.jpg',
          photo2: 'foto-cover.jpg',
          gallery: [
            'foto-rahma-cover.jpg',
            'foto-cover.jpg',
            'foto-cover.jpg',
            'foto-rahma-cover.jpg'
          ]
        },
        amplop: {
          enabled: true,
          note: 'Bagi yang ingin memberikan kado pernikahan, bisa melalui rekening atau e-wallet berikut:',
          whatsappConfirm: '6282128718485',
          giftAddress: 'Jl. Terusan Jakarta No. 123, Bandung',
          accounts: [
            { id: 'acc-1', bank: 'BCA', number: '1234567890', holder: 'Rahmawati' },
            { id: 'acc-2', bank: 'DANA', number: '085712345678', holder: 'Dika Pratama' }
          ]
        },
        rsvp: {
          enabled: true,
          deadline: '2026-09-30',
          maxGuests: 4,
          allowWishes: true,
          requirePhone: false
        }
      },
      {
        id: 'jawa-ratri-galih',
        slug: 'ratri-galih',
        category: 'pernikahan',
        theme: 'Jawa Heritage',
        themeFile: 'undangan-jawa.html',
        isPremium: false,
        status: 'Aktif',
        views: 142,
        title: 'The Wedding Of',
        primaryName: 'Ratri',
        secondaryName: 'Galih',
        fullName1: 'Ratri Widyastuti, S.E.',
        parents1: 'Putri dari Bapak H. Soebianto Wijoyo & Ibu Raden Ayu Kusumaningrum',
        fullName2: 'Galih Saputra, S.T.',
        parents2: 'Putra dari Bapak H. Gunawan Prawira & Ibu Tutik Mardiyah',
        quote: 'Bersama dalam cinta, menuju ridha-Nya.',
        eventDate: '2027-06-19',
        akadTime: '06.00 – 09.00 WIB',
        resepsiTime: '11.00 – 15.00 WIB',
        venueName: 'Kedhaton Graha Saraswati',
        venueAddress: 'Jl. Jend. Sudirman No. 21, Yogyakarta',
        mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Graha+Saraswati+Yogyakarta',
        navMode: 'scroll',
        fxMode: 'kelopak',
        musicUrl: 'musik.mp3',
        photos: {
          cover: 'foto-jawa-cover.jpg',
          photo1: 'foto-jawa-cover.jpg',
          photo2: 'foto-cover.jpg',
          gallery: [
            'foto-jawa-cover.jpg',
            'foto-cover.jpg',
            'foto-cover.jpg',
            'foto-jawa-cover.jpg'
          ]
        },
        amplop: {
          enabled: true,
          note: 'Bagi yang ingin memberikan tanda kasih pernikahan, dapat melalui rekening atau e-wallet berikut:',
          whatsappConfirm: '6282128718485',
          giftAddress: 'Jl. Jend. Sudirman No. 21, Yogyakarta',
          accounts: [
            { id: 'acc-3', bank: 'BCA', number: '1234567890', holder: 'Ratri Widyastuti' },
            { id: 'acc-4', bank: 'DANA', number: '085712345678', holder: 'Galih Saputra' }
          ]
        },
        rsvp: {
          enabled: true,
          deadline: '2027-06-05',
          maxGuests: 4,
          allowWishes: true,
          requirePhone: false
        }
      },
      {
        id: 'emerald-raka-laras',
        slug: 'raka-laras',
        category: 'pernikahan',
        theme: 'Blush & Emerald Floral',
        themeFile: 'undangan-demo.html',
        isPremium: false,
        status: 'Aktif',
        views: 96,
        title: 'Undangan Pernikahan',
        primaryName: 'Raka',
        secondaryName: 'Laras',
        fullName1: 'Raka Aditya Pratama, S.T.',
        parents1: 'Putra pertama dari Bpk. H. Surya Pratama & Ibu Hj. Dewi Anggraini',
        fullName2: 'Laras Ayu Wulandari, S.E.',
        parents2: 'Putri kedua dari Bpk. Drs. Bambang Wulandari & Ibu Siti Rahayu',
        quote: 'Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu agar kamu merasa tenteram kepadanya.',
        eventDate: '2026-12-12',
        akadTime: '08.00 – 10.00 WIB',
        resepsiTime: '11.00 – 14.00 WIB',
        venueName: 'Grand Ballroom Hotel Savoy',
        venueAddress: 'Jl. Asia Afrika No. 112, Bandung',
        mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Savoy+Homann+Bandung',
        navMode: 'scroll',
        fxMode: 'kilau',
        musicUrl: 'musik.mp3',
        photos: {
          cover: 'foto-cover.jpg',
          photo1: 'foto-cover.jpg',
          photo2: 'foto-rahma-cover.jpg',
          gallery: [
            'foto-cover.jpg',
            'foto-rahma-cover.jpg',
            'foto-jawa-cover.jpg',
            'foto-cover.jpg'
          ]
        },
        amplop: {
          enabled: true,
          note: 'Kehadiranmu adalah hadiah terindah. Namun jika ingin berbagi tanda kasih, kami sediakan dengan tulus hati:',
          whatsappConfirm: '6282128718485',
          giftAddress: 'Jl. Asia Afrika No. 112, Bandung',
          accounts: [
            { id: 'acc-5', bank: 'BCA', number: '1234567890', holder: 'Raka Aditya Pratama' },
            { id: 'acc-6', bank: 'GoPay', number: '081234567890', holder: 'Laras Ayu Wulandari' }
          ]
        },
        rsvp: {
          enabled: true,
          deadline: '2026-12-01',
          maxGuests: 4,
          allowWishes: true,
          requirePhone: false
        }
      },
      {
        id: 'premium-alvaro-clara',
        slug: 'alvaro-clara',
        category: 'premium',
        theme: 'Royal Gold Luxury 👑',
        themeFile: 'undangan-premium.html',
        isPremium: true,
        status: 'Aktif',
        views: 215,
        title: 'Royal Wedding Invitation',
        primaryName: 'Alvaro',
        secondaryName: 'Clara',
        fullName1: 'Alvaro Dirgantara Putra, M.B.A.',
        parents1: 'Putra sulung Bpk. Ir. H. Hendra Dirgantara & Ibu Hj. Sofia Maharani',
        fullName2: 'Clarissa Aurelia Wijaya, S.Ked.',
        parents2: 'Putri bungsu Bpk. dr. Antonius Wijaya, Sp.PD & Ibu Margaretha Laksmi',
        quote: 'Cinta sejati bukan tentang menemukan seseorang yang sempurna, melainkan belajar melihat ketidaksempurnaan secara sempurna.',
        eventDate: '2026-11-28',
        akadTime: '09.00 – 11.00 WIB',
        resepsiTime: '18.30 – 21.30 WIB (Royal Gala Dinner)',
        venueName: 'The Trans Luxury Hotel — Grand Ballroom',
        venueAddress: 'Jl. Gatot Subroto No. 289, Bandung',
        mapsUrl: 'https://www.google.com/maps/search/?api=1&query=The+Trans+Luxury+Hotel+Bandung',
        navMode: 'fade',
        fxMode: 'kilau',
        musicUrl: 'musik.mp3',
        photos: {
          cover: 'foto-cover.jpg',
          photo1: 'foto-cover.jpg',
          photo2: 'foto-rahma-cover.jpg',
          gallery: [
            'foto-cover.jpg',
            'foto-rahma-cover.jpg',
            'foto-jawa-cover.jpg',
            'foto-cover.jpg'
          ]
        },
        amplop: {
          enabled: true,
          note: 'Doa restu Bapak/Ibu/Saudara/i merupakan karunia terindah. Bagi yang ingin mengirimkan tanda kasih:',
          whatsappConfirm: '6282128718485',
          giftAddress: 'Residences at The Trans Luxury, Bandung',
          accounts: [
            { id: 'acc-7', bank: 'BCA Prioritas', number: '8890123456', holder: 'Alvaro Dirgantara Putra' },
            { id: 'acc-8', bank: 'Mandiri', number: '1310098765432', holder: 'Clarissa Aurelia Wijaya' }
          ]
        },
        rsvp: {
          enabled: true,
          deadline: '2026-11-20',
          maxGuests: 4,
          allowWishes: true,
          requirePhone: true
        }
      },
      {
        id: 'khitan-zidan',
        slug: 'khitanan-zidan',
        category: 'khitanan',
        theme: 'Al-Fatih Khitanan 🕌',
        themeFile: 'undangan-khitanan.html',
        isPremium: false,
        status: 'Aktif',
        views: 119,
        title: 'Walimatul Khitan',
        primaryName: 'M. Zidan Al-Fatih',
        secondaryName: 'Zidan',
        fullName1: 'Muhammad Zidan Al-Fatih',
        parents1: 'Putra tercinta dari Bapak H. Ridwan Kamiludin & Ibu Hj. Nisa Sabyaniah',
        fullName2: '',
        parents2: 'Keluarga Besar Bpk. H. Abdullah & Bpk. H. Sulaiman',
        quote: 'Ya Allah, jadikanlah ia anak yang sholeh, berbakti kepada kedua orang tua, berguna bagi agama, nusa, dan bangsa.',
        eventDate: '2026-11-15',
        akadTime: '08.00 – 10.30 WIB (Doa & Pengajian)',
        resepsiTime: '11.00 – 15.00 WIB (Tasyakuran & Ramah Tamah)',
        venueName: 'Bale Asri Pusdai Jawa Barat',
        venueAddress: 'Jl. Diponegoro No. 63, Cihaur Geulis, Bandung',
        mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Bale+Asri+Pusdai+Bandung',
        navMode: 'scroll',
        fxMode: 'bintang',
        musicUrl: 'musik.mp3',
        photos: {
          cover: 'foto-cover.jpg',
          photo1: 'foto-cover.jpg',
          photo2: '',
          gallery: [
            'foto-cover.jpg',
            'foto-jawa-cover.jpg',
            'foto-rahma-cover.jpg',
            'foto-cover.jpg'
          ]
        },
        amplop: {
          enabled: true,
          note: 'Terima kasih atas doa restu Bapak/Ibu/Saudara/i untuk ananda Zidan. Tanda kasih digital dapat dikirimkan melalui:',
          whatsappConfirm: '6282128718485',
          giftAddress: 'Jl. Diponegoro No. 63, Bandung',
          accounts: [
            { id: 'acc-9', bank: 'BSI', number: '7123456789', holder: 'H. Ridwan Kamiludin' },
            { id: 'acc-10', bank: 'BRI', number: '040101002345501', holder: 'Hj. Nisa Sabyaniah' }
          ]
        },
        rsvp: {
          enabled: true,
          deadline: '2026-11-10',
          maxGuests: 5,
          allowWishes: true,
          requirePhone: false
        }
      },
      {
        id: 'ultah-kanaya',
        slug: 'ultah-kanaya-7th',
        category: 'ultah',
        theme: 'Sweet Wonder Party 🎂',
        themeFile: 'undangan-ultah.html',
        isPremium: false,
        status: 'Aktif',
        views: 134,
        title: '7th Birthday Party',
        primaryName: 'Kanaya Putri',
        secondaryName: 'Turning 7!',
        fullName1: 'Kanaya Azzahra Putri',
        parents1: 'Putri kesayangan Papa Dimas Anggara & Mama Raisa Andriana',
        fullName2: 'Turning 7 Years Old',
        parents2: 'Dress Code: Pastel Pink, Lilac & Cream',
        quote: 'Yuk datang dan rayakan hari ulang tahun Kanaya yang ke-7! Akan ada games seru, sulap, potong kue, dan goodie bag spesial!',
        eventDate: '2026-11-08',
        akadTime: '15.00 – 16.00 WIB (Games & Magic Show)',
        resepsiTime: '16.00 – 18.00 WIB (Tiup Lilin, Potong Kue & Dinner)',
        venueName: 'Hummingbird Eatery & Space',
        venueAddress: 'Jl. Progo No. 16, Citarum, Bandung',
        mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Hummingbird+Eatery+Bandung',
        navMode: 'scroll',
        fxMode: 'balon',
        musicUrl: 'musik.mp3',
        photos: {
          cover: 'foto-rahma-cover.jpg',
          photo1: 'foto-rahma-cover.jpg',
          photo2: '',
          gallery: [
            'foto-rahma-cover.jpg',
            'foto-cover.jpg',
            'foto-jawa-cover.jpg',
            'foto-rahma-cover.jpg'
          ]
        },
        amplop: {
          enabled: true,
          note: 'Kehadiran teman-teman adalah hadiah paling seru! Jika ingin mengirimkan kado atau angpau ulang tahun untuk Kanaya:',
          whatsappConfirm: '6282128718485',
          giftAddress: 'Jl. Progo No. 16, Bandung (Rumah Kanaya)',
          accounts: [
            { id: 'acc-11', bank: 'BCA', number: '4321098765', holder: 'Raisa Andriana' },
            { id: 'acc-12', bank: 'GoPay', number: '082128718485', holder: 'Dimas Anggara' }
          ]
        },
        rsvp: {
          enabled: true,
          deadline: '2026-11-05',
          maxGuests: 4,
          allowWishes: true,
          requirePhone: false
        }
      }
    ],
    rsvps: [
      {
        id: 'rsvp-1',
        invitationId: 'sage-rahma-dika',
        name: 'Keluarga Besar Wijaya',
        status: 'Hadir',
        guests: 3,
        phone: '081234567801',
        message: 'Barakallahu lakuma! Sampai jumpa di hari bahagianya 🤍',
        createdAt: '2026-10-01T09:30:00.000Z'
      },
      {
        id: 'rsvp-2',
        invitationId: 'sage-rahma-dika',
        name: 'Nadia & Rian',
        status: 'Hadir',
        guests: 2,
        phone: '081398765432',
        message: 'Selamat menempuh hidup baru Rahma & Dika, semoga sakinah mawaddah warahmah!',
        createdAt: '2026-10-01T14:15:00.000Z'
      },
      {
        id: 'rsvp-3',
        invitationId: 'jawa-ratri-galih',
        name: 'Bpk. Drs. Haryono',
        status: 'Hadir',
        guests: 2,
        phone: '081122334455',
        message: 'Ndherek mangayubagya, mugi dadosaken kulawarga ingkang sakinah mawaddah warahmah.',
        createdAt: '2026-10-01T16:40:00.000Z'
      },
      {
        id: 'rsvp-4',
        invitationId: 'premium-alvaro-clara',
        name: 'dr. Kevin Sanjaya & Partner',
        status: 'Hadir',
        guests: 2,
        phone: '081700112233',
        message: 'Happy Wedding Alvaro & Clara! Wishing you a lifetime of royal happiness ✨',
        createdAt: '2026-10-02T04:10:00.000Z'
      },
      {
        id: 'rsvp-5',
        invitationId: 'khitan-zidan',
        name: 'Ustadz H. Fauzan & Keluarga',
        status: 'Hadir',
        guests: 4,
        phone: '085211223344',
        message: 'Barakallah ananda Zidan, semoga lekas pulih dan tumbuh menjadi anak sholeh kebanggaan orang tua.',
        createdAt: '2026-10-02T07:20:00.000Z'
      },
      {
        id: 'rsvp-6',
        invitationId: 'ultah-kanaya',
        name: 'Alya & Mama',
        status: 'Hadir',
        guests: 2,
        phone: '081987654321',
        message: 'Happy 7th Birthday Kanaya cantik! Alya nggak sabar datang ke pesta ulang tahunnya 🎂🎈',
        createdAt: '2026-10-02T10:05:00.000Z'
      }
    ]
  };

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function loadLocalDb() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.invitations)) {
          // Ensure all default themes exist
          DEFAULT_DB.invitations.forEach(function (defInv) {
            if (!parsed.invitations.some(function (i) { return i.id === defInv.id; })) {
              parsed.invitations.push(clone(defInv));
            }
          });
          if (!Array.isArray(parsed.rsvps)) parsed.rsvps = clone(DEFAULT_DB.rsvps);
          return parsed;
        }
      }
    } catch (e) {}
    var initial = clone(DEFAULT_DB);
    saveLocalDb(initial);
    return initial;
  }

  function saveLocalDb(db) {
    db.updatedAt = new Date().toISOString();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch (e) {}
    return db;
  }

  var backendOnline = false;

  async function syncFromServer() {
    try {
      var res = await fetch('api/db', { cache: 'no-store' });
      if (res.ok) {
        var json = await res.json();
        if (json && json.ok && json.db) {
          backendOnline = true;
          saveLocalDb(json.db);
          return { online: true, mode: 'REST API Server', db: json.db };
        }
      }
    } catch (e) {}
    // Fallback to static JSON seed if localStorage wasn't modified yet
    try {
      var resStatic = await fetch('data/studio-db.json', { cache: 'no-store' });
      if (resStatic.ok) {
        var seed = await resStatic.json();
        var current = loadLocalDb();
        if (!localStorage.getItem(STORAGE_KEY + '_customized') && seed && Array.isArray(seed.invitations)) {
          saveLocalDb(seed);
          return { online: false, mode: 'GitHub Pages / Cloud LocalSync', db: seed };
        }
        return { online: false, mode: 'GitHub Pages / Cloud LocalSync', db: current };
      }
    } catch (e) {}
    return { online: false, mode: 'Cloud LocalSync', db: loadLocalDb() };
  }

  async function pushToServer(db) {
    saveLocalDb(db);
    try {
      localStorage.setItem(STORAGE_KEY + '_customized', '1');
    } catch (e) {}
    try {
      var res = await fetch('api/db', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(db)
      });
      if (res.ok) {
        backendOnline = true;
        return true;
      }
    } catch (e) {}
    return false;
  }

  function formatIndonesianDate(isoDate) {
    if (!isoDate) return 'Tanggal belum diatur';
    try {
      var d = new Date(isoDate + 'T00:00:00');
      return new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(d);
    } catch (e) {
      return isoDate;
    }
  }

  function formatDotDate(isoDate) {
    if (!isoDate) return '12 . 10 . 2026';
    var parts = isoDate.split('-');
    if (parts.length !== 3) return isoDate;
    return parts[2] + ' . ' + parts[1] + ' . ' + parts[0];
  }

  function compressImage(file, maxWidth, quality) {
    maxWidth = maxWidth || 960;
    quality = quality || 0.78;
    return new Promise(function (resolve, reject) {
      if (!file) return reject(new Error('File tidak ditemukan'));
      var reader = new FileReader();
      reader.onload = function (ev) {
        var img = new Image();
        img.onload = function () {
          var w = img.width;
          var h = img.height;
          if (w > maxWidth) {
            h = Math.round((h * maxWidth) / w);
            w = maxWidth;
          }
          var canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          var ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          var dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        };
        img.onerror = function () {
          resolve(ev.target.result);
        };
        img.src = ev.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  var StudioBackend = {
    getDb: function () {
      return loadLocalDb();
    },
    sync: syncFromServer,
    isOnline: function () {
      return backendOnline;
    },
    getInvitations: function (category) {
      var db = loadLocalDb();
      if (!category || category === 'all') return db.invitations;
      return db.invitations.filter(function (i) {
        if (category === 'premium') return i.isPremium || i.category === 'premium';
        return i.category === category;
      });
    },
    getInvitation: function (idOrSlug) {
      var db = loadLocalDb();
      return db.invitations.find(function (i) {
        return i.id === idOrSlug || i.slug === idOrSlug || i.themeFile === idOrSlug;
      }) || db.invitations[0];
    },
    saveInvitation: async function (inv) {
      var db = loadLocalDb();
      if (!inv.id) inv.id = 'inv-' + Date.now();
      var idx = db.invitations.findIndex(function (i) { return i.id === inv.id; });
      if (idx > -1) {
        db.invitations[idx] = Object.assign({}, db.invitations[idx], inv);
      } else {
        db.invitations.unshift(inv);
      }
      await pushToServer(db);
      return inv;
    },
    deleteInvitation: async function (id) {
      var db = loadLocalDb();
      db.invitations = db.invitations.filter(function (i) { return i.id !== id; });
      await pushToServer(db);
      return true;
    },
    resetToDefault: async function () {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_KEY + '_customized');
      var fresh = clone(DEFAULT_DB);
      await pushToServer(fresh);
      return fresh;
    },
    getRsvps: function (invitationId) {
      var db = loadLocalDb();
      if (!invitationId || invitationId === 'all') return db.rsvps;
      return db.rsvps.filter(function (r) { return r.invitationId === invitationId; });
    },
    addRsvp: async function (entry) {
      var db = loadLocalDb();
      var item = {
        id: 'rsvp-' + Date.now(),
        invitationId: entry.invitationId || 'sage-rahma-dika',
        name: (entry.name || 'Tamu Undangan').trim(),
        status: entry.status || 'Hadir',
        guests: Number(entry.guests) || 1,
        phone: (entry.phone || '').trim(),
        message: (entry.message || '').trim(),
        createdAt: new Date().toISOString()
      };
      db.rsvps.unshift(item);
      await pushToServer(db);
      return item;
    },
    deleteRsvp: async function (rsvpId) {
      var db = loadLocalDb();
      db.rsvps = db.rsvps.filter(function (r) { return r.id !== rsvpId; });
      await pushToServer(db);
      return true;
    },
    compressImage: compressImage,
    formatIndonesianDate: formatIndonesianDate,
    formatDotDate: formatDotDate,

    hydrateInvitationPage: function (defaultInvId) {
      try {
        var params = new URLSearchParams(window.location.search);
        var invId = params.get('id') || defaultInvId;
        var inv = StudioBackend.getInvitation(invId);
        if (!inv) return;

        // 1. Update Title & Cover
        var pairTitle = inv.secondaryName && inv.category !== 'khitanan' && inv.category !== 'ultah'
          ? (inv.primaryName + ' & ' + inv.secondaryName)
          : inv.primaryName;
        var coverEl = document.getElementById('cover');
        var coverH1 = coverEl ? coverEl.querySelector('h1') : null;
        if (coverH1 && pairTitle) {
          coverH1.textContent = pairTitle;
        }
        var coverDate = coverEl ? coverEl.querySelector('.date') : null;
        if (coverDate && inv.eventDate) {
          coverDate.textContent = formatDotDate(inv.eventDate);
        }
        var coverMini = coverEl ? coverEl.querySelector('.mini, .label') : null;
        if (coverMini && inv.title) {
          coverMini.textContent = inv.title;
        }

        // Custom Cover Photo
        if (inv.photos && inv.photos.cover) {
          var coverStyleEl = document.getElementById('studioDynamicCoverStyle');
          if (!coverStyleEl) {
            coverStyleEl = document.createElement('style');
            coverStyleEl.id = 'studioDynamicCoverStyle';
            document.head.appendChild(coverStyleEl);
          }
          var safeCover = inv.photos.cover.replace(/'/g, "\\'");
          coverStyleEl.textContent =
            '.cover { background-image: linear-gradient(180deg,rgba(25,30,22,.25) 0%,rgba(25,30,22,.85) 100%), url(\'' + safeCover + '\') !important; background-size: cover !important; background-position: center !important; }\n' +
            '.closing { background-image: linear-gradient(180deg,rgba(25,30,22,.55),rgba(25,30,22,.88)), url(\'' + safeCover + '\') !important; background-size: cover !important; background-position: center !important; }';
        }

        // Data-studio-field bindings (if present)
        document.querySelectorAll('[data-studio]').forEach(function (el) {
          var key = el.getAttribute('data-studio');
          if (key === 'pairTitle') el.textContent = pairTitle;
          else if (key === 'title') el.textContent = inv.title || '';
          else if (key === 'primaryName') el.textContent = inv.primaryName || '';
          else if (key === 'secondaryName') el.textContent = inv.secondaryName || '';
          else if (key === 'fullName1') el.textContent = inv.fullName1 || inv.primaryName || '';
          else if (key === 'parents1') el.textContent = inv.parents1 || '';
          else if (key === 'fullName2') el.textContent = inv.fullName2 || inv.secondaryName || '';
          else if (key === 'parents2') el.textContent = inv.parents2 || '';
          else if (key === 'quote') el.textContent = inv.quote ? '"' + inv.quote.replace(/^"|"$/g, '') + '"' : '';
          else if (key === 'dateFormatted') el.textContent = formatIndonesianDate(inv.eventDate);
          else if (key === 'dateDot') el.textContent = formatDotDate(inv.eventDate);
          else if (key === 'akadTime') el.textContent = inv.akadTime || '';
          else if (key === 'resepsiTime') el.textContent = inv.resepsiTime || '';
          else if (key === 'venueName') el.textContent = inv.venueName || '';
          else if (key === 'venueAddress') el.textContent = inv.venueAddress || '';
        });

        document.querySelectorAll('[data-studio-href="mapsUrl"]').forEach(function (a) {
          if (inv.mapsUrl) a.href = inv.mapsUrl;
        });

        document.querySelectorAll('[data-studio-img]').forEach(function (el) {
          var k = el.getAttribute('data-studio-img');
          var src = inv.photos && inv.photos[k];
          if (src) {
            if (el.tagName === 'IMG') el.src = src;
            else el.style.backgroundImage = "url('" + src.replace(/'/g, "\\'") + "')";
          }
        });

        // Update gallery items if custom gallery uploaded
        if (inv.photos && Array.isArray(inv.photos.gallery) && inv.photos.gallery.length > 0) {
          var galEls = document.querySelectorAll('.gal-item');
          galEls.forEach(function (gEl, idx) {
            var gSrc = inv.photos.gallery[idx % inv.photos.gallery.length];
            if (gSrc) {
              gEl.setAttribute('data-src', gSrc);
              gEl.style.backgroundImage = "url('" + gSrc.replace(/'/g, "\\'") + "')";
            }
          });
        }

        // Update Amplop Digital dynamically if #studioAmplopContainer or .bank-card exists
        var amplopSec = document.getElementById('kado') || document.getElementById('amplopSection');
        if (inv.amplop) {
          if (amplopSec && inv.amplop.enabled === false) {
            amplopSec.style.display = 'none';
          } else if (amplopSec) {
            amplopSec.style.display = '';
          }
          var amplopList = document.getElementById('studioAmplopList');
          if (amplopList && Array.isArray(inv.amplop.accounts)) {
            amplopList.innerHTML = '';
            inv.amplop.accounts.forEach(function (acc) {
              var card = document.createElement('div');
              card.className = 'card bank-card';
              card.innerHTML =
                '<div class="bank-row">' +
                  '<div class="bank-logo bca">' + (acc.bank || 'BANK') + '</div>' +
                  '<div class="bank-info">' +
                    '<div class="num">' + (acc.number || '') + '</div>' +
                    '<div class="an">a.n. ' + (acc.holder || '') + '</div>' +
                  '</div>' +
                  '<button type="button" class="copy-mini" data-copy="' + String(acc.number || '').replace(/\s+/g, '') + '">Salin</button>' +
                '</div>';
              amplopList.appendChild(card);
            });
            amplopList.querySelectorAll('.copy-mini').forEach(function (btn) {
              btn.addEventListener('click', function () {
                var txt = btn.getAttribute('data-copy');
                if (navigator.clipboard && navigator.clipboard.writeText) {
                  navigator.clipboard.writeText(txt);
                }
                var old = btn.textContent;
                btn.textContent = '✓ Tersalin';
                setTimeout(function () { btn.textContent = old; }, 1600);
              });
            });
          }
          var waBtn = document.getElementById('studioAmplopWa');
          if (waBtn && inv.amplop.whatsappConfirm) {
            var cleanWa = inv.amplop.whatsappConfirm.replace(/[^0-9]/g, '');
            waBtn.href = 'https://wa.me/' + cleanWa + '?text=' + encodeURIComponent('Halo, saya sudah transfer tanda kasih untuk ' + pairTitle);
          }
        }

        // Update RSVP & Wishes dynamically
        var rsvpSec = document.getElementById('rsvp') || document.getElementById('rsvpSection');
        if (inv.rsvp) {
          if (rsvpSec && inv.rsvp.enabled === false) {
            rsvpSec.style.display = 'none';
          } else if (rsvpSec) {
            rsvpSec.style.display = '';
          }
          var dlEl = document.getElementById('studioRsvpDeadline');
          if (dlEl && inv.rsvp.deadline) {
            dlEl.textContent = formatIndonesianDate(inv.rsvp.deadline);
          }
        }

        // Render saved wishes from StudioBackend
        var wishListEl = document.getElementById('wishList');
        if (wishListEl) {
          var savedRsvps = StudioBackend.getRsvps(inv.id);
          if (savedRsvps && savedRsvps.length > 0) {
            wishListEl.innerHTML = '';
            savedRsvps.forEach(function (r) {
              if (!r.message) return;
              var w = document.createElement('div');
              w.className = 'wish';
              var b = document.createElement('b');
              b.textContent = r.name + ' · ' + (r.status || 'Hadir');
              var p = document.createElement('p');
              p.textContent = r.message;
              w.appendChild(b);
              w.appendChild(p);
              wishListEl.appendChild(w);
            });
          }
        }

        // Hook RSVP Form submission to save into StudioBackend
        var rsvpForm = document.getElementById('rsvpForm');
        if (rsvpForm && !rsvpForm.getAttribute('data-studio-hooked')) {
          rsvpForm.setAttribute('data-studio-hooked', '1');
          rsvpForm.addEventListener('submit', function () {
            var guestNameEl = document.getElementById('rName') || document.getElementById('guestName');
            var nameVal = guestNameEl
              ? (guestNameEl.value || guestNameEl.textContent || 'Tamu Undangan')
              : 'Tamu Undangan';
            var msgEl = document.getElementById('rsvpMsg') || document.getElementById('wMsg');
            var msgVal = msgEl ? msgEl.value : 'Selamat & sukses atas acaranya!';
            var activePill = document.querySelector('.pill.active');
            var attendSelect = document.getElementById('rAttend');
            var statusVal = activePill
              ? activePill.getAttribute('data-val')
              : (attendSelect ? (attendSelect.value.indexOf('Hadir') > -1 ? 'Hadir' : 'Tidak Hadir') : 'Hadir');
            var countEl = document.getElementById('rCount');
            var guestsVal = countEl ? parseInt(countEl.value, 10) || 1 : 1;

            StudioBackend.addRsvp({
              invitationId: inv.id,
              name: nameVal,
              status: statusVal,
              guests: guestsVal,
              message: msgVal
            });
          });
        }
      } catch (e) {
        console.warn('StudioBackend hydrate warning:', e);
      }
    }
  };

  window.StudioBackend = StudioBackend;
})(window);
