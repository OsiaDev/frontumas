export interface LoginCredentials {
    username: string;
    password: string;
}

export interface User {
    id: string;
    username: string;
    email?: string;
    roles: string[];
    token: string;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

export interface AuthContextType extends AuthState {
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => Promise<void>;
    clearError: () => void;
}