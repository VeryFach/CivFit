import { auth, db, handleFirestoreError, OperationType } from '@/services/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
    collection,
    deleteDoc,
    doc,
    increment,
    limit,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    Timestamp,
    writeBatch
} from 'firebase/firestore';
import { create } from 'zustand';
import { checkStorageVersion } from '../../platform/storage/hydration';
import { BUILDINGS, DEFAULT_HP, ERAS_CONFIG, EVOLUTION_BRANCHES, EXP_PER_LEVEL, GRID_SIZE } from '../constants';
import { getScaledConstructionCost, isValidGridCoord } from '../simulation/cityUtils';
import { ActivityLog, CityState, Era, Habit, HabitType, PlacedBuilding, UserStats } from '../types';
import { DayReport, processEndDay } from './engine';

let unsubscribeAuthListener: (() => void) | null = null;
let unsubscribeUserScopedListeners: (() => void) | null = null;

const isPermissionDeniedError = (error: unknown) => {
    if (!(error instanceof Error)) return false;
    const message = error.message.toLowerCase();
    return message.includes('missing or insufficient permissions') || message.includes('permission-denied');
};

const getHabitDayKey = (dayCount: number) => `day-${dayCount}`;

const normalizeEra = (value: Era | string | undefined): Era => {
    if (value === 'MEDIEVALedieval') return Era.MEDIEVAL;
    if (value === Era.STONE_AGE || value === Era.MEDIEVAL || value === Era.INDUSTRIAL || value === Era.MODERN || value === Era.DIGITAL) {
        return value;
    }
    return Era.STONE_AGE;
};

const getEraRank = (era: Era) => {
    const index = ERAS_CONFIG.findIndex(item => item.id === era);
    return index >= 0 ? index : 0;
};

const promoteEra = (currentEra: Era, candidateEra: Era) => {
    return getEraRank(candidateEra) > getEraRank(currentEra) ? candidateEra : currentEra;
};

const getEraFromLevel = (level: number): Era => {
    const eligibleEras = ERAS_CONFIG
        .filter(item => level >= item.minLevel)
        .map(item => item.id as Era);

    return eligibleEras.length > 0 ? eligibleEras[eligibleEras.length - 1] : Era.STONE_AGE;
};

const getEraFromUnlockedEvolutions = (unlockedEvolutions: string[] | undefined): Era => {
    return (unlockedEvolutions || []).reduce<Era>((bestEra, branchId) => {
        const branch = EVOLUTION_BRANCHES.find(item => item.id === branchId);
        return branch ? promoteEra(bestEra, branch.era) : bestEra;
    }, Era.STONE_AGE);
};

const resolveCityEra = (city: CityState, stats: UserStats): Era => {
    const savedEra = normalizeEra(city.currentEra);
    const levelEra = getEraFromLevel(stats.level);
    const evolutionEra = getEraFromUnlockedEvolutions(city.unlockedEvolutions);

    const candidates: Era[] = [savedEra, levelEra, evolutionEra];
    return candidates.reduce<Era>((bestEra, candidateEra) => promoteEra(bestEra, candidateEra), Era.STONE_AGE);
};

interface CivState {
    currentUser: User | null;
    loading: boolean;
    stats: UserStats;
    habits: Habit[];
    city: CityState;
    logs: ActivityLog[];
    buildings: PlacedBuilding[];
    pendingLevelUp: { level: number; levelUpCount: number } | null;

    initialize: () => void;
    setStats: (stats: UserStats | ((prev: UserStats) => UserStats)) => void;
    setCity: (city: CityState | ((prev: CityState) => CityState)) => void;
    clearPendingLevelUp: () => void;
    addHabit: (title: string, type: HabitType) => Promise<void>;
    completeHabit: (id: string) => Promise<void>;
    updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
    deleteHabit: (id: string) => Promise<void>;
    endDay: () => Promise<DayReport | undefined>;
    deployBuilding: (buildingTypeId: string, silverCost: number, goldCost: number, x: number, y: number) => Promise<boolean>;
    upgradeBuilding: (id: string, silverCost: number) => Promise<boolean>;
    removeBuilding: (id: string) => Promise<void>;
    unlockEvolution: (branchId: string) => Promise<boolean>;
    addLog: (type: ActivityLog['type'], message: string, change: number, unit: ActivityLog['unit']) => Promise<void>;
    cleanOutOfBoundBuildings: () => Promise<number>;
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
    buildings: [],
    pendingLevelUp: null,

