export const CATEGORIES = [
  { id: 'all', label: 'Semua Bidang', count: 48 },
  { id: 'programming', label: 'Rekayasa Perangkat Lunak', count: 18 },
  { id: 'design', label: 'Desain Produk & UI/UX', count: 12 },
  { id: 'business', label: 'Strategi Bisnis & Manajemen', count: 8 },
  { id: 'data', label: 'Sains Data & Kecerdasan Buatan', count: 6 },
  { id: 'language', label: 'Komunikasi Profesional', count: 4 },
];

export const VALUE_PROPOSITIONS = [
  {
    iconType: 'curriculum',
    title: 'Kurikulum Berbasis Industri',
    description:
      'Silabus disusun sistematis bersama praktisi senior untuk memastikan relevansi keahlian dengan kebutuhan industri terkini.',
    tag: 'Studi Terapan',
  },
  {
    iconType: 'mentor',
    title: 'Bimbingan Mentor Berpengalaman',
    description:
      'Dapatkan arahan langsung, evaluasi kode, serta tinjauan portofolio dari para profesional berpengalaman di bidangnya.',
    tag: 'Pendampingan 1-on-1',
  },
  {
    iconType: 'interactive',
    title: 'Evaluasi & Studi Kasus Konkret',
    description:
      'Uji pemahaman konseptual melalui pengerjaan proyek riil dan asesmen mandiri secara berkala.',
    tag: 'Praktik Mandiri',
  },
  {
    iconType: 'certificate',
    title: 'Sertifikasi Digital Terverifikasi',
    description:
      'Peroleh sertifikat kelulusan berotentikasi resmi dengan nomor registrasi unik untuk memperkuat portofolio profesional.',
    tag: 'Kredensial Resmi',
  },
];

