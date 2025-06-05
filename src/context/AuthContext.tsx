"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface User {
  email: string;
  name?: string;
  token: string;
  id: string;
}

interface AuthContextProps {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const noop = async () => {};

export const AuthContext = createContext<AuthContextProps>({
  user: null,
  login: noop,
  signup: noop,
  logout: () => {},
  isLoading: true
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          const userData = JSON.parse(stored);
          // Verify the token is still valid
          const res = await fetch(`${baseUrl}/api/verify-token`, {
            headers: { Authorization: `Bearer ${userData.token}` }
          });
          if (res.ok) {
            setUser(userData);
          } else {
            localStorage.removeItem("user");
          }
        } catch {
          localStorage.removeItem("user");
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${baseUrl}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Login failed");
      }

      const data = await res.json();
      const newUser = { 
        email, 
        token: data.token,
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
      const res = await fetch(`${baseUrl}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Signup failed");
      }

      await login(email, password);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Signup failed";
      throw new Error(message);
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
