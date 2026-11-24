import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { COURSES_DATA } from '../constants/coursesData';
import { COLORS, SHADOWS } from '../constants/theme';
import HeaderBar from '../components/HeaderBar';
import StatCard from '../components/StatCard';
import TaskCard from '../components/TaskCard';
import ModalTaskForm from '../components/ModalTaskForm';
import ConfirmModal from '../components/ConfirmModal';

export default function DashboardScreen({ navigation }) {
  const { currentUser, isAdmin } = useAuth();
  const {
    tasks,
    loading,
    stats,
    fetchTasks,
    createTask,
    updateTask,
    toggleTaskStatus,
    deleteTask,
  } = useTasks();

  const [modalVisible, setModalVisible] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [taskToDeleteId, setTaskToDeleteId] = useState(null);

  const handleEdit = (task) => {
    setTaskToEdit(task);
    setModalVisible(true);
  };

  const handleDeletePrompt = (id) => {
    setTaskToDeleteId(id);
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (taskToDeleteId) {
      await deleteTask(taskToDeleteId);
      setDeleteModalVisible(false);
      setTaskToDeleteId(null);
    }
  };

  const handleFormSubmit = async (payload) => {
    if (taskToEdit) {
      await updateTask(taskToEdit.id, payload);
    } else {
      await createTask(payload);
    }
  };

  // Day of week streak simulation
  const weekDays = [
    { day: 'Sen', active: true },
    { day: 'Sel', active: true },
    { day: 'Rab', active: true },
    { day: 'Kam', active: true },
    { day: 'Jum', active: true },
    { day: 'Sab', active: false },
    { day: 'Min', active: false },
  ];

  // Today's classes preview (Senin & Rabu)
  const todayClasses = COURSES_DATA.slice(0, 2);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <HeaderBar
        title={`Halo, ${currentUser?.name || currentUser?.username}!`}
        subtitle={isAdmin ? 'Panel Mentor & Evaluasi Akademik' : 'Dashboard Jadwal & Progres Belajar'}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchTasks}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Banner Motivasi & Role Info */}
        <View style={[styles.welcomeBanner, SHADOWS.sm]}>
          <View style={styles.bannerIcon}>
            <Ionicons name="sparkles" size={20} color={COLORS.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>
              {isAdmin ? 'Mode Mentor / Pembimbing' : 'Fokus & Konsistensi Belajar'}
            </Text>
            <Text style={styles.bannerText}>
              {isAdmin
                ? 'Pantau progres penugasan mahasiswa dan evaluasi pemahaman kurikulum industri.'
                : 'Pertahankan ritme belajar harian untuk mencapai target kompetensi & IPK impian.'}
            </Text>
          </View>
        </View>

        {/* Stat Cards Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Tugas"
            value={stats.total}
            icon="albums-outline"
            color={COLORS.primary}
            subtitle="Agenda terdaftar"
          />
          <StatCard
            title="Dikerjakan"
            value={stats.inProgress}
            icon="time-outline"
            color={COLORS.accentBlue}
            subtitle="Sedang berjalan"
          />
          <StatCard
            title="Tuntas"
            value={stats.completed}
            icon="checkmark-done-circle-outline"
            color={COLORS.success}
            subtitle={`${stats.rate}% rasio`}
          />
        </View>

        {/* Streak Belajar Harian */}
        <View style={[styles.sectionCard, SHADOWS.sm]}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Konsistensi Belajar Harian</Text>
              <Text style={styles.sectionSubtitle}>Streak 5 Hari Berturut-turut</Text>
            </View>
            <View style={styles.streakBadge}>
              <Text style={styles.streakBadgeText}>🔥 Aktif</Text>
            </View>
          </View>

          <View style={styles.streakRow}>
            {weekDays.map((item, idx) => (
              <View
                key={idx}
                style={[
                  styles.streakDot,
                  item.active ? styles.streakDotActive : styles.streakDotInactive,
                ]}
              >
                <Text
                  style={[
                    styles.streakDayText,
                    item.active && { color: COLORS.textInverse, fontWeight: '700' },
                  ]}
                >
                  {item.day}
                </Text>
                {item.active ? (
                  <Ionicons name="checkmark" size={14} color={COLORS.textInverse} />
                ) : (
                  <View style={styles.inactiveCircle} />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Action Button: Tambah Tugas Cepat */}
        <TouchableOpacity
          style={[styles.addQuickBtn, SHADOWS.sm]}
          onPress={() => {
            setTaskToEdit(null);
            setModalVisible(true);
          }}
          activeOpacity={0.8}
        >
          <View style={styles.addIconCircle}>
            <Ionicons name="add" size={20} color={COLORS.textInverse} />
          </View>
          <Text style={styles.addQuickBtnText}>Jadwalkan Tugas Belajar Baru</Text>
          <Ionicons name="chevron-forward" size={18} color={COLORS.primary} />
        </TouchableOpacity>

        {/* Tugas Mendekati Deadline */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tugas Mendekati Tenggat</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Tasks')}>
              <Text style={styles.seeAllText}>Lihat Semua ({tasks.length}) →</Text>
            </TouchableOpacity>
          </View>

          {stats.upcomingTasks.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="checkmark-circle-outline" size={32} color={COLORS.success} />
              <Text style={styles.emptyTitle}>Semua Tugas Tuntas!</Text>
              <Text style={styles.emptyText}>
                Tidak ada tugas yang menunggu. Luangkan waktu untuk mengulas materi atau istirahat.
              </Text>
            </View>
          ) : (
            stats.upcomingTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggleStatus={toggleTaskStatus}
                onEdit={handleEdit}
                onDelete={handleDeletePrompt}
                isAdmin={isAdmin}
              />
            ))
          )}
        </View>

        {/* Jadwal Kuliah Hari Ini */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Jadwal Perkuliahan</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Schedule')}>
              <Text style={styles.seeAllText}>Jadwal Lengkap →</Text>
            </TouchableOpacity>
          </View>

          {todayClasses.map((c) => (
            <View key={c.id} style={[styles.classCard, SHADOWS.sm]}>
              <View style={styles.classTimeBox}>
                <Ionicons name="time" size={16} color={COLORS.primary} />
                <Text style={styles.classTimeText}>{c.schedule.split(' (')[0]}</Text>
              </View>
              <Text style={styles.className}>{c.title}</Text>
              <View style={styles.classMetaRow}>
                <Text style={styles.classMetaText}>📍 {c.room}</Text>
                <Text style={styles.classMetaText}>👨‍🏫 {c.lecturer}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Modal Add/Edit Task */}
      <ModalTaskForm
        visible={modalVisible}
        taskToEdit={taskToEdit}
        onClose={() => setModalVisible(false)}
        onSubmit={handleFormSubmit}
      />

      {/* Modal Delete Confirmation */}
      <ConfirmModal
        visible={deleteModalVisible}
        title="Hapus Agenda Tugas"
        message="Apakah Anda yakin ingin menghapus tugas ini? Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        isDanger={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 40,
  },
  welcomeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  bannerIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textMain,
    marginBottom: 2,
  },
  bannerText: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 17,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  sectionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  streakBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  streakBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  streakRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  streakDot: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    marginHorizontal: 3,
    borderRadius: 12,
    gap: 4,
  },
  streakDotActive: {
    backgroundColor: COLORS.primary,
  },
  streakDotInactive: {
    backgroundColor: COLORS.surfaceSubtle,
  },
  streakDayText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  inactiveCircle: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.border,
    marginVertical: 4,
  },
  addQuickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: COLORS.primaryBorder,
  },
  addIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  addQuickBtnText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  emptyCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMain,
    marginTop: 8,
  },
  emptyText: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 240,
    lineHeight: 16,
  },
  classCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  classTimeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  classTimeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  className: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMain,
    marginBottom: 4,
  },
  classMetaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  classMetaText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
});

