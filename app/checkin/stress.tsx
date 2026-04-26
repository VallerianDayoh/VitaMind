import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, TextInput } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useAuthStore } from '../../store/authStore';
import { Id } from '../../convex/_generated/dataModel';

const PSS_QUESTIONS = [
  'Seberapa sering kamu merasa kewalahan dengan tugas-tugasmu?',
  'Seberapa sering kamu merasa tidak bisa mengendalikan hal penting?',
  'Seberapa sering kamu merasa gugup atau tertekan?',
  'Seberapa sering kamu merasa sulit berkonsentrasi?',
  'Seberapa sering kamu merasa marah karena hal di luar kendalimu?',
];

const SCALE_OPTIONS = [
  { value: 0, label: 'Tidak pernah' },
  { value: 1, label: 'Jarang' },
  { value: 2, label: 'Kadang' },
  { value: 3, label: 'Sangat sering' },
];

export default function StressCheckinScreen() {
  const router = useRouter();
  const convexUserId = useAuthStore((s) => s.convexUserId);
  const addStressLog = useMutation(api.stressLogs.add);
  const [answers, setAnswers] = useState<number[]>(new Array(PSS_QUESTIONS.length).fill(-1));
  const [hasDeadline, setHasDeadline] = useState(false);
  const [deadlineContext, setDeadlineContext] = useState('');

  // Reanimated values for deadline expand animation
  const deadlineHeight = useSharedValue(0);
  const deadlineOpacity = useSharedValue(0);
  const DEADLINE_INPUT_HEIGHT = 52;

  const handleToggleDeadline = useCallback((value: boolean) => {
    setHasDeadline(value);
    deadlineHeight.value = withTiming(value ? DEADLINE_INPUT_HEIGHT : 0, {
      duration: 280,
      easing: Easing.out(Easing.cubic),
    });
    deadlineOpacity.value = withTiming(value ? 1 : 0, {
      duration: 220,
      easing: Easing.out(Easing.ease),
    });
  }, [deadlineHeight, deadlineOpacity]);

  const deadlineAnimStyle = useAnimatedStyle(() => ({
    height: deadlineHeight.value,
    opacity: deadlineOpacity.value,
    overflow: 'hidden',
  }));

  const totalScore = useMemo(
    () => answers.reduce((sum, v) => sum + (v >= 0 ? v : 0), 0),
    [answers]
  );

  const allAnswered = answers.every((a) => a >= 0);

  const getScoreColor = () => {
    if (totalScore <= 4) return Colors.success;
    if (totalScore <= 9) return Colors.warning;
    return Colors.error;
  };

  const getScoreLabel = () => {
    if (totalScore <= 4) return 'Rendah 🙂';
    if (totalScore <= 9) return 'Sedang 😐';
    return 'Tinggi 😰';
  };

  const setAnswer = (qIndex: number, value: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[qIndex] = value;
      return next;
    });
  };

  const handleSave = async () => {
    if (!convexUserId) return;
    try {
      await addStressLog({
        userId: convexUserId as Id<"users">,
        level: totalScore,
        hasDeadline,
        note: deadlineContext.trim() || undefined,
      });
      alert(`Skor stres: ${totalScore}/15 (${getScoreLabel()})\nBerhasil dicatat!`);
      router.back();
    } catch (error) {
      console.error('Failed to save stress log:', error);
      alert('Gagal menyimpan catatan stres.');
    }
  };

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.heading}>Tingkat Stres Kamu</Text>

        {/* Live score badge */}
        <View style={[styles.scoreBadge, { backgroundColor: getScoreColor() + '20' }]}>
          <Text style={[styles.scoreNumber, { color: getScoreColor() }]}>{totalScore}</Text>
          <Text style={styles.scoreMax}>/15</Text>
          <Text style={[styles.scoreLabel, { color: getScoreColor() }]}>{getScoreLabel()}</Text>
        </View>

        {/* Questions */}
        {PSS_QUESTIONS.map((q, qIdx) => (
          <Card key={qIdx} style={styles.questionCard}>
            <Text style={styles.questionNum}>Pertanyaan {qIdx + 1}</Text>
            <Text style={styles.questionText}>{q}</Text>
            <View style={styles.optionsRow}>
              {SCALE_OPTIONS.map((opt) => {
                const active = answers[qIdx] === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.optionBtn, active && styles.optionBtnActive]}
                    onPress={() => setAnswer(qIdx, opt.value)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.optionValue, active && { color: '#FFF' }]}>
                      {opt.value}
                    </Text>
                    <Text
                      style={[styles.optionLabel, active && { color: '#FFF' }]}
                      numberOfLines={1}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Card>
        ))}

        {/* Academic context toggle */}
        <Card style={styles.toggleCard}>
          <View style={styles.toggleRow}>
            <View style={{ flex: 1, marginRight: Spacing.md }}>
              <Text style={styles.toggleLabel}>Ada deadline atau ujian minggu ini?</Text>
              <Text style={styles.toggleSub}>Konteks akademik untuk insight yang lebih akurat</Text>
            </View>
            <Switch
              value={hasDeadline}
              onValueChange={handleToggleDeadline}
              trackColor={{ false: Colors.border, true: Colors.primary + '80' }}
              thumbColor={hasDeadline ? Colors.primary : '#F4F3F4'}
            />
          </View>

          {/* Progressive Disclosure: Deadline Context Input */}
          <Animated.View style={[styles.deadlineInputWrap, deadlineAnimStyle]}>
            <TextInput
              style={styles.deadlineInput}
              placeholder="Mata kuliah/kegiatan apa? (Opsional)"
              placeholderTextColor={Colors.textSecondary}
              value={deadlineContext}
              onChangeText={setDeadlineContext}
              returnKeyType="done"
              editable={hasDeadline}
            />
          </Animated.View>
        </Card>

        <Button title="Simpan" onPress={handleSave} disabled={!allAnswered} style={styles.saveBtn} />
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
    marginBottom: Spacing.md,
  },

  // Score badge
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: 16,
    marginBottom: Spacing.lg,
    gap: 4,
  },
  scoreNumber: { fontSize: 36, fontWeight: '800' },
  scoreMax: { fontSize: Typography.sizes.lg, color: Colors.textSecondary },
  scoreLabel: { fontSize: Typography.sizes.md, fontWeight: '600', marginLeft: Spacing.sm },

  // Question
  questionCard: { marginBottom: Spacing.sm },
  questionNum: {
    fontSize: Typography.sizes.xs,
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  questionText: {
    fontSize: Typography.sizes.md,
    color: Colors.text,
    marginBottom: Spacing.md,
    lineHeight: 24,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.xs,
  },
  optionBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
    borderRadius: 10,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  optionBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  optionValue: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
  },
  optionLabel: { fontSize: 9, color: Colors.textSecondary, marginTop: 2 },

  // Toggle
  toggleCard: { marginTop: Spacing.sm },
  toggleRow: { flexDirection: 'row', alignItems: 'center' },
  toggleLabel: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    color: Colors.text,
  },
  toggleSub: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  deadlineInputWrap: {
    marginTop: Spacing.sm,
  },
  deadlineInput: {
    backgroundColor: Colors.background,
    borderRadius: 10,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    fontSize: Typography.sizes.sm,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.primary + '60',
    height: 44,
  },

  saveBtn: { marginTop: Spacing.lg },
});
