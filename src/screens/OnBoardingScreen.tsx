import { Href, useRouter } from 'expo-router'; // Tambahkan Href
import { ArrowRight } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import { Animated, Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View, ViewToken } from 'react-native';
import { Colors } from '../constants/Colors';

const { width } = Dimensions.get('window');

interface Slide {
  id: string;
  title: string;
  description: string;
  icon: string;
}

const SLIDES: Slide[] = [
  {
    id: '1',
    title: 'Kenali Dirimu',
    description: 'Pantau mood dan pola tidurmu setiap hari dengan cara yang menyenangkan.',
    icon: '🌿',
  },
  {
    id: '2',
    title: 'Bicara dengan AI',
    description: 'Butuh teman curhat? AI kami siap mendengarkan dan memberi solusi akademismu.',
    icon: '🤖',
  },
  {
    id: '3',
    title: 'Sehat Mental, Nilai Maksimal',
    description: 'Mahasiswa UNKLAB yang sehat mental adalah mahasiswa yang berprestasi.',
    icon: '🎓',
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList>(null); // Fix Error 2: Definisikan tipe FlatList
  const router = useRouter();

  // Fix Error 1: Definisikan tipe untuk viewableItems
  const viewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      // Fix Error 3: Cast string ke tipe Href
      router.replace('/(auth)/login' as Href); 
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ flex: 3 }}>
        <FlatList
          data={SLIDES}
          renderItem={({ item }) => (
            <View style={styles.slide}>
              <Text style={styles.emojiIcon}>{item.icon}</Text>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          bounces={false}
          keyExtractor={(item) => item.id}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
            useNativeDriver: false,
          })}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
          ref={slidesRef}
        />
      </View>

      <View style={styles.footer}>
        <View style={styles.paginator}>
          {SLIDES.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [10, 20, 10],
              extrapolate: 'clamp',
            });
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });
            return <Animated.View style={[styles.dot, { width: dotWidth, opacity }]} key={i} />;
          })}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>
            {currentIndex === SLIDES.length - 1 ? 'Mulai Sekarang' : 'Lanjut'}
          </Text>
          <ArrowRight color="#FFF" size={20} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  slide: { width, alignItems: 'center', padding: 40, justifyContent: 'center' },
  emojiIcon: { fontSize: 80, marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '800', color: '#1F2937', textAlign: 'center', marginBottom: 15 },
  description: { fontSize: 16, color: '#6B7280', textAlign: 'center', lineHeight: 24 },
  footer: { paddingHorizontal: 40, paddingBottom: 50, alignItems: 'center' },
  paginator: { flexDirection: 'row', height: 64 },
  dot: { height: 10, borderRadius: 5, backgroundColor: Colors.primary, marginHorizontal: 4 },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    paddingHorizontal: 35,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 5,
  },
  buttonText: { color: '#FFF', fontSize: 18, fontWeight: '700', marginRight: 10 },
});