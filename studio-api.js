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
        musicUrl: 'musik.mp3',
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
        musicUrl: 'musik.mp3',
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
        musicUrl: 'musik.mp3',
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

  function cloudConfigured() {
    return !!(cloudConfig && cloudConfig.url && cloudConfig.anonKey && cloudConfig.enabled !== false);
  }

  function cloudTable(name) {
    var custom = cloudConfig && cloudConfig.tables && cloudConfig.tables[name];
    return custom || name;
  }

  function cloudHeaders(extra) {
    var headers = {
      'apikey': cloudConfig.anonKey,
      'Authorization': 'Bearer ' + cloudConfig.anonKey,
      'Accept': 'application/json'
    };
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
    var guestRes = await cloudRest(cloudTable('guests') + '_public?select=*&order=created_at.asc');

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

    var cloudGuests = guestRes.ok ? (guestRes.data || []) : [];
    db.guests = cloudGuests.map(function (g) {
      return {
        id: g.slug_personal || g.id,
        invitationId: g.invitation_slug || '',
        name: g.name,
        group: g.group_name || 'keluarga',
        checkedIn: !!g.checked_in,
        createdAt: g.created_at
      };
    });

    saveLocalDb(db);
    return {
      ok: true,
      invitations: cloudInvs.length,
      rsvps: cloudRsvps.length,
      guests: guestRes.ok ? cloudGuests.length : 0,
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
    var invRes = await pushInvitationsToCloud(db.invitations || []);
    if (!invRes.ok) return { ok: false, error: invRes.error };
    var rsvpRes = await pushRsvpsToCloud(db.rsvps || [], db);
    return {
      ok: true,
      invitations: (db.invitations || []).length,
      rsvps: rsvpRes.ok ? (db.rsvps || []).length : 0,
      warning: rsvpRes.ok ? null : rsvpRes.error
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
      return {
        configured: cloudConfigured(),
        online: cloudOnline,
        url: cloudConfig ? (cloudConfig.url || '') : '',
        lastSync: cloudLastSync
      };
    },
    test: async function () {
      await loadCloudConfig(true);
      if (!cloudConfigured()) return { ok: false, error: 'Supabase belum dikonfigurasi (isi supabase-config.json)' };
      var res = await cloudRest(cloudTable('invitations') + '?select=slug&limit=1');
      return { ok: res.ok, error: res.error, online: cloudOnline };
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
