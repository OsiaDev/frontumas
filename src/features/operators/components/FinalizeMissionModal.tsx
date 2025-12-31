import { useState } from 'react';
import { X, Check, AlertTriangle, Plus, Trash2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { Mission, MissionIncident, IncidentSeverity } from '@features/operators/types/mission.types';

interface FinalizeMissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    mission: Mission;
    onFinalize: (
        missionId: string,
        completionType: 'SUCCESSFUL' | 'WITH_INCIDENTS',
        incidents?: MissionIncident[],
        notes?: string
    ) => void;
}

interface IncidentForm {
    description: string;
    severity: IncidentSeverity;
}

const SEVERITY_OPTIONS: { value: IncidentSeverity; label: string; color: string }[] = [
    { value: 'LOW', label: 'Baja', color: 'text-blue-500' },
    { value: 'MEDIUM', label: 'Media', color: 'text-yellow-500' },
    { value: 'HIGH', label: 'Alta', color: 'text-orange-500' },
    { value: 'CRITICAL', label: 'Crítica', color: 'text-red-500' },
];

export const FinalizeMissionModal = ({
    isOpen,
    onClose,
    mission,
    onFinalize,
}: FinalizeMissionModalProps) => {
    const [completionType, setCompletionType] = useState<'SUCCESSFUL' | 'WITH_INCIDENTS'>(
        'SUCCESSFUL'
    );
    const [incidents, setIncidents] = useState<IncidentForm[]>([]);
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const addIncident = () => {
        setIncidents([...incidents, { description: '', severity: 'LOW' }]);
    };

    const removeIncident = (index: number) => {
        setIncidents(incidents.filter((_, i) => i !== index));
    };

    const updateIncident = (index: number, field: keyof IncidentForm, value: string) => {
        const updatedIncidents = [...incidents];
        updatedIncidents[index] = { ...updatedIncidents[index], [field]: value };
        setIncidents(updatedIncidents);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validar incidentes si se seleccionó WITH_INCIDENTS
        if (completionType === 'WITH_INCIDENTS') {
            if (incidents.length === 0) {
                toast.error('Error', {
                    description: 'Debes agregar al menos un incidente',
                });
                return;
            }

            const hasEmptyDescriptions = incidents.some((inc) => !inc.description.trim());
            if (hasEmptyDescriptions) {
                toast.error('Error', {
                    description: 'Todos los incidentes deben tener una descripción',
                });
                return;
            }
        }

        setIsSubmitting(true);

        try {
            // Simular delay de API
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Convertir incidentes a formato final
            const finalIncidents: MissionIncident[] | undefined =
                completionType === 'WITH_INCIDENTS'
                    ? incidents.map((inc, index) => ({
                        id: `inc-${Date.now()}-${index}`,
                        description: inc.description,
                        severity: inc.severity,
                        timestamp: new Date().toISOString(),
                    }))
                    : undefined;

            onFinalize(mission.id, completionType, finalIncidents, notes || undefined);

            const message =
                completionType === 'SUCCESSFUL'
                    ? 'Misión finalizada exitosamente'
                    : `Misión finalizada con ${incidents.length} incidente(s) registrado(s)`;

            toast.success('Misión finalizada', {
                description: message,
            });

            // Reset form
            setCompletionType('SUCCESSFUL');
            setIncidents([]);
            setNotes('');
            onClose();
        } catch (error) {
            toast.error('Error', {
                description: 'No se pudo finalizar la misión',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setCompletionType('SUCCESSFUL');
            setIncidents([]);
            setNotes('');
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative bg-white dark:bg-[#0A1628] rounded-xl shadow-2xl border border-gray-200 dark:border-[#004599]/30 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#004599]/30 sticky top-0 bg-white dark:bg-[#0A1628] z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Check className="w-6 h-6 text-primary" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            Finalizar Misión
                        </h2>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Mission Info */}
                    <div className="p-4 bg-gray-50 dark:bg-[#004599]/5 rounded-lg space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                Misión:
                            </span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {mission.name}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                Dron:
                            </span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {mission.droneName}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                Ruta:
                            </span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {mission.routeName}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                Operador:
                            </span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {mission.operatorName}
                            </span>
                        </div>
                    </div>

                    {/* Completion Type Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Tipo de Finalización *
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setCompletionType('SUCCESSFUL')}
                                disabled={isSubmitting}
                                className={`p-4 rounded-lg border-2 transition-all ${completionType === 'SUCCESSFUL'
                                        ? 'border-green-500 bg-green-500/10'
                                        : 'border-gray-300 dark:border-gray-600 hover:border-green-500/50'
                                    } disabled:opacity-50`}
                            >
                                <div className="flex items-center gap-3">
                                    <CheckCircle
                                        className={`w-6 h-6 ${completionType === 'SUCCESSFUL'
                                                ? 'text-green-500'
                                                : 'text-gray-400'
                                            }`}
                                    />
                                    <div className="text-left">
                                        <div className="font-semibold text-gray-900 dark:text-white">
                                            Satisfactoria
                                        </div>
                                        <div className="text-xs text-gray-600 dark:text-gray-400">
                                            Sin incidentes
                                        </div>
                                    </div>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => setCompletionType('WITH_INCIDENTS')}
                                disabled={isSubmitting}
                                className={`p-4 rounded-lg border-2 transition-all ${completionType === 'WITH_INCIDENTS'
                                        ? 'border-orange-500 bg-orange-500/10'
                                        : 'border-gray-300 dark:border-gray-600 hover:border-orange-500/50'
                                    } disabled:opacity-50`}
                            >
                                <div className="flex items-center gap-3">
                                    <AlertTriangle
                                        className={`w-6 h-6 ${completionType === 'WITH_INCIDENTS'
                                                ? 'text-orange-500'
                                                : 'text-gray-400'
                                            }`}
                                    />
                                    <div className="text-left">
                                        <div className="font-semibold text-gray-900 dark:text-white">
                                            Con Incidentes
                                        </div>
                                        <div className="text-xs text-gray-600 dark:text-gray-400">
                                            Registrar problemas
                                        </div>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Incidents Section */}
                    {completionType === 'WITH_INCIDENTS' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Incidentes *
                                </label>
                                <button
                                    type="button"
                                    onClick={addIncident}
                                    disabled={isSubmitting}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-primary hover:bg-primary-dark text-white text-sm rounded-lg transition-colors disabled:opacity-50"
                                >
                                    <Plus className="w-4 h-4" />
                                    Agregar Incidente
                                </button>
                            </div>

                            {incidents.length === 0 ? (
                                <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                                    <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        No hay incidentes registrados
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                        Haz clic en "Agregar Incidente" para comenzar
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {incidents.map((incident, index) => (
                                        <div
                                            key={index}
                                            className="p-4 bg-gray-50 dark:bg-[#004599]/5 rounded-lg border border-gray-200 dark:border-[#004599]/20 space-y-3"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Incidente #{index + 1}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeIncident(index)}
                                                    disabled={isSubmitting}
                                                    className="p-1 text-red-500 hover:bg-red-500/10 rounded transition-colors disabled:opacity-50"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div>
                                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                                    Descripción
                                                </label>
                                                <textarea
                                                    value={incident.description}
                                                    onChange={(e) =>
                                                        updateIncident(
                                                            index,
                                                            'description',
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Describe el incidente ocurrido..."
                                                    rows={2}
                                                    disabled={isSubmitting}
                                                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50 resize-none"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                                    Severidad
                                                </label>
                                                <select
                                                    value={incident.severity}
                                                    onChange={(e) =>
                                                        updateIncident(
                                                            index,
                                                            'severity',
                                                            e.target.value
                                                        )
                                                    }
                                                    disabled={isSubmitting}
                                                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-gray-900 dark:text-white disabled:opacity-50"
                                                >
                                                    {SEVERITY_OPTIONS.map((option) => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Notes Input */}
                    <div>
                        <label
                            htmlFor="notes"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                        >
                            Notas Finales (Opcional)
                        </label>
                        <textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Observaciones adicionales sobre la misión..."
                            rows={3}
                            disabled={isSubmitting}
                            className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50 resize-none"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-[#004599]/30">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Finalizando...
                                </>
                            ) : (
                                <>
                                    <Check className="w-4 h-4" />
                                    Finalizar Misión
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
