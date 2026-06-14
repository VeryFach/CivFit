// app/onboarding/slide-5.tsx  (Slide 5 — Build your city)
import { router } from 'expo-router';
import { Building2, Hammer, Home, Landmark, Wheat } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { CTAButton, SlideShell, usePalette } from './shared/OnboardingShell';

const BUILDING_TILES = [
    { icon: Home, color: '#14B8A6', label: 'House', x: 0, y: 0 },
    { icon: Landmark, color: '#FBBF24', label: 'Tax Office', x: 1, y: 0 },
    { icon: Wheat, color: '#6EE7B7', label: 'Farm', x: 2, y: 0 },
    { icon: Building2, color: '#818CF8', label: 'Tower', x: 0, y: 1 },
    { icon: Hammer, color: '#FB923C', label: 'Forge', x: 2, y: 1 },
];

export default function SlideFive() {
    const palette = usePalette();

    const tileAnims = useRef(BUILDING_TILES.map(() => new Animated.Value(0))).current;
    const textY = useRef(new Animated.Value(24)).current;
    const textOp = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        BUILDING_TILES.forEach((_, i) => {
            Animated.sequence([
                Animated.delay(i * 120),
                Animated.spring(tileAnims[i], {
                    toValue: 1,
                    tension: 60,
                    friction: 7,
                    useNativeDriver: true,
                }),
            ]).start();
        });
        Animated.sequence([
            Animated.delay(400),
            Animated.parallel([
                Animated.timing(textY, { toValue: 0, duration: 400, useNativeDriver: true }),
                Animated.timing(textOp, { toValue: 1, duration: 400, useNativeDriver: true }),
            ]),
        ]).start();
    }, []);

    const TILE_SIZE = 80;
    const GAP = 8;

    return (
        <SlideShell current={4} accentColor="#818CF8" accentColor2={palette.accentTeal}>
            <View style={styles.content}>
                {/* Step pill */}
                <View style={[styles.stepPill, { backgroundColor: '#818CF822', borderColor: '#818CF8' }]}>
                    <Text style={[styles.stepText, { color: '#818CF8' }]}>STEP 04</Text>
                </View>

                {/* City grid mockup */}
                <View style={[styles.cityGrid, { backgroundColor: palette.card, borderColor: palette.border }]}>
                    <Text style={[styles.cityLabel, { color: palette.textMuted }]}>⚡ YOUR CITY</Text>
                    {/* 3×2 grid */}
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: GAP, marginTop: 12 }}>
                        {Array.from({ length: 6 }).map((_, i) => {
                            const building = BUILDING_TILES.find(b => b.x === i % 3 && b.y === Math.floor(i / 3));
                            if (building) {
                                const animIdx = BUILDING_TILES.indexOf(building);
                                const Icon = building.icon;
                                return (
                                    <Animated.View
                                        key={i}
                                        style={[
                                            styles.tile,
                                            {
                                                width: TILE_SIZE,
                                                height: TILE_SIZE,
                                                backgroundColor: building.color + '22',
                                                borderColor: building.color,
                                                opacity: tileAnims[animIdx],
                                                transform: [
                                                    {
                                                        scale: tileAnims[animIdx].interpolate({
                                                            inputRange: [0, 1],
                                                            outputRange: [0.5, 1],
                                                        }),
                                                    },
                                                ],
                                            },
                                        ]}
                                    >
                                        <Icon size={28} color={building.color} />
                                        <Text style={[styles.tileLabel, { color: building.color }]}>
                                            {building.label}
                                        </Text>
                                    </Animated.View>
                                );
                            }
                            // Empty tile
                            return (
                                <View
                                    key={i}
                                    style={[
                                        styles.tile,
                                        {
                                            width: TILE_SIZE,
                                            height: TILE_SIZE,
                                            backgroundColor: palette.cardAlt ?? palette.bg,
                                            borderColor: palette.border,
                                            borderStyle: 'dashed',
                                        },
                                    ]}
                                >
                                    <Hammer size={20} color={palette.textFaint} />
                                </View>
                            );
                        })}
                    </View>
                </View>

                <Animated.View style={{ opacity: textOp, transform: [{ translateY: textY }], alignItems: 'center', gap: 8 }}>
                    <Text style={[styles.headline, { color: palette.text }]}>
                        Build your{'\n'}
                        <Text style={{ fontSize: 32, color: '#818CF8' }}>city</Text>
                    </Text>
                    <Text style={[styles.sub, { color: palette.textMuted }]}>
                        Build houses, farms, markets, and more.
                        Each structure supports your city with housing, food, income, health, and happiness.
                    </Text>
                </Animated.View>

                {/* Quick stat row */}
                <Animated.View style={[styles.infoRow, { opacity: textOp }]}>
                    {[
                        { emoji: '🏠', label: 'Housing', desc: 'Residential' },
                        { emoji: '🍖', label: 'Food', desc: 'Keep fed' },
                        { emoji: '🪙', label: 'Income', desc: 'Daily silver' },
                    ].map(({ emoji, label, desc }) => (
                        <View
                            key={label}
                            style={[styles.infoCard, { backgroundColor: palette.card, borderColor: palette.border }]}
                        >
                            <Text style={styles.infoEmoji}>{emoji}</Text>
                            <Text style={[styles.infoLabel, { color: palette.text }]}>{label}</Text>
                            <Text style={[styles.infoDesc, { color: palette.textMuted }]}>{desc}</Text>
                        </View>
                    ))}
                </Animated.View>
            </View>

            <View style={styles.btnWrap}>
                <CTAButton label="Next →" onPress={() => router.push('/onboarding/slide-6')} />
            </View>
        </SlideShell>
    );
}

const styles = StyleSheet.create({
    content: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 18 },
    stepPill: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 24, borderWidth: 1.5 },
    stepText: { fontSize: 11, fontWeight: '900', letterSpacing: 2 },
    cityGrid: { width: '100%', borderRadius: 32, padding: 20, borderWidth: 2 },
    cityLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 2, textTransform: 'uppercase' },
    tile: { borderRadius: 20, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center', gap: 4 },
    tileLabel: { fontSize: 8, fontWeight: '800', textTransform: 'uppercase' },
    headline: { fontSize: 32, fontWeight: '900', fontStyle: 'italic', textAlign: 'center', letterSpacing: -0.5, lineHeight: 40 },
    sub: { fontSize: 14, fontWeight: '600', textAlign: 'center', lineHeight: 22, maxWidth: 300 },
    infoRow: { flexDirection: 'row', gap: 10, width: '100%' },
    infoCard: { flex: 1, alignItems: 'center', padding: 12, borderRadius: 20, borderWidth: 1.5, gap: 3 },
    infoEmoji: { fontSize: 22 },
    infoLabel: { fontSize: 12, fontWeight: '900' },
    infoDesc: { fontSize: 9, fontWeight: '700' },
    btnWrap: { paddingHorizontal: 24, paddingBottom: 16 },
});