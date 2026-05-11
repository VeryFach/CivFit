import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Dimensions, FlatList } from 'react-native';
import { CityState, UserStats, BuildingType, PlacedBuilding, Era } from '../../core/types';
import { BUILDINGS, GRID_SIZE, ERAS_CONFIG } from '../../core/constants';
import { calculateCitySummary, getHealthStatus, getHappinessStatus, getProductivityStatus } from '../../core/simulation/cityUtils';
import * as LucideIcons from 'lucide-react-native';
import {
  Hammer,
  AlertTriangle,
  TrendingUp,
  Search,
  Trash2,
  Navigation,
  Dna,
  Thermometer,
  Zap,
  Building2,
  X,
  Coins,
  Activity
} from 'lucide-react-native';
import Animated, { FadeIn, FadeOut, ZoomIn, SlideInUp, SlideOutDown } from 'react-native-reanimated';
import { COLORS, THEME } from '../theme';

const { width } = Dimensions.get('window');
const TILE_SIZE = (width - 64) / GRID_SIZE;

interface KotaTabProps {
  city: CityState;
  stats: UserStats;
  onDeploy: (buildingId: string, x: number, y: number, cost: number) => void;
  onUpgrade: (buildingId: string, cost: number) => void;
  onRemove: (buildingId: string) => void;
  onSwitchTab: (tab: string) => void;
}

const IconRenderer = ({ name, size = 16, color = COLORS.dark }: { name: string, size?: number, color?: string }) => {
  const Icon = (LucideIcons as any)[name] || LucideIcons.HelpCircle;
  return <Icon size={size} color={color} />;
};

