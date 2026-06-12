// app/onboarding/slide-3.tsx  (Slide 3 — Complete habits)
import { router } from 'expo-router';
import { CheckCheck, Star, Zap } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { CTAButton, SlideShell, usePalette } from './shared/OnboardingShell';

export default function SlideThree() {
    const palette = usePalette();

    const ringScale = useRef(new Animated.Value(0.5)).current;
    const ringOp = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const textY = useRef(new Animated.Value(24)).current;
    const textOp = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Icon entrance
        Animated.parallel([
            Animated.spring(ringScale, { toValue: 1, tension: 55, friction: 7, useNativeDriver: true }),
            Animated.timing(ringOp, { toValue: 1, duration: 400, useNativeDriver: true }),
        ]).start(() => {
            // Idle pulse
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1.06, duration: 900, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
                ])
            ).start();
        });

        Animated.sequence([
            Animated.delay(300),
            Animated.parallel([
                Animated.timing(textY, { toValue: 0, duration: 400, useNativeDriver: true }),
                Animated.timing(textOp, { toValue: 1, duration: 400, useNativeDriver: true }),
            ]),
        ]).start();
    }, []);

    return (
        <SlideShell current={2} accentColor="#6EE7B7" accentColor2={palette.accentTeal}>
            <View style={styles.content}>
                {/* Step pill */}
                <View style={[styles.stepPill, { backgroundColor: '#6EE7B722', borderColor: '#6EE7B7' }]}>
                    <Text style={[styles.stepText, { color: '#6EE7B7' }]}>STEP 02</Text>
                </View>

                {/* Hero graphic — completion rings */}
                <Animated.View style={{ opacity: ringOp, transform: [{ scale: ringScale }] }}>
                    <View style={styles.ringOuter}>
                        <View style={[styles.ringMiddle, { borderColor: palette.accentTeal + '66' }]}>
                            <Animated.View
                                style={[
                                    styles.ringInner,
                                    {
                                        backgroundColor: palette.accentTeal,
                                        transform: [{ scale: pulseAnim }],
                                        shadowColor: palette.accentTeal,
                                    },
                                ]}
                            >
                                <CheckCheck size={44} color="#FFFFFF" />
                            </Animated.View>
                        </View>
                    </View>
                </Animated.View>

                <Animated.View style={{ opacity: textOp, transform: [{ translateY: textY }], alignItems: 'center', gap: 8 }}>
                    <Text style={[styles.headline, { color: palette.text }]}>
                        Complete{'\n'}
                        <Text style={{ color: palette.accentTeal }}>habits daily</Text>
                    </Text>
                    <Text style={[styles.sub, { color: palette.textMuted }]}>
                        Check off each habit as you go. Consistency is the real power — your streak is your currency.
                    </Text>
                </Animated.View>

                {/* Streak stat cards */}
                <Animated.View style={[styles.statsRow, { opacity: textOp }]}>
                    {[
                        { icon: Zap, value: '7', label: 'DAY STREAK', color: palette.accentGold },
                        { icon: CheckCheck, value: '42', label: 'COMPLETED', color: palette.accentTeal },
                        { icon: Star, value: '98%', label: 'RATE', color: '#818CF8' },
                    ].map(({ icon: Icon, value, label, color }) => (
                        <View
                            key={label}
                            style={[styles.statCard, { backgroundColor: palette.card, borderColor: palette.border }]}
                        >
                            <Icon size={18} color={color} />
                            <Text style={[styles.statValue, { color: palette.text }]}>{value}</Text>
                            <Text style={[styles.statLabel, { color: palette.textFaint }]}>{label}</Text>
                        </View>
                    ))}
                </Animated.View>
            </View>

            <View style={styles.btnWrap}>
                <CTAButton label="Next →" onPress={() => router.push('/onboarding/slide-4')} />
            </View>
        </SlideShell>
    );
}

const styles = StyleSheet.create({
    content: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20 },
    stepPill: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 24, borderWidth: 1.5 },
    stepText: { fontSize: 11, fontWeight: '900', letterSpacing: 2 },
    ringOuter: {
        width: 160,
        height: 160,
        borderRadius: 80,
        borderWidth: 2,
        borderColor: 'rgba(20,184,166,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    ringMiddle: {
        width: 128,
        height: 128,
        borderRadius: 64,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    ringInner: {
        width: 96,
        height: 96,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 12,
    },
    headline: { fontSize: 32, fontWeight: '900', fontStyle: 'italic', textAlign: 'center', letterSpacing: -0.5, lineHeight: 40 },
    sub: { fontSize: 14, fontWeight: '600', textAlign: 'center', lineHeight: 22, maxWidth: 300 },
    statsRow: { flexDirection: 'row', gap: 12, width: '100%' },
    statCard: { flex: 1, alignItems: 'center', padding: 14, borderRadius: 24, borderWidth: 1.5, gap: 4 },
    statValue: { fontSize: 22, fontWeight: '900' },
    statLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 1 },
    btnWrap: { paddingHorizontal: 24, paddingBottom: 16 },
});