// frontend/src/context/AuthContext.jsx

import React, { createContext, useContext, useState } from "react";
import { apiFetch } from "../api/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = async (email, password) => {
    const data = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    // If your backend returns user info, store it
    // Example: { status: "ok", token, user: {...} }
    if (data?.user) setUser(data.user);

    return data;
  };

  const register = async (payload) => {
    // payload: { name, email, password, tenantId }
    const data = await apiFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (data?.user) setUser(data.user);
    return data;
  };

  const logout = async () => {
    // if backend has /logout
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      // ignore if route doesn't exist
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}