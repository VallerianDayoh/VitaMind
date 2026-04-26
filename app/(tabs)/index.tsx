import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from 'convex/react';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart } from 'react-native-gifted-charts';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Card } from '../../components/ui/Card';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { Colors, GlowShadow, Spacing, Typography } from '../../constants/theme';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { useAuthStore } from '../../store/authStore';
import { MoodType } from '../../types';

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

const MOOD_MAP: Record<MoodType, { icon: keyof typeof Ionicons.glyphMap; label: string; color: string }> = {
  rad: { icon: 'happy', label: 'Luar Biasa', color: '#5BFFB0' },
  good: { icon: 'happy-outline', label: 'Baik', color: '#B388EB' },
  meh: { icon: 'remove-circle-outline', label: 'Biasa', color: '#FFCF5C' },
  bad: { icon: 'sad-outline', label: 'Buruk', color: '#FF9F5C' },
  awful: { icon: 'sad', label: 'Sangat Buruk', color: '#FF6B7A' },
};

const QUICK_ACTIONS = [
  { key: 'mood', label: 'Mood', icon: 'happy-outline' as const, color: '#B388EB', route: '/checkin/mood' },
  { key: 'sleep', label: 'Tidur', icon: 'moon-outline' as const, color: '#5BFFB0', route: '/checkin/sleep' },
  { key: 'stress', label: 'Stres', icon: 'pulse-outline' as const, color: '#D87093', route: '/checkin/stress' },
  { key: 'activity', label: 'Aktivitas', icon: 'walk-outline' as const, color: '#FFCF5C', route: '/checkin/activity' },
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
  const groupedMoods = new Map<string, typeof moodLogs[0]>();
  for (const log of moodLogs) {
    const dateStr = new Date(log.timestamp || log._creationTime).toISOString().split('T')[0];
    if (!groupedMoods.has(dateStr)) {
      groupedMoods.set(dateStr, log); // Takes the most recent per day
    }
  }
  const recent7 = Array.from(groupedMoods.values()).slice(0, 7).reverse();
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
          <View style={styles.streakContent}>
            <Ionicons
              name={streak > 0 ? 'flame' : 'bulb-outline'}
              size={18}
              color={streak > 0 ? '#FFA500' : Colors.primaryGlow}
            />
            <Text style={styles.streakText}>
              {streak > 0
                ? `${streak} Hari Streak Check-in!`
                : 'Jangan lupa check-in hari ini!'}
            </Text>
          </View>
        </View>

        {/* ─── 2. TODAY STATUS CARD ───────────────────── */}
        <Card style={styles.statusCard}>
          <Text style={styles.sectionTitle}>Status Hari Ini</Text>
          {hasTodayData ? (
            <View style={styles.statusGrid}>
              {todayMood && (
                <View style={styles.statusItem}>
                  <Ionicons
                    name={MOOD_MAP[todayMood.mood].icon}
                    size={32}
                    color={MOOD_MAP[todayMood.mood].color}
                    style={{ marginBottom: Spacing.xs }}
                  />
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
                  <Feather name="moon" size={28} color={Colors.success} style={{ marginBottom: Spacing.xs }} />
                  <Text style={styles.statusLabel}>Tidur</Text>
                  <Text style={[styles.statusValue, { color: Colors.success }]}>
                    {todaySleep.durationInHours} jam
                  </Text>
                </View>
              )}
              {todayStress && (
                <View style={styles.statusItem}>
                  <Feather name="activity" size={28} color={Colors.warning} style={{ marginBottom: Spacing.xs }} />
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
                color={Colors.primaryGlow}
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
                  { backgroundColor: action.color + '20' },
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
              <Ionicons name="happy-outline" size={16} color="rgba(255,255,255,0.6)" />
              <Ionicons name="remove-circle-outline" size={16} color="rgba(255,255,255,0.6)" />
              <Ionicons name="sad-outline" size={16} color="rgba(255,255,255,0.6)" />
            </View>
            <View style={styles.barsContainer}>
              <LineChart
                data={MOOD_TREND_7D.map((val, i) => ({
                  value: val,
                  label: DAYS_LABEL[i],
                  customDataPoint: () => {
                    const dotColor = val <= 2 ? Colors.error : val >= 4 ? Colors.success : Colors.warning;
                    return (
                      <View style={{
                        width: 12, height: 12, borderRadius: 6, backgroundColor: dotColor,
                        borderWidth: 2, borderColor: Colors.surface
                      }} />
                    );
                  }
                }))}
                showLine={true}
                curved={true}
                color={Colors.primaryGlow}
                thickness={2}
                height={CHART_HEIGHT}
                maxValue={5}
                noOfSections={5}
                hideRules={true}
                hideYAxisText={true}
                yAxisColor="transparent"
                xAxisColor="transparent"
                spacing={46}
                initialSpacing={20}
                xAxisLabelTextStyle={{ color: Colors.textSecondary, fontSize: 10, marginTop: 4, width: 40, textAlign: 'center' }}
                isAnimated={true}
              />
            </View>
          </View>
          <View style={styles.chartCaptionWrap}>
            <Text style={styles.chartCaption}>
              Mood kamu cenderung stabil minggu ini. Pertahankan!
            </Text>
            <Ionicons name="thumbs-up-outline" size={14} color={Colors.textSecondary} />
          </View>
        </Card>

        {/* ─── 4. WEEKLY INSIGHT PREVIEW  ────── */}
        <Card style={styles.insightCard} isActive>
          <View style={styles.insightHeader}>
            <Ionicons name="sparkles" size={20} color={Colors.primaryGlow} />
            <Text style={styles.insightTitle}>Insight Mingguan Tersedia</Text>
          </View>
          <Text style={styles.insightBody}>
            Vita sudah membaca data kamu minggu ini! Buka tab Laporan untuk membaca analisis yang disesuaikan khusus untukmu.
          </Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/report' as any)}>
            <Text style={styles.insightLink}>Buka Laporan →</Text>
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
    color: Colors.textPrimary,
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
    borderRadius: 16,
    marginBottom: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
  },
  streakActive: {
    backgroundColor: 'rgba(255, 165, 0, 0.1)',
    borderColor: 'rgba(255, 165, 0, 0.25)',
  },
  streakInactive: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
  },
  streakContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  streakText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
  },

  // Section title reused
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
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
    borderRadius: 20,
    padding: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
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
    color: Colors.textPrimary,
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
    overflow: 'hidden',
  },
  chartCaptionWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
    gap: Spacing.xs,
  },
  chartCaption: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  // Insight
  insightCard: {
    // Active glow handled by isActive prop on Card
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  insightTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.primaryGlow,
  },
  insightBody: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  insightLink: {
    color: Colors.primaryGlow,
    fontWeight: Typography.weights.bold,
    marginTop: 8,
  },
});
