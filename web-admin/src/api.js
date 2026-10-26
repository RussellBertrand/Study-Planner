const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

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

// Generic Request Helper
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
  login: (username, password) => {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  register: (username, password, name, role = 'user') => {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, name, role }),
    });
  },

  getProfile: () => {
    return request('/auth/me', {
      method: 'GET',
    });
  },

  // Tasks API
  getTasks: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.priority && params.priority !== 'ALL') {
      searchParams.append('priority', params.priority);
    }
    if (params.status) {
      searchParams.append('status', params.status);
    }
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return request(`/tasks${query}`, {
      method: 'GET',
    });
  },

  getTaskById: (id) => {
    return request(`/tasks/${id}`, {
      method: 'GET',
    });
  },

  createTask: (taskData) => {
    return request('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  },

  updateTask: (id, taskData) => {
    return request(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  },

  deleteTask: (id) => {
    return request(`/tasks/${id}`, {
      method: 'DELETE',
    });
  },
};
