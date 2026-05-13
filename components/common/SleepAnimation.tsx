import { Modal, View, Text, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { useEffect, useRef } from 'react';

interface SleepAnimationProps {
    visible: boolean;
    onFinish: () => void;
}

const { width, height } = Dimensions.get('window');

// Star data: [x%, y%, size, delay]
const STARS: [number, number, number, number][] = [
    [10, 8, 2, 0],    [25, 15, 3, 200],  [40, 5, 1.5, 400],
    [60, 12, 2.5, 100],[75, 7, 2, 600],  [88, 18, 1.5, 300],
    [5, 25, 1.5, 500], [18, 35, 2, 700], [32, 22, 3, 150],
    [50, 28, 1.5, 450],[65, 20, 2, 250], [80, 30, 2.5, 550],
    [92, 22, 1.5, 50], [15, 55, 2, 350], [45, 50, 3, 650],
    [70, 48, 1.5, 800],[85, 60, 2, 120], [30, 68, 2.5, 480],
    [55, 72, 1.5, 320],[78, 75, 2, 720],
];

// "Z" floating particles: [startX, startY, delay]
const ZEES: [number, number, number][] = [
    [0.5, -0.15, 0],
    [0.6, -0.2, 600],
    [0.38, -0.1, 1200],
];

const StarDot = ({ x, y, size, delay, masterFade }: {
    x: number; y: number; size: number; delay: number; masterFade: Animated.Value;
}) => {
    const twinkle = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(twinkle, { toValue: 1, duration: 800 + delay % 600, delay, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
                Animated.timing(twinkle, { toValue: 0.3, duration: 800 + delay % 600, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
            ])
        );
        loop.start();
        return () => loop.stop();
    }, []);

    const combinedOpacity = Animated.multiply(masterFade, twinkle);

    return (
        <Animated.View
            style={{
                position: 'absolute',
                left: (x / 100) * width,
                top: (y / 100) * height,
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: '#E8F4FF',
                opacity: combinedOpacity,
                shadowColor: '#C8E6FF',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 1,
                shadowRadius: size * 2,
            }}
        />
    );
};

const FloatingZ = ({ startX, startY, delay, masterFade }: {
    startX: number; startY: number; delay: number; masterFade: Animated.Value;
}) => {
    const floatY = useRef(new Animated.Value(0)).current;
    const floatX = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(0.6)).current;

    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.delay(delay),
                Animated.parallel([
                    Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
                    Animated.timing(scale, { toValue: 1, duration: 400, useNativeDriver: true }),
                ]),
                Animated.parallel([
                    Animated.timing(floatY, { toValue: -70, duration: 1800, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
                    Animated.timing(floatX, { toValue: 20, duration: 1800, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
                    Animated.timing(opacity, { toValue: 0, duration: 1800, delay: 800, useNativeDriver: true }),
                    Animated.timing(scale, { toValue: 1.4, duration: 1800, useNativeDriver: true }),
                ]),
                Animated.parallel([
                    Animated.timing(floatY, { toValue: 0, duration: 0, useNativeDriver: true }),
                    Animated.timing(floatX, { toValue: 0, duration: 0, useNativeDriver: true }),
                    Animated.timing(scale, { toValue: 0.6, duration: 0, useNativeDriver: true }),
                ]),
            ])
        );
        loop.start();
        return () => loop.stop();
    }, []);

    const combinedOpacity = Animated.multiply(masterFade, opacity);

    return (
        <Animated.Text
            style={{
                position: 'absolute',
                left: startX * width,
                top: startY * height,
                fontSize: 28,
                fontWeight: '900',
                color: '#A5C8F0',
                opacity: combinedOpacity,
                transform: [{ translateY: floatY }, { translateX: floatX }, { scale }],
                textShadowColor: '#6FA8DC',
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 10,
            }}
        >
            Z
        </Animated.Text>
    );
};

