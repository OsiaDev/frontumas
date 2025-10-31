import type { ReactNode } from 'react';
import { AppBar } from './AppBar';
import { Sidebar } from './Sidebar';
import { useSidebarStore } from '@core/store';

interface MainLayoutProps {
    children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
    const isExpanded = useSidebarStore((state) => state.isExpanded);

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
            <AppBar />
            <Sidebar />

            <main
                className={`
          pt-16 h-screen transition-all duration-300 overflow-y-auto
          ${isExpanded ? 'ml-64' : 'ml-20'}
        `}
            >
                {children}
            </main>
        </div>
    );
};