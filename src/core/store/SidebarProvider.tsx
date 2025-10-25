import { useState } from 'react';
import type { ReactNode } from 'react';
import SidebarContext from './SidebarContext';

interface SidebarProviderProps {
    children: ReactNode;
}

export const SidebarProvider = ({ children }: SidebarProviderProps) => {
    const [isExpanded, setIsExpanded] = useState(true);

    const toggleSidebar = () => setIsExpanded(prev => !prev);
    const expandSidebar = () => setIsExpanded(true);
    const collapseSidebar = () => setIsExpanded(false);

    return (
        <SidebarContext.Provider
            value={{ isExpanded, toggleSidebar, expandSidebar, collapseSidebar }}
        >
            {children}
        </SidebarContext.Provider>
    );
};
