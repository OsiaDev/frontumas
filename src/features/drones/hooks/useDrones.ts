import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dronesApiService } from '@/features/drones/services/drones.api.service';
import { QUERY_KEYS } from '@config/query.config';
import type { CreateDroneDTO, UpdateDroneDTO, DroneStatus } from '@shared/types/api.types';

/**
 * Hook para obtener todos los drones
 */
export const useDrones = () => {
    return useQuery({
        queryKey: QUERY_KEYS.DRONES.ALL,
        queryFn: () => dronesApiService.getDrones(),
    });
};

/**
 * Hook para obtener un drone por ID
 */
export const useDrone = (id: string) => {
    return useQuery({
        queryKey: QUERY_KEYS.DRONES.BY_ID(id),
        queryFn: () => dronesApiService.getDroneById(id),
        enabled: !!id, // Solo ejecutar si hay un ID
    });
};

/**
 * Hook para obtener los estados disponibles de drones
 */
export const useDroneStatuses = () => {
    return useQuery({
        queryKey: ['drone-statuses'],
        queryFn: () => dronesApiService.getDroneStatuses(),
        staleTime: Infinity, // Los estados no cambian frecuentemente
    });
};

/**
 * Hook para crear un drone
 */
export const useCreateDrone = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateDroneDTO) => dronesApiService.createDrone(data),
        onSuccess: () => {
            // Invalidar la lista de drones para refrescarla
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DRONES.ALL });
        },
    });
};

/**
 * Hook para actualizar un drone
 */
export const useUpdateDrone = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateDroneDTO }) =>
            dronesApiService.updateDrone(id, data),
        onSuccess: (updatedDrone) => {
            // Invalidar la lista de drones
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DRONES.ALL });
            // Invalidar el drone específico
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DRONES.BY_ID(updatedDrone.id) });
        },
    });
};

/**
 * Hook para actualizar el estado de un drone
 */
export const useUpdateDroneStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: DroneStatus }) =>
            dronesApiService.updateDroneStatus(id, status),
        onSuccess: (updatedDrone) => {
            // Invalidar la lista de drones
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DRONES.ALL });
            // Invalidar el drone específico
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DRONES.BY_ID(updatedDrone.id) });
        },
    });
};

/**
 * Hook para eliminar un drone
 */
export const useDeleteDrone = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => dronesApiService.deleteDrone(id),
        onSuccess: () => {
            // Invalidar la lista de drones para refrescarla
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DRONES.ALL });
        },
    });
};
