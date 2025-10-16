import { useEffect, useRef } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { useDrones } from '@store/drone/DroneContext';
import { useTracking } from '@store/tracking/TrackingContext';

interface MapMarker {
    vehicleId: string;
    latitude: number;
    longitude: number;
    heading: number;
    isSelected: boolean;
}

export const DroneTrackingMap = () => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const { drones } = useDrones();
    const { selectedDroneId, selectDrone, getDroneHistory } = useTracking();

    const activeDrones = Object.values(drones).filter(d => d.isActive);

    const markers: MapMarker[] = activeDrones.map(drone => ({
        vehicleId: drone.vehicleId,
        latitude: drone.lastLocation.latitude,
        longitude: drone.lastLocation.longitude,
        heading: drone.lastLocation.heading,
        isSelected: drone.vehicleId === selectedDroneId,
    }));

    const centerLat = markers.length > 0
        ? markers.reduce((sum, m) => sum + m.latitude, 0) / markers.length
        : 4.7110;
    const centerLng = markers.length > 0
        ? markers.reduce((sum, m) => sum + m.longitude, 0) / markers.length
        : -74.0721;

    useEffect(() => {
        if (selectedDroneId && mapContainerRef.current) {
            const selectedDrone = drones[selectedDroneId];
            if (selectedDrone) {
                mapContainerRef.current.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        }
    }, [selectedDroneId, drones]);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg h-full flex flex-col">
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                        Mapa de Seguimiento
                    </h3>
                    {activeDrones.length > 0 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {activeDrones.length} drones activos
                        </span>
                    )}
                </div>
            </div>

            <div ref={mapContainerRef} className="flex-1 relative bg-gray-100 dark:bg-gray-900 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                    <svg
                        viewBox={`${centerLng - 0.1} ${centerLat - 0.1} 0.2 0.2`}
                        className="w-full h-full"
                        style={{ transform: 'scaleY(-1)' }}
                    >
                        <defs>
                            <pattern
                                id="grid"
                                width="0.01"
                                height="0.01"
                                patternUnits="userSpaceOnUse"
                            >
                                <path
                                    d="M 0.01 0 L 0 0 0 0.01"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="0.0001"
                                    className="text-gray-300 dark:text-gray-700"
                                />
                            </pattern>
                        </defs>

                        <rect
                            x={centerLng - 0.1}
                            y={centerLat - 0.1}
                            width="0.2"
                            height="0.2"
                            fill="url(#grid)"
                        />

                        {markers.map((marker) => {
                            const history = getDroneHistory(marker.vehicleId);

                            return (
                                <g key={marker.vehicleId}>
                                    {history.length > 1 && (
                                        <polyline
                                            points={history.map(pos =>
                                                `${pos.longitude},${pos.latitude}`
                                            ).join(' ')}
                                            fill="none"
                                            stroke={marker.isSelected ? '#3b82f6' : '#94a3b8'}
                                            strokeWidth="0.0003"
                                            strokeOpacity={marker.isSelected ? '0.8' : '0.4'}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    )}

                                    {history.slice(-5).map((pos, idx) => (
                                        <circle
                                            key={`${marker.vehicleId}-${idx}`}
                                            cx={pos.longitude}
                                            cy={pos.latitude}
                                            r="0.0005"
                                            fill={marker.isSelected ? '#3b82f6' : '#94a3b8'}
                                            opacity={0.3 + (idx * 0.15)}
                                        />
                                    ))}

                                    <g
                                        onClick={() => selectDrone(marker.vehicleId)}
                                        style={{ cursor: 'pointer' }}
                                        className="hover:opacity-80 transition-opacity"
                                    >
                                        <circle
                                            cx={marker.longitude}
                                            cy={marker.latitude}
                                            r={marker.isSelected ? "0.002" : "0.0015"}
                                            fill={marker.isSelected ? '#3b82f6' : '#10b981'}
                                            stroke="white"
                                            strokeWidth="0.0003"
                                        />

                                        <g transform={`translate(${marker.longitude}, ${marker.latitude}) rotate(${-marker.heading}) scale(1, -1)`}>
                                            <path
                                                d="M 0,-0.0015 L 0.0008,0.001 L 0,0.0005 L -0.0008,0.001 Z"
                                                fill={marker.isSelected ? '#1e40af' : '#059669'}
                                            />
                                        </g>
                                    </g>

                                    <text
                                        x={marker.longitude}
                                        y={marker.latitude - 0.0025}
                                        textAnchor="middle"
                                        className="text-[0.002px] font-bold fill-gray-900 dark:fill-white"
                                        style={{
                                            transform: 'scaleY(-1)',
                                            transformOrigin: `${marker.longitude}px ${marker.latitude}px`,
                                            pointerEvents: 'none',
                                        }}
                                    >
                                        {marker.vehicleId}
                                    </text>
                                </g>
                            );
                        })}
                    </svg>
                </div>

                {markers.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
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
                )}

                <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 text-xs">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-gray-700 dark:text-gray-300">Activo</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-gray-700 dark:text-gray-300">Seleccionado</span>
                    </div>
                </div>

                <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 text-xs text-gray-700 dark:text-gray-300">
                    <div>Centro: {centerLat.toFixed(4)}°, {centerLng.toFixed(4)}°</div>
                </div>
            </div>
        </div>
    );
};