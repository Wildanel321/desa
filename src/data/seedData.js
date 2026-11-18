// Data awal simulasi untuk studi kasus Desa Toyamas (tanpa data pribadi warga asli).

const POPULATION_STATS = {
  isSimulation: true,
  label: 'Data Simulasi Kependudukan (Studi Kasus 2026)',
  totalPenduduk: 4820,
  kepalaKeluarga: 1346,
  lakiLaki: 2435,
  perempuan: 2385,
  jumlahDusun: 4,
  jumlahRw: 8,
  jumlahRt: 28,
  terakhirDiperbarui: '2026-11-01'
};

const INITIAL_COMPLAINTS = [
  {
    ticket_code: 'ADU-2026-001',
    title: 'Jalan poros Dusun Krajan berlubang cukup dalam',
    category: 'Infrastruktur & Jalan',
    location: 'Jl. Raya Krajan RT 02 / RW 01, dekat jembatan selatan',
    reporter_label: 'Warga Dusun Krajan (Simulasi)',
    description:
      'Lubang selebar sekitar 1 meter di jalur utama menuju balai desa sudah digenangi air sejak hujan deras dua hari terakhir. Beberapa pengendara motor hampir tergelincir saat malam hari karena kurang penerangan.',
    status: 'Menunggu',
    admin_note: '',
    ai_category: 'Infrastruktur & Jalan',
    ai_summary:
      'Kerusakan jalan berlubang di jalur utama Dusun Krajan yang tergenang air dan membahayakan pengendara sepeda motor pada malam hari.',
    ai_urgency: 'Tinggi',
    ai_urgency_reason:
      'Berpotensi menyebabkan kecelakaan lalu lintas pada jalur akses utama desa.',
    ai_handler: 'Kasi Kesejahteraan & Tim Pekerjaan Umum Desa (koordinasi Dinas PUPR Kecamatan)',
    ai_mode: 'simulation',
    created_at: '2026-11-18T08:15:00+07:00',
    updated_at: '2026-11-18T08:15:00+07:00'
  },
  {
    ticket_code: 'ADU-2026-002',
    title: 'Saluran drainase tersumbat lumpur di RW 03',
    category: 'Air Bersih & Drainase',
    location: 'Gang Melati RT 04 / RW 03, Dusun Sumberagung',
    reporter_label: 'Perwakilan RT 04 (Simulasi)',
    description:
      'Selokan di sepanjang Gang Melati penuh endapan lumpur dan ranting pohon sehingga air meluap ke teras empat rumah warga setiap kali hujan turun lebih dari 30 menit.',
    status: 'Diproses',
    admin_note: 'Tim lapangan dijadwalkan melakukan normalisasi saluran bersama warga pada 19 November 2026 pukul 07.30 WIB.',
    ai_category: 'Air Bersih & Drainase',
    ai_summary:
      'Penyumbatan drainase di Gang Melati RW 03 menyebabkan luapan air ke rumah warga saat hujan deras.',
    ai_urgency: 'Tinggi',
    ai_urgency_reason:
      'Genangan sudah masuk ke area permukiman dan berisiko menimbulkan banjir lokal.',
    ai_handler: 'Kasi Kesejahteraan, Kepala Dusun Sumberagung & Satgas Lingkungan Desa',
    ai_mode: 'simulation',
    created_at: '2026-11-17T14:20:00+07:00',
    updated_at: '2026-11-17T16:45:00+07:00'
  },
  {
    ticket_code: 'ADU-2026-003',
    title: 'Tiga lampu penerangan jalan umum mati di pertigaan pasar',
    category: 'Penerangan & Listrik',
    location: 'Pertigaan Pasar Desa Toyamas, RW 02',
    reporter_label: 'Pedagang Pasar Pagi (Simulasi)',
    description:
      'Tiga tiang lampu PJU di sekitar pertigaan pasar sudah padam selama lima malam berturut-turut. Warga yang berangkat ke pasar pukul 04.00 WIB merasa khawatir saat melintas.',
    status: 'Menunggu',
    admin_note: '',
    ai_category: null,
    ai_summary: null,
    ai_urgency: null,
    ai_urgency_reason: null,
    ai_handler: null,
    ai_mode: null,
    created_at: '2026-11-17T09:10:00+07:00',
    updated_at: '2026-11-17T09:10:00+07:00'
  },
  {
    ticket_code: 'ADU-2026-004',
    title: 'Penumpukan sampah rumah tangga di TPS Dusun Mulyo',
    category: 'Kebersihan & Lingkungan',
    location: 'TPS Sementara Dusun Mulyo, RT 01 / RW 05',
    reporter_label: 'Warga Dusun Mulyo (Simulasi)',
    description:
      'Bak sampah sementara sudah penuh melebihi kapasitas karena jadwal angkut minggu ini tertunda dua hari. Bau mulai mengganggu warga sekitar dan anak sekolah yang melintas.',
    status: 'Diproses',
    admin_note: 'Koordinasi armada pengangkut BUMDes telah dikonfirmasi untuk pengangkutan sore ini.',
    ai_category: 'Kebersihan & Lingkungan',
    ai_summary:
      'Keterlambatan pengangkutan menyebabkan penumpukan sampah dan bau tidak sedap di TPS Dusun Mulyo.',
    ai_urgency: 'Sedang',
    ai_urgency_reason:
      'Berdampak pada kenyamanan dan kebersihan lingkungan sekitar fasilitas umum.',
    ai_handler: 'Pengelola Kebersihan BUMDes Toyamas & Kasi Pelayanan',
    ai_mode: 'simulation',
    created_at: '2026-11-16T11:30:00+07:00',
    updated_at: '2026-11-16T15:10:00+07:00'
  },
  {
    ticket_code: 'ADU-2026-005',
    title: 'Permintaan penambahan jadwal antrean pengantar KTP pada hari Senin',
    category: 'Layanan Administrasi',
    location: 'Loket Pelayanan Kantor Desa Toyamas',
    reporter_label: 'Pemohon Layanan RW 06 (Simulasi)',
    description:
      'Pada hari Senin pagi antrean pengurusan surat pengantar KTP dan KK cukup panjang. Mohon informasi apakah tersedia formulir persiapan yang bisa diisi lebih awal sebelum datang ke kantor desa.',
    status: 'Selesai',
    admin_note: 'Daftar persyaratan dan panduan pengisian sudah ditambahkan ke papan pengumuman serta fitur Asisten Layanan Desa.',
    ai_category: 'Layanan Administrasi',
    ai_summary:
      'Usulan warga terkait kepadatan antrean Senin pagi dan ketersediaan panduan persyaratan pengantar KTP/KK.',
    ai_urgency: 'Rendah',
    ai_urgency_reason:
      'Bersifat peningkatan kualitas layanan rutin dan tidak darurat.',
    ai_handler: 'Kasi Pelayanan Umum & Staf Administrasi Kependudukan Desa',
    ai_mode: 'simulation',
    created_at: '2026-11-14T10:05:00+07:00',
    updated_at: '2026-11-15T13:40:00+07:00'
  },
  {
    ticket_code: 'ADU-2026-006',
    title: 'Pipa distribusi air bersih PAMSIMAS bocor di tanjakan barat',
    category: 'Air Bersih & Drainase',
    location: 'Dusun Tegalrejo RT 03 / RW 07, dekat gardu ronda',
    reporter_label: 'Pengurus RW 07 (Simulasi)',
    description:
      'Sambungan pipa utama PAMSIMAS retak sehingga air mengalir deras ke jalan dan tekanan air ke 18 rumah di bagian atas menurun drastis sejak pagi tadi.',
    status: 'Menunggu',
    admin_note: '',
    ai_category: null,
    ai_summary: null,
    ai_urgency: null,
    ai_urgency_reason: null,
    ai_handler: null,
    ai_mode: null,
    created_at: '2026-11-18T06:50:00+07:00',
    updated_at: '2026-11-18T06:50:00+07:00'
  },
  {
    ticket_code: 'ADU-2026-007',
    title: 'Perbaikan pagar pengaman pos ronda RT 02 selesai dikerjakan',
    category: 'Keamanan & Ketertiban',
    location: 'Pos Kamling RT 02 / RW 04, Dusun Krajan',
    reporter_label: 'Koordinator Siskamling RW 04 (Simulasi)',
    description:
      'Kayu penopang pos kamling sebelumnya lapuk dan rawan roboh saat angin kencang. Diajukan bantuan material ringan untuk perbaikan bersama warga.',
    status: 'Selesai',
    admin_note: 'Bantuan material telah disalurkan dan perbaikan selesai dilakukan secara gotong royong pada 12 November 2026.',
    ai_category: 'Keamanan & Ketertiban',
    ai_summary:
      'Permohonan perbaikan struktur kayu pos kamling RT 02 yang lapuk agar aman digunakan petugas ronda.',
    ai_urgency: 'Sedang',
    ai_urgency_reason:
      'Menyangkut keselamatan petugas ronda dan ketertiban lingkungan.',
    ai_handler: 'Kasi Pemerintahan & Linmas Desa Toyamas',
    ai_mode: 'simulation',
    created_at: '2026-11-10T16:00:00+07:00',
    updated_at: '2026-11-12T17:20:00+07:00'
  }
];

