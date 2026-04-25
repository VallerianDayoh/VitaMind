import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const [reminderEnabled, setReminderEnabled] = useState(true);

  // Stats Data
  const convexUserId = useAuthStore((s) => s.convexUserId);
  const userId = convexUserId as Id<"users">;

  const moodLogs = useQuery(api.moodLogs.getByUser, convexUserId ? { userId } : "skip") || [];
  const sleepLogs = useQuery(api.sleepLogs.getByUser, convexUserId ? { userId } : "skip") || [];

  const totalCheckIns = moodLogs.length;

  const MOOD_SCORE: Record<string, number> = { rad: 5, good: 4, meh: 3, bad: 2, awful: 1 };
  const getAverageMoodLabel = () => {
    if (moodLogs.length === 0) return "-";
    const sum = moodLogs.reduce((acc, log) => acc + (MOOD_SCORE[log.mood] || 3), 0);
    const avg = sum / moodLogs.length;
    if (avg >= 4.5) return "Luar Biasa";
    if (avg >= 3.5) return "Baik";
    if (avg >= 2.5) return "Biasa";
    if (avg >= 1.5) return "Buruk";
    return "Sangat Buruk";
  };

  const getAverageSleep = () => {
    if (sleepLogs.length === 0) return "-";
    const sum = sleepLogs.reduce((acc, log) => acc + log.durationInHours, 0);
    return (sum / sleepLogs.length).toFixed(1) + " Jam";
  };

  const handleLogout = () => {
    Alert.alert('Konfirmasi', 'Yakin ingin keluar?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Ya', style: 'destructive', onPress: logout },
    ]);
  };

  const handleDeleteData = () => {
    Alert.alert(
      'Hapus Data',
      'Tindakan ini tidak bisa dibatalkan. Semua data kamu akan terhapus.',
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Hapus', style: 'destructive', onPress: () => console.log('Data dihapus') },
      ]
    );
  };

  const getInitials = (name?: string) => {
    if (!name) return 'VM';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        
        {/* 1. Identitas User */}
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
          </View>
          <Text style={styles.name}>{user?.name || 'Tamu'}</Text>
          <Text style={styles.email}>{user?.email || 'email@contoh.com'}</Text>

          <View style={styles.academicInfo}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Fakultas Ilmu Komputer</Text>
            </View>
            <Text style={styles.universityText}>Sistem Informasi • Universitas Klabat (UNKLAB) • Semester 6</Text>
          </View>
          
          <Button 
            title="Edit Profil" 
            variant="outline" 
            onPress={() => console.log('Edit Profile pressed')}
            style={styles.editBtn}
          />
        </View>

        {/* 2. Statistik Ringkas */}
        <Text style={styles.sectionTitle}>Ringkasan Statistik</Text>
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
            <Text style={styles.statValue}>{totalCheckIns} Hari</Text>
            <Text style={styles.statLabel}>Total Check-in</Text>
          </Card>
          <Card style={styles.statCard}>
            <Ionicons name="happy-outline" size={20} color={Colors.success} />
            <Text style={styles.statValue}>{getAverageMoodLabel()}</Text>
            <Text style={styles.statLabel}>Rata-rata Mood</Text>
          </Card>
          <Card style={styles.statCard}>
            <Ionicons name="moon-outline" size={20} color={Colors.secondary} />
            <Text style={styles.statValue}>{getAverageSleep()}</Text>
            <Text style={styles.statLabel}>Rata-rata Tidur</Text>
          </Card>
        </View>

        {/* 3. Pengaturan & Notifikasi */}
        <Text style={styles.sectionTitle}>Pengaturan Aplikasi</Text>
        <Card style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingTextWrap}>
              <Text style={styles.settingTitle}>Reminder Harian</Text>
              <Text style={styles.settingSubtitle}>Jam Reminder: 21.00</Text>
            </View>
            <Switch
              value={reminderEnabled}
              onValueChange={setReminderEnabled}
              trackColor={{ false: Colors.border, true: Colors.primary + '80' }}
              thumbColor={reminderEnabled ? Colors.primary : '#F4F3F4'}
            />
          </View>
          <View style={styles.divider} />
          
          <View style={styles.settingRow}>
            <View style={styles.settingTextWrap}>
              <Text style={styles.settingTitle}>Privasi & Keamanan</Text>
              <Text style={styles.settingHint}>
                Data kamu dienkripsi dan disimpan aman di Convex. Kami tidak membagikan data kepada pihak ketiga.
              </Text>
            </View>
          </View>
          <View style={styles.divider} />

          <TouchableOpacity style={styles.deleteDataRow} onPress={handleDeleteData}>
            <Ionicons name="trash-outline" size={18} color={Colors.error} />
            <Text style={styles.deleteDataText}>Hapus Semua Data Saya</Text>
          </TouchableOpacity>
        </Card>

        {/* 4. SOS Card */}
        <Card style={styles.sosCard}>
          <View style={styles.sosHeader}>
            <Ionicons name="warning" size={24} color={Colors.error} />
            <Text style={styles.sosTitle}>Butuh Bantuan Segera?</Text>
          </View>
          <Text style={styles.sosDesc}>
            Kamu tidak harus melewati ini sendirian. Hubungi tenaga profesional:
          </Text>
          
          <TouchableOpacity style={styles.sosLinkBtn} onPress={() => Linking.openURL('tel:119')}>
            <Ionicons name="call" size={16} color={Colors.surface} />
            <Text style={styles.sosLinkText}>Kemenkes & Sejiwa (119 ext 8)</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.sosLinkBtn, { backgroundColor: '#5A52D5' }]} 
            onPress={() => console.log('Konseling UNKLAB')}
          >
            <Ionicons name="business" size={16} color={Colors.surface} />
            <Text style={styles.sosLinkText}>Konseling Kampus UNKLAB</Text>
          </TouchableOpacity>
        </Card>

        {/* 5. Aksi Logout */}
        <Button 
          title="Keluar" 
          onPress={handleLogout} 
          style={styles.logoutBtn}
          textStyle={styles.logoutBtnText}
        />

      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: Spacing.xxl,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
    marginTop: Spacing.md,
  },
  
  // Identitas
  profileSection: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
    marginTop: Spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  avatarText: {
    fontSize: Typography.sizes.xxxl,
    fontWeight: Typography.weights.bold,
    color: Colors.surface,
  },
  name: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  academicInfo: {
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.sm,
    borderRadius: 8,
    marginBottom: Spacing.lg,
    width: '100%',
  },
  badge: {
    backgroundColor: '#EEEAFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginBottom: 6,
  },
  badgeText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  universityText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  editBtn: {
    width: 140,
    paddingVertical: 10,
  },

  // Statistik Ringkas
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xs,
  },
  statValue: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginTop: Spacing.sm,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  // Pengaturan
  settingsCard: {
    paddingHorizontal: 0,
    paddingBottom: 0,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  settingTextWrap: {
    flex: 1,
    paddingRight: Spacing.md,
  },
  settingTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    color: Colors.text,
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
  },
  settingHint: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: Spacing.md,
  },
  deleteDataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  deleteDataText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.error,
  },

  // SOS Card
  sosCard: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FFD6D6',
    borderWidth: 1,
    marginBottom: Spacing.xxl,
  },
  sosHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  sosTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.error,
  },
  sosDesc: {
    fontSize: Typography.sizes.sm,
    color: Colors.text,
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },
  sosLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.error,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  sosLinkText: {
    color: Colors.surface,
    fontWeight: Typography.weights.bold,
    fontSize: Typography.sizes.sm,
  },

  // Logout
  logoutBtn: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  logoutBtnText: {
    color: Colors.text,
  },
});
