import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Colors, Spacing, GlowShadow } from '../../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  isActive?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, style, isActive = false }) => {
  return (
    <View
      style={[
        styles.card,
        isActive && styles.active,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  active: {
    backgroundColor: 'rgba(179, 136, 235, 0.15)',
    borderColor: Colors.primaryGlow,
    borderWidth: 1.5,
  },
});
