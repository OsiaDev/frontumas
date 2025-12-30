import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { DroneCompactList } from '@/features/tracking/components/DroneCompactList';
import { DroneTrackingMap } from '@/features/tracking/components/DroneTrackingMap';
import { DroneDetailsPanel } from '@/features/tracking/components/DroneDetailsPanel';
import { GeofenceList } from '../components/GeofenceList';
import { MqttStatus } from '@/features/drones/components/MqttStatus';
import { geofencesApiService } from '@features/geofences/services/geofences.api.service';
import type { Geofence, GeofenceType } from '@shared/types/geofence.types';
import { useGeofenceEvents } from '@/features';

export const NewDashboardPage = () => {
    const [geofences, setGeofences] = useState<Geofence[]>([]);
    const [geofenceTypes, setGeofenceTypes] = useState<GeofenceType[]>([]);
    const [visibleGeofences, setVisibleGeofences] = useState<Set<string>>(new Set());
    const [centerTarget, setCenterTarget] = useState<{ lat: number; lng: number; zoom?: number } | null>(null);
    const lastProcessedCountRef = useRef(0);

    const { latestEvent, totalEventsReceived } = useGeofenceEvents();

    useEffect(() => {
        fetchGeofences();
        fetchGeofenceTypes();
    }, []);

    // Mostrar toast cuando llega un nuevo geo-evento
    useEffect(() => {
        // Solo procesar si hay un nuevo evento
        if (!latestEvent || totalEventsReceived <= lastProcessedCountRef.current) {
            return;
        }

        lastProcessedCountRef.current = totalEventsReceived;

        const isEntry = latestEvent.eventType === 'ENTRY';
        const message = isEntry
            ? `${latestEvent.vehicleId} entró a ${latestEvent.geofenceName}`
            : `${latestEvent.vehicleId} salió de ${latestEvent.geofenceName}`;

        if (isEntry) {
            toast.warning('Alerta de Geocerca', {
                description: message,
                duration: 8000,
            });
        } else {
            toast.info('Evento de Geocerca', {
                description: message,
                duration: 5000,
            });
        }
    }, [latestEvent, totalEventsReceived]);

    const fetchGeofences = async () => {
        try {
            const data = await geofencesApiService.getGeofences();
            setGeofences(data);
        } catch (error) {
            console.error('Error loading geofences:', error);
            toast.error('Error al cargar geocercas', {
                description: 'No se pudieron cargar las geocercas del servidor.',
            });
        }
    };

    const fetchGeofenceTypes = async () => {
        try {
            const data = await geofencesApiService.getGeofenceTypes();
            setGeofenceTypes(data);
        } catch (error) {
            console.error('Error loading geofence types:', error);
        }
    };

    const handleToggleGeofence = (id: string) => {
        setVisibleGeofences(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const handleCenterGeofence = (geofence: Geofence) => {
        try {
            const geojson = JSON.parse(geofence.geojson);
            if (geojson.type === 'FeatureCollection' && geojson.features.length > 0) {
                const feature = geojson.features[0];
                const geometry = feature.geometry;

                if (geometry.type === 'Polygon' && geometry.coordinates.length > 0) {
                    const coords = geometry.coordinates[0];
                    const latSum = coords.reduce((sum: number, coord: number[]) => sum + coord[1], 0);
                    const lngSum = coords.reduce((sum: number, coord: number[]) => sum + coord[0], 0);
                    setCenterTarget({
                        lat: latSum / coords.length,
                        lng: lngSum / coords.length,
                        zoom: 14,
                    });
                } else if (geometry.type === 'Point') {
                    setCenterTarget({
                        lng: geometry.coordinates[0],
                        lat: geometry.coordinates[1],
                        zoom: 15,
                    });
                }

                // Asegurar que la geocerca esté visible
                if (!visibleGeofences.has(geofence.id)) {
                    handleToggleGeofence(geofence.id);
                }

                // Resetear el target después de centrar
                setTimeout(() => setCenterTarget(null), 500);
            }
        } catch (error) {
            console.error('Error centering geofence:', error);
            toast.error('Error al centrar geocerca', {
                description: 'No se pudo centrar el mapa en esta geocerca.',
            });
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header Section */}
            <div className="flex-shrink-0 px-6 pt-6 pb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Dashboard de Monitoreo
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Sistema de seguimiento en tiempo real
                </p>
            </div>

            {/* MQTT Status */}
            <div className="flex-shrink-0 px-6 pb-4">
                <MqttStatus />
            </div>

            {/* Main Content Grid */}
            <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-4 px-6 pb-6 min-h-0">
                {/* Left Sidebar - Drones & Geofences */}
                <div className="xl:col-span-3 flex flex-col gap-4 min-h-0">
                    <DroneCompactList />
                    <GeofenceList
                        visibleGeofences={visibleGeofences}
                        onToggleGeofence={handleToggleGeofence}
                        onCenterGeofence={handleCenterGeofence}
                    />
                </div>

                {/* Center - Map */}
                <div className="xl:col-span-7 min-h-0">
                    <DroneTrackingMap
                        geofences={geofences}
                        geofenceTypes={geofenceTypes}
                        visibleGeofences={visibleGeofences}
                        centerTarget={centerTarget}
                    />
                </div>

                {/* Right Sidebar - Details */}
                <div className="xl:col-span-2 min-h-0 overflow-y-auto">
                    <DroneDetailsPanel />
                </div>
            </div>
        </div>
    );
};
