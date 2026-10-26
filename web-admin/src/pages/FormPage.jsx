import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { api } from "../api";

const INITIAL_FORM = {
  title: "",
  subject: "",
  deadline: "",
  priority: "Medium",
};

const SUBJECTS = [
  "Deep Learning",
  "Visual Perception",
  "Web and Mobile Application Development",
  "Human-Computer Interaction",
  "Data Communication and Computer Network Security",
  "Christian Faith and Ethics",
];

export default function FormPage({ onAddTask, currentUser, onLogout }) {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.title.trim() === "" || formData.deadline === "") {
      setError("Judul tugas dan deadline wajib diisi.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const payload = {
        title: formData.title.trim(),
        subject: formData.subject || "Umum",
        deadline: formData.deadline,
        priority: formData.priority,
        status: "pending",
      };

      const res = await api.createTask(payload);
      if (onAddTask) {
        onAddTask(res.task);
      }

      setFormData(INITIAL_FORM);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Gagal menyimpan tugas ke server backend.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar currentUser={currentUser} onLogout={onLogout} />

      <main className="form-page-main">
        <div className="form-page-inner">
          {/* Bagian Kiri: Judul, Deskripsi & Panduan */}
          <div className="form-page-left">
            <Link to="/dashboard" className="back-nav-link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              Kembali ke Dashboard
            </Link>

            <h1 className="form-page-title">Tambah Tugas Baru</h1>
            <p className="form-page-desc">
              Kelola jadwal tugas akademis dan kursus Anda secara sistematis. Tambahkan detail tugas baru agar tersimpan di database backend.
            </p>

            <div className="form-tips">
              <h3 className="form-tips-title">Tips Manajemen Tugas</h3>
              <ul className="form-tips-list">
                <li>Bagi tugas besar menjadi beberapa sub-tugas kecil yang lebih mudah dikerjakan.</li>
                <li>Tetapkan prioritas tinggi untuk tugas yang mendekati deadline atau berbobot nilai besar.</li>
                <li>Gunakan deskripsi judul yang spesifik agar memudahkan pemantauan progres belajar Anda.</li>
                <li>Periksa dashboard secara berkala untuk memantau sisa waktu pengerjaan tugas.</li>
              </ul>
            </div>
          </div>

          {/* Bagian Kanan: Form Card */}
          <div className="form-page-right">
            {error && (
              <div className="form-alert-error" role="alert" style={{ marginBottom: "1rem" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="task-form" noValidate>
              {/* Judul Tugas */}
              <div className="form-field">
                <label htmlFor="title" className="form-label">
                  Judul tugas <span className="required-mark">*</span>
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  className="form-input"
                  placeholder="Contoh: Laporan praktikum CNN"
                  value={formData.title}
                  onChange={handleChange}
                  disabled={submitting}
                />
                <span className="form-field-hint">Tuliskan nama tugas atau aktivitas belajar Anda dengan jelas.</span>
              </div>

              {/* Mata Kuliah */}
              <div className="form-field">
                <label htmlFor="subject" className="form-label">Mata kuliah</label>
                <div className="select-wrap">
                  <select
                    id="subject"
                    name="subject"
                    className="form-select"
                    value={formData.subject}
                    onChange={handleChange}
                    disabled={submitting}
                  >
                    <option value="">-- Pilih mata kuliah --</option>
                    {SUBJECTS.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                  <svg className="select-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
                <span className="form-field-hint">Pilih mata kuliah terkait, atau kosongkan untuk tugas umum.</span>
              </div>

              {/* Deadline */}
              <div className="form-field">
                <label htmlFor="deadline" className="form-label">
                  Deadline <span className="required-mark">*</span>
                </label>
                <input
                  id="deadline"
                  name="deadline"
                  type="date"
                  className="form-input"
                  value={formData.deadline}
                  onChange={handleChange}
                  disabled={submitting}
                />
                <span className="form-field-hint">Tenggat waktu akhir penyelesaian tugas.</span>
              </div>

              {/* Prioritas */}
              <div className="form-field">
                <label htmlFor="priority" className="form-label">Tingkat Prioritas</label>
                <div className="select-wrap">
                  <select
                    id="priority"
                    name="priority"
                    className="form-select"
                    value={formData.priority}
                    onChange={handleChange}
                    disabled={submitting}
                  >
                    <option value="High">Tinggi (High) 🔥</option>
                    <option value="Medium">Sedang (Medium) ⚡</option>
                    <option value="Low">Rendah (Low) 🌱</option>
                  </select>
                  <svg className="select-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
                <span className="form-field-hint">Tentukan urgensi tugas ini.</span>
              </div>

              <button type="submit" className="btn-action-primary" disabled={submitting} style={{ marginTop: "1rem", width: "100%" }}>
                {submitting ? "Menyimpan ke Database..." : "Simpan Tugas"}
              </button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}