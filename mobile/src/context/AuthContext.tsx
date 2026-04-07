import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setToken, clearToken } from '../lib/api';
import { login as apiLogin, register as apiRegister } from '../lib/users';

interface AuthState {
  token: string | null;
  userId: number | null;
  username: string | null;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    token: null,
    userId: null,
    username: null,
    isLoading: true,
  });

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const userId = await AsyncStorage.getItem('userId');
        const username = await AsyncStorage.getItem('username');
        setState({
          token,
          userId: userId ? parseInt(userId) : null,
          username,
          isLoading: false,
        });
      } catch {
        setState(s => ({ ...s, isLoading: false }));
      }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiLogin(email, password);
    await setToken(data.token);
    await AsyncStorage.setItem('userId', String(data.user.id));
    await AsyncStorage.setItem('username', data.user.username);
    setState({ token: data.token, userId: data.user.id, username: data.user.username, isLoading: false });
  }, []);

  const register = useCallback(async (username: string, email: string, password: string) => {
    const data = await apiRegister(username, email, password);
    await setToken(data.token);
    await AsyncStorage.setItem('userId', String(data.user.id));
    await AsyncStorage.setItem('username', data.user.username);
    setState({ token: data.token, userId: data.user.id, username: data.user.username, isLoading: false });
  }, []);

  const logout = useCallback(async () => {
    await clearToken();
    await AsyncStorage.removeItem('userId');
    await AsyncStorage.removeItem('username');
    setState({ token: null, userId: null, username: null, isLoading: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
