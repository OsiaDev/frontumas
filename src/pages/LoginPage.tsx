import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '@components/auth/LoginForm';
import { useAuth } from '@store/auth/AuthContext';

export const LoginPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    return <LoginForm />;
};