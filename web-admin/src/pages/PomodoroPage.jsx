import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PomodoroTimer from '../components/pomodoro/PomodoroTimer';
import SessionLogger from '../components/pomodoro/SessionLogger';
import ConfirmModal from '../components/common/ConfirmModal';
import { usePomodoro } from '../hooks/usePomodoro';
import { awardXP } from '../utils/gamification';
import { api } from '../api';

export default function PomodoroPage({ currentUser, tasks = [], onTasksChange, onLogout }) {
  const userStorageKey = `study_planner_sessions_${currentUser?.id || 'guest'}`;

  const [sessions, setSessions] = useState(() => {
    try {
      const saved = localStorage.getItem(userStorageKey);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [xpToast, setXpToast] = useState(null);

  // Sync sessions when user changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(userStorageKey);
      setSessions(saved ? JSON.parse(saved) : []);
    } catch (e) {
      setSessions([]);
    }
  }, [userStorageKey]);

  // When timer completes, log session and award XP
  const handleSessionComplete = (newSession) => {
    setSessions((prev) => {
      const updated = [newSession, ...prev];
      try {
        localStorage.setItem(userStorageKey, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // Reward +25 XP
    const awarded = awardXP(currentUser?.id, 25, 'Selesai 1 sesi fokus Pomodoro 25 menit');
    if (awarded) {
      setXpToast('🎉 Sesi selesai! +25 XP ditambahkan ke akun Anda.');
      setTimeout(() => setXpToast(null), 3500);
    }
  };

  // When timer starts on a specific task, auto-set task to 'in_progress' if pending
  const handleTaskStart = async (taskId) => {
    const task = tasks.find((t) => String(t.id) === String(taskId));
    if (task && (!task.status || task.status === 'pending')) {
      try {
        const updated = await api.updateTask(task.id, { status: 'in_progress' });
        if (onTasksChange) {
          onTasksChange((prev) =>
            prev.map((t) => (String(t.id) === String(task.id) ? { ...t, status: 'in_progress', ...updated.task } : t))
          );
        }
      } catch (err) {
        console.error('Error auto-setting in_progress:', err);
      }
    }
  };

  const handleConfirmClear = () => {
    setSessions([]);
    try {
      localStorage.removeItem(userStorageKey);
    } catch (e) {}
    setShowClearConfirm(false);
  };

  const pomodoro = usePomodoro(handleSessionComplete, handleTaskStart);

  return (
    <div className="page-wrapper min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans antialiased text-slate-800 dark:text-slate-100">
      <Navbar currentUser={currentUser} onLogout={onLogout} />

      {/* Floating XP Reward Toast */}
      {xpToast && (
        <div className="toast-notification fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-bounce">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
            ⭐
          </div>
          <div>
            <p className="font-bold text-xs text-white">Fokus Pomodoro</p>
            <p className="text-amber-300 text-xs">{xpToast}</p>
          </div>
        </div>
      )}

      {/* Reusable Confirm Modal */}
      <ConfirmModal
        isOpen={showClearConfirm}
        title="Hapus Riwayat Sesi Belajar"
        message="Apakah Anda yakin ingin menghapus seluruh log akumulasi sesi fokus Pomodoro Anda? Tindakan ini tidak dapat dibatalkan."
        confirmText="Hapus Riwayat"
        onConfirm={handleConfirmClear}
        onCancel={() => setShowClearConfirm(false)}
      />

      {/* Header Banner */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="max-w-3xl space-y-3">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-400 dark:border-indigo-900">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
              Mode Eksekusi & Fokus Belajar
            </span>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
              Pusat Fokus Pomodoro & Soundscapes
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              Tingkatkan retensi dan konsentrasi pengerjaan tugas dengan interval ritme Pomodoro yang dipadukan bersama audio latar alami.
            </p>
          </div>
        </div>
      </header>

      {/* Main Grid: 2 Columns */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Kolom Kiri: Timer & Soundscapes */}
          <div className="lg:col-span-7">
            <PomodoroTimer {...pomodoro} tasks={tasks} />
          </div>

          {/* Kolom Kanan: Log Sesi Belajar */}
          <div className="lg:col-span-5">
            <SessionLogger
              sessions={sessions}
              tasks={tasks}
              onClearSessions={() => setShowClearConfirm(true)}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
