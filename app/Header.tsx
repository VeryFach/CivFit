import { useCivStore } from '@/store';
import { COLORS, THEME } from '@/theme';
import { Coins, DollarSign, Heart } from 'lucide-react-native';
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';

const { width } = Dimensions.get('window');

export function Header() {
    const stats = useCivStore((state) => state.stats);
    const expProgress = (stats.exp / stats.maxExp) * 100;

    // Responsive padding based on screen width
    const paddingHorizontal = width < 600 ? 12 : 20;
    const badgePaddingH = width < 600 ? 8 : 12;
    const badgeFontSize = width < 600 ? 10 : 12;
    const currencyFontSize = width < 600 ? 11 : 13;
    const iconSize = width < 600 ? 12 : 16;

    return (
        <View style={[styles.container, { paddingHorizontal }]}>
            <View style={styles.leftGroup}>
                {/* HP Badge */}
                <View style={[styles.badge, { paddingHorizontal: badgePaddingH }]}>
                    <Heart size={iconSize} color={COLORS.red} fill={COLORS.red} />
                    <Text style={[styles.badgeText, { fontSize: badgeFontSize }]}>
                        {stats.hp}/{stats.maxHp} HP
                    </Text>
                </View>

                {/* LVL Badge */}
                <View style={[styles.badge, { paddingHorizontal: badgePaddingH }]}>
                    <Text style={[styles.lvlText, { fontSize: badgeFontSize - 1 }]}>
                        LVL {stats.level}
                    </Text>
                    <View style={[styles.progressBarBg, { width: width < 600 ? 40 : 50 }]}>
                        <View
                            style={[
                                styles.progressBarFill,
                                { width: `${expProgress}%` }
                            ]}
                        />
                    </View>
                </View>
            </View>

            <View style={styles.rightGroup}>
                {/* Gold */}
                <View style={[styles.currencyBadge, { backgroundColor: COLORS.yellow, paddingHorizontal: badgePaddingH }]}>
                    <Coins size={iconSize} color={COLORS.dark} />
                    <Text style={[styles.currencyText, { fontSize: currencyFontSize }]}>
                        {stats.gold.toLocaleString()}
                    </Text>
                </View>

                {/* Silver */}
                <View style={[styles.currencyBadge, { backgroundColor: COLORS.purple, paddingHorizontal: badgePaddingH }]}>
                    <DollarSign size={iconSize} color={COLORS.white} />
                    <Text style={[styles.currencyText, { fontSize: currencyFontSize, color: COLORS.white }]}>
                        {stats.silver.toLocaleString()}
                    </Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 80,
        backgroundColor: COLORS.red,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 50,
        borderBottomWidth: 4,
        borderBottomColor: COLORS.dark,
        shadowColor: COLORS.dark,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        paddingVertical: 8,
    },
    leftGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flex: 1,
    },
    rightGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flex: 1,
        justifyContent: 'flex-end',
    },
    badge: {
        backgroundColor: COLORS.white,
        ...THEME.neoBorder,
        ...THEME.neoShadowSm,
        paddingVertical: 4,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    badgeText: {
        fontWeight: '900',
        color: COLORS.dark,
    },
    lvlText: {
        fontWeight: '900',
        color: COLORS.dark,
        letterSpacing: 0.5,
    },
    progressBarBg: {
        height: 6,
        backgroundColor: COLORS.gray,
        borderRadius: 3,
        borderWidth: 1,
        borderColor: COLORS.dark,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: COLORS.teal,
    },
    currencyBadge: {
        ...THEME.neoBorder,
        ...THEME.neoShadowSm,
        paddingVertical: 4,
        borderRadius: 6,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    currencyText: {
        fontWeight: '900',
        color: COLORS.dark,
    },
});
