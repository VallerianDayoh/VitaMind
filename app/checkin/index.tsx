import React, { useState, useMemo } from 'react';
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
import { useRouter } from 'expo-router';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';
import { MoodType } from '../../types';

// ── Data Constants ─────────────────────────────────────────

const MOODS: { type: MoodType; emoji: string; label: string }[] = [
  { type: 'awful', emoji: '😭', label: 'Sangat Buruk' },
  { type: 'bad', emoji: '😟', label: 'Buruk' },
  { type: 'meh', emoji: '😐', label: 'Biasa' },
  { type: 'good', emoji: '😊', label: 'Baik' },
  { type: 'rad', emoji: '🤩', label: 'Sangat Baik' },
];

type SleepQuality = 'excellent' | 'good' | 'fair' | 'poor';
const SLEEP_QUALITIES: { value: SleepQuality; label: string }[] = [
  { value: 'excellent', label: 'Nyenyak' },
  { value: 'good', label: 'Cukup' },
  { value: 'fair', label: 'Gelisah' },
  { value: 'poor', label: 'Insomnia' },
];

const STRESS_OPTIONS = [
  { value: 0, label: 'Tidak pernah' },
  { value: 1, label: 'Jarang' },
  { value: 2, label: 'Kadang' },
  { value: 3, label: 'Sangat sering' },
];

const ACTIVITIES = [
  { key: 'exercise', label: 'Olahraga', icon: '🏋️' },
  { key: 'walk', label: 'Jalan kaki', icon: '🚶' },
  { key: 'yoga', label: 'Yoga', icon: '🧘' },
  { key: 'cycle', label: 'Bersepeda', icon: '🚴' },
  { key: 'other', label: 'Lainnya', icon: '🎯' },
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
      Alert.alert('Tersimpan ✅', 'Check-in harian kamu berhasil dicatat!', [
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
                  <Text style={styles.moodEmoji}>{m.emoji}</Text>
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
            placeholderTextColor={Colors.textSecondary}
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
            <Ionicons name="moon" size={18} color={Colors.primary} />
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
              onValueChange={setHasDeadline}
              trackColor={{ false: Colors.border, true: Colors.primary + '80' }}
              thumbColor={hasDeadline ? Colors.primary : '#F4F3F4'}
            />
          </View>
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
                    <Text style={styles.activityIcon}>{a.icon}</Text>
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
              <Ionicons name="remove-circle-outline" size={32} color={Colors.primary} />
            </TouchableOpacity>
            <TextInput
              style={styles.durationInput}
              value={activityDuration}
              onChangeText={(t) => setActivityDuration(t.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor={Colors.textSecondary}
              maxLength={3}
            />
            <TouchableOpacity
              onPress={() =>
                setActivityDuration(String((parseInt(activityDuration) || 0) + 5))
              }
            >
              <Ionicons name="add-circle-outline" size={32} color={Colors.primary} />
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
    color: Colors.text,
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
    color: Colors.text,
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
    borderColor: Colors.primary,
    backgroundColor: '#EEEAFF',
  },
  moodEmoji: { fontSize: 34, marginBottom: 4 },
  moodLabel: { fontSize: 10, color: Colors.textSecondary, textAlign: 'center' },
  moodLabelActive: { color: Colors.primary, fontWeight: '700' },

  noteInput: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: Spacing.md,
    fontSize: Typography.sizes.sm,
    color: Colors.text,
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
    color: Colors.text,
    marginHorizontal: Spacing.sm,
  },
  chipRow: { flexDirection: 'row', gap: Spacing.xs },
  timeChip: {
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timeChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  timeChipText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    color: Colors.text,
  },
  timeChipTextActive: { color: '#FFF' },

  sleepBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEEAFF',
    paddingVertical: Spacing.sm + 2,
    borderRadius: 10,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  sleepBadgeText: { fontSize: Typography.sizes.sm, color: Colors.text },
  sleepBold: { fontWeight: '700', color: Colors.primary },

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
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pillText: {
    fontSize: Typography.sizes.sm,
    color: Colors.text,
  },
  pillTextActive: { color: '#FFF', fontWeight: '700' },

  // ── Stress ───────────────────────────────────────────
  stressQ: {
    fontSize: Typography.sizes.sm,
    color: Colors.text,
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
    borderRadius: 10,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stressBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  stressValue: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
  },
  stressLabel: { fontSize: 9, color: Colors.textSecondary, marginTop: 2 },

  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: Spacing.md,
  },
  toggleTextWrap: { flex: 1, marginRight: Spacing.md },
  toggleTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.text,
  },
  toggleSub: { fontSize: Typography.sizes.xs, color: Colors.textSecondary, marginTop: 2 },

  // ── Activity ─────────────────────────────────────────
  activityScroll: { marginBottom: Spacing.md },
  activityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: 24,
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  activityChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  activityIcon: { fontSize: 18 },
  activityLabel: { fontSize: Typography.sizes.sm, color: Colors.text },

  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  durationInput: {
    fontSize: 40,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    minWidth: 90,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
    paddingVertical: Spacing.xs,
  },

  // ── Save ─────────────────────────────────────────────
  saveBtn: { marginTop: Spacing.lg },
});
