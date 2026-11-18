# Toyamas - Smart Village Platform

Prototipe aplikasi pengelolaan desa modern untuk studi kasus dan presentasi kampus. Aplikasi ini membantu perangkat desa dan warga mengelola pengaduan masyarakat, menganalisis prioritas laporan, menjawab pertanyaan layanan administrasi desa, serta menampilkan informasi publik Desa Toyamas.

## Fitur Utama

1. **Dashboard Operasional Desa**
   - Ringkasan antrean pengaduan aktif (Total Masuk, Menunggu, Diproses, Selesai) langsung dari SQLite.
   - Data kependudukan Desa Toyamas (data simulasi studi kasus yang diberi label jelas).
   - Grafik batang interaktif distribusi pengaduan per kategori (klik kategori untuk menyaring laporan).
   - Daftar aktivitas terbaru yang tercatat otomatis dari setiap tindakan pengguna dan admin.

2. **Pengaduan Masyarakat**
   - Formulir pengaduan baru (judul, kategori, lokasi, identitas pelapor opsional, dan deskripsi).
   - Pencarian serta filter berdasarkan status (`Menunggu`, `Diproses`, `Selesai`) dan kategori.
   - Tampilan responsif: tabel terstruktur di desktop/tablet dan kartu ringkas di smartphone.
   - Detail pengaduan lengkap dengan analisis laporan dan kontrol Admin untuk memperbarui status serta catatan petugas.

3. **AI Complaint Analyzer**
   - Menganalisis laporan yang sudah tersimpan maupun teks pengaduan uji coba baru.
   - Menghasilkan klasifikasi kategori, ringkasan singkat, estimasi urgensi (`Rendah`, `Sedang`, `Tinggi`) beserta alasannya, dan rekomendasi instansi atau petugas penanganan.
   - **Mode Transparan:** jika kunci API AI eksternal (`GEMINI_API_KEY`) belum dikonfigurasi, sistem otomatis menggunakan **Mode Simulasi Lokal (berbasis aturan kata kunci Bahasa Indonesia)** dan menampilkan keterangan transparan bahwa hasilnya merupakan simulasi demo.

4. **AI Village Assistant**
   - Antarmuka chatbot layanan warga dengan pertanyaan cepat sekali klik (persyaratan surat domisili, jam pelayanan kantor desa, SKU, pengantar KTP/KK, dan jadwal kegiatan desa).
   - Menggunakan basis pengetahuan desa simulasi dan database pengumuman desa.
   - **Aturan Konfirmasi Jujur:** jika pertanyaan berada di luar basis pengetahuan desa, asisten menyatakan bahwa informasi tersebut perlu dikonfirmasi langsung ke Kantor Desa Toyamas.

5. **Informasi Desa**
   - Profil wilayah, jam pelayanan, visi dan misi desa.
   - Struktur pemerintahan desa (menggunakan avatar inisial dan peran simulasi).
   - Panduan layanan administrasi gratis (Rp0) yang terhubung langsung ke fitur asisten.
   - Pengumuman desa yang tersimpan di SQLite dan dapat ditambah langsung oleh Admin Desa.

## Akun Admin Demo

Gunakan kredensial berikut untuk mencoba fitur pengubah status pengaduan, catatan petugas, penghapusan laporan, dan penambahan pengumuman desa (atau klik tombol **Isi Otomatis Kredensial Demo** pada dialog login):

- **Email:** `admin@toyamas.desa.id`
- **Kata sandi:** `toyamas2026`

## Teknologi

- **Frontend:** HTML5, CSS3 modular, JavaScript ES Modules (tanpa ketergantungan bundler agar mudah dijalankan untuk demo).
- **Backend:** Node.js + Express 5.
- **Database:** SQLite (menggunakan modul bawaan Node.js `node:sqlite`), otomatis dibuat dan diisi data simulasi saat pertama kali dijalankan.

## Cara Instalasi dan Menjalankan

### Prasyarat
- Node.js versi 22.5 atau lebih baru (untuk dukungan bawaan `node:sqlite`).
- npm.

### Langkah Menjalankan

