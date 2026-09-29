import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { users } from './data/users';
import { initialTasks } from './data/tasks';
import './App.css';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import FormPage from './pages/FormPage';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [tasks, setTasks] = useState(initialTasks);

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

        {/* Halaman Login */}
        <Route
          path="/login"
          element={<LoginPage users={users} setCurrentUser={setCurrentUser} />}
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
                <p>Maaf, halaman yang Anda cari tidak tersedia di Belajar Aja.</p>
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
