import { ModernCard } from '@/src/components/ModernCard';
import { WeeklyChart } from '@/src/components/WeeklyChart';
import { Colors } from '@/src/constants/Colors';
import { useMoodStore } from '@/src/store/useMoodStore';
import { useRouter } from 'expo-router';
import {
  Bell,
  ChevronRight,
  GlassWater,
  Moon,
  Smile,
  Sparkles
} from 'lucide-react-native';
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const { currentMood, lastCheckIn, sleepHours, waterGrams } = useMoodStore();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Selamat Pagi,</Text>
            <Text style={styles.userName}>Mahasiswa UNKLAB</Text>
          </View>
          <TouchableOpacity style={styles.notificationBtn}>
            <Bell size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Tombol AI Chat (Kartu Biru) */}
        <TouchableOpacity activeOpacity={0.9} onPress={() => router.push('/chat')}>
          <ModernCard style={styles.aiCard}>
            <View style={styles.aiHeader}>
              <Sparkles size={20} color="#FFF" />
              <Text style={styles.aiTitle}>AI Chat & Insight</Text>
              <View style={styles.chatBadge}>
                <Text style={styles.chatBadgeText}>Mulai Chat</Text>
              </View>
            </View>
            <Text style={styles.aiText}>
              "Ada yang ingin kamu ceritakan hari ini? Klik di sini untuk ngobrol dengan asisten AI-mu."
            </Text>
          </ModernCard>
        </TouchableOpacity>

        {/* Aksi Cepat */}
        <Text style={styles.sectionTitle}>Aksi Cepat</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/mood')}>
            <View style={[styles.actionIcon, { backgroundColor: '#FEF3C7' }]}>
              <Smile size={24} color="#D97706" />
            </View>
            <Text style={styles.actionLabel}>Mood</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/sleep')}>
            <View style={[styles.actionIcon, { backgroundColor: '#DBEAFE' }]}>
              <Moon size={24} color="#2563EB" />
            </View>
            <Text style={styles.actionLabel}>{sleepHours > 0 ? `${sleepHours} Jam` : 'Tidur'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/water')}>
            <View style={[styles.actionIcon, { backgroundColor: '#D1FAE5' }]}>
              <GlassWater size={24} color="#059669" />
            </View>
            <Text style={styles.actionLabel}>{waterGrams > 0 ? `${waterGrams}ml` : 'Air'}</Text>
          </TouchableOpacity>
        </View>

        {/* Statistik */}
        <Text style={styles.sectionTitle}>Statistik Mood Mingguan</Text>
        <ModernCard>
          <WeeklyChart />
        </ModernCard>

        {/* Status Hari Ini */}
        <Text style={styles.sectionTitle}>Status Hari Ini</Text>
        <TouchableOpacity style={styles.statusCard} onPress={() => router.push('/mood')}>
          <Text style={styles.statusEmoji}>{currentMood || '🤔'}</Text>
          <View style={styles.statusInfo}>
            <Text style={styles.statusTitle}>{currentMood ? 'Mood Terpantau' : 'Belum Check-in'}</Text>
            <Text style={styles.statusSubtitle}>
              {lastCheckIn ? `Update terakhir jam ${lastCheckIn}` : 'Klik untuk mencatat perasaanmu'}
            </Text>
          </View>
          <ChevronRight size={20} color={Colors.textSecondary} />
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { padding: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  greeting: { fontSize: 16, color: Colors.textSecondary },
  userName: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  notificationBtn: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', elevation: 2 },
  aiCard: { backgroundColor: '#6366F1', padding: 20 },
  aiHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  aiTitle: { color: '#FFF', fontWeight: '700', fontSize: 16, flex: 1 },
  aiText: { color: '#E0E7FF', fontSize: 14, lineHeight: 20 },
  chatBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  chatBadgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginTop: 30, marginBottom: 15 },
  actionGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  actionItem: { width: '30%', backgroundColor: '#FFF', padding: 15, borderRadius: 20, alignItems: 'center', elevation: 2 },
  actionIcon: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  actionLabel: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary, textAlign: 'center' },
  statusCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 20, borderRadius: 20, elevation: 2 },
  statusEmoji: { fontSize: 40, marginRight: 15 },
  statusInfo: { flex: 1 },
  statusTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  statusSubtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 }
});