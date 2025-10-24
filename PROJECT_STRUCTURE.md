# 📂 Estructura del Proyecto UMAS

**Fecha:** 2025-10-21
**Arquitectura:** Feature-First
**Estado:** ✅ Reorganización Completa

---

## 🌳 Árbol de Directorios

```
umas-front-app/
│
├── 📁 src/
│   │
│   ├── 🎯 features/                    Feature-First Architecture
│   │   │
│   │   ├── 🔐 auth/                   Feature: Autenticación
│   │   │   ├── components/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   └── ProtectedRoute.tsx
│   │   │   ├── pages/
│   │   │   │   └── LoginPage.tsx
│   │   │   ├── context/
│   │   │   │   ├── AuthContext.tsx      # useAuth hook
│   │   │   │   └── AuthProvider.tsx
│   │   │   ├── services/
│   │   │   │   └── auth.service.ts
│   │   │   ├── types/
│   │   │   │   └── auth.types.ts
│   │   │   └── index.ts                 # Exports
│   │   │
│   │   ├── 🚁 drones/                  Feature: Gestión de Drones
│   │   │   ├── components/
│   │   │   │   ├── DroneList.tsx
│   │   │   │   ├── DroneStats.tsx
│   │   │   │   ├── MqttStatus.tsx
│   │   │   │   └── index.ts
│   │   │   ├── pages/
│   │   │   │   └── DronesPage.tsx
│   │   │   ├── context/
│   │   │   │   ├── DroneContext.tsx     # useDrones hook
│   │   │   │   └── DroneProvider.tsx
│   │   │   ├── services/
│   │   │   │   └── drones.api.service.ts
│   │   │   ├── hooks/
│   │   │   │   └── useDronesApi.ts
│   │   │   ├── types/
│   │   │   │   └── drone.types.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── 📍 tracking/                Feature: Tracking en Mapa
│   │   │   ├── components/
│   │   │   │   ├── DroneTrackingMap.tsx
│   │   │   │   ├── DroneCompactList.tsx
│   │   │   │   ├── DroneDetailsPanel.tsx
│   │   │   │   ├── DroneMarkerIcon.tsx
│   │   │   │   ├── MapCoordinatesDisplay.tsx
│   │   │   │   └── index.ts
│   │   │   ├── pages/
│   │   │   │   └── DashboardPage.tsx
│   │   │   ├── context/
│   │   │   │   ├── TrackingContext.tsx  # useTracking hook
│   │   │   │   └── TrackingProvider.tsx
│   │   │   ├── services/
│   │   │   │   └── mqtt/
│   │   │   │       ├── mqtt.service.ts
│   │   │   │       └── mqtt.handlers.ts
│   │   │   ├── hooks/
│   │   │   │   ├── useMqttConnection.ts
│   │   │   │   └── useDroneLocations.ts
│   │   │   └── index.ts
│   │   │
│   │   └── index.ts                     # Re-export all features
│   │
│   ├── ⚙️ core/                         Infraestructura Central
│   │   │
│   │   ├── 🛣️ router/
│   │   │   ├── routes.ts                # ROUTES constants
│   │   │   ├── AppRouter.tsx            # Route config
│   │   │   └── index.ts
│   │   │
│   │   ├── ⚙️ config/
│   │   │   ├── api.config.ts
│   │   │   ├── mqtt.config.ts
│   │   │   ├── map.config.ts
│   │   │   ├── keycloak.config.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── 🗂️ store/
│   │   │   ├── AppProvider.tsx          # 🆕 Unified provider
│   │   │   ├── SidebarContext.tsx       # useSidebar hook
│   │   │   ├── SidebarProvider.tsx
│   │   │   └── index.ts
│   │   │
│   │   └── index.ts
│   │
│   ├── 🔄 shared/                       Código Compartido
│   │   │
│   │   ├── 🎨 components/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── PasswordInput.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   └── index.tsx
│   │   │
│   │   ├── 📐 layout/
│   │   │   ├── AppBar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── MainLayout.tsx
│   │   │   └── index.tsx
│   │   │
│   │   ├── 🛠️ utils/
│   │   │   ├── constants.ts
│   │   │   └── handleError.ts
│   │   │
│   │   ├── 🔌 services/
│   │   │   └── api.service.ts           # Generic HTTP client
│   │   │
│   │   ├── 📝 types/
│   │   │   ├── api.types.ts
│   │   │   └── index.ts
│   │   │
│   │   └── index.tsx
│   │
│   ├── 🎨 styles/
│   │   ├── index.css
│   │   ├── tailwind.css
│   │   └── leaflet-custom.css
│   │
│   ├── 📦 assets/
│   │   └── react.svg
│   │
│   ├── App.tsx                          # Root component (12 lines)
│   ├── App.css
│   └── main.tsx                         # Entry point
│
├── 📁 public/
│   └── fac-logo.png
│
├── 📄 Configuration Files
│   ├── package.json                     # Dependencies & scripts
│   ├── package-lock.json
│   ├── vite.config.ts                   # Vite config + aliases
│   ├── tsconfig.json                    # TypeScript base
│   ├── tsconfig.app.json                # App TypeScript config
│   ├── tsconfig.node.json               # Node TypeScript config
│   ├── eslint.config.js                 # ESLint config
│   ├── .env                             # Environment variables
│   └── .gitignore
│
├── 📚 Documentation
│   ├── README.md                        # Main documentation
│   ├── FEATURE_FIRST_ARCHITECTURE.md    # Architecture guide
│   ├── REORGANIZATION_SUMMARY.md        # Migration history
│   └── PROJECT_STRUCTURE.md             # This file
│
└── index.html                           # HTML entry point
```

