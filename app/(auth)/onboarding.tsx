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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/ui/Button';
import { Colors, Spacing, Typography } from '../../constants/theme';

const { width: SCREEN_W } = Dimensions.get('window');

// ── Slide Data ─────────────────────────────────────────────

interface SlideData {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
  isForm?: boolean;
}

const SLIDES: SlideData[] = [
  {
    id: '1',
    icon: 'heart',
    title: 'Ruang Amanmu',
    body: 'Catat mood dan pola tidurmu setiap hari tanpa dihakimi. VitaMind menjaga semua ceritamu.',
  },
  {
    id: '2',
    icon: 'chatbubble-ellipses',
    title: 'Teman Cerita 24/7',
    body: 'Kenalkan Vita — AI chatbot empatik yang siap mendengar kapan pun kamu butuh teman bicara.',
  },
  {
    id: '3',
    icon: 'lock-closed',
    title: 'Privasi Terjamin',
    body: 'Semua data dienkripsi end-to-end dan disimpan di Convex. Tidak akan pernah dibagikan ke pihak ketiga.',
  },
  {
    id: '4',
    icon: 'sparkles',
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
    backgroundColor: isActive ? Colors.primaryGlow : 'rgba(255,255,255,0.2)',
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
          <Ionicons name={item.icon} size={56} color={Colors.primaryGlow} style={styles.slideIcon} />
          <Text style={styles.slideTitle}>{item.title}</Text>
          <Text style={styles.slideBody}>{item.body}</Text>

          <View style={styles.formWrap}>
            <TextInput
              style={styles.formInput}
              placeholder="Nama Panggilan"
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={nickname}
              onChangeText={setNickname}
            />
            <TextInput
              style={styles.formInput}
              placeholder="Jurusan (misal: Sistem Informasi)"
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={major}
              onChangeText={setMajor}
            />
            <TextInput
              style={styles.formInput}
              placeholder="Semester (misal: 6)"
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={semester}
              onChangeText={setSemester}
              keyboardType="number-pad"
            />
          </View>

          <Button
            title="Mulai Perjalanan"
            onPress={handleStart}
            style={styles.startBtn}
          />
        </View>
      );
    }

    return (
      <View style={styles.slide}>
        <Ionicons name={item.icon} size={56} color={Colors.primaryGlow} style={styles.slideIcon} />
        <Text style={styles.slideTitle}>{item.title}</Text>
        <Text style={styles.slideBody}>{item.body}</Text>
        <Button title="Lanjut" onPress={goNext} variant="outline" style={styles.nextBtn} />
      </View>
    );
  };

  return (
    <LinearGradient
      colors={[Colors.backgroundTop, Colors.backgroundBottom]}
      style={styles.container}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
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
          variant="ghost"
          style={styles.skipBtn}
          textStyle={styles.skipText}
        />
      )}
    </LinearGradient>
  );
}

// ── Styles ─────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  slideIcon: {
    marginBottom: Spacing.lg,
  },
  slideTitle: {
    fontSize: Typography.sizes.xxxl,
    fontWeight: '800',
    color: Colors.textPrimary,
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
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    fontSize: Typography.sizes.md,
    color: Colors.textPrimary,
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
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    color: Colors.textSecondary,
    fontSize: Typography.sizes.sm,
  },
});
