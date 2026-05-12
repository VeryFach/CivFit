import { storage } from './storage';

const SCHEMA_VERSION = 1;
const VERSION_KEY = 'civfit_db_version';

export async function checkStorageVersion() {
    const currentVersion = await storage.getItem(VERSION_KEY);
    const version = currentVersion ? parseInt(currentVersion, 10) : 0;

    if (version < SCHEMA_VERSION) {
        await runMigrations(version, SCHEMA_VERSION);
        await storage.setItem(VERSION_KEY, SCHEMA_VERSION.toString());
    }
}

async function runMigrations(from: number, to: number) {
    console.log(`Migrating storage from v${from} to v${to}`);

    if (from === 0) {
        // Initial migration
        // E.g., clear old localStorage keys from previous versions
    }

    // Future migrations go here
}
