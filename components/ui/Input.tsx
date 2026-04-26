import React, { useState, useCallback } from 'react';
import {
  TextInput,
  TextInputProps,
  StyleSheet,
  View,
  Text,
  ViewStyle,
  Animated,
} from 'react-native';
import { Colors, Typography, Spacing } from '../../constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const borderAnim = React.useRef(new Animated.Value(0)).current;

  const handleFocus = useCallback(
    (e: any) => {
      setIsFocused(true);
      Animated.timing(borderAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: false,
      }).start();
      props.onFocus?.(e);
    },
    [borderAnim, props],
  );

  const handleBlur = useCallback(
    (e: any) => {
      setIsFocused(false);
      Animated.timing(borderAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false,
      }).start();
      props.onBlur?.(e);
    },
    [borderAnim, props],
  );

  const animatedBorderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.border, Colors.primaryGlow],
  });

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Animated.View
        style={[
          styles.inputWrapper,
          error && styles.inputError,
          { borderColor: error ? Colors.error : animatedBorderColor },
          isFocused && styles.focusedGlow,
        ]}
      >
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor="rgba(255, 255, 255, 0.4)"
          selectionColor={Colors.primaryGlow}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
      </Animated.View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    fontWeight: '500',
  },
  inputWrapper: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  input: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    fontSize: Typography.sizes.md,
    color: Colors.textPrimary,
  },
  inputError: {
    borderColor: Colors.error,
  },
  focusedGlow: {
    // Glow effect achieved via animated border color instead of rectangular shadow
    backgroundColor: Colors.surfaceActive,
  },
  errorText: {
    fontSize: Typography.sizes.xs,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
});