1. Masuk ke folder proyek:
   ```bash
   cd desa
   ```
2. Pasang dependensi:
   ```bash
   npm install
   ```
3. (Opsional) Salin berkas contoh konfigurasi lingkungan:
   ```bash
   copy .env.example .env
   ```
   Jika `GEMINI_API_KEY` dibiarkan kosong, fitur AI Complaint Analyzer otomatis berjalan pada **Mode Simulasi Lokal**.
4. Jalankan server aplikasi:
   ```bash
   npm start
   ```
5. Buka browser dan kunjungi:
   ```
   http://localhost:3000
   ```

### Mengatur Ulang Database Demo

Jika ingin mengembalikan data SQLite ke kondisi awal setelah sesi demo:
```bash
npm run reset-db
npm start
```

## Deploy ke Vercel

Proyek ini sudah dikonfigurasi untuk berjalan langsung di **Vercel Functions (Fluid Compute)** dengan dukungan bawaan Express dan aset statis pada folder `public/`.

### 1. Melalui Vercel Dashboard (GitHub / GitLab / Bitbucket)
1. Push repositori ini ke GitHub.
2. Buka [Vercel Dashboard](https://vercel.com/), klik **Add New > Project**, lalu impor repositori.
3. Biarkan pengaturan build secara otomatis (Vercel mendeteksi `server.js`, `vercel.json`, dan `public/`).
4. (Opsional) Tambahkan Environment Variables di menu **Settings > Environment Variables**:
   - `AUTH_SECRET`: kunci rahasia acak untuk token sesi admin demo.
   - `DEMO_ADMIN_EMAIL` & `DEMO_ADMIN_PASSWORD`: jika ingin mengubah kredensial admin demo.
   - `GEMINI_API_KEY`: opsional; jika dikosongkan, fitur AI otomatis berjalan pada **Mode Simulasi Lokal**.
5. Klik **Deploy**.

### 2. Melalui Vercel CLI
```bash
vercel login
vercel          # preview deployment
vercel --prod   # production deployment
```

### Catatan Penyimpanan SQLite di Vercel
Filesystem direktori proyek pada Vercel Functions bersifat *read-only*. Saat berjalan di Vercel (`VERCEL=1`), aplikasi otomatis menyimpan database demo di `/tmp/toyamas.db` dan mengisinya dengan data simulasi awal. Data bertahan selama instance Fluid Compute tetap aktif dan akan kembali ke data awal saat *cold start* atau *redeploy*, sehingga cocok untuk kebutuhan presentasi dan studi kasus. Untuk persistensi permanen lintas instance pada lingkungan produksi, gunakan database terkelola seperti **Turso** (SQLite cloud) atau **Neon Postgres** melalui Vercel Marketplace.

## Struktur Proyek

```text
desa/
├── server.js                    # Titik masuk server Express
├── data/toyamas.db              # Database SQLite (otomatis dibuat saat start)
├── src/
│   ├── config/database.js       # Skema SQLite, koneksi, dan seed data awal
│   ├── data/
│   │   ├── seedData.js          # Data simulasi kependudukan, laporan, pengumuman
│   │   └── villageKnowledge.js  # Profil desa dan basis pengetahuan asisten
│   ├── middleware/auth.js       # Autentikasi token HMAC untuk Admin Demo
│   ├── routes/                  # Endpoint REST API modular
│   └── services/
│       ├── aiAnalyzer.js        # Mesin analisis (API opsional + simulasi lokal)
│       └── villageAssistant.js  # Pencocokan pengetahuan desa + fallback konfirmasi
└── public/
    ├── index.html               # Shell aplikasi semantik
    ├── css/                     # tokens.css, layout.css, components.css
    └── js/                      # Modul API, state, ikon, view, dan modal
```

## Catatan Privasi & Studi Kasus

Aplikasi ini dirancang khusus untuk kebutuhan demo dan presentasi akademik. Seluruh angka kependudukan, nama jabatan perangkat desa, nomor kontak kantor desa, dan data laporan awal merupakan **data simulasi** serta tidak menggunakan data pribadi penduduk sungguhan.
