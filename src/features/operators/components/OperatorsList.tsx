import { useState, useEffect } from 'react';
import { Search, RefreshCw, Users, Trash2 } from 'lucide-react';
import { operatorsApiService } from '../services/operators.api.service';
import type { Operator } from '../types/ldap.types';

export const OperatorsList = () => {
    const [users, setUsers] = useState<Operator[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<Operator[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const filterUsers = () => {
        let filtered = users;

        // Filtrar por término de búsqueda
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(user =>
                user.username.toLowerCase().includes(term) ||
                user.fullName.toLowerCase().includes(term) ||
                user.email.toLowerCase().includes(term) ||
                (user.phoneNumber && user.phoneNumber.toLowerCase().includes(term)) ||
                (user.keycloakUserId && user.keycloakUserId.toLowerCase().includes(term))
            );
        }

        setFilteredUsers(filtered);
    };

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        filterUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [users, searchTerm]);

    const loadUsers = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const dbUsers = await operatorsApiService.getAllOperators();
            console.log('[OperatorsList] Usuarios de BD:', dbUsers.length);
            setUsers(dbUsers);
        } catch (err) {
            console.error('Error cargando usuarios:', err);
            setError('Error al cargar usuarios');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (user: Operator) => {
        if (!confirm(`¿Eliminar usuario ${user.username}?`)) {
            return;
        }

        try {
            await operatorsApiService.deleteOperator(user.id);
            alert(`✅ Usuario ${user.username} eliminado`);
            loadUsers();
        } catch (error) {
            console.error('Error eliminando usuario:', error);
            alert('❌ Error al eliminar usuario');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Cargando usuarios...</p>
                </div>
            </div>
        );
    }

    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status === 'ACTIVE').length;
    const availableUsers = users.filter(u => u.isAvailable).length;

    return (
        <div className="space-y-6">
            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                Total Usuarios
                            </p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                {totalUsers}
                            </p>
                        </div>
                        <div className="p-3 bg-primary/10 rounded-lg">
                            <Users className="w-8 h-8 text-primary" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                Usuarios Activos
                            </p>
                            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                                {activeUsers}
                            </p>
                        </div>
                        <div className="p-3 bg-green-500/10 rounded-lg">
                            <Users className="w-8 h-8 text-green-500" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                Disponibles
                            </p>
                            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                {availableUsers}
                            </p>
                        </div>
                        <div className="p-3 bg-blue-500/10 rounded-lg">
                            <Users className="w-8 h-8 text-blue-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Barra de búsqueda */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Búsqueda */}
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar por nombre, email, teléfono o ID de Keycloak..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>

                    <button
                        onClick={loadUsers}
                        disabled={isLoading}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Actualizar
                    </button>
                </div>

                <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                    Mostrando {filteredUsers.length} de {users.length} usuarios
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-red-700 dark:text-red-400">{error}</p>
                </div>
            )}

            {/* Lista de usuarios */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Usuario
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Teléfono
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Keycloak ID
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Disponibilidad
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <p className="text-gray-500 dark:text-gray-400">
                                            {searchTerm
                                                ? 'No se encontraron usuarios con los filtros aplicados'
                                                : 'No hay usuarios registrados'}
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        {/* Usuario */}
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {user.fullName}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    @{user.username}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Email */}
                                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                            {user.email}
                                        </td>

                                        {/* Teléfono */}
                                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                            {user.phoneNumber || '—'}
                                        </td>

                                        {/* Keycloak ID */}
                                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                            {user.keycloakUserId ? (
                                                <span className="font-mono text-xs">
                                                    {user.keycloakUserId}
                                                </span>
                                            ) : (
                                                '—'
                                            )}
                                        </td>

                                        {/* Estado */}
                                        <td className="px-6 py-4 text-center">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    user.status === 'ACTIVE'
                                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                                }`}
                                            >
                                                {user.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>

                                        {/* Disponibilidad */}
                                        <td className="px-6 py-4 text-center">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    user.isAvailable
                                                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                                }`}
                                            >
                                                {user.isAvailable ? 'Disponible' : 'No disponible'}
                                            </span>
                                        </td>

                                        {/* Acciones */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleDelete(user)}
                                                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    title="Eliminar usuario"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
