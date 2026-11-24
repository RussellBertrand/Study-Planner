import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COURSES_DATA } from '../constants/coursesData';
import { COLORS, SHADOWS } from '../constants/theme';
import HeaderBar from '../components/HeaderBar';

export default function ScheduleScreen() {
  const [selectedDay, setSelectedDay] = useState('ALL');

  const days = [
    { id: 'ALL', label: 'Semua Hari' },
    { id: 'Senin', label: 'Senin' },
    { id: 'Selasa', label: 'Selasa' },
    { id: 'Rabu', label: 'Rabu' },
    { id: 'Kamis', label: 'Kamis' },
    { id: 'Jumat', label: 'Jumat' },
  ];

  const filteredCourses = useMemo(() => {
    if (selectedDay === 'ALL') return COURSES_DATA;
    return COURSES_DATA.filter((c) => (c.schedule || '').includes(selectedDay));
  }, [selectedDay]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <HeaderBar
        title="Jadwal Belajar"
        subtitle="Alokasi waktu tatap muka & praktikum mingguan"
      />

      {/* Day Selector Pills */}
      <View style={styles.daysWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daysScroll}
        >
          {days.map((d) => {
            const active = selectedDay === d.id;
            return (
              <TouchableOpacity
                key={d.id}
                style={[styles.dayPill, active && styles.dayPillActive]}
                onPress={() => setSelectedDay(d.id)}
              >
                <Text style={[styles.dayPillText, active && styles.dayPillTextActive]}>
                  {d.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Info Banner */}
        <View style={[styles.infoBanner, SHADOWS.sm]}>
          <Ionicons name="calendar" size={20} color={COLORS.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.infoBannerTitle}>
              {selectedDay === 'ALL'
                ? '5 Sesi Perkuliahan Terjadwal'
                : `Jadwal Perkuliahan Hari ${selectedDay}`}
            </Text>
            <Text style={styles.infoBannerSub}>
              Pastikan hadir 10 menit sebelum jam perkuliahan dimulai.
            </Text>
          </View>
        </View>

        {/* Schedule Cards */}
        {filteredCourses.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="sunny-outline" size={40} color={COLORS.textLight} />
            <Text style={styles.emptyTitle}>Tidak Ada Perkuliahan</Text>
            <Text style={styles.emptyText}>
              Hari ini tidak ada jadwal kelas tatap muka. Anda dapat fokus menyelesaikan tugas mandiri.
            </Text>
          </View>
        ) : (
          filteredCourses.map((course, idx) => (
            <View key={course.id} style={[styles.card, SHADOWS.sm]}>
              {/* Card Header: Code & Credits */}
              <View style={styles.cardHeader}>
                <View style={styles.codeBadge}>
                  <Text style={styles.codeText}>{course.code}</Text>
                </View>
                <View style={styles.creditsBadge}>
                  <Text style={styles.creditsText}>{course.credits} SKS</Text>
                </View>
              </View>

              {/* Title */}
              <Text style={styles.title}>{course.title}</Text>

              {/* Meta Grid */}
              <View style={styles.metaBox}>
                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={15} color={COLORS.primary} />
                  <Text style={styles.metaText}>{course.schedule}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="location-outline" size={15} color={COLORS.textMuted} />
                  <Text style={styles.metaText}>{course.room}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="person-outline" size={15} color={COLORS.textMuted} />
                  <Text style={styles.metaText}>{course.lecturer}</Text>
                </View>
              </View>

              {/* Description */}
              <Text style={styles.description}>{course.description}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  daysWrapper: {
    backgroundColor: COLORS.card,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  daysScroll: {
    paddingHorizontal: 18,
    gap: 8,
  },
  dayPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dayPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dayPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  dayPillTextActive: {
    color: COLORS.textInverse,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 40,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  infoBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  infoBannerSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  codeBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  codeText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
  },
  creditsBadge: {
    backgroundColor: COLORS.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  creditsText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textMain,
    lineHeight: 20,
    marginBottom: 12,
  },
  metaBox: {
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 12,
    padding: 12,
    gap: 6,
    marginBottom: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMain,
    flex: 1,
  },
  description: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 17,
  },
  emptyCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textMain,
    marginTop: 10,
  },
  emptyText: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
    maxWidth: 260,
  },
});

