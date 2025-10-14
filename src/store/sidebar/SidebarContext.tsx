import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface SidebarContextType {
    isExpanded: boolean;
    toggleSidebar: () => void;
    expandSidebar: () => void;
    collapseSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error('useSidebar debe usarse dentro de SidebarProvider');
    }
    return context;
};

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