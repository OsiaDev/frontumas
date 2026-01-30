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

    const classColors: Record<string, { bg: string; text: string; icon: string }> = {
        'person': {
            bg: 'bg-blue-100 dark:bg-blue-900/30',
            text: 'text-blue-700 dark:text-blue-300',
            icon: '👤'
        },
        'car': {
            bg: 'bg-green-100 dark:bg-green-900/30',
            text: 'text-green-700 dark:text-green-300',
            icon: '🚗'
        },
        'truck': {
            bg: 'bg-orange-100 dark:bg-orange-900/30',
            text: 'text-orange-700 dark:text-orange-300',
            icon: '🚛'
        },
        'bicycle': {
            bg: 'bg-purple-100 dark:bg-purple-900/30',
            text: 'text-purple-700 dark:text-purple-300',
            icon: '🚲'
        },
        'motorcycle': {
            bg: 'bg-pink-100 dark:bg-pink-900/30',
            text: 'text-pink-700 dark:text-pink-300',
            icon: '🏍️'
        },
        'bus': {
            bg: 'bg-yellow-100 dark:bg-yellow-900/30',
            text: 'text-yellow-700 dark:text-yellow-300',
            icon: '🚌'
        },
        'default': {
            bg: 'bg-gray-100 dark:bg-gray-700',
            text: 'text-gray-700 dark:text-gray-300',
            icon: '📦'
        }
    };

    const getClassStyle = (className: string) => {
        return classColors[className.toLowerCase()] || classColors.default;
    };

    const translateClassName = (className: string): string => {
        const translations: Record<string, string> = {
            'person': 'Persona',
            'car': 'Auto',
            'truck': 'Camión',
            'bicycle': 'Bicicleta',
            'motorcycle': 'Motocicleta',
            'bus': 'Bus',
            'dog': 'Perro',
            'cat': 'Gato',
            'bird': 'Ave',
        };
        return translations[className.toLowerCase()] || className;
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
                    {Object.entries(groupedTracks).map(([className, classTracks]) => {
                        const style = getClassStyle(className);
                        return (
                        <div key={className} className="space-y-2">
                            {/* Título de categoría */}
                            <div className="flex items-center gap-2 px-2">
                                <span className={`text-sm font-bold px-3 py-1.5 rounded-lg ${style.bg} ${style.text} flex items-center gap-2`}>
                                    <span className="text-lg">{style.icon}</span>
                                    {translateClassName(className)}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                    {classTracks.length} {classTracks.length === 1 ? 'detección' : 'detecciones'}
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
                                                ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 shadow-md'
                                                : 'bg-gray-50 dark:bg-gray-700/50 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                {/* Encabezado con icono y tipo */}
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-xl">{style.icon}</span>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-sm font-bold ${style.text}`}>
                                                                {translateClassName(className)}
                                                            </span>
                                                            <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                                                                #{track.trackId}
                                                            </span>
                                                            {active && (
                                                                <span className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                                                                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                                                                    EN VIVO
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Información de tiempo */}
                                                <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 mb-1">
                                                    <div className="flex items-center gap-1 font-semibold">
                                                        <Clock className="w-3 h-3" />
                                                        <span className="font-mono">{formatTime(track.startTimeSeconds)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Camera className="w-3 h-3" />
                                                        <span>{track.detections} frames</span>
                                                    </div>
                                                </div>

                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    Duración: <span className="font-semibold">{formatDuration(track.durationSeconds)}</span>
                                                </div>
                                            </div>

                                            <ChevronRight className={`w-5 h-5 flex-shrink-0 transition-colors ${
                                                active ? 'text-blue-500' : 'text-gray-400'
                                            }`} />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    );})}
                </div>
            </div>
        </div>
    );
};
