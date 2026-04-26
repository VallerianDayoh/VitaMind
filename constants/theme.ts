// ─── Calming Night Sky Theme ───────────────────────────────
// Inspired by premium meditation / sleep apps (Moonie-style)

export const Colors = {
  // Background gradient stops
  backgroundTop: '#0A0E29',
  backgroundBottom: '#1A1B4B',

  // Accent: neon purple glow
  primaryGlow: '#B388EB',

  // Button gradient (purple → pink)
  buttonGradientStart: '#8A2BE2',
  buttonGradientEnd: '#D87093',
  buttonGradient: ['#8A2BE2', '#D87093'] as readonly [string, string],

  // Surfaces
  surface: 'rgba(255, 255, 255, 0.08)',
  surfaceActive: 'rgba(179, 136, 235, 0.15)',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.6)',

  // Semantic
  success: '#5BFFB0',
  error: '#FF6B7A',
  warning: '#FFCF5C',

  // Borders
  border: 'rgba(255, 255, 255, 0.1)',
  borderActive: '#B388EB',

  // Legacy aliases (easy migration for screens not yet refactored)
  primary: '#B388EB',
  secondary: '#D87093',
  background: '#0A0E29',
  text: '#FFFFFF',
};

export const Typography = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Reusable shadow preset for neon glow effect
export const GlowShadow = {
  shadowColor: '#D87093',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.6,
  shadowRadius: 20,
};
