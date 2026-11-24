import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../services/api';
import { COLORS, SHADOWS } from '../constants/theme';
import HeaderBar from '../components/HeaderBar';

const DAYS = ['ALL', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

export default function ScheduleScreen() {
  const [selectedDay, setSelectedDay] = useState('ALL');
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    day_of_week: 'Senin',
    start_time: '08:00',
    end_time: '10:00',
    room: '',
    lecturer: '',
    notes: '',
  });

  const loadSchedules = useCallback(async () => {
    try {
      const res = await api.getSchedules(selectedDay === 'ALL' ? null : selectedDay);
      setSchedules(res.schedules || []);
    } catch (e) {
      console.warn('Gagal memuat jadwal:', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedDay]);

  useEffect(() => {
    setLoading(true);
    loadSchedules();
  }, [loadSchedules]);

  const onRefresh = () => {
    setRefreshing(true);
    loadSchedules();
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      subject: '',
      day_of_week: selectedDay === 'ALL' ? 'Senin' : selectedDay,
      start_time: '08:00',
      end_time: '10:00',
      room: '',
      lecturer: '',
      notes: '',
    });
    setModalVisible(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      subject: item.subject,
      day_of_week: item.day_of_week,
      start_time: item.start_time,
      end_time: item.end_time,
      room: item.room || '',
      lecturer: item.lecturer || '',
      notes: item.notes || '',
    });
    setModalVisible(true);
  };

  const handleDelete = (item) => {
    Alert.alert(
      'Hapus Jadwal',
      `Yakin ingin menghapus jadwal "${item.title}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteSchedule(item.id);
              setSchedules((prev) => prev.filter((s) => s.id !== item.id));
            } catch (err) {
              Alert.alert('Gagal', err.message || 'Gagal menghapus jadwal.');
            }
          },
        },
      ]
    );
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.subject.trim()) {
      Alert.alert('Peringatan', 'Judul agenda dan Mata Kuliah wajib diisi.');
      return;
    }

    try {
      if (editingItem) {
        const res = await api.updateSchedule(editingItem.id, formData);
        setSchedules((prev) =>
          prev.map((s) => (s.id === editingItem.id ? res.schedule : s))
        );
      } else {
        const res = await api.createSchedule(formData);
        setSchedules((prev) => [...prev, res.schedule]);
      }
      setModalVisible(false);
    } catch (err) {
      Alert.alert('Gagal', err.message || 'Gagal menyimpan jadwal.');
    }
  };

  const filteredList =
    selectedDay === 'ALL'
      ? schedules
      : schedules.filter((s) => s.day_of_week === selectedDay);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <HeaderBar
        title="Jadwal Belajar"
        subtitle="Alokasi waktu tatap muka & praktikum mingguan"
        rightAction={
          <TouchableOpacity style={styles.addBtnHeader} onPress={handleOpenAdd}>
            <Ionicons name="add" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        }
      />

      {/* Day Selector Pills */}
      <View style={styles.daysWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daysScroll}
        >
          {DAYS.map((d) => {
            const active = selectedDay === d;
            return (
              <TouchableOpacity
                key={d}
                style={[styles.dayPill, active && styles.dayPillActive]}
                onPress={() => setSelectedDay(d)}
              >
                <Text style={[styles.dayPillText, active && styles.dayPillTextActive]}>
                  {d === 'ALL' ? 'Semua' : d}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {/* Info Banner */}
        <View style={[styles.infoBanner, SHADOWS.sm]}>
          <Ionicons name="calendar" size={20} color={COLORS.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.infoBannerTitle}>
              {selectedDay === 'ALL'
                ? `${filteredList.length} Sesi Perkuliahan Terjadwal`
                : `Jadwal Perkuliahan Hari ${selectedDay}`}
            </Text>
            <Text style={styles.infoBannerSub}>
              Sinkron otomatis dengan kalender backend & web-admin.
            </Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingWrapper}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.loadingText}>Memuat jadwal...</Text>
          </View>
        ) : filteredList.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="calendar-outline" size={44} color={COLORS.textLight} />
            <Text style={styles.emptyTitle}>Tidak Ada Jadwal</Text>
            <Text style={styles.emptyText}>
              Belum ada perkuliahan pada hari yang dipilih. Ketuk ikon + di kanan atas untuk menambahkan jadwal.
            </Text>
          </View>
        ) : (
          filteredList.map((item) => (
            <View key={item.id} style={[styles.card, SHADOWS.sm]}>
              <View style={styles.cardHeader}>
                <View style={styles.dayBadge}>
                  <Text style={styles.dayBadgeText}>{item.day_of_week}</Text>
                </View>
                <View style={styles.timeBadge}>
                  <Ionicons name="time-outline" size={12} color="#475569" />
                  <Text style={styles.timeText}>{item.start_time} - {item.end_time}</Text>
                </View>
              </View>

              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.subjectText}>📚 {item.subject}</Text>

              <View style={styles.cardDetails}>
                {Boolean(item.room) && (
                  <View style={styles.detailRow}>
                    <Ionicons name="location-outline" size={13} color={COLORS.textSecondary} />
                    <Text style={styles.detailText}>{item.room}</Text>
                  </View>
                )}
                {Boolean(item.lecturer) && (
                  <View style={styles.detailRow}>
                    <Ionicons name="person-outline" size={13} color={COLORS.textSecondary} />
                    <Text style={styles.detailText}>{item.lecturer}</Text>
                  </View>
                )}
                {Boolean(item.notes) && (
                  <Text style={styles.notesText}>"{item.notes}"</Text>
                )}
              </View>

              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => handleOpenEdit(item)}
                >
                  <Ionicons name="create-outline" size={16} color={COLORS.primary} />
                  <Text style={styles.actionBtnText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => handleDelete(item)}
                >
                  <Ionicons name="trash-outline" size={16} color={COLORS.danger} />
                  <Text style={[styles.actionBtnText, { color: COLORS.danger }]}>Hapus</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add / Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editingItem ? 'Edit Jadwal Kuliah' : 'Tambah Jadwal Kuliah'}
            </Text>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              <Text style={styles.fieldLabel}>Judul Agenda / Kelas *</Text>
              <TextInput
                style={styles.input}
                value={formData.title}
                onChangeText={(v) => setFormData({ ...formData, title: v })}
                placeholder="Contoh: Kuliah Teori Deep Learning"
              />

              <Text style={styles.fieldLabel}>Mata Kuliah *</Text>
              <TextInput
                style={styles.input}
                value={formData.subject}
                onChangeText={(v) => setFormData({ ...formData, subject: v })}
                placeholder="Contoh: Deep Learning"
              />

              <Text style={styles.fieldLabel}>Hari *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.modalDayRow}>
                {DAYS.filter((d) => d !== 'ALL').map((day) => (
                  <TouchableOpacity
                    key={day}
                    style={[styles.modalDayChip, formData.day_of_week === day && styles.modalDayChipActive]}
                    onPress={() => setFormData({ ...formData, day_of_week: day })}
                  >
                    <Text style={[styles.modalDayText, formData.day_of_week === day && styles.modalDayTextActive]}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.rowInputs}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Jam Mulai</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.start_time}
                    onChangeText={(v) => setFormData({ ...formData, start_time: v })}
                    placeholder="08:00"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Jam Selesai</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.end_time}
                    onChangeText={(v) => setFormData({ ...formData, end_time: v })}
                    placeholder="10:00"
                  />
                </View>
              </View>

              <Text style={styles.fieldLabel}>Ruangan / Tautan</Text>
              <TextInput
                style={styles.input}
                value={formData.room}
                onChangeText={(v) => setFormData({ ...formData, room: v })}
                placeholder="Lab AI / Gedung F R.402"
              />

              <Text style={styles.fieldLabel}>Dosen Pengampu</Text>
              <TextInput
                style={styles.input}
                value={formData.lecturer}
                onChangeText={(v) => setFormData({ ...formData, lecturer: v })}
                placeholder="Nama dosen"
              />

              <Text style={styles.fieldLabel}>Catatan</Text>
              <TextInput
                style={[styles.input, { height: 60 }]}
                multiline
                value={formData.notes}
                onChangeText={(v) => setFormData({ ...formData, notes: v })}
                placeholder="Persiapan materi atau perlengkapan..."
              />
            </ScrollView>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSubmit}>
                <Text style={styles.modalSaveText}>
                  {editingItem ? 'Simpan' : 'Tambah'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  addBtnHeader: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  daysWrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 10,
  },
  daysScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  dayPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  dayPillActive: {
    backgroundColor: COLORS.primary,
  },
  dayPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  dayPillTextActive: {
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 12,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#EEF2FF',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  infoBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  infoBannerSub: {
    fontSize: 11,
    color: '#4338CA',
    marginTop: 2,
  },
  loadingWrapper: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: '#64748B',
  },
  emptyCard: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 10,
  },
  emptyText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  dayBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 3,
  },
  subjectText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 8,
  },
  cardDetails: {
    gap: 4,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 11,
    color: '#475569',
  },
  notesText: {
    fontSize: 11,
    fontStyle: 'italic',
    color: '#64748B',
    backgroundColor: '#F8FAFC',
    padding: 6,
    borderRadius: 6,
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0F172A',
  },
  modalDayRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  modalDayChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    marginRight: 6,
  },
  modalDayChipActive: {
    backgroundColor: COLORS.primary,
  },
  modalDayText: {
    fontSize: 11,
    color: '#475569',
  },
  modalDayTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 10,
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 16,
  },
  modalCancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  modalCancelText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  modalSaveBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 10,
  },
  modalSaveText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
