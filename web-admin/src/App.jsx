import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { api, getAuthToken, setAuthToken, getStoredUser, setStoredUser } from './api';
import './App.css';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import FormPage from './pages/FormPage';
import CoursesPage from './pages/CoursesPage';
import GamificationPage from './pages/GamificationPage';
import PomodoroPage from './pages/PomodoroPage';
import AcademicPage from './pages/AcademicPage';
import TaskBoardPage from './pages/TaskBoardPage';
import SchedulePage from './pages/SchedulePage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import StudyMateChat from './components/chat/StudyMateChat';

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

        {/* Halaman Katalog Kursus (Katalog Terstruktur) */}
        <Route
          path="/courses"
          element={<CoursesPage currentUser={currentUser} onLogout={handleLogout} />}
        />
        <Route path="/katalog" element={<Navigate to="/courses" replace />} />
        <Route path="/katalog-kursus" element={<Navigate to="/courses" replace />} />

        {/* Halaman Sistem Belajar & Gamifikasi Adaptif */}
        <Route
          path="/gamification"
          element={<GamificationPage currentUser={currentUser} onLogout={handleLogout} />}
        />
        <Route path="/sistem-belajar" element={<Navigate to="/gamification" replace />} />
        <Route path="/misi" element={<Navigate to="/gamification" replace />} />

        {/* Fitur 1: Pusat Fokus Pomodoro & Soundscapes */}
        <Route
          path="/pomodoro"
          element={
            currentUser ? (
              <PomodoroPage currentUser={currentUser} tasks={tasks} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="/fokus" element={<Navigate to="/pomodoro" replace />} />

        {/* Fitur 2: Pengorganisasian Akademik & Kalkulator IPK */}
        <Route
          path="/academic"
          element={
            currentUser ? (
              <AcademicPage currentUser={currentUser} tasks={tasks} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="/gpa" element={<Navigate to="/academic" replace />} />
        <Route path="/akademik" element={<Navigate to="/academic" replace />} />

        {/* Fitur 3: Kanban Board & Eisenhower Priority Matrix */}
        <Route
          path="/kanban"
          element={
            currentUser ? (
              <TaskBoardPage
                currentUser={currentUser}
                tasks={tasks}
                onTasksChange={setTasks}
                onLogout={handleLogout}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="/matrix" element={<Navigate to="/kanban" replace />} />
        <Route path="/papan-tugas" element={<Navigate to="/kanban" replace />} />

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

        {/* Halaman Tambah Tugas (Protected Route untuk Siswa/User & Admin) */}
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

        {/* Halaman Jadwal Kuliah & Belajar */}
        <Route
          path="/schedule"
          element={
            currentUser ? (
              <SchedulePage currentUser={currentUser} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="/jadwal" element={<Navigate to="/schedule" replace />} />

        {/* Halaman Profil & Pengaturan Kata Sandi */}
        <Route
          path="/profile"
          element={
            currentUser ? (
              <ProfilePage
                currentUser={currentUser}
                onLogout={handleLogout}
                onUserUpdate={(updated) => {
                  setCurrentUser(updated);
                  setStoredUser(updated);
                }}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="/profil" element={<Navigate to="/profile" replace />} />

        {/* Halaman Khusus Mentor / Admin Control Panel */}
        <Route
          path="/admin"
          element={
            currentUser ? (
              <AdminPage currentUser={currentUser} onLogout={handleLogout} />
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
                <p>Maaf, halaman yang Anda tuju tidak tersedia atau tautan telah berpindah.</p>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '16px', flexWrap: 'wrap' }}>
                  <a href="#/" className="btn-action-primary" style={{ textDecoration: 'none' }}>
                    Kembali ke Beranda
                  </a>
                  <a href="#/courses" className="btn-action-secondary" style={{ textDecoration: 'none' }}>
                    Lihat Katalog Kursus
                  </a>
                </div>
              </div>
            </div>
          }
        />
      </Routes>

      {/* Floating StudyMate AI Widget (Tersedia secara global di seluruh halaman saat user aktif) */}
      {currentUser && (
        <StudyMateChat currentUser={currentUser} onTasksChange={setTasks} />
      )}
    </HashRouter>
  );
}

export default App;
