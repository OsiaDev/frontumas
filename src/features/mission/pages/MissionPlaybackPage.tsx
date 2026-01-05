import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Video, Clock, Calendar, Gauge, Navigation, Battery, Mountain, AlertCircle } from 'lucide-react';
import { PlaybackVideoPlayer } from '@/features/mission/components/PlaybackVideoPlayer';
import { PlaybackMap } from '@/features/mission/components/PlaybackMap';
import {
    usePlaybackTelemetry,
    TelemetryPoint
} from '@features/mission/hooks/usePlaybackTelemetry';
import { missionsApiService } from '@features/missions/services/missions.api.service';
import { routesApiService } from '@features/routes/services/routes.api.service';
import type { Mission } from '@shared/types/mission.types';
import type { Route } from '@shared/types/route.types';

// URL base para videos grabados por misión (nginx proxy con playback)
const RECORDINGS_BASE_URL = import.meta.env.VITE_RECORDINGS_URL || 'http://localhost:8090';

// Componente para mostrar una métrica individual
interface MetricCardProps {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    unit?: string;
    colorClass?: string;
}

const MetricCard = ({ icon, label, value, unit, colorClass = 'text-blue-500' }: MetricCardProps) => (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
        <div className="flex items-center gap-1 mb-0.5">
            <span className={colorClass}>{icon}</span>
            <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</span>
        </div>
        <div className="flex items-baseline gap-0.5">
            <span className="text-base font-bold text-gray-900 dark:text-white">{value}</span>
            {unit && <span className="text-[10px] text-gray-500 dark:text-gray-400">{unit}</span>}
        </div>
    </div>
);

// Panel de métricas compacto para layout horizontal
interface TelemetryPanelProps {
    telemetry: TelemetryPoint | null;
    videoTime: number;
}

const TelemetryPanel = ({ telemetry, videoTime }: TelemetryPanelProps) => {
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Helper para formatear valores numéricos de forma segura
    const safeFixed = (value: number | null | undefined, decimals: number): string => {
        if (value === null || value === undefined || isNaN(value)) {
            return '--';
        }
        return value.toFixed(decimals);
    };

    // Helper para formatear timestamps correctamente
    // El backend guarda timestamps en hora local de Colombia (sin timezone)
    const formatTimestamp = (timestamp: string): string => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('es-CO', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    if (!telemetry) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-3 h-full flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Esperando telemetría...</p>
            </div>
        );
    }

    const batteryLevel = telemetry.batteryLevel ?? 0;
    const batteryColorClass = batteryLevel > 50 ? 'text-green-500' : batteryLevel > 20 ? 'text-yellow-500' : 'text-red-500';

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-3 h-full">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
                    Telemetría
                </h3>
                <span className="text-xs font-mono bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
                    {formatTime(videoTime)}
                </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
                <MetricCard
                    icon={<Gauge className="w-3 h-3" />}
                    label="Velocidad"
                    value={safeFixed(telemetry.speed, 1)}
                    unit="m/s"
                    colorClass="text-green-500"
                />
                <MetricCard
                    icon={<Mountain className="w-3 h-3" />}
                    label="Altitud"
                    value={safeFixed(telemetry.altitude, 1)}
                    unit="m"
                    colorClass="text-blue-500"
                />
                <MetricCard
                    icon={<Navigation className="w-3 h-3" />}
                    label="Rumbo"
                    value={safeFixed(telemetry.heading, 0)}
                    unit="°"
                    colorClass="text-purple-500"
                />
                <MetricCard
                    icon={<Battery className="w-3 h-3" />}
                    label="Batería"
                    value={safeFixed(telemetry.batteryLevel, 0)}
                    unit="%"
                    colorClass={batteryColorClass}
                />
            </div>

            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Coordenadas: </span>
                    <span className="font-mono text-xs text-gray-900 dark:text-white">
                        {safeFixed(telemetry.latitude, 6)}, {safeFixed(telemetry.longitude, 6)}
                    </span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                    {telemetry.timestamp ? formatTimestamp(telemetry.timestamp) : '--:--:--'}
                </span>
            </div>
        </div>
    );
};

