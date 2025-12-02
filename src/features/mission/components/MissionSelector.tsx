import { useEffect, useState } from 'react';
import { ChevronDown, Target, AlertCircle } from 'lucide-react';
import type { Mission } from '@shared/types/mission.types';
import { missionsApiService } from '@features/missions/services/missions.api.service';

interface MissionSelectorProps {
    selectedMission: Mission | null;
    onMissionSelect: (mission: Mission) => void;
}

export const MissionSelector = ({ selectedMission, onMissionSelect }: MissionSelectorProps) => {
    const [missions, setMissions] = useState<Mission[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadActiveMissions();
    }, []);

    const loadActiveMissions = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const allMissions = await missionsApiService.getMissions();
            // Filtrar misiones activas (en ejecución o aprobadas)
            const activeMissions = allMissions.filter(
                m => m.state === 'EN_EJECUCION' || m.state === 'APROBADA'
            );
            setMissions(activeMissions);

            // Seleccionar automáticamente la primera misión en ejecución
            if (!selectedMission && activeMissions.length > 0) {
                const inProgress = activeMissions.find(m => m.state === 'EN_EJECUCION');
                onMissionSelect(inProgress || activeMissions[0]);
            }
        } catch (err) {
            setError('Error al cargar misiones');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const getStateLabel = (state: string) => {
        switch (state) {
            case 'EN_EJECUCION': return 'En Ejecución';
            case 'APROBADA': return 'Aprobada';
            default: return state;
        }
    };

    const getStateColor = (state: string) => {
        switch (state) {
            case 'EN_EJECUCION': return 'bg-blue-500';
            case 'APROBADA': return 'bg-green-500';
            default: return 'bg-gray-500';
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg px-4 py-3 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-gray-500">
                    <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full"></div>
                    <span className="text-sm">Cargando misiones...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg px-4 py-3 border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{error}</span>
                </div>
            </div>
        );
    }

    if (missions.length === 0) {
        return (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg px-4 py-3 border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">No hay misiones activas. Crea y aprueba una misión primero.</span>
                </div>
            </div>
        );
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-white dark:bg-gray-800 rounded-lg px-4 py-3 border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary transition-colors"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Target className="w-5 h-5 text-primary" />
                        {selectedMission ? (
                            <div className="text-left">
                                <div className="font-medium text-gray-900 dark:text-white">
                                    {selectedMission.name || `Misión ${selectedMission.id.substring(0, 8)}`}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                    <span className={`w-2 h-2 rounded-full ${getStateColor(selectedMission.state)}`}></span>
                                    <span>{getStateLabel(selectedMission.state)}</span>
                                    <span>-</span>
                                    <span>{selectedMission.droneCount} dron{selectedMission.droneCount !== 1 ? 'es' : ''}</span>
                                </div>
                            </div>
                        ) : (
                            <span className="text-gray-500 dark:text-gray-400">Seleccionar misión</span>
                        )}
                    </div>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg z-50 max-h-64 overflow-y-auto">
                    {missions.map((mission) => (
                        <button
                            key={mission.id}
                            onClick={() => {
                                onMissionSelect(mission);
                                setIsOpen(false);
                            }}
                            className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                                selectedMission?.id === mission.id ? 'bg-primary/10' : ''
                            }`}
                        >
                            <div className="font-medium text-gray-900 dark:text-white">
                                {mission.name || `Misión ${mission.id.substring(0, 8)}`}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                                <span className={`w-2 h-2 rounded-full ${getStateColor(mission.state)}`}></span>
                                <span>{getStateLabel(mission.state)}</span>
                                <span>-</span>
                                <span>{mission.droneCount} dron{mission.droneCount !== 1 ? 'es' : ''}</span>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
