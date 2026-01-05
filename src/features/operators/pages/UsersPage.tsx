import { useState } from 'react';
import { Users, UserPlus } from 'lucide-react';
import { OperatorsList } from '@features/operators/components/OperatorsList';
import { CreateOperatorFromLDAP } from '@features/operators/components/CreateOperatorFromLDAP';

type TabType = 'list' | 'create' | 'ldap';

export const UsersPage = () => {
    const [activeTab, setActiveTab] = useState<TabType>('list');

    const tabs = [
        {
            id: 'list' as TabType,
            label: 'Usuarios',
            icon: Users,
            description: 'Lista de usuarios registrados'
        },
        {
            id: 'create' as TabType,
            label: 'Crear Usuario',
            icon: UserPlus,
            description: 'Crear usuario desde LDAP y registrar en base de datos'
        }
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Gestión de Usuarios
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Administración de usuarios del sistema - Integración con Active Directory, Keycloak y Base de Datos
                </p>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    group inline-flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm
                                    transition-colors duration-200
                                    ${isActive
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                                    }
                                `}
                            >
                                <Icon className="w-5 h-5" />
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Tab: Lista de Usuarios */}
            {activeTab === 'list' && (
                <div>
                    <OperatorsList />
                </div>
            )}

            {/* Tab: Crear Usuario desde LDAP */}
            {activeTab === 'create' && (
                <div>
                    <div className="mb-4">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Crear Usuario desde Active Directory
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Busca un usuario en LDAP por número de credencial y créalo en Keycloak y la base de datos local
                        </p>
                    </div>
                    <CreateOperatorFromLDAP />
                </div>
            )}
        </div>
    );
};
