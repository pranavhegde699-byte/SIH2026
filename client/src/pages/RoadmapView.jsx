import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from '../api/axios';
import Breadcrumb from '../components/Breadcrumb';
import { SkeletonRoadmap } from '../components/Skeletons';
import { 
  ArrowLeft, CheckCircle2, FileText, AlertTriangle, 
  Building, MapPin, BarChart3, ChevronRight, Layers, Compass 
} from 'lucide-react';

const RoadmapView = () => {
  const { profileId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (profileId) {
      localStorage.setItem('udyogsetu_profileId', profileId);
    }
    const fetchRoadmap = async () => {
      try {
        const response = await axios.get(`/api/roadmap/${profileId}`);
        setData(response.data);
      } catch (err) {
        if (err.message === 'Network Error' || !err.response) {
          setError('Service unavailable. Cannot connect to the server.');
        } else {
          setError(err.response?.data?.message || 'Failed to fetch roadmap.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmap();
  }, [profileId]);

  if (loading) return <SkeletonRoadmap />;

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 text-slate-900 dark:text-white">
        <div className="bg-white dark:bg-slate-900 text-center p-8 rounded-2xl max-w-lg w-full shadow-xl border border-slate-200 dark:border-slate-800">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Oops! Something went wrong.</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">{error}</p>
          <button 
            onClick={() => navigate('/start')} 
            className="bg-blue-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors w-full shadow-md"
          >
            Start New Profile
          </button>
        </div>
      </div>
    );
  }

  const { profile, matchedApprovals, roadmapStages } = data;
  const isFallback = matchedApprovals.length > 0 && 
                     matchedApprovals.every(a => ['Udyam Registration', 'GST Registration', 'Trade License'].includes(a.name));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-10 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <Breadcrumb items={[{ label: profile.businessName, to: '/start' }, { label: 'Roadmap' }]} />

        {/* Header Profile Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                  Custom Regulatory Roadmap
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{profile.businessName}</h1>
              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 font-medium">
                <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full flex items-center">
                  <Building size={14} className="mr-1.5 text-blue-500" /> {profile.industryType} {profile.sector ? `(${profile.sector})` : ''}
                </span>
                {profile.location?.state && (
                  <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full flex items-center">
                    <MapPin size={14} className="mr-1.5 text-emerald-500" /> {profile.location.state}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex flex-col sm:items-end gap-2">
              <Link 
                to={`/dashboard/${profileId}`}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl transition-all text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-blue-500/20"
              >
                <BarChart3 size={16} /> Status Dashboard
              </Link>
              <p className="text-[11px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                ID: {profile._id}
              </p>
            </div>
          </div>
        </div>

        {/* Fallback Warning */}
        {isFallback && (
          <div className="bg-amber-50 dark:bg-amber-950/60 border-l-4 border-amber-500 p-5 rounded-r-2xl shadow-sm text-amber-900 dark:text-amber-200">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-xs font-bold uppercase tracking-wider mb-1">Standard Regulatory Baseline</h3>
                <p className="text-xs leading-relaxed">
                  Showing mandatory base statutory compliances for this business configuration under Maharashtra regulations.
                </p>
              </div>
            </div>
          </div>
        )}

        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">Your Action Plan</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Complete these approval stages sequentially to achieve full statutory clearance.</p>
        </div>
        
        {roadmapStages.length === 0 ? (
           <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-sm">
             <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
             <p className="text-lg font-bold text-slate-900 dark:text-white">You're all set!</p>
             <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">No mandatory approvals were found for this profile configuration.</p>
           </div>
        ) : (
          <div className="relative border-l-2 border-blue-200 dark:border-blue-900 ml-4 md:ml-6 space-y-12 pb-10">
            {roadmapStages.map((stage, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative pl-8 md:pl-12"
              >
                {/* Timeline Dot */}
                <span className="absolute -left-[17px] top-1 flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-slate-900 border-4 border-blue-500 text-blue-600 dark:text-blue-400 shadow-sm ring-4 ring-white dark:ring-slate-950">
                  <span className="text-xs font-bold">{index + 1}</span>
                </span>
                
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                  <span>Stage {index + 1}</span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
                    {stage.length} clearance{stage.length > 1 ? 's' : ''}
                  </span>
                </h3>
                
                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {stage.map((approval) => (
                    <div 
                      key={approval._id} 
                      className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm hover:shadow-lg transition-all border border-slate-200 dark:border-slate-800 p-6 flex flex-col h-full group relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-1 h-full bg-blue-600 transform origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-300"></div>
                      
                      <div className="flex justify-between items-start mb-2 gap-2">
                        <h4 className="font-bold text-slate-900 dark:text-white text-base leading-snug">{approval.name}</h4>
                        {approval.source && (
                          <span className={`flex-shrink-0 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                            approval.source === 'MAITRI' ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300' : 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                          }`}>
                            {approval.source}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-bold mb-3 uppercase tracking-wide">{approval.department}</p>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-6 flex-grow leading-relaxed">{approval.description}</p>
                      
                      <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                        <button 
                          onClick={() => navigate(`/documents/${profile._id}/${approval._id}`)}
                          className="w-full flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold py-2.5 px-4 rounded-xl transition-colors text-xs sm:text-sm border border-slate-200 dark:border-slate-700 hover:border-blue-300"
                        >
                          <FileText size={15} /> 
                          <span>View Documents Required</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default RoadmapView;
