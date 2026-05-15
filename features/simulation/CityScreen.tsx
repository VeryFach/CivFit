import { BUILDINGS, ERAS_CONFIG, GRID_SIZE } from '@/core/constants';
import { calculateCitySummary, getBuildingOccupancy, getHappinessStatus, getHealthStatus, getOccupancyStatus, getProductivityStatus } from '@/core/simulation/cityUtils';
import { BuildingType, CityState, PlacedBuilding, UserStats } from '@/core/types';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useDebounce } from '@/hooks/useDebounce';
import * as LucideIcons from 'lucide-react-native';
import {
    AlertTriangle,
    Coins,
    Dna,
    Ham,
    Hammer,
    Home,
    Landmark,
    Navigation,
    Search,
    SmilePlus,
    Trash2,
    TrendingUp,
    UsersRound,
    X,
} from 'lucide-react-native';
import React, { useCallback, useMemo, useRef, useState } from 'react';
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

// Helper IconRenderer
const IconRenderer = ({ name, size = 24, color = '#000' }: { name: string; size?: number; color?: string }) => {
    const Icon = (LucideIcons as any)[name] || LucideIcons.HelpCircle;
    return <Icon size={size} color={color} />;
};

// Utility untuk menghitung biaya scaling
const getScaledCost = (baseCost: number, totalBuildings: number): number => {
    const scalar = 1 + totalBuildings * 0.05;
    return Math.floor(baseCost * scalar);
};

