import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import api, { getErrorMessage } from "../services/api";
import { User, UserRole } from "../types";

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshMe = async () => {
    const token = localStorage.getItem("rfms_access");
    if (!token) {
      setUser(null);
      return;
    }
    const res = await api.get("/auth/me");
    setUser(res.data.data);
  };

  useEffect(() => {
    refreshMe()
      .catch(() => {
        localStorage.removeItem("rfms_access");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("rfms_access", res.data.data.accessToken);
    setUser(res.data.data.user);
    return res.data.data.user as User;
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await api.post("/auth/register", { name, email, password });
    localStorage.setItem("rfms_access", res.data.data.accessToken);
    setUser(res.data.data.user);
    return res.data.data.user as User;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      /* still clear local session */
    }
    localStorage.removeItem("rfms_access");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function homeForRole(role: UserRole) {
  if (role === "ADMIN") return "/admin/dashboard";
  if (role === "STAFF") return "/staff/dashboard";
  return "/products";
}

export { getErrorMessage };
