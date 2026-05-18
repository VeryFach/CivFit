export type CivfitRoute = {
  title: string;
  href: '/';
  description: string;
  badge: string;
  icon: 'home-outline';
};

export type FeatureRoute = {
  title: string;
  href: '/' | '/city' | '/shop' | '/menu';
  description: string;
  badge: string;
  icon: string;
};

export type HighlightCard = {
  label: string;
  value: string;
  note: string;
  accent: 'blue' | 'amber' | 'mint' | 'rose';
};

export type CitySystemCard = {
  title: string;
  description: string;
  badge: string;
  icon: string;
};

export type ShopItemCard = {
  name: string;
  cost: string;
  effect: string;
  badge: string;
  icon: string;
};

export const highlightCards: HighlightCard[] = [
  {
    label: 'Navigation',
    value: 'Expo Router',
    note: 'File-based navigation structure',
    accent: 'blue',
  },
  {
    label: 'State',
    value: 'CivFit Core',
    note: 'Habits, city, shop, and logs',
    accent: 'amber',
  },
  {
    label: 'Target',
    value: 'Mobile-first',
    note: 'Ready for Android and iOS',
    accent: 'mint',
  },
  {
    label: 'Scope',
    value: 'Web to App',
    note: 'Translating web flows into a native app shell',
    accent: 'rose',
  },
];

export const featureRoutes: FeatureRoute[] = [
  {
    title: 'Reality',
    href: '/',
    description: 'Summary of status, habits, and daily progress.',
    badge: 'Home',
    icon: 'home-outline',
  },
  {
    title: 'City',
    href: '/city',
    description: 'Population, buildings, health, and happiness.',
    badge: 'City',
    icon: 'business-outline',
  },
  {
    title: 'Shop',
    href: '/shop',
    description: 'Recovery items, gacha, and progress boosters.',
    badge: 'Shop',
    icon: 'bag-handle-outline',
  },
  {
    title: 'Menu',
    href: '/menu',
    description: 'App architecture, synchronization, and next steps.',
    badge: 'Menu',
    icon: 'settings-outline',
  },
];

export const citySystems: CitySystemCard[] = [
  {
    title: 'Population Engine',
    description: 'Calculate population growth from housing, food, and health.',
    badge: 'City core',
    icon: 'people-outline',
  },
  {
    title: 'Building Grid',
    description: 'Arrange buildings by era and resource costs.',
    badge: 'Layout',
    icon: 'grid-outline',
  },
  {
    title: 'Daily Report',
    description: 'Daily summary for habit completion and city effects.',
    badge: 'Report',
    icon: 'document-text-outline',
  },
  {
    title: 'Evolution Path',
    description: 'Evolution branches unlocked by level and milestones.',
    badge: 'Progress',
    icon: 'trending-up-outline',
  },
];

export const shopItems: ShopItemCard[] = [
  {
    name: 'Espresso',
    cost: '50 Gold',
    effect: '+10 HP',
    badge: 'Quick boost',
    icon: 'cafe-outline',
  },
  {
    name: 'Divine Potion',
    cost: '200 Gold',
    effect: '+50 HP',
    badge: 'Recovery',
    icon: 'flask-outline',
  },
  {
    name: 'Elysium Ticket',
    cost: '500 Gold',
    effect: '+100 HP',
    badge: 'Premium',
    icon: 'ticket-outline',
  },
  {
    name: 'Skip Ticket',
    cost: '1500 Gold',
    effect: 'One-day protection',
    badge: 'Safety net',
    icon: 'time-outline',
  },
];

export const menuNotes = [
  'Separate feature layers from route layers to keep navigation extensible.',
  'Use a single domain data source to map web features to mobile.',
  'Keep auth and Firestore in the service layer for future sync.',
  'Keep Expo routes minimal; focus on composing shared components.',
];

export const appChecklist = [
  'Dedicated tab bar for CivFit’s four main areas.',
  'Centralized card components for consistent layout across screens.',
  'Domain data separated from routes for easy migration to real state.',
  'Structure ready for adding login, sync, and advanced dashboards.',
];
