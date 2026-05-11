import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { CityState, UserStats } from '@/core/types';
import { Dna, Thermometer } from 'lucide-react-native';
import { COLORS, THEME } from '@/constants/theme';

interface CityHeaderProps {
    city: CityState;
    stats: UserStats;
    onSwitchTab: (tab: string) => void;
    healthStatus: { color: string };
}

export function CityHeader({ city, stats, onSwitchTab, healthStatus }: CityHeaderProps) {
    return (
        <View style={styles.dashboard}>
            <View style={styles.dashboardIconBg}>
                {/* Background icon (optional) */}
            </View>
            <View style={styles.dashboardHeader}>
                <View>
                    <View style={styles.eraTitleRow}>
                        <Text style={styles.eraTitle}>{city.currentEra}</Text>
                        <Pressable onPress={() => onSwitchTab('evolution')} style={styles.eraProgBtn}>
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
        </View>
    );
}

const styles = StyleSheet.create({
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
    dashboardHeader: { marginBottom: 24 },
    eraTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
    eraTitle: { fontSize: 28, fontWeight: '900', fontStyle: 'italic', color: COLORS.teal, textTransform: 'uppercase' },
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
    eraProgText: { color: COLORS.teal, fontSize: 8, fontWeight: '900', textTransform: 'uppercase', fontStyle: 'italic' },
    statusRow: { flexDirection: 'row', gap: 8 },
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
    statusBadgeText: { fontSize: 8, fontWeight: '900', textTransform: 'uppercase' },
});