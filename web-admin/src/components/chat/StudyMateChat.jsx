import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../api';

export default function StudyMateChat({ currentUser, onTasksChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [executingActionId, setExecutingActionId] = useState(null);
  const messagesEndRef = useRef(null);

  // Load chat history when opened
  useEffect(() => {
    if (isOpen && currentUser) {
      loadHistory();
    }
  }, [isOpen, currentUser]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadHistory = async () => {
    try {
      const res = await api.getAiHistory();
      if (res && res.history && res.history.length > 0) {
        setMessages(res.history);
      } else {
        // Welcome message if fresh
        setMessages([
          {
            id: 'welcome',
            sender: 'assistant',
            message: `Halo **${currentUser?.name || 'Siswa'}**! 👋\n\nSaya **StudyMate AI**, asisten belajar pribadimu. Saya bisa menganalisis daftar tugas, memprioritaskan deadline, mengecek jadwal kuliah, hingga membuatkan rencana belajar otomatis.\n\nAda yang bisa saya bantu hari ini?`,
            action_data: null,
            created_at: new Date().toISOString(),
          },
        ]);
      }
    } catch (err) {
      console.warn('Gagal memuat riwayat chat:', err);
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm('Bersihkan riwayat percakapan dengan StudyMate AI?')) {
      try {
        await api.clearAiHistory();
        setMessages([
          {
            id: 'welcome-reset',
            sender: 'assistant',
            message: `Riwayat percakapan telah dibersihkan. Apa yang ingin kamu diskusikan berikutnya, **${currentUser?.name || 'Siswa'}**?`,
            action_data: null,
            created_at: new Date().toISOString(),
          },
        ]);
      } catch (err) {
        alert('Gagal membersihkan riwayat chat.');
      }
    }
  };

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputText).trim();
    if (!text || loading) return;

    setInputText('');
    const tempUserMsg = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      message: text,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const res = await api.sendAiChat(text);
      const aiReply = {
        id: res.messageId || 'ai-' + Date.now(),
        sender: 'assistant',
        message: res.reply,
        action_data: res.actionProposal || null,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiReply]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          sender: 'assistant',
          message: 'Maaf, terjadi kendala saat memproses jawaban. Silakan coba kembali atau periksa koneksi internet Anda.',
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAction = async (msgId, actionProposal) => {
    if (!actionProposal) return;
    setExecutingActionId(msgId);

    try {
      const res = await api.confirmAiAction(actionProposal.type, actionProposal.data);

      // Refresh tasks in parent if task was created or updated
      if (onTasksChange) {
        const refreshed = await api.getTasks();
        if (refreshed && refreshed.tasks) {
          onTasksChange(refreshed.tasks);
        }
      }

      // Update message state to show action executed
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId
            ? { ...m, action_executed: true, action_data: null }
            : m
        ).concat({
          id: 'confirm-' + Date.now(),
          sender: 'assistant',
          message: `✅ **Aksi Dikonfirmasi!** ${res.message || 'Data telah berhasil disimpan dan disinkronkan ke planner.'}`,
          created_at: new Date().toISOString(),
        })
      );
    } catch (err) {
      alert(err.message || 'Gagal mengeksekusi aksi.');
    } finally {
      setExecutingActionId(null);
    }
  };

  const handleCancelAction = (msgId) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId ? { ...m, action_cancelled: true, action_data: null } : m
      )
    );
  };

  const suggestedPrompts = [
    'Apa tugas paling mendesak yang harus saya kerjakan?',
    'Apa jadwal kuliah saya hari ini?',
    'Bagaimana statistik progres belajar saya?',
    'Berikan tips belajar Pomodoro yang efektif',
  ];

  // Helper untuk render teks dengan formatting sederhana (bold, list)
  const renderFormattedText = (text) => {
    if (!text) return null;
    const lines = text.split('\n');

    return lines.map((line, idx) => {
      // Line bullet
      const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-');
      // Parse bold **text**
      const parts = line.split(/(\*\*[^*]+\*\*)/g);

      return (
        <p key={idx} className={`mb-1.5 last:mb-0 ${isBullet ? 'pl-2 text-slate-700 dark:text-slate-300' : ''}`}>
          {parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={pIdx} className="font-semibold text-slate-900 dark:text-white">{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative group flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-full shadow-lg shadow-indigo-500/30 transition-all duration-300 hover:scale-105 focus:outline-none"
          title="Tanya StudyMate AI"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <span className="font-bold text-sm tracking-wide">StudyMate AI</span>
        </button>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="w-[360px] sm:w-[420px] h-[580px] max-h-[85vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold text-base shadow-inner">
                🤖
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight">StudyMate AI</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-[11px] text-indigo-100 font-medium">Asisten Belajar Aktif</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearHistory}
                className="p-1.5 text-indigo-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Hapus riwayat chat"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-indigo-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Tutup chat"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages Thread */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50 dark:bg-slate-950/50">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/60 rounded-bl-none'
                    }`}
                  >
                    {renderFormattedText(msg.message)}

                    {/* Action Proposal Card inside Assistant Message */}
                    {msg.action_data && (
                      <div className="mt-3 p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800/60 text-slate-800 dark:text-slate-100">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 mb-1.5">
                          <span>⚡</span>
                          <span>Usulan Tindakan Otomatis</span>
                        </div>

                        {msg.action_data.type === 'create_task' && (
                          <div className="space-y-1 text-xs mb-3">
                            <p><span className="font-semibold text-slate-600 dark:text-slate-400">Judul:</span> {msg.action_data.data.title}</p>
                            <p><span className="font-semibold text-slate-600 dark:text-slate-400">Mata Kuliah:</span> {msg.action_data.data.subject}</p>
                            <p><span className="font-semibold text-slate-600 dark:text-slate-400">Deadline:</span> {msg.action_data.data.deadline}</p>
                            <p><span className="font-semibold text-slate-600 dark:text-slate-400">Prioritas:</span> <span className="font-bold text-rose-600 dark:text-rose-400">{msg.action_data.data.priority}</span></p>
                          </div>
                        )}

                        {msg.action_data.type === 'update_task_status' && (
                          <div className="space-y-1 text-xs mb-3">
                            <p><span className="font-semibold text-slate-600 dark:text-slate-400">Ubah Status Tugas ID #{msg.action_data.data.id}</span> ke <span className="font-bold text-indigo-600">{msg.action_data.data.status}</span></p>
                          </div>
                        )}

                        <div className="flex items-center gap-2 pt-1 border-t border-indigo-100 dark:border-indigo-900/60">
                          <button
                            onClick={() => handleConfirmAction(msg.id, msg.action_data)}
                            disabled={executingActionId === msg.id}
                            className="flex-1 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
                          >
                            {executingActionId === msg.id ? 'Memproses...' : '✓ Konfirmasi & Eksekusi'}
                          </button>
                          <button
                            onClick={() => handleCancelAction(msg.id)}
                            className="py-1.5 px-2.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium transition-colors"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl w-fit">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]"></span>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">StudyMate sedang menyusun respon...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Quick Prompts */}
          <div className="px-3 py-2 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex gap-1.5 overflow-x-auto scrollbar-none">
            {suggestedPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                disabled={loading}
                className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-400 transition-colors flex-shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Tanya atau minta bantuan StudyMate..."
              disabled={loading}
              className="flex-1 px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl disabled:opacity-50 transition-colors shadow-xs"
              title="Kirim pesan"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
