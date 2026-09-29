# Study Planner 

**Kelompok 4** — Proyek UTS Web Development

Aplikasi web perencana belajar berbasis **React (Vite)** yang membantu siswa mengelola tugas dan jadwal belajar, sekaligus memungkinkan mentor/advisor memantau dan mendampingi progres siswa.

🔗 **Demo:** `https://RussellBertrand.github.io/study-planner/`

---

## Deskripsi Singkat

Study Planner memungkinkan pengguna mencatat tugas belajar lengkap dengan mata kuliah, deadline, dan tingkat prioritas. Data dikelola dengan *State Lifting* di React sehingga form input dan halaman output/dashboard selalu sinkron. Aplikasi memiliki dua peran pengguna dengan hak akses berbeda.

## Fitur Utama

### Role Client (Siswa)
- Login sebagai siswa.
- Menambah tugas/jadwal belajar baru (judul, mata kuliah, deadline, prioritas) melalui form dengan validasi.
- Melihat daftar tugas beserta deadline dan prioritasnya di dashboard.

### Role Admin (Mentor/Advisor)
- Login sebagai mentor/advisor.
- Melihat daftar tugas belajar siswa untuk memantau progres.
- Mendampingi siswa berdasarkan prioritas dan deadline yang tercatat.

> Sesuaikan daftar fitur di atas dengan fitur yang benar-benar diimplementasikan kelompok.

## Akun Demo (Hardcoded)

| Role | Username | Password |
|------|----------|----------|
| Admin (Mentor/Advisor) | `admin` | `admin123` |
| Client (Siswa) | `siswa` | `siswa123` |

> ⚠️ Akun ini hanya untuk keperluan demo/tugas kuliah dan ditulis langsung di kode (*hardcoded*). Jangan dipakai di aplikasi produksi.

## Teknologi

- React + Vite
- JavaScript (ES6+)
- CSS
- GitHub Pages (deployment via `gh-pages`)

## Menjalankan Secara Lokal

Prasyarat: [Node.js](https://nodejs.org/) versi 18 atau lebih baru.

```bash
# 1. Clone repositori
git clone https://github.com/<username-github>/study-planner.git
cd study-planner

# 2. Pasang dependensi
npm install

# 3. Jalankan server development
npm run dev
```

Buka alamat yang muncul di terminal (umumnya `http://localhost:5173/study-planner/`).

## Deployment ke GitHub Pages

Pastikan `base: '/study-planner/'` sudah ada di `vite.config.js` dan paket `gh-pages` sudah terpasang (`npm install --save-dev gh-pages`).

```bash
npm run deploy
```

Perintah ini otomatis menjalankan `npm run build` (lewat script `predeploy`), lalu mengunggah folder `dist` ke branch `gh-pages`.

Setelah itu, di GitHub buka **Settings → Pages**, pilih **Source: Deploy from a branch**, branch **gh-pages** dan folder **/ (root)**. Situs akan tersedia di `https://<username-github>.github.io/study-planner/`.

## Struktur Proyek 

```
study-planner/
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── README.md
├── vite.config.js
├── public/
│   └── vite.svg
└── src/
    ├── App.jsx
    ├── App.css
    ├── main.jsx
    ├── components/
    │   └── Navbar.jsx
    ├── data/
    │   ├── users.js
    │   └── tasks.js
    └── pages/
        ├── LoginPage.jsx
        ├── DashboardPage.jsx
        └── FormPage.jsx
```

## Tim

**Kelompok 4** — 
Jason Benaia Hamonangan Simanjuntak - 01881250045
Joy Cristian Sinaga - 01881250048
Daniel Xavier Christian Perangin-Angin Sinurat - 01881250013
Russell Betrand Victorio Pakpahan - 01881250053
