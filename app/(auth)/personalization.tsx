import React, { useState } from 'react';
import { View, Text, StyleSheet, Keyboard, TouchableWithoutFeedback, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { Button } from '../../components/ui/Button';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';
import { Id } from '../../convex/_generated/dataModel';

export default function PersonalizationScreen() {
  const router = useRouter();
  const { convexUserId, login } = useAuthStore();
  const updateUser = useMutation(api.users.update);

  const [nickname, setNickname] = useState('');
  const [major, setMajor] = useState('');
  const [semester, setSemester] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleStart = async () => {
    if (!convexUserId) {
      alert('Sesi tidak valid. Silakan login ulang.');
      router.replace('/(auth)/login');
      return;
    }

    setIsLoading(true);
    try {
      // Update user profile in Convex
      await updateUser({
        id: convexUserId as Id<"users">,
        name: nickname.trim() || 'Sahabat VitaMind',
        major: major.trim() || undefined,
        semester: semester ? parseInt(semester) : undefined,
      });

      // Set auth state (triggers redirect to tabs)
      login({
        id: convexUserId,
        _id: convexUserId,
        name: nickname.trim() || 'Sahabat VitaMind',
        email: '',
        createdAt: Date.now(),
      });
    } catch (err) {
      console.error('Personalization error:', err);
      alert('Terjadi kesalahan. Coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenWrapper withKeyboard>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <Text style={styles.emoji}>✨</Text>
          <Text style={styles.title}>Personalisasi</Text>
          <Text style={styles.body}>Bantu kami mengenalmu lebih baik.</Text>

          <View style={styles.formWrap}>
            <TextInput
              style={styles.formInput}
              placeholder="Nama Panggilan"
              placeholderTextColor={Colors.textSecondary}
              value={nickname}
              onChangeText={setNickname}
            />
            <TextInput
              style={styles.formInput}
              placeholder="Jurusan (misal: Sistem Informasi)"
              placeholderTextColor={Colors.textSecondary}
              value={major}
              onChangeText={setMajor}
            />
            <TextInput
              style={styles.formInput}
              placeholder="Semester (misal: 6)"
              placeholderTextColor={Colors.textSecondary}
              value={semester}
              onChangeText={setSemester}
              keyboardType="number-pad"
            />
          </View>

          <Button
            title="Mulai Perjalanan 🚀"
            onPress={handleStart}
            loading={isLoading}
            style={styles.startBtn}
          />
        </View>
      </TouchableWithoutFeedback>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: 100,
  },
  emoji: {
    fontSize: 72,
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.sizes.xxxl,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  body: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xl,
  },
  formWrap: {
    width: '100%',
    marginBottom: Spacing.lg,
  },
  formInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    fontSize: Typography.sizes.md,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  startBtn: {
    width: '100%',
  },
});
