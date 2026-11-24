import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/theme';

export default function StatCard({ title, value, icon, color, subtitle }) {
  return (
    <View style={[styles.card, SHADOWS.sm]}>
      <View style={styles.header}>
        <View style={[styles.iconWrapper, { backgroundColor: `${color}15` }]}>
          <Ionicons name={icon} size={18} color={color} />
        </View>
        <Text style={[styles.value, { color }]}>{value}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 20,
    fontWeight: '800',
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMain,
  },
  subtitle: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});

