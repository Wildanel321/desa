// Basis pengetahuan desa (data simulasi studi kasus) untuk halaman Informasi Desa dan AI Village Assistant.

const VILLAGE_PROFILE = {
  isSimulation: true,
  name: 'Desa Toyamas',
  district: 'Kecamatan Sukamaju',
  regency: 'Kabupaten Nusantara (Wilayah Simulasi)',
  province: 'Jawa Tengah',
  postalCode: '53100',
  officeAddress: 'Jl. Balai Desa No. 12, Dusun Krajan, Desa Toyamas',
  officePhone: '(0281) 000-0120 (Nomor Simulasi Demo)',
  officeEmail: 'pelayanan@toyamas.desa.id',
  areaKm2: '6,42 km2',
  dusunList: ['Dusun Krajan', 'Dusun Sumberagung', 'Dusun Mulyo', 'Dusun Tegalrejo'],
  serviceHours: [
    { day: 'Senin sampai Kamis', hours: '08.00 - 15.00 WIB (Istirahat 12.00 - 13.00 WIB)' },
    { day: 'Jumat', hours: '08.00 - 11.30 WIB' },
    { day: 'Sabtu, Minggu & Hari Libur Nasional', hours: 'Tutup (Pengaduan daring tetap diterima)' }
  ],
  summary:
    'Desa Toyamas merupakan model desa percontohan untuk studi kasus transformasi layanan publik digital. Sebagian besar wilayah terdiri dari lahan pertanian produktif, kawasan permukiman empat dusun, dan sentra UMKM pengolahan hasil bumi.',
  vision:
    'Mewujudkan Desa Toyamas yang transparan, tertib administrasi, tanggap terhadap kebutuhan warga, dan mandiri secara ekonomi melalui tata kelola desa berbasis data.',
  missions: [
    'Menyelenggarakan layanan administrasi kependudukan yang cepat, jelas persyaratannya, dan bebas pungutan liar.',
    'Menyediakan saluran pengaduan masyarakat yang terpantau status penanganannya secara terbuka.',
    'Meningkatkan kualitas infrastruktur dasar desa, sanitasi, air bersih, dan penerangan lingkungan secara merata di empat dusun.',
    'Mendorong kemandirian ekonomi warga melalui penguatan BUMDes dan pendampingan usaha mikro lokal.'
  ]
};

const VILLAGE_OFFICIALS = [
  {
    initials: 'HS',
    name: 'H. Sutrisno (Peran Simulasi)',
    role: 'Kepala Desa',
    unit: 'Pimpinan Pemerintahan Desa',
    responsibilities: 'Penyelenggaraan pemerintahan desa, pembinaan kemasyarakatan, dan persetujuan akhir kebijakan pembangunan desa.'
  },
  {
    initials: 'RP',
    name: 'Ratna Pratiwi (Peran Simulasi)',
    role: 'Sekretaris Desa',
    unit: 'Sekretariat Desa',
    responsibilities: 'Koordinasi administrasi surat-menyurat, kearsipan desa, serta penyusunan rencana anggaran dan laporan kinerja.'
  },
  {
    initials: 'AW',
    name: 'Arif Wibowo (Peran Simulasi)',
    role: 'Kasi Pelayanan Umum',
    unit: 'Seksi Pelayanan',
    responsibilities: 'Pengelolaan loket surat pengantar kependudukan, surat domisili, layanan sosial, dan informasi publik warga.'
  },
  {
    initials: 'DP',
    name: 'Dwi Prasetyo (Peran Simulasi)',
    role: 'Kasi Kesejahteraan',
    unit: 'Seksi Kesejahteraan & Infrastruktur',
    responsibilities: 'Tindak lanjut pengaduan jalan desa, drainase, air bersih PAMSIMAS, dan koordinasi pembangunan fisik dusun.'
  },
  {
    initials: 'NL',
    name: 'Nadia Lestari (Peran Simulasi)',
    role: 'Kasi Pemerintahan',
    unit: 'Seksi Pemerintahan & Ketertiban',
    responsibilities: 'Pembinaan RT/RW, pemutakhiran data wilayah dusun, ketertiban umum, dan koordinasi Linmas desa.'
  },
  {
    initials: 'BH',
    name: 'Bambang Hartono (Peran Simulasi)',
    role: 'Kaur Keuangan',
    unit: 'Urusan Keuangan',
    responsibilities: 'Pengelolaan administrasi APBDes, pelaporan realisasi anggaran, dan transparansi publikasi keuangan desa.'
  }
];

