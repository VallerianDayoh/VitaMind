import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';
import { MoodType } from '../../types';

// ── Data Constants ─────────────────────────────────────────

const MOODS: { type: MoodType; icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { type: 'awful', icon: 'sad', label: 'Sangat Buruk' },
  { type: 'bad', icon: 'sad-outline', label: 'Buruk' },
  { type: 'meh', icon: 'remove-circle-outline', label: 'Biasa' },
  { type: 'good', icon: 'happy-outline', label: 'Baik' },
  { type: 'rad', icon: 'happy', label: 'Sangat Baik' },
];

type SleepQuality = 'excellent' | 'good' | 'fair' | 'poor';
const SLEEP_QUALITIES: { value: SleepQuality; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'excellent', label: 'Nyenyak', icon: 'moon' },
  { value: 'good', label: 'Cukup', icon: 'happy-outline' },
  { value: 'fair', label: 'Gelisah', icon: 'sad-outline' },
  { value: 'poor', label: 'Insomnia', icon: 'alert-circle-outline' },
];

const STRESS_OPTIONS = [
  { value: 0, label: 'Tidak pernah' },
  { value: 1, label: 'Jarang' },
  { value: 2, label: 'Kadang' },
  { value: 3, label: 'Sangat sering' },
];

const ACTIVITIES: { key: string; label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }[] = [
  { key: 'exercise', label: 'Olahraga', icon: 'dumbbell' },
  { key: 'walk', label: 'Jalan kaki', icon: 'walk' },
  { key: 'yoga', label: 'Yoga', icon: 'yoga' },
  { key: 'cycle', label: 'Bersepeda', icon: 'bike' },
  { key: 'other', label: 'Lainnya', icon: 'target' },
];

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const MINS = ['00', '15', '30', '45'];

// ── Component ──────────────────────────────────────────────

