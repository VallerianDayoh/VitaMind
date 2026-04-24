// src/components/ModernCard.tsx
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Colors } from '../constants/Colors';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const ModernCard = ({ children, style }: Props) => (
  <View style={[styles.card, style]}>
    {children}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 32, // Sangat bulat agar terlihat modern
    padding: 24,
    marginBottom: 16,
    // Shadow halus untuk iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    // Elevation untuk Android
    elevation: 4,
  },
});