# DiaLog - Translator Marketplace Backend

**DiaLog** adalah platform marketplace penerjemah dokumen profesional yang dirancang khusus untuk mempertemukan Klien dengan Penerjemah (*Translator*) secara akurat dan efisien. 

Sistem ini mencocokkan kebutuhan proyek Klien dengan kualifikasi Penerjemah berdasarkan **Pasangan Bahasa** (*Source & Target Language*) dan **Spesialisasi Dokumen** (misal: hukum, medis, teknis). Klien dapat mengunggah dokumen sumber, mencari penerjemah yang tepat, dan mengelola alur kerja penerjemahan, sementara Penerjemah dapat membangun portofolio, menetapkan tarif (*rate*), dan melamar proyek yang sesuai dengan keahlian mereka.

---

## Tautan Proyek
* **API Server (Backend):** https://dialog-backend-cilt.onrender.com*
---

## Fitur & Hak Akses Pengguna (RBAC)
Sistem ini menggunakan Role-Based Access Control (RBAC) dengan pemisahan akses yang jelas berdasarkan tabel relasi database:

### 1. Klien (Client)
* **Manajemen Proyek:** Membuat proyek terjemahan dengan mendefinisikan bahasa sumber, bahasa target, spesialisasi, jumlah kata, *budget*, dan *deadline*.
* **Manajemen Dokumen:** Mengunggah dokumen sumber (`SOURCE`) dan memberikan catatan tambahan.
* **Sistem Perekrutan Dua Arah:** 
  * Membuka proyek untuk umum (*Open Bidding*) agar dilamar oleh penerjemah.
  * Mengirim undangan langsung (*Direct Invitation*) ke penerjemah spesifik.
* **Pembayaran:** Mengunggah bukti pembayaran proyek untuk diverifikasi oleh Admin sebelum proyek berjalan.

### 2. Penerjemah (Translator)
* **Manajemen Profil & Portofolio:** Menentukan tarif per proyek (*ratePerProject*), pengalaman, mengunggah CV, serta mengatur spesialisasi dan daftar pasangan bahasa yang dikuasai.
* **Lamar & Terima Proyek (`projectCandidate`):**
  * Mengirim lamaran (`APPLICATION`) pada proyek yang berstatus `OPEN`.
  * Menerima atau menolak tawaran undangan proyek (`INVITATION`) dari Klien.
* **Manajemen Pekerjaan:** Mengunggah dokumen hasil terjemahan (`RESULT`) untuk ditinjau oleh Klien.

### 3. Admin & Super Admin
* **Verifikasi Pembayaran (`payment`):** Memverifikasi bukti transfer Klien (`VERIFIED`) untuk memulai proyek, dan meneruskan dana ke Penerjemah (`RELEASED`) setelah proyek selesai.
* **Master Data:** Mengelola data inti aplikasi seperti daftar Bahasa (*Language*) dan Spesialisasi (*Specialization*).
* **Manajemen Pengguna:** Memantau pengguna dan peran (*roles*) di dalam platform.

---

## Siklus Status Proyek (Project Lifecycle)
Alur kerja setiap dokumen terjemahan diatur oleh *state machine* yang ketat pada database:
* **`WAITING_PAYMENT`**: Proyek dibuat, menunggu Klien melakukan pembayaran ke sistem (Admin).
* **`OPEN`**: Pembayaran terverifikasi, proyek siap menerima lamaran (*Application*) dari Penerjemah.
* **`ASSIGNED`**: Kandidat Penerjemah telah disepakati (baik dari lamaran yang diterima Klien, atau undangan yang dikonfirmasi Penerjemah).
* **`IN_PROGRESS`**: Penerjemah sedang mengerjakan dokumen terjemahan.
* **`WAITING_REVIEW`**: Penerjemah telah mengunggah file hasil (`RESULT`), menunggu Klien menyetujui.
* **`COMPLETED`**: Klien puas dan menyetujui hasil. Dana diteruskan ke Penerjemah.
* **`CANCELLED`**: Proyek dibatalkan.

---

## Teknologi Utama
* **Runtime:** Node.js (Express.js)
* **Database:** PostgreSQL
* **ORM:** Sequelize & Sequelize CLI
* **Autentikasi:** JWT dan bcrypt
* **Penyimpanan File:** Cloudinary dan Multer

---

## Cara Menjalankan Proyek

Ikuti langkah-langkah di bawah ini untuk menjalankan proyek backend di lingkungan lokal Anda:

### 1. Clone Repositori
```bash
git clone https://github.com/nicholas1507/dialog-backend
cd dialog-backend
```

### 2. Instal Dependensi
```bash
npm install
```

### 3. Konfigurasi Environment
1. Buat file `.env` di root folder proyek dengan menyalin dari `.env.example`:
   ```bash
   cp .env.example .env
   ```
2. Buka file `.env` lalu sesuaikan nilainya dengan konfigurasi database lokal, JWT Secret, dan kredensial Cloudinary Anda.

### 4. Inisialisasi Database & Seeding Data
*Pendaftaran (Register) melalui endpoint API publik hanya diperuntukkan bagi **Client** dan **Translator**. Akun **Admin** serta master data awal wajib dibuat melalui langkah inisialisasi di bawah ini:*

1. Pastikan servis PostgreSQL di komputer Anda sudah berjalan.
2. Buat database di PostgreSQL sesuai nama yang dikonfigurasi pada `.env`:
   ```bash
   npx sequelize-cli db:create
   ```
3. Jalankan migrasi untuk membuat seluruh skema tabel di database:
   ```bash
   npx sequelize-cli db:migrate
   ```
4. Jalankan seeder untuk mengisi data awal (Role, Akun Admin default, serta Master Data Bahasa & Spesialisasi):
   ```bash
   npx sequelize-cli db:seed:all
   ```
5. *Catatan:* Jika ingin mereset ulang atau membatalkan data seeder di kemudian hari, Anda dapat menggunakan perintah:
   ```bash
   npx sequelize-cli db:seed:undo:all
   ```

### 5. Menjalankan Aplikasi Utama
Setelah skema database dan data awal berhasil dibuat, Anda bisa menjalankan aplikasi:

* **Mode Pengembangan (Development):**
  ```bash
  npm run dev
  ```
* **Mode Produksi (Production):**
  ```bash
  npm start
  ```

Aplikasi akan berjalan secara default di `http://localhost:3000`.