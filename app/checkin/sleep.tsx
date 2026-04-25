import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { useDataStore } from '../../store/dataStore';

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const MINUTES = ['00', '15', '30', '45'];

type SleepQuality = 'excellent' | 'good' | 'fair' | 'poor';
const QUALITIES: { value: SleepQuality; label: string; icon: string }[] = [
  { value: 'excellent', label: 'Nyenyak', icon: '😴' },
  { value: 'good', label: 'Cukup', icon: '🙂' },
  { value: 'fair', label: 'Gelisah', icon: '😕' },
  { value: 'poor', label: 'Insomnia', icon: '😵' },
];

export default function SleepCheckinScreen() {
  const router = useRouter();
  const addSleepLog = useDataStore((s) => s.addSleepLog);

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

  const handleSave = () => {
    if (!quality) return;
    addSleepLog({
      _id: Date.now().toString(),
      userId: 'current-user',
      durationInHours: Math.round(duration.total * 10) / 10,
      quality,
      bedTime: `${bedH}:${bedM}`,
      wakeTime: `${wakeH}:${wakeM}`,
      date: new Date().toISOString().split('T')[0],
    });
    router.back();
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
          <Ionicons name="time-outline" size={22} color={Colors.primary} />
          <Text style={styles.durationText}>
            Kamu tidur{' '}
            <Text style={{ fontWeight: '700', color: Colors.primary }}>
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
                <Text style={styles.qualityIcon}>{q.icon}</Text>
                <Text style={[styles.qualityLabel, active && { color: Colors.primary, fontWeight: '700' }]}>
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
    color: Colors.text,
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
    color: Colors.text,
    marginHorizontal: Spacing.sm,
  },

  // Duration
  durationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    backgroundColor: '#EEEAFF',
    borderRadius: 12,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  durationText: {
    fontSize: Typography.sizes.md,
    color: Colors.text,
  },

  // Quality
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
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
    elevation: 1,
  },
  qualityBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: '#EEEAFF',
  },
  qualityIcon: { fontSize: 28, marginBottom: Spacing.xs },
  qualityLabel: { fontSize: Typography.sizes.xs, color: Colors.textSecondary, textAlign: 'center' },

  // Scroll selector
  selectorContainer: { gap: Spacing.xs },
  selectorItem: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectorItemActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  selectorText: {
    fontSize: Typography.sizes.lg,
    color: Colors.text,
    fontWeight: Typography.weights.medium,
  },
  selectorTextActive: { color: '#FFF' },

  saveBtn: { marginTop: Spacing.sm },
});
