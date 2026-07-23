import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // Fetch current user details on initial load
    useEffect(() => {
        const fetchMe = async () => {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                // Fetch basic auth details
                const authRes = await api.get('/auth/me');
                const userData = authRes.data?.data?.user;
                
                if (userData) {
                    // Try fetching complete profile details
                    try {
                        const profileRes = await api.get('/users/profile');
                        const profileData = profileRes.data?.data?.profile;
                        setUser({ ...userData, ...profileData });
                    } catch {
                        setUser(userData);
                    }
                    setIsAuthenticated(true);
                }
            } catch (err) {
                console.error("Auth check failed:", err);
                localStorage.removeItem('accessToken');
                setIsAuthenticated(false);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchMe();
    }, []);

    const login = async (email, password) => {
        setLoading(true);
        try {
            const res = await api.post('/auth/login', { email, password });
            const { user: userData, accessToken, refreshToken } = res.data.data;
            
            localStorage.setItem('accessToken', accessToken);
            if (refreshToken) {
                localStorage.setItem('refreshToken', refreshToken);
            }
            
            // Get complete profile if possible
            try {
                const profileRes = await api.get('/users/profile');
                const profileData = profileRes.data?.data?.profile;
                setUser({ ...userData, ...profileData });
            } catch {
                setUser(userData);
            }
            
            setIsAuthenticated(true);
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || "Login failed. Please check your credentials.";
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    };

    const register = async (name, email, password) => {
        setLoading(true);
        try {
            const res = await api.post('/auth/register', { name, email, password });
            const { user: userData, accessToken, refreshToken } = res.data.data;
            
            localStorage.setItem('accessToken', accessToken);
            if (refreshToken) {
                localStorage.setItem('refreshToken', refreshToken);
            }

            // User registered. Now let's set initial user state
            setUser(userData);
            setIsAuthenticated(true);
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || "Registration failed. Try again.";
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setLoading(true);
        try {
            await api.post('/auth/logout');
        } catch (err) {
            console.error("Logout request failed:", err);
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setUser(null);
            setIsAuthenticated(false);
            setLoading(false);
        }
    };

    const updateProfile = async (profileData) => {
        try {
            const res = await api.patch('/users/profile', profileData);
            const updatedProfile = res.data?.data?.profile;
            setUser(prev => ({ ...prev, ...updatedProfile }));
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || "Profile update failed.";
            return { success: false, error: message };
        }
    };

    const updateAvatar = async (formData) => {
        try {
            const res = await api.patch('/users/avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            const updatedProfile = res.data?.data?.profile;
            setUser(prev => ({ ...prev, ...updatedProfile }));
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || "Avatar update failed.";
            return { success: false, error: message };
        }
    };

    const refreshProfile = async () => {
        try {
            const profileRes = await api.get('/users/profile');
            const profileData = profileRes.data?.data?.profile;
            setUser(prev => ({ ...prev, ...profileData }));
        } catch (err) {
            console.error("Failed to refresh profile data:", err);
        }
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            isAuthenticated, 
            loading, 
            login, 
            register, 
            logout, 
            updateProfile, 
            updateAvatar,
            refreshProfile
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
