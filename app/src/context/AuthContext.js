import React, { createContext, useState, useEffect, useContext } from 'react';
import {
  api,
  getStoredToken,
  setStoredToken,
  getStoredUser,
  setStoredUser,
  getBaseApiUrl,
  setCustomApiUrl,
} from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiUrl, setApiUrl] = useState('');

  // Initial check on app mount
  useEffect(() => {
    async function loadAuth() {
      try {
        const currentUrl = await getBaseApiUrl();
        setApiUrl(currentUrl);

        const storedToken = await getStoredToken();
        const storedUser = await getStoredUser();

        if (storedToken && storedUser) {
          setToken(storedToken);
          setCurrentUser(storedUser);

          // Coba sync profile terbaru dari backend
          api.getProfile()
            .then(async (res) => {
              if (res.user) {
                setCurrentUser(res.user);
                await setStoredUser(res.user);
              }
            })
            .catch(() => {
              // Jika offline, pertahankan storedUser
            });
        }
      } catch (e) {
        console.error('Error loading auth session:', e);
      } finally {
        setIsLoading(false);
      }
    }

    loadAuth();
  }, []);

  const login = async (username, password) => {
    const res = await api.login(username, password);
    if (res.token && res.user) {
      await setStoredToken(res.token);
      await setStoredUser(res.user);
      setToken(res.token);
      setCurrentUser(res.user);
    }
    return res;
  };

  const register = async (username, password, name, role = 'user') => {
    const res = await api.register(username, password, name, role);
    if (res.token && res.user) {
      await setStoredToken(res.token);
      await setStoredUser(res.user);
      setToken(res.token);
      setCurrentUser(res.user);
    }
    return res;
  };

  const logout = async () => {
    await setStoredToken(null);
    await setStoredUser(null);
    setToken(null);
    setCurrentUser(null);
  };

  const updateApiUrl = async (newUrl) => {
    await setCustomApiUrl(newUrl);
    const updated = await getBaseApiUrl();
    setApiUrl(updated);
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        isLoading,
        isAdmin,
        apiUrl,
        login,
        register,
        logout,
        updateApiUrl,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

