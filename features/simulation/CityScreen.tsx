import { BUILDINGS, ERAS_CONFIG, GRID_SIZE } from '@/core/constants';
import { calculateCitySummary, getBuildingOccupancy, getHappinessStatus, getHealthStatus, getOccupancyStatus, getProductivityStatus, isValidGridCoord } from '@/core/simulation/cityUtils';
import { BuildingType, CityState, Era, PlacedBuilding, UserStats } from '@/core/types';
import { useDebounce } from '@/hooks/useDebounce'; // asumsikan hook ini ada, atau buat inline
import * as LucideIcons from 'lucide-react-native';
import {
    AlertTriangle,
    Coins,
    Dna,
    Hammer,
    Navigation,
    Search,
    Trash2,
    TrendingUp,
    X
} from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
    View
} from 'react-native';

// Helper IconRenderer (tetap sama)
const IconRenderer = ({ name, size = 24, color = '#000' }: { name: string; size?: number; color?: string }) => {
    const Icon = (LucideIcons as any)[name] || LucideIcons.HelpCircle;
    return <Icon size={size} color={color} />;
};

// Utility untuk menghitung biaya scaling (dipisahkan agar konsisten)
const getScaledCost = (baseCost: number, totalBuildings: number): number => {
    const scalar = 1 + totalBuildings * 0.05;
    return Math.floor(baseCost * scalar);
};

