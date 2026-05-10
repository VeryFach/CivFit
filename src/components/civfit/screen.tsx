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
        backgroundColor: '#F7F2EA',
    },
    content: {
        flexGrow: 1,
        paddingHorizontal: 12,
        paddingTop: 12,
        paddingBottom: 28,
        gap: 18,
    },
    backgroundGlowOne: {
        position: 'absolute',
        top: 10,
        right: -48,
        width: 172,
        height: 172,
        borderRadius: 999,
        backgroundColor: 'rgba(145, 197, 255, 0.14)',
    },
    backgroundGlowTwo: {
        position: 'absolute',
        bottom: -36,
        left: -56,
        width: 176,
        height: 176,
        borderRadius: 999,
        backgroundColor: 'rgba(255, 210, 88, 0.14)',
    },
});
