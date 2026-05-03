"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { api, ENDPOINTS } from "./api";

/* =====================================================
   AUTH CONTEXT
===================================================== */

type AuthContextType = {
  user: any;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

/* =====================================================
   PROVIDER
===================================================== */

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // load user from storage on first load
  useEffect(() => {
    const storedUser = localStorage.getItem("erp-user");
    const token = localStorage.getItem("erp-token");

    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        console.log("Invalid stored user");
      }
    }

    setLoading(false);
  }, []);

  /* ================= LOGIN ================= */

  const login = async (username: string, password: string) => {
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

  /* ================= LOGOUT ================= */

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

/* =====================================================
   HOOK
===================================================== */

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    return {
      user: null,
      loading: true,
      login: async () => {},
      logout: () => {},
    };
  }

  return context;
};

/* =====================================================
   OPTIONAL HELPERS (utils part merged)
===================================================== */

export const getUser = () => {
  if (typeof window === "undefined") return null;

  try {
    return JSON.parse(localStorage.getItem("erp-user") || "null");
  } catch {
    return null;
  }
};

export const isLoggedIn = () => {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("erp-token");
};

export const logoutDirect = () => {
  localStorage.removeItem("erp-token");
  localStorage.removeItem("erp-refresh");
  localStorage.removeItem("erp-user");
  window.location.href = "/login";
};