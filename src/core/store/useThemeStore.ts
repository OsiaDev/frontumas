import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type Theme = 'light' | 'dark';

interface ThemeStore {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

const applyTheme = (theme: Theme) => {
    const root = document.documentElement;
    if (theme === 'dark') {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }
};

export const useThemeStore = create<ThemeStore>()(
    persist(
        (set, get) => ({
            theme: 'dark',
            toggleTheme: () => {
                const currentTheme = get().theme;
                const newTheme = currentTheme === 'light' ? 'dark' : 'light';
                set({ theme: newTheme });
                applyTheme(newTheme);
            },
            setTheme: (theme) => {
                set({ theme });
                applyTheme(theme);
            },
        }),
        {
            name: 'theme-storage',
            storage: createJSONStorage(() => localStorage),
            onRehydrateStorage: () => {
                return (state) => {
                    if (state) {
                        applyTheme(state.theme);
                    } else {
                        applyTheme('dark');
                    }
                };
            },
        }
    )
);
