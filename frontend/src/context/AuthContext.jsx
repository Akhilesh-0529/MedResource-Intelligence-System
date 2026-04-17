import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:5001/api/auth/login', { email, password });
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      return true;
    } catch (error) {
      console.error("Login failed", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  };

  useEffect(() => {
    if (user) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
