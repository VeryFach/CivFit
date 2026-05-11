import { DEFAULT_HP, EXP_PER_LEVEL } from '@/core/constants';
import { DayReport, processEndDay } from '@/core/progression/engine';
import { ActivityLog, CityState, Era, Habit, HabitType, PlacedBuilding, UserStats } from '@/core/types';
import { checkStorageVersion } from '@/platform/storage/hydration';

// Delay-load platform-specific modules
let platformModules: any = null;

const getPlatformModules = async () => {
    if (platformModules) return platformModules;

    try {
        const syncMod = await import('@/core/sync/syncEngine');
        const dbMod = await import('@/platform/storage/sqlite/db');
        const cityRepo = await import('@/platform/storage/sqlite/repositories/cityRepository');
        const habitRepo = await import('@/platform/storage/sqlite/repositories/habitRepository');
        const logRepo = await import('@/platform/storage/sqlite/repositories/logRepository');
        const statsRepo = await import('@/platform/storage/sqlite/repositories/statsRepository');

        platformModules = {
            syncEngine: syncMod.syncEngine,
            sqlite: dbMod.sqlite,
            CityRepository: cityRepo.CityRepository,
            habitRepository: habitRepo.habitRepository,
            logRepository: logRepo.logRepository,
            statsRepository: statsRepo.statsRepository,
        };
    } catch {
        // Web platform - use empty/mock modules
        platformModules = {
            syncEngine: null,
            sqlite: null,
            CityRepository: null,
            habitRepository: null,
            logRepository: null,
            statsRepository: null,
        };
    }

    return platformModules;
};

import { auth, db } from '@/services/firebase';
import { handleFirestoreError, OperationType } from '@/services/firebase/firestoreUtils';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
    collection,
    doc,
    limit,
    onSnapshot,
    orderBy,
    query
} from 'firebase/firestore';
import { create } from 'zustand';

interface CivState {
    currentUser: User | null;
    loading: boolean;
    stats: UserStats;
    habits: Habit[];
    city: CityState;
    logs: ActivityLog[];
    platformModules: any | null;

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
    platformModules: null,

