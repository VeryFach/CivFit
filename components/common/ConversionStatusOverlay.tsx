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

interface ConversionStatusOverlayProps {
    visible: boolean;
    success: boolean;
    message: string;
    type: 'gold' | 'silver';
    onClose: () => void;
}

const ConversionStatusOverlay: React.FC<ConversionStatusOverlayProps> = ({
    visible,
    success,
    message,
    type,
    onClose,
}) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const translateYAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 200,
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
            scaleAnim.setValue(0.9);
            translateYAnim.setValue(20);
        }
    }, [visible]);

    const getIcon = () => {
        if (!success) return '❌';
        return type === 'gold' ? '💰' : '🪙';
    };

    const getTitle = () => (success ? 'Berhasil!' : 'Gagal!');
    const cardBackground = success ? '#FFFFFF' : '#EF4444';
    const textColor = success ? '#1E293B' : '#FFFFFF';

    return (
        <Modal transparent visible={visible} animationType="none">
            <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
                <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
                <Animated.View
                    style={[
                        styles.card,
                        { backgroundColor: cardBackground },
                        {
                            transform: [
                                { scale: scaleAnim },
                                { translateY: translateYAnim },
                            ],
                        },
                    ]}
                >
                    <View style={[styles.iconBox, success && styles.iconBoxSuccess]}>
                        <Text style={styles.iconEmoji}>{getIcon()}</Text>
                    </View>
                    <Text style={[styles.title, { color: textColor }]}>{getTitle()}</Text>
                    <Text style={[styles.message, { color: success ? '#64748B' : '#FFFFFFCC' }]}>
                        {message}
                    </Text>
                    <TouchableOpacity
                        style={[styles.button, success && styles.buttonSuccess]}
                        onPress={onClose}
                    >
                        <Text style={[styles.buttonText, success && styles.buttonTextSuccess]}>
                            MENGERTI
                        </Text>
                    </TouchableOpacity>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(30,41,59,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    card: {
        width: width * 0.85,
        borderRadius: 40,
        padding: 24,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#1E293B',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.2,
        elevation: 8,
    },
    iconBox: {
        width: 64,
        height: 64,
        borderRadius: 24,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#CBD5E1',
    },
    iconBoxSuccess: {
        backgroundColor: '#F8FAFC',
    },
    iconEmoji: {
        fontSize: 32,
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        fontStyle: 'italic',
        textTransform: 'uppercase',
        marginBottom: 8,
    },
    message: {
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 24,
    },
    button: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 32,
        width: '100%',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#1E293B',
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.2,
        elevation: 4,
    },
    buttonSuccess: {
        backgroundColor: '#14B8A6',
    },
    buttonText: {
        color: '#EF4444',
        fontWeight: '900',
        fontSize: 14,
        textTransform: 'uppercase',
    },
    buttonTextSuccess: {
        color: '#1E293B',
    },
});

export default ConversionStatusOverlay;