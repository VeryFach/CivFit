import { useCivStore } from '@/store';
import { COLORS, THEME } from '@/theme';
import { Coins, DollarSign, Heart, Gem } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function Header() {
  const stats = useCivStore((state) => state.stats);
  const insets = useSafeAreaInsets();

  const expProgress = (stats.exp / stats.maxExp) * 100;

  // Total height = status bar height + content area (56px)
  const CONTENT_HEIGHT = 56;
  const totalHeight = insets.top + CONTENT_HEIGHT;

  return (
    <View style={[styles.container, { height: totalHeight, paddingTop: insets.top }]}>
      <View style={styles.leftGroup}>
        {/* HP Badge */}
        <View style={styles.badge}>
          <Heart size={14} color={COLORS.red} fill={COLORS.red} />
          <Text style={styles.badgeText}>{stats.hp}/{stats.maxHp} HP</Text>
        </View>

        {/* LVL Badge */}
        <View style={styles.badge}>
          <Text style={styles.lvlText}>LVL {stats.level}</Text>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${expProgress}%` },
              ]}
            />
          </View>
        </View>
      </View>

      <View style={styles.rightGroup}>
        {/* Gold */}
        <View style={[styles.currencyBadge, { backgroundColor: COLORS.yellow }]}>
          <Coins size={14} color={COLORS.dark} />
          <Text style={styles.currencyText}>{stats.gold.toLocaleString()}</Text>
        </View>

        {/* Silver */}
        <View style={[styles.currencyBadge, { backgroundColor: COLORS.purple }]}>
          <Gem size={14} color={COLORS.white} />
          <Text style={[styles.currencyText, { color: COLORS.white }]}>
            {stats.silver.toLocaleString()}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.red,
    flexDirection: 'row',
    alignItems: 'flex-end',      // konten turun ke bawah status bar
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 8,
    zIndex: 50,
    borderBottomWidth: 4,
    borderBottomColor: COLORS.dark,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    backgroundColor: COLORS.white,
    ...THEME.neoBorder,
    ...THEME.neoShadowSm,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.dark,
  },
  lvlText: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  progressBarBg: {
    width: 60,
    height: 10,
    backgroundColor: COLORS.gray,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: COLORS.dark,
    overflow: 'hidden',
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