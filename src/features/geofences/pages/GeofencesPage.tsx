import { GeofenceTable } from '../components/GeofenceTable';

export const GeofencesPage = () => {
    return (
        <div className="p-6 space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Gestión de Geocercas
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Administración de zonas geográficas - Fuerza Aeroespacial Colombiana
                </p>
            </div>

            {/* Gestión de Geocercas - CRUD */}
            <GeofenceTable />
        </div>
    );
};