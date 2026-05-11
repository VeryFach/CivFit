import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1F2228', // brand-dark
        tabBarInactiveTintColor: '#9CA3AF', // gray-400
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#1F2228',
          borderTopWidth: 4,
          height: 84,
          paddingTop: 8,
          paddingBottom: 10,
          shadowColor: '#1F2228',
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
  );
}
