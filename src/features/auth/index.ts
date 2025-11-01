// Auth Feature Exports

// Components
export { LoginForm } from './components/LoginForm';
export { ProtectedRoute } from './components/ProtectedRoute';

// Pages
export { LoginPage } from './pages/LoginPage';

// Context & Hooks (deprecated - use store instead)
export { useAuth } from './context/AuthContext';
export { AuthProvider } from './context/AuthProvider';

// Store (Zustand with localStorage)
export { useAuthStore, selectIsAuthenticated } from './store/useAuthStore';

// Services
export { authService } from './services/auth.service';

// Hooks
export { useUserRoles } from './hooks/useUserRoles';

// Types
export type { User, LoginCredentials, AuthContextType } from './types/auth.types';
