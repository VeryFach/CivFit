import { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from './app-header';

export function CivfitScreen({ children }: PropsWithChildren) {
    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <AppHeader />
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                bounces={false}>
                <View style={styles.backgroundGlowOne} />
                <View style={styles.backgroundGlowTwo} />
                {children}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F6F0E7',
    },
    content: {
        flexGrow: 1,
        paddingHorizontal: 14,
        paddingTop: 12,
        paddingBottom: 28,
        gap: 18,
    },
    backgroundGlowOne: {
        position: 'absolute',
        top: 8,
        right: -40,
        width: 160,
        height: 160,
        borderRadius: 999,
        backgroundColor: 'rgba(91, 178, 255, 0.12)',
    },
    backgroundGlowTwo: {
        position: 'absolute',
        bottom: -30,
        left: -50,
        width: 160,
        height: 160,
        borderRadius: 999,
        backgroundColor: 'rgba(255, 223, 115, 0.14)',
    },
});
