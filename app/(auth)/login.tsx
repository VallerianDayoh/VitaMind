import React, { useState } from 'react';
import { View, Text, StyleSheet, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const createUser = useMutation(api.users.create);

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Mohon isi email dan password Anda.');
      return;
    }

    setIsLoading(true);
    try {
      // Create or get user in Convex
      const userName = email.split('@')[0];
      const userId = await createUser({
        name: userName,
        email: email.trim().toLowerCase(),
      });

      // Store userId & Set Auth State
      const authStore = useAuthStore.getState();
      authStore.setConvexUserId(String(userId));
      authStore.login({
        id: String(userId),
        _id: String(userId),
        name: userName,
        email: email.trim().toLowerCase(),
        createdAt: Date.now(),
      });
    } catch (err) {
      console.error('Login error:', err);
      alert('Terjadi kesalahan saat masuk. Coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenWrapper withKeyboard>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>VitaMind</Text>
            <Text style={styles.subtitle}>
              Kesehatan mental dan pola hidup Anda dalam satu genggaman.
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Email"
              placeholder="Masukkan email Anda"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            <Input
              label="Password"
              placeholder="Masukkan kata sandi"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
            />

            <Button
              title="Masuk"
              onPress={handleLogin}
              loading={isLoading}
              style={styles.loginButton}
            />

            <Button
              title="Belum punya akun? Daftar sekarang"
              onPress={() => alert('Fitur pendaftaran belum tersedia.')}
              variant="outline"
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
  },
  header: {
    marginBottom: Spacing.xxl + Spacing.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: Spacing.md,
  },
  subtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: Spacing.lg,
  },
  form: {
    width: '100%',
  },
  loginButton: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
});
