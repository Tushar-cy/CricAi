import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Type-safe AsyncStorage wrapper — all values are JSON serialized.
 * Use this instead of raw AsyncStorage calls throughout the app.
 */
export const storage = {
    get: async (key) => {
        try {
            const val = await AsyncStorage.getItem(key);
            return val ? JSON.parse(val) : null;
        } catch {
            return null;
        }
    },
    set: async (key, val) => {
        try {
            await AsyncStorage.setItem(key, JSON.stringify(val));
        } catch (e) {
            console.warn(`[Storage] set(${key}) failed:`, e.message);
        }
    },
    remove: async (key) => {
        try {
            await AsyncStorage.removeItem(key);
        } catch (e) {
            console.warn(`[Storage] remove(${key}) failed:`, e.message);
        }
    },
    multiRemove: async (keys) => {
        try {
            await AsyncStorage.multiRemove(keys);
        } catch (e) {
            console.warn('[Storage] multiRemove failed:', e.message);
        }
    },
};

// ── Well-known storage keys ───────────────────────────────────────────────────
export const STORAGE_KEYS = {
    selectedCoach: 'cricai_coach',
    fatigueLog:    'cricai_fatigue_log',
    bestStreak:    'cricai_best_streak',
};
