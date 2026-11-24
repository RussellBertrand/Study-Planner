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

