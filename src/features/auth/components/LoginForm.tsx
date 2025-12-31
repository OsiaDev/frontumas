import { useState } from 'react';
import { Shield, User, Lock, LogIn } from 'lucide-react';
import { authService, type AuthMode } from '@/features/auth/services/auth.service';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { toast } from 'sonner';

export const LoginForm = () => {
    const [authMode, setAuthMode] = useState<AuthMode>(authService.getAuthMode());
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const login = useAuthStore((state) => state.login);

    const handleModeChange = (mode: AuthMode) => {
        setAuthMode(mode);
        authService.setAuthMode(mode);
    };

    const handleKeycloakLogin = async () => {
        setIsLoading(true);
        try {
            await authService.login();
        } catch (error) {
            console.error('Error al iniciar sesión con Keycloak:', error);
            setIsLoading(false);
        }
    };

    const handleTraditionalLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await login({ username, password });
            toast.success('Bienvenido', {
                description: `Has iniciado sesión como ${username}`,
            });
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            toast.error('Error de autenticación', {
                description: 'Usuario o contraseña incorrectos',
            });
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden p-4 bg-[#0f1823]">
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-[#004599]/10 via-transparent to-[#004599]/10"></div>
                <div className="absolute top-0 left-0 w-72 h-72 bg-[#004599]/20 rounded-full filter blur-3xl opacity-50 animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-72 h-72 bg-[#004599]/20 rounded-full filter blur-3xl opacity-50 animate-pulse"></div>
            </div>
            <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-md">
                <div className="bg-[#0f1823]/80 backdrop-blur-xl border border-[#004599]/20 rounded-xl shadow-2xl shadow-[#004599]/20 w-full p-8 md:p-12">
                    <div className="flex flex-col items-center mb-8">
                        <img
                            alt="Fuerza Aeroespacial Colombiana Logo"
                            className="h-20 w-20 mb-4"
                            src="/fac-logo.png"
                        />
                        <h1 className="text-2xl font-bold text-center text-white">
                            Fuerza Aeroespacial Colombiana
                        </h1>
                        <p className="text-sm text-gray-400 mt-1">Portal de Acceso Seguro</p>
                    </div>

                    {/* Mode Selector */}
                    <div className="mb-6">
                        <div className="flex items-center justify-center gap-2 p-1 bg-gray-800/50 rounded-lg">
                            <button
                                type="button"
                                onClick={() => handleModeChange('traditional')}
                                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                    authMode === 'traditional'
                                        ? 'bg-[#004599] text-white shadow-lg'
                                        : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                Tradicional
                            </button>
                            <button
                                type="button"
                                onClick={() => handleModeChange('keycloak')}
                                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                    authMode === 'keycloak'
                                        ? 'bg-[#004599] text-white shadow-lg'
                                        : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                Keycloak SSO
                            </button>
                        </div>
                    </div>

                    {/* Traditional Login Form */}
                    {authMode === 'traditional' && (
                        <form onSubmit={handleTraditionalLogin} className="space-y-4">
                            <div>
                                <label
                                    htmlFor="username"
                                    className="block text-sm font-medium text-gray-300 mb-2"
                                >
                                    Usuario
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        id="username"
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="admin"
                                        required
                                        disabled={isLoading}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#004599] focus:border-transparent transition-all disabled:opacity-50"
                                    />
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-gray-300 mb-2"
                                >
                                    Contraseña
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        disabled={isLoading}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#004599] focus:border-transparent transition-all disabled:opacity-50"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-[#004599] to-[#0056b3] hover:from-[#0056b3] hover:to-[#004599] text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-[#004599]/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                <LogIn className="w-6 h-6" />
                                {isLoading ? (
                                    <span>Iniciando sesión...</span>
                                ) : (
                                    <span>Iniciar Sesión</span>
                                )}
                            </button>

                            <div className="text-center">
                                <p className="text-xs text-gray-400">
                                    Credenciales de prueba: admin / admin
                                </p>
                            </div>
                        </form>
                    )}

                    {/* Keycloak Login */}
                    {authMode === 'keycloak' && (
                        <div className="space-y-4">
                            <button
                                onClick={handleKeycloakLogin}
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-[#004599] to-[#0056b3] hover:from-[#0056b3] hover:to-[#004599] text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-[#004599]/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                <Shield className="w-6 h-6" />
                                {isLoading ? (
                                    <span>Redirigiendo...</span>
                                ) : (
                                    <span>Login with Keycloak</span>
                                )}
                            </button>

                            <div className="text-center">
                                <p className="text-xs text-gray-400">
                                    Autenticación segura mediante Keycloak SSO
                                </p>
                            </div>
                        </div>
                    )}
                </div>
                <p className="mt-8 text-xs text-center text-gray-500">
                    © 2024 Fuerza Aeroespacial Colombiana. Todos los derechos reservados.
                </p>
            </div>
        </div>
    );
};
