import { useEffect, useRef } from 'react';
import { mqttService } from '@features/tracking/services/mqtt/mqtt.service';
import { mqttHandlers } from '@features/tracking/services/mqtt/mqtt.handlers';
import { useDroneStore } from '@features/drones';
import { useGeofenceEventsStore } from '@features/tracking/store/useGeofenceEventsStore';
import { useMqttStore } from '@features/tracking/store/useMqttStore';
import { INITIAL_SUBSCRIPTIONS } from '@config/mqtt.config';

// Estado global fuera de React para evitar problemas con StrictMode
let isGloballyInitialized = false;
let globalCleanupFunctions: Array<() => void> = [];
let connectionInProgress = false;

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
    // Usar refs para las funciones de Zustand para evitar re-ejecución del useEffect
    const updateDroneLocationRef = useRef(useDroneStore.getState().updateDroneLocation);
    const addGeofenceEventRef = useRef(useGeofenceEventsStore.getState().addEvent);
    const mqttStoreRef = useRef(useMqttStore.getState());

    // Mantener refs actualizados sin causar re-renders
    useEffect(() => {
        updateDroneLocationRef.current = useDroneStore.getState().updateDroneLocation;
        addGeofenceEventRef.current = useGeofenceEventsStore.getState().addEvent;
        mqttStoreRef.current = useMqttStore.getState();
    });

    useEffect(() => {
        // Si ya está inicializado globalmente, no hacer nada
        if (isGloballyInitialized) {
            console.log('[MqttInitializer] Ya inicializado, saltando...');
            return;
        }

        // Evitar inicialización concurrente
        if (connectionInProgress) {
            console.log('[MqttInitializer] Conexión en progreso, saltando...');
            return;
        }

        // Primera inicialización
        isGloballyInitialized = true;
        connectionInProgress = true;

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
            mqttStoreRef.current.setStatus('CONNECTED');
            mqttStoreRef.current.setError(null);
            subscribeToInitialTopics();
        });
        globalCleanupFunctions.push(unsubscribeConnect);

        // Registrar handler de desconexión
        const unsubscribeDisconnect = mqttService.onDisconnect(() => {
            mqttStoreRef.current.setStatus('DISCONNECTED');
        });
        globalCleanupFunctions.push(unsubscribeDisconnect);

        // Registrar handler de errores
        const unsubscribeError = mqttService.onError((err) => {
            mqttStoreRef.current.setError(err);
            mqttStoreRef.current.setStatus('ERROR');
        });
        globalCleanupFunctions.push(unsubscribeError);

        // Registrar callbacks para datos usando refs
        const unsubscribeLocation = mqttHandlers.onLocation((message) => {
            updateDroneLocationRef.current(message);
            mqttStoreRef.current.incrementMessageCount();
            mqttStoreRef.current.setLastMessage(message);
        });
        globalCleanupFunctions.push(unsubscribeLocation);

        const unsubscribeGeoEvent = mqttHandlers.onGeoEvent((event) => {
            addGeofenceEventRef.current(event);
        });
        globalCleanupFunctions.push(unsubscribeGeoEvent);

        // Conectar al broker
        mqttStoreRef.current.setStatus('CONNECTING');
        mqttService.connect()
            .then(() => {
                connectionInProgress = false;
            })
            .catch((err) => {
                connectionInProgress = false;
                const connectionError = err instanceof Error ? err : new Error('Error de conexión MQTT');
                mqttStoreRef.current.setError(connectionError);
                mqttStoreRef.current.setStatus('ERROR');
                console.error('[MqttInitializer] Error al conectar:', connectionError);
            });

        // En desarrollo con StrictMode, no hacer cleanup real
        // La conexión persiste durante toda la vida de la app
        return () => {
            // No limpiar en desarrollo - StrictMode causa unmount/remount
        };
    }, []); // Sin dependencias - solo se ejecuta una vez

    return null;
};
