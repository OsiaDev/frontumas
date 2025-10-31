# Guía de Migración a Zustand

## Resumen

Se ha migrado el estado global de React Context API a **Zustand** con persistencia en **localStorage**. Los stores antiguos (AuthProvider, DroneProvider, TrackingProvider, SidebarProvider) siguen funcionando pero están **deprecated**.

## Beneficios de Zustand

- ✅ **Persistencia automática** en localStorage
- ✅ **Mejor performance** - Solo se re-renderizan componentes que usan el estado específico
- ✅ **Código más simple** - Sin provider hell
- ✅ **TypeScript type-safe** por defecto
- ✅ **DevTools integrados** para debugging
- ✅ **Menor bundle size** comparado con Context API

## Stores Disponibles

### 1. `useAuthStore` - Autenticación

**Ubicación:** `@features/auth`

**Antes (Context API):**
```typescript
import { useAuth } from '@features/auth';

function MyComponent() {
    const { user, isAuthenticated, isLoading, login, logout } = useAuth();
    // ...
}
```

**Después (Zustand):**
```typescript
import { useAuthStore } from '@features/auth';

function MyComponent() {
    const { user, isAuthenticated, isLoading, login, logout } = useAuthStore();
    // O seleccionar solo lo que necesitas para mejor performance:
    const user = useAuthStore((state) => state.user);
    const login = useAuthStore((state) => state.login);
}
```

**Estado disponible:**
- `user: User | null`
- `isAuthenticated: boolean`
- `isLoading: boolean`
- `error: string | null`

**Acciones:**
- `login(credentials: LoginCredentials): Promise<void>`
- `logout(): void`
- `clearError(): void`

---

### 2. `useDroneStore` - Estado de Drones MQTT

**Ubicación:** `@features/drones`

**Antes (Context API):**
```typescript
import { useDrones } from '@features/drones';

function MyComponent() {
    const { drones, updateDroneLocation, getDrone, getActiveDrones } = useDrones();
    // ...
}
```

**Después (Zustand):**
```typescript
import { useDroneStore } from '@features/drones';

function MyComponent() {
    const { drones, updateDroneLocation, getDrone, getActiveDrones } = useDroneStore();
    // O seleccionar solo lo que necesitas:
    const activeDrones = useDroneStore((state) => state.getActiveDrones());
    const updateLocation = useDroneStore((state) => state.updateDroneLocation);
}
```

**Estado disponible:**
- `drones: DroneMap`

**Acciones:**
- `updateDroneLocation(message: DroneLocationMessage): void`
- `removeDrone(vehicleId: string): void`
- `clearAllDrones(): void`
- `getDrone(vehicleId: string): DroneState | undefined`
- `getActiveDrones(): DroneState[]`
- `getTotalDrones(): number`

---

### 3. `useTrackingStore` - Tracking de Drones

**Ubicación:** `@features/tracking`

**Antes (Context API):**
```typescript
import { useTracking } from '@features/tracking';

function MyComponent() {
    const { selectedDroneId, selectDrone, getDroneHistory } = useTracking();
    // ...
}
```

**Después (Zustand):**
```typescript
import { useTrackingStore } from '@features/tracking';

function MyComponent() {
    const { selectedDroneId, selectDrone, getDroneHistory } = useTrackingStore();
    // O seleccionar solo lo que necesitas:
    const selectedId = useTrackingStore((state) => state.selectedDroneId);
    const selectDrone = useTrackingStore((state) => state.selectDrone);
}
```

**Estado disponible:**
- `selectedDroneId: string | null`
- `histories: { [vehicleId: string]: DroneLocationMessage[] }`

**Acciones:**
- `selectDrone(vehicleId: string | null): void`
- `getDroneHistory(vehicleId: string): DroneLocationMessage[]`
- `clearHistory(vehicleId: string): void`
- `clearAllHistories(): void`
- `addLocationToHistory(vehicleId: string, location: DroneLocationMessage): void`

---