const SleepAnimation: React.FC<SleepAnimationProps> = ({ visible, onFinish }) => {
    const masterFade = useRef(new Animated.Value(0)).current;
    const moonScale = useRef(new Animated.Value(0.5)).current;
    const moonOpacity = useRef(new Animated.Value(0)).current;
    const glowPulse = useRef(new Animated.Value(0.6)).current;
    const ringScale1 = useRef(new Animated.Value(1)).current;
    const ringOpacity1 = useRef(new Animated.Value(0)).current;
    const ringScale2 = useRef(new Animated.Value(1)).current;
    const ringOpacity2 = useRef(new Animated.Value(0)).current;
    const textSlide = useRef(new Animated.Value(20)).current;
    const textOpacity = useRef(new Animated.Value(0)).current;
    const moonFloat = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            // Background fade in
            Animated.timing(masterFade, { toValue: 1, duration: 500, useNativeDriver: true }).start();

            // Moon entrance
            Animated.sequence([
                Animated.delay(200),
                Animated.parallel([
                    Animated.spring(moonScale, { toValue: 1, friction: 6, tension: 50, useNativeDriver: true }),
                    Animated.timing(moonOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
                ]),
            ]).start();

            // Glow pulse loop
            const glowLoop = Animated.loop(
                Animated.sequence([
                    Animated.timing(glowPulse, { toValue: 1, duration: 1500, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
                    Animated.timing(glowPulse, { toValue: 0.6, duration: 1500, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
                ])
            );
            setTimeout(() => glowLoop.start(), 600);

            // Ring ripple 1
            const ripple1 = Animated.loop(
                Animated.sequence([
                    Animated.delay(700),
                    Animated.parallel([
                        Animated.timing(ringScale1, { toValue: 2.2, duration: 1600, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
                        Animated.timing(ringOpacity1, { toValue: 0, duration: 1600, useNativeDriver: true }),
                    ]),
                    Animated.parallel([
                        Animated.timing(ringScale1, { toValue: 1, duration: 0, useNativeDriver: true }),
                        Animated.timing(ringOpacity1, { toValue: 0.4, duration: 0, useNativeDriver: true }),
                    ]),
                ])
            );
            ripple1.start();

            // Ring ripple 2 (offset)
            const ripple2 = Animated.loop(
                Animated.sequence([
                    Animated.delay(1500),
                    Animated.parallel([
                        Animated.timing(ringScale2, { toValue: 2.2, duration: 1600, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
                        Animated.timing(ringOpacity2, { toValue: 0, duration: 1600, useNativeDriver: true }),
                    ]),
                    Animated.parallel([
                        Animated.timing(ringScale2, { toValue: 1, duration: 0, useNativeDriver: true }),
                        Animated.timing(ringOpacity2, { toValue: 0.4, duration: 0, useNativeDriver: true }),
                    ]),
                ])
            );
            ripple2.start();

            // Moon floating loop
            const floatLoop = Animated.loop(
                Animated.sequence([
                    Animated.timing(moonFloat, { toValue: -10, duration: 2000, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
                    Animated.timing(moonFloat, { toValue: 10, duration: 2000, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
                ])
            );
            setTimeout(() => floatLoop.start(), 600);

            // Text reveal
            Animated.sequence([
                Animated.delay(500),
                Animated.parallel([
                    Animated.timing(textOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
                    Animated.timing(textSlide, { toValue: 0, duration: 600, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
                ]),
            ]).start();

            const timer = setTimeout(() => onFinish(), 2800);
            return () => {
                clearTimeout(timer);
                glowLoop.stop();
                ripple1.stop();
                ripple2.stop();
                floatLoop.stop();
            };
        } else {
            masterFade.setValue(0);
            moonScale.setValue(0.5);
            moonOpacity.setValue(0);
            glowPulse.setValue(0.6);
            ringScale1.setValue(1);
            ringOpacity1.setValue(0);
            ringScale2.setValue(1);
            ringOpacity2.setValue(0);
            textSlide.setValue(20);
            textOpacity.setValue(0);
            moonFloat.setValue(0);
        }
    }, [visible]);

    return (
        <Modal transparent visible={visible} animationType="none" statusBarTranslucent>
            <Animated.View style={[styles.overlay, { opacity: masterFade }]}>

                {/* Stars */}
                {STARS.map(([x, y, size, delay], i) => (
                    <StarDot key={i} x={x} y={y} size={size} delay={delay} masterFade={masterFade} />
                ))}

                {/* Shooting star */}
                <View style={styles.shootingStar} />

                {/* Center content */}
                <View style={styles.centerContent}>

                    {/* Ripple rings */}
                    <Animated.View style={[
                        styles.ring,
                        { opacity: ringOpacity1, transform: [{ scale: ringScale1 }, { translateY: moonFloat }] }
                    ]} />
                    <Animated.View style={[
                        styles.ring,
                        { opacity: ringOpacity2, transform: [{ scale: ringScale2 }, { translateY: moonFloat }] }
                    ]} />

                    {/* Moon glow */}
                    <Animated.View style={[
                        styles.moonGlow,
                        { opacity: glowPulse, transform: [{ translateY: moonFloat }] }
                    ]} />

                    {/* Moon crescent */}
                    <Animated.View style={[
                        styles.moonContainer,
                        {
                            opacity: moonOpacity,
                            transform: [{ scale: moonScale }, { translateY: moonFloat }],
                        }
                    ]}>
                        <View style={styles.moonOuter}>
                            <View style={styles.moonCutout} />
                        </View>
                        {/* Small craters */}
                        <View style={[styles.crater, { width: 8, height: 8, top: 22, left: 28 }]} />
                        <View style={[styles.crater, { width: 5, height: 5, top: 40, left: 18 }]} />
                        <View style={[styles.crater, { width: 6, height: 6, top: 30, left: 50 }]} />
                    </Animated.View>

                    {/* Floating Z's */}
                    {ZEES.map(([sx, sy, delay], i) => (
                        <FloatingZ key={i} startX={sx} startY={sy} delay={delay} masterFade={masterFade} />
                    ))}
                </View>

                {/* Text block */}
                <Animated.View style={[
                    styles.textContainer,
                    { opacity: textOpacity, transform: [{ translateY: textSlide }] }
                ]}>
                    <Text style={styles.tagline}>SELAMAT BERISTIRAHAT</Text>
                    <Text style={styles.mainText}>Menuju{'\n'}Pagi</Text>
                    <View style={styles.divider} />
                    <Text style={styles.subText}>Mimpi yang indah menantimu ✦</Text>
                </Animated.View>

                {/* Bottom mist / gradient overlay hint */}
                <View style={styles.bottomMist} />
            </Animated.View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: '#080C1A',
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerContent: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    moonContainer: {
        width: 110,
        height: 110,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    moonOuter: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: '#F5E6A3',
        overflow: 'hidden',
        shadowColor: '#FFF3B0',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 20,
        elevation: 20,
    },
    moonCutout: {
        position: 'absolute',
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#080C1A',
        top: -8,
        left: 22,
    },
    crater: {
        position: 'absolute',
        borderRadius: 99,
        backgroundColor: 'rgba(200, 170, 60, 0.35)',
    },
    moonGlow: {
        position: 'absolute',
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: 'rgba(245, 220, 100, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(245, 220, 100, 0.12)',
    },
    ring: {
        position: 'absolute',
        width: 110,
        height: 110,
        borderRadius: 55,
        borderWidth: 1.5,
        borderColor: 'rgba(165, 200, 240, 0.5)',
    },
    textContainer: {
        alignItems: 'center',
        paddingHorizontal: 32,
        marginTop: 32,
    },
    tagline: {
        color: 'rgba(165, 200, 240, 0.7)',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 5,
        textTransform: 'uppercase',
        marginBottom: 12,
    },
    mainText: {
        color: '#EEF4FF',
        fontSize: 52,
        fontWeight: '900',
        fontStyle: 'italic',
        textAlign: 'center',
        lineHeight: 56,
        letterSpacing: -1,
        textShadowColor: 'rgba(160, 200, 255, 0.4)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 20,
    },
    divider: {
        width: 40,
        height: 1.5,
        backgroundColor: 'rgba(165, 200, 240, 0.4)',
        marginVertical: 16,
        borderRadius: 2,
    },
    subText: {
        color: 'rgba(165, 200, 240, 0.6)',
        fontSize: 13,
        letterSpacing: 1.5,
        fontWeight: '400',
        textAlign: 'center',
    },
    shootingStar: {
        position: 'absolute',
        top: height * 0.12,
        left: width * 0.15,
        width: 60,
        height: 1.5,
        backgroundColor: 'rgba(220, 235, 255, 0.6)',
        borderRadius: 2,
        transform: [{ rotate: '-25deg' }],
        shadowColor: '#DCEEFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.9,
        shadowRadius: 4,
    },
    bottomMist: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 120,
        backgroundColor: 'transparent',
    },
});

export default SleepAnimation;