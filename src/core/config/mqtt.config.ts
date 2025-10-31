import type { IClientOptions } from 'mqtt';
import type { TopicSubscription } from '@shared/types/drone.types';
import { MqttTopics } from '@shared/types/drone.types';

// Configuración del broker MQTT
export const MQTT_BROKER_CONFIG = {
    url: import.meta.env.VITE_MQTT_BROKER_URL || 'ws://127.0.0.1:9001',
    username: import.meta.env.VITE_MQTT_USERNAME || '',
    password: import.meta.env.VITE_MQTT_PASSWORD || '',
    clientId: import.meta.env.VITE_MQTT_CLIENT_ID || `umas-${Math.random().toString(16).slice(2, 10)}`,
} as const;

// Opciones del cliente MQTT
export const MQTT_CLIENT_OPTIONS: IClientOptions = {
    clientId: MQTT_BROKER_CONFIG.clientId,
    username: MQTT_BROKER_CONFIG.username,
    password: MQTT_BROKER_CONFIG.password,
    clean: true,
    reconnectPeriod: 10000, // Aumentado a 10 segundos para evitar sobrecarga de conexiones
    connectTimeout: 30000,
    keepalive: 60,
    protocolVersion: 4, // MQTT 3.1.1 (más compatible que v5)
    // Opciones de reconexión automática
    resubscribe: true,
    // Ruta WebSocket (debe coincidir con la configuración del broker)
    path: '/mqtt',
    // Limitar reintentos de reconexión
    properties: {
        // sessionExpiryInterval: 300, // 5 minutos
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