import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create AuthContext
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    // Set up axios defaults whenever token changes
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    }, [token]);

    // Check for token and set initial auth state
    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                // Make request to verify token
                const res = await axios.get(`${API_URL}/auth/me`);
                setCurrentUser(res.data);
                setIsAuthenticated(true);
                setError(null);
            } catch (err) {
                console.error('Token verification failed:', err);
                // Token is invalid, remove it
                localStorage.removeItem('token');
                setToken(null);
                setCurrentUser(null);
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };

        verifyToken();
    }, [token, API_URL]);

    // Register user
    const register = async (userData) => {
        try {
            setLoading(true);
            const res = await axios.post(`${API_URL}/auth/register`, userData);

            // Save token to local storage
            localStorage.setItem('token', res.data.token);
            setToken(res.data.token);
            setCurrentUser(res.data.user);
            setIsAuthenticated(true);
            setError(null);

            return res.data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Registration failed';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Login user
    const login = async (userData) => {
        try {
            setLoading(true);
            const res = await axios.post(`${API_URL}/auth/login`, userData);

            // Save token to local storage
            localStorage.setItem('token', res.data.token);
            setToken(res.data.token);
            setCurrentUser(res.data.user);
            setIsAuthenticated(true);
            setError(null);

            return res.data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Login failed';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Login with Google
    const googleLogin = async (idToken) => {
        try {
            setLoading(true);
            const res = await axios.post(`${API_URL}/auth/google`, { idToken });

            // Save token to local storage
            localStorage.setItem('token', res.data.token);
            setToken(res.data.token);
            setCurrentUser(res.data.user);
            setIsAuthenticated(true);
            setError(null);

            return res.data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Google login failed';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Logout user
    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setCurrentUser(null);
        setIsAuthenticated(false);
        setError(null);
    };

    // Update user profile
    const updateProfile = async (userData) => {
        try {
            setLoading(true);
            const res = await axios.put(`${API_URL}/auth/profile`, userData);
            setCurrentUser(res.data);
            setError(null);
            return res.data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Profile update failed';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Change password
    const changePassword = async (passwordData) => {
        try {
            setLoading(true);
            const res = await axios.put(`${API_URL}/auth/password`, passwordData);
            setError(null);
            return res.data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Password change failed';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                currentUser,
                token,
                loading,
                error,
                isAuthenticated,
                register,
                login,
                googleLogin,
                logout,
                updateProfile,
                changePassword
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};