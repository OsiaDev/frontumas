import type { ReactNode } from 'react';
import { AuthProvider } from '@features/auth';
import { DroneProvider } from '@features/drones';
import { TrackingProvider } from '@features/tracking';
import { SidebarProvider } from './SidebarProvider';

interface AppProviderProps {
    children: ReactNode;
}

/**
 * AppProvider - Proveedor raíz que combina todos los contextos de features
 *
 * Arquitectura Feature-First:
 * - Cada feature (auth, drones, tracking) tiene su propio provider
 * - Los providers están organizados según sus dependencias
 * - SidebarProvider es parte del core (UI global)
 *
 * Orden de los providers:
 * 1. AuthProvider - Autenticación (independiente)
 * 2. DroneProvider - Estado de drones (independiente)
 * 3. TrackingProvider - Tracking de drones (depende de DroneProvider)
 * 4. SidebarProvider - Estado UI del sidebar (independiente, core)
 */
export const AppProvider = ({ children }: AppProviderProps) => {
    return (
        <AuthProvider>
            <DroneProvider>
                <TrackingProvider>
                    <SidebarProvider>
                        {children}
                    </SidebarProvider>
                </TrackingProvider>
            </DroneProvider>
        </AuthProvider>
    );
};
