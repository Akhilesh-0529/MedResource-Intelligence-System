import axios from 'axios';

// Resolves to deployed URL in production, localhost in dev
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 5000, // 5s timeout — if server doesn't respond, we're offline
});

// Track connectivity state
let isOnline = true;
const listeners = new Set();

export const getConnectionStatus = () => isOnline;

export const onConnectionChange = (callback) => {
  listeners.add(callback);
  return () => listeners.delete(callback);
};

const setOnline = (status) => {
  if (isOnline !== status) {
    isOnline = status;
    listeners.forEach(cb => cb(status));
  }
};

// Intercept responses to detect connectivity changes
api.interceptors.response.use(
  (response) => {
    setOnline(true);
    return response;
  },
  (error) => {
    if (!error.response) {
      // Network error — server unreachable
      setOnline(false);
    }
    return Promise.reject(error);
  }
);

// Health check — ping server periodically
export const checkServerHealth = async () => {
  try {
    await axios.get(`${BASE_URL}/`, { timeout: 3000 });
    setOnline(true);
    return true;
  } catch {
    setOnline(false);
    return false;
  }
};

export const API_BASE_URL = BASE_URL;
export default api;
