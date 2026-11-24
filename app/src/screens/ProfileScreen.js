import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { api } from '../services/api';
import { COLORS, SHADOWS } from '../constants/theme';
import HeaderBar from '../components/HeaderBar';
import ConfirmModal from '../components/ConfirmModal';

export default function ProfileScreen() {
  const { currentUser, isAdmin, logout, apiUrl, updateApiUrl } = useAuth();
  const { stats } = useTasks();

  const [ipInput, setIpInput] = useState(apiUrl);
  const [editingIp, setEditingIp] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  // Profile Edit Modal State
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [nameInput, setNameInput] = useState(currentUser?.name || '');
  const [bioInput, setBioInput] = useState(currentUser?.bio || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password Modal State
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  // Admin Section State
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminStats, setAdminStats] = useState(null);
  const [loadingAdmin, setLoadingAdmin] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

  const loadAdminData = async () => {
    try {
      setLoadingAdmin(true);
      const [uRes, sRes] = await Promise.all([
        api.getAdminUsers(),
        api.getAdminStats(),
      ]);
      setAdminUsers(uRes.users || []);
      setAdminStats(sRes.stats || null);
    } catch (e) {
      console.warn('Gagal memuat data admin mobile:', e.message);
    } finally {
      setLoadingAdmin(false);
    }
  };

  const initial = (currentUser?.name || currentUser?.username || 'U')
    .charAt(0)
    .toUpperCase();

  const handleSaveIp = async () => {
    if (ipInput.trim()) {
      await updateApiUrl(ipInput.trim());
      setEditingIp(false);
      Alert.alert('Sukses', `URL Backend diperbarui ke:\n${ipInput.trim()}`);
    }
  };

  const handleSaveProfile = async () => {
    if (!nameInput.trim()) {
      Alert.alert('Peringatan', 'Nama lengkap tidak boleh kosong.');
      return;
    }

    setSavingProfile(true);
    try {
      const res = await api.updateProfile({
        name: nameInput.trim(),
        bio: bioInput.trim(),
      });
      setProfileModalVisible(false);
      Alert.alert('Sukses', res.message || 'Profil berhasil diperbarui!');
    } catch (err) {
      Alert.alert('Gagal', err.message || 'Gagal memperbarui profil.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePassword = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert('Peringatan', 'Semua kolom kata sandi wajib diisi.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Peringatan', 'Password baru minimal 6 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Peringatan', 'Konfirmasi password baru tidak cocok.');
      return;
    }

    setSavingPassword(true);
    try {
      const res = await api.changePassword(currentPassword, newPassword);
      setPasswordModalVisible(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Sukses', res.message || 'Password berhasil diperbarui!');
    } catch (err) {
      Alert.alert('Gagal', err.message || 'Gagal mengganti password.');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleConfirmLogout = async () => {
    setLogoutModalVisible(false);
    await logout();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <HeaderBar
        title="Profil Pengguna"
        subtitle="Manajemen akun, keamanan & konfigurasi"
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={[styles.profileCard, SHADOWS.sm]}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>{initial}</Text>
          </View>
          <Text style={styles.userName}>{currentUser?.name || currentUser?.username}</Text>
          <Text style={styles.userHandle}>@{currentUser?.username}</Text>

          <View style={[styles.roleBadgeLarge, isAdmin && styles.adminRoleBadgeLarge]}>
            <Ionicons
              name={isAdmin ? 'shield-checkmark' : 'school'}
              size={14}
              color={isAdmin ? '#B45309' : COLORS.primary}
            />
            <Text style={[styles.roleBadgeLargeText, isAdmin && styles.adminRoleBadgeLargeText]}>
              {isAdmin ? 'Mentor / Pembimbing' : 'Mahasiswa / Siswa'}
            </Text>
          </View>

          {Boolean(currentUser?.bio) && (
            <Text style={styles.bioText}>"{currentUser.bio}"</Text>
          )}

          {/* Quick Stats Grid */}
          <View style={styles.statsRow}>
            <View style={styles.statCol}>
              <Text style={styles.statNum}>{stats.total}</Text>
              <Text style={styles.statLbl}>Tugas Terdaftar</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statNum}>{stats.completed}</Text>
              <Text style={styles.statLbl}>Tuntas</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statNum}>{stats.rate}%</Text>
              <Text style={styles.statLbl}>Rasio Sukses</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons: Edit Profile & Password */}
        <View style={styles.actionBtnRow}>
          <TouchableOpacity
            style={[styles.btnOutline, SHADOWS.xs]}
            onPress={() => {
              setNameInput(currentUser?.name || '');
              setBioInput(currentUser?.bio || '');
              setProfileModalVisible(true);
            }}
          >
            <Ionicons name="create-outline" size={16} color={COLORS.primary} />
            <Text style={styles.btnOutlineText}>Edit Profil</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btnOutline, SHADOWS.xs]}
            onPress={() => setPasswordModalVisible(true)}
          >
            <Ionicons name="key-outline" size={16} color={COLORS.primary} />
            <Text style={styles.btnOutlineText}>Ubah Password</Text>
          </TouchableOpacity>
        </View>

        {/* Mentor / Admin Section */}
        {isAdmin && (
          <View style={[styles.card, SHADOWS.sm]}>
            <View style={styles.adminCardHeader}>
              <View style={styles.adminIconWrapper}>
                <Ionicons name="shield-checkmark" size={16} color="#B45309" />
              </View>
              <Text style={styles.cardTitle}>Panel Kontrol Mentor</Text>
            </View>

            {loadingAdmin ? (
              <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 10 }} />
            ) : (
              <>
                {adminStats && (
                  <View style={styles.adminStatsRow}>
                    <View style={styles.adminStatItem}>
                      <Text style={styles.adminStatNum}>{adminStats.totalUsers}</Text>
                      <Text style={styles.adminStatLbl}>Pengguna</Text>
                    </View>
                    <View style={styles.adminStatItem}>
                      <Text style={styles.adminStatNum}>{adminStats.activeStudents}</Text>
                      <Text style={styles.adminStatLbl}>Siswa Aktif</Text>
                    </View>
                    <View style={styles.adminStatItem}>
                      <Text style={styles.adminStatNum}>{adminStats.totalTasks}</Text>
                      <Text style={styles.adminStatLbl}>Total Tugas</Text>
                    </View>
                    <View style={styles.adminStatItem}>
                      <Text style={[styles.adminStatNum, { color: COLORS.success }]}>{adminStats.completionRate}%</Text>
                      <Text style={styles.adminStatLbl}>Kelulusan</Text>
                    </View>
                  </View>
                )}

                <Text style={styles.subListHeader}>Daftar Mahasiswa ({adminUsers.length}):</Text>
                {adminUsers.slice(0, 5).map((u) => (
                  <View key={u.id} style={styles.adminUserRow}>
                    <View style={styles.userDot} />
                    <Text style={styles.adminUserName}>{u.name}</Text>
                    <Text style={styles.adminUserTasks}>{u.total_tasks || 0} Tugas</Text>
                  </View>
                ))}
              </>
            )}
          </View>
        )}

        {/* Network & Backend Configuration */}
        <View style={[styles.card, SHADOWS.sm]}>
          <View style={styles.networkHeader}>
            <Ionicons name="wifi-outline" size={18} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Koneksi API Backend</Text>
          </View>
          <Text style={styles.cardDesc}>
            IP Host ini digunakan oleh Expo Go untuk berkomunikasi dengan server backend laptop Anda.
          </Text>

          {editingIp ? (
            <View style={styles.ipEditContainer}>
              <TextInput
                style={styles.ipInput}
                value={ipInput}
                onChangeText={setIpInput}
                placeholder="http://192.168.x.x:3000/api"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <View style={styles.ipBtnRow}>
                <TouchableOpacity
                  style={styles.btnCancelIp}
                  onPress={() => {
                    setIpInput(apiUrl);
                    setEditingIp(false);
                  }}
                >
                  <Text style={styles.btnCancelIpText}>Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnSaveIp} onPress={handleSaveIp}>
                  <Text style={styles.btnSaveIpText}>Simpan</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.ipDisplayRow}>
              <Text style={styles.ipText} numberOfLines={1}>
                {apiUrl}
              </Text>
              <TouchableOpacity
                style={styles.btnEditIp}
                onPress={() => setEditingIp(true)}
              >
                <Ionicons name="pencil" size={14} color={COLORS.primary} />
                <Text style={styles.btnEditIpText}>Ubah</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutBtn, SHADOWS.xs]}
          onPress={() => setLogoutModalVisible(true)}
        >
          <Ionicons name="log-out-outline" size={18} color={COLORS.danger} />
          <Text style={styles.logoutBtnText}>Keluar dari Akun</Text>
        </TouchableOpacity>

        {/* App Info Footer */}
        <Text style={styles.appFooterText}>
          Study Planner Mobile App • v2.0.0 (Expo SDK 58 & StudyMate AI)
        </Text>
      </ScrollView>

      {/* Profile Edit Modal */}
      <Modal visible={profileModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalBoxTitle}>Perbarui Profil</Text>

            <Text style={styles.inputLbl}>Nama Lengkap *</Text>
            <TextInput
              style={styles.formInput}
              value={nameInput}
              onChangeText={setNameInput}
              placeholder="Nama lengkap"
            />

            <Text style={styles.inputLbl}>Bio / Deskripsi Studi</Text>
            <TextInput
              style={[styles.formInput, { height: 70 }]}
              multiline
              value={bioInput}
              onChangeText={setBioInput}
              placeholder="Ceritakan target studimu..."
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setProfileModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSubmitBtn}
                disabled={savingProfile}
                onPress={handleSaveProfile}
              >
                <Text style={styles.modalSubmitText}>
                  {savingProfile ? 'Menyimpan...' : 'Simpan'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Password Modal */}
      <Modal visible={passwordModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalBoxTitle}>Ganti Kata Sandi</Text>

            <Text style={styles.inputLbl}>Password Saat Ini *</Text>
            <TextInput
              style={styles.formInput}
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Password saat ini"
            />

            <Text style={styles.inputLbl}>Password Baru (Min 6 karakter) *</Text>
            <TextInput
              style={styles.formInput}
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Password baru"
            />

            <Text style={styles.inputLbl}>Konfirmasi Password Baru *</Text>
            <TextInput
              style={styles.formInput}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Ketik ulang password baru"
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setPasswordModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSubmitBtn}
                disabled={savingPassword}
                onPress={handleSavePassword}
              >
                <Text style={styles.modalSubmitText}>
                  {savingPassword ? 'Menyimpan...' : 'Ubah Password'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Logout Modal */}
      <ConfirmModal
        visible={logoutModalVisible}
        title="Keluar dari Akun"
        message="Apakah Anda yakin ingin keluar? Sesi autentikasi akan dihapus dari perangkat ini."
        confirmLabel="Ya, Keluar"
        cancelLabel="Batal"
        isDanger={true}
        onConfirm={handleConfirmLogout}
        onCancel={() => setLogoutModalVisible(false)}
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
  profileCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarLargeText: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textInverse,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  userHandle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
    marginBottom: 8,
  },
  roleBadgeLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 12,
  },
  roleBadgeLargeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  adminRoleBadgeLarge: {
    backgroundColor: '#FEF3C7',
  },
  adminRoleBadgeLargeText: {
    color: '#B45309',
  },
  bioText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#64748B',
    textAlign: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    justifyContent: 'space-around',
  },
  statCol: {
    alignItems: 'center',
  },
  statNum: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  statLbl: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: COLORS.borderLight,
  },
  actionBtnRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  btnOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    paddingVertical: 10,
    borderRadius: 14,
  },
  btnOutlineText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  adminCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  adminIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  cardDesc: {
    fontSize: 11,
    color: COLORS.textMuted,
    lineHeight: 16,
    marginBottom: 12,
  },
  adminStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  adminStatItem: {
    alignItems: 'center',
  },
  adminStatNum: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  adminStatLbl: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 1,
  },
  subListHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
  },
  adminUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  userDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginRight: 8,
  },
  adminUserName: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },
  adminUserTasks: {
    fontSize: 11,
    color: '#64748B',
  },
  networkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  ipDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  ipText: {
    flex: 1,
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: COLORS.textMain,
    marginRight: 8,
  },
  btnEditIp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  btnEditIpText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  ipEditContainer: {
    gap: 10,
  },
  ipInput: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: COLORS.textMain,
  },
  ipBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  btnCancelIp: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  btnCancelIpText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  btnSaveIp: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  btnSaveIpText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 8,
  },
  logoutBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.danger,
  },
  appFooterText: {
    textAlign: 'center',
    fontSize: 10,
    color: COLORS.textLight,
    marginTop: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
  },
  modalBoxTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  inputLbl: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 4,
    marginTop: 8,
  },
  formInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0F172A',
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 18,
  },
  modalCancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  modalCancelText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  modalSubmitBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  modalSubmitText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
