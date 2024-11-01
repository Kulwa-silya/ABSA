// frontend/src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthState, AuthContextType } from "../types/auth";
import { authService } from "../services/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const user = await authService.getCurrentUser();
          setAuth({
            isAuthenticated: true,
            user,
            loading: false,
            error: null,
          });
        } else {
          setAuth((prev) => ({ ...prev, loading: false }));
        }
      } catch (error) {
        localStorage.removeItem("token");
        setAuth({
          isAuthenticated: false,
          user: null,
          loading: false,
          error: null,
        });
      }
    };

    initializeAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      setAuth((prev) => ({ ...prev, loading: true, error: null }));
      const { token, user } = await authService.login({ username, password });
      localStorage.setItem("token", token);
      setAuth({
        isAuthenticated: true,
        user,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      setAuth((prev) => ({
        ...prev,
        loading: false,
        error: error.message || "Failed to login",
      }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      localStorage.removeItem("token");
      setAuth({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
      });
    }
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
