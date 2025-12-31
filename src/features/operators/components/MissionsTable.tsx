import { useState } from 'react';
import { Target, Check, Clock, MapPin, Plane, User, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import type { Mission, MissionStatus, MissionIncident } from '@features/operators/types/mission.types';
import { FinalizeMissionModal } from '@features/operators/components/FinalizeMissionModal';

interface MissionsTableProps {
    missions: Mission[];
    onFinalizeMission: (
        missionId: string,
        completionType: 'SUCCESSFUL' | 'WITH_INCIDENTS',
        incidents?: MissionIncident[],
        notes?: string
    ) => void;
}

const STATUS_CONFIG: Record<
    MissionStatus,
    { label: string; color: string; icon: JSX.Element }
> = {
    PLANNED: {
        label: 'Planeada',
        color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        icon: <Target className="w-3 h-3" />,
    },
    IN_PROGRESS: {
        label: 'En Progreso',
        color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        icon: <Clock className="w-3 h-3" />,
    },
    PENDING_FINALIZATION: {
        label: 'Pendiente Finalización',
        color: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
        icon: <Clock className="w-3 h-3" />,
    },
    COMPLETED_SUCCESSFULLY: {
        label: 'Completada',
        color: 'bg-green-500/20 text-green-400 border-green-500/30',
        icon: <CheckCircle className="w-3 h-3" />,
    },
    COMPLETED_WITH_INCIDENTS: {
        label: 'Completada con Incidentes',
        color: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
        icon: <AlertTriangle className="w-3 h-3" />,
    },
    CANCELLED: {
        label: 'Cancelada',
        color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
        icon: <XCircle className="w-3 h-3" />,
    },
};

const SEVERITY_COLORS: Record<string, string> = {
    LOW: 'text-blue-500',
    MEDIUM: 'text-yellow-500',
    HIGH: 'text-orange-500',
    CRITICAL: 'text-red-500',
};

export const MissionsTable = ({ missions, onFinalizeMission }: MissionsTableProps) => {
    const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
    const [showFinalizeModal, setShowFinalizeModal] = useState(false);

    const handleFinalize = (mission: Mission) => {
        setSelectedMission(mission);
        setShowFinalizeModal(true);
    };

    const handleCloseFinalizeModal = () => {
        setShowFinalizeModal(false);
        setSelectedMission(null);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <>
            <div className="bg-white dark:bg-[#0A1628] rounded-xl p-6 shadow-lg border border-gray-200 dark:border-[#004599]/30">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Target className="w-6 h-6 text-primary" />
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            Gestión de Misiones
                        </h3>
                        <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                            {missions.length}
                        </div>
                    </div>
                </div>

                {missions.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-600 dark:text-gray-400">
                            No hay misiones registradas
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-[#004599]/30">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                                        Misión
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                                        Dron
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                                        Ruta
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                                        Estado
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                                        Operador
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                                        Fecha Inicio
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                                        Incidentes
                                    </th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {missions.map((mission) => {
                                    const statusConfig = STATUS_CONFIG[mission.status];

                                    return (
                                        <tr
                                            key={mission.id}
                                            className="border-b border-gray-100 dark:border-[#004599]/10 hover:bg-gray-50 dark:hover:bg-[#004599]/5 transition-colors"
                                        >
                                            <td className="py-3 px-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm text-gray-900 dark:text-white font-medium">
                                                        {mission.name}
                                                    </span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                                                        {mission.objectives.substring(0, 40)}...
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <Plane
                                                        size={16}
                                                        className="text-gray-500 dark:text-gray-400"
                                                    />
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                                        {mission.droneName}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <MapPin
                                                        size={16}
                                                        className="text-gray-500 dark:text-gray-400"
                                                    />
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                                        {mission.routeName}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusConfig.color}`}
                                                >
                                                    {statusConfig.icon}
                                                    {statusConfig.label}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <User
                                                        size={16}
                                                        className="text-gray-500 dark:text-gray-400"
                                                    />
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                                        {mission.operatorName}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                                                {formatDate(mission.startDate)}
                                            </td>
                                            <td className="py-3 px-4">
                                                {mission.incidents && mission.incidents.length > 0 ? (
                                                    <div className="flex items-center gap-2">
                                                        <AlertTriangle
                                                            size={16}
                                                            className={
                                                                SEVERITY_COLORS[
                                                                mission.incidents[0].severity
                                                                ]
                                                            }
                                                        />
                                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {mission.incidents.length}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-500 dark:text-gray-500">
                                                        -
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    {mission.status === 'PENDING_FINALIZATION' && (
                                                        <button
                                                            onClick={() => handleFinalize(mission)}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary-dark text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
                                                        >
                                                            <Check size={14} />
                                                            Finalizar
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Finalize Modal */}
            {selectedMission && (
                <FinalizeMissionModal
                    isOpen={showFinalizeModal}
                    onClose={handleCloseFinalizeModal}
                    mission={selectedMission}
                    onFinalize={onFinalizeMission}
                />
            )}
        </>
    );
};
