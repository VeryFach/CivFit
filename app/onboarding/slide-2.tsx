// app/onboarding/slide-2.tsx  (Slide 2 — Create your first habit)
import { router } from 'expo-router';
import { CheckCircle2, Flame, Plus, Repeat2 } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { CTAButton, SlideShell, usePalette } from './shared/OnboardingShell';

const HABITS = [
    { label: 'Morning Run', icon: Flame, done: true },
    { label: 'Read 20 pages', icon: Repeat2, done: true },
    { label: 'Drink 2L water', icon: CheckCircle2, done: false },
];

export default function SlideTwo() {
    const palette = usePalette();

    const cardsY = useRef(HABITS.map(() => new Animated.Value(40))).current;
    const cardsOp = useRef(HABITS.map(() => new Animated.Value(0))).current;
    const headY = useRef(new Animated.Value(20)).current;
    const headOp = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(headY, { toValue: 0, duration: 400, useNativeDriver: true }).start();
        Animated.timing(headOp, { toValue: 1, duration: 400, useNativeDriver: true }).start();

        HABITS.forEach((_, i) => {
            Animated.sequence([
                Animated.delay(200 + i * 100),
                Animated.parallel([
                    Animated.timing(cardsY[i], { toValue: 0, duration: 360, useNativeDriver: true }),
                    Animated.timing(cardsOp[i], { toValue: 1, duration: 360, useNativeDriver: true }),
                ]),
            ]).start();
        });
    }, []);

    return (
        <SlideShell current={1} accentColor={palette.accentTeal} accentColor2="#6EE7B7">
            <View style={styles.content}>
                {/* Step pill */}
                <View style={[styles.stepPill, { backgroundColor: palette.accentTeal + '22', borderColor: palette.accentTeal }]}>
                    <Text style={[styles.stepText, { color: palette.accentTeal }]}>STEP 01</Text>
                </View>

                <Animated.View style={{ opacity: headOp, transform: [{ translateY: headY }], alignItems: 'center', gap: 8 }}>
                    <Text style={[styles.headline, { color: palette.text }]}>
                        Create your{'\n'}
                        <Text style={{ fontSize: 32, color: palette.accentTeal }}>first habit</Text>
                    </Text>
                    <Text style={[styles.sub, { color: palette.textMuted }]}>
                        Tap the <Text style={{ color: palette.accentTeal, fontWeight: '900' }}>+</Text> button and define habits you want to build. Daily, weekly — your schedule.
                    </Text>
                </Animated.View>

                {/* Habit card mockup */}
                <View style={[styles.mockCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
                    <View style={styles.mockCardHeader}>
                        <Text style={[styles.mockCardTitle, { color: palette.text }]}>Today's Habits</Text>
                        <View style={[styles.addBtn, { backgroundColor: palette.accentTeal }]}>
                            <Plus size={16} color="#FFFFFF" />
                        </View>
                    </View>

                    {HABITS.map((h, i) => {
                        const Icon = h.icon;
                        return (
                            <Animated.View
                                key={h.label}
                                style={[
                                    styles.habitRow,
                                    {
                                        backgroundColor: h.done
                                            ? palette.accentTeal + '18'
                                            : palette.cardAlt ?? palette.bg,
                                        borderColor: h.done ? palette.accentTeal : palette.border,
                                        opacity: cardsOp[i],
                                        transform: [{ translateY: cardsY[i] }],
                                    },
                                ]}
                            >
                                <View style={[styles.habitIcon, { backgroundColor: h.done ? palette.accentTeal : palette.border }]}>
                                    <Icon size={16} color="#FFFFFF" />
                                </View>
                                <Text style={[styles.habitLabel, { color: palette.text, flex: 1 }]}>{h.label}</Text>
                                {h.done && (
                                    <View style={[styles.doneBadge, { backgroundColor: palette.accentTeal }]}>
                                        <Text style={styles.doneText}>DONE</Text>
                                    </View>
                                )}
                            </Animated.View>
                        );
                    })}
                </View>
            </View>

            <View style={styles.btnWrap}>
                <CTAButton label="Next →" onPress={() => router.push('/onboarding/slide-3')} />
            </View>
        </SlideShell>
    );
}

const styles = StyleSheet.create({
    content: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20 },
    stepPill: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 24, borderWidth: 1.5 },
    stepText: { fontSize: 11, fontWeight: '900', letterSpacing: 2 },
    headline: { fontSize: 32, fontWeight: '900', fontStyle: 'italic', textAlign: 'center', letterSpacing: -0.5, lineHeight: 40 },
    sub: { fontSize: 14, fontWeight: '600', textAlign: 'center', lineHeight: 22, maxWidth: 300 },
    mockCard: { width: '100%', borderRadius: 32, padding: 20, borderWidth: 2, gap: 12 },
    mockCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    mockCardTitle: { fontSize: 16, fontWeight: '900' },
    addBtn: { width: 32, height: 32, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    habitRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 20, borderWidth: 1.5 },
    habitIcon: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    habitLabel: { fontSize: 14, fontWeight: '700' },
    doneBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
    doneText: { fontSize: 9, fontWeight: '900', color: '#FFFFFF', letterSpacing: 1 },
    btnWrap: { paddingHorizontal: 24, paddingBottom: 16 },
});