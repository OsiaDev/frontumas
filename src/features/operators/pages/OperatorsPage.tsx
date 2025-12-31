import { useState } from 'react';
import { Target, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { MissionsTable } from '@features/operators/components/MissionsTable';
import { mockMissions } from '@features/operators/data/mockMissions';
import type { Mission, MissionIncident } from '@features/operators/types/mission.types';

export const OperatorsPage = () => {
    const [missions, setMissions] = useState<Mission[]>(mockMissions);

    const calculateFlightHours = (startDate: string, endDate: string): number => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffMs = end.getTime() - start.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        return Math.round(diffHours * 10) / 10; // Redondear a 1 decimal
    };

    const handleFinalizeMission = (
        missionId: string,
        completionType: 'SUCCESSFUL' | 'WITH_INCIDENTS',
        incidents?: MissionIncident[],
        notes?: string
    ) => {
        setMissions((prevMissions) =>
            prevMissions.map((mission) => {
                if (mission.id === missionId) {
                    const endDate = new Date().toISOString();
                    const flightHours = calculateFlightHours(mission.startDate, endDate);

                    return {
                        ...mission,
                        status:
                            completionType === 'SUCCESSFUL'
                                ? ('COMPLETED_SUCCESSFULLY' as const)
                                : ('COMPLETED_WITH_INCIDENTS' as const),
                        endDate,
                        flightHours,
                        incidents: incidents || mission.incidents,
                        notes: notes || mission.notes,
                        updatedAt: endDate,
                    };
                }
                return mission;
            })
        );
    };

    // Calcular estadísticas
    const stats = {
        total: missions.length,
        completed: missions.filter(
            (m) =>
                m.status === 'COMPLETED_SUCCESSFULLY' ||
                m.status === 'COMPLETED_WITH_INCIDENTS'
        ).length,
        inProgress: missions.filter((m) => m.status === 'IN_PROGRESS').length,
        pendingFinalization: missions.filter(
            (m) => m.status === 'PENDING_FINALIZATION'
        ).length,
    };

    return (
        <div className="p-6 space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Gestión de Operadores
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Control y seguimiento de misiones - Fuerza Aeroespacial Colombiana
                </p>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Misiones */}
                <div className="bg-white dark:bg-[#0A1628] rounded-xl p-6 shadow-lg border border-gray-200 dark:border-[#004599]/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                Total Misiones
                            </p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                {stats.total}
                            </p>
                        </div>
                        <div className="p-3 bg-primary/10 rounded-lg">
                            <Target className="w-8 h-8 text-primary" />
                        </div>
                    </div>
                </div>

                {/* Completadas */}
                <div className="bg-white dark:bg-[#0A1628] rounded-xl p-6 shadow-lg border border-gray-200 dark:border-[#004599]/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                Completadas
                            </p>
                            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                                {stats.completed}
                            </p>
                        </div>
                        <div className="p-3 bg-green-500/10 rounded-lg">
                            <CheckCircle className="w-8 h-8 text-green-500" />
                        </div>
                    </div>
                </div>

                {/* En Progreso */}
                <div className="bg-white dark:bg-[#0A1628] rounded-xl p-6 shadow-lg border border-gray-200 dark:border-[#004599]/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                En Progreso
                            </p>
                            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                                {stats.inProgress}
                            </p>
                        </div>
                        <div className="p-3 bg-yellow-500/10 rounded-lg">
                            <Clock className="w-8 h-8 text-yellow-500" />
                        </div>
                    </div>
                </div>

                {/* Pendiente Finalización */}
                <div className="bg-white dark:bg-[#0A1628] rounded-xl p-6 shadow-lg border border-gray-200 dark:border-[#004599]/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                Pendiente Final.
                            </p>
                            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                                {stats.pendingFinalization}
                            </p>
                        </div>
                        <div className="p-3 bg-orange-500/10 rounded-lg">
                            <AlertCircle className="w-8 h-8 text-orange-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabla de Misiones */}
            <MissionsTable missions={missions} onFinalizeMission={handleFinalizeMission} />
        </div>
    );
};
