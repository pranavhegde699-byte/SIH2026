import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from '../api/axios';
import { Building2, ShieldCheck, Mail, Lock, CreditCard, ArrowRight, User, Info } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [isLogin, setIsLogin] = useState(() => searchParams.get('signup') !== 'true');
  const [role, setRole] = useState(() => searchParams.get('role') || 'entrepreneur');
  
  const redirectTarget = searchParams.get('redirect');
  const promptMessage = searchParams.get('message');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    panNumber: '',
    businessName: '',
    department: 'All'
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get('signup') === 'true') {
      setIsLogin(false);
    }
    if (searchParams.get('role')) {
      setRole(searchParams.get('role'));
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = { ...formData, role };
      
      const res = await axios.post(endpoint, payload);
      const user = res.data.data;
      
      // Save user to localStorage
      localStorage.setItem('udyogsetu_user', JSON.stringify(user));
      toast.success(isLogin ? `Welcome back, ${user.email}!` : 'Account created successfully!');
      
      if (user.role === 'entrepreneur') {
        // If registering with businessName, stash it so /start can prefill
        if (!isLogin && formData.businessName) {
          sessionStorage.setItem('pending_business_name', formData.businessName);
        }
        if (formData.panNumber) {
          sessionStorage.setItem('pending_pan_number', formData.panNumber);
        }

        if (user.businessProfileId && redirectTarget !== '/start') {
          localStorage.setItem('udyogsetu_profileId', user.businessProfileId);
          navigate(`/dashboard/${user.businessProfileId}`);
        } else {
          // Send to start intake
          navigate('/start');
        }
      } else {
        localStorage.removeItem('udyogsetu_profileId');
        navigate('/officer-dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Authentication failed. Please check credentials.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 transition-colors">
        
        {/* Toggle Role */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl mb-8 border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setRole('entrepreneur')}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl flex justify-center items-center gap-2 transition-all ${
              role === 'entrepreneur' 
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/50 dark:border-slate-700/50' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building2 size={16} /> Entrepreneur
          </button>
          <button
            type="button"
            onClick={() => setRole('officer')}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl flex justify-center items-center gap-2 transition-all ${
              role === 'officer' 
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/50 dark:border-slate-700/50' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck size={16} /> Dept. Officer
          </button>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {isLogin ? 'Welcome back' : 'Create an account'}
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {role === 'entrepreneur' 
              ? 'Manage your MSME compliances seamlessly.' 
              : 'Review and approve verified submissions.'}
          </p>
        </div>

        {(promptMessage || redirectTarget === '/start') && (
          <div className="mb-5 bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-200 p-3.5 rounded-2xl text-xs font-semibold flex items-start gap-2.5 border border-blue-200 dark:border-blue-800 shadow-sm">
            <Info size={18} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Entrepreneur Authentication Required</p>
              <p className="font-normal text-blue-700 dark:text-blue-300 mt-0.5">
                {promptMessage || (isLogin 
                  ? 'Please sign in to your entrepreneur account to create or access your business profile.' 
                  : 'Please create an entrepreneur account to begin your official business intake and compliance roadmap.')}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-5 bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 p-3 rounded-xl text-xs font-semibold text-center border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail size={16} />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder={role === 'officer' ? "officer@udyogsetu.gov.in" : "name@company.com"}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock size={16} />
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Registration specific fields */}
          {!isLogin && role === 'entrepreneur' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Business Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Building2 size={16} />
                  </div>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. Acme Industries Ltd."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">PAN Card Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <CreditCard size={16} />
                  </div>
                  <input
                    type="text"
                    name="panNumber"
                    value={formData.panNumber}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none uppercase font-mono"
                    placeholder="ABCDE1234F"
                    maxLength={10}
                  />
                </div>
              </div>
            </>
          )}

          {role === 'officer' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Department</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="All">All Departments</option>
                <option value="Ministry of MSME">Ministry of MSME</option>
                <option value="Local Municipal Corporation">Local Municipal Corporation</option>
                <option value="Town Planning Department">Town Planning Department</option>
                <option value="Fire Services Department">Fire Services Department</option>
                <option value="State Pollution Control Board">State Pollution Control Board</option>
                <option value="Directorate of Industrial Safety and Health">Directorate of Industrial Safety and Health</option>
                <option value="CBIC / State Commercial Tax Department">CBIC / State Commercial Tax Department</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-slate-100 dark:border-slate-800 pt-4">
          <button
            type="button"
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline"
          >
            {isLogin ? "Don't have an account? Register" : "Already have an account? Sign In"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Login;
