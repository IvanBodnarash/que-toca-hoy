import { createContext, useContext, useEffect, useState } from "react";
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  me,
} from "../services/authService";
import { setToken } from "../api/apiFetch";

export const AuthContext = createContext(null);
const LOCALSTORAGE_USER_KEY = "user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Trying to get user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem(LOCALSTORAGE_USER_KEY);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const register = async ({
    name,
    email,
    username,
    password,
    image,
    color,
  }) => {
    const data = await apiRegister(
      name,
      email,
      username,
      password,
      image,
      color
    );

    if (!data?.token || !data?.user) {
      throw new Error("Register failed");
    }
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem(LOCALSTORAGE_USER_KEY, JSON.stringify(data.user));
    localStorage.setItem("token", data.token);
    return data.user;
  };

  // Login (with test users)
  const login = async (identifier, password) => {
    const data = await apiLogin(identifier, password);

    if (!data?.token || !data?.user) {
      throw new Error("Invalid credentials!");
    }
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem(LOCALSTORAGE_USER_KEY, JSON.stringify(data.user));
    localStorage.setItem("token", data.token);
  };

  const checkAuth = async () => {
    try {
      const { user: profile } = await me();
      if (profile) {
        setUser(profile);
        localStorage.setItem(LOCALSTORAGE_USER_KEY, JSON.stringify(profile));
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  // Logout
  const logout = async () => {
    await apiLogout();
    setUser(null);
    setToken(null);
    localStorage.removeItem(LOCALSTORAGE_USER_KEY);
    localStorage.removeItem("token");
  };

  // User Data Update
  const updateUser = (patch) => {
    const next = { ...(user || {}), ...patch };
    setUser(next);
    localStorage.setItem(LOCALSTORAGE_USER_KEY, JSON.stringify(next));
  };

  const setLoggedUser = (user) => {
    setUser(user);
    localStorage.setItem(LOCALSTORAGE_USER_KEY, JSON.stringify(user));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        checkAuth,
        updateUser,
        setLoggedUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
