import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Send, 
  BarChart3, 
  Settings, 
  Zap,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { logout } from '../lib/firebase.ts';

const SidebarItem = ({ icon: Icon, label, to, active }: { icon: any, label: string, to: string, active?: boolean }) => (
  <Link 
    to={to} 
    className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 mb-2",
      active 
        ? "neumorph-inset text-blue-600 font-semibold" 
        : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
    )}
  >
    <Icon className={cn("w-5 h-5", active ? "text-blue-600" : "text-slate-400")} />
    <span className="flex-1">{label}</span>
    {active && <ChevronRight className="w-4 h-4" />}
  </Link>
);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-soft-bg p-6 gap-6">
      {/* Sidebar */}
      <aside className="w-72 neumorph rounded-[2.5rem] p-8 flex flex-col">
        <Link to="/" className="flex items-center gap-3 mb-12 px-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Zap className="w-6 h-6 fill-white text-white" />
          </div>
          <span className="text-xl font-display font-bold tracking-tight">LeadFlow AI</span>
        </Link>

        <nav className="flex-1">
          <SidebarItem 
            icon={LayoutDashboard} 
            label="Overview" 
            to="/dashboard" 
            active={location.pathname === '/dashboard'} 
          />
          <SidebarItem 
            icon={Users} 
            label="Leads" 
            to="/dashboard/leads" 
            active={location.pathname === '/dashboard/leads'} 
          />
          <SidebarItem 
            icon={Send} 
            label="Campaigns" 
            to="/dashboard/campaigns" 
            active={location.pathname === '/dashboard/campaigns'} 
          />
          <SidebarItem 
            icon={BarChart3} 
            label="Analytics" 
            to="/dashboard/analytics" 
            active={location.pathname === '/dashboard/analytics'} 
          />
        </nav>

        <div className="pt-8 border-t border-slate-200/50">
          <SidebarItem icon={Settings} label="Settings" to="/dashboard/settings" />
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 transition-all mt-2"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col gap-6">
        {/* Header */}
        <header className="h-20 neumorph rounded-[2rem] px-8 flex items-center justify-between">
          <h2 className="text-2xl font-display font-bold text-slate-800">
            {location.pathname.split('/').pop()?.toUpperCase() || 'DASHBOARD'}
          </h2>
          <div className="flex items-center gap-4">
            <div className="neumorph-sm px-4 py-2 rounded-xl flex items-center gap-3">
              {user?.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || ''} className="w-8 h-8 rounded-lg" />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg" />
              )}
              <span className="font-medium text-sm">{user?.displayName || 'User'}</span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

