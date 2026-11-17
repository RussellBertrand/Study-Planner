import React, { useState, useEffect } from 'react';
import { getUserCourses, saveUserCourses } from '../../utils/courseStorage';

export default function CourseHub({ tasks = [], currentUser }) {
  const [courses, setCourses] = useState(() => getUserCourses(currentUser?.id));

  useEffect(() => {
    setCourses(getUserCourses(currentUser?.id));
  }, [currentUser?.id]);

  const [activeCourseId, setActiveCourseId] = useState(courses[0]?.id || 'c1');
  const [editingNotes, setEditingNotes] = useState(false);
  const [noteText, setNoteText] = useState('');

  const activeCourse = courses.find((c) => c.id === activeCourseId) || courses[0];

  // Filter tasks belonging to active course
  const courseTasks = tasks.filter(
    (t) =>
      t.subject &&
      activeCourse &&
      (t.subject.toLowerCase().includes(activeCourse.name.toLowerCase()) ||
        activeCourse.name.toLowerCase().includes(t.subject.toLowerCase()))
  );

  const handleSaveNotes = () => {
    const updated = courses.map((c) => (c.id === activeCourse.id ? { ...c, notes: noteText } : c));
    setCourses(updated);
    saveUserCourses(currentUser?.id, updated);
    setEditingNotes(false);
  };

  const startEditNotes = () => {
    setNoteText(activeCourse.notes || '');
    setEditingNotes(true);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 font-display">
            Hub Pengorganisasian Mata Kuliah
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Pusat informasi silabus, jadwal mingguan, catatan, dan tugas per mata kuliah.
          </p>
        </div>
        <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full w-fit">
          {courses.length} Mata Kuliah Terdaftar
        </span>
      </div>

      {/* Course Selector Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {courses.map((course) => {
          const isSelected = course.id === activeCourse.id;
          return (
            <button
              key={course.id}
              onClick={() => {
                setActiveCourseId(course.id);
                setEditingNotes(false);
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span className={`px-1.5 py-0.5 rounded text-[10px] ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                {course.code}
              </span>
              <span>{course.name}</span>
            </button>
          );
        })}
      </div>

      {/* Active Course Details Card */}
      {activeCourse && (
        <div className="space-y-6">
          {/* Header Info Banner */}
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Mata Kuliah & Beban SKS
              </span>
              <h4 className="text-base font-bold text-slate-900 mt-0.5">{activeCourse.name}</h4>
              <p className="text-xs text-indigo-600 font-semibold mt-0.5">
                {activeCourse.code} • {activeCourse.credits} SKS
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Dosen Pengampu
              </span>
              <p className="text-xs font-semibold text-slate-800 mt-1">{activeCourse.lecturer}</p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Jadwal & Ruang Kuliah
              </span>
              <p className="text-xs font-medium text-slate-700 mt-1">{activeCourse.schedule}</p>
            </div>
          </div>

          {/* Bobot Penilaian (Assessment Weights) */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Komponen & Bobot Penilaian Akhir:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-white border border-slate-200 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Tugas & Proyek</span>
                <div className="text-lg font-extrabold text-slate-900 mt-0.5">
                  {activeCourse.weights?.assignments || 25}%
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Quiz & Keaktifan</span>
                <div className="text-lg font-extrabold text-slate-900 mt-0.5">
                  {activeCourse.weights?.quizzes || 15}%
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Ujian Tengah (UTS)</span>
                <div className="text-lg font-extrabold text-slate-900 mt-0.5">
                  {activeCourse.weights?.midterm || 30}%
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Ujian Akhir (UAS)</span>
                <div className="text-lg font-extrabold text-slate-900 mt-0.5">
                  {activeCourse.weights?.finalExam || 30}%
                </div>
              </div>
            </div>
          </div>

          {/* Catatan Akademis Modul */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <span>📝</span> Catatan & Agenda Penting Kuliah:
              </span>
              {!editingNotes ? (
                <button
                  onClick={startEditNotes}
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  Edit Catatan
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveNotes}
                    className="text-[11px] font-bold text-emerald-600 hover:text-emerald-800"
                  >
                    Simpan
                  </button>
                  <button
                    onClick={() => setEditingNotes(false)}
                    className="text-[11px] text-slate-400 hover:text-slate-600"
                  >
                    Batal
                  </button>
                </div>
              )}
            </div>

            {editingNotes ? (
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                rows={3}
                className="w-full p-2.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Tuliskan catatan dosen, bahan bacaan, atau info ujian..."
              />
            ) : (
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                {activeCourse.notes || 'Belum ada catatan khusus untuk mata kuliah ini.'}
              </p>
            )}
          </div>

          {/* Daftar Tugas Terkait Mata Kuliah Ini */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Tugas Terdaftar untuk {activeCourse.name} ({courseTasks.length})
              </span>
            </div>

            {courseTasks.length === 0 ? (
              <p className="text-xs text-slate-400 italic bg-slate-50 p-4 rounded-xl text-center border border-dashed border-slate-200">
                Tidak ada tugas aktif yang terdaftar untuk mata kuliah ini di database.
              </p>
            ) : (
              <div className="space-y-2">
                {courseTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          task.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                      />
                      <span className={`font-semibold ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {task.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-500">Tenggat: {task.deadline || 'Tanpa deadline'}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-slate-700 border border-slate-200">
                        {task.priority || 'Medium'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

