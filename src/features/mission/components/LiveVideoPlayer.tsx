import { useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';

interface LiveVideoPlayerProps {
    videoUrl?: string;
    title?: string;
}

export const LiveVideoPlayer = ({
    videoUrl = 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    title = 'Video en Vivo'
}: LiveVideoPlayerProps) => {
    const [isMuted, setIsMuted] = useState(false);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden h-full flex flex-col">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {title}
                    </h3>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        EN VIVO
                    </span>
                </div>
            </div>

            {/* Video Container */}
            <div className="flex-1 relative bg-gray-900">
                <iframe
                    src={videoUrl}
                    title={title}
                    className="absolute inset-0 w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            </div>

            {/* Controls - Optional, can be customized */}
            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-750 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button
                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
                            aria-label="Reproducir/Pausar"
                        >
                            <Play size={18} className="text-gray-700 dark:text-gray-300" />
                        </button>
                        <button
                            onClick={() => setIsMuted(!isMuted)}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
                            aria-label="Silenciar"
                        >
                            {isMuted ? (
                                <VolumeX size={18} className="text-gray-700 dark:text-gray-300" />
                            ) : (
                                <Volume2 size={18} className="text-gray-700 dark:text-gray-300" />
                            )}
                        </button>
                    </div>
                    <button
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
                        aria-label="Pantalla completa"
                    >
                        <Maximize size={18} className="text-gray-700 dark:text-gray-300" />
                    </button>
                </div>
            </div>
        </div>
    );
};
