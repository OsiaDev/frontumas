import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@config/query.config';
import { ThemeInitializer } from './ThemeInitializer';
import { AuthInitializer } from './AuthInitializer';
import { MqttInitializer } from './MqttInitializer';

interface AppProviderProps {
    children: ReactNode;
}

/**
 * AppProvider - Proveedor raíz simplificado
 *
 * Arquitectura con Zustand:
 * - El estado global ahora se maneja con Zustand stores
 * - Cada store tiene persistencia automática en localStorage
 * - No se necesitan providers anidados para el estado
 *
 * Stores disponibles:
 * - useAuthStore: Autenticación y usuario
 * - useDroneStore: Estado de drones y ubicaciones MQTT
 * - useTrackingStore: Tracking y selección de drones
 * - useSidebarStore: Estado UI del sidebar
 * - useThemeStore: Tema de la aplicación (light/dark)
 * - useMqttStore: Estado de conexión MQTT global
 *
 * Beneficios:
 * - Menos jerarquía de componentes (sin provider hell)
 * - Persistencia automática en localStorage
 * - Mejor performance (solo se re-renderizan componentes que usan el estado)
 * - TypeScript type-safe por defecto
 * - DevTools integrados para debugging
 */
export const AppProvider = ({ children }: AppProviderProps) => {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeInitializer />
            <AuthInitializer />
            <MqttInitializer />
            {children}
        </QueryClientProvider>
    );
};
