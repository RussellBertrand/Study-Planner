import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/theme';

export default function TaskCard({ task, onToggleStatus, onEdit, onDelete, isAdmin }) {
  const isCompleted = task.status === 'completed';
  const isInProgress = task.status === 'in_progress';

  // Priority Styles
  const priorityStyle =
    task.priority === 'High'
      ? { bg: COLORS.highPriorityBg, text: COLORS.highPriorityText, border: COLORS.highPriorityBorder }
      : task.priority === 'Medium'
      ? { bg: COLORS.medPriorityBg, text: COLORS.medPriorityText, border: COLORS.medPriorityBorder }
      : { bg: COLORS.lowPriorityBg, text: COLORS.lowPriorityText, border: COLORS.lowPriorityBorder };

  // Status Styles
  const statusLabel = isCompleted ? 'Tuntas' : isInProgress ? 'Dalam Pengerjaan' : 'Perlu Dikerjakan';
  const statusBg = isCompleted ? COLORS.completedBg : isInProgress ? COLORS.inProgressBg : COLORS.pendingBg;
  const statusColor = isCompleted ? COLORS.completedText : isInProgress ? COLORS.inProgressText : COLORS.pendingText;

  return (
    <View style={[styles.card, SHADOWS.sm, isCompleted && styles.completedCard]}>
      {/* Top Row: Badges & Actions */}
      <View style={styles.topRow}>
        <View style={styles.badgesWrapper}>
          <View style={[styles.badge, { backgroundColor: priorityStyle.bg, borderColor: priorityStyle.border }]}>
            <Text style={[styles.badgeText, { color: priorityStyle.text }]}>
              {task.priority === 'High' ? '🔥 Tinggi' : task.priority === 'Medium' ? '⚡ Sedang' : '🌱 Rendah'}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: statusBg }]}>
            <Text style={[styles.badgeText, { color: statusColor }]}>{statusLabel}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => onEdit(task)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="pencil-outline" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => onDelete(task.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="trash-outline" size={16} color={COLORS.danger} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Title & Subject */}
      <View style={styles.contentRow}>
        <TouchableOpacity
          style={[styles.checkbox, isCompleted && styles.checkboxCompleted]}
          onPress={() => onToggleStatus(task)}
          activeOpacity={0.7}
        >
          {isCompleted ? (
            <Ionicons name="checkmark" size={16} color={COLORS.card} />
          ) : isInProgress ? (
            <View style={styles.inProgressDot} />
          ) : null}
        </TouchableOpacity>

        <View style={styles.titleWrapper}>
          <Text
            style={[styles.title, isCompleted && styles.completedText]}
            numberOfLines={2}
          >
            {task.title}
          </Text>
          <View style={styles.metaRow}>
            <Ionicons name="book-outline" size={12} color={COLORS.textMuted} />
            <Text style={styles.subjectText} numberOfLines={1}>
              {task.subject || 'Umum'}
            </Text>
          </View>
        </View>
      </View>

      {/* Bottom Info: Deadline & Admin User Name */}
      <View style={styles.footerRow}>
        <View style={styles.deadlineWrapper}>
          <Ionicons
            name="calendar-outline"
            size={13}
            color={task.priority === 'High' && !isCompleted ? COLORS.danger : COLORS.textMuted}
          />
          <Text
            style={[
              styles.deadlineText,
              task.priority === 'High' && !isCompleted && { color: COLORS.danger, fontWeight: '600' },
            ]}
          >
            Tenggat: {task.deadline || 'Tanpa deadline'}
          </Text>
        </View>

        {isAdmin && task.user_name ? (
          <View style={styles.userBadge}>
            <Ionicons name="person-circle-outline" size={13} color={COLORS.primary} />
            <Text style={styles.userNameText} numberOfLines={1}>
              {task.user_name}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  completedCard: {
    opacity: 0.75,
    backgroundColor: '#F8FAFC',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  badgesWrapper: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    padding: 4,
    borderRadius: 6,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    backgroundColor: COLORS.card,
  },
  checkboxCompleted: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  inProgressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  titleWrapper: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMain,
    lineHeight: 20,
    marginBottom: 4,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: COLORS.textLight,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  subjectText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  deadlineWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  deadlineText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  userNameText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
    maxWidth: 120,
  },
});

