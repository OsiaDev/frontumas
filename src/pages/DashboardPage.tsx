import { Activity, Users, FileText, TrendingUp } from 'lucide-react';

const stats = [
    { label: 'Usuarios Activos', value: '1,234', icon: Users, color: 'bg-blue-500' },
    { label: 'Reportes', value: '567', icon: FileText, color: 'bg-green-500' },
    { label: 'Actividad', value: '89%', icon: Activity, color: 'bg-yellow-500' },
    { label: 'Crecimiento', value: '+12%', icon: TrendingUp, color: 'bg-purple-500' },
];

export const DashboardPage = () => {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Dashboard
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Bienvenido al sistema UMAS - Fuerza Aeroespacial Colombiana
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                            {stat.value}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {stat.label}
                        </p>
                    </div>
                ))}
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Actividad Reciente
                </h3>
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <div className="w-2 h-2 rounded-full bg-primary"></div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    Nueva actividad registrada
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Hace {i} hora{i > 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};