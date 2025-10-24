// src/components/auth/LoginForm.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input } from '@shared/components/Input';
import { PasswordInput } from '@shared/components/PasswordInput';
import { Button } from '@shared/components/Button';

export const LoginForm = () => {
    const navigate = useNavigate();
    const { login, error, clearError, isLoading } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [formError, setFormError] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFormError('');
        clearError();

        if (!username || !password) {
            setFormError('Por favor completa todos los campos');
            return;
        }

        try {
            await login({ username, password });
            navigate('/dashboard');
        } catch {
            // Error manejado en el contexto
        }
    };

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(e.target.value);
        if (formError) setFormError('');
        if (error) clearError();
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        if (formError) setFormError('');
        if (error) clearError();
    };

    const displayError = formError || error;

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

                    {displayError && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                            <p className="text-sm text-red-300 text-center">{displayError}</p>
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <Input
                            id="username"
                            name="username"
                            type="text"
                            placeholder="Usuario"
                            value={username}
                            onChange={handleUsernameChange}
                            required
                            autoComplete="username"
                            disabled={isLoading}
                        />

                        <PasswordInput
                            id="password"
                            name="password"
                            placeholder="Contraseña"
                            value={password}
                            onChange={handlePasswordChange}
                            required
                            autoComplete="current-password"
                            disabled={isLoading}
                        />

                        <Button type="submit" isLoading={isLoading}>
                            Iniciar Sesión
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <a className="text-sm text-[#004599]/80 hover:text-[#004599] underline transition-colors duration-300" href="#" onClick={(e) => e.preventDefault()}>
                            ¿Olvidaste tu contraseña?
                        </a>
                    </div>
                </div>
                <p className="mt-8 text-xs text-center text-gray-500">
                    © 2024 Fuerza Aeroespacial Colombiana. Todos los derechos reservados.
                </p>
            </div>
        </div>
    );
};