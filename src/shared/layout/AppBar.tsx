import { Menu, LogOut, User } from 'lucide-react';
import { useAuthStore, useSidebarStore } from '@core/store';

export const AppBar = () => {
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const toggleSidebar = useSidebarStore((state) => state.toggleSidebar);

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
                <div className="flex items-center gap-4">
                    {/* User Info */}
                    <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700">
                        <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
              {user?.username}
            </span>
                    </div>

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