import { api } from './api';

export const fetchFeed = (since?: string) =>
  api.get('/skills/feed', { params: since ? { since } : {} }).then(r => r.data);

export const fetchSkill = (id: number) =>
  api.get(`/skills/${id}`).then(r => r.data);

export const fetchResponses = (id: number) =>
  api.get(`/skills/${id}/responses`).then(r => r.data);

export const fetchBattle = (id: number) =>
  api.get(`/skills/${id}/battle`).then(r => r.data);

export const createSkill = (data: { videoUrl: string; title: string; caption?: string; endsAt?: string }) =>
  api.post('/skills', data).then(r => r.data);

export const respondToSkill = (id: number, data: { videoUrl: string; caption?: string }) =>
  api.post(`/skills/${id}/respond`, data).then(r => r.data);

export const voteOnResponse = (skillId: number, responseId: number) =>
  api.post(`/skills/${skillId}/responses/${responseId}/vote`).then(r => r.data);

export const createRematch = (id: number, endsAt?: string) =>
  api.post(`/skills/${id}/rematch`, endsAt ? { endsAt } : {}).then(r => r.data);
