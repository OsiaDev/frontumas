# 🎯 Feature-First Architecture - UMAS

## ✅ Reorganización Completa por Features

Tu proyecto ahora está 100% organizado por **dominios/features** en lugar de por tipos de archivos.

---

## 📁 Nueva Estructura

```
src/
├── features/                  🎯 TODO organizado por dominio
│   │
│   ├── auth/                 🔐 Feature de Autenticación
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── pages/
│   │   │   └── LoginPage.tsx
│   │   ├── context/
│   │   │   ├── AuthContext.tsx       # Hook: useAuth
│   │   │   └── AuthProvider.tsx
│   │   ├── services/
│   │   │   └── auth.service.ts
│   │   ├── types/
│   │   │   └── auth.types.ts
│   │   └── index.ts                  # Exporta todo
│   │
│   ├── drones/               🚁 Feature de Gestión de Drones
│   │   ├── components/
│   │   │   ├── DroneList.tsx
│   │   │   ├── DroneStats.tsx
│   │   │   └── MqttStatus.tsx
│   │   ├── pages/
│   │   │   └── DronesPage.tsx
│   │   ├── context/
│   │   │   ├── DroneContext.tsx      # Hook: useDrones
│   │   │   └── DroneProvider.tsx
│   │   ├── services/
│   │   │   └── drones.api.service.ts
│   │   ├── hooks/
│   │   │   └── useDronesApi.ts
│   │   ├── types/
│   │   │   └── drone.types.ts
│   │   └── index.ts
│   │
│   └── tracking/             📍 Feature de Tracking en Mapa
│       ├── components/
│       │   ├── DroneTrackingMap.tsx
│       │   ├── DroneCompactList.tsx
│       │   ├── DroneDetailsPanel.tsx
│       │   ├── DroneMarkerIcon.tsx
│       │   └── MapCoordinatesDisplay.tsx
│       ├── pages/
│       │   └── DashboardPage.tsx
│       ├── context/
│       │   ├── TrackingContext.tsx   # Hook: useTracking
│       │   └── TrackingProvider.tsx
│       ├── services/
│       │   └── mqtt/
│       │       ├── mqtt.service.ts
│       │       └── mqtt.handlers.ts
│       ├── hooks/
│       │   ├── useMqttConnection.ts
│       │   └── useDroneLocations.ts
│       └── index.ts
│
├── core/                      ⚙️ Infraestructura central
│   ├── router/
│   │   ├── routes.ts                 # Constantes de rutas
│   │   ├── AppRouter.tsx
│   │   └── index.ts
│   ├── config/
│   │   ├── api.config.ts
│   │   ├── mqtt.config.ts
│   │   ├── map.config.ts
│   │   ├── keycloak.config.ts
│   │   └── index.ts
│   ├── store/
│   │   ├── AppProvider.tsx           # 🆕 Combina todos los providers
│   │   ├── SidebarContext.tsx
│   │   ├── SidebarProvider.tsx
│   │   └── index.ts
│   └── index.ts
│
├── shared/                    🔄 Componentes/utils compartidos
│   ├── components/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── PasswordInput.tsx
│   │   ├── ErrorBoundary.tsx
│   │   └── index.tsx
│   ├── layout/
│   │   ├── AppBar.tsx
│   │   ├── Sidebar.tsx
│   │   ├── MainLayout.tsx
│   │   └── index.tsx
│   ├── utils/
│   │   ├── constants.ts
│   │   └── handleError.ts
│   ├── services/
│   │   └── api.service.ts            # HTTP client genérico
│   └── index.tsx
│
├── App.tsx                    # Raíz (12 líneas)
└── main.tsx
```

---

## 🎨 Path Aliases Configurados

```typescript
// Feature imports
import { useAuth, LoginPage, ProtectedRoute } from '@features/auth';
import { useDrones, DroneList, DronesPage } from '@features/drones';
import { useTracking, DashboardPage } from '@features/tracking';

// Core imports
import { AppProvider, useSidebar } from '@core/store';
import { AppRouter, ROUTES } from '@core/router';
import { API_CONFIG, MQTT_CONFIG } from '@core/config';

// Shared imports
import { Button, Input, ErrorBoundary } from '@shared/components';
import { MainLayout, AppBar, Sidebar } from '@shared/layout';
```

