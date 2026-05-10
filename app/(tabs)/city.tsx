import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { citySystems } from '@/data/civfit';
import { CivfitScreen } from '../../src/components/civfit/screen';
import { SectionCard } from '../../src/components/civfit/section-card';
import { BUILDING_TYPES, useCivfitStore } from '../../src/state/civfit-store';

export default function CityScreen() {
    const router = useRouter();
    const { city, stats, summary, deployBuilding, upgradeBuilding, removeBuilding } = useCivfitStore();
    const [selectedBuildingType, setSelectedBuildingType] = useState(BUILDING_TYPES[0]);
    const [searchQuery, setSearchQuery] = useState('');

    const buildingMap = useMemo(
        () => new Map(city.buildings.map((building) => [`${building.gridX},${building.gridY}`, building])),
        [city.buildings],
    );

    const filteredBuildings = useMemo(() => {
        return BUILDING_TYPES.filter((building) => building.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [searchQuery]);

    return (
        <CivfitScreen>
            <View style={styles.hero}>
                <Text style={styles.kicker}>CITY CENTER</Text>
                <Text style={styles.title}>{city.currentEra}</Text>
                <Text style={styles.subtitle}>
                    Sistem kota meniru web: status dashboard, grid bangunan, dan jalur evolusi.
                </Text>
            </View>

            <View style={styles.dashboardCard}>
                <View style={styles.dashboardTopRow}>
                    <View>
                        <Text style={styles.dashboardLabel}>Health</Text>
                        <Text style={styles.dashboardValue}>{city.health}%</Text>
                    </View>
                    <Pressable style={styles.evolutionButton} onPress={() => router.push('/menu')}>
                        <Text style={styles.evolutionButtonText}>Era Progression</Text>
                    </Pressable>
                </View>
                <View style={styles.resourceGrid}>
                    <View style={styles.resourceCard}>
                        <Text style={styles.resourceLabel}>Population / Housing</Text>
                        <Text style={styles.resourceValue}>{city.population} / {summary.totalHousing}</Text>
                    </View>
                    <View style={styles.resourceCard}>
                        <Text style={styles.resourceLabel}>Food / Production</Text>
                        <Text style={styles.resourceValue}>{city.food} / {summary.totalFoodProduction}</Text>
                    </View>
                    <View style={styles.resourceCard}>
                        <Text style={styles.resourceLabel}>Daily S / Prod</Text>
                        <Text style={styles.resourceValue}>+{summary.totalSilverIncome}</Text>
                    </View>
                    <View style={styles.resourceCard}>
                        <Text style={styles.resourceLabel}>Happiness</Text>
                        <Text style={styles.resourceValue}>{city.happiness}%</Text>
                    </View>
                </View>
            </View>

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Building Grid</Text>
                <Text style={styles.sectionHint}>tap a tile</Text>
            </View>

            <View style={styles.gridCard}>
                <View style={styles.grid}>
                    {Array.from({ length: 9 }).map((_, index) => {
                        const x = index % 3;
                        const y = Math.floor(index / 3);
                        const building = buildingMap.get(`${x},${y}`);
                        return (
                            <Pressable
                                key={`${x}-${y}`}
                                style={[styles.tile, building && styles.tileFilled]}
                                onPress={() => {
                                    if (!building) {
                                        deployBuilding(selectedBuildingType.id, selectedBuildingType.costSilver, x, y);
                                    }
                                }}>
                                <Text style={styles.tileText}>{building ? building.buildingTypeId : '+'}</Text>
                            </Pressable>
                        );
                    })}
                </View>
                <View style={styles.paletteRow}>
                    {filteredBuildings.map((building) => (
                        <Pressable
                            key={building.id}
                            style={[styles.paletteButton, selectedBuildingType.id === building.id && styles.paletteButtonActive]}
                            onPress={() => setSelectedBuildingType(building)}>
                            <Text style={styles.paletteButtonText}>{building.name}</Text>
                            <Text style={styles.paletteButtonMeta}>{building.costSilver} S</Text>
                        </Pressable>
                    ))}
                </View>
                <TextInput
                    style={styles.search}
                    placeholder="Cari bangunan"
                    placeholderTextColor="#8A8F98"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <View style={styles.stack}>
                {citySystems.map((system) => (
                    <SectionCard
                        key={system.title}
                        title={system.title}
                        description={system.description}
                        badge={system.badge}
                        icon={<Ionicons name={system.icon as keyof typeof Ionicons.glyphMap} size={22} color="#E85146" />}
                    />
                ))}
            </View>

            <View style={styles.habitStack}>
                {city.buildings.slice(0, 3).map((building) => (
                    <View key={building.id} style={styles.habitCard}>
                        <View style={styles.habitTopRow}>
                            <View>
                                <Text style={styles.habitTitle}>{building.buildingTypeId}</Text>
                                <Text style={styles.habitMeta}>Level {building.level} · health {building.health}%</Text>
                            </View>
                            <Text style={styles.habitReward}>ERA</Text>
                        </View>
                        <View style={styles.habitActions}>
                            <Pressable style={styles.smallButton} onPress={() => upgradeBuilding(building.id, 100)}>
                                <Text style={styles.smallButtonText}>Upgrade</Text>
                            </Pressable>
                            <Pressable style={styles.smallButtonDanger} onPress={() => removeBuilding(building.id)}>
                                <Text style={styles.smallButtonText}>Remove</Text>
                            </Pressable>
                        </View>
                    </View>
                ))}
            </View>

            <Text style={styles.footerText}>Current level {stats.level} unlocks {city.currentEra}. Use the grid to place new buildings like the web version.</Text>
        </CivfitScreen>
    );
}

const styles = StyleSheet.create({
    hero: {
        gap: 10,
        paddingTop: 10,
    },
    kicker: {
        color: '#E85146',
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 2.4,
        textTransform: 'uppercase',
    },
    title: {
        color: '#1F2228',
        fontSize: 30,
        lineHeight: 34,
        fontWeight: '900',
    },
    subtitle: {
        color: '#4C5158',
        fontSize: 15,
        lineHeight: 22,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    sectionTitle: {
        color: '#1F2228',
        fontSize: 18,
        fontWeight: '800',
    },
    sectionHint: {
        color: '#E85146',
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1.2,
    },
    stack: {
        gap: 14,
    },
    dashboardCard: {
        borderRadius: 28,
        borderWidth: 2,
        borderColor: '#1F2228',
        backgroundColor: '#1F2228',
        padding: 18,
        gap: 14,
        shadowColor: '#1F2228',
        shadowOpacity: 0.25,
        shadowRadius: 0,
        shadowOffset: { width: 4, height: 4 },
        elevation: 4,
    },
    dashboardTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dashboardLabel: {
        color: 'rgba(255,255,255,0.45)',
        textTransform: 'uppercase',
        letterSpacing: 1,
        fontSize: 10,
        fontWeight: '800',
    },
    dashboardValue: {
        color: '#FFD94A',
        fontSize: 28,
        fontWeight: '900',
    },
    evolutionButton: {
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#1F2228',
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    evolutionButtonText: {
        color: '#1F2228',
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    resourceGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    resourceCard: {
        flexBasis: '48%',
        borderRadius: 18,
        borderWidth: 2,
        borderColor: '#FFFFFF',
        backgroundColor: 'rgba(255,255,255,0.08)',
        padding: 12,
        gap: 4,
    },
    resourceLabel: {
        color: 'rgba(255,255,255,0.55)',
        fontSize: 9,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    resourceValue: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '900',
    },
    gridCard: {
        borderRadius: 24,
        borderWidth: 2,
        borderColor: '#1F2228',
        backgroundColor: '#FFFFFF',
        padding: 16,
        gap: 12,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    tile: {
        width: '30%',
        aspectRatio: 1,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#1F2228',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F6F0E7',
    },
    tileFilled: {
        backgroundColor: '#D7F3EA',
    },
    tileText: {
        color: '#1F2228',
        fontSize: 12,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    paletteRow: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'wrap',
    },
    paletteButton: {
        borderWidth: 2,
        borderColor: '#1F2228',
        borderRadius: 16,
        paddingHorizontal: 10,
        paddingVertical: 10,
        backgroundColor: '#F6F0E7',
        gap: 2,
    },
    paletteButtonActive: {
        backgroundColor: '#FFD94A',
    },
    paletteButtonText: {
        color: '#1F2228',
        fontSize: 11,
        fontWeight: '900',
    },
    paletteButtonMeta: {
        color: '#4C5158',
        fontSize: 9,
        fontWeight: '700',
    },
    search: {
        borderWidth: 2,
        borderColor: '#1F2228',
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: '#F6F0E7',
        color: '#1F2228',
        fontWeight: '700',
    },
    habitStack: {
        gap: 12,
    },
    habitCard: {
        borderRadius: 24,
        borderWidth: 2,
        borderColor: '#1F2228',
        backgroundColor: '#FFFFFF',
        padding: 16,
        gap: 12,
    },
    habitTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 10,
    },
    habitTitle: {
        color: '#1F2228',
        fontSize: 16,
        fontWeight: '900',
    },
    habitMeta: {
        color: '#4C5158',
        fontSize: 11,
        marginTop: 3,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    habitReward: {
        color: '#E85146',
        fontWeight: '900',
    },
    habitActions: {
        flexDirection: 'row',
        gap: 8,
    },
    smallButton: {
        borderRadius: 999,
        borderWidth: 2,
        borderColor: '#1F2228',
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#F6F0E7',
    },
    smallButtonDanger: {
        borderRadius: 999,
        borderWidth: 2,
        borderColor: '#1F2228',
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#F7DCE2',
    },
    smallButtonText: {
        color: '#1F2228',
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    footerText: {
        color: '#4C5158',
        lineHeight: 20,
        fontSize: 14,
    },
    footerCard: {
        borderRadius: 24,
        padding: 18,
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#1F2228',
        gap: 8,
    },
    footerTitle: {
        color: '#1F2228',
        fontSize: 16,
        fontWeight: '800',
    },
});
