import { BuildingType, Era, EvolutionBranch } from './types';

export const ERAS_CONFIG = [
  {
    id: Era.STONE_AGE,
    minLevel: 1,
    name: 'Stone Age',
    description: 'The dawn of humanity. Focused on survival and basic gathering.',
    unlocks: ['nomadic', 'agrarian']
  },
  {
    id: Era.MEDIEVAL,
    minLevel: 5,
    name: 'Medieval',
    description: 'An age of kingdoms and knights.',
    unlocks: ['feudal', 'mercantile']
  },
  { id: Era.INDUSTRIAL, minLevel: 15, name: 'Industrial' },
  { id: Era.MODERN, minLevel: 30, name: 'Modern' },
  { id: Era.DIGITAL, minLevel: 50, name: 'Digital Era' },
];

export const EVOLUTION_BRANCHES: EvolutionBranch[] = [
  {
    id: 'nomadic',
    name: 'Nomadic Tribe',
    description: 'Move with available resources; focused on mobility.',
    era: Era.STONE_AGE,
    requirements: [
      { type: 'level', target: 2, description: 'Reach Level 2' },
      { type: 'buildings', target: 'house', description: 'Own 2 Simple Houses' }
    ],
    benefits: ['+Silver from exploration', 'Building costs -10%'],
    iconName: 'Tent'
  },
  {
    id: 'agrarian',
    name: 'Agrarian Society',
    description: 'Settle and farm; focused on population growth.',
    era: Era.STONE_AGE,
    requirements: [
      { type: 'level', target: 3, description: 'Reach Level 3' },
      { type: 'buildings', target: 'farm', description: 'Own 3 Communal Farms' }
    ],
    benefits: ['+20% Food Production', '+5% Population Health'],
    iconName: 'Wheat'
  },
  {
    id: 'feudal',
    name: 'Feudal System',
    description: 'A hierarchy of loyalty and protection.',
    era: Era.MEDIEVAL,
    requirements: [
      { type: 'level', target: 8, description: 'Reach Level 8' }
    ],
    benefits: ['+15% Daily Taxes', 'Increased city defenses'],
    iconName: 'Shield'
  },
  {
    id: 'mercantile',
    name: 'Merchant Guild',
    description: 'Focused on trade and wealth accumulation.',
    era: Era.MEDIEVAL,
    requirements: [
      { type: 'level', target: 12, description: 'Reach Level 12' }
    ],
    benefits: ['10% Shop Discount', '+50% Silver from Gacha'],
    iconName: 'Coins'
  },
  {
    id: 'industrialist',
    name: 'Industrial Revolution',
    description: 'Mass production and mechanical efficiency.',
    era: Era.INDUSTRIAL,
    requirements: [
      { type: 'level', target: 20, description: 'Reach Level 20' }
    ],
    benefits: ['Upgrade costs -20%', '+30% Food Production'],
    iconName: 'Factory'
  },
  {
    id: 'modernist',
    name: 'Global Vision',
    description: 'Connectivity and urban innovation.',
    era: Era.MODERN,
    requirements: [
      { type: 'level', target: 35, description: 'Reach Level 35' }
    ],
    benefits: ['+15% Citizen Happiness', '+25% Momentum Bonus'],
    iconName: 'Globe'
  },
  {
    id: 'cybernetic',
    name: 'Digital Singularity',
    description: 'Full integration of biology and technology.',
    era: Era.DIGITAL,
    requirements: [
      { type: 'level', target: 60, description: 'Reach Level 60' }
    ],
    benefits: ['+50% Population Growth', 'Immunity to diseases'],
    iconName: 'Cpu'
  }
];

