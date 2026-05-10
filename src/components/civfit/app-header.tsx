import { StyleSheet, Text, View } from 'react-native';

import { useCivfitStore } from '../../state/civfit-store';

function StatPill({ label, value, tone }: { label: string; value: string; tone: 'red' | 'yellow' | 'purple' | 'teal' }) {
    return (
        <View style={[styles.pill, toneStyles[tone]]}>
            <Text style={styles.pillLabel}>{label}</Text>
            <Text style={styles.pillValue}>{value}</Text>
        </View>
    );
}

export function AppHeader() {
    const { stats } = useCivfitStore();
    const expPercent = Math.min(100, Math.round((stats.exp / stats.maxExp) * 100));

    return (
        <View style={styles.header}>
            <View style={styles.leftGroup}>
                <StatPill label="HP" value={`${stats.hp}/${stats.maxHp}`} tone="red" />
                <View style={styles.levelPill}>
                    <Text style={styles.levelLabel}>LVL {stats.level}</Text>
                    <View style={styles.levelBar}>
                        <View style={[styles.levelFill, { width: `${expPercent}%` }]} />
                    </View>
                </View>
            </View>

            <View style={styles.rightGroup}>
                <StatPill label="GOLD" value={stats.gold.toLocaleString()} tone="yellow" />
                <StatPill label="SILVER" value={stats.silver.toLocaleString()} tone="purple" />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        height: 88,
        backgroundColor: '#E85146',
        borderBottomWidth: 4,
        borderBottomColor: '#1F2228',
        paddingHorizontal: 14,
        paddingTop: 14,
        paddingBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        shadowColor: '#000',
        shadowOpacity: 0.18,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 8,
    },
    leftGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    rightGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    pill: {
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#1F2228',
        borderRadius: 16,
        paddingHorizontal: 10,
        paddingVertical: 6,
        gap: 1,
        minWidth: 82,
        shadowColor: '#1F2228',
        shadowOpacity: 0.25,
        shadowRadius: 0,
        shadowOffset: { width: 2, height: 2 },
        elevation: 3,
    },
    pillLabel: {
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 1,
        textTransform: 'uppercase',
        color: '#1F2228',
    },
    pillValue: {
        fontSize: 13,
        fontWeight: '900',
        color: '#1F2228',
    },
    levelPill: {
        flex: 1,
        minWidth: 120,
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#1F2228',
        borderRadius: 16,
        paddingHorizontal: 10,
        paddingVertical: 8,
        gap: 6,
        shadowColor: '#1F2228',
        shadowOpacity: 0.25,
        shadowRadius: 0,
        shadowOffset: { width: 2, height: 2 },
        elevation: 3,
    },
    levelLabel: {
        fontSize: 10,
        fontWeight: '900',
        color: '#1F2228',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    levelBar: {
        height: 8,
        borderRadius: 999,
        backgroundColor: '#EFEFEF',
        borderWidth: 1,
        borderColor: '#1F2228',
        overflow: 'hidden',
    },
    levelFill: {
        height: '100%',
        backgroundColor: '#2FBFA5',
    },
});

const toneStyles = StyleSheet.create({
    red: { backgroundColor: '#FFFFFF' },
    yellow: { backgroundColor: '#FFD94A' },
    purple: { backgroundColor: '#7B5CFF' },
    teal: { backgroundColor: '#2FBFA5' },
});
