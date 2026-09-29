import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import axios from '../api/axios';
import { 
  Building2, MapPin, Users, IndianRupee, Factory, FileText, 
  CheckCircle2, AlertCircle, Mail, BarChart3, ArrowRight, Sparkles,
  ShieldCheck, Lock, LogIn, UserPlus
} from 'lucide-react';

const BusinessProfileForm = () => {
  const [formData, setFormData] = useState({
    businessName: '',
    industryType: '',
    sector: '',
    investmentAmount: '',
    state: 'Maharashtra',
    district: '',
    employeeCount: '',
    businessActivity: '',
    email: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [successId, setSuccessId] = useState(null);
  const [error, setError] = useState('');
  const [savedProfileId, setSavedProfileId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const id = localStorage.getItem('udyogsetu_profileId');
    if (id) setSavedProfileId(id);

    const storedUser = localStorage.getItem('udyogsetu_user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setCurrentUser(parsed);
        const pendingBusiness = sessionStorage.getItem('pending_business_name');
        setFormData(prev => ({
          ...prev,
          email: parsed.email || prev.email,
          businessName: pendingBusiness || prev.businessName
        }));
        if (pendingBusiness) sessionStorage.removeItem('pending_business_name');
      } catch (e) {
        setCurrentUser(null);
      }
    } else {
      setCurrentUser(null);
    }
    setAuthChecked(true);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!currentUser || currentUser.role !== 'entrepreneur') {
      toast.error('Please sign in or register as an entrepreneur before creating a business profile.');
      navigate('/login?role=entrepreneur&redirect=/start');
      return;
    }

    setLoading(true);
    setSuccessId(null);

    if (formData.investmentAmount && Number(formData.investmentAmount) < 0) {
      setError('Investment amount cannot be negative.');
      toast.error('Investment amount cannot be negative');
      setLoading(false);
      return;
    }
    if (formData.employeeCount && Number(formData.employeeCount) < 0) {
      setError('Employee count cannot be negative.');
      toast.error('Employee count cannot be negative');
      setLoading(false);
      return;
    }
    
    try {
      const payload = {
        ...formData,
        userId: currentUser?._id,
        investmentAmount: formData.investmentAmount ? Number(formData.investmentAmount) : undefined,
        employeeCount: formData.employeeCount ? Number(formData.employeeCount) : undefined,
        location: {
          state: formData.state,
          district: formData.district
        }
      };
      
      const response = await axios.post('/api/business-profile', payload);
      const newId = response.data._id;
      setSuccessId(newId);
      localStorage.setItem('udyogsetu_profileId', newId);

      // If user session is active, sync user.businessProfileId
      if (currentUser) {
        try {
          const updatedUser = { ...currentUser, businessProfileId: newId };
          localStorage.setItem('udyogsetu_user', JSON.stringify(updatedUser));
          setCurrentUser(updatedUser);
        } catch (e) {}
      }

      toast.success('Business profile created! Your roadmap is ready.');
      setFormData({
        businessName: '', industryType: '', sector: '', investmentAmount: '',
        state: 'Maharashtra', district: '', employeeCount: '', businessActivity: '', email: currentUser?.email || ''
      });
    } catch (err) {
      if (err.message === 'Network Error' || !err.response) {
        const msg = 'Service unavailable. Cannot connect to the server.';
        setError(msg);
        toast.error(msg);
      } else {
        const msg = err.response?.data?.message || 'An error occurred while submitting.';
        const details = err.response?.data?.errors ? ` - ${err.response.data.errors.join(', ')}` : '';
        setError(msg + details);
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // Auth Gatekeeper Check
  if (authChecked && (!currentUser || currentUser.role !== 'entrepreneur')) {
    return (
      <div className="min-h-[85vh] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center transition-colors">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 border border-slate-200 dark:border-slate-800 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center mb-5 shadow-sm">
            <Lock size={30} />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-semibold mb-3">
            <ShieldCheck size={14} />
            <span>Entrepreneur Authentication Required</span>
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
            Sign In or Sign Up First
          </h2>

          <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 leading-relaxed">
            {currentUser?.role === 'officer'
              ? `You are signed in as an Officer (${currentUser.email}). Government officers review applications and cannot create business profiles.`
              : 'Before creating a business profile and generating your regulatory roadmap, please sign in or register with an Entrepreneur account.'}
          </p>

          {currentUser?.role === 'officer' ? (
            <div className="space-y-3">
              <Link
                to="/officer-dashboard"
                className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all text-sm"
              >
                <span>Go to Officer Review Desk</span>
                <ArrowRight size={16} />
              </Link>
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem('udyogsetu_user');
                  localStorage.removeItem('udyogsetu_profileId');
                  navigate('/login?role=entrepreneur&redirect=/start');
                }}
                className="w-full inline-flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold py-3 px-4 rounded-xl transition-all text-sm"
              >
                <span>Switch to Entrepreneur Account</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <Link
                to="/login?role=entrepreneur&redirect=/start"
                className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all text-sm"
              >
                <LogIn size={16} />
                <span>Sign In as Entrepreneur</span>
                <ArrowRight size={16} />
              </Link>

              <Link
                to="/login?role=entrepreneur&signup=true&redirect=/start"
                className="w-full inline-flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 text-slate-800 dark:text-slate-200 font-bold py-3 px-4 rounded-xl transition-all text-sm shadow-sm"
              >
                <UserPlus size={16} />
                <span>Create New Account (Sign Up)</span>
              </Link>

              <div className="pt-3">
                <Link to="/" className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition-colors">
                  ← Return to Homepage
                </Link>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 flex flex-col items-center py-10 transition-colors">
      
      {/* Continue to Dashboard banner */}
      {savedProfileId && !successId && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl w-full mb-6"
        >
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/60 dark:to-indigo-950/60 border border-blue-200 dark:border-blue-800 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div>
              <h3 className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5 text-base">
                <Sparkles size={18} className="text-blue-600 dark:text-blue-400" /> Welcome back!
              </h3>
              <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 mt-0.5">
                You have an active MSME profile. Continue tracking your statutory approvals.
              </p>
            </div>
            <div className="flex gap-2.5">
              <Link
                to={`/dashboard/${savedProfileId}`}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl shadow-sm transition-all flex items-center gap-1.5 text-xs sm:text-sm"
              >
                <BarChart3 size={15} /> Go to Dashboard
              </Link>
              <Link
                to={`/roadmap/${savedProfileId}`}
                className="bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold py-2 px-4 rounded-xl shadow-sm transition-all text-xs sm:text-sm hover:bg-blue-50 dark:hover:bg-slate-800"
              >
                View Roadmap
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      <div className="max-w-4xl w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 transition-colors">
        
        {/* Authenticated user banner */}
        {currentUser && (
          <div className="mb-6 px-4 py-2.5 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-blue-900 dark:text-blue-200">
              <CheckCircle2 size={16} className="text-blue-600 dark:text-blue-400 shrink-0" />
              <span>Signed in as: <strong className="font-semibold">{currentUser.email}</strong> (Entrepreneur)</span>
            </div>
            <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/60 px-2 py-0.5 rounded-md uppercase tracking-wider self-start sm:self-auto">
              Active Intake Session
            </span>
          </div>
        )}
        
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-semibold mb-3">
            <span>Maha Parwana Intake Protocol</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Business Profile Intake</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 max-w-lg mx-auto">
            Provide details about your proposed enterprise to generate a tailored statutory clearance roadmap.
          </p>
        </div>

        {/* Success Modal / Banner */}
        {successId && (
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
            className="mb-8 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-6 text-center shadow-sm"
          >
            <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-600 text-white rounded-full mb-3 shadow-md">
              <CheckCircle2 size={30} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Profile Created Successfully!</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
              Your registered Profile ID is: <span className="font-mono font-bold bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700 shadow-sm">{successId}</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button 
                onClick={() => navigate(`/roadmap/${successId}`)} 
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>View Regulatory Roadmap</span>
                <ArrowRight size={16} />
              </button>
              <button 
                onClick={() => navigate(`/dashboard/${successId}`)} 
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold py-3 px-6 rounded-xl shadow-sm transition-all hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-center gap-2"
              >
                <BarChart3 size={16} /> Status Dashboard
              </button>
            </div>
          </motion.div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/60 border-l-4 border-red-500 rounded-r-xl flex items-start text-red-700 dark:text-red-300">
            <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">Submission Error</p>
              <p className="text-xs mt-0.5">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className={`space-y-8 ${successId ? 'opacity-40 pointer-events-none' : ''}`}>
          
          {/* Section 1: Business Details */}
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2.5 mb-5 flex items-center gap-2">
              <Building2 size={18} className="text-blue-600 dark:text-blue-400" />
              <span>Core Business Identity</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Business Legal Name <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  name="businessName" 
                  value={formData.businessName} 
                  onChange={handleChange} 
                  required 
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all shadow-sm" 
                  placeholder="e.g. Sahyadri Agro Food Processing Ltd." 
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Industry Type <span className="text-red-500">*</span>
                </label>
                <select 
                  name="industryType" 
                  value={formData.industryType} 
                  onChange={handleChange} 
                  required 
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all shadow-sm"
                >
                  <option value="">Select Industry Type</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Food Processing">Food Processing</option>
                  <option value="IT/Software">IT/Software</option>
                  <option value="Textiles">Textiles</option>
                  <option value="Pharmaceuticals">Pharmaceuticals</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  MSME Sector Category
                </label>
                <select 
                  name="sector" 
                  value={formData.sector} 
                  onChange={handleChange} 
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all shadow-sm"
                >
                  <option value="">Select Sector</option>
                  <option value="Micro">Micro (&lt; ₹1 Cr Investment)</option>
                  <option value="Small">Small (₹1 Cr - ₹10 Cr)</option>
                  <option value="Medium">Medium (₹10 Cr - ₹50 Cr)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Scale & Operations */}
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2.5 mb-5 flex items-center gap-2">
              <Factory size={18} className="text-indigo-600 dark:text-indigo-400" />
              <span>Scale & Operations</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="flex items-center text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  <IndianRupee size={14} className="mr-1 text-slate-400" /> Plant & Machinery Investment (INR)
                </label>
                <input 
                  type="number" 
                  name="investmentAmount" 
                  value={formData.investmentAmount} 
                  onChange={handleChange} 
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all shadow-sm" 
                  placeholder="e.g. 2500000" 
                />
              </div>

              <div>
                <label className="flex items-center text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  <Users size={14} className="mr-1 text-slate-400" /> Total Expected Workforce
                </label>
                <input 
                  type="number" 
                  name="employeeCount" 
                  value={formData.employeeCount} 
                  onChange={handleChange} 
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all shadow-sm" 
                  placeholder="e.g. 20" 
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="flex items-center text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  <FileText size={14} className="mr-1 text-slate-400" /> Primary Industrial Activity
                </label>
                <textarea 
                  name="businessActivity" 
                  value={formData.businessActivity} 
                  onChange={handleChange} 
                  rows="3" 
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all shadow-sm" 
                  placeholder="Describe your manufacturing process, raw materials, or primary services..."
                ></textarea>
              </div>
            </div>
          </div>

          {/* Section 3: Location Details */}
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2.5 mb-5 flex items-center gap-2">
              <MapPin size={18} className="text-emerald-600 dark:text-emerald-400" />
              <span>Location & Statutory Jurisdiction</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">State</label>
                <input 
                  type="text" 
                  name="state" 
                  value={formData.state} 
                  onChange={handleChange} 
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all shadow-sm font-semibold" 
                  placeholder="Maharashtra" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">District / Industrial Area</label>
                <input 
                  type="text" 
                  name="district" 
                  value={formData.district} 
                  onChange={handleChange} 
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all shadow-sm" 
                  placeholder="e.g. Pune (MIDC Chakan)" 
                />
              </div>
            </div>
          </div>

          {/* Section 4: Contact & Notifications */}
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2.5 mb-5 flex items-center gap-2">
              <Mail size={18} className="text-amber-500" />
              <span>Official Contact for Statutory SLA Alerts</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Email Address</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all shadow-sm" 
                placeholder="contact@enterprise.com — receives automatic deadline alerts" 
              />
              <p className="text-xs text-slate-400 mt-1">Used for statutory compliance reminders and certificate issuance alerts.</p>
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-slate-200 dark:border-slate-800">
            <button 
              type="submit" 
              disabled={loading} 
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] disabled:opacity-50 flex items-center gap-2 text-base"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Synthesizing Regulatory Roadmap...</span>
                </>
              ) : (
                <>
                  <span>Generate Regulatory Roadmap</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default BusinessProfileForm;
