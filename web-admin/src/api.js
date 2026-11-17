const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (
  typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:3000/api'
    : '/api'
);

export const getAuthToken = () => {
  return localStorage.getItem('study_planner_token');
};

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('study_planner_token', token);
  } else {
    localStorage.removeItem('study_planner_token');
  }
};

export const getStoredUser = () => {
  const user = localStorage.getItem('study_planner_user');
  return user ? JSON.parse(user) : null;
};

export const setStoredUser = (user) => {
  if (user) {
    localStorage.setItem('study_planner_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('study_planner_user');
  }
};

// Demo default users for fallback / static deployment (GitHub Pages)
const DEMO_USERS = [
  { id: 1, username: 'admin', password: 'admin123', name: 'Pak Mentor Joy', role: 'admin' },
  { id: 2, username: 'siswa', password: 'siswa123', name: 'Siswa Rajin', role: 'user' },
  { id: 3, username: 'budi', password: '321', name: 'Budi Santoso', role: 'user' },
];

function getLocalUsers() {
  try {
    const data = localStorage.getItem('study_planner_local_users');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalUsers(users) {
  try {
    localStorage.setItem('study_planner_local_users', JSON.stringify(users));
  } catch (e) {}
}

function getLocalTasks(userId) {
  try {
    const key = `study_planner_tasks_${userId || 'guest'}`;
    const data = localStorage.getItem(key);
    if (data) return JSON.parse(data);
  } catch (e) {}

  // Default seed tasks
  const initial = [
    {
      id: 101,
      user_id: userId || 2,
      title: 'Laporan Praktikum CNN & Deep Learning',
      subject: 'Deep Learning',
      deadline: '2026-11-20',
      priority: 'High',
      status: 'in_progress',
      created_at: new Date().toISOString(),
    },
    {
      id: 102,
      user_id: userId || 2,
      title: 'Implementasi Antarmuka Web JoyVis',
      subject: 'Web and Mobile Application Development',
      deadline: '2026-11-25',
      priority: 'High',
      status: 'pending',
      created_at: new Date().toISOString(),
    },
    {
      id: 103,
      user_id: userId || 2,
      title: 'Analisis Ergonomi UI/UX',
      subject: 'Human-Computer Interaction',
      deadline: '2026-11-28',
      priority: 'Medium',
      status: 'pending',
      created_at: new Date().toISOString(),
    },
    {
      id: 104,
      user_id: userId || 2,
      title: 'Review Jurnal Visual Perception',
      subject: 'Visual Perception',
      deadline: '2026-11-30',
      priority: 'Low',
      status: 'completed',
      created_at: new Date().toISOString(),
    },
  ];
  saveLocalTasks(userId, initial);
  return initial;
}

function saveLocalTasks(userId, tasks) {
  try {
    const key = `study_planner_tasks_${userId || 'guest'}`;
    localStorage.setItem(key, JSON.stringify(tasks));
  } catch (e) {}
}

// Generic Request Helper with graceful fallback for static/offline deployment
async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Auth API
  login: async (username, password) => {
    const cleanUser = username.trim().toLowerCase();

    // 1. Coba request ke backend server
    try {
      return await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: cleanUser, password }),
      });
    } catch (err) {
      // Jika backend merespon 401 (kredensial salah dari server aktif), lemparkan error
      if (err.status === 401) {
        throw err;
      }

      // Jika server offline / NetworkError / 404 (misal di GitHub Pages): gunakan offline fallback
      console.warn('Backend server tidak dapat dijangkau, beralih ke penyimpanan lokal:', err.message);

      const localUsers = getLocalUsers();
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

    // 1. Coba request ke backend server
    try {
      return await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          username: cleanUser,
          password,
          name: cleanName,
          role: cleanRole,
        }),
      });
    } catch (err) {
      // Jika backend merespon 400 atau 409 (misal username sudah ada di database backend):
      if (err.status === 400 || err.status === 409) {
        throw err;
      }

      // Jika server offline / NetworkError / 404 (misal di GitHub Pages): gunakan offline fallback
      console.warn('Backend server tidak dapat dijangkau, registrasi disimpan di penyimpanan lokal:', err.message);

      const localUsers = getLocalUsers();
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

      saveLocalUsers([...localUsers, newUser]);

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
      return await request('/auth/me', {
        method: 'GET',
      });
    } catch (err) {
      const stored = getStoredUser();
      if (stored) {
        return { user: stored };
      }
      throw err;
    }
  },

  // Tasks API
  getTasks: async (params = {}) => {
    try {
      const searchParams = new URLSearchParams();
      if (params.priority && params.priority !== 'ALL') {
        searchParams.append('priority', params.priority);
      }
      if (params.status) {
        searchParams.append('status', params.status);
      }
      const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
      return await request(`/tasks${query}`, {
        method: 'GET',
      });
    } catch (err) {
      const stored = getStoredUser();
      const tasks = getLocalTasks(stored?.id);
      return { tasks };
    }
  },

  getTaskById: async (id) => {
    try {
      return await request(`/tasks/${id}`, {
        method: 'GET',
      });
    } catch (err) {
      const stored = getStoredUser();
      const tasks = getLocalTasks(stored?.id);
      const task = tasks.find((t) => t.id === Number(id));
      if (!task) throw new Error('Tugas tidak ditemukan.');
      return { task };
    }
  },

  createTask: async (taskData) => {
    try {
      return await request('/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
      });
    } catch (err) {
      const stored = getStoredUser();
      const tasks = getLocalTasks(stored?.id);
      const newTask = {
        id: Date.now(),
        user_id: stored?.id || 1,
        title: taskData.title,
        subject: taskData.subject,
        deadline: taskData.deadline,
        priority: taskData.priority || 'Medium',
        status: taskData.status || 'pending',
        created_at: new Date().toISOString(),
      };
      saveLocalTasks(stored?.id, [newTask, ...tasks]);
      return { message: 'Tugas berhasil dibuat.', task: newTask };
    }
  },

  updateTask: async (id, taskData) => {
    try {
      return await request(`/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(taskData),
      });
    } catch (err) {
      const stored = getStoredUser();
      const tasks = getLocalTasks(stored?.id);
      const updated = tasks.map((t) =>
        t.id === Number(id) ? { ...t, ...taskData } : t
      );
      saveLocalTasks(stored?.id, updated);
      const task = updated.find((t) => t.id === Number(id));
      return { message: 'Tugas berhasil diperbarui.', task };
    }
  },

  deleteTask: async (id) => {
    try {
      return await request(`/tasks/${id}`, {
        method: 'DELETE',
      });
    } catch (err) {
      const stored = getStoredUser();
      const tasks = getLocalTasks(stored?.id);
      const filtered = tasks.filter((t) => t.id !== Number(id));
      saveLocalTasks(stored?.id, filtered);
      return { message: 'Tugas berhasil dihapus.' };
    }
  },
};