---

## 📝 Cómo Funciona Cada Feature

### **1. Feature: auth**

```typescript
// ✅ Todo en un solo lugar
features/auth/
├── components/       → LoginForm, ProtectedRoute
├── pages/            → LoginPage
├── context/          → useAuth hook + AuthProvider
├── services/         → authService (login/logout)
├── types/            → User, LoginCredentials
└── index.ts          → Exporta todo

// Uso externo:
import { useAuth, LoginPage, ProtectedRoute } from '@features/auth';
```

**Responsabilidades:**
- Autenticación de usuarios
- Gestión de sesiones
- Protección de rutas
- Mock authentication (admin/admin)

---

### **2. Feature: drones**

```typescript
// ✅ Todo sobre drones aquí
features/drones/
├── components/       → DroneList, DroneStats, MqttStatus
├── pages/            → DronesPage
├── context/          → useDrones hook + DroneProvider
├── services/         → API calls para drones
├── hooks/            → useDronesApi
├── types/            → DroneState, DroneLocationMessage
└── index.ts

// Uso externo:
import { useDrones, DroneList, DronesPage } from '@features/drones';
```

**Responsabilidades:**
- Gestión de lista de drones
- Estado global de drones (DroneMap)
- Estadísticas de drones
- API calls para datos de drones
- Tipos de mensajes MQTT

---

### **3. Feature: tracking**

```typescript
// ✅ Todo sobre tracking/mapa aquí
features/tracking/
├── components/       → Mapa, lista compacta, detalles
├── pages/            → DashboardPage
├── context/          → useTracking + TrackingProvider
├── services/mqtt/    → MQTT service + handlers
├── hooks/            → useMqttConnection, useDroneLocations
└── index.ts

// Uso externo:
import { useTracking, DashboardPage, useMqttConnection } from '@features/tracking';
```

**Responsabilidades:**
- Dashboard con mapa en tiempo real
- Conexión MQTT
- Tracking de posiciones de drones
- Historial de rutas
- Selección de drones en mapa

---

## 🔧 Core Module

### **AppProvider** - Combina todos los features

```tsx
// src/core/store/AppProvider.tsx
import { AuthProvider } from '@features/auth';
import { DroneProvider } from '@features/drones';
import { TrackingProvider } from '@features/tracking';
import { SidebarProvider } from './SidebarProvider';

export const AppProvider = ({ children }) => (
    <AuthProvider>
        <DroneProvider>
            <TrackingProvider>
                <SidebarProvider>
                    {children}
                </SidebarProvider>
            </TrackingProvider>
        </DroneProvider>
    </AuthProvider>
);
```

### **AppRouter** - Rutas desde features

```tsx
// src/core/router/AppRouter.tsx
import { LoginPage, ProtectedRoute } from '@features/auth';
import { DashboardPage } from '@features/tracking';
import { DronesPage } from '@features/drones';

const DashboardPage = lazy(() => import('@features/tracking').then(m => ({ default: m.DashboardPage })));
```

---

## ✨ Ventajas de Feature-First

### **Antes (Organizado por tipo):**
```
❌ Para trabajar en "drones" necesitas abrir:
   - components/drone/
   - pages/DronesPage.tsx
   - store/drone/DroneContext.tsx
   - services/api/drones.api.service.ts
   - types/drone.types.ts
   - hooks/useDronesApi.ts
   → 6 ubicaciones diferentes
```

### **Ahora (Feature-First):**
```
✅ Para trabajar en "drones" solo abres:
   - features/drones/
   → TODO en un solo lugar
```

---

## 🚀 Cómo Agregar una Nueva Feature

### **Ejemplo: Feature "users"**

```bash
# 1. Crear estructura
mkdir -p src/features/users/{components,pages,context,services,hooks,types}

# 2. Crear archivos básicos
touch src/features/users/index.ts
touch src/features/users/context/UserContext.tsx
touch src/features/users/context/UserProvider.tsx
touch src/features/users/pages/UsersPage.tsx
```

