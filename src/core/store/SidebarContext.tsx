import { createContext, useContext } from 'react';

export interface SidebarContextType {
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

export default SidebarContext;