---

## 📊 Estadísticas del Proyecto

### Por Categoría
```
🎯 Features: 3
   ├── auth         (7 archivos)
   ├── drones       (10 archivos)
   └── tracking     (12 archivos)

⚙️ Core: 3 módulos
   ├── router       (3 archivos)
   ├── config       (5 archivos)
   └── store        (4 archivos)

🔄 Shared: 4 módulos
   ├── components   (5 archivos)
   ├── layout       (4 archivos)
   ├── utils        (2 archivos)
   └── services     (1 archivo)
```

### Por Tipo de Archivo
```
📝 TypeScript:     ~45 archivos (.ts, .tsx)
🎨 Styles:         3 archivos (.css)
⚙️ Config:         6 archivos
📚 Docs:           4 archivos (.md)
```

---

## 🔗 Path Aliases

```typescript
// Features
@features/auth           → src/features/auth
@features/drones         → src/features/drones
@features/tracking       → src/features/tracking

// Core
@core                    → src/core
@core/store              → src/core/store
@core/router             → src/core/router
@core/config             → src/core/config

// Shared
@shared                  → src/shared
@shared/components       → src/shared/components
@shared/layout           → src/shared/layout
@shared/utils            → src/shared/utils
```

---

## 📝 Index Files (Barrel Exports)

Cada módulo tiene un `index.ts` que exporta su API pública:

```typescript
// ✅ DO: Import desde index
import { useAuth, LoginPage } from '@features/auth';
import { useDrones } from '@features/drones';
import { AppRouter, ROUTES } from '@core/router';

// ❌ DON'T: Import directo de archivos internos
import { useAuth } from '@features/auth/context/AuthContext';
```

---

## 🎯 Features Implementadas

### ✅ **auth/** (Autenticación)
- Login con credenciales mock
- Protección de rutas
- Gestión de sesión
- Persistencia en localStorage

### ✅ **drones/** (Gestión de Drones)
- Lista de drones
- Estadísticas en tiempo real
- Estado de conexión MQTT
- API REST integration

### ✅ **tracking/** (Tracking en Mapa)
- Dashboard con mapa Leaflet
- Tracking MQTT en tiempo real
- Marcadores de drones
- Historial de posiciones
- Panel de detalles

---

## 🚧 Features Planificadas

### **users/** (Gestión de Usuarios)
```
features/users/
├── components/
├── pages/
├── context/
├── services/
└── types/
```

### **reports/** (Reportes)
```
features/reports/
├── components/
├── pages/
├── services/
└── types/
```

### **analytics/** (Analítica)
```
features/analytics/
├── components/
├── pages/
├── services/
└── types/
```

---

## 📦 Dependencias Principales

```json
{
  "react": "^18.3.1",
  "react-router-dom": "^7.9.4",
  "typescript": "^5.9.3",
  "vite": "^7.1.7",
  "tailwindcss": "^4.1.14",
  "mqtt": "^5.14.1",
  "leaflet": "^1.9.4",
  "react-leaflet": "^4.2.1",
  "zustand": "^5.0.8",
  "axios": "^1.12.2",
  "keycloak-js": "^26.2.1"
}
```

---

## 🔐 Convenciones de Nomenclatura

### Archivos
- **Components:** PascalCase (`DroneList.tsx`)
- **Hooks:** camelCase con prefijo use (`useDrones.ts`)
- **Types:** camelCase con sufijo .types (`drone.types.ts`)
- **Services:** camelCase con sufijo .service (`auth.service.ts`)
- **Config:** camelCase con sufijo .config (`api.config.ts`)

### Carpetas
- **Features:** lowercase (`auth/`, `drones/`)
- **Módulos:** lowercase (`components/`, `services/`)

### Exports
- **Exports con nombre:** `export const ComponentName`
- **Export default:** Solo en páginas y App.tsx
- **Barrel exports:** Usar `index.ts` en cada módulo

---

## 🎨 Principios de Diseño

### 1. **Feature Isolation**
Cada feature es auto-contenida y puede funcionar independientemente.

### 2. **Clear Boundaries**
- `features/` → Lógica de negocio específica
- `core/` → Infraestructura global
- `shared/` → Código reutilizable

### 3. **Single Responsibility**
Cada módulo tiene una responsabilidad clara y única.

### 4. **Dependency Direction**
```
features → core → shared
   ↓         ↓
   └─────────┘
   (features pueden usar core y shared)
   (core puede usar shared)
   (shared no depende de nadie)
```

---

## 🛠️ Herramientas de Desarrollo

### Build & Dev
- **Vite 7.1** - Build tool ultrarrápido
- **TypeScript 5.9** - Type checking
- **ESLint** - Code quality

### Styling
- **Tailwind CSS 4** - Utility-first CSS
- **@tailwindcss/vite** - Vite integration

### Testing (Planeado)
- **Vitest** - Unit testing
- **React Testing Library** - Component testing
- **Playwright** - E2E testing

---

## 📈 Próximos Pasos

1. ✅ **Reorganización Feature-First** - Completada
2. 🚧 **Implementar features planificadas** - En progreso
3. 📋 **Agregar testing suite** - Planeado
4. 🔐 **Integrar Keycloak** - Planeado
5. 📊 **Code splitting por feature** - Planeado
6. 🚀 **CI/CD pipeline** - Planeado

---

**Última actualización:** 2025-10-21
**Mantenido por:** CETAD
**Cliente:** Fuerza Aeroespacial Colombiana
