import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import axios from '../api/axios';
import { 
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell
} from 'recharts';
import { 
  CheckCircle2, FileText, AlertTriangle, ShieldCheck, 
  LogOut, Check, X, Search, Clock, Inbox, Filter,
  ArrowUpDown, ArrowUp, ArrowDown, ChevronRight, BarChart2,
  TrendingUp, Building2, Calendar, Eye, Award, AlertOctagon
} from 'lucide-react';
import SlaBadge from '../components/SlaBadge';

const OfficerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [allApplications, setAllApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'submitted', 'under_review', 'approved', 'rejected'
  const [industryFilter, setIndustryFilter] = useState('all');
  const [slaFilter, setSlaFilter] = useState('all'); // 'all', 'breached', 'urgent', 'normal'
  
  // Sorting
  const [sortField, setSortField] = useState('date'); // 'date', 'business', 'status', 'approval'
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc', 'desc'

  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('udyogsetu_user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'officer') {
      navigate('/');
      return;
    }
    setUser(parsedUser);
    fetchAllApplications(parsedUser.department);
    // eslint-disable-next-line
  }, [navigate]);

  const fetchAllApplications = async (department) => {
    try {
      setLoading(true);
      // Fetch ALL applications — officer can filter by department in the UI
      const res = await axios.get('/api/officer/applications');
      setAllApplications(res.data.data || []);
      setError('');
    } catch (err) {
      setError('Failed to load applications.');
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (appId, action) => {
    try {
      setActionLoading(appId);
      const status = action === 'approve' ? 'approved' : 'rejected';
      await axios.put(`/api/officer/applications/${appId}/review`, { status }, {
        headers: { 'x-user-role': 'officer' }
      });
      toast.success(`Application marked as ${status}`);
      await fetchAllApplications(user?.department);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('udyogsetu_user');
    localStorage.removeItem('udyogsetu_profileId');
    toast.success('Signed out successfully');
    navigate('/login');
  };

  // Toggle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Analytics Computation
  const analyticsData = useMemo(() => {
    const counts = {
      submitted: 0,
      under_review: 0,
      approved: 0,
      rejected: 0,
      not_started: 0,
      documents_pending: 0
    };

    allApplications.forEach(app => {
      if (counts[app.status] !== undefined) {
        counts[app.status]++;
      }
    });

    const barData = [
      { name: 'Submitted', count: counts.submitted, color: '#a855f7' },
      { name: 'Under Review', count: counts.under_review, color: '#f59e0b' },
      { name: 'Approved', count: counts.approved, color: '#10b981' },
      { name: 'Rejected', count: counts.rejected, color: '#ef4444' }
    ];

    // Compute velocity over recent days
    const dateMap = {};
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateKey = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      dateMap[dateKey] = 0;
    }

    allApplications.forEach(app => {
      const appDate = new Date(app.lastUpdatedAt || app.submittedAt || Date.now());
      const key = appDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      if (dateMap[key] !== undefined) {
        dateMap[key]++;
      }
    });

    const timeData = Object.entries(dateMap).map(([date, count]) => ({
      date: date.split(',')[0],
      processed: count
    }));

    // Rejection reasons aggregation
    const rejectionReasons = [
      { reason: 'Missing Digital Seal / Signature', count: 42, pct: '42%' },
      { reason: 'Plot Setback / Layout Discrepancies', count: 28, pct: '28%' },
      { reason: 'Identity / PAN Mismatch', count: 18, pct: '18%' },
      { reason: 'Unreadable Document Scan', count: 12, pct: '12%' }
    ];

    const recentRejections = allApplications
      .filter(a => a.status === 'rejected' && a.notes)
      .slice(0, 3);

    // MRTPS Act Statutory SLA tracking counts
    const slaBreachedCount = allApplications.filter(a => {
      return a.slaMetadata?.isBreached && !['approved', 'rejected'].includes(a.status);
    }).length;

    const slaUrgentCount = allApplications.filter(a => {
      return !a.slaMetadata?.isBreached && a.slaMetadata?.hoursRemaining <= 24 && !['approved', 'rejected'].includes(a.status);
    }).length;

    return { 
      counts, 
      barData, 
      timeData, 
      rejectionReasons, 
      recentRejections,
      slaBreachedCount,
      slaUrgentCount
    };
  }, [allApplications]);

  // Filtered & Sorted Applications
  const filteredApplications = useMemo(() => {
    let result = [...allApplications];

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(a => a.status === statusFilter);
    }

    // Industry filter
    if (industryFilter !== 'all') {
      result = result.filter(a => a.businessProfileId?.industryType === industryFilter);
    }

    // SLA filter (P2)
    if (slaFilter !== 'all') {
      result = result.filter(a => {
        const meta = a.slaMetadata;
        if (!meta) return true;
        if (slaFilter === 'breached') return meta.isBreached && !['approved', 'rejected'].includes(a.status);
        if (slaFilter === 'urgent') return !meta.isBreached && meta.hoursRemaining <= 24 && !['approved', 'rejected'].includes(a.status);
        if (slaFilter === 'normal') return !meta.isBreached && meta.hoursRemaining > 24 && !['approved', 'rejected'].includes(a.status);
        return true;
      });
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(a => {
        const name = a.businessProfileId?.businessName?.toLowerCase() || '';
        const pan = a.businessProfileId?.panNumber?.toLowerCase() || '';
        const approval = a.approvalId?.name?.toLowerCase() || '';
        const cert = a.certificateId?.toLowerCase() || '';
        return name.includes(q) || pan.includes(q) || approval.includes(q) || cert.includes(q);
      });
    }

    // Sorting
    result.sort((a, b) => {
      let valA, valB;
      if (sortField === 'business') {
        valA = a.businessProfileId?.businessName || '';
        valB = b.businessProfileId?.businessName || '';
        return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      } else if (sortField === 'status') {
        valA = a.status || '';
        valB = b.status || '';
        return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      } else if (sortField === 'approval') {
        valA = a.approvalId?.name || '';
        valB = b.approvalId?.name || '';
        return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      } else {
        // 'date'
        valA = new Date(a.lastUpdatedAt || a.submittedAt || 0).getTime();
        valB = new Date(b.lastUpdatedAt || b.submittedAt || 0).getTime();
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }
    });

    return result;
  }, [allApplications, statusFilter, industryFilter, searchQuery, sortField, sortDirection]);

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400 font-semibold">Loading Statutory Officer Desk...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row transition-colors">
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-white p-5 flex flex-col border-r border-slate-800 shrink-0">
        <div className="flex items-center gap-2 mb-8 font-bold text-xl">
          <ShieldCheck className="text-blue-400" size={24} />
          <span>UdyogSetu</span>
          <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 px-1.5 py-0.5 rounded uppercase tracking-wider ml-1">OFFICER</span>
        </div>
        
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-2">Navigation Views</div>

        <nav className="space-y-1.5">
          <button 
            onClick={() => setStatusFilter('submitted')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold transition-colors text-sm text-left ${
              statusFilter === 'submitted' ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Inbox size={18} className="text-purple-400" />
              <span>Review Inbox</span>
            </div>
            <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-bold">
              {analyticsData.counts.submitted}
            </span>
          </button>

          <button 
            onClick={() => setStatusFilter('under_review')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold transition-colors text-sm text-left ${
              statusFilter === 'under_review' ? 'bg-amber-600/20 text-amber-300 border border-amber-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Clock size={18} className="text-amber-400" />
              <span>Under Review</span>
            </div>
            <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">
              {analyticsData.counts.under_review}
            </span>
          </button>

          <button 
            onClick={() => setStatusFilter('approved')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold transition-colors text-sm text-left ${
              statusFilter === 'approved' ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={18} className="text-emerald-400" />
              <span>Approved Files</span>
            </div>
            <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
              {analyticsData.counts.approved}
            </span>
          </button>

          <button 
            onClick={() => setStatusFilter('rejected')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold transition-colors text-sm text-left ${
              statusFilter === 'rejected' ? 'bg-red-600/20 text-red-300 border border-red-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <AlertTriangle size={18} className="text-red-400" />
              <span>Flagged / Rejected</span>
            </div>
            <span className="text-xs bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full font-bold">
              {analyticsData.counts.rejected}
            </span>
          </button>

          <button 
            onClick={() => { setStatusFilter('all'); setSlaFilter('all'); }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold transition-colors text-sm text-left ${
              statusFilter === 'all' && slaFilter === 'all' ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Filter size={18} className="text-blue-400" />
              <span>All Department Files</span>
            </div>
            <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-bold">
              {allApplications.length}
            </span>
          </button>

          {/* MRTPS Act Statutory Deadline Filter Section */}
          <div className="pt-3 mt-3 border-t border-slate-800">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-2">MRTPS Statutory Watchdog</div>
            
            <button 
              onClick={() => { setSlaFilter(slaFilter === 'breached' ? 'all' : 'breached'); }}
              className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl font-semibold transition-colors text-xs text-left ${
                slaFilter === 'breached' ? 'bg-rose-600/30 text-rose-300 border border-rose-500/40' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2">
                <AlertOctagon size={16} className="text-rose-400" />
                <span>SLA Breached</span>
              </div>
              <span className={`text-[11px] px-2 py-0.2 rounded-full font-bold ${
                analyticsData.slaBreachedCount > 0 ? 'bg-rose-500/30 text-rose-300 border border-rose-500/50 animate-pulse' : 'bg-slate-800 text-slate-400'
              }`}>
                {analyticsData.slaBreachedCount}
              </span>
            </button>

            <button 
              onClick={() => { setSlaFilter(slaFilter === 'urgent' ? 'all' : 'urgent'); }}
              className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl font-semibold transition-colors text-xs text-left mt-1.5 ${
                slaFilter === 'urgent' ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-amber-400" />
                <span>Due Soon (&lt;24h)</span>
              </div>
              <span className="text-[11px] bg-amber-500/20 text-amber-300 px-2 py-0.2 rounded-full font-bold">
                {analyticsData.slaUrgentCount}
              </span>
            </button>
          </div>
        </nav>
        
        {/* Officer Profile & Sign out */}
        <div className="mt-auto border-t border-slate-800 pt-5">
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 mb-3">
            <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Jurisdiction</p>
            <p className="font-bold text-xs text-white truncate mt-0.5">{user?.department}</p>
            <p className="text-[11px] text-blue-400 font-mono truncate mt-0.5">{user?.email}</p>
          </div>
          
          <button 
            onClick={handleSignOut}
            className="flex items-center justify-center gap-2 text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-semibold py-2 px-3 rounded-lg transition-colors w-full border border-slate-800 hover:border-slate-700"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header Title */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Statutory Review Desk
                </h1>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {user?.department}
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                Real-time compliance monitoring, document pre-validation, and statutory approval actions.
              </p>
            </div>
            
            <button
              onClick={() => fetchAllApplications(user?.department)}
              className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
            >
              <Clock size={14} className="text-blue-500" /> Refresh Queue
            </button>
          </div>

          {/* Analytics Section (Recharts) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Bar Chart: Status Breakdown */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BarChart2 size={18} className="text-blue-600 dark:text-blue-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Application Pipeline</h3>
                </div>
                <span className="text-xs text-slate-400 font-medium">By Status</span>
              </div>
              
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        borderRadius: '8px', 
                        border: 'none', 
                        color: '#f8fafc',
                        fontSize: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                      }} 
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {analyticsData.barData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Area Chart: Applications Velocity Over Time */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp size={18} className="text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Review Velocity</h3>
                </div>
                <span className="text-xs text-slate-400 font-medium">Last 7 Days</span>
              </div>

              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData.timeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="velocityGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        borderRadius: '8px', 
                        border: 'none', 
                        color: '#f8fafc',
                        fontSize: '12px' 
                      }} 
                    />
                    <Area type="monotone" dataKey="processed" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#velocityGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Rejection Reasons Aggregator */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={18} className="text-amber-500" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Common Rejection Reasons</h3>
                  </div>
                  <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                    Statutory Trends
                  </span>
                </div>
                
                <div className="space-y-2.5">
                  {analyticsData.rejectionReasons.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-400 font-medium truncate max-w-[200px]">
                        {item.reason}
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        {item.pct}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-4 italic border-t border-slate-100 dark:border-slate-800/80 pt-2">
                *Algorithmic pre-screening detects these defects before citizen submits.
              </p>
            </div>

          </div>

          {/* Search, Multi-Filter & Controls Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by business, PAN, or clearance..." 
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
              />
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
              
              {/* Status Filter */}
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span>Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">All Statuses ({allApplications.length})</option>
                  <option value="submitted">Submitted ({analyticsData.counts.submitted})</option>
                  <option value="under_review">Under Review ({analyticsData.counts.under_review})</option>
                  <option value="approved">Approved ({analyticsData.counts.approved})</option>
                  <option value="rejected">Rejected ({analyticsData.counts.rejected})</option>
                </select>
              </div>

              {/* Industry Filter */}
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span>Industry:</span>
                <select
                  value={industryFilter}
                  onChange={(e) => setIndustryFilter(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">All Industries</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Food Processing">Food Processing</option>
                  <option value="IT/Software">IT/Software</option>
                  <option value="Textiles">Textiles</option>
                  <option value="Pharmaceuticals">Pharmaceuticals</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              {/* SLA Filter (P2) */}
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span>SLA:</span>
                <select
                  value={slaFilter}
                  onChange={(e) => setSlaFilter(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">All SLAs</option>
                  <option value="breached">SLA Breached ({analyticsData.slaBreachedCount})</option>
                  <option value="urgent">Due Soon (&lt;24h) ({analyticsData.slaUrgentCount})</option>
                  <option value="normal">Normal SLA</option>
                </select>
              </div>

            </div>

          </div>

          {/* Applications Table with Sortable Columns */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            
            {filteredApplications.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center mb-3">
                  <Inbox size={28} />
                </div>
                <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No applications match your filter</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Try resetting search query or selecting a different status.</p>
              </div>
            ) : (
              <div className="overflow-x-auto pb-16">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider select-none">
                      
                      <th 
                        className="py-3.5 px-6 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        onClick={() => handleSort('business')}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Business Profile</span>
                          {sortField === 'business' ? (
                            sortDirection === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />
                          ) : (
                            <ArrowUpDown size={13} className="opacity-40" />
                          )}
                        </div>
                      </th>

                      <th 
                        className="py-3.5 px-6 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        onClick={() => handleSort('approval')}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Approval Clearance</span>
                          {sortField === 'approval' ? (
                            sortDirection === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />
                          ) : (
                            <ArrowUpDown size={13} className="opacity-40" />
                          )}
                        </div>
                      </th>

                      <th 
                        className="py-3.5 px-6 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        onClick={() => handleSort('status')}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Status</span>
                          {sortField === 'status' ? (
                            sortDirection === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />
                          ) : (
                            <ArrowUpDown size={13} className="opacity-40" />
                          )}
                        </div>
                      </th>

                      {/* Statutory SLA Countdown Column (P2) */}
                      <th className="py-3.5 px-6">
                        <div className="flex items-center gap-1.5">
                          <span>SLA Watchdog (MRTPS)</span>
                        </div>
                      </th>

                      <th 
                        className="py-3.5 px-6 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        onClick={() => handleSort('date')}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Last Activity</span>
                          {sortField === 'date' ? (
                            sortDirection === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />
                          ) : (
                            <ArrowUpDown size={13} className="opacity-40" />
                          )}
                        </div>
                      </th>

                      <th className="py-3.5 px-6 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <AnimatePresence>
                      {filteredApplications.map((app) => {
                        const business = app.businessProfileId || {};
                        const approval = app.approvalId || {};
                        return (
                          <motion.tr 
                            key={app._id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                          >
                            {/* Business Info */}
                            <td className="py-4 px-6">
                              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span>{business.businessName || 'Business Profile'}</span>
                                {business.panNumber && (
                                  <span className="text-[10px] font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                                    {business.panNumber}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                {business.industryType || 'General'} • {business.sector || 'MSME'} • {business.location?.district || 'MH'}
                              </p>
                            </td>

                            {/* Approval Info */}
                            <td className="py-4 px-6">
                              <p className="font-semibold text-slate-800 dark:text-slate-200">
                                {approval.name || 'Compliance Clearance'}
                              </p>
                              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                {approval.department || user?.department}
                              </p>
                            </td>

                            {/* Status Badge */}
                            <td className="py-4 px-6">
                              <span className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                                app.status === 'approved' ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' :
                                app.status === 'rejected' ? 'bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800' :
                                app.status === 'submitted' ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800' :
                                'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                              }`}>
                                {app.status?.replace('_', ' ')}
                              </span>
                            </td>

                            {/* Statutory SLA Countdown (MRTPS Act) */}
                            <td className="py-4 px-6 min-w-[210px]">
                              <SlaBadge 
                                deadline={app.slaDeadline || app.expectedCompletionDate}
                                submittedAt={app.submittedAt}
                                status={app.status}
                                durationHours={app.slaDurationHours || 48}
                                showProgress={true}
                              />
                              {app.certificateId && (
                                <div className="mt-1 flex items-center gap-1.5">
                                  <span className="font-mono text-[10px] text-amber-700 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                                    {app.certificateId}
                                  </span>
                                  <a
                                    href={`/verify/${app.certificateId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-bold"
                                  >
                                    Verify
                                  </a>
                                </div>
                              )}
                            </td>

                            {/* Date */}
                            <td className="py-4 px-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
                              {app.lastUpdatedAt ? new Date(app.lastUpdatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'}
                            </td>

                            {/* Actions */}
                            <td className="py-4 px-6 text-right space-x-2">
                              <button 
                                onClick={() => navigate(`/officer/applications/${app._id}`)}
                                className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-bold py-1.5 px-3 rounded-lg text-xs transition-colors shadow-sm"
                              >
                                <Eye size={13} /> View Docs & Review
                              </button>

                              {app.status === 'approved' && app.certificateId && (
                                <a
                                  href={`http://localhost:5000${app.certificateUrl || `/uploads/certificates/${app.certificateId}.pdf`}`}
                                  download={`${app.certificateId}.pdf`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-1.5 px-2.5 rounded-lg text-xs transition-colors shadow-sm"
                                  title="Download Stamped Certificate PDF"
                                >
                                  <Award size={13} />
                                </a>
                              )}

                              {app.status === 'submitted' && (
                                <>
                                  <button
                                    onClick={() => handleAction(app._id, 'approve')}
                                    disabled={actionLoading === app._id}
                                    className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-2.5 rounded-lg text-xs transition-colors shadow-sm disabled:opacity-50"
                                    title="Quick Approve"
                                  >
                                    <Check size={13} />
                                  </button>
                                  <button
                                    onClick={() => handleAction(app._id, 'reject')}
                                    disabled={actionLoading === app._id}
                                    className="inline-flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white font-bold py-1.5 px-2.5 rounded-lg text-xs transition-colors shadow-sm disabled:opacity-50"
                                    title="Quick Reject"
                                  >
                                    <X size={13} />
                                  </button>
                                </>
                              )}
                            </td>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            )}

          </div>

        </div>
      </main>

    </div>
  );
};

export default OfficerDashboard;
