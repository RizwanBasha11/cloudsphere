import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('cloudsphere_token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('cloudsphere_token');
      if (storedToken) {
        try {
          const res = await api.auth.getMe();
          if (res.success) {
            setUser(res.user);
            setTenant(res.tenant);
          } else {
            logout();
          }
        } catch (err) {
          console.warn('[AuthContext] Session expired or invalid, clearing local session.');
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await api.auth.login({ email, password });
      if (res.success && res.token) {
        localStorage.setItem('cloudsphere_token', res.token);
        setToken(res.token);
        setUser(res.user);
        setTenant(res.tenant);
        return { success: true };
      }
      throw new Error(res.message || 'Login failed');
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  // 1-Click Demo Login for quick evaluator access
  const loginDemo = async (type = 'admin') => {
    if (type === 'admin') {
      return login('meesala dileep kumar', 'dileep65');
    } else {
      return login('alex@techcorp.com', 'TechCorp@2026');
    }
  };

  const register = async (formData) => {
    setError(null);
    try {
      const res = await api.auth.register(formData);
      if (res.success && res.token) {
        localStorage.setItem('cloudsphere_token', res.token);
        setToken(res.token);
        setUser(res.user);
        setTenant(res.tenant);
        return { success: true };
      }
      throw new Error(res.message || 'Registration failed');
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('cloudsphere_token');
    setToken(null);
    setUser(null);
    setTenant(null);
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await api.auth.updateProfile(profileData);
      if (res.success) {
        setUser(prev => ({ ...prev, ...res.user }));
        return { success: true };
      }
      throw new Error(res.message);
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tenant,
        token,
        loading,
        error,
        login,
        loginDemo,
        register,
        logout,
        updateProfile,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
