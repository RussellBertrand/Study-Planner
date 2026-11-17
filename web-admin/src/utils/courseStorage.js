export const DEFAULT_COURSES = [
  {
    id: 'c1',
    code: 'IF-401',
    name: 'Deep Learning',
    credits: 3,
    lecturer: 'Dr. Hendra Gunawan',
    schedule: 'Senin, 08:00 - 10:30 WIB (Ruang Lab AI)',
    notes: 'Praktikum menggunakan Google Colab / PyTorch. Fokus pada CNN dan Attention Mechanism.',
    weights: { assignments: 25, quizzes: 15, midterm: 30, finalExam: 30 },
  },
  {
    id: 'c2',
    code: 'IF-305',
    name: 'Visual Perception',
    credits: 3,
    lecturer: 'Ir. Ratna Dewi, M.T.',
    schedule: 'Selasa, 13:00 - 15:30 WIB (Ruang 402)',
    notes: 'Kajian pemrosesan citra digital, segmentasi warna, dan deteksi tepi.',
    weights: { assignments: 20, quizzes: 20, midterm: 30, finalExam: 30 },
  },
  {
    id: 'c3',
    code: 'IF-208',
    name: 'Web and Mobile Application Development',
    credits: 4,
    lecturer: 'Dimas Wicaksono, M.Kom.',
    schedule: 'Rabu, 09:30 - 12:00 WIB (Ruang Multimedia)',
    notes: 'Proyek akhir kelompok: Pengembangan aplikasi SaaS dengan React, Express, dan PostgreSQL.',
    weights: { assignments: 35, quizzes: 15, midterm: 25, finalExam: 25 },
  },
  {
    id: 'c4',
    code: 'IF-312',
    name: 'Human-Computer Interaction',
    credits: 3,
    lecturer: 'Nadia Putri, S.Ds., M.Sc.',
    schedule: 'Kamis, 10:00 - 12:30 WIB (Ruang Desain 2)',
    notes: 'Tugas portofolio Figma dan pengujian kegunaan dengan System Usability Scale (SUS).',
    weights: { assignments: 30, quizzes: 10, midterm: 30, finalExam: 30 },
  },
  {
    id: 'c5',
    code: 'IF-419',
    name: 'Data Communication & Network Security',
    credits: 3,
    lecturer: 'Bambang Sudarsono, M.Kom.',
    schedule: 'Jumat, 08:00 - 10:30 WIB (Lab Jaringan)',
    notes: 'Analisis protokol paket Wireshark dan pengujian penetrasi jaringan dasar.',
    weights: { assignments: 20, quizzes: 20, midterm: 30, finalExam: 30 },
  },
];

export function getUserCoursesKey(userId) {
  return `study_planner_courses_${userId || 'guest'}`;
}

export function getUserEnrolledKey(userId) {
  return `study_planner_enrolled_${userId || 'guest'}`;
}

export function getUserCourses(userId) {
  const key = getUserCoursesKey(userId);
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return DEFAULT_COURSES;
}

export function saveUserCourses(userId, courses) {
  const key = getUserCoursesKey(userId);
  try {
    localStorage.setItem(key, JSON.stringify(courses));
  } catch (e) {}
}

export function getEnrolledCourseIds(userId) {
  const key = getUserEnrolledKey(userId);
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return [1]; // Default enrolled in course 1 for demo
}

export function enrollCourse(userId, courseId) {
  const current = getEnrolledCourseIds(userId);
  if (!current.includes(courseId)) {
    const updated = [...current, courseId];
    try {
      localStorage.setItem(getUserEnrolledKey(userId), JSON.stringify(updated));
    } catch (e) {}
    return updated;
  }
  return current;
}

