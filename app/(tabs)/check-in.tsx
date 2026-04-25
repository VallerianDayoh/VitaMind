import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { useDataStore } from '../../store/dataStore';

export default function CheckInTabScreen() {
  const router = useRouter();
  const { moodLogs, sleepLogs } = useDataStore();

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
          <Ionicons name="clipboard" size={56} color={Colors.primary} />
        </View>

        <Text style={styles.title}>Check-in Harian</Text>
        <Text style={styles.subtitle}>
          Catat mood, tidur, stres, dan aktivitasmu{'\n'}dalam satu langkah cepat.
        </Text>

        {hasTodayData && (
          <Card style={styles.statusCard}>
            <Text style={styles.statusTitle}>✅ Sudah check-in hari ini</Text>
            <Text style={styles.statusSub}>
              {todayMood ? `Mood: ${todayMood.mood}` : ''}
              {todayMood && todaySleep ? ' • ' : ''}
              {todaySleep ? `Tidur: ${todaySleep.durationInHours} jam` : ''}
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
    backgroundColor: '#EEEAFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
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
    width: '100%',
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
    width: '100%',
    marginBottom: Spacing.md,
  },
  hint: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
