import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useAuthStore } from '../../store/authStore';
import { Id } from '../../convex/_generated/dataModel';

export default function CheckInTabScreen() {
  const router = useRouter();
  const convexUserId = useAuthStore((s) => s.convexUserId);
  const userId = convexUserId as Id<"users">;

  const moodLogs = useQuery(api.moodLogs.getByUser, convexUserId ? { userId } : "skip") || [];
  const sleepLogs = useQuery(api.sleepLogs.getByUser, convexUserId ? { userId } : "skip") || [];

  const todayDate = new Date().toISOString().split('T')[0];
  const todayMood = moodLogs.find(
    (m) => new Date(m.timestamp).toISOString().split('T')[0] === todayDate
  );
  const todaySleep = sleepLogs.find((s) => s.date === todayDate);
  const hasTodayData = !!(todayMood || todaySleep);

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.iconWrap}>
          <Ionicons name="clipboard" size={56} color={Colors.primaryGlow} />
        </View>

        <Text style={styles.title}>Check-in Harian</Text>
        <Text style={styles.subtitle}>
          Catat mood, tidur, stres, dan aktivitasmu{'\n'}dalam satu langkah cepat.
        </Text>

        {hasTodayData ? (
          <Card key="status" style={styles.statusCard}>
            <Text style={styles.statusTitle}>✅ Sudah check-in hari ini</Text>
            <Text style={styles.statusSub}>
              {todayMood ? `Mood: ${todayMood.mood}` : ''}
              {todayMood && todaySleep ? ' • ' : ''}
              {todaySleep ? `Tidur: ${todaySleep.durationInHours} jam` : ''}
            </Text>
          </Card>
        ) : (
          <Card key="cta" style={[styles.statusCard, styles.ctaCard]} isActive>
            <Text style={styles.ctaTitle}>💡 Ayo check perasaan kamu!</Text>
            <Text style={styles.statusSub}>
              Bagaimana perasaan dan tidurmu semalam? Yuk, luangkan waktu sebentar.
            </Text>
          </Card>
        )}

        <Button
          title={hasTodayData ? 'Update Check-in' : 'Mulai Check-in'}
          onPress={() => router.push('/checkin' as any)}
          style={styles.startBtn}
        />

        <Text style={styles.hint}>
          Tidak harus mengisi semua — isi secepat yang kamu bisa 🙌
        </Text>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  iconWrap: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: Colors.surfaceActive,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.lg,
  },
  statusCard: {
    alignSelf: 'stretch',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  statusTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.success,
    marginBottom: 4,
  },
  statusSub: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  startBtn: {
    alignSelf: 'stretch',
    marginBottom: Spacing.md,
  },
  hint: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  ctaCard: {
    // isActive prop handles glow styling
  },
  ctaTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.primaryGlow,
    marginBottom: 4,
  },
});
