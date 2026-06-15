export const colors = {
  background: '#0f0f0f',
  surface: '#1a1a1a',
  surfaceHigh: '#252525',
  primary: '#6366f1',
  primaryDark: '#4f52c9',
  onPrimary: '#ffffff',
  text: '#f0f0f0',
  textMuted: '#888888',
  border: '#2a2a2a',
  error: '#ef4444',
  errorDark: '#c53030',
  success: '#22c55e',
  overlay: 'rgba(0,0,0,0.6)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export const typography = {
  display: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 34,
  },
  headline: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 29,
  },
  title: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 25,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  caption: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 17,
  },
} as const;
