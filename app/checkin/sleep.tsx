import { Ionicons } from '@expo/vector-icons';
import { useMutation } from 'convex/react';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { Colors, Spacing, Typography } from '../../constants/theme';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { useAuthStore } from '../../store/authStore';

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const MINUTES = ['00', '15', '30', '45'];

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

  const [bedH, setBedH] = useState('22');
  const [bedM, setBedM] = useState('30');
  const [wakeH, setWakeH] = useState('06');
  const [wakeM, setWakeM] = useState('00');
  const [quality, setQuality] = useState<SleepQuality | null>(null);

  const duration = useMemo(() => {
    const bedMins = parseInt(bedH) * 60 + parseInt(bedM);
    const wakeMins = parseInt(wakeH) * 60 + parseInt(wakeM);
    let diff = wakeMins - bedMins;
    if (diff <= 0) diff += 24 * 60;
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    return { h, m, total: diff / 60 };
  }, [bedH, bedM, wakeH, wakeM]);

  const handleSave = async () => {
    if (!quality || !convexUserId) return;
    try {
      await addSleepLog({
        userId: convexUserId as Id<"users">,
        durationInHours: Math.round(duration.total * 10) / 10,
        quality,
        bedTime: `${bedH}:${bedM}`,
        wakeTime: `${wakeH}:${wakeM}`,
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
          <Text style={styles.label}>Jam Tidur</Text>
          <View style={styles.pickerRow}>
            <ScrollSelector values={HOURS} selected={bedH} onSelect={setBedH} />
            <Text style={styles.colon}>:</Text>
            <ScrollSelector values={MINUTES} selected={bedM} onSelect={setBedM} />
          </View>
        </Card>

        <Card>
          <Text style={styles.label}>Jam Bangun</Text>
          <View style={styles.pickerRow}>
            <ScrollSelector values={HOURS} selected={wakeH} onSelect={setWakeH} />
            <Text style={styles.colon}>:</Text>
            <ScrollSelector values={MINUTES} selected={wakeM} onSelect={setWakeM} />
          </View>
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

// ── Scroll Selector (mini time picker) ─────────────────────

interface ScrollSelectorProps {
  values: string[];
  selected: string;
  onSelect: (v: string) => void;
}

const ScrollSelector: React.FC<ScrollSelectorProps> = ({ values, selected, onSelect }) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.selectorContainer}
  >
    {values.map((v) => {
      const active = v === selected;
      return (
        <TouchableOpacity
          key={v}
          style={[styles.selectorItem, active && styles.selectorItemActive]}
          onPress={() => onSelect(v)}
        >
          <Text style={[styles.selectorText, active && styles.selectorTextActive]}>{v}</Text>
        </TouchableOpacity>
      );
    })}
  </ScrollView>
);

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
  label: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colon: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginHorizontal: Spacing.sm,
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

  // Scroll selector
  selectorContainer: { gap: Spacing.xs },
  selectorItem: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectorItemActive: {
    backgroundColor: Colors.primaryGlow,
    borderColor: Colors.primaryGlow,
  },
  selectorText: {
    fontSize: Typography.sizes.lg,
    color: Colors.textPrimary,
    fontWeight: Typography.weights.medium,
  },
  selectorTextActive: { color: '#FFF' },

  saveBtn: { marginTop: Spacing.sm },
});
