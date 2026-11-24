# 📚 Study Planner — Platform Manajemen & Perencanaan Belajar Siswa

Proyek Capstone Web & Mobile Application Development (Kelompok 4).  
Aplikasi manajemen tugas belajar cerdas yang menghubungkan **Mahasiswa/Siswa** dalam menyusun rencana studi dan **Mentor/Admin** dalam memantau serta mendampingi progres belajar.

---

## 👥 Tim Pengembang (Kelompok 4)

| Nama Lengkap | NIM | Peran Utama |
|---|---|---|
| **Jason Benaia Hamonangan Simanjuntak** | 01881250045 | Web Admin Frontend |
| **Joy Cristian Sinaga** | 01881250048 | Backend & Database Architect |
| **Russell Betrand Victorio Pakpahan** | 01881250053 | System Integration & Deployment |

---

## 🏗️ Arsitektur Sistem (3 Komponen)

Sistem dirancang modular menjadi tiga komponen independen:

```
Study-Planner/
├── web-admin/           # Web Frontend Admin & Dashboard (React + Vite)
├── backend/             # RESTful API Server (Node.js Express + SQLite + JWT Auth)
├── app/                 # Mobile Application (React Native + Expo SDK 58 untuk Android & iOS)
├── project-submission-guide.md # Panduan milestone Capstone UAS
├── .gitignore           # Mengabaikan node_modules, .env, database sqlite, & build dist
└── README.md            # Dokumentasi proyek
```

---

## 🚀 Panduan Menjalankan Sistem Secara Lokal