export function KotaTab({ city, stats, onDeploy, onUpgrade, onRemove, onSwitchTab }: KotaTabProps) {
  const [selectedBuildingType, setSelectedBuildingType] = useState<BuildingType | null>(null);
  const [selectedTile, setSelectedTile] = useState<{ x: number, y: number } | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const buildingMap = useMemo(() => {
    const map: Record<string, PlacedBuilding> = {};
    (city.buildings || []).forEach(b => {
      map[`${b.gridX},${b.gridY}`] = b;
    });
    return map;
  }, [city.buildings]);

  const summary = useMemo(() => calculateCitySummary(city), [city]);
  const healthStatus = getHealthStatus(city.health);
  const happinessStatus = getHappinessStatus(city.happiness || 100);
  const productivityStatus = getProductivityStatus(summary.taxMultiplier);

  const eraAesthetics = useMemo(() => {
    switch (city.currentEra) {
      case Era.STONE_AGE: return { bg: '#E5D3B3', grid: 'rgba(210, 180, 140, 0.3)', accent: '#8B4513' };
      case Era.MEDIEVAL: return { bg: '#F4F1EA', grid: 'rgba(176, 196, 222, 0.2)', accent: '#4169E1' };
      case Era.INDUSTRIAL: return { bg: '#DCDCDC', grid: 'rgba(112, 128, 144, 0.2)', accent: '#2F4F4F' };
      case Era.MODERN: return { bg: '#FFFFFF', grid: 'rgba(45, 204, 113, 0.05)', accent: COLORS.teal };
      case Era.DIGITAL: return { bg: COLORS.dark, grid: 'rgba(155, 89, 182, 0.2)', accent: COLORS.purple };
      default: return { bg: COLORS.bg, grid: 'rgba(209, 213, 219, 0.3)', accent: COLORS.teal };
    }
  }, [city.currentEra]);

  const filteredBuildings = useMemo(() => {
    const costScalar = 1 + (city.buildings.length * 0.05);

    return BUILDINGS.filter(b => {
      const era = ERAS_CONFIG.find(e => e.id === b.era);
      const isUnlocked = stats.level >= (era?.minLevel || 0);
      const matchesFilter = filter === 'all' || b.category === filter;
      const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase());
      return isUnlocked && matchesFilter && matchesSearch;
    }).map(b => ({
      ...b,
      costSilver: Math.floor(b.costSilver * costScalar),
      costGold: Math.floor(b.costGold * costScalar)
    }));
  }, [stats.level, filter, searchQuery, city.buildings.length]);

  const handleTileClick = (x: number, y: number) => {
    const coordKey = `${x},${y}`;
    const building = buildingMap[coordKey];

    if (selectedBuildingType) {
      if (!building && stats.silver >= selectedBuildingType.costSilver) {
        onDeploy(selectedBuildingType.id, x, y, selectedBuildingType.costSilver);
        setSelectedBuildingType(null);
      }
      return;
    }

    setSelectedTile(selectedTile?.x === x && selectedTile?.y === y ? null : { x, y });
  };

  return (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      {/* City Status Dashboard */}
      <View style={styles.dashboard}>
        <View style={styles.dashboardIconBg}>
          <Building2 size={160} color="rgba(255,255,255,0.1)" />
        </View>

        <View style={styles.dashboardHeader}>
          <View>
            <View style={styles.eraTitleRow}>
              <Text style={styles.eraTitle}>{city.currentEra}</Text>
              <Pressable
                onPress={() => onSwitchTab('evolution')}
                style={styles.eraProgBtn}
              >
                <Dna size={14} color={COLORS.teal} />
                <Text style={styles.eraProgText}>Evolution</Text>
              </Pressable>
            </View>
            <View style={styles.statusRow}>
              <View style={styles.statusBadge}>
                <Text style={[styles.statusBadgeText, { color: healthStatus.color }]}>Health: {city.health}%</Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={[styles.statusBadgeText, { color: COLORS.teal }]}>Pop: {city.population}</Text>
              </View>
              {city.populationSick > 0 && (
                <View style={[styles.statusBadge, { backgroundColor: 'rgba(255, 107, 107, 0.2)', borderColor: COLORS.red }]}>
                  <Thermometer size={10} color={COLORS.red} />
                  <Text style={[styles.statusBadgeText, { color: COLORS.red }]}>Sick: {city.populationSick}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={styles.resourceGrid}>
          {/* Housing */}
          <View style={[styles.resCard, summary.isHomeless && styles.resCardDanger]}>
            <View style={styles.resCardHeader}>
              <Text style={[styles.resCardLabel, summary.isHomeless && { color: '#FFF' }]}>Housing</Text>
              {summary.isHomeless && <AlertTriangle size={14} color="#FFF" />}
            </View>
            <Text style={[styles.resCardValue, summary.isHomeless && { color: '#FFF' }]}>
              {city.population}<Text style={styles.resCardSub}>/{summary.totalHousing}</Text>
            </Text>
            <View style={styles.resProgressBg}>
              <View
                style={[
                  styles.resProgressFill,
                  { width: `${Math.min(100, (city.population / (summary.totalHousing || 1)) * 100)}%` },
                  summary.isHomeless ? { backgroundColor: '#FFF' } : { backgroundColor: COLORS.teal }
                ]}
              />
            </View>
          </View>

          {/* Food */}
          <View style={[styles.resCard, summary.isHungry && styles.resCardWarning]}>
            <View style={styles.resCardHeader}>
              <Text style={[styles.resCardLabel, summary.isHungry && { color: COLORS.dark }]}>Food</Text>
              {summary.isHungry && <Zap size={14} color={COLORS.dark} />}
            </View>
            <Text style={[styles.resCardValue, summary.isHungry && { color: COLORS.dark }]}>
              {summary.foodRequired}<Text style={styles.resCardSub}>/{summary.totalFoodProduction}</Text>
            </Text>
            <View style={styles.resProgressBg}>
              <View
                style={[
                  styles.resProgressFill,
                  { width: `${Math.min(100, (summary.foodRequired / (summary.totalFoodProduction || 1)) * 100)}%` },
                  summary.isHungry ? { backgroundColor: COLORS.dark } : { backgroundColor: COLORS.teal }
                ]}
              />
            </View>
          </View>

          {/* Income */}
          <View style={styles.resCard}>
            <View style={styles.resCardHeader}>
              <Text style={styles.resCardLabel}>Tax Income</Text>
              {city.populationSick > 0 && <LucideIcons.TrendingDown size={12} color={COLORS.red} />}
            </View>
            <Text style={[styles.resCardValue, { color: COLORS.teal }]}>+{summary.totalSilverIncome}</Text>
            <View style={styles.resProgressBg}>
              <View
                style={[
                  styles.resProgressFill,
                  { width: `${summary.taxMultiplier * 100}%`, backgroundColor: COLORS.teal }
                ]}
              />
            </View>
          </View>

          {/* Happiness */}
          <View style={styles.resCard}>
            <View style={styles.resCardHeader}>
              <Text style={styles.resCardLabel}>Happiness</Text>
            </View>
            <Text style={styles.resCardValue}>{city.happiness || 100}%</Text>
            <View style={styles.resProgressBg}>
              <View
                style={[
                  styles.resProgressFill,
                  { width: `${city.happiness || 100}%`, backgroundColor: happinessStatus.color }
                ]}
              />
            </View>
          </View>
        </View>
      </View>

      {/* City Map Grid */}
      <View style={styles.mapContainer}>
        <View style={styles.mapHeader}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.sectionIconBox}>
              <Navigation size={14} color="#FFF" />
            </View>
            <Text style={styles.sectionTitle}>City Map</Text>
          </View>

          {selectedBuildingType && (
            <Animated.View entering={FadeIn} style={styles.placementBadge}>
              <IconRenderer name={selectedBuildingType.iconName} size={14} />
              <Text style={styles.placementText}>{selectedBuildingType.name}</Text>
              <Pressable onPress={() => setSelectedBuildingType(null)}>
                <X size={12} color={COLORS.red} />
              </Pressable>
            </Animated.View>
          )}
        </View>

        <View style={[styles.grid, { backgroundColor: eraAesthetics.bg }]}>
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
            const x = i % GRID_SIZE;
            const y = Math.floor(i / GRID_SIZE);
            const building = buildingMap[`${x},${y}`];
            const type = building ? BUILDINGS.find(t => t.id === building.buildingTypeId) : null;
            const isSelected = selectedTile?.x === x && selectedTile?.y === y;
            const canPlace = selectedBuildingType && !building;

            return (
              <Pressable
                key={i}
                onPress={() => handleTileClick(x, y)}
                style={[
                  styles.tile,
                  { backgroundColor: eraAesthetics.grid },
                  building && styles.tileOccupied,
                  canPlace && styles.tilePlacement,
                  isSelected && styles.tileSelected
                ]}
              >
                {type && building && (
                  <View style={styles.buildingIcon}>
                    <IconRenderer name={type.iconName} size={18} />
                    {building.level > 1 && (
                      <View style={styles.levelTag}>
                        <Text style={styles.levelTagText}>L{building.level}</Text>
                      </View>
                    )}
                  </View>
                )}
                {canPlace && !building && (
                  <Hammer size={12} color={COLORS.dark} opacity={0.2} />
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Selected Tile Details Overlay as a nested element or separate component */}
        {selectedTile && buildingMap[`${selectedTile.x},${selectedTile.y}`] && (
          <Animated.View
            entering={SlideInUp}
            exiting={SlideOutDown}
            style={styles.detailOverlay}
          >
            {(() => {
              const building = buildingMap[`${selectedTile.x},${selectedTile.y}`];
              const rawType = BUILDINGS.find(t => t.id === building.buildingTypeId);
              if (!rawType) return null;

              const costScalar = 1 + (city.buildings.length * 0.05);
              const type = {
                ...rawType,
                costSilver: Math.floor(rawType.costSilver * costScalar),
                costGold: Math.floor(rawType.costGold * costScalar)
              };

              const upgradeCost = Math.floor(type.costSilver * 0.8 * building.level);
              return (
                <View style={styles.detailCard}>
                  <View style={styles.detailTop}>
                    <View style={styles.detailHeader}>
                      <View style={styles.detailIconBox}>
                        <IconRenderer name={type.iconName} size={32} />
                      </View>
                      <View>
                        <Text style={styles.detailName}>{type.name}</Text>
                        <Text style={styles.detailMeta}>Level {building.level} • {building.health}% Condition</Text>
                      </View>
                    </View>
                    <Pressable onPress={() => setSelectedTile(null)} style={styles.detailClose}>
                      <X size={20} color="#FFF" />
                    </Pressable>
                  </View>

                  <View style={styles.detailStatsContainer}>
                    <View style={styles.detailStatBox}>
                      <Text style={styles.detailStatLabel}>Stability</Text>
                      <Text style={styles.detailStatVal}>{building.health}%</Text>
                      <View style={styles.detailProgress}>
                        <View style={[styles.detailProgressFill, { width: `${building.health}%`, backgroundColor: COLORS.teal }]} />
                      </View>
                    </View>
                    <View style={styles.detailStatBox}>
                      <Text style={styles.detailStatLabel}>Daily Yield</Text>
                      <Text style={styles.detailStatVal}>
                        {type.silverIncome > 0 ? `+${Math.floor(type.silverIncome * (1 + (building.level - 1) * 0.2))} S` : `+${Math.floor(type.foodProduction * (1 + (building.level - 1) * 0.2))} Food`}
                      </Text>
                      <Activity size={10} color={COLORS.teal} style={{ marginTop: 4 }} />
                    </View>
                  </View>

                  <View style={styles.detailActions}>
                    <Pressable
                      onPress={() => onUpgrade(building.id, upgradeCost)}
                      disabled={stats.silver < upgradeCost}
                      style={[styles.upgradeBtn, stats.silver < upgradeCost && styles.btnDisabled]}
                    >
                      <TrendingUp size={16} color={COLORS.dark} />
                      <Text style={styles.upgradeBtnText}>Upgrade ({upgradeCost} Silver)</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => { onRemove(building.id); setSelectedTile(null); }}
                      style={styles.deleteBtn}
                    >
                      <Trash2 size={24} color="#FFF" />
                    </Pressable>
                  </View>
                </View>
              );
            })()}
          </Animated.View>
        )}
      </View>

      {/* Builder Menu */}
      <View style={styles.builderMenu}>
        <View style={styles.builderHeader}>
          <View style={styles.builderTitleRow}>
            <Hammer size={20} color={COLORS.dark} />
            <Text style={styles.builderTitle}>Construction Hub</Text>
          </View>

          <View style={styles.searchRow}>
            <View style={styles.searchBox}>
              <Search size={14} color="#9CA3AF" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
              {['all', 'residential', 'economic', 'food'].map(cat => (
                <Pressable
                  key={cat}
                  onPress={() => setFilter(cat)}
                  style={[styles.filterBtn, filter === cat && styles.filterBtnActive]}
                >
                  <Text style={[styles.filterText, filter === cat && styles.filterTextActive]}>{cat}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>

        <FlatList
          horizontal
          data={filteredBuildings}
          keyExtractor={item => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.buildingList}
          renderItem={({ item }) => {
            const isSelected = selectedBuildingType?.id === item.id;
            const canAfford = stats.silver >= item.costSilver;

            return (
              <Pressable
                onPress={() => setSelectedBuildingType(isSelected ? null : item)}
                style={[styles.buildingCard, isSelected && styles.buildingCardActive]}
              >
                <View style={styles.buildingIconBox}>
                  <IconRenderer name={item.iconName} size={32} />
                </View>
                <Text style={styles.buildingName}>{item.name}</Text>
                <Text style={styles.buildingCat}>{item.category}</Text>

                <View style={styles.buildingStats}>
                  {item.housing > 0 && <Text style={styles.smallStat}>🏠 {item.housing}</Text>}
                  {item.foodProduction > 0 && <Text style={styles.smallStat}>🍖 {item.foodProduction}</Text>}
                  {item.silverIncome > 0 && <Text style={styles.smallStat}>🪙 {item.silverIncome}</Text>}
                </View>

                <View style={[styles.costTag, !canAfford && styles.costTagWarning]}>
                  <Coins size={12} color={canAfford ? COLORS.dark : COLORS.red} />
                  <Text style={[styles.costText, !canAfford && { color: COLORS.red }]}>{item.costSilver}</Text>
                </View>
              </Pressable>
            );
          }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  dashboard: {
    backgroundColor: COLORS.dark,
    borderRadius: 40,
    padding: 24,
    margin: 16,
    ...THEME.neoBorderLg,
    ...THEME.neoShadowLg,
    overflow: 'hidden',
  },
  dashboardIconBg: {
    position: 'absolute',
    top: 20,
    right: 20,
    opacity: 0.1,
  },
  dashboardHeader: {
    marginBottom: 24,
  },
  eraTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  eraTitle: {
    fontSize: 28,
    fontWeight: '900',
    fontStyle: 'italic',
    color: COLORS.teal,
    textTransform: 'uppercase',
  },
  eraProgBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    ...THEME.neoBorder,
    borderRadius: 8,
    gap: 4,
  },
  eraProgText: {
    color: COLORS.teal,
    fontSize: 8,
    fontWeight: '900',
    textTransform: 'uppercase',
    fontStyle: 'italic',
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    ...THEME.neoBorder,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  resourceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  resCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    ...THEME.neoBorder,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 12,
    justifyContent: 'space-between',
    minHeight: 80,
  },
  resCardDanger: {
    backgroundColor: COLORS.red,
    borderColor: COLORS.red,
  },
  resCardWarning: {
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.yellow,
  },
  resCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resCardLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: 'rgba(255, 255, 255, 0.4)',
    textTransform: 'uppercase',
  },
  resCardValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFF',
    fontFamily: 'monospace',
  },
  resCardSub: {
    fontSize: 10,
    opacity: 0.4,
  },
  resProgressBg: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 4,
  },
  resProgressFill: {
    height: '100%',
  },
  mapContainer: {
    backgroundColor: '#FFF',
    borderRadius: 40,
    padding: 24,
    marginHorizontal: 16,
    marginBottom: 24,
    ...THEME.neoBorderLg,
    ...THEME.neoShadowLg,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionIconBox: {
    width: 32,
    height: 32,
    backgroundColor: COLORS.dark,
    borderRadius: 10,
    ...THEME.neoBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    textTransform: 'uppercase',
    color: COLORS.dark,
  },
  placementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.teal,
    ...THEME.neoBorder,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 8,
    ...THEME.neoShadowSm,
  },
  placementText: {
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  grid: {
    padding: 8,
    borderRadius: 32,
    ...THEME.neoBorder,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    justifyContent: 'center',
  },
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileOccupied: {
    backgroundColor: '#FFF',
    ...THEME.neoBorder,
    ...THEME.neoShadowSm,
  },
  tilePlacement: {
    backgroundColor: 'rgba(45, 204, 113, 0.2)',
    borderWidth: 1,
    borderColor: COLORS.teal,
    borderStyle: 'dashed',
  },
  tileSelected: {
    borderColor: COLORS.yellow,
    borderWidth: 2,
    backgroundColor: 'rgba(253, 204, 13, 0.1)',
    zIndex: 10,
    transform: [{ scale: 1.1 }],
  },
  buildingIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelTag: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: COLORS.teal,
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 4,
    ...THEME.neoBorder,
  },
  levelTagText: {
    fontSize: 5,
    fontWeight: '900',
  },
  detailOverlay: {
    marginTop: 24,
  },
  detailCard: {
    backgroundColor: COLORS.dark,
    borderRadius: 32,
    padding: 24,
    ...THEME.neoBorderLg,
    ...THEME.neoShadowLg,
  },
  detailTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  detailIconBox: {
    width: 56,
    height: 56,
    backgroundColor: '#FFF',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    ...THEME.neoBorder,
  },
  detailName: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.teal,
    textTransform: 'uppercase',
  },
  detailMeta: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  detailClose: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  detailStatsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  detailStatBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    padding: 16,
    ...THEME.neoBorder,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  detailStatLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: 'rgba(255, 255, 255, 0.4)',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  detailStatVal: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFF',
    fontFamily: 'monospace',
  },
  detailProgress: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  detailProgressFill: {
    height: '100%',
  },
  detailActions: {
    flexDirection: 'row',
    gap: 12,
  },
  upgradeBtn: {
    flex: 1,
    backgroundColor: COLORS.teal,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...THEME.neoBorder,
    ...THEME.neoShadow,
  },
  btnDisabled: {
    opacity: 0.5,
    backgroundColor: '#4B5563',
  },
  upgradeBtnText: {
    fontWeight: '900',
    textTransform: 'uppercase',
    fontSize: 12,
  },
  deleteBtn: {
    width: 56,
    backgroundColor: COLORS.red,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    ...THEME.neoBorder,
    ...THEME.neoShadow,
  },
  builderMenu: {
    marginBottom: 100,
  },
  builderHeader: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  builderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  builderTitle: {
    fontSize: 20,
    fontWeight: '900',
    textTransform: 'uppercase',
    fontStyle: 'italic',
  },
  searchRow: {
    gap: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    ...THEME.neoBorder,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 12,
    fontWeight: '700',
  },
  filterRow: {
    flexDirection: 'row',
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 10,
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  filterBtnActive: {
    backgroundColor: COLORS.dark,
  },
  filterText: {
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    color: '#9CA3AF',
  },
  filterTextActive: {
    color: '#FFF',
  },
  buildingList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  buildingCard: {
    width: 160,
    backgroundColor: '#FFF',
    borderRadius: 32,
    padding: 16,
    marginRight: 16,
    alignItems: 'center',
    ...THEME.neoBorder,
    ...THEME.neoShadowSm,
  },
  buildingCardActive: {
    backgroundColor: COLORS.teal,
    borderColor: COLORS.dark,
  },
  buildingIconBox: {
    width: 64,
    height: 64,
    backgroundColor: COLORS.bg,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    ...THEME.neoBorder,
  },
  buildingName: {
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 2,
  },
  buildingCat: {
    fontSize: 8,
    fontWeight: '900',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  buildingStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    justifyContent: 'center',
    marginBottom: 12,
  },
  smallStat: {
    fontSize: 7,
    fontWeight: '900',
    backgroundColor: COLORS.bg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  costTag: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    backgroundColor: COLORS.bg,
    borderRadius: 12,
    ...THEME.neoBorder,
  },
  costTagWarning: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  costText: {
    fontSize: 10,
    fontWeight: '900',
  }
});
