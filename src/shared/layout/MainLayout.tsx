import type { ReactNode } from 'react';
import { AppBar } from './AppBar';
import { Sidebar } from './Sidebar';
import { useSidebar } from '@store';

interface MainLayoutProps {
    children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
    const { isExpanded } = useSidebar();

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
            <AppBar />
            <Sidebar />

            <main
                className={`
          pt-16 transition-all duration-300
          ${isExpanded ? 'ml-64' : 'ml-20'}
        `}
            >
                <div className="p-6">
                    {children}
                </div>
            </main>
        </div>
    );
};