export const COURSES = [
  {
    id: 1,
    title: 'Full-Stack Web Development: Arsitektur Modern React & Node.js',
    category: 'programming',
    level: 'Tingkat Pemula',
    duration: '24 Sesi Pembelajaran',
    modulesCount: 24,
    rating: 4.9,
    studentsCount: 3420,
    badge: 'Program Unggulan',
    badgeType: 'popular',
    instructor: {
      name: 'Dimas Wicaksono, M.Kom.',
      role: 'Senior Software Architect',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    },
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
    price: 'Akses Penuh Gratis',
    originalPrice: 'Rp 650.000',
    description: 'Pelajari dasar pembuatan aplikasi web skala industri mulai dari fundamental komponen React 18, manajemen state, hingga perancangan REST API terpadu.',
    syllabus: [
      'Fundamental Modern JavaScript (ES6+) dan Paradigma Reaktif',
      'Komponen, Hooks Kustom, dan Lifecycle pada React',
      'Desain Sistem Antarmuka dan Manajemen State Terpusat',
      'Membangun REST API Mandiri dengan Node.js dan Express',
      'Integrasi Basis Data dan Penerapan Otentikasi JWT',
      'Penyebaran Aplikasi (Deployment) dan Pengujian Kualitas'
    ]
  },
  {
    id: 2,
    title: 'Desain Pengalaman Pengguna (UI/UX): Prinsip Desain hingga Prototyping',
    category: 'design',
    level: 'Tingkat Menengah',
    duration: '18 Sesi Pembelajaran',
    modulesCount: 18,
    rating: 4.9,
    studentsCount: 2890,
    badge: 'Pilihan Kurator',
    badgeType: 'featured',
    instructor: {
      name: 'Nadia Putri, S.Ds.',
      role: 'Lead Product Designer',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
    },
    thumbnail: 'https://images.unsplash.com/photo-1581291518655-9523c93269c3?w=600&auto=format&fit=crop&q=80',
    price: 'Akses Penuh Gratis',
    originalPrice: 'Rp 550.000',
    description: 'Kuasai tahapan riset pengguna, pemetaan empati, perancangan kawat gambar (wireframing), dan pembuatan purwarupa interaktif berskala industri dengan Figma.',
    syllabus: [
      'Metodologi Riset Pengguna dan Persona Pembelajar',
      'Arsitektur Informasi dan User Flow Efisien',
      'Desain Sistem Visual: Tipografi, Grid, dan Palet Warna',
      'Pembuatan Purwarupa Responsif & Interaksi Kompleks',
      'Pengujian Kegunaan (Usability Testing) dan Pengolahan Metrik'
    ]
  },
  {
    id: 3,
    title: 'Fondasi Sains Data dan Pembelajaran Mesin dengan Python',
    category: 'data',
    level: 'Tingkat Pemula',
    duration: '20 Sesi Pembelajaran',
    modulesCount: 20,
    rating: 4.8,
    studentsCount: 1950,
    badge: 'Eksplorasi Data',
    badgeType: 'trending',
    instructor: {
      name: 'Bambang Kurnia, Ph.D.',
      role: 'Head of Data & AI Research',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    },
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
    price: 'Akses Penuh Gratis',
    originalPrice: 'Rp 700.000',
    description: 'Eksplorasi pengolahan data terstruktur, visualisasi analitik, dan implementasi algoritma prediktif menggunakan pustaka NumPy, Pandas, dan Scikit-Learn.',
    syllabus: [
      'Struktur Data Python untuk Komputasi Saintifik',
      'Eksplorasi dan Pembersihan Data Skala Besar',
      'Visualisasi Data Statistik dan Wawasan Bisnis',
      'Pemodelan Regresi, Klasifikasi, dan Evaluasi Model',
      'Studi Kasus Analisis Prediktif Dunia Nyata'
    ]
  },
  {
    id: 4,
    title: 'Manajemen Pemasaran Digital & Pertumbuhan Bisnis Berkelanjutan',
    category: 'business',
    level: 'Semua Tingkat',
    duration: '14 Sesi Pembelajaran',
    modulesCount: 14,
    rating: 4.7,
    studentsCount: 1680,
    badge: 'Strategi Bisnis',
    badgeType: 'practical',
    instructor: {
      name: 'Sarah Amanda, M.B.A.',
      role: 'Growth Strategy Consultant',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    },
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80',
    price: 'Akses Penuh Gratis',
    originalPrice: 'Rp 450.000',
    description: 'Pelajari optimasi mesin pencari (SEO), analisis saluran pemasaran, dan perancangan kampanye digital berbasis konversi metrik terukur.',
    syllabus: [
      'Pemetaan Corong Pemasaran (Marketing Funnel)',
      'Optimasi Mesin Pencari Organik dan Riset Kata Kunci',
      'Strategi Pemasaran Konten dan Manajemen Media Sosial',
      'Analisis Kinerja Kampanye dengan Google Analytics'
    ]
  },
  {
    id: 5,
    title: 'Komunikasi Bisnis & Presentasi Bahasa Inggris Profesional',
    category: 'language',
    level: 'Tingkat Menengah',
    duration: '12 Sesi Pembelajaran',
    modulesCount: 12,
    rating: 4.9,
    studentsCount: 2140,
    badge: 'Keahlian Global',
    badgeType: 'featured',
    instructor: {
      name: 'Michael Tan, M.A.',
      role: 'Executive Communication Coach',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    },
    thumbnail: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=600&auto=format&fit=crop&q=80',
    price: 'Akses Penuh Gratis',
    originalPrice: 'Rp 400.000',
    description: 'Tingkatkan kefasihan berdiskusi teknis, teknik negosiasi formal, dan penguasaan teknik wawancara kerja standar multinasional.',
    syllabus: [
      'Struktur Retorika dan Penyampaian Gagasan Teknis',
      'Teknik Presentasi Efektif di Lingkungan Kerja',
      'Penulisan Surel Formal dan Proposal Bisnis',
      'Simulasi Wawancara Kerja dan Studi Kasus Interaktif'
    ]
  },
  {
    id: 6,
    title: 'Rekayasa Sistem Terdistribusi dengan Go dan Docker',
    category: 'programming',
    level: 'Tingkat Lanjut',
    duration: '16 Sesi Pembelajaran',
    modulesCount: 16,
    rating: 4.8,
    studentsCount: 1420,
    badge: 'Tingkat Lanjut',
    badgeType: 'trending',
    instructor: {
      name: 'Aris Wijaya, S.Kom.',
      role: 'Principal Backend Engineer',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80',
    },
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80',
    price: 'Akses Penuh Gratis',
    originalPrice: 'Rp 650.000',
    description: 'Rancang layanan mikro (microservices) dengan performa tinggi menggunakan bahasa Go, isolasi kontainer Docker, dan arsitektur gRPC terpadu.',
    syllabus: [
      'Konsep Konkurensi dan Goroutine pada Go',
      'Perancangan RESTful API Skalabilitas Tinggi',
      'Kontainerisasi Layanan dengan Docker dan Compose',
      'Pola Arsitektur Microservices dan Manajemen Pesan'
    ]
  },
];

