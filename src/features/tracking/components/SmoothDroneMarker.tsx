import { useEffect } from 'react';
import { CircleMarker, Polyline, Popup, useMap } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import { useSmoothDronePosition } from '@/features/tracking/hooks/useSmoothDronePosition';
import type { Position } from '@/features/tracking/hooks/useSmoothDronePosition';

interface SmoothDroneMarkerProps {
    vehicleId: string;
    targetPosition: Position;
    isSelected: boolean;
    historyPath: LatLngExpression[];
    onMarkerClick: () => void;
}

export const SmoothDroneMarker = ({
    vehicleId,
    targetPosition,
    isSelected,
    historyPath,
    onMarkerClick,
}: SmoothDroneMarkerProps) => {
    const map = useMap();

    // Usar interpolación suave para la posición
    const smoothPosition = useSmoothDronePosition(targetPosition, {
        duration: 1000,
        enabled: true,
    });

    const position: LatLngExpression = [smoothPosition.latitude, smoothPosition.longitude];

    // Si el dron está seleccionado, actualizar el centro del mapa suavemente
    useEffect(() => {
        if (isSelected) {
            // Solo actualizar si la posición cambió significativamente
            const currentCenter = map.getCenter();
            const distance = Math.sqrt(
                Math.pow(currentCenter.lat - smoothPosition.latitude, 2) +
                Math.pow(currentCenter.lng - smoothPosition.longitude, 2)
            );

            // Solo mover el mapa si el dron se movió más de ~50 metros
            if (distance > 0.0005) {
                map.panTo([smoothPosition.latitude, smoothPosition.longitude], {
                    animate: true,
                    duration: 0.5,
                    noMoveStart: true,
                });
            }
        }
    }, [smoothPosition.latitude, smoothPosition.longitude, isSelected, map]);

    return (
        <>
            {/* Línea de trayectoria */}
            {historyPath.length > 1 && (
                <Polyline
                    positions={historyPath}
                    pathOptions={{
                        color: isSelected ? '#3b82f6' : '#94a3b8',
                        weight: 3,
                        opacity: isSelected ? 0.8 : 0.4,
                        className: 'drone-polyline',
                    }}
                />
            )}

            {/* Marcador del dron con transiciones CSS */}
            <CircleMarker
                center={position}
                radius={isSelected ? 12 : 8}
                pathOptions={{
                    fillColor: isSelected ? '#3b82f6' : '#10b981',
                    fillOpacity: 1,
                    color: '#ffffff',
                    weight: 2,
                    className: 'smooth-drone-marker',
                }}
                eventHandlers={{
                    click: onMarkerClick,
                }}
            >
                <Popup>
                    <div className="text-sm">
                        <p className="font-bold text-gray-900">
                            {vehicleId}
                        </p>
                        <p className="text-gray-600 text-xs mt-1">
                            Click para ver detalles
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                            Lat: {smoothPosition.latitude.toFixed(6)}
                        </p>
                        <p className="text-gray-500 text-xs">
                            Lng: {smoothPosition.longitude.toFixed(6)}
                        </p>
                    </div>
                </Popup>
            </CircleMarker>
        </>
    );
};
