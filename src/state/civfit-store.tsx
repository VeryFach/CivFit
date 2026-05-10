import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';

export type HabitType = 'daily' | 'weekly' | 'monthly';

export type Era = 'Stone Age' | 'Medieval' | 'Industrial' | 'Modern' | 'Digital';

export type DailyReport = {
  date: string;
  habitsCompleted: number;
  habitsTotal: number;
  goldGained: number;
  expGained: number;
  hpChange: number;
  cityHealthChange: number;
  cityHappinessChange: number;
  silverTax: number;
  populationGrowth: number;
  momentumBonus: number;
  message: string;
};

export type ActivityLog = {
  id: string;
  timestamp: string;
  type: 'habit' | 'city' | 'economy' | 'system';
  message: string;
  change: number;
  unit: 'hp' | 'gold' | 'silver' | 'exp' | 'pop' | 'system';
};

export type Habit = {
  id: string;
  title: string;
  type: HabitType;
  completedDates: string[];
  createdAt: string;
  targetCount: number;
  goldReward: number;
  expReward: number;
  difficulty: number;
  currentStreak: number;
};

export type PlacedBuilding = {
  id: string;
  buildingTypeId: string;
  gridX: number;
  gridY: number;
  level: number;
  health: number;
  createdAt: string;
};

export type UserStats = {
  hp: number;
  maxHp: number;
  gold: number;
  silver: number;
  exp: number;
  level: number;
  maxExp: number;
  momentum: number;
  lastCelebratedLevel: number;
  lastEndDay: string | null;
  dayCount: number;
  badges: string[];
  pendingReport: DailyReport | null;
  skipTickets: number;
  unlockedEras: Era[];
};

export type CityState = {
  population: number;
  populationSick: number;
  food: number;
  housing: number;
  health: number;
  happiness: number;
  buildings: PlacedBuilding[];
  currentEra: Era;
  unlockedEvolutions: string[];
};

export type BuildingType = {
  id: string;
  name: string;
  description: string;
  category: 'residential' | 'economic' | 'utility' | 'food' | 'special';
  era: Era;
  costSilver: number;
  costGold: number;
  housing: number;
  foodProduction: number;
  silverIncome: number;
  healthBonus: number;
  happinessBonus: number;
  icon: string;
};

export type RecoveryItem = {
  id: 'espresso' | 'potion' | 'ticket' | 'skipTicket';
  name: string;
  costGold: number;
  hpRestore: number;
  icon: string;
  description: string;
};

export type EvolutionBranch = {
  id: string;
  name: string;
  description: string;
  era: Era;
  requirements: { type: 'level' | 'buildings'; target: number | string; description: string }[];
  benefits: string[];
  icon: string;
};

export const ERAS_CONFIG: { id: Era; minLevel: number; name: string; description: string }[] = [
  { id: 'Stone Age', minLevel: 1, name: 'Stone Age', description: 'Awal mula kemanusiaan. Fokus pada bertahan hidup dan pengumpulan dasar.' },
  { id: 'Medieval', minLevel: 5, name: 'Medieval', description: 'Zaman keemasan kerajaan dan ksatria.' },
  { id: 'Industrial', minLevel: 15, name: 'Industrial', description: 'Mesin, pabrik, dan pertumbuhan massal.' },
  { id: 'Modern', minLevel: 30, name: 'Modern', description: 'Perkotaan modern dan efisiensi tinggi.' },
  { id: 'Digital', minLevel: 50, name: 'Digital', description: 'Era jaringan, AI, dan transformasi total.' },
];

