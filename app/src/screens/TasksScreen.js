import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { COLORS, SHADOWS } from '../constants/theme';
import HeaderBar from '../components/HeaderBar';
import TaskCard from '../components/TaskCard';
import ModalTaskForm from '../components/ModalTaskForm';
import ConfirmModal from '../components/ConfirmModal';

export default function TasksScreen() {
  const { isAdmin } = useAuth();
  const {
    tasks,
    loading,
    fetchTasks,
    createTask,
    updateTask,
    toggleTaskStatus,
    deleteTask,
  } = useTasks();

  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'pending' | 'in_progress' | 'completed'
  const [priorityFilter, setPriorityFilter] = useState('ALL'); // 'ALL' | 'High' | 'Medium' | 'Low'
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [modalVisible, setModalVisible] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [taskToDeleteId, setTaskToDeleteId] = useState(null);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Status Filter
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'active') {
          if (t.status === 'completed') return false;
        } else if (t.status !== statusFilter) {
          return false;
        }
      }

      // Priority Filter
      if (priorityFilter !== 'ALL' && t.priority !== priorityFilter) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (t.title || '').toLowerCase().includes(q);
        const matchSubject = (t.subject || '').toLowerCase().includes(q);
        const matchUser = (t.user_name || '').toLowerCase().includes(q);
        return matchTitle || matchSubject || matchUser;
      }

      return true;
    });
  }, [tasks, statusFilter, priorityFilter, searchQuery]);

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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <HeaderBar
        title="Pusat Tugas"
        subtitle={`Total ${tasks.length} agenda perkuliahan`}
      />

      {/* Search Input Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color={COLORS.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari tugas, mata kuliah, atau topik..."
          placeholderTextColor={COLORS.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Filter Tabs: Status */}
      <View style={styles.filterTabsRow}>
        {[
          { id: 'ALL', label: 'Semua' },
          { id: 'active', label: 'Aktif' },
          { id: 'in_progress', label: 'Progres' },
          { id: 'completed', label: 'Tuntas' },
        ].map((tab) => {
          const selected = statusFilter === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.filterTab, selected && styles.filterTabActive]}
              onPress={() => setStatusFilter(tab.id)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  selected && styles.filterTabTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Sub-Filters: Priority */}
      <View style={styles.priorityTabsRow}>
        <Text style={styles.priorityLabel}>Prioritas:</Text>
        {[
          { id: 'ALL', label: 'Semua' },
          { id: 'High', label: '🔥 Tinggi' },
          { id: 'Medium', label: '⚡ Sedang' },
          { id: 'Low', label: '🌱 Rendah' },
        ].map((p) => {
          const selected = priorityFilter === p.id;
          return (
            <TouchableOpacity
              key={p.id}
              style={[styles.priorityPill, selected && styles.priorityPillActive]}
              onPress={() => setPriorityFilter(p.id)}
            >
              <Text
                style={[
                  styles.priorityPillText,
                  selected && styles.priorityPillTextActive,
                ]}
              >
                {p.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Task List */}
      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchTasks}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onToggleStatus={toggleTaskStatus}
            onEdit={handleEdit}
            onDelete={handleDeletePrompt}
            isAdmin={isAdmin}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={44} color={COLORS.textLight} />
            <Text style={styles.emptyTitle}>Tidak Ada Tugas Ditemukan</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? 'Tidak ada agenda yang cocok dengan pencarian Anda.'
                : 'Belum ada tugas dalam kategori ini. Ketuk tombol + untuk membuat tugas baru.'}
            </Text>
            <TouchableOpacity
              style={styles.emptyAddBtn}
              onPress={() => {
                setTaskToEdit(null);
                setModalVisible(true);
              }}
            >
              <Text style={styles.emptyAddBtnText}>+ Tambah Tugas Sekarang</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Floating Action Button (+ Tambah Tugas) */}
      <TouchableOpacity
        style={[styles.fab, SHADOWS.lg]}
        onPress={() => {
          setTaskToEdit(null);
          setModalVisible(true);
        }}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color={COLORS.textInverse} />
      </TouchableOpacity>

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
        message="Apakah Anda yakin ingin menghapus tugas ini? Data yang terhapus tidak dapat dikembalikan."
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    marginHorizontal: 18,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textMain,
  },
  filterTabsRow: {
    flexDirection: 'row',
    marginHorizontal: 18,
    marginVertical: 6,
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 12,
    padding: 3,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 9,
  },
  filterTabActive: {
    backgroundColor: COLORS.card,
    ...SHADOWS.sm,
  },
  filterTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  filterTabTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  priorityTabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginBottom: 8,
    gap: 6,
  },
  priorityLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginRight: 2,
  },
  priorityPill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  priorityPillActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  priorityPillText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  priorityPillTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 18,
    paddingTop: 4,
    paddingBottom: 90,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textMain,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    maxWidth: 260,
  },
  emptyAddBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 16,
  },
  emptyAddBtnText: {
    color: COLORS.textInverse,
    fontSize: 12,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

