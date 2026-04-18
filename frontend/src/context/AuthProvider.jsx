import { useState } from 'react';
import api from '../utils/api';
import { AuthContext } from './AuthContext';

const USERS_STORAGE_KEY = 'smartalloc_users';
const SESSION_KEY = 'user';

// Get locally registered users
const getLocalUsers = () => {
  try {
    return JSON.parse(localStorage.getItem(USERS_STORAGE_KEY)) || [];
  } catch { return []; }
};

const saveLocalUsers = (users) => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem(SESSION_KEY);
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (email, password) => {
    // Try online login first
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const userData = response.data;
      setUser(userData);
      localStorage.setItem(SESSION_KEY, JSON.stringify(userData));

      // Also cache this user locally for future offline use
      const localUsers = getLocalUsers();
      const idx = localUsers.findIndex(u => u.email === email);
      const cached = { name: userData.name, email: userData.email, password, role: userData.role };
      if (idx > -1) localUsers[idx] = cached;
      else localUsers.push(cached);
      saveLocalUsers(localUsers);

      return { success: true };
    } catch {
      // Fallback to offline / localStorage auth
      const localUsers = getLocalUsers();
      const found = localUsers.find(u => u.email === email && u.password === password);
      if (found) {
        const userData = { _id: 'offline_' + Date.now(), name: found.name, email: found.email, role: found.role, token: 'offline' };
        setUser(userData);
        localStorage.setItem(SESSION_KEY, JSON.stringify(userData));
        return { success: true };
      }
      return { success: false, message: 'Invalid credentials. If offline, use a previously registered account.' };
    }
  };

  const signup = async (name, email, password) => {
    const role = 'Staff';
    // Try online registration first
    try {
      const response = await api.post('/api/auth/register', { name, email, password });
      const userData = response.data;
      setUser(userData);
      localStorage.setItem(SESSION_KEY, JSON.stringify(userData));

      // Cache locally
      const localUsers = getLocalUsers();
      localUsers.push({ name, email, password, role });
      saveLocalUsers(localUsers);

      return { success: true };
    } catch (error) {
      const serverMsg = error.response?.data?.message;

      // If server says user exists, don't save
      if (serverMsg === 'User already exists') {
        return { success: false, message: 'An account with this email already exists.' };
      }

      // Offline — save locally
      const localUsers = getLocalUsers();
      if (localUsers.find(u => u.email === email)) {
        return { success: false, message: 'An account with this email already exists.' };
      }
      localUsers.push({ name, email, password, role });
      saveLocalUsers(localUsers);

      const userData = { _id: 'offline_' + Date.now(), name, email, role, token: 'offline' };
      setUser(userData);
      localStorage.setItem(SESSION_KEY, JSON.stringify(userData));
      return { success: true };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