// Komponen loading skeleton untuk grid (opsional)
const GridSkeleton = ({ size, count }: { size: number; count: number }) => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {Array.from({ length: count }).map((_, i) => (
            <View key={i} style={{ width: size, height: size, padding: 2 }}>
                <View style={{ flex: 1, borderRadius: 12, backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="small" color="#94A3B8" />
                </View>
            </View>
        ))}
    </View>
);

interface CityTabProps {
    city: CityState;
    buildings: PlacedBuilding[];
    stats: UserStats;
    onDeploy: (buildingId: string, x: number, y: number, cost: number) => void;
    onUpgrade: (buildingId: string, cost: number) => void;
    onRemove: (buildingId: string) => void;
    onSwitchTab: (tab: string) => void;
    isLoadingBuildings?: boolean; // optional loading state dari parent
}

export default function CityTab({
    city,
    buildings = [],
    stats,
    onDeploy,
    onUpgrade,
    onRemove,
    onSwitchTab,
    isLoadingBuildings = false
}: CityTabProps) {


    //const [activeTab, setActiveTab] = useState<'city' | 'evolution'>('city');
    const { width: screenWidth } = useWindowDimensions();
    const [selectedBuildingType, setSelectedBuildingType] = useState<BuildingType | null>(null);
    const [selectedTile, setSelectedTile] = useState<{ x: number; y: number } | null>(null);
    const [filter, setFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearchQuery = useDebounce(searchQuery, 300);
    const slideAnim = useRef(new Animated.Value(0)).current;

    // Layout calculations
    const GRID_PADDING = screenWidth > 400 ? 16 : 12;
    const availableWidth = screenWidth - 32 - (GRID_PADDING * 2);
    const GRID_ITEM_SIZE = availableWidth / GRID_SIZE;

    // Mapping koordinat ke building
    const buildingMap = useMemo(() => {
        const map: Record<string, PlacedBuilding> = {};
        buildings.forEach(b => {
            map[`${b.gridX}_${b.gridY}`] = b;
        });
        // Validasi mismatch
        const mismatched = buildings.filter(b => !BUILDINGS.find(t => t.id === b.buildingTypeId));
        if (mismatched.length > 0) {
            console.warn('[CityTab] Mismatched building types:', mismatched.map(b => b.buildingTypeId));
        }
        return map;
    }, [buildings]);

    // Summary (menggunakan buildings terpisah)
    const summary = useMemo(() => calculateCitySummary(city, buildings), [city, buildings]);
    const healthStatus = getHealthStatus(city.health);
    const happinessStatus = getHappinessStatus(city.happiness ?? 100);
    const productivityStatus = getProductivityStatus(summary.taxMultiplier);

    // Era aesthetics
    const eraAesthetics = useMemo(() => {
        switch (city.currentEra) {
            case Era.STONE_AGE: return { bg: '#E5D3B3', grid: '#D2B48C', accent: '#8B4513' };
            case Era.MEDIEVAL: return { bg: '#F4F1EA', grid: '#B0C4DE', accent: '#4169E1' };
            case Era.INDUSTRIAL: return { bg: '#DCDCDC', grid: '#708090', accent: '#2F4F4F' };
            case Era.MODERN: return { bg: '#FFFFFF', grid: '#14B8A6', accent: '#14B8A6' };
            case Era.DIGITAL: return { bg: '#0F172A', grid: '#8B5CF6', accent: '#8B5CF6' };
            default: return { bg: '#F8FAFC', grid: '#CBD5E1', accent: '#14B8A6' };
        }
    }, [city.currentEra]);

    // Filter dan scaling bangunan (menggunakan debounced search)
    const filteredBuildings = useMemo(() => {
        const totalBuildings = buildings.length;
        return BUILDINGS.filter(b => {
            const era = ERAS_CONFIG.find(e => e.id === b.era);
            const isUnlocked = stats.level >= (era?.minLevel || 0);
            const matchesFilter = filter === 'all' || b.category === filter;
            const matchesSearch = b.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
            return isUnlocked && matchesFilter && matchesSearch;
        }).map(b => ({
            ...b,
            costSilver: getScaledCost(b.costSilver, totalBuildings),
            costGold: getScaledCost(b.costGold, totalBuildings),
        }));
    }, [stats.level, filter, debouncedSearchQuery, buildings.length]);

    // Debug
    useEffect(() => {
        console.log('[CityTab] Buildings updated:', buildings.length);
    }, [buildings]);

    // Handler tile click
    const handleTileClick = useCallback((x: number, y: number) => {
        
        if (!isValidGridCoord(x, y)) {
        console.error(`[handleTileClick] Invalid tile: (${x}_${y})`);
        return;
    }
        const coordKey = `${x}_${y}`;
        const building = buildingMap[coordKey];

        if (selectedBuildingType) {
            if (!building && stats.silver >= selectedBuildingType.costSilver) {
                console.log(`📍 Placing ${selectedBuildingType.id} at [${x}, ${y}]`);
                onDeploy(selectedBuildingType.id, x, y, selectedBuildingType.costSilver);
                setSelectedBuildingType(null);
            }
            return;
        }

        if (building) {
            setSelectedTile({ x, y });
            Animated.timing(slideAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
        } else {
            setSelectedTile(null);
            Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
        }
    }, [buildingMap, selectedBuildingType, stats.silver, onDeploy, slideAnim]);

    const closeDetail = useCallback(() => {
        setSelectedTile(null);
        Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
    }, [slideAnim]);

    // Render grid dengan loading state
    const renderGrid = () => {
        if (isLoadingBuildings) {
            return <GridSkeleton size={GRID_ITEM_SIZE} count={GRID_SIZE * GRID_SIZE} />;
        }

        const tiles = [];
        for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
            const x = i % GRID_SIZE;
            const y = Math.floor(i / GRID_SIZE);

            if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) {
                console.error(`❌ Grid render error: invalid coordinates at index ${i}: [${x}, ${y}]`);
                continue;
            }

            const building = buildingMap[`${x}_${y}`];
            const type = building ? BUILDINGS.find(t => t.id === building.buildingTypeId) : null;
            const isSelected = selectedTile?.x === x && selectedTile?.y === y;
            const canPlace = selectedBuildingType && !building;

            tiles.push(
                <View key={i} style={{ width: GRID_ITEM_SIZE, height: GRID_ITEM_SIZE, padding: 2 }}>
                    <TouchableOpacity
                        style={[
                            {
                                flex: 1,
                                borderRadius: 12,
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderWidth: 1,
                                backgroundColor: building ? '#FFFFFF' : canPlace ? '#14B8A633' : eraAesthetics.grid,
                                borderColor: canPlace ? '#14B8A6' : '#CBD5E1',
                                borderStyle: canPlace ? 'dashed' : 'solid',
                            },
                            isSelected && { borderWidth: 2, borderColor: '#FBBF24', transform: [{ scale: 1.05 }], zIndex: 10 },
                        ]}
                        onPress={() => handleTileClick(x, y)}
                    >
                        {type && building && (
                            <>
                                <IconRenderer name={type.iconName} size={Math.max(16, GRID_ITEM_SIZE * 0.3)} color="#1E293B" />
                                {building.level > 1 && (
                                    <View style={{ position: 'absolute', top: -4, right: -4, backgroundColor: '#14B8A6', borderRadius: 12, paddingHorizontal: 4, paddingVertical: 2, borderWidth: 1, borderColor: '#0F172A' }}>
                                        <Text style={{ fontSize: 8, fontWeight: '900', color: '#0F172A' }}>L{building.level}</Text>
                                    </View>
                                )}
                            </>
                        )}
                        {!type && building && (
                            <View style={{ alignItems: 'center', gap: 4 }}>
                                <AlertTriangle size={Math.max(16, GRID_ITEM_SIZE * 0.3)} color="#EF4444" />
                                <Text style={{ fontSize: 8, fontWeight: '800', color: '#EF4444', textAlign: 'center' }}>?</Text>
                            </View>
                        )}
                        {canPlace && !building && (
                            <Hammer size={GRID_ITEM_SIZE * 0.25} color="#1E293B" style={{ opacity: 0.4 }} />
                        )}
                    </TouchableOpacity>
                </View>
            );
        }
        return (
            <View style={[{
                flexDirection: 'row',
                flexWrap: 'wrap',
                backgroundColor: eraAesthetics.bg,
                borderRadius: 32,
                padding: GRID_PADDING,
                borderWidth: 2,
                borderColor: '#CBD5E1',
            }]}>
                {tiles}
            </View>
        );
    };


    // Ukuran font responsif
    const titleFontSize = Math.min(32, screenWidth * 0.08);
    const resourceValueFont = Math.min(24, screenWidth * 0.06);
    const smallCapsFont = Math.max(8, screenWidth * 0.022);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F7FA' }}>
            <ScrollView
                style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 80 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Dashboard Card */}
                <View style={[styles.dashboardCard, { padding: screenWidth > 400 ? 24 : 16 }]}>
                    {/* Header era dan stats */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: 24 }}>
                        <View>
                            <Text style={[styles.eraTitle, { fontSize: titleFontSize }]}>{city.currentEra}</Text>
                            <TouchableOpacity onPress={() => onSwitchTab('evolution')} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8, backgroundColor: 'rgba(255,255,255,0.1)', padding: 8, borderRadius: 16 }}>
                                <Dna size={14} color="#14B8A6" />
                                <Text style={[styles.eraSub, { color: '#14B8A6' }]}>Era Progression</Text>
                            </TouchableOpacity>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, gap: 8 }}>
                                <View style={styles.statusBadge}><Text style={[styles.eraSub, { color: healthStatus.color }]}>Health: {city.health}%</Text></View>
                                <View style={styles.statusBadge}><Text style={[styles.eraSub, { color: '#14B8A6' }]}>Pop: {city.population}</Text></View>
                                {(city.populationSick || 0) > 0 && (
                                    <View style={[styles.statusBadge, { backgroundColor: '#EF4444', borderColor: '#FCA5A5' }]}>
                                        <Text style={{ fontSize: smallCapsFont, fontWeight: '800', color: '#FFF' }}>😷 Sick: {city.populationSick}</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>

                    {/* Resource cards (sama seperti sebelumnya) */}
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                        <View style={[styles.resourceCard, summary.isHomeless && styles.resourceCardWarning, { flexBasis: screenWidth > 500 ? '48%' : '100%' }]}>
                            <Text style={{ fontSize: smallCapsFont, fontWeight: '800', textTransform: 'uppercase', opacity: 0.7 }}>Citizens / Housing</Text>
                            <Text style={{ fontSize: resourceValueFont, fontWeight: '900', marginVertical: 4 }}>{city.population} <Text style={{ opacity: 0.5 }}>/ {summary.totalHousing}</Text></Text>
                            <View style={styles.progressBar}>
                                <View style={[styles.progressFill, { width: `${Math.min(100, (city.population / (summary.totalHousing || 1)) * 100)}%`, backgroundColor: summary.isHomeless ? '#FFF' : '#14B8A6' }]} />
                            </View>
                        </View>
                        <View style={[styles.resourceCard, summary.isHungry && styles.resourceCardHunger, { flexBasis: screenWidth > 500 ? '48%' : '100%' }]}>
                            <Text style={{ fontSize: smallCapsFont, fontWeight: '800', textTransform: 'uppercase', opacity: 0.7 }}>Required / Food</Text>
                            <Text style={{ fontSize: resourceValueFont, fontWeight: '900', marginVertical: 4 }}>{summary.foodRequired} <Text style={{ opacity: 0.5 }}>/ {summary.totalFoodProduction}</Text></Text>
                            <View style={styles.progressBar}>
                                <View style={[styles.progressFill, { width: `${Math.min(100, (summary.foodRequired / (summary.totalFoodProduction || 1)) * 100)}%` }]} />
                            </View>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                        <View style={[styles.resourceCard, { flexBasis: screenWidth > 500 ? '48%' : '100%' }]}>
                            <Text style={{ fontSize: smallCapsFont, fontWeight: '800', textTransform: 'uppercase', opacity: 0.7 }}>Daily S / Prod</Text>
                            <Text style={{ fontSize: resourceValueFont, fontWeight: '900', color: '#14B8A6' }}>+{summary.totalSilverIncome}</Text>
                            <Text style={[styles.eraSub, { color: productivityStatus.color, fontSize: smallCapsFont }]}>{productivityStatus.label}</Text>
                            <View style={styles.progressBar}>
                                <View style={[styles.progressFill, { width: `${summary.taxMultiplier * 100}%`, backgroundColor: productivityStatus.color.replace('text-', '') }]} />
                            </View>
                        </View>
                        <View style={[styles.resourceCard, { flexBasis: screenWidth > 500 ? '48%' : '100%' }]}>
                            <Text style={{ fontSize: smallCapsFont, fontWeight: '800', textTransform: 'uppercase', opacity: 0.7 }}>Happiness</Text>
                            <Text style={{ fontSize: resourceValueFont, fontWeight: '900', marginVertical: 4 }}>{city.happiness ?? 100}%</Text>
                            <Text style={[styles.eraSub, { color: happinessStatus.color, fontSize: smallCapsFont }]}>{happinessStatus.label}</Text>
                            <View style={styles.progressBar}>
                                <View style={[styles.progressFill, { width: `${city.happiness ?? 100}%`, backgroundColor: happinessStatus.color.replace('text-', '') }]} />
                            </View>
                        </View>
                    </View>

                    {(summary.isHungry || summary.isHomeless) && (
                        <View style={styles.crisisBox}>
                            <View style={{ width: 40, height: 40, backgroundColor: '#FFF', borderRadius: 16, justifyContent: 'center', alignItems: 'center' }}>
                                <AlertTriangle size={24} color="#EF4444" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 12, fontWeight: '900', textTransform: 'uppercase', color: '#FFF' }}>Krisis Terdeteksi!</Text>
                                <Text style={{ fontSize: 10, fontWeight: 'bold', opacity: 0.9 }}>{summary.isHungry && 'Kekurangan Pangan. '}{summary.isHomeless && 'Krisis Tempat Tinggal.'} Segera bangun infrastruktur tambahan!</Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Map Card */}
                <View style={[styles.mapCard, { padding: screenWidth > 400 ? 16 : 12 }]}>
                    <View style={[styles.mapHeader, { flexWrap: 'wrap', gap: 8 }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <View style={{ padding: 8, backgroundColor: '#1E293B', borderRadius: 16 }}>
                                <Navigation size={16} color="#FFF" />
                            </View>
                            <Text style={{ fontSize: 18, fontWeight: '900', textTransform: 'uppercase' }}>City Map</Text>
                        </View>
                        {selectedBuildingType && (
                            <View style={{ backgroundColor: '#14B8A6', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <IconRenderer name={selectedBuildingType.iconName} size={16} color="#0F172A" />
                                <Text style={{ fontSize: 10, fontWeight: '900' }}>{selectedBuildingType.name}</Text>
                                <TouchableOpacity onPress={() => setSelectedBuildingType(null)}>
                                    <X size={14} color="#EF4444" />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                    {renderGrid()}
                </View>

                {/* Construction Hub */}
                <View style={{ marginBottom: 24 }}>
                    <View style={[styles.sectionHeader, { flexWrap: 'wrap', gap: 12 }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Hammer size={20} color="#1E293B" />
                            <Text style={{ fontSize: 20, fontWeight: '900', fontStyle: 'italic' }}>Konstruksi Kota</Text>
                        </View>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                            <View style={{ position: 'relative', flex: 1, minWidth: 150 }}>
                                <Search size={14} style={{ position: 'absolute', left: 8, top: 10, zIndex: 1 }} color="#94A3B8" />
                                <TextInput
                                    placeholder="Cari Bangunan..."
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                    style={[styles.searchInput, { paddingLeft: 32, minWidth: 120 }]}
                                    placeholderTextColor="#94A3B8"
                                />
                            </View>
                            <View style={styles.filterChips}>
                                {['all', 'residential', 'economic', 'food'].map(cat => (
                                    <TouchableOpacity
                                        key={cat}
                                        onPress={() => setFilter(cat)}
                                        style={[styles.chip, filter === cat && styles.chipActive]}
                                    >
                                        <Text style={[styles.chipText, filter === cat && { color: '#FFF' }]}>{cat}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: 8 }}>
                        <View style={{ flexDirection: 'row', gap: 16 }}>
                            {filteredBuildings.map(building => {
                                const isSelected = selectedBuildingType?.id === building.id;
                                const canAfford = stats.silver >= building.costSilver;
                                return (
                                    <TouchableOpacity
                                        key={building.id}
                                        onPress={() => setSelectedBuildingType(isSelected ? null : building)}
                                        style={[styles.buildingCard, { width: screenWidth > 380 ? 160 : 140 }, isSelected && styles.buildingCardSelected]}
                                    >
                                        <View style={[styles.buildingIcon, { width: screenWidth > 380 ? 64 : 56, height: screenWidth > 380 ? 64 : 56 }]}>
                                            <IconRenderer name={building.iconName} size={screenWidth > 380 ? 32 : 28} color="#1E293B" />
                                        </View>
                                        <Text style={{ fontSize: screenWidth > 380 ? 12 : 10, fontWeight: '900', textTransform: 'uppercase', marginVertical: 4 }} numberOfLines={1}>
                                            {building.name}
                                        </Text>
                                        <Text style={{ fontSize: 8, fontWeight: 'bold', color: '#94A3B8', marginBottom: 8 }}>{building.category}</Text>
                                        <View style={{ flexDirection: 'row', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
                                            {building.housing > 0 && <Text style={styles.statBadge}>🏠 {building.housing}</Text>}
                                            {building.foodProduction > 0 && <Text style={styles.statBadge}>🍖 {building.foodProduction}</Text>}
                                            {building.silverIncome > 0 && <Text style={styles.statBadge}>🪙 {building.silverIncome}</Text>}
                                        </View>
                                        <View style={[styles.costBadge, canAfford ? styles.costAvailable : styles.costDisabled]}>
                                            <Coins size={12} color={canAfford ? '#1E293B' : '#EF4444'} />
                                            <Text style={{ fontSize: 10, fontWeight: '900', color: canAfford ? '#1E293B' : '#EF4444' }}>{building.costSilver}</Text>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </ScrollView>
                </View>

                {/* Slide-up panel untuk detail building */}
                {selectedTile && buildingMap[`${selectedTile.x}_${selectedTile.y}`] && (
                    <Animated.View style={[styles.detailPanel, { transform: [{ translateY: slideAnim.interpolate({ inputRange: [0, 1], outputRange: [500, 0] }) }], padding: screenWidth > 400 ? 24 : 16 }]}>
                        {(() => {
                            const building = buildingMap[`${selectedTile.x}_${selectedTile.y}`];
                            const rawType = BUILDINGS.find(t => t.id === building.buildingTypeId);
                            if (!rawType) return null;
                            // Hitung ulang scaling berdasarkan jumlah bangunan saat ini
                            const totalBuildings = buildings.length;
                            const scaledCostSilver = getScaledCost(rawType.costSilver, totalBuildings);
                            // Upgrade cost menggunakan scaled cost (atau bisa pakai base? Di sini kita tetap pakai scaled)
                            const upgradeCost = Math.floor(scaledCostSilver * 0.8 * building.level);
                            const levelMult = 1 + (building.level - 1) * 0.2;
                            const currentHousing = Math.floor((rawType.housing || 0) * levelMult);
                            const currentProduction = Math.floor((rawType.foodProduction || 0) * levelMult);
                            const currentIncome = Math.floor((rawType.silverIncome || 0) * levelMult);
                            const occupancy = getBuildingOccupancy(city.population, summary.totalHousing, currentHousing);
                            const occStatus = getOccupancyStatus(occupancy, currentHousing);
                            return (
                                <>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                                        <View style={{ flexDirection: 'row', gap: 12 }}>
                                            <View style={{ width: 56, height: 56, backgroundColor: '#FFF', borderRadius: 24, justifyContent: 'center', alignItems: 'center' }}>
                                                <IconRenderer name={rawType.iconName} size={32} color="#1E293B" />
                                            </View>
                                            <View>
                                                <Text style={{ fontSize: 20, fontWeight: '900', color: '#14B8A6' }}>{rawType.name}</Text>
                                                <Text style={{ fontSize: 12, color: '#94A3B8' }}>Level {building.level} • {building.health}% Condition</Text>
                                            </View>
                                        </View>
                                        <TouchableOpacity onPress={closeDetail}>
                                            <X size={24} color="#FFF" />
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                                        {rawType.housing > 0 && (
                                            <View style={{ flex: 1, minWidth: 120, backgroundColor: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 24 }}>
                                                <Text style={{ fontSize: 10, fontWeight: '800', textTransform: 'uppercase', color: '#94A3B8' }}>Housing Capacity</Text>
                                                <Text style={{ fontSize: 24, fontWeight: '900', color: '#14B8A6' }}>{occupancy} / {currentHousing}</Text>
                                                <View style={styles.progressBar}>
                                                    <View style={[styles.progressFill, { width: `${(occupancy / (currentHousing || 1)) * 100}%`, backgroundColor: occStatus.color?.replace('text-', '') || '#14B8A6' }]} />
                                                </View>
                                            </View>
                                        )}
                                        {rawType.foodProduction > 0 && (
                                            <View style={{ flex: 1, minWidth: 120, backgroundColor: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 24 }}>
                                                <Text style={{ fontSize: 10, fontWeight: '800', textTransform: 'uppercase', color: '#94A3B8' }}>Food Production</Text>
                                                <Text style={{ fontSize: 24, fontWeight: '900', color: '#FBBF24' }}>+{currentProduction}</Text>
                                            </View>
                                        )}
                                        {rawType.silverIncome > 0 && (
                                            <View style={{ flex: 1, minWidth: 120, backgroundColor: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 24 }}>
                                                <Text style={{ fontSize: 10, fontWeight: '800', textTransform: 'uppercase', color: '#94A3B8' }}>Tax Revenue</Text>
                                                <Text style={{ fontSize: 24, fontWeight: '900', color: '#14B8A6' }}>+{currentIncome} S</Text>
                                            </View>
                                        )}
                                    </View>
                                    <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
                                        <TouchableOpacity
                                            onPress={() => {
                                                onUpgrade(`${building.gridX}_${building.gridY}`,
                                                    upgradeCost); closeDetail();
                                            }}
                                            disabled={stats.silver < upgradeCost}
                                            style={{ flex: 1, backgroundColor: stats.silver >= upgradeCost ? '#14B8A6' : '#475569', paddingVertical: 14, borderRadius: 24, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}
                                        >
                                            <TrendingUp size={16} color="#0F172A" />
                                            <Text style={{ fontWeight: '900', color: '#0F172A' }}>Upgrade ({upgradeCost} S)</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => { onRemove(`${building.gridX}_${building.gridY}`); closeDetail(); }} style={{ backgroundColor: '#EF4444', paddingHorizontal: 20, borderRadius: 24, justifyContent: 'center' }}>
                                            <Trash2 size={20} color="#FFF" />
                                        </TouchableOpacity>
                                    </View>
                                </>
                            );
                        })()}
                    </Animated.View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    dashboardCard: {
        backgroundColor: '#1E293B',
        borderRadius: 40,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 0,
        elevation: 8,
        borderWidth: 2,
        borderColor: '#334155',
        overflow: 'hidden',
    },
    eraTitle: { fontWeight: '900', fontStyle: 'italic', color: '#14B8A6', letterSpacing: -1 },
    eraSub: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: '#334155', marginRight: 8 },
    resourceCard: { padding: 16, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.05)' },
    resourceCardWarning: { backgroundColor: '#EF4444' },
    resourceCardHunger: { backgroundColor: '#FBBF24' },
    progressBar: { height: 4, borderRadius: 4, backgroundColor: 'rgba(0,0,0,0.2)', marginTop: 8, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: '#14B8A6' },
    crisisBox: { marginTop: 16, padding: 16, backgroundColor: '#EF4444', borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 12 },
    mapCard: { backgroundColor: '#FFF', borderRadius: 40, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 0.1, shadowRadius: 0, borderWidth: 2, borderColor: '#E2E8F0' },
    mapHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingHorizontal: 8 },
    searchInput: { backgroundColor: '#FFF', borderRadius: 16, paddingVertical: 8, fontSize: 12, fontWeight: 'bold', borderWidth: 1, borderColor: '#CBD5E1' },
    filterChips: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 16, padding: 4 },
    chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    chipActive: { backgroundColor: '#1E293B' },
    chipText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', color: '#1E293B' },
    buildingCard: { padding: 16, borderRadius: 32, borderWidth: 2, borderColor: '#F1F5F9', backgroundColor: '#FFF', alignItems: 'center' },
    buildingCardSelected: { borderColor: '#1E293B', backgroundColor: '#14B8A6' },
    buildingIcon: { borderRadius: 24, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#CBD5E1' },
    costBadge: { marginTop: 12, paddingVertical: 8, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 4 },
    costAvailable: { backgroundColor: '#F1F5F9' },
    costDisabled: { backgroundColor: '#FEE2E2', borderColor: '#EF4444' },
    statBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 12, fontSize: 8, fontWeight: '800' },
    detailPanel: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#1E293B', borderTopLeftRadius: 40, borderTopRightRadius: 40, borderWidth: 2, borderColor: '#334155', shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.2 },
});