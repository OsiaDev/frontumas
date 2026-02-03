import { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Video, Clock, Calendar, Navigation, AlertCircle, Gauge, Mountain, Compass, Battery } from 'lucide-react';
import { PlaybackVideoPlayer, PlaybackVideoPlayerRef } from '@/features/mission/components/PlaybackVideoPlayer';
import { PlaybackMap } from '@/features/mission/components/PlaybackMap';
import { DetectionsList } from '@/features/mission/components/DetectionsList';
import { usePlaybackTelemetry } from '@features/mission/hooks/usePlaybackTelemetry';
import { missionsApiService } from '@features/missions/services/missions.api.service';
import { routesApiService } from '@features/routes/services/routes.api.service';
import type { Mission } from '@shared/types/mission.types';
import type { Route } from '@shared/types/route.types';
import type { VideoTrack } from '@shared/types/detection.types';

// URL base para videos grabados por misión (nginx proxy con playback)
const RECORDINGS_BASE_URL = import.meta.env.VITE_RECORDINGS_URL || 'http://localhost:8090';

// Componente para mostrar métricas de telemetría
const MetricCard = ({
    icon,
    label,
    value,
    color
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    color: 'blue' | 'green' | 'purple' | 'yellow';
}) => {
    const colorClasses = {
        blue: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
        green: 'text-green-500 bg-green-50 dark:bg-green-900/20',
        purple: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20',
        yellow: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
    };

    return (
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
            <div className="flex items-center gap-1.5 mb-0.5">
                <span className={colorClasses[color].split(' ')[0]}>{icon}</span>
                <span className="text-xs text-gray-600 dark:text-gray-400">{label}</span>
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{value}</p>
        </div>
    );
};

export const MissionPlaybackPage = () => {
    const { id: missionId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const videoPlayerRef = useRef<PlaybackVideoPlayerRef>(null);

    // Estado para datos de la misión
    const [mission, setMission] = useState<Mission | null>(null);
    const [route, setRoute] = useState<Route | null>(null);
    const [isLoadingMission, setIsLoadingMission] = useState(true);
    const [missionError, setMissionError] = useState<string | null>(null);

    // Estado para detecciones de video
    const [videoTracks, setVideoTracks] = useState<VideoTrack[]>([]);
    const [isLoadingTracks, setIsLoadingTracks] = useState(false);
    const tracksLoadedRef = useRef<string | null>(null);

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
    const [videoDuration, setVideoDuration] = useState(0);

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

    // Cargar detecciones de video cuando la misión esté cargada
    useEffect(() => {
        const loadVideoTracks = async () => {
            if (!missionId) return;

            // Evitar solicitudes duplicadas para el mismo missionId
            if (tracksLoadedRef.current === missionId) {
                console.log('[VideoTracks] Skipping duplicate request for same mission');
                return;
            }
            tracksLoadedRef.current = missionId;

            setIsLoadingTracks(true);
            try {
                const tracks = await missionsApiService.getVideoTracks(missionId);
                setVideoTracks(tracks);
            } catch (err) {
                console.warn('No se pudieron cargar las detecciones de video:', err);
                setVideoTracks([]);
            } finally {
                setIsLoadingTracks(false);
            }
        };

        loadVideoTracks();
    }, [missionId]);

    // Hook de telemetría sincronizada
    // Solo se habilita cuando tenemos la duración del video (> 0)
    const {
        telemetryData,
        currentTelemetry,
        isLoading: isTelemetryLoading,
        error: telemetryError,
        syncToVideoTime
    } = usePlaybackTelemetry({
        vehicleId,
        videoStartTimestamp,
        videoDurationSeconds: videoDuration,
        enabled: !!mission && !!vehicleId && videoDuration > 0
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

    // Handler para cuando se selecciona una detección
    const handleTrackSelect = useCallback((track: VideoTrack) => {
        if (videoPlayerRef.current) {
            videoPlayerRef.current.seekTo(track.startTimeSeconds);
        }
    }, []);

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

            </div>

            {/* Main Content - Grid de 3 columnas: Video (izq), Detecciones (centro), Telemetría+Mapa (der) */}
            <div className="px-6 pb-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-220px)] min-h-[500px]">
                    {/* Video Player - 6/12 del espacio (izquierda) */}
                    <div className="lg:col-span-6 h-full">
                        {videoUrl ? (
                            <PlaybackVideoPlayer
                                ref={videoPlayerRef}
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

                    {/* Panel central - Lista de Detecciones */}
                    <div className="lg:col-span-3 h-full min-h-0 overflow-hidden">
                        {isLoadingTracks ? (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow h-full flex items-center justify-center">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Cargando detecciones...</p>
                                </div>
                            </div>
                        ) : (
                            <DetectionsList
                                tracks={videoTracks}
                                onTrackSelect={handleTrackSelect}
                                currentVideoTime={currentVideoTime}
                            />
                        )}
                    </div>

                    {/* Panel derecho - Telemetría arriba, Mapa abajo */}
                    <div className="lg:col-span-3 h-full flex flex-col gap-3">
                        {/* Panel de Telemetría */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-3 flex-shrink-0">
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Telemetría en tiempo de video
                            </h4>
                            <div className="grid grid-cols-2 gap-2">
                                <MetricCard
                                    icon={<Gauge className="w-4 h-4" />}
                                    label="Velocidad"
                                    value={currentTelemetry ? `${currentTelemetry.speed?.toFixed(1) || '0'} m/s` : '--'}
                                    color="blue"
                                />
                                <MetricCard
                                    icon={<Mountain className="w-4 h-4" />}
                                    label="Altitud"
                                    value={currentTelemetry ? `${currentTelemetry.altitude?.toFixed(1) || '0'} m` : '--'}
                                    color="green"
                                />
                                <MetricCard
                                    icon={<Compass className="w-4 h-4" />}
                                    label="Rumbo"
                                    value={currentTelemetry ? `${currentTelemetry.heading?.toFixed(0) || '0'}°` : '--'}
                                    color="purple"
                                />
                                <MetricCard
                                    icon={<Battery className="w-4 h-4" />}
                                    label="Batería"
                                    value={currentTelemetry ? `${currentTelemetry.batteryLevel?.toFixed(0) || '0'}%` : '--'}
                                    color="yellow"
                                />
                            </div>
                        </div>

                        {/* Mapa - ocupa el resto del espacio */}
                        <div className="flex-1 min-h-0">
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
