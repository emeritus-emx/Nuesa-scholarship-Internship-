
import React, { useState } from 'react';
import { ViewState, User, AppNotification } from '../types';
import { Home, Menu, X, LayoutDashboard, LogIn, LogOut, User as UserIcon, Sun, Moon, Bell, Handshake, Settings, ChevronRight } from 'lucide-react';
import Logo from './Logo';

interface NavbarProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  user: User | null;
  onLogout: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  notifications: AppNotification[];
  onEnableNotifications: () => void;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  currentView, 
  onNavigate, 
  user, 
  onLogout, 
  theme, 
  toggleTheme,
  notifications,
  onEnableNotifications,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.read).length;

  const NavItem = ({ view, icon: Icon, label, onClick }: any) => (
    <button 
      onClick={() => { onClick(view); setIsOpen(false); }} 
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group
        ${currentView === view 
          ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30 font-bold translate-x-1' 
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-orange-600 dark:hover:text-orange-400'}`}
    >
      <Icon size={20} className={currentView === view ? 'text-white' : ''} />
      <span className="text-sm">{label}</span>
      {currentView === view && <ChevronRight size={16} className="ml-auto opacity-70" />}
    </button>
  );

  const NotificationsButton = () => (
     <button 
        onClick={() => {
            if (Notification.permission !== 'granted') {
                onEnableNotifications();
            }
            onNavigate(ViewState.NOTIFICATIONS);
            setIsOpen(false);
        }}
        className={`relative p-3 rounded-2xl transition-all w-full flex items-center gap-3 ${currentView === ViewState.NOTIFICATIONS ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}`}
    >
        <div className="relative">
            <Bell size={20} />
            {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center text-[8px] text-white font-bold animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                </span>
            )}
        </div>
        <span className="text-sm font-medium">Alerts</span>
    </button>
  );

  return (
    <>
      {/* MOBILE TOPBAR */}
      <div className="md:hidden sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
         <div 
            className="flex items-center cursor-pointer"
            onClick={() => onNavigate(ViewState.HOME)}
          >
            <Logo size={32} />
            <span className="ml-2 text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">NUESA</span>
          </div>
          
          <div className="flex items-center gap-2">
             <button 
                onClick={toggleTheme} 
                className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-orange-500"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-40 bg-white dark:bg-gray-900 p-4 space-y-2 animate-fade-in overflow-y-auto">
            <NavItem view={ViewState.HOME} icon={Home} label="Home" onClick={onNavigate} />
            <NavItem view={ViewState.SCHOLARSHIPS} icon={UserIcon} label="Scholarships" onClick={onNavigate} />
            <NavItem view={ViewState.INTERNSHIPS} icon={Handshake} label="Internships" onClick={onNavigate} />
            <NavItem view={ViewState.SPONSORS} icon={Handshake} label="Partnership" onClick={onNavigate} />
            <div className="border-t border-gray-100 dark:border-gray-800 my-2 pt-2">
                <NotificationsButton />
            </div>

            {user ? (
                <div className="space-y-2">
                    {user.role !== 'sponsor' && (
                        <>
                             <NavItem view={ViewState.DASHBOARD} icon={LayoutDashboard} label="Dashboard" onClick={onNavigate} />
                             <NavItem view={ViewState.PROFILE} icon={UserIcon} label="Profile" onClick={onNavigate} />
                        </>
                    )}
                     <NavItem view={ViewState.SETTINGS} icon={Settings} label="Settings" onClick={onNavigate} />
                     <button 
                        onClick={() => { onLogout(); setIsOpen(false); }} 
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                        <LogOut size={20} />
                        <span className="text-sm font-medium">Log Out</span>
                    </button>
                </div>
            ) : (
                 <button 
                    onClick={() => { onNavigate(ViewState.AUTH); setIsOpen(false); }} 
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-green-600 text-white font-bold hover:bg-green-700 shadow-md mt-4"
                >
                    <LogIn size={18} />
                    <span>Sign In</span>
                </button>
            )}
        </div>
      )}

      {/* DESKTOP VERTICAL RIGHT SIDEBAR */}
      <div className="hidden md:flex fixed right-0 top-0 h-screen w-80 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-l border-gray-100 dark:border-gray-800 flex-col shadow-2xl z-50 transition-all duration-300">
        
        {/* Sidebar Header / Logo */}
        <div className="p-8 pb-4">
             <div 
                className="cursor-pointer group"
                onClick={() => onNavigate(ViewState.HOME)}
            >
                <Logo variant="full" size={48} id="navbar-desktop" />
            </div>
        </div>

        {/* Scrollable Nav Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2 custom-scrollbar">
            <div className="space-y-1">
                <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Explore</p>
                <NavItem view={ViewState.HOME} icon={Home} label="Home" onClick={onNavigate} />
                <NavItem view={ViewState.SCHOLARSHIPS} icon={UserIcon} label="Scholarships" onClick={onNavigate} />
                <NavItem view={ViewState.INTERNSHIPS} icon={Handshake} label="Internships" onClick={onNavigate} />
                <NavItem view={ViewState.SPONSORS} icon={Handshake} label="Partnership" onClick={onNavigate} />
            </div>

            {user && user.role !== 'sponsor' && (
                <div className="space-y-1 mt-6">
                    <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Personal</p>
                    <NavItem view={ViewState.DASHBOARD} icon={LayoutDashboard} label="Dashboard" onClick={onNavigate} />
                    <NavItem view={ViewState.PROFILE} icon={UserIcon} label="My Profile" onClick={onNavigate} />
                </div>
            )}
            
            <div className="space-y-1 mt-6">
                 <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">System</p>
                 <div className="flex gap-2 px-1">
                    <NotificationsButton />
                    <button 
                        onClick={toggleTheme} 
                        className="p-3 rounded-2xl bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
                        title="Toggle Theme"
                    >
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>
                 </div>
                 {user && <NavItem view={ViewState.SETTINGS} icon={Settings} label="Settings" onClick={onNavigate} />}
            </div>
        </div>

        {/* Bottom Profile Section */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md">
            {user ? (
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full border-2 border-orange-100 dark:border-gray-700 overflow-hidden relative group cursor-pointer" onClick={() => onNavigate(ViewState.PROFILE)}>
                        {user.profilePicture ? (
                             <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                             <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-gray-500">
                                <UserIcon size={20} />
                            </div>
                        )}
                         <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                    </div>

                    <button 
                        onClick={onLogout}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                        title="Log Out"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            ) : (
                <button 
                    onClick={() => onNavigate(ViewState.AUTH)} 
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                    <LogIn size={18} />
                    <span>Sign In</span>
                </button>
            )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
