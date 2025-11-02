import { useEffect, useRef } from 'react';
import { useAuthStore } from '@features/auth';

/**
 * AuthInitializer - Inicializa Keycloak al cargar la app
 * Usa un ref para evitar múltiples inicializaciones en React Strict Mode
 */
export const AuthInitializer = () => {
    const initAuth = useAuthStore((state) => state.initAuth);
    const hasInitialized = useRef(false);

    useEffect(() => {
        if (!hasInitialized.current) {
            hasInitialized.current = true;
            initAuth();
        }
    }, [initAuth]);

    return null;
};
