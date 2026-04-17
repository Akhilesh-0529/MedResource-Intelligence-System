import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) navigate('/dashboard');
    else alert('Login failed. Ensure backend is running.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full border border-slate-100">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-hospital-primary rounded-full">
            <Activity className="h-10 w-10 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-8">Smart Healthcare Allocation</h2>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700">Email Address</label>
            <input 
              type="text" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-hospital-primary focus:border-hospital-primary"
              placeholder="admin@hospital.com" 
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-hospital-primary focus:border-hospital-primary"
              required
            />
          </div>
          <button 
            type="submit" 
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-hospital-primary hover:bg-hospital-secondary transition"
          >
            Sign In
          </button>
        </form>
        <div className="mt-4 text-center text-xs text-slate-500">
          Demo Accounts: admin@hospital.com | staff@hospital.com (any password)
        </div>
      </div>
    </div>
  );
};

export default Login;
