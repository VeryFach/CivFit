import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Home, Map, ShoppingBag, Settings } from 'lucide-react-native';
import { COLORS, THEME } from '../theme';

interface NavigationProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export function Navigation({ currentTab, onTabChange }: NavigationProps) {
  const tabs = [
    { id: 'realita', label: 'Reality', icon: Home },
    { id: 'kota', label: 'City', icon: Map },
    { id: 'toko', label: 'Shop', icon: ShoppingBag },
    { id: 'settings', label: 'Menu', icon: Settings },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;
        return (
          <Pressable
            key={tab.id}
            onPress={() => onTabChange(tab.id)}
            style={styles.tabItem}
          >
            <View style={[
              styles.iconContainer,
              isActive ? styles.iconContainerActive : styles.iconContainerInactive
            ]}>
              <Icon 
                size={20} 
                color={isActive ? COLORS.white : COLORS.dark} 
              />
            </View>
            <Text style={[
              styles.tabLabel,
              { opacity: isActive ? 1 : 0.4 }
            ]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: COLORS.white,
    borderTopWidth: 4,
    borderTopColor: COLORS.dark,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    zIndex: 50,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 64,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderWidth: 2,
    borderColor: COLORS.dark,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerActive: {
    backgroundColor: COLORS.red,
    ...THEME.neoShadowSm,
    transform: [{ scale: 1.1 }],
  },
  iconContainerInactive: {
    backgroundColor: COLORS.white,
  },
  tabLabel: {
    fontSize: 8,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginTop: 4,
    color: COLORS.dark,
  },
});
