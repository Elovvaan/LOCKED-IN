import { api } from './api';

export const fetchProfile = (id: number) =>
  api.get(`/users/${id}/profile`).then(r => r.data);

export const login = (email: string, password: string) =>
  api.post('/auth/login', { email, password }).then(r => r.data);

export const register = (username: string, email: string, password: string) =>
  api.post('/auth/register', { username, email, password }).then(r => r.data);
