/**
 * Mock for expo-sqlite for web compatibility.
 * Implements a subset of the expo-sqlite API used in the app.
 */

class MockDatabase {
    async execAsync(query: string) {
        console.log('[Mock SQLite] execAsync:', query);
        return [];
    }

    async runAsync(query: string, params: any[] = []) {
        console.log('[Mock SQLite] runAsync:', query, params);
        return { lastInsertRowId: 0, changes: 0 };
    }

    async getAllAsync(query: string, params: any[] = []) {
        console.log('[Mock SQLite] getAllAsync:', query, params);
        // Simple mock: return empty results
        return [];
    }

    async withTransactionAsync(callback: () => Promise<void>) {
        await callback();
    }

    async closeAsync() {
        console.log('[Mock SQLite] closeAsync');
    }
}

export async function openDatabaseAsync(name: string) {
    console.log('[Mock SQLite] Opening database:', name);
    return new MockDatabase();
}

export const SQLiteProvider = ({ children }: any) => children;
export const useSQLiteContext = () => new MockDatabase();
