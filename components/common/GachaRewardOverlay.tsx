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

const { width } = Dimensions.get('window');

interface GachaRewardOverlayProps {
    visible: boolean;
    reward: {
        type: 'gold' | 'silver' | 'exp' | 'hp';
        amount: number;
        message: string;
    };
    onClose: () => void;
}

const GachaRewardOverlay: React.FC<GachaRewardOverlayProps> = ({
    visible,
    reward,
    onClose,
}) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.5)).current;
    const translateYAnim = useRef(new Animated.Value(100)).current;

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
                Animated.spring(translateYAnim, {
                    toValue: 0,
                    friction: 8,
                    tension: 40,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            fadeAnim.setValue(0);
            scaleAnim.setValue(0.5);
            translateYAnim.setValue(100);
        }
    }, [visible]);

    const getIcon = () => {
        switch (reward.type) {
            case 'gold':
                return '💰';
            case 'silver':
                return '🪙';
            case 'exp':
                return '✨';
            case 'hp':
                return '❤️';
            default:
                return '🎁';
        }
    };

    return (
        <Modal transparent visible={visible} animationType="none">
            <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
                <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
                <Animated.View
                    style={[
                        styles.card,
                        {
                            transform: [
                                { scale: scaleAnim },
                                { translateY: translateYAnim },
                            ],
                        },
                    ]}
                >
                    <View style={styles.iconCircle}>
                        <Text style={styles.iconEmoji}>{getIcon()}</Text>
                    </View>
                    <Text style={styles.title}>Kuil Nasib</Text>
                    <Text style={styles.subtitle}>Berkat yang Diterima</Text>

                    <View style={styles.amountBox}>
                        <Text style={styles.amount}>+{reward.amount}</Text>
                        <Text style={styles.amountType}>{reward.type}</Text>
                    </View>

                    <Text style={styles.message}>"{reward.message}"</Text>

                    <TouchableOpacity style={styles.button} onPress={onClose}>
                        <Text style={styles.buttonText}>SYUKUR</Text>
                    </TouchableOpacity>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(30,41,59,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
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
        elevation: 8,
    },
    iconCircle: {
        position: 'absolute',
        top: -40,
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FBBF24',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#1E293B',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.2,
        elevation: 6,
    },
    iconEmoji: {
        fontSize: 40,
    },
    title: {
        marginTop: 48,
        fontSize: 28,
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
        color: '#94A3B8',
        letterSpacing: 2,
        marginBottom: 24,
    },
    amountBox: {
        backgroundColor: '#F8FAFC',
        paddingVertical: 24,
        paddingHorizontal: 32,
        borderRadius: 32,
        borderWidth: 2,
        borderColor: '#CBD5E1',
        marginBottom: 24,
        alignItems: 'center',
    },
    amount: {
        fontSize: 48,
        fontWeight: '900',
        color: '#14B8A6',
        fontFamily: 'monospace',
    },
    amountType: {
        fontSize: 12,
        fontWeight: '900',
        textTransform: 'uppercase',
        color: '#64748B',
    },
    message: {
        fontSize: 14,
        fontWeight: 'bold',
        fontStyle: 'italic',
        color: '#1E293B',
        textAlign: 'center',
        marginBottom: 32,
    },
    button: {
        backgroundColor: '#14B8A6',
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
        color: '#1E293B',
        fontSize: 18,
        fontWeight: '900',
        fontStyle: 'italic',
        textTransform: 'uppercase',
    },
});

export default GachaRewardOverlay;