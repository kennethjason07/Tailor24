// Tailor24 Design System Theme Tokens

export const Colors = {
  // Brand Primary & Accents
  primary: '#1E3A8A', // Deep Tailor Navy
  primaryLight: '#3B82F6', // Vibrant Blue
  primaryDark: '#0F172A', // Midnight Slate
  accent: '#D97706', // Warm Amber / Tailor Gold
  accentLight: '#FBBF24',

  // Neutrals & Backgrounds
  background: '#F8FAFC', // Slate 50 - clean modern SaaS canvas
  surface: '#FFFFFF',
  surfaceSubtle: '#F1F5F9', // Slate 100
  border: '#E2E8F0', // Slate 200
  borderDark: '#CBD5E1', // Slate 300

  // Typography
  textPrimary: '#0F172A', // Slate 900
  textSecondary: '#475569', // Slate 600
  textMuted: '#94A3B8', // Slate 400
  textWhite: '#FFFFFF',

  // Status & Operational Indicators
  success: '#10B981', // Emerald 500
  successBg: '#ECFDF5',
  warning: '#F59E0B', // Amber 500
  warningBg: '#FFFBEB',
  error: '#EF4444', // Red 500
  errorBg: '#FEF2F2',
  info: '#0EA5E9', // Sky 500
  infoBg: '#F0F9FF',

  // Production Stages
  stageOrdered: '#64748B',
  stageCutting: '#8B5CF6',
  stageStitching: '#3B82F6',
  stageQuality: '#F59E0B',
  stageReady: '#10B981',
  stageDelivered: '#059669',
};

export const Typography = {
  fontSizes: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    xxl: 30,
    hero: 36,
  },
  fontWeights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    heavy: '800',
  },
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1.0,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  huge: 40,
};

export const Radii = {
  sm: 6,
  md: 10,
  base: 14,
  lg: 18,
  full: 9999,
};

export const Shadows = {
  subtle: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  card: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  popover: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
};
