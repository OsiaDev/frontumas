import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, RefreshCw } from 'lucide-react';
import { useMissionStore } from '../store/useMissionStore';
import { useMissionsApi } from '../hooks/useMissionsApi';
import { MissionTable } from '../components/MissionTable';
import type { Mission } from '@shared/types/mission.types';

export const MissionsListPage = () => {
    const navigate = useNavigate();
    const { missions, isLoading, error } = useMissionStore();
    const {
        fetchMissions,
        deleteMission,
        approveMission,
        executeMission,
    } = useMissionsApi();

    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        loadMissions();
    }, []);

    const loadMissions = async () => {
        try {
            await fetchMissions();
        } catch (error) {
            console.error('Error al cargar misiones:', error);
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await fetchMissions();
        } catch (error) {
            console.error('Error al refrescar misiones:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleDelete = async (mission: Mission) => {
        if (window.confirm(`¿Está seguro de eliminar la misión "${mission.name}"?`)) {
            try {
                await deleteMission(mission.id);
            } catch (error) {
                console.error('Error al eliminar misión:', error);
                alert('Error al eliminar la misión. Por favor, intente nuevamente.');
            }
        }
    };

    const handleApprove = async (mission: Mission) => {
        const commanderName = prompt(`Aprobar misión "${mission.name}"\n\nIngrese el nombre del comandante:`);

        if (!commanderName || !commanderName.trim()) {
            return;
        }

        try {
            await approveMission(mission.id, { commanderName: commanderName.trim() });
            alert(`Misión "${mission.name}" aprobada exitosamente.`);
        } catch (error) {
            console.error('Error al aprobar misión:', error);
            alert('Error al aprobar la misión. Por favor, intente nuevamente.');
        }
    };

    const handleExecute = async (mission: Mission) => {
        const commanderName = prompt(`Ejecutar misión "${mission.name}"\n\nIngrese el nombre del comandante:`);

        if (!commanderName || !commanderName.trim()) {
            return;
        }

        try {
            await executeMission(mission.id, { commanderName: commanderName.trim() });
            alert(`Misión "${mission.name}" ejecutada exitosamente.`);
        } catch (error) {
            console.error('Error al ejecutar misión:', error);
            alert('Error al ejecutar la misión. Por favor, intente nuevamente.');
        }
    };

    const handleViewDetails = (mission: Mission) => {
        navigate(`/missions/edit/${mission.id}`);
    };

    const missionsList = Object.values(missions);

    return (
        <div className="container mx-auto px-4 py-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Misiones
                        </h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Gestiona las misiones de tus drones
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                            Actualizar
                        </button>
                        <button
                            onClick={() => navigate('/missions/new')}
                            className="inline-flex items-center gap-2 px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                            <Plus className="w-4 h-4" />
                            Nueva Misión
                        </button>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
            )}

            {/* Stats */}
            {missionsList.length > 0 && (
                <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Total</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {missionsList.length}
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                        <div className="text-sm text-yellow-600 dark:text-yellow-400">Pendientes Aprobación</div>
                        <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                            {missionsList.filter(m => m.state === 'PENDIENTE_APROBACION').length}
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                        <div className="text-sm text-blue-600 dark:text-blue-400">En Ejecución</div>
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {missionsList.filter(m => m.state === 'EN_EJECUCION').length}
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                        <div className="text-sm text-green-600 dark:text-green-400">Finalizadas</div>
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {missionsList.filter(m => m.state === 'FINALIZADA').length}
                        </div>
                    </div>
                </div>
            )}

            {/* Missions Table */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                <MissionTable
                    missions={missionsList}
                    onApprove={handleApprove}
                    onExecute={handleExecute}
                    onDelete={handleDelete}
                    onViewDetails={handleViewDetails}
                    isLoading={isLoading}
                />
            </div>
        </div>
    );
};
