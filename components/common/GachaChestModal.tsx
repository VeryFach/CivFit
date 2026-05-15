import { Gift, Sparkles, Star, Zap } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export type GachaReward = {
    type: 'gold' | 'silver' | 'exp' | 'hp';
    amount: number;
    name: string;
    icon: React.ReactNode;
    color: string;
};

interface GachaChestModalProps {
    visible: boolean;
    onClose: () => void;
    reward: GachaReward | null;
    isOpening?: boolean;
}

// Particle component for the burst effect
function Particle({ delay, color, index }: { delay: number; color: string; index: number }) {
    const translateY = useRef(new Animated.Value(0)).current;
    const translateX = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(0)).current;

    const angle = (index / 12) * Math.PI * 2;
    const distance = 80 + Math.random() * 60;
    const targetX = Math.cos(angle) * distance;
    const targetY = Math.sin(angle) * distance - 40;

    useEffect(() => {
        const timeout = setTimeout(() => {
            Animated.parallel([
                Animated.sequence([
                    Animated.timing(opacity, { toValue: 1, duration: 100, useNativeDriver: true }),
                    Animated.timing(opacity, { toValue: 0, duration: 500, delay: 200, useNativeDriver: true }),
                ]),
                Animated.timing(translateX, { toValue: targetX, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
                Animated.timing(translateY, { toValue: targetY, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
                Animated.sequence([
                    Animated.timing(scale, { toValue: 1, duration: 200, useNativeDriver: true }),
                    Animated.timing(scale, { toValue: 0, duration: 300, delay: 200, useNativeDriver: true }),
                ]),
            ]).start();
        }, delay);
        return () => clearTimeout(timeout);
    }, []);

    const size = 6 + Math.random() * 8;
    const isCircle = index % 3 !== 0;

    return (
        <Animated.View
            style={{
                position: 'absolute',
                width: size,
                height: isCircle ? size : size * 0.4,
                borderRadius: isCircle ? size / 2 : 2,
                backgroundColor: index % 2 === 0 ? color : '#FDE047',
                opacity,
                transform: [{ translateX }, { translateY }, { scale }],
            }}
        />
    );
}

// Ring pulse component
function RingPulse({ color, delay }: { color: string; delay: number }) {
    const scale = useRef(new Animated.Value(0.5)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const loopRef = useRef<Animated.CompositeAnimation | null>(null);

    useEffect(() => {
        const timeout = setTimeout(() => {
            loopRef.current = Animated.loop(
                Animated.parallel([
                    Animated.timing(scale, {
                        toValue: 2.5,
                        duration: 1200,
                        easing: Easing.out(Easing.cubic),
                        useNativeDriver: true,
                    }),
                    Animated.sequence([
                        Animated.timing(opacity, { toValue: 0.5, duration: 100, useNativeDriver: true }),
                        Animated.timing(opacity, { toValue: 0, duration: 1100, useNativeDriver: true }),
                    ]),
                ])
            );
            loopRef.current.start();
        }, delay);
        return () => {
            clearTimeout(timeout);
            loopRef.current?.stop();
            loopRef.current = null;
        };
    }, []);

    return (
        <Animated.View
            style={{
                position: 'absolute',
                width: 120,
                height: 120,
                borderRadius: 60,
                borderWidth: 2,
                borderColor: color,
                opacity,
                transform: [{ scale }],
            }}
        />
    );
}

export default function GachaChestModal({
    visible,
    onClose,
    reward,
    isOpening = false,
}: GachaChestModalProps) {
    const GACHA_COST_GOLD = 100;
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const shakeAnim = useRef(new Animated.Value(0)).current;
    const glowAnim = useRef(new Animated.Value(0)).current;
    const rewardSlide = useRef(new Animated.Value(80)).current;
    const rewardOpacity = useRef(new Animated.Value(0)).current;
    const lidAnim = useRef(new Animated.Value(0)).current;
    const lidSlide = useRef(new Animated.Value(0)).current;
    const bgPulse = useRef(new Animated.Value(0)).current;
    const shimmerAnim = useRef(new Animated.Value(0)).current;
    const bounceAnim = useRef(new Animated.Value(0)).current;
    const cardScale = useRef(new Animated.Value(0.85)).current;
    const shimmerLoopRef = useRef<Animated.CompositeAnimation | null>(null);
    const bounceLoopRef = useRef<Animated.CompositeAnimation | null>(null);
    const bgPulseLoopRef = useRef<Animated.CompositeAnimation | null>(null);
    const entranceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const rewardTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [showRewardCard, setShowRewardCard] = useState(false);
    const [isChestOpen, setIsChestOpen] = useState(false);
    const [showParticles, setShowParticles] = useState(false);
    const [showRings, setShowRings] = useState(false);
    const [activeRewardColor, setActiveRewardColor] = useState('#FBBF24');

    const stopRunningAnimations = () => {
        shimmerLoopRef.current?.stop();
        bounceLoopRef.current?.stop();
        bgPulseLoopRef.current?.stop();
        shimmerLoopRef.current = null;
        bounceLoopRef.current = null;
        bgPulseLoopRef.current = null;
    };

    const clearScheduledTimers = () => {
        if (entranceTimeoutRef.current) {
            clearTimeout(entranceTimeoutRef.current);
            entranceTimeoutRef.current = null;
        }
        if (rewardTimeoutRef.current) {
            clearTimeout(rewardTimeoutRef.current);
            rewardTimeoutRef.current = null;
        }
    };

    useEffect(() => {
        clearScheduledTimers();
        stopRunningAnimations();

        if (!visible) {
            setShowRewardCard(false);
            setIsChestOpen(false);
            setShowParticles(false);
            setShowRings(false);
            setActiveRewardColor('#FBBF24');
            scaleAnim.setValue(0);
            shakeAnim.setValue(0);
            glowAnim.setValue(0);
            rewardSlide.setValue(80);
            rewardOpacity.setValue(0);
            lidAnim.setValue(0);
            lidSlide.setValue(0);
            bgPulse.setValue(0);
            shimmerAnim.setValue(0);
            bounceAnim.setValue(0);
            cardScale.setValue(0.85);
            return;
        }

        setShowRewardCard(false);
        setIsChestOpen(false);
        setShowParticles(false);
        setShowRings(false);
        setActiveRewardColor('#FBBF24');

        scaleAnim.setValue(0);
        shakeAnim.setValue(0);
        glowAnim.setValue(0);
        rewardSlide.setValue(80);
        rewardOpacity.setValue(0);
        lidAnim.setValue(0);
        lidSlide.setValue(0);
        bgPulse.setValue(0);
        shimmerAnim.setValue(0);
        bounceAnim.setValue(0);
        cardScale.setValue(0.85);

        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 5,
            tension: 80,
            useNativeDriver: true,
        }).start();

        shimmerLoopRef.current = Animated.loop(
            Animated.timing(shimmerAnim, {
                toValue: 1,
                duration: 1500,
                easing: Easing.inOut(Easing.sin),
                useNativeDriver: true,
            })
        );
        shimmerLoopRef.current.start();

        bounceLoopRef.current = Animated.loop(
            Animated.sequence([
                Animated.timing(bounceAnim, {
                    toValue: -8,
                    duration: 900,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
                Animated.timing(bounceAnim, {
                    toValue: 0,
                    duration: 900,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
            ])
        );
        bounceLoopRef.current.start();

        bgPulseLoopRef.current = Animated.loop(
            Animated.sequence([
                Animated.timing(bgPulse, {
                    toValue: 1,
                    duration: 1200,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
                Animated.timing(bgPulse, {
                    toValue: 0,
                    duration: 1200,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
            ])
        );
        bgPulseLoopRef.current.start();

        entranceTimeoutRef.current = setTimeout(() => {
            Animated.sequence([
                Animated.timing(shakeAnim, { toValue: 14, duration: 60, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: -14, duration: 60, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
            ]).start(() => {
                setShowRings(true);
                Animated.parallel([
                    Animated.timing(lidAnim, {
                        toValue: 1,
                        duration: 300,
                        easing: Easing.out(Easing.back(1.2)),
                        useNativeDriver: true,
                    }),
                    Animated.timing(lidSlide, {
                        toValue: -90,
                        duration: 400,
                        easing: Easing.out(Easing.cubic),
                        useNativeDriver: true,
                    }),
                    Animated.timing(glowAnim, {
                        toValue: 1,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                ]).start(() => {
                    setIsChestOpen(true);
                    setShowParticles(true);
                });
            });
        }, 1000);

        return () => {
            clearScheduledTimers();
            stopRunningAnimations();
        };
    }, [visible]);

    useEffect(() => {
        if (!visible || !reward || !isChestOpen) {
            return;
        }

        if (rewardTimeoutRef.current) {
            clearTimeout(rewardTimeoutRef.current);
            rewardTimeoutRef.current = null;
        }

        rewardTimeoutRef.current = setTimeout(() => {
            setActiveRewardColor(reward.color);
            setShowRewardCard(true);
            Animated.parallel([
                Animated.spring(rewardSlide, {
                    toValue: 0,
                    friction: 7,
                    tension: 60,
                    useNativeDriver: true,
                }),
                Animated.timing(rewardOpacity, {
                    toValue: 1,
                    duration: 350,
                    useNativeDriver: true,
                }),
                Animated.spring(cardScale, {
                    toValue: 1,
                    friction: 6,
                    tension: 70,
                    useNativeDriver: true,
                }),
            ]).start();
        }, 350);

        return () => {
            if (rewardTimeoutRef.current) {
                clearTimeout(rewardTimeoutRef.current);
                rewardTimeoutRef.current = null;
            }
        };
    }, [visible, reward, isChestOpen]);

    const isLoading = isOpening && !reward;
    const rewardColor = activeRewardColor;
    const isGoldReward = reward?.type === 'gold';
    const netGoldChange = reward ? (reward.type === 'gold' ? reward.amount - GACHA_COST_GOLD : null) : null;

    let rewardCard: React.ReactNode = null;
    if (showRewardCard && reward) {
        const activeReward = reward;

        rewardCard = (
            <Animated.View
                style={[
                    styles.rewardCardWrapper,
                    {
                        transform: [
                            { translateY: rewardSlide },
                            { scale: cardScale },
                        ],
                        opacity: rewardOpacity,
                    },
                ]}
            >
                <View style={[styles.cardAccentBar, { backgroundColor: activeReward.color }]} />
                <View style={styles.cardGlint1} />
                <View style={styles.cardGlint2} />

                <View style={styles.iconOuter}>
                    <View
                        style={[
                            styles.iconRing,
                            { borderColor: activeReward.color + '60' },
                        ]}
                    />
                    <View
                        style={[
                            styles.iconInner,
                            { backgroundColor: activeReward.color + '18' },
                        ]}
                    >
                        {activeReward.icon}
                    </View>
                </View>

                <View style={[styles.rewardChip, { backgroundColor: activeReward.color + '20', borderColor: activeReward.color + '50' }]}>
                    <Sparkles size={12} color={activeReward.color} />
                    <Text style={[styles.rewardChipText, { color: activeReward.color }]}>
                        HADIAH DITEMUKAN
                    </Text>
                    <Sparkles size={12} color={activeReward.color} />
                </View>

                <Text style={styles.rewardTitle}>{activeReward.name}</Text>

                <View style={styles.amountRow}>
                    <Text style={styles.plusSign}>+</Text>
                    <Text style={[styles.rewardAmount, { color: activeReward.color }]}>
                        {activeReward.amount.toLocaleString()}
                    </Text>
                </View>

                {isGoldReward && netGoldChange !== null && (
                    <View style={styles.netInfoBox}>
                        <View style={styles.netInfoRow}>
                            <Text style={styles.netInfoLabel}>Biaya gacha</Text>
                            <Text style={styles.netInfoNegative}>- {GACHA_COST_GOLD} Gold</Text>
                        </View>
                        <View style={styles.netInfoRow}>
                            <Text style={styles.netInfoLabel}>Perubahan net</Text>
                            <Text style={[styles.netInfoNet, { color: netGoldChange >= 0 ? '#16A34A' : '#DC2626' }]}>
                                {netGoldChange >= 0 ? '+ ' : '- '}
                                {Math.abs(netGoldChange).toLocaleString()} Gold
                            </Text>
                        </View>
                    </View>
                )}

                <View style={styles.divider}>
                    <View style={[styles.dividerLine, { backgroundColor: activeReward.color + '40' }]} />
                    <View style={[styles.dividerDot, { backgroundColor: activeReward.color }]} />
                    <View style={[styles.dividerLine, { backgroundColor: activeReward.color + '40' }]} />
                </View>

                <TouchableOpacity
                    style={[styles.collectButton, { backgroundColor: activeReward.color }]}
                    onPress={onClose}
                    activeOpacity={0.85}
                >
                    <View style={styles.collectButtonInner}>
                        <Zap size={16} color="#1E293B" strokeWidth={2.5} />
                        <Text style={styles.collectButtonText}>Kumpulkan</Text>
                        <Zap size={16} color="#1E293B" strokeWidth={2.5} />
                    </View>
                    <View style={styles.buttonHighlight} />
                </TouchableOpacity>
            </Animated.View>
        );
    }

    const glowScale = glowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.6, 1.4],
    });

    const glowOpacity = glowAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 0.85, 0.45],
    });

    const bgPulseOpacity = bgPulse.interpolate({
        inputRange: [0, 1],
        outputRange: [0.08, 0.22],
    });

    const bgPulseScale = bgPulse.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.15],
    });

    const lidOpacity = lidAnim.interpolate({
        inputRange: [0, 0.8, 1],
        outputRange: [1, 0.6, 0],
    });

    const lidRotate = lidAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '-40deg'],
    });

    const shimmerX = shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-80, 80],
    });

    return (
        <Modal transparent animationType="none" visible={visible} onRequestClose={onClose}>
            <View style={styles.overlay}>
                <Animated.View
                    style={[
                        styles.bgGlow,
                        {
                            backgroundColor: rewardColor,
                            opacity: bgPulseOpacity,
                            transform: [{ scale: bgPulseScale }],
                        },
                    ]}
                />

                <View style={styles.gridContainer} pointerEvents="none">
                    {[...Array(6)].map((_, i) => (
                        <View
                            key={i}
                            style={[styles.gridLine, { top: (height / 6) * i }]}
                        />
                    ))}
                </View>

                <View style={[styles.cornerDeco, styles.topLeft]} />
                <View style={[styles.cornerDeco, styles.topRight]} />
                <View style={[styles.cornerDeco, styles.bottomLeft]} />
                <View style={[styles.cornerDeco, styles.bottomRight]} />

                <Animated.View
                    style={[
                        styles.sceneContainer,
                        {
                            transform: [
                                { scale: scaleAnim },
                                { translateX: shakeAnim },
                                { translateY: bounceAnim },
                            ],
                        },
                    ]}
                >
                    {showRings && (
                        <>
                            <RingPulse color={rewardColor} delay={0} />
                            <RingPulse color={rewardColor} delay={300} />
                            <RingPulse color={rewardColor} delay={600} />
                        </>
                    )}

                    <Animated.View
                        style={[
                            styles.burstGlow,
                            {
                                backgroundColor: rewardColor,
                                opacity: glowOpacity,
                                transform: [{ scale: glowScale }],
                            },
                        ]}
                    />

                    <Animated.View
                        style={[
                            styles.chestShadow,
                            {
                                opacity: glowAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0.6, 0.15],
                                }),
                                transform: [
                                    {
                                        scaleX: glowAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [1, 0.4],
                                        }),
                                    },
                                ],
                            },
                        ]}
                    />

                    <View style={styles.chestWrapper}>
                        <Animated.View
                            style={[
                                styles.chestLid,
                                {
                                    opacity: lidOpacity,
                                    transform: [
                                        { translateY: lidSlide },
                                        { rotate: lidRotate },
                                    ],
                                },
                            ]}
                        >
                            <View style={styles.lidTopFace}>
                                <View style={styles.lidBand} />
                                <View style={styles.lidLock}>
                                    <View style={styles.lockCircle} />
                                </View>
                                <Animated.View
                                    style={[
                                        styles.shimmer,
                                        { transform: [{ translateX: shimmerX }] },
                                    ]}
                                />
                            </View>
                            <View style={styles.lidFrontBevel} />
                            <View style={styles.lidSideBevel} />
                        </Animated.View>

                        <View style={styles.chestBody}>
                            <View style={styles.bodyTopFace} />
                            <View style={styles.bodyFrontFace}>
                                <View style={styles.bodyBand} />
                                <View style={[styles.bolt, { top: 8, left: 8 }]} />
                                <View style={[styles.bolt, { top: 8, right: 8 }]} />
                                <View style={[styles.bolt, { bottom: 8, left: 8 }]} />
                                <View style={[styles.bolt, { bottom: 8, right: 8 }]} />
                                {isChestOpen && (
                                    <Animated.View
                                        style={[
                                            styles.innerGlow,
                                            {
                                                backgroundColor: rewardColor,
                                                opacity: glowAnim,
                                            },
                                        ]}
                                    />
                                )}
                                <View style={styles.chestIconContainer}>
                                    {!isChestOpen ? (
                                        <Gift size={36} color="#FDE047" strokeWidth={2} />
                                    ) : (
                                        <Animated.View
                                            style={{
                                                transform: [
                                                    {
                                                        scale: glowAnim.interpolate({
                                                            inputRange: [0, 0.5, 1],
                                                            outputRange: [0, 1.3, 1],
                                                        }),
                                                    },
                                                ],
                                            }}
                                        >
                                            <Star size={44} color="#FFF" fill={rewardColor} />
                                        </Animated.View>
                                    )}
                                </View>
                                <Animated.View
                                    style={[
                                        styles.shimmer,
                                        { transform: [{ translateX: shimmerX }] },
                                    ]}
                                />
                            </View>
                            <View style={styles.bodySideFace} />
                            <View style={styles.bodyBottomFace} />
                        </View>
                    </View>

                    {showParticles && (
                        <View style={styles.particleContainer} pointerEvents="none">
                            {[...Array(16)].map((_, i) => (
                                <Particle
                                    key={i}
                                    index={i}
                                    color={rewardColor}
                                    delay={i * 25}
                                />
                            ))}
                        </View>
                    )}
                </Animated.View>

                {isLoading && (
                    <View style={styles.loadingContainer}>
                        <Zap size={14} color="#FDE047" />
                        <Text style={styles.loadingText}>  Membuka peti...</Text>
                    </View>
                )}

                {rewardCard}
            </View>
        </Modal>
    );
}

