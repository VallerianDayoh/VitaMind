import { Ionicons } from '@expo/vector-icons';
import { useAction, useQuery } from 'convex/react';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BarChart, LineChart } from 'react-native-gifted-charts';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { Colors, Spacing, Typography } from '../../constants/theme';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { useAuthStore } from '../../store/authStore';
import { processMoodChartData, processSleepChartData, processStressChartData } from '../../utils/chartHelpers';

type TimeFilter = 'week' | 'month';

interface ChartData {
  label: string;
  value: number;
  annotation?: string;
}

// ── Variables ──────────────────────────────────────────────
const CHART_HEIGHT = 120;

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

  // Process & aggregate chart data (one point per day)
  const dynamicMoodData = processMoodChartData(moodLogs);
  const dynamicSleepData = processSleepChartData(sleepLogs);
  const dynamicStressData = processStressChartData(stressLogs);

  // Gemini Insight State (Manual Trigger)
  const fetchInsight = useAction(api.ai.generateInsight);
  const [insightText, setInsightText] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleGenerateInsight() {
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
      setInsightText("Gagal memuat analisis dari Vita. Mungkin terlalu banyak request, silakan tunggu sebentar dan coba lagi nanti.");
    } finally {
      setIsGenerating(false);
    }
  }

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

        <Card style={styles.insightCard} isActive>
          <View style={styles.insightHeader}>
            <Ionicons name="sparkles" size={20} color={Colors.primaryGlow} />
            <Text style={styles.insightTitle}>Analisis Vita</Text>
          </View>
          {isGenerating ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 }}>
              <ActivityIndicator size="small" color={Colors.primaryGlow} />
              <Text style={[styles.insightText, { fontStyle: 'italic' }]}>Vita sedang membaca datamu...</Text>
            </View>
          ) : insightText ? (
            <View>
              <Text style={styles.insightText}>{insightText}</Text>
              <TouchableOpacity onPress={handleGenerateInsight} style={styles.regenerateBtn} activeOpacity={0.7}>
                <Ionicons name="refresh-outline" size={16} color={Colors.primaryGlow} />
                <Text style={styles.regenerateText}>Buat Ulang Analisis</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <Text style={styles.insightText}>
                Dapatkan analisis mingguan khusus untukmu berdasarkan rutinitas tidur, mood, dan tingkat stres yang telah kamu bagikan.
              </Text>
              <Button
                title="Generate Analisis Vita"
                onPress={handleGenerateInsight}
                style={{ marginTop: 12 }}
              />
            </View>
          )}
        </Card>

        {/* 3. Visualisasi Tren Mood */}
        <Card style={styles.chartCard}>
          <Text style={styles.chartTitle}>Tren Mood</Text>
          <Text style={styles.chartSubtitle}>Skala 1 (Sangat Buruk) - 5 (Sangat Baik)</Text>
          {filter === 'week' && hasData ? (
            <View style={{ flexDirection: 'row', width: '100%', paddingTop: 16 }}>
              {/* Absolute positioning mapping exactly to the 5 grid lines of CHART_HEIGHT=120 */}
              <View style={{ width: 24, height: CHART_HEIGHT, marginRight: Spacing.xs, position: 'relative' }}>
                <View style={{ position: 'absolute', top: -8 }}><Ionicons name="happy" size={16} color={Colors.success} /></View>
                <View style={{ position: 'absolute', top: 16 }}><Ionicons name="happy-outline" size={16} color={Colors.primaryGlow} /></View>
                <View style={{ position: 'absolute', top: 40 }}><Ionicons name="remove-circle-outline" size={16} color={Colors.warning} /></View>
                <View style={{ position: 'absolute', top: 64 }}><Ionicons name="sad-outline" size={16} color={Colors.error} /></View>
                <View style={{ position: 'absolute', top: 88 }}><Ionicons name="sad" size={16} color="#FF4D4D" /></View>
              </View>
              <View style={{ flex: 1 }}>
                <LineChart
                  data={dynamicMoodData.map((d) => ({
                    value: d.value,
                    label: d.label,
                    customDataPoint: () => {
                      const dotColor = d.value <= 2 ? Colors.error : d.value >= 4 ? Colors.success : Colors.warning;
                      return (
                        <View style={{
                          width: 12, height: 12, borderRadius: 6, backgroundColor: dotColor,
                          borderWidth: 2, borderColor: Colors.surface
                        }} />
                      );
                    }
                  }))}
                  areaChart={true}
                  curved={true}
                  color={Colors.primaryGlow}
                  startFillColor={Colors.primaryGlow}
                  endFillColor={Colors.backgroundBottom}
                  startOpacity={0.4}
                  endOpacity={0.05}
                  thickness={3}
                  height={CHART_HEIGHT}
                  maxValue={5}
                  noOfSections={5}
                  hideRules={true}
                  hideAxesAndRules={true}
                  hideYAxisText={true}
                  yAxisColor="transparent"
                  xAxisColor="transparent"
                  adjustToWidth={true}
                  initialSpacing={10}
                  endSpacing={10}
                  xAxisLabelTextStyle={{ color: Colors.textSecondary, fontSize: 10, marginTop: 4, textAlign: 'center' }}
                  isAnimated={false}
                />
              </View>
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
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', width: '100%', paddingTop: 16 }}>
              {/* Custom Y-axis labels */}
              <View style={{ justifyContent: 'space-between', height: CHART_HEIGHT, marginRight: Spacing.sm, paddingBottom: 22 }}>
                <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>10h</Text>
                <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}> 8h</Text>
                <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}> 6h</Text>
                <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}> 4h</Text>
                <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}> 2h</Text>
              </View>
              {/* Chart container with overflow hidden to clip reference line */}
              <View style={{ flex: 1, overflow: 'hidden', borderRadius: 8 }}>
                <BarChart
                  data={dynamicSleepData.map((d) => {
                    const isLow = d.value < 6;
                    return {
                      value: d.value,
                      label: d.label,
                      frontColor: isLow ? Colors.error : Colors.primaryGlow,
                      gradientColor: isLow ? '#FF6B7A20' : '#B388EB20',
                      topLabelComponent: () => (
                        <Text style={{ fontSize: 9, color: Colors.textSecondary, textAlign: 'center', marginBottom: 2 }}>
                          {d.value.toFixed(1)}
                        </Text>
                      ),
                    };
                  })}
                  showGradient={true}
                  height={CHART_HEIGHT}
                  maxValue={10}
                  noOfSections={5}
                  hideRules={true}
                  hideYAxisText={true}
                  yAxisThickness={0}
                  xAxisThickness={0}
                  yAxisColor="transparent"
                  xAxisColor="transparent"
                  adjustToWidth={true}
                  initialSpacing={14}
                  endSpacing={14}
                  barWidth={28}
                  barBorderRadius={10}
                  barBorderTopLeftRadius={10}
                  barBorderTopRightRadius={10}
                  xAxisLabelTextStyle={{ color: Colors.textSecondary, fontSize: 10, marginTop: 4, textAlign: 'center' }}
                  isAnimated={false}
                  showReferenceLine1={true}
                  referenceLine1Position={8}
                  referenceLine1Config={{
                    color: Colors.success,
                    dashWidth: 5,
                    dashGap: 3,
                    thickness: 1.5,
                  }}
                />
              </View>
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
            <View style={{ flexDirection: 'row', width: '100%', paddingTop: 16 }}>
              <View style={{ width: 14, height: CHART_HEIGHT, marginRight: Spacing.sm, position: 'relative' }}>
                <Text style={{ position: 'absolute', top: -6, fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: 'bold' }}>15</Text>
                <Text style={{ position: 'absolute', top: 54, fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: 'bold' }}> 7</Text>
                <Text style={{ position: 'absolute', top: 114, fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: 'bold' }}> 0</Text>
              </View>
              <View style={{ flex: 1 }}>
                <LineChart
                  data={dynamicStressData.map((d) => ({
                    value: d.value,
                    label: d.label,
                    customDataPoint: () => {
                      if (d.annotation) {
                        return (
                          <View style={{
                            width: 14, height: 14, borderRadius: 7, backgroundColor: Colors.warning,
                            borderWidth: 3, borderColor: Colors.error, alignItems: 'center', justifyContent: 'center'
                          }} />
                        );
                      }
                      return (
                        <View style={{
                          width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.secondary,
                          borderWidth: 2, borderColor: Colors.surface
                        }} />
                      );
                    },
                    dataPointLabelComponent: () => {
                      if (d.annotation) {
                        return (
                          <View style={{ position: 'absolute', top: -16, left: -6 }}>
                            <Ionicons name="warning" size={14} color={Colors.error} />
                          </View>
                        );
                      }
                      return null;
                    }
                  }))}
                  areaChart={true}
                  curved={true}
                  color={Colors.secondary}
                  startFillColor={Colors.secondary}
                  endFillColor={Colors.backgroundBottom}
                  startOpacity={0.4}
                  endOpacity={0.05}
                  thickness={3}
                  height={CHART_HEIGHT}
                  maxValue={15}
                  noOfSections={5}
                  hideRules={true}
                  hideAxesAndRules={true}
                  hideYAxisText={true}
                  yAxisColor="transparent"
                  xAxisColor="transparent"
                  adjustToWidth={true}
                  initialSpacing={10}
                  endSpacing={10}
                  xAxisLabelTextStyle={{ color: Colors.textSecondary, fontSize: 10, marginTop: 4, textAlign: 'center' }}
                  isAnimated={false}
                />
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, justifyContent: 'center', gap: 6 }}>
                  <Ionicons name="warning" size={14} color={Colors.error} />
                  <Text style={{ fontSize: 11, color: Colors.textSecondary }}>Ada deadline/ujian terkait</Text>
                </View>
              </View>
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
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },

  // Filter Header
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    padding: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 12,
  },
  filterBtnActive: {
    backgroundColor: Colors.surfaceActive,
  },
  filterText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: Colors.primaryGlow,
    fontWeight: Typography.weights.bold,
  },

  // Risk Banner
  riskBanner: {
    backgroundColor: 'rgba(255, 107, 122, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 122, 0.25)',
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
    color: Colors.textSecondary,
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
    marginBottom: Spacing.lg,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    gap: Spacing.sm,
  },
  insightTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.primaryGlow,
  },
  insightText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  regenerateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: Spacing.md,
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  regenerateText: {
    fontSize: Typography.sizes.sm,
    color: Colors.primaryGlow,
    fontWeight: Typography.weights.medium,
  },

  // Chart general config
  chartCard: {
    marginBottom: Spacing.lg,
  },
  chartTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  chartSubtitle: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
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