export const TESTIMONIALS = [
  {
    id: 1,
    name: 'Rizky Ramadhan',
    role: 'Mahasiswa Teknik Informatika & Praktisi Magang',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    story:
      'Materi rekayasa perangkat lunak di Belajar Aja disajikan secara runut dan aplikatif. Kurikulumnya yang berorientasi proyek memberi saya rasa percaya diri tinggi saat membangun portofolio akademik dan berhasil lolos seleksi program magang di industri teknologi.',
    courseTaken: 'Full-Stack Web Development',
  },
  {
    id: 2,
    name: 'Aulia Citra',
    role: 'Alumni Desain Komunikasi Visual — Kini Product Designer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    story:
      'Sistem pelacakan misi harian dan gamifikasi membuat motivasi belajar saya konsisten setiap hari. Pendekatan pembelajarannya terstruktur, ramah bagi pemula, dan penugasan studi kasusnya langsung dapat diuji dalam standar industri.',
    courseTaken: 'Desain Pengalaman Pengguna (UI/UX)',
  },
  {
    id: 3,
    name: 'Kevin Pratama',
    role: 'Mahasiswa Statistika & Analis Data Junior',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    story:
      'Struktur silabus yang terpadu dari pengolahan data mentah hingga pemodelan analitik sangat membantu penyusunan tugas akhir saya. Kredensial sertifikat yang terverifikasi juga mudah dicantumkan pada profil profesional.',
    courseTaken: 'Fondasi Sains Data dan Machine Learning',
  },
];

export const GAMIFICATION_DATA = {
  streakDays: 7,
  weekDays: [
    { day: 'Sen', active: true, label: 'Selesai' },
    { day: 'Sel', active: true, label: 'Selesai' },
    { day: 'Rab', active: true, label: 'Selesai' },
    { day: 'Kam', active: true, label: 'Selesai' },
    { day: 'Jum', active: true, label: 'Selesai' },
    { day: 'Sab', active: true, label: 'Selesai' },
    { day: 'Min', active: true, label: 'Selesai' },
  ],
  level: 'Tingkat 4: Pembelajar Berkelanjutan',
  xpCurrent: 850,
  xpTarget: 1000,
  activeQuests: [
    {
      id: 'q1',
      title: 'Tinjau Materi Dasar React',
      category: 'Akademik',
      xpReward: 50,
      progress: 100,
      completed: true,
      description: 'Selesaikan peninjauan modul pertama tentang struktur komponen dan properti.'
    },
    {
      id: 'q2',
      title: 'Selesaikan Evaluasi Konsep UI/UX',
      category: 'Evaluasi',
      xpReward: 75,
      progress: 60,
      completed: false,
      description: 'Jawab 10 pertanyaan pemahaman seputar prinsip hierarki visual dan tipografi.'
    },
    {
      id: 'q3',
      title: 'Jadwalkan Rencana Tugas Belajar',
      category: 'Manajemen',
      xpReward: 40,
      progress: 100,
      completed: true,
      description: 'Tambahkan minimal 1 agenda belajar baru ke dalam sistem Study Planner.'
    },
    {
      id: 'q4',
      title: 'Eksplorasi Studi Kasus Sains Data',
      category: 'Riset',
      xpReward: 100,
      progress: 25,
      completed: false,
      description: 'Pelajari bab analisis korelasi data pada modul Python saintifik.'
    }
  ],
  badges: [
    {
      id: 'b1',
      title: 'Konsistensi Teruji',
      tier: 'Emas',
      desc: 'Menuntaskan sesi belajar 7 hari berturut-turut tanpa jeda.',
      unlocked: true,
    },
    {
      id: 'b2',
      title: 'Pemahaman Presisi',
      tier: 'Perak',
      desc: 'Mencapai skor evaluasi sempurna pada asesmen mandiri.',
      unlocked: true,
    },
    {
      id: 'b3',
      title: 'Pengembang Proyek',
      tier: 'Perak',
      desc: 'Berhasil mengunggah dan menyelesaikan 1 purwarupa aplikasi mandiri.',
      unlocked: true,
    },
    {
      id: 'b4',
      title: 'Keahlian Utama',
      tier: 'Perunggu',
      desc: 'Mencapai akumulasi 1.000 XP (Target pencapaian berikutnya).',
      unlocked: false,
    },
  ],
  leaderboard: [
    { rank: 1, name: 'Farhan Maulana', college: 'Universitas Indonesia', xp: 1420, streak: 18 },
    { rank: 2, name: 'Siti Rahmadani', college: 'Institut Teknologi Bandung', xp: 1280, streak: 14 },
    { rank: 3, name: 'Budi Santoso', college: 'Universitas Gadjah Mada', xp: 850, streak: 7, isCurrentUser: true },
    { rank: 4, name: 'Dewi Lestari', college: 'Universitas Diponegoro', xp: 810, streak: 6 },
    { rank: 5, name: 'Arif Hidayat', college: 'Institut Teknologi Sepuluh Nopember', xp: 760, streak: 5 }
  ]
};
