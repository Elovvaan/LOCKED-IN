import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://locked-in-production.up.railway.app';

export const api = axios.create({ baseURL: BASE_URL, timeout: 15000 });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function setToken(token: string) {
  await AsyncStorage.setItem('token', token);
}

export async function clearToken() {
  await AsyncStorage.removeItem('token');
}
