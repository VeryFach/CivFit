import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { COLORS } from '@/theme';

/**
 * Splash Screen - Shown during app initialization
 * Displays loading animation while auth and store are initializing
 */
export default function SplashScreen() {
    const isDarkMode = useColorScheme() === 'dark';
    const palette = isDarkMode
        ? {
            background: '#0F172A',
            text: '#F8FAFC',
            accent: '#2DD4BF',
            muted: '#94A3B8',
        }
        : {
            background: COLORS.bg,
            text: COLORS.dark,
            accent: COLORS.teal,
            muted: '#999',
        };

    return (
        <View style={[styles.container, { backgroundColor: palette.background }]}>
            <Animated.View
                entering={ZoomIn.duration(600)}
                style={styles.logoContainer}
            >
                <Text style={styles.logo}>🏰</Text>
                <Animated.Text
                    entering={FadeIn.delay(400)}
                    style={[styles.title, { color: palette.text }]}
                >
                    CIV<Text style={[styles.titleAccent, { color: palette.accent }]}>FIT</Text>
                </Animated.Text>
                <Text style={[styles.loading, { color: palette.muted }]}>Loading...</Text>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
        marginBottom: 24,
    },
    titleAccent: {
    },
    loading: {
        fontSize: 14,
        fontWeight: '700',
    },
});
