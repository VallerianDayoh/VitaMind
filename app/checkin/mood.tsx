import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { Button } from '../../components/ui/Button';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { useDataStore } from '../../store/dataStore';
import { MoodType } from '../../types';

const MOODS: { type: MoodType; emoji: string; label: string }[] = [
  { type: 'awful', emoji: '😢', label: 'Sangat Buruk' },
  { type: 'bad', emoji: '🙁', label: 'Buruk' },
  { type: 'meh', emoji: '😐', label: 'Biasa' },
  { type: 'good', emoji: '🙂', label: 'Baik' },
  { type: 'rad', emoji: '😁', label: 'Sangat Baik' },
];

export default function MoodCheckinScreen() {
  const router = useRouter();
  const addMoodLog = useDataStore((s) => s.addMoodLog);
  const [selected, setSelected] = useState<MoodType | null>(null);
  const [note, setNote] = useState('');

  const handleSave = () => {
    if (!selected) return;
    addMoodLog({
      _id: Date.now().toString(),
      userId: 'current-user',
      mood: selected,
      note: note.trim() || undefined,
      timestamp: Date.now(),
    });
    router.back();
  };

  return (
    <ScreenWrapper>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <Text style={styles.heading}>Bagaimana perasaanmu{'\n'}saat ini?</Text>

        <View style={styles.moodRow}>
          {MOODS.map((m) => {
            const isActive = selected === m.type;
            return (
              <TouchableOpacity
                key={m.type}
                style={[styles.moodBtn, isActive && styles.moodBtnActive]}
                onPress={() => setSelected(m.type)}
                activeOpacity={0.7}
              >
                <Text style={styles.moodEmoji}>{m.emoji}</Text>
                <Text
                  style={[
                    styles.moodLabel,
                    isActive && { color: Colors.primary, fontWeight: '700' },
                  ]}
                >
                  {m.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.optionalLabel}>Catatan (opsional)</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Ceritakan kalau mau..."
          placeholderTextColor={Colors.textSecondary}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          value={note}
          onChangeText={setNote}
        />

        <Button
          title="Simpan"
          onPress={handleSave}
          disabled={!selected}
          style={styles.saveBtn}
        />
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
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
    lineHeight: 34,
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  moodBtn: {
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    width: '18%',
  },
  moodBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: '#EEEAFF',
  },
  moodEmoji: { fontSize: 38, marginBottom: Spacing.xs },
  moodLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  optionalLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  textArea: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    fontSize: Typography.sizes.md,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 110,
    marginBottom: Spacing.lg,
  },
  saveBtn: { marginTop: Spacing.sm },
});
