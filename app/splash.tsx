import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

import { COLORS } from '@/theme';

/**
 * Splash Screen - Shown during app initialization
 * Displays loading animation while auth and store are initializing
 */
export default function SplashScreen() {
    const router = useRouter();

    useEffect(() => {
        // Give time for auth state to settle
        const timer = setTimeout(() => {
            router.replace('/(auth)/login');
        }, 2000);

        return () => clearTimeout(timer);
    }, [router]);

    return (
        <View style={styles.container}>
            <Animated.View
                entering={ZoomIn.duration(600)}
                style={styles.logoContainer}
            >
                <Text style={styles.logo}>🏰</Text>
                <Animated.Text
                    entering={FadeIn.delay(400)}
                    style={styles.title}
                >
                    CIV<Text style={styles.titleAccent}>FIT</Text>
                </Animated.Text>
                <Text style={styles.loading}>Loading...</Text>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
    },
    logo: {
        fontSize: 64,
        marginBottom: 16,
    },
    title: {
        fontSize: 48,
        fontWeight: '900',
        fontStyle: 'italic',
        textTransform: 'uppercase',
        letterSpacing: -1,
        color: COLORS.dark,
        marginBottom: 24,
    },
    titleAccent: {
        color: COLORS.teal,
    },
    loading: {
        fontSize: 14,
        fontWeight: '700',
        color: '#999',
    },
});
