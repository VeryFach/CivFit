import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Session persistence utility
 * Handles storing and retrieving user session data from AsyncStorage
 */

const SESSION_KEY = '@civfit_session';
const USER_PREFS_KEY = '@civfit_user_prefs';

export interface SessionData {
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    lastLogin: string;
}

export interface UserPreferences {
    soundEnabled: boolean;
    hapticsEnabled: boolean;
    language: string;
    theme: 'light' | 'dark' | 'auto';
}

/**
 * Save user session to AsyncStorage
 */
export async function saveSession(data: SessionData): Promise<void> {
    try {
        await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(data));
        console.log('[SessionStorage] Session saved');
    } catch (error) {
        console.error('[SessionStorage] Failed to save session:', error);
    }
}

/**
 * Load user session from AsyncStorage
 */
export async function loadSession(): Promise<SessionData | null> {
    try {
        const stored = await AsyncStorage.getItem(SESSION_KEY);
        if (!stored) {
            return null;
        }
        const session = JSON.parse(stored) as SessionData;
        console.log('[SessionStorage] Session loaded for user:', session.email);
        return session;
    } catch (error) {
        console.error('[SessionStorage] Failed to load session:', error);
        return null;
    }
}

/**
 * Clear user session from AsyncStorage
 */
export async function clearSession(): Promise<void> {
    try {
        await AsyncStorage.removeItem(SESSION_KEY);
        console.log('[SessionStorage] Session cleared');
    } catch (error) {
        console.error('[SessionStorage] Failed to clear session:', error);
    }
}

/**
 * Save user preferences to AsyncStorage
 */
export async function saveUserPreferences(prefs: UserPreferences): Promise<void> {
    try {
        await AsyncStorage.setItem(USER_PREFS_KEY, JSON.stringify(prefs));
        console.log('[SessionStorage] User preferences saved');
    } catch (error) {
        console.error('[SessionStorage] Failed to save preferences:', error);
    }
}

/**
 * Load user preferences from AsyncStorage
 */
export async function loadUserPreferences(): Promise<UserPreferences> {
    try {
        const stored = await AsyncStorage.getItem(USER_PREFS_KEY);
        if (!stored) {
            return getDefaultPreferences();
        }
        return JSON.parse(stored) as UserPreferences;
    } catch (error) {
        console.error('[SessionStorage] Failed to load preferences:', error);
        return getDefaultPreferences();
    }
}

/**
 * Get default user preferences
 */
function getDefaultPreferences(): UserPreferences {
    return {
        soundEnabled: true,
        hapticsEnabled: true,
        language: 'id',
        theme: 'auto'
    };
}

/**
 * Clear all app data from AsyncStorage
 */
export async function clearAllData(): Promise<void> {
    try {
        await AsyncStorage.multiRemove([SESSION_KEY, USER_PREFS_KEY]);
        console.log('[SessionStorage] All data cleared');
    } catch (error) {
        console.error('[SessionStorage] Failed to clear all data:', error);
    }
}