    initialize: async () => {
        if (unsubscribeAuthListener) return;

        await checkStorageVersion();

        unsubscribeAuthListener = onAuthStateChanged(auth, (user) => {
            // Always clear previous user listeners first to avoid stale reads after logout/switch.
            unsubscribeUserScopedListeners?.();
            unsubscribeUserScopedListeners = null;

            const previousUser = get().currentUser;
            if (previousUser?.uid !== user?.uid) {
                set({ pendingLevelUp: null });
            }

            set({ currentUser: user });

            if (user) {
                const currentUid = user.uid;
                const unsubs: (() => void)[] = [];
                const handleListenerError = (error: unknown, operationType: OperationType, path: string) => {
                    // During logout/account switch, Firestore may emit a final permission error before listener teardown.
                    if (isPermissionDeniedError(error)) {
                        console.warn(`[Firestore Listener] Ignored permission error on ${path}`);
                        return;
                    }
                    handleFirestoreError(error, operationType, path);
                };

                // User profile (Stats & City)
                const userDocRef = doc(db, 'users', currentUid);
                unsubs.push(onSnapshot(userDocRef, (snapshot) => {
                    if (snapshot.exists()) {
                        const data = snapshot.data();
                        const incomingCity = data.city || INITIAL_CITY;
                        const incomingStats = data.stats || INITIAL_STATS;
                        const resolvedEra = resolveCityEra(incomingCity, incomingStats);
                        const needsEraMigration = normalizeEra(incomingCity.currentEra) !== resolvedEra;
                        const nextCity = {
                            ...incomingCity,
                            currentEra: resolvedEra,
                        };

                        if (needsEraMigration) {
                            setDoc(userDocRef, {
                                city: nextCity,
                                updatedAt: serverTimestamp()
                            }, { merge: true }).catch(e => handleFirestoreError(e, OperationType.UPDATE, `users/${currentUid}`));
                        }

                        set({
                            stats: incomingStats,
                            city: nextCity,
                            loading: false
                        });
                    } else {
                        const initialData = {
                            stats: INITIAL_STATS,
                            city: INITIAL_CITY,
                            updatedAt: serverTimestamp()
                        };
                        setDoc(userDocRef, initialData).catch(e => handleFirestoreError(e, OperationType.WRITE, `users/${currentUid}`));
                        set({ loading: false });
                    }
                }, (error) => handleListenerError(error, OperationType.GET, `users/${currentUid}`)));

                // Habits subcollection
                const habitsRef = collection(db, 'users', currentUid, 'habits');
                unsubs.push(onSnapshot(query(habitsRef), (snapshot) => {
                    const habitsList = snapshot.docs.map(doc => {
                        const data = doc.data();
                        return {
                            ...data,
                            id: doc.id,
                            createdAt: data.createdAt instanceof Timestamp
                                ? data.createdAt.toDate().toISOString()
                                : data.createdAt || new Date().toISOString()
                        } as Habit;
                    });
                    set({ habits: habitsList });
                }, (error) => handleListenerError(error, OperationType.LIST, `users/${currentUid}/habits`)));

                // Logs subcollection
                const logsRef = collection(db, 'users', currentUid, 'logs');
                unsubs.push(onSnapshot(query(logsRef, orderBy('timestamp', 'desc'), limit(50)), (snapshot) => {
                    const logsList = snapshot.docs.map(doc => {
                        const data = doc.data();
                        return {
                            ...data,
                            id: doc.id,
                            timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate().toISOString() : data.timestamp
                        } as ActivityLog;
                    });
                    set({ logs: logsList });
                }, (error) => handleListenerError(error, OperationType.LIST, `users/${currentUid}/logs`)));

                // Buildings subcollection (Firestore architecture)
                const buildingsRef = collection(db, 'users', currentUid, 'buildings');
                unsubs.push(onSnapshot(buildingsRef, (snapshot) => {
                    const buildingsList = snapshot.docs.map(doc => {
                        const data = doc.data();
                        return {
                            id: doc.id,
                            buildingTypeId: data.buildingTypeId,
                            gridX: data.gridX,
                            gridY: data.gridY,
                            level: data.level,
                            health: data.health,
                            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt
                        } as PlacedBuilding;
                    });
                    set({ buildings: buildingsList });
                }, (error) => handleListenerError(error, OperationType.LIST, `users/${currentUid}/buildings`)));

                unsubscribeUserScopedListeners = () => {
                    unsubs.forEach((unsubscribe) => unsubscribe());
                };
            } else {
                set({ loading: false, habits: [], logs: [], buildings: [], stats: INITIAL_STATS, city: INITIAL_CITY, pendingLevelUp: null });
            }
        });
    },

