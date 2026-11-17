import React from 'react';

function getDaysUntilDeadline(dateString) {
  if (!dateString) return 999;
  const targetDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);
  const diff = targetDate - today;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function PriorityMatrix({ tasks = [], onToggleTaskStatus }) {
  // Categorize active tasks into 4 quadrants
  const q1Tasks = []; // Urgent & Important (Do First)
  const q2Tasks = []; // Important, Not Urgent (Schedule)
  const q3Tasks = []; // Urgent, Not Important (Delegate/Quick)
  const q4Tasks = []; // Not Urgent, Not Important (Eliminate/Backlog)

  tasks.forEach((task) => {
    const days = getDaysUntilDeadline(task.deadline);
    const isUrgent = days <= 2;
    const isHighOrMed = task.priority === 'High' || task.priority === 'Medium';

    if (task.status === 'completed') {
      q4Tasks.push(task);
    } else if (task.priority === 'High' && isUrgent) {
      q1Tasks.push(task);
    } else if (isHighOrMed && !isUrgent) {
      q2Tasks.push(task);
    } else if (task.priority === 'Low' && isUrgent) {
      q3Tasks.push(task);
    } else {
      q4Tasks.push(task);
    }
  });

  const quadrants = [
    {
      id: 'q1',
      title: 'Kuadran I: Mendesak & Penting',
      subtitle: 'Kerjakan Segera (Do First)',
      colorClass: 'border-rose-300 bg-rose-50/30',
      badgeClass: 'bg-rose-100 text-rose-800',
      tasks: q1Tasks,
      desc: 'Tenggat waktu sangat dekat (≤ 2 hari) dengan prioritas tinggi.',
    },
    {
      id: 'q2',
      title: 'Kuadran II: Penting, Tidak Mendesak',
      subtitle: 'Jadwalkan Teratur (Schedule / Plan)',
      colorClass: 'border-indigo-300 bg-indigo-50/30',
      badgeClass: 'bg-indigo-100 text-indigo-800',
      tasks: q2Tasks,
      desc: 'Proyek berbobot tinggi dengan sisa waktu cukup untuk dikerjakan bertahap.',
    },
    {
      id: 'q3',
      title: 'Kuadran III: Mendesak, Kurang Penting',
      subtitle: 'Selesaikan Cepat (Delegate / Quick Wins)',
      colorClass: 'border-amber-300 bg-amber-50/30',
      badgeClass: 'bg-amber-100 text-amber-800',
      tasks: q3Tasks,
      desc: 'Tugas dengan tenggat dekat namun berbobot nilai atau prioritas ringan.',
    },
    {
      id: 'q4',
      title: 'Kuadran IV: Tidak Mendesak & Ringan',
      subtitle: 'Pangkas / Arsip (Eliminate / Backlog)',
      colorClass: 'border-slate-300 bg-slate-50/50',
      badgeClass: 'bg-slate-200 text-slate-700',
      tasks: q4Tasks,
      desc: 'Aktivitas opsional, tugas tuntas, atau agenda belajar fleksibel.',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 font-display">
            Matriks Prioritas Eisenhower (Urgency vs Importance)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Sistem pengelompokan otomatis tugas Anda ke dalam 4 kuadran manajemen waktu strategis.
          </p>
        </div>
      </div>

      {/* 2x2 Quadrant Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quadrants.map((quad) => (
          <div
            key={quad.id}
            className={`border rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between min-h-[300px] ${quad.colorClass}`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 font-display">
                    {quad.title}
                  </h4>
                  <p className="text-[11px] font-semibold text-slate-600">{quad.subtitle}</p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${quad.badgeClass}`}>
                  {quad.tasks.length}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">{quad.desc}</p>
            </div>

            {/* Task Items inside Quadrant */}
            <div className="space-y-2 flex-1">
              {quad.tasks.length === 0 ? (
                <div className="h-24 flex items-center justify-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl bg-white/60">
                  Tidak ada tugas pada kuadran ini
                </div>
              ) : (
                quad.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3 bg-white border border-slate-200/90 rounded-xl shadow-xs flex items-center justify-between text-xs gap-2"
                  >
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <p
                        className={`font-semibold truncate ${
                          task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-800'
                        }`}
                      >
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <span>{task.subject || 'Umum'}</span>
                        <span>•</span>
                        <span>{task.deadline || 'Tanpa deadline'}</span>
                      </div>
                    </div>

                    {onToggleTaskStatus && (
                      <button
                        onClick={() => onToggleTaskStatus(task)}
                        className={`px-2 py-1 rounded-md text-[10px] font-bold transition-colors whitespace-nowrap ${
                          task.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {task.status === 'completed' ? '✓ Selesai' : '○ Tandai'}
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

