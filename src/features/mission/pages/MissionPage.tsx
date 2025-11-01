import { LiveVideoPlayer } from '../components/LiveVideoPlayer';
import { MissionDroneMap } from '../components/MissionDroneMap';
import { MqttStatus } from '@features/drones';
import { Video, MapPin } from 'lucide-react';

export const MissionPage = () => {
    return (
        <div className="flex flex-col h-full">
            {/* Header Section */}
            <div className="flex-shrink-0 px-6 pt-6 pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Control de Misión
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Monitoreo en tiempo real de video y posiciones
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm">
                            <Video size={16} className="text-gray-500 dark:text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400">Video en Vivo</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <MapPin size={16} className="text-gray-500 dark:text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400">Tracking GPS</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* MQTT Status */}
            <div className="flex-shrink-0 px-6 pb-4">
                <MqttStatus />
            </div>

            {/* Main Content Grid - Two Column Layout */}
            <div className="flex-1 grid grid-cols-1 xl:grid-cols-3 gap-4 px-6 pb-6 min-h-0">
                {/* Left - Live Video (2/3 width) */}
                <div className="xl:col-span-2 min-h-0">
                    <LiveVideoPlayer
                        videoUrl="https://www.youtube.com/embed/hXD8itTKdY0"
                        title="Transmisión de Video en Vivo"
                    />
                </div>

                {/* Right - Drone Map (1/3 width) */}
                <div className="xl:col-span-1 min-h-0">
                    <MissionDroneMap />
                </div>
            </div>
        </div>
    );
};
