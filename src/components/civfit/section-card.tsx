import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type SectionCardProps = {
    title: string;
    description: string;
    badge: string;
    icon: ReactNode;
    onPress?: () => void;
};

export function SectionCard({ title, description, badge, icon, onPress }: SectionCardProps) {
    if (onPress) {
        return (
            <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
                <View style={styles.topRow}>
                    <View style={styles.iconBox}>{icon}</View>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{badge}</Text>
                    </View>
                </View>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.description}>{description}</Text>
            </Pressable>
        );
    }

    return (
        <View style={styles.card}>
            <View style={styles.topRow}>
                <View style={styles.iconBox}>{icon}</View>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{badge}</Text>
                </View>
            </View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 24,
        borderWidth: 2,
        borderColor: '#1F2228',
        backgroundColor: '#FFFFFF',
        padding: 18,
        gap: 12,
        shadowColor: '#1F2228',
        shadowOpacity: 0.2,
        shadowRadius: 0,
        shadowOffset: { width: 3, height: 3 },
        elevation: 3,
    },
    pressed: {
        opacity: 0.88,
        transform: [{ scale: 0.99 }],
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F6F0E7',
        borderWidth: 2,
        borderColor: '#1F2228',
    },
    badge: {
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 6,
        backgroundColor: '#F7D94A',
        borderWidth: 2,
        borderColor: '#1F2228',
    },
    badgeText: {
        color: '#1F2228',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.4,
        textTransform: 'uppercase',
    },
    title: {
        color: '#1F2228',
        fontSize: 18,
        fontWeight: '800',
    },
    description: {
        color: '#4C5158',
        lineHeight: 20,
        fontSize: 14,
    },
});
