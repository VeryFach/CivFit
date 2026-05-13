import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { router, Stack, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/hooks/useAuth';
import { CivfitProvider } from '@/store/CivfitProvider';
import { useCivStore } from '@/store/appStore';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { currentUser, loading: authLoading } = useAuth();
  const storeLoading = useCivStore((state) => state.loading);
  const initialize = useCivStore((state) => state.initialize);
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!rootNavigationState?.key) return;

    if (authLoading || storeLoading) return;

    if (!currentUser) {
      router.replace('/(auth)/login');
    } else {
      router.replace('/(tabs)');
    }
  }, [rootNavigationState?.key, authLoading, storeLoading, currentUser]);

  if (authLoading || storeLoading) {
    return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="splash" options={{ title: 'Splash' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <CivfitProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" options={{ title: 'Auth' }} />
          <Stack.Screen name="(tabs)" options={{ title: 'App' }} />
        </Stack>
        <StatusBar style="auto" />
      </CivfitProvider>
    </ThemeProvider>
  );
}