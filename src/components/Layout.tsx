import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Layers, 
  ShoppingCart, 
  Wallet, 
  User, 
  LogOut, 
  Menu, 
  X,
  PlusCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navItems = [
    { title: 'Dashboard', path: '/', icon: LayoutDashboard },
    { title: 'Services', path: '/services', icon: Layers },
    { title: 'Orders', path: '/orders', icon: ShoppingCart },
    { title: 'Add Funds', path: '/wallet', icon: Wallet },
    { title: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-600 tracking-tight">User Dashboard</h1>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-slate-600 hover:bg-slate-50'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.title}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-4 py-3 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 px-4 flex items-center justify-between z-40">
        <h1 className="text-xl font-bold text-blue-600">User Dashboard</h1>
        <button onClick={() => setIsMobileMenuOpen(true)}>
          <Menu className="w-6 h-6 text-slate-600" />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 md:hidden"
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl"
            >
              <div className="p-6 flex items-center justify-between">
                <h1 className="text-xl font-bold text-blue-600">Menu</h1>
                <button onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="w-6 h-6 text-slate-600" />
                </button>
              </div>

              <nav className="px-4 space-y-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-4 rounded-xl transition-all ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`
                    }
                  >
                    <item.icon className="w-6 h-6" />
                    {item.title}
                  </NavLink>
                ))}
              </nav>

              <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-100">
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 w-full px-4 py-4 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all font-medium"
                >
                  <LogOut className="w-6 h-6" />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 w-full md:p-8 pt-20 px-4 pb-12 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
