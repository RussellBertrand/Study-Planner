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

function getLocalSchedules(userId) {
  try {
    const key = `study_planner_schedules_${userId || 'guest'}`;
    const data = localStorage.getItem(key);
    if (data) return JSON.parse(data);
  } catch (e) {}

  const initial = [
    {
      id: 201,
      user_id: userId || 2,
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
      user_id: userId || 2,
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
      user_id: userId || 2,
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
  saveLocalSchedules(userId, initial);
  return initial;
}

function saveLocalSchedules(userId, schedules) {
  try {
    const key = `study_planner_schedules_${userId || 'guest'}`;
    localStorage.setItem(key, JSON.stringify(schedules));
  } catch (e) {}
}

function getLocalChat(userId) {
  try {
    const key = `study_planner_chat_${userId || 'guest'}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalChat(userId, messages) {
  try {
    const key = `study_planner_chat_${userId || 'guest'}`;
    localStorage.setItem(key, JSON.stringify(messages));
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
        user_name: stored?.name || stored?.username || 'Siswa',
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
        String(t.id) === String(id) ? { ...t, ...taskData } : t
      );
      saveLocalTasks(stored?.id, updated);
      const task = updated.find((t) => String(t.id) === String(id));
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
      const filtered = tasks.filter((t) => String(t.id) !== String(id));
      saveLocalTasks(stored?.id, filtered);
      return { message: 'Tugas berhasil dihapus.' };
    }
  },

  // Profile & Password Management
  updateProfile: async (profileData) => {
    try {
      const res = await request('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });
      if (res.user) {
        setStoredUser(res.user);
      }
      return res;
    } catch (err) {
      const stored = getStoredUser() || {};
      const updated = { ...stored, ...profileData };
      setStoredUser(updated);
      return { message: 'Profil berhasil diperbarui (Lokal).', user: updated };
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    return await request('/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  // Schedules API (Class & Study Calendar)
  getSchedules: async (day) => {
    try {
      const query = day ? `?day=${encodeURIComponent(day)}` : '';
      return await request(`/schedules${query}`, {
        method: 'GET',
      });
    } catch (err) {
      const stored = getStoredUser();
      let list = getLocalSchedules(stored?.id);
      if (day) {
        list = list.filter((s) => s.day_of_week === day);
      }
      return { schedules: list };
    }
  },

  createSchedule: async (scheduleData) => {
    try {
      return await request('/schedules', {
        method: 'POST',
        body: JSON.stringify(scheduleData),
      });
    } catch (err) {
      const stored = getStoredUser();
      const list = getLocalSchedules(stored?.id);
      const newSchedule = {
        id: Date.now(),
        user_id: stored?.id || 1,
        ...scheduleData,
        created_at: new Date().toISOString(),
      };
      const updated = [...list, newSchedule];
      saveLocalSchedules(stored?.id, updated);
      return { message: 'Jadwal berhasil ditambahkan.', schedule: newSchedule };
    }
  },

  updateSchedule: async (id, scheduleData) => {
    try {
      return await request(`/schedules/${id}`, {
        method: 'PUT',
        body: JSON.stringify(scheduleData),
      });
    } catch (err) {
      const stored = getStoredUser();
      const list = getLocalSchedules(stored?.id);
      const updated = list.map((s) =>
        String(s.id) === String(id) ? { ...s, ...scheduleData } : s
      );
      saveLocalSchedules(stored?.id, updated);
      const schedule = updated.find((s) => String(s.id) === String(id));
      return { message: 'Jadwal berhasil diperbarui.', schedule };
    }
  },

  deleteSchedule: async (id) => {
    try {
      return await request(`/schedules/${id}`, {
        method: 'DELETE',
      });
    } catch (err) {
      const stored = getStoredUser();
      const list = getLocalSchedules(stored?.id);
      const filtered = list.filter((s) => String(s.id) !== String(id));
      saveLocalSchedules(stored?.id, filtered);
      return { message: 'Jadwal berhasil dihapus.' };
    }
  },

  // Admin Management API
  getAdminUsers: async () => {
    try {
      return await request('/admin/users', {
        method: 'GET',
      });
    } catch (err) {
      const localUsers = getLocalUsers();
      const allUsers = [...DEMO_USERS, ...localUsers].map((u) => ({
        ...u,
        total_tasks: 4,
        completed_tasks: 1,
        in_progress_tasks: 1,
        pending_tasks: 2,
      }));
      return { users: allUsers };
    }
  },

  getAdminStats: async () => {
    try {
      return await request('/admin/stats', {
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
    return await request(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  },

  // StudyMate AI Chatbot API
  getAiHistory: async () => {
    try {
      return await request('/ai/history', {
        method: 'GET',
      });
    } catch (err) {
      const stored = getStoredUser();
      const history = getLocalChat(stored?.id);
      return { history };
    }
  },

  clearAiHistory: async () => {
    try {
      return await request('/ai/history', {
        method: 'DELETE',
      });
    } catch (err) {
      const stored = getStoredUser();
      saveLocalChat(stored?.id, []);
      return { message: 'Riwayat dibersihkan.' };
    }
  },

  sendAiChat: async (message) => {
    try {
      return await request('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message }),
      });
    } catch (err) {
      // Local fallback contextual bot response if server is disconnected
      const stored = getStoredUser() || { name: 'Siswa' };
      const tasks = getLocalTasks(stored.id);
      const lower = message.toLowerCase();

      let reply = `Halo ${stored.name}! Saya StudyMate AI dalam mode offline.`;
      let actionProposal = null;

      if (lower.includes('jadwal') || lower.includes('kuliah')) {
        const schedules = getLocalSchedules(stored.id);
        reply = `🗓️ **Jadwal Kuliah Anda (${schedules.length} mata kuliah):**\n\n` +
          schedules.map((s) => `• **${s.day_of_week}** (${s.start_time}-${s.end_time}): ${s.title} (${s.room || 'Online'})`).join('\n') +
          `\n\nAda jadwal yang ingin Anda ubah atau tambahkan?`;
      } else if (lower.includes('tugas') || lower.includes('mendesak') || lower.includes('prioritas')) {
        const active = tasks.filter((t) => t.status !== 'completed');
        reply = `📋 **Rekomendasi Prioritas Tugas untuk ${stored.name}:**\n\n` +
          (active.length > 0
            ? active.map((t, idx) => `${idx + 1}. **${t.title}** [${t.priority}] - Deadline: ${t.deadline}`).join('\n')
            : 'Saat ini belum ada tugas aktif. Waktu yang tepat untuk mengulang materi atau istirahat!');
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
        reply = `Saya telah menyiapkan proposal pembuatan tugas baru untuk Anda: **"${taskTitle}"**.\n\nSilakan tinjau dan klik tombol konfirmasi di bawah untuk menyimpannya.`;
      } else {
        reply = `Halo ${stored.name}! Saya StudyMate AI. Saya bisa membantu Anda mengorganisir tugas, memeriksa jadwal perkuliahan, dan merancang strategi belajar Pomodoro yang efektif. Silakan tanyakan apa saja! 🚀`;
      }

      // Save to local chat
      const chat = getLocalChat(stored.id);
      chat.push({ id: Date.now(), sender: 'user', message });
      chat.push({ id: Date.now() + 1, sender: 'assistant', message: reply, action_data: actionProposal });
      saveLocalChat(stored.id, chat);

      return { reply, actionProposal };
    }
  },

  confirmAiAction: async (actionType, actionData) => {
    try {
      return await request('/ai/action/confirm', {
        method: 'POST',
        body: JSON.stringify({ actionType, actionData }),
      });
    } catch (err) {
      const stored = getStoredUser();
      if (actionType === 'create_task') {
        const res = await api.createTask(actionData);
        return { success: true, message: `Tugas "${actionData.title}" berhasil dijadwalkan!`, data: res.task };
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
};
