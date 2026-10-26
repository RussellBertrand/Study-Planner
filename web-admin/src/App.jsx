import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { api, getAuthToken, setAuthToken, getStoredUser, setStoredUser } from './api';
import './App.css';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import FormPage from './pages/FormPage';

function App() {
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [tasksError, setTasksError] = useState('');

  // Sinkronisasi data user aktif saat aplikasi dibuka atau token valid
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      api.getProfile()
        .then((res) => {
          setCurrentUser(res.user);
          setStoredUser(res.user);
        })
        .catch(() => {
          // Jika token invalid/expired, reset session
          handleLogout();
        });
    }
  }, []);

  // Fetch tasks dari backend jika user sudah login
  const fetchTasks = async () => {
    if (!getAuthToken()) return;
    try {
      setLoadingTasks(true);
      setTasksError('');
      const data = await api.getTasks();
      setTasks(data.tasks || []);
    } catch (err) {
      console.error('Error saat memuat tasks:', err);
      setTasksError(err.message || 'Gagal memuat tugas dari server backend.');
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchTasks();
    } else {
      setTasks([]);
    }
  }, [currentUser]);

  const handleAddTask = (newTask) => {
    setTasks((prevTasks) => [newTask, ...prevTasks]);
  };

  const handleLogout = () => {
    setAuthToken(null);
    setStoredUser(null);
    setCurrentUser(null);
    setTasks([]);
  };

  return (
    <HashRouter>
      <Routes>
        {/* Halaman Utama Edukasi Belajar Aja */}
        <Route
          path="/"
          element={<HomePage currentUser={currentUser} onLogout={handleLogout} />}
        />

        {/* Halaman Login & Sign Up (Menyimpan JWT) */}
        <Route
          path="/login"
          element={
            currentUser ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LoginPage setCurrentUser={setCurrentUser} />
            )
          }
        />

        {/* Halaman Dashboard & Study Planner (Protected Route) */}
        <Route
          path="/dashboard"
          element={
            currentUser ? (
              <DashboardPage
                currentUser={currentUser}
                tasks={tasks}
                onTasksChange={setTasks}
                onLogout={handleLogout}
                loading={loadingTasks}
                error={tasksError}
                onRefresh={fetchTasks}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Halaman Tambah Tugas (Protected Route untuk User / Client & Admin) */}
        <Route
          path="/form"
          element={
            currentUser ? (
              <FormPage
                onAddTask={handleAddTask}
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Halaman 404 */}
        <Route
          path="*"
          element={
            <div className="not-found-page">
              <div className="not-found-card">
                <h1>404</h1>
                <h2>Halaman Tidak Ditemukan</h2>
                <p>Sorry, the page you are looking for does not exist.</p>
                <a href="#/" className="btn-action-primary">
                  Kembali ke Beranda
                </a>
              </div>
            </div>
          }
        />
      </Routes>
    </HashRouter>
  );
}

export default App;