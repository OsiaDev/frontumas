import { useState, useEffect, type FormEvent } from 'react';
import { Input } from '@shared/components/Input';
import { Button } from '@shared/components/Button';
import { Package, Hash, FileText, Barcode, Clock } from 'lucide-react';
import type { CreateDroneDTO, DroneResponseDTO, DroneStatus } from '@shared/types/api.types';
import { useDroneStatuses } from '../hooks/useDrones';

interface DroneFormProps {
    initialData?: DroneResponseDTO;
    onSubmit: (data: CreateDroneDTO) => void;
    onCancel: () => void;
    isLoading?: boolean;
    mode: 'create' | 'edit';
}

export const DroneForm = ({ initialData, onSubmit, onCancel, isLoading = false, mode }: DroneFormProps) => {
    const [vehicleId, setVehicleId] = useState(initialData?.vehicleId || '');
    const [model, setModel] = useState(initialData?.model || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [serialNumber, setSerialNumber] = useState(initialData?.serialNumber || '');
    const [flightHours, setFlightHours] = useState(initialData?.flightHours?.toString() || '0');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const { data: statuses } = useDroneStatuses();

    useEffect(() => {
        if (initialData) {
            setVehicleId(initialData.vehicleId);
            setModel(initialData.model);
            setDescription(initialData.description);
            setSerialNumber(initialData.serialNumber);
            setFlightHours(initialData.flightHours?.toString() || '0');
        }
    }, [initialData]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!vehicleId.trim()) {
            newErrors.vehicleId = 'El ID del vehículo es requerido';
        }

        if (!model.trim()) {
            newErrors.model = 'El modelo es requerido';
        }

        if (!description.trim()) {
            newErrors.description = 'La descripción es requerida';
        }

        if (!serialNumber.trim()) {
            newErrors.serialNumber = 'El número de serie es requerido';
        }

        const hoursValue = parseFloat(flightHours);
        if (isNaN(hoursValue) || hoursValue < 0) {
            newErrors.flightHours = 'Las horas de vuelo deben ser un número válido mayor o igual a 0';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const data: CreateDroneDTO = {
            vehicleId: vehicleId.trim(),
            model: model.trim(),
            description: description.trim(),
            serialNumber: serialNumber.trim(),
            flightHours: parseFloat(flightHours),
        };

        onSubmit(data);
    };

    const handleFieldChange = (field: string, value: string) => {
        // Limpiar error del campo cuando el usuario escribe
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }

        // Actualizar el campo
        switch (field) {
            case 'vehicleId':
                setVehicleId(value);
                break;
            case 'model':
                setModel(value);
                break;
            case 'description':
                setDescription(value);
                break;
            case 'serialNumber':
                setSerialNumber(value);
                break;
            case 'flightHours':
                setFlightHours(value);
                break;
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Información Básica */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-300 dark:border-[#004599]/30">
                    <Package size={16} className="text-primary" />
                    <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                        Información Básica
                    </h3>
                </div>

                <Input
                    label="ID del Vehículo"
                    placeholder="Ej: DRONE-001"
                    value={vehicleId}
                    onChange={(e) => handleFieldChange('vehicleId', e.target.value)}
                    error={errors.vehicleId}
                    disabled={isLoading}
                    icon={<Hash size={18} />}
                    required
                />

                <Input
                    label="Modelo"
                    placeholder="Ej: DJI Mavic 3 Enterprise"
                    value={model}
                    onChange={(e) => handleFieldChange('model', e.target.value)}
                    error={errors.model}
                    disabled={isLoading}
                    icon={<Package size={18} />}
                    required
                />

                <Input
                    label="Descripción"
                    placeholder="Descripción detallada del drone"
                    value={description}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    error={errors.description}
                    disabled={isLoading}
                    icon={<FileText size={18} />}
                    required
                />
            </div>

            {/* Detalles Técnicos */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-300 dark:border-[#004599]/30">
                    <Barcode size={16} className="text-primary" />
                    <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                        Detalles Técnicos
                    </h3>
                </div>

                <Input
                    label="Número de Serie"
                    placeholder="Ej: SN123456789"
                    value={serialNumber}
                    onChange={(e) => handleFieldChange('serialNumber', e.target.value)}
                    error={errors.serialNumber}
                    disabled={isLoading}
                    icon={<Barcode size={18} />}
                    required
                />

                <Input
                    label="Horas de Vuelo"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Ej: 125.50"
                    value={flightHours}
                    onChange={(e) => handleFieldChange('flightHours', e.target.value)}
                    error={errors.flightHours}
                    disabled={isLoading}
                    icon={<Clock size={18} />}
                    required
                />
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-300 dark:border-[#004599]/30">
                <Button
                    type="button"
                    variant="secondary"
                    onClick={onCancel}
                    disabled={isLoading}
                    className="flex-1"
                >
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    variant="primary"
                    isLoading={isLoading}
                    disabled={isLoading}
                    className="flex-1"
                >
                    {mode === 'create' ? 'Crear Drone' : 'Actualizar Drone'}
                </Button>
            </div>
        </form>
    );
};
