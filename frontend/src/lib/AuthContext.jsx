import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const TOKEN_KEY = "kbs_auth_token";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || "");
  const [loading, setLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);

  const auth = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

  const fetchMe = useCallback(async () => {
    if (!token) { setUser(null); setLoading(false); return; }
    try {
      const { data } = await axios.get(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
      setUser(data);
    } catch {
      setUser(null); setToken(""); localStorage.removeItem(TOKEN_KEY);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchMe(); }, [fetchMe]);

  const persistToken = (t) => {
    setToken(t);
    if (t) localStorage.setItem(TOKEN_KEY, t);
    else localStorage.removeItem(TOKEN_KEY);
  };

  const register = async (payload) => {
    const { data } = await axios.post(`${API}/auth/register`, payload);
    persistToken(data.token); setUser(data.user);
    return data;
  };

  const login = async (email, password) => {
    const { data } = await axios.post(`${API}/auth/login`, { email, password });
    persistToken(data.token); setUser(data.user);
    return data;
  };

  const loginWithGoogleSession = async (session_id) => {
    const { data } = await axios.post(`${API}/auth/google-session`, { session_id });
    persistToken(data.token); setUser(data.user);
    return data;
  };

  const logout = () => { persistToken(""); setUser(null); };

  const refreshMe = fetchMe;

  return (
    <AuthContext.Provider value={{
      user, token, loading, authOpen, setAuthOpen,
      register, login, loginWithGoogleSession, logout, refreshMe, auth,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
