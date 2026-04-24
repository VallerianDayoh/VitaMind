import { useRouter } from 'expo-router';
import { ChevronRight, LogOut, LucideIcon, Settings, Shield, User } from 'lucide-react-native';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/Colors';

export default function ProfileScreen() {
  const router = useRouter();

  const handleLogout = () => {
    // Nantinya di sini kita akan menghapus token di SecureStore/AsyncStorage
    // Untuk sekarang, kita langsung arahkan kembali ke Login
    router.replace('/(auth)/login');
  };

const MenuItem = ({ 
  icon: Icon, 
  title, 
  color = Colors.textPrimary 
}: { 
  icon: LucideIcon; 
  title: string; 
  color?: string 
}) => (
  <TouchableOpacity style={styles.menuItem}>
    <View style={styles.menuLeft}>
      <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
        <Icon color={color} size={22} />
      </View>
      <Text style={[styles.menuTitle, { color }]}>{title}</Text>
    </View>
    <ChevronRight color={Colors.textSecondary} size={20} />
  </TouchableOpacity>
);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <User color={Colors.primary} size={40} />
        </View>
        <Text style={styles.userName}>Mahasiswa UNKLAB</Text>
        <Text style={styles.userEmail}>mahasiswa@unklab.ac.id</Text>
      </View>

      <View style={styles.menuSection}>
        <MenuItem icon={Settings} title="Pengaturan Akun" />
        <MenuItem icon={Shield} title="Privasi & Keamanan" />
        
        <View style={styles.divider} />
        
        {/* Tombol Log Out */}
        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <View style={styles.menuLeft}>
            <View style={[styles.iconContainer, { backgroundColor: '#FEE2E2' }]}>
              <LogOut color="#EF4444" size={22} />
            </View>
            <Text style={[styles.menuTitle, { color: '#EF4444' }]}>Keluar Akun</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { alignItems: 'center', marginVertical: 40 },
  avatar: { 
    width: 100, height: 100, borderRadius: 50, 
    backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center',
    marginBottom: 15
  },
  userName: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  userEmail: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
  menuSection: { paddingHorizontal: 24 },
  menuItem: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    paddingVertical: 16 
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: { padding: 12, borderRadius: 14, marginRight: 16 },
  menuTitle: { fontSize: 16, fontWeight: '600' },
  divider: { height: 1, backgroundColor: Colors.surface, marginVertical: 10 }
});