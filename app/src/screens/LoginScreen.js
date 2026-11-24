import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { COLORS, SHADOWS } from '../constants/theme';

export default function LoginScreen() {
  const { login, register, apiUrl, updateApiUrl } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('user'); // 'user' (Siswa) | 'admin' (Mentor)
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // IP Settings Toggle
  const [showIpConfig, setShowIpConfig] = useState(false);
  const [tempIp, setTempIp] = useState(apiUrl);

  const handleSubmit = async () => {
    if (!username.trim()) {
      setErrorMessage('Username wajib diisi.');
      return;
    }
    if (!password) {
      setErrorMessage('Password wajib diisi.');
      return;
    }

    setErrorMessage('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (!name.trim()) {
          setErrorMessage('Nama lengkap wajib diisi untuk pendaftaran.');
          setLoading(false);
          return;
        }
        await register(username.trim(), password, name.trim(), role);
      } else {
        await login(username.trim(), password);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Terjadi kesalahan saat masuk.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoUser, demoPass) => {
    setUsername(demoUser);
    setPassword(demoPass);
    setErrorMessage('');
    setLoading(true);
    try {
      await login(demoUser, demoPass);
    } catch (err) {
      setErrorMessage(err.message || 'Gagal masuk akun demo.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveIp = async () => {
    if (tempIp.trim()) {
      await updateApiUrl(tempIp.trim());
      Alert.alert('Sukses', `URL Backend diperbarui ke:\n${tempIp.trim()}`);
      setShowIpConfig(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Brand Header */}
          <View style={styles.brandContainer}>
            <View style={styles.logoBox}>
              <Ionicons name="school" size={28} color={COLORS.textInverse} />
            </View>
            <Text style={styles.brandTitle}>
              Belajar<Text style={{ color: COLORS.primary }}>Aje</Text>
            </Text>
            <Text style={styles.brandSubtitle}>
              Platform Study Planner & Manajemen Akademik Mobile
            </Text>
          </View>

          {/* Form Card */}
          <View style={[styles.card, SHADOWS.md]}>
            {/* Toggle Switcher */}
            <View style={styles.switcher}>
              <TouchableOpacity
                style={[styles.switchBtn, !isSignUp && styles.switchBtnActive]}
                onPress={() => {
                  setIsSignUp(false);
                  setErrorMessage('');
                }}
              >
                <Text style={[styles.switchText, !isSignUp && styles.switchTextActive]}>
                  Masuk Akun
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.switchBtn, isSignUp && styles.switchBtnActive]}
                onPress={() => {
                  setIsSignUp(true);
                  setErrorMessage('');
                }}
              >
                <Text style={[styles.switchText, isSignUp && styles.switchTextActive]}>
                  Daftar Baru
                </Text>
              </TouchableOpacity>
            </View>

            {/* Error Message */}
            {errorMessage ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color={COLORS.danger} />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Registration Fields */}
            {isSignUp ? (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Nama Lengkap</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Contoh: Budi Santoso"
                    placeholderTextColor={COLORS.textLight}
                    value={name}
                    onChangeText={setName}
                    editable={!loading}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Peran Akun</Text>
                  <View style={styles.rolePickerRow}>
                    <TouchableOpacity
                      style={[
                        styles.roleOption,
                        role === 'user' && styles.roleOptionActive,
                      ]}
                      onPress={() => setRole('user')}
                    >
                      <Text
                        style={[
                          styles.roleOptionText,
                          role === 'user' && styles.roleOptionTextActive,
                        ]}
                      >
                        🎓 Mahasiswa (User)
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.roleOption,
                        role === 'admin' && styles.roleOptionActive,
                      ]}
                      onPress={() => setRole('admin')}
                    >
                      <Text
                        style={[
                          styles.roleOptionText,
                          role === 'admin' && styles.roleOptionTextActive,
                        ]}
                      >
                        👨‍🏫 Mentor (Admin)
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            ) : null}

            {/* Username Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                placeholder="Masukkan username Anda"
                placeholderTextColor={COLORS.textLight}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={[styles.input, { flex: 1, borderWidth: 0 }]}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.textLight}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={COLORS.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.btnDisabled]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.textInverse} size="small" />
              ) : (
                <Text style={styles.submitBtnText}>
                  {isSignUp ? 'Daftar Sekarang →' : 'Masuk ke Dashboard →'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Quick Demo 1-Click Buttons */}
            {!isSignUp ? (
              <View style={styles.demoSection}>
                <Text style={styles.demoTitle}>Akun Uji Coba Cepat (1-Klik):</Text>
                <View style={styles.demoRow}>
                  <TouchableOpacity
                    style={styles.demoBtn}
                    onPress={() => handleQuickDemo('siswa', 'siswa123')}
                    disabled={loading}
                  >
                    <Text style={styles.demoRole}>🎓 Akun Siswa</Text>
                    <Text style={styles.demoCreds}>siswa / siswa123</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.demoBtn}
                    onPress={() => handleQuickDemo('admin', 'admin123')}
                    disabled={loading}
                  >
                    <Text style={styles.demoRole}>👨‍🏫 Akun Mentor</Text>
                    <Text style={styles.demoCreds}>admin / admin123</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}
          </View>

          {/* IP Backend Quick Setting */}
          <View style={styles.ipConfigCard}>
            <TouchableOpacity
              style={styles.ipConfigHeader}
              onPress={() => {
                setTempIp(apiUrl);
                setShowIpConfig(!showIpConfig);
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="server-outline" size={14} color={COLORS.textMuted} />
                <Text style={styles.ipConfigLabel}>Koneksi API:</Text>
                <Text style={styles.ipConfigValue} numberOfLines={1}>
                  {apiUrl}
                </Text>
              </View>
              <Ionicons
                name={showIpConfig ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={COLORS.textMuted}
              />
            </TouchableOpacity>

            {showIpConfig ? (
              <View style={styles.ipConfigBody}>
                <Text style={styles.ipHint}>
                  Jika menggunakan HP fisik, pastikan IP laptop Anda benar (contoh: http://192.168.x.x:3000/api)
                </Text>
                <TextInput
                  style={styles.ipInput}
                  value={tempIp}
                  onChangeText={setTempIp}
                  placeholder="http://192.168.1.100:3000/api"
                  placeholderTextColor={COLORS.textLight}
                  autoCapitalize="none"
                />
                <TouchableOpacity style={styles.ipSaveBtn} onPress={handleSaveIp}>
                  <Text style={styles.ipSaveText}>Terapkan URL API</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 10,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  logoBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.textMain,
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 280,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  switcher: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 12,
    padding: 4,
    marginBottom: 18,
  },
  switchBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  switchBtnActive: {
    backgroundColor: COLORS.card,
    ...SHADOWS.sm,
  },
  switchText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  switchTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 10,
    marginBottom: 14,
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
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMain,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.textMain,
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
  },
  eyeBtn: {
    paddingHorizontal: 14,
  },
  rolePickerRow: {
    flexDirection: 'row',
    gap: 8,
  },
  roleOption: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceSubtle,
    alignItems: 'center',
  },
  roleOptionActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  roleOptionText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  roleOptionTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: COLORS.textInverse,
    fontSize: 14,
    fontWeight: '700',
  },
  demoSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  demoTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 8,
    textAlign: 'center',
  },
  demoRow: {
    flexDirection: 'row',
    gap: 8,
  },
  demoBtn: {
    flex: 1,
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 10,
  },
  demoRole: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  demoCreds: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  ipConfigCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  ipConfigHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ipConfigLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  ipConfigValue: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600',
    maxWidth: 160,
  },
  ipConfigBody: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  ipHint: {
    fontSize: 10,
    color: COLORS.textMuted,
    lineHeight: 14,
    marginBottom: 8,
  },
  ipInput: {
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: COLORS.textMain,
    marginBottom: 8,
  },
  ipSaveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  ipSaveText: {
    color: COLORS.textInverse,
    fontSize: 11,
    fontWeight: '700',
  },
});

