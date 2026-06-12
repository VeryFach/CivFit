// app/onboarding/index.tsx  (Slide 1 — Welcome)
import { router } from 'expo-router';
import { Sparkles } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { CTAButton, IconBadge, SCREEN_W, SlideShell, usePalette } from './shared/OnboardingShell';

export default function WelcomeScreen() {
    const palette = usePalette();

    // Entrance animations
    const logoScale = useRef(new Animated.Value(0.7)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const textY = useRef(new Animated.Value(24)).current;
    const textOpacity = useRef(new Animated.Value(0)).current;
    const btnY = useRef(new Animated.Value(32)).current;
    const btnOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.parallel([
                Animated.spring(logoScale, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
                Animated.timing(logoOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
            ]),
            Animated.parallel([
                Animated.timing(textY, { toValue: 0, duration: 400, useNativeDriver: true }),
                Animated.timing(textOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
            ]),
            Animated.parallel([
                Animated.timing(btnY, { toValue: 0, duration: 350, useNativeDriver: true }),
                Animated.timing(btnOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
            ]),
        ]).start();
    }, []);

    return (
        <SlideShell current={0} accentColor={palette.accentTeal} accentColor2="#818CF8">
            <View style={styles.content}>
                {/* Logo block */}
                <Animated.View
                    style={[
                        styles.logoWrap,
                        { opacity: logoOpacity, transform: [{ scale: logoScale }] },
                    ]}
                >
                    <IconBadge size={112} color={palette.accentTeal}>
                        <Sparkles size={56} color={palette.accentTeal} />
                    </IconBadge>
                    <View style={[styles.versionBadge, { backgroundColor: palette.accentTeal + '22', borderColor: palette.accentTeal }]}>
                        <Text style={[styles.versionText, { color: palette.accentTeal }]}>HABITORIA</Text>
                    </View>
                </Animated.View>

                {/* Headline */}
                <Animated.View
                    style={{ opacity: textOpacity, transform: [{ translateY: textY }], alignItems: 'center' }}
                >
                    <Text style={[styles.headline, { color: palette.text }]}>
                        Build Habits.{'\n'}
                        <Text style={{ color: palette.accentTeal }}>Build a City.</Text>
                    </Text>
                    <Text style={[styles.sub, { color: palette.textMuted }]}>
                        Every habit you complete fuels your civilization. Miss a day, and your city feels it.
                    </Text>
                </Animated.View>

                {/* Decorative grid preview */}
                <Animated.View
                    style={{ opacity: textOpacity, width: '100%', marginTop: 8, marginBottom: 16 }}
                >
                    <View style={[styles.gridPreview, { backgroundColor: palette.card, borderColor: palette.border }]}>
                        {Array.from({ length: 16 }).map((_, i) => (
                            <View
                                key={i}
                                style={[
                                    styles.gridCell,
                                    {
                                        backgroundColor:
                                            [0, 3, 5, 10, 14].includes(i)
                                                ? palette.accentTeal + '33'
                                                : palette.cardAlt ?? palette.bg,
                                        borderColor: palette.border,
                                    },
                                ]}
                            />
                        ))}
                    </View>
                    <Text style={[styles.gridCaption, { color: palette.textFaint }]}>
                        YOUR CITY AWAITS
                    </Text>
                </Animated.View>
            </View>

            {/* CTA */}
            <Animated.View style={{ opacity: btnOpacity, transform: [{ translateY: btnY }], paddingHorizontal: 24, paddingBottom: 16 }}>
                <CTAButton label="Let's Begin →" onPress={() => router.push('/onboarding/slide-2')} />
            </Animated.View>
        </SlideShell>
    );
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
    },
    logoWrap: { alignItems: 'center', gap: 12 },
    versionBadge: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 24,
        borderWidth: 1.5,
    },
    versionText: { fontSize: 12, fontWeight: '900', letterSpacing: 3 },
    headline: {
        fontSize: 36,
        fontWeight: '900',
        fontStyle: 'italic',
        textAlign: 'center',
        letterSpacing: -1,
        lineHeight: 44,
    },
    sub: {
        fontSize: 15,
        fontWeight: '600',
        textAlign: 'center',
        lineHeight: 24,
        marginTop: 12,
        maxWidth: 300,
    },
    gridPreview: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        borderRadius: 24,
        padding: 12,
        borderWidth: 2,
        gap: 6,
        alignSelf: 'center',
    },
    gridCell: {
        width: 44,
        height: 44,
        borderRadius: 12,
        borderWidth: 1,
    },
    gridCaption: {
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 2,
        textAlign: 'center',
        marginTop: 8,
    },
});