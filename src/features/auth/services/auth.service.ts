import type { LoginCredentials, User } from '../types/auth.types';

const TOKEN_KEY = 'umas_auth_token';
const USER_KEY = 'umas_user_data';

class AuthService {
    async login(credentials: LoginCredentials): Promise<User> {
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 800));

        // Validación hardcoded (temporalmente)
        if (credentials.username === 'admin' && credentials.password === 'admin') {
            const user: User = {
                id: '1',
                username: 'admin',
                email: 'admin@fac.mil.co',
                roles: ['ADMIN'],
                token: this.generateMockToken(),
            };

            this.storeAuthData(user);
            return user;
        }

        throw new Error('Credenciales inválidas');
    }

    logout(): void {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    }

    getStoredUser(): User | null {
        try {
            const userData = localStorage.getItem(USER_KEY);
            return userData ? JSON.parse(userData) : null;
        } catch {
            return null;
        }
    }

    getToken(): string | null {
        return localStorage.getItem(TOKEN_KEY);
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }

    private storeAuthData(user: User): void {
        localStorage.setItem(TOKEN_KEY, user.token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    }

    private generateMockToken(): string {
        return `mock_token_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    }
}

export const authService = new AuthService();