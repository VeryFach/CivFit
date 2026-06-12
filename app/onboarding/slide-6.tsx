// app/onboarding/slide-6.tsx  (Slide 6 — End Day + Start Game)
import { auth } from '@/services/firebase';
import { completeOnboarding } from '@/services/firebase/firestoreUtils';
import { router } from 'expo-router';
import { Moon, Sparkles, Sun, Users } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, StyleSheet, Text, View } from 'react-native';
import { CTAButton, SlideShell, usePalette } from './shared/OnboardingShell';

export default function SlideSix() {
    const palette = usePalette();
    const [loading, setLoading] = useState(false);

    // Animations
    const moonY = useRef(new Animated.Value(40)).current;
    const moonOp = useRef(new Animated.Value(0)).current;
    const starsOp = useRef(
        Array.from({ length: 5 }).map(() => new Animated.Value(0))
    ).current;
    const textY = useRef(new Animated.Value(24)).current;
    const textOp = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(moonY, { toValue: 0, tension: 55, friction: 7, useNativeDriver: true }),
            Animated.timing(moonOp, { toValue: 1, duration: 500, useNativeDriver: true }),
        ]).start();

        starsOp.forEach((anim, i) => {
            Animated.sequence([
                Animated.delay(300 + i * 80),
                Animated.timing(anim, { toValue: 1, duration: 300, useNativeDriver: true }),
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

    const handleFinish = async () => {
        const uid = auth.currentUser?.uid;
        if (!uid) return;
        setLoading(true);
        try {
            await completeOnboarding(uid);
            router.replace('/(tabs)');
        } catch {
            setLoading(false);
        }
    };

    const STAR_POSITIONS = [
        { top: 8, left: 24 },
        { top: 20, right: 20 },
        { top: 6, right: 60 },
        { top: 32, left: 60 },
        { top: 40, right: 40 },
    ];

    return (
        <SlideShell current={5} accentColor="#818CF8" accentColor2="#C4B5FD">
            <View style={styles.content}>
                {/* Step pill */}
                <View style={[styles.stepPill, { backgroundColor: '#818CF822', borderColor: '#818CF8' }]}>
                    <Text style={[styles.stepText, { color: '#818CF8' }]}>STEP 05</Text>
                </View>

                {/* Night sky hero */}
                <Animated.View
                    style={[
                        styles.nightCard,
                        {
                            backgroundColor: palette.isDark ? '#0F172A' : '#1E293B',
                            opacity: moonOp,
                            transform: [{ translateY: moonY }],
                        },
                    ]}
                >
                    {/* Stars */}
                    {STAR_POSITIONS.map((pos, i) => (
                        <Animated.View
                            key={i}
                            style={[styles.star, pos, { opacity: starsOp[i] }]}
                        >
                            <Sparkles size={12} color="#C4B5FD" />
                        </Animated.View>
                    ))}

                    {/* Moon icon */}
                    <View style={[styles.moonBadge, { backgroundColor: '#818CF8' }]}>
                        <Moon size={44} color="#FFFFFF" />
                    </View>

                    {/* Day summary row */}
                    <View style={styles.summaryRow}>
                        {[
                            { icon: Sun, label: 'Day 1', color: palette.accentGold },
                            { icon: Users, label: '+12 Pop', color: palette.accentTeal },
                            { icon: Sparkles, label: '+3 Bldg', color: '#818CF8' },
                        ].map(({ icon: Icon, label, color }) => (
                            <View
                                key={label}
                                style={[styles.summaryChip, { backgroundColor: color + '22', borderColor: color + '66' }]}
                            >
                                <Icon size={12} color={color} />
                                <Text style={[styles.summaryChipText, { color }]}>{label}</Text>
                            </View>
                        ))}
                    </View>
                </Animated.View>

                <Animated.View style={{ opacity: textOp, transform: [{ translateY: textY }], alignItems: 'center', gap: 8 }}>
                    <Text style={[styles.headline, { color: palette.text }]}>
                        End the day,{'\n'}
                        <Text style={{ color: '#818CF8' }}>grow your city</Text>
                    </Text>
                    <Text style={[styles.sub, { color: palette.textMuted }]}>
                        Tap <Text style={{ color: '#818CF8', fontWeight: '900' }}>End Day</Text> each evening to see your population grow, collect silver, and watch your city evolve.
                    </Text>
                </Animated.View>

                {/* Recap summary card */}
                <Animated.View
                    style={[
                        styles.recapCard,
                        {
                            backgroundColor: palette.card,
                            borderColor: palette.border,
                            opacity: textOp,
                        },
                    ]}
                >
                    <Text style={[styles.recapTitle, { color: palette.textMuted }]}>THE LOOP</Text>
                    {[
                        { step: '1', text: 'Complete daily habits' },
                        { step: '2', text: 'Earn Gold & EXP' },
                        { step: '3', text: 'Build & upgrade your city' },
                        { step: '4', text: 'End Day → Population grows' },
                        { step: '5', text: 'Repeat & expand your empire' },
                    ].map(({ step, text }) => (
                        <View key={step} style={styles.loopRow}>
                            <View style={[styles.loopBadge, { backgroundColor: '#818CF8' }]}>
                                <Text style={styles.loopNum}>{step}</Text>
                            </View>
                            <Text style={[styles.loopText, { color: palette.text }]}>{text}</Text>
                        </View>
                    ))}
                </Animated.View>
            </View>

            <View style={styles.btnWrap}>
                {loading ? (
                    <View style={styles.loadingBtn}>
                        <ActivityIndicator color="#FFFFFF" />
                        <Text style={styles.loadingText}>Preparing your city…</Text>
                    </View>
                ) : (
                    <CTAButton label="🏙  Start My City" onPress={handleFinish} />
                )}
            </View>
        </SlideShell>
    );
}

const styles = StyleSheet.create({
    content: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 18 },
    stepPill: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 24, borderWidth: 1.5 },
    stepText: { fontSize: 11, fontWeight: '900', letterSpacing: 2 },
    nightCard: {
        width: '100%',
        borderRadius: 32,
        padding: 24,
        alignItems: 'center',
        gap: 16,
        overflow: 'hidden',
        position: 'relative',
    },
    star: { position: 'absolute' },
    moonBadge: {
        width: 88,
        height: 88,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#818CF8',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 12,
    },
    summaryRow: { flexDirection: 'row', gap: 8 },
    summaryChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, borderWidth: 1 },
    summaryChipText: { fontSize: 10, fontWeight: '900' },
    headline: { fontSize: 32, fontWeight: '900', fontStyle: 'italic', textAlign: 'center', letterSpacing: -0.5, lineHeight: 40 },
    sub: { fontSize: 14, fontWeight: '600', textAlign: 'center', lineHeight: 22, maxWidth: 300 },
    recapCard: { width: '100%', borderRadius: 28, padding: 16, borderWidth: 1.5, gap: 10 },
    recapTitle: { fontSize: 10, fontWeight: '900', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 },
    loopRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    loopBadge: { width: 24, height: 24, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    loopNum: { fontSize: 11, fontWeight: '900', color: '#FFFFFF' },
    loopText: { fontSize: 13, fontWeight: '700', flex: 1 },
    btnWrap: { paddingHorizontal: 24, paddingBottom: 16 },
    loadingBtn: {
        flexDirection: 'row',
        gap: 12,
        backgroundColor: '#14B8A6',
        paddingVertical: 18,
        paddingHorizontal: 40,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
});