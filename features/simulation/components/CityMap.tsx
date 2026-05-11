import React from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { BuildingType, PlacedBuilding, CityState, UserStats } from '@/core/types';
import { BUILDINGS, GRID_SIZE } from '@/core/constants';
import { Hammer, Navigation, X, TrendingUp, Trash2, Activity } from 'lucide-react-native';
import Animated, { FadeIn, SlideInUp, SlideOutDown } from 'react-native-reanimated';
import { COLORS, THEME } from '@/constants/theme';
import * as LucideIcons from 'lucide-react-native';

const { width } = Dimensions.get('window');
const TILE_SIZE = (width - 64) / GRID_SIZE;

const IconRenderer = ({ name, size = 16, color = COLORS.dark }: { name: string; size?: number; color?: string }) => {
    const Icon = (LucideIcons as any)[name] || LucideIcons.HelpCircle;
    return <Icon size={size} color={color} />;
};

interface CityMapProps {
    buildingMap: Record<string, PlacedBuilding>;
    eraAesthetics: { bg: string; grid: string; accent: string };
    selectedBuildingType: BuildingType | null;
    selectedTile: { x: number; y: number } | null;
    handleTileClick: (x: number, y: number) => void;
    setSelectedTile: (tile: { x: number; y: number } | null) => void;
    onUpgrade: (buildingId: string, cost: number) => void;
    onRemove: (buildingId: string) => void;
    stats: UserStats;
    city: CityState;
}

export function CityMap({
    buildingMap,
    eraAesthetics,
    selectedBuildingType,
    selectedTile,
    handleTileClick,
    setSelectedTile,
    onUpgrade,
    onRemove,
    stats,
    city,
}: CityMapProps) {
    return (
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
                        <Pressable onPress={() => setSelectedTile(null)}>
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
                                isSelected && styles.tileSelected,
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
                            {canPlace && !building && <Hammer size={12} color={COLORS.dark} opacity={0.2} />}
                        </Pressable>
                    );
                })}
            </View>

            {selectedTile && buildingMap[`${selectedTile.x},${selectedTile.y}`] && (
                <Animated.View entering={SlideInUp} exiting={SlideOutDown} style={styles.detailOverlay}>
                    {(() => {
                        const building = buildingMap[`${selectedTile.x},${selectedTile.y}`];
                        const rawType = BUILDINGS.find(t => t.id === building.buildingTypeId);
                        if (!rawType) return null;

                        const costScalar = 1 + city.buildings.length * 0.05;
                        const type = {
                            ...rawType,
                            costSilver: Math.floor(rawType.costSilver * costScalar),
                            costGold: Math.floor(rawType.costGold * costScalar),
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
                                            {type.silverIncome > 0
                                                ? `+${Math.floor(type.silverIncome * (1 + (building.level - 1) * 0.2))} S`
                                                : `+${Math.floor(type.foodProduction * (1 + (building.level - 1) * 0.2))} Food`}
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
                                    <Pressable onPress={() => { onRemove(building.id); setSelectedTile(null); }} style={styles.deleteBtn}>
                                        <Trash2 size={24} color="#FFF" />
                                    </Pressable>
                                </View>
                            </View>
                        );
                    })()}
                </Animated.View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    mapContainer: {
        backgroundColor: '#FFF',
        borderRadius: 40,
        padding: 24,
        marginHorizontal: 16,
        marginBottom: 24,
        ...THEME.neoBorderLg,
        ...THEME.neoShadowLg,
    },
    mapHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    sectionIconBox: { width: 32, height: 32, backgroundColor: COLORS.dark, borderRadius: 10, ...THEME.neoBorder, justifyContent: 'center', alignItems: 'center' },
    sectionTitle: { fontSize: 16, fontWeight: '900', textTransform: 'uppercase', color: COLORS.dark },
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
    placementText: { fontSize: 9, fontWeight: '900', textTransform: 'uppercase' },
    grid: { padding: 8, borderRadius: 32, ...THEME.neoBorder, flexDirection: 'row', flexWrap: 'wrap', gap: 4, justifyContent: 'center' },
    tile: { width: TILE_SIZE, height: TILE_SIZE, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    tileOccupied: { backgroundColor: '#FFF', ...THEME.neoBorder, ...THEME.neoShadowSm },
    tilePlacement: { backgroundColor: 'rgba(45, 204, 113, 0.2)', borderWidth: 1, borderColor: COLORS.teal, borderStyle: 'dashed' },
    tileSelected: { borderColor: COLORS.yellow, borderWidth: 2, backgroundColor: 'rgba(253, 204, 13, 0.1)', zIndex: 10, transform: [{ scale: 1.1 }] },
    buildingIcon: { justifyContent: 'center', alignItems: 'center' },
    levelTag: { position: 'absolute', top: -6, right: -6, backgroundColor: COLORS.teal, paddingHorizontal: 3, paddingVertical: 1, borderRadius: 4, ...THEME.neoBorder },
    levelTagText: { fontSize: 5, fontWeight: '900' },
    detailOverlay: { marginTop: 24 },
    detailCard: { backgroundColor: COLORS.dark, borderRadius: 32, padding: 24, ...THEME.neoBorderLg, ...THEME.neoShadowLg },
    detailTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
    detailHeader: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    detailIconBox: { width: 56, height: 56, backgroundColor: '#FFF', borderRadius: 16, justifyContent: 'center', alignItems: 'center', ...THEME.neoBorder },
    detailName: { fontSize: 20, fontWeight: '900', color: COLORS.teal, textTransform: 'uppercase' },
    detailMeta: { fontSize: 10, color: 'rgba(255, 255, 255, 0.5)', fontWeight: '700', textTransform: 'uppercase' },
    detailClose: { padding: 8, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 12 },
    detailStatsContainer: { flexDirection: 'row', gap: 12, marginBottom: 24 },
    detailStatBox: { flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 24, padding: 16, ...THEME.neoBorder, borderColor: 'rgba(255, 255, 255, 0.1)' },
    detailStatLabel: { fontSize: 10, fontWeight: '900', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', marginBottom: 4 },
    detailStatVal: { fontSize: 20, fontWeight: '900', color: '#FFF', fontFamily: 'monospace' },
    detailProgress: { height: 4, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 2, marginTop: 8, overflow: 'hidden' },
    detailProgressFill: { height: '100%' },
    detailActions: { flexDirection: 'row', gap: 12 },
    upgradeBtn: { flex: 1, backgroundColor: COLORS.teal, borderRadius: 16, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, ...THEME.neoBorder, ...THEME.neoShadow },
    btnDisabled: { opacity: 0.5, backgroundColor: '#4B5563' },
    upgradeBtnText: { fontWeight: '900', textTransform: 'uppercase', fontSize: 12 },
    deleteBtn: { width: 56, backgroundColor: COLORS.red, borderRadius: 16, justifyContent: 'center', alignItems: 'center', ...THEME.neoBorder, ...THEME.neoShadow },
});