import React, { useEffect, useRef } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    Animated,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { TrendingUp, ChevronRight } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface LevelUpOverlayProps {
    visible: boolean;
    oldLevel: number;
    newLevel: number;
    onClose: () => void;
}

const LevelUpOverlay: React.FC<LevelUpOverlayProps> = ({
    visible,
    oldLevel,
    newLevel,
    onClose,
}) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.5)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 8,
                    tension: 40,
                    useNativeDriver: true,
                }),
                Animated.timing(rotateAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            fadeAnim.setValue(0);
            scaleAnim.setValue(0.5);
            rotateAnim.setValue(0);
        }
    }, [visible]);

    const rotateInterpolate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['-20deg', '0deg'],
    });

    // Animasi confetti sederhana (bintang berterbangan)
    const stars = Array.from({ length: 30 }).map((_, i) => ({
        id: i,
        startX: Math.random() * width,
        startY: height + Math.random() * 200,
        duration: 1500 + Math.random() * 1500,
        delay: Math.random() * 500,
    }));

    return (
        <Modal transparent visible={visible} animationType="none">
            <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
                {/* Background confetti stars */}
                <View style={styles.confettiContainer}>
                    {stars.map((star) => (
                        <Animated.View
                            key={star.id}
                            style={[
                                styles.star,
                                {
                                    left: star.startX,
                                    top: star.startY,
                                    transform: [
                                        {
                                            translateY: new Animated.Value(0).interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [0, -height - 100],
                                            }),
                                        },
                                    ],
                                },
                            ]}
                        >
                            <Text style={styles.starText}>✨</Text>
                        </Animated.View>
                    ))}
                </View>

                {/* Main content */}
                <Animated.View
                    style={[
                        styles.card,
                        {
                            transform: [{ scale: scaleAnim }, { rotate: rotateInterpolate }],
                        },
                    ]}
                >
                    <View style={styles.iconContainer}>
                        <TrendingUp size={48} color="#1E293B" />
                    </View>
                    <Text style={styles.title}>LEVEL UP!</Text>
                    <Text style={styles.subtitle}>Evolusimu Berlanjut</Text>

                    <View style={styles.levelRow}>
                        <View style={styles.levelBox}>
                            <Text style={styles.oldLevel}>LVL {oldLevel}</Text>
                        </View>
                        <ChevronRight size={24} color="#1E293B" style={styles.chevron} />
                        <View style={[styles.levelBox, styles.newLevelBox]}>
                            <Text style={styles.newLevel}>LVL {newLevel}</Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.button} onPress={onClose}>
                        <Text style={styles.buttonText}>TERIMA KEKUATAN BARU</Text>
                    </TouchableOpacity>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(20, 184, 166, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    confettiContainer: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
    },
    star: {
        position: 'absolute',
    },
    starText: {
        fontSize: 24,
    },
    card: {
        width: width * 0.85,
        backgroundColor: '#FFFFFF',
        borderRadius: 48,
        padding: 24,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#1E293B',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 0,
        elevation: 8,
    },
    iconContainer: {
        backgroundColor: '#FBBF24',
        padding: 16,
        borderRadius: 32,
        marginBottom: 16,
        borderWidth: 2,
        borderColor: '#1E293B',
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        fontStyle: 'italic',
        textTransform: 'uppercase',
        color: '#1E293B',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
        color: '#64748B',
        marginBottom: 24,
    },
    levelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
        gap: 16,
    },
    levelBox: {
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: '#CBD5E1',
    },
    newLevelBox: {
        backgroundColor: '#14B8A6',
        borderColor: '#1E293B',
    },
    oldLevel: {
        fontSize: 28,
        fontWeight: '900',
        color: '#94A3B8',
        textDecorationLine: 'line-through',
    },
    newLevel: {
        fontSize: 36,
        fontWeight: '900',
        fontStyle: 'italic',
        color: '#1E293B',
    },
    chevron: {
        opacity: 0.4,
    },
    button: {
        backgroundColor: '#1E293B',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 32,
        width: '100%',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#0F172A',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.2,
        elevation: 6,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '900',
        fontStyle: 'italic',
        textTransform: 'uppercase',
    },
});

export default LevelUpOverlay;