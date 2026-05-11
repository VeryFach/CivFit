/**
 * SQLite Mock for Web Platform
 * Provides in-memory database for web development
 */
const databases: Map<string, any> = new Map();

class MockDatabase {
  private data: any = {};

  async exec(sql: string) {
    // Mock implementation
    console.log('[Mock SQLite]', sql);
  }

  async execAsync(sql: string) {
    return this.exec(sql);
  }

  async runAsync(sql: string, params?: any[]) {
    console.log('[Mock SQLite]', sql, params);
    return { lastID: 1, changes: 0 };
  }

  async runSync(sql: string, params?: any[]) {
    return this.runAsync(sql, params);
  }

  async allAsync(sql: string, params?: any[]) {
    console.log('[Mock SQLite Query]', sql, params);
    return [];
  }

  async getAllAsync(sql: string, params?: any[]) {
    return this.allAsync(sql, params);
  }

  async getAsync(sql: string, params?: any[]) {
    console.log('[Mock SQLite Query]', sql, params);
    return null;
  }

  async transaction(callback: () => Promise<void>) {
    await callback();
  }

  async withTransactionAsync(callback: () => Promise<void>) {
    return this.transaction(callback);
  }

  async close() {
    // Mock implementation
  }
}

export async function openDatabaseAsync(name: string) {
  if (!databases.has(name)) {
    databases.set(name, new MockDatabase());
  }
  return databases.get(name);
}

export const SQLiteDatabase = MockDatabase;

// Mock SQLiteDatabase wrapper for web platform
class SQLiteDatabaseWrapper {
    private db: any = null;
    private isInitialized = false;

    async init() {
        if (this.isInitialized) return;
        console.warn('[SQLite Mock] Using mock database for web platform');
        this.db = new MockDatabase();
        this.isInitialized = true;
    }

    async execute(query: string, params: any[] = []) {
        if (!this.db) await this.init();
        if (!this.db) return { changes: 0, lastInsertRowid: 0 };
        return await this.db.runAsync(query, params);
    }

    async query<T>(query: string, params: any[] = []): Promise<T[]> {
        if (!this.db) await this.init();
        if (!this.db) return [];
        return await this.db.getAllAsync(query, params);
    }

    async transaction(callback: () => Promise<void>) {
        if (!this.db) await this.init();
        if (!this.db) {
            await callback();
            return;
        }
        await this.db.withTransactionAsync(callback);
    }
}

export const sqlite = new SQLiteDatabaseWrapper();