export const BUILDING_TYPES: BuildingType[] = [
  { id: 'house', name: 'Simple House', description: 'Tempat tinggal dasar untuk penduduk baru.', category: 'residential', era: 'Stone Age', costSilver: 100, costGold: 0, housing: 10, foodProduction: 0, silverIncome: 0, healthBonus: 0, happinessBonus: 2, icon: 'home-outline' },
  { id: 'farm', name: 'Communal Farm', description: 'Sumber makanan utama untuk koloni.', category: 'food', era: 'Stone Age', costSilver: 80, costGold: 0, housing: 0, foodProduction: 25, silverIncome: 0, healthBonus: 1, happinessBonus: 0, icon: 'leaf-outline' },
  { id: 'restaurant', name: 'Village Restaurant', description: 'Menyediakan makanan berkualitas dan pemasukan kecil.', category: 'food', era: 'Medieval', costSilver: 500, costGold: 0, housing: 0, foodProduction: 60, silverIncome: 10, healthBonus: 0, happinessBonus: 5, icon: 'restaurant-outline' },
  { id: 'taxOffice', name: 'Tax Office', description: 'Pusat penagihan pajak untuk kemakmuran kota.', category: 'economic', era: 'Medieval', costSilver: 1200, costGold: 2, housing: -2, foodProduction: 0, silverIncome: 80, healthBonus: -2, happinessBonus: -5, icon: 'business-outline' },
  { id: 'medicalClinic', name: 'Medical Clinic', description: 'Pusat pengobatan untuk menekan angka kematian.', category: 'utility', era: 'Medieval', costSilver: 800, costGold: 0, housing: 0, foodProduction: 0, silverIncome: -10, healthBonus: 15, happinessBonus: 5, icon: 'medkit-outline' },
  { id: 'coffeeShop', name: 'Artisan Coffee Shop', description: 'Tempat berkumpul elit dengan profit tinggi.', category: 'economic', era: 'Industrial', costSilver: 3000, costGold: 10, housing: 0, foodProduction: 10, silverIncome: 150, healthBonus: 2, happinessBonus: 8, icon: 'cafe-outline' },
  { id: 'cloneCenter', name: 'Population Clone Center', description: 'Teknologi masa depan untuk ledakan populasi.', category: 'special', era: 'Modern', costSilver: 10000, costGold: 100, housing: 200, foodProduction: -50, silverIncome: 0, healthBonus: -10, happinessBonus: -10, icon: 'pulse-outline' },
];

export const RECOVERY_ITEMS: RecoveryItem[] = [
  { id: 'espresso', name: 'Espresso', costGold: 50, hpRestore: 10, icon: 'cafe-outline', description: 'Quick boost of energy.' },
  { id: 'potion', name: 'Divine Potion', costGold: 200, hpRestore: 50, icon: 'flask-outline', description: 'Ancient brew for rapid healing.' },
  { id: 'ticket', name: 'Elysium Ticket', costGold: 500, hpRestore: 100, icon: 'ticket-outline', description: 'Total reality recalibration.' },
  { id: 'skipTicket', name: 'Skip Ticket', costGold: 1500, hpRestore: 0, icon: 'time-outline', description: 'Protect your simulation from a missed day.' },
];

export const EVOLUTION_BRANCHES: EvolutionBranch[] = [
  { id: 'nomadic', name: 'Suku Nomadik', description: 'Berpindah mengikuti sumber daya. Fokus pada mobilitas.', era: 'Stone Age', requirements: [{ type: 'level', target: 2, description: 'Mencapai Level 2' }, { type: 'buildings', target: 'house', description: 'Memiliki 2 Simple House' }], benefits: ['Bonus Silver dari eksplorasi', 'Biaya bangunan -10%'], icon: 'walk-outline' },
  { id: 'agrarian', name: 'Masyarakat Agraris', description: 'Menetap dan bercocok tanam. Fokus pada pertumbuhan populasi.', era: 'Stone Age', requirements: [{ type: 'level', target: 3, description: 'Mencapai Level 3' }, { type: 'buildings', target: 'farm', description: 'Memiliki 3 Communal Farm' }], benefits: ['Bonus Food Production +20%', 'Kesehatan penduduk +5%'], icon: 'leaf-outline' },
  { id: 'feudal', name: 'Sistem Feodal', description: 'Hierarki ketaatan dan perlindungan.', era: 'Medieval', requirements: [{ type: 'level', target: 10, description: 'Mencapai Level 10' }], benefits: ['Pajak harian +15%', 'Pertahanan kota meningkat'], icon: 'shield-outline' },
];

export const BADGE_GALLERY = [
  { title: 'Pionir Batu', unlocked: true },
  { title: 'Ksatria Besi', unlocked: false },
  { title: 'Insinyur Uap', unlocked: false },
  { title: 'Warga Modern', unlocked: false },
  { title: 'Avatar Digital', unlocked: false },
];

const INITIAL_STATS: UserStats = {
  hp: 100,
  maxHp: 100,
  gold: 120,
  silver: 620,
  exp: 120,
  level: 1,
  maxExp: 1000,
  momentum: 52,
  lastCelebratedLevel: 1,
  lastEndDay: null,
  dayCount: 4,
  badges: [],
  pendingReport: null,
  skipTickets: 0,
  unlockedEras: ['Stone Age'],
};

const INITIAL_CITY: CityState = {
  population: 28,
  populationSick: 2,
  food: 60,
  housing: 40,
  health: 92,
  happiness: 88,
  buildings: [
    { id: 'b1', buildingTypeId: 'house', gridX: 1, gridY: 1, level: 1, health: 100, createdAt: new Date().toISOString() },
    { id: 'b2', buildingTypeId: 'farm', gridX: 2, gridY: 1, level: 1, health: 100, createdAt: new Date().toISOString() },
  ],
  currentEra: 'Stone Age',
  unlockedEvolutions: [],
};

