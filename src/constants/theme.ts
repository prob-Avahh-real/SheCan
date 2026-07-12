export const COLORS = {
  primary: '#FF6B8A',
  primaryLight: '#FFB3C6',
  primaryDark: '#E05570',
  secondary: '#7C5CFC',
  background: '#FFF5F7',
  surface: '#FFFFFF',
  surfaceAlt: '#FFF0F3',
  text: '#2D2D2D',
  textSecondary: '#8E8E93',
  textMuted: '#B0B0B0',
  border: '#F0E0E4',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0,0,0,0.4)',
} as const;

export const FONTS = {
  regular: { fontFamily: 'System', fontWeight: '400' as const },
  medium: { fontFamily: 'System', fontWeight: '500' as const },
  semibold: { fontFamily: 'System', fontWeight: '600' as const },
  bold: { fontFamily: 'System', fontWeight: '700' as const },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
} as const;
