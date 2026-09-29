import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Building2, BarChart3, Landmark, Home, Sun, Moon, PlusCircle, ShieldCheck } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const [savedProfileId, setSavedProfileId] = useState(null);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const id = localStorage.getItem('udyogsetu_profileId');
    if (id) setSavedProfileId(id);
    
    const storedUser = localStorage.getItem('udyogsetu_user');
    if (storedUser) setUser(JSON.parse(storedUser));
    else setUser(null);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('udyogsetu_profileId');
    localStorage.removeItem('udyogsetu_user');
    setSavedProfileId(null);
    setUser(null);
  };

  return (
    <nav className="bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md text-white border-b border-slate-800 sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5 hover:opacity-95 transition-opacity group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white flex items-center gap-1.5">
                  UdyogSetu
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30 uppercase tracking-widest hidden sm:inline-block">Gov</span>
                </span>
              </div>
            </Link>
          </div>
          
          {/* Nav Links */}
          <div className="flex items-center space-x-1 sm:space-x-3">
            {user?.role === 'officer' ? (
              <Link 
                to="/officer-dashboard" 
                className="text-slate-300 hover:text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 hover:bg-slate-800/60"
              >
                <ShieldCheck size={16} className="text-blue-400" /> 
                <span>Review Desk</span>
              </Link>
            ) : (
              <>
                <Link 
                  to="/" 
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    location.pathname === '/' ? 'text-white bg-slate-800/80 font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Home size={15} /> 
                  <span className="hidden sm:inline">Home</span>
                </Link>

                <Link 
                  to={user?.role === 'entrepreneur' ? "/start" : "/login?role=entrepreneur&redirect=/start"} 
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    location.pathname === '/start' ? 'text-white bg-slate-800/80 font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <PlusCircle size={15} className="text-blue-400" /> 
                  <span>New Intake</span>
                </Link>

                {savedProfileId && (
                  <>
                    <Link 
                      to={`/dashboard/${savedProfileId}`} 
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                        location.pathname.startsWith('/dashboard') ? 'text-white bg-slate-800/80 font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                      }`}
                    >
                      <BarChart3 size={15} className="text-indigo-400" /> 
                      <span className="hidden sm:inline">Dashboard</span>
                    </Link>
                    <Link 
                      to={`/schemes/${savedProfileId}`} 
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                        location.pathname.startsWith('/schemes') ? 'text-white bg-slate-800/80 font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                      }`}
                    >
                      <Landmark size={15} className="text-amber-400" /> 
                      <span className="hidden sm:inline">Schemes</span>
                    </Link>
                  </>
                )}

                <Link 
                  to="/verify" 
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    location.pathname.startsWith('/verify') ? 'text-white bg-slate-800/80 font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <ShieldCheck size={15} className="text-emerald-400" /> 
                  <span className="hidden sm:inline">Verify Certificate</span>
                </Link>
              </>
            )}

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors ml-1"
              aria-label="Toggle Theme"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? (
                <Sun size={18} className="text-amber-400 hover:rotate-45 transition-transform" />
              ) : (
                <Moon size={18} className="text-blue-300 hover:-rotate-12 transition-transform" />
              )}
            </button>

            {/* Auth section */}
            <div className="flex items-center pl-2 sm:pl-3 border-l border-slate-800 ml-1">
              {user ? (
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-xs text-slate-400 hidden md:block max-w-[140px] truncate">
                    {user.email}
                  </span>
                  <button 
                    onClick={handleLogout}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-md font-semibold transition-colors border border-slate-700"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link 
                  to="/login" 
                  className="text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all shadow-sm shadow-blue-500/20"
                >
                  Sign In / Register
                </Link>
              )}
            </div>

          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
