import { Home, Users, Settings, FileText, BarChart3, Plane, Route, SquareDashed, ListChecks } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import type { ComponentType } from 'react';
import { useSidebarStore } from '@core/store';
import { useUserRoles } from '@/features/auth/hooks/useUserRoles';
import { hasModuleAccess } from '@/features/auth/config/rolePermissions';
import type { RolePermissions } from '@/features/auth/config/rolePermissions';

interface NavItem {
    path: string;
    label: string;
    icon: ComponentType<{ className?: string }>;
    module: keyof RolePermissions['modules'];
}

const navItems: NavItem[] = [
    { path: '/dashboard', label: 'Dashboard', icon: Home, module: 'dashboard' },
    { path: '/drones', label: 'Drones', icon: Plane, module: 'drones' },
    { path: '/routes', label: 'Rutas', icon: Route, module: 'routes' },
    { path: '/geofences', label: 'Geocercas', icon: SquareDashed, module: 'geofences' },
    { path: '/missions', label: 'Misiones', icon: ListChecks, module: 'missions' },
    { path: '/users', label: 'Usuarios', icon: Users, module: 'users' },
    { path: '/reports', label: 'Reportes', icon: FileText, module: 'reports' },
    { path: '/analytics', label: 'Analítica', icon: BarChart3, module: 'analytics' },
    { path: '/settings', label: 'Configuración', icon: Settings, module: 'settings' },
];

export const Sidebar = () => {
    const isExpanded = useSidebarStore((state) => state.isExpanded);
    const { roles } = useUserRoles();

    // Filtrar items de navegación según los permisos del usuario
    const allowedNavItems = navItems.filter(item =>
        hasModuleAccess(roles, item.module)
    );

    return (
        <aside
            className={`
        fixed left-0 top-16 h-[calc(100vh-4rem)]
        bg-white dark:bg-gray-800
        border-r border-gray-200 dark:border-gray-700
        shadow-lg transition-all duration-300 z-30
        ${isExpanded ? 'w-64' : 'w-20'}
      `}
        >
            <nav className="p-4 space-y-2">
                {allowedNavItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-lg
              transition-all duration-200
              ${isActive
                            ? 'bg-primary text-white shadow-lg shadow-primary/30'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }
              ${!isExpanded && 'justify-center'}
            `}
                    >
                        <item.icon className="w-6 h-6 flex-shrink-0" />
                        {isExpanded && (
                            <span className="font-medium text-sm whitespace-nowrap">
                {item.label}
              </span>
                        )}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
};