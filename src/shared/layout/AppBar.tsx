import { Menu, LogOut, User, Shield } from 'lucide-react';
import { useAuthStore, useSidebarStore } from '@core/store';
import { ThemeToggle } from '@shared/components/ThemeToggle';
import { useUserRoles } from '@features/auth';

export const AppBar = () => {
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const toggleSidebar = useSidebarStore((state) => state.toggleSidebar);
    const { primaryRole } = useUserRoles();

    return (
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm fixed top-0 left-0 right-0 z-40">
            <div className="h-full px-4 flex items-center justify-between">

                {/* Left Section */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleSidebar}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        aria-label="Toggle sidebar"
                    >
                        <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                    </button>

                    <div className="flex items-center gap-3">
                        <img
                            src="/fac-logo.png"
                            alt="FAC Logo"
                            className="h-10 w-10"
                        />
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">
                            UMAS
                        </h1>
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-3">
                    {/* User Info */}
                    <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700">
                        <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <div className="hidden sm:flex flex-col">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {user?.username}
                            </span>
                            <div className="flex items-center gap-1">
                                <Shield className="w-3 h-3 text-primary" />
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {primaryRole}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Theme Toggle */}
                    <ThemeToggle />

                    {/* Logout Button */}
                    <button
                        onClick={logout}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                        title="Cerrar sesión"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="text-sm font-medium hidden md:block">Salir</span>
                    </button>
                </div>
            </div>
        </header>
    );
};