import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider
} from '@react-navigation/native';

import {
  Stack
} from 'expo-router';

import {
  StatusBar
} from 'expo-status-bar';

import React, {
  useEffect
} from 'react';

import 'react-native-reanimated';

import {
  useColorScheme
} from '@/hooks/use-color-scheme';

import {
  CivfitProvider
} from '@/store/CivfitProvider';

import {
  useCivStore
} from '@/store';

import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const initialize = useCivStore(
    (state) => state.initialize
  );

  useEffect(() => {
    initialize();
  }, [initialize]);

  const isDark = colorScheme === 'dark';
  const appTheme = isDark
    ? { ...DarkTheme, colors: { ...DarkTheme.colors, background: '#0F172A', card: '#1E293B' } }
    : { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: '#F8FAFC', card: '#F8FAFC' } };

  return (
    <SafeAreaProvider
      style={{ backgroundColor: appTheme.colors.background }}
    >
      <ThemeProvider value={appTheme}>
        <CivfitProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: appTheme.colors.background },
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
          </Stack>

          <StatusBar
            style="auto"
            translucent
          />
        </CivfitProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}