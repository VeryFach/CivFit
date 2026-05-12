import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';

import { LoginScreen } from '@/components/common/LoginScreen';
import { useAuth } from '@/hooks/useAuth';
import { useCivStore } from '@/store/appStore';

/**
 * Login Screen Route
 * Shows login UI when user is not authenticated
 * Automatically redirects to home if already logged in
 */
export default function LoginRoute() {
    const { currentUser } = useAuth();
    const storeLoading = useCivStore((state) => state.loading);

    // Auto-redirect if user is already logged in
    useFocusEffect(
        useCallback(() => {
            if (currentUser && !storeLoading) {
                router.replace('/(tabs)');
            }
        }, [currentUser, storeLoading])
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <LoginScreen />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FDF6E3',
    },
    content: {
        flex: 1,
    },
});
