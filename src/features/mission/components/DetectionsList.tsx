import { Target, Clock, Camera, ChevronRight } from 'lucide-react';
import type { VideoTrack } from '@shared/types/detection.types';

interface DetectionsListProps {
    tracks: VideoTrack[];
    onTrackSelect: (track: VideoTrack) => void;
    currentVideoTime: number;
}

export const DetectionsList = ({ tracks, onTrackSelect, currentVideoTime }: DetectionsListProps) => {
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const formatDuration = (seconds: number): string => {
        if (seconds < 1) {
            return `${(seconds * 1000).toFixed(0)}ms`;
        }
        return `${seconds.toFixed(1)}s`;
    };

    // Verificar si el track está activo en el tiempo actual del video
    const isTrackActive = (track: VideoTrack): boolean => {
        return currentVideoTime >= track.startTimeSeconds && currentVideoTime <= track.endTimeSeconds;
    };

    // Agrupar tracks por className
    const groupedTracks = tracks.reduce((acc, track) => {
        if (!acc[track.className]) {
            acc[track.className] = [];
        }
        acc[track.className].push(track);
        return acc;
    }, {} as Record<string, VideoTrack[]>);

    const classColors: Record<string, string> = {
        'person': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
        'car': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
        'truck': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
        'bicycle': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
        'motorcycle': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
        'default': 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
    };

    const getClassColor = (className: string): string => {
        return classColors[className.toLowerCase()] || classColors.default;
    };

    if (tracks.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 h-full flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
                    No hay detecciones disponibles para esta misión
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow h-full flex flex-col">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide flex items-center gap-2">
                        <Target className="w-4 h-4 text-blue-500" />
                        Detecciones IA
                    </h3>
                    <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded font-medium">
                        {tracks.length} tracks
                    </span>
                </div>
            </div>

            {/* Lista scrolleable */}
            <div className="flex-1 overflow-y-auto">
                <div className="p-3 space-y-3">
                    {Object.entries(groupedTracks).map(([className, classTracks]) => (
                        <div key={className} className="space-y-2">
                            {/* Título de categoría */}
                            <div className="flex items-center gap-2 px-2">
                                <span className={`text-xs font-semibold px-2 py-1 rounded ${getClassColor(className)}`}>
                                    {className}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    ({classTracks.length})
                                </span>
                            </div>

                            {/* Tracks de esta clase */}
                            {classTracks.map((track) => {
                                const active = isTrackActive(track);
                                return (
                                    <button
                                        key={track.id}
                                        onClick={() => onTrackSelect(track)}
                                        className={`w-full text-left p-3 rounded-lg transition-all ${
                                            active
                                                ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500'
                                                : 'bg-gray-50 dark:bg-gray-700/50 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-mono font-semibold text-gray-900 dark:text-white">
                                                        Track #{track.trackId}
                                                    </span>
                                                    {active && (
                                                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        <span className="font-mono">{formatTime(track.startTimeSeconds)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Camera className="w-3 h-3" />
                                                        <span>{track.detections} frames</span>
                                                    </div>
                                                </div>

                                                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                    Duración: {formatDuration(track.durationSeconds)}
                                                </div>
                                            </div>

                                            <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-colors ${
                                                active ? 'text-blue-500' : 'text-gray-400'
                                            }`} />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
