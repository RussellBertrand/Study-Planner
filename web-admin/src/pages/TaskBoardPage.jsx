import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import TaskKanban from '../components/tasks/TaskKanban';
import PriorityMatrix from '../components/tasks/PriorityMatrix';
import { api } from '../api';

export default function TaskBoardPage({ currentUser, tasks = [], onTasksChange, onLogout }) {
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'matrix'
  const isAdmin = currentUser?.role === 'admin';

  const handleToggleTaskStatus = async (task) => {
    try {
      const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
      const updated = await api.updateTask(task.id, { status: nextStatus });
      if (onTasksChange) {
        onTasksChange((prev) =>
          prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus, ...updated.task } : t))
        );
      }
    } catch (err) {
      console.error('Error toggling status in TaskBoard:', err);
    }
  };

  return (
    <div className="page-wrapper min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-800">
      <Navbar currentUser={currentUser} onLogout={onLogout} />

      {/* Header Banner */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="max-w-3xl space-y-3">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
              Visualisasi Tugas Terintegrasi
            </span>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
              Papan Alur Tugas & Matriks Prioritas
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Pilih format visualisasi tugas yang paling sesuai dengan kebutuhan: Papan Kanban bertahap atau Matriks Eisenhower berbasis urgensi.
            </p>
          </div>

          {/* View Mode Switcher */}
          <div className="flex gap-2 mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                viewMode === 'kanban'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>📋</span>
              <span>Papan Kanban (To Do • In Progress • Completed)</span>
            </button>
            <button
              onClick={() => setViewMode('matrix')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                viewMode === 'matrix'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>🎯</span>
              <span>Matriks Eisenhower (4 Kuadran Prioritas)</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {viewMode === 'kanban' ? (
          <TaskKanban
            tasks={tasks}
            onTasksChange={onTasksChange}
            isAdmin={isAdmin}
          />
        ) : (
          <PriorityMatrix
            tasks={tasks}
            onToggleTaskStatus={handleToggleTaskStatus}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}

