import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const STORAGE_KEYS = {
  TOKEN: '@study_planner_token',
  USER: '@study_planner_user',
  CUSTOM_API_URL: '@study_planner_custom_api_url',
  LOCAL_USERS: '@study_planner_local_users',
  LOCAL_TASKS: '@study_planner_local_tasks',
  ENROLLED_COURSES: '@study_planner_enrolled_courses',
};

// Default fallback IP:
// - Android Emulator: 10.0.2.2:3000
// - iOS Simulator / Web: localhost:3000
// - Real Devices: Local WiFi IP
const DEFAULT_URL = process.env.EXPO_PUBLIC_API_URL || (
  Platform.OS === 'android'
    ? 'http://10.3.13.182:3000/api'
    : 'http://10.3.13.182:3000/api'
);

export const getBaseApiUrl = async () => {
  try {
    const custom = await AsyncStorage.getItem(STORAGE_KEYS.CUSTOM_API_URL);
    if (custom && custom.trim()) {
      return custom.trim();
    }
  } catch (e) {}
  return DEFAULT_URL;
};

export const setCustomApiUrl = async (url) => {
  try {
    if (url) {
      await AsyncStorage.setItem(STORAGE_KEYS.CUSTOM_API_URL, url);
    } else {
      await AsyncStorage.removeItem(STORAGE_KEYS.CUSTOM_API_URL);
    }
  } catch (e) {}
};

export const getStoredToken = async () => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
  } catch (e) {
    return null;
  }
};

export const setStoredToken = async (token) => {
  try {
    if (token) {
      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
    } else {
      await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
    }
  } catch (e) {}
};

export const getStoredUser = async () => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.USER);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

export const setStoredUser = async (user) => {
  try {
    if (user) {
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } else {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    }
  } catch (e) {}
};

// Seed Demo Users for offline / demo mode
const DEMO_USERS = [
  { id: 1, username: 'admin', password: 'admin123', name: 'Pak Mentor Joy', role: 'admin' },
  { id: 2, username: 'siswa', password: 'siswa123', name: 'Siswa Rajin', role: 'user' },
  { id: 3, username: 'budi', password: '321', name: 'Budi Santoso', role: 'user' },
];

const INITIAL_SEED_TASKS = [
  {
    id: 101,
    user_id: 2,
    title: 'Laporan Praktikum CNN & Deep Learning',
    subject: 'Deep Learning',
    deadline: '2026-11-20',
    priority: 'High',
    status: 'in_progress',
    created_at: new Date().toISOString(),
  },
  {
    id: 102,
    user_id: 2,
    title: 'Implementasi Antarmuka Web JoyVis',
    subject: 'Web and Mobile Application Development',
    deadline: '2026-11-25',
    priority: 'High',
    status: 'pending',
    created_at: new Date().toISOString(),
  },
  {
    id: 103,
    user_id: 2,
    title: 'Analisis Ergonomi UI/UX Mobile',
    subject: 'Human-Computer Interaction',
    deadline: '2026-11-28',
    priority: 'Medium',
    status: 'pending',
    created_at: new Date().toISOString(),
  },
  {
    id: 104,
    user_id: 2,
    title: 'Review Jurnal Visual Perception',
    subject: 'Visual Perception',
    deadline: '2026-11-30',
    priority: 'Low',
    status: 'completed',
    created_at: new Date().toISOString(),
  },
];

async function getLocalUsers() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.LOCAL_USERS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

async function saveLocalUsers(users) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.LOCAL_USERS, JSON.stringify(users));
  } catch (e) {}
}

async function getLocalTasks(userId) {
  try {
    const key = `${STORAGE_KEYS.LOCAL_TASKS}_${userId || 'guest'}`;
    const raw = await AsyncStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) {}

  // Save initial seed tasks
  const key = `${STORAGE_KEYS.LOCAL_TASKS}_${userId || 'guest'}`;
  await AsyncStorage.setItem(key, JSON.stringify(INITIAL_SEED_TASKS));
  return INITIAL_SEED_TASKS;
}

async function saveLocalTasks(userId, tasks) {
  try {
    const key = `${STORAGE_KEYS.LOCAL_TASKS}_${userId || 'guest'}`;
    await AsyncStorage.setItem(key, JSON.stringify(tasks));
  } catch (e) {}
}

