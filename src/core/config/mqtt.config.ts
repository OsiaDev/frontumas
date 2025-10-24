import type { IClientOptions } from 'mqtt';
import type { TopicSubscription } from '@shared/types/drone.types';
import { MqttTopics } from '@shared/types/drone.types';

// Configuración del broker MQTT
export const MQTT_BROKER_CONFIG = {
    url: import.meta.env.MQTT_BROKER_URL || 'ws://localhost:9001',
    username: import.meta.env.MQTT_USERNAME || '',
    password: import.meta.env.MQTT_PASSWORD || '',
    clientId: import.meta.env.MQTT_CLIENT_ID || `umas-${Math.random().toString(16).slice(2, 10)}`,
} as const;

// Opciones del cliente MQTT
export const MQTT_CLIENT_OPTIONS: IClientOptions = {
    clientId: MQTT_BROKER_CONFIG.clientId,
    username: MQTT_BROKER_CONFIG.username,
    password: MQTT_BROKER_CONFIG.password,
    clean: true,
    reconnectPeriod: 5000,
    connectTimeout: 30000,
    keepalive: 60,
    protocolVersion: 5,
    // Opciones de reconexión automática
    resubscribe: true,
    // Will message para notificar desconexión
    will: {
        topic: 'umas/status',
        payload: JSON.stringify({
            clientId: MQTT_BROKER_CONFIG.clientId,
            status: 'offline',
            timestamp: new Date().toISOString(),
        }),
        qos: 1,
        retain: false,
    },
};

// Suscripciones iniciales (solo location por ahora)
export const INITIAL_SUBSCRIPTIONS: TopicSubscription[] = [
    {
        topic: MqttTopics.LOCATION,
        qos: 1,
        enabled: true,
    },
    {
        topic: MqttTopics.GEO_EVENT,
        qos: 1,
        enabled: false, // Deshabilitado por ahora
    },
    {
        topic: MqttTopics.ALERT,
        qos: 1,
        enabled: false, // Deshabilitado por ahora
    },
];

// Configuración de timeouts
export const MQTT_TIMEOUTS = {
    CONNECTION_TIMEOUT: 10000,
    RECONNECT_DELAY: 5000,
    INACTIVE_DRONE_TIMEOUT: 30000, // 30 segundos sin mensajes = inactivo
} as const;

// Logging de eventos MQTT (solo en desarrollo)
export const MQTT_DEBUG_ENABLED = import.meta.env.DEV;