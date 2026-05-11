import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { UserStats } from '../../state/civfit-store';

interface HeaderProps {
  stats: UserStats;
}

export function CivfitHeader({ stats }: HeaderProps) {
  const hpPercentage = (stats.hp / stats.maxHp) * 100;
  const expPercentage = (stats.exp / stats.maxExp) * 100;

  return (
    <View style={styles.header}>
      <View style={styles.leftSection}>
        {/* HP Badge */}
        <View style={styles.badge}>
          <Text style={styles.badgeIcon}>❤️</Text>
          <Text style={styles.badgeText}>
            {stats.hp}/{stats.maxHp} HP
          </Text>
        </View>

        {/* Level & EXP Progress */}
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>LV {stats.level}</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${expPercentage}%` }]} />
          </View>
        </View>
      </View>

      <View style={styles.rightSection}>
        {/* Gold */}
        <View style={styles.resourceBadge}>
          <Text style={styles.resourceIcon}>💰</Text>
          <Text style={styles.resourceText}>{stats.gold.toLocaleString()}</Text>
        </View>

        {/* Silver */}
        <View style={[styles.resourceBadge, styles.silverBadge]}>
          <Text style={styles.resourceIcon}>🪙</Text>
          <Text style={[styles.resourceText, styles.silverText]}>
            {stats.silver.toLocaleString()}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#DC143C', // brand-red
    borderBottomWidth: 4,
    borderBottomColor: '#1F2228', // brand-dark
    gap: 8,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#1F2228',
    borderRadius: 20,
  },
  badgeIcon: {
    fontSize: 14,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#1F2228',
    letterSpacing: 0.5,
  },
  levelBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#1F2228',
    borderRadius: 12,
  },
  levelText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#1F2228',
    letterSpacing: 1,
    minWidth: 40,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#1F2228',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00CED1', // brand-teal
  },
  resourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFD700', // brand-yellow
    borderWidth: 2,
    borderColor: '#1F2228',
    borderRadius: 8,
  },
  silverBadge: {
    backgroundColor: '#9370DB', // brand-purple
  },
  resourceIcon: {
    fontSize: 12,
  },
  resourceText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#1F2228',
    letterSpacing: 0.5,
  },
  silverText: {
    color: '#FFFFFF',
  },
});
