import { useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewToken,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Button } from '../../components/ui/Button';
import { Colors, Spacing, Typography } from '../../constants/theme';

const { width: SCREEN_W } = Dimensions.get('window');

// ── Slide Data ─────────────────────────────────────────────

interface SlideData {
  id: string;
  emoji: string;
  title: string;
  body: string;
  isForm?: boolean;
}

const SLIDES: SlideData[] = [
  {
    id: '1',
    emoji: '🫶',
    title: 'Ruang Amanmu',
    body: 'Catat mood dan pola tidurmu setiap hari tanpa dihakimi. VitaMind menjaga semua ceritamu.',
  },
  {
    id: '2',
    emoji: '💬',
    title: 'Teman Cerita 24/7',
    body: 'Kenalkan Vita — AI chatbot empatik yang siap mendengar kapan pun kamu butuh teman bicara.',
  },
  {
    id: '3',
    emoji: '🔒',
    title: 'Privasi Terjamin',
    body: 'Semua data dienkripsi end-to-end dan disimpan di Convex. Tidak akan pernah dibagikan ke pihak ketiga.',
  },
  {
    id: '4',
    emoji: '✨',
    title: 'Personalisasi',
    body: 'Bantu kami mengenalmu lebih baik.',
    isForm: true,
  },
];

// ── Animated Dot Component ─────────────────────────────────

interface DotProps {
  isActive: boolean;
}

const Dot: React.FC<DotProps> = ({ isActive }) => {
  const width = useSharedValue(isActive ? 28 : 8);

  React.useEffect(() => {
    width.value = withTiming(isActive ? 28 : 8, { duration: 300 });
  }, [isActive]);

  const animStyle = useAnimatedStyle(() => ({
    width: width.value,
    height: 8,
    borderRadius: 4,
    backgroundColor: isActive ? Colors.primary : Colors.border,
    marginHorizontal: 4,
  }));

  return <Animated.View style={animStyle} />;
};

// ── Main Component ─────────────────────────────────────────

export default function OnboardingScreen() {
  const router = useRouter();
  const flatRef = useRef<FlatList>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  // Form state
  const [nickname, setNickname] = useState('');
  const [major, setMajor] = useState('');
  const [semester, setSemester] = useState('');

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setActiveIdx(viewableItems[0].index);
      }
    },
    []
  );

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const goNext = () => {
    if (activeIdx < SLIDES.length - 1) {
      flatRef.current?.scrollToIndex({ index: activeIdx + 1, animated: true });
    }
  };

  const handleStart = () => {
    router.replace('/(auth)/login');
  };

  const renderSlide = ({ item }: { item: SlideData }) => {
    if (item.isForm) {
      return (
        <View style={styles.slide}>
          <Text style={styles.slideEmoji}>{item.emoji}</Text>
          <Text style={styles.slideTitle}>{item.title}</Text>
          <Text style={styles.slideBody}>{item.body}</Text>

          <View style={styles.formWrap}>
            <TextInput
              style={styles.formInput}
              placeholder="Nama Panggilan"
              placeholderTextColor={Colors.textSecondary}
              value={nickname}
              onChangeText={setNickname}
            />
            <TextInput
              style={styles.formInput}
              placeholder="Jurusan (misal: Sistem Informasi)"
              placeholderTextColor={Colors.textSecondary}
              value={major}
              onChangeText={setMajor}
            />
            <TextInput
              style={styles.formInput}
              placeholder="Semester (misal: 6)"
              placeholderTextColor={Colors.textSecondary}
              value={semester}
              onChangeText={setSemester}
              keyboardType="number-pad"
            />
          </View>

          <Button
            title="Mulai Perjalanan 🚀"
            onPress={handleStart}
            style={styles.startBtn}
          />
        </View>
      );
    }

    return (
      <View style={styles.slide}>
        <Text style={styles.slideEmoji}>{item.emoji}</Text>
        <Text style={styles.slideTitle}>{item.title}</Text>
        <Text style={styles.slideBody}>{item.body}</Text>
        <Button title="Lanjut" onPress={goNext} variant="outline" style={styles.nextBtn} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatRef}
        data={SLIDES}
        keyExtractor={(s) => s.id}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />

      {/* Pagination */}
      <View style={styles.pagination}>
        {SLIDES.map((_, i) => (
          <Dot key={i} isActive={i === activeIdx} />
        ))}
      </View>

      {/* Skip */}
      {activeIdx < SLIDES.length - 1 && (
        <Button
          title="Lewati"
          onPress={handleStart}
          variant="outline"
          style={styles.skipBtn}
          textStyle={styles.skipText}
        />
      )}
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Slide
  slide: {
    width: SCREEN_W,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: 100,
  },
  slideEmoji: {
    fontSize: 72,
    marginBottom: Spacing.lg,
  },
  slideTitle: {
    fontSize: Typography.sizes.xxxl,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  slideBody: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xl,
  },

  nextBtn: {
    width: 160,
  },

  // Form slide
  formWrap: {
    width: '100%',
    marginBottom: Spacing.lg,
  },
  formInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    fontSize: Typography.sizes.md,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  startBtn: {
    width: '100%',
  },

  // Pagination
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 48,
    left: 0,
    right: 0,
  },

  // Skip
  skipBtn: {
    position: 'absolute',
    top: 56,
    right: 24,
    borderColor: 'transparent',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    color: Colors.textSecondary,
    fontSize: Typography.sizes.sm,
  },
});
