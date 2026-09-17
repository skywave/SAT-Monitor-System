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
    <div className="min-h-screen bg-[#09090B] text-white flex">
      {/* Sidebar */}
      <motion.aside 
        initial={{ width: 260 }}
        animate={{ width: isSidebarOpen ? 260 : 80 }}
        className="border-r border-zinc-800 bg-[#0A0A0A] z-20 flex flex-col pt-6"
      >
        <div className="px-6 mb-10 flex items-center gap-3">
          <Server className="w-8 h-8 text-amethyst-primary flex-shrink-0" />
          {isSidebarOpen && <span className="font-bold tracking-tight text-lg">SAT Monitor</span>}
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
                  isActive ? 'bg-amethyst-primary/10 text-amethyst-primary border border-amethyst-primary/20' : 'text-zinc-500 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {isSidebarOpen && <span className="font-medium text-sm">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="w-full flex items-center justify-center p-2 text-zinc-500 hover:text-white"
          >
            {isSidebarOpen ? <ChevronLeft /> : <ChevronRight />}
          </button>
          
          <button onClick={() => navigate('/login')} className="w-full flex items-center gap-3 p-3 text-zinc-500 hover:text-red-500 transition-colors">
            <LogOut className="w-5 h-5" />
            {isSidebarOpen && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 border-b border-zinc-800 bg-[#0A0A0A]/50 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-sm font-bold text-zinc-400 capitalize tracking-widest">
            {location.pathname.replace('/', '')}
          </h2>
          <div className="w-8 h-8 bg-zinc-900 rounded-full border border-zinc-800"></div>
        </header>

        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
