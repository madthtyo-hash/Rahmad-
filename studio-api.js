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
      adminWhatsapp: '6285196755675',
      defaultCurrency: 'IDR',
      // Lagu yang diputar di halaman depan (index.html) — bisa diubah dari Studio.
      frontMusic: 'musik/romantis.mp3'
    },
    invitations: [
      {
        id: 'sage-rahma-dika',
        slug: 'rahma-dika',
        category: 'pernikahan',
        theme: 'Sage Blossom',
        themeFile: 'undangan-sage.html',
        isPremium: false,
        reviewStatus: 'disetujui',
        reviewNote: "",
        reviewedAt: '2026-09-28T09:12:00.000Z',
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
        musicUrl: 'musik/romantis.mp3',
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
          whatsappConfirm: '6285196755675',
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
        reviewStatus: 'disetujui',
        reviewNote: "",
        reviewedAt: '2026-09-29T14:05:00.000Z',
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
        musicUrl: 'musik/jawa.mp3',
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
          whatsappConfirm: '6285196755675',
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
        reviewStatus: 'menunggu',
        reviewNote: "",
        reviewedAt: '',
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
        musicUrl: 'musik/romantis.mp3',
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
          whatsappConfirm: '6285196755675',
          giftAddress: 'Jl. Asia Afrika No. 112, Bandung',
          accounts: [
            { id: 'acc-5', bank: 'BCA', number: '1234567890', holder: 'Raka Aditya Pratama' },
            { id: 'acc-6', bank: 'GoPay', number: '087890001122', holder: 'Laras Ayu Wulandari' }
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
        reviewStatus: 'disetujui',
        reviewNote: "Klien minta foto cover diganti ke foto pre-wedding.",
        reviewedAt: '2026-09-30T10:40:00.000Z',
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
        musicUrl: 'musik/romantis.mp3',
        photos: {
          cover: 'foto-premium-cover.jpg',
          photo1: 'foto-premium-cover.jpg',
          photo2: 'foto-premium-cover.jpg',
          gallery: [
            'foto-premium-cover.jpg',
            'foto-cover.jpg',
            'foto-rahma-cover.jpg',
            'foto-premium-cover.jpg'
          ]
        },
        amplop: {
          enabled: true,
          note: 'Doa restu Bapak/Ibu/Saudara/i merupakan karunia terindah. Bagi yang ingin mengirimkan tanda kasih:',
          whatsappConfirm: '6285196755675',
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
        reviewStatus: 'disetujui',
        reviewNote: "",
        reviewedAt: '2026-09-27T08:20:00.000Z',
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
        musicUrl: 'musik/khitanan.mp3',
        photos: {
          cover: 'foto-khitanan-cover.jpg',
          photo1: 'foto-khitanan-cover.jpg',
          photo2: 'foto-khitanan-cover.jpg',
          gallery: [
            'foto-khitanan-cover.jpg',
            'foto-cover.jpg',
            'foto-rahma-cover.jpg',
            'foto-khitanan-cover.jpg'
          ]
        },
        amplop: {
          enabled: true,
          note: 'Terima kasih atas doa restu Bapak/Ibu/Saudara/i untuk ananda Zidan. Tanda kasih digital dapat dikirimkan melalui:',
          whatsappConfirm: '6285196755675',
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
        reviewStatus: 'menunggu',
        reviewNote: "",
        reviewedAt: '',
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
        musicUrl: 'musik/pesta.mp3',
        photos: {
          cover: 'foto-ultah-cover.jpg',
          photo1: 'foto-ultah-cover.jpg',
          photo2: 'foto-ultah-cover.jpg',
          gallery: [
            'foto-ultah-cover.jpg',
            'foto-cover.jpg',
            'foto-jawa-cover.jpg',
            'foto-ultah-cover.jpg'
          ]
        },
        amplop: {
          enabled: true,
          note: 'Kehadiran teman-teman adalah hadiah paling seru! Jika ingin mengirimkan kado atau angpau ulang tahun untuk Kanaya:',
          whatsappConfirm: '6285196755675',
          giftAddress: 'Jl. Progo No. 16, Bandung (Rumah Kanaya)',
          accounts: [
            { id: 'acc-11', bank: 'BCA', number: '4321098765', holder: 'Raisa Andriana' },
            { id: 'acc-12', bank: 'GoPay', number: '085196755675', holder: 'Dimas Anggara' }
          ]
        },
        rsvp: {
          enabled: true,
          deadline: '2026-11-05',
          maxGuests: 4,
          allowWishes: true,
          requirePhone: false
        }
      },
      {
        id: 'iceblue-adi-lina',
        slug: 'iceblue-adi-lina',
        category: 'pernikahan',
        theme: 'Ice Blue Floral ❄',
        themeFile: 'undangan-iceblue.html',
        isPremium: false,
        reviewStatus: 'menunggu',
        reviewNote: "",
        reviewedAt: '',
        status: 'Aktif',
        views: 76,
        title: 'The Wedding Of',
        primaryName: 'Adi',
        secondaryName: 'Lina',
        fullName1: 'Adi Fadillah, S.T.',
        parents1: 'Putra dari Bapak H. Fadillah & Ibu Hj. Nurhayati',
        fullName2: 'Lina Marlina, S.E.',
        parents2: 'Putri dari Bapak M. Soleh & Ibu Siti Aminah',
        quote: 'Dan di antara tanda-tanda kekuasaan-Nya, Dia menciptakan untukmu pasangan dari jenismu sendiri, supaya kamu merasa tenteram dan tenang bersamanya. (Ar-Rum: 21)',
        eventDate: '2026-12-14',
        akadTime: '08.00 – 10.00 WIB',
        resepsiTime: '11.00 – 14.00 WIB',
        venueName: 'The Ice Blue Hall',
        venueAddress: 'Jl. Gatot Subroto No. 21, Jakarta Selatan',
        mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Gatot+Subroto+Jakarta',
        navMode: 'scroll',
        fxMode: 'salju',
        musicUrl: 'musik/romantis.mp3',
        photos: {
          cover: 'foto-iceblue-cover.jpg',
          photo1: 'foto-iceblue-cover.jpg',
          photo2: 'foto-cover.jpg',
          gallery: ['foto-iceblue-cover.jpg', 'foto-cover.jpg', 'foto-rahma-cover.jpg', 'foto-jawa-cover.jpg', 'foto-premium-cover.jpg']
        },
        amplop: {
          enabled: true,
          note: 'Kehadiran dan doa Anda adalah hadiah terindah. Namun jika ingin berbagi tanda kasih, kami sediakan dengan tulus hati:',
          whatsappConfirm: '6285196755675',
          giftAddress: 'Jl. Gatot Subroto No. 21, Jakarta Selatan',
          accounts: [{
  id: 'acc-13',
  bank: 'BCA',
  number: '8830456712',
  holder: 'Adi Fadillah'
}, {
  id: 'acc-14',
  bank: 'DANA',
  number: '089612345670',
  holder: 'Lina Marlina'
}]
        },
        rsvp: {
          enabled: true,
          deadline: '2026-12-05',
          maxGuests: 4,
          allowWishes: true,
          requirePhone: false
        }
      },
      {
        id: 'iceblue-khitanan-alif',
        slug: 'iceblue-khitanan-alif',
        category: 'khitanan',
        theme: 'Ice Blue Barakah ❄',
        themeFile: 'undangan-iceblue-khitanan.html',
        isPremium: false,
        reviewStatus: 'revisi',
        reviewNote: "Tambah 1 rekening lagi & sesuaikan jam resepsi dengan undangan cetak.",
        reviewedAt: '2026-10-01T13:15:00.000Z',
        status: 'Aktif',
        views: 58,
        title: 'Walimatul Khitan',
        primaryName: 'M. Alif Fadhlan',
        secondaryName: 'Usia 8 Tahun',
        fullName1: 'Muhammad Alif Fadhlan',
        parents1: 'Putra dari Bapak Andri Saputra & Ibu Fitri Handayani',
        fullName2: 'Usia 8 Tahun',
        parents2: 'Dress Code: Putih, Biru Langit & Silver',
        quote: 'Ya Allah, jadikanlah ia anak yang sholeh, berbakti kepada kedua orang tua, dan bermanfaat bagi agama serta bangsanya.',
        eventDate: '2026-11-22',
        akadTime: '09.00 – 11.00 WIB (Prosesi Khitan & Doa)',
        resepsiTime: '11.00 – 14.00 WIB (Syukuran & Makan Bersama)',
        venueName: 'Aula Al-Ikhlas',
        venueAddress: 'Jl. Cihampelas No. 88, Bandung',
        mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Aula+Al-Ikhlas+Bandung',
        navMode: 'scroll',
        fxMode: 'salju',
        musicUrl: 'musik/khitanan.mp3',
        photos: {
          cover: 'foto-iceblue-khitanan-cover.jpg',
          photo1: 'foto-iceblue-khitanan-cover.jpg',
          photo2: 'foto-khitanan-cover.jpg',
          gallery: ['foto-iceblue-khitanan-cover.jpg', 'foto-khitanan-cover.jpg', 'foto-cover.jpg', 'foto-rahma-cover.jpg']
        },
        amplop: {
          enabled: true,
          note: 'Kehadiran dan doa Anda adalah hadiah terindah. Namun jika ingin berbagi tanda kasih untuk ananda, kami sediakan dengan tulus hati:',
          whatsappConfirm: '6285196755675',
          giftAddress: 'Jl. Cihampelas No. 88, Bandung',
          accounts: [{
  id: 'acc-15',
  bank: 'BSI',
  number: '7112233445',
  holder: 'Andri Saputra'
}, {
  id: 'acc-16',
  bank: 'GoPay',
  number: '089612345671',
  holder: 'Fitri Handayani'
}]
        },
        rsvp: {
          enabled: true,
          deadline: '2026-11-15',
          maxGuests: 4,
          allowWishes: true,
          requirePhone: false
        }
      },
      {
        id: 'iceblue-ultah-kalila',
        slug: 'iceblue-ultah-kalila',
        category: 'ultah',
        theme: 'Ice Blue Party 🎂',
        themeFile: 'undangan-iceblue-ultah.html',
        isPremium: false,
        reviewStatus: 'menunggu',
        reviewNote: "",
        reviewedAt: '',
        status: 'Aktif',
        views: 92,
        title: '8th Birthday Party',
        primaryName: 'Kalila Zahra',
        secondaryName: 'Turning 8!',
        fullName1: 'Kalila Zahra Aqila',
        parents1: 'Putri dari Bapak Rizky Pratama & Ibu Anisa Rahmawati',
        fullName2: 'Turning 8 Years Old',
        parents2: 'Dress Code: Ice Blue, White & Silver',
        quote: 'Yuk datang dan rayakan ulang tahun Kalila yang ke-8! Ada ice cream party, games seru, sulap, tiup lilin, dan goodie bag spesial!',
        eventDate: '2026-12-06',
        akadTime: '15.00 – 16.30 WIB (Games & Ice Cream Party)',
        resepsiTime: '16.30 – 19.00 WIB (Tiup Lilin, Potong Kue & Dinner)',
        venueName: 'Frosty Garden Cafe',
        venueAddress: 'Jl. Dago Pakar No. 45, Bandung',
        mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Dago+Pakar+Bandung',
        navMode: 'scroll',
        fxMode: 'salju',
        musicUrl: 'musik/pesta.mp3',
        photos: {
          cover: 'foto-iceblue-ultah-cover.jpg',
          photo1: 'foto-iceblue-ultah-cover.jpg',
          photo2: 'foto-ultah-cover.jpg',
          gallery: ['foto-iceblue-ultah-cover.jpg', 'foto-ultah-cover.jpg', 'foto-cover.jpg', 'foto-rahma-cover.jpg']
        },
        amplop: {
          enabled: true,
          note: 'Kehadiran dan doa kamu adalah hadiah paling seru! Jika ingin mengirimkan kado atau angpau ulang tahun untuk Kalila, kami sediakan dengan tulus hati:',
          whatsappConfirm: '6285196755675',
          giftAddress: 'Jl. Dago Pakar No. 45, Bandung (Rumah Kalila)',
          accounts: [{
  id: 'acc-17',
  bank: 'BCA',
  number: '7788990012',
  holder: 'Rizky Pratama'
}, {
  id: 'acc-18',
  bank: 'DANA',
  number: '089612345672',
  holder: 'Anisa Rahmawati'
}]
        },
        rsvp: {
          enabled: true,
          deadline: '2026-11-30',
          maxGuests: 4,
          allowWishes: true,
          requirePhone: false
        }
      },
      {
        id: 'midnight-dirga-amara',
        slug: 'dirga-amara',
        category: 'pernikahan',
        theme: 'Midnight Emerald 🌙',
        themeFile: 'undangan-midnight.html',
        isPremium: false,
        reviewStatus: 'disetujui',
        reviewNote: "",
        reviewedAt: '2026-10-01T09:05:00.000Z',
        status: 'Aktif',
        views: 76,
        title: 'The Wedding Of',
        primaryName: 'Dirga',
        secondaryName: 'Amara',
        fullName1: 'Dirga Mahendra, S.T.',
        parents1: 'Putra dari Bapak Hendra Wijaya & Ibu Ratna Kusuma',
        fullName2: 'Amara Larasati, S.Psi.',
        parents2: 'Putri dari Bapak Surya Atmaja & Ibu Dewi Anggraini',
        quote: 'Bersama dalam cinta, menuju ridha-Nya. Kami mengundang Anda untuk menjadi saksi janji suci kami.',
        eventDate: '2026-11-21',
        akadTime: '08.00 – 10.00 WIB',
        resepsiTime: '11.00 – 14.00 WIB',
        venueName: 'Emerald Hall',
        venueAddress: 'Jl. Riau No. 88, Bandung',
        mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Riau+Bandung',
        navMode: 'scroll',
        fxMode: 'bintang',
        musicUrl: 'musik/romantis.mp3',
        photos: {
          cover: 'foto-midnight-cover.jpg',
          photo1: 'foto-midnight-cover.jpg',
          photo2: 'foto-cover.jpg',
          gallery: ['foto-midnight-cover.jpg', 'foto-cover.jpg', 'foto-rahma-cover.jpg', 'foto-jawa-cover.jpg']
        },
        amplop: {
          enabled: true,
          note: 'Doa dan kehadiran Anda adalah hadiah terindah bagi kami. Namun jika ingin memberi tanda kasih, kami sediakan dengan tulus hati:',
          whatsappConfirm: '6285196755675',
          giftAddress: 'Jl. Riau No. 88, Bandung',
          accounts: [{
  id: 'acc-19',
  bank: 'BCA',
  number: '7788123409',
  holder: 'Dirga Mahendra'
}, {
  id: 'acc-20',
  bank: 'DANA',
  number: '081322114455',
  holder: 'Amara Larasati'
}]
        },
        rsvp: {
          enabled: true,
          deadline: '2026-11-14',
          maxGuests: 4,
          allowWishes: true,
          requirePhone: false
        }
      },
      {
        id: 'aqiqah-ghani',
        slug: 'aqiqah-ghani',
        category: 'aqiqah',
        theme: 'Aqiqah Rahmah 🍼',
        themeFile: 'undangan-aqiqah.html',
        isPremium: false,
        reviewStatus: 'menunggu',
        reviewNote: "",
        reviewedAt: '',
        status: 'Aktif',
        views: 64,
        title: 'Tasyakuran Aqiqah',
        primaryName: 'Muhammad Ghani Alaric',
        secondaryName: 'Aqiqah & Tasyakuran',
        fullName1: 'Muhammad Ghani Alaric',
        parents1: 'Putra dari Bapak Fajar Nugraha & Ibu Salsabila Putri',
        fullName2: 'Aqiqah & Tasyakuran ✨',
        parents2: 'Turut mengundang: Keluarga Besar H. Sudirman & Keluarga',
        quote: 'Alhamdulillah, telah lahir buah hati kami. Dengan penuh rasa syukur, kami bermaksud menyelenggarakan tasyakuran aqiqah.',
        eventDate: '2026-11-08',
        akadTime: '08.00 – 10.00 WIB (Prosesi Aqiqah)',
        resepsiTime: '10.00 – 13.00 WIB (Tasyakuran & Ramah Tamah)',
        venueName: 'Masjid Nurul Iman',
        venueAddress: 'Jl. Cihampelas No. 120, Bandung',
        mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Cihampelas+Bandung',
        navMode: 'scroll',
        fxMode: 'kelopak',
        musicUrl: 'musik/aqiqah.mp3',
        photos: {
          cover: 'foto-aqiqah-cover.jpg',
          photo1: 'foto-aqiqah-cover.jpg',
          photo2: 'foto-cover.jpg',
          gallery: ['foto-aqiqah-cover.jpg', 'foto-cover.jpg', 'foto-rahma-cover.jpg', 'foto-khitanan-cover.jpg']
        },
        amplop: {
          enabled: true,
          note: 'Kehadiran dan doa Anda sudah sangat berarti bagi kami. Namun jika ingin memberi tanda kasih untuk ananda, kami sediakan dengan tulus hati:',
          whatsappConfirm: '6285196755675',
          giftAddress: 'Jl. Cihampelas No. 120, Bandung (Kediaman Keluarga Fajar)',
          accounts: [{
  id: 'acc-21',
  bank: 'BSI',
  number: '7211558809',
  holder: 'Fajar Nugraha'
}, {
  id: 'acc-22',
  bank: 'GoPay',
  number: '085196755675',
  holder: 'Salsabila Putri'
}]
        },
        rsvp: {
          enabled: true,
          deadline: '2026-11-01',
          maxGuests: 4,
          allowWishes: true,
          requirePhone: false
        }
      },
      {
        id: 'wisuda-naura',
        slug: 'wisuda-naura',
        category: 'wisuda',
        theme: 'Grand Graduation 🎓',
        themeFile: 'undangan-wisuda.html',
        isPremium: false,
        reviewStatus: 'disetujui',
        reviewNote: "Link peta sudah dites dari HP — aman.",
        reviewedAt: '2026-10-02T11:30:00.000Z',
        status: 'Aktif',
        views: 58,
        title: 'Undangan Wisuda',
        primaryName: 'Naura Safira, S.Ked',
        secondaryName: 'Wisuda & Syukuran',
        fullName1: 'Naura Safira, S.Ked',
        parents1: 'Putri dari Bapak Drs. Ahmad Fauzi & Ibu Hj. Lilis Suryani',
        fullName2: 'Sarjana Kedokteran · IPK 3,86',
        parents2: 'Program Studi Pendidikan Dokter · Universitas Nusantara',
        quote: 'Dengan penuh rasa syukur atas terselesaikannya masa studi, kami bermaksud mengundang Anda untuk hadir pada prosesi wisuda dan syukuran kelulusan.',
        eventDate: '2026-12-05',
        akadTime: '08.00 – 11.00 WIB (Prosesi Wisuda)',
        resepsiTime: '12.00 – 15.00 WIB (Syukuran & Ramah Tamah)',
        venueName: 'Graha Sabha Universitas Nusantara',
        venueAddress: 'Jl. Dipatiukur No. 112, Bandung',
        mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Dipatiukur+Bandung',
        navMode: 'scroll',
        fxMode: 'konfeti',
        musicUrl: 'musik/wisuda.mp3',
        photos: {
          cover: 'foto-wisuda-cover.jpg',
          photo1: 'foto-wisuda-cover.jpg',
          photo2: 'foto-cover.jpg',
          gallery: ['foto-wisuda-cover.jpg', 'foto-cover.jpg', 'foto-rahma-cover.jpg', 'foto-premium-cover.jpg']
        },
        amplop: {
          enabled: true,
          note: 'Kehadiran dan doa Anda adalah hadiah terbaik. Namun jika ingin memberi tanda kasih untuk wisudawan, kami sediakan dengan tulus hati:',
          whatsappConfirm: '6285196755675',
          giftAddress: 'Jl. Setiabudi No. 45, Bandung (Kediaman Keluarga Fauzi)',
          accounts: [{
  id: 'acc-23',
  bank: 'BCA',
  number: '8830912277',
  holder: 'Naura Safira'
}, {
  id: 'acc-24',
  bank: 'GoPay',
  number: '081344557788',
  holder: 'Naura Safira'
}]
        },
        rsvp: {
          enabled: true,
          deadline: '2026-11-28',
          maxGuests: 4,
          allowWishes: true,
          requirePhone: false
        }
      },
      {
        id: 'platinum-revan-kiara',
        slug: 'revan-kiara',
        category: 'premium',
        theme: 'Platinum Marble 👑',
        themeFile: 'undangan-platinum.html',
        isPremium: true,
        reviewStatus: 'revisi',
        reviewNote: "Tamu VIP menunggu daftar kursi gala dinner diisi.",
        reviewedAt: '2026-10-02T16:45:00.000Z',
        status: 'Aktif',
        views: 121,
        title: 'The Wedding Of',
        primaryName: 'Revan',
        secondaryName: 'Kiara',
        fullName1: 'Revan Dirgantara, M.B.A.',
        parents1: 'Putra dari Bapak Ir. Hendarto Dirgantara & Ibu Dra. Sri Wahyuni',
        fullName2: 'Kiara Anindita, S.Ars.',
        parents2: 'Putri dari Bapak Dr. Bambang Sutrisno & Ibu Hj. Ratih Purnamasari',
        quote: 'Dengan memohon rahmat dan ridha Allah SWT, kami bermaksud menyelenggarakan pernikahan putra-putri kami, dan dengan hormat mengundang Anda pada acara tersebut.',
        eventDate: '2026-12-12',
        akadTime: '09.00 – 11.00 WIB',
        resepsiTime: '18.00 – 21.30 WIB (Gala Dinner)',
        venueName: 'The Platinum Ballroom',
        venueAddress: 'Jl. Jend. Sudirman Kav. 52, Jakarta Selatan',
        mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Sudirman+Jakarta',
        navMode: 'scroll',
        fxMode: 'kilau',
        musicUrl: 'musik/romantis.mp3',
        photos: {
          cover: 'foto-platinum-cover.jpg',
          photo1: 'foto-platinum-cover.jpg',
          photo2: 'foto-cover.jpg',
          gallery: ['foto-platinum-cover.jpg', 'foto-cover.jpg', 'foto-premium-cover.jpg', 'foto-rahma-cover.jpg']
        },
        amplop: {
          enabled: true,
          note: 'Kehadiran dan doa Anda adalah hadiah terindah. Namun jika ingin berbagi tanda kasih, kami sediakan dengan tulus hati:',
          whatsappConfirm: '6285196755675',
          giftAddress: 'The Platinum Ballroom, Jl. Jend. Sudirman Kav. 52, Jakarta Selatan',
          accounts: [{
  id: 'acc-25',
  bank: 'BCA Prioritas',
  number: '8890221144',
  holder: 'Revan Dirgantara'
}, {
  id: 'acc-26',
  bank: 'Mandiri',
  number: '1310099887766',
  holder: 'Kiara Anindita'
}]
        },
        rsvp: {
          enabled: true,
          deadline: '2026-12-05',
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
      },
      {
        id: 'rsvp-7',
        invitationId: 'iceblue-adi-lina',
        name: 'Keluarga Bapak Hendra',
        status: 'Hadir',
        guests: 3,
        phone: '081900112233',
        message: 'Barakallah Adi & Lina! Tema Ice Blue-nya elegan banget 🤍',
        createdAt: '2026-10-02T11:00:00.000Z'
      },
      {
        id: 'rsvp-8',
        invitationId: 'iceblue-khitanan-alif',
        name: 'Ustadz Rahmat & Keluarga',
        status: 'Hadir',
        guests: 4,
        phone: '081755667788',
        message: 'Barakallah ananda Alif, semoga menjadi anak sholeh dan hafal Qur\'an.',
        createdAt: '2026-10-02T11:30:00.000Z'
      },
      {
        id: 'rsvp-9',
        invitationId: 'iceblue-ultah-kalila',
        name: 'Alya & Mama',
        status: 'Hadir',
        guests: 2,
        phone: '081987654321',
        message: 'Happy 8th Birthday Kalila cantik! Nggak sabar ikut ice cream party-nya 🎂',
        createdAt: '2026-10-02T12:05:00.000Z'
      },
      {
        id: 'rsvp-10',
        invitationId: 'midnight-dirga-amara',
        name: 'Keluarga Hartono',
        status: 'Hadir',
        guests: 3,
        phone: '081233445566',
        message: 'Barakallahu lakuma wa baraka alaikuma. Selamat menempuh hidup baru, Dirga & Amara 🤍',
        createdAt: '2026-10-02T13:40:00.000Z'
      },
      {
        id: 'rsvp-11',
        invitationId: 'aqiqah-ghani',
        name: 'Teh Nabila & Keluarga',
        status: 'Hadir',
        guests: 2,
        phone: '081900112233',
        message: 'Selamat atas aqiqah ananda Ghani. Semoga menjadi anak sholeh dan berbakti kepada orang tua.',
        createdAt: '2026-10-02T14:15:00.000Z'
      },
      {
        id: 'rsvp-12',
        invitationId: 'wisuda-naura',
        name: 'Teman Seangkatan',
        status: 'Hadir',
        guests: 2,
        phone: '081755443322',
        message: 'Congrats dok! Akhirnya lulus juga. See you di hari wisuda ya 🎉',
        createdAt: '2026-10-02T15:05:00.000Z'
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
  var sudahSyncSaatHydrate = false;

  // Tamu yang membuka link dari perangkat lain belum punya cache Studio — segarkan sekali
  // dari server/cloud/berkas data, lalu terapkan ulang supaya undangan yang tampil adalah
  // versi terbaru (mode navigasi, efek, nama, foto, lokasi, dsb).
  function segarkanSaatHydrate(defaultInvId) {
    if (sudahSyncSaatHydrate) return;
    sudahSyncSaatHydrate = true;
    setTimeout(function () {
      Promise.resolve()
        .then(function () { return syncFromServer(); })
        .then(function (res) {
          if (res && res.db) {
            try { StudioBackend.hydrateInvitationPage(defaultInvId); } catch (e) { /* pakai yang sudah tampil */ }
          }
        })
        .catch(function () { /* tetap pakai data yang sudah tampil */ });
    }, 80);
  }

  async function syncFromServer() {
    // 1. Supabase Cloud (kalau dikonfigurasi) — sumber data terpusat
    await loadCloudConfig();
    if (cloudConfigured()) {
      var pulled = await pullFromCloud();
      if (pulled.ok) {
        backendOnline = true;
        return { online: true, mode: 'Supabase Cloud', db: pulled.db };
      }
    }
    // 2. REST API Server Node (kalau dijalankan via `node server.js`)
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

  /* ============================================================
     SUPABASE CLOUD (opsional) — lihat supabase/schema.sql
     Kalau supabase-config.json belum diisi, semua fungsi di bawah
     otomatis nonaktif dan website tetap jalan seperti biasa.
     ============================================================ */
  var CLOUD_CONFIG_URL = 'supabase-config.json';
  var cloudConfig = null;
  var cloudOnline = false;
  var cloudLastSync = null;

  var ATTENDANCE_TO_CLOUD = { 'Hadir': 'hadir', 'Tidak Hadir': 'tidak_hadir', 'Masih Ragu': 'ragu' };
  var ATTENDANCE_FROM_CLOUD = { 'hadir': 'Hadir', 'tidak_hadir': 'Tidak Hadir', 'ragu': 'Masih Ragu' };

  function cloudKey() {
    if (!cloudConfig) return '';
    // Terima anon key lama (JWT "eyJ...") maupun Publishable key baru ("sb_publishable_...")
    return cloudConfig.anonKey || cloudConfig.publishableKey || '';
  }

  function cloudKeyInfo() {
    var key = cloudKey();
    if (!key) return { type: 'kosong' };
    if (/^sb_secret_/.test(key)) return { type: 'secret', bahaya: true };
    if (/^sb_publishable_/.test(key)) return { type: 'publishable' };
    if (/^eyJ/.test(key)) {
      var role = '';
      try {
        var payload = key.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        role = JSON.parse(atob(payload + '==='.slice((payload.length + 3) % 4))).role || '';
      } catch (e) { role = ''; }
      return { type: 'jwt-legacy', role: role, bahaya: role === 'service_role' };
    }
    return { type: 'tidak dikenal' };
  }

  function cloudConfigured() {
    if (!cloudConfig || !cloudConfig.url || !cloudKey()) return false;
    if (cloudConfig.enabled === false) return false;
    if (cloudKeyInfo().bahaya) {
      console.error('Kartu Digital: kunci RAHASIA (secret/service_role) terdeteksi di supabase-config.json. ' +
        'Kunci itu mem-bypass keamanan database dan TIDAK BOLEH dipublikasikan. Gunakan Publishable/anon key.');
      return false;
    }
    return true;
  }

  function cloudTable(name) {
    var custom = cloudConfig && cloudConfig.tables && cloudConfig.tables[name];
    return custom || name;
  }

  function cloudHeaders(extra) {
    var key = cloudKey();
    var headers = {
      'apikey': key,
      'Accept': 'application/json'
    };
    // Kunci lama (anon/service_role) berbentuk JWT → wajib juga dikirim sebagai Bearer.
    // Kunci baru (sb_publishable_...) BUKAN JWT → cukup di header apikey.
    if (/^eyJ[\w-]*\./.test(key)) {
      headers['Authorization'] = 'Bearer ' + key;
    }
    if (extra) {
      Object.keys(extra).forEach(function (k) { headers[k] = extra[k]; });
    }
    return headers;
  }

  async function loadCloudConfig(force) {
    if (cloudConfig && !force) return cloudConfig;
    try {
      var res = await fetch(CLOUD_CONFIG_URL + (force ? '?v=' + Date.now() : ''), { cache: 'no-store' });
      cloudConfig = res.ok ? (await res.json()) || {} : {};
    } catch (e) {
      cloudConfig = {};
    }
    if (cloudConfig.url) cloudConfig.url = String(cloudConfig.url).replace(/\/+$/, '');
    return cloudConfig;
  }

  async function cloudRest(path, options) {
    if (!cloudConfigured()) return { ok: false, error: 'Supabase belum dikonfigurasi' };
    options = options || {};
    var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, 12000) : null;
    try {
      var res = await fetch(cloudConfig.url + '/rest/v1/' + path, {
        method: options.method || 'GET',
        headers: cloudHeaders(options.headers),
        body: options.body ? JSON.stringify(options.body) : undefined,
        cache: 'no-store',
        signal: ctrl ? ctrl.signal : undefined
      });
      if (timer) clearTimeout(timer);
      var text = await res.text();
      var data = null;
      if (text) {
        try { data = JSON.parse(text); } catch (e) { data = text; }
      }
      cloudOnline = res.ok;
      if (res.ok) cloudLastSync = new Date().toISOString();
      return {
        ok: res.ok,
        status: res.status,
        data: data,
        error: res.ok ? null : ((data && data.message) || ('HTTP ' + res.status))
      };
    } catch (e) {
      if (timer) clearTimeout(timer);
      cloudOnline = false;
      var msg = (e && e.name === 'AbortError') ? 'Koneksi ke Supabase timeout' : ((e && e.message) || 'Gagal terhubung ke Supabase');
      return { ok: false, error: msg };
    }
  }

  function invitationToRow(inv) {
    var isCouple = inv.category === 'pernikahan' || inv.category === 'premium';
    return {
      slug: inv.slug || inv.id,
      external_id: inv.id || inv.slug,
      event_type: inv.category === 'premium' ? 'pernikahan' : (inv.category || 'pernikahan'),
      theme: inv.theme || null,
      theme_file: inv.themeFile || null,
      is_premium: !!inv.isPremium,
      status: inv.status || 'Aktif',
      views: Number(inv.views) || 0,
      title: inv.title || null,
      groom_name: isCouple ? (inv.primaryName || null) : null,
      bride_name: isCouple ? (inv.secondaryName || null) : null,
      child_name: isCouple ? null : (inv.primaryName || null),
      parents_name: inv.parents1 || null,
      quote: inv.quote || null,
      event_date: inv.eventDate || null,
      akad_time: inv.akadTime || null,
      resepsi_time: inv.resepsiTime || null,
      venue_name: inv.venueName || null,
      venue_maps: inv.mapsUrl || null,
      music_url: inv.musicUrl || null,
      payload: inv
    };
  }

  function rowToInvitation(row) {
    var base = (row.payload && typeof row.payload === 'object' && Object.keys(row.payload).length) ? clone(row.payload) : {};
    var inv = Object.assign({
      id: row.external_id || row.slug,
      slug: row.slug,
      category: row.event_type,
      theme: row.theme,
      themeFile: row.theme_file,
      isPremium: !!row.is_premium,
      status: row.status,
      views: row.views,
      title: row.title,
      primaryName: row.groom_name || row.child_name || '',
      secondaryName: row.bride_name || '',
      quote: row.quote || '',
      eventDate: row.event_date,
      akadTime: row.akad_time,
      resepsiTime: row.resepsi_time,
      venueName: row.venue_name,
      mapsUrl: row.venue_maps,
      musicUrl: row.music_url,
      photos: { cover: '', gallery: [] },
      amplop: { enabled: false, accounts: [] },
      rsvp: { enabled: true }
    }, base);
    if (inv.eventDate && String(inv.eventDate).length > 10) inv.eventDate = String(inv.eventDate).slice(0, 10);
    return inv;
  }

  function rsvpToRow(item, slugById) {
    return {
      external_id: item.id || ('rsvp-' + Date.now()),
      invitation_slug: (slugById && slugById[item.invitationId]) || item.invitationId || null,
      name: item.name || 'Tamu Undangan',
      attendance: ATTENDANCE_TO_CLOUD[item.status] || 'hadir',
      pax: Number(item.guests) || 1,
      phone: item.phone || null,
      message: item.message || null,
      created_at: item.createdAt || new Date().toISOString()
    };
  }

  function rowToRsvp(row, idBySlug) {
    return {
      id: row.external_id || ('rsvp-' + row.id),
      invitationId: (row.invitation_slug && idBySlug && idBySlug[row.invitation_slug]) || row.invitation_slug || '',
      name: row.name || 'Tamu Undangan',
      status: ATTENDANCE_FROM_CLOUD[row.attendance] || 'Hadir',
      guests: row.pax || 1,
      phone: row.phone || '',
      message: row.message || '',
      createdAt: row.created_at
    };
  }

  function slugMaps(db) {
    var slugById = {};
    var idBySlug = {};
    (db.invitations || []).forEach(function (inv) {
      slugById[inv.id] = inv.slug || inv.id;
      idBySlug[inv.slug || inv.id] = inv.id;
      if (inv.id) idBySlug[inv.id] = inv.id;
    });
    return { slugById: slugById, idBySlug: idBySlug };
  }

  async function pullFromCloud() {
    await loadCloudConfig();
    if (!cloudConfigured()) return { ok: false, error: 'Supabase belum dikonfigurasi (isi supabase-config.json)' };

    var invRes = await cloudRest(cloudTable('invitations') + '?select=*&order=created_at.asc');
    if (!invRes.ok) return { ok: false, error: invRes.error };

    var rsvpRes = await cloudRest(cloudTable('rsvp') + '?select=*&order=created_at.desc');
    // Catatan: daftar tamu (tabel guests) sengaja TIDAK dibaca dari browser.
    // Tabel itu hanya bisa ditambah dari Studio; isinya (termasuk nomor HP) tetap privat
    // supaya tidak bisa diunduh siapa pun yang punya kunci publik.

    var db = loadLocalDb();
    var maps = slugMaps(db);

    var cloudInvs = (invRes.data || []).map(rowToInvitation).filter(function (inv) {
      return inv && inv.id && inv.themeFile;
    });
    cloudInvs.forEach(function (cInv) {
      var idx = db.invitations.findIndex(function (i) { return i.id === cInv.id || i.slug === cInv.slug; });
      if (idx > -1) db.invitations[idx] = Object.assign({}, db.invitations[idx], cInv);
      else db.invitations.push(cInv);
    });

    var cloudRsvps = (rsvpRes.ok ? (rsvpRes.data || []) : []).map(function (row) { return rowToRsvp(row, maps.idBySlug); });
    cloudRsvps.forEach(function (cR) {
      var idx = db.rsvps.findIndex(function (r) { return r.id === cR.id; });
      if (idx > -1) db.rsvps[idx] = Object.assign({}, db.rsvps[idx], cR);
      else db.rsvps.unshift(cR);
    });

    var cloudGuests = [];

    saveLocalDb(db);
    return {
      ok: true,
      invitations: cloudInvs.length,
      rsvps: cloudRsvps.length,
      guests: cloudGuests.length,
      warning: rsvpRes.ok ? null : rsvpRes.error,
      db: db
    };
  }

  async function pushInvitationsToCloud(list) {
    var rows = list.map(invitationToRow);
    return cloudRest(cloudTable('invitations') + '?on_conflict=slug', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Prefer': 'resolution=merge-duplicates,return=minimal' },
      body: rows
    });
  }

  async function pushRsvpsToCloud(list, db) {
    var maps = slugMaps(db || loadLocalDb());
    var rows = list.map(function (item) { return rsvpToRow(item, maps.slugById); });
    return cloudRest(cloudTable('rsvp') + '?on_conflict=external_id', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Prefer': 'resolution=merge-duplicates,return=minimal' },
      body: rows
    });
  }

  async function pushGuestsToCloud(list) {
    if (!list || !list.length) return { ok: true, skipped: true };
    var rows = list.map(function (g) {
      return {
        invitation_slug: g.invitationId || g.slug || null,
        name: g.name,
        phone: g.phone || null,
        group_name: g.group || g.groupName || 'keluarga',
        slug_personal: g.slugPersonal || g.id || null
      };
    });
    return cloudRest(cloudTable('guests'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
      body: rows
    });
  }

  async function pushAllToCloud(db) {
    await loadCloudConfig();
    if (!cloudConfigured()) return { ok: false, error: 'Supabase belum dikonfigurasi (isi supabase-config.json)' };
    db = db || loadLocalDb();
    // Undangan bersifat read-only di cloud (kebijakan keamanan) — kalau ditolak,
    // RSVP & tamu tetap dikirim dan pengguna diberi catatan, bukan error total.
    var invRes = await pushInvitationsToCloud(db.invitations || []);
    var rsvpRes = await pushRsvpsToCloud(db.rsvps || [], db);
    var notes = [];
    if (!invRes.ok) notes.push('undangan tidak ikut terkirim (cloud read-only): ' + (invRes.error || 'ditolak'));
    if (!rsvpRes.ok) notes.push('RSVP gagal: ' + (rsvpRes.error || 'ditolak'));
    var sukses = rsvpRes.ok || invRes.ok;
    return {
      ok: sukses,
      invitations: invRes.ok ? (db.invitations || []).length : 0,
      rsvps: rsvpRes.ok ? (db.rsvps || []).length : 0,
      warning: notes.length ? notes.join(' · ') : null,
      error: sukses ? null : (rsvpRes.error || invRes.error)
    };
  }

  // Isi daftar ucapan (#wishList) dari data RSVP yang tersimpan
  function renderWishList(inv) {
    var wishListEl = document.getElementById('wishList');
    if (!wishListEl || !inv) return;
    var savedRsvps = StudioBackend.getRsvps(inv.id);
    if (!savedRsvps || !savedRsvps.length) return;
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

  var cloudApi = {
    init: async function (force) {
      await loadCloudConfig(force);
      return cloudApi.status();
    },
    isConfigured: cloudConfigured,
    status: function () {
      var info = cloudKeyInfo();
      var pesan = null;
      if (!cloudConfig || !cloudConfig.url || !cloudKey()) {
        pesan = 'Supabase belum dikonfigurasi — isi url & anonKey di supabase-config.json';
      } else if (cloudConfig.enabled === false) {
        pesan = 'Supabase dimatikan (enabled:false) di supabase-config.json';
      } else if (info.bahaya) {
        pesan = 'Kunci RAHASIA terdeteksi! Ganti dengan Publishable/anon key — jangan pakai sb_secret_ / service_role.';
      }
      return {
        configured: cloudConfigured(),
        online: cloudOnline,
        url: cloudConfig ? (cloudConfig.url || '') : '',
        lastSync: cloudLastSync,
        keyType: info.type,
        keyRole: info.role || null,
        pesan: pesan
      };
    },
    test: async function () {
      await loadCloudConfig(true);
      var st = cloudApi.status();
      if (!st.configured) return { ok: false, error: st.pesan || 'Supabase belum dikonfigurasi (isi supabase-config.json)' };
      var res = await cloudRest(cloudTable('invitations') + '?select=slug&limit=1');
      return { ok: res.ok, error: res.error, online: cloudOnline };
    },

    /**
     * Uji menyeluruh 5 bagian ke project Supabase yang sedang dipakai:
     *   A. konfigurasi · B. jangkauan & skema · C. izin RSVP
     *   D. privasi daftar tamu (nomor HP) · E. undangan read-only
     *
     * AMAN DIULANG kapan saja:
     *  - hanya MEMBACA data yang sudah ada;
     *  - uji izin tulis memakai nilai/kolom yang pasti ditolak database
     *    (foreign key ke id kosong) sehingga TIDAK ADA data tamu yang tersimpan;
     *  - uji “tidak bisa diubah” menulis NILAI YANG SAMA PERSIS ke baris undangan,
     *    jadi walau kebijakan tulis masih terbuka, isi undangan tidak berubah.
     *
     * Catatan jujur soal penghapusan: RLS yang memblokir DELETE tetap dijawab
     * "sukses 0 baris" oleh PostgREST, jadi dari luar tidak bisa dipastikan —
     * hasilnya dilaporkan sebagai catatan, bukan lulus palsu.
     */
    selfTest: async function () {
      var bagian = [];
      var hitung = { lulus: 0, gagal: 0, catatan: 0 };
      var ID_KOSONG = '00000000-0000-0000-0000-000000000000';

      function mulai(judul) { var b = { judul: judul, items: [] }; bagian.push(b); return b; }
      function cek(b, nama, lulus, info) {
        b.items.push({ nama: nama, lulus: (lulus === null ? null : !!lulus), info: info || '' });
        if (lulus === null) hitung.catatan++; else if (lulus) hitung.lulus++; else hitung.gagal++;
        return lulus;
      }
      function catat(b, nama, info) { return cek(b, nama, null, info); }
      function selesai() {
        return {
          ok: hitung.gagal === 0, lulus: hitung.lulus, gagal: hitung.gagal, catatan: hitung.catatan,
          bagian: bagian, diujiPada: new Date().toISOString()
        };
      }
      function kode(res) { return (res && res.data && res.data.code) || null; }
      function ditolakRls(res) { return (res && (res.status === 401 || res.status === 403)) || kode(res) === '42501'; }
      function petunjuk(res) {
        if (!res || !res.status) return 'Periksa: url benar? project belum di-pause? koneksi internet jalan?';
        if (res.status === 401 || res.status === 403) return 'Kunci kemungkinan salah/terpotong — salin ulang dari Supabase → Settings → API Keys.';
        if (res.status === 404) return 'Tabel belum ada — jalankan supabase/schema.sql di Supabase → SQL Editor.';
        return String(res.error || 'gagal');
      }

      // ---------- A. Konfigurasi ----------
      await loadCloudConfig(true);
      var st = cloudApi.status();
      var a = mulai('A. Konfigurasi (supabase-config.json)');
      cek(a, 'file konfigurasi terbaca', !!(cloudConfig && Object.keys(cloudConfig).length), cloudConfig ? '' : 'file tidak ada / bukan JSON');
      if (!cloudConfigured()) {
        cek(a, 'url & kunci siap dipakai', false, st.pesan || 'isi url + anonKey (publishable/anon) di supabase-config.json');
        return selesai();
      }
      cek(a, 'url & kunci terisi', true, st.url);
      cek(a, 'kunci aman dipublikasikan (bukan rahasia)', st.keyType === 'publishable' || st.keyType === 'jwt-legacy', 'jenis: ' + st.keyType);
      cek(a, 'format url wajar', /^https:\/\//i.test(st.url) || /^https?:\/\/(127\.0\.0\.1|localhost)/i.test(st.url), st.url);

      // ---------- B. Jangkauan & skema ----------
      var b = mulai('B. Jangkauan server & skema database');
      var inv = await cloudRest(cloudTable('invitations') + '?select=slug,event_type,event_date&order=created_at.asc');
      if (!inv.ok) {
        cek(b, 'project Supabase bisa dihubungi', false, petunjuk(inv));
        cloudOnline = false;
        return selesai();
      }
      var rowsInv = inv.data || [];
      cek(b, 'project Supabase bisa dihubungi', true, rowsInv.length + ' undangan terbaca');
      var seed = ['iceblue-adi-lina', 'iceblue-khitanan-alif', 'iceblue-ultah-kalila', 'aqiqah-ghani', 'wisuda-naura'].filter(function (s) {
        return rowsInv.some(function (r) { return r.slug === s; });
      });
      if (seed.length) cek(b, 'contoh undangan dari schema.sql ada', true, seed.join(', '));
      else catat(b, 'contoh undangan tidak ditemukan', 'bukan masalah kalau sudah Anda hapus/ganti');
      var contoh = rowsInv[0] || {};
      cek(b, 'kolom ringkas terisi (event_type, event_date)', !!contoh.event_type && !!contoh.event_date,
        contoh.event_type ? (contoh.event_type + ' → ' + contoh.event_date) : 'jalankan ulang supabase/schema.sql');

      // ---------- C. RSVP ----------
      var c = mulai('C. RSVP (tamu boleh kirim & baca ucapan)');
      var rs = await cloudRest(cloudTable('rsvp') + '?select=external_id,name,attendance,created_at&order=created_at.desc&limit=5');
      cek(c, 'ucapan/RSVP bisa dibaca', rs.ok, rs.ok ? ((rs.data || []).length + ' RSVP terbaru terbaca') : petunjuk(rs));
      // Uji izin TULIS tanpa menyimpan data: nilai valid, tapi invitation_id diarahkan ke
      // id kosong → database menolak lewat foreign key (23503) SESUDAH izin RLS dilewati.
      var pc = await cloudRest(cloudTable('rsvp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: [{
          external_id: 'uji-koneksi-' + Date.now(), invitation_slug: 'iceblue-adi-lina',
          invitation_id: ID_KOSONG, name: 'Uji Koneksi', attendance: 'hadir', pax: 1
        }]
      });
      if (kode(pc) === '23503') cek(c, 'tamu bisa mengirim RSVP dari browser', true, 'izin terverifikasi — baris uji ditolak kolom uji, tidak ada data tersimpan');
      else if (ditolakRls(pc)) cek(c, 'tamu bisa mengirim RSVP dari browser', false, 'ditolak RLS: ' + petunjuk(pc));
      else if (pc.ok) catat(c, 'tamu bisa mengirim RSVP dari browser', 'izin ada, tapi 1 baris uji tersimpan — hapus lewat SQL Editor: delete from rsvp where name = \'Uji Koneksi\';');
      else cek(c, 'tamu bisa mengirim RSVP dari browser', false, petunjuk(pc));
      // Uji hapus: blokiran RLS tetap dijawab "sukses 0 baris", jadi hasilnya catatan.
      var hr = await cloudRest(cloudTable('rsvp') + '?id=eq.' + ID_KOSONG, { method: 'DELETE' });
      if (ditolakRls(hr)) cek(c, 'RSVP tidak bisa dihapus dari browser', true, 'ditolak RLS');
      else if (hr.ok) catat(c, 'RSVP tidak bisa dihapus dari browser', 'tidak bisa dipastikan dari luar: penghapusan yang diblokir RLS tetap dijawab "sukses". Jalankan supabase/schema.sql lalu cek Supabase → Table Editor → rsvp → Policies.');
      else cek(c, 'RSVP tidak bisa dihapus dari browser', false, petunjuk(hr));

      // ---------- D. Privasi daftar tamu ----------
      var d = mulai('D. Daftar tamu (nomor HP) — harus PRIVAT');
      var gt = await cloudRest(cloudTable('guests') + '?select=id,name,phone&limit=1');
      var barisTamu = (gt.ok && Array.isArray(gt.data)) ? gt.data.length : 0;
      if (gt.ok && barisTamu > 0) {
        cek(d, 'daftar tamu TIDAK bisa dibaca dari browser', false,
          'BAHAYA: nomor HP tamu terbaca siapa pun yang punya kunci publik! Jalankan supabase/schema.sql sekarang.');
      } else if (!gt.ok) {
        cek(d, 'daftar tamu TIDAK bisa dibaca dari browser', !!(gt.status === 401 || gt.status === 403 || kode(gt) === '42501'),
          gt.status ? ('ditolak (' + gt.status + ') — nomor HP aman') : petunjuk(gt));
      } else {
        catat(d, 'daftar tamu TIDAK bisa dibaca dari browser', 'tidak ada baris yang terbaca — besar kemungkinan sudah terkunci (aman), tapi tabel kosong juga terlihat sama. Pastikan lewat Supabase → Table Editor → guests → Policies.');
      }
      // Uji izin TAMBAH (generator tamu massal) tanpa menyimpan data — foreign key ke id kosong.
      var tg = await cloudRest(cloudTable('guests'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
        body: [{ invitation_id: ID_KOSONG, name: '__UJI_KONEKSI__', phone: null, group_name: 'uji' }]
      });
      if (kode(tg) === '23503') cek(d, 'Studio bisa menambah tamu massal', true, 'izin terverifikasi — baris uji ditolak kolom uji, tidak ada data tersimpan');
      else if (ditolakRls(tg)) cek(d, 'Studio bisa menambah tamu massal', false, 'ditolak RLS: ' + petunjuk(tg));
      else if (tg.ok) catat(d, 'Studio bisa menambah tamu massal', 'izin ada, tapi 1 baris uji tersimpan — hapus lewat SQL Editor: delete from guests where name = \'__UJI_KONEKSI__\';');
      else cek(d, 'Studio bisa menambah tamu massal', false, petunjuk(tg));

      // ---------- E. Undangan read-only ----------
      var e = mulai('E. Undangan di cloud read-only (aman dari perubahan)');
      if (contoh.slug && contoh.event_type) {
        // Menulis kembali NILAI YANG SAMA PERSIS: kalau kebijakan tulis masih terbuka,
        // baris ini akan ter-ubah (terdeteksi) tetapi ISI undangan tetap sama.
        var up = await cloudRest(cloudTable('invitations') + '?slug=eq.' + encodeURIComponent(contoh.slug), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
          body: { event_type: contoh.event_type }
        });
        var diubah = Array.isArray(up.data) ? up.data.length : 0;
        if (ditolakRls(up)) cek(e, 'undangan tidak bisa diubah dari browser', true, 'ditolak RLS');
        else if (diubah > 0) cek(e, 'undangan tidak bisa diubah dari browser', false, 'BAHAYA: undangan bisa diubah siapa pun. Isi undangan tidak berubah (nilai ditulis sama), tapi jalankan supabase/schema.sql sekarang.');
        else cek(e, 'undangan tidak bisa diubah dari browser', true, '0 baris berubah — terkunci kebijakan (aman)');
      } else {
        catat(e, 'undangan tidak bisa diubah dari browser', 'belum ada baris undangan untuk diuji — jalankan schema.sql atau kirim undangan dulu');
      }
      var hp = await cloudRest(cloudTable('invitations') + '?slug=eq.__tidak_ada__', { method: 'DELETE' });
      if (ditolakRls(hp)) cek(e, 'undangan tidak bisa dihapus dari browser', true, 'ditolak RLS');
      else if (hp.ok) catat(e, 'undangan tidak bisa dihapus dari browser', 'tidak bisa dipastikan dari luar: penghapusan yang diblokir RLS tetap dijawab "sukses". Jalankan supabase/schema.sql untuk memastikan izin hapus dicabut.');
      else cek(e, 'undangan tidak bisa dihapus dari browser', false, petunjuk(hp));

      cloudOnline = true; // bagian B sudah membuktikan project bisa dihubungi
      return selesai();
    },

    pull: pullFromCloud,
    push: pushAllToCloud,
    addRsvp: async function (item) {
      await loadCloudConfig();
      if (!cloudConfigured()) return { ok: false, skipped: true };
      return pushRsvpsToCloud([item], loadLocalDb());
    },
    addGuests: async function (list) {
      await loadCloudConfig();
      if (!cloudConfigured()) return { ok: false, skipped: true };
      return pushGuestsToCloud(list);
    },
    saveInvitation: async function (inv) {
      await loadCloudConfig();
      if (!cloudConfigured()) return { ok: false, skipped: true };
      return pushInvitationsToCloud([inv]);
    },
    deleteInvitation: async function (idOrSlug) {
      await loadCloudConfig();
      if (!cloudConfigured()) return { ok: false, skipped: true };
      return cloudRest(cloudTable('invitations') + '?or=(external_id.eq.' + encodeURIComponent(idOrSlug) + ',slug.eq.' + encodeURIComponent(idOrSlug) + ')', { method: 'DELETE' });
    },
    deleteRsvp: async function (externalId) {
      await loadCloudConfig();
      if (!cloudConfigured()) return { ok: false, skipped: true };
      return cloudRest(cloudTable('rsvp') + '?external_id=eq.' + encodeURIComponent(externalId), { method: 'DELETE' });
    }
  };

  // Dukungan keyboard untuk foto galeri (Enter/Spasi) — berlaku di semua tema.
  function aktifkanAksesKeyboard() {
    document.querySelectorAll('.gal-item').forEach(function (el) {
      if (el.getAttribute('data-kb') === '1') return;
      el.setAttribute('data-kb', '1');
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
          e.preventDefault();
          el.click();
        }
      });
    });
  }

  // Kotak Galeri (lightbox): Escape untuk menutup, Tab terkunci di dalam,
  // fokus kembali ke foto asal setelah ditutup — berlaku di semua tema.
  function aktifkanLightboxA11y() {
    var lb = document.getElementById('lightbox');
    if (!lb || lb.getAttribute('data-a11y') === '1') return;
    lb.setAttribute('data-a11y', '1');
    var fokusSebelumnya = null;
    var terakhirDibuka = null;

    // Catat foto yang terakhir diklik/fokus agar fokus bisa dikembalikan
    document.addEventListener('click', function (e) {
      var item = e.target && e.target.closest ? e.target.closest('.gal-item') : null;
      if (item) terakhirDibuka = item;
    }, true);
    document.addEventListener('focusin', function (e) {
      var item = e.target && e.target.closest ? e.target.closest('.gal-item') : null;
      if (item) terakhirDibuka = item;
    });

    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('show')) return;
      if (e.key === 'Escape' || e.key === 'Esc') {
        e.preventDefault();
        lb.classList.remove('show');
        return;
      }
      if (e.key !== 'Tab') return;
      var bisa = Array.prototype.filter.call(
        lb.querySelectorAll('button, [href], img[tabindex], [tabindex]:not([tabindex="-1"])'),
        function (el) { return el.offsetParent !== null || el === document.activeElement; }
      );
      if (!bisa.length) return;
      var pertama = bisa[0], terakhir = bisa[bisa.length - 1];
      if (e.shiftKey && (document.activeElement === pertama || !lb.contains(document.activeElement))) {
        e.preventDefault(); terakhir.focus();
      } else if (!e.shiftKey && document.activeElement === terakhir) {
        e.preventDefault(); pertama.focus();
      }
    });

    if (window.MutationObserver) {
      new MutationObserver(function () {
        var terbuka = lb.classList.contains('show');
        if (terbuka) {
          fokusSebelumnya = terakhirDibuka || document.activeElement;
          var tutup = lb.querySelector('.lb-close') || lb.querySelector('button');
          if (tutup) tutup.focus();
        } else {
          var kembali = terakhirDibuka || fokusSebelumnya;
          if (kembali && typeof kembali.focus === 'function') kembali.focus();
          fokusSebelumnya = null;
        }
      }).observe(lb, { attributes: true, attributeFilter: ['class'] });
    }
  }

  // ====== WHATSAPP: gateway otomatis (opsional) + tautan wa.me (selalu ada) ======
  // Token gateway HANYA ada di server (wa-config.json) — tidak pernah dikirim ke browser.

  function waBersihkanNomor(nomor) {
    var n = String(nomor || '').replace(/[^0-9+]/g, '');
    if (!n) return '';
    if (n.charAt(0) === '+') n = n.slice(1);
    if (n.charAt(0) === '0') n = '62' + n.slice(1);
    else if (n.indexOf('62') !== 0) n = '62' + n;
    return n;
  }

  // Link gratis: wa.me dengan pesan siap kirim (nomor kosong = pilih kontak sendiri)
  function waTautan(nomor, pesan) {
    var n = waBersihkanNomor(nomor);
    return 'https://wa.me/' + (n || '') + '?text=' + encodeURIComponent(pesan || '');
  }

  function waIsiTemplate(template, data) {
    return String(template || '').replace(/\{(\w+)\}/g, function (m, kunci) {
      return (data && data[kunci] !== undefined && data[kunci] !== null) ? String(data[kunci]) : '';
    });
  }

  // Status gateway (dipanggil Studio saat halaman dibuka)
  async function waStatus() {
    try {
      var r = await fetch('/api/wa');
      if (!r.ok) throw new Error('HTTP ' + r.status);
      var data = await r.json();
      return data && data.wa ? data.wa : { aktif: false };
    } catch (e) {
      return { aktif: false, offline: true, provider: '-', modeGratis: 'link' };
    }
  }

  async function waRiwayat() {
    try {
      var r = await fetch('/api/wa');
      if (!r.ok) return [];
      var data = await r.json();
      return Array.isArray(data.riwayat) ? data.riwayat : [];
    } catch (e) { return []; }
  }

  async function waKirim(target, message, data, template) {
    var pesan = message || waIsiTemplate(template, data || {});
    var nomor = waBersihkanNomor(target);
    try {
      var r = await fetch('/api/wa/kirim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: nomor, message: pesan })
      });
      var hasil = await r.json();
      return Object.assign({ mode: hasil.ok ? 'gateway' : 'link', pesan: pesan,
                             tautan: waTautan(nomor, pesan) }, hasil);
    } catch (e) {
      // Server tidak bisa dihubungi → tetap bisa dikirim manual lewat WhatsApp
      return { ok: false, mode: 'link', error: 'Server tidak terjangkau', pesan: pesan,
               tautan: waTautan(nomor, pesan) };
    }
  }

  async function waUji() {
    try {
      var r = await fetch('/api/wa/uji', { method: 'POST' });
      return await r.json();
    } catch (e) {
      return { ok: false, error: 'Server tidak terjangkau' };
    }
  }

  async function waSimpanPengaturan(patch) {
    try {
      var r = await fetch('/api/wa/pengaturan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch || {})
      });
      return await r.json();
    } catch (e) {
      return { ok: false, error: 'Server tidak terjangkau' };
    }
  }

  var waApi = {
    status: waStatus,
    riwayat: waRiwayat,
    kirim: waKirim,
    uji: waUji,
    simpanPengaturan: waSimpanPengaturan,
    bersihkanNomor: waBersihkanNomor,
    tautan: waTautan,
    isiTemplate: waIsiTemplate
  };

  // ====== PEMERIKSAAN KELENGKAPAN UNDANGAN (dipakai Studio Admin) ======
  // Mengembalikan daftar periksa + skor, supaya admin tahu undangan sudah
  // siap dibagikan atau masih ada yang kurang.
  function periksaKelengkapan(inv) {
    inv = inv || {};
    var foto = inv.photos || {};
    var galeri = Array.isArray(foto.gallery) ? foto.gallery : [];
    var rekening = (inv.amplop && Array.isArray(inv.amplop.accounts)) ? inv.amplop.accounts : [];
    var rekBerisi = rekening.filter(function (r) { return r && String(r.number || '').trim(); });
    var amplopAktif = !inv.amplop || inv.amplop.enabled !== false;
    var rsvpAktif = !inv.rsvp || inv.rsvp.enabled !== false;
    var statusUndangan = inv.status || 'Aktif';
    var musik = inv.musicUrl === undefined ? '' : String(inv.musicUrl);

    var butir = [
      { label: 'Nama utama terisi', ok: !!String(inv.primaryName || '').trim(),
        saran: 'Isi nama mempelai / anak / wisudawan di tab Data Utama.' },
      { label: 'Tanggal acara terisi', ok: !!inv.eventDate,
        saran: 'Pilih tanggal acara supaya countdown & kalender benar.' },
      { label: 'Jam acara terisi', ok: !!(inv.akadTime || inv.resepsiTime),
        saran: 'Isi jam akad/resepsi.' },
      { label: 'Lokasi & alamat terisi', ok: !!(inv.venueName && inv.venueAddress),
        saran: 'Lengkapi nama gedung dan alamatnya.' },
      { label: 'Tautan Google Maps terisi', ok: !!inv.mapsUrl,
        saran: 'Tempel link lokasi supaya tamu mudah membuka peta.' },
      { label: 'Foto cover kustom terisi', ok: !!foto.cover,
        saran: 'Unggah foto cover di tab Galeri Foto.' },
      { label: 'Galeri minimal 3 foto', ok: galeri.length >= 3,
        saran: 'Tambah foto galeri (minimal 3) agar undangan tidak sepi.' },
      { label: amplopAktif ? 'Rekening amplop digital terisi' : 'Amplop digital dinonaktifkan',
        ok: amplopAktif ? rekBerisi.length > 0 : true,
        saran: 'Isi minimal satu rekening/e-wallet berisi nomor.' },
      { label: musik === 'off' ? 'Musik dinonaktifkan (pilihan admin)' : 'Musik latar terpasang',
        ok: true,
        saran: '' },
      { label: rsvpAktif ? 'RSVP aktif' : 'RSVP dinonaktifkan',
        ok: rsvpAktif, saran: 'Aktifkan RSVP supaya tamu bisa konfirmasi kehadiran.' },
      { label: inv.checkin === false ? 'QR check-in nonaktif' : 'QR check-in buku tamu aktif',
        ok: inv.checkin !== false, saran: 'Nyalakan QR check-in di tab Tema & Visual.' },
      { label: 'Status undangan: ' + statusUndangan,
        ok: statusUndangan !== 'Draf', saran: 'Ubah status menjadi Aktif setelah selesai dicek.' }
    ];

    var lolos = butir.filter(function (b) { return b.ok; }).length;
    return { lolos: lolos, total: butir.length, siap: lolos === butir.length, butir: butir };
  }

  // ====== QR CHECK-IN BUKU TAMU — berlaku di semua tema ======
  // Kode check-in diturunkan dari id undangan (tetap/sama setiap kali dibuka).

  function kodeCheckin(inv) {
    var dasar = String((inv && (inv.id || inv.slug)) || 'undangan');
    var h = 5381;
    for (var i = 0; i < dasar.length; i++) h = ((h << 5) + h + dasar.charCodeAt(i)) >>> 0;
    var angka = String(h % 1000000);
    while (angka.length < 6) angka = '0' + angka;
    return 'KD-' + angka;
  }

  function namaTamuDariUrl() {
    try {
      var p = new URLSearchParams(window.location.search);
      return String(p.get('to') || p.get('tamu') || '').replace(/\+/g, ' ').trim();
    } catch (e) { return ''; }
  }

  // Tautan undangan yang sedang dibuka — selalu membawa ?id=<undangan> supaya QR check-in,
  // tautan kalender, dan notifikasi RSVP mendarat di undangan yang benar (bukan tema bawaan).
  function tautanUndanganSaatIni(inv, tambahan) {
    var p = new URLSearchParams();
    var idInv = inv && (inv.id || inv.slug);
    if (idInv) p.set('id', idInv);
    if (tambahan) {
      Object.keys(tambahan).forEach(function (k) {
        var v = tambahan[k];
        if (v !== undefined && v !== null && v !== '') p.set(k, v);
      });
    }
    var q = p.toString();
    return window.location.origin + window.location.pathname + (q ? '?' + q : '');
  }

  // Nomor WhatsApp admin: dari pengaturan Studio (Data Utama / panel Koneksi WhatsApp),
  // dengan nomor bawaan sebagai cadangan.
  function nomorAdminWa() {
    try {
      var set = loadLocalDb().settings || {};
      var nomor = (set.adminWhatsapp || set.whatsappConfirm || '').toString().replace(/[^0-9]/g, '');
      if (nomor.indexOf('0') === 0) nomor = '62' + nomor.slice(1);
      if (nomor.length >= 9) return nomor;
    } catch (e) { /* pakai bawaan */ }
    return '6285196755675';
  }

  function terapkanCheckIn(inv) {
    if (!inv) return;
    var lama = document.getElementById('studioCheckin');
    var aktif = inv.checkin !== false;
    if (!aktif) { if (lama) lama.parentNode.removeChild(lama); return; }

    var kode = kodeCheckin(inv);
    var tamu = namaTamuDariUrl() || 'Tamu Undangan';

    // Sudah terpasang → cukup segarkan nama tamu (mis. link ?to=Nama).
    if (lama && lama.getAttribute('data-inv') === String(inv.id || '')) {
      var elTamu = lama.querySelector('#studioCheckinGuest');
      if (elTamu) elTamu.textContent = tamu;
      return;
    }
    if (lama) lama.parentNode.removeChild(lama);
    if (typeof window.qrcode !== 'function') return;  // pustaka QR belum termuat

    if (window.qrcode.stringToBytesFuncs) {
      window.qrcode.stringToBytes = window.qrcode.stringToBytesFuncs['UTF-8'] || window.qrcode.stringToBytes;
    }

    var tautan = tautanUndanganSaatIni(inv, { checkin: kode, to: tamu });
    var qr = window.qrcode(0, 'M');
    try {
      qr.addData(tautan);
      qr.make();
    } catch (e) { return; }

    var seksi = document.createElement('section');
    seksi.id = 'studioCheckin';
    seksi.setAttribute('data-inv', String(inv.id || ''));
    seksi.setAttribute('data-kode', kode);
    seksi.setAttribute('data-checkin-url', tautan);
    seksi.innerHTML =
      '<div style="max-width:420px;margin:0 auto;text-align:center;background:#fff;border:1px solid rgba(0,0,0,.08);' +
      'border-radius:18px;padding:24px 20px;box-shadow:0 14px 34px rgba(0,0,0,.10)">' +
        '<div style="font-size:11px;letter-spacing:2.6px;text-transform:uppercase;opacity:.65">Check-In Tamu</div>' +
        '<h2 style="font:600 22px/1.25 Georgia,serif;margin:8px 0 6px">QR Check-In Buku Tamu</h2>' +
        '<p style="font-size:13px;line-height:1.6;opacity:.7;margin:0 0 16px">Tunjukkan QR ini di meja penerima tamu. ' +
          'Panitia cukup memindai untuk mencatat kehadiran Anda.</p>' +
        '<div id="studioCheckinQr" role="img" aria-label="Kode QR check-in" style="background:#fff;padding:10px;border-radius:14px;' +
          'display:inline-block;border:1px solid rgba(0,0,0,.08)"></div>' +
        '<div id="studioCheckinGuest" style="font-weight:700;margin-top:14px">' + tamu + '</div>' +
        '<div style="font-size:12.5px;letter-spacing:1.6px;opacity:.7;margin-top:4px">KODE: ' +
          '<b id="studioCheckinCode">' + kode + '</b></div>' +
        '<div id="studioCheckinStatus" style="display:none;font-size:12.5px;margin-top:10px"></div>' +
        '<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:16px">' +
          '<button type="button" id="studioCheckinCopy" style="cursor:pointer;border:1px solid rgba(0,0,0,.15);' +
            'background:#fff;border-radius:999px;padding:9px 16px;font-size:13px;font-weight:600">\uD83D\uDCCB Salin Kode</button>' +
          '<button type="button" id="studioCheckinHadir" style="cursor:pointer;border:0;background:#1e7a4d;color:#fff;' +
            'border-radius:999px;padding:9px 16px;font-size:13px;font-weight:600">\u2705 Tandai Hadir</button>' +
          '<a id="studioCheckinWa" target="_blank" rel="noopener" style="text-decoration:none;border:1px solid rgba(0,0,0,.15);' +
            'border-radius:999px;padding:9px 16px;font-size:13px;font-weight:600;color:inherit">\uD83D\uDCAC Kirim ke Admin</a>' +
        '</div>' +
        '<p style="font-size:11.5px;opacity:.6;margin:14px 0 0">Kode ini juga tercatat otomatis di rekap RSVP Studio Admin.</p>' +
      '</div>';

    try {
      seksi.querySelector('#studioCheckinQr').innerHTML = qr.createSvgTag({ cellSize: 4, margin: 2, scalable: true });
    } catch (e) {
      seksi.querySelector('#studioCheckinQr').innerHTML = '<div style="width:132px;height:132px"></div>';
    }

    // Titipkan di dekat amplop / RSVP, atau sebelum footer.
    var jangkar = document.getElementById('studioAmplopList') || document.getElementById('studioRsvpDeadline') ||
                  document.getElementById('wishList');
    var seksiInduk = jangkar && jangkar.closest ? jangkar.closest('section') : null;
    if (!seksiInduk) seksiInduk = document.querySelector('.frame > section:last-of-type') ||
                                   document.querySelector('section');
    if (seksiInduk) seksiInduk.appendChild(seksi);   // di dalam bagian → ikut mode per-halaman
    else document.body.appendChild(seksi);

    var wa = seksi.querySelector('#studioCheckinWa');
    var pesan = 'Halo Admin Kartu Digital, saya ' + tamu + ' — kode check-in saya ' + kode +
                ' (' + (inv.title || inv.theme || 'undangan') + ').';
    if (wa) wa.href = 'https://wa.me/' + nomorAdminWa() + '?text=' + encodeURIComponent(pesan);

    var tombolSalin = seksi.querySelector('#studioCheckinCopy');
    if (tombolSalin) tombolSalin.addEventListener('click', function () {
      var status = seksi.querySelector('#studioCheckinStatus');
      var catat = function (teks) {
        if (status) { status.style.display = 'block'; status.textContent = teks; }
      };
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(kode).then(function () { catat('\u2713 Kode ' + kode + ' disalin'); },
                                                  function () { catat('Kode: ' + kode); });
        } else catat('Kode: ' + kode);
      } catch (e) { catat('Kode: ' + kode); }
    });

    var tombolHadir = seksi.querySelector('#studioCheckinHadir');
    if (tombolHadir) tombolHadir.addEventListener('click', function () {
      var status = seksi.querySelector('#studioCheckinStatus');
      if (!window.StudioBackend || !window.StudioBackend.addRsvp) return;
      Promise.resolve(window.StudioBackend.addRsvp({
        invitationId: inv.id,
        name: tamu,
        status: 'Hadir',
        guests: 1,
        message: 'Check-in QR ' + kode
      })).then(function () {
        if (status) { status.style.display = 'block'; status.textContent = '\u2713 Kehadiran ' + tamu + ' tercatat di rekap RSVP.'; }
      }, function () {
        if (status) { status.style.display = 'block'; status.textContent = '\u26a0 Gagal menyimpan, coba lagi.'; }
      });
    });

    // Kalau halaman dibuka dari hasil pindai QR (?checkin=KODE)
    try {
      var param = new URLSearchParams(window.location.search);
      var kodeMasuk = (param.get('checkin') || '').trim().toUpperCase();
      if (kodeMasuk) {
        var status = seksi.querySelector('#studioCheckinStatus');
        status.style.display = 'block';
        status.innerHTML = (kodeMasuk === kode)
          ? '\u2713 Kode check-in terverifikasi — selamat datang, ' + tamu + '.'
          : '\u26a0 Kode tidak dikenali untuk undangan ini.';
      }
    } catch (e) { /* abaikan */ }
  }

  // ====== NOTIFIKASI RSVP KE WHATSAPP ADMIN (satu ketuk oleh tamu) ======

  function tampilkanNotifikasiWa(inv, nama, status, jumlah, pesan) {
    var form = document.getElementById('rsvpForm');
    if (!form) return;
    var isiPesan = [
      'RSVP baru — ' + (inv.title || inv.theme || 'Undangan Digital'),
      'Nama: ' + nama,
      'Status: ' + status,
      'Jumlah tamu: ' + jumlah,
      pesan ? 'Ucapan: ' + pesan : '',
      'Undangan: ' + tautanUndanganSaatIni(inv)
    ].filter(Boolean).join('\n');
    var tautan = 'https://wa.me/' + nomorAdminWa() + '?text=' + encodeURIComponent(isiPesan);

    var bar = document.getElementById('studioRsvpWa');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'studioRsvpWa';
      bar.style.cssText = 'margin:14px 0 0;padding:12px 14px;border:1px dashed rgba(0,0,0,.18);' +
        'border-radius:12px;font-size:13px;line-height:1.6;text-align:center';
      form.parentNode.insertBefore(bar, form.nextSibling);
    }
    bar.innerHTML = '\u2705 <b>RSVP tersimpan.</b> Mau sekaligus memberi tahu admin? ' +
      '<a href="' + tautan + '" target="_blank" rel="noopener" ' +
      'style="font-weight:700;color:#1e7a4d;text-decoration:underline">\uD83D\uDCAC Kabari lewat WhatsApp</a>';
    bar.style.display = 'block';
  }

  // ====== SIMPAN KE KALENDER (.ics & Google Calendar) — semua tema ======

  function jamKe(teks, bawaan) {
    var m = /(\d{1,2})[:.](\d{2})/.exec(String(teks || ''));
    if (!m) return bawaan;
    var j = parseInt(m[1], 10), n = parseInt(m[2], 10);
    if (isNaN(j) || isNaN(n) || j > 23 || n > 59) return bawaan;
    return (j < 10 ? '0' : '') + j + ':' + (n < 10 ? '0' : '') + n;
  }

  function duaAngka(n) { return (n < 10 ? '0' : '') + n; }

  function waktuKalender(inv) {
    var tanggal = String(inv.eventDate || '').split('-');
    if (tanggal.length !== 3) return null;
    var jam = jamKe(inv.resepsiTime || inv.akadTime, '09:00').split(':');
    var mulai = new Date(Number(tanggal[0]), Number(tanggal[1]) - 1, Number(tanggal[2]),
                         Number(jam[0]), Number(jam[1]), 0);
    if (isNaN(mulai.getTime())) return null;
    var selesai = new Date(mulai.getTime() + 2 * 60 * 60 * 1000);   // durasi 2 jam
    var fmt = function (d) {
      return d.getUTCFullYear() + duaAngka(d.getUTCMonth() + 1) + duaAngka(d.getUTCDate()) +
             'T' + duaAngka(d.getUTCHours()) + duaAngka(d.getUTCMinutes()) + '00Z';
    };
    var fmtLokal = function (d) {
      return d.getFullYear() + duaAngka(d.getMonth() + 1) + duaAngka(d.getDate()) +
             'T' + duaAngka(d.getHours()) + duaAngka(d.getMinutes()) + '00';
    };
    return { mulai: mulai, selesai: selesai, utc: fmt(mulai) + '/' + fmt(selesai),
             lokal: fmtLokal(mulai) + '/' + fmtLokal(selesai) };
  }

  function isiKalender(inv) {
    var judul = inv.title || inv.theme || 'Undangan Digital';
    if (inv.primaryName) judul = judul + ' — ' + inv.primaryName +
      (inv.secondaryName ? ' & ' + inv.secondaryName : '');
    var lokasi = [inv.venueName, inv.venueAddress].filter(Boolean).join(', ');
    var tautan = tautanUndanganSaatIni(inv);
    return { judul: judul, lokasi: lokasi, tautan: tautan };
  }

  function berkasIcs(inv, waktu) {
    var isi = isiKalender(inv);
    var baris = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Kartu Digital//Undangan Digital//ID',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      'UID:' + (inv.id || 'undangan') + '@kartudigital.my.id',
      'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''),
      'DTSTART:' + waktu.utc.split('/')[0],
      'DTEND:' + waktu.utc.split('/')[1],
      'SUMMARY:' + isi.judul,
      'LOCATION:' + isi.lokasi,
      'DESCRIPTION:Undangan digital Kartu Digital — ' + isi.tautan,
      'URL:' + isi.tautan,
      'BEGIN:VALARM',
      'TRIGGER:-P1D',
      'ACTION:DISPLAY',
      'DESCRIPTION:Pengingat acara',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ];
    return baris.join('\r\n');
  }

  function terapkanKalender(inv) {
    if (!inv || document.getElementById('studioKalender')) return;
    var waktu = waktuKalender(inv);
    if (!waktu) return;
    var isi = isiKalender(inv);

    var bar = document.createElement('div');
    bar.id = 'studioKalender';
    bar.style.cssText = 'max-width:520px;margin:22px auto 0;padding:0 16px;text-align:center';
    bar.innerHTML =
      '<div style="background:#fff;border:1px solid rgba(0,0,0,.08);border-radius:16px;padding:16px 18px;' +
        'box-shadow:0 10px 26px rgba(0,0,0,.08)">' +
        '<div style="font-size:12px;letter-spacing:1.8px;text-transform:uppercase;opacity:.6;margin-bottom:10px">' +
          'Ingatkan Saya</div>' +
        '<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">' +
          '<a id="studioKalenderIcs" download="' + (inv.slug || 'undangan') + '.ics" ' +
            'href="data:text/calendar;charset=utf-8,' + encodeURIComponent(berkasIcs(inv, waktu)) + '" ' +
            'style="text-decoration:none;background:#1e7a4d;color:#fff;border-radius:999px;padding:10px 18px;' +
            'font-size:13px;font-weight:700">\uD83D\uDCC5 Simpan ke Kalender (.ics)</a>' +
          '<a id="studioKalenderGoogle" target="_blank" rel="noopener" ' +
            'href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=' +
              encodeURIComponent(isi.judul) + '&dates=' + waktu.lokal +
              '&location=' + encodeURIComponent(isi.lokasi) +
              '&details=' + encodeURIComponent('Undangan digital: ' + isi.tautan) + '" ' +
            'style="text-decoration:none;border:1px solid rgba(0,0,0,.16);border-radius:999px;padding:10px 18px;' +
            'font-size:13px;font-weight:700;color:inherit">\uD83D\uDD17 Google Calendar</a>' +
        '</div>' +
      '</div>';

    var jangkar = document.getElementById('cdD') || document.getElementById('studioRsvpDeadline');
    var seksi = jangkar && jangkar.closest ? jangkar.closest('section') : null;
    if (!seksi) seksi = document.querySelector('.frame > section');
    if (seksi) seksi.appendChild(bar);    // di dalam bagian → ikut mode per-halaman
    else document.body.insertBefore(bar, document.body.firstChild);
  }

  // ====== MUSIK LATAR (MP3) — dipilih dari Studio Admin ======
  // Daftar lagu bawaan yang ikut terunggah bersama website (folder musik/).
  // Semuanya disintesis sendiri lewat tools/make-music.py → bebas royalti.
  var MUSIC_FILES = [
    'musik/romantis.mp3',
    'musik/khitanan.mp3',
    'musik/aqiqah.mp3',
    'musik/wisuda.mp3',
    'musik/pesta.mp3',
    'musik/jawa.mp3'
  ];

  function siapkanTombolMusik() {
    var btn = document.getElementById('musicBtn');
    if (btn) return btn;
    // Tema lama yang belum punya tombol musik (mis. Blush & Emerald) tetap dapat tombol.
    btn = document.createElement('button');
    btn.id = 'musicBtn';
    btn.type = 'button';
    btn.className = 'music-btn';
    btn.setAttribute('aria-label', 'Musik latar');
    btn.innerHTML = '<span>\u266b</span> Musik';
    document.body.appendChild(btn);
    return btn;
  }

  // Atur musik halaman undangan sesuai pilihan di Studio:
  //   ''     → pakai musik bawaan tema (WebAudio di dalam template)
  //   'off'  → tanpa musik sama sekali
  //   lainnya→ putar file MP3/link tersebut
  function terapkanMusik(inv) {
    var pilihan = inv && inv.musicUrl ? String(inv.musicUrl).trim() : '';
    var audio = document.getElementById('studioMusicAudio');
    if (!audio) {
      audio = document.createElement('audio');
      audio.id = 'studioMusicAudio';
      audio.loop = true;
      audio.preload = 'none';
      document.body.appendChild(audio);
    }

    if (pilihan === 'off') {
      audio.pause();
      audio.removeAttribute('src');
      var bOff = document.getElementById('musicBtn');
      if (bOff) bOff.style.display = 'none';
      window.musikMain = function () {};
      window.musikStop = function () {};
      return;
    }

    if (!pilihan) return; // biarkan musik bawaan tema

    audio.src = pilihan;
    var sedangMain = false;
    function putar() {
      try {
        var janji = audio.play();
        if (janji && janji.catch) janji.catch(function () {});
      } catch (e) { /* browser tanpa dukungan audio */ }
      sedangMain = true;
      var b = document.getElementById('musicBtn');
      if (b) b.classList.add('playing');
    }
    function henti() {
      try { audio.pause(); } catch (e) { /* abaikan */ }
      sedangMain = false;
      var b = document.getElementById('musicBtn');
      if (b) b.classList.remove('playing');
    }

    var btn = siapkanTombolMusik();
    if (btn.getAttribute('data-mp3') === '1') {
      // Pemutar sudah terpasang (hidrasi kedua) — cukup perbarui lagunya.
      btn.setAttribute('data-src', pilihan);
      return;
    }
    // Kloning tombol = melepas semua listener bawaan template,
    // jadi hanya pemutar MP3 ini yang aktif.
    var baru = btn.cloneNode(true);
    baru.setAttribute('data-mp3', '1');
    baru.style.display = '';
    btn.parentNode.replaceChild(baru, btn);
    // Sumber kebenaran = class "playing" pada tombol (tahan hidrasi ganda),
    // dan hentikan listener lain agar tidak dobel saat diklik.
    baru.addEventListener('click', function (e) {
      if (e && e.stopImmediatePropagation) e.stopImmediatePropagation();
      if (baru.classList.contains('playing')) { henti(); } else { putar(); }
    }, true);

    // Template memanggil musikMain() saat undangan dibuka → arahkan ke MP3.
    window.musikMain = putar;
    window.musikStop = henti;
  }

  var StudioBackend = {
    cloud: cloudApi,
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
    wa: waApi,
    periksaKelengkapan: periksaKelengkapan,
    getSettings: function () {
      var db = loadLocalDb();
      return Object.assign({}, DEFAULT_DB.settings, db.settings || {});
    },
    // Simpan sebagian pengaturan (mis. musik halaman depan) ke database Studio.
    saveSettings: async function (patch) {
      var db = loadLocalDb();
      db.settings = Object.assign({}, DEFAULT_DB.settings, db.settings || {}, patch || {});
      db.updatedAt = new Date().toISOString();
      await pushToServer(db);
      return db.settings;
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
      cloudApi.saveInvitation(inv).catch(function () {});
      return inv;
    },
    deleteInvitation: async function (id) {
      var db = loadLocalDb();
      db.invitations = db.invitations.filter(function (i) { return i.id !== id; });
      await pushToServer(db);
      cloudApi.deleteInvitation(id).catch(function () {});
      return true;
    },
    replaceDb: async function (db) {
      if (!db || !Array.isArray(db.invitations)) {
        throw new Error('Format backup tidak valid');
      }
      var clean = {
        version: db.version || DEFAULT_DB.version,
        updatedAt: new Date().toISOString(),
        settings: db.settings || {},
        invitations: db.invitations,
        rsvps: Array.isArray(db.rsvps) ? db.rsvps : [],
        guests: Array.isArray(db.guests) ? db.guests : []
      };
      await pushToServer(clean);
      return clean;
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
      await cloudApi.addRsvp(item).catch(function () {});
      return item;
    },
    deleteRsvp: async function (rsvpId) {
      var db = loadLocalDb();
      db.rsvps = db.rsvps.filter(function (r) { return r.id !== rsvpId; });
      await pushToServer(db);
      cloudApi.deleteRsvp(rsvpId).catch(function () {});
      return true;
    },
    musicFiles: MUSIC_FILES,
    compressImage: compressImage,
    tautanUndanganSaatIni: tautanUndanganSaatIni,
    nomorAdminWa: nomorAdminWa,
    formatIndonesianDate: formatIndonesianDate,
    formatDotDate: formatDotDate,

    hydrateInvitationPage: function (defaultInvId) {
      try {
        var params = new URLSearchParams(window.location.search);
        var invId = params.get('id') || defaultInvId;
        var inv = StudioBackend.getInvitation(invId);
        if (!inv) return;

        // 1. Update Title & Cover
        // Kategori "satu nama" (bukan pasangan): khitanan, ultah, aqiqah, wisuda.
        var singleNameCat = ['khitanan', 'ultah', 'aqiqah', 'wisuda'].indexOf(inv.category) > -1;
        var pairTitle = inv.secondaryName && !singleNameCat
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
                  '<button type="button" class="copy-mini" aria-label="Salin nomor rekening" data-copy="' + String(acc.number || '').replace(/\s+/g, '') + '">Salin</button>' +
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
          // Render Barcode QRIS (opsional) jika di-upload dari Studio Admin
          var oldQris = document.getElementById('studioQrisCard');
          if (oldQris) oldQris.remove();
          if (amplopList && inv.amplop.qrisImage) {
            var qrisCard = document.createElement('div');
            qrisCard.id = 'studioQrisCard';
            qrisCard.className = 'card bank-card';
            qrisCard.style.textAlign = 'center';
            var qimg = document.createElement('img');
            qimg.src = inv.amplop.qrisImage;
            qimg.alt = 'QRIS';
            qimg.style.cssText = 'max-width:210px;width:78%;border-radius:12px;border:1px solid #c9c9c9;background:#fff;padding:8px;margin:4px auto 8px;display:block';
            var qcap = document.createElement('div');
            qcap.style.cssText = 'font-size:12px;font-weight:700';
            qcap.textContent = '\u{1F4A0} Scan QRIS untuk Transfer';
            qrisCard.appendChild(qimg);
            qrisCard.appendChild(qcap);
            amplopList.appendChild(qrisCard);
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
        renderWishList(inv);

        // Segarkan ucapan/RSVP terbaru dari database online (kalau aktif).
        // pull() otomatis membaca supabase-config.json; kalau belum diisi,
        // fungsi ini langsung berhenti tanpa error dan tanpa request tambahan.
        cloudApi.pull().then(function (res) {
          if (res && res.ok) renderWishList(inv);
        }).catch(function () {});

        // Musik latar sesuai pilihan di Studio
        terapkanMusik(inv);
        // Galeri bisa dibuka lewat keyboard
        aktifkanAksesKeyboard();
        // Lightbox ramah keyboard (Escape, Tab terkunci, fokus kembali)
        aktifkanLightboxA11y();
        // Kartu QR check-in buku tamu (semua tema)
        terapkanCheckIn(inv);
        // Tombol simpan ke kalender (.ics & Google Calendar)
        terapkanKalender(inv);
        // Mode navigasi tamu dari Studio (kalau link tidak menentukan sendiri).
        // Mesin navigasi ada di dalam tema (Sage/Jawa) atau vendor/nav-mode.js.
        try {
          var modeLink = new URLSearchParams(window.location.search).get('mode');
          if (!modeLink && inv.navMode && typeof window.setMode === 'function') {
            window.setMode(inv.navMode);
          }
        } catch (e) { /* biarkan mode bawaan tema */ }
        // Efek dekorasi dari Studio ikut berlaku di link bersih (?id= tanpa ?fx=) —
        // hanya untuk tema yang punya mesin efek (fxSet + daftar FX_TYPES miliknya).
        try {
          var fxLink = new URLSearchParams(window.location.search).get('fx');
          var fxStudio = inv.fxMode;
          if (!fxLink && fxStudio && typeof window.fxSet === 'function' &&
              (!window.FX_TYPES || window.FX_TYPES[fxStudio])) {
            window.fxSet(fxStudio);
          }
        } catch (e) { /* biarkan efek bawaan tema */ }

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
            // Tawarkan kabari admin lewat WhatsApp (satu ketuk, teks sudah terisi)
            try {
              tampilkanNotifikasiWa(inv, nameVal, statusVal, guestsVal, msgVal);
            } catch (e) { /* jangan sampai menghalangi RSVP */ }
          });
        }
      } catch (e) {
        console.warn('StudioBackend hydrate warning:', e);
      }
      segarkanSaatHydrate(defaultInvId);
    }
  };

  window.StudioBackend = StudioBackend;
})(window);
