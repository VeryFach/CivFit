import * as SQLite from 'expo-sqlite';

/**
 * SQLite Platform Bridge
 * Handles database initialization and common operations.
 */
class SQLiteDatabase {
  private db: SQLite.SQLiteDatabase | null = null;
  private isInitialized = false;

  async init() {
    if (this.isInitialized) return;
    
    // In web environment, this may require specific configuration or mock
    this.db = await SQLite.openDatabaseAsync('civfit.db');
    
    await this.runMigrations();
    this.isInitialized = true;
  }

  private async runMigrations() {
    if (!this.db) return;

    // Migration 1: Initial Schema
    await this.db.execAsync(`
      PRAGMA journal_mode = WAL;
      
      CREATE TABLE IF NOT EXISTS city_state (
        id INTEGER PRIMARY KEY DEFAULT 1,
        population INTEGER,
        population_sick INTEGER,
        food INTEGER,
        housing INTEGER,
        health INTEGER,
        happiness INTEGER,
        current_era TEXT,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS user_stats (
        id INTEGER PRIMARY KEY DEFAULT 1,
        level INTEGER,
        exp INTEGER,
        silver INTEGER,
        gold INTEGER,
        hp INTEGER,
        max_hp INTEGER,
        momentum INTEGER,
        day_count INTEGER,
        last_end_day TEXT
      );

      CREATE TABLE IF NOT EXISTS habits (
        id TEXT PRIMARY KEY,
        title TEXT,
        type TEXT,
        target_count INTEGER,
        gold_reward INTEGER,
        exp_reward INTEGER,
        difficulty INTEGER,
        current_streak INTEGER,
        completed_dates TEXT,
        created_at TEXT
      );

      CREATE TABLE IF NOT EXISTS activity_logs (
        id TEXT PRIMARY KEY,
        timestamp DATETIME,
        type TEXT,
        message TEXT,
        change_val INTEGER,
        unit TEXT
      );

      CREATE TABLE IF NOT EXISTS buildings (
        id TEXT PRIMARY KEY,
        building_type_id TEXT,
        grid_x INTEGER,
        grid_y INTEGER,
        level INTEGER,
        health INTEGER,
        created_at DATETIME
      );
      
      CREATE TABLE IF NOT EXISTS offline_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action_type TEXT,
        payload TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  async execute(query: string, params: any[] = []) {
    if (!this.db) await this.init();
    return await this.db!.runAsync(query, params);
  }

  async query<T>(query: string, params: any[] = []): Promise<T[]> {
    if (!this.db) await this.init();
    return await this.db!.getAllAsync(query, params);
  }
  
  async transaction(callback: () => Promise<void>) {
    if (!this.db) await this.init();
    await this.db!.withTransactionAsync(callback);
  }
}

export const sqlite = new SQLiteDatabase();
