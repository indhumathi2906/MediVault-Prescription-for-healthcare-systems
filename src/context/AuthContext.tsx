import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/index.js';
import { authAPI } from '../services/api.js';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: any) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('medivault_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('medivault_token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('medivault_token');
      if (storedToken) {
        try {
          const res = await authAPI.getMe();
          if (res.data.success && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('medivault_user', JSON.stringify(res.data.user));
          } else {
            logout();
          }
        } catch {
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await authAPI.login({ email, password });
    if (res.data.success) {
      const receivedToken = res.data.token;
      const receivedUser = res.data.user;
      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem('medivault_token', receivedToken);
      localStorage.setItem('medivault_user', JSON.stringify(receivedUser));
      return receivedUser;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const register = async (data: any): Promise<User> => {
    const res = await authAPI.register(data);
    if (res.data.success) {
      const receivedToken = res.data.token;
      const receivedUser = res.data.user;
      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem('medivault_token', receivedToken);
      localStorage.setItem('medivault_user', JSON.stringify(receivedUser));
      return receivedUser;
    }
    throw new Error(res.data.message || 'Registration failed');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('medivault_token');
    localStorage.removeItem('medivault_user');
  };

  const refreshUser = async () => {
    try {
      const res = await authAPI.getMe();
      if (res.data.success && res.data.user) {
        setUser(res.data.user);
        localStorage.setItem('medivault_user', JSON.stringify(res.data.user));
      }
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>
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
