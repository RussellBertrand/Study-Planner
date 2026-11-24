import React, { useState, useEffect, useMemo } from 'react';
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
import { COURSES_DATA } from '../constants/coursesData';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { COLORS, SHADOWS } from '../constants/theme';
import HeaderBar from '../components/HeaderBar';

export default function CoursesScreen() {
  const { currentUser } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [enrolledIds, setEnrolledIds] = useState([]);

  useEffect(() => {
    async function loadEnrolled() {
      const list = await api.getEnrolledCourses(currentUser?.id);
      setEnrolledIds(list);
    }
    loadEnrolled();
  }, [currentUser?.id]);

  const categories = [
    { id: 'ALL', label: 'Semua Kategori' },
    { id: 'ai', label: 'Kecerdasan Buatan (AI)' },
    { id: 'development', label: 'Web & Mobile Dev' },
    { id: 'design', label: 'Desain UI/UX' },
    { id: 'security', label: 'Keamanan Jaringan' },
  ];

  const filteredCourses = useMemo(() => {
    return COURSES_DATA.filter((c) => {
      if (selectedCategory !== 'ALL' && c.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (c.title || '').toLowerCase().includes(q);
        const matchLecturer = (c.lecturer || '').toLowerCase().includes(q);
        const matchDesc = (c.description || '').toLowerCase().includes(q);
        return matchTitle || matchLecturer || matchDesc;
      }
      return true;
    });
  }, [selectedCategory, searchQuery]);

  const handleEnroll = async (course) => {
    const updated = await api.enrollCourse(currentUser?.id, course.id);
    setEnrolledIds(updated);
    Alert.alert(
      'Pendaftaran Berhasil! 🎉',
      `Anda telah terdaftar di kursus: ${course.title}. Silabus dan jadwal kini aktif di jadwal belajar Anda.`
    );
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <HeaderBar
        title="Katalog Kursus"
        subtitle="Kurikulum industri terapan & silabus komprehensif"
      />

      {/* Search Input Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color={COLORS.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari kursus, materi, atau pengajar..."
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

      {/* Category Pills */}
      <View style={styles.categoryWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {categories.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryPill, active && styles.categoryPillActive]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <Text
                  style={[
                    styles.categoryPillText,
                    active && styles.categoryPillTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Courses List */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredCourses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="library-outline" size={44} color={COLORS.textLight} />
            <Text style={styles.emptyTitle}>Kursus Tidak Ditemukan</Text>
            <Text style={styles.emptySubtitle}>
              Coba gunakan kata kunci pencarian lain atau pilih kategori Semua.
            </Text>
          </View>
        ) : (
          filteredCourses.map((course) => {
            const isEnrolled = enrolledIds.includes(course.id);
            const isExpanded = expandedId === course.id;

            return (
              <View key={course.id} style={[styles.courseCard, SHADOWS.sm]}>
                {/* Level Badge & Rating */}
                <View style={styles.cardHeader}>
                  <View style={styles.levelBadge}>
                    <Text style={styles.levelText}>{course.level}</Text>
                  </View>
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={13} color="#F59E0B" />
                    <Text style={styles.ratingText}>{course.rating}</Text>
                  </View>
                </View>

                {/* Course Title */}
                <Text style={styles.title}>{course.title}</Text>
                <Text style={styles.description}>{course.description}</Text>

                {/* Instructor & Duration */}
                <View style={styles.infoRow}>
                  <View style={styles.infoItem}>
                    <Ionicons name="person-circle-outline" size={16} color={COLORS.primary} />
                    <Text style={styles.infoText} numberOfLines={1}>
                      {course.lecturer}
                    </Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Ionicons name="time-outline" size={15} color={COLORS.textMuted} />
                    <Text style={styles.infoText}>{course.duration}</Text>
                  </View>
                </View>

                {/* Expandable Syllabus */}
                {isExpanded ? (
                  <View style={styles.syllabusBox}>
                    <Text style={styles.syllabusTitle}>Silabus Materi Pembelajaran:</Text>
                    {course.syllabus.map((item, idx) => (
                      <View key={idx} style={styles.syllabusItem}>
                        <Text style={styles.syllabusDot}>•</Text>
                        <Text style={styles.syllabusText}>{item}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}

                {/* Actions: Syllabus toggle & Enroll */}
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={styles.syllabusBtn}
                    onPress={() => toggleExpand(course.id)}
                  >
                    <Text style={styles.syllabusBtnText}>
                      {isExpanded ? 'Tutup Silabus' : 'Lihat Silabus'}
                    </Text>
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={14}
                      color={COLORS.textMuted}
                    />
                  </TouchableOpacity>

                  {isEnrolled ? (
                    <View style={styles.enrolledBadge}>
                      <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
                      <Text style={styles.enrolledText}>Sudah Terdaftar</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.enrollBtn}
                      onPress={() => handleEnroll(course)}
                    >
                      <Text style={styles.enrollBtnText}>Daftar Kursus</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
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
  categoryWrapper: {
    backgroundColor: COLORS.card,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  categoryScroll: {
    paddingHorizontal: 18,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  categoryPillTextActive: {
    color: COLORS.textInverse,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 40,
  },
  courseCard: {
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
  levelBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  levelText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textMain,
    lineHeight: 20,
    marginBottom: 6,
  },
  description: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 17,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    gap: 10,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  infoText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMain,
  },
  syllabusBox: {
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 12,
    padding: 12,
    marginVertical: 10,
    gap: 6,
  },
  syllabusTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  syllabusItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  syllabusDot: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  syllabusText: {
    fontSize: 11,
    color: COLORS.textMain,
    flex: 1,
    lineHeight: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  syllabusBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceSubtle,
  },
  syllabusBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  enrollBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 9,
    alignItems: 'center',
  },
  enrollBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textInverse,
  },
  enrolledBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.completedBg,
    borderRadius: 10,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: COLORS.lowPriorityBorder,
  },
  enrolledText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.completedText,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
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
    maxWidth: 240,
    lineHeight: 18,
  },
});
