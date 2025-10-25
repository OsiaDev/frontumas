import { useState, useEffect, useCallback } from 'react';
import { mqttService } from '../services/mqtt/mqtt.service';
import { mqttHandlers } from '../services/mqtt/mqtt.handlers';
import { INITIAL_SUBSCRIPTIONS } from '@config/mqtt.config';
import type { MqttTopics } from '@shared/types/drone.types';

export type ConnectionStatus = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR';

interface UseMqttConnectionReturn {
    status: ConnectionStatus;
    error: Error | null;
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;
    subscribe: (topic: MqttTopics, qos?: 0 | 1 | 2) => Promise<void>;
    unsubscribe: (topic: MqttTopics) => Promise<void>;
    isConnected: boolean;
}

export const useMqttConnection = (): UseMqttConnectionReturn => {
    const [status, setStatus] = useState<ConnectionStatus>('DISCONNECTED');
    const [error, setError] = useState<Error | null>(null);

    // Conectar al broker MQTT
    const connect = useCallback(async () => {
        if (status === 'CONNECTING' || status === 'CONNECTED') {
            return;
        }

        setStatus('CONNECTING');
        setError(null);

        try {
            await mqttService.connect();
            setStatus('CONNECTED');

            // Suscribirse a topics iniciales habilitados
            const enabledSubscriptions = INITIAL_SUBSCRIPTIONS.filter(sub => sub.enabled);

            for (const subscription of enabledSubscriptions) {
                await mqttService.subscribe(subscription.topic, { qos: subscription.qos });
            }

        } catch (err) {
            const connectionError = err instanceof Error ? err : new Error('Error de conexión MQTT');
            setError(connectionError);
            setStatus('ERROR');
            throw connectionError;
        }
    }, [status]);

    // Desconectar del broker MQTT
    const disconnect = useCallback(async () => {
        try {
            await mqttService.disconnect();
            setStatus('DISCONNECTED');
            setError(null);
        } catch (err) {
            const disconnectError = err instanceof Error ? err : new Error('Error al desconectar');
            setError(disconnectError);
            throw disconnectError;
        }
    }, []);

    // Suscribirse a un topic específico
    const subscribe = useCallback(async (topic: MqttTopics, qos: 0 | 1 | 2 = 1) => {
        try {
            await mqttService.subscribe(topic, { qos });
        } catch (err) {
            const subscribeError = err instanceof Error ? err : new Error(`Error al suscribirse a ${topic}`);
            setError(subscribeError);
            throw subscribeError;
        }
    }, []);

    // Desuscribirse de un topic específico
    const unsubscribe = useCallback(async (topic: MqttTopics) => {
        try {
            await mqttService.unsubscribe(topic);
        } catch (err) {
            const unsubscribeError = err instanceof Error ? err : new Error(`Error al desuscribirse de ${topic}`);
            setError(unsubscribeError);
            throw unsubscribeError;
        }
    }, []);

    // Registrar manejadores de eventos MQTT
    useEffect(() => {
        // Manejador de mensajes
        const unsubscribeMessage = mqttService.onMessage((topic, payload) => {
            mqttHandlers.handleMessage(topic, payload);
        });

        // Manejador de conexión
        const unsubscribeConnect = mqttService.onConnect(() => {
            setStatus('CONNECTED');
            setError(null);
        });

        // Manejador de desconexión
        const unsubscribeDisconnect = mqttService.onDisconnect(() => {
            setStatus('DISCONNECTED');
        });

        // Manejador de errores
        const unsubscribeError = mqttService.onError((err) => {
            setError(err);
            setStatus('ERROR');
        });

        // Cleanup
        return () => {
            unsubscribeMessage();
            unsubscribeConnect();
            unsubscribeDisconnect();
            unsubscribeError();
        };
    }, []);

    return {
        status,
        error,
        connect,
        disconnect,
        subscribe,
        unsubscribe,
        isConnected: status === 'CONNECTED',
    };
};
