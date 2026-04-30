"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { api, ENDPOINTS } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("re_user");
    const token = localStorage.getItem("erp-token");

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
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

export const useAuth = () => useContext(AuthContext);