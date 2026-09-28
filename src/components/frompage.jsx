import { useState } from "react";

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



function FormPage({ onAddTask }) {
  const [formData, setFormData] = useState(INITIAL_FORM);

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // trim() agar input yang hanya berisi spasi juga dianggap kosong
    if (formData.title.trim() === "" || formData.deadline === "") {
      setError("Judul tugas dan deadline wajib diisi.");
      return; // hentikan proses, jangan tambah tugas
    }

    const newTask = {
      id: Date.now(),
      title: formData.title.trim(),
      subject: formData.subject || "Umum",
      deadline: formData.deadline,
      priority: formData.priority,
    };

    onAddTask(newTask);

    setError("");
    setFormData(INITIAL_FORM);
  };

  return (
    <section className="form-page">
      <h2>Tambah Tugas Baru</h2>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Title */}
        <label htmlFor="title">Judul tugas</label>
        <input
          id="title"
          name="title"
          type="text"
          placeholder="Contoh: Laporan praktikum CNN"
          value={formData.title}
          onChange={handleChange}
        />

        {/* Subject */}
        <label htmlFor="subject">Mata kuliah</label>
        <select
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
        >
          <option value="">-- Pilih mata kuliah --</option>
          {SUBJECTS.map((subject) => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
        </select>

        {/* Deadline */}
        <label htmlFor="deadline">Deadline</label>
        <input
          id="deadline"
          name="deadline"
          type="date"
          value={formData.deadline}
          onChange={handleChange}
        />

        {/* Priority */}
        <label htmlFor="priority">Prioritas</label>
        <select
          id="priority"
          name="priority"
          value={formData.priority}
          onChange={handleChange}
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>

        <button type="submit">Tambah tugas</button>
      </form>
    </section>
  );
}

export default FormPage;
