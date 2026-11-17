import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { api } from "../api";
import { getUserCourses } from "../utils/courseStorage";

const PRESET_SUBJECTS = [
  "Deep Learning",
  "Visual Perception",
  "Web and Mobile Application Development",
  "Human-Computer Interaction",
  "Data Communication & Network Security",
  "Christian Faith and Ethics",
];

export default function FormPage({ onAddTask, currentUser, onLogout }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    subjectSelect: "",
    customSubject: "",
    deadline: "",
    priority: "Medium",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  // Batasan minimal deadline adalah hari ini (YYYY-MM-DD)
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  // Daftar mata kuliah dinamis dari CourseHub + preset
  const allSubjects = useMemo(() => {
    const userCourses = getUserCourses(currentUser?.id).map((c) => c.name);
    const combined = Array.from(new Set([...userCourses, ...PRESET_SUBJECTS]));
    return [...combined, "Lainnya (Tulis Sendiri)"];
  }, [currentUser?.id]);

  const validateField = (name, value) => {
    let error = "";
    if (name === "title" && !value.trim()) {
      error = "Judul tugas wajib diisi.";
    }
    if (name === "deadline" && !value) {
      error = "Tenggat waktu (deadline) wajib dipilih.";
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    const errorMsg = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const titleError = validateField("title", formData.title);
    const deadlineError = validateField("deadline", formData.deadline);

    if (titleError || deadlineError) {
      setErrors({ title: titleError, deadline: deadlineError });
      return;
    }

    const finalSubject =
      formData.subjectSelect === "Lainnya (Tulis Sendiri)"
        ? formData.customSubject.trim() || "Umum"
        : formData.subjectSelect || "Umum";

    try {
      setSubmitting(true);
      const payload = {
        title: formData.title.trim(),
        subject: finalSubject,
        deadline: formData.deadline,
        priority: formData.priority,
        status: "pending",
      };

      const res = await api.createTask(payload);
      if (onAddTask) onAddTask(res.task);
      navigate("/dashboard");
    } catch (err) {
      setServerError(err.message || "Gagal menyimpan tugas ke server backend.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-wrapper min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-800">
      <Navbar currentUser={currentUser} onLogout={onLogout} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="mb-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Kembali ke Study Planner
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Kolom Kiri: Header & Panduan Visual */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600">
                Formulir Akademis
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-display">
                Jadwalkan Tugas Belajar Baru
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Tuliskan target penugasan modul atau mata kuliah secara rinci agar sistem Study Planner dapat menyusun prioritas dan kalender belajar Anda secara sistematis.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-semibold text-slate-800 text-xs sm:text-sm flex items-center gap-2">
                <span className="text-indigo-600">💡</span> Tips Manajemen Waktu Efektif:
              </h3>
              <ul className="text-xs text-slate-500 space-y-2.5 leading-normal">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 font-bold">•</span>
                  Prioritaskan tugas berbobot besar atau yang mendekati tenggat akhir 48 jam.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 font-bold">•</span>
                  Pecah tugas besar menjadi bagian-bagian terukur (misal: Riset Bahan, Implementasi Kode, Pengujian).
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 font-bold">•</span>
                  Periksa Study Planner secara berkala untuk memantau status penyelesaian.
                </li>
              </ul>
            </div>
          </div>

          {/* Kolom Kanan: Card Form */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
            {serverError && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{serverError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Judul Tugas */}
              <div className="space-y-1.5">
                <label htmlFor="title" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Judul Tugas <span className="text-rose-500">*</span>
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  placeholder="Contoh: Implementasi Residual Network (ResNet)"
                  value={formData.title}
                  onChange={handleChange}
                  disabled={submitting}
                  className={`w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                    errors.title
                      ? "border-rose-400 focus:ring-rose-200"
                      : "border-slate-200 focus:ring-indigo-100 focus:border-indigo-500"
                  }`}
                />
                {errors.title && <p className="text-xs text-rose-600 font-medium">{errors.title}</p>}
              </div>

              {/* Mata Kuliah Dropdown & Custom Field */}
              <div className="space-y-1.5">
                <label htmlFor="subjectSelect" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Mata Kuliah / Topik
                </label>
                <select
                  id="subjectSelect"
                  name="subjectSelect"
                  value={formData.subjectSelect}
                  onChange={handleChange}
                  disabled={submitting}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all"
                >
                  <option value="">-- Pilih Mata Kuliah Terdaftar --</option>
                  {allSubjects.map((sub) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>

                {formData.subjectSelect === "Lainnya (Tulis Sendiri)" && (
                  <input
                    type="text"
                    name="customSubject"
                    placeholder="Ketikkan nama mata kuliah/kategori Anda..."
                    value={formData.customSubject}
                    onChange={handleChange}
                    className="w-full mt-2 px-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
                  />
                )}
              </div>

              {/* Deadline & Prioritas (2 Kolom) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="deadline" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Tenggat Waktu <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="deadline"
                    name="deadline"
                    type="date"
                    min={todayStr}
                    value={formData.deadline}
                    onChange={handleChange}
                    disabled={submitting}
                    className={`w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                      errors.deadline
                        ? "border-rose-400 focus:ring-rose-200"
                        : "border-slate-200 focus:ring-indigo-100 focus:border-indigo-500"
                    }`}
                  />
                  {errors.deadline && <p className="text-xs text-rose-600 font-medium">{errors.deadline}</p>}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="priority" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Tingkat Prioritas
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    disabled={submitting}
                    className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all"
                  >
                    <option value="High">🔥 Tinggi (High)</option>
                    <option value="Medium">⚡ Sedang (Medium)</option>
                    <option value="Low">🌱 Rendah (Low)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] disabled:opacity-60 shadow-sm transition-all"
                >
                  {submitting ? "Menyimpan ke Database..." : "Simpan Tugas ke Jadwal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
