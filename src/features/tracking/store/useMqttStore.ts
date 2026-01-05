import { create } from 'zustand';
import type { DroneLocationMessage } from '@shared/types/drone.types';

export type MqttConnectionStatus = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR';

interface MqttState {
    status: MqttConnectionStatus;
    error: Error | null;
    messageCount: number;
    lastMessage: DroneLocationMessage | null;
}

interface MqttActions {
    setStatus: (status: MqttConnectionStatus) => void;
    setError: (error: Error | null) => void;
    incrementMessageCount: () => void;
    setLastMessage: (message: DroneLocationMessage) => void;
    reset: () => void;
}

const initialState: MqttState = {
    status: 'DISCONNECTED',
    error: null,
    messageCount: 0,
    lastMessage: null,
};

/**
 * useMqttStore - Estado global de la conexión MQTT
 *
 * Este store mantiene:
 * - Estado de conexión (DISCONNECTED, CONNECTING, CONNECTED, ERROR)
 * - Errores de conexión
 * - Contador de mensajes recibidos
 * - Último mensaje de ubicación recibido
 *
 * Es actualizado por MqttInitializer y consumido por componentes UI
 */
export const useMqttStore = create<MqttState & MqttActions>((set) => ({
    ...initialState,

    setStatus: (status) => set({ status }),

    setError: (error) => set({ error }),

    incrementMessageCount: () => set((state) => ({
        messageCount: state.messageCount + 1
    })),

    setLastMessage: (message) => set({ lastMessage: message }),

    reset: () => set(initialState),
}));
