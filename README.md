# 🚁 UMAS - Unmanned Aerial Monitoring System

Sistema de monitoreo y tracking en tiempo real de drones para la Fuerza Aeroespacial Colombiana.

## 🏗️ Arquitectura

Este proyecto utiliza **Feature-First Architecture** - todo el código está organizado por dominios de negocio en lugar de tipos de archivos.

```
src/
├── features/          🎯 Features organizadas por dominio
│   ├── auth/         🔐 Autenticación
│   ├── drones/       🚁 Gestión de drones
│   └── tracking/     📍 Tracking en mapa
├── core/             ⚙️ Infraestructura
│   ├── router/       🛣️ Rutas
│   ├── config/       ⚙️ Configuración
│   └── store/        🗂️ Estado global
└── shared/           🔄 Código compartido
    ├── components/   🎨 UI genéricos
    ├── layout/       📐 Layout
    └── utils/        🛠️ Utilidades
```

📚 **Documentación completa:** [FEATURE_FIRST_ARCHITECTURE.md](FEATURE_FIRST_ARCHITECTURE.md)

---

## 🚀 Stack Tecnológico

- **React 18.3** - UI Library
- **TypeScript 5.9** - Type Safety
- **Vite 7.1** - Build Tool & Dev Server
- **React Router v7** - Client-side Routing
- **Tailwind CSS 4** - Styling
- **MQTT 5** - Real-time Messaging
- **Leaflet 1.9** - Interactive Maps
- **Zustand 5** - State Management
- **Axios 1.12** - HTTP Client
- **Keycloak 26** - Authentication (planned)

---

## 📦 Instalación

```bash
# Clonar repositorio
git clone <repository-url>
cd umas-front-app

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Build para producción
npm run build

# Preview build
npm run preview

# Linting
npm run lint
```

---

## 🎯 Features

### ✅ **Implementadas**

#### 🔐 Auth
- Login con credenciales (mock: admin/admin)
- Protección de rutas
- Gestión de sesión
- LocalStorage persistence

#### 🚁 Drones
- Lista de drones
- Estadísticas en tiempo real
- Estado de conexión MQTT
- API REST para datos de drones

#### 📍 Tracking
- Dashboard con mapa interactivo
- Tracking en tiempo real vía MQTT
- Marcadores de drones en mapa
- Lista compacta de drones
- Panel de detalles de drone seleccionado
- Historial de posiciones

### 🚧 **En Desarrollo**
- Usuarios
- Reportes
- Analítica
- Configuración

---

## 🗺️ Configuración

### Variables de Entorno

Crear archivo `.env` en la raíz:

```env
# API
VITE_API_BASE_URL=http://localhost:8080

# Keycloak (futuro)
VITE_KEYCLOAK_URL=http://localhost:8080/auth
VITE_KEYCLOAK_REALM=umas
VITE_KEYCLOAK_CLIENT_ID=umas-client

# MQTT
MQTT_BROKER_URL=ws://localhost:9001
MQTT_USERNAME=admin
MQTT_PASSWORD=admin
MQTT_CLIENT_ID=umas-web-client
```

### Configuraciones Disponibles

- **API:** `src/core/config/api.config.ts`
- **MQTT:** `src/core/config/mqtt.config.ts`
- **Mapa:** `src/core/config/map.config.ts`
- **Keycloak:** `src/core/config/keycloak.config.ts`

---

## 📖 Guías de Uso

### Agregar una Nueva Feature

```bash
# 1. Crear estructura
mkdir -p src/features/mi-feature/{components,pages,context,services,types}

# 2. Crear archivos base
touch src/features/mi-feature/index.ts
touch src/features/mi-feature/context/MiFeatureContext.tsx
touch src/features/mi-feature/context/MiFeatureProvider.tsx

# 3. Exportar en index.ts
# src/features/mi-feature/index.ts
export { useMiFeature } from './context/MiFeatureContext';
export { MiFeatureProvider } from './context/MiFeatureProvider';

# 4. Agregar provider
# src/core/store/AppProvider.tsx
import { MiFeatureProvider } from '@features/mi-feature';
```

### Usar Features en Componentes

```tsx
// Importar desde features
import { useAuth, LoginPage } from '@features/auth';
import { useDrones, DroneList } from '@features/drones';
import { useTracking, DashboardPage } from '@features/tracking';

// Importar desde core
import { AppProvider } from '@core/store';
import { ROUTES } from '@core/router';

// Importar desde shared
import { Button, Input } from '@shared/components';
import { MainLayout } from '@shared/layout';
```

---

## 🧪 Testing

```bash
# Ejecutar tests (cuando estén configurados)
npm run test

# Coverage
npm run test:coverage
```

---

## 📁 Estructura de Carpetas

```
umas-front-app/
├── src/
│   ├── features/              # Features por dominio
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── context/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   └── index.ts
│   │   ├── drones/
│   │   └── tracking/
│   │
│   ├── core/                  # Infraestructura
│   │   ├── router/
│   │   ├── config/
│   │   └── store/
│   │
│   ├── shared/                # Código compartido
│   │   ├── components/
│   │   ├── layout/
│   │   ├── utils/
│   │   └── services/
│   │
│   ├── App.tsx
│   └── main.tsx
│
├── public/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

---

## 🔧 Scripts Disponibles

```bash
npm run dev          # Servidor desarrollo (puerto 3000)
npm run build        # Build producción
npm run preview      # Preview build
npm run lint         # ESLint
```

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📝 Documentación

- **[FEATURE_FIRST_ARCHITECTURE.md](FEATURE_FIRST_ARCHITECTURE.md)** - Guía completa de arquitectura
- **[REORGANIZATION_SUMMARY.md](REORGANIZATION_SUMMARY.md)** - Historial de reorganizaciones

---

## 📄 Licencia

Este proyecto es propiedad de la Fuerza Aeroespacial Colombiana.

---

## 👥 Autores

- **CETAD** - Desarrollo inicial
- **Fuerza Aeroespacial Colombiana** - Cliente

---

## 🙏 Agradecimientos

- Equipo de desarrollo CETAD
- Fuerza Aeroespacial Colombiana
- Comunidad Open Source

---

**Versión:** 1.0.0
**Última actualización:** 2025-10-21
