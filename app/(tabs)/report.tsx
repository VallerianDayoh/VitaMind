import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useAction } from 'convex/react';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart, BarChart } from 'react-native-gifted-charts';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { useAuthStore } from '../../store/authStore';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Colors, Typography, Spacing } from '../../constants/theme';
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
            <View style={{ paddingTop: 16 }}>
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
                showLine={true}
                curved={true}
                color={Colors.primaryGlow}
                thickness={2}
                height={CHART_HEIGHT}
                maxValue={5}
                noOfSections={5}
                hideRules={true}
                hideYAxisText={true}
                yAxisColor={Colors.border}
                xAxisColor={Colors.border}
                spacing={46}
                initialSpacing={20}
                xAxisLabelTextStyle={{ color: Colors.textSecondary, fontSize: 10, marginTop: 4, width: 40, textAlign: 'center' }}
                isAnimated={true}
              />
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
            <View style={{ paddingTop: 16 }}>
              <BarChart
                data={dynamicSleepData.map((d) => {
                  const barColor = d.value < 6 ? Colors.error : Colors.primaryGlow;
                  return {
                    value: d.value,
                    label: d.label,
                    frontColor: barColor,
                    gradientColor: barColor + '40',
                  };
                })}
                showGradient={true}
                height={CHART_HEIGHT}
                maxValue={10}
                noOfSections={5}
                hideRules={true}
                hideYAxisText={true}
                yAxisColor={Colors.border}
                xAxisColor={Colors.border}
                spacing={46}
                initialSpacing={20}
                barWidth={18}
                barBorderRadius={6}
                xAxisLabelTextStyle={{ color: Colors.textSecondary, fontSize: 10, marginTop: 4, width: 40, textAlign: 'center' }}
                isAnimated={true}
                showReferenceLine1={true}
                referenceLine1Position={8}
                referenceLine1Config={{
                  color: Colors.success,
                  dashWidth: 4,
                  dashGap: 4,
                  thickness: 1,
                }}
              />
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
            <View style={{ paddingTop: 16 }}>
              <LineChart
                data={dynamicStressData.map((d) => ({
                  value: d.value,
                  label: d.label,
                  customDataPoint: () => {
                    if (d.annotation) {
                      return (
                        <View style={{
                          width: 14, height: 14, borderRadius: 7, backgroundColor: Colors.secondary,
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
                showLine={true}
                curved={true}
                color={Colors.primaryGlow}
                thickness={2}
                height={CHART_HEIGHT}
                maxValue={15}
                noOfSections={5}
                hideRules={true}
                hideYAxisText={true}
                yAxisColor={Colors.border}
                xAxisColor={Colors.border}
                spacing={46}
                initialSpacing={20}
                xAxisLabelTextStyle={{ color: Colors.textSecondary, fontSize: 10, marginTop: 4, width: 40, textAlign: 'center' }}
                isAnimated={true}
              />
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, justifyContent: 'center', gap: 6 }}>
                <Ionicons name="warning" size={14} color={Colors.error} />
                <Text style={{ fontSize: 11, color: Colors.textSecondary }}>Ada deadline/ujian terkait</Text>
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
