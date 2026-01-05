import { useEffect } from 'react';
import { mqttService } from '@features/tracking/services/mqtt/mqtt.service';
import { mqttHandlers } from '@features/tracking/services/mqtt/mqtt.handlers';
import { useDroneStore } from '@features/drones';
import { useGeofenceEventsStore } from '@features/tracking/store/useGeofenceEventsStore';
import { useMqttStore } from '@features/tracking/store/useMqttStore';
import { INITIAL_SUBSCRIPTIONS } from '@config/mqtt.config';

// Estado global fuera de React para evitar problemas con StrictMode
let isGloballyInitialized = false;
let globalCleanupFunctions: Array<() => void> = [];

/**
 * MqttInitializer - Inicializa y mantiene la conexión MQTT global
 *
 * Este componente:
 * - Se conecta al broker MQTT al montar
 * - Mantiene la conexión durante toda la sesión de la app
 * - Registra handlers globales para location y geofence events
 * - Actualiza los stores de Zustand (drones, geofence, mqtt status)
 */
export const MqttInitializer = () => {
    const updateDroneLocation = useDroneStore((state) => state.updateDroneLocation);
    const addGeofenceEvent = useGeofenceEventsStore((state) => state.addEvent);
    const { setStatus, setError, incrementMessageCount, setLastMessage } = useMqttStore();

    useEffect(() => {
        // Si ya está inicializado globalmente, solo re-registrar los handlers de React
        if (isGloballyInitialized) {
            // Re-registrar handlers que usan funciones de React/Zustand
            const unsubscribeLocation = mqttHandlers.onLocation((message) => {
                updateDroneLocation(message);
                incrementMessageCount();
                setLastMessage(message);
            });

            const unsubscribeGeoEvent = mqttHandlers.onGeoEvent((event) => {
                addGeofenceEvent(event);
            });

            return () => {
                unsubscribeLocation();
                unsubscribeGeoEvent();
            };
        }

        // Primera inicialización
        isGloballyInitialized = true;

        // Función para suscribirse a topics iniciales
        const subscribeToInitialTopics = async () => {
            const enabledSubscriptions = INITIAL_SUBSCRIPTIONS.filter(sub => sub.enabled);
            for (const subscription of enabledSubscriptions) {
                try {
                    await mqttService.subscribe(subscription.topic, { qos: subscription.qos });
                } catch (err) {
                    console.error(`[MqttInitializer] Error al suscribirse a ${subscription.topic}:`, err);
                }
            }
        };

        // Registrar handler de mensajes
        const unsubscribeMessage = mqttService.onMessage((topic, payload) => {
            mqttHandlers.handleMessage(topic, payload);
        });
        globalCleanupFunctions.push(unsubscribeMessage);

        // Registrar handler de conexión - aquí hacemos las suscripciones
        const unsubscribeConnect = mqttService.onConnect(() => {
            setStatus('CONNECTED');
            setError(null);
            subscribeToInitialTopics();
        });
        globalCleanupFunctions.push(unsubscribeConnect);

        // Registrar handler de desconexión
        const unsubscribeDisconnect = mqttService.onDisconnect(() => {
            setStatus('DISCONNECTED');
        });
        globalCleanupFunctions.push(unsubscribeDisconnect);

        // Registrar handler de errores
        const unsubscribeError = mqttService.onError((err) => {
            setError(err);
            setStatus('ERROR');
        });
        globalCleanupFunctions.push(unsubscribeError);

        // Registrar callbacks para datos
        const unsubscribeLocation = mqttHandlers.onLocation((message) => {
            updateDroneLocation(message);
            incrementMessageCount();
            setLastMessage(message);
        });
        globalCleanupFunctions.push(unsubscribeLocation);

        const unsubscribeGeoEvent = mqttHandlers.onGeoEvent((event) => {
            addGeofenceEvent(event);
        });
        globalCleanupFunctions.push(unsubscribeGeoEvent);

        // Conectar al broker
        setStatus('CONNECTING');
        mqttService.connect().catch((err) => {
            const connectionError = err instanceof Error ? err : new Error('Error de conexión MQTT');
            setError(connectionError);
            setStatus('ERROR');
            console.error('[MqttInitializer] Error al conectar:', connectionError);
        });

        // En desarrollo con StrictMode, no hacer cleanup real
        // La conexión persiste durante toda la vida de la app
        return () => {
            // No limpiar en desarrollo - StrictMode causa unmount/remount
        };
    }, [updateDroneLocation, addGeofenceEvent, setStatus, setError, incrementMessageCount, setLastMessage]);

    return null;
};
