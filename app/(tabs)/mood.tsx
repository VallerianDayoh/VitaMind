import { Colors } from '@/src/constants/Colors';
import { useMoodStore } from '@/src/store/useMoodStore';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const MOOD_OPTIONS = [
  { emoji: '😭', label: 'Sangat Sedih', value: 'very_sad', color: '#60A5FA' },
  { emoji: '😢', label: 'Sedih', value: 'sad', color: '#93C5FD' },
  { emoji: '😐', label: 'Biasa Saja', value: 'neutral', color: '#9CA3AF' },
  { emoji: '😊', label: 'Senang', value: 'happy', color: '#76B947' },
  { emoji: '😍', label: 'Sangat Senang', value: 'very_happy', color: '#FBBF24' },
];

export default function MoodScreen() {
  // Ambil setMood dari store
  const { setMood } = useMoodStore();
  const router = useRouter();

  // SATU fungsi saja untuk menangani pemilihan mood
  const handleSelectMood = (emoji: string) => {
    console.log("Emoji dipilih:", emoji); 
    setMood(emoji); 
    router.back(); // Kembali ke dashboard
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Bagaimana perasaanmu hari ini?</Text>
        <Text style={styles.subtitle}>Jujur pada diri sendiri adalah langkah pertama menuju kesehatan mental.</Text>

        <View style={styles.moodGrid}>
          {MOOD_OPTIONS.map((item) => (
            <TouchableOpacity 
              key={item.value} 
              style={styles.moodItem}
              onPress={() => handleSelectMood(item.emoji)} // Pastikan memanggil handleSelectMood
            >
              <View style={[styles.emojiCircle, { backgroundColor: item.color + '20' }]}>
                <Text style={styles.emojiText}>{item.emoji}</Text>
              </View>
              <Text style={styles.moodLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, padding: 25, justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginBottom: 40, lineHeight: 20 },
  moodGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 20 },
  moodItem: { alignItems: 'center', width: '28%' },
  emojiCircle: { width: 70, height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  emojiText: { fontSize: 35 },
  moodLabel: { fontSize: 12, fontWeight: '600', color: Colors.textPrimary, textAlign: 'center' }
});