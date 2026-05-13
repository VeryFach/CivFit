import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Map, ShoppingBag, Settings } from 'lucide-react-native';

interface NavigationProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

const TABS = [
  { id: 'realita', label: 'Reality', Icon: Home },
  { id: 'kota',   label: 'City',    Icon: Map },
  { id: 'toko',   label: 'Shop',    Icon: ShoppingBag },
  { id: 'settings', label: 'Menu',  Icon: Settings },
];

const { width } = Dimensions.get('window');
const TAB_WIDTH = width / TABS.length;

export function Navigation({ currentTab, onTabChange }: NavigationProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom || 8 }]}>
      {TABS.map(({ id, label, Icon }) => {
        const isActive = currentTab === id;
        return (
          <TouchableOpacity
            key={id}
            onPress={() => onTabChange(id)}
            activeOpacity={0.7}
            style={styles.tab}
          >
            <View style={[styles.iconBox, isActive && styles.iconBoxActive]}>
              <Icon
                size={20}
                color={isActive ? '#FFFFFF' : '#2D3436'}
                strokeWidth={2.5}
              />
            </View>
            <Text style={[styles.label, isActive ? styles.labelActive : styles.labelInactive]}>
              {label}
            </Text>
          </TouchableOpacity>
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
    height: 72,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 3,
    borderTopColor: '#2D3436',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    // Hard shadow for brutalist feel
    ...Platform.select({
      ios: {
        shadowColor: '#2D3436',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.08,
        shadowRadius: 0,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingTop: 6,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2D3436',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxActive: {
    backgroundColor: '#E17055',  // brand-red
    transform: [{ scale: 1.1 }],
    // Hard shadow via asymmetric border — works on iOS & Android
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: '#2D3436',
  },
  label: {
    fontSize: 8,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  labelActive: {
    color: '#2D3436',
    opacity: 1,
  },
  labelInactive: {
    color: '#2D3436',
    opacity: 0.35,
  },
});