import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '@core/store';

export const ThemeToggle = () => {
    const theme = useThemeStore((state) => state.theme);
    const toggleTheme = useThemeStore((state) => state.toggleTheme);

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
            aria-label={`Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}
            title={`Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}
        >
            {theme === 'light' ? (
                <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300 transition-transform hover:scale-110" />
            ) : (
                <Sun className="w-5 h-5 text-yellow-500 dark:text-yellow-400 transition-transform hover:scale-110" />
            )}
        </button>
    );
};
