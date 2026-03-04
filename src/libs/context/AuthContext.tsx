import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiClient from '../services/api.client';

interface User {
    email: string;
    fullName: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (fullName: string, email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Restore session from localStorage on mount
    useEffect(() => {
        const savedToken = localStorage.getItem('pv_token');
        const savedUser = localStorage.getItem('pv_user');
        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        const response: any = await apiClient.post('/auth/login', { email, password });
        if (!response.success) {
            throw new Error(response.error?.message || 'Login failed');
        }
        const { token: jwt, email: userEmail, fullName } = response.data;
        setToken(jwt);
        setUser({ email: userEmail, fullName });
        localStorage.setItem('pv_token', jwt);
        localStorage.setItem('pv_user', JSON.stringify({ email: userEmail, fullName }));
    };

    const register = async (fullName: string, email: string, password: string) => {
        const response: any = await apiClient.post('/auth/register', { fullName, email, password });
        if (!response.success) {
            throw new Error(response.error?.message || 'Registration failed');
        }
        const { token: jwt, email: userEmail, fullName: name } = response.data;
        setToken(jwt);
        setUser({ email: userEmail, fullName: name });
        localStorage.setItem('pv_token', jwt);
        localStorage.setItem('pv_user', JSON.stringify({ email: userEmail, fullName: name }));
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('pv_token');
        localStorage.removeItem('pv_user');
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            isAuthenticated: !!token,
            isLoading,
            login,
            register,
            logout,
        }}>
            {children}
        </AuthContext.Provider>
    );
};
