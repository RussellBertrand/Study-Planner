import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/theme';

export default function HeaderBar({ title, subtitle, rightElement }) {
  const { currentUser, isAdmin } = useAuth();

  const initial = (currentUser?.name || currentUser?.username || 'U')
    .charAt(0)
    .toUpperCase();

  return (
    <View style={styles.container}>
      <View style={styles.titleArea}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      <View style={styles.rightArea}>
        {rightElement || (
          <View style={styles.userProfile}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
            <View style={[styles.roleBadge, isAdmin && styles.adminRoleBadge]}>
              <Text style={[styles.roleText, isAdmin && styles.adminRoleText]}>
                {isAdmin ? 'Mentor' : 'Siswa'}
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  titleArea: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textMain,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  rightArea: {
    marginLeft: 12,
  },
  userProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: COLORS.textInverse,
    fontWeight: '800',
    fontSize: 15,
  },
  roleBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
  },
  adminRoleBadge: {
    backgroundColor: '#FEF3C7',
  },
  adminRoleText: {
    color: '#B45309',
  },
});

