import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { Button } from '../../components/ui/Button';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useAuthStore } from '../../store/authStore';
import { Id } from '../../convex/_generated/dataModel';
import { MoodType } from '../../types';

const MOODS: { type: MoodType; icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { type: 'awful', icon: 'sad', label: 'Sangat Buruk' },
  { type: 'bad', icon: 'sad-outline', label: 'Buruk' },
  { type: 'meh', icon: 'remove-circle-outline', label: 'Biasa' },
  { type: 'good', icon: 'happy-outline', label: 'Baik' },
  { type: 'rad', icon: 'happy', label: 'Sangat Baik' },
];

export default function MoodCheckinScreen() {
  const router = useRouter();
  const convexUserId = useAuthStore((s) => s.convexUserId);
  const addMoodLog = useMutation(api.moodLogs.add);
  const [selected, setSelected] = useState<MoodType | null>(null);
  const [note, setNote] = useState('');

  const handleSave = async () => {
    if (!selected || !convexUserId) return;
    try {
      await addMoodLog({
        userId: convexUserId as Id<"users">,
        mood: selected,
        note: note.trim() || undefined,
      });
      router.back();
    } catch (error) {
      console.error('Failed to save mood:', error);
      alert('Gagal menyimpan data mood.');
    }
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
                <Ionicons
                  name={m.icon}
                  size={isActive ? 42 : 34}
                  color={isActive ? Colors.primaryGlow : 'rgba(255,255,255,0.8)'}
                  style={{ marginBottom: Spacing.xs }}
                />
                <Text
                  style={[
                    styles.moodLabel,
                    isActive && { color: Colors.primaryGlow, fontWeight: '700' },
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
          placeholderTextColor="rgba(255,255,255,0.4)"
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
    color: Colors.textPrimary,
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
    borderColor: Colors.primaryGlow,
    backgroundColor: Colors.surfaceActive,
  },
  moodEmoji: { marginBottom: Spacing.xs },
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
    borderRadius: 16,
    padding: Spacing.md,
    fontSize: Typography.sizes.md,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 110,
    marginBottom: Spacing.lg,
  },
  saveBtn: { marginTop: Spacing.sm },
});