export const BUILDINGS: BuildingType[] = [
  // STONE AGE & EARLY
  {
    id: 'house',
    name: 'Simple House',
    era: Era.STONE_AGE,
    category: 'residential',
    costSilver: 100,
    costGold: 0,
    housing: 10,
    foodProduction: 0,
    silverIncome: 0,
    healthBonus: 0,
    happinessBonus: 2,
    description: 'Basic housing for new residents.',
    iconName: 'Home'
  },
  {
    id: 'farm',
    name: 'Communal Farm',
    era: Era.STONE_AGE,
    category: 'food',
    costSilver: 80,
    costGold: 0,
    housing: 0,
    foodProduction: 25,
    silverIncome: 0,
    healthBonus: 1,
    happinessBonus: 0,
    description: 'Primary food source for the colony.',
    iconName: 'Wheat'
  },
  // MEDIEVAL / MID
  {
    id: 'restaurant',
    name: 'Village Restaurant',
    era: Era.MEDIEVAL,
    category: 'food',
    costSilver: 500,
    costGold: 0,
    housing: 0,
    foodProduction: 60,
    silverIncome: 10,
    healthBonus: 0,
    happinessBonus: 5,
    description: 'Provides quality meals and modest income.',
    iconName: 'Utensils'
  },
  {
    id: 'taxOffice',
    name: 'Tax Office',
    era: Era.MEDIEVAL,
    category: 'economic',
    costSilver: 1200,
    costGold: 2,
    housing: -2,
    foodProduction: 0,
    silverIncome: 80,
    healthBonus: -2,
    happinessBonus: -5,
    description: 'Tax collection center to support city prosperity.',
    iconName: 'Landmark'
  },
  // INDUSTRIAL & LATE
  {
    id: 'coffeeShop',
    name: 'Artisan Coffee Shop',
    era: Era.INDUSTRIAL,
    category: 'economic',
    costSilver: 3000,
    costGold: 10,
    housing: 0,
    foodProduction: 10,
    silverIncome: 150,
    healthBonus: 2,
    happinessBonus: 8,
    description: 'A premium gathering spot with high profits.',
    iconName: 'Coffee'
  },
  {
    id: 'medicalClinic',
    name: 'Medical Clinic',
    era: Era.MEDIEVAL,
    category: 'utility',
    costSilver: 800,
    costGold: 0,
    housing: 0,
    foodProduction: 0,
    silverIncome: -10,
    healthBonus: 15,
    happinessBonus: 5,
    description: 'Medical center to reduce fatalities.',
    iconName: 'Stethoscope'
  },
  {
    id: 'cloneCenter',
    name: 'Population Clone Center',
    era: Era.MODERN,
    category: 'special',
    costSilver: 10000,
    costGold: 100,
    housing: 200,
    foodProduction: -50,
    silverIncome: 0,
    healthBonus: -10,
    happinessBonus: -10,
    description: 'Futuristic technology enabling rapid population growth.',
    iconName: 'Dna'
  }
];

export const RECOVERY_ITEMS = [
  { id: 'espresso', name: 'Espresso', costGold: 50, hpRestore: 10, icon: 'Coffee', description: 'Quick boost of energy.' },
  { id: 'potion', name: 'Divine Potion', costGold: 200, hpRestore: 50, icon: 'FlaskConical', description: 'Ancient brew for rapid healing.' },
  { id: 'ticket', name: 'Elysium Ticket', costGold: 500, hpRestore: 100, icon: 'Ticket', description: 'Total reality recalibration.' },
  { id: 'skipTicket', name: 'Skip Ticket', costGold: 1500, hpRestore: 0, icon: 'Clock', description: 'Protect your simulation from a missed day.' },
];

export const GRID_SIZE = 10;
export const EXP_PER_LEVEL = 1000;
export const DEFAULT_HP = 100;
export const PASSIVE_INTERVAL = 60000; // 1 minute

export const DISASTERS = [
  { id: 'plague', name: 'Mysterious Plague', description: "A mysterious plague strikes. Citizens' health is at risk!", impactType: 'health', severity: 15 },
  { id: 'earthquake', name: 'Tremor of Gaia', description: 'An earthquake damages city infrastructure.', impactType: 'building', severity: 5 },
  { id: 'famine', name: 'Great Drought', description: 'A prolonged drought. Food supplies are severely depleted.', impactType: 'happiness', severity: 10 },
  { id: 'revolt', name: 'Citizen Unrest', description: 'Widespread unrest. Happiness drops sharply.', impactType: 'happiness', severity: 20 },
];

export const ERA_MILESTONES = [
  { era: Era.STONE_AGE, populationTarget: 0, unlocks: ['Hunters Cabin', 'Fire Pit'] },
  { era: Era.MEDIEVAL, populationTarget: 100, unlocks: ['Grand Castle', 'Market Square'] },
  { era: Era.INDUSTRIAL, populationTarget: 500, unlocks: ['Steel Mill', 'Train Station'] },
  { era: Era.MODERN, populationTarget: 2000, unlocks: ['Skyscraper', 'Airport'] },
  { era: Era.DIGITAL, populationTarget: 10000, unlocks: ['Data Hive', 'Neural Interface'] },
];
