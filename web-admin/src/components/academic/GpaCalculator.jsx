import React, { useState, useEffect } from 'react';

const GRADE_POINTS = {
  'A': 4.0,
  'A-': 3.75,
  'B+': 3.5,
  'B': 3.0,
  'B-': 2.75,
  'C+': 2.5,
  'C': 2.0,
  'D': 1.0,
  'E': 0.0,
};

const INITIAL_COURSES = [
  { id: '1', name: 'Deep Learning', credits: 3, assignments: 88, quizzes: 82, midterm: 85, finalExam: 90 },
  { id: '2', name: 'Visual Perception', credits: 3, assignments: 85, quizzes: 80, midterm: 82, finalExam: 85 },
  { id: '3', name: 'Web & Mobile App Dev', credits: 4, assignments: 92, quizzes: 88, midterm: 90, finalExam: 94 },
  { id: '4', name: 'Human-Computer Interaction', credits: 3, assignments: 86, quizzes: 85, midterm: 80, finalExam: 88 },
  { id: '5', name: 'Network Security', credits: 3, assignments: 80, quizzes: 78, midterm: 82, finalExam: 85 },
];

function scoreToGrade(score) {
  if (score >= 85) return 'A';
  if (score >= 80) return 'A-';
  if (score >= 75) return 'B+';
  if (score >= 70) return 'B';
  if (score >= 65) return 'B-';
  if (score >= 60) return 'C+';
  if (score >= 55) return 'C';
  if (score >= 40) return 'D';
  return 'E';
}

