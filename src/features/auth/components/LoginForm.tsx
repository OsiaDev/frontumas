import { useState } from 'react';
import { Shield } from 'lucide-react';
import { authService } from '@/features/auth/services/auth.service';

export const LoginForm = () => {
    const [isLoading, setIsLoading] = useState(false);

    const handleKeycloakLogin = async () => {
        setIsLoading(true);
        try {
            await authService.login();
        } catch (error) {
            console.error('Error al iniciar sesión con Keycloak:', error);
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
                                <span>Iniciar Sesión</span>
                            )}
                        </button>

                        <div className="text-center">
                            <p className="text-xs text-gray-400">
                                Autenticación segura mediante Keycloak SSO
                            </p>
                        </div>
                    </div>
                </div>
                <p className="mt-8 text-xs text-center text-gray-500">
                    © 2024 Fuerza Aeroespacial Colombiana. Todos los derechos reservados.
                </p>
            </div>
        </div>
    );
};
