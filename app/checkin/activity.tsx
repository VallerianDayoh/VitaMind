import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { Button } from '../../components/ui/Button';
import { Colors, Typography, Spacing } from '../../constants/theme';

const ACTIVITIES = [
  { key: 'exercise', label: 'Olahraga', icon: '🏋️' },
  { key: 'walk', label: 'Jalan kaki', icon: '🚶' },
  { key: 'yoga', label: 'Yoga', icon: '🧘' },
  { key: 'cycle', label: 'Bersepeda', icon: '🚴' },
  { key: 'other', label: 'Lainnya', icon: '🎯' },
];

export default function ActivityCheckinScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [durationStr, setDurationStr] = useState('');

  const duration = parseInt(durationStr) || 0;
  const canSave = !!selected && duration > 0;

  const handleSave = () => {
    // In the future, save to dataStore
    const label = ACTIVITIES.find((a) => a.key === selected)?.label ?? selected;
    alert(`${label} selama ${duration} menit berhasil dicatat!`);
    router.back();
  };

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.heading}>Catat Aktivitasmu</Text>

        {/* Activity pills */}
        <Text style={styles.label}>Jenis Aktivitas</Text>
        <View style={styles.pillsWrap}>
          {ACTIVITIES.map((a) => {
            const active = selected === a.key;
            return (
              <TouchableOpacity
                key={a.key}
                style={[styles.pill, active && styles.pillActive]}
                onPress={() => setSelected(a.key)}
                activeOpacity={0.7}
              >
                <Text style={styles.pillEmoji}>{a.icon}</Text>
                <Text style={[styles.pillLabel, active && { color: '#FFF', fontWeight: '700' }]}>
                  {a.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Duration */}
        <Text style={styles.label}>Durasi (menit)</Text>
        <View style={styles.durationRow}>
          <TouchableOpacity
            style={styles.durationBtn}
            onPress={() => setDurationStr(String(Math.max(0, duration - 5)))}
          >
            <Ionicons name="remove-circle-outline" size={32} color={Colors.primary} />
          </TouchableOpacity>

          <TextInput
            style={styles.durationInput}
            value={durationStr}
            onChangeText={(t) => setDurationStr(t.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
            placeholder="0"
            placeholderTextColor={Colors.textSecondary}
            maxLength={3}
          />

          <TouchableOpacity
            style={styles.durationBtn}
            onPress={() => setDurationStr(String(duration + 5))}
          >
            <Ionicons name="add-circle-outline" size={32} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {duration > 0 && (
          <View style={styles.previewBox}>
            <Text style={styles.previewText}>
              {ACTIVITIES.find((a) => a.key === selected)?.icon ?? '🎯'}{' '}
              {ACTIVITIES.find((a) => a.key === selected)?.label ?? 'Aktivitas'} selama{' '}
              <Text style={{ fontWeight: '700', color: Colors.primary }}>{duration} menit</Text>
            </Text>
          </View>
        )}

        <Button title="Simpan" onPress={handleSave} disabled={!canSave} style={styles.saveBtn} />
      </ScrollView>
    </ScreenWrapper>
  );
}

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
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    color: Colors.text,
    marginBottom: Spacing.md,
  },

  // Pills
  pillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: Spacing.xs,
  },
  pillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pillEmoji: { fontSize: 20 },
  pillLabel: { fontSize: Typography.sizes.sm, color: Colors.text },

  // Duration
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    gap: Spacing.lg,
  },
  durationBtn: { padding: Spacing.xs },
  durationInput: {
    fontSize: 42,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    minWidth: 100,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
    paddingVertical: Spacing.sm,
  },

  previewBox: {
    backgroundColor: '#EEEAFF',
    borderRadius: 12,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  previewText: { fontSize: Typography.sizes.md, color: Colors.text },

  saveBtn: { marginTop: Spacing.sm },
});