export default function GpaCalculator({ currentUser }) {
  const gpaKey = `study_planner_gpa_courses_${currentUser?.id || 'guest'}`;
  const creditsKey = `study_planner_prior_credits_${currentUser?.id || 'guest'}`;
  const priorGpaKey = `study_planner_prior_gpa_${currentUser?.id || 'guest'}`;

  const [courses, setCourses] = useState(() => {
    try {
      const saved = localStorage.getItem(gpaKey);
      return saved ? JSON.parse(saved) : INITIAL_COURSES;
    } catch (e) {
      return INITIAL_COURSES;
    }
  });

  const [priorCredits, setPriorCredits] = useState(() => {
    return parseInt(localStorage.getItem(creditsKey) || '72', 10);
  });
  const [priorGPA, setPriorGPA] = useState(() => {
    return parseFloat(localStorage.getItem(priorGpaKey) || '3.70');
  });

  // Sync state if currentUser changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(gpaKey);
      setCourses(saved ? JSON.parse(saved) : INITIAL_COURSES);
      setPriorCredits(parseInt(localStorage.getItem(creditsKey) || '72', 10));
      setPriorGPA(parseFloat(localStorage.getItem(priorGpaKey) || '3.70'));
    } catch (e) {}
  }, [currentUser?.id]);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(gpaKey, JSON.stringify(courses));
      localStorage.setItem(creditsKey, String(priorCredits));
      localStorage.setItem(priorGpaKey, String(priorGPA));
    } catch (e) {}
  }, [courses, priorCredits, priorGPA, gpaKey, creditsKey, priorGpaKey]);

  const handleScoreChange = (id, field, value) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: Number(value) || 0 } : c))
    );
  };

  const handleAddCourse = () => {
    const newCourse = {
      id: 'course_' + Date.now(),
      name: 'Mata Kuliah Baru',
      credits: 3,
      assignments: 80,
      quizzes: 80,
      midterm: 80,
      finalExam: 80,
    };
    setCourses((prev) => [...prev, newCourse]);
  };

  const handleDeleteCourse = (id) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
  };

  // Calculations
  const calculatedCourses = courses.map((c) => {
    // Weighted formula: Tugas 25% + Quiz 15% + UTS 30% + UAS 30%
    const finalScore =
      c.assignments * 0.25 +
      c.quizzes * 0.15 +
      c.midterm * 0.30 +
      c.finalExam * 0.30;
    const grade = scoreToGrade(finalScore);
    const point = GRADE_POINTS[grade] || 0.0;
    const totalPoints = point * c.credits;
    return { ...c, finalScore: Math.round(finalScore * 10) / 10, grade, point, totalPoints };
  });

  const semesterCredits = calculatedCourses.reduce((acc, c) => acc + c.credits, 0);
  const semesterTotalPoints = calculatedCourses.reduce((acc, c) => acc + c.totalPoints, 0);
  const semesterGPA = semesterCredits > 0 ? (semesterTotalPoints / semesterCredits).toFixed(2) : '0.00';

  // Cumulative GPA calculation
  const totalCumulativeCredits = priorCredits + semesterCredits;
  const totalCumulativePoints = priorCredits * priorGPA + semesterTotalPoints;
  const cumulativeGPA =
    totalCumulativeCredits > 0 ? (totalCumulativePoints / totalCumulativeCredits).toFixed(2) : '0.00';

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 font-display">
            Kalkulator Target IPK & Bobot Nilai
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Simulasikan bobot nilai tugas, quiz, UTS, dan UAS terhadap perkiraan indeks prestasi semester.
          </p>
        </div>
        <button
          onClick={handleAddCourse}
          className="px-3.5 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold transition-colors flex items-center gap-1.5 w-fit"
        >
          + Tambah Matkul
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100">
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
            Simulasi IPS Semester Ini
          </span>
          <div className="text-3xl font-extrabold text-indigo-950 font-display mt-1">
            {semesterGPA} <span className="text-xs font-normal text-indigo-700">/ 4.00</span>
          </div>
          <span className="text-[11px] text-indigo-600 font-medium">
            Beban: {semesterCredits} SKS aktif
          </span>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
            Proyeksi IPK Kumulatif
          </span>
          <div className="text-3xl font-extrabold text-emerald-950 font-display mt-1">
            {cumulativeGPA} <span className="text-xs font-normal text-emerald-700">/ 4.00</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-medium">
            Total Akumulasi: {totalCumulativeCredits} SKS
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Data IPK Sebelumnya
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-[10px] text-slate-400 block">SKS Lulus:</label>
              <input
                type="number"
                value={priorCredits}
                onChange={(e) => setPriorCredits(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-full px-2 py-1 text-xs border rounded-lg bg-white"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block">IPK Lama:</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="4"
                value={priorGPA}
                onChange={(e) => setPriorGPA(parseFloat(e.target.value) || 0)}
                className="w-full px-2 py-1 text-xs border rounded-lg bg-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Course Grade Simulator Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 border-y border-slate-200">
              <th className="py-2.5 px-3 font-semibold">Mata Kuliah</th>
              <th className="py-2.5 px-2 font-semibold text-center w-16">SKS</th>
              <th className="py-2.5 px-2 font-semibold text-center w-20">Tugas (25%)</th>
              <th className="py-2.5 px-2 font-semibold text-center w-20">Quiz (15%)</th>
              <th className="py-2.5 px-2 font-semibold text-center w-20">UTS (30%)</th>
              <th className="py-2.5 px-2 font-semibold text-center w-20">UAS (30%)</th>
              <th className="py-2.5 px-2 font-semibold text-center w-20">Skor</th>
              <th className="py-2.5 px-2 font-semibold text-center w-16">Grade</th>
              <th className="py-2.5 px-2 font-semibold text-center w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {calculatedCourses.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3 px-3">
                  <input
                    type="text"
                    value={c.name}
                    onChange={(e) => handleScoreChange(c.id, 'name', e.target.value)}
                    className="w-full font-semibold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none"
                  />
                </td>
                <td className="py-3 px-2 text-center">
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={c.credits}
                    onChange={(e) => handleScoreChange(c.id, 'credits', e.target.value)}
                    className="w-12 text-center p-1 rounded border border-slate-200 bg-white"
                  />
                </td>
                <td className="py-3 px-2 text-center">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={c.assignments}
                    onChange={(e) => handleScoreChange(c.id, 'assignments', e.target.value)}
                    className="w-14 text-center p-1 rounded border border-slate-200 bg-white"
                  />
                </td>
                <td className="py-3 px-2 text-center">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={c.quizzes}
                    onChange={(e) => handleScoreChange(c.id, 'quizzes', e.target.value)}
                    className="w-14 text-center p-1 rounded border border-slate-200 bg-white"
                  />
                </td>
                <td className="py-3 px-2 text-center">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={c.midterm}
                    onChange={(e) => handleScoreChange(c.id, 'midterm', e.target.value)}
                    className="w-14 text-center p-1 rounded border border-slate-200 bg-white"
                  />
                </td>
                <td className="py-3 px-2 text-center">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={c.finalExam}
                    onChange={(e) => handleScoreChange(c.id, 'finalExam', e.target.value)}
                    className="w-14 text-center p-1 rounded border border-slate-200 bg-white"
                  />
                </td>
                <td className="py-3 px-2 text-center font-bold text-slate-700">
                  {c.finalScore}
                </td>
                <td className="py-3 px-2 text-center">
                  <span
                    className={`inline-block px-2 py-0.5 rounded font-extrabold text-xs ${
                      c.grade.startsWith('A')
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : c.grade.startsWith('B')
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        : c.grade.startsWith('C')
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {c.grade} ({c.point})
                  </span>
                </td>
                <td className="py-3 px-2 text-center">
                  <button
                    onClick={() => handleDeleteCourse(c.id)}
                    className="text-slate-400 hover:text-rose-600 transition-colors"
                    title="Hapus baris"
                  >
                    &times;
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

