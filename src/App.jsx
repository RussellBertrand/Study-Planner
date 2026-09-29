import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { users as initialUsers } from './data/users';
import { initialTasks } from './data/tasks';
import './App.css';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import FormPage from './pages/FormPage';

function App() {
  // 1. Mengelola state users dengan localStorage agar data akun baru tersimpan permanen di browser
  const [users, setUsers] = useState(() => {
    const savedUsers = localStorage.getItem('app_users');
    return savedUsers ? JSON.parse(savedUsers) : initialUsers;
  });

  const [currentUser, setCurrentUser] = useState(null);
  const [tasks, setTasks] = useState(initialTasks);

  // Simpan perubahan users ke localStorage setiap kali ada data user baru (pendaftaran)
  useEffect(() => {
    localStorage.setItem('app_users', JSON.stringify(users));
  }, [users]);

  const handleAddTask = (newTask) => {
    setTasks((prevTasks) => [newTask, ...prevTasks]);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <HashRouter>
      <Routes>
        {/* Halaman Utama Edukasi Belajar Aja */}
        <Route
          path="/"
          element={<HomePage currentUser={currentUser} onLogout={handleLogout} />}
        />

        {/* Halaman Login & Sign Up (Meneruskan users dan setUsers) */}
        <Route
          path="/login"
          element={
            <LoginPage
              users={users}
              setUsers={setUsers}
              setCurrentUser={setCurrentUser}
            />
          }
        />

        {/* Halaman Dashboard & Study Planner */}
        <Route
          path="/dashboard"
          element={
            currentUser ? (
              <DashboardPage
                currentUser={currentUser}
                tasks={tasks}
                onLogout={handleLogout}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Halaman Tambah Tugas (Khusus Siswa / Client) */}
        <Route
          path="/form"
          element={
            currentUser && currentUser.role === 'client' ? (
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