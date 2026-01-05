import { useState, useEffect, useCallback, useRef } from 'react';

// Estructura interna normalizada para el frontend
export interface TelemetryPoint {
    id: string;
    vehicleId: string;
    latitude: number;
    longitude: number;
    altitude: number;
    speed: number;
    heading: number;
    batteryLevel: number;
    timestamp: string;
}

// Estructura que viene del API
interface ApiTelemetryResponse {
    id: string;
    vehicleId: string;
    telemetryType: string;
    location: {
        latitude: number;
        longitude: number;
        altitude: number;
        accuracy: number;
    };
    metrics: {
        speed: number;
        heading: number;
        batteryLevel: number;
        temperature: number;
        signalStrength: number;
    };
    timestamp: string;
    createdAt: string;
}

interface UsePlaybackTelemetryOptions {
    vehicleId: string;
    videoStartTimestamp: number; // Unix timestamp when the video recording started
    enabled?: boolean;
}

interface UsePlaybackTelemetryReturn {
    telemetryData: TelemetryPoint[];
    currentTelemetry: TelemetryPoint | null;
    isLoading: boolean;
    error: string | null;
    syncToVideoTime: (videoCurrentTime: number) => void;
    loadTelemetryRange: (startDate: string, endDate: string) => Promise<void>;
}

// Usar la configuración centralizada que ya incluye /api
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

/**
 * Normaliza un timestamp del API a formato ISO UTC
 * El API retorna timestamps sin timezone (ej: "2025-11-30T19:41:49")
 * y deben ser tratados como UTC, no como hora local
 */
const normalizeTimestamp = (timestamp: string): string => {
    // Si ya tiene timezone info, retornarlo tal cual
    if (timestamp.endsWith('Z') || timestamp.includes('+') || timestamp.includes('-', 10)) {
        return timestamp;
    }
    // Agregar 'Z' para indicar que es UTC
    return timestamp + 'Z';
};

/**
 * Mapea la respuesta del API a la estructura interna del frontend
 */
const mapApiResponseToTelemetryPoint = (apiData: ApiTelemetryResponse): TelemetryPoint => ({
    id: apiData.id,
    vehicleId: apiData.vehicleId,
    latitude: apiData.location.latitude,
    longitude: apiData.location.longitude,
    altitude: apiData.location.altitude,
    speed: apiData.metrics.speed,
    heading: apiData.metrics.heading,
    batteryLevel: apiData.metrics.batteryLevel,
    timestamp: normalizeTimestamp(apiData.timestamp),
});

/**
 * Hook para sincronizar la telemetría histórica con la reproducción de video
 *
 * @param options - Opciones de configuración
 * @returns Estado de telemetría y funciones de control
 */
export const usePlaybackTelemetry = ({
    vehicleId,
    videoStartTimestamp,
    enabled = true
}: UsePlaybackTelemetryOptions): UsePlaybackTelemetryReturn => {
    const [telemetryData, setTelemetryData] = useState<TelemetryPoint[]>([]);
    const [currentTelemetry, setCurrentTelemetry] = useState<TelemetryPoint | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const telemetryIndexRef = useRef(0);

    /**
     * Carga telemetría en un rango de fechas desde el API
     */
    const loadTelemetryRange = useCallback(async (startDate: string, endDate: string) => {
        if (!vehicleId || !enabled) return;

        setIsLoading(true);
        setError(null);

        try {
            const url = `${API_BASE_URL}/telemetry/vehicle/${vehicleId}/range?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const apiData: ApiTelemetryResponse[] = await response.json();

            // Mapear respuesta del API a estructura interna y ordenar por timestamp
            const mappedData = apiData.map(mapApiResponseToTelemetryPoint);
            const sortedData = mappedData.sort((a, b) =>
                new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            );

            setTelemetryData(sortedData);

            if (sortedData.length > 0) {
                setCurrentTelemetry(sortedData[0]);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al cargar telemetría';
            setError(errorMessage);
            console.error('Error loading telemetry:', err);
        } finally {
            setIsLoading(false);
        }
    }, [vehicleId, enabled]);

    /**
     * Sincroniza la telemetría con el tiempo actual del video
     *
     * @param videoCurrentTime - Tiempo actual del video en segundos
     */
    const syncToVideoTime = useCallback((videoCurrentTime: number) => {
        if (telemetryData.length === 0) {
            console.log('[Telemetry Sync] No telemetry data available');
            return;
        }

        // Usar el primer punto de telemetría como referencia para sincronización
        // Esto es más confiable que usar videoStartTimestamp de la misión
        // ya que los timestamps de telemetría reflejan cuando realmente se grabó
        const firstTelemetryTime = new Date(telemetryData[0].timestamp).getTime();
        const lastTelemetryTime = new Date(telemetryData[telemetryData.length - 1].timestamp).getTime();

        // Calcular el timestamp correspondiente al tiempo del video
        // usando el primer punto de telemetría como t=0
        const targetTimestamp = firstTelemetryTime + (videoCurrentTime * 1000);

        // Debug logs (solo si hay cambio significativo)
        if (Math.abs(videoCurrentTime - telemetryIndexRef.current) > 1) {
            console.log('[Telemetry Sync] Video time:', videoCurrentTime, 's');
            console.log('[Telemetry Sync] Target:', new Date(targetTimestamp).toISOString());
            console.log('[Telemetry Sync] Telemetry range:', new Date(firstTelemetryTime).toISOString(), 'to', new Date(lastTelemetryTime).toISOString());
        }

        // Buscar el punto de telemetría más cercano usando búsqueda binaria
        let left = 0;
        let right = telemetryData.length - 1;
        let closestIndex = 0;
        let minDiff = Infinity;

        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            const telemetryTime = new Date(telemetryData[mid].timestamp).getTime();
            const diff = Math.abs(telemetryTime - targetTimestamp);

            if (diff < minDiff) {
                minDiff = diff;
                closestIndex = mid;
            }

            if (telemetryTime < targetTimestamp) {
                left = mid + 1;
            } else if (telemetryTime > targetTimestamp) {
                right = mid - 1;
            } else {
                break;
            }
        }

        // Solo actualizar si cambió el índice (evitar re-renders innecesarios)
        if (closestIndex !== telemetryIndexRef.current) {
            telemetryIndexRef.current = closestIndex;
            setCurrentTelemetry(telemetryData[closestIndex]);
        }
    }, [telemetryData]);

    // Cargar telemetría inicial cuando se habilita el hook
    useEffect(() => {
        if (!enabled || !vehicleId || !videoStartTimestamp) return;

        // Calcular rango de fechas basado en el timestamp del video
        // Usamos el día completo de la fecha de la misión para capturar toda la telemetría
        // ya que puede haber diferencias de timezone entre el startDate y los timestamps reales
        const missionDate = new Date(videoStartTimestamp);

        // Inicio del día UTC
        const startDate = new Date(Date.UTC(
            missionDate.getUTCFullYear(),
            missionDate.getUTCMonth(),
            missionDate.getUTCDate(),
            0, 0, 0, 0
        ));

        // Fin del día UTC
        const endDate = new Date(Date.UTC(
            missionDate.getUTCFullYear(),
            missionDate.getUTCMonth(),
            missionDate.getUTCDate(),
            23, 59, 59, 999
        ));

        loadTelemetryRange(
            startDate.toISOString(),
            endDate.toISOString()
        );
    }, [enabled, vehicleId, videoStartTimestamp, loadTelemetryRange]);

    return {
        telemetryData,
        currentTelemetry,
        isLoading,
        error,
        syncToVideoTime,
        loadTelemetryRange
    };
};

/**
 * Utilidad para extraer el timestamp del nombre del archivo de video
 * Formato esperado: DRONE-005_1764531709.mp4 -> 1764531709 (Unix timestamp en segundos)
 */
export const extractTimestampFromFilename = (filename: string): number | null => {
    const match = filename.match(/_(\d+)\.mp4$/);
    if (match) {
        // Convertir a milisegundos si es timestamp en segundos
        const timestamp = parseInt(match[1], 10);
        return timestamp < 10000000000 ? timestamp * 1000 : timestamp;
    }
    return null;
};

/**
 * Utilidad para extraer el vehicleId del nombre del archivo
 * Formato esperado: DRONE-005_1764531709.mp4 -> DRONE-005
 */
export const extractVehicleIdFromFilename = (filename: string): string | null => {
    const match = filename.match(/^([A-Za-z0-9_-]+)_\d+\.mp4$/);
    return match ? match[1] : null;
};
