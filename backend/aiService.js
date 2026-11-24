import { dbAll, dbGet, dbRun } from './db.js';

/**
 * Mengambil konteks data aktual pengguna secara real-time
 */
export async function getUserContext(userId) {
  const user = await dbGet('SELECT id, username, name, role, bio FROM users WHERE id = ?', [userId]);
  if (!user) return null;

  const tasks = await dbAll(
    'SELECT id, title, subject, deadline, priority, status FROM tasks WHERE user_id = ? ORDER BY deadline ASC',
    [userId]
  );

  const schedules = await dbAll(
    "SELECT id, title, subject, day_of_week, start_time, end_time, room, lecturer FROM schedules WHERE user_id = ? ORDER BY CASE day_of_week WHEN 'Senin' THEN 1 WHEN 'Selasa' THEN 2 WHEN 'Rabu' THEN 3 WHEN 'Kamis' THEN 4 WHEN 'Jumat' THEN 5 WHEN 'Sabtu' THEN 6 WHEN 'Minggu' THEN 7 ELSE 8 END",
    [userId]
  );

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'completed');
  const inProgress = tasks.filter((t) => t.status === 'in_progress');
  const pending = tasks.filter((t) => !t.status || t.status === 'pending');
  const activeTasks = tasks.filter((t) => t.status !== 'completed');
  const highPriority = activeTasks.filter((t) => t.priority === 'High');

  const today = new Date().toISOString().split('T')[0];
  const urgentTasks = activeTasks.filter((t) => {
    if (!t.deadline) return false;
    const diffDays = Math.ceil((new Date(t.deadline) - new Date(today)) / (1000 * 60 * 60 * 24));
    return diffDays <= 3;
  });

  const completionRate = total > 0 ? Math.round((completed.length / total) * 100) : 0;

  return {
    user,
    stats: {
      total,
      completedCount: completed.length,
      inProgressCount: inProgress.length,
      pendingCount: pending.length,
      highPriorityCount: highPriority.length,
      urgentCount: urgentTasks.length,
      completionRate,
    },
    activeTasks,
    urgentTasks,
    schedules,
  };
}

/**
 * Mesin Inferensi AI Kontekstual StudyMate AI
 * Mendukung OpenAI API jika OPENAI_API_KEY disetel, atau Built-in Contextual Intelligence Engine
 */
export async function generateStudyMateResponse({ userMessage, userContext, history = [] }) {
  const { user, stats, activeTasks, urgentTasks, schedules } = userContext;

  // 1. Jika pengguna menyediakan OPENAI_API_KEY di environment
  if (process.env.OPENAI_API_KEY) {
    try {
      const openAiReply = await callOpenAiApi({ userMessage, userContext, history });
      if (openAiReply) return openAiReply;
    } catch (e) {
      console.warn('Gagal memanggil OpenAI API, beralih ke Built-in Contextual Engine:', e.message);
    }
  }

  // 2. Built-in Contextual Intelligence Engine (Bekerja secara offline / tanpa API key luar)
  return generateContextualEngineResponse({ userMessage, userContext });
}

/**
 * Panggilan OpenAI Chat Completion dengan System Prompt & Context Injection
 */
async function callOpenAiApi({ userMessage, userContext, history }) {
  const systemPrompt = `Kamu adalah StudyMate AI, asisten pribadi cerdas, ramah, dan solutif di aplikasi Study Planner.
Nama pengguna yang sedang kamu dampingi adalah ${userContext.user.name} (${userContext.user.role === 'admin' ? 'Mentor' : 'Mahasiswa'}).
Data tugas saat ini:
- Total tugas: ${userContext.stats.total} (Tuntas: ${userContext.stats.completedCount}, Belum selesai: ${userContext.activeTasks.length}, Prioritas Tinggi: ${userContext.stats.highPriorityCount})
- Tugas aktif: ${JSON.stringify(userContext.activeTasks.slice(0, 10))}
- Jadwal perkuliahan: ${JSON.stringify(userContext.schedules.slice(0, 7))}

Aturan kamu:
1. Jawab selalu dalam bahasa Indonesia yang santun, memotivasi, dan berorientasi pada tindakan nyata.
2. Selalu gunakan data tugas dan jadwal aktual pengguna di atas saat memberi rekomendasi prioritas atau rencana belajar.
3. Jika pengguna meminta membuat tugas atau jadwal baru, sertakan proposal aksi dalam JSON di akhir pesan dengan format:
<!--ACTION:{"type":"create_task","data":{"title":"...","subject":"...","deadline":"YYYY-MM-DD","priority":"High|Medium|Low"}}-->
4. Jangan menghapus atau mengubah data pengguna tanpa izin/konfirmasi.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-6).map((h) => ({
      role: h.sender === 'user' ? 'user' : 'assistant',
      content: h.message,
    })),
    { role: 'user', content: userMessage },
  ];

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 800,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI responded with status ${response.status}`);
  }

  const data = await response.json();
  const rawContent = data.choices?.[0]?.message?.content || '';

  // Ekstrak proposal aksi jika ada
  let actionProposal = null;
  let cleanMessage = rawContent;

  const actionMatch = rawContent.match(/<!--ACTION:(.*?)-->/);
  if (actionMatch) {
    try {
      actionProposal = JSON.parse(actionMatch[1]);
      cleanMessage = rawContent.replace(actionMatch[0], '').trim();
    } catch (e) {}
  }

  return {
    reply: cleanMessage,
    actionProposal,
  };
}

