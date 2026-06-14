// app/onboarding/slide-4.tsx  (Slide 4 — Get Gold & EXP)
import { router } from 'expo-router';
import { Coins, Gem, TrendingUp, } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { CTAButton, SlideShell, usePalette } from './shared/OnboardingShell';

export default function SlideFour() {
    const palette = usePalette();

    const coinY = useRef(new Animated.Value(60)).current;
    const coinOp = useRef(new Animated.Value(0)).current;
    const textY = useRef(new Animated.Value(24)).current;
    const textOp = useRef(new Animated.Value(0)).current;
    const barWidth = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(coinY, { toValue: 0, tension: 60, friction: 8, useNativeDriver: true }),
            Animated.timing(coinOp, { toValue: 1, duration: 500, useNativeDriver: true }),
        ]).start();

        Animated.sequence([
            Animated.delay(250),
            Animated.parallel([
                Animated.timing(textY, { toValue: 0, duration: 400, useNativeDriver: true }),
                Animated.timing(textOp, { toValue: 1, duration: 400, useNativeDriver: true }),
            ]),
        ]).start();

        Animated.sequence([
            Animated.delay(500),
            Animated.timing(barWidth, { toValue: 1, duration: 800, useNativeDriver: false }),
        ]).start();
    }, []);

    const REWARDS = [
        { icon: Gem, label: 'Silver', value: '+50', sub: 'per habit', color: palette.accentTeal },
        { icon: Coins, label: 'Gold', value: '+5', sub: 'bonus streaks', color: palette.accentGold },
        { icon: TrendingUp, label: 'EXP', value: '+20', sub: 'levels you up', color: '#818CF8' },
    ];

    return (
        <SlideShell current={3} accentColor={palette.accentGold} accentColor2="#FDE68A">
            <View style={styles.content}>
                {/* Step pill */}
                <View style={[styles.stepPill, { backgroundColor: palette.accentGold + '22', borderColor: palette.accentGold }]}>
                    <Text style={[styles.stepText, { color: palette.accentGold }]}>STEP 03</Text>
                </View>

                {/* Hero coin cluster */}
                <Animated.View
                    style={[styles.coinCluster, { opacity: coinOp, transform: [{ translateY: coinY }] }]}
                >
                    {[
                        { size: 88, bg: palette.accentGold, icon: Coins, iconSize: 40, offset: 0 },
                        { size: 64, bg: palette.accentTeal, icon: Gem, iconSize: 28, offset: -20 },
                    ].map(({ size, bg, icon: Icon, iconSize, offset }, i) => (
                        <View
                            key={i}
                            style={[
                                styles.coin,
                                {
                                    width: size,
                                    height: size,
                                    borderRadius: size / 2,
                                    backgroundColor: bg,
                                    marginTop: offset,
                                    shadowColor: bg,
                                },
                            ]}
                        >
                            <Icon size={iconSize} color="#FFFFFF" />
                        </View>
                    ))}
                </Animated.View>

                <Animated.View style={{ opacity: textOp, transform: [{ translateY: textY }], alignItems: 'center', gap: 8 }}>
                    <Text style={[styles.headline, { color: palette.text }]}>
                        Earn{' '}
                        <Text style={{ fontSize: 34, color: palette.accentGold }}>Gold</Text>
                        {' & '}
                        <Text style={{ fontSize: 34, color: '#818CF8' }}>EXP</Text>
                    </Text>
                    <Text style={[styles.sub, { color: palette.textMuted }]}>
                        Every completed habit fills your treasury. Gold funds your city. EXP unlocks new buildings and eras.
                    </Text>
                </Animated.View>

                {/* Reward cards */}
                <Animated.View style={[styles.rewardRow, { opacity: textOp }]}>
                    {REWARDS.map(({ icon: Icon, label, value, sub, color }) => (
                        <View
                            key={label}
                            style={[styles.rewardCard, { backgroundColor: palette.card, borderColor: color + '55' }]}
                        >
                            <View style={[styles.rewardIconBg, { backgroundColor: color + '22' }]}>
                                <Icon size={22} color={color} />
                            </View>
                            <Text style={[styles.rewardValue, { color }]}>{value}</Text>
                            <Text style={[styles.rewardLabel, { color: palette.text }]}>{label}</Text>
                            <Text style={[styles.rewardSub, { color: palette.textMuted }]}>{sub}</Text>
                        </View>
                    ))}
                </Animated.View>

                {/* XP bar */}
                <Animated.View style={[styles.xpSection, { opacity: textOp }]}>
                    <View style={styles.xpHeader}>
                        <Text style={[styles.xpLabel, { color: palette.textMuted }]}>LVL 4</Text>
                        <Text style={[styles.xpLabel, { color: palette.textMuted }]}>240 / 300 EXP</Text>
                    </View>
                    <View style={[styles.xpBarBg, { backgroundColor: palette.border }]}>
                        <Animated.View
                            style={[
                                styles.xpBarFill,
                                {
                                    width: barWidth.interpolate({ inputRange: [0, 1], outputRange: ['0%', '80%'] }),
                                    backgroundColor: '#818CF8',
                                },
                            ]}
                        />
                    </View>
                </Animated.View>
            </View>

            <View style={styles.btnWrap}>
                <CTAButton label="Next →" onPress={() => router.push('/onboarding/slide-5')} />
            </View>
        </SlideShell>
    );
}

const styles = StyleSheet.create({
    content: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 18 },
    stepPill: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 24, borderWidth: 1.5 },
    stepText: { fontSize: 11, fontWeight: '900', letterSpacing: 2 },
    coinCluster: { flexDirection: 'row', alignItems: 'flex-end', gap: -8 },
    coin: {
        justifyContent: 'center',
        alignItems: 'center',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 12,
    },
    headline: { fontSize: 34, fontWeight: '900', fontStyle: 'italic', textAlign: 'center', letterSpacing: -0.5 },
    sub: { fontSize: 14, fontWeight: '600', textAlign: 'center', lineHeight: 22, maxWidth: 300 },
    rewardRow: { flexDirection: 'row', gap: 10, width: '100%' },
    rewardCard: {
        flex: 1,
        alignItems: 'center',
        padding: 14,
        borderRadius: 24,
        borderWidth: 1.5,
        gap: 4,
    },
    rewardIconBg: { width: 44, height: 44, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
    rewardValue: { fontSize: 20, fontWeight: '900' },
    rewardLabel: { fontSize: 11, fontWeight: '900' },
    rewardSub: { fontSize: 9, fontWeight: '700', textAlign: 'center' },
    xpSection: { width: '100%', gap: 8 },
    xpHeader: { flexDirection: 'row', justifyContent: 'space-between' },
    xpLabel: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
    xpBarBg: { height: 10, borderRadius: 6, overflow: 'hidden' },
    xpBarFill: { height: '100%', borderRadius: 6 },
    btnWrap: { paddingHorizontal: 24, paddingBottom: 16 },
});