import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const eventTypesApi = {
  getAll: () => api.get('/event-types').then(res => res.data),
  getBySlug: (slug) => api.get(`/event-types/slug/${slug}`).then(res => res.data),
  create: (data) => api.post('/event-types', data).then(res => res.data),
  update: (id, data) => api.put(`/event-types/${id}`, data).then(res => res.data),
  delete: (id) => api.delete(`/event-types/${id}`).then(res => res.data),
};

export const availabilityApi = {
  get: () => api.get('/availability').then(res => res.data),
  set: (data) => api.post('/availability', data).then(res => res.data),
};

export const bookingsApi = {
  getAll: () => api.get('/bookings').then(res => res.data),
  getSlots: (date, eventTypeId) => api.get(`/bookings/slots?date=${date}&eventTypeId=${eventTypeId}`).then(res => res.data),
  create: (data) => api.post('/bookings', data).then(res => res.data),
  cancel: (id) => api.patch(`/bookings/${id}/cancel`).then(res => res.data),
};

export default api;
