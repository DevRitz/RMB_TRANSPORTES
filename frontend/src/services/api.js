import axios from 'axios';

// Configuração base da API
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Serviços para Caminhões
export const truckService = {
  getAll: () => api.get('/trucks'),
  getById: (id) => api.get(`/trucks/${id}`),
  create: (data) => api.post('/trucks', data),
  update: (id, data) => api.put(`/trucks/${id}`, data),
  delete: (id) => api.delete(`/trucks/${id}`),
};

// Serviços para Receitas
export const revenueService = {
  getAll: () => api.get('/revenues'),
  getByTruck: (truckId) => api.get(`/revenues/truck/${truckId}`),
  getById: (id) => api.get(`/revenues/${id}`),
  create: (data) => api.post('/revenues', data),
  update: (id, data) => api.put(`/revenues/${id}`, data),
  delete: (id) => api.delete(`/revenues/${id}`),
};

export const driverExpenseService = {
  getAll: () => api.get('/driver_expenses'),
  getByTruck: (truckId) => api.get(`/driver_expenses/truck/${truckId}`),
  getById: (id) => api.get(`/driver_expenses/${id}`),
  getByPeriod: (year, month) => api.get(`/driver_expenses/by-period?year=${year}&month=${month}`),
  create: (data) => api.post('/driver_expenses', data),
  update: (id, data) => api.put(`/driver_expenses/${id}`, data),
  delete: (id) => api.delete(`/driver_expenses/${id}`),
};

// Serviços para Despesas de Combustível
export const fuelExpenseService = {
  getAll: () => api.get('/fuel_expenses'),
  getByTruck: (truckId) => api.get(`/fuel_expenses/truck/${truckId}`),
  getById: (id) => api.get(`/fuel_expenses/${id}`),
  getByPeriod: (year, month) => api.get(`/fuel_expenses/by-period?year=${year}&month=${month}`),
  create: (data) => api.post('/fuel_expenses', data),
  update: (id, data) => api.put(`/fuel_expenses/${id}`, data),
  delete: (id) => api.delete(`/fuel_expenses/${id}`),
};

// Serviços para Despesas de Manutenção
export const maintenanceExpenseService = {
  getAll: () => api.get('/maintenance_expenses'),
  getByTruck: (truckId) => api.get(`/maintenance_expenses/truck/${truckId}`),
  getById: (id) => api.get(`/maintenance_expenses/${id}`),
  getByPeriod: (year, month) => api.get(`/maintenance_expenses/by-period?year=${year}&month=${month}`),
  create: (data) => api.post('/maintenance_expenses', data),
  update: (id, data) => api.put(`/maintenance_expenses/${id}`, data),
  delete: (id) => api.delete(`/maintenance_expenses/${id}`),
};

// Serviços para Relatórios
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
