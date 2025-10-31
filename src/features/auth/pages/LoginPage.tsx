import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm';
import { useAuthStore, selectIsAuthenticated } from '../store/useAuthStore';

export const LoginPage = () => {
    const navigate = useNavigate();
    const isAuthenticated = useAuthStore(selectIsAuthenticated);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    return <LoginForm />;
};