// src/services/api.js
import axios from 'axios';

// Usa variável de ambiente ou "/api" por padrão (Nginx faz proxy)
const API_BASE = import.meta.env.VITE_API_URL || '/api';

// Instância Axios
const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor para adicionar o token JWT em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido ou expirado
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ------- Serviços para Caminhões -------
export const truckService = {
  getAll: () => api.get('/trucks'),
  getById: (id) => api.get(`/trucks/${id}`),
  create: (data) => api.post('/trucks', data),
  update: (id, data) => api.put(`/trucks/${id}`, data),
  delete: (id) => api.delete(`/trucks/${id}`),
};

// ------- Serviços para Receitas -------
export const revenueService = {
  getAll: () => api.get('/revenues'),
  getByTruck: (truckId) => api.get(`/revenues/truck/${truckId}`),
  getById: (id) => api.get(`/revenues/${id}`),
  create: (data) => api.post('/revenues', data),
  update: (id, data) => api.put(`/revenues/${id}`, data),
  delete: (id) => api.delete(`/revenues/${id}`),
};

// ------- Serviços para Despesas de Motorista -------
export const driverExpenseService = {
  getAll: () => api.get('/driver_expenses'),
  getByTruck: (truckId) => api.get(`/driver_expenses/truck/${truckId}`),
  getById: (id) => api.get(`/driver_expenses/${id}`),
  getByPeriod: (year, month) =>
    api.get(`/driver_expenses/by-period?year=${year}&month=${month}`),
  create: (data) => api.post('/driver_expenses', data),
  update: (id, data) => api.put(`/driver_expenses/${id}`, data),
  delete: (id) => api.delete(`/driver_expenses/${id}`),
};

// ------- Serviços para Despesas de Combustível -------
export const fuelExpenseService = {
  getAll: () => api.get('/fuel_expenses'),
  getByTruck: (truckId) => api.get(`/fuel_expenses/truck/${truckId}`),
  getById: (id) => api.get(`/fuel_expenses/${id}`),
  getByPeriod: (year, month) =>
    api.get(`/fuel_expenses/by-period?year=${year}&month=${month}`),
  create: (data) => api.post('/fuel_expenses', data),
  update: (id, data) => api.put(`/fuel_expenses/${id}`, data),
  delete: (id) => api.delete(`/fuel_expenses/${id}`),
};

// ------- Serviços para Despesas de Manutenção -------
export const maintenanceExpenseService = {
  getAll: () => api.get('/maintenance_expenses'),
  getByTruck: (truckId) => api.get(`/maintenance_expenses/truck/${truckId}`),
  getById: (id) => api.get(`/maintenance_expenses/${id}`),
  getByPeriod: (year, month) =>
    api.get(`/maintenance_expenses/by-period?year=${year}&month=${month}`),
  create: (data) => api.post('/maintenance_expenses', data),
  update: (id, data) => api.put(`/maintenance_expenses/${id}`, data),
  delete: (id) => api.delete(`/maintenance_expenses/${id}`),
};

// ------- Serviços para Outras Despesas -------
export const otherExpenseService = {
  getAll: () => api.get('/other_expenses'),
  getById: (id) => api.get(`/other_expenses/${id}`),
  getByPeriod: (year, month) =>
    api.get(`/other_expenses/period?year=${year}&month=${month}`),
  getTotalsByPeriod: (year, month) =>
    api.get(`/other_expenses/totals?year=${year}&month=${month}`),
  create: (data) => api.post('/other_expenses', data),
  update: (id, data) => api.put(`/other_expenses/${id}`, data),
  delete: (id) => api.delete(`/other_expenses/${id}`),
};

// ------- Serviços para Relatórios -------
export const reportService = {
  getTruckBalance: (truckId) => api.get(`/reports/balance/${truckId}`),
  getMonthlyTruckSummary: (truckId, year, month) =>
    api.get(`/reports/monthly/${truckId}?year=${year}&month=${month}`),
  getGeneralMonthlySummary: (year, month) =>
    api.get(`/reports/monthly?year=${year}&month=${month}`),
  getDriverExpensesTotal: (year, month) => {
    let url = '/reports/driver_expenses';
    const params = [];
    if (year) params.push(`year=${year}`);
    if (month) params.push(`month=${month}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    return api.get(url);
  },
};

export default api;
