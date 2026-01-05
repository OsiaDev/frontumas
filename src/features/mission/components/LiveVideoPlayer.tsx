import { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, RefreshCw, Video, VideoOff } from 'lucide-react';
import Hls from 'hls.js';

interface LiveVideoPlayerProps {
    droneId?: string;
    title?: string;
}

const MEDIAMTX_HLS_URL = import.meta.env.VITE_MEDIAMTX_HLS_URL || 'http://localhost:8080';

export const LiveVideoPlayer = ({
    droneId,
    title = 'Video en Vivo'
}: LiveVideoPlayerProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    const hlsUrl = droneId
        ? `${MEDIAMTX_HLS_URL}/dron-${droneId}/live/index.m3u8`
        : null;

    const destroyHls = () => {
        if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
        }
        setIsConnected(false);
        setIsPlaying(false);
    };

    const initializeHls = () => {
        if (!hlsUrl || !videoRef.current) return;

        destroyHls();
        setIsLoading(true);
        setError(null);

        if (Hls.isSupported()) {
            const hls = new Hls({
                lowLatencyMode: false,
                enableWorker: true,
                backBufferLength: 90,
                maxBufferLength: 30,
                maxMaxBufferLength: 60,
                liveSyncDurationCount: 3,
                liveMaxLatencyDurationCount: 10,
                liveDurationInfinity: true,
                fragLoadingMaxRetry: 6,
                levelLoadingMaxRetry: 6,
                manifestLoadingMaxRetry: 6
            });

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                setIsLoading(false);
                setIsConnected(true);
                videoRef.current?.play().catch(() => {
                    // Autoplay blocked, user needs to click play
                });
            });

            hls.on(Hls.Events.ERROR, (_event, data) => {
                if (data.fatal) {
                    setIsLoading(false);
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            if (data.details === 'manifestLoadError') {
                                setError('Stream no disponible. Verifica que el dron esté transmitiendo.');
                                setIsConnected(false);
                            } else {
                                hls.startLoad();
                            }
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            hls.recoverMediaError();
                            break;
                        default:
                            setError('Error de reproducción');
                            destroyHls();
                            break;
                    }
                }
            });

            hls.loadSource(hlsUrl);
            hls.attachMedia(videoRef.current);
            hlsRef.current = hls;
        } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
            // Safari native HLS support
            videoRef.current.src = hlsUrl;
            videoRef.current.addEventListener('loadedmetadata', () => {
                setIsLoading(false);
                setIsConnected(true);
                videoRef.current?.play().catch(() => {});
            });
        } else {
            setError('Tu navegador no soporta HLS');
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (droneId) {
            initializeHls();
        } else {
            destroyHls();
        }

        return () => {
            destroyHls();
        };
    }, [droneId]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);

        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);

        return () => {
            video.removeEventListener('play', handlePlay);
            video.removeEventListener('pause', handlePause);
        };
    }, []);

    const togglePlay = () => {
        if (!videoRef.current) return;
        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play().catch(() => {});
        }
    };

    const toggleMute = () => {
        if (!videoRef.current) return;
        videoRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
    };

    const toggleFullscreen = () => {
        if (!videoRef.current) return;
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            videoRef.current.requestFullscreen();
        }
    };

    const handleRetry = () => {
        initializeHls();
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden h-full flex flex-col">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {isConnected ? (
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    ) : (
                        <div className="w-3 h-3 bg-gray-400 rounded-full" />
                    )}
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {title}
                    </h3>
                </div>
                <div className="flex items-center gap-2">
                    {droneId && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                            {droneId}
                        </span>
                    )}
                    {isConnected && (
                        <span className="text-xs text-white bg-red-500 px-2 py-1 rounded font-medium">
                            EN VIVO
                        </span>
                    )}
                </div>
            </div>

            {/* Video Container */}
            <div className="flex-1 relative bg-gray-900">
                <video
                    ref={videoRef}
                    className="absolute inset-0 w-full h-full object-contain"
                    muted={isMuted}
                    playsInline
                    autoPlay
                />

                {/* No drone selected state */}
                {!droneId && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                        <div className="text-center text-gray-400">
                            <VideoOff className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p className="text-lg">Selecciona un dron para ver su transmisión</p>
                        </div>
                    </div>
                )}

                {/* Loading state */}
                {isLoading && droneId && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
                        <div className="text-center text-white">
                            <RefreshCw className="w-12 h-12 mx-auto mb-4 animate-spin" />
                            <p>Conectando a {droneId}...</p>
                        </div>
                    </div>
                )}

                {/* Error state */}
                {error && droneId && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90">
                        <div className="text-center text-white max-w-md px-4">
                            <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p className="text-lg mb-4">{error}</p>
                            <button
                                onClick={handleRetry}
                                className="px-4 py-2 bg-primary hover:bg-primary/90 rounded-lg transition-colors inline-flex items-center gap-2"
                            >
                                <RefreshCw size={16} />
                                Reintentar
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={togglePlay}
                            disabled={!isConnected}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
                        >
                            {isPlaying ? (
                                <Pause size={18} className="text-gray-700 dark:text-gray-300" />
                            ) : (
                                <Play size={18} className="text-gray-700 dark:text-gray-300" />
                            )}
                        </button>
                        <button
                            onClick={toggleMute}
                            disabled={!isConnected}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
                        >
                            {isMuted ? (
                                <VolumeX size={18} className="text-gray-700 dark:text-gray-300" />
                            ) : (
                                <Volume2 size={18} className="text-gray-700 dark:text-gray-300" />
                            )}
                        </button>
                        {droneId && !isConnected && !isLoading && (
                            <button
                                onClick={handleRetry}
                                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                                aria-label="Reconectar"
                            >
                                <RefreshCw size={18} className="text-gray-700 dark:text-gray-300" />
                            </button>
                        )}
                    </div>
                    <button
                        onClick={toggleFullscreen}
                        disabled={!isConnected}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Pantalla completa"
                    >
                        <Maximize size={18} className="text-gray-700 dark:text-gray-300" />
                    </button>
                </div>
            </div>
        </div>
    );
};
