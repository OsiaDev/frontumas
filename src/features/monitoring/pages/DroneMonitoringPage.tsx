import { useEffect, useState, useRef, useCallback } from 'react';
import { Monitor, Maximize2, Minimize2, X, WifiOff, Video } from 'lucide-react';
import Hls from 'hls.js';
import { dronesApiService } from '@features/drones/services/drones.api.service';
import type { DroneResponseDTO } from '@shared/types/api.types';

const MEDIAMTX_HLS_URL = import.meta.env.VITE_MEDIAMTX_HLS_URL || 'http://localhost:8080';

interface DroneVideoStatus {
    isConnected: boolean;
    isLoading: boolean;
    error: string | null;
}

// Componente de video individual para cada dron
const DroneVideoCard = ({
    drone,
    isExpanded,
    onExpand,
    onClose
}: {
    drone: DroneResponseDTO;
    isExpanded: boolean;
    onExpand: () => void;
    onClose: () => void;
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);
    const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [status, setStatus] = useState<DroneVideoStatus>({
        isConnected: false,
        isLoading: true,
        error: null
    });

    const hlsUrl = `${MEDIAMTX_HLS_URL}/dron-${drone.vehicleId}/live/index.m3u8`;

    // Usar ref para la URL para evitar recrear funciones
    const hlsUrlRef = useRef(hlsUrl);
    hlsUrlRef.current = hlsUrl;

    // Función estable para destruir HLS
    const destroyHls = useCallback(() => {
        if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
        }
    }, []);

    // Función estable para inicializar HLS usando refs
    const initializeHls = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;

        // Limpiar instancia anterior
        if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
        }

        setStatus({ isConnected: false, isLoading: true, error: null });

        const currentUrl = hlsUrlRef.current;

        if (Hls.isSupported()) {
            const hls = new Hls({
                lowLatencyMode: false,
                enableWorker: true,
                backBufferLength: 30,
                maxBufferLength: 15,
                maxMaxBufferLength: 30,
                liveSyncDurationCount: 2,
                liveMaxLatencyDurationCount: 5,
                liveDurationInfinity: true,
                fragLoadingMaxRetry: 3,
                levelLoadingMaxRetry: 3,
                manifestLoadingMaxRetry: 3,
                manifestLoadingTimeOut: 5000,
                fragLoadingTimeOut: 10000
            });

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                setStatus({ isConnected: true, isLoading: false, error: null });
                video.play().catch(() => {});
            });

            hls.on(Hls.Events.ERROR, (_event, data) => {
                if (data.fatal) {
                    const errorType = data.type === Hls.ErrorTypes.NETWORK_ERROR ? 'offline' : 'error';
                    setStatus({
                        isConnected: false,
                        isLoading: false,
                        error: errorType
                    });
                    if (hlsRef.current) {
                        hlsRef.current.destroy();
                        hlsRef.current = null;
                    }
                }
            });

            hls.loadSource(currentUrl);
            hls.attachMedia(video);
            hlsRef.current = hls;
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = currentUrl;
            const onLoaded = () => {
                setStatus({ isConnected: true, isLoading: false, error: null });
                video.play().catch(() => {});
            };
            const onError = () => {
                setStatus({ isConnected: false, isLoading: false, error: 'offline' });
            };
            video.addEventListener('loadedmetadata', onLoaded, { once: true });
            video.addEventListener('error', onError, { once: true });
        } else {
            setStatus({ isConnected: false, isLoading: false, error: 'No soportado' });
        }
    }, []); // Sin dependencias - usa refs internamente

    // Inicializar solo al montar, limpiar al desmontar
    useEffect(() => {
        initializeHls();
        return () => {
            destroyHls();
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
            }
        };
    }, [initializeHls, destroyHls]);

    // Reintentar conexión cada 30 segundos si está offline (independiente)
    useEffect(() => {
        // Limpiar timeout anterior si existe
        if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
            retryTimeoutRef.current = null;
        }

        if (status.error === 'offline') {
            retryTimeoutRef.current = setTimeout(() => {
                initializeHls();
            }, 30000);
        }

        return () => {
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
                retryTimeoutRef.current = null;
            }
        };
    }, [status.error, initializeHls]);

    const cardClasses = isExpanded
        ? 'fixed inset-4 z-50 bg-gray-900 rounded-xl shadow-2xl flex flex-col'
        : 'bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col aspect-video';

    return (
        <>
            {/* Overlay cuando está expandido */}
            {isExpanded && (
                <div
                    className="fixed inset-0 bg-black/70 z-40"
                    onClick={onClose}
                />
            )}

            <div className={cardClasses}>
                {/* Header */}
                <div className={`px-3 py-2 flex items-center justify-between ${isExpanded ? 'bg-gray-800' : 'border-b border-gray-200 dark:border-gray-700'}`}>
                    <div className="flex items-center gap-2 min-w-0">
                        {status.isConnected ? (
                            <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse flex-shrink-0" />
                        ) : status.isLoading ? (
                            <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full animate-pulse flex-shrink-0" />
                        ) : (
                            <div className="w-2.5 h-2.5 bg-gray-400 rounded-full flex-shrink-0" />
                        )}
                        <span className={`font-medium truncate ${isExpanded ? 'text-white text-lg' : 'text-gray-900 dark:text-white text-sm'}`}>
                            {drone.name}
                        </span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${isExpanded ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                            {drone.vehicleId}
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        {status.isConnected && (
                            <span className="text-xs text-white bg-red-500 px-2 py-0.5 rounded font-medium">
                                LIVE
                            </span>
                        )}
                        {isExpanded ? (
                            <button
                                onClick={onClose}
                                className="p-1.5 hover:bg-gray-700 rounded-full transition-colors"
                            >
                                <X size={18} className="text-white" />
                            </button>
                        ) : (
                            <button
                                onClick={onExpand}
                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                                title="Expandir"
                            >
                                <Maximize2 size={16} className="text-gray-600 dark:text-gray-400" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Video */}
                <div className="flex-1 relative bg-gray-900 min-h-0">
                    <video
                        ref={videoRef}
                        className="absolute inset-0 w-full h-full object-contain"
                        muted
                        playsInline
                        autoPlay
                    />

                    {/* Loading */}
                    {status.isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                            <div className="text-center text-gray-400">
                                <div className="w-8 h-8 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-2" />
                                <p className="text-xs">Conectando...</p>
                            </div>
                        </div>
                    )}

                    {/* Offline */}
                    {status.error === 'offline' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                            <div className="text-center text-gray-500">
                                <WifiOff className={`mx-auto mb-2 ${isExpanded ? 'w-16 h-16' : 'w-10 h-10'}`} />
                                <p className={`font-medium ${isExpanded ? 'text-lg' : 'text-sm'}`}>Offline</p>
                                <p className={`text-gray-600 ${isExpanded ? 'text-sm' : 'text-xs'}`}>Sin transmision</p>
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {status.error && status.error !== 'offline' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                            <div className="text-center text-gray-500">
                                <Video className={`mx-auto mb-2 ${isExpanded ? 'w-16 h-16' : 'w-10 h-10'}`} />
                                <p className={isExpanded ? 'text-lg' : 'text-sm'}>{status.error}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer con info adicional cuando está expandido */}
                {isExpanded && (
                    <div className="px-4 py-3 bg-gray-800 border-t border-gray-700">
                        <div className="flex items-center justify-between text-sm text-gray-400">
                            <div className="flex items-center gap-4">
                                <span>Modelo: <span className="text-white">{drone.model}</span></span>
                                <span>S/N: <span className="text-white">{drone.serialNumber}</span></span>
                                <span>Horas de vuelo: <span className="text-white">{drone.flightHours}h</span></span>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs ${
                                drone.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' :
                                drone.status === 'IN_MAINTENANCE' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-gray-500/20 text-gray-400'
                            }`}>
                                {drone.status}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export const DroneMonitoringPage = () => {
    const [drones, setDrones] = useState<DroneResponseDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedDroneId, setExpandedDroneId] = useState<string | null>(null);

    useEffect(() => {
        const loadDrones = async () => {
            try {
                setIsLoading(true);
                const data = await dronesApiService.getDrones();
                // Filtrar solo drones activos o en mantenimiento
                const activeDrones = data.filter(d =>
                    d.status === 'ACTIVE' || d.status === 'IN_MAINTENANCE'
                );
                setDrones(activeDrones);
                setError(null);
            } catch (err) {
                console.error('Error loading drones:', err);
                setError('Error al cargar los drones');
            } finally {
                setIsLoading(false);
            }
        };

        loadDrones();
    }, []);

    const handleExpand = (droneId: string) => {
        setExpandedDroneId(droneId);
    };

    const handleClose = () => {
        setExpandedDroneId(null);
    };

    // Cerrar con ESC
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && expandedDroneId) {
                handleClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [expandedDroneId]);

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">Cargando drones...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center text-red-500">
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col p-4 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <Monitor className="w-6 h-6 text-blue-500" />
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Monitoreo de Drones
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        {drones.length} drones
                    </span>
                </div>
            </div>

            {/* Grid de videos */}
            {drones.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center text-gray-500 dark:text-gray-400">
                        <Monitor className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">No hay drones disponibles</p>
                        <p className="text-sm">Los drones activos aparecerán aquí</p>
                    </div>
                </div>
            ) : (
                <div className="flex-1 overflow-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                        {drones.map((drone) => (
                            <DroneVideoCard
                                key={drone.id}
                                drone={drone}
                                isExpanded={expandedDroneId === drone.id}
                                onExpand={() => handleExpand(drone.id)}
                                onClose={handleClose}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
