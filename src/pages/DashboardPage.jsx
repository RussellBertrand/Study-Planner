import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

/**
 * DashboardPage Component (Joy Cristian - A3)
 * Fitur:
 * 1. Conditional Rendering: Tampilan & hak akses berbeda untuk Admin vs Client (Siswa).
 * 2. Pemetaan array tasks.map() dengan unique key.
 * 3. Tampilan Empty State apabila daftar tugas kosong.
 */
export default function DashboardPage({ currentUser, tasks = [], onLogout }) {
  const isAdmin = currentUser?.role === 'admin';
  const isClient = currentUser?.role === 'client';

  // Perhitungan statistik tugas
  const totalTasks = tasks.length;
  const highPriorityCount = tasks.filter((t) => t.priority === 'High').length;
  const mediumPriorityCount = tasks.filter((t) => t.priority === 'Medium').length;
  const lowPriorityCount = tasks.filter((t) => t.priority === 'Low').length;

  return (
    <div className="dashboard-wrapper">
      {/* Komponen Navigasi Utama */}
      <Navbar currentUser={currentUser} onLogout={onLogout} />

      <main className="app dashboard">
        {/* ========================================================
            1. CONDITIONAL RENDERING: Akses Admin vs. Client
           ======================================================== */}
        <section className={`role-banner ${isAdmin ? 'banner-admin' : 'banner-client'}`}>
          <div className="role-banner-content">
            <span className="role-icon">{isAdmin ? '👨‍🏫' : '🎓'}</span>
            <div>
              <h2 className="role-greeting">
                Halo, {currentUser?.name || currentUser?.username || 'Pengguna'}!
              </h2>
              <p className="role-description">
                {isAdmin ? (
                  <span>
                    Anda masuk sebagai <strong>Admin (Mentor / Advisor)</strong>. Anda dapat
                    memantau semua progres belajar siswa dan mendampingi tugas prioritas tinggi.
                  </span>
                ) : (
                  <span>
                    Anda masuk sebagai <strong>Client (Siswa)</strong>. Pantau jadwal belajar dan
                    selesaikan tugas tepat waktu sebelum deadline!
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Tombol aksi cepat untuk Client */}
          {isClient && (
            <div className="role-banner-actions">
              <Link to="/form" className="btn-action-primary">
                + Tambah Tugas
              </Link>
            </div>
          )}
        </section>

        {/* Ringkasan Statistik Tugas */}
        <section className="stats-container">
          <div className="stat-card">
            <span className="stat-label">Total Tugas</span>
            <span className="stat-value">{totalTasks}</span>
          </div>
          <div className="stat-card stat-high">
            <span className="stat-label">Prioritas High</span>
            <span className="stat-value">{highPriorityCount}</span>
          </div>
          <div className="stat-card stat-medium">
            <span className="stat-label">Prioritas Medium</span>
            <span className="stat-value">{mediumPriorityCount}</span>
          </div>
          <div className="stat-card stat-low">
            <span className="stat-label">Prioritas Low</span>
            <span className="stat-value">{lowPriorityCount}</span>
          </div>
        </section>

        {/* Bagian Konten Daftar Tugas */}
        <section className="task-section">
          <div className="section-header">
            <h3>Daftar Tugas Belajar</h3>
            <span className="task-counter">Menampilkan {totalTasks} tugas</span>
          </div>

          {/* ========================================================
              2. TAMPILAN EMPTY STATE (jika tugas kosong)
             ======================================================== */}
          {totalTasks === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h4 className="empty-title">Belum Ada Tugas Belajar</h4>
              <p className="empty-desc">
                {isAdmin
                  ? 'Saat ini belum ada data tugas dari siswa yang tercatat di sistem.'
                  : 'Daftar tugas belajarmu masih kosong. Mulai rencanakan jadwal belajarmu sekarang!'}
              </p>
              {isClient && (
                <Link to="/form" className="btn-action-primary">
                  Buat Tugas Pertama
                </Link>
              )}
            </div>
          ) : (
            /* ========================================================
               3. PEMETAAN ARRAY tasks.map() DENGAN UNIQUE KEY
               ======================================================== */
            <ul className="task-list">
              {tasks.map((task, index) => {
                // Unique key: task.id jika ada, atau fallback unik menggunakan index + title
                const uniqueKey = task.id ? `task-id-${task.id}` : `task-${index}-${task.title}`;
                const priorityClass = `priority-${task.priority?.toLowerCase() || 'medium'}`;

                return (
                  <li key={uniqueKey} className={`task-card ${priorityClass}`}>
                    <div className="task-card-header">
                      <h4 className="task-card-title">{task.title}</h4>
                      <span className={`badge ${priorityClass}`}>
                        {task.priority || 'Medium'}
                      </span>
                    </div>

                    <div className="task-card-body">
                      <div className="task-detail-item">
                        <span className="detail-label">Mata Kuliah:</span>
                        <span className="detail-value">{task.subject || 'Umum'}</span>
                      </div>
                      <div className="task-detail-item">
                        <span className="detail-label">Deadline:</span>
                        <span className="detail-value">{task.deadline || '-'}</span>
                      </div>
                    </div>

                    {/* Catatan pengawasan khusus tampilan Admin */}
                    {isAdmin && (
                      <div className="task-card-footer admin-feedback-box">
                        <span className="admin-tag">
                          👁️ Mode Pengawasan: Siap didampingi mentor
                        </span>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
