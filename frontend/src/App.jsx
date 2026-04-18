import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import { useAuth } from './hooks/useAuth';
import { StoreProvider } from './context/StoreProvider';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import DashboardAdmin from './pages/DashboardAdmin';
import ResourceManagement from './pages/ResourceManagement';
import PatientQueue from './pages/PatientQueue';
import PatientRecords from './pages/PatientRecords';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex-1 overflow-auto bg-slate-50 p-6">
        {children}
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardAdmin />
              </ProtectedRoute>
            } />
            <Route path="/resources" element={
              <ProtectedRoute>
                <ResourceManagement />
              </ProtectedRoute>
            } />
            <Route path="/patients" element={
              <ProtectedRoute>
                <PatientQueue />
              </ProtectedRoute>
            } />
            <Route path="/records" element={
              <ProtectedRoute>
                <PatientRecords />
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </Router>
      </StoreProvider>
    </AuthProvider>
  );
}

export default App;