const ADMIN_SERVICES = [
  {
    id: 'surat-domisili',
    name: 'Surat Keterangan Domisili',
    estimatedTime: '15 - 30 menit (jika berkas lengkap)',
    fee: 'Gratis (Rp0)',
    requirements: [
      'Surat Pengantar dari RT dan RW setempat',
      'Fotokopi KTP Elektronik pemohon (1 lembar)',
      'Fotokopi Kartu Keluarga (1 lembar)',
      'Menunjukkan dokumen asli untuk verifikasi petugas loket'
    ],
    sampleQuestion: 'Apa saja persyaratan membuat surat domisili?'
  },
  {
    id: 'sku',
    name: 'Surat Keterangan Usaha (SKU)',
    estimatedTime: '30 menit pada jam layanan',
    fee: 'Gratis (Rp0)',
    requirements: [
      'Surat Pengantar RT/RW sesuai lokasi usaha',
      'Fotokopi KTP dan Kartu Keluarga pemilik usaha',
      'Keterangan jenis usaha, nama usaha, dan alamat lokasi usaha',
      'Foto tempat usaha (opsional jika diminta verifikasi lapangan)'
    ],
    sampleQuestion: 'Bagaimana cara mengurus Surat Keterangan Usaha (SKU)?'
  },
  {
    id: 'pengantar-ktp-kk',
    name: 'Surat Pengantar KTP & Kartu Keluarga',
    estimatedTime: '20 - 30 menit (dilanjutkan ke Kecamatan/Disdukcapil)',
    fee: 'Gratis (Rp0)',
    requirements: [
      'Surat Pengantar RT/RW setempat',
      'Fotokopi Kartu Keluarga lama atau akta kelahiran (untuk pemohon baru)',
      'Surat keterangan kehilangan dari kepolisian (khusus KTP hilang)',
      'Formulir permohonan F-1.02 yang disediakan di loket desa'
    ],
    sampleQuestion: 'Prosedur pembuatan pengantar KTP dan Kartu Keluarga?'
  },
  {
    id: 'sktm',
    name: 'Surat Keterangan Tidak Mampu (SKTM)',
    estimatedTime: '30 - 60 menit (memerlukan verifikasi data RT/RW)',
    fee: 'Gratis (Rp0)',
    requirements: [
      'Surat Pengantar RT dan RW dengan keterangan keperluan (pendidikan/kesehatan)',
      'Fotokopi KTP dan Kartu Keluarga pemohon',
      'Surat pernyataan kondisi ekonomi keluarga yang ditandatangani pemohon'
    ],
    sampleQuestion: 'Syarat mengurus Surat Keterangan Tidak Mampu (SKTM)?'
  },
  {
    id: 'surat-pindah',
    name: 'Surat Pengantar Pindah Domisili',
    estimatedTime: '30 - 45 menit',
    fee: 'Gratis (Rp0)',
    requirements: [
      'Surat Pengantar RT/RW asal',
      'KTP asli dan Kartu Keluarga asli pemohon',
      'Data alamat tujuan lengkap (desa/kelurahan, kecamatan, kabupaten/kota)'
    ],
    sampleQuestion: 'Bagaimana syarat mengurus surat pindah domisili?'
  }
];