/**
 * Built-in Contextual Intelligence Engine
 * Mengolah secara langsung logika prioritas, deadline, jadwal, dan progres
 */
function generateContextualEngineResponse({ userMessage, userContext }) {
  const msg = userMessage.toLowerCase().trim();
  const { user, stats, activeTasks, urgentTasks, schedules } = userContext;

  // Intent 1: Tanya Prioritas / Apa yang harus dikerjakan dulu
  if (
    msg.includes('prioritas') ||
    msg.includes('dulu') ||
    msg.includes('mendesak') ||
    msg.includes('kerjakan') ||
    msg.includes('mana') ||
    msg.includes('urgent')
  ) {
    if (activeTasks.length === 0) {
      return {
        reply: `Luar biasa, ${user.name}! 🎉 Seluruh tugas belajar Anda saat ini sudah selesai (${stats.completedCount} tuntas dari total ${stats.total}).\n\nAnda tidak memiliki tugas aktif yang mendesak. Luangkan waktu untuk mengulas materi di *Course Hub* atau istirahat sejenak agar pikiran tetap segar!`,
        actionProposal: null,
      };
    }

    // Urutkan berdasarkan prioritas dan deadline terdekat
    const sorted = [...activeTasks].sort((a, b) => {
      const pMap = { High: 3, Medium: 2, Low: 1 };
      const pDiff = (pMap[b.priority] || 1) - (pMap[a.priority] || 1);
      if (pDiff !== 0) return pDiff;
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline) - new Date(b.deadline);
    });

    const topTask = sorted[0];
    const otherTasks = sorted.slice(1, 3);

    let reply = `Halo ${user.name}, berdasarkan analisis data tugas aktif Anda, berikut urutan prioritas yang paling direkomendasikan:\n\n`;
    reply += `🥇 **Utama: ${topTask.title}**\n`;
    reply += `• Mata Kuliah: ${topTask.subject || 'Umum'}\n`;
    reply += `• Tenggat: ${topTask.deadline} (Prioritas: ${topTask.priority})\n`;
    reply += `• *Strategi:* Kerjakan tugas ini dengan teknik Pomodoro 25 menit sesi fokus tanpa distraksi.\n\n`;

    if (otherTasks.length > 0) {
      reply += `📌 **Tugas Berikutnya:**\n`;
      otherTasks.forEach((t, idx) => {
        reply += `${idx + 2}. **${t.title}** (${t.subject}) — Tenggat: ${t.deadline} [${t.priority}]\n`;
      });
      reply += `\n`;
    }

    reply += `Fokus tuntaskan tugas pertama hari ini terlebih dahulu untuk menjaga momentum belajar Anda!`;

    return {
      reply,
      actionProposal: {
        type: 'update_task_status',
        label: `Tandai "${topTask.title}" Dalam Pengerjaan`,
        data: { id: topTask.id, status: 'in_progress' },
        confirmationPrompt: `Apakah Anda ingin saya memperbarui status "${topTask.title}" menjadi "Sedang Berlangsung"?`,
      },
    };
  }

  // Intent 2: Tanya / Analisis Progres Belajar
  if (
    msg.includes('progres') ||
    msg.includes('progress') ||
    msg.includes('statistik') ||
    msg.includes('evaluasi') ||
    msg.includes('analisis')
  ) {
    let reply = `📊 **Ringkasan Progres Belajar Anda, ${user.name}:**\n\n`;
    reply += `• **Tingkat Kelulusan Tugas:** ${stats.completionRate}%\n`;
    reply += `• **Tugas Selesai:** ${stats.completedCount} dari ${stats.total} tugas\n`;
    reply += `• **Tugas Aktif:** ${activeTasks.length} (${stats.inProgressCount} sedang berjalan, ${stats.pendingCount} to do)\n`;
    reply += `• **Tugas Prioritas Tinggi:** ${stats.highPriorityCount} agenda\n\n`;

    if (stats.completionRate >= 75) {
      reply += `⭐ *Pencapaian Sangat Baik!* Konsistensi Anda sangat solid. Pertahankan disiplin ini menuju target kelulusan semester.`;
    } else if (stats.completionRate >= 50) {
      reply += `⚡ *Progres Berjalan Baik!* Anda sudah melewati separuh target tugas. Luangkan 1-2 sesi Pomodoro harian untuk menuntaskan sisa tugas prioritas tinggi.`;
    } else {
      reply += `💡 *Perlu Akselerasi:* Masih ada ${activeTasks.length} tugas yang perlu perhatian. Mulai dari tugas dengan tenggat terdekat hari ini!`;
    }

    return { reply, actionProposal: null };
  }

  // Intent 3: Tanya Jadwal Perkuliahan / Belajar
  if (
    msg.includes('jadwal') ||
    msg.includes('kuliah') ||
    msg.includes('hari ini') ||
    msg.includes('kelas') ||
    msg.includes('minggu ini')
  ) {
    if (schedules.length === 0) {
      return {
        reply: `Halo ${user.name}, saat ini Anda belum memiliki jadwal perkuliahan terdaftar di sistem. Anda dapat menambahkannya melalui menu Jadwal Belajar atau minta saya untuk membuatkannya!`,
        actionProposal: null,
      };
    }

    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const currentDayName = dayNames[new Date().getDay()];
    const todaySchedules = schedules.filter((s) => s.day_of_week === currentDayName);

    let reply = `🗓️ **Agenda Jadwal Perkuliahan Anda:**\n\n`;
    if (todaySchedules.length > 0) {
      reply += `📍 **Jadwal Hari Ini (${currentDayName}):**\n`;
      todaySchedules.forEach((s) => {
        reply += `• **${s.title}** (${s.subject})\n  Jam: ${s.start_time} - ${s.end_time} WIB | Ruang: ${s.room || '-'}\n`;
      });
      reply += `\n`;
    } else {
      reply += `📍 Hari ini (${currentDayName}) tidak ada jadwal kelas tatap muka.\n\n`;
    }

    reply += `📚 **Jadwal Perkuliahan Mingguan:**\n`;
    schedules.slice(0, 5).forEach((s) => {
      reply += `• **${s.day_of_week}**: ${s.subject} (${s.start_time} - ${s.end_time})\n`;
    });

    return { reply, actionProposal: null };
  }

  // Intent 4: Permintaan Membuat Tugas Baru
  if (
    msg.includes('buatkan tugas') ||
    msg.includes('tambah tugas') ||
    msg.includes('tambahkan tugas') ||
    msg.includes('jadwalkan tugas')
  ) {
    // Estimasi default 7 hari ke depan
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const defaultDate = nextWeek.toISOString().split('T')[0];

    // Deteksi subjek dan judul sederhana
    let extractedTitle = userMessage.replace(/(buatkan tugas|tambah tugas|tambahkan tugas|jadwalkan tugas)/gi, '').trim();
    if (!extractedTitle) extractedTitle = 'Tugas Mandiri Baru';

    return {
      reply: `Saya siap menjadwalkan tugas baru untuk Anda! Berikut draf yang telah saya siapkan:\n\n• **Judul:** ${extractedTitle}\n• **Mata Kuliah:** Umum\n• **Tenggat:** ${defaultDate}\n• **Prioritas:** Sedang (Medium)\n\nSilakan konfirmasi di bawah jika Anda ingin menyimpan tugas ini langsung ke database Study Planner.`,
      actionProposal: {
        type: 'create_task',
        label: `Simpan Tugas: "${extractedTitle}"`,
        data: {
          title: extractedTitle,
          subject: 'Umum',
          deadline: defaultDate,
          priority: 'Medium',
          status: 'pending',
        },
        confirmationPrompt: `Konfirmasi pembuatan tugas "${extractedTitle}"?`,
      },
    };
  }

  // Intent 5: Strategi & Tips Belajar / Pomodoro
  if (
    msg.includes('tips') ||
    msg.includes('strategi') ||
    msg.includes('pomodoro') ||
    msg.includes('malas') ||
    msg.includes('motivasi') ||
    msg.includes('fokus')
  ) {
    const reply = `💪 **Tips Belajar Efektif dari StudyMate AI untuk ${user.name}:**\n\n` +
      `1. **Gunakan Pomodoro Interval (25/5):** Buka fitur *Fokus* di menu navigasi. Belajar intensif selama 25 menit tanpa ponsel, lalu istirahat 5 menit.\n` +
      `2. **Aturan 2 Menit:** Jika ada tugas yang bisa diselesaikan kurang dari 2 menit (misal cek silabus atau kirim email), kerjakan sekarang.\n` +
      `3. **Pecah Tugas Besar (Micro-Tasks):** Jangan tulis "Selesaikan Skripsi". Pecah jadi: "Cari 3 referensi jurnal", "Tulis bab 2 latar belakang".\n` +
      `4. **Dengarkan Soundscapes:** Aktifkan suara hujan (Rain) atau kedai kopi di menu Pomodoro untuk memblokir kebisingan sekitar.\n\n` +
      `Ingat: *Konsistensi kecil setiap hari mengalahkan belajar maraton satu malam.* Semangat! 🚀`;

    return { reply, actionProposal: null };
  }

  // Default Intent: Jawaban Ramah & Panduan Fitur
  const defaultReply = `Halo ${user.name}! Saya **StudyMate AI**, asisten belajar cerdas Anda di Study Planner. 🤖\n\n` +
    `Saya dapat membantu Anda:\n` +
    `• 🎯 **Menentukan Prioritas Tugas:** Tanyakan *"Apa tugas paling mendesak yang harus saya kerjakan?"*\n` +
    `• 📊 **Menganalisis Progres:** Tanyakan *"Bagaimana statistik progres belajar saya?"*\n` +
    `• 🗓️ **Memeriksa Jadwal:** Tanyakan *"Apa jadwal kuliah saya hari ini?"*\n` +
    `• 📝 **Menjadwalkan Tugas:** Ketik *"Buatkan tugas [nama materi]"*\n` +
    `• 💡 **Tips Belajar & Fokus:** Tanyakan strategi Pomodoro atau teknik manajemen waktu.\n\n` +
    `Ada yang bisa saya bantu sekarang untuk mendukung studi Anda?`;

  return { reply: defaultReply, actionProposal: null };
}