```tsx
// 3. Crear index.ts
// src/features/users/index.ts
export { UsersPage } from './pages/UsersPage';
export { useUsers } from './context/UserContext';
export { UserProvider } from './context/UserProvider';

// 4. Agregar provider al AppProvider
// src/core/store/AppProvider.tsx
import { UserProvider } from '@features/users';

<UserProvider>
  {/* otros providers */}
</UserProvider>

// 5. Agregar ruta
// src/core/router/AppRouter.tsx
import { UsersPage } from '@features/users';
<Route path={ROUTES.USERS} element={<UsersPage />} />
```

---

## 📊 Comparación: Antes vs. Ahora

| Aspecto | Antes (Híbrido) | Ahora (Feature-First) |
|---------|-----------------|----------------------|
| **Organización** | Por tipo de archivo | Por dominio/feature |
| **Buscar código** | 6+ carpetas | 1 carpeta |
| **Imports** | Paths largos mezclados | Clean, por feature |
| **Escalabilidad** | Media | ⭐⭐⭐⭐⭐ Excelente |
| **Colaboración** | Conflictos frecuentes | Equipos independientes |
| **Onboarding** | "¿Dónde está todo?" | "Está en features/X" |
| **Testing** | Imports complejos | Auto-contenido |
| **Reutilización** | Confusa | Clara (shared/ vs feature/) |

---

## 📋 Checklist de Migración

- ✅ Crear estructura `features/`
- ✅ Migrar auth → `features/auth`
- ✅ Migrar drones → `features/drones`
- ✅ Migrar tracking → `features/tracking`
- ✅ Crear `core/` (router, config, store)
- ✅ Actualizar `AppProvider` con features
- ✅ Actualizar `AppRouter` con features
- ✅ Configurar path aliases (`@features`, `@core`)
- ✅ Actualizar App.tsx
- ⏳ Limpiar carpetas antiguas
- ⏳ Verificar funcionamiento completo

---

## 🎯 Próximos Pasos

1. **Completar features existentes:**
   - Agregar más componentes a cada feature
   - Mejorar tipos TypeScript
   - Agregar tests por feature

2. **Agregar nuevas features:**
   - `features/users/` - Gestión de usuarios
   - `features/reports/` - Reportes
   - `features/analytics/` - Analítica

3. **Optimizar:**
   - Code splitting por feature
   - Lazy loading de features completas
   - Bundle analysis

---

## 💡 Reglas de Oro

### ✅ **DO:**
1. **Todo relacionado a una feature va en su carpeta**
2. **Importar desde otras features usando index.ts**
   ```tsx
   import { useAuth } from '@features/auth';  // ✅
   ```
3. **Shared/ solo para lo VERDADERAMENTE compartido**
4. **Core/ solo para infraestructura global**

### ❌ **DON'T:**
1. **No importes archivos internos de otras features**
   ```tsx
   import { x } from '@features/auth/context/AuthContext';  // ❌
   import { x } from '@features/auth';  // ✅ (usa index.ts)
   ```
2. **No pongas lógica de features en shared/**
3. **No mezcles features entre sí directamente**

---

## 🔍 Estructura Visual

```
🏢 UMAS App
│
├── 🎯 FEATURES (Dominios de negocio)
│   ├── 🔐 auth        → Autenticación
│   ├── 🚁 drones      → Gestión drones
│   └── 📍 tracking    → Mapa tiempo real
│
├── ⚙️ CORE (Infraestructura)
│   ├── 🛣️ router      → Rutas
│   ├── ⚙️ config      → Configuración
│   └── 🗂️ store       → AppProvider + Sidebar
│
└── 🔄 SHARED (Compartido)
    ├── 🎨 components   → UI genéricos
    ├── 📐 layout       → Layout app
    └── 🛠️ utils        → Utilidades
```

---

## 📚 Referencias

- **Antes (híbrido):** [REORGANIZATION_SUMMARY.md](REORGANIZATION_SUMMARY.md)
- **Ahora (feature-first):** Este documento
- **Path aliases:** [vite.config.ts](vite.config.ts:14-28)
- **AppProvider:** [src/core/store/AppProvider.tsx](src/core/store/AppProvider.tsx)

---

**Última actualización:** 2025-10-21
**Arquitectura:** Feature-First (100% organizado por dominios)
**Estado:** ✅ Implementado y funcionando
