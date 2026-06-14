import axios from 'axios';

// Set VITE_API_URL in a .env file at the frontend root, e.g.:
//   VITE_API_URL=http://localhost:8080/api
const baseURL = 'https://fintech-dashboard-backend-ibja.onrender.com/api';

const api = axios.create({ baseURL });

// Strip empty/undefined values so query strings stay clean
const cleanParams = (params = {}) =>
  Object.fromEntries(Object.entries(params).filter(([, value]) => value !== '' && value !== undefined && value !== null));

export const getTransactions = async (filters = {}) => {
  const { data } = await api.get('/transactions', { params: cleanParams(filters) });
  return data.data;
};

export const createTransaction = async (transaction) => {
  const { data } = await api.post('/transactions', transaction);
  return data.data;
};

export const updateTransaction = async (id, transaction) => {
  const { data } = await api.put(`/transactions/${id}`, transaction);
  return data.data;
};

export const deleteTransaction = async (id) => {
  const { data } = await api.delete(`/transactions/${id}`);
  return data.data;
};

export const getSummary = async (filters = {}) => {
  const { data } = await api.get('/transactions/summary', { params: cleanParams(filters) });
  return data.data;
};

export const getInsight = async (filters = {}) => {
  const { data } = await api.get('/transactions/insight', { params: cleanParams(filters) });
  return data.data;
};

export default api;
