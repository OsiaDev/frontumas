import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { MapPin, Navigation } from 'lucide-react';
import { useDroneStore } from '@features/drones/store/useDroneStore.ts';
import { useTrackingStore } from '@/features/tracking/store/useTrackingStore.ts';
import { GeofenceLayer } from '@/features/tracking/components/GeofenceLayer';
import { SmoothDroneMarker } from '@/features/tracking/components/SmoothDroneMarker';
import { DEFAULT_CITY, MAP_TILE_CONFIG, MAP_ZOOM_CONFIG } from '@config/map.config';
import 'leaflet/dist/leaflet.css';
import type { LatLngExpression } from 'leaflet';
import type { Geofence, GeofenceType } from '@shared/types/geofence.types';
import type { Position } from '@/features/tracking/hooks/useSmoothDronePosition';

interface MapMarker {
    vehicleId: string;
    latitude: number;
    longitude: number;
    heading: number;
    isSelected: boolean;
}

// Componente para centrar el mapa cuando se selecciona un dron o geocerca
interface MapCenterControllerProps {
    selectedDroneId: string | null;
    centerTarget: { lat: number; lng: number; zoom?: number } | null;
}

const MapCenterController = ({ selectedDroneId, centerTarget }: MapCenterControllerProps) => {
    const map = useMap();
    const prevDroneIdRef = useRef<string | null>(null);

    // Suscripción específica solo al dron seleccionado, no a todos los drones
    const selectedDrone = useDroneStore((state) =>
        selectedDroneId ? state.drones[selectedDroneId] : null
    );

    // Centrar en dron seleccionado - Sigue al dron con actualizaciones MQTT
    useEffect(() => {
        if (selectedDroneId && selectedDrone) {
            const isDroneChange = prevDroneIdRef.current !== selectedDroneId;
            prevDroneIdRef.current = selectedDroneId;

            console.log('[MapCenterController] Centering map on:', selectedDroneId, 'at', [selectedDrone.lastLocation.latitude, selectedDrone.lastLocation.longitude]);

            // Cerrar todos los popups abiertos antes de mover el mapa
            map.closePopup();

            // Detener cualquier animación en curso
            map.stop();

            // Centrar en el dron (cambio o actualización de posición)
            map.flyTo(
                [selectedDrone.lastLocation.latitude, selectedDrone.lastLocation.longitude],
                15,
                { duration: isDroneChange ? 0.8 : 0.5 } // Más rápido para seguimiento
            );
        } else if (selectedDroneId) {
            console.log('[MapCenterController] selectedDroneId is set but drone not found in store:', selectedDroneId);
        } else {
            console.log('[MapCenterController] No drone selected');
            prevDroneIdRef.current = null;
            // Cerrar popups también cuando se deselecciona
            map.closePopup();
        }
    }, [selectedDroneId, selectedDrone?.lastLocation.latitude, selectedDrone?.lastLocation.longitude, map]);

    // Centrar en geocerca
    useEffect(() => {
        if (centerTarget) {
            console.log('[MapCenterController] Centering map on geofence:', centerTarget);
            map.flyTo(
                [centerTarget.lat, centerTarget.lng],
                centerTarget.zoom || 14,
                { duration: 1 }
            );
        }
    }, [centerTarget, map]);

    return null;
};

interface DroneTrackingMapProps {
    geofences: Geofence[];
    geofenceTypes: GeofenceType[];
    visibleGeofences: Set<string>;
    centerTarget: { lat: number; lng: number; zoom?: number } | null;
}