    setStats: (updater) => {
        const { stats, currentUser } = get();
        const newStats = typeof updater === 'function' ? updater(stats) : updater;
        set({ stats: newStats });

        if (currentUser) {
            setDoc(doc(db, 'users', currentUser.uid), { stats: newStats, updatedAt: serverTimestamp() }, { merge: true })
                .catch(e => handleFirestoreError(e, OperationType.UPDATE, `users/${currentUser.uid}`));
        }
    },

    setCity: (updater) => {
        const { city, currentUser } = get();
        const newCity = typeof updater === 'function' ? updater(city) : updater;
        set({ city: newCity });

        if (currentUser) {
            setDoc(doc(db, 'users', currentUser.uid), { city: newCity, updatedAt: serverTimestamp() }, { merge: true })
                .catch(e => handleFirestoreError(e, OperationType.UPDATE, `users/${currentUser.uid}`));
        }
    },

    clearPendingLevelUp: () => {
        set({ pendingLevelUp: null });
    },

    addLog: async (type, message, change, unit) => {
        const { currentUser } = get();
        const logId = Math.random().toString(36).substring(2, 11);
        const newLog = {
            timestamp: Timestamp.now(),
            type,
            message,
            change,
            unit
        };

        if (currentUser) {
            await setDoc(doc(db, 'users', currentUser.uid, 'logs', logId), newLog);
        } else {
            set(state => ({
                logs: [{ ...newLog, id: logId, timestamp: new Date().toISOString() } as ActivityLog, ...state.logs].slice(0, 50)
            }));
        }
    },

    addHabit: async (title, type) => {
        const { currentUser } = get();
        const goldBase = type === 'daily' ? 10 : type === 'weekly' ? 50 : 200;
        const expBase = type === 'daily' ? 50 : type === 'weekly' ? 250 : 1000;
        const target = type === 'daily' ? 1 : type === 'weekly' ? 3 : 10;
        const habitId = Math.random().toString(36).substring(2, 11);

        const newHabit = {
            title,
            type,
            completedDates: [],
            createdAt: Timestamp.now(),
            targetCount: target,
            goldReward: goldBase,
            expReward: expBase,
            difficulty: 1,
            currentStreak: 0
        };

        if (currentUser) {
            await setDoc(doc(db, 'users', currentUser.uid, 'habits', habitId), newHabit);
        } else {
            set(state => ({
                habits: [...state.habits, { ...newHabit, id: habitId, createdAt: new Date().toISOString() } as Habit]
            }));
        }
    },

    completeHabit: async (id) => {
        const { stats, habits, currentUser, addLog, pendingLevelUp } = get();
        const today = getHabitDayKey(stats.dayCount);
        const h = habits.find(habit => habit.id === id);
        if (!h || h.completedDates.includes(today)) return;

        const completionsThisPeriod = h.completedDates.length;
        const overAchievement = completionsThisPeriod >= h.targetCount;

        const momentumMult = 1 + (stats.momentum / 100) * 0.5;
        const baseMultiplier = overAchievement ? 0.5 : 1;
        const finalMultiplier = baseMultiplier * momentumMult;

        let newExp = stats.exp + Math.floor(h.expReward * finalMultiplier);
        let newLevel = stats.level;
        let newMaxExp = stats.maxExp;

        if (newExp >= newMaxExp) {
            newExp -= newMaxExp;
            newLevel += 1;
            newMaxExp = Math.floor(newMaxExp * 1.2);
        }

        const levelUpCount = Math.max(0, newLevel - stats.level);

        const updatedStats = {
            ...stats,
            gold: stats.gold + Math.floor(h.goldReward * finalMultiplier),
            exp: newExp,
            level: newLevel,
            maxExp: newMaxExp,
            lastCelebratedLevel: levelUpCount > 0 ? newLevel : stats.lastCelebratedLevel,
            momentum: Math.min(100, stats.momentum + 2)
        };

        const updatedHabit = {
            ...h,
            completedDates: [...h.completedDates, today],
            currentStreak: h.currentStreak + 1,
        };

        if (currentUser) {
            // Optimistic local update so level-up UI reacts immediately, without waiting for Firestore snapshot latency.
            set({
                stats: updatedStats,
                habits: habits.map(habit => habit.id === id ? updatedHabit : habit),
                pendingLevelUp: levelUpCount > 0
                    ? {
                        level: newLevel,
                        levelUpCount,
                    }
                    : pendingLevelUp,
            });

            const batch = writeBatch(db);
            batch.set(doc(db, 'users', currentUser.uid), { stats: updatedStats, updatedAt: serverTimestamp() }, { merge: true });

            const { id: _, ...habitData } = updatedHabit;
            batch.set(doc(db, 'users', currentUser.uid, 'habits', id), {
                ...habitData,
                createdAt: h.createdAt ? Timestamp.fromDate(new Date(h.createdAt)) : serverTimestamp()
            });
            await batch.commit();
        } else {
            set({
                stats: updatedStats,
                habits: habits.map(habit => habit.id === id ? updatedHabit : habit),
                pendingLevelUp: levelUpCount > 0
                    ? {
                        level: newLevel,
                        levelUpCount,
                    }
                    : pendingLevelUp,
            });
        }

        addLog('habit', `Completed: ${h.title}`, h.goldReward, 'gold');
    },

