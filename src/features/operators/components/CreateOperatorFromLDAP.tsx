import { useState, useEffect } from 'react';
import { Search, UserPlus, Loader2, Eye, EyeOff, X } from 'lucide-react';
import { ldapApiService } from '../services/ldap.api.service';
import { keycloakApiService } from '../services/keycloak.api.service';
import { operatorsApiService } from '../services/operators.api.service';
import type { LDAPUser, KeycloakGroup, GroupPath, OperatorStatus } from '../types/ldap.types';

export const CreateOperatorFromLDAP = () => {
    const [step, setStep] = useState<'search' | 'form'>('search');
    const [credentialNumber, setCredentialNumber] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [ldapUser, setLdapUser] = useState<LDAPUser | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [groups, setGroups] = useState<KeycloakGroup[]>([]);
    const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

    // Form state
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        password: '',
        confirmPassword: '',
        employeeNumber: '',
        department: '',
        title: '',
        enabled: true
    });

    // Cargar grupos al montar el componente
    useEffect(() => {
        loadGroups();
    }, []);

    const loadGroups = async () => {
        try {
            const groupsData = await keycloakApiService.getAllGroups();
            console.log("GRUPOS");
            console.log(groupsData);
            setGroups(groupsData);
        } catch (err) {
            console.error('Error cargando grupos:', err);
        }
    };

    const getAllGroupPaths = (groupList: KeycloakGroup[]): GroupPath[] => {
        let paths: GroupPath[] = [];
        if (!groupList) return paths;
        console.log(groupList);
        groupList.forEach(group => {
            let spanish = 'UMAS';
            switch (group.groupName) {
                case 'ADMINISTRATOR':
                    spanish = 'Administradores'
                    break;
                     case 'COMMANDER':
                    spanish = 'Comandantes'
                    break;
                     case 'OPERATOR':
                    spanish = 'Operadores'
                    break;
                     case 'PLAYBACK':
                    spanish = 'Operadores'
                    break;
                default:
                    break;
            }
            const currentPath =  `/UMAS/${spanish}`;
            paths.push({
                path: currentPath,
                name: group.groupName,
                level: currentPath.split('/').length - 1
            });

            if (group.subGroups && group.subGroups.length > 0) {
                paths = [...paths, ...getAllGroupPaths(group.subGroups)];
            }
        });

        return paths;
    };

    const groupPaths = getAllGroupPaths(groups);

    const handleSearchLDAP = async () => {
        if (!credentialNumber.trim()) {
            setError('Ingrese un número de credencial');
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);
        setLdapUser(null);

        try {
            const response = await ldapApiService.findByCredentialNumber(credentialNumber.trim());
            console.log('Respuesta LDAP:', response);

            // Verificar que la respuesta tenga la estructura correcta y datos en body
            if (response && response.body && typeof response.body === 'object' && Object.keys(response.body).length > 0) {
                const user = response.body; // Extraer el body que contiene los datos del usuario
                setLdapUser(user);

                // Parsear nombre completo
                // Según tu respuesta, firstName ya viene con el nombre completo "Juan Rodriguez"
                // fullName también tiene "Juan Rodriguez"
                const nameParts = user.fullName ? user.fullName.split(' ') : ['', ''];
                const firstName = nameParts[0] || '';
                const lastName = nameParts.slice(1).join(' ') || '';

                setFormData({
                    username: user.userName || '',
                    email: user.email || '',
                    firstName,
                    lastName,
                    password: '',
                    confirmPassword: '',
                    employeeNumber: user.credentialNumber || credentialNumber,
                    department: user.department || '',
                    title: user.jobTitle || '',
                    enabled: true
                });

                setStep('form');
                setSuccessMessage('✅ Usuario encontrado en LDAP');
            } else {
                setError('Usuario no encontrado o sin datos válidos en LDAP');
            }
        } catch (err) {
            console.error('Error buscando usuario en LDAP:', err);
            setError('Usuario no encontrado en LDAP o error en la búsqueda');
            setLdapUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateUser = async () => {

        if (!formData.username.trim()) {
            setError('El username es requerido');
            return;
        }
        if (!formData.email.trim() || !formData.email.includes('@')) {
            setError('Email inválido');
            return;
        }
        if (!formData.password || formData.password.length < 6) {
            setError('Contraseña mínimo 6 caracteres');
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        if (!ldapUser?.credentialNumber) {
            setError('No se encontró el número de credencial del usuario LDAP');
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            // Paso 1: Buscar usuario en Keycloak por credentialNumber
            console.log('[CreateOperator] Buscando usuario en Keycloak con userName:', formData.username);
            let keycloakUser = await keycloakApiService.getUserByCredentialNumber(formData.username);

            if (keycloakUser) {
                // Usuario existe en Keycloak
                console.log('[CreateOperator] Usuario encontrado en Keycloak, ID:', keycloakUser.userName);
            } else {
                // Usuario NO existe en Keycloak, lo creamos
                console.log('[CreateOperator] Usuario no encontrado en Keycloak, procediendo a crear...');

                // Preparar atributos en el formato correcto
                const attributes: {
                    credentialNumber?: string[];
                    department?: string[];
                    grade?: string[];
                    jobTitle?: string[];
                } = {};

                if (ldapUser.credentialNumber) attributes.credentialNumber = [ldapUser.credentialNumber];
                if (formData.department) attributes.department = [ldapUser.department];
                if (ldapUser.grade) attributes.grade = [ldapUser.grade];

                const keycloakPayload = {
                    userName: formData.username,
                    email: formData.email,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    password: formData.password,
                    enable: true,
                    groups: [],
                    attributes: Object.keys(attributes).length > 0 ? attributes : undefined
                };

                try {
                    await keycloakApiService.createUser(keycloakPayload);
                    console.log('[CreateOperator] Usuario creado en Keycloak exitosamente');

                    // Buscar nuevamente para obtener el ID
                    keycloakUser = await keycloakApiService.getUserByCredentialNumber(formData.username);

                    if (keycloakUser) {
                        console.log('[CreateOperator] Usuario encontrado después de crear, ID:', keycloakUser.userName);
                    } else {
                        console.warn('[CreateOperator] No se pudo obtener el ID del usuario creado, usando credentialNumber');
                    }
                } catch (e) {
                    console.error('[CreateOperator] Error creando usuario en Keycloak:', e);
                    // Continuamos con credentialNumber como fallback
                }
            }

            // Paso 2: Crear usuario en la base de datos local (umas-resource-service)
            console.log('[CreateOperator] Creando usuario en DB con keycloakUserId:', keycloakUser?.userName);
            const operatorPayload = {
                username: formData.username,
                fullName: `${formData.firstName} ${formData.lastName}`.trim() || formData.username,
                email: formData.email,
                phoneNumber: ldapUser.credentialNumber,
                ugcsUserId: undefined, // Puede ser poblado luego si integran con UGCS
                userKeycloak: formData.username,
                status: 'ACTIVE' as OperatorStatus,
                isAvailable: true
            };

            await operatorsApiService.createOperator(operatorPayload);
            console.log('[CreateOperator] Usuario creado en base de datos local');

            setSuccessMessage(`✅ Usuario ${formData.username} creado exitosamente en Keycloak y base de datos`);

            // Reset form
            setTimeout(() => {
                resetForm();
            }, 3000);
        } catch (err) {
            console.error('[CreateOperator] Error:', err);
            setError('Error creando usuario. Puede que ya exista en Keycloak o en la base de datos.');
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setStep('search');
        setCredentialNumber('');
        setLdapUser(null);
        setFormData({
            username: '',
            email: '',
            firstName: '',
            lastName: '',
            password: '',
            confirmPassword: '',
            employeeNumber: '',
            department: '',
            title: '',
            enabled: true
        });
        setSelectedGroups([]);
        setError(null);
        setSuccessMessage(null);
    };

    const toggleGroupSelection = (path: string) => {
        setSelectedGroups(prev =>
            prev.includes(path)
                ? prev.filter(p => p !== path)
                : [...prev, path]
        );
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && step === 'search') {
            handleSearchLDAP();
        }
    };

    return (
        <div className="space-y-6">
            {/* Paso 1: Búsqueda en LDAP */}
            {step === 'search' && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Paso 1: Buscar Usuario en LDAP
                    </h3>

                    <div className="flex gap-3">
                        <div className="flex-1">
                            <input
                                type="text"
                                value={credentialNumber}
                                onChange={(e) => setCredentialNumber(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Número de credencial"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                disabled={isLoading}
                            />
                        </div>
                        <button
                            onClick={handleSearchLDAP}
                            disabled={isLoading}
                            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Search className="w-5 h-5" />
                            )}
                            Buscar
                        </button>
                    </div>

                    {error && (
                        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    {successMessage && (
                        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                            <p className="text-green-700 dark:text-green-400 text-sm">{successMessage}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Paso 2: Formulario de Creación */}
            {step === 'form' && ldapUser && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Paso 2: Crear Usuario (Keycloak + Base de Datos)
                        </h3>
                        <button
                            onClick={resetForm}
                            className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Vista previa datos LDAP */}
                    <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-sm text-blue-700 dark:text-blue-400 mb-2">
                            <strong>Datos obtenidos de LDAP:</strong>
                        </p>
                        <div className="text-sm text-blue-600 dark:text-blue-300 space-y-1">
                            <p><strong>Nombre:</strong> {ldapUser.fullName}</p>
                            <p><strong>Email:</strong> {ldapUser.email}</p>
                            <p><strong>Usuario:</strong> {ldapUser.userName}</p>
                            <p><strong>Departamento:</strong> {ldapUser.department}</p>
                            <p><strong>Cargo:</strong> {ldapUser.jobTitle}</p>
                            <p><strong>Empresa:</strong> {ldapUser.company}</p>
                            <p><strong>Estado:</strong> {ldapUser.jobStatus}</p>
                        </div>
                    </div>

                    {/* Formulario */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Username *
                            </label>
                            <input
                                type="text"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Email *
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Nombre
                            </label>
                            <input
                                type="text"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Apellido
                            </label>
                            <input
                                type="text"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Contraseña * (mín. 6 caracteres)
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Confirmar Contraseña *
                            </label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Número de Empleado
                            </label>
                            <input
                                type="text"
                                value={formData.employeeNumber}
                                readOnly
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 cursor-not-allowed"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Departamento
                            </label>
                            <input
                                type="text"
                                value={formData.department}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Cargo/Título
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>

                    {/* Selección de Grupos */}
                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Grupos (opcional)
                        </label>
                        <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 max-h-60 overflow-y-auto bg-white dark:bg-gray-700">
                            {groupPaths.length === 0 ? (
                                <p className="text-sm text-gray-500 dark:text-gray-400">No hay grupos disponibles</p>
                            ) : (
                                groupPaths.map(({ path, name, level }) => (
                                    <div key={path} className="flex items-center gap-2 py-1">
                                        <input
                                            type="checkbox"
                                            checked={selectedGroups.includes(path)}
                                            onChange={() => toggleGroupSelection(path)}
                                            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                                        />
                                        <label
                                            className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                                            style={{ paddingLeft: `${level * 20}px` }}
                                        >
                                            {name}
                                        </label>
                                    </div>
                                ))
                            )}
                        </div>
                        {selectedGroups.length > 0 && (
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                {selectedGroups.length} grupo(s) seleccionado(s)
                            </p>
                        )}
                    </div>

                    {/* Mensajes */}
                    {error && (
                        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    {successMessage && (
                        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                            <p className="text-green-700 dark:text-green-400 text-sm">{successMessage}</p>
                        </div>
                    )}

                    {/* Botones */}
                    <div className="mt-6 flex gap-3 justify-end">
                        <button
                            onClick={resetForm}
                            disabled={isLoading}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleCreateUser}
                            disabled={isLoading}
                            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <UserPlus className="w-5 h-5" />
                            )}
                            Crear Usuario
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
