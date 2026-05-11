import {
  Platform,
  StyleSheet,
} from 'react-native';

export const COLORS = {
  bg: '#FDF6E3',

  dark: '#2D3436',

  red: '#FF6B6B',

  teal: '#4ECDC4',

  yellow: '#FFE66D',

  purple: '#A29BFE',

  white: '#FFFFFF',

  gray: '#F0F2F5',

  text: '#11181C',

  muted: '#687076',
};

export const FONTS = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },

  android: {
    sans: 'sans-serif',
    serif: 'serif',
    rounded: 'sans-serif',
    mono: 'monospace',
  },

  default: {
    sans: 'sans-serif',
    serif: 'serif',
    rounded: 'sans-serif',
    mono: 'monospace',
  },

  web: {
    sans:
      "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",

    serif:
      "Georgia, 'Times New Roman', serif",

    rounded:
      "'SF Pro Rounded', sans-serif",

    mono:
      "SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
});

export const THEME = StyleSheet.create({
  neoBorder: {
    borderWidth: 2,
    borderColor: COLORS.dark,
  },

  neoBorderLg: {
    borderWidth: 4,
    borderColor: COLORS.dark,
  },

  neoShadowSm: {
    shadowColor: COLORS.dark,

    shadowOffset: {
      width: 2,
      height: 2,
    },

    shadowOpacity: 1,

    shadowRadius: 0,

    elevation: 2,
  },

  neoShadow: {
    shadowColor: COLORS.dark,

    shadowOffset: {
      width: 4,
      height: 4,
    },

    shadowOpacity: 1,

    shadowRadius: 0,

    elevation: 4,
  },

  neoShadowLg: {
    shadowColor: COLORS.dark,

    shadowOffset: {
      width: 8,
      height: 8,
    },

    shadowOpacity: 1,

    shadowRadius: 0,

    elevation: 8,
  },

  textBlack: {
    fontWeight: '900',
  },

  textBold: {
    fontWeight: '700',
  },

  italic: {
    fontStyle: 'italic',
  },

  uppercase: {
    textTransform: 'uppercase',
  },
});