// Komponen loading skeleton untuk grid
const GridSkeleton = ({ size, count, palette }: { size: number; count: number; palette: any }) => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {Array.from({ length: count }).map((_, i) => (
            <View key={i} style={{ width: size, height: size, padding: 2 }}>
                <View style={{ flex: 1, borderRadius: 12, backgroundColor: palette.cardAlt, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="small" color={palette.textMuted} />
                </View>
            </View>
        ))}
    </View>
);

// ─── Palette helper ─────────────────────────────────────────────────────────
function usePalette() {
    const scheme = useColorScheme();
    const isDark = scheme === 'dark';
    return {
        isDark,
        // Backgrounds
        bg: isDark ? '#0F172A' : '#F8FAFC',
        card: isDark ? '#1E293B' : '#FFFFFF',
        cardAlt: isDark ? '#0F172A' : '#F1F5F9',
        panel: isDark ? '#111827' : '#FFFFFF',
        // Borders
        border: isDark ? '#334155' : '#E2E8F0',
        borderMuted: isDark ? '#1E293B' : '#F1F5F9',
        borderActive: isDark ? '#14B8A6' : '#0D9488',
        // Text
        text: isDark ? '#F8FAFC' : '#1E293B',
        textMuted: isDark ? '#94A3B8' : '#64748B',
        textFaint: isDark ? 'rgba(248,250,252,0.4)' : 'rgba(30,41,59,0.5)',
        // Aksen brand (tetap)
        accentTeal: '#14B8A6',
        accentGold: '#FBBF24',
        accentRed: '#EF4444',
        // Tambahan overlay untuk badge/elemen agar menyesuaikan tema
        overlay: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',

        // Komponen spesifik - Diperbaiki agar adaptif dengan Light Mode
        dashboardBg: isDark ? '#1E293B' : '#FFFFFF',
        dashboardBorder: isDark ? '#334155' : '#E2E8F0',
        resourceCardBg: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC',
        resourceCardBorder: isDark ? 'rgba(255,255,255,0.2)' : '#E2E8F0',
        crisisBoxBg: '#EF4444',
        mapCardBg: isDark ? '#1E293B' : '#FFFFFF',
        mapCardBorder: isDark ? '#334155' : '#E2E8F0',
        mapGridBg: isDark ? '#0F172A' : '#F8FAFC',
        mapGridBorder: isDark ? '#334155' : '#CBD5E1',
        buildingCardBg: isDark ? '#1E293B' : '#FFFFFF',
        buildingCardBorder: isDark ? '#334155' : '#E2E8F0',
        buildingCardSelectedBg: '#14B8A6',
        buildingCardSelectedBorder: isDark ? '#1E293B' : '#0D9488',
        buildingIconBg: isDark ? '#0F172A' : '#F1F5F9',
        buildingIconBorder: isDark ? '#334155' : '#CBD5E1',
        chipBg: isDark ? '#0F172A' : '#F1F5F9',
        chipActiveBg: isDark ? '#FFFFFF' : '#1E293B',
        chipText: isDark ? '#F8FAFC' : '#1E293B',
        chipActiveText: isDark ? '#1E293B' : '#FFFFFF',
        detailPanelBg: isDark ? '#0F172A' : '#FFFFFF',
        detailPanelBorder: isDark ? '#334155' : '#E2E8F0',
    };
}

interface CityTabProps {
    city: CityState;
    buildings: PlacedBuilding[];
    stats: UserStats;
    // SAMAKAN URUTANNYA DENGAN STORE: ID, Cost, X, Y
    onDeploy: (buildingId: string, cost: number, x: number, y: number) => void;
    onUpgrade: (buildingId: string, cost: number) => void;
    onRemove: (buildingId: string) => void;
    onSwitchTab: (tab: string) => void;
    isLoadingBuildings?: boolean;
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
    const palette = usePalette();
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
        return map;
    }, [buildings]);

    // Summary
    const summary = useMemo(() => calculateCitySummary(city, buildings), [city, buildings]);
    const healthStatus = getHealthStatus(city.health);
    const happinessStatus = getHappinessStatus(city.happiness ?? 100);
    const productivityStatus = getProductivityStatus(summary.taxMultiplier);

    const resourceIconSize = Math.max(14, screenWidth * 0.035);

    // Filter dan scaling bangunan
    const filteredBuildings = useMemo(() => {
        const totalBuildings = buildings?.length || 0; // Beri pengaman

        // Tambahkan pengaman (BUILDINGS || []) agar tidak crash
        return (BUILDINGS || []).filter(b => {
            const era = (ERAS_CONFIG || []).find(e => e.id === b.era);
            const isUnlocked = stats?.level >= (era?.minLevel || 0);
            const matchesFilter = filter === 'all' || b.category === filter;
            const matchesSearch = b.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
            return isUnlocked && matchesFilter && matchesSearch;
        }).map(b => ({
            ...b,
            costSilver: getScaledCost(b.costSilver, totalBuildings),
            costGold: getScaledCost(b.costGold, totalBuildings),
        }));
    }, [stats?.level, filter, debouncedSearchQuery, buildings?.length]);

    // Handler tile click
    const handleTileClick = useCallback((x: number, y: number) => {
        if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) {
            console.error(`Blocked invalid click at: ${x}_${y}`);
            return;
        }
        const coordKey = `${x}_${y}`;
        const building = buildingMap[coordKey];

        if (selectedBuildingType) {
            if (!building && stats.silver >= selectedBuildingType.costSilver) {
                // SAMAKAN URUTANNYA: ID, Cost, X, Y
                onDeploy(selectedBuildingType.id, selectedBuildingType.costSilver, x, y);
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

    // Render grid
    const renderGrid = () => {
        if (isLoadingBuildings) {
            return <GridSkeleton size={GRID_ITEM_SIZE} count={GRID_SIZE * GRID_SIZE} palette={palette} />;
        }

        const tiles = [];
        for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
            const x = i % GRID_SIZE;
            const y = Math.floor(i / GRID_SIZE);
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
                                backgroundColor: building ? palette.card : (canPlace ? palette.accentTeal + '33' : palette.mapGridBg),
                                borderColor: canPlace ? palette.accentTeal : palette.mapGridBorder,
                                borderStyle: canPlace ? 'dashed' : 'solid',
                            },
                            isSelected && { borderWidth: 2, borderColor: palette.accentGold, transform: [{ scale: 1.05 }], zIndex: 10 },
                        ]}
                        onPress={() => handleTileClick(x, y)}
                    >
                        {type && building && (
                            <>
                                <IconRenderer name={type.iconName} size={Math.max(16, GRID_ITEM_SIZE * 0.3)} color={palette.text} />
                                {building.level > 1 && (
                                    <View style={{ position: 'absolute', top: -4, right: -4, backgroundColor: palette.accentTeal, borderRadius: 12, paddingHorizontal: 4, paddingVertical: 2, borderWidth: 1, borderColor: palette.borderActive }}>
                                        <Text style={{ fontSize: 8, fontWeight: '900', color: '#FFFFFF' }}>L{building.level}</Text>
                                    </View>
                                )}
                            </>
                        )}
                        {!type && building && (
                            <View style={{ alignItems: 'center', gap: 4 }}>
                                <AlertTriangle size={Math.max(16, GRID_ITEM_SIZE * 0.3)} color={palette.accentRed} />
                                <Text style={{ fontSize: 8, fontWeight: '800', color: palette.accentRed, textAlign: 'center' }}>?</Text>
                            </View>
                        )}
                        {canPlace && !building && (
                            <Hammer size={GRID_ITEM_SIZE * 0.25} color={palette.textMuted} style={{ opacity: 0.4 }} />
                        )}
                    </TouchableOpacity>
                </View>
            );
        }
        return (
            <View style={[{
                flexDirection: 'row',
                flexWrap: 'wrap',
                backgroundColor: palette.mapGridBg,
                borderRadius: 32,
                padding: GRID_PADDING,
                borderWidth: 2,
                borderColor: palette.mapGridBorder,
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
        <SafeAreaView style={{ flex: 1, backgroundColor: palette.bg }}>
            <ScrollView
                style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 80 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Dashboard Card */}
                <View style={[styles.dashboardCard, { padding: screenWidth > 400 ? 24 : 16, backgroundColor: palette.dashboardBg, borderColor: palette.dashboardBorder }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: 24 }}>
                        <View>
                            <Text style={[styles.eraTitle, { fontSize: titleFontSize, color: palette.accentTeal }]}>{city.currentEra}</Text>
                            <TouchableOpacity onPress={() => onSwitchTab('evolution')} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8, backgroundColor: palette.overlay, padding: 8, borderRadius: 16 }}>
                                <Dna size={14} color={palette.accentTeal} />
                                <Text style={[styles.eraSub, { color: palette.accentTeal }]}>Era Progression</Text>
                            </TouchableOpacity>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, gap: 8 }}>
                                <View style={[styles.statusBadge, { backgroundColor: palette.overlay, borderColor: palette.border }]}>
                                    <Text style={[styles.eraSub, { color: healthStatus.color }]}>Health: {city.health}%</Text>
                                </View>
                                <View style={[styles.statusBadge, { backgroundColor: palette.overlay, borderColor: palette.border }]}>
                                    <Text style={[styles.eraSub, { color: palette.accentTeal }]}>Pop: {city.population}</Text>
                                </View>
                                {(city.populationSick || 0) > 0 && (
                                    <View style={[styles.statusBadge, { backgroundColor: palette.accentRed, borderColor: '#FCA5A5' }]}>
                                        <Text style={{ fontSize: smallCapsFont, fontWeight: '800', color: '#FFF' }}>😷 Sick: {city.populationSick}</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>

                    {/* Resource cards */}
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                        <View style={[styles.resourceCard, summary.isHomeless && styles.resourceCardWarning, { flexBasis: screenWidth > 500 ? '48%' : '100%', backgroundColor: palette.resourceCardBg, borderColor: palette.resourceCardBorder }]}>
                            <View style={styles.resourceTitleRow}>
                                <View style={[styles.resourceIconWrap, { backgroundColor: palette.overlay }]}>
                                    <Home size={resourceIconSize} color={palette.accentTeal} />
                                </View>
                                <Text style={{ fontSize: smallCapsFont, fontWeight: '800', textTransform: 'uppercase', color: palette.textFaint }}>Citizens / Housing</Text>
                            </View>
                            <Text style={{ fontSize: resourceValueFont, fontWeight: '900', marginVertical: 4, color: palette.text }}>{city.population} <Text style={{ opacity: 0.5 }}>/ {summary.totalHousing}</Text></Text>
                            <View style={styles.progressBar}>
                                <View style={[styles.progressFill, { width: `${Math.min(100, (city.population / (summary.totalHousing || 1)) * 100)}%`, backgroundColor: summary.isHomeless ? '#FFF' : palette.accentTeal }]} />
                            </View>
                        </View>
                        <View style={[styles.resourceCard, summary.isHungry && styles.resourceCardHunger, { flexBasis: screenWidth > 500 ? '48%' : '100%', backgroundColor: palette.resourceCardBg, borderColor: palette.resourceCardBorder }]}>
                            <View style={styles.resourceTitleRow}>
                                <View style={[styles.resourceIconWrap, { backgroundColor: palette.overlay }]}>
                                    <Ham size={resourceIconSize} color={palette.accentGold} />
                                </View>
                                <Text style={{ fontSize: smallCapsFont, fontWeight: '800', textTransform: 'uppercase', color: palette.textFaint }}>Required / Food</Text>
                            </View>
                            <Text style={{ fontSize: resourceValueFont, fontWeight: '900', marginVertical: 4, color: palette.text }}>{summary.foodRequired} <Text style={{ opacity: 0.5 }}>/ {summary.totalFoodProduction}</Text></Text>
                            <View style={styles.progressBar}>
                                <View style={[styles.progressFill, { width: `${Math.min(100, (summary.foodRequired / (summary.totalFoodProduction || 1)) * 100)}%`, backgroundColor: palette.accentGold }]} />
                            </View>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                        <View style={[styles.resourceCard, { flexBasis: screenWidth > 500 ? '48%' : '100%', backgroundColor: palette.resourceCardBg, borderColor: palette.resourceCardBorder }]}>
                            <View style={styles.resourceTitleRow}>
                                <View style={[styles.resourceIconWrap, { backgroundColor: palette.overlay }]}>
                                    <Landmark size={resourceIconSize} color={palette.accentTeal} />
                                </View>
                                <Text style={{ fontSize: smallCapsFont, fontWeight: '800', textTransform: 'uppercase', color: palette.textFaint }}>Daily S / Prod</Text>
                            </View>
                            <Text style={{ fontSize: resourceValueFont, fontWeight: '900', color: palette.accentTeal }}>+{summary.totalSilverIncome}</Text>
                            <Text style={[styles.eraSub, { color: productivityStatus.color, fontSize: smallCapsFont }]}>{productivityStatus.label}</Text>
                            <View style={styles.progressBar}>
                                <View style={[styles.progressFill, { width: `${summary.taxMultiplier * 100}%`, backgroundColor: productivityStatus.color.replace('text-', '') }]} />
                            </View>
                        </View>
                        <View style={[styles.resourceCard, { flexBasis: screenWidth > 500 ? '48%' : '100%', backgroundColor: palette.resourceCardBg, borderColor: palette.resourceCardBorder }]}>
                            <View style={styles.resourceTitleRow}>
                                <View style={[styles.resourceIconWrap, { backgroundColor: palette.overlay }]}>
                                    <SmilePlus size={resourceIconSize} color={palette.accentRed} />
                                </View>
                                <Text style={{ fontSize: smallCapsFont, fontWeight: '800', textTransform: 'uppercase', color: palette.textFaint }}>Happiness</Text>
                            </View>
                            <Text style={{ fontSize: resourceValueFont, fontWeight: '900', marginVertical: 4, color: palette.text }}>{city.happiness ?? 100}%</Text>
                            <Text style={[styles.eraSub, { color: happinessStatus.color, fontSize: smallCapsFont }]}>{happinessStatus.label}</Text>
                            <View style={styles.progressBar}>
                                <View style={[styles.progressFill, { width: `${city.happiness ?? 100}%`, backgroundColor: happinessStatus.color.replace('text-', '') }]} />
                            </View>
                        </View>
                    </View>

                    {(summary.isHungry || summary.isHomeless) && (
                        <View style={[styles.crisisBox, { backgroundColor: palette.crisisBoxBg }]}>
                            <View style={{ width: 40, height: 40, backgroundColor: '#FFF', borderRadius: 16, justifyContent: 'center', alignItems: 'center' }}>
                                <AlertTriangle size={24} color={palette.accentRed} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 12, fontWeight: '900', textTransform: 'uppercase', color: '#FFF' }}>Krisis Terdeteksi!</Text>
                                <Text style={{ fontSize: 10, fontWeight: 'bold', opacity: 0.9, color: '#FFF' }}>{summary.isHungry && 'Kekurangan Pangan. '}{summary.isHomeless && 'Krisis Tempat Tinggal.'} Segera bangun infrastruktur tambahan!</Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Map Card */}
                <View style={[styles.mapCard, { padding: screenWidth > 400 ? 16 : 12, backgroundColor: palette.mapCardBg, borderColor: palette.mapCardBorder }]}>
                    <View style={[styles.mapHeader, { flexWrap: 'wrap', gap: 8 }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <View style={{ padding: 8, backgroundColor: palette.overlay, borderRadius: 16 }}>
                                <Navigation size={16} color={palette.accentTeal} />
                            </View>
                            <Text style={{ fontSize: 18, fontWeight: '900', textTransform: 'uppercase', color: palette.text }}>City Map</Text>
                        </View>
                        {selectedBuildingType && (
                            <View style={{ backgroundColor: palette.accentTeal, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <IconRenderer name={selectedBuildingType.iconName} size={16} color="#FFFFFF" />
                                <Text style={{ fontSize: 10, fontWeight: '900', color: "#FFFFFF" }}>{selectedBuildingType.name}</Text>
                                <TouchableOpacity onPress={() => setSelectedBuildingType(null)}>
                                    <X size={14} color="#FFF" />
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
                            <Hammer size={20} color={palette.text} />
                            <Text style={{ fontSize: 20, fontWeight: '900', fontStyle: 'italic', color: palette.text }}>Konstruksi Kota</Text>
                        </View>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                            <View style={{ position: 'relative', flex: 1, minWidth: 150 }}>
                                <Search size={14} style={{ position: 'absolute', left: 8, top: 10, zIndex: 1 }} color={palette.textMuted} />
                                <TextInput
                                    placeholder="Cari Bangunan..."
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                    style={[styles.searchInput, { paddingLeft: 32, minWidth: 120, backgroundColor: palette.card, borderColor: palette.border, color: palette.text }]}
                                    placeholderTextColor={palette.textMuted}
                                />
                            </View>
                            <View style={[styles.filterChips, { backgroundColor: palette.chipBg }]}>
                                {['all', 'residential', 'economic', 'food'].map(cat => (
                                    <TouchableOpacity
                                        key={cat}
                                        onPress={() => setFilter(cat)}
                                        style={[styles.chip, filter === cat && { backgroundColor: palette.chipActiveBg }]}
                                    >
                                        <Text style={[styles.chipText, { color: filter === cat ? palette.chipActiveText : palette.chipText }]}>{cat}</Text>
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
                                        style={[
                                            styles.buildingCard,
                                            { width: screenWidth > 380 ? 160 : 140, backgroundColor: palette.buildingCardBg, borderColor: palette.buildingCardBorder },
                                            isSelected && { backgroundColor: palette.buildingCardSelectedBg, borderColor: palette.buildingCardSelectedBorder }
                                        ]}
                                    >
                                        <View style={[styles.buildingIcon, { width: screenWidth > 380 ? 64 : 56, height: screenWidth > 380 ? 64 : 56, backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : palette.buildingIconBg, borderColor: isSelected ? 'transparent' : palette.buildingIconBorder }]}>
                                            <IconRenderer name={building.iconName} size={screenWidth > 380 ? 32 : 28} color={isSelected ? '#FFFFFF' : palette.text} />
                                        </View>
                                        <Text style={{ fontSize: screenWidth > 380 ? 12 : 10, fontWeight: '900', textTransform: 'uppercase', marginVertical: 4, color: isSelected ? '#FFFFFF' : palette.text }} numberOfLines={1}>
                                            {building.name}
                                        </Text>
                                        <Text style={{ fontSize: 8, fontWeight: 'bold', color: isSelected ? 'rgba(255,255,255,0.8)' : palette.textMuted, marginBottom: 8 }}>{building.category}</Text>
                                        <View style={{ flexDirection: 'row', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
                                            {building.housing > 0 && <Text style={[styles.statBadge, { backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : palette.cardAlt, color: isSelected ? '#FFFFFF' : palette.text }]}>🏠 {building.housing}</Text>}
                                            {building.foodProduction > 0 && <Text style={[styles.statBadge, { backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : palette.cardAlt, color: isSelected ? '#FFFFFF' : palette.text }]}>🍖 {building.foodProduction}</Text>}
                                            {building.silverIncome > 0 && <Text style={[styles.statBadge, { backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : palette.cardAlt, color: isSelected ? '#FFFFFF' : palette.text }]}>🪙 {building.silverIncome}</Text>}
                                        </View>
                                        <View style={[styles.costBadge, canAfford ? { backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : palette.cardAlt } : { backgroundColor: '#FEE2E2', borderColor: palette.accentRed }]}>
                                            <Coins size={12} color={canAfford ? (isSelected ? '#FFFFFF' : palette.text) : palette.accentRed} />
                                            <Text style={{ fontSize: 10, fontWeight: '900', color: canAfford ? (isSelected ? '#FFFFFF' : palette.text) : palette.accentRed }}>{building.costSilver}</Text>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </ScrollView>
                </View>

                {/* Slide-up panel untuk detail building */}
                {selectedTile && buildingMap[`${selectedTile.x}_${selectedTile.y}`] && (
                    <Animated.View style={[styles.detailPanel, { transform: [{ translateY: slideAnim.interpolate({ inputRange: [0, 1], outputRange: [500, 0] }) }], padding: screenWidth > 400 ? 24 : 16, backgroundColor: palette.detailPanelBg, borderColor: palette.detailPanelBorder }]}>
                        {(() => {
                            const building = buildingMap[`${selectedTile.x}_${selectedTile.y}`];
                            const rawType = BUILDINGS.find(t => t.id === building.buildingTypeId);
                            if (!rawType) return null;
                            const totalBuildings = buildings.length;
                            const scaledCostSilver = getScaledCost(rawType.costSilver, totalBuildings);
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
                                            <View style={{ width: 56, height: 56, backgroundColor: palette.cardAlt, borderRadius: 24, justifyContent: 'center', alignItems: 'center' }}>
                                                <IconRenderer name={rawType.iconName} size={32} color={palette.text} />
                                            </View>
                                            <View>
                                                <Text style={{ fontSize: 20, fontWeight: '900', color: palette.accentTeal }}>{rawType.name}</Text>
                                                <Text style={{ fontSize: 12, color: palette.textMuted }}>Level {building.level} • {building.health}% Condition</Text>
                                            </View>
                                        </View>
                                        <TouchableOpacity onPress={closeDetail}>
                                            <X size={24} color={palette.text} />
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                                        {rawType.housing > 0 && (
                                            <View style={{ flex: 1, minWidth: 120, backgroundColor: palette.cardAlt, padding: 12, borderRadius: 24 }}>
                                                <Text style={{ fontSize: 10, fontWeight: '800', textTransform: 'uppercase', color: palette.textMuted }}>Housing Capacity</Text>
                                                <Text style={{ fontSize: 24, fontWeight: '900', color: palette.accentTeal }}>{occupancy} / {currentHousing}</Text>
                                                <View style={styles.progressBar}>
                                                    <View style={[styles.progressFill, { width: `${(occupancy / (currentHousing || 1)) * 100}%`, backgroundColor: occStatus.color?.replace('text-', '') || palette.accentTeal }]} />
                                                </View>
                                            </View>
                                        )}
                                        {rawType.foodProduction > 0 && (
                                            <View style={{ flex: 1, minWidth: 120, backgroundColor: palette.cardAlt, padding: 12, borderRadius: 24 }}>
                                                <Text style={{ fontSize: 10, fontWeight: '800', textTransform: 'uppercase', color: palette.textMuted }}>Food Production</Text>
                                                <Text style={{ fontSize: 24, fontWeight: '900', color: palette.accentGold }}>+{currentProduction}</Text>
                                            </View>
                                        )}
                                        {rawType.silverIncome > 0 && (
                                            <View style={{ flex: 1, minWidth: 120, backgroundColor: palette.cardAlt, padding: 12, borderRadius: 24 }}>
                                                <Text style={{ fontSize: 10, fontWeight: '800', textTransform: 'uppercase', color: palette.textMuted }}>Tax Revenue</Text>
                                                <Text style={{ fontSize: 24, fontWeight: '900', color: palette.accentTeal }}>+{currentIncome} S</Text>
                                            </View>
                                        )}
                                    </View>
                                    <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
                                        <TouchableOpacity
                                            onPress={() => { onUpgrade(`${building.gridX}_${building.gridY}`, upgradeCost); closeDetail(); }}
                                            disabled={stats.silver < upgradeCost}
                                            style={{ flex: 1, backgroundColor: stats.silver >= upgradeCost ? palette.accentTeal : palette.borderMuted, paddingVertical: 14, borderRadius: 24, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}
                                        >
                                            <TrendingUp size={16} color={stats.silver >= upgradeCost ? '#FFFFFF' : palette.textMuted} />
                                            <Text style={{ fontWeight: '900', color: stats.silver >= upgradeCost ? '#FFFFFF' : palette.textMuted }}>Upgrade ({upgradeCost} S)</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => { onRemove(`${building.gridX}_${building.gridY}`); closeDetail(); }} style={{ backgroundColor: palette.accentRed, paddingHorizontal: 20, borderRadius: 24, justifyContent: 'center' }}>
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
        borderRadius: 40,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 8,
        borderWidth: 2,
        overflow: 'hidden',
    },
    eraTitle: { fontWeight: '900', fontStyle: 'italic', letterSpacing: -1 },
    eraSub: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, borderWidth: 1, marginRight: 8 },
    resourceCard: { padding: 16, borderRadius: 24, borderWidth: 1 },
    resourceTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    resourceIconWrap: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    resourceCardWarning: { backgroundColor: '#EF4444' },
    resourceCardHunger: { backgroundColor: '#FBBF24' },
    progressBar: { height: 4, borderRadius: 4, backgroundColor: 'rgba(0,0,0,0.1)', marginTop: 8, overflow: 'hidden' },
    progressFill: { height: '100%' },
    crisisBox: { marginTop: 16, padding: 16, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 12 },
    mapCard: { borderRadius: 40, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, borderWidth: 2 },
    mapHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingHorizontal: 8 },
    searchInput: { borderRadius: 16, paddingVertical: 8, fontSize: 12, fontWeight: 'bold', borderWidth: 1 },
    filterChips: { flexDirection: 'row', borderRadius: 16, padding: 4 },
    chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    chipText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
    buildingCard: { padding: 16, borderRadius: 32, borderWidth: 2, alignItems: 'center' },
    buildingIcon: { borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 12, borderWidth: 1 },
    costBadge: { marginTop: 12, paddingVertical: 8, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 4 },
    statBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 12, fontSize: 8, fontWeight: '800', overflow: 'hidden' },
    detailPanel: { position: 'absolute', bottom: 0, left: 0, right: 0, borderTopLeftRadius: 40, borderTopRightRadius: 40, borderWidth: 2, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, elevation: 20 },
});