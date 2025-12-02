import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Video, Clock, Calendar, Gauge, Navigation, Battery, Mountain } from 'lucide-react';
import { PlaybackVideoPlayer } from '../components/PlaybackVideoPlayer';
import { PlaybackMap } from '../components/PlaybackMap';
import {
    usePlaybackTelemetry,
    extractTimestampFromFilename,
    extractVehicleIdFromFilename,
    TelemetryPoint
} from '../hooks/usePlaybackTelemetry';

// Configuración temporal - En producción esto vendría de un API de grabaciones
const RECORDINGS_BASE_URL = import.meta.env.VITE_MEDIAMTX_HLS_URL || 'http://localhost:8080';

// Video de ejemplo hardcodeado por ahora
const DEFAULT_VIDEO_FILENAME = 'DRONE-005_1764531709.mp4';

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

    if (!telemetry) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-3 h-full flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Esperando telemetría...</p>
            </div>
        );
    }

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
                    value={telemetry.speed.toFixed(1)}
                    unit="m/s"
                    colorClass="text-green-500"
                />
                <MetricCard
                    icon={<Mountain className="w-3 h-3" />}
                    label="Altitud"
                    value={telemetry.altitude.toFixed(1)}
                    unit="m"
                    colorClass="text-blue-500"
                />
                <MetricCard
                    icon={<Navigation className="w-3 h-3" />}
                    label="Rumbo"
                    value={telemetry.heading.toFixed(0)}
                    unit="°"
                    colorClass="text-purple-500"
                />
                <MetricCard
                    icon={<Battery className="w-3 h-3" />}
                    label="Batería"
                    value={telemetry.batteryLevel.toFixed(0)}
                    unit="%"
                    colorClass={telemetry.batteryLevel > 50 ? 'text-green-500' : telemetry.batteryLevel > 20 ? 'text-yellow-500' : 'text-red-500'}
                />
            </div>

            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Coordenadas: </span>
                    <span className="font-mono text-xs text-gray-900 dark:text-white">
                        {telemetry.latitude.toFixed(6)}, {telemetry.longitude.toFixed(6)}
                    </span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(telemetry.timestamp).toLocaleTimeString('es-CO')}
                </span>
            </div>
        </div>
    );
};

export const MissionPlaybackPage = () => {
    const { id: _missionId } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // Extraer información del nombre del archivo
    const videoFilename = DEFAULT_VIDEO_FILENAME;
    const vehicleId = extractVehicleIdFromFilename(videoFilename) || 'DRONE-005';
    const videoStartTimestamp = extractTimestampFromFilename(videoFilename) || Date.now();

    // URL del video - Por ahora apunta al archivo estático
    // En producción esto vendría de un servicio de grabaciones
    const videoUrl = `${RECORDINGS_BASE_URL}/videos/${videoFilename}`;

    // Estado del playback
    const [currentVideoTime, setCurrentVideoTime] = useState(0);
    const [_videoDuration, setVideoDuration] = useState(0);

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
        enabled: true
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
                            Reproducción de Misión
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
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-xs text-white bg-blue-600 px-3 py-1.5 rounded-full font-medium">
                            MISIÓN FINALIZADA
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
                        <PlaybackVideoPlayer
                            videoUrl={videoUrl}
                            title={`Grabación - ${vehicleId}`}
                            onTimeUpdate={handleTimeUpdate}
                            onSeek={handleSeek}
                        />
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
                            />
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};
