import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarStoreState {
    // Estado
    isExpanded: boolean;

    // Acciones
    toggleSidebar: () => void;
    expandSidebar: () => void;
    collapseSidebar: () => void;
}

export const useSidebarStore = create<SidebarStoreState>()(
    persist(
        (set) => ({
            // Estado inicial
            isExpanded: true,

            // Acciones
            toggleSidebar: () => {
                set((state) => ({ isExpanded: !state.isExpanded }));
            },

            expandSidebar: () => {
                set({ isExpanded: true });
            },

            collapseSidebar: () => {
                set({ isExpanded: false });
            },
        }),
        {
            name: 'sidebar-storage',
            partialize: (state) => ({ isExpanded: state.isExpanded }),
        }
    )
);
