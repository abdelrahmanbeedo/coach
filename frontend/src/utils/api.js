import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/** Get a user-friendly error message from an API error (handles no response / network errors) */
export function getApiErrorMessage(err, fallback = 'Something went wrong') {
  if (!err) return fallback;
  if (!err.response) {
    return `Cannot reach server. Is the backend running at ${API_URL}?`;
  }
  const msg = err.response.data?.message || err.response.statusText || fallback;
  const status = err.response.status;
  if (status === 401) return `Login required: ${msg}. Try logging in again.`;
  if (status === 403) return msg;
  if (status === 404) return msg || 'Not found. Restart the backend server if you added new routes.';
  return msg;
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (userData) => api.post('/users/register', userData),
  login: (credentials) => api.post('/users/login', credentials),
  getCurrentUser: () => api.get('/users/me'),
};

// Workout API (assigned workouts)
export const workoutAPI = {
  assign: (templateId, clientId, date) => api.post('/workouts', { templateId, clientId, date }),
  getByClient: (clientId) => api.get(`/workouts/client/${clientId}`),
  getById: (id) => api.get(`/workouts/${id}`),
  update: (id, data) => api.put(`/workouts/${id}`, data),
  delete: (id) => api.delete(`/workouts/${id}`),
};

// Exercise Library API
export const exercisesAPI = {
  list: (search) => api.get('/exercises', { params: search ? { q: search } : {} }),
  create: (data) => api.post('/exercises', data),
  update: (id, data) => api.put(`/exercises/${id}`, data),
  delete: (id) => api.delete(`/exercises/${id}`),
};

// Workout Templates API
export const templatesAPI = {
  list: () => api.get('/templates'),
  get: (id) => api.get(`/templates/${id}`),
  create: (data) => api.post('/templates', data),
  update: (id, data) => api.put(`/templates/${id}`, data),
  delete: (id) => api.delete(`/templates/${id}`),
};

// Macro API
export const macroAPI = {
  createOrUpdate: (data) => api.post('/macros', data),
  getByDate: (clientId, date) => api.get(`/macros/${clientId}/${date}`),
  deleteMeal: (macroId, mealIndex) => api.delete(`/macros/${macroId}/meal/${mealIndex}`),
  updateMeal: (macroId, mealIndex, mealData) => {
    return api.put(`/macros/${macroId}/meal/${mealIndex}`, mealData);
  },
};

// Client API
export const clientAPI = {
  getMyClients: () => api.get('/clients/my-clients'),
  addClient: (email) => api.post('/clients/add-client', { email }),
  removeClient: (clientId) => api.delete(`/clients/remove-client/${clientId}`),
  getMyCoach: () => api.get('/clients/my-coach'),
};

export default api;

