import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import axios from '../api/axios';
import Breadcrumb from '../components/Breadcrumb';
import { SkeletonDashboard } from '../components/Skeletons';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend
} from 'recharts';
import { 
  BarChart3, Clock, CheckCircle2, XCircle, FileText, AlertTriangle,
  ArrowRight, CalendarClock, Activity, ChevronDown, Send, Eye, 
  Landmark, ChevronRight, Award, Compass, ShieldCheck, Check, ShieldAlert
} from 'lucide-react';
import SlaBadge from '../components/SlaBadge';
import CertificateModal from '../components/CertificateModal';

const STATUS_LABELS = {
  not_started: 'Not Started',
  documents_pending: 'Docs Pending',
  submitted: 'Submitted',
  under_review: 'Under Review',
  approved: 'Approved',
  rejected: 'Rejected'
};

const STATUS_COLORS = {
  not_started: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  documents_pending: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  submitted: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  under_review: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  approved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-200 dark:border-red-800'
};

const NEXT_TRANSITIONS = {
  not_started: [{ value: 'documents_pending', label: 'Mark Docs Pending' }],
  documents_pending: [{ value: 'submitted', label: 'Mark as Submitted' }],
  submitted: [{ value: 'under_review', label: 'Mark Under Review' }],
  under_review: [
    { value: 'approved', label: 'Mark Approved' },
    { value: 'rejected', label: 'Mark Rejected' }
  ],
  approved: [],
  rejected: [{ value: 'documents_pending', label: 'Resubmit' }]
};

