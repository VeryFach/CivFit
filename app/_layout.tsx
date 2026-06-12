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

  return (
    <SafeAreaProvider>
      <ThemeProvider
        value={
          colorScheme === 'dark'
            ? DarkTheme
            : DefaultTheme
        }
      >
        <CivfitProvider>
          <Stack
            screenOptions={{
              headerShown: false
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