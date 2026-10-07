import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);

        const handleAuthError = () => {
            logout();
        };

        window.addEventListener('auth-error', handleAuthError);
        return () => window.removeEventListener('auth-error', handleAuthError);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            if (response.data.success) {
                const { token, ...userData } = response.data.data;
                setToken(token);
                setUser(userData);
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(userData));
                return true;
            }
            return false;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Login failed');
        }
    };

    const register = async (userData) => {
        try {
            const response = await api.post('/auth/register', userData);
            if (response.data.success) {
                const { token, ...newUserData } = response.data.data;
                setToken(token);
                setUser(newUserData);
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(newUserData));
                return true;
            }
            return false;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Registration failed');
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    const isAdmin = () => {
        return user?.role === 'ADMIN';
    };

    const value = {
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAdmin,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
