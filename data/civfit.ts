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
    label: 'Mode',
    value: 'Expo Router',
    note: 'Struktur file-based navigation',
    accent: 'blue',
  },
  {
    label: 'State',
    value: 'CivFit Core',
    note: 'Habit, city, shop, dan log',
    accent: 'amber',
  },
  {
    label: 'Target',
    value: 'Mobile-first',
    note: 'Siap dipakai di Android dan iOS',
    accent: 'mint',
  },
  {
    label: 'Scope',
    value: 'Web to App',
    note: 'Menerjemahkan alur web ke shell aplikasi',
    accent: 'rose',
  },
];

export const featureRoutes: FeatureRoute[] = [
  {
    title: 'Realita',
    href: '/',
    description: 'Ringkasan status, kebiasaan, dan progres harian.',
    badge: 'Home',
    icon: 'home-outline',
  },
  {
    title: 'Kota',
    href: '/city',
    description: 'Populasi, bangunan, kesehatan, dan kebahagiaan.',
    badge: 'City',
    icon: 'business-outline',
  },
  {
    title: 'Toko',
    href: '/shop',
    description: 'Item pemulihan, gacha, dan penguat progres.',
    badge: 'Shop',
    icon: 'bag-handle-outline',
  },
  {
    title: 'Menu',
    href: '/menu',
    description: 'Arsitektur aplikasi, sinkronisasi, dan langkah berikutnya.',
    badge: 'Menu',
    icon: 'settings-outline',
  },
];

export const citySystems: CitySystemCard[] = [
  {
    title: 'Population Engine',
    description: 'Menyusun pertumbuhan penduduk dari housing, food, dan health.',
    badge: 'City core',
    icon: 'people-outline',
  },
  {
    title: 'Building Grid',
    description: 'Menata bangunan berdasarkan era dan biaya sumber daya.',
    badge: 'Layout',
    icon: 'grid-outline',
  },
  {
    title: 'Daily Report',
    description: 'Ringkasan hasil harian untuk habit completion dan city effects.',
    badge: 'Report',
    icon: 'document-text-outline',
  },
  {
    title: 'Evolution Path',
    description: 'Cabang perkembangan yang terbuka seiring level dan milestone.',
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
    effect: 'Proteksi satu hari',
    badge: 'Safety net',
    icon: 'time-outline',
  },
];

export const menuNotes = [
  'Pisahkan feature layer dari route layer supaya navigasi mudah dikembangkan.',
  'Gunakan satu sumber data domain untuk memetakan fitur web ke versi mobile.',
  'Simpan auth dan Firestore di service layer jika nanti sinkronisasi diaktifkan.',
  'Tetap jaga route Expo kecil, fokus pada komposisi komponen bersama.',
];

export const appChecklist = [
  'Tab bar dibuat khusus untuk empat area utama CivFit.',
  'Komponen kartu dipusatkan agar tampilan konsisten di seluruh layar.',
  'Data domain ditaruh terpisah dari route supaya mudah dipindah ke state nyata.',
  'Struktur ini siap dipakai untuk menambahkan login, sync, dan dashboard lanjutan.',
];
