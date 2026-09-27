import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import axios from '../api/axios';
import { Lightbulb, Info, Landmark, CheckCircle, BrainCircuit, ExternalLink } from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';

const SchemesView = () => {
  const { profileId } = useParams();
  const navigate = useNavigate();
  
  const [data, setData] = useState({ matchedSchemes: [], allSchemes: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!profileId) {
      navigate('/');
      return;
    }

    localStorage.setItem('udyogsetu_profileId', profileId);

    const fetchSchemes = async () => {
      try {
        const response = await axios.get(`/api/schemes/${profileId}`);
        setData(response.data.data);
      } catch (err) {
        setError('Failed to fetch schemes. Please try again later.');
        toast.error('Could not load subsidy schemes');
      } finally {
        setLoading(false);
      }
    };

    fetchSchemes();
  }, [profileId, navigate]);

  const handleAskAI = (schemeName) => {
    const question = `Am I eligible for ${schemeName} given my business profile?`;
    window.dispatchEvent(new CustomEvent('open-chat', { detail: question }));
    toast.success('Consulting AI Assistant...');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={[{ label: 'Dashboard', to: `/dashboard/${profileId}` }, { label: 'Schemes' }]} />
        <div className="mb-8 mt-6 animate-pulse">
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 animate-pulse h-48">
              <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mb-6"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full mb-3"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mb-6"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-8 text-center text-red-600 dark:text-red-400 font-semibold">
        {error}
      </div>
    );
  }

  const hasMatches = data.matchedSchemes.length > 0;
  const schemesToDisplay = hasMatches ? data.matchedSchemes : data.allSchemes;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors">
      <Breadcrumb items={[{ label: 'Dashboard', to: `/dashboard/${profileId}` }, { label: 'Recommended Schemes' }]} />

      {/* Banner */}
      <div className="mt-6 mb-8 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-blue-800/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-3">
            <Landmark className="text-blue-300" size={32} />
            Government Subsidies & Schemes
          </h1>
          <p className="mt-2 text-slate-300 text-sm max-w-2xl leading-relaxed">
            {hasMatches 
              ? "Based on your MSME industry type, sector classification, and investment size, we've matched these specific state & central incentive programs."
              : "Showing all available government incentive schemes you can explore for industrial scaling."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {schemesToDisplay.map((scheme, idx) => (
          <motion.div 
            key={scheme._id || idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col hover:shadow-lg transition-all"
          >
            <div className="flex justify-between items-start mb-4 gap-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">{scheme.name}</h3>
              <span className="bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800 flex-shrink-0">
                {scheme.department}
              </span>
            </div>
            
            <div className="space-y-3.5 flex-grow text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-1 text-xs">
                  <Info size={15} className="text-blue-600 dark:text-blue-400" /> Eligibility Criteria:
                </p>
                <p className="leading-relaxed text-xs">{scheme.eligibilityCriteria}</p>
              </div>
              
              <div className="p-1">
                <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-1 text-xs">
                  <CheckCircle size={15} className="text-emerald-500" /> Key Benefits & Subsidies:
                </p>
                <p className="leading-relaxed text-xs">{scheme.benefitDescription}</p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <button
                onClick={() => handleAskAI(scheme.name)}
                className="text-blue-600 dark:text-blue-400 font-bold hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1.5 text-xs transition-colors"
              >
                <BrainCircuit size={16} />
                Ask AI Assistant about eligibility
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SchemesView;