export default function UnifiedCheckinScreen() {
  const router = useRouter();
  const convexUserId = useAuthStore((s) => s.convexUserId);
  const addMoodLog = useMutation(api.moodLogs.add);
  const addSleepLog = useMutation(api.sleepLogs.add);
  const addStressLog = useMutation(api.stressLogs.add);
  const addActivityLog = useMutation(api.activityLogs.add);
  const [isSaving, setIsSaving] = useState(false);

  // Mood state
  const [mood, setMood] = useState<MoodType | null>(null);
  const [moodNote, setMoodNote] = useState('');

  // Sleep state
  const [bedH, setBedH] = useState('22');
  const [bedM, setBedM] = useState('30');
  const [wakeH, setWakeH] = useState('06');
  const [wakeM, setWakeM] = useState('00');
  const [sleepQuality, setSleepQuality] = useState<SleepQuality | null>(null);

  // Stress state
  const [stressLevel, setStressLevel] = useState<number | null>(null);
  const [hasDeadline, setHasDeadline] = useState(false);
  const [deadlineContext, setDeadlineContext] = useState('');

  // Reanimated values for deadline context expansion
  const deadlineHeight = useSharedValue(0);
  const deadlineOpacity = useSharedValue(0);

  const DEADLINE_INPUT_HEIGHT = 52;

  const handleToggleDeadline = useCallback((value: boolean) => {
    setHasDeadline(value);
    const timing = { duration: 280, easing: Easing.out(Easing.cubic) };
    deadlineHeight.value = withTiming(value ? DEADLINE_INPUT_HEIGHT : 0, timing);
    deadlineOpacity.value = withTiming(value ? 1 : 0, { duration: 220, easing: Easing.out(Easing.ease) });
  }, [deadlineHeight, deadlineOpacity]);

  const deadlineAnimStyle = useAnimatedStyle(() => ({
    height: deadlineHeight.value,
    opacity: deadlineOpacity.value,
    overflow: 'hidden',
  }));

  // Activity state
  const [activity, setActivity] = useState<string | null>(null);
  const [activityDuration, setActivityDuration] = useState('');

  // Computed sleep duration
  const sleepDuration = useMemo(() => {
    const bedMins = parseInt(bedH) * 60 + parseInt(bedM);
    const wakeMins = parseInt(wakeH) * 60 + parseInt(wakeM);
    let diff = wakeMins - bedMins;
    if (diff <= 0) diff += 24 * 60;
    return { h: Math.floor(diff / 60), m: diff % 60, total: diff / 60 };
  }, [bedH, bedM, wakeH, wakeM]);

  const handleSave = async () => {
    if (!convexUserId) {
      Alert.alert('Error', 'Sesi tidak valid. Silakan login ulang.');
      return;
    }
    const uid = convexUserId as Id<"users">;
    setIsSaving(true);

    try {
      const promises: Promise<any>[] = [];

      if (mood) {
        promises.push(addMoodLog({
          userId: uid,
          mood,
          note: moodNote.trim() || undefined,
        }));
      }
      if (sleepQuality) {
        promises.push(addSleepLog({
          userId: uid,
          durationInHours: Math.round(sleepDuration.total * 10) / 10,
          quality: sleepQuality,
          bedTime: `${bedH}:${bedM}`,
          wakeTime: `${wakeH}:${wakeM}`,
          date: new Date().toISOString().split('T')[0],
        }));
      }
      if (stressLevel !== null) {
        promises.push(addStressLog({
          userId: uid,
          level: stressLevel,
          hasDeadline,
          note: deadlineContext.trim() || undefined,
        }));
      }
      if (activity && activityDuration) {
        promises.push(addActivityLog({
          userId: uid,
          activity,
          durationMinutes: parseInt(activityDuration) || 0,
        }));
      }

      await Promise.all(promises);
      Alert.alert('Tersimpan', 'Check-in harian kamu berhasil dicatat!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      console.error('Check-in error:', err);
      Alert.alert('Gagal', 'Terjadi kesalahan saat menyimpan. Coba lagi.');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Render Helpers ───────────────────────────────────────

  const renderTimePicker = (
    label: string,
    h: string,
    setH: (v: string) => void,
    m: string,
    setM: (v: string) => void,
  ) => (
    <View style={styles.timeBlock}>
      <Text style={styles.timeLabel}>{label}</Text>
      <View style={styles.timeRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chipRow}>
            {HOURS.map((v) => (
              <TouchableOpacity
                key={`${label}-h-${v}`}
                style={[styles.timeChip, h === v && styles.timeChipActive]}
                onPress={() => setH(v)}
              >
                <Text style={[styles.timeChipText, h === v && styles.timeChipTextActive]}>{v}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        <Text style={styles.timeColon}>:</Text>
        <View style={styles.chipRow}>
          {MINS.map((v) => (
            <TouchableOpacity
              key={`${label}-m-${v}`}
              style={[styles.timeChip, m === v && styles.timeChipActive]}
              onPress={() => setM(v)}
            >
              <Text style={[styles.timeChipText, m === v && styles.timeChipTextActive]}>{v}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.pageTitle}>Check-in Harian</Text>
        <Text style={styles.pageSubtitle}>Isi secepat yang kamu bisa — tidak harus semua</Text>

        {/* ─── 1. MOOD ────────────────────────────────── */}
        <Card>
          <Text style={styles.cardTitle}>Bagaimana perasaanmu hari ini?</Text>
          <View style={styles.moodRow}>
            {MOODS.map((m) => {
              const active = mood === m.type;
              return (
                <TouchableOpacity
                  key={m.type}
                  style={[styles.moodBtn, active && styles.moodBtnActive]}
                  onPress={() => setMood(m.type)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={m.icon}
                    size={active ? 36 : 30}
                    color={active ? Colors.primaryGlow : 'rgba(255,255,255,0.8)'}
                  />
                  <Text style={[styles.moodLabel, active && styles.moodLabelActive]}>
                    {m.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <TextInput
            style={styles.noteInput}
            placeholder="Ceritakan kalau mau..."
            placeholderTextColor="rgba(255,255,255,0.4)"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            value={moodNote}
            onChangeText={setMoodNote}
          />
        </Card>

        {/* ─── 2. TIDUR ───────────────────────────────── */}
        <Card>
          <Text style={styles.cardTitle}>Kualitas istirahatmu semalam?</Text>

          {renderTimePicker('Tidur', bedH, setBedH, bedM, setBedM)}
          {renderTimePicker('Bangun', wakeH, setWakeH, wakeM, setWakeM)}

          <View style={styles.sleepBadge}>
            <Ionicons name="moon" size={18} color={Colors.primaryGlow} />
            <Text style={styles.sleepBadgeText}>
              Kamu tidur ~
              <Text style={styles.sleepBold}>
                {sleepDuration.h} jam{sleepDuration.m > 0 ? ` ${sleepDuration.m} menit` : ''}
              </Text>
            </Text>
          </View>

          <Text style={styles.pillHeading}>Kualitas</Text>
          <View style={styles.pillRow}>
            {SLEEP_QUALITIES.map((q) => {
              const active = sleepQuality === q.value;
              return (
                <TouchableOpacity
                  key={q.value}
                  style={[styles.pill, active && styles.pillActive]}
                  onPress={() => setSleepQuality(q.value)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={q.icon}
                    size={active ? 18 : 16}
                    color={active ? '#FFF' : 'rgba(255,255,255,0.8)'}
                  />
                  <Text style={[styles.pillText, active && styles.pillTextActive]}>
                    {q.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* ─── 3. STRES ───────────────────────────────── */}
        <Card>
          <Text style={styles.cardTitle}>Beban yang kamu rasakan minggu ini?</Text>
          <Text style={styles.stressQ}>Seberapa sering kamu merasa overwhelmed?</Text>
          <View style={styles.stressRow}>
            {STRESS_OPTIONS.map((o) => {
              const active = stressLevel === o.value;
              return (
                <TouchableOpacity
                  key={o.value}
                  style={[styles.stressBtn, active && styles.stressBtnActive]}
                  onPress={() => setStressLevel(o.value)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.stressValue, active && { color: '#FFF' }]}>{o.value}</Text>
                  <Text style={[styles.stressLabel, active && { color: '#FFF' }]}>{o.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleTextWrap}>
              <Text style={styles.toggleTitle}>Ada deadline atau ujian minggu ini?</Text>
              <Text style={styles.toggleSub}>Konteks akademik UNKLAB</Text>
            </View>
            <Switch
              value={hasDeadline}
              onValueChange={handleToggleDeadline}
              trackColor={{ false: 'rgba(255,255,255,0.15)', true: Colors.primaryGlow + '80' }}
              thumbColor={hasDeadline ? Colors.primaryGlow : '#555'}
            />
          </View>

          {/* Progressive Disclosure: Deadline Context Input */}
          <Animated.View style={[styles.deadlineInputWrap, deadlineAnimStyle]}>
            <TextInput
              style={styles.deadlineInput}
              placeholder="Mata kuliah/kegiatan apa? (Opsional)"
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={deadlineContext}
              onChangeText={setDeadlineContext}
              returnKeyType="done"
              editable={hasDeadline}
            />
          </Animated.View>
        </Card>

        {/* ─── 4. AKTIVITAS ───────────────────────────── */}
        <Card>
          <Text style={styles.cardTitle}>Gerakanmu hari ini?</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.activityScroll}>
            <View style={styles.chipRow}>
              {ACTIVITIES.map((a) => {
                const active = activity === a.key;
                return (
                  <TouchableOpacity
                    key={a.key}
                    style={[styles.activityChip, active && styles.activityChipActive]}
                    onPress={() => setActivity(a.key)}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons
                      name={a.icon}
                      size={18}
                      color={active ? '#FFF' : 'rgba(255,255,255,0.8)'}
                    />
                    <Text style={[styles.activityLabel, active && { color: '#FFF', fontWeight: '700' }]}>
                      {a.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          <Text style={styles.pillHeading}>Durasi (menit)</Text>
          <View style={styles.durationRow}>
            <TouchableOpacity
              onPress={() => {
                const n = Math.max(0, (parseInt(activityDuration) || 0) - 5);
                setActivityDuration(n > 0 ? String(n) : '');
              }}
            >
              <Ionicons name="remove-circle-outline" size={32} color={Colors.primaryGlow} />
            </TouchableOpacity>
            <TextInput
              style={styles.durationInput}
              value={activityDuration}
              onChangeText={(t) => setActivityDuration(t.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor="rgba(255,255,255,0.4)"
              maxLength={3}
            />
            <TouchableOpacity
              onPress={() =>
                setActivityDuration(String((parseInt(activityDuration) || 0) + 5))
              }
            >
              <Ionicons name="add-circle-outline" size={32} color={Colors.primaryGlow} />
            </TouchableOpacity>
          </View>
        </Card>

        {/* ─── 5. SIMPAN ──────────────────────────────── */}
        <Button title="Simpan Check-in" onPress={handleSave} style={styles.saveBtn} />
      </ScrollView>
    </ScreenWrapper>
  );
}

// ── Styles ─────────────────────────────────────────────────

const styles = StyleSheet.create({
  scroll: { paddingBottom: Spacing.xxl + 24 },

  pageTitle: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
  },
  pageSubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
    marginTop: 4,
  },

  cardTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },

  // ── Mood ─────────────────────────────────────────────
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  moodBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: 2,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
    width: '18.5%',
  },
  moodBtnActive: {
    borderColor: Colors.primaryGlow,
    backgroundColor: Colors.surfaceActive,
  },
  moodEmoji: { marginBottom: 4 },
  moodLabel: { fontSize: 10, color: Colors.textSecondary, textAlign: 'center' },
  moodLabelActive: { color: Colors.primaryGlow, fontWeight: '700' },

  noteInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    fontSize: Typography.sizes.sm,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 72,
  },

  // ── Sleep ────────────────────────────────────────────
  timeBlock: { marginBottom: Spacing.md },
  timeLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  timeRow: { flexDirection: 'row', alignItems: 'center' },
  timeColon: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginHorizontal: Spacing.sm,
  },
  chipRow: { flexDirection: 'row', gap: Spacing.xs },
  timeChip: {
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timeChipActive: {
    backgroundColor: Colors.primaryGlow,
    borderColor: Colors.primaryGlow,
  },
  timeChipText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
  },
  timeChipTextActive: { color: '#FFF' },

  sleepBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceActive,
    paddingVertical: Spacing.sm + 2,
    borderRadius: 12,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  sleepBadgeText: { fontSize: Typography.sizes.sm, color: Colors.textPrimary },
  sleepBold: { fontWeight: '700', color: Colors.primaryGlow },

  pillHeading: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  pillRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: Spacing.sm - 2,
    paddingHorizontal: Spacing.md,
    borderRadius: 999,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pillActive: {
    backgroundColor: Colors.primaryGlow,
    borderColor: Colors.primaryGlow,
  },
  pillText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textPrimary,
  },
  pillTextActive: { color: '#FFF', fontWeight: '700' },

  // ── Stress ───────────────────────────────────────────
  stressQ: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    lineHeight: 22,
  },
  stressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  stressBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stressBtnActive: {
    backgroundColor: Colors.primaryGlow,
    borderColor: Colors.primaryGlow,
  },
  stressValue: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  stressLabel: { fontSize: 9, color: Colors.textSecondary, marginTop: 2 },

  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
  },
  toggleTextWrap: { flex: 1, marginRight: Spacing.md },
  toggleTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
  },
  toggleSub: { fontSize: Typography.sizes.xs, color: Colors.textSecondary, marginTop: 2 },

  deadlineInputWrap: {
    marginTop: Spacing.sm,
  },
  deadlineInput: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    fontSize: Typography.sizes.sm,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.primaryGlow + '60',
    height: 44,
  },

  // ── Activity ─────────────────────────────────────────
  activityScroll: { marginBottom: Spacing.md },
  activityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: 999,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  activityChipActive: {
    backgroundColor: Colors.primaryGlow,
    borderColor: Colors.primaryGlow,
  },
  activityIcon: { },
  activityLabel: { fontSize: Typography.sizes.sm, color: Colors.textPrimary },

  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  durationInput: {
    fontSize: 40,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    minWidth: 90,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primaryGlow,
    paddingVertical: Spacing.xs,
  },

  // ── Save ─────────────────────────────────────────────
  saveBtn: { marginTop: Spacing.lg },
});