export const DroneTrackingMap = ({ geofences, geofenceTypes, visibleGeofences, centerTarget }: DroneTrackingMapProps) => {
    const drones = useDroneStore((state) => state.drones);
    const selectedDroneId = useTrackingStore((state) => state.selectedDroneId);
    const selectDrone = useTrackingStore((state) => state.selectDrone);

    const activeDrones = Object.values(drones).filter(d => d.isActive);

    const markers: MapMarker[] = activeDrones.map(drone => ({
        vehicleId: drone.vehicleId,
        latitude: drone.lastLocation.latitude,
        longitude: drone.lastLocation.longitude,
        heading: drone.lastLocation.heading,
        isSelected: drone.vehicleId === selectedDroneId,
    }));

    // console.log('[DroneTrackingMap] selectedDroneId from store:', selectedDroneId);
    // console.log('[DroneTrackingMap] markers:', markers.map(m => ({ id: m.vehicleId, isSelected: m.isSelected })));

    const defaultCenter: LatLngExpression = [DEFAULT_CITY.latitude, DEFAULT_CITY.longitude];

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg h-full flex flex-col">
            {/* Header */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 flex-wrap">
                    <MapPin className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                        Mapa de Seguimiento
                    </h3>
                    {activeDrones.length > 0 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {activeDrones.length} drones activos
                        </span>
                    )}
                    {visibleGeofences.size > 0 && (
                        <span className="text-xs text-amber-600 dark:text-amber-400">
                            • {visibleGeofences.size} geocerca{visibleGeofences.size !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>
            </div>

            {/* Mapa */}
            <div className="flex-1 relative">
                {markers.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900 rounded-b-lg">
                        <div className="text-center">
                            <Navigation className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600 dark:text-gray-400">
                                Sin datos de ubicación
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                                Esperando mensajes MQTT...
                            </p>
                        </div>
                    </div>
                ) : (
                    <MapContainer
                        center={defaultCenter}
                        zoom={MAP_ZOOM_CONFIG.default}
                        minZoom={MAP_ZOOM_CONFIG.min}
                        maxZoom={MAP_ZOOM_CONFIG.max}
                        className="w-full h-full rounded-b-lg"
                        zoomControl={true}
                    >
                        <TileLayer
                            url={MAP_TILE_CONFIG.url}
                            attribution={MAP_TILE_CONFIG.attribution}
                            maxZoom={MAP_TILE_CONFIG.maxZoom}
                        />

                        <MapCenterController selectedDroneId={selectedDroneId} centerTarget={centerTarget} />

                        {/* Geocercas */}
                        <GeofenceLayer geofences={geofences} geofenceTypes={geofenceTypes} visibleGeofences={visibleGeofences} />

                        {/* Descomentar para mostrar coordenadas en tiempo real */}
                        {/* <MapCoordinatesDisplay /> */}

                        {markers.map((marker) => {
                            // Obtener el dron completo del store para acceder a lastPositions
                            const drone = drones[marker.vehicleId];

                            // Convertir lastPositions a formato Leaflet para la ruta
                            const historyPath: LatLngExpression[] = drone.lastPositions.map(pos => [
                                pos.latitude,
                                pos.longitude,
                            ]);

                            // Posición objetivo para interpolación
                            const targetPosition: Position = {
                                latitude: marker.latitude,
                                longitude: marker.longitude,
                            };

                            return (
                                <SmoothDroneMarker
                                    key={marker.vehicleId}
                                    vehicleId={marker.vehicleId}
                                    targetPosition={targetPosition}
                                    isSelected={marker.isSelected}
                                    historyPath={historyPath}
                                    onMarkerClick={() => {
                                        console.log('[DroneTrackingMap] Marker clicked:', marker.vehicleId);
                                        console.log('[DroneTrackingMap] Current selectedDroneId:', selectedDroneId);
                                        // Toggle: si el dron ya está seleccionado, deseleccionarlo
                                        if (selectedDroneId === marker.vehicleId) {
                                            console.log('[DroneTrackingMap] Deselecting drone');
                                            selectDrone(null);
                                        } else {
                                            console.log('[DroneTrackingMap] Selecting drone:', marker.vehicleId);
                                            selectDrone(marker.vehicleId);
                                        }
                                    }}
                                />
                            );
                        })}
                    </MapContainer>
                )}

                {/* Leyenda */}
                {(markers.length > 0 || visibleGeofences.size > 0) && (
                    <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 text-xs z-[1000]">
                        {markers.length > 0 && (
                            <>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    <span className="text-gray-700 dark:text-gray-300">Activo</span>
                                </div>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                    <span className="text-gray-700 dark:text-gray-300">Seleccionado</span>
                                </div>
                            </>
                        )}
                        {visibleGeofences.size > 0 && (
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 border-2 border-amber-500 bg-amber-500/20"></div>
                                <span className="text-gray-700 dark:text-gray-300">Geocerca</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};