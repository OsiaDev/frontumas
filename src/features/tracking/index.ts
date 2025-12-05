// Tracking Feature Exports

// Components
export { DroneTrackingMap } from './components/DroneTrackingMap';
export { DroneCompactList } from './components/DroneCompactList';
export { DroneDetailsPanel } from './components/DroneDetailsPanel';
export { createDroneIcon } from './components/DroneMarkerIcon';
export { MapCoordinatesDisplay } from './components/MapCoordinatesDisplay';
export { SmoothDroneMarker } from './components/SmoothDroneMarker';

// Pages
export { NewDashboardPage as DashboardPage } from './pages/DashboardPage';

// Context & Hooks (deprecated - use store instead)
export { useTracking } from './context/TrackingContext';
export { TrackingProvider } from './context/TrackingProvider';

// Store (Zustand with localStorage)
export { useTrackingStore } from './store/useTrackingStore';
export { useGeofenceEventsStore } from './store/useGeofenceEventsStore';

// Hooks
export { useMqttConnection } from './hooks/useMqttConnection';
export { useDroneLocations } from './hooks/useDroneLocations';
export { useSmoothDronePosition } from './hooks/useSmoothDronePosition';
export { useGeofenceEvents } from './hooks/useGeofenceEvents';
export type { ConnectionStatus } from './hooks/useMqttConnection';

// Services
export { mqttService } from './services/mqtt/mqtt.service';
export { mqttHandlers } from './services/mqtt/mqtt.handlers';
