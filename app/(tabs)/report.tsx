import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { useAuthStore } from '../../store/authStore';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Colors, Typography, Spacing } from '../../constants/theme';

type TimeFilter = 'week' | 'month';

interface ChartData {
  label: string;
  value: number;
  annotation?: string;
}

const MOOD_SCORE: Record<string, number> = { rad: 5, good: 4, meh: 3, bad: 2, awful: 1 };

// ── Variables ──────────────────────────────────────────────
const CHART_HEIGHT = 120;
const PRIMARY_LIGHT = '#EEEAFF';
const PRIMARY_DARK = '#5046D5';
const DANGER_LIGHT = '#FFF5F5';

export default function ReportScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<TimeFilter>('week');
  
  // Real DB Data
  const convexUserId = useAuthStore((s) => s.convexUserId);
  const user = useAuthStore((s) => s.user);
  const userId = convexUserId as Id<"users">;

  const moodLogs = useQuery(api.moodLogs.getByUser, convexUserId ? { userId } : "skip") || [];
  const sleepLogs = useQuery(api.sleepLogs.getByUser, convexUserId ? { userId } : "skip") || [];
  const stressLogs = useQuery(api.stressLogs.getByUser, convexUserId ? { userId } : "skip") || [];

  // Generate dynamic chart data from logs (last 7 logs)
  const formatDays = (logs: any[], valueExtractor: (log: any) => number, annotator?: (log: any) => string | undefined): ChartData[] => {
    return [...logs].slice(0, 7).reverse().map(log => {
      // sleepLog uses log.date for string dates, others use log.timestamp
      const validDate = log.timestamp ? log.timestamp : log.date ? new Date(log.date).getTime() : log._creationTime;
      return {
        label: new Date(validDate).toLocaleDateString('id-ID', { weekday: 'short' }),
        value: valueExtractor(log),
        annotation: annotator ? annotator(log) : undefined
      };
    });
  };

  const dynamicMoodData = formatDays(moodLogs, m => MOOD_SCORE[m.mood] || 3);
  const dynamicSleepData = formatDays(sleepLogs, s => s.durationInHours);
  const dynamicStressData = formatDays(stressLogs, s => s.level, s => s.note || undefined);

  // Gemini Insight State
  const fetchInsight = useAction(api.gemini.generateInsight);
  const [insightText, setInsightText] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    async function getInsight() {
      if (!moodLogs || !sleepLogs || !stressLogs || !user?.name) return;
      if (moodLogs.length === 0 && sleepLogs.length === 0 && stressLogs.length === 0) {
        setInsightText("Belum ada data check-in terbaru. Usahakan untuk rutin membagikan kabarmu tiap hari ya!");
        return;
      }

      setIsGenerating(true);
      try {
        const text = await fetchInsight({
          userName: user.name.split(' ')[0],
          moodLogs: moodLogs.slice(0, 7),
          sleepLogs: sleepLogs.slice(0, 7),
          stressLogs: stressLogs.slice(0, 7),
        });
        setInsightText(text);
      } catch (err) {
        console.error("Insight error:", err);
        setInsightText("Gagal memuat analisis khusus dari Vita. Cek kembali koneksi internetmu.");
      } finally {
        setIsGenerating(false);
      }
    }

    if (!insightText && !isGenerating && moodLogs.length > 0) {
      getInsight();
    }
  }, [moodLogs, sleepLogs, stressLogs, user]);

  const isHighRisk = stressLogs && stressLogs.length > 0 && stressLogs[0].level >= 12; // Risk condition
  
  // Also guard empty charts check
  const hasData = dynamicMoodData.length > 0 || dynamicSleepData.length > 0 || dynamicStressData.length > 0;

  const renderEmptyState = () => (
    <View style={styles.emptyWrap}>
      <Text style={styles.emptyText}>Data tidak cukup untuk filter ini.</Text>
    </View>
  );

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.pageTitle}>Insight Diri</Text>

        {/* 1. Filter Waktu */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterBtn, filter === 'week' && styles.filterBtnActive]}
            onPress={() => setFilter('week')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterText, filter === 'week' && styles.filterTextActive]}>
              Minggu Ini
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterBtn, filter === 'month' && styles.filterBtnActive]}
            onPress={() => setFilter('month')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterText, filter === 'month' && styles.filterTextActive]}>
              Bulan Ini
            </Text>
          </TouchableOpacity>
        </View>

        {/* 2. AI Insight & Indikator Risiko */}
        {isHighRisk && (
          <View style={styles.riskBanner}>
            <View style={styles.riskHeader}>
              <Ionicons name="warning" size={20} color={Colors.error} />
              <Text style={styles.riskTitle}>Perhatian Khusus</Text>
            </View>
            <Text style={styles.riskBody}>
              Kondisimu tampaknya sedang kurang baik dan penuh tekanan. Pertimbangkan untuk mengambil istirahat sejenak atau berbicara dengan konselor.
            </Text>
            <Button 
              title="Cari Bantuan" 
              variant="outline" 
              onPress={() => alert('Diarahkan ke daftar konselor profesional...')}
              style={styles.riskButton}
              textStyle={{ color: Colors.error }}
            />
          </View>
        )}

        <Card style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <Text style={styles.insightIcon}>✨</Text>
            <Text style={styles.insightTitle}>Analisis Vita</Text>
          </View>
          {isGenerating ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 }}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={[styles.insightText, { fontStyle: 'italic' }]}>Vita sedang membaca datamu...</Text>
            </View>
          ) : (
            <Text style={styles.insightText}>
              {insightText || "Data siap."}
            </Text>
          )}
        </Card>

        {/* 3. Visualisasi Tren Mood */}
        <Card style={styles.chartCard}>
          <Text style={styles.chartTitle}>Tren Mood</Text>
          <Text style={styles.chartSubtitle}>Skala 1 (Sangat Buruk) - 5 (Sangat Baik)</Text>
          {filter === 'week' && hasData ? (
            <View style={styles.chartPlot}>
              {dynamicMoodData.map((d, i) => {
                const bottomPos = (d.value / 5) * CHART_HEIGHT;
                const dotColor = d.value <= 2 ? Colors.error : d.value >= 4 ? Colors.success : Colors.warning;
                return (
                  <View key={`mood-${i}`} style={styles.chartColumn}>
                    <View style={[styles.dotWrapper, { height: CHART_HEIGHT }]}>
                      <View style={[styles.pointDot, { bottom: bottomPos, backgroundColor: dotColor }]} />
                    </View>
                    <Text style={styles.chartXLabel}>{d.label}</Text>
                  </View>
                );
              })}
            </View>
          ) : (
            renderEmptyState()
          )}
        </Card>

        {/* Pola Tidur */}
        <Card style={styles.chartCard}>
          <Text style={styles.chartTitle}>Pola Tidur</Text>
          <Text style={styles.chartSubtitle}>Durasi tidur harian (Target: 8 Jam)</Text>
          {filter === 'week' && hasData ? (
            <View style={styles.chartPlot}>
              <View style={[styles.targetLine, { bottom: (8 / 10) * CHART_HEIGHT }]} />
              {dynamicSleepData.map((d, i) => {
                const barH = (d.value / 10) * CHART_HEIGHT;
                const barColor = d.value < 6 ? Colors.error : Colors.primary;
                return (
                  <View key={`sleep-${i}`} style={styles.chartColumn}>
                    <View style={[styles.barWrapper, { height: CHART_HEIGHT }]}>
                      <View style={[styles.verticalBar, { height: barH, backgroundColor: barColor }]} />
                    </View>
                    <Text style={styles.chartXLabel}>{d.label}</Text>
                  </View>
                );
              })}
            </View>
          ) : (
            renderEmptyState()
          )}
        </Card>

        {/* Level Stres */}
        <Card style={styles.chartCard}>
          <Text style={styles.chartTitle}>Level Stres & Akademik</Text>
          <Text style={styles.chartSubtitle}>Skor PSS (0-15)</Text>
          {filter === 'week' && hasData ? (
            <View style={styles.chartPlot}>
              {dynamicStressData.map((d, i) => {
                const bottomPos = (d.value / 15) * CHART_HEIGHT;
                return (
                  <View key={`stress-${i}`} style={styles.chartColumn}>
                    <View style={[styles.dotWrapper, { height: CHART_HEIGHT }]}>
                      <View style={[styles.pointDot, { bottom: bottomPos, backgroundColor: Colors.secondary }]} />
                      {/* Anotasi Spesifik */}
                      {d.annotation && (
                        <View style={[styles.annotationBox, { bottom: bottomPos + 8 }]}>
                          <Text style={styles.annotationText} numberOfLines={2}>{d.annotation}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.chartXLabel}>{d.label}</Text>
                  </View>
                );
              })}
            </View>
          ) : (
            renderEmptyState()
          )}
        </Card>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: Spacing.xxl,
  },
  pageTitle: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  
  // Filter Header
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    padding: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  filterBtnActive: {
    backgroundColor: PRIMARY_LIGHT,
  },
  filterText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: PRIMARY_DARK,
    fontWeight: Typography.weights.bold,
  },

  // Risk Banner
  riskBanner: {
    backgroundColor: DANGER_LIGHT,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFD6D6',
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  riskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    gap: Spacing.xs,
  },
  riskTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.error,
  },
  riskBody: {
    fontSize: Typography.sizes.sm,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  riskButton: {
    borderColor: Colors.error, 
    borderWidth: 1,
    paddingVertical: 8,
  },

  // Insight UI
  insightCard: {
    backgroundColor: '#FAF9FF',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: PRIMARY_LIGHT,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    gap: 8,
  },
  insightIcon: {
    fontSize: 20,
  },
  insightTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: PRIMARY_DARK,
  },
  insightText: {
    fontSize: Typography.sizes.sm,
    color: Colors.text,
    lineHeight: 22,
  },

  // Chart general config
  chartCard: {
    marginBottom: Spacing.lg,
  },
  chartTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
  },
  chartSubtitle: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  chartPlot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: CHART_HEIGHT + 30, // Plot + Label Space
  },
  chartColumn: {
    flex: 1,
    alignItems: 'center',
  },
  chartXLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  
  // Point/Scatter Chart Specific (Mood & Stress)
  dotWrapper: {
    width: '100%',
    alignItems: 'center',
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pointDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    zIndex: 2,
    backgroundColor: Colors.primary,
  },

  // Bar Chart Specific (Sleep)
  barWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  verticalBar: {
    width: 18,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    backgroundColor: Colors.primary,
  },
  targetLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    borderBottomWidth: 1,
    borderBottomColor: Colors.success,
    borderStyle: 'dashed',
    zIndex: 1,
  },

  // Annotations
  annotationBox: {
    position: 'absolute',
    backgroundColor: Colors.text,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 10,
    minWidth: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2, 
  },
  annotationText: {
    color: '#FFF',
    fontSize: 7,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  // Error/Empty state
  emptyWrap: {
    height: CHART_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: Typography.sizes.sm,
    fontStyle: 'italic',
  },
});
