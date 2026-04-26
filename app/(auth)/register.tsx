import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Colors, Typography, Spacing, GlowShadow } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type GenderOption = 'Laki-laki' | 'Perempuan' | 'Lainnya';

// ── Step Indicator ─────────────────────────────────────────
const StepIndicator: React.FC<{ current: number; total: number }> = ({ current, total }) => (
  <View style={indicatorStyles.container}>
    {Array.from({ length: total }, (_, i) => (
      <View
        key={i}
        style={[
          indicatorStyles.dot,
          i + 1 === current && indicatorStyles.dotActive,
          i + 1 < current && indicatorStyles.dotDone,
        ]}
      />
    ))}
    <Text style={indicatorStyles.label}>
      {current} dari {total}
    </Text>
  </View>
);

const indicatorStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: Spacing.lg,
    marginTop: Spacing.sm,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  dotActive: {
    width: 28,
    borderRadius: 14,
    backgroundColor: Colors.primaryGlow,
    ...GlowShadow,
    shadowColor: Colors.primaryGlow,
    shadowOpacity: 0.7,
    shadowRadius: 10,
  },
  dotDone: {
    backgroundColor: Colors.success,
  },
  label: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
  },
});

// ── Main Component ─────────────────────────────────────────
export default function RegisterScreen() {
  const router = useRouter();
  const createUser = useMutation(api.users.create);

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Step 1 — Account
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Step 2 — Academic
  const [university, setUniversity] = useState('');
  const [major, setMajor] = useState('');
  const [semester, setSemester] = useState('');
  const [batch, setBatch] = useState('');
  const [gender, setGender] = useState<GenderOption | null>(null);

  // ── Validation ─────────────────────────────────────────
  const validateStep1 = (): boolean => {
    const errs: Record<string, string> = {};

    if (!name.trim()) errs.name = 'Nama lengkap wajib diisi.';
    if (!email.trim()) {
      errs.email = 'Email wajib diisi.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Format email tidak valid.';
    }
    if (!password) {
      errs.password = 'Password wajib diisi.';
    } else if (password.length < 8) {
      errs.password = 'Password minimal 8 karakter.';
    }
    if (!confirmPassword) {
      errs.confirmPassword = 'Konfirmasi password wajib diisi.';
    } else if (password !== confirmPassword) {
      errs.confirmPassword = 'Password tidak cocok.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = (): boolean => {
    const errs: Record<string, string> = {};

    if (!university.trim()) errs.university = 'Universitas wajib diisi.';
    if (!major.trim()) errs.major = 'Jurusan wajib diisi.';
    if (semester) {
      const sem = parseInt(semester, 10);
      if (isNaN(sem) || sem < 1 || sem > 14) errs.semester = 'Semester antara 1–14.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Step Navigation ────────────────────────────────────
  const animateTransition = () => {
    LayoutAnimation.configureNext(
      LayoutAnimation.create(
        350,
        LayoutAnimation.Types.easeInEaseOut,
        LayoutAnimation.Properties.opacity,
      ),
    );
  };

  const goNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    Keyboard.dismiss();
    animateTransition();
    setErrors({});
    if (step === 2) {
      handleRegister();
    } else {
      setStep((s) => s + 1);
    }
  };

  const goBack = () => {
    Keyboard.dismiss();
    animateTransition();
    setErrors({});
    setStep((s) => s - 1);
  };

  // ── Submit ─────────────────────────────────────────────
  const handleRegister = async () => {
    setIsLoading(true);
    try {
      const sem = semester ? parseInt(semester, 10) : undefined;
      const userId = await createUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        major: major.trim() || undefined,
        semester: sem,
        university: university.trim() || undefined,
        batch: batch.trim() || undefined,
        gender: gender || undefined,
      });

      // Persist auth
      const authStore = useAuthStore.getState();
      authStore.setConvexUserId(String(userId));
      authStore.login({
        id: String(userId),
        _id: String(userId),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        createdAt: Date.now(),
      });

      animateTransition();
      setStep(3);
    } catch (err) {
      console.error('Register error:', err);
      setErrors({ submit: 'Terjadi kesalahan saat mendaftar. Coba lagi.' });
    } finally {
      setIsLoading(false);
    }
  };

  // ── Render Steps ───────────────────────────────────────

  const renderStep1 = () => (
    <Card style={styles.card}>
      <Text style={styles.cardTitle}>Data Akun</Text>
      <Text style={styles.cardSubtitle}>Buat akun VitaMind-mu dulu ya!</Text>

      <Input
        label="Nama Lengkap"
        placeholder="Masukkan nama lengkapmu"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        error={errors.name}
      />
      <Input
        label="Email"
        placeholder="Masukkan email aktifmu"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        error={errors.email}
      />
      <Input
        label="Password"
        placeholder="Minimal 8 karakter"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        error={errors.password}
      />
      <Input
        label="Konfirmasi Password"
        placeholder="Ulangi kata sandimu"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        error={errors.confirmPassword}
      />

      <Button
        title="Lanjut →"
        onPress={goNext}
        style={styles.primaryBtn}
      />
    </Card>
  );

  const renderStep2 = () => (
    <Card style={styles.card}>
      <Text style={styles.cardTitle}>Profil Akademik</Text>
      <Text style={styles.cardSubtitle}>Agar kami bisa lebih memahami konteksmu.</Text>

      <Input
        label="Universitas"
        placeholder="Contoh: Universitas Klabat"
        value={university}
        onChangeText={setUniversity}
        error={errors.university}
      />
      <Input
        label="Jurusan / Program Studi"
        placeholder="Contoh: Sistem Informasi"
        value={major}
        onChangeText={setMajor}
        error={errors.major}
      />

      <View style={styles.row}>
        <View style={{ flex: 1, marginRight: Spacing.sm }}>
          <Input
            label="Semester"
            placeholder="1–14"
            value={semester}
            onChangeText={setSemester}
            keyboardType="number-pad"
            error={errors.semester}
          />
        </View>
        <View style={{ flex: 1, marginLeft: Spacing.sm }}>
          <Input
            label="Angkatan"
            placeholder="Contoh: 2026"
            value={batch}
            onChangeText={setBatch}
            keyboardType="number-pad"
          />
        </View>
      </View>

      {/* Gender Pills */}
      <Text style={styles.inputLabel}>Jenis Kelamin</Text>
      <View style={styles.pillRow}>
        {(['Laki-laki', 'Perempuan', 'Lainnya'] as GenderOption[]).map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.pill,
              gender === option && styles.pillActive,
            ]}
            onPress={() => setGender(option)}
            activeOpacity={0.75}
          >
            <Text
              style={[
                styles.pillText,
                gender === option && styles.pillTextActive,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {errors.submit && (
        <Text style={styles.submitError}>{errors.submit}</Text>
      )}

      <View style={styles.buttonRow}>
        <Button
          title="← Kembali"
          onPress={goBack}
          variant="outline"
          style={styles.halfBtn}
        />
        <Button
          title="Lanjut →"
          onPress={goNext}
          loading={isLoading}
          style={styles.halfBtn}
        />
      </View>
    </Card>
  );

  const renderStep3 = () => (
    <View style={styles.successContainer}>
      <View style={styles.checkCircle}>
        <Ionicons name="checkmark-circle" size={96} color={Colors.success} />
      </View>

      <Text style={styles.successTitle}>Akun berhasil dibuat!</Text>
      <Text style={styles.successSubtitle}>
        Selamat datang di VitaMind, {name.split(' ')[0]}. {'\n'}
        Mari mulai perjalanan kesehatan mentalmu.
      </Text>

      <Card style={styles.featureCard}>
        {FEATURES.map((feat, i) => (
          <View key={i} style={[styles.featureRow, i < FEATURES.length - 1 && styles.featureDivider]}>
            <View style={[styles.featureIconWrap, { backgroundColor: feat.bg }]}>
              <Ionicons name={feat.icon as any} size={22} color={feat.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.featureTitle}>{feat.title}</Text>
              <Text style={styles.featureDesc}>{feat.desc}</Text>
            </View>
          </View>
        ))}
      </Card>

      <Button
        title="Mulai Sekarang"
        onPress={() => router.replace('/(tabs)' as any)}
        style={styles.startBtn}
      />
    </View>
  );

  return (
    <ScreenWrapper withKeyboard>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          {step < 3 && (
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => (step === 1 ? router.back() : goBack())}
                style={styles.backBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Buat Akun</Text>
              <View style={{ width: 36 }} />
            </View>
          )}

          <StepIndicator current={step} total={3} />

          {/* Step content */}
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </ScrollView>
      </TouchableWithoutFeedback>
    </ScreenWrapper>
  );
}

// ── Feature list for Step 3 ────────────────────────────────
const FEATURES = [
  {
    icon: 'happy-outline',
    title: 'Track Mood Harian',
    desc: 'Pantau emosi dan temukan polanya.',
    color: '#B388EB',
    bg: 'rgba(179, 136, 235, 0.15)',
  },
  {
    icon: 'moon-outline',
    title: 'Analisis Pola Tidur',
    desc: 'Optimalkan kualitas istirahatmu.',
    color: '#5BFFB0',
    bg: 'rgba(91, 255, 176, 0.12)',
  },
  {
    icon: 'sparkles-outline',
    title: 'AI Insight dari Vita',
    desc: 'Dapatkan analisis personalisasi mingguan.',
    color: '#FFCF5C',
    bg: 'rgba(255, 207, 92, 0.12)',
  },
];

// ── Styles ─────────────────────────────────────────────────
const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingBottom: Spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
    marginTop: Spacing.sm,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },

  // Card
  card: {
    marginBottom: Spacing.md,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  cardTitle: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  cardSubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },

  // Buttons
  primaryBtn: {
    marginTop: Spacing.md,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: Spacing.lg,
  },
  halfBtn: {
    flex: 1,
  },

  // Row helper
  row: {
    flexDirection: 'row',
  },

  // Gender pills
  inputLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    fontWeight: '500' as const,
  },
  pillRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: Spacing.md,
  },
  pill: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  pillActive: {
    backgroundColor: 'rgba(179, 136, 235, 0.18)',
    borderColor: Colors.primaryGlow,
  },
  pillText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.weights.medium,
  },
  pillTextActive: {
    color: Colors.primaryGlow,
    fontWeight: Typography.weights.bold,
  },

  submitError: {
    color: Colors.error,
    fontSize: Typography.sizes.sm,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },

  // ── Step 3: Success ──────────────────────────────────
  successContainer: {
    alignItems: 'center',
    paddingTop: Spacing.lg,
  },
  checkCircle: {
    marginBottom: Spacing.md,
    ...GlowShadow,
    shadowColor: Colors.success,
    shadowOpacity: 0.5,
    shadowRadius: 30,
  },
  successTitle: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  successSubtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },

  // Feature card
  featureCard: {
    width: '100%',
    marginBottom: Spacing.lg,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 14,
  },
  featureDivider: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  featureIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  startBtn: {
    width: '100%',
    marginBottom: Spacing.xl,
  },
});
