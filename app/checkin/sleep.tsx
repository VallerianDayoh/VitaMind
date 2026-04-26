import { Ionicons } from '@expo/vector-icons';
import { useMutation } from 'convex/react';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { Colors, Spacing, Typography } from '../../constants/theme';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { useAuthStore } from '../../store/authStore';

// Helper to create a Date with a specific hour:minute
const makeTime = (h: number, m: number): Date => {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
};

// Format Date → "HH:mm"
const fmt = (d: Date): string =>
  `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;

type SleepQuality = 'excellent' | 'good' | 'fair' | 'poor';
const QUALITIES: { value: SleepQuality; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'excellent', label: 'Nyenyak', icon: 'moon' },
  { value: 'good', label: 'Cukup', icon: 'happy-outline' },
  { value: 'fair', label: 'Gelisah', icon: 'sad-outline' },
  { value: 'poor', label: 'Insomnia', icon: 'alert-circle-outline' },
];

export default function SleepCheckinScreen() {
  const router = useRouter();
  const convexUserId = useAuthStore((s) => s.convexUserId);
  const addSleepLog = useMutation(api.sleepLogs.add);

  const [sleepTime, setSleepTime] = useState<Date>(() => makeTime(23, 0));
  const [wakeTime, setWakeTime] = useState<Date>(() => makeTime(6, 0));
  const [showSleepPicker, setShowSleepPicker] = useState(false);
  const [showWakePicker, setShowWakePicker] = useState(false);
  const [quality, setQuality] = useState<SleepQuality | null>(null);

  const duration = useMemo(() => {
    const bedMins = sleepTime.getHours() * 60 + sleepTime.getMinutes();
    const wakeMins = wakeTime.getHours() * 60 + wakeTime.getMinutes();
    let diff = wakeMins - bedMins;
    if (diff <= 0) diff += 24 * 60;
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    return { h, m, total: diff / 60 };
  }, [sleepTime, wakeTime]);

  const onSleepChange = React.useCallback((_e: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') setShowSleepPicker(false);
    if (date) setSleepTime(date);
  }, []);

  const onWakeChange = React.useCallback((_e: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') setShowWakePicker(false);
    if (date) setWakeTime(date);
  }, []);

  const handleSave = async () => {
    if (!quality || !convexUserId) return;
    try {
      await addSleepLog({
        userId: convexUserId as Id<"users">,
        durationInHours: Math.round(duration.total * 10) / 10,
        quality,
        bedTime: fmt(sleepTime),
        wakeTime: fmt(wakeTime),
        date: new Date().toISOString().split('T')[0],
      });
      router.back();
    } catch (error) {
      console.error('Failed to save sleep log:', error);
      alert('Gagal menyimpan catatan tidur.');
    }
  };

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.heading}>Catat Tidurmu</Text>

        {/* Time pickers */}
        <Card>
          <View style={styles.clockRow}>
            {/* Tidur Column */}
            <View style={styles.clockCol}>
              <View style={styles.clockLabelRow}>
                <Ionicons name="moon" size={14} color="rgba(255,255,255,0.6)" />
                <Text style={styles.clockLabel}>Tidur</Text>
              </View>
              <TouchableOpacity
                style={styles.clockCard}
                activeOpacity={0.7}
                onPress={() => setShowSleepPicker(true)}
              >
                <Text style={styles.clockText}>{fmt(sleepTime)}</Text>
              </TouchableOpacity>
            </View>

            {/* Bangun Column */}
            <View style={styles.clockCol}>
              <View style={styles.clockLabelRow}>
                <Ionicons name="sunny" size={14} color="rgba(255,255,255,0.6)" />
                <Text style={styles.clockLabel}>Bangun</Text>
              </View>
              <TouchableOpacity
                style={styles.clockCard}
                activeOpacity={0.7}
                onPress={() => setShowWakePicker(true)}
              >
                <Text style={styles.clockText}>{fmt(wakeTime)}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Native Time Pickers */}
          {showSleepPicker && (
            <DateTimePicker
              value={sleepTime}
              mode="time"
              is24Hour={true}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onSleepChange}
            />
          )}
          {showWakePicker && (
            <DateTimePicker
              value={wakeTime}
              mode="time"
              is24Hour={true}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onWakeChange}
            />
          )}
        </Card>

        {/* Duration preview */}
        <View style={styles.durationBox}>
          <Ionicons name="time-outline" size={22} color={Colors.primaryGlow} />
          <Text style={styles.durationText}>
            Kamu tidur{' '}
            <Text style={{ fontWeight: '700', color: Colors.primaryGlow }}>
              {duration.h} jam {duration.m > 0 ? `${duration.m} menit` : ''}
            </Text>
          </Text>
        </View>

        {/* Quality selector */}
        <Text style={styles.sectionTitle}>Kualitas Tidur</Text>
        <View style={styles.qualityRow}>
          {QUALITIES.map((q) => {
            const active = quality === q.value;
            return (
              <TouchableOpacity
                key={q.value}
                style={[styles.qualityBtn, active && styles.qualityBtnActive]}
                onPress={() => setQuality(q.value)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={q.icon}
                  size={active ? 30 : 26}
                  color={active ? Colors.primaryGlow : 'rgba(255,255,255,0.8)'}
                  style={{ marginBottom: Spacing.xs }}
                />
                <Text style={[styles.qualityLabel, active && { color: Colors.primaryGlow, fontWeight: '700' }]}>
                  {q.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Button title="Simpan" onPress={handleSave} disabled={!quality} style={styles.saveBtn} />
      </ScrollView>
    </ScreenWrapper>
  );
}

// Scroll Selector and its types were removed

// ── Styles ─────────────────────────────────────────────────

const styles = StyleSheet.create({
  scroll: { paddingBottom: Spacing.xxl },
  heading: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  // ── Sleep – Digital Clock ────────────────────────────
  clockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  clockCol: {
    flex: 1,
    alignItems: 'center',
  },
  clockLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.xs,
  },
  clockLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: 'rgba(255,255,255,0.6)',
  },
  clockCard: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(179,136,235,0.25)',
  },
  clockText: {
    fontSize: 32,
    fontWeight: Typography.weights.bold,
    color: '#FFFFFF',
    letterSpacing: 2,
    textShadowColor: Colors.primaryGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },

  // Duration
  durationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surfaceActive,
    borderRadius: 16,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  durationText: {
    fontSize: Typography.sizes.md,
    color: Colors.textPrimary,
  },

  // Quality
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  qualityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  qualityBtn: {
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: Colors.surface,
    width: '23%',
  },
  qualityBtnActive: {
    borderColor: Colors.primaryGlow,
    backgroundColor: Colors.surfaceActive,
  },
  qualityIcon: { fontSize: 28, marginBottom: Spacing.xs },
  qualityLabel: { fontSize: Typography.sizes.xs, color: Colors.textSecondary, textAlign: 'center' },

  saveBtn: { marginTop: Spacing.sm },
});
