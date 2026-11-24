import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { PRESET_SUBJECTS } from '../constants/coursesData';

export default function ModalTaskForm({ visible, taskToEdit, onClose, onSubmit }) {
  const isEditing = !!taskToEdit;

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState(PRESET_SUBJECTS[0]);
  const [customSubject, setCustomSubject] = useState('');
  const [isCustomSubject, setIsCustomSubject] = useState(false);
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [status, setStatus] = useState('pending');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Preset today's date + 7 days as default deadline YYYY-MM-DD
  const getDefaultDeadline = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  };

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || '');
      const isPreset = PRESET_SUBJECTS.includes(taskToEdit.subject);
      if (isPreset) {
        setSubject(taskToEdit.subject);
        setIsCustomSubject(false);
        setCustomSubject('');
      } else {
        setSubject('Lainnya');
        setIsCustomSubject(true);
        setCustomSubject(taskToEdit.subject || '');
      }
      setDeadline(taskToEdit.deadline || getDefaultDeadline());
      setPriority(taskToEdit.priority || 'Medium');
      setStatus(taskToEdit.status || 'pending');
    } else {
      setTitle('');
      setSubject(PRESET_SUBJECTS[0]);
      setIsCustomSubject(false);
      setCustomSubject('');
      setDeadline(getDefaultDeadline());
      setPriority('Medium');
      setStatus('pending');
    }
    setErrorMessage('');
  }, [taskToEdit, visible]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setErrorMessage('Judul tugas wajib diisi.');
      return;
    }
    if (!deadline.trim()) {
      setErrorMessage('Tenggat waktu (deadline) wajib diisi.');
      return;
    }

    const finalSubject = isCustomSubject
      ? customSubject.trim() || 'Umum'
      : subject;

    const payload = {
      title: title.trim(),
      subject: finalSubject,
      deadline: deadline.trim(),
      priority,
      status,
    };

    try {
      setSubmitting(true);
      setErrorMessage('');
      await onSubmit(payload);
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Gagal menyimpan tugas.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>
                {isEditing ? 'Edit Agenda Tugas' : 'Tambah Tugas Belajar'}
              </Text>
              <Text style={styles.headerSubtitle}>
                {isEditing ? 'Perbarui detail tugas dan tenggat waktu' : 'Jadwalkan modul dan prioritas baru'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formContent} showsVerticalScrollIndicator={false}>
            {/* Error Message */}
            {errorMessage ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color={COLORS.danger} />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Input: Judul Tugas */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Judul Tugas <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Contoh: Makalah Riset Deep Learning"
                placeholderTextColor={COLORS.textLight}
                value={title}
                onChangeText={setTitle}
                editable={!submitting}
              />
            </View>

            {/* Input: Mata Kuliah */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mata Kuliah / Topik</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsScroll}
              >
                {PRESET_SUBJECTS.map((item) => {
                  const selected = !isCustomSubject && subject === item;
                  return (
                    <TouchableOpacity
                      key={item}
                      style={[styles.chip, selected && styles.chipActive]}
                      onPress={() => {
                        setIsCustomSubject(false);
                        setSubject(item);
                      }}
                    >
                      <Text style={[styles.chipText, selected && styles.chipTextActive]}>
                        {item}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
                <TouchableOpacity
                  style={[styles.chip, isCustomSubject && styles.chipActive]}
                  onPress={() => {
                    setIsCustomSubject(true);
                  }}
                >
                  <Text style={[styles.chipText, isCustomSubject && styles.chipTextActive]}>
                    + Tulis Sendiri
                  </Text>
                </TouchableOpacity>
              </ScrollView>

              {isCustomSubject ? (
                <TextInput
                  style={[styles.input, { marginTop: 8 }]}
                  placeholder="Ketikkan nama mata kuliah/kategori..."
                  placeholderTextColor={COLORS.textLight}
                  value={customSubject}
                  onChangeText={setCustomSubject}
                  editable={!submitting}
                />
              ) : null}
            </View>

            {/* Input: Deadline & Status */}
            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>
                  Tenggat (YYYY-MM-DD) <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="2026-11-30"
                  placeholderTextColor={COLORS.textLight}
                  value={deadline}
                  onChangeText={setDeadline}
                  editable={!submitting}
                />
              </View>

              {isEditing ? (
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
                  <Text style={styles.label}>Status Pengerjaan</Text>
                  <View style={styles.statusButtons}>
                    {['pending', 'in_progress', 'completed'].map((st) => (
                      <TouchableOpacity
                        key={st}
                        style={[
                          styles.statusBtn,
                          status === st && styles.statusBtnActive,
                        ]}
                        onPress={() => setStatus(st)}
                      >
                        <Text
                          style={[
                            styles.statusBtnText,
                            status === st && styles.statusBtnTextActive,
                          ]}
                        >
                          {st === 'pending' ? 'To Do' : st === 'in_progress' ? 'Progres' : 'Tuntas'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ) : null}
            </View>

            {/* Input: Prioritas */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tingkat Prioritas</Text>
              <View style={styles.priorityRow}>
                {[
                  { id: 'High', label: '🔥 Tinggi', color: COLORS.highPriorityText, bg: COLORS.highPriorityBg },
                  { id: 'Medium', label: '⚡ Sedang', color: COLORS.medPriorityText, bg: COLORS.medPriorityBg },
                  { id: 'Low', label: '🌱 Rendah', color: COLORS.lowPriorityText, bg: COLORS.lowPriorityBg },
                ].map((p) => {
                  const selected = priority === p.id;
                  return (
                    <TouchableOpacity
                      key={p.id}
                      style={[
                        styles.priorityBtn,
                        { borderColor: selected ? p.color : COLORS.border },
                        selected && { backgroundColor: p.bg },
                      ]}
                      onPress={() => setPriority(p.id)}
                    >
                      <Text
                        style={[
                          styles.priorityBtnText,
                          { color: selected ? p.color : COLORS.textMuted },
                          selected && { fontWeight: '700' },
                        ]}
                      >
                        {p.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitBtn, submitting && styles.btnDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
              activeOpacity={0.8}
            >
              {submitting ? (
                <ActivityIndicator color={COLORS.textInverse} size="small" />
              ) : (
                <Text style={styles.submitBtnText}>
                  {isEditing ? 'Simpan Perubahan' : 'Jadwalkan Tugas'}
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formContent: {
    marginTop: 14,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    gap: 8,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.danger,
    flex: 1,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 14,
  },
  rowInputs: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMain,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  required: {
    color: COLORS.danger,
  },
  input: {
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: COLORS.textMain,
  },
  chipsScroll: {
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    backgroundColor: COLORS.surfaceSubtle,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  chipTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  statusButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  statusBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSubtle,
  },
  statusBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  statusBtnText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  statusBtnTextActive: {
    color: COLORS.textInverse,
    fontWeight: '700',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    backgroundColor: COLORS.card,
  },
  priorityBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: COLORS.textInverse,
    fontSize: 14,
    fontWeight: '700',
  },
});

