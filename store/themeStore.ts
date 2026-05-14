import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark';

interface ThemeState {
    themeMode: ThemeMode;
    isDarkMode: boolean;
    setThemeMode: (mode: ThemeMode) => void;
    toggleThemeMode: () => void;
}

const getInitialThemeMode = (): ThemeMode => {
    const systemScheme = Appearance.getColorScheme();
    return systemScheme === 'dark' ? 'dark' : 'light';
};

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            themeMode: getInitialThemeMode(),
            isDarkMode: getInitialThemeMode() === 'dark',
            setThemeMode: (mode) => set({ themeMode: mode, isDarkMode: mode === 'dark' }),
            toggleThemeMode: () =>
                set((state) => {
                    const nextMode: ThemeMode = state.themeMode === 'dark' ? 'light' : 'dark';
                    return {
                        themeMode: nextMode,
                        isDarkMode: nextMode === 'dark',
                    };
                }),
        }),
        {
            name: '@civfit_theme_mode',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({ themeMode: state.themeMode }),
            onRehydrateStorage: () => (state) => {
                if (state) {
                    state.isDarkMode = state.themeMode === 'dark';
                }
            },
        }
    )
);