const INITIAL_ANNOUNCEMENTS = [
  {
    title: 'Jadwal Kerja Bakti Pembersihan Saluran Air Menjelang Musim Hujan',
    category: 'Kegiatan Warga',
    summary:
      'Seluruh RW diimbau mengikuti kerja bakti serentak pembersihan drainase dan pemangkasan dahan rawan tumbang pada Minggu, 22 November 2026 pukul 07.00 WIB.',
    content:
      'Dalam rangka mengantisipasi curah hujan tinggi pada akhir November, Pemerintah Desa Toyamas mengundang seluruh pengurus RT/RW dan warga untuk melaksanakan kerja bakti serentak di wilayah masing-masing. Peralatan tambahan seperti cangkul dan gerobak angkut dapat dipinjam melalui gudang logistik Balai Desa mulai Sabtu pukul 15.00 WIB.',
    published_at: '2026-11-17T08:00:00+07:00'
  },
  {
    title: 'Pelayanan Posyandu Balita dan Lansia Periode November 2026',
    category: 'Kesehatan',
    summary:
      'Posyandu dilaksanakan bertahap di empat dusun pada 20 sampai 24 November 2026 mulai pukul 08.30 WIB di balai masing-masing dusun.',
    content:
      'Layanan meliputi penimbangan balita, pemberian vitamin tambahan, pemeriksaan tekanan darah, dan konsultasi gizi ringan bersama Bidan Desa serta Kader Posyandu. Mohon membawa buku KIA atau kartu kontrol lansia saat berkunjung.',
    published_at: '2026-11-15T09:30:00+07:00'
  },
  {
    title: 'Pemutakhiran Data Penerima Bantuan Pangan Desa Tahap Akhir',
    category: 'Administrasi',
    summary:
      'Verifikasi data warga dilakukan melalui musyawarah tingkat RT/RW hingga 28 November 2026. Tidak dipungut biaya apa pun.',
    content:
      'Pemerintah Desa Toyamas melakukan verifikasi berkala data keluarga penerima manfaat agar penyaluran tepat sasaran. Warga yang ingin mengecek status usulan atau memperbarui data kependudukan dapat menghubungi Ketua RT masing-masing atau datang ke Loket Pelayanan Desa pada jam kerja dengan membawa fotokopi KK.',
    published_at: '2026-11-13T10:15:00+07:00'
  }
];

