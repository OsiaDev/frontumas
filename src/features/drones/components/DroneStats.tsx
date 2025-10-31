import { Plane, Activity, AlertTriangle, Battery } from 'lucide-react';
import { useDroneStore } from '../store/useDroneStore';

export const DroneStats = () => {
    const getActiveDrones = useDroneStore((state) => state.getActiveDrones);
    const getTotalDrones = useDroneStore((state) => state.getTotalDrones);
    const activeDrones = getActiveDrones();
    const totalDrones = getTotalDrones();

    // Calcular promedio de batería
    const averageBattery = activeDrones.length > 0
        ? activeDrones.reduce((sum, drone) => sum + drone.lastLocation.batteryLevel, 0) / activeDrones.length
        : 0;

    // Contar drones con batería baja
    const lowBatteryDrones = activeDrones.filter(
        drone => drone.lastLocation.batteryLevel < 30
    ).length;

    const stats = [
        {
            label: 'Total Drones',
            value: totalDrones.toString(),
            icon: Plane,
            color: 'bg-blue-500',
        },
        {
            label: 'Activos',
            value: activeDrones.length.toString(),
            icon: Activity,
            color: 'bg-green-500',
        },
        {
            label: 'Batería Promedio',
            value: `${averageBattery.toFixed(0)}%`,
            icon: Battery,
            color: 'bg-yellow-500',
        },
        {
            label: 'Batería Baja',
            value: lowBatteryDrones.toString(),
            icon: AlertTriangle,
            color: 'bg-red-500',
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
                <div
                    key={stat.label}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className={`${stat.color} p-3 rounded-lg`}>
                            <stat.icon className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                        {stat.value}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {stat.label}
                    </p>
                </div>
            ))}
        </div>
    );
};