/**
 * Eksekusi tindakan AI yang telah dikonfirmasi oleh pengguna
 */
export async function executeAiAction(userId, actionType, actionData) {
  if (actionType === 'create_task') {
    const { title, subject, deadline, priority, status } = actionData;
    const res = await dbRun(
      'INSERT INTO tasks (user_id, title, subject, deadline, priority, status) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, title, subject || 'Umum', deadline, priority || 'Medium', status || 'pending']
    );
    const created = await dbGet('SELECT * FROM tasks WHERE id = ?', [res.lastID]);
    return { success: true, message: `Tugas "${title}" berhasil dijadwalkan!`, data: created };
  }

  if (actionType === 'update_task_status') {
    const { id, status } = actionData;
    await dbRun('UPDATE tasks SET status = ? WHERE id = ? AND user_id = ?', [status, id, userId]);
    const updated = await dbGet('SELECT * FROM tasks WHERE id = ?', [id]);
    return { success: true, message: `Status tugas berhasil diperbarui ke "${status}"!`, data: updated };
  }

  if (actionType === 'create_schedule') {
    const { title, subject, day_of_week, start_time, end_time, room, lecturer, notes } = actionData;
    const res = await dbRun(
      'INSERT INTO schedules (user_id, title, subject, day_of_week, start_time, end_time, room, lecturer, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, title, subject, day_of_week, start_time, end_time, room || '', lecturer || '', notes || '']
    );
    const created = await dbGet('SELECT * FROM schedules WHERE id = ?', [res.lastID]);
    return { success: true, message: `Jadwal "${title}" berhasil ditambahkan!`, data: created };
  }

  throw new Error(`Tipe aksi "${actionType}" tidak dikenali.`);
}