### Prasyarat
- [Node.js](https://nodejs.org/) versi 18 atau lebih baru
- npm versi 9 atau lebih baru

---

### 1. Menjalankan Backend API (`backend/`)

Server backend menyediakan REST API, otentikasi JWT, dan database SQLite lokal.

```bash
# Masuk ke folder backend
cd backend

# Pasang dependensi
npm install

# Buat file konfigurasi environment lokal
# (Bisa menduplikasi dari .env.example)
copy .env.example .env

# Jalankan server
npm run dev   # atau npm start
```

- Server backend akan berjalan di: **`http://localhost:3000`**
- Database SQLite (`database.sqlite`) akan dibuat dan di-seed data awal secara otomatis saat pertama kali server dijalankan.

---

### 2. Menjalankan Web Admin Dashboard (`web-admin/`)

Dashboard web dibangun menggunakan React + Vite, terintegrasi penuh ke backend API.

```bash
# Buka terminal baru, masuk ke folder web-admin
cd web-admin

# Pasang dependensi
npm install

# Jalankan Vite development server
npm run dev
```

- Buka tautan di browser: **`http://localhost:5173/study-planner/`**
- Terdapat fitur proteksi rute (otomatis redirect ke `/login` jika belum memiliki sesi aktif).

---

### 3. Menjalankan Aplikasi Mobile (`app/`)

Aplikasi mobile dibangun menggunakan **React Native + Expo SDK 58**, mendukung penuh perangkat fisik Android maupun iOS via Expo Go.

```bash
# Buka terminal baru, masuk ke folder app
cd app

# Pasang dependensi
npm install

# Buat/sesuaikan file konfigurasi .env
# Ganti dengan IP lokal laptop Anda (cek via 'ipconfig' di Windows atau 'ifconfig' di Mac/Linux)
copy .env.example .env
```

Contoh konfigurasi `.env`:
```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000/api
```

> ⚠️ **Penting untuk Expo Go di HP Fisik:**  
> Jangan gunakan `localhost` karena pada HP fisik, `localhost` akan mengarah ke HP itu sendiri. Gunakan IP lokal laptop Anda dan pastikan HP serta laptop terhubung ke jaringan Wi-Fi yang sama.
> 
> *Catatan:* Aplikasi juga dilengkapi **Resilient Offline/Demo Mode** otomatis menggunakan AsyncStorage jika backend sedang offline.

Jalankan Expo development server:
```bash
npx expo start
```

- **Android:** Buka aplikasi **Expo Go**, ketuk *"Scan QR code"*, dan pindai QR code yang tampil di terminal.
- **iOS:** Buka aplikasi **Kamera bawaan**, arahkan ke QR code, lalu ketuk notifikasi untuk membuka di **Expo Go**.
- **Web Preview:** Tekan tombol `w` di terminal untuk menjalankan versi web.

---

## 🔐 Akun Demo untuk Pengujian

Database sudah dilengkapi akun bawaan (*seeded data*):

| Role | Username | Password | Deskripsi Akses |
|---|---|---|---|
| **Mentor / Admin** | `admin` | `admin123` | Akses penuh melihat semua tugas mahasiswa & kontrol status |
| **Siswa / User** | `siswa` | `siswa123` | Mengelola tugas mandiri, menambah tugas, cek prioritas |
| **Siswa / User** | `budi` | `321` | Akun mahasiswa kedua untuk simulasi multi-pengguna |

> 💡 **Tip:** Pada halaman Login, tersedia tombol **"Demo 1-Klik"** untuk masuk secara instan tanpa perlu mengetik manual.

---

## 🔌 Rangkuman REST API Endpoints

Backend berjalan di `http://localhost:3000` dengan endpoint berikut:

### Autentikasi & Profil (`/api/auth`)
- `POST /api/auth/register` — Pendaftaran pengguna baru (`user` atau `admin`)
- `POST /api/auth/login` — Login pengguna & menghasilkan token JWT
- `GET /api/auth/me` — Mengambil data profil pengguna yang sedang login (*Auth Bearer*)
- `PUT /api/auth/profile` — Mengupdate profil (nama, bio, avatar)
- `PUT /api/auth/password` — Mengubah kata sandi pengguna dengan verifikasi bcrypt

### Manajemen Tugas / Tasks (`/api/tasks`)
- `GET /api/tasks` — Mengambil daftar tugas (Admin: semua tugas; User: tugas pribadi)
- `GET /api/tasks/:id` — Mengambil detail satu tugas
- `POST /api/tasks` — Menambah tugas baru (judul, mata kuliah, deadline, prioritas, status)
- `PUT /api/tasks/:id` — Mengupdate data tugas atau status (`pending`, `in_progress`, `completed`)
- `DELETE /api/tasks/:id` — Menghapus tugas dari sistem

### Manajemen Jadwal Perkuliahan (`/api/schedules`)
- `GET /api/schedules` — Mengambil jadwal mingguan (opsional filter `?day=Senin`)
- `POST /api/schedules` — Menambahkan agenda perkuliahan baru
- `PUT /api/schedules/:id` — Mengupdate jadwal perkuliahan
- `DELETE /api/schedules/:id` — Menghapus jadwal

### Admin Control Panel (`/api/admin`)
- `GET /api/admin/users` — Mengambil daftar pengguna dan metrik pengerjaan tugas siswa (khusus `admin`)
- `GET /api/admin/stats` — Mengambil statistik platform menyeluruh (khusus `admin`)
- `DELETE /api/admin/users/:id` — Menghapus pengguna dari sistem (khusus `admin`)

### StudyMate AI Assistant (`/api/ai`)
- `POST /api/ai/chat` — Berinteraksi dengan asisten AI kontekstual real-time (menganalisis tugas aktual, deadline mendesak, jadwal kuliah)
- `POST /api/ai/action/confirm` — Mengeksekusi proposal aksi cerdas (tambah tugas/jadwal) setelah konfirmasi pengguna
- `GET /api/ai/history` — Mengambil riwayat percakapan AI
- `DELETE /api/ai/history` — Membersihkan riwayat chat pengguna

---

## 🤖 StudyMate AI — Fitur Asisten Cerdas

StudyMate AI adalah asisten belajar cerdas yang hadir di Web dan Mobile:
1. **Analisis Kontekstual Real-time:** Menganalisis data tugas aktif, deadline mendesak (<= 3 hari), dan jadwal perkuliahan secara langsung dari database pengguna.
2. **Actionable Proposals (Human-in-the-Loop):** AI dapat mengusulkan pembuatan tugas atau pembaruan status, dan **hanya akan mengeksekusi** setelah pengguna menekan tombol *"Konfirmasi"* secara eksplisit.
3. **Dual Intelligence Engine:** Mendukung OpenAI API (`OPENAI_API_KEY`) atau mesin inferensi heuristik kontekstual bawaan (*zero extra cost / offline resilient*).

---

## 🛠️ Tech Stack

- **Frontend Web Admin:** React 18, Vite, React Router 6, Tailwind CSS & Vanilla Modern Tokens, StudyMate AI Widget
- **Mobile Application:** React Native, Expo SDK 58, React Navigation (Bottom Tabs), AsyncStorage, StudyMate AI Mobile Modal
- **Backend API:** Node.js, Express.js, SQLite3, JSON Web Tokens (JWT), BcryptJS, CORS, Dotenv, Contextual AI Engine
- **Version Control:** Git & GitHub