    initialize: async () => {
        try {
            // 0. Load Platform Modules (lazy)
            const mods = await getPlatformModules();
            set({ platformModules: mods });

            // 1. Hydration
            await checkStorageVersion();
            if (mods.sqlite) {
                await mods.sqlite.init();
            }

            // 2. Load Local Data Immediately (Production-Grade Offline First)
            let [localCity, localStats, localHabits, localLogs] = [null, null, [], []];
            if (mods.CityRepository && mods.statsRepository && mods.habitRepository && mods.logRepository) {
                [localCity, localStats, localHabits, localLogs] = await Promise.all([
                    mods.CityRepository.getCity(),
                    mods.statsRepository.get(),
                    mods.habitRepository.getAll(),
                    mods.logRepository.getRecent(50)
                ]);
            }

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
                    const currentMods = get().platformModules;
                    if (currentMods && currentMods.syncEngine) {
                        currentMods.syncEngine.processQueue();
                    }

                    // Listen for Main Stats & City Updates
                    const userDocRef = doc(db, 'users', user.uid);
                    onSnapshot(userDocRef, (snapshot) => {
                        if (snapshot.exists()) {
                            const data = snapshot.data();
                            const cloudStats = data.stats || INITIAL_STATS;
                            const cloudCity = data.city || INITIAL_CITY;

                            set({ stats: cloudStats, city: cloudCity });

                            // Persist cloud data to local
                            if (currentMods?.statsRepository) currentMods.statsRepository.save(cloudStats);
                            if (currentMods?.CityRepository) currentMods.CityRepository.saveCity(cloudCity);
                        }
                    }, (error) => handleFirestoreError(error, OperationType.GET, `users/${user.uid}`));

                    // Listen for Habits
                    const habitsRef = collection(db, 'users', user.uid, 'habits');
                    onSnapshot(query(habitsRef), (snapshot) => {
                        const habitsList = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Habit));
                        set({ habits: habitsList });

                        // Persist all habits locally
                        if (currentMods?.habitRepository) {
                            habitsList.forEach(h => currentMods.habitRepository.save(h));
                        }
                    }, (error) => handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/habits`));

                    // Listen for Logs
                    const logsRef = collection(db, 'users', user.uid, 'logs');
                    onSnapshot(query(logsRef, orderBy('timestamp', 'desc'), limit(50)), (snapshot) => {
                        const logsList = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as ActivityLog));
                        set({ logs: logsList });

                        // Persist logs locally
                        if (currentMods?.logRepository) {
                            logsList.forEach(l => currentMods.logRepository.add(l));
                        }
                    }, (error) => handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/logs`));
                }
            });
        } catch (error) {
            console.error('[Store] Initialize error:', error);
            set({ loading: false });
        }
    },

    setStats: (updater) => {
        const { stats, currentUser, platformModules } = get();
        const newStats = typeof updater === 'function' ? updater(stats) : updater;

        set({ stats: newStats });
        if (platformModules?.statsRepository) {
            platformModules.statsRepository.save(newStats); // Save Locally
        }

        if (currentUser && platformModules?.syncEngine) {
            platformModules.syncEngine.queueAction('UPDATE_PROFILE', { stats: newStats });
        }
    },

    setCity: (updater) => {
        const { city, currentUser, platformModules } = get();
        const newCity = typeof updater === 'function' ? updater(city) : updater;

        set({ city: newCity });
        if (platformModules?.CityRepository) {
            platformModules.CityRepository.saveCity(newCity); // Save Locally
        }

        if (currentUser && platformModules?.syncEngine) {
            platformModules.syncEngine.queueAction('UPDATE_PROFILE', { city: newCity });
        }
    },

    addLog: async (type, message, change, unit) => {
        const { currentUser, platformModules } = get();
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

        if (platformModules?.logRepository) {
            platformModules.logRepository.add(newLog); // Save Locally
        }

        if (currentUser && platformModules?.syncEngine) {
            platformModules.syncEngine.queueAction('LOG_ADD', newLog);
        }
    },

    addHabit: async (title, type) => {
        const { currentUser, platformModules } = get();
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
        if (platformModules?.habitRepository) {
            platformModules.habitRepository.save(newHabit); // Save Locally
        }

        if (currentUser && platformModules?.syncEngine) {
            platformModules.syncEngine.queueAction('HABIT_SET', newHabit);
        }
    },

    completeHabit: async (id) => {
        const { stats, habits, currentUser, platformModules, addLog } = get();
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
        if (platformModules?.statsRepository) {
            platformModules.statsRepository.save(updatedStats);
        }
        if (platformModules?.habitRepository) {
            platformModules.habitRepository.save(updatedHabit);
        }

        if (currentUser && platformModules?.syncEngine) {
            platformModules.syncEngine.queueAction('UPDATE_PROFILE', { stats: updatedStats });
            platformModules.syncEngine.queueAction('HABIT_SET', updatedHabit);

            if (updatedStats.level !== stats.level) {
                platformModules.syncEngine.queueAction('LEADERBOARD_UPDATE', {
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
        const { currentUser, habits, platformModules } = get();
        const updatedHabits = habits.map(h => h.id === id ? { ...h, ...updates } : h);
        const updatedHabit = updatedHabits.find(h => h.id === id);

        set({ habits: updatedHabits });
        if (updatedHabit && platformModules?.habitRepository) {
            platformModules.habitRepository.save(updatedHabit);
        }

        if (currentUser && updatedHabit && platformModules?.syncEngine) {
            platformModules.syncEngine.queueAction('HABIT_SET', updatedHabit);
        }
    },

    deleteHabit: async (id) => {
        const { currentUser, habits, platformModules } = get();
        set({ habits: habits.filter(h => h.id !== id) });
        if (platformModules?.habitRepository) {
            platformModules.habitRepository.delete(id);
        }

        if (currentUser && platformModules?.syncEngine) {
            platformModules.syncEngine.queueAction('HABIT_DELETE', { habitId: id });
        }
    },

    endDay: async () => {
        const { stats, city, habits, currentUser, platformModules, addLog, addHabit } = get();
        const today = new Date().toISOString().split('T')[0];

        const { updatedStats, updatedCity, report, resetHabitIds } = processEndDay(stats, city, habits, today);

        if (report.event) {
            addHabit(`Mitigasi: ${report.event.name}`, 'daily');
        }

        const updatedHabits = habits.map(h => resetHabitIds.includes(h.id) ? { ...h, currentStreak: 0 } : h);

        // Local Save
        set({ stats: updatedStats, city: updatedCity, habits: updatedHabits });
        if (platformModules?.statsRepository) {
            platformModules.statsRepository.save(updatedStats);
        }
        if (platformModules?.CityRepository) {
            platformModules.CityRepository.saveCity(updatedCity);
        }
        if (platformModules?.habitRepository) {
            updatedHabits.forEach(h => platformModules.habitRepository.save(h));
        }

        if (currentUser && platformModules?.syncEngine) {
            platformModules.syncEngine.queueAction('UPDATE_PROFILE', { stats: updatedStats, city: updatedCity });
            platformModules.syncEngine.queueAction('LEADERBOARD_UPDATE', {
                level: updatedStats.level,
                population: updatedCity.population,
                currentEra: updatedCity.currentEra
            });
            resetHabitIds.forEach(id => {
                const h = updatedHabits.find(hab => hab.id === id);
                if (h) platformModules.syncEngine.queueAction('HABIT_SET', h);
            });
        }

        return report;
    },

    deployBuilding: async (buildingTypeId, silverCost, x, y) => {
        const { stats, city, currentUser, platformModules, addLog } = get();
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
        if (platformModules?.statsRepository) {
            platformModules.statsRepository.save(newStats);
        }
        if (platformModules?.CityRepository) {
            platformModules.CityRepository.saveCity(newCity);
        }

        if (currentUser && platformModules?.syncEngine) {
            platformModules.syncEngine.queueAction('UPDATE_PROFILE', { stats: newStats, city: newCity });
            platformModules.syncEngine.queueAction('LEADERBOARD_UPDATE', { population: newCity.population });
        }

        addLog('city', `Constructed ${buildingTypeId}`, -silverCost, 'silver');
        return true;
    },

    upgradeBuilding: async (id, silverCost) => {
        const { stats, city, currentUser, platformModules, addLog } = get();
        if (stats.silver < silverCost) return false;

        const newCity = {
            ...city,
            buildings: (city.buildings || []).map(b => b.id === id ? { ...b, level: b.level + 1 } : b)
        };
        const newStats = { ...stats, silver: stats.silver - silverCost };

        set({ stats: newStats, city: newCity });
        if (platformModules?.statsRepository) {
            platformModules.statsRepository.save(newStats);
        }
        if (platformModules?.CityRepository) {
            platformModules.CityRepository.saveCity(newCity);
        }

        if (currentUser && platformModules?.syncEngine) {
            platformModules.syncEngine.queueAction('UPDATE_PROFILE', { stats: newStats, city: newCity });
        }

        addLog('city', `Upgraded building`, -silverCost, 'silver');
        return true;
    },

    removeBuilding: async (id) => {
        const { city, currentUser, platformModules, addLog } = get();
        const newCity = { ...city, buildings: (city.buildings || []).filter(b => b.id !== id) };

        set({ city: newCity });
        if (platformModules?.CityRepository) {
            platformModules.CityRepository.saveCity(newCity);
        }

        if (currentUser && platformModules?.syncEngine) {
            platformModules.syncEngine.queueAction('UPDATE_PROFILE', { city: newCity });
        }

        addLog('city', `Removed building`, 0, 'silver');
    },

    unlockEvolution: async (branchId) => {
        const { city, currentUser, platformModules } = get();
        if (city.unlockedEvolutions?.includes(branchId)) return false;

        const newCity = {
            ...city,
            unlockedEvolutions: [...(city.unlockedEvolutions || []), branchId]
        };

        set({ city: newCity });
        if (platformModules?.CityRepository) {
            platformModules.CityRepository.saveCity(newCity);
        }

        if (currentUser && platformModules?.syncEngine) {
            platformModules.syncEngine.queueAction('UPDATE_PROFILE', { city: newCity });
        }

        get().addLog('system', `Evolution unlocked: ${branchId}`, 0, 'exp');
        return true;
    }
}));
