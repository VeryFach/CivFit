import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CityState } from '@/core/types';
import { AlertTriangle, Zap, Activity } from 'lucide-react-native';
import { COLORS, THEME } from '@/constants/theme';
import { CitySummary } from '@/core/simulation/cityUtils';

interface CityStatsProps {
    city: CityState;
    summary: CitySummary;
    happinessStatus: { color: string };
}

export function CityStats({ city, summary, happinessStatus }: CityStatsProps) {
    return (
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
                            summary.isHomeless ? { backgroundColor: '#FFF' } : { backgroundColor: COLORS.teal },
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
                            summary.isHungry ? { backgroundColor: COLORS.dark } : { backgroundColor: COLORS.teal },
                        ]}
                    />
                </View>
            </View>

            {/* Tax Income */}
            <View style={styles.resCard}>
                <View style={styles.resCardHeader}>
                    <Text style={styles.resCardLabel}>Tax Income</Text>
                    {city.populationSick > 0 && <Activity size={12} color={COLORS.red} />}
                </View>
                <Text style={[styles.resCardValue, { color: COLORS.teal }]}>+{summary.totalSilverIncome}</Text>
                <View style={styles.resProgressBg}>
                    <View
                        style={[
                            styles.resProgressFill,
                            { width: `${summary.taxMultiplier * 100}%`, backgroundColor: COLORS.teal },
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
                            { width: `${city.happiness || 100}%`, backgroundColor: happinessStatus.color },
                        ]}
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    resourceGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginHorizontal: 16,
        marginBottom: 24,
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
    resCardDanger: { backgroundColor: COLORS.red, borderColor: COLORS.red },
    resCardWarning: { backgroundColor: COLORS.yellow, borderColor: COLORS.yellow },
    resCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    resCardLabel: { fontSize: 8, fontWeight: '900', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase' },
    resCardValue: { fontSize: 18, fontWeight: '900', color: '#FFF', fontFamily: 'monospace' },
    resCardSub: { fontSize: 10, opacity: 0.4 },
    resProgressBg: { height: 4, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 2, overflow: 'hidden', marginTop: 4 },
    resProgressFill: { height: '100%' },
});