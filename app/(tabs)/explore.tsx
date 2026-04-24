import { ModernCard } from '@/src/components/ModernCard';
import { WeeklyChart } from '@/src/components/WeeklyChart';
import { Colors } from '@/src/constants/Colors';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function ExploreScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Analisis Insights</Text>
        <Text style={styles.subtitle}>Pantau perkembangan mood dan kesehatanmu minggu ini.</Text>

        <Text style={styles.sectionTitle}>Ringkasan Mood</Text>
        <ModernCard>
          <WeeklyChart />
        </ModernCard>

        <View style={styles.statsRow}>
          <ModernCard style={styles.statCard}>
            <Text style={styles.statLabel}>Rata-rata Tidur</Text>
            <Text style={styles.statValue}>7.5 Jam</Text>
          </ModernCard>
          <ModernCard style={styles.statCard}>
            <Text style={styles.statLabel}>Mood Dominan</Text>
            <Text style={styles.statValue}>😊</Text>
          </ModernCard>
        </View>

        <ModernCard style={styles.aiAdviceCard}>
          <Text style={styles.adviceTitle}>Saran Kesehatan ✨</Text>
          <Text style={styles.adviceText}>
            "Kamu terlihat kurang tidur di hari Senin. Cobalah untuk tidur 30 menit lebih awal malam ini untuk menjaga fokus belajarmu."
          </Text>
        </ModernCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  container: { padding: 24 },
  title: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary, marginBottom: 8 },
  subtitle: { fontSize: 14, color: Colors.textSecondary, marginBottom: 25 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginBottom: 15 },
  statsRow: { flexDirection: 'row', gap: 12, marginTop: 20 },
  statCard: { flex: 1, alignItems: 'center', padding: 15 },
  statLabel: { fontSize: 12, color: Colors.textSecondary, marginBottom: 5 },
  statValue: { fontSize: 18, fontWeight: '800', color: Colors.primary },
  aiAdviceCard: { marginTop: 20, backgroundColor: '#EEF2FF', borderLeftWidth: 4, borderLeftColor: Colors.primary },
  adviceTitle: { fontWeight: '700', color: Colors.primary, marginBottom: 8 },
  adviceText: { fontSize: 14, color: Colors.textPrimary, lineHeight: 20 }
});