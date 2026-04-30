"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { api, ENDPOINTS } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("erp-user");
    const token = localStorage.getItem("erp-token");

    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.log("Invalid user data");
      }
    }

    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const res = await api.post(ENDPOINTS.login(), {
      username,
      password,
    });

    const { access, refresh } = res.data.tokens;
    const userData = res.data.user;

    localStorage.setItem("erp-token", access);
    localStorage.setItem("erp-refresh", refresh);
    localStorage.setItem("erp-user", JSON.stringify(userData));

    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("erp-token");
    localStorage.removeItem("erp-refresh");
    localStorage.removeItem("erp-user");

    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// SAFE HOOK
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    return { user: null, loading: true, login: () => {}, logout: () => {} };
  }

  return context;
};