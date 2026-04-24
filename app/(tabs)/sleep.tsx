import { Colors } from '@/src/constants/Colors';
import { useMoodStore } from '@/src/store/useMoodStore';
import { useRouter } from 'expo-router';
import { Moon } from 'lucide-react-native';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SleepScreen() {
  const { sleepHours, setSleep } = useMoodStore();
  // Gunakan state lokal untuk menampung perubahan angka sebelum disimpan
  const [localHours, setLocalHours] = useState(sleepHours || 8);
  const router = useRouter();

  const handleSave = () => {
    setSleep(localHours); // Simpan angka ke store
    router.back(); // Kembali ke dashboard
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Moon color={Colors.primary} size={40} fill={Colors.primary} />
        </View>

        <Text style={styles.title}>Berapa lama kamu tidur semalam?</Text>

        <View style={styles.counterRow}>
          <TouchableOpacity 
            onPress={() => setLocalHours(Math.max(0, localHours - 1))} 
            style={styles.btn}
          >
            <Text style={styles.btnText}>-</Text>
          </TouchableOpacity>
          
          <Text style={styles.hoursText}>{localHours} <Text style={{ fontSize: 20 }}>Jam</Text></Text>
          
          <TouchableOpacity 
            onPress={() => setLocalHours(localHours + 1)} 
            style={styles.btn}
          >
            <Text style={styles.btnText}>+</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.infoText}>
          ✅ Waktu tidur yang cukup untuk kesehatan otak.
        </Text>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Simpan Data</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#ECFDF5', justifyContent: 'center', alignItems: 'center', marginBottom: 30 },
  title: { fontSize: 24, fontWeight: '800', textAlign: 'center', color: '#111827', marginBottom: 50 },
  counterRow: { flexDirection: 'row', alignItems: 'center', gap: 40, marginBottom: 30 },
  btn: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  btnText: { fontSize: 30, fontWeight: 'bold', color: '#10B981' },
  hoursText: { fontSize: 50, fontWeight: '800', color: '#111827' },
  infoText: { color: '#6B7280', marginBottom: 50, textAlign: 'center' },
  saveButton: { backgroundColor: '#82C446', paddingVertical: 18, borderRadius: 20, width: '100%' },
  saveButtonText: { color: '#FFF', fontWeight: 'bold', textAlign: 'center', fontSize: 16 }
});