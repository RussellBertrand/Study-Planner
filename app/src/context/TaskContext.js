import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const TaskContext = createContext(null);

export function TaskProvider({ children }) {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTasks = async (params = {}) => {
    if (!currentUser) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.getTasks(params);
      setTasks(res.tasks || []);
    } catch (err) {
      console.warn('Gagal memuat tugas:', err.message);
      setError(err.message || 'Gagal memuat tugas dari server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchTasks();
    } else {
      setTasks([]);
    }
  }, [currentUser]);

  const createTask = async (taskData) => {
    const res = await api.createTask(taskData);
    if (res.task) {
      setTasks((prev) => [res.task, ...prev]);
    }
    return res;
  };

  const updateTask = async (id, taskData) => {
    const res = await api.updateTask(id, taskData);
    if (res.task) {
      setTasks((prev) =>
        prev.map((t) => (String(t.id) === String(id) ? { ...t, ...res.task } : t))
      );
    }
    return res;
  };

  const toggleTaskStatus = async (task) => {
    let nextStatus = 'in_progress';
    if (task.status === 'pending') nextStatus = 'in_progress';
    else if (task.status === 'in_progress') nextStatus = 'completed';
    else nextStatus = 'pending';

    return await updateTask(task.id, { status: nextStatus });
  };

  const deleteTask = async (id) => {
    const res = await api.deleteTask(id);
    setTasks((prev) => prev.filter((t) => String(t.id) !== String(id)));
    return res;
  };

  // Computations
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'completed').length;
    const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
    const pending = tasks.filter((t) => !t.status || t.status === 'pending').length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Sort tasks by deadline for upcoming section
    const activeTasks = tasks.filter((t) => t.status !== 'completed');
    const sortedUpcoming = [...activeTasks].sort((a, b) => {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline) - new Date(b.deadline);
    });

    return {
      total,
      completed,
      inProgress,
      pending,
      rate,
      upcomingTasks: sortedUpcoming.slice(0, 4),
    };
  }, [tasks]);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        error,
        stats,
        fetchTasks,
        createTask,
        updateTask,
        toggleTaskStatus,
        deleteTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}

