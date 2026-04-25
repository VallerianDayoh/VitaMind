import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { Card } from '../../components/ui/Card';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';
import { MoodType } from '../../types';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

// ── Helpers ────────────────────────────────────────────────

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 11) return 'Selamat Pagi';
  if (hour < 15) return 'Selamat Siang';
  if (hour < 18) return 'Selamat Sore';
  return 'Selamat Malam';
};

const getFormattedDate = (): string => {
  return new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const MOOD_MAP: Record<MoodType, { emoji: string; label: string; color: string }> = {
  rad: { emoji: '😁', label: 'Luar Biasa', color: '#00B894' },
  good: { emoji: '🙂', label: 'Baik', color: '#6C63FF' },
  meh: { emoji: '😐', label: 'Biasa', color: '#FDCB6E' },
  bad: { emoji: '🙁', label: 'Buruk', color: '#E17055' },
  awful: { emoji: '😢', label: 'Sangat Buruk', color: '#D63031' },
};

const QUICK_ACTIONS = [
  { key: 'mood', label: 'Mood', icon: 'happy-outline' as const, color: '#6C63FF', route: '/checkin/mood' },
  { key: 'sleep', label: 'Tidur', icon: 'moon-outline' as const, color: '#00B894', route: '/checkin/sleep' },
  { key: 'stress', label: 'Stres', icon: 'pulse-outline' as const, color: '#FF6584', route: '/checkin/stress' },
  { key: 'activity', label: 'Aktivitas', icon: 'walk-outline' as const, color: '#FDCB6E', route: '/checkin/activity' },
];

const CHART_HEIGHT = 100;
const MOOD_SCORE: Record<string, number> = { rad: 5, good: 4, meh: 3, bad: 2, awful: 1 };

// ── Component ──────────────────────────────────────────────

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const convexUserId = useAuthStore((s) => s.convexUserId);
  const userId = convexUserId as Id<"users">;

  // Real data
  const moodLogs = useQuery(api.moodLogs.getByUser, convexUserId ? { userId } : "skip") || [];
  const sleepLogs = useQuery(api.sleepLogs.getByUser, convexUserId ? { userId } : "skip") || [];
  const stressLogs = useQuery(api.stressLogs.getByUser, convexUserId ? { userId } : "skip") || [];

  const todayDate = new Date().toISOString().split('T')[0];

  // Derive today's data (assuming logs are sorted desc by timestamp)
  const todayMood = moodLogs.find(m => new Date(m.timestamp || m._creationTime).toISOString().split('T')[0] === todayDate);
  const todaySleep = sleepLogs.find(s => s.date === todayDate);
  const todayStress = stressLogs.find(s => new Date(s.timestamp || s._creationTime).toISOString().split('T')[0] === todayDate);

  const streak = moodLogs.length > 0 ? moodLogs.length : 0; // Simple streak for now

  const hasTodayData = !!(todayMood || todaySleep || todayStress);

  // Dynamic Chart Data
  const recent7 = [...moodLogs.slice(0, 7)].reverse();
  const MOOD_TREND_7D = recent7.map(m => MOOD_SCORE[m.mood] || 3);
  const DAYS_LABEL = recent7.map(m => new Date(m.timestamp || m._creationTime).toLocaleDateString('id-ID', { weekday: 'short' }));

  return (
    <ScreenWrapper>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ─── 1. GREETING ─────────────────────────────── */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingText}>
            {getGreeting()}, {user?.name?.split(' ')[0] ?? 'Sahabat'}!
          </Text>
          <Text style={styles.dateText}>{getFormattedDate()}</Text>
        </View>

        {/* ─── STREAK BANNER ──────────────────────────── */}
        <View style={[styles.streakBanner, streak > 0 ? styles.streakActive : styles.streakInactive]}>
          <Text style={styles.streakText}>
            {streak > 0
              ? `🔥 ${streak} Hari Streak Check-in!`
              : '💡 Jangan lupa check-in hari ini!'}
          </Text>
        </View>

        {/* ─── 2. TODAY STATUS CARD ───────────────────── */}
        <Card style={styles.statusCard}>
          <Text style={styles.sectionTitle}>Status Hari Ini</Text>
          {hasTodayData ? (
            <View style={styles.statusGrid}>
              {todayMood && (
                <View style={styles.statusItem}>
                  <Text style={styles.statusEmoji}>
                    {MOOD_MAP[todayMood.mood].emoji}
                  </Text>
                  <Text style={styles.statusLabel}>Mood</Text>
                  <Text
                    style={[
                      styles.statusValue,
                      { color: MOOD_MAP[todayMood.mood].color },
                    ]}
                  >
                    {MOOD_MAP[todayMood.mood].label}
                  </Text>
                </View>
              )}
              {todaySleep && (
                <View style={styles.statusItem}>
                  <Text style={styles.statusEmoji}>😴</Text>
                  <Text style={styles.statusLabel}>Tidur</Text>
                  <Text style={[styles.statusValue, { color: Colors.success }]}>
                    {todaySleep.durationInHours} jam
                  </Text>
                </View>
              )}
              {todayStress && (
                <View style={styles.statusItem}>
                  <Text style={styles.statusEmoji}>🧘</Text>
                  <Text style={styles.statusLabel}>Stres</Text>
                  <Text style={[styles.statusValue, { color: Colors.warning }]}>
                    Lv {todayStress.level}
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <TouchableOpacity
              style={styles.emptyState}
              onPress={() => router.push('/checkin' as any)}
              activeOpacity={0.7}
            >
              <Ionicons
                name="add-circle-outline"
                size={36}
                color={Colors.primary}
              />
              <Text style={styles.emptyStateText}>
                Belum ada check-in hari ini — mulai sekarang?
              </Text>
            </TouchableOpacity>
          )}
        </Card>

        {/* ─── QUICK ACCESS GRID ─────────────────────── */}
        <Text style={styles.sectionTitle}>Aksi Cepat</Text>
        <View style={styles.quickGrid}>
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.key}
              style={styles.quickItem}
              activeOpacity={0.75}
              onPress={() => router.push(action.route as any)}
            >
              <View
                style={[
                  styles.quickIconWrap,
                  { backgroundColor: action.color + '18' },
                ]}
              >
                <Ionicons name={action.icon} size={28} color={action.color} />
              </View>
              <Text style={styles.quickLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ─── 3. MINI MOOD CHART ────────────────────── */}
        <Card>
          <Text style={styles.sectionTitle}>Tren Mood 7 Hari</Text>
          <View style={styles.chartArea}>
            {/* Y-axis labels */}
            <View style={styles.yAxis}>
              <Text style={styles.axisLabel}>😁</Text>
              <Text style={styles.axisLabel}>😐</Text>
              <Text style={styles.axisLabel}>😢</Text>
            </View>
            {/* Bars */}
            <View style={styles.barsContainer}>
              {MOOD_TREND_7D.map((val, i) => {
                const barH = (val / 5) * CHART_HEIGHT;
                const barColor =
                  val >= 4
                    ? Colors.success
                    : val >= 3
                    ? Colors.primary
                    : val >= 2
                    ? Colors.warning
                    : Colors.error;
                return (
                  <View key={i} style={styles.barCol}>
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.bar,
                          { height: barH, backgroundColor: barColor },
                        ]}
                      />
                    </View>
                    <Text style={styles.barLabel}>{DAYS_LABEL[i]}</Text>
                  </View>
                );
              })}
            </View>
          </View>
          <Text style={styles.chartCaption}>
            Mood kamu cenderung stabil minggu ini. Pertahankan! 💪
          </Text>
        </Card>

        {/* ─── 4. WEEKLY INSIGHT PREVIEW  ────── */}
        <Card style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <Text style={styles.insightIcon}>✨</Text>
            <Text style={styles.insightTitle}>Insight Mingguan Tersedia</Text>
          </View>
          <Text style={styles.insightBody}>
            Vita sudah membaca data kamu minggu ini! Buka tab Laporan untuk membaca analisis yang disesuaikan khusus untukmu.
          </Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/report' as any)}>
            <Text style={{color: Colors.primary, fontWeight: 'bold', marginTop: 8}}>Buka Laporan →</Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </ScreenWrapper>
  );
}

