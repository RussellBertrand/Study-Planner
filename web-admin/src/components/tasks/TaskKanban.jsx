import React, { useState } from 'react';
import { api } from '../../api';
import { awardXP } from '../../utils/gamification';

export default function TaskKanban({ tasks = [], onTasksChange, isAdmin = false }) {
  const [updatingId, setUpdatingId] = useState(null);

  // Group tasks into 3 Kanban columns:
  // 1. To Do (status: 'pending' or undefined)
  // 2. In Progress (status: 'in_progress')
  // 3. Completed (status: 'completed')
  const todoTasks = tasks.filter((t) => !t.status || t.status === 'pending');
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  const handleUpdateStatus = async (task, nextStatus) => {
    try {
      setUpdatingId(task.id);
      const updated = await api.updateTask(task.id, { status: nextStatus });
      if (nextStatus === 'completed') {
        const xpAmount = task.priority === 'High' ? 50 : task.priority === 'Medium' ? 30 : 15;
        awardXP(task.user_id, xpAmount, `Tugas selesai via Kanban: ${task.title}`);
      }
      if (onTasksChange) {
        onTasksChange((prev) =>
          prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus, ...updated.task } : t))
        );
      }
    } catch (err) {
      console.error('Error updating task status in Kanban:', err);
      // Fallback local update
      if (nextStatus === 'completed') {
        const xpAmount = task.priority === 'High' ? 50 : task.priority === 'Medium' ? 30 : 15;
        awardXP(task.user_id, xpAmount, `Tugas selesai via Kanban: ${task.title}`);
      }
      if (onTasksChange) {
        onTasksChange((prev) =>
          prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t))
        );
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const columns = [
    {
      id: 'todo',
      title: 'Perlu Dikerjakan (To Do)',
      badgeColor: 'bg-slate-100 text-slate-700',
      tasks: todoTasks,
      targetStatus: 'pending',
    },
    {
      id: 'in_progress',
      title: 'Sedang Berlangsung (In Progress)',
      badgeColor: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
      tasks: inProgressTasks,
      targetStatus: 'in_progress',
    },
    {
      id: 'completed',
      title: 'Tuntas (Completed)',
      badgeColor: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      tasks: completedTasks,
      targetStatus: 'completed',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 font-display">
            Papan Alur Tugas (Kanban Board)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Pindahkan tahapan pengerjaan tugas secara fleksibel untuk menjaga visibilitas alur kerja.
          </p>
        </div>
      </div>

      {/* 3-Column Kanban Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {columns.map((col) => (
          <div
            key={col.id}
            className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col min-h-[480px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/80">
              <span className="font-bold text-xs text-slate-800 font-display">{col.title}</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${col.badgeColor}`}>
                {col.tasks.length}
              </span>
            </div>

            {/* Task Cards in Column */}
            <div className="space-y-3 flex-1">
              {col.tasks.length === 0 ? (
                <div className="h-32 flex items-center justify-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                  Kolom kosong
                </div>
              ) : (
                col.tasks.map((task) => {
                  const isUpdating = updatingId === task.id;
                  const priorityClass =
                    task.priority === 'High'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : task.priority === 'Medium'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200';

                  return (
                    <div
                      key={task.id}
                      className={`bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all space-y-3 ${
                        isUpdating ? 'opacity-50 pointer-events-none' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${priorityClass}`}>
                          {task.priority || 'Medium'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {task.deadline || 'Tanpa deadline'}
                        </span>
                      </div>

                      <div>
                        <h5 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">
                          {task.title}
                        </h5>
                        <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                          <span>📚</span>
                          <span>{task.subject || 'Umum'}</span>
                        </p>
                      </div>

                      {isAdmin && task.user_name && (
                        <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500">
                          👤 Siswa: <strong className="text-slate-700">{task.user_name}</strong>
                        </div>
                      )}

                      {/* Quick Move Action Buttons */}
                      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-1.5">
                        {col.id !== 'todo' && (
                          <button
                            onClick={() => handleUpdateStatus(task, 'pending')}
                            className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-semibold"
                            title="Pindahkan ke To Do"
                          >
                            ← To Do
                          </button>
                        )}
                        {col.id !== 'in_progress' && (
                          <button
                            onClick={() => handleUpdateStatus(task, 'in_progress')}
                            className="px-2 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-semibold"
                            title="Mulai pengerjaan"
                          >
                            ⚡ Progres
                          </button>
                        )}
                        {col.id !== 'completed' && (
                          <button
                            onClick={() => handleUpdateStatus(task, 'completed')}
                            className="px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-semibold ml-auto"
                            title="Tandai Selesai"
                          >
                            ✓ Selesai
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

