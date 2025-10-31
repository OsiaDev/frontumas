import { create } from 'zustand';
import type { Route, RouteMap } from '@shared/types/route.types';

interface RouteStore {
    routes: RouteMap;

    // Actions
    setRoutes: (routes: Route[]) => void;
    addRoute: (route: Route) => void;
    updateRoute: (routeId: string, route: Partial<Route>) => void;
    removeRoute: (routeId: string) => void;
    clearAllRoutes: () => void;

    // Selectors
    getRoute: (routeId: string) => Route | undefined;
    getAllRoutes: () => Route[];
}

export const useRouteStore = create<RouteStore>((set, get) => ({
    routes: {},

    // Actions
    setRoutes: (routes: Route[]) => {
        const routeMap: RouteMap = {};
        routes.forEach(route => {
            routeMap[route.id] = route;
        });
        set({ routes: routeMap });
    },

    addRoute: (route: Route) => {
        set((state) => ({
            routes: {
                ...state.routes,
                [route.id]: route,
            },
        }));
    },

    updateRoute: (routeId: string, route: Partial<Route>) => {
        set((state) => {
            const existingRoute = state.routes[routeId];
            if (!existingRoute) return state;

            return {
                routes: {
                    ...state.routes,
                    [routeId]: {
                        ...existingRoute,
                        ...route,
                    },
                },
            };
        });
    },

    removeRoute: (routeId: string) => {
        set((state) => {
            const newRoutes = { ...state.routes };
            delete newRoutes[routeId];
            return { routes: newRoutes };
        });
    },

    clearAllRoutes: () => {
        set({ routes: {} });
    },

    // Selectors
    getRoute: (routeId: string) => {
        return get().routes[routeId];
    },

    getAllRoutes: () => {
        return Object.values(get().routes);
    },
}));