const CHATBOT_KNOWLEDGE_BASE = [
  {
    id: 'kb-domisili',
    topic: 'Persyaratan Surat Keterangan Domisili',
    sourceLabel: 'Panduan Layanan Administrasi Desa Toyamas',
    keywords: ['domisili', 'surat domisili', 'tinggal', 'menetap', 'syarat domisili'],
    answer:
      'Untuk mengurus Surat Keterangan Domisili di Kantor Desa Toyamas, silakan siapkan:\n1. Surat Pengantar dari RT dan RW setempat.\n2. Fotokopi KTP Elektronik (1 lembar) beserta aslinya.\n3. Fotokopi Kartu Keluarga (1 lembar).\n\nEstimasi proses: 15 sampai 30 menit bila berkas lengkap. Biaya layanan: Gratis (Rp0).',
    relatedView: 'informasi'
  },
  {
    id: 'kb-jam-layanan',
    topic: 'Jam Pelayanan Kantor Desa Toyamas',
    sourceLabel: 'Profil & Jadwal Kantor Desa Toyamas',
    keywords: ['jam', 'buka', 'tutup', 'pelayanan', 'jadwal kantor', 'operasional', 'hari apa', 'kantor desa'],
    answer:
      'Jadwal pelayanan tatap muka Kantor Desa Toyamas (Jl. Balai Desa No. 12, Dusun Krajan):\n- Senin sampai Kamis: 08.00 - 15.00 WIB (istirahat 12.00 - 13.00 WIB).\n- Jumat: 08.00 - 11.30 WIB.\n- Sabtu, Minggu, dan Hari Libur Nasional: Tutup.\n\nPengaduan masyarakat secara daring melalui platform ini tetap dapat dikirim kapan saja dan akan ditinjau pada hari kerja.',
    relatedView: 'informasi'
  },
  {
    id: 'kb-sku',
    topic: 'Surat Keterangan Usaha (SKU)',
    sourceLabel: 'Panduan Layanan Administrasi Desa Toyamas',
    keywords: ['sku', 'usaha', 'surat usaha', 'umkm', 'dagang', 'toko', 'kredit usaha'],
    answer:
      'Prosedur pengurusan Surat Keterangan Usaha (SKU):\n1. Bawa Surat Pengantar RT/RW sesuai lokasi usaha.\n2. Lampirkan fotokopi KTP dan Kartu Keluarga pemilik usaha.\n3. Sampaikan jenis usaha dan alamat tempat usaha kepada petugas loket.\n\nEstimasi waktu: sekitar 30 menit pada jam layanan. Biaya layanan: Gratis (Rp0).',
    relatedView: 'informasi'
  },
  {
    id: 'kb-ktp-kk',
    topic: 'Pengantar KTP & Kartu Keluarga',
    sourceLabel: 'Panduan Layanan Administrasi Desa Toyamas',
    keywords: ['ktp', 'kk', 'kartu keluarga', 'e-ktp', 'identitas', 'kehilangan ktp', 'f-1.02'],
    answer:
      'Untuk pengurusan Surat Pengantar KTP atau Kartu Keluarga di Kantor Desa Toyamas:\n1. Bawa Surat Pengantar RT/RW setempat.\n2. Sertakan fotokopi KK lama atau akta kelahiran (khusus pemohon baru).\n3. Jika KTP hilang, lampirkan surat keterangan kehilangan dari kepolisian.\n4. Isi formulir permohonan F-1.02 di loket desa.\n\nSetelah pengantar desa terbit, pencetakan dokumen dilanjutkan ke Kecamatan atau Disdukcapil. Layanan di kantor desa tidak dipungut biaya (Rp0).',
    relatedView: 'informasi'
  },
  {
    id: 'kb-sktm',
    topic: 'Surat Keterangan Tidak Mampu (SKTM)',
    sourceLabel: 'Panduan Layanan Administrasi Desa Toyamas',
    keywords: ['sktm', 'tidak mampu', 'beasiswa', 'kip', 'bpjs', 'bantuan pendidikan'],
    answer:
      'Persyaratan Surat Keterangan Tidak Mampu (SKTM):\n1. Surat Pengantar RT dan RW yang mencantumkan keperluan (misalnya pendidikan atau kesehatan).\n2. Fotokopi KTP dan Kartu Keluarga pemohon.\n3. Surat pernyataan kondisi ekonomi keluarga.\n\nProses memerlukan verifikasi data sekitar 30 sampai 60 menit di loket desa dan gratis (Rp0).',
    relatedView: 'informasi'
  },
  {
    id: 'kb-pindah',
    topic: 'Surat Pengantar Pindah Domisili',
    sourceLabel: 'Panduan Layanan Administrasi Desa Toyamas',
    keywords: ['pindah', 'surat pindah', 'mutasi', 'keluar desa', 'pindah rumah'],
    answer:
      'Untuk mengurus Surat Pengantar Pindah Domisili:\n1. Siapkan Surat Pengantar RT/RW asal.\n2. Bawa KTP asli dan Kartu Keluarga asli.\n3. Catat alamat tujuan lengkap (Desa/Kelurahan, Kecamatan, Kabupaten/Kota).\n\nEstimasi proses 30 sampai 45 menit dan tidak dikenakan biaya (Rp0).',
    relatedView: 'informasi'
  },
  {
    id: 'kb-pengaduan',
    topic: 'Cara Melaporkan Pengaduan Masyarakat',
    sourceLabel: 'Panduan Fitur Pengaduan Toyamas',
    keywords: ['lapor', 'pengaduan', 'aduan', 'keluhan', 'jalan rusak', 'lampu mati', 'drainase', 'sampah'],
    answer:
      'Warga dapat menyampaikan pengaduan langsung melalui menu Pengaduan Masyarakat pada platform ini:\n1. Klik tombol "Buat Pengaduan Baru".\n2. Isi judul laporan, kategori, lokasi lengkap (RT/RW/Dusun), dan deskripsi kejadian.\n3. Setelah terkirim, laporan akan mendapat kode tiket (misalnya ADU-2026-008) dan status awalnya "Menunggu".\n\nAnda juga dapat memantau perubahan status menjadi "Diproses" hingga "Selesai" di daftar pengaduan.',
    relatedView: 'pengaduan'
  },
  {
    id: 'kb-biaya',
    topic: 'Biaya Layanan Administrasi Desa',
    sourceLabel: 'Kebijakan Pelayanan Publik Desa Toyamas',
    keywords: ['biaya', 'tarif', 'bayar', 'gratis', 'pungutan', 'harga surat'],
    answer:
      'Seluruh layanan surat pengantar dan surat keterangan administrasi dasar di Kantor Desa Toyamas (Domisili, SKU, Pengantar KTP/KK, SKTM, dan Surat Pindah) tidak dipungut biaya alias Gratis (Rp0).',
    relatedView: 'informasi'
  },
  {
    id: 'kb-kegiatan',
    topic: 'Agenda Posyandu & Kerja Bakti Desa',
    sourceLabel: 'Pengumuman Resmi Desa Toyamas (Simulasi)',
    keywords: ['posyandu', 'kerja bakti', 'pengumuman', 'agenda', 'kegiatan', 'jadwal bulan ini', 'vaksin', 'balita', 'lansia'],
    answer:
      'Agenda Desa Toyamas periode November 2026:\n1. Posyandu Balita & Lansia: 20 sampai 24 November 2026 mulai pukul 08.30 WIB di balai masing-masing dusun (bawa buku KIA / kartu kontrol).\n2. Kerja Bakti Pembersihan Drainase: Minggu, 22 November 2026 pukul 07.00 WIB serentak di seluruh RW.\n\nDetail pengumuman terbaru dapat dilihat pada menu Informasi Desa.',
    relatedView: 'informasi'
  },
  {
    id: 'kb-kontak-lokasi',
    topic: 'Alamat & Kontak Kantor Desa Toyamas',
    sourceLabel: 'Profil Desa Toyamas (Simulasi)',
    keywords: ['alamat', 'lokasi kantor', 'kontak', 'telepon', 'email', 'hubungi', 'dimana balai desa'],
    answer:
      'Kantor Desa Toyamas beralamat di Jl. Balai Desa No. 12, Dusun Krajan, Desa Toyamas, Kecamatan Sukamaju (53100).\nKontak demo: Telepon (0281) 000-0120 dan Email pelayanan@toyamas.desa.id.',
    relatedView: 'informasi'
  },
  {
    id: 'kb-salam',
    topic: 'Sapaan Asisten Layanan Desa',
    sourceLabel: 'Asisten Layanan Desa Toyamas (Simulasi)',
    keywords: ['halo', 'hai', 'selamat pagi', 'selamat siang', 'selamat sore', 'assalamualaikum', 'permisi'],
    answer:
      'Halo, selamat datang di Asisten Layanan Desa Toyamas. Anda dapat menanyakan persyaratan surat administrasi (Domisili, SKU, KTP/KK, SKTM, Surat Pindah), jam pelayanan kantor desa, agenda desa, atau cara membuat pengaduan masyarakat.',
    relatedView: null
  }
];

module.exports = {
  VILLAGE_PROFILE,
  VILLAGE_OFFICIALS,
  ADMIN_SERVICES,
  CHATBOT_KNOWLEDGE_BASE
};
