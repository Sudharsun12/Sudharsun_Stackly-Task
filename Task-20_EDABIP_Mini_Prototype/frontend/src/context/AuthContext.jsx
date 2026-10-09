import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("edabip_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("edabip_token") || "");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.get("/api/me")
        .then((res) => {
          setUser(res.data);
          localStorage.setItem("edabip_user", JSON.stringify(res.data));
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post("/api/login", { email, password });
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem("edabip_token", newToken);
    localStorage.setItem("edabip_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return newUser;
  };

  const logout = async () => {
    try {
      if (token) {
        await api.get("/api/logout");
      }
    } catch (e) {
      // ignore
    } finally {
      localStorage.removeItem("edabip_token");
      localStorage.removeItem("edabip_user");
      setToken("");
      setUser(null);
    }
  };

  const updateUser = (data) => {
    setUser((prev) => {
      const updated = { ...prev, ...data };
      localStorage.setItem("edabip_user", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
