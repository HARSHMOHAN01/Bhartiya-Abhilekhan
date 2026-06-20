import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, api } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingCart, 
  Eye, 
  PlusCircle, 
  LogOut, 
  Bell, 
  HelpCircle,
  Box,
  Menu,
  X
} from 'lucide-react';

export const Layout = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [notificationsOpen, setNotificationsOpen] = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState([]);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const profileRef = React.useRef(null);
  const notificationsRef = React.useRef(null);

  React.useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchDynamicNotifications = React.useCallback(async () => {
    try {
      const [prodRes, ordRes] = await Promise.all([
        api.get('/products'),
        api.get('/orders')
      ]);
      
      const newNotifications = [];
      
      // 1. Check out of stock or low stock products
      prodRes.data.forEach(p => {
        if (p.quantity === 0) {
          newNotifications.push({
            id: `stock-zero-${p.id}`,
            text: `Critical Stock Alert: ${p.name} (${p.sku}) is OUT OF STOCK.`,
            time: 'Just now',
            type: 'critical'
          });
        } else if (p.quantity < 10) {
          newNotifications.push({
            id: `stock-low-${p.id}`,
            text: `Low Stock Alert: ${p.name} (${p.sku}) has only ${p.quantity} units left.`,
            time: '10m ago',
            type: 'warning'
          });
        }
      });

      // 2. Check recent orders
      ordRes.data.slice(0, 3).forEach(o => {
        newNotifications.push({
          id: `order-new-${o.id}`,
          text: `Order #ORD-${8800 + o.id} placed by ${o.customer_name || 'Client'} for $${o.total_amount.toFixed(2)}.`,
          time: '1h ago',
          type: 'info'
        });
      });

      // 3. Append default system events
      const systemEvents = [
        { id: 'sys-1', text: "Stock anomaly corrected at London-Central-01", time: "5m ago", type: 'info' },
        { id: 'sys-2', text: "API Gateway Handshake established with Singapore-Global-09", time: "2h ago", type: 'info' }
      ];

      setNotifications([...newNotifications, ...systemEvents]);
    } catch (error) {
      console.error('Failed to load notifications', error);
    }
  }, []);

  React.useEffect(() => {
    if (user) {
      fetchDynamicNotifications();
      const interval = setInterval(fetchDynamicNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [user, fetchDynamicNotifications]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  React.useEffect(() => {
    document.title = `${getHeaderTitle()} | Bhartiya Abhilekhan`;
  }, [location.pathname]);

  // Define nav links based on role
  const adminLinks = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Products', path: '/products', icon: Package },
    { name: 'Customers', path: '/customers', icon: Users },
    { name: 'Orders', path: '/orders', icon: ShoppingCart },
  ];

  const staffLinks = [
    { name: 'Focus Workspace', path: '/workspace', icon: Eye },
    { name: 'Create Order', path: '/create-order', icon: PlusCircle },
  ];

  const currentLinks = isAdmin ? adminLinks : staffLinks;

  // Header titles mapping
  const SidebarContent = () => (
    <div className="flex flex-col justify-between h-full bg-[#0f172a]">
      <div>
        {/* Logo Section */}
        <div className="p-6 flex items-center justify-between border-b border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-md tracking-wide text-white">Enterprise IMS</h1>
              <p className="text-xs text-slate-400 font-medium">Operational Suite</p>
            </div>
          </div>
          {/* Close button on mobile/tablet */}
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-slate-200 transition-colors p-1.5 rounded-lg hover:bg-slate-800/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1.5 flex-1">
          {currentLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                {link.name}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Profile Card / Logout */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-bold text-blue-400">
            {user?.full_name?.substring(0, 2).toUpperCase() || 'US'}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-slate-200 truncate">{user?.full_name}</h4>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 inline-block mt-0.5">
              {user?.role}
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-bold transition-all duration-150"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#0b0f19] overflow-hidden text-slate-100 font-sans">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-[#0f172a] border-r border-slate-800 z-20 shrink-0 hidden lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Mobile Drawer Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-[#0f172a] border-r border-slate-800 z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </aside>

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Bar */}
        <header className="h-16 bg-[#0f172a] border-b border-slate-800 flex items-center justify-between px-4 md:px-8 z-10 shrink-0">
          <div className="flex items-center gap-3 md:gap-6 flex-1">
            {/* Hamburger Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800/40 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            <h2 className="text-base md:text-lg font-bold text-white tracking-tight">{getHeaderTitle()}</h2>
            
            {/* Global Search Bar */}
            <div className="relative w-96 hidden md:block">
              <input
                type="text"
                placeholder="Search customer nodes, logs, or metrics..."
                className="w-full bg-slate-900/60 border border-slate-800/80 rounded-lg pl-4 pr-10 py-1.5 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-4">
            {/* Notifications Dropdown */}
            <div className="relative" ref={notificationsRef}>
              <button 
                onClick={() => { setNotificationsOpen(!notificationsOpen); setProfileOpen(false); }}
                className="relative p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800/40 transition-colors"
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full text-[9px] w-4.5 h-4.5 flex items-center justify-center font-extrabold px-1 border border-[#0f172a]">
                    {notifications.length}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-40 p-4 divide-y divide-slate-800/60 text-left">
                  <div className="flex justify-between items-center pb-2 mb-2">
                    <span className="text-xs font-bold text-slate-200">System Notifications</span>
                    {notifications.length > 0 && (
                      <button 
                        onClick={() => setNotifications([])} 
                        className="text-[10px] text-blue-400 hover:text-blue-300 font-bold"
                      >
                        Dismiss All
                      </button>
                    )}
                  </div>
                  <div className="space-y-3 pt-2 max-h-60 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-4">No new system alerts.</p>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className="flex justify-between items-start gap-2 text-[11px] leading-relaxed text-slate-305 hover:text-slate-200 transition-colors py-1 group">
                          <div className="flex-1">
                            <p className="font-semibold text-slate-300">{n.text}</p>
                            <span className="text-[9px] text-slate-550 font-medium block mt-0.5">{n.time}</span>
                          </div>
                          <button 
                            onClick={() => setNotifications(prev => prev.filter(item => item.id !== n.id))}
                            className="text-[10px] text-slate-500 hover:text-rose-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity p-1 ml-1"
                          >
                            ✕
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Help Indicator */}
            <button className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800/40 transition-colors">
              <HelpCircle className="w-5 h-5" />
            </button>

            <div className="h-6 w-px bg-slate-800"></div>

            {/* Profile Avatar Dropdown */}
            <div className="relative" ref={profileRef}>
              <button 
                onClick={() => { setProfileOpen(!profileOpen); setNotificationsOpen(false); }}
                className="flex items-center gap-3 hover:bg-slate-800/25 p-1 rounded-lg transition-colors text-left focus:outline-none"
              >
                <div className="text-right">
                  <span className="text-xs font-bold block text-slate-200 leading-none">{user?.full_name}</span>
                  <span className="text-[10px] text-slate-550 font-medium block mt-0.5 leading-none">
                    {user?.role === 'admin' ? 'System Admin' : 'Staff Operator'}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center text-xs font-bold text-slate-400">
                  {user?.full_name?.substring(0, 1).toUpperCase() || 'U'}
                </div>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-40 p-2 text-left">
                  <div className="px-3 py-2 border-b border-slate-800 mb-1 text-slate-400">
                    <p className="text-[9px] font-bold uppercase tracking-wider">Logged In As</p>
                    <p className="text-xs font-bold text-slate-200 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 text-xs font-bold transition-all text-left"

                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out Account
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content View Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#0b0f19]">
          {children}
        </main>
      </div>
    </div>
  );
};
