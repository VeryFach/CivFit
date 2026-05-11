export interface IStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
}

/**
 * Platform-agnostic storage service.
 * In web environment, it uses localStorage.
 * In Expo environment, it will use AsyncStorage.
 */
class PersistenceService implements IStorage {
  async getItem(key: string): Promise<string | null> {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  }

  async setItem(key: string, value: string): Promise<void> {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    }
  }

  async removeItem(key: string): Promise<void> {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
  }

  async clear(): Promise<void> {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  }
}

export const storage = new PersistenceService();
