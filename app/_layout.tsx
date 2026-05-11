import { DarkTheme, DefaultTheme, ThemeProvider, useFocusEffect } from '@react-navigation/native';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/hooks/useAuth';
import { CivfitProvider } from '@/store/CivfitProvider';
import { useCivStore } from '@/store/appStore';

export const unstable_settings = {
  initialRouteName: '(app)',
};

/**
 * Root Layout
 * Handles authentication routing:
 * - Loading state → splash
 * - Not authenticated → (auth)/login
 * - Authenticated → (app)/(tabs)
 */
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { currentUser, loading: authLoading } = useAuth();
  const storeLoading = useCivStore((state) => state.loading);
  const initialize = useCivStore((state) => state.initialize);

  // Initialize store on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Handle routing based on auth state
  useFocusEffect(
    useCallback(() => {
      // Still loading - show splash
      if (authLoading || storeLoading) {
        return;
      }

      // Not authenticated - go to login
      if (!currentUser) {
        router.replace('/(auth)/login');
        return;
      }

      // Authenticated - go to main app
      router.replace('/(tabs)');
    }, [authLoading, storeLoading, currentUser])
  );

  // Show loading state
  if (authLoading || storeLoading) {
    return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="splash" options={{ title: 'Splash' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <CivfitProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          {/* Auth routes */}
          <Stack.Screen
            name="(auth)"
            options={{
              title: 'Auth',
            }}
          />

          {/* App routes */}
          <Stack.Screen
            name="(app)"
            options={{
              title: 'App',
            }}
          />
        </Stack>
        <StatusBar style="auto" />
      </CivfitProvider>
    </ThemeProvider>
  );
}
