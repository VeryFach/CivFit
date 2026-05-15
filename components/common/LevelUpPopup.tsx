import { Sparkles, Trophy } from 'lucide-react-native';
import React, { useEffect, useMemo, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface LevelUpPopupProps {
    visible: boolean;
    level: number;
    levelUpCount: number;
    onClose: () => void;
}

const CONFETTI_COUNT = 14;
const { width } = Dimensions.get('window');

export default function LevelUpPopup({ visible, level, levelUpCount, onClose }: LevelUpPopupProps) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.86)).current;
    const glowAnim = useRef(new Animated.Value(0.3)).current;
    const confettiAnims = useRef(Array.from({ length: CONFETTI_COUNT }, () => new Animated.Value(0))).current;

    const confettiMeta = useMemo(
        () => Array.from({ length: CONFETTI_COUNT }, (_, idx) => ({
            left: Math.round((idx / CONFETTI_COUNT) * (width - 40)) + 20,
            delay: 40 * idx,
            rotate: idx % 2 === 0 ? '12deg' : '-12deg',
            color: ['#14B8A6', '#FBBF24', '#38BDF8', '#F97316'][idx % 4],
        })),
        []
    );

    useEffect(() => {
        if (!visible) {
            fadeAnim.setValue(0);
            scaleAnim.setValue(0.86);
            glowAnim.setValue(0.3);
            confettiAnims.forEach(anim => anim.setValue(0));
            return;
        }

        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 7,
                tension: 45,
                useNativeDriver: true,
            }),
            Animated.loop(
                Animated.sequence([
                    Animated.timing(glowAnim, {
                        toValue: 1,
                        duration: 900,
                        useNativeDriver: true,
                    }),
                    Animated.timing(glowAnim, {
                        toValue: 0.35,
                        duration: 900,
                        useNativeDriver: true,
                    }),
                ])
            ),
            ...confettiAnims.map((anim, idx) =>
                Animated.timing(anim, {
                    toValue: 1,
                    duration: 900,
                    delay: confettiMeta[idx].delay,
                    useNativeDriver: true,
                })
            ),
        ]).start();
    }, [visible, confettiAnims, confettiMeta, fadeAnim, glowAnim, scaleAnim]);

    return (
        <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
            <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
                {confettiAnims.map((anim, idx) => (
                    <Animated.View
                        key={`confetti-${idx}`}
                        style={[
                            styles.confetti,
                            {
                                left: confettiMeta[idx].left,
                                backgroundColor: confettiMeta[idx].color,
                                transform: [
                                    {
                                        translateY: anim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [-40, 260],
                                        }),
                                    },
                                    {
                                        rotate: confettiMeta[idx].rotate,
                                    },
                                ],
                                opacity: anim.interpolate({
                                    inputRange: [0, 0.75, 1],
                                    outputRange: [0, 1, 0],
                                }),
                            },
                        ]}
                    />
                ))}

                <Animated.View
                    style={[
                        styles.glow,
                        {
                            opacity: glowAnim,
                            transform: [{ scale: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.2] }) }],
                        },
                    ]}
                />

                <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
                    <View style={styles.iconWrap}>
                        <Trophy size={26} color="#1E293B" />
                    </View>

                    <Text style={styles.subtitle}>LEVEL UP ACHIEVED</Text>
                    <Text style={styles.levelLabel}>LEVEL</Text>
                    <Text style={styles.levelValue}>{level}</Text>

                    <View style={styles.deltaBadge}>
                        <Sparkles size={12} color="#1E293B" />
                        <Text style={styles.deltaText}>+{levelUpCount} LEVEL</Text>
                    </View>

                    <Text style={styles.message}>Progress harianmu berhasil dorong evolusi karakter.</Text>

                    <TouchableOpacity style={styles.button} onPress={onClose}>
                        <Text style={styles.buttonText}>LANJUTKAN</Text>
                    </TouchableOpacity>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(15,23,42,0.78)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    glow: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 999,
        backgroundColor: '#14B8A6',
    },
    card: {
        width: '100%',
        maxWidth: 360,
        backgroundColor: '#FFFFFF',
        borderRadius: 36,
        borderWidth: 2,
        borderColor: '#0F172A',
        paddingHorizontal: 24,
        paddingVertical: 26,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 6, height: 8 },
        shadowOpacity: 0.22,
        shadowRadius: 10,
        elevation: 10,
    },
    iconWrap: {
        width: 56,
        height: 56,
        borderRadius: 28,
        borderWidth: 2,
        borderColor: '#0F172A',
        backgroundColor: '#FBBF24',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
    },
    subtitle: {
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 1.4,
        color: '#64748B',
        marginBottom: 4,
    },
    levelLabel: {
        fontSize: 13,
        fontWeight: '900',
        color: '#1E293B',
    },
    levelValue: {
        fontSize: 72,
        lineHeight: 76,
        fontWeight: '900',
        color: '#14B8A6',
        textShadowColor: 'rgba(20,184,166,0.3)',
        textShadowOffset: { width: 0, height: 4 },
        textShadowRadius: 10,
        marginBottom: 10,
    },
    deltaBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 99,
        borderWidth: 1,
        borderColor: '#0F172A',
        backgroundColor: '#FDE68A',
        marginBottom: 10,
    },
    deltaText: {
        fontSize: 11,
        fontWeight: '900',
        color: '#1E293B',
    },
    message: {
        fontSize: 12,
        fontWeight: '700',
        textAlign: 'center',
        color: '#475569',
        marginBottom: 18,
    },
    button: {
        width: '100%',
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#0F172A',
        backgroundColor: '#14B8A6',
        paddingVertical: 14,
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 13,
        fontWeight: '900',
        color: '#1E293B',
        letterSpacing: 0.8,
    },
    confetti: {
        position: 'absolute',
        top: 70,
        width: 10,
        height: 18,
        borderRadius: 2,
    },
});