const INITIAL_HABITS: Habit[] = [
  { id: 'h1', title: 'Morning walk', type: 'daily', completedDates: [], createdAt: new Date().toISOString(), targetCount: 1, goldReward: 10, expReward: 50, difficulty: 1, currentStreak: 2 },
  { id: 'h2', title: 'Read 20 pages', type: 'daily', completedDates: [], createdAt: new Date().toISOString(), targetCount: 1, goldReward: 10, expReward: 50, difficulty: 1, currentStreak: 4 },
  { id: 'h3', title: 'Plan week', type: 'weekly', completedDates: [], createdAt: new Date().toISOString(), targetCount: 3, goldReward: 50, expReward: 250, difficulty: 2, currentStreak: 1 },
];

const INITIAL_LOGS: ActivityLog[] = [
  { id: 'l1', timestamp: new Date().toISOString(), type: 'system', message: 'Peradaban memasuki Stone Age', change: 0, unit: 'system' },
];

const uid = () => Math.random().toString(36).slice(2, 10);

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function getEraForLevel(level: number): Era {
  const era = [...ERAS_CONFIG].reverse().find((item) => level >= item.minLevel);
  return era?.id ?? 'Stone Age';
}

function getBuildingType(buildingTypeId: string) {
  return BUILDING_TYPES.find((item) => item.id === buildingTypeId);
}

function calculateSummary(city: CityState) {
  return city.buildings.reduce(
    (summary, building) => {
      const config = getBuildingType(building.buildingTypeId);
      if (!config) return summary;
      summary.totalHousing += config.housing;
      summary.totalFoodProduction += config.foodProduction;
      summary.totalSilverIncome += config.silverIncome;
      summary.healthBonus += config.healthBonus;
      summary.happinessBonus += config.happinessBonus;
      return summary;
    },
    { totalHousing: city.housing, totalFoodProduction: city.food, totalSilverIncome: 0, healthBonus: 0, happinessBonus: 0 },
  );
}

type CivfitContextValue = ReturnType<typeof useCreateCivfitState>;
const CivfitContext = createContext<CivfitContextValue | null>(null);

