"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import api from '@/lib/api';

interface User {
  email: string;
  name?: string;
  token: string;
  refreshToken: string;
  id: string;
}

interface AuthContextProps {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const noop = async () => {};

export const AuthContext = createContext<AuthContextProps>({
  user: null,
  login: noop,
  signup: noop,
  logout: async () => {},
  isLoading: true
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Function to refresh the access token
  const refreshAccessToken = async (refreshToken: string, email: string) => {
    if (refreshing) return null;
    
    try {
      setRefreshing(true);
      const response = await api.post('/api/refresh-token', {
        refreshToken,
        email
      });

      if (response.status === 200) {
        const { token: newToken, refreshToken: newRefreshToken } = response.data;
        return { token: newToken, refreshToken: newRefreshToken };
      }
      return null;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    } finally {
      setRefreshing(false);
    }
  };

  // Setup axios interceptor for token refresh
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't tried to refresh the token yet
        if (error.response?.status === 401 && !originalRequest._retry && user && !refreshing) {
          originalRequest._retry = true;

          const tokens = await refreshAccessToken(user.refreshToken, user.email);
          if (tokens) {
            // Update user with new tokens
            setUser(prev => prev ? { ...prev, ...tokens } : null);
            
            // Update the token in local storage
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
              const updatedUser = { ...JSON.parse(storedUser), ...tokens };
              localStorage.setItem('user', JSON.stringify(updatedUser));
            }

            // Retry the original request with new token
            originalRequest.headers.Authorization = `Bearer ${tokens.token}`;
            return api(originalRequest);
          }

          // If refresh failed, logout
          await logout();
        }

        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, [user, refreshing]);

  useEffect(() => {
    const initAuth = async () => {
      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          const userData = JSON.parse(stored);
          
          // Set initial user state with stored data
          setUser(userData);
          
          // Verify the token
          try {
            await api.get('/api/verify-token');
          } catch (error) {
            if (!refreshing) {
              // Only try to refresh if we're not already refreshing
              const tokens = await refreshAccessToken(userData.refreshToken, userData.email);
              if (tokens) {
                // Update user with new tokens
                const updatedUser = { ...userData, ...tokens };
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
              } else {
                // If refresh failed, clear storage and user
                localStorage.removeItem("user");
                setUser(null);
              }
            }
          }
        } catch (error) {
          localStorage.removeItem("user");
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/api/login', { email, password });
      const data = response.data;
      
      const newUser = { 
        email, 
        token: data.token,
        refreshToken: data.refreshToken,
        id: data.userId,
        name: data.name 
      };
      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      throw new Error(message);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      const response = await api.post('/api/signup', { name, email, password });
      if (response.status === 201) {
        await login(email, password);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Signup failed";
      throw new Error(message);
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint if you have one
      if (user?.refreshToken) {
        await api.post('/api/logout', { refreshToken: user.refreshToken });
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      localStorage.removeItem("user");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
