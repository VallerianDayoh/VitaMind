import { Colors } from '@/src/constants/Colors';
import { useMoodStore } from '@/src/store/useMoodStore';
import { useRouter } from 'expo-router';
import {
  Award,
  BookOpen,
  ChevronRight,
  LogOut,
  Mail,
  MapPin,
  Settings,
  ShieldCheck,
  User
} from 'lucide-react-native';
import React from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function ProfileScreen() {
  const router = useRouter();
  
  // Mengambil data reaktif dari Zustand Store agar profil selalu update
  const { sleepHours, waterGrams } = useMoodStore();

  const menuItems = [
    { icon: <User size={20} color="#4B5563" />, label: 'Edit Profil' },
    { icon: <ShieldCheck size={20} color="#4B5563" />, label: 'Keamanan Akun' },
    { icon: <Settings size={20} color="#4B5563" />, label: 'Pengaturan Notifikasi' },
  ];

  // Fungsi untuk Log Out
  const handleLogout = () => {
    // Mengarahkan kembali ke halaman login yang berada di folder (auth)
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* Bagian Atas / Header Profil */}
        <View style={styles.header}>
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=400&fit=crop' }} 
              style={styles.profileImage} 
            />
            <TouchableOpacity style={styles.editBadge}>
              <Text style={styles.editBadgeText}>Ubah</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.userName}>Mahasiswa UNKLAB</Text>
          <View style={styles.locationRow}>
            <MapPin size={14} color="#6B7280" />
            <Text style={styles.userBio}>Airmadidi, Sulawesi Utara</Text>
          </View>
        </View>

        {/* Kartu Informasi Akademik */}
        <View style={styles.infoRow}>
          <View style={styles.infoBox}>
            <Mail size={18} color={Colors.primary} />
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>student@unklab.ac.id</Text>
          </View>
          <View style={styles.infoBox}>
            <BookOpen size={18} color={Colors.primary} />
            <Text style={styles.infoLabel}>Fakultas</Text>
            <Text style={styles.infoValue}>Ilmu Komputer</Text>
          </View>
        </View>

        {/* Ringkasan Statistik Kesehatan (Data dari Zustand) */}
        <Text style={styles.sectionTitle}>Statistik Kesehatan Saya</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.statIconCircle, { backgroundColor: '#FEF3C7' }]}>
              <Award size={20} color="#D97706" />
            </View>
            <Text style={styles.statNumber}>{sleepHours} Jam</Text>
            <Text style={styles.statLabel}>Tidur Semalam</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={[styles.statIconCircle, { backgroundColor: '#DBEAFE' }]}>
              <Award size={20} color="#2563EB" />
            </View>
            <Text style={styles.statNumber}>{waterGrams}ml</Text>
            <Text style={styles.statLabel}>Asupan Air</Text>
          </View>
        </View>

        {/* Daftar Menu Pengaturan */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity key={index} style={styles.menuItem}>
              <View style={styles.menuIconWrapper}>{item.icon}</View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <ChevronRight size={18} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
          
          {/* Tombol Log Out */}
          <TouchableOpacity 
            style={[styles.menuItem, { borderBottomWidth: 0 }]} 
            onPress={handleLogout}
          >
            <View style={[styles.menuIconWrapper, { backgroundColor: '#FEE2E2' }]}>
              <LogOut size={20} color="#EF4444" />
            </View>
            <Text style={[styles.menuLabel, { color: '#EF4444' }]}>Log Out</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footerText}>MentalHealth App v1.0 • UNKLAB Project</Text>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { alignItems: 'center', paddingVertical: 35, backgroundColor: '#FFF', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 2 },
  imageContainer: { position: 'relative', marginBottom: 15 },
  profileImage: { width: 110, height: 110, borderRadius: 55, borderWidth: 4, borderColor: Colors.primary },
  editBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: Colors.primary, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15, borderWidth: 3, borderColor: '#FFF' },
  editBadgeText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  userName: { fontSize: 22, fontWeight: '800', color: '#111827' },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 4 },
  userBio: { fontSize: 14, color: '#6B7280' },
  infoRow: { flexDirection: 'row', padding: 20, gap: 15, marginTop: -10 },
  infoBox: { flex: 1, backgroundColor: '#FFF', padding: 15, borderRadius: 20, alignItems: 'center', elevation: 2 },
  infoLabel: { fontSize: 11, color: '#9CA3AF', marginTop: 8, marginBottom: 2 },
  infoValue: { fontSize: 12, fontWeight: '700', color: '#374151', textAlign: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginHorizontal: 25, marginTop: 15, marginBottom: 12 },
  statsContainer: { flexDirection: 'row', paddingHorizontal: 20, gap: 15, marginBottom: 25 },
  statCard: { flex: 1, backgroundColor: '#FFF', padding: 20, borderRadius: 24, alignItems: 'center', elevation: 2 },
  statIconCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  statNumber: { fontSize: 18, fontWeight: '800', color: '#111827' },
  statLabel: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  menuContainer: { backgroundColor: '#FFF', marginHorizontal: 20, borderRadius: 24, paddingVertical: 8, elevation: 2, marginBottom: 20 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  menuIconWrapper: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: '#374151' },
  footerText: { textAlign: 'center', color: '#9CA3AF', fontSize: 12, marginBottom: 10 }
});