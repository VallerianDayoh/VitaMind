import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { Button } from '../../components/ui/Button';
import { Colors, Typography, Spacing } from '../../constants/theme';

export default function VitaTabScreen() {
  const router = useRouter();

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.iconWrap}>
          <Ionicons name="chatbubbles" size={64} color={Colors.primaryGlow} />
        </View>
        <Text style={styles.title}>Vita AI</Text>
        <Text style={styles.subtitle}>
          Teman virtual yang siap mendengarkan dan mendukung kesehatan mentalmu.
        </Text>
        <Button
          title="Mulai Percakapan"
          onPress={() => router.push('/ai/chatbot' as any)}
          style={styles.startBtn}
        />
        <TouchableOpacity
          style={styles.disclaimerWrap}
          activeOpacity={0.8}
        >
          <Text style={styles.disclaimerText}>
            ⚠️ Vita bukan pengganti profesional. Jika kamu dalam krisis, hubungi{' '}
            <Text style={styles.hotline}>119 ext 8</Text>.
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  iconWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.surfaceActive,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.sizes.xxxl,
    fontWeight: Typography.weights.bold,
    color: Colors.primaryGlow,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  startBtn: {
    width: '100%',
    marginBottom: Spacing.xl,
  },
  disclaimerWrap: {
    backgroundColor: 'rgba(255, 107, 122, 0.12)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 122, 0.25)',
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
  },
  disclaimerText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  hotline: {
    fontWeight: '700',
    color: Colors.error,
  },
});