    updateHabit: async (id, updates) => {
        const { currentUser, habits } = get();
        if (currentUser) {
            const { id: _, ...dataToSave } = updates as any;
            await setDoc(doc(db, 'users', currentUser.uid, 'habits', id), dataToSave, { merge: true });
        } else {
            set({ habits: habits.map(h => h.id === id ? { ...h, ...updates } : h) });
        }
    },

    deleteHabit: async (id) => {
        const { currentUser, habits } = get();
        if (currentUser) {
            await deleteDoc(doc(db, 'users', currentUser.uid, 'habits', id));
        } else {
            set({ habits: habits.filter(h => h.id !== id) });
        }
    },

    endDay: async () => {
        const { stats, city, buildings, habits, currentUser, addHabit } = get();
        const today = getHabitDayKey(stats.dayCount);

        if (stats.lastEndDay === today) {
            return undefined;
        }

        const { updatedStats, updatedCity, report, resetHabitIds } = processEndDay(stats, city, buildings, habits, today);

        if (report.event) {
            addHabit(`Mitigasi: ${report.event.name}`, 'daily');
        }

        if (currentUser) {
            try {
                const batch = writeBatch(db);
                batch.set(doc(db, 'users', currentUser.uid), { stats: updatedStats, city: updatedCity, updatedAt: serverTimestamp() }, { merge: true });

                batch.set(doc(db, 'leaderboard', currentUser.uid), {
                    userId: currentUser.uid,
                    displayName: currentUser.displayName || 'Survivor',
                    photoURL: currentUser.photoURL || '',
                    level: updatedStats.level,
                    population: updatedCity.population,
                    currentEra: updatedCity.currentEra,
                    updatedAt: serverTimestamp()
                });

                resetHabitIds.forEach(id => {
                    batch.set(doc(db, 'users', currentUser.uid, 'habits', id), { currentStreak: 0 }, { merge: true });
                });

                await batch.commit();
            } catch (e) {
                handleFirestoreError(e, OperationType.WRITE, `users/${currentUser.uid}`);
            }
        } else {
            set({ stats: updatedStats, city: updatedCity, habits: habits.map(h => resetHabitIds.includes(h.id) ? { ...h, currentStreak: 0 } : h) });
        }

        return report;
    },

    // Deploy building (Firestore subcollection)
    deployBuilding: async (buildingTypeId: string, silverCost: number, goldCost: number, x: number, y: number): Promise<boolean> => {
        const { stats, city, buildings, currentUser, addLog } = get();
        const buildingType = BUILDINGS.find(item => item.id === buildingTypeId);
        if (!buildingType) return false;

        if (!isValidGridCoord(x, y)) return false;

        const isOccupied = buildings.some(building => building.gridX === x && building.gridY === y);
        if (isOccupied) return false;

        const era = ERAS_CONFIG.find(item => item.id === buildingType.era);
        if (stats.level < (era?.minLevel || 0)) return false;

        const officialSilverCost = getScaledConstructionCost(buildingType.costSilver, buildings.length, city.unlockedEvolutions);
        const officialGoldCost = getScaledConstructionCost(buildingType.costGold, buildings.length, city.unlockedEvolutions);

        if (silverCost !== officialSilverCost || goldCost !== officialGoldCost) {
            return false;
        }

        if (stats.silver < officialSilverCost || stats.gold < officialGoldCost) return false;

        if (!currentUser) {
            return false;
        }

        const batch = writeBatch(db);

        // Update user silver
        const userRef = doc(db, 'users', currentUser.uid);
        batch.update(userRef, {
            'stats.silver': stats.silver - officialSilverCost,
            'stats.gold': stats.gold - officialGoldCost,
            updatedAt: serverTimestamp()
        });

        // Create building document (ID based on grid coordinates)
        const buildingId = `${x}_${y}`;
        const buildingRef = doc(db, 'users', currentUser.uid, 'buildings', buildingId);
        batch.set(buildingRef, {
            buildingTypeId,
            gridX: x,
            gridY: y,
            level: 1,
            health: 100,
            createdAt: serverTimestamp()
        });

        await batch.commit();

        addLog('city', `Constructed ${buildingType.name}`, -officialSilverCost, 'silver');
        return true;
    },

