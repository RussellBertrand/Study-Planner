import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { COLORS, SHADOWS } from '../constants/theme';

export default function StudyMateModal({ visible, onClose }) {
  const { currentUser } = useAuth();
  const { refreshTasks } = useTasks();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [executingId, setExecutingId] = useState(null);
  const flatListRef = useRef(null);

  useEffect(() => {
    if (visible && currentUser) {
      loadHistory();
    }
  }, [visible, currentUser]);

  const loadHistory = async () => {
    try {
      const res = await api.getAiHistory();
      if (res && res.history && res.history.length > 0) {
        setMessages(res.history);
      } else {
        setMessages([
          {
            id: 'welcome',
            sender: 'assistant',
            message: `Halo **${currentUser?.name || 'Siswa'}**! 👋\n\nSaya **StudyMate AI**, asisten belajarmu di Study Planner Mobile. Saya siap membantumu memprioritaskan tugas mendesak, mengecek jadwal kuliah, hingga menyusun rencana studi.`,
            action_data: null,
          },
        ]);
      }
    } catch (e) {}
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Hapus Riwayat',
      'Hapus seluruh riwayat percakapan dengan StudyMate AI?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            await api.clearAiHistory();
            setMessages([
              {
                id: 'welcome-reset',
                sender: 'assistant',
                message: `Riwayat percakapan telah dibersihkan. Apa yang ingin kamu tanyakan hari ini, **${currentUser?.name || 'Siswa'}**?`,
                action_data: null,
              },
            ]);
          },
        },
      ]
    );
  };

  const handleSend = async (textToSend) => {
    const text = (textToSend || inputText).trim();
    if (!text || loading) return;

    setInputText('');
    const tempUserMsg = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      message: text,
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
      };
      setMessages((prev) => [...prev, aiReply]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          sender: 'assistant',
          message: 'Maaf, terjadi kendala saat memproses balasan. Silakan periksa koneksi jaringan Anda.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAction = async (msgId, actionProposal) => {
    if (!actionProposal) return;
    setExecutingId(msgId);

    try {
      const res = await api.confirmAiAction(actionProposal.type, actionProposal.data);
      if (refreshTasks) {
        await refreshTasks();
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId ? { ...m, action_executed: true, action_data: null } : m
        ).concat({
          id: 'confirm-' + Date.now(),
          sender: 'assistant',
          message: `✅ **Aksi Berhasil:** ${res.message || 'Tugas telah dijadwalkan ke planner Anda!'}`,
        })
      );
    } catch (err) {
      Alert.alert('Gagal', err.message || 'Gagal mengeksekusi aksi.');
    } finally {
      setExecutingId(null);
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
    'Apa tugas paling mendesak?',
    'Jadwal kuliah hari ini?',
    'Tips Pomodoro',
  ];

  const renderMessageItem = ({ item }) => {
    const isUser = item.sender === 'user';
    return (
      <View style={[styles.msgRow, isUser ? styles.msgRowUser : styles.msgRowAssistant]}>
        {!isUser && (
          <View style={styles.assistantAvatar}>
            <Text style={{ fontSize: 16 }}>🤖</Text>
          </View>
        )}
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant, SHADOWS.xs]}>
          <Text style={[styles.msgText, isUser ? styles.msgTextUser : styles.msgTextAssistant]}>
            {item.message.replace(/\*\*/g, '')}
          </Text>

          {/* Action Proposal Card */}
          {item.action_data && (
            <View style={styles.actionCard}>
              <View style={styles.actionHeader}>
                <Ionicons name="flash" size={14} color={COLORS.primary} />
                <Text style={styles.actionTitle}>Usulan Tindakan AI</Text>
              </View>

              {item.action_data.type === 'create_task' && (
                <View style={styles.actionContent}>
                  <Text style={styles.actionDetail}><Text style={styles.bold}>Judul:</Text> {item.action_data.data.title}</Text>
                  <Text style={styles.actionDetail}><Text style={styles.bold}>Mata Kuliah:</Text> {item.action_data.data.subject}</Text>
                  <Text style={styles.actionDetail}><Text style={styles.bold}>Deadline:</Text> {item.action_data.data.deadline}</Text>
                  <Text style={styles.actionDetail}><Text style={styles.bold}>Prioritas:</Text> {item.action_data.data.priority}</Text>
                </View>
              )}

              <View style={styles.actionBtnRow}>
                <TouchableOpacity
                  style={[styles.btnConfirm, executingId === item.id && { opacity: 0.6 }]}
                  disabled={executingId === item.id}
                  onPress={() => handleConfirmAction(item.id, item.action_data)}
                >
                  <Text style={styles.btnConfirmText}>
                    {executingId === item.id ? 'Menyimpan...' : '✓ Simpan Tugas'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.btnCancel}
                  onPress={() => handleCancelAction(item.id)}
                >
                  <Text style={styles.btnCancelText}>Batal</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIconWrapper}>
                <Text style={{ fontSize: 20 }}>🤖</Text>
              </View>
              <View>
                <Text style={styles.headerTitle}>StudyMate AI</Text>
                <Text style={styles.headerSubtitle}>Asisten Belajar Cerdas</Text>
              </View>
            </View>

            <View style={styles.headerActions}>
              <TouchableOpacity onPress={handleClearHistory} style={styles.headerBtn}>
                <Ionicons name="trash-outline" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Chat Messages */}
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderMessageItem}
            contentContainerStyle={styles.listContent}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            showsVerticalScrollIndicator={false}
          />

          {loading && (
            <View style={styles.typingIndicator}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.typingText}>StudyMate sedang berpikir...</Text>
            </View>
          )}

          {/* Quick Prompts */}
          <View style={styles.chipsWrapper}>
            {suggestedPrompts.map((p, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.chip}
                onPress={() => handleSend(p)}
                disabled={loading}
              >
                <Text style={styles.chipText}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Input Bar */}
          <View style={styles.inputBar}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Tanya apa saja seputar tugas & belajar..."
              placeholderTextColor={COLORS.textLight}
              multiline={false}
              returnKeyType="send"
              onSubmitEditing={() => handleSend()}
            />
            <TouchableOpacity
              style={[styles.sendBtn, (!inputText.trim() || loading) && styles.sendBtnDisabled]}
              disabled={!inputText.trim() || loading}
              onPress={() => handleSend()}
            >
              <Ionicons name="send" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748B',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerBtn: {
    padding: 6,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  msgRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  msgRowUser: {
    justifyContent: 'flex-end',
  },
  msgRowAssistant: {
    justifyContent: 'flex-start',
  },
  assistantAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  bubble: {
    maxWidth: '82%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleUser: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  bubbleAssistant: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  msgText: {
    fontSize: 13,
    lineHeight: 19,
  },
  msgTextUser: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  msgTextAssistant: {
    color: '#1E293B',
  },
  actionCard: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
  },
  actionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  actionContent: {
    gap: 2,
    marginBottom: 8,
  },
  actionDetail: {
    fontSize: 11,
    color: '#334155',
  },
  bold: {
    fontWeight: '700',
  },
  actionBtnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  btnConfirm: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnConfirmText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  btnCancel: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
    alignItems: 'center',
  },
  btnCancelText: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '600',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 6,
  },
  typingText: {
    fontSize: 11,
    color: '#64748B',
    fontStyle: 'italic',
  },
  chipsWrapper: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  chip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '500',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0F172A',
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
});
