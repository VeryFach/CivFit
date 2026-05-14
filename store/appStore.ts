import { DEFAULT_HP, EXP_PER_LEVEL, GRID_SIZE } from '@/core/constants';
import { DayReport, processEndDay } from '@/core/progression/engine';
import { ActivityLog, CityState, Era, Habit, HabitType, PlacedBuilding, UserStats } from '@/core/types';
import { auth, db } from '@/services/firebase';
import { handleFirestoreError, OperationType } from '@/services/firebase';
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

interface CivState {
    currentUser: User | null;
    loading: boolean;
    stats: UserStats;
    habits: Habit[];
    city: CityState;          // ✅ tanpa buildings
    logs: ActivityLog[];
    buildings: PlacedBuilding[];  // ✅ state terpisah

    // Actions
    initialize: () => void;
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
    // ✅ tidak ada field buildings
};

export const useCivStore = create<CivState>((set, get) => ({
    currentUser: null,
    loading: true,
    stats: INITIAL_STATS,
    habits: [],
    city: INITIAL_CITY,
    logs: [],
    buildings: [],

    initialize: () => {
        onAuthStateChanged(auth, (user) => {
            set({ currentUser: user });

            if (user) {
                // 1. Sync User Stats & City (tanpa buildings)
                const userDocRef = doc(db, 'users', user.uid);
                onSnapshot(userDocRef, (snapshot) => {
                    if (snapshot.exists()) {
                        const data = snapshot.data();
                        set({
                            stats: data.stats || INITIAL_STATS,
                            city: data.city || INITIAL_CITY,
                            loading: false
                        });
                    } else {
                        const initialData = {
                            stats: INITIAL_STATS,
                            city: INITIAL_CITY,
                            updatedAt: serverTimestamp()
                        };
                        setDoc(userDocRef, initialData).catch(e =>
                            handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}`)
                        );
                        set({ loading: false });
                    }
                }, (error) => handleFirestoreError(error, OperationType.GET, `users/${user.uid}`));

                // 2. Sync Habits
                const habitsRef = collection(db, 'users', user.uid, 'habits');
                onSnapshot(query(habitsRef), (snapshot) => {
                    const habitsList = snapshot.docs.map(doc => {
                        const data = doc.data();
                        return {
                            ...data,
                            id: doc.id,
                            createdAt: data.createdAt instanceof Timestamp
                                ? data.createdAt.toDate().toISOString()
                                : data.createdAt
                        } as Habit;
                    });
                    set({ habits: habitsList });
                }, (error) => handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/habits`));

                // 3. Sync Activity Logs
                const logsRef = collection(db, 'users', user.uid, 'logs');
                onSnapshot(query(logsRef, orderBy('timestamp', 'desc'), limit(50)), (snapshot) => {
                    const logsList = snapshot.docs.map(doc => {
                        const data = doc.data();
                        return {
                            ...data,
                            id: doc.id,
                            timestamp: data.timestamp instanceof Timestamp
                                ? data.timestamp.toDate().toISOString()
                                : data.timestamp
                        } as ActivityLog;
                    });
                    set({ logs: logsList });
                }, (error) => handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/logs`));

                // ✅ 4. Sync Buildings (subcollection)
                const buildingsRef = collection(db, 'users', user.uid, 'buildings');
                onSnapshot(buildingsRef, (snapshot) => {
                    console.log(
                        'RAW DOCS:',
                        snapshot.docs.map(d => ({
                            id: d.id,
                            data: d.data()
                        }))
                    );
                    const buildingsList = snapshot.docs.map(doc => {
                        const data = doc.data();
                        return {
                            id: doc.id,
                            buildingTypeId: data.buildingTypeId,
                            gridX: data.gridX,
                            gridY: data.gridY,
                            level: data.level,
                            health: data.health,
                            createdAt: data.createdAt instanceof Timestamp
                                ? data.createdAt.toDate().toISOString()
                                : data.createdAt
                        } as PlacedBuilding;
                    });
                    const validBuildings =
                        buildingsList.filter(b =>
                            b.gridX >= 0 &&
                            b.gridX < GRID_SIZE &&
                            b.gridY >= 0 &&
                            b.gridY < GRID_SIZE
                        );

                    set({
                        buildings: validBuildings
                    });

                    // ✅ AUTO-CLEANUP: Delete invalid buildings from Firestore
                    const invalidBuildings = buildingsList.filter(b =>
                        b.gridX < 0 || b.gridX >= GRID_SIZE ||
                        b.gridY < 0 || b.gridY >= GRID_SIZE
                    );

                    if (invalidBuildings.length > 0) {
                        console.warn(`⚠️  Found ${invalidBuildings.length} invalid building(s). Starting aggressive cleanup...`);

                        // Delete each building individually with retry logic
                        invalidBuildings.forEach(async (b) => {
                            try {
                                const ref = doc(db, 'users', user.uid, 'buildings', b.id);
                                await deleteDoc(ref);
                                console.log(`   ✅ Deleted: ${b.id} (${b.buildingTypeId}) @ [${b.gridX}, ${b.gridY}]`);
                            } catch (error: any) {
                                console.error(`   ❌ Failed to delete ${b.id}:`, error.message);
                                // Retry once
                                try {
                                    const ref = doc(db, 'users', user.uid, 'buildings', b.id);
                                    await deleteDoc(ref);
                                    console.log(`   ✅ Retry successful for ${b.id}`);
                                } catch (retryError: any) {
                                    console.error(`   ❌ Retry failed for ${b.id}:`, retryError.message);
                                }
                            }
                        });
                    }
                }, (error) => handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/buildings`));
            } else {
                set({ loading: false, habits: [], logs: [], buildings: [], stats: INITIAL_STATS, city: INITIAL_CITY });
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
        const { stats, habits, currentUser, addLog } = get();
        const today = new Date().toISOString().split('T')[0];
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

        if (currentUser) {
            const batch = writeBatch(db);
            batch.set(doc(db, 'users', currentUser.uid), { stats: updatedStats, updatedAt: serverTimestamp() }, { merge: true });

            const { id: _, ...habitData } = updatedHabit;
            batch.set(doc(db, 'users', currentUser.uid, 'habits', id), {
                ...habitData,
                createdAt: h.createdAt ? (typeof h.createdAt === 'string' ? Timestamp.fromDate(new Date(h.createdAt)) : h.createdAt) : serverTimestamp()
            });
            await batch.commit();
        } else {
            set({ stats: updatedStats, habits: habits.map(habit => habit.id === id ? updatedHabit : habit) });
        }

        await addLog('habit', `Completed: ${h.title}`, h.goldReward, 'gold');
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
        const {
            stats,
            city,
            buildings,
            habits,
            currentUser,
            addLog,
            addHabit
        } = get();
        const today = new Date().toISOString().split('T')[0];

        // ✅ processEndDay harus sudah disesuaikan menerima city tanpa buildings
        const { updatedStats, updatedCity, report, resetHabitIds } = processEndDay(
            stats,
            city,
            buildings,
            habits,
            today
        )

        if (report.event) {
            await addHabit(`Mitigasi: ${report.event.name}`, 'daily');
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
                }, { merge: true });

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

    // ✅ DEPLOY BUILDING - buat dokumen di subcollection
    deployBuilding: async (
        buildingTypeId,
        silverCost,
        x,
        y
    ) => {
        if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) {
            console.error(`[deployBuilding] Invalid coords: (${x}_${y})`);
            console.log("DEBUG DEPLOY:", {
                inputX: x,
                typeX: typeof x,
                inputY: y,
                typeY: typeof y,
                stack: new Error().stack // Ini akan memberi tahu fungsi mana yang memanggilnya
            });
            return false;
        }

        const {
            stats,
            currentUser,
            addLog
        } = get();

        if (stats.silver < silverCost)
            return false;

        if (!currentUser)
            return false;

        const batch =
            writeBatch(db);

        // USER REF
        const userRef =
            doc(
                db,
                'users',
                currentUser.uid
            );

        batch.set(
            userRef,
            {
                'stats.silver':
                    stats.silver -
                    silverCost,

                updatedAt:
                    serverTimestamp()
            },
            {
                merge: true
            }
        );

        // BUILDING ID
        const buildingId =
            `${x}_${y}`;

        console.log(`✅ Deploying building: ${buildingTypeId} at [${x}, ${y}] (ID: ${buildingId})`);

        const buildingRef =
            doc(
                db,
                'users',
                currentUser.uid,
                'buildings',
                buildingId
            );

        // BUILDING DATA
        batch.set(
            buildingRef,
            {
                buildingTypeId,

                gridX: x,

                gridY: y,

                level: 1,

                health: 100,

                createdAt:
                    serverTimestamp()
            }
        );

        await batch.commit();

        await addLog(
            'city',
            `Constructed ${buildingTypeId}`,
            -silverCost,
            'silver'
        );

        return true;
    },

    // ✅ UPGRADE BUILDING - update dokumen building
    upgradeBuilding: async (id, silverCost) => {
        const { stats, currentUser, addLog } = get();
        if (stats.silver < silverCost) return false;
        if (!currentUser) return false;

        const batch = writeBatch(db);
        const userRef = doc(db, 'users', currentUser.uid);
        batch.set(userRef, {
            'stats.silver': stats.silver - silverCost,
            updatedAt: serverTimestamp()
        },
            {
                merge: true
            });

        const buildingRef = doc(db, 'users', currentUser.uid, 'buildings', id);
        batch.update(buildingRef, { level: increment(1) });

        await batch.commit();
        await addLog('city', `Upgraded building`, -silverCost, 'silver');
        return true;
    },

    // ✅ REMOVE BUILDING - hapus dokumen
    removeBuilding: async (id) => {
        const { currentUser, addLog } = get();
        if (!currentUser) return;
        await deleteDoc(doc(db, 'users', currentUser.uid, 'buildings', id));
        await addLog('city', `Removed building`, 0, 'silver');
    },

    unlockEvolution: async (branchId) => {
        const { city, currentUser, addLog } = get();
        if (city.unlockedEvolutions?.includes(branchId)) return false;

        const newCity = {
            ...city,
            unlockedEvolutions: [...(city.unlockedEvolutions || []), branchId]
        };

        if (currentUser) {
            await setDoc(doc(db, 'users', currentUser.uid), { city: newCity, updatedAt: serverTimestamp() }, { merge: true });
        } else {
            set({ city: newCity });
        }

        await addLog('system', `Evolution unlocked: ${branchId}`, 0, 'exp');
        return true;
    },

    // ✅ CLEAN OUT OF BOUND BUILDINGS - hapus bangunan di luar grid
    cleanOutOfBoundBuildings: async () => {
        const { buildings, currentUser } = get();
        if (!currentUser) {
            console.error('❌ Cannot cleanup: No user logged in');
            return 0;
        }

        const outOfBounds = buildings.filter(b =>
            b.gridX < 0 || b.gridX >= GRID_SIZE ||
            b.gridY < 0 || b.gridY >= GRID_SIZE
        );

        if (outOfBounds.length === 0) {
            console.log('✅ No out-of-bounds buildings found');
            return 0;
        }

        console.warn(`⚠️  Found ${outOfBounds.length} out-of-bounds building(s). Deleting...`);

        let deleted = 0;
        for (const b of outOfBounds) {
            try {
                const ref = doc(db, 'users', currentUser.uid, 'buildings', b.id);
                await deleteDoc(ref);
                console.log(`   ✅ Deleted: ${b.id} @ [${b.gridX}, ${b.gridY}]`);
                deleted++;
            } catch (error: any) {
                console.error(`   ❌ Failed to delete ${b.id}:`, error.message);
            }
        }

        console.log(`✅ Cleanup complete: Deleted ${deleted}/${outOfBounds.length} buildings`);
        return deleted;
    }
}));