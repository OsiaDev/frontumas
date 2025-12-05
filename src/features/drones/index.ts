// Drones Feature Exports

// Components
export { DroneList } from './components/DroneList';
export { DroneStats } from './components/DroneStats';
export { MqttStatus } from './components/MqttStatus';
export { DroneForm } from './components/DroneForm';
export { DroneTable } from './components/DroneTable';
export { DroneStatusSelect } from './components/DroneStatusSelect';
export { DroneCreateModal } from './components/DroneCreateModal';
export { DroneEditModal } from './components/DroneEditModal';
export { DroneDeleteConfirm } from './components/DroneDeleteConfirm';

// Pages
export { DronesPage } from './pages/DronesPage';

// Context & Hooks (deprecated - use store instead)
export { useDrones } from './context/DroneContext';
export { DroneProvider } from './context/DroneProvider';

// Store (Zustand with localStorage)
export { useDroneStore } from './store/useDroneStore';

// Hooks
export { useDronesApi } from './hooks/useDronesApi';
export {
    useDrones as useDronesQuery,
    useDrone as useDroneQuery,
    useDroneStatuses,
    useCreateDrone,
    useUpdateDrone,
    useUpdateDroneStatus,
    useDeleteDrone,
} from './hooks/useDrones';

// Services
export { dronesApiService } from './services/drones.api.service';
export { missionCommandsService } from './services/drone-commands.service';

// Types
export type {
    DroneMap,
    DroneState,
    DroneLocationMessage,
    DroneGeoEventMessage,
    DroneAlertMessage
} from './types/drone.types';
