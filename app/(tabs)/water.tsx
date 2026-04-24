import { useMoodStore } from '@/src/store/useMoodStore';
import { Droplets, Plus, RefreshCcw } from 'lucide-react-native';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function WaterScreen() {
  const { waterGrams, addWater, resetWater } = useMoodStore();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Droplets size={80} color="#3B82F6" style={styles.icon} />
        <Text style={styles.title}>Target Minum Hari Ini</Text>
        <Text style={styles.waterValue}>{waterGrams} <Text style={{fontSize: 20}}>ml</Text></Text>
        <Text style={styles.subtitle}>Target: 2000 ml</Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.addBtn} onPress={() => addWater(250)}>
            <Plus color="#FFF" size={24} />
            <Text style={styles.addBtnText}>+250ml</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.resetBtn} onPress={resetWater}>
            <RefreshCcw color="#6B7280" size={20} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  icon: { marginBottom: 20 },
  title: { fontSize: 22, fontWeight: '700', color: '#111827' },
  waterValue: { fontSize: 60, fontWeight: '800', color: '#3B82F6', marginVertical: 10 },
  subtitle: { fontSize: 16, color: '#6B7280', marginBottom: 40 },
  buttonRow: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  addBtn: { backgroundColor: '#3B82F6', flexDirection: 'row', paddingVertical: 15, paddingHorizontal: 30, borderRadius: 20, alignItems: 'center', gap: 10 },
  addBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 18 },
  resetBtn: { padding: 15, backgroundColor: '#F3F4F6', borderRadius: 20 }
});