    // Upgrade building
    upgradeBuilding: async (id: string, silverCost: number): Promise<boolean> => {
        const { stats, currentUser, addLog, buildings } = get();

        if (stats.silver < silverCost) return false;
        if (!currentUser) return false;

        const newSilver = stats.silver - silverCost;
        // Optimistic update
        set({
            stats: { ...stats, silver: newSilver },
            buildings: buildings.map(b => b.id === id ? { ...b, level: b.level + 1 } : b),
        });

        try {
            const batch = writeBatch(db);
            const userRef = doc(db, 'users', currentUser.uid);
            batch.update(userRef, {
                'stats.silver': increment(-silverCost),
                updatedAt: serverTimestamp()
            });

            const buildingRef = doc(db, 'users', currentUser.uid, 'buildings', id);
            batch.update(buildingRef, { level: increment(1) });

            await batch.commit();
            console.log('Upgrade building success');
            addLog('city', `Upgraded building`, -silverCost, 'silver');
            return true;
        } catch (error) {
            console.error('Upgrade batch error:', error);
            // Rollback state lokal
            set({
                stats: { ...stats, silver: stats.silver },
                buildings: buildings,
            });
            return false;
        }
    },

    // Remove building
    removeBuilding: async (id: string): Promise<void> => {
        const { currentUser, addLog } = get();
        if (!currentUser) return;

        await deleteDoc(doc(db, 'users', currentUser.uid, 'buildings', id));
        addLog('city', `Removed building`, 0, 'silver');
    },

    unlockEvolution: async (branchId: string): Promise<boolean> => {
        const { stats, city, buildings, currentUser, addLog } = get();
        if (city.unlockedEvolutions?.includes(branchId)) return false;

        const branch = EVOLUTION_BRANCHES.find(item => item.id === branchId);
        if (!branch) return false;

        const requirementsMet = branch.requirements.every((requirement) => {
            if (requirement.type === 'level') {
                return stats.level >= (requirement.target as number);
            }
            if (requirement.type === 'buildings') {
                const ownedCount = buildings.filter(building => building.buildingTypeId === requirement.target).length;
                return ownedCount >= (requirement.count ?? 1);
            }
            if (requirement.type === 'silver') {
                return stats.silver >= (requirement.target as number);
            }
            if (requirement.type === 'gold') {
                return stats.gold >= (requirement.target as number);
            }
            return true;
        });

        if (!requirementsMet) return false;

        const promotedEra = branch ? promoteEra(normalizeEra(city.currentEra), branch.era) : normalizeEra(city.currentEra);

        const newCity = {
            ...city,
            currentEra: promotedEra,
            unlockedEvolutions: [...(city.unlockedEvolutions || []), branchId]
        };

        if (currentUser) {
            await setDoc(doc(db, 'users', currentUser.uid), { city: newCity, updatedAt: serverTimestamp() }, { merge: true });
        } else {
            set({ city: newCity });
        }

        addLog('system', `Evolution unlocked: ${branchId}`, 0, 'exp');
        return true;
    },

    // Clean out-of-bounds buildings
    cleanOutOfBoundBuildings: async (): Promise<number> => {
        const { buildings, currentUser } = get();

        if (!currentUser) return 0;

        const outOfBounds = buildings.filter(b =>
            b.gridX < 0 || b.gridX >= GRID_SIZE ||
            b.gridY < 0 || b.gridY >= GRID_SIZE
        );

        if (outOfBounds.length === 0) {
            console.log('[cleanOutOfBoundBuildings] No out-of-bounds buildings found');
            return 0;
        }

        console.warn(`[cleanOutOfBoundBuildings] Removing ${outOfBounds.length} out-of-bounds buildings:`,
            outOfBounds.map(b => ({ id: b.id, coords: `(${b.gridX},${b.gridY})` }))
        );

        const batch = writeBatch(db);
        outOfBounds.forEach(b => {
            const ref = doc(db, 'users', currentUser.uid, 'buildings', b.id);
            batch.delete(ref);
        });
        await batch.commit();

        return outOfBounds.length;
    }
}));
