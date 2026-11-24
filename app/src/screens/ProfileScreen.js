import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { COLORS, SHADOWS } from '../constants/theme';
import HeaderBar from '../components/HeaderBar';
import ConfirmModal from '../components/ConfirmModal';

export default function ProfileScreen() {
  const { currentUser, isAdmin, logout, apiUrl, updateApiUrl } = useAuth();
  const { stats } = useTasks();

  const [ipInput, setIpInput] = useState(apiUrl);
  const [editingIp, setEditingIp] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

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

  const handleConfirmLogout = async () => {
    setLogoutModalVisible(false);
    await logout();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <HeaderBar
        title="Profil Pengguna"
        subtitle="Manajemen akun & konfigurasi jaringan"
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

        {/* Info Akademik */}
        <View style={[styles.card, SHADOWS.sm]}>
          <Text style={styles.cardTitle}>Status Akademik</Text>
          <View style={styles.infoList}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Program Studi</Text>
              <Text style={styles.infoVal}>Teknik Informatika / Ilmu Komputer</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Semester</Text>
              <Text style={styles.infoVal}>Ganjil 2026 / 2027</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Status Keaktifan</Text>
              <Text style={[styles.infoVal, { color: COLORS.success }]}>● Aktif</Text>
            </View>
          </View>
        </View>

        {/* Backend Network Settings Card */}
        <View style={[styles.card, SHADOWS.sm]}>
          <View style={styles.cardHeaderWithBtn}>
            <Text style={styles.cardTitle}>Koneksi Server Backend</Text>
            <TouchableOpacity onPress={() => setEditingIp(!editingIp)}>
              <Text style={styles.editBtnText}>{editingIp ? 'Batal' : 'Ubah URL'}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.cardSubtitle}>
            Untuk Expo Go di HP fisik, gunakan IP lokal komputer (misal: http://192.168.x.x:3000/api)
          </Text>

          {editingIp ? (
            <View style={styles.ipEditBox}>
              <TextInput
                style={styles.ipInput}
                value={ipInput}
                onChangeText={setIpInput}
                placeholder="http://192.168.1.100:3000/api"
                autoCapitalize="none"
              />
              <TouchableOpacity style={styles.saveIpBtn} onPress={handleSaveIp}>
                <Text style={styles.saveIpBtnText}>Simpan & Hubungkan</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.ipDisplayBox}>
              <Ionicons name="link" size={16} color={COLORS.primary} />
              <Text style={styles.ipDisplayText} numberOfLines={1}>
                {apiUrl}
              </Text>
            </View>
          )}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => setLogoutModalVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={18} color={COLORS.danger} />
          <Text style={styles.logoutBtnText}>Keluar dari Akun</Text>
        </TouchableOpacity>

        {/* App Info Footer */}
        <Text style={styles.appFooterText}>
          Study Planner Mobile App • v1.0.0 (Expo SDK 58)
        </Text>
      </ScrollView>

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
    marginBottom: 10,
  },
  roleBadgeLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 18,
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
    height: 28,
    backgroundColor: COLORS.borderLight,
    alignSelf: 'center',
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeaderWithBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  cardSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    lineHeight: 16,
    marginVertical: 6,
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  infoList: {
    marginTop: 6,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  infoVal: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMain,
  },
  ipDisplayBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 12,
    padding: 12,
    marginTop: 6,
  },
  ipDisplayText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    flex: 1,
  },
  ipEditBox: {
    marginTop: 8,
    gap: 8,
  },
  ipInput: {
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: COLORS.textMain,
  },
  saveIpBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  saveIpBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textInverse,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 16,
    paddingVertical: 14,
    marginBottom: 20,
  },
  logoutBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.danger,
  },
  appFooterText: {
    textAlign: 'center',
    fontSize: 11,
    color: COLORS.textLight,
  },
});