// ─── STYLES ────────────────────────────────────────────────────────────────────

const CHEST_W = 130;
const CHEST_H = 80;
const BEVEL = 16; // 3D depth thickness

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: '#0A0B18',
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Background effects
    bgGlow: {
        position: 'absolute',
        width: width * 1.5,
        height: width * 1.5,
        borderRadius: width * 0.75,
        top: '50%',
        left: '50%',
        marginLeft: -(width * 0.75),
        marginTop: -(width * 0.75),
    },
    gridContainer: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    gridLine: {
        position: 'absolute',
        width: '100%',
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.03)',
    },

    // Corner decorations
    cornerDeco: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderColor: 'rgba(251,191,36,0.3)',
    },
    topLeft: { top: 24, left: 24, borderTopWidth: 2, borderLeftWidth: 2 },
    topRight: { top: 24, right: 24, borderTopWidth: 2, borderRightWidth: 2 },
    bottomLeft: { bottom: 24, left: 24, borderBottomWidth: 2, borderLeftWidth: 2 },
    bottomRight: { bottom: 24, right: 24, borderBottomWidth: 2, borderRightWidth: 2 },

    // Scene
    sceneContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 280,
        height: 280,
    },

    burstGlow: {
        position: 'absolute',
        width: 180,
        height: 180,
        borderRadius: 90,
    },
    chestShadow: {
        position: 'absolute',
        bottom: 20,
        width: 140,
        height: 24,
        borderRadius: 70,
        backgroundColor: '#000',
    },

    // Particle container
    particleContainer: {
        position: 'absolute',
        width: 0,
        height: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Chest wrapper
    chestWrapper: {
        alignItems: 'center',
    },

    // ── LID ──
    chestLid: {
        position: 'relative',
        width: CHEST_W,
        height: 44,
        marginBottom: -2,
        zIndex: 10,
    },
    lidTopFace: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: CHEST_W,
        height: 40,
        backgroundColor: '#92400E',
        borderRadius: 10,
        borderWidth: 2.5,
        borderColor: '#FDE047',
        overflow: 'hidden',
        // subtle gradient via inner views
    },
    lidBand: {
        position: 'absolute',
        top: '50%',
        left: 0,
        right: 0,
        height: 8,
        marginTop: -4,
        backgroundColor: '#78350F',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#FDE047',
    },
    lidLock: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: 20,
        height: 20,
        marginTop: -10,
        marginLeft: -10,
        backgroundColor: '#FDE047',
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    lockCircle: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#78350F',
    },
    shimmer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: 30,
        backgroundColor: 'rgba(255,255,255,0.18)',
        transform: [{ skewX: '-20deg' }],
    },
    lidFrontBevel: {
        position: 'absolute',
        bottom: 0,
        left: BEVEL * 0.6,
        right: 0,
        height: BEVEL * 0.6,
        backgroundColor: '#451a03',
        borderBottomLeftRadius: 4,
        borderBottomRightRadius: 2,
    },
    lidSideBevel: {
        position: 'absolute',
        top: BEVEL * 0.3,
        right: -BEVEL * 0.6,
        width: BEVEL * 0.6,
        bottom: 0,
        backgroundColor: '#6B1D0A',
        borderTopRightRadius: 4,
        transform: [{ skewY: '45deg' }],
    },

    // ── BODY ──
    chestBody: {
        position: 'relative',
        width: CHEST_W,
        height: CHEST_H,
    },
    bodyTopFace: {
        position: 'absolute',
        top: 0,
        left: BEVEL,
        right: 0,
        height: BEVEL,
        backgroundColor: '#A16207',
        transform: [{ skewX: '45deg' }, { skewY: '0deg' }],
        borderTopWidth: 1,
        borderColor: '#FDE047',
    },
    bodyFrontFace: {
        position: 'absolute',
        top: BEVEL,
        left: 0,
        right: BEVEL,
        bottom: BEVEL,
        backgroundColor: '#78350F',
        borderWidth: 2.5,
        borderColor: '#FDE047',
        borderRadius: 6,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bodyBand: {
        position: 'absolute',
        top: '45%',
        left: 0,
        right: 0,
        height: 10,
        backgroundColor: '#451a03',
        borderTopWidth: 1.5,
        borderBottomWidth: 1.5,
        borderColor: '#FDE047',
    },
    bolt: {
        position: 'absolute',
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FDE047',
        borderWidth: 1,
        borderColor: '#92400E',
    },
    innerGlow: {
        position: 'absolute',
        inset: 0,
        borderRadius: 4,
    },
    chestIconContainer: {
        zIndex: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bodySideFace: {
        position: 'absolute',
        top: BEVEL,
        right: 0,
        width: BEVEL,
        bottom: BEVEL,
        backgroundColor: '#451a03',
        borderTopRightRadius: 4,
        borderBottomRightRadius: 4,
        borderTopWidth: 1,
        borderRightWidth: 2.5,
        borderBottomWidth: 1,
        borderColor: '#B45309',
    },
    bodyBottomFace: {
        position: 'absolute',
        bottom: 0,
        left: BEVEL,
        right: 0,
        height: BEVEL,
        backgroundColor: '#3B0D02',
        transform: [{ skewX: '45deg' }],
        borderBottomWidth: 1,
        borderColor: '#92400E',
    },

    // Loading
    loadingContainer: {
        marginTop: 32,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: 'rgba(253,224,71,0.1)',
        borderRadius: 30,
        borderWidth: 1,
        borderColor: 'rgba(253,224,71,0.3)',
    },
    loadingText: {
        color: '#FDE047',
        fontWeight: '900',
        fontSize: 13,
        letterSpacing: 2,
        textTransform: 'uppercase',
    },

    // Reward card
    rewardCardWrapper: {
        position: 'absolute',
        bottom: 48,
        width: width * 0.88,
        backgroundColor: '#0F172A',
        borderRadius: 28,
        padding: 28,
        paddingTop: 32,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.08)',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.5,
        shadowRadius: 24,
        elevation: 24,
    },
    cardAccentBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 4,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
    },
    cardGlint1: {
        position: 'absolute',
        top: 0,
        left: -60,
        width: 200,
        height: 120,
        backgroundColor: 'rgba(255,255,255,0.025)',
        transform: [{ rotate: '-30deg' }],
    },
    cardGlint2: {
        position: 'absolute',
        bottom: 0,
        right: -40,
        width: 120,
        height: 100,
        backgroundColor: 'rgba(255,255,255,0.015)',
        transform: [{ rotate: '-30deg' }],
    },

    // Icon
    iconOuter: {
        width: 96,
        height: 96,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    iconRing: {
        position: 'absolute',
        width: 96,
        height: 96,
        borderRadius: 48,
        borderWidth: 1.5,
    },
    iconInner: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Chip
    rewardChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 5,
        borderRadius: 20,
        borderWidth: 1,
        marginBottom: 12,
    },
    rewardChipText: {
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 1.5,
    },

    rewardTitle: {
        fontSize: 26,
        fontWeight: '900',
        color: '#F1F5F9',
        letterSpacing: 0.5,
        marginBottom: 8,
        textTransform: 'uppercase',
    },

    // Amount
    amountRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    plusSign: {
        fontSize: 24,
        fontWeight: '900',
        color: '#94A3B8',
        marginTop: 6,
        marginRight: 2,
    },
    rewardAmount: {
        fontSize: 48,
        fontWeight: '900',
        fontFamily: 'monospace',
        lineHeight: 52,
    },
    netInfoBox: {
        width: '100%',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#334155',
        backgroundColor: '#111827',
        paddingHorizontal: 12,
        paddingVertical: 10,
        gap: 6,
        marginTop: -8,
        marginBottom: 16,
    },
    netInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    netInfoLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: '#94A3B8',
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },
    netInfoNegative: {
        fontSize: 12,
        fontWeight: '900',
        color: '#EF4444',
    },
    netInfoNet: {
        fontSize: 12,
        fontWeight: '900',
    },

    // Divider
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginBottom: 20,
    },
    dividerLine: {
        flex: 1,
        height: 1,
    },
    dividerDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginHorizontal: 8,
    },

    // Button
    collectButton: {
        width: '100%',
        height: 54,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    collectButtonInner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        zIndex: 2,
    },
    collectButtonText: {
        fontSize: 16,
        fontWeight: '900',
        color: '#1E293B',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    },
    buttonHighlight: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '45%',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
});