import { useCivStore } from '@/store';
import { useThemeStore } from '@/store/themeStore';
import { COLORS, THEME } from '@/theme';
import { Coins, Gem, Heart } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function Header() {
  const stats = useCivStore((state) => state.stats);
  const insets = useSafeAreaInsets();
  const isDarkMode = useThemeStore((state) => state.isDarkMode);

  const palette = isDarkMode
    ? {
      container: '#0F172A',
      surface: '#1E293B',
      border: '#334155',
      text: '#F8FAFC',
      muted: '#94A3B8',
      progressBg: '#334155',
    }
    : {
      container: COLORS.red,
      surface: COLORS.white,
      border: COLORS.dark,
      text: COLORS.dark,
      muted: '#475569',
      progressBg: COLORS.gray,
    };

  const expProgress =
    stats.maxExp > 0
      ? (stats.exp / stats.maxExp) * 100
      : 0;
  const CONTENT_HEIGHT = 56;
  const HEADER_HEIGHT = Math.round(insets.top) + CONTENT_HEIGHT;

  return (
    <View
      style={[
        styles.container,
        {
          height: HEADER_HEIGHT,
          paddingTop: Math.round(insets.top) + 4,
          backgroundColor: palette.container,
          borderBottomColor: palette.border,
        },
      ]}
    >
      <View style={styles.leftGroup}>
        {/* HP Badge - hanya menampilkan nilai HP */}
        <View
          style={[
            styles.badge,
            styles.hpBadge,
            {
              backgroundColor: palette.surface,
              borderColor: palette.border,
              flexShrink: 0,
            },
          ]}
        >
          <Heart size={14} color={COLORS.red} fill={COLORS.red} />
          <Text
            style={[styles.badgeText, { color: palette.text }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.5}
            maxFontSizeMultiplier={1.5}
          >
            {stats.hp}
          </Text>
        </View>

        {/* LVL Badge - jarak lebih rapat */}
        <View
          style={[
            styles.badge,
            styles.levelBadge,
            {
              backgroundColor: palette.surface,
              borderColor: palette.border,
              flexShrink: 1,
            },
          ]}
        >
          <Text
            style={[styles.lvlText, { color: palette.text }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.4}
            maxFontSizeMultiplier={1.2}
          >
            LVL {stats.level}
          </Text>
          <View
            style={[
              styles.progressBarBg,
              {
                backgroundColor: palette.progressBg,
                borderColor: palette.border,
              },
            ]}
          >
            <View style={[styles.progressBarFill, { width: `${expProgress}%` }]} />
          </View>
        </View>
      </View>

      <View style={styles.rightGroup}>
        {/* Gold */}
        <View
          style={[
            styles.currencyBadge,
            { backgroundColor: COLORS.yellow, borderColor: palette.border },
          ]}
        >
          <Coins size={14} color={COLORS.dark} />
          <Text
            style={[styles.currencyText, { color: COLORS.dark }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.4}
            maxFontSizeMultiplier={1.2}
          >
            {stats.gold.toLocaleString()}
          </Text>
        </View>

        {/* Silver */}
        <View
          style={[
            styles.currencyBadge,
            { backgroundColor: COLORS.purple, borderColor: palette.border },
          ]}
        >
          <Gem size={14} color={COLORS.white} />
          <Text
            style={[styles.currencyText, { color: COLORS.white }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.4}
            maxFontSizeMultiplier={1.2}
          >
            {stats.silver.toLocaleString()}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: 4,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 12,
    flexShrink: 1,
    minWidth: 0,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  badge: {
    minWidth: 0,
    ...THEME.neoBorder,
    ...THEME.neoShadowSm,
    paddingHorizontal: 8,   // dikurangi dari 10
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,                 // dikurangi dari 6
    overflow: 'hidden',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '900',
    includeFontPadding: false,
  },

  hpBadge: {
    flexShrink: 0,
  },

  levelBadge: {
    flex: 1,
    minWidth: 0,
  },

  lvlText: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    flexShrink: 1,
  },
  progressBarBg: {
    flex: 1,
    minWidth: 40,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    overflow: 'hidden',
    marginLeft: 4,          // dikurangi dari 8
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.teal,
  },
  currencyBadge: {
    ...THEME.neoBorder,
    ...THEME.neoShadowSm,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  currencyText: {
    fontWeight: '900',
    fontSize: 12,
  },
});