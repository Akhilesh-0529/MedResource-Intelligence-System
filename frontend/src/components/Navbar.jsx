import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useStore } from '../hooks/useStore';
import { Activity, LayoutDashboard, Database, Users, LogOut, Wifi, WifiOff } from 'lucide-react';
import classNames from 'classnames';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isOnline } = useStore();
  const location = useLocation();

  const links = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Resources', path: '/resources', icon: Database },
    { name: 'Intake', path: '/patients', icon: Users },
    { name: 'Records', path: '/records', icon: Activity },
  ];

  if (!user) return null;

  return (
    <nav className="bg-hospital-primary text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-3">
            <Activity className="h-8 w-8 text-hospital-accent" />
            <span className="font-bold text-xl tracking-tight">SmartAlloc</span>
          </div>
          <div className="flex items-center space-x-4">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={classNames(
                    "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive ? "bg-hospital-secondary text-white" : "text-slate-200 hover:bg-hospital-secondary/50"
                  )}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {link.name}
                </Link>
              );
            })}
          </div>
          <div className="flex items-center space-x-3">
            <div className={classNames(
              "flex items-center px-2.5 py-1 rounded-full text-xs font-semibold transition-all duration-500",
              isOnline ? "bg-green-500/20 text-green-300" : "bg-yellow-500/20 text-yellow-300 animate-pulse"
            )}>
              {isOnline ? <Wifi className="h-3 w-3 mr-1.5" /> : <WifiOff className="h-3 w-3 mr-1.5" />}
              {isOnline ? 'Online' : 'Offline'}
            </div>
            <div className="text-sm">
              <span className="block opacity-75 text-xs">Logged in as</span>
              <span className="font-bold">{user.name} ({user.role})</span>
            </div>
            <button 
              onClick={logout}
              className="p-2 bg-red-500 hover:bg-red-600 rounded-md transition"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
