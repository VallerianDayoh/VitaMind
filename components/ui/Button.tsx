import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, GlowShadow } from '../../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  style,
  textStyle,
  disabled = false,
  loading = false,
}) => {
  const isOutline = variant === 'outline';
  const isGhost = variant === 'ghost';

  // ── Outline / Ghost variant ──────────────────────────────
  if (isOutline || isGhost) {
    return (
      <TouchableOpacity
        style={[
          styles.container,
          isOutline && styles.outline,
          isGhost && styles.ghost,
          disabled && styles.disabled,
          style,
        ]}
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.75}
      >
        {loading ? (
          <ActivityIndicator color={Colors.primaryGlow} />
        ) : (
          <Text
            style={[
              styles.text,
              { color: isOutline ? Colors.primaryGlow : Colors.textSecondary },
              textStyle,
            ]}
          >
            {title}
          </Text>
        )}
      </TouchableOpacity>
    );
  }

  // ── Primary / Secondary (gradient + glow) ────────────────
  const gradientColors: readonly [string, string] =
    variant === 'secondary'
      ? [Colors.primaryGlow, Colors.buttonGradientEnd]
      : Colors.buttonGradient;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[disabled ? styles.disabled : styles.glowWrap, style]}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={[styles.text, styles.gradientText, textStyle]}>
            {title}
          </Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  gradient: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowWrap: {
    borderRadius: 999,
    ...GlowShadow,
  },
  text: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  gradientText: {
    color: '#FFFFFF',
  },
  outline: {
    borderWidth: 1.5,
    borderColor: Colors.primaryGlow,
    backgroundColor: 'transparent',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.45,
    borderRadius: 999,
  },
});
