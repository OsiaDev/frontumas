import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Target, Video, MapPin, Users, ArrowLeft } from 'lucide-react';
import { MqttStatus } from '@/features/drones/components/MqttStatus';
import { MissionDronesList } from '../components/MissionDronesList';
import { DroneDetailPanel } from '../components/DroneDetailPanel';
import { LiveVideoPlayer } from '../components/LiveVideoPlayer';
import { missionsApiService } from '@features/missions/services/missions.api.service';
import type { Mission, DroneAssignment } from '@shared/types/mission.types';

export const MissionPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [mission, setMission] = useState<Mission | null>(null);
    const [selectedDrone, setSelectedDrone] = useState<DroneAssignment | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            loadMission(id);
        }
    }, [id]);

    const loadMission = async (missionId: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const missionData = await missionsApiService.getMissionById(missionId);
            setMission(missionData);
            // Seleccionar automáticamente el primer dron
            if (missionData.assignedDrones.length > 0) {
                setSelectedDrone(missionData.assignedDrones[0]);
            }
        } catch (err) {
            setError('Error al cargar la misión');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDroneSelect = (drone: DroneAssignment) => {
        setSelectedDrone(drone);
    };

    const handleCloseDroneDetail = () => {
        setSelectedDrone(null);
    };

    const getStateLabel = (state: string) => {
        switch (state) {
            case 'EN_EJECUCION': return 'En Ejecución';
            case 'APROBADA': return 'Aprobada';
            case 'PENDIENTE_APROBACION': return 'Pendiente';
            default: return state;
        }
    };

    const getStateColor = (state: string) => {
        switch (state) {
            case 'EN_EJECUCION': return 'bg-blue-500';
            case 'APROBADA': return 'bg-green-500';
            case 'PENDIENTE_APROBACION': return 'bg-yellow-500';
            default: return 'bg-gray-500';
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Cargando misión...</p>
                </div>
            </div>
        );
    }

    if (error || !mission) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <Target className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        {error || 'Misión no encontrada'}
                    </h3>
                    <button
                        onClick={() => navigate('/missions')}
                        className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                    >
                        Volver a Misiones
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
                            <Target className="w-7 h-7 text-primary" />
                            {mission.name || `Misión ${mission.id.substring(0, 8)}`}
                        </h2>
                        <div className="flex items-center gap-3 mt-1">
                            <span className={`w-2 h-2 rounded-full ${getStateColor(mission.state)}`}></span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                {getStateLabel(mission.state)}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Video size={16} />
                            <span>Video</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <MapPin size={16} />
                            <span>GPS</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Users size={16} />
                            <span>{mission.droneCount} Drones</span>
                        </div>
                    </div>
                </div>

                {/* MQTT Status */}
                <MqttStatus />
            </div>

            {/* Main Content - Video grande a la izquierda, panel derecho con drones y mapa */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 px-6 pb-6">
                {/* Left - Video Principal (8/12 = 2/3 del espacio) */}
                <div className="lg:col-span-8 h-[600px]">
                    <LiveVideoPlayer
                        droneId={selectedDrone?.vehicleId}
                        title={selectedDrone
                            ? `Video - ${selectedDrone.droneName || selectedDrone.vehicleId}`
                            : "Transmisión de Video"
                        }
                    />
                </div>

                {/* Right Panel (4/12 = 1/3 del espacio) - Drones arriba, Mapa abajo */}
                <div className="lg:col-span-4 flex flex-col gap-4">
                    {/* Drone List - altura fija */}
                    <div className="h-[220px] flex-shrink-0">
                        <MissionDronesList
                            mission={mission}
                            selectedDroneId={selectedDrone?.droneId || null}
                            onDroneSelect={handleDroneSelect}
                        />
                    </div>

                    {/* Mapa del dron seleccionado - altura fija para garantizar visibilidad */}
                    <div className="h-[350px] flex-shrink-0">
                        {selectedDrone ? (
                            <DroneDetailPanel
                                drone={selectedDrone}
                                missionId={mission.id}
                                onClose={handleCloseDroneDetail}
                            />
                        ) : (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg h-full flex items-center justify-center">
                                <div className="text-center text-gray-500 dark:text-gray-400">
                                    <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">Selecciona un dron para ver su ubicación</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