function useCreateCivfitState() {
  const [stats, setStats] = useState(INITIAL_STATS);
  const [city, setCity] = useState(INITIAL_CITY);
  const [habits, setHabits] = useState(INITIAL_HABITS);
  const [logs, setLogs] = useState<ActivityLog[]>(INITIAL_LOGS);
  const [showLogin, setShowLogin] = useState(false);

  const addLog = (type: ActivityLog['type'], message: string, change: number, unit: ActivityLog['unit']) => {
    setLogs((current) => [{ id: uid(), timestamp: new Date().toISOString(), type, message, change, unit }, ...current].slice(0, 50));
  };

  const commitLevelUp = (nextStats: UserStats) => {
    const levels = nextStats.exp >= nextStats.maxExp ? Math.floor(nextStats.exp / nextStats.maxExp) : 0;
    if (levels <= 0) return nextStats;

    const level = nextStats.level + levels;
    const exp = nextStats.exp % nextStats.maxExp;
    const momentum = Math.min(100, nextStats.momentum + levels * 8);
    addLog('system', `Level up! Kini level ${level}`, levels, 'exp');

    return {
      ...nextStats,
      level,
      exp,
      momentum,
      hp: Math.min(nextStats.maxHp, nextStats.hp + levels * 4),
      gold: nextStats.gold + levels * 20,
      lastCelebratedLevel: level,
      unlockedEras: Array.from(new Set([...nextStats.unlockedEras, getEraForLevel(level)])),
    };
  };

  const syncEra = (nextStats: UserStats, nextCity: CityState) => {
    const nextEra = getEraForLevel(nextStats.level);
    if (nextEra !== nextCity.currentEra) {
      setCity((prev) => ({ ...prev, currentEra: nextEra }));
      addLog('system', `Peradaban memasuki: ${nextEra}`, 0, 'system');
    }
  };

  const addHabit = (title: string, type: HabitType) => {
    const goldReward = type === 'daily' ? 10 : type === 'weekly' ? 50 : 200;
    const expReward = type === 'daily' ? 50 : type === 'weekly' ? 250 : 1000;
    setHabits((current) => [...current, { id: uid(), title, type, completedDates: [], createdAt: new Date().toISOString(), targetCount: type === 'daily' ? 1 : type === 'weekly' ? 3 : 10, goldReward, expReward, difficulty: type === 'daily' ? 1 : type === 'weekly' ? 2 : 3, currentStreak: 0 }]);
    addLog('habit', `Habit baru dibuat: ${title}`, goldReward, 'gold');
  };

  const updateHabit = (id: string, updates: Partial<Habit>) => {
    setHabits((current) => current.map((habit) => (habit.id === id ? { ...habit, ...updates } : habit)));
  };

  const deleteHabit = (id: string) => {
    setHabits((current) => current.filter((habit) => habit.id !== id));
  };

  const completeHabit = (id: string) => {
    const today = getToday();
    const habit = habits.find((item) => item.id === id);
    if (!habit || habit.completedDates.includes(today)) return;

    const nextHabit: Habit = { ...habit, completedDates: [...habit.completedDates, today], currentStreak: habit.currentStreak + 1 };
    setHabits((current) => current.map((item) => (item.id === id ? nextHabit : item)));

    setStats((current) => {
      const next = {
        ...current,
        gold: current.gold + habit.goldReward,
        exp: current.exp + habit.expReward,
        hp: Math.min(current.maxHp, current.hp + 2),
        momentum: Math.min(100, current.momentum + 4),
      };
      return commitLevelUp(next);
    });

    addLog('habit', `Habit selesai: ${habit.title}`, habit.expReward, 'exp');
  };

  const endDay = () => {
    const today = getToday();
    const completed = habits.filter((habit) => habit.completedDates.includes(today)).length;
    const total = habits.length;
    const momentumBonus = Math.max(-5, Math.min(20, completed * 4 - 3));
    const report: DailyReport = {
      date: new Date().toISOString(),
      habitsCompleted: completed,
      habitsTotal: total,
      goldGained: completed * 10 + 20,
      expGained: completed * 50 + 60,
      hpChange: completed >= 2 ? 6 : 2,
      cityHealthChange: 1,
      cityHappinessChange: 1,
      silverTax: 120 + completed * 30,
      populationGrowth: 2 + completed,
      momentumBonus,
      message: completed >= total ? 'Perfect day. Civilization is snowballing.' : 'Progress continues. Keep the momentum alive.',
    };

    setStats((current) => {
      const next = {
        ...current,
        gold: current.gold + report.goldGained,
        exp: current.exp + report.expGained,
        hp: Math.min(current.maxHp, current.hp + report.hpChange),
        momentum: Math.max(0, Math.min(100, current.momentum + report.momentumBonus)),
        dayCount: current.dayCount + 1,
        pendingReport: report,
        lastEndDay: report.date,
      };
      return commitLevelUp(next);
    });

    setCity((current) => ({
      ...current,
      population: current.population + report.populationGrowth,
      health: Math.max(0, Math.min(100, current.health + report.cityHealthChange)),
      happiness: Math.max(0, Math.min(100, current.happiness + report.cityHappinessChange)),
    }));

    addLog('system', `Daily report: +${report.expGained} EXP`, report.expGained, 'exp');
    return report;
  };

  const closeReport = () => {
    setStats((current) => ({ ...current, pendingReport: null }));
  };

  const deployBuilding = (buildingTypeId: string, silverCost: number, x: number, y: number) => {
    const buildingType = getBuildingType(buildingTypeId);
    if (!buildingType || stats.silver < silverCost) return;

    const placed: PlacedBuilding = {
      id: uid(),
      buildingTypeId,
      gridX: x,
      gridY: y,
      level: 1,
      health: 100,
      createdAt: new Date().toISOString(),
    };

    setCity((current) => {
      const next = {
        ...current,
        buildings: [...current.buildings, placed],
        housing: current.housing + buildingType.housing,
        food: current.food + buildingType.foodProduction,
        health: Math.max(0, Math.min(100, current.health + buildingType.healthBonus)),
        happiness: Math.max(0, Math.min(100, current.happiness + buildingType.happinessBonus)),
      };
      syncEra(stats, next);
      return next;
    });

    setStats((current) => ({ ...current, silver: current.silver - silverCost }));
    addLog('city', `Bangun ${buildingType.name}`, -silverCost, 'silver');
  };

  const upgradeBuilding = (buildingId: string, silverCost: number) => {
    if (stats.silver < silverCost) return;
    setCity((current) => ({
      ...current,
      buildings: current.buildings.map((building) => (building.id === buildingId ? { ...building, level: building.level + 1, health: Math.min(100, building.health + 10) } : building)),
    }));
    setStats((current) => ({ ...current, silver: current.silver - silverCost }));
    addLog('city', 'Bangunan ditingkatkan', -silverCost, 'silver');
  };

  const removeBuilding = (buildingId: string) => {
    setCity((current) => {
      const building = current.buildings.find((item) => item.id === buildingId);
      if (!building) return current;
      const config = getBuildingType(building.buildingTypeId);
      if (!config) return current;

      return {
        ...current,
        buildings: current.buildings.filter((item) => item.id !== buildingId),
        housing: current.housing - config.housing,
        food: current.food - config.foodProduction,
        health: Math.max(0, current.health - config.healthBonus),
        happiness: Math.max(0, current.happiness - config.happinessBonus),
      };
    });
    addLog('city', 'Bangunan dihapus', 0, 'system');
  };

  const unlockEvolution = async (branchId: string) => {
    const branch = EVOLUTION_BRANCHES.find((item) => item.id === branchId);
    if (!branch || city.unlockedEvolutions.includes(branchId)) return false;

    const hasRequirements = branch.requirements.every((requirement) => {
      if (requirement.type === 'level') return stats.level >= Number(requirement.target);
      if (requirement.type === 'buildings') return city.buildings.filter((item) => item.buildingTypeId === requirement.target).length >= 2;
      return false;
    });

    if (!hasRequirements) return false;

    setCity((current) => ({ ...current, unlockedEvolutions: [...current.unlockedEvolutions, branchId] }));
    addLog('system', `Evolution unlock: ${branch.name}`, 0, 'system');
    return true;
  };

  const purchase = (type: 'hp' | 'silver' | 'gold' | 'skipTicket', amount: number, cost: number) => {
    if (type === 'hp') {
      if (stats.gold < cost) return;
      setStats((current) => ({ ...current, gold: current.gold - cost, hp: Math.min(current.maxHp, current.hp + amount) }));
      addLog('economy', 'Bought recovery item', amount, 'hp');
      return;
    }

    if (type === 'skipTicket') {
      if (stats.gold < cost) return;
      setStats((current) => ({ ...current, gold: current.gold - cost, skipTickets: current.skipTickets + 1 }));
      addLog('economy', 'Bought Skip Ticket', 1, 'system');
      return;
    }

    if (type === 'silver') {
      if (stats.gold < cost) return;
      setStats((current) => ({ ...current, gold: current.gold - cost, silver: current.silver + amount }));
      addLog('economy', 'Exchanged gold for silver', amount, 'silver');
      return;
    }

    if (stats.silver < cost) return;
    setStats((current) => ({ ...current, silver: current.silver - cost, gold: current.gold + amount }));
    addLog('economy', 'Exchanged silver for gold', amount, 'gold');
  };

  const gacha = () => {
    if (stats.gold < 100) return null;
    const rand = Math.random();
    const reward = rand > 0.95 ? { type: 'gold', amount: 500, message: 'JACKPOT! Dewa memberkatimu.' } : rand > 0.7 ? { type: 'silver', amount: 1000, message: 'Kekayaan kota meningkat.' } : rand > 0.4 ? { type: 'exp', amount: 200, message: 'Hikmat dan ilmu pengetahuan.' } : { type: 'hp', amount: 20, message: 'Berkat kesehatan.' };

    setStats((current) => {
      const next = { ...current, gold: current.gold - 100 };
      if (reward.type === 'gold') next.gold += reward.amount;
      if (reward.type === 'silver') next.silver += reward.amount;
      if (reward.type === 'exp') next.exp += reward.amount;
      if (reward.type === 'hp') next.hp = Math.min(next.maxHp, next.hp + reward.amount);
      return commitLevelUp(next);
    });

    addLog('economy', `Gacha: ${reward.message}`, reward.amount, reward.type === 'exp' ? 'exp' : reward.type === 'hp' ? 'hp' : reward.type === 'silver' ? 'silver' : 'gold');
    return reward;
  };

  const summary = useMemo(() => calculateSummary(city), [city]);

  return {
    stats,
    setStats,
    city,
    setCity,
    habits,
    logs,
    summary,
    showLogin,
    setShowLogin,
    addHabit,
    updateHabit,
    deleteHabit,
    completeHabit,
    endDay,
    closeReport,
    deployBuilding,
    upgradeBuilding,
    removeBuilding,
    unlockEvolution,
    purchase,
    gacha,
    addLog,
  };
}

export function CivfitProvider({ children }: PropsWithChildren) {
  const value = useCreateCivfitState();
  return <CivfitContext.Provider value={value}>{children}</CivfitContext.Provider>;
}

export function useCivfitStore() {
  const value = useContext(CivfitContext);
  if (!value) {
    throw new Error('useCivfitStore must be used within CivfitProvider');
  }
  return value;
}
