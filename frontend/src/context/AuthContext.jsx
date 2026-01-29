import React, { createContext, useContext, useEffect, useState } from "react";
import { api, setAuthToken } from "../api/client";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setTokenState] = useState(() => localStorage.getItem("token"));

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    setUser(res.data.user);
    setTokenState(res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    localStorage.setItem("token", res.data.token);
  };

  const register = async (payload) => {
    await api.post("/auth/register", payload);
  };

  const logout = () => {
    setUser(null);
    setTokenState(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setAuthToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);