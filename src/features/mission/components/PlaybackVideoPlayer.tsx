import { useEffect, useRef, useState, useCallback } from 'react';
import {
    Play,
    Pause,
    Volume2,
    VolumeX,
    Maximize,
    SkipBack,
    SkipForward,
    Rewind,
    FastForward
} from 'lucide-react';

interface PlaybackVideoPlayerProps {
    videoUrl: string;
    title?: string;
    onTimeUpdate?: (currentTime: number, duration: number) => void;
    onSeek?: (time: number) => void;
}

export const PlaybackVideoPlayer = ({
    videoUrl,
    title = 'Reproducción de Misión',
    onTimeUpdate,
    onSeek
}: PlaybackVideoPlayerProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [playbackRate, setPlaybackRate] = useState(1);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleLoadedMetadata = () => {
            setDuration(video.duration);
            setIsLoading(false);
        };

        const handleTimeUpdate = () => {
            setCurrentTime(video.currentTime);
            onTimeUpdate?.(video.currentTime, video.duration);
        };

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);
        const handleError = () => {
            setError('Error al cargar el video');
            setIsLoading(false);
        };
        const handleWaiting = () => setIsLoading(true);
        const handleCanPlay = () => setIsLoading(false);

        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);
        video.addEventListener('error', handleError);
        video.addEventListener('waiting', handleWaiting);
        video.addEventListener('canplay', handleCanPlay);

        return () => {
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('play', handlePlay);
            video.removeEventListener('pause', handlePause);
            video.removeEventListener('error', handleError);
            video.removeEventListener('waiting', handleWaiting);
            video.removeEventListener('canplay', handleCanPlay);
        };
    }, [onTimeUpdate]);

    const togglePlay = useCallback(() => {
        if (!videoRef.current) return;
        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play().catch(() => {});
        }
    }, [isPlaying]);

    const toggleMute = useCallback(() => {
        if (!videoRef.current) return;
        videoRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
    }, [isMuted]);

    const toggleFullscreen = useCallback(() => {
        if (!videoRef.current) return;
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            videoRef.current.requestFullscreen();
        }
    }, []);

    const seek = useCallback((time: number) => {
        if (!videoRef.current) return;
        const clampedTime = Math.max(0, Math.min(time, duration));
        videoRef.current.currentTime = clampedTime;
        onSeek?.(clampedTime);
    }, [duration, onSeek]);

    const skipBackward = useCallback(() => seek(currentTime - 10), [currentTime, seek]);
    const skipForward = useCallback(() => seek(currentTime + 10), [currentTime, seek]);
    const rewind = useCallback(() => seek(currentTime - 30), [currentTime, seek]);
    const fastForward = useCallback(() => seek(currentTime + 30), [currentTime, seek]);

    const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!progressRef.current || !duration) return;
        const rect = progressRef.current.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        seek(percent * duration);
    }, [duration, seek]);

    const changePlaybackRate = useCallback(() => {
        if (!videoRef.current) return;
        const rates = [0.5, 1, 1.5, 2];
        const currentIndex = rates.indexOf(playbackRate);
        const nextRate = rates[(currentIndex + 1) % rates.length];
        videoRef.current.playbackRate = nextRate;
        setPlaybackRate(nextRate);
    }, [playbackRate]);

    const formatTime = (time: number): string => {
        const hours = Math.floor(time / 3600);
        const minutes = Math.floor((time % 3600) / 60);
        const seconds = Math.floor(time % 60);
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden h-full flex flex-col">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {title}
                    </h3>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-white bg-blue-600 px-2 py-1 rounded font-medium">
                        PLAYBACK
                    </span>
                </div>
            </div>

            {/* Video Container */}
            <div className="flex-1 relative bg-gray-900">
                <video
                    ref={videoRef}
                    src={videoUrl}
                    className="absolute inset-0 w-full h-full object-contain"
                    muted={isMuted}
                    playsInline
                />

                {/* Loading overlay */}
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                {/* Error overlay */}
                {error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90">
                        <div className="text-center text-white">
                            <p className="text-lg mb-2">{error}</p>
                            <p className="text-sm text-gray-400">{videoUrl}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Progress Bar */}
            <div
                ref={progressRef}
                className="h-2 bg-gray-200 dark:bg-gray-700 cursor-pointer relative group"
                onClick={handleProgressClick}
            >
                <div
                    className="h-full bg-blue-500 transition-all"
                    style={{ width: `${progressPercent}%` }}
                />
                <div
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ left: `calc(${progressPercent}% - 8px)` }}
                />
            </div>

            {/* Controls */}
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    {/* Left controls */}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={rewind}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                            title="Retroceder 30s"
                        >
                            <Rewind size={18} className="text-gray-700 dark:text-gray-300" />
                        </button>
                        <button
                            onClick={skipBackward}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                            title="Retroceder 10s"
                        >
                            <SkipBack size={18} className="text-gray-700 dark:text-gray-300" />
                        </button>
                        <button
                            onClick={togglePlay}
                            className="p-3 bg-blue-500 hover:bg-blue-600 rounded-full transition-colors"
                        >
                            {isPlaying ? (
                                <Pause size={20} className="text-white" />
                            ) : (
                                <Play size={20} className="text-white" />
                            )}
                        </button>
                        <button
                            onClick={skipForward}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                            title="Adelantar 10s"
                        >
                            <SkipForward size={18} className="text-gray-700 dark:text-gray-300" />
                        </button>
                        <button
                            onClick={fastForward}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                            title="Adelantar 30s"
                        >
                            <FastForward size={18} className="text-gray-700 dark:text-gray-300" />
                        </button>
                    </div>

                    {/* Time display */}
                    <div className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                        {formatTime(currentTime)} / {formatTime(duration)}
                    </div>

                    {/* Right controls */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={changePlaybackRate}
                            className="px-2 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                            title="Velocidad de reproducción"
                        >
                            {playbackRate}x
                        </button>
                        <button
                            onClick={toggleMute}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                        >
                            {isMuted ? (
                                <VolumeX size={18} className="text-gray-700 dark:text-gray-300" />
                            ) : (
                                <Volume2 size={18} className="text-gray-700 dark:text-gray-300" />
                            )}
                        </button>
                        <button
                            onClick={toggleFullscreen}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                        >
                            <Maximize size={18} className="text-gray-700 dark:text-gray-300" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
