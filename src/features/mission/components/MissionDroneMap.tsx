import { MapContainer, TileLayer, CircleMarker, Popup, Polyline, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import { useDroneStore } from '@features/drones';
import { MapPin, Navigation } from 'lucide-react';
import { DEFAULT_CITY, MAP_TILE_CONFIG, MAP_ZOOM_CONFIG } from '@config/map.config';
import { MissionTelemetry } from './MissionTelemetry';
import 'leaflet/dist/leaflet.css';
import type { LatLngExpression } from 'leaflet';

interface MapCenterUpdaterProps {
    center: LatLngExpression;
}

const MapCenterUpdater = ({ center }: MapCenterUpdaterProps) => {
    const map = useMap();

    useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);

    return null;
};

export const MissionDroneMap = () => {
    const drones = useDroneStore((state) => state.drones);
    const activeDrones = Object.values(drones).filter(d => d.isActive);

    // Mostrar solo el primer dron activo
    const selectedDrone = activeDrones.length > 0 ? activeDrones[0] : null;

    const defaultCenter: LatLngExpression = selectedDrone
        ? [selectedDrone.lastLocation.latitude, selectedDrone.lastLocation.longitude]
        : [DEFAULT_CITY.latitude, DEFAULT_CITY.longitude];

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden h-full flex flex-col">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                    <MapPin size={20} className="text-primary" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Tracking & Telemetría
                    </h3>
                </div>
            </div>

            {/* Map Container */}
            <div className="flex-1 relative">
                {!selectedDrone ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
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
                        zoom={15}
                        minZoom={MAP_ZOOM_CONFIG.min}
                        maxZoom={MAP_ZOOM_CONFIG.max}
                        className="w-full h-full"
                        zoomControl={true}
                    >
                        <MapCenterUpdater center={defaultCenter} />
                        <TileLayer
                            url={MAP_TILE_CONFIG.url}
                            attribution={MAP_TILE_CONFIG.attribution}
                            maxZoom={MAP_TILE_CONFIG.maxZoom}
                        />

                        {/* Ruta del dron (últimas 30 posiciones) */}
                        {selectedDrone.lastPositions.length > 1 && (
                            <Polyline
                                positions={selectedDrone.lastPositions.map(pos => [
                                    pos.latitude,
                                    pos.longitude,
                                ])}
                                pathOptions={{
                                    color: '#3b82f6',
                                    weight: 3,
                                    opacity: 0.7,
                                }}
                            />
                        )}

                        <CircleMarker
                            center={[
                                selectedDrone.lastLocation.latitude,
                                selectedDrone.lastLocation.longitude,
                            ]}
                            radius={10}
                            pathOptions={{
                                fillColor: '#3b82f6',
                                fillOpacity: 1,
                                color: '#ffffff',
                                weight: 3,
                            }}
                        >
                            <Popup>
                                <div className="text-sm">
                                    <p className="font-bold text-gray-900">
                                        {selectedDrone.vehicleId}
                                    </p>
                                    <div className="text-xs text-gray-600 mt-1 space-y-0.5">
                                        <div>Alt: {selectedDrone.lastLocation.altitude?.toFixed(1) || 'N/A'}m</div>
                                        <div>Vel: {selectedDrone.lastLocation.speed?.toFixed(1) || 'N/A'} m/s</div>
                                        <div>Bat: {selectedDrone.lastLocation.batteryLevel || 'N/A'}%</div>
                                        <div>Posiciones: {selectedDrone.lastPositions.length}/30</div>
                                    </div>
                                </div>
                            </Popup>
                        </CircleMarker>
                    </MapContainer>
                )}
            </div>

            {/* Telemetry Panel */}
            {selectedDrone && <MissionTelemetry drone={selectedDrone} />}
        </div>
    );
};
