import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Building2, ShieldCheck, Zap, FileCheck2, ArrowRight, 
  BarChart3, CheckCircle2, Sparkles, Clock, Landmark, Users, 
  ChevronRight, Award, Compass, Layers
} from 'lucide-react';

const LandingPage = () => {
  const savedProfileId = localStorage.getItem('udyogsetu_profileId');
  const storedUser = localStorage.getItem('udyogsetu_user');
  let user = null;
  try {
    if (storedUser) user = JSON.parse(storedUser);
  } catch (e) {}

  const isEntrepreneur = user?.role === 'entrepreneur';
  const isOfficer = user?.role === 'officer';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32">
        {/* Ambient Gradient Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] pointer-events-none opacity-40 dark:opacity-20">
          <div className="absolute top-10 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-[128px]"></div>
          <div className="absolute top-20 right-1/4 w-96 h-96 bg-indigo-500 rounded-full blur-[128px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Top Pill Badge */}
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs sm:text-sm font-semibold mb-6 shadow-sm">
              <Sparkles size={16} className="text-blue-600 dark:text-blue-400" />
              <span>Smart Regulatory Planning • SIH26130 Maha Parwana Gateway</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15] mb-6">
              Empowering MSMEs with <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-primary-600 bg-clip-text text-transparent">
                Frictionless Regulatory Approvals
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p variants={itemVariants} className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
              Eliminate bureaucracy and procedural delays. UdyogSetu uses algorithmic pre-clearance to transform statutory industrial approvals from 45 days down to 48 hours.
            </motion.p>

            {/* CTA Group */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {isOfficer ? (
                <Link
                  to="/officer-dashboard"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-base px-8 py-4 rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-0.5 active:translate-y-0"
                >
                  <ShieldCheck size={18} />
                  <span>Go to Officer Review Desk</span>
                  <ArrowRight size={18} />
                </Link>
              ) : isEntrepreneur ? (
                <>
                  <Link
                    to="/start"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-base px-8 py-4 rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <span>{savedProfileId ? 'Start New Business Intake' : 'Build Your Roadmap'}</span>
                    <ArrowRight size={18} />
                  </Link>

                  {savedProfileId && (
                    <Link
                      to={`/dashboard/${savedProfileId}`}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 text-slate-800 dark:text-slate-200 font-bold text-base px-7 py-4 rounded-xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all"
                    >
                      <BarChart3 size={18} className="text-blue-600 dark:text-blue-400" />
                      <span>Resume Active Dashboard</span>
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link
                    to="/login?role=entrepreneur&redirect=/start"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-base px-8 py-4 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <span>Get Started — Sign In / Register</span>
                    <ArrowRight size={18} />
                  </Link>

                  <Link
                    to="/login?role=officer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 text-slate-800 dark:text-slate-200 font-bold text-base px-7 py-4 rounded-xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all"
                  >
                    <ShieldCheck size={18} className="text-blue-600 dark:text-blue-400" />
                    <span>Officer Portal Login</span>
                  </Link>
                </>
              )}
            </motion.div>

            {/* Quick Stats Pill Row */}
            <motion.div variants={itemVariants} className="mt-14 pt-10 border-t border-slate-200 dark:border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400">48 Hours</p>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Maha Parwana Target</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">100%</p>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Automated OCR Checks</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">0 Overdue</p>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Statutory SLA Compliance</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400">Single Window</p>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">MAITRI 2.0 Integration</p>
              </div>
            </motion.div>

          </motion.div>

        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-20 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">Architected for Speed & Governance</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">Everything You Need for Total Regulatory Compliance</p>
            <p className="mt-4 text-slate-600 dark:text-slate-400">A cognitive platform designed to assist both the entrepreneurial citizen and the government review authority.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="bg-slate-50 dark:bg-slate-950 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all hover:shadow-xl hover:-translate-y-1 group">
              <div className="w-14 h-14 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Compass size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Dynamic Regulatory Roadmap</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
                Enter your industry type, scale, and investment size to generate an sequenced, step-by-step clearance roadmap tailored to Maharashtra regulations.
              </p>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                Custom Stage Sequencing <ChevronRight size={14} />
              </span>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-50 dark:bg-slate-950 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition-all hover:shadow-xl hover:-translate-y-1 group">
              <div className="w-14 h-14 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FileCheck2 size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Cognitive OCR Document Audit</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
                Automated pre-verification scans Aadhaar, PAN, and technical plans. Detects layout defects and missing seals before submission, eliminating rejection loops.
              </p>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                Zero-Delay Pre-Screening <ChevronRight size={14} />
              </span>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-50 dark:bg-slate-950 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all hover:shadow-xl hover:-translate-y-1 group">
              <div className="w-14 h-14 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Officer Review & SLA Gateway</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
                Department officers receive pre-audited applications with complete document viewers, automated warning badges, and single-click statutory approval actions.
              </p>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                Statutory 48-Hour SLA <ChevronRight size={14} />
              </span>
            </div>

          </div>

        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">Simplified 3-Step Process</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">From Profile to Approved Certificate</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 relative z-10 shadow-sm">
              <span className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-lg flex items-center justify-center mb-6">1</span>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Create Business Intake Profile</h4>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Provide high-level manufacturing parameters, MSME category, and state jurisdiction.</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 relative z-10 shadow-sm">
              <span className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold text-lg flex items-center justify-center mb-6">2</span>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Upload & Verify Documents</h4>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Automated OCR engines extract key fields and validate documents in real-time before submission.</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 relative z-10 shadow-sm">
              <span className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold text-lg flex items-center justify-center mb-6">3</span>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Department Review & Clearance</h4>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Department officer reviews pre-verified dossiers and issues the statutory approval certificate.</p>
            </div>

          </div>

          <div className="mt-16 text-center">
            <Link
              to={isOfficer ? "/officer-dashboard" : isEntrepreneur ? "/start" : "/login?role=entrepreneur&redirect=/start"}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-8 rounded-xl shadow-md transition-all hover:scale-105"
            >
              <span>{isOfficer ? "Go to Officer Review Desk" : isEntrepreneur ? "Begin Your Regulatory Intake Now" : "Sign In & Begin Business Intake"}</span>
              <ArrowRight size={18} />
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
};

export default LandingPage;