// Request Helper
async function requestWithTimeout(endpoint, options = {}, timeoutMs = 4500) {
  const baseUrl = await getBaseApiUrl();
  const token = await getStoredToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timer);

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(data.message || `Request gagal dengan status ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

export const api = {
  // Auth API
  login: async (username, password) => {
    const cleanUser = username.trim().toLowerCase();

    // 1. Coba request ke Backend Server
    try {
      const data = await requestWithTimeout('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: cleanUser, password }),
      });
      return data;
    } catch (err) {
      // Jika server aktif merespon kredensial salah (401), lemparkan error
      if (err.status === 401) {
        throw err;
      }

      // Jika jaringan/server unreachable (timeout/connection refused): gunakan offline demo fallback
      console.warn('Backend server tidak dapat dijangkau, menggunakan autentikasi lokal:', err.message);

      const localUsers = await getLocalUsers();
      const allUsers = [...DEMO_USERS, ...localUsers];

      const found = allUsers.find(
        (u) => u.username.toLowerCase() === cleanUser && u.password === password
      );

      if (found) {
        const payload = {
          id: found.id,
          username: found.username,
          name: found.name,
          role: found.role,
        };
        const token = `local_token_${found.id}_${Date.now()}`;
        return {
          message: 'Login berhasil (Mode Terintegrasi/Lokal).',
          token,
          user: payload,
        };
      }

      throw new Error('Username atau password salah.');
    }
  },

  register: async (username, password, name, role = 'user') => {
    const cleanUser = username.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanRole = role === 'admin' ? 'admin' : 'user';

    try {
      const data = await requestWithTimeout('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          username: cleanUser,
          password,
          name: cleanName,
          role: cleanRole,
        }),
      });
      return data;
    } catch (err) {
      if (err.status === 400 || err.status === 409) {
        throw err;
      }

      console.warn('Backend server tidak dapat dijangkau, registrasi disimpan lokal:', err.message);

      const localUsers = await getLocalUsers();
      const allUsers = [...DEMO_USERS, ...localUsers];

      if (allUsers.some((u) => u.username.toLowerCase() === cleanUser)) {
        throw new Error('Username sudah digunakan, silakan pilih yang lain.');
      }

      const newUser = {
        id: Date.now(),
        username: cleanUser,
        name: cleanName,
        role: cleanRole,
        password,
        created_at: new Date().toISOString(),
      };

      await saveLocalUsers([...localUsers, newUser]);

      const payload = {
        id: newUser.id,
        username: newUser.username,
        name: newUser.name,
        role: newUser.role,
      };
      const token = `local_token_${newUser.id}_${Date.now()}`;

      return {
        message: 'Registrasi berhasil.',
        token,
        user: payload,
      };
    }
  },

  getProfile: async () => {
    try {
      return await requestWithTimeout('/auth/me', {
        method: 'GET',
      });
    } catch (err) {
      const stored = await getStoredUser();
      if (stored) return { user: stored };
      throw err;
    }
  },

  // Tasks API
  getTasks: async (params = {}) => {
    try {
      const searchParams = [];
      if (params.priority && params.priority !== 'ALL') {
        searchParams.push(`priority=${encodeURIComponent(params.priority)}`);
      }
      if (params.status && params.status !== 'ALL') {
        searchParams.push(`status=${encodeURIComponent(params.status)}`);
      }
      const query = searchParams.length ? `?${searchParams.join('&')}` : '';
      return await requestWithTimeout(`/tasks${query}`, {
        method: 'GET',
      });
    } catch (err) {
      const stored = await getStoredUser();
      const tasks = await getLocalTasks(stored?.id);

      let filtered = tasks;
      if (params.priority && params.priority !== 'ALL') {
        filtered = filtered.filter((t) => t.priority === params.priority);
      }
      if (params.status && params.status !== 'ALL') {
        filtered = filtered.filter((t) => t.status === params.status);
      }
      return { tasks: filtered };
    }
  },

  createTask: async (taskData) => {
    try {
      return await requestWithTimeout('/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
      });
    } catch (err) {
      const stored = await getStoredUser();
      const tasks = await getLocalTasks(stored?.id);
      const newTask = {
        id: Date.now(),
        user_id: stored?.id || 2,
        user_name: stored?.name || stored?.username || 'Siswa',
        title: taskData.title,
        subject: taskData.subject || 'Umum',
        deadline: taskData.deadline,
        priority: taskData.priority || 'Medium',
        status: taskData.status || 'pending',
        created_at: new Date().toISOString(),
      };
      const updated = [newTask, ...tasks];
      await saveLocalTasks(stored?.id, updated);
      return { message: 'Tugas berhasil dibuat.', task: newTask };
    }
  },

  updateTask: async (id, taskData) => {
    try {
      return await requestWithTimeout(`/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(taskData),
      });
    } catch (err) {
      const stored = await getStoredUser();
      const tasks = await getLocalTasks(stored?.id);
      const updated = tasks.map((t) =>
        String(t.id) === String(id) ? { ...t, ...taskData } : t
      );
      await saveLocalTasks(stored?.id, updated);
      const task = updated.find((t) => String(t.id) === String(id));
      return { message: 'Tugas berhasil diperbarui.', task };
    }
  },

  deleteTask: async (id) => {
    try {
      return await requestWithTimeout(`/tasks/${id}`, {
        method: 'DELETE',
      });
    } catch (err) {
      const stored = await getStoredUser();
      const tasks = await getLocalTasks(stored?.id);
      const filtered = tasks.filter((t) => String(t.id) !== String(id));
      await saveLocalTasks(stored?.id, filtered);
      return { message: 'Tugas berhasil dihapus.' };
    }
  },

  // Profile & Password Management
  updateProfile: async (profileData) => {
    try {
      const res = await requestWithTimeout('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });
      if (res.user) {
        await setStoredUser(res.user);
      }
      return res;
    } catch (err) {
      const stored = (await getStoredUser()) || {};
      const updated = { ...stored, ...profileData };
      await setStoredUser(updated);
      return { message: 'Profil berhasil diperbarui (Lokal).', user: updated };
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    return await requestWithTimeout('/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  // Schedules API (Class & Study Calendar)
  getSchedules: async (day) => {
    try {
      const query = day ? `?day=${encodeURIComponent(day)}` : '';
      return await requestWithTimeout(`/schedules${query}`, {
        method: 'GET',
      });
    } catch (err) {
      const stored = await getStoredUser();
      const key = `@study_planner_schedules_${stored?.id || 'guest'}`;
      let list = [];
      try {
        const raw = await AsyncStorage.getItem(key);
        list = raw ? JSON.parse(raw) : [
          {
            id: 201,
            user_id: stored?.id || 2,
            title: 'Kuliah Pemrograman Web & Mobile',
            subject: 'Web and Mobile Application Development',
            day_of_week: 'Senin',
            start_time: '08:00',
            end_time: '10:30',
            room: 'Lab Komputer 3',
            lecturer: 'Dr. Hendra Gunawan, S.Kom., M.T.',
            notes: 'Bawa laptop dengan Node.js dan VS Code terpasang',
          },
          {
            id: 202,
            user_id: stored?.id || 2,
            title: 'Kuliah Interaksi Manusia dan Komputer',
            subject: 'Human-Computer Interaction',
            day_of_week: 'Rabu',
            start_time: '10:00',
            end_time: '12:00',
            room: 'Gedung F R.402',
            lecturer: 'Prof. Rina Suryani, M.Sc.',
            notes: 'Presentasi mockup Figma kelompok',
          },
          {
            id: 203,
            user_id: stored?.id || 2,
            title: 'Praktikum Deep Learning & CNN',
            subject: 'Deep Learning',
            day_of_week: 'Kamis',
            start_time: '13:00',
            end_time: '15:30',
            room: 'Lab AI & Robotika',
            lecturer: 'Ahmad Fauzi, Ph.D.',
            notes: 'Evaluasi model training PyTorch',
          },
        ];
      } catch (e) {}

      if (day && day !== 'ALL') {
        list = list.filter((s) => s.day_of_week === day);
      }
      return { schedules: list };
    }
  },

  createSchedule: async (scheduleData) => {
    try {
      return await requestWithTimeout('/schedules', {
        method: 'POST',
        body: JSON.stringify(scheduleData),
      });
    } catch (err) {
      const stored = await getStoredUser();
      const key = `@study_planner_schedules_${stored?.id || 'guest'}`;
      const raw = await AsyncStorage.getItem(key);
      const list = raw ? JSON.parse(raw) : [];
      const newSchedule = {
        id: Date.now(),
        user_id: stored?.id || 1,
        ...scheduleData,
        created_at: new Date().toISOString(),
      };
      const updated = [...list, newSchedule];
      await AsyncStorage.setItem(key, JSON.stringify(updated));
      return { message: 'Jadwal berhasil ditambahkan.', schedule: newSchedule };
    }
  },

  updateSchedule: async (id, scheduleData) => {
    try {
      return await requestWithTimeout(`/schedules/${id}`, {
        method: 'PUT',
        body: JSON.stringify(scheduleData),
      });
    } catch (err) {
      const stored = await getStoredUser();
      const key = `@study_planner_schedules_${stored?.id || 'guest'}`;
      const raw = await AsyncStorage.getItem(key);
      const list = raw ? JSON.parse(raw) : [];
      const updated = list.map((s) =>
        String(s.id) === String(id) ? { ...s, ...scheduleData } : s
      );
      await AsyncStorage.setItem(key, JSON.stringify(updated));
      const schedule = updated.find((s) => String(s.id) === String(id));
      return { message: 'Jadwal berhasil diperbarui.', schedule };
    }
  },

  deleteSchedule: async (id) => {
    try {
      return await requestWithTimeout(`/schedules/${id}`, {
        method: 'DELETE',
      });
    } catch (err) {
      const stored = await getStoredUser();
      const key = `@study_planner_schedules_${stored?.id || 'guest'}`;
      const raw = await AsyncStorage.getItem(key);
      const list = raw ? JSON.parse(raw) : [];
      const filtered = list.filter((s) => String(s.id) !== String(id));
      await AsyncStorage.setItem(key, JSON.stringify(filtered));
      return { message: 'Jadwal berhasil dihapus.' };
    }
  },

  // Admin Management API
  getAdminUsers: async () => {
    try {
      return await requestWithTimeout('/admin/users', {
        method: 'GET',
      });
    } catch (err) {
      const localUsers = await getLocalUsers();
      const all = [...DEMO_USERS, ...localUsers].map((u) => ({
        ...u,
        total_tasks: 4,
        completed_tasks: 1,
        in_progress_tasks: 1,
        pending_tasks: 2,
      }));
      return { users: all };
    }
  },

  getAdminStats: async () => {
    try {
      return await requestWithTimeout('/admin/stats', {
        method: 'GET',
      });
    } catch (err) {
      return {
        stats: {
          totalUsers: 3,
          activeStudents: 2,
          totalTasks: 8,
          completedTasks: 3,
          completionRate: 38,
        },
      };
    }
  },

  deleteAdminUser: async (id) => {
    return await requestWithTimeout(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  },

  // StudyMate AI Chatbot API
  getAiHistory: async () => {
    try {
      return await requestWithTimeout('/ai/history', {
        method: 'GET',
      });
    } catch (err) {
      const stored = await getStoredUser();
      const key = `@study_planner_chat_${stored?.id || 'guest'}`;
      const raw = await AsyncStorage.getItem(key);
      return { history: raw ? JSON.parse(raw) : [] };
    }
  },

  clearAiHistory: async () => {
    try {
      return await requestWithTimeout('/ai/history', {
        method: 'DELETE',
      });
    } catch (err) {
      const stored = await getStoredUser();
      const key = `@study_planner_chat_${stored?.id || 'guest'}`;
      await AsyncStorage.removeItem(key);
      return { message: 'Riwayat chat dibersihkan.' };
    }
  },

  sendAiChat: async (message) => {
    try {
      return await requestWithTimeout('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message }),
      });
    } catch (err) {
      const stored = (await getStoredUser()) || { name: 'Siswa' };
      const tasks = await getLocalTasks(stored.id);
      const lower = message.toLowerCase();

      let reply = `Halo ${stored.name}! Saya StudyMate AI dalam mode offline.`;
      let actionProposal = null;

      if (lower.includes('jadwal') || lower.includes('kuliah')) {
        reply = `🗓️ **Jadwal Kuliah Anda:**\n• **Senin** (08:00 - 10:30): Pemrograman Web & Mobile (Lab 3)\n• **Rabu** (10:00 - 12:00): Interaksi Manusia & Komputer (R.402)\n• **Kamis** (13:00 - 15:30): Deep Learning (Lab AI)\n\nIngin menambah atau mengedit jadwal perkuliahan?`;
      } else if (lower.includes('tugas') || lower.includes('mendesak') || lower.includes('prioritas')) {
        const active = tasks.filter((t) => t.status !== 'completed');
        reply = `📋 **Rekomendasi Prioritas Tugas:**\n\n` +
          (active.length > 0
            ? active.map((t, idx) => `${idx + 1}. **${t.title}** [${t.priority}] - Deadline: ${t.deadline}`).join('\n')
            : 'Tidak ada tugas yang tertunda. Bagus sekali, semua tugas sudah tuntas!');
      } else if (lower.includes('buatkan tugas') || lower.includes('tambah tugas')) {
        const titleMatch = message.match(/(?:buatkan|tambah)\s+tugas\s+([^,.\n]+)/i);
        const taskTitle = titleMatch ? titleMatch[1].trim() : 'Materi Belajar Baru';
        actionProposal = {
          type: 'create_task',
          data: {
            title: taskTitle,
            subject: 'Umum',
            deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            priority: 'Medium',
            status: 'pending',
          },
        };
        reply = `Saya telah menyiapkan proposal pembuatan tugas baru: **"${taskTitle}"**.\n\nKetuk tombol konfirmasi di bawah untuk menyimpannya ke daftar tugas Anda!`;
      } else {
        reply = `Halo ${stored.name}! Saya StudyMate AI, asisten belajar cerdas Anda di Study Planner mobile. Anda bisa menanyakan prioritas tugas, jadwal kuliah, atau tips fokus belajar. Ada yang bisa saya bantu? 🚀`;
      }

      const key = `@study_planner_chat_${stored?.id || 'guest'}`;
      const raw = await AsyncStorage.getItem(key);
      const chat = raw ? JSON.parse(raw) : [];
      chat.push({ id: Date.now(), sender: 'user', message });
      chat.push({ id: Date.now() + 1, sender: 'assistant', message: reply, action_data: actionProposal });
      await AsyncStorage.setItem(key, JSON.stringify(chat));

      return { reply, actionProposal };
    }
  },

  confirmAiAction: async (actionType, actionData) => {
    try {
      return await requestWithTimeout('/ai/action/confirm', {
        method: 'POST',
        body: JSON.stringify({ actionType, actionData }),
      });
    } catch (err) {
      if (actionType === 'create_task') {
        const res = await api.createTask(actionData);
        return { success: true, message: `Tugas "${actionData.title}" berhasil dibuat!`, data: res.task };
      }
      if (actionType === 'update_task_status') {
        const res = await api.updateTask(actionData.id, { status: actionData.status });
        return { success: true, message: `Status tugas diperbarui ke "${actionData.status}"!`, data: res.task };
      }
      if (actionType === 'create_schedule') {
        const res = await api.createSchedule(actionData);
        return { success: true, message: `Jadwal "${actionData.title}" berhasil ditambahkan!`, data: res.schedule };
      }
      throw err;
    }
  },

  // Courses Enrollment Storage
  getEnrolledCourses: async (userId) => {
    try {
      const key = `${STORAGE_KEYS.ENROLLED_COURSES}_${userId || 'guest'}`;
      const raw = await AsyncStorage.getItem(key);
      return raw ? JSON.parse(raw) : ['c1']; // Default enrolled in course 1
    } catch (e) {
      return ['c1'];
    }
  },

  enrollCourse: async (userId, courseId) => {
    try {
      const key = `${STORAGE_KEYS.ENROLLED_COURSES}_${userId || 'guest'}`;
      const raw = await AsyncStorage.getItem(key);
      const current = raw ? JSON.parse(raw) : ['c1'];
      if (!current.includes(courseId)) {
        const updated = [...current, courseId];
        await AsyncStorage.setItem(key, JSON.stringify(updated));
        return updated;
      }
      return current;
    } catch (e) {
      return [];
    }
  },
};

