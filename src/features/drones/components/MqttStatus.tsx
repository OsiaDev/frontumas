import { Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { useDroneLocations } from '@features/tracking';

export const MqttStatus = () => {
    const { isConnected, isLoading, error, messageCount } = useDroneLocations();

    const getStatusConfig = () => {
        if (isLoading) {
            return {
                icon: Wifi,
                color: 'text-yellow-500',
                bgColor: 'bg-yellow-500/10',
                borderColor: 'border-yellow-500/30',
                text: 'Conectando...',
                pulse: true,
            };
        }

        if (error) {
            return {
                icon: AlertCircle,
                color: 'text-red-500',
                bgColor: 'bg-red-500/10',
                borderColor: 'border-red-500/30',
                text: 'Error de conexión',
                pulse: false,
            };
        }

        if (isConnected) {
            return {
                icon: Wifi,
                color: 'text-green-500',
                bgColor: 'bg-green-500/10',
                borderColor: 'border-green-500/30',
                text: 'Conectado',
                pulse: false,
            };
        }

        return {
            icon: WifiOff,
            color: 'text-gray-500',
            bgColor: 'bg-gray-500/10',
            borderColor: 'border-gray-500/30',
            text: 'Desconectado',
            pulse: false,
        };
    };

    const config = getStatusConfig();
    const Icon = config.icon;

    return (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${config.borderColor} ${config.bgColor}`}>
            <div className="relative">
                <Icon className={`w-5 h-5 ${config.color}`} />
                {config.pulse && (
                    <span className="absolute inset-0 rounded-full bg-yellow-500 animate-ping opacity-30"></span>
                )}
            </div>
            <div className="flex-1">
                <p className={`text-sm font-medium ${config.color}`}>
                    MQTT: {config.text}
                </p>
                {isConnected && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {messageCount} mensajes recibidos
                    </p>
                )}
                {error && (
                    <p className="text-xs text-red-400">
                        {error.message}
                    </p>
                )}
            </div>
        </div>
    );
};