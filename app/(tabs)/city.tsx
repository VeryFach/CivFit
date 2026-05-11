import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CivfitScreen } from '../../src/components/civfit/screen';
import { useCivfitStore } from '../../src/state/civfit-store';

export default function CityScreen() {
  const { city, deployBuilding } = useCivfitStore();

  const cityStats = useMemo(() => {
    return {
      totalHousing: city.buildings.length * 5,
      totalIncome: city.buildings.length * 50,
      health: city.health,
      happiness: city.happiness,
    };
  }, [city.buildings, city.health, city.happiness]);

  return (
    <CivfitScreen>
      {/* Hero Section */}
      <View style={styles.hero}>
        <Text style={styles.heroKicker}>CITY CENTER</Text>
        <Text style={styles.heroTitle}>{city.currentEra || 'Stone Age'}</Text>
        <Text style={styles.heroSubtitle}>Manage your city and track resources</Text>
      </View>

      {/* City Status Dashboard */}
      <View style={styles.dashboardCard}>
        <View style={styles.statusGrid}>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Health</Text>
            <Text style={styles.statusValue}>{cityStats.health}%</Text>
            <View style={styles.healthBar}>
              <View style={[styles.healthBarFill, { width: `${cityStats.health}%` }]} />
            </View>
          </View>

          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Happiness</Text>
            <Text style={styles.statusValue}>{cityStats.happiness}%</Text>
            <View style={styles.happinessBar}>
              <View style={[styles.happinessBarFill, { width: `${cityStats.happiness}%` }]} />
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Population</Text>
            <Text style={styles.statValue}>{city.population}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Housing</Text>
            <Text style={styles.statValue}>{cityStats.totalHousing}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Daily Income</Text>
            <Text style={styles.statValue}>+{cityStats.totalIncome}</Text>
          </View>
        </View>
      </View>

      {/* Buildings Section */}
      <View>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Buildings ({city.buildings.length})</Text>
        </View>

        {city.buildings.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🏗️</Text>
            <Text style={styles.emptyStateText}>No buildings yet. Build your first structure to grow your city!</Text>
          </View>
        ) : (
          <View style={styles.buildingsList}>
            {city.buildings.map((building, idx) => (
              <View key={`${idx}-${building.id}`} style={styles.buildingCard}>
                <View style={styles.buildingHeader}>
                  <Text style={styles.buildingName}>Building #{idx + 1}</Text>
                  <View style={styles.buildingLevelBadge}>
                    <Text style={styles.buildingLevel}>LV {building.level}</Text>
                  </View>
                </View>
                <Text style={styles.buildingPosition}>
                  Position: ({building.gridX}, {building.gridY})
                </Text>
                <View style={styles.buildingHealthBar}>
                  <View style={[styles.buildingHealthFill, { width: `${building.health}%` }]} />
                </View>
                <Text style={styles.buildingHealthText}>Health: {building.health}%</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Era Info */}
      <View style={styles.eraCard}>
        <Text style={styles.eraTitle}>📚 Current Era</Text>
        <Text style={styles.eraText}>
          Your city is in the <Text style={styles.eraBold}>{city.currentEra || 'Stone Age'}</Text> era. Build different types of buildings to improve your city's metrics and advance to the next era!
        </Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.quickStats}>
        <View style={styles.quickStatItem}>
          <Text style={styles.quickStatLabel}>Total Food</Text>
          <Text style={styles.quickStatValue}>{city.food}</Text>
        </View>
        <View style={styles.quickStatItem}>
          <Text style={styles.quickStatLabel}>Sick Pop.</Text>
          <Text style={styles.quickStatValue}>{city.populationSick}</Text>
        </View>
      </View>
    </CivfitScreen>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  heroKicker: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    color: '#666',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1F2228',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  dashboardCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#1F2228',
    borderRadius: 16,
    padding: 16,
    gap: 16,
    shadowColor: '#1F2228',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 0,
    elevation: 3,
  },
  statusGrid: {
    gap: 12,
  },
  statusItem: {
    gap: 6,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#999',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  statusValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1F2228',
  },
  healthBar: {
    height: 8,
    backgroundColor: '#FFE5E5',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#DC143C',
    overflow: 'hidden',
  },
  healthBarFill: {
    height: '100%',
    backgroundColor: '#DC143C',
  },
  happinessBar: {
    height: 8,
    backgroundColor: '#FFF9E6',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FFD700',
    overflow: 'hidden',
  },
  happinessBarFill: {
    height: '100%',
    backgroundColor: '#FFD700',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    paddingTop: 12,
  },
  divider: {
    width: 1,
    backgroundColor: '#E5E5E5',
  },
  stat: {
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#999',
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1F2228',
  },
  sectionHeader: {
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1F2228',
    textTransform: 'uppercase',
  },
  emptyState: {
    paddingVertical: 24,
    alignItems: 'center',
    gap: 8,
  },
  emptyStateIcon: {
    fontSize: 40,
  },
  emptyStateText: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  buildingsList: {
    gap: 8,
    marginBottom: 16,
  },
  buildingCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#1F2228',
    borderRadius: 12,
    padding: 12,
    gap: 8,
    shadowColor: '#1F2228',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 0,
    elevation: 2,
  },
  buildingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buildingName: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1F2228',
  },
  buildingLevelBadge: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  buildingLevel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#999',
  },
  buildingPosition: {
    fontSize: 11,
    color: '#999',
    fontWeight: '600',
  },
  buildingHealthBar: {
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  buildingHealthFill: {
    height: '100%',
    backgroundColor: '#00CED1',
  },
  buildingHealthText: {
    fontSize: 10,
    color: '#999',
    fontWeight: '600',
  },
  eraCard: {
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: '#DDD',
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  eraTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#1F2228',
  },
  eraText: {
    fontSize: 11,
    color: '#666',
    lineHeight: 16,
  },
  eraBold: {
    fontWeight: '900',
  },
  quickStats: {
    flexDirection: 'row',
    gap: 8,
  },
  quickStatItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#1F2228',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  quickStatLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#999',
    textTransform: 'uppercase',
  },
  quickStatValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1F2228',
  },
});
