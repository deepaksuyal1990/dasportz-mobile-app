export const colors = {
  background: '#060D18',
  surface: '#0F1C2E',
  surfaceElevated: '#152438',
  surfaceLight: '#1A2D47',
  primary: '#22C55E',
  primaryDark: '#16A34A',
  primarySoft: 'rgba(34, 197, 94, 0.14)',
  accent: '#F59E0B',
  accentSoft: 'rgba(245, 158, 11, 0.14)',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  border: '#1E3A5F',
  borderLight: 'rgba(255,255,255,0.06)',
  white: '#FFFFFF',
  error: '#EF4444',
  whatsapp: '#25D366',
  overlay: 'rgba(6, 13, 24, 0.85)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  full: 999,
};

export const typography = {
  hero: { fontSize: 36, fontWeight: '800' as const, lineHeight: 42, letterSpacing: -1 },
  h1: { fontSize: 28, fontWeight: '700' as const, lineHeight: 34 },
  h2: { fontSize: 22, fontWeight: '700' as const, lineHeight: 28 },
  h3: { fontSize: 18, fontWeight: '600' as const, lineHeight: 24 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodySmall: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '500' as const, lineHeight: 16 },
  label: { fontSize: 11, fontWeight: '700' as const, lineHeight: 14, letterSpacing: 1 },
};

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
};
