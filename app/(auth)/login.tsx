import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LoginScreen } from '@/components/common/LoginScreen';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/hooks/useAuth';
import { useCivStore } from '@/store';

/**
 * Login Screen Route
 * Shows login UI when user is not authenticated
 * Automatically redirects to home if already logged in
 */
export default function LoginRoute() {
    const { currentUser } = useAuth();
    const storeLoading = useCivStore((state) => state.loading);
    const isDarkMode = useColorScheme() === 'dark';

    // Auto-redirect if user is already logged in
    useFocusEffect(
        useCallback(() => {
            if (currentUser && !storeLoading) {
                router.replace('/(tabs)');
            }
        }, [currentUser, storeLoading])
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#0F172A' : '#FDF6E3' }]}>
            <View style={styles.content}>
                <LoginScreen />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
});
