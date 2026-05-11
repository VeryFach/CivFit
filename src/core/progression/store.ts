import { create } from 'zustand';
import { UserStats, Habit, CityState, ActivityLog, Era, HabitType, PlacedBuilding } from '../types';
import { EXP_PER_LEVEL, DEFAULT_HP, BUILDINGS, DISASTERS, ERA_MILESTONES } from '../constants';
import { calculateCitySummary } from '../simulation/cityUtils';
import { processEndDay, DayReport } from './engine';
import { auth, db } from '../../platform/api/firebase';
import { 
  doc, 
  onSnapshot, 
  collection, 
  query, 
  orderBy, 
  limit, 
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { handleFirestoreError, OperationType } from '../../platform/api/firestoreUtils';
import { checkStorageVersion } from '../../platform/storage/hydration';
import { sqlite } from '../../platform/storage/sqlite/db';
import { CityRepository } from '../../platform/storage/sqlite/repositories/cityRepository';
import { habitRepository } from '../../platform/storage/sqlite/repositories/habitRepository';
import { statsRepository } from '../../platform/storage/sqlite/repositories/statsRepository';
import { logRepository } from '../../platform/storage/sqlite/repositories/logRepository';
import { syncEngine } from '../sync/syncEngine';

interface CivState {
  currentUser: User | null;
  loading: boolean;
  stats: UserStats;
  habits: Habit[];
  city: CityState;
  logs: ActivityLog[];
  
  // Actions
  initialize: () => Promise<void>;
  setStats: (stats: UserStats | ((prev: UserStats) => UserStats)) => void;
  setCity: (city: CityState | ((prev: CityState) => CityState)) => void;
  addHabit: (title: string, type: HabitType) => Promise<void>;
  completeHabit: (id: string) => Promise<void>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  endDay: () => Promise<DayReport | undefined>;
  deployBuilding: (buildingTypeId: string, silverCost: number, x: number, y: number) => Promise<boolean>;
  upgradeBuilding: (id: string, silverCost: number) => Promise<boolean>;
  removeBuilding: (id: string) => Promise<void>;
  unlockEvolution: (branchId: string) => Promise<boolean>;
  addLog: (type: ActivityLog['type'], message: string, change: number, unit: ActivityLog['unit']) => Promise<void>;
}

const INITIAL_STATS: UserStats = {
  hp: DEFAULT_HP,
  maxHp: DEFAULT_HP,
  gold: 100,
  silver: 500,
  exp: 0,
  level: 1,
  maxExp: EXP_PER_LEVEL,
  momentum: 50,
  lastCelebratedLevel: 1,
  lastEndDay: null,
  dayCount: 1,
  badges: [],
  pendingReport: null,
  skipTickets: 0,
  unlockedEras: [Era.STONE_AGE]
};

const INITIAL_CITY: CityState = {
  population: 0,
  populationSick: 0,
  food: 0,
  housing: 0,
  health: 100,
  happiness: 100,
  buildings: [],
  currentEra: Era.STONE_AGE,
  unlockedEvolutions: []
};

export const useCivStore = create<CivState>((set, get) => ({
  currentUser: null,
  loading: true,
  stats: INITIAL_STATS,
  habits: [],
  city: INITIAL_CITY,
  logs: [],

  initialize: async () => {
    // 1. Hydration
    await checkStorageVersion();
    await sqlite.init();
    
    // 2. Load Local Data Immediately (Production-Grade Offline First)
    const [localCity, localStats, localHabits, localLogs] = await Promise.all([
      CityRepository.getCity(),
      statsRepository.get(),
      habitRepository.getAll(),
      logRepository.getRecent(50)
    ]);

    set({
      city: localCity || INITIAL_CITY,
      stats: localStats || INITIAL_STATS,
      habits: localHabits,
      logs: localLogs,
      loading: false
    });

    // 3. Setup Auth & Cloud Sync
    onAuthStateChanged(auth, async (user) => {
      set({ currentUser: user });
      
      if (user) {
        syncEngine.processQueue();

        // Listen for Main Stats & City Updates
        const userDocRef = doc(db, 'users', user.uid);
        onSnapshot(userDocRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            const cloudStats = data.stats || INITIAL_STATS;
            const cloudCity = data.city || INITIAL_CITY;
            
            set({ stats: cloudStats, city: cloudCity });
            
            // Persist cloud data to local
            statsRepository.save(cloudStats);
            CityRepository.saveCity(cloudCity);
          }
        }, (error) => handleFirestoreError(error, OperationType.GET, `users/${user.uid}`));

        // Listen for Habits
        const habitsRef = collection(db, 'users', user.uid, 'habits');
        onSnapshot(query(habitsRef), (snapshot) => {
          const habitsList = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Habit));
          set({ habits: habitsList });
          
          // Persist all habits locally
          habitsList.forEach(h => habitRepository.save(h));
        }, (error) => handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/habits`));

        // Listen for Logs
        const logsRef = collection(db, 'users', user.uid, 'logs');
        onSnapshot(query(logsRef, orderBy('timestamp', 'desc'), limit(50)), (snapshot) => {
          const logsList = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as ActivityLog));
          set({ logs: logsList });
          
          // Persist logs locally
          logsList.forEach(l => logRepository.add(l));
        }, (error) => handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/logs`));
      }
    });
  },

  setStats: (updater) => {
    const { stats, currentUser } = get();
    const newStats = typeof updater === 'function' ? updater(stats) : updater;
    
    set({ stats: newStats });
    statsRepository.save(newStats); // Save Locally

    if (currentUser) {
      syncEngine.queueAction('UPDATE_PROFILE', { stats: newStats });
    }
  },

  setCity: (updater) => {
    const { city, currentUser } = get();
    const newCity = typeof updater === 'function' ? updater(city) : updater;
    
    set({ city: newCity });
    CityRepository.saveCity(newCity); // Save Locally

    if (currentUser) {
      syncEngine.queueAction('UPDATE_PROFILE', { city: newCity });
    }
  },

  addLog: async (type, message, change, unit) => {
    const { currentUser } = get();
    const logId = Math.random().toString(36).substring(2, 11);
    const newLog: ActivityLog = {
      id: logId,
      timestamp: new Date().toISOString(),
      type,
      message,
      change,
      unit
    };

    set(state => ({
      logs: [newLog, ...state.logs].slice(0, 50)
    }));
    
    logRepository.add(newLog); // Save Locally

    if (currentUser) {
      syncEngine.queueAction('LOG_ADD', newLog);
    }
  },

  addHabit: async (title, type) => {
    const { currentUser } = get();
    const habitId = Math.random().toString(36).substring(2, 11);
    
    const newHabit: Habit = {
      id: habitId,
      title,
      type,
      completedDates: [],
      createdAt: new Date().toISOString(),
      targetCount: type === 'daily' ? 1 : type === 'weekly' ? 3 : 10,
      goldReward: type === 'daily' ? 10 : type === 'weekly' ? 50 : 200,
      expReward: type === 'daily' ? 50 : type === 'weekly' ? 250 : 1000,
      difficulty: 1,
      currentStreak: 0
    };

    set(state => ({ habits: [...state.habits, newHabit] }));
    habitRepository.save(newHabit); // Save Locally

    if (currentUser) {
      syncEngine.queueAction('HABIT_SET', newHabit);
    }
  },

  completeHabit: async (id) => {
    const { stats, habits, currentUser, addLog } = get();
    const today = new Date().toISOString().split('T')[0];
    const h = habits.find(habit => habit.id === id);
    if (!h || h.completedDates.includes(today)) return;

    const momentumMult = 1 + (stats.momentum / 100) * 0.5;
    const finalMultiplier = (h.completedDates.length >= h.targetCount ? 0.5 : 1) * momentumMult;

    let newExp = stats.exp + Math.floor(h.expReward * finalMultiplier);
    let newLevel = stats.level;
    let newMaxExp = stats.maxExp;
    
    if (newExp >= newMaxExp) {
      newExp -= newMaxExp;
      newLevel += 1;
      newMaxExp = Math.floor(newMaxExp * 1.2); 
    }

    const updatedStats = {
      ...stats,
      gold: stats.gold + Math.floor(h.goldReward * finalMultiplier),
      exp: newExp,
      level: newLevel,
      maxExp: newMaxExp,
      momentum: Math.min(100, stats.momentum + 2)
    };

    const updatedHabit = {
      ...h,
      completedDates: [...h.completedDates, today],
      currentStreak: h.currentStreak + 1,
    };

    // Update Local State & DB
    set({ stats: updatedStats, habits: habits.map(hab => hab.id === id ? updatedHabit : hab) });
    statsRepository.save(updatedStats);
    habitRepository.save(updatedHabit);

    if (currentUser) {
      syncEngine.queueAction('UPDATE_PROFILE', { stats: updatedStats });
      syncEngine.queueAction('HABIT_SET', updatedHabit);
      
      if (updatedStats.level !== stats.level) {
        syncEngine.queueAction('LEADERBOARD_UPDATE', { 
          level: updatedStats.level,
          userId: currentUser.uid,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL
        });
      }
    }
    
    addLog('habit', `Completed: ${h.title}`, h.goldReward, 'gold');
  },

  updateHabit: async (id, updates) => {
    const { currentUser, habits } = get();
    const updatedHabits = habits.map(h => h.id === id ? { ...h, ...updates } : h);
    const updatedHabit = updatedHabits.find(h => h.id === id);
    
    set({ habits: updatedHabits });
    if (updatedHabit) habitRepository.save(updatedHabit);

    if (currentUser && updatedHabit) {
      syncEngine.queueAction('HABIT_SET', updatedHabit);
    }
  },

  deleteHabit: async (id) => {
    const { currentUser, habits } = get();
    set({ habits: habits.filter(h => h.id !== id) });
    habitRepository.delete(id);

    if (currentUser) {
      syncEngine.queueAction('HABIT_DELETE', { habitId: id });
    }
  },

  endDay: async () => {
    const { stats, city, habits, currentUser, addLog, addHabit } = get();
    const today = new Date().toISOString().split('T')[0];
    
    const { updatedStats, updatedCity, report, resetHabitIds } = processEndDay(stats, city, habits, today);

    if (report.event) {
       addHabit(`Mitigasi: ${report.event.name}`, 'daily');
    }

    const updatedHabits = habits.map(h => resetHabitIds.includes(h.id) ? { ...h, currentStreak: 0 } : h);

    // Local Save
    set({ stats: updatedStats, city: updatedCity, habits: updatedHabits });
    statsRepository.save(updatedStats);
    CityRepository.saveCity(updatedCity);
    updatedHabits.forEach(h => habitRepository.save(h));

    if (currentUser) {
      syncEngine.queueAction('UPDATE_PROFILE', { stats: updatedStats, city: updatedCity });
      syncEngine.queueAction('LEADERBOARD_UPDATE', {
        level: updatedStats.level,
        population: updatedCity.population,
        currentEra: updatedCity.currentEra
      });
      resetHabitIds.forEach(id => {
        const h = updatedHabits.find(hab => hab.id === id);
        if (h) syncEngine.queueAction('HABIT_SET', h);
      });
    }

    return report;
  },

  deployBuilding: async (buildingTypeId, silverCost, x, y) => {
    const { stats, city, currentUser, addLog } = get();
    if (stats.silver < silverCost) return false;

    const newBuilding: PlacedBuilding = {
      id: Math.random().toString(36).substring(2, 11),
      buildingTypeId,
      gridX: x,
      gridY: y,
      level: 1,
      health: 100,
      createdAt: new Date().toISOString()
    };
    
    const newCity = { ...city, buildings: [...(city.buildings || []), newBuilding] };
    const newStats = { ...stats, silver: stats.silver - silverCost };

    set({ stats: newStats, city: newCity });
    statsRepository.save(newStats);
    CityRepository.saveCity(newCity);

    if (currentUser) {
      syncEngine.queueAction('UPDATE_PROFILE', { stats: newStats, city: newCity });
      syncEngine.queueAction('LEADERBOARD_UPDATE', { population: newCity.population });
    }

    addLog('city', `Constructed ${buildingTypeId}`, -silverCost, 'silver');
    return true;
  },

  upgradeBuilding: async (id, silverCost) => {
    const { stats, city, currentUser, addLog } = get();
    if (stats.silver < silverCost) return false;

    const newCity = {
      ...city,
      buildings: (city.buildings || []).map(b => b.id === id ? { ...b, level: b.level + 1 } : b)
    };
    const newStats = { ...stats, silver: stats.silver - silverCost };

    set({ stats: newStats, city: newCity });
    statsRepository.save(newStats);
    CityRepository.saveCity(newCity);

    if (currentUser) {
      syncEngine.queueAction('UPDATE_PROFILE', { stats: newStats, city: newCity });
    }

    addLog('city', `Upgraded building`, -silverCost, 'silver');
    return true;
  },

  removeBuilding: async (id) => {
    const { city, currentUser, addLog } = get();
    const newCity = { ...city, buildings: (city.buildings || []).filter(b => b.id !== id) };

    set({ city: newCity });
    CityRepository.saveCity(newCity);

    if (currentUser) {
      syncEngine.queueAction('UPDATE_PROFILE', { city: newCity });
    }
    
    addLog('city', `Removed building`, 0, 'silver');
  },

  unlockEvolution: async (branchId) => {
    const { city, currentUser } = get();
    if (city.unlockedEvolutions?.includes(branchId)) return false;
    
    const newCity = {
      ...city,
      unlockedEvolutions: [...(city.unlockedEvolutions || []), branchId]
    };
    
    set({ city: newCity });
    CityRepository.saveCity(newCity);

    if (currentUser) {
      syncEngine.queueAction('UPDATE_PROFILE', { city: newCity });
    }

    get().addLog('system', `Evolution unlocked: ${branchId}`, 0, 'exp');
    return true;
  }
}));