// ── Styles ─────────────────────────────────────────────────

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },

  // Greeting
  greetingSection: {
    marginBottom: Spacing.md,
  },
  greetingText: {
    fontSize: Typography.sizes.xxxl,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
  },
  dateText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },

  // Streak
  streakBanner: {
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.lg,
    alignItems: 'center',
  },
  streakActive: {
    backgroundColor: '#FFF3E0',
  },
  streakInactive: {
    backgroundColor: Colors.border + '80',
  },
  streakText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.text,
  },

  // Section title reused
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },

  // Status Card
  statusCard: {
    marginBottom: Spacing.md,
  },
  statusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statusItem: {
    alignItems: 'center',
  },
  statusEmoji: {
    fontSize: 32,
    marginBottom: Spacing.xs,
  },
  statusLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  statusValue: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  emptyStateText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },

  // Quick Access Grid
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  quickItem: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.md,
    elevation: 2,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  quickIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  quickLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.text,
  },

  // Chart
  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: CHART_HEIGHT + 28,
  },
  yAxis: {
    justifyContent: 'space-between',
    height: CHART_HEIGHT,
    marginRight: Spacing.sm,
    paddingBottom: 2,
  },
  axisLabel: {
    fontSize: 14,
  },
  barsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
  },
  barCol: {
    alignItems: 'center',
  },
  barTrack: {
    height: CHART_HEIGHT,
    justifyContent: 'flex-end',
  },
  bar: {
    width: 22,
    borderRadius: 6,
    minHeight: 6,
  },
  barLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  chartCaption: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    textAlign: 'center',
  },

  // Insight
  insightCard: {
    backgroundColor: '#EEEAFF',
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  insightIcon: {
    fontSize: 22,
    marginRight: Spacing.sm,
  },
  insightTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  insightBody: {
    fontSize: Typography.sizes.sm,
    color: Colors.text,
    lineHeight: 22,
  },
});
