import { api } from './api';

export const fetchEvent = (id: number) =>
  api.get(`/events/${id}`).then(r => r.data);

export const fetchEvents = () =>
  api.get('/events').then(r => r.data);
