import { useNavigate } from 'react-router-dom';
import { Trash2, CheckCircle, PlayCircle, AlertCircle, Clock, FileText, Users, MonitorPlay, Video } from 'lucide-react';
import type { Mission, MissionState } from '@shared/types/mission.types';
import { hasAnyRoute } from '@shared/types/mission.types';

interface MissionTableProps {
    missions: Mission[];
    onApprove?: (mission: Mission) => void;
    onExecute?: (mission: Mission) => void;
    onDelete: (mission: Mission) => void;
    onViewDetails?: (mission: Mission) => void;
    isLoading?: boolean;
}

const STATE_COLORS: Record<MissionState, string> = {
    PENDIENTE_APROBACION: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    APROBADA: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    EN_EJECUCION: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    PAUSADA: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    FINALIZADA: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    ABORTADA: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    FALLIDA: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    ARCHIVADA: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

const STATE_LABELS: Record<MissionState, string> = {
    PENDIENTE_APROBACION: 'Pendiente Aprobación',
    APROBADA: 'Aprobada',
    EN_EJECUCION: 'En Ejecución',
    PAUSADA: 'Pausada',
    FINALIZADA: 'Finalizada',
    ABORTADA: 'Abortada',
    FALLIDA: 'Fallida',
    ARCHIVADA: 'Archivada',
};

const STATE_ICONS: Record<MissionState, React.ReactNode> = {
    PENDIENTE_APROBACION: <Clock className="w-3 h-3" />,
    APROBADA: <CheckCircle className="w-3 h-3" />,
    EN_EJECUCION: <PlayCircle className="w-3 h-3" />,
    PAUSADA: <AlertCircle className="w-3 h-3" />,
    FINALIZADA: <CheckCircle className="w-3 h-3" />,
    ABORTADA: <AlertCircle className="w-3 h-3" />,
    FALLIDA: <AlertCircle className="w-3 h-3" />,
    ARCHIVADA: <FileText className="w-3 h-3" />,
};

export const MissionTable = ({
    missions,
    onApprove,
    onExecute,
    onDelete,
    onViewDetails,
    isLoading = false,
}: MissionTableProps) => {
    const navigate = useNavigate();

    const handleControlMission = (mission: Mission) => {
        navigate(`/missions/${mission.id}/control`);
    };

    const handlePlaybackMission = (mission: Mission) => {
        navigate(`/missions/${mission.id}/playback`);
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('es-CO', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    const truncateId = (id: string) => {
        return `${id.substring(0, 8)}...`;
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Misión
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Drones
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Tipo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Ejecución
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Fecha Estimada
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Rutas
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Acciones
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {isLoading ? (
                        <tr>
                            <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                Cargando misiones...
                            </td>
                        </tr>
                    ) : missions.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                No hay misiones registradas
                            </td>
                        </tr>
                    ) : (
                        missions.map((mission) => (
                            <tr key={mission.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                {/* Misión */}
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                        {mission.name || <span className="text-gray-400 italic">Sin nombre</span>}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        ID: {truncateId(mission.id)}
                                    </div>
                                </td>

                                {/* Drones */}
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-gray-400" />
                                        <div>
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {mission.droneCount} dron{mission.droneCount !== 1 ? 'es' : ''}
                                            </div>
                                            {mission.assignedDrones.length > 0 && (
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {mission.assignedDrones.slice(0, 2).map(d => d.droneName || d.vehicleId).join(', ')}
                                                    {mission.assignedDrones.length > 2 && ` +${mission.assignedDrones.length - 2}`}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </td>

                                {/* Tipo */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        mission.missionType === 'MANUAL'
                                            ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400'
                                            : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                                    }`}>
                                        {mission.missionType === 'MANUAL' ? 'Manual' : 'Automática'}
                                    </span>
                                </td>

                                {/* Ejecución */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        mission.isAutomatic
                                            ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400'
                                            : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                                    }`}>
                                        {mission.isAutomatic ? 'Manual' : 'Automática'}
                                    </span>
                                </td>

                                {/* Estado */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full ${STATE_COLORS[mission.state]}`}>
                                        {STATE_ICONS[mission.state]}
                                        {STATE_LABELS[mission.state]}
                                    </span>
                                </td>

                                {/* Fecha Estimada */}
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    <div>{formatDate(mission.estimatedDate)}</div>
                                    {mission.isScheduledForFuture && (
                                        <div className="text-xs text-blue-600 dark:text-blue-400">
                                            Programada
                                        </div>
                                    )}
                                    {mission.hasStarted && mission.startDate && (
                                        <div className="text-xs text-green-600 dark:text-green-400">
                                            Iniciada: {formatDate(mission.startDate)}
                                        </div>
                                    )}
                                </td>

                                {/* Rutas */}
                                <td className="px-6 py-4 text-sm">
                                    {hasAnyRoute(mission) ? (
                                        <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                            <CheckCircle className="w-3 h-3" />
                                            <span className="text-xs">
                                                {mission.assignedDrones.filter(d => d.hasRoute).length}/{mission.droneCount} con ruta
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1 text-gray-400 dark:text-gray-500">
                                            <AlertCircle className="w-3 h-3" />
                                            <span className="text-xs">Sin rutas</span>
                                        </div>
                                    )}
                                </td>

                                {/* Acciones */}
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center justify-end gap-2">
                                        {/* Botón Aprobar - Solo para misiones pendientes de aprobación */}
                                        {mission.state === 'PENDIENTE_APROBACION' && onApprove && (
                                            <button
                                                onClick={() => onApprove(mission)}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 rounded-md transition-colors"
                                                title="Aprobar misión"
                                            >
                                                <CheckCircle className="w-3 h-3" />
                                                Aprobar
                                            </button>
                                        )}

                                        {/* Botón Ejecutar - Solo para misiones aprobadas */}
                                        {mission.state === 'APROBADA' && onExecute && (
                                            <button
                                                onClick={() => onExecute(mission)}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 rounded-md transition-colors"
                                                title="Ejecutar misión"
                                            >
                                                <PlayCircle className="w-3 h-3" />
                                                Ejecutar
                                            </button>
                                        )}

                                        {/* Botón Controlar - Para misiones en ejecución o aprobadas */}
                                        {(mission.state === 'EN_EJECUCION' || mission.state === 'APROBADA') && (
                                            <button
                                                onClick={() => handleControlMission(mission)}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-primary hover:bg-primary-dark rounded-md transition-colors"
                                                title="Controlar misión"
                                            >
                                                <MonitorPlay className="w-3 h-3" />
                                                Controlar
                                            </button>
                                        )}

                                        {/* Botón Playback - Para misiones finalizadas */}
                                        {mission.state === 'FINALIZADA' && (
                                            <button
                                                onClick={() => handlePlaybackMission(mission)}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 rounded-md transition-colors"
                                                title="Ver grabación de la misión"
                                            >
                                                <Video className="w-3 h-3" />
                                                Playback
                                            </button>
                                        )}

                                        {/* Botón Ver detalles */}
                                        {onViewDetails && (
                                            <button
                                                onClick={() => onViewDetails(mission)}
                                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                                                title="Ver detalles"
                                            >
                                                <FileText className="w-4 h-4" />
                                            </button>
                                        )}

                                        {/* Botón Eliminar - Solo para misiones finalizadas, abortadas o fallidas */}
                                        {(mission.state === 'FINALIZADA' || mission.state === 'ABORTADA' || mission.state === 'FALLIDA') && (
                                            <button
                                                onClick={() => onDelete(mission)}
                                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                                title="Eliminar misión"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};
