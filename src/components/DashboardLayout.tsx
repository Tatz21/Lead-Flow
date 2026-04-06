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
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { cn } from '../lib/utils.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useTheme } from '../context/ThemeContext.tsx';
import { logout } from '../lib/firebase.ts';
import { Moon, Sun } from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, to, active, onClick }: { icon: any, label: string, to: string, active?: boolean, onClick?: () => void }) => (
  <Link 
    to={to} 
    onClick={onClick}
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
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    { icon: LayoutDashboard, label: "Overview", to: "/dashboard" },
    { icon: Users, label: "Leads", to: "/dashboard/leads" },
    { icon: Send, label: "Campaigns", to: "/dashboard/campaigns" },
    { icon: BarChart3, label: "Analytics", to: "/dashboard/analytics" },
    { icon: Settings, label: "Settings", to: "/dashboard/settings" },
  ];

  return (
    <div className="flex min-h-screen bg-soft-bg relative">
      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-xl border-t border-slate-200/50 flex items-center justify-around px-4 z-[90] rounded-t-[2rem] shadow-2xl">
        {navItems.map((item) => (
          <Link 
            key={item.to}
            to={item.to}
            className={cn(
              "flex flex-col items-center gap-1 p-2 rounded-xl transition-all",
              location.pathname === item.to ? "text-blue-600" : "text-slate-400"
            )}
          >
            <item.icon className={cn("w-6 h-6", location.pathname === item.to ? "fill-blue-600/10" : "")} />
            <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Sidebar - Desktop & Mobile Slide-out */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-[100] w-72 bg-soft-bg p-6 transition-transform duration-300 md:relative md:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="neumorph h-full rounded-[2.5rem] p-8 flex flex-col">
          <div className="flex justify-between items-center mb-12 px-2">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Zap className="w-6 h-6 fill-white text-white" />
              </div>
              <span className="text-xl font-display font-bold tracking-tight">LeadFlow AI</span>
            </Link>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 neumorph-sm rounded-xl">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <nav className="flex-1">
            {navItems.map((item) => (
              <SidebarItem 
                key={item.to}
                icon={item.icon} 
                label={item.label} 
                to={item.to} 
                active={location.pathname === item.to}
                onClick={() => setIsSidebarOpen(false)}
              />
            ))}
          </nav>

          <div className="pt-8 border-t border-slate-200/50">
            <SidebarItem 
              icon={Settings} 
              label="Settings" 
              to="/dashboard/settings" 
              active={location.pathname === '/dashboard/settings'}
              onClick={() => setIsSidebarOpen(false)}
            />
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 transition-all mt-2"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 md:p-6 gap-4 md:gap-6">
        {/* Header */}
        <header className="h-20 neumorph md:rounded-[2rem] px-6 md:px-8 flex items-center justify-between sticky top-0 z-40 bg-soft-bg/80 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-3 neumorph-sm rounded-xl text-slate-600"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-xl md:text-2xl font-display font-bold text-slate-800">
              {navItems.find(i => i.to === location.pathname)?.label || 'DASHBOARD'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="p-3 neumorph-sm rounded-xl text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-all"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <div className="neumorph-sm px-3 py-2 md:px-4 md:py-2 rounded-xl flex items-center gap-3">
              {user?.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || ''} className="w-6 h-6 md:w-8 md:h-8 rounded-lg" />
              ) : (
                <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg" />
              )}
              <span className="font-medium text-xs hidden sm:inline">{user?.displayName || 'User'}</span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto px-4 md:px-0">
          {children}
        </div>
      </main>
    </div>
  );
}

