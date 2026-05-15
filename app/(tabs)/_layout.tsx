import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { Header } from '@/components/navigation/Header';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/hooks/useAuth';

export default function TabLayout() {
  const { currentUser, loading } = useAuth();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  if (!loading && !currentUser) {
    return <Redirect href="/(auth)/login" />;
  }

  const palette = isDarkMode
    ? {
        active: '#F8FAFC',
        inactive: '#94A3B8',
        bar: '#1E293B',
        border: '#334155',
        background: '#0F172A',
      }
    : {
        active: '#1F2228',
        inactive: '#9CA3AF',
        bar: '#FFFFFF',
        border: '#1F2228',
        background: '#FDF6E3',
      };

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <Header />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: palette.active,
          tabBarInactiveTintColor: palette.inactive,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: {
            backgroundColor: palette.bar,
            borderTopColor: palette.border,
            borderTopWidth: 4,
            height: 84,
            paddingTop: 8,
            paddingBottom: 10,
            shadowColor: palette.border,
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.15,
            shadowRadius: 4,
            elevation: 8,
          },
          tabBarLabelStyle: {
            fontSize: 9,
            fontWeight: '900',
            letterSpacing: 0.8,
            textTransform: 'uppercase',
            marginTop: 2,
          },
          tabBarItemStyle: {
            paddingVertical: 2,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Realita',
            tabBarIcon: ({ color, focused, size }) => (
              <Ionicons
                name={focused ? 'home' : 'home-outline'}
                size={size + 4}
                color={color}
                style={{ fontWeight: focused ? 'bold' : 'normal' }}
              />
            ),
        }}
      />
      <Tabs.Screen
        name="city"
        options={{
          title: 'Kota',
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons
              name={focused ? 'business' : 'business-outline'}
              size={size + 4}
              color={color}
              style={{ fontWeight: focused ? 'bold' : 'normal' }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: 'Toko',
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons
              name={focused ? 'bag-handle' : 'bag-handle-outline'}
              size={size + 4}
              color={color}
              style={{ fontWeight: focused ? 'bold' : 'normal' }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: 'Menu',
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons
              name={focused ? 'settings' : 'settings-outline'}
              size={size + 4}
              color={color}
              style={{ fontWeight: focused ? 'bold' : 'normal' }}
            />
          ),
        }}
      />
    </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