const INITIAL_ACTIVITY_LOGS = [
  {
    action_type: 'complaint_created',
    description: 'Laporan baru ADU-2026-001 masuk: Jalan poros Dusun Krajan berlubang cukup dalam.',
    actor: 'Warga Dusun Krajan',
    created_at: '2026-11-18T08:15:00+07:00'
  },
  {
    action_type: 'complaint_created',
    description: 'Laporan baru ADU-2026-006 masuk: Pipa distribusi air bersih PAMSIMAS bocor di tanjakan barat.',
    actor: 'Pengurus RW 07',
    created_at: '2026-11-18T06:50:00+07:00'
  },
  {
    action_type: 'status_updated',
    description: 'Status ADU-2026-002 diubah menjadi Diproses oleh Admin Desa.',
    actor: 'Admin Desa Toyamas',
    created_at: '2026-11-17T16:45:00+07:00'
  },
  {
    action_type: 'ai_analyzed',
    description: 'Analisis klasifikasi simulasi dijalankan untuk laporan ADU-2026-002 (Urgensi: Tinggi).',
    actor: 'Sistem Analisis (Simulasi)',
    created_at: '2026-11-17T14:25:00+07:00'
  },
  {
    action_type: 'status_updated',
    description: 'Status ADU-2026-005 diselesaikan: Panduan persyaratan KTP/KK diperbarui.',
    actor: 'Admin Desa Toyamas',
    created_at: '2026-11-15T13:40:00+07:00'
  }
];

module.exports = {
  POPULATION_STATS,
  INITIAL_COMPLAINTS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_ACTIVITY_LOGS
};
