import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth as authApi, setToken } from "../services/api";

interface AuthContextType {
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem("token").then((token) => {
      if (token) {
        setToken(token);
        setIsLoggedIn(true);
      }
      setIsLoading(false);
    });
  }, []);

  const login = async (username: string, password: string) => {
    const { access_token } = await authApi.login(username, password);
    setToken(access_token);
    await AsyncStorage.setItem("token", access_token);
    setIsLoggedIn(true);
  };

  const register = async (username: string, password: string) => {
    const { access_token } = await authApi.register(username, password);
    setToken(access_token);
    await AsyncStorage.setItem("token", access_token);
    setIsLoggedIn(true);
  };

  const logout = async () => {
    setToken(null);
    await AsyncStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
