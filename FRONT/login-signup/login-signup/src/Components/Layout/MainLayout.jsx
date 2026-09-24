import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Activity, 
  Bell, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Server
} from 'lucide-react';

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/network', icon: Activity, label: 'Network' },
    { path: '/notifications', icon: Bell, label: 'Notifications' },
  ];

  return (
    <div className="min-h-screen bg-[#f4f6f9] text-slate-900 flex">
      {/* Sidebar */}
      <motion.aside 
        initial={{ width: 260 }}
        animate={{ width: isSidebarOpen ? 260 : 80 }}
        className="border-r border-slate-200 bg-white shadow-sm z-20 flex flex-col pt-6"
      >
        <div className="px-6 mb-10 flex items-center gap-3">
          <Server className="w-8 h-8 text-blue-600 flex-shrink-0" />
          {isSidebarOpen && <span className="font-bold tracking-tight text-lg text-slate-900">SAT Monitor</span>}
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  isActive ? 'bg-blue-50 text-blue-600 font-semibold border border-blue-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {isSidebarOpen && <span className="text-sm">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="w-full flex items-center justify-center p-2 text-slate-500 hover:text-slate-900"
          >
            {isSidebarOpen ? <ChevronLeft /> : <ChevronRight />}
          </button>
          
          <button onClick={() => navigate('/login')} className="w-full flex items-center gap-3 p-3 text-slate-600 hover:text-red-600 transition-colors">
            <LogOut className="w-5 h-5" />
            {isSidebarOpen && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
          <h2 className="text-sm font-bold text-slate-700 capitalize tracking-widest">
            {location.pathname.replace('/', '') || 'Dashboard'}
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-slate-500">Admin</span>
            <div className="w-8 h-8 bg-blue-100 text-blue-600 font-bold rounded-full border border-blue-200 flex items-center justify-center text-xs">
              AD
            </div>
          </div>
        </header>

        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