const Dashboard = () => {
  const { profileId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [schemesPreview, setSchemesPreview] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [selectedCert, setSelectedCert] = useState(null);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  const fetchDashboard = async () => {
    try {
      const res = await axios.get(`/api/dashboard/${profileId}`);
      setData(res.data);
      
      try {
        const schemeRes = await axios.get(`/api/schemes/${profileId}`);
        setSchemesPreview(schemeRes.data.data.matchedSchemes.slice(0, 2));
      } catch(e) {
        // silently ignore scheme preview error
      }

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profileId) {
      localStorage.setItem('udyogsetu_profileId', profileId);
    }
    fetchDashboard();
    // eslint-disable-next-line
  }, [profileId]);

  const handleStatusUpdate = async (approvalId, newStatus) => {
    setUpdating(approvalId);
    try {
      await axios.put(`/api/status/${profileId}/${approvalId}`, { status: newStatus }, {
        headers: { 'x-user-role': 'entrepreneur' }
      });
      toast.success(`Approval status updated to ${newStatus.replace('_', ' ')}`);
      await fetchDashboard();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setUpdating(null);
      setOpenDropdown(null);
    }
  };

  if (loading) return <SkeletonDashboard />;

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 text-center max-w-md w-full">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Error</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">{error}</p>
          <Link to="/" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">Go Home</Link>
        </div>
      </div>
    );
  }

  const { profile, data: summary } = data;

  // Compliance calculations
  const total = summary.totalApprovals || 0;
  const completedOrSubmitted = (summary.approved || 0) + (summary.submitted || 0) + (summary.underReview || 0);
  const completionPercentage = total > 0 ? Math.round(((summary.approved || 0) + (summary.submitted || 0)) / total * 100) : 0;

  // Recharts Donut Data
  const pieData = [
    { name: 'Approved', value: summary.approved, color: '#10b981' },
    { name: 'Submitted / In Review', value: summary.submitted + summary.underReview, color: '#a855f7' },
    { name: 'Docs Pending', value: summary.documentsPending, color: '#3b82f6' },
    { name: 'Not Started', value: summary.notStarted, color: '#94a3b8' },
    { name: 'Rejected', value: summary.rejected, color: '#ef4444' }
  ].filter(item => item.value > 0);

  const summaryCards = [
    { label: 'Total', value: summary.totalApprovals, color: 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300', icon: BarChart3 },
    { label: 'Not Started', value: summary.notStarted, color: 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400', icon: Clock },
    { label: 'Docs Pending', value: summary.documentsPending, color: 'bg-sky-50 dark:bg-sky-950/60 border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300', icon: FileText },
    { label: 'Submitted', value: summary.submitted, color: 'bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300', icon: Send },
    { label: 'Approved', value: summary.approved, color: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300', icon: CheckCircle2 },
    { label: 'Rejected', value: summary.rejected, color: 'bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300', icon: XCircle },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-10 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <Breadcrumb items={[
          { label: 'Roadmap', to: `/roadmap/${profileId}` },
          { label: 'Dashboard' }
        ]} />

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{profile.businessName}</h1>
              <span className="text-xs font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                {profile.industryType}
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              MSME Regulatory Health & Compliance Progress Tracker
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Link 
              to={`/roadmap/${profileId}`}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 text-slate-700 dark:text-slate-200 font-semibold py-2 px-4 rounded-xl transition-all text-sm flex items-center gap-2 shadow-sm"
            >
              <Compass size={16} className="text-blue-500" /> View Roadmap
            </Link>
          </div>
        </div>

        {/* Visual Progress Ring & Analytics Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Progress Ring Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between items-center text-center">
            <div className="w-full text-left mb-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-500" /> Overall Compliance Health
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Approved & submitted approvals / total required</p>
            </div>

            {/* Circular Progress Ring */}
            <div className="relative w-36 h-36 my-3 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background track */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-slate-100 dark:text-slate-800"
                  fill="transparent"
                />
                {/* Colored progress bar */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * completionPercentage) / 100}
                  strokeLinecap="round"
                  className={`${completionPercentage >= 70 ? 'text-emerald-500' : completionPercentage >= 30 ? 'text-blue-500' : 'text-amber-500'} transition-all duration-1000 ease-out`}
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{completionPercentage}%</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Complete</span>
              </div>
            </div>

            <div className="w-full bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
              <span>Verified or Active:</span>
              <span className="font-bold text-slate-900 dark:text-white">{completedOrSubmitted} of {total} clearances</span>
            </div>
          </div>

          {/* Recharts Donut / Status Breakdown */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between md:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 size={18} className="text-blue-500" /> Clearance Status Distribution
              </h3>
              <span className="text-xs text-slate-400">{total} Statutory Approvals</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4">
              <div className="h-44 w-full">
                {pieData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">
                    No data available
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1e293b', 
                          borderRadius: '8px', 
                          border: 'none', 
                          color: '#f8fafc',
                          fontSize: '12px' 
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Custom Legend */}
              <div className="space-y-2 text-xs">
                {pieData.map((entry, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
                      <span className="text-slate-600 dark:text-slate-400 font-medium">{entry.name}</span>
                    </div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              *Approvals are auto-sorted according to the statutory Maha Parwana clearance sequence.
            </div>
          </div>

        </div>

        {/* Summary Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {summaryCards.map(card => (
            <div key={card.label} className={`rounded-xl border p-3.5 ${card.color} shadow-sm transition-transform hover:-translate-y-0.5`}>
              <card.icon size={18} className="mb-1.5 opacity-70" />
              <p className="text-2xl font-extrabold">{card.value}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider mt-0.5 opacity-80">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Main Content Grid: Approvals List & Sidebars */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Table — 2/3 width */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 size={18} className="text-blue-500" /> Mandatory Clearances Checklist
              </h2>
              <span className="text-xs text-slate-400">{summary.approvals.length} tracked</span>
            </div>

            {summary.approvals.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center shadow-sm">
                <FileText className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-slate-600 dark:text-slate-400 font-medium">No clearances tracked yet.</p>
                <Link to={`/roadmap/${profileId}`} className="text-blue-600 dark:text-blue-400 font-semibold mt-3 inline-block hover:underline text-sm">
                  View your Regulatory Roadmap to begin
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {summary.approvals.map(approval => {
                  const transitions = NEXT_TRANSITIONS[approval.status] || [];
                  return (
                    <div 
                      key={approval._id} 
                      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex-grow">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-slate-900 dark:text-white text-base">{approval.approvalName}</h3>
                            {approval.certificateId && (
                              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 font-bold">
                                {approval.certificateId}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium uppercase tracking-wide mt-0.5">{approval.department}</p>
                          
                          {/* Statutory SLA Countdown Timer */}
                          <div className="mt-2.5 max-w-sm">
                            <SlaBadge 
                              deadline={approval.slaDeadline || approval.expectedCompletionDate}
                              submittedAt={approval.submittedAt}
                              status={approval.status}
                              durationHours={approval.slaDurationHours || 48}
                              showProgress={true}
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap sm:self-start mt-2 sm:mt-0">
                          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${STATUS_COLORS[approval.status]}`}>
                            {STATUS_LABELS[approval.status]}
                          </span>

                          {/* Certificate Action when Approved */}
                          {approval.status === 'approved' && (
                            <button
                              onClick={() => {
                                setSelectedCert({
                                  certificateId: approval.certificateId || 'MH-2026-MSME-VERIFIED',
                                  businessName: profile?.businessName,
                                  industryType: profile?.industryType,
                                  sector: profile?.sector,
                                  approvalName: approval.approvalName,
                                  department: approval.department,
                                  issuedAt: approval.certificateIssuedAt || approval.lastUpdatedAt,
                                  validUntil: approval.certificateValidUntil,
                                  certificateUrl: approval.certificateUrl
                                });
                                setIsCertModalOpen(true);
                              }}
                              className="text-xs bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
                            >
                              <Award size={13} className="text-white" />
                              <span>Certificate</span>
                            </button>
                          )}

                          {/* Quick transition dropdown */}
                          {transitions.length > 0 && (
                            <div className="relative">
                              <button
                                onClick={() => setOpenDropdown(openDropdown === approval._id ? null : approval._id)}
                                disabled={updating === approval.approvalId}
                                className="text-xs bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1 transition-colors"
                              >
                                {updating === approval.approvalId ? (
                                  <span className="w-3 h-3 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></span>
                                ) : (
                                  <>Update <ChevronDown size={12} /></>
                                )}
                              </button>
                              {openDropdown === approval._id && (
                                <div className="absolute right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-20 min-w-[170px] overflow-hidden">
                                  {transitions.map(t => (
                                    <button
                                      key={t.value}
                                      onClick={() => handleStatusUpdate(approval.approvalId, t.value)}
                                      className="block w-full text-left px-3.5 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-700 font-semibold text-slate-700 dark:text-slate-200"
                                    >
                                      {t.label}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          <button
                            onClick={() => navigate(`/documents/${profileId}/${approval.approvalId}`)}
                            className="text-xs bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                          >
                            Docs <ArrowRight size={12} />
                          </button>
                        </div>
                      </div>

                      {approval.expectedCompletionDate && (
                        <p className="text-xs text-slate-400 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1">
                          <CalendarClock size={12} /> Statutory Target: {new Date(approval.expectedCompletionDate).toLocaleDateString('en-IN')}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar Area — 1/3 width */}
          <div className="space-y-6">
            
            {/* Statutory Deadlines */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <CalendarClock size={16} className="text-amber-500" /> Statutory Deadlines
              </h3>
              
              {summary.upcomingDeadlines.length === 0 ? (
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl text-center text-xs text-slate-400">
                  No upcoming deadlines in the next 14 days.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {summary.upcomingDeadlines.map((d, i) => {
                    const daysLeft = Math.ceil((new Date(d.expectedCompletionDate) - new Date()) / (1000 * 60 * 60 * 24));
                    const isUrgent = daysLeft <= 3;
                    return (
                      <div key={i} className={`rounded-xl border p-3 ${isUrgent ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800' : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800'}`}>
                        <p className="font-bold text-slate-900 dark:text-white text-xs">{d.approvalName}</p>
                        <p className={`text-[11px] font-semibold mt-0.5 ${isUrgent ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>
                          {daysLeft <= 0 ? 'Overdue!' : `${daysLeft} day${daysLeft > 1 ? 's' : ''} remaining`}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recent Activity Feed */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Activity size={16} className="text-blue-500" /> Recent Activity Log
              </h3>
              
              {summary.recentActivity.length === 0 ? (
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl text-center text-xs text-slate-400">
                  No recent activity logged.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {summary.recentActivity.map((a, i) => (
                    <div key={i} className="bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 p-3">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{a.approvalName}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[a.status]}`}>
                          {STATUS_LABELS[a.status]}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(a.changedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recommended Schemes */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Landmark size={16} className="text-amber-500" /> Recommended Schemes
                </h3>
                <Link 
                  to={`/schemes/${profileId}`}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                >
                  View All <ChevronRight size={13} />
                </Link>
              </div>

              {schemesPreview.length > 0 ? (
                <div className="space-y-2.5">
                  {schemesPreview.map((scheme, i) => (
                    <div key={i} className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs truncate">{scheme.name}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">{scheme.benefitDescription}</p>
                    </div>
                  ))}
                  <Link 
                    to={`/schemes/${profileId}`}
                    className="w-full mt-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-xl text-center text-xs transition-colors block shadow-sm"
                  >
                    Explore Subsidies & Benefits
                  </Link>
                </div>
              ) : (
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl text-center text-xs text-slate-400">
                  <p>Discover government subsidies matched for your profile.</p>
                  <Link 
                    to={`/schemes/${profileId}`}
                    className="text-blue-600 dark:text-blue-400 font-semibold mt-2 inline-block underline"
                  >
                    Browse Schemes
                  </Link>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* Digital Certificate Viewer & Download Modal */}
      <CertificateModal
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        certificate={selectedCert}
      />
    </div>
  );
};

export default Dashboard;
