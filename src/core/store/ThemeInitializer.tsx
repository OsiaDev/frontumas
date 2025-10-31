import { useEffect } from 'react';
import { useThemeStore } from './useThemeStore';

/**
 * ThemeInitializer - Componente para asegurar que el tema se aplique correctamente
 *
 * Este componente se monta al inicio de la aplicación y garantiza que:
 * 1. El tema guardado en localStorage se aplique inmediatamente
 * 2. La clase 'dark' se agregue/remueva del elemento html según corresponda
 * 3. Los cambios de tema se reflejen instantáneamente
 */
export const ThemeInitializer = () => {
    const theme = useThemeStore((state) => state.theme);

    useEffect(() => {
        const root = document.documentElement;

        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [theme]);

    // Este componente no renderiza nada
    return null;
};
