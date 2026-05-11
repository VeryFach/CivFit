import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TextInput, FlatList, Pressable, Text, Dimensions } from 'react-native';
import { CityState, UserStats, BuildingType, PlacedBuilding, Era } from '@/core/types';
import { BUILDINGS, GRID_SIZE, ERAS_CONFIG } from '@/core/constants';
import { calculateCitySummary, getHealthStatus, getHappinessStatus, getProductivityStatus } from '@/core/simulation/cityUtils';
import * as LucideIcons from 'lucide-react-native';
import { Hammer, Search, Coins } from 'lucide-react-native';
import { COLORS, THEME } from '@/constants/theme';
import { CityHeader } from '../components/CityHeader';
import { CityStats } from '../components/CityStats';
import { CityMap } from '../components/CityMap';

const { width } = Dimensions.get('window');
const TILE_SIZE = (width - 64) / GRID_SIZE;

const IconRenderer = ({ name, size = 16, color = COLORS.dark }: { name: string; size?: number; color?: string }) => {
    const Icon = (LucideIcons as any)[name] || LucideIcons.HelpCircle;
    return <Icon size={size} color={color} />;
};

interface CityScreenProps {
    city: CityState;
    stats: UserStats;
    onDeploy: (buildingId: string, x: number, y: number, cost: number) => void;
    onUpgrade: (buildingId: string, cost: number) => void;
    onRemove: (buildingId: string) => void;
    onSwitchTab: (tab: string) => void;
}

export function CityScreen({ city, stats, onDeploy, onUpgrade, onRemove, onSwitchTab }: CityScreenProps) {
    const [selectedBuildingType, setSelectedBuildingType] = useState<BuildingType | null>(null);
    const [selectedTile, setSelectedTile] = useState<{ x: number; y: number } | null>(null);
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
        const costScalar = 1 + city.buildings.length * 0.05;
        return BUILDINGS.filter(b => {
            const era = ERAS_CONFIG.find(e => e.id === b.era);
            const isUnlocked = stats.level >= (era?.minLevel || 0);
            const matchesFilter = filter === 'all' || b.category === filter;
            const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase());
            return isUnlocked && matchesFilter && matchesSearch;
        }).map(b => ({
            ...b,
            costSilver: Math.floor(b.costSilver * costScalar),
            costGold: Math.floor(b.costGold * costScalar),
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
            <CityHeader city={city} stats={stats} onSwitchTab={onSwitchTab} healthStatus={healthStatus} />
            <CityStats city={city} summary={summary} happinessStatus={happinessStatus} />

            {/* City Map */}
            <CityMap
                buildingMap={buildingMap}
                eraAesthetics={eraAesthetics}
                selectedBuildingType={selectedBuildingType}
                selectedTile={selectedTile}
                handleTileClick={handleTileClick}
                setSelectedTile={setSelectedTile}
                onUpgrade={onUpgrade}
                onRemove={onRemove}
                stats={stats}
                city={city}
            />

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
    scrollView: { flex: 1 },
    builderMenu: { marginBottom: 100 },
    builderHeader: { paddingHorizontal: 20, marginBottom: 16 },
    builderTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
    builderTitle: { fontSize: 20, fontWeight: '900', textTransform: 'uppercase', fontStyle: 'italic' },
    searchRow: { gap: 12 },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        ...THEME.neoBorder,
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 40,
    },
    searchInput: { flex: 1, marginLeft: 8, fontSize: 12, fontWeight: '700' },
    filterRow: { flexDirection: 'row' },
    filterBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 8,
        borderRadius: 10,
        backgroundColor: COLORS.bg,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    filterBtnActive: { backgroundColor: COLORS.dark },
    filterText: { fontSize: 9, fontWeight: '900', textTransform: 'uppercase', color: '#9CA3AF' },
    filterTextActive: { color: '#FFF' },
    buildingList: { paddingHorizontal: 20, paddingBottom: 20 },
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
    buildingCardActive: { backgroundColor: COLORS.teal, borderColor: COLORS.dark },
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
    buildingName: { fontSize: 12, fontWeight: '900', textTransform: 'uppercase', textAlign: 'center', marginBottom: 2 },
    buildingCat: { fontSize: 8, fontWeight: '900', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 12 },
    buildingStats: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, justifyContent: 'center', marginBottom: 12 },
    smallStat: { fontSize: 7, fontWeight: '900', backgroundColor: COLORS.bg, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
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
    costTagWarning: { backgroundColor: 'rgba(255, 107, 107, 0.1)', borderColor: 'rgba(255, 107, 107, 0.3)' },
    costText: { fontSize: 10, fontWeight: '900' },
});

console.log('CityHeader:', CityHeader);
console.log('CityStats:', CityStats);
console.log('CityMap:', CityMap);