export const MissionPlaybackPage = () => {
    const { id: missionId } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // Estado para datos de la misión
    const [mission, setMission] = useState<Mission | null>(null);
    const [route, setRoute] = useState<Route | null>(null);
    const [isLoadingMission, setIsLoadingMission] = useState(true);
    const [missionError, setMissionError] = useState<string | null>(null);

    // Datos del dron seleccionado (primer dron de la misión)
    const selectedDrone = mission?.assignedDrones?.[0];
    const vehicleId = selectedDrone?.vehicleId || selectedDrone?.droneName || 'DRONE';
    const droneId = selectedDrone?.droneId;

    // Timestamp de inicio basado en la fecha de la misión
    const videoStartTimestamp = mission?.startDate
        ? new Date(mission.startDate).getTime()
        : mission?.estimatedDate
            ? new Date(mission.estimatedDate).getTime()
            : Date.now();

    // URL del video - estructura: /playback/{mission_id}/{dron-vehicleId}
    // El nginx sirve /videos/{mission_id}/dron-{vehicleId}.mp4
    const videoUrl = missionId && vehicleId
        ? `${RECORDINGS_BASE_URL}/playback/${missionId}/dron-${vehicleId}`
        : '';

    // Estado del playback
    const [currentVideoTime, setCurrentVideoTime] = useState(0);
    const [_videoDuration, setVideoDuration] = useState(0);

    // Cargar datos de la misión
    useEffect(() => {
        const loadMissionData = async () => {
            if (!missionId) {
                setMissionError('ID de misión no proporcionado');
                setIsLoadingMission(false);
                return;
            }

            setIsLoadingMission(true);
            setMissionError(null);

            try {
                // Cargar misión
                const missionData = await missionsApiService.getMissionById(missionId);
                setMission(missionData);

                // Cargar ruta si el dron tiene una asignada
                const firstDrone = missionData.assignedDrones?.[0];
                if (firstDrone?.routeId) {
                    try {
                        const routeData = await routesApiService.getRouteById(firstDrone.routeId);
                        setRoute(routeData);
                    } catch (routeErr) {
                        console.warn('No se pudo cargar la ruta:', routeErr);
                    }
                }
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Error al cargar la misión';
                setMissionError(errorMessage);
                console.error('Error loading mission:', err);
            } finally {
                setIsLoadingMission(false);
            }
        };

        loadMissionData();
    }, [missionId]);

    // Hook de telemetría sincronizada
    const {
        telemetryData,
        currentTelemetry,
        isLoading: isTelemetryLoading,
        error: telemetryError,
        syncToVideoTime
    } = usePlaybackTelemetry({
        vehicleId,
        videoStartTimestamp,
        enabled: !!mission && !!vehicleId
    });

    // Callback para actualización de tiempo del video
    const handleTimeUpdate = useCallback((currentTime: number, duration: number) => {
        setCurrentVideoTime(currentTime);
        setVideoDuration(duration);
        syncToVideoTime(currentTime);
    }, [syncToVideoTime]);

    // Callback para seek manual
    const handleSeek = useCallback((time: number) => {
        syncToVideoTime(time);
    }, [syncToVideoTime]);

    // Formatear timestamp para mostrar
    const formatRecordingDate = (timestamp: number): string => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('es-CO', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Estado de carga
    if (isLoadingMission) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Cargando misión...</p>
                </div>
            </div>
        );
    }

    // Error de carga
    if (missionError) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-600 dark:text-red-400 mb-4">{missionError}</p>
                    <button
                        onClick={() => navigate('/missions')}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                        Volver a misiones
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="pb-4">
            {/* Header Section */}
            <div className="px-6 pt-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <button
                            onClick={() => navigate('/missions')}
                            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Volver a misiones
                        </button>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Video className="w-7 h-7 text-blue-500" />
                            {mission?.name || 'Reproducción de Misión'}
                        </h2>
                        <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <Calendar size={16} />
                                <span>{formatRecordingDate(videoStartTimestamp)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <Clock size={16} />
                                <span>Dron: {vehicleId}</span>
                            </div>
                            {route && (
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <Navigation size={16} />
                                    <span>Ruta: {route.name}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className={`text-xs text-white px-3 py-1.5 rounded-full font-medium ${
                            mission?.state === 'FINALIZADA' ? 'bg-blue-600' :
                            mission?.state === 'EN_EJECUCION' ? 'bg-green-600' :
                            'bg-gray-600'
                        }`}>
                            {mission?.state || 'DESCONOCIDO'}
                        </span>
                    </div>
                </div>

                {/* Telemetry Status */}
                <div className="flex items-center gap-4 text-sm">
                    {isTelemetryLoading && (
                        <span className="text-yellow-600 dark:text-yellow-400">
                            Cargando telemetría...
                        </span>
                    )}
                    {telemetryError && (
                        <span className="text-red-600 dark:text-red-400">
                            Error: {telemetryError}
                        </span>
                    )}
                    {!isTelemetryLoading && !telemetryError && telemetryData.length > 0 && (
                        <span className="text-green-600 dark:text-green-400">
                            {telemetryData.length} puntos de telemetría cargados
                        </span>
                    )}
                    {!isTelemetryLoading && !telemetryError && telemetryData.length === 0 && (
                        <span className="text-gray-500 dark:text-gray-400">
                            No hay telemetría disponible para este período
                        </span>
                    )}
                </div>
            </div>

            {/* Main Content - Video izquierda (grande), Telemetría+Mapa derecha */}
            <div className="px-6 pb-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-220px)] min-h-[500px]">
                    {/* Video Player - 8/12 del espacio (izquierda) */}
                    <div className="lg:col-span-8 h-full">
                        {videoUrl ? (
                            <PlaybackVideoPlayer
                                videoUrl={videoUrl}
                                title={`Grabación - ${vehicleId}`}
                                onTimeUpdate={handleTimeUpdate}
                                onSeek={handleSeek}
                            />
                        ) : (
                            <div className="h-full bg-gray-900 rounded-lg flex items-center justify-center">
                                <div className="text-center text-gray-400">
                                    <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                    <p>No hay video disponible para esta misión</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Panel derecho - Telemetría arriba, Mapa abajo */}
                    <div className="lg:col-span-4 flex flex-col gap-3 h-full">
                        {/* Telemetry Panel - altura fija */}
                        <div className="flex-shrink-0">
                            <TelemetryPanel
                                telemetry={currentTelemetry}
                                videoTime={currentVideoTime}
                            />
                        </div>

                        {/* Map - ocupa el resto del espacio */}
                        <div className="flex-1 min-h-[200px]">
                            <PlaybackMap
                                currentTelemetry={currentTelemetry}
                                telemetryHistory={telemetryData}
                                vehicleId={vehicleId}
                                showTrail={true}
                                route={route}
                            />
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};