### 4. `useSidebarStore` - Estado del Sidebar

**Ubicación:** `@core/store`

**Antes (Context API):**
```typescript
import { useSidebar } from '@core/store/SidebarContext';

function MyComponent() {
    const { isExpanded, toggleSidebar } = useSidebar();
    // ...
}
```

**Después (Zustand):**
```typescript
import { useSidebarStore } from '@core/store/useSidebarStore';

function MyComponent() {
    const { isExpanded, toggleSidebar } = useSidebarStore();
    // O seleccionar solo lo que necesitas:
    const isExpanded = useSidebarStore((state) => state.isExpanded);
    const toggle = useSidebarStore((state) => state.toggleSidebar);
}
```

**Estado disponible:**
- `isExpanded: boolean`

**Acciones:**
- `toggleSidebar(): void`
- `expandSidebar(): void`
- `collapseSidebar(): void`

---

## Patrón de Optimización

Zustand permite **selección granular** del estado para evitar re-renders innecesarios:

```typescript
// ❌ NO ÓPTIMO - Se re-renderiza cuando CUALQUIER cosa cambia en el store
function MyComponent() {
    const store = useAuthStore();
    return <div>{store.user?.name}</div>;
}

// ✅ ÓPTIMO - Solo se re-renderiza cuando user.name cambia
function MyComponent() {
    const userName = useAuthStore((state) => state.user?.name);
    return <div>{userName}</div>;
}
```

## Persistencia en localStorage

Todos los stores tienen persistencia automática:

- **AuthStore** → `localStorage['auth-storage']`
- **DroneStore** → `localStorage['drone-storage']`
- **TrackingStore** → `localStorage['tracking-storage']`
- **SidebarStore** → `localStorage['sidebar-storage']`

El estado se restaura automáticamente al recargar la página.

## Debugging con DevTools

Instala **Zustand DevTools** (opcional):

```bash
npm install simple-zustand-devtools
```

Y agrégalo a tus stores:

```typescript
import { devtools } from 'zustand/middleware';

export const useAuthStore = create<AuthState>()(
    devtools(
        persist(
            (set, get) => ({
                // ...
            }),
            { name: 'auth-storage' }
        ),
        { name: 'AuthStore' }
    )
);
```

## Migración Gradual

Los providers antiguos **NO han sido eliminados**, por lo que puedes migrar gradualmente:

1. Los componentes nuevos deben usar Zustand
2. Los componentes existentes pueden seguir usando Context API
3. Migra componente por componente según sea necesario
4. Una vez que todos estén migrados, puedes eliminar los providers antiguos

## Ejemplo Completo de Migración

**Antes:**
```typescript
import { useAuth } from '@features/auth';
import { useDrones } from '@features/drones';
import { useTracking } from '@features/tracking';

export const Dashboard = () => {
    const { user } = useAuth();
    const { drones, getActiveDrones } = useDrones();
    const { selectedDroneId, selectDrone } = useTracking();

    const activeDrones = getActiveDrones();

    return (
        <div>
            <h1>Bienvenido, {user?.name}</h1>
            <p>Drones activos: {activeDrones.length}</p>
        </div>
    );
};
```

**Después (Optimizado):**
```typescript
import { useAuthStore } from '@features/auth';
import { useDroneStore } from '@features/drones';
import { useTrackingStore } from '@features/tracking';

export const Dashboard = () => {
    // Selección granular para mejor performance
    const userName = useAuthStore((state) => state.user?.name);
    const getActiveDrones = useDroneStore((state) => state.getActiveDrones);
    const { selectedDroneId, selectDrone } = useTrackingStore();

    const activeDrones = getActiveDrones();

    return (
        <div>
            <h1>Bienvenido, {userName}</h1>
            <p>Drones activos: {activeDrones.length}</p>
        </div>
    );
};
```

---

## ¿Preguntas?

- Documentación oficial de Zustand: https://docs.pmnd.rs/zustand
- Para dudas, consulta con el equipo de desarrollo
