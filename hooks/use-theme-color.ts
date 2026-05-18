/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { COLORS } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const Colors = {
  light: {
    text: COLORS.text,
    background: COLORS.bg,
    tint: COLORS.teal,
    icon: COLORS.muted,
    tabIconDefault: COLORS.muted,
    tabIconSelected: COLORS.teal,
  },
  dark: {
    text: COLORS.white,
    background: COLORS.dark,
    tint: COLORS.teal,
    icon: COLORS.gray,
    tabIconDefault: COLORS.gray,
    tabIconSelected: COLORS.teal,
  },
};

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}
