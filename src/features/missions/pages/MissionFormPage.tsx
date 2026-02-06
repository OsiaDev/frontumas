import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { Toggle } from '@shared/components/ui/Toggle';
import { useMissionStore } from '@features/missions/store/useMissionStore';
import { useMissionsApi } from '@features/missions/hooks/useMissionsApi';
import { useAuthStore } from '@features/auth/store/useAuthStore';
import { dronesApiService } from '@features/drones/services/drones.api.service';
import { routesApiService } from '@features/routes/services/routes.api.service';
import { operatorsApiService } from '@features/operators/services/operators.api.service';
import { RouteMapPreview } from '@features/missions/components/RouteMapPreview';
import type { CreateMissionDTO, DroneAssignmentRequest } from '@shared/types/mission.types';
import type { DroneResponseDTO } from '@shared/types/api.types';
import type { Route } from '@shared/types/route.types';

interface DroneAssignmentFormData {
    droneId: string;
    routeId: string;
    safeAltitude?: number;
    maxAltitude?: number;
}

export const MissionFormPage = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditMode = Boolean(id);

    const { getMission } = useMissionStore();
    const { createMission, updateMission, fetchMissionById } = useMissionsApi();
    const { user } = useAuthStore();

    // Nombre del comandante obtenido del usuario autenticado
    const commanderName = user?.username || 'Comandante';

    const [formData, setFormData] = useState({
        name: '',
        operatorId: '',
        estimatedDate: new Date().toISOString().slice(0, 16),
        isAutomatic: false,
    });

    const [droneAssignments, setDroneAssignments] = useState<DroneAssignmentFormData[]>([
        { droneId: '', routeId: '', safeAltitude: 50, maxAltitude: 100 }
    ]);

    const [drones, setDrones] = useState<Array<{ id: string; name: string }>>([]);
    const [routes, setRoutes] = useState<Array<{ id: string; name: string }>>([]);
    const [operators, setOperators] = useState<Array<{ id: string; name: string }>>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);

    useEffect(() => {
        loadInitialData();
    }, [id]);

    const loadInitialData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const [dronesData, routesData, operatorsData] = await Promise.all([
                dronesApiService.getDronesActive(),
                routesApiService.getRoutes(),
                operatorsApiService.getAllOperators(),
            ]);

            setDrones(dronesData.map((d: DroneResponseDTO) => ({ id: d.id, name: `${d.vehicleId} - ${d.model}` })));
            setRoutes(routesData.map((r: Route) => ({ id: r.id, name: r.name })));
            setOperators(operatorsData.map((value) => ({ id: value.id, name: value.fullName })));

            if (isEditMode && id) {
                const mission = getMission(id) || await fetchMissionById(id);

                if (mission) {
                    setFormData({
                        name: mission.name || '',
                        operatorId: mission.operatorId || '',
                        isAutomatic: mission.missionType === 'AUTOMATICA',
                        estimatedDate: mission.estimatedDate
                            ? new Date(mission.estimatedDate).toISOString().slice(0, 16)
                            : new Date().toISOString().slice(0, 16),
                    });

                    if (mission.assignedDrones && mission.assignedDrones.length > 0) {
                        setDroneAssignments(
                            mission.assignedDrones.map(d => ({
                                droneId: d.droneId,
                                routeId: d.routeId || '',
                                safeAltitude: 50,
                                maxAltitude: 100,
                            }))
                        );
                    }
                }
            }
        } catch (error) {
            console.error('Error cargando datos:', error);
            setError('Error al cargar los datos necesarios');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleDroneAssignmentChange = (
        index: number,
        field: keyof DroneAssignmentFormData,
        value: string | number
    ) => {
        setDroneAssignments(prev => {
            const updated = [...prev];
            updated[index] = {
                ...updated[index],
                [field]: field === 'safeAltitude' || field === 'maxAltitude'
                    ? Number(value) || 0
                    : value
            };
            return updated;
        });

        if (field === 'routeId' && typeof value === 'string' && value) {
            setSelectedRouteId(value);
        }
    };

    const removeDroneAssignment = (index: number) => {
        if (droneAssignments.length > 1) {
            setDroneAssignments(prev => prev.filter((_, i) => i !== index));
        }
    };

    const getAvailableDrones = (currentIndex: number) => {
        const selectedDroneIds = droneAssignments
            .filter((_, i) => i !== currentIndex)
            .map(a => a.droneId)
            .filter(Boolean);

        return drones.filter(d => !selectedDroneIds.includes(d.id));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validAssignments = droneAssignments.filter(a => a.droneId);

        if (validAssignments.length === 0) {
            setError('Debe asignar al menos un dron a la misión');
            return;
        }

        if (!formData.operatorId) {
            setError('Debe seleccionar un operador');
            return;
        }

        setIsSaving(true);
        setError(null);

        try {
            const droneAssignmentsDTO: DroneAssignmentRequest[] = validAssignments.map(a => ({
                droneId: a.droneId,
                routeId: a.routeId || null,
                safeAltitude: a.safeAltitude && a.safeAltitude > 0 ? a.safeAltitude : undefined,
                maxAltitude: a.maxAltitude && a.maxAltitude > 0 ? a.maxAltitude : undefined,
            }));

            // Formatear fecha con segundos (backend espera yyyy-MM-dd'T'HH:mm:ss)
            const estimatedDateFormatted = formData.estimatedDate.length === 16
                ? `${formData.estimatedDate}:00`
                : formData.estimatedDate;

            const missionData: CreateMissionDTO = {
                name: formData.name.trim() || null,
                operatorId: formData.operatorId.trim(),
                commanderName,
                estimatedDate: estimatedDateFormatted,
                isAutomatic: formData.isAutomatic,
                droneAssignments: droneAssignmentsDTO,
            };

            if (isEditMode && id) {
                await updateMission(id, missionData);
            } else {
                await createMission(missionData);
            }

            navigate('/missions');
        } catch (error) {
            console.error('Error guardando misión:', error);
            setError(error instanceof Error ? error.message : 'Error al guardar la misión');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-6">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/missions')}
                    className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Volver a misiones
                </button>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {isEditMode ? 'Editar Misión' : 'Nueva Misión'}
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {isEditMode ? 'Modifica los datos de la misión' : 'Completa los datos para crear una nueva misión'}
                </p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
            )}

            {/* Form with Map - Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Form Column */}
                <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-gray-500 dark:text-gray-400">Cargando...</div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Nombre */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Nombre de la Misión
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                                placeholder="Ej: Misión de reconocimiento zona norte (opcional)"
                            />
                        </div>

                        {/* Operador */}
                        <div>
                            <label htmlFor="operatorId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Operador Asignado *
                            </label>
                            <select
                                id="operatorId"
                                name="operatorId"
                                value={formData.operatorId}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                            >
                                <option value="">Seleccione un operador</option>
                                {operators.map(operator => (
                                    <option key={operator.id} value={operator.id}>
                                        {operator.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Nombre del Comandante (automático desde el usuario autenticado) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Comandante
                            </label>
                            <div className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300">
                                {commanderName}
                            </div>
                        </div>

                        {/* Tipo de Misión */}
                        <div>
                            <Toggle
                                checked={formData.isAutomatic}
                                onChange={(checked) => setFormData(prev => ({ ...prev, isAutomatic: checked }))}
                                label="Tipo de Misión"
                                description={
                                    formData.isAutomatic
                                        ? 'Misión automática - Se ejecutará sin intervención del operador'
                                        : 'Misión manual - Requiere aprobación y control del operador'
                                }
                            />
                        </div>

                        {/* Fecha Estimada */}
                        <div>
                            <label htmlFor="estimatedDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Fecha y Hora Estimada *
                            </label>
                            <input
                                type="datetime-local"
                                id="estimatedDate"
                                name="estimatedDate"
                                value={formData.estimatedDate}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                            />
                        </div>

                        {/* Drones Asignados */}
                        <div>
                           {/* <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Drones Asignados *
                                </label>
                                <button
                                    type="button"
                                    onClick={addDroneAssignment}
                                    disabled={droneAssignments.length >= drones.length}
                                    className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-primary hover:text-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Plus className="w-3 h-3" />
                                    Agregar dron
                                </button>
                            </div>*/}

                            <div className="space-y-3">
                                {droneAssignments.map((assignment, index) => (
                                    <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                                Dron #{index + 1}
                                            </span>
                                            {droneAssignments.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeDroneAssignment(index)}
                                                    className="p-1 text-red-500 hover:text-red-700"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>

                                        <select
                                            value={assignment.droneId}
                                            onChange={(e) => handleDroneAssignmentChange(index, 'droneId', e.target.value)}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white text-sm"
                                        >
                                            <option value="">Seleccione un dron</option>
                                            {getAvailableDrones(index).map(drone => (
                                                <option key={drone.id} value={drone.id}>
                                                    {drone.name}
                                                </option>
                                            ))}
                                        </select>

                                        <select
                                            value={assignment.routeId}
                                            onChange={(e) => handleDroneAssignmentChange(index, 'routeId', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white text-sm"
                                        >
                                            <option value="">Sin ruta asignada</option>
                                            {routes.map(route => (
                                                <option key={route.id} value={route.id}>
                                                    {route.name}
                                                </option>
                                            ))}
                                        </select>

                                        {/* Campos de Altitud */}
                                        <div className="grid grid-cols-2 gap-2 mt-2">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                    Altitud Segura (m)
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="1"
                                                    value={assignment.safeAltitude || ''}
                                                    onChange={(e) => handleDroneAssignmentChange(index, 'safeAltitude', e.target.value)}
                                                    placeholder="0"
                                                    className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                    Altitud Máxima (m)
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="1"
                                                    value={assignment.maxAltitude || ''}
                                                    onChange={(e) => handleDroneAssignmentChange(index, 'maxAltitude', e.target.value)}
                                                    placeholder="0"
                                                    className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                                                />
                                            </div>
                                        </div>
                                        
                                    </div>
                                ))}
                            </div>

                            {drones.length === 0 && (
                                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                    No hay drones disponibles. Cree un dron primero.
                                </p>
                            )}
                        </div>

                        {/* Botones */}
                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <button
                                type="button"
                                onClick={() => navigate('/missions')}
                                disabled={isSaving}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving || drones.length === 0 || operators.length === 0}
                                className="inline-flex items-center gap-2 px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save className="w-4 h-4" />
                                {isSaving ? 'Guardando...' : isEditMode ? 'Actualizar' : 'Crear Misión'}
                            </button>
                        </div>
                    </form>
                )}
                </div>

                {/* Map Preview Column */}
                <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden" style={{ height: '600px' }}>
                    {!isLoading && (
                        <RouteMapPreview
                            routeId={selectedRouteId || droneAssignments[0]?.routeId || null}
                            className="h-full"
                        />
                    )}
                </div>
            </div>
        </div>
    );
};
