import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from '../api/axios';
import toast from 'react-hot-toast';

export default function VerifyCertificate() {
  const { certificateId: paramCertId } = useParams();
  const navigate = useNavigate();

  const [inputCertId, setInputCertId] = useState(paramCertId || '');
  const [loading, setLoading] = useState(false);
  const [certData, setCertData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const fetchVerification = async (certId) => {
    if (!certId || !certId.trim()) return;
    setLoading(true);
    setErrorMsg('');
    setCertData(null);
    setHasSearched(true);

    try {
      const trimmedId = certId.trim().toUpperCase();
      const res = await axios.get(`/api/officer/verify/${encodeURIComponent(trimmedId)}`);
      if (res.data && res.data.success && res.data.data) {
        setCertData(res.data.data);
      } else {
        setErrorMsg(res.data?.message || 'Certificate verification failed.');
      }
    } catch (err) {
      console.error('Verification error:', err);
      const msg = err.response?.data?.message || 'Certificate not found or revoked in the MAITRI 2.0 repository.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (paramCertId) {
      setInputCertId(paramCertId);
      fetchVerification(paramCertId);
    }
  }, [paramCertId]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!inputCertId.trim()) {
      toast.error('Please enter a Certificate ID');
      return;
    }
    navigate(`/verify/${inputCertId.trim().toUpperCase()}`);
    fetchVerification(inputCertId);
  };

  const loadDemoCert = (demoId) => {
    setInputCertId(demoId);
    navigate(`/verify/${demoId}`);
    fetchVerification(demoId);
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="max-w-4xl mx-auto">
        {/* Header Banner */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 mb-3">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
            Official Anti-Fraud Verification Gateway
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Verify Digital Approval Certificate
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Statutory registry for industrial clearances issued under the Maharashtra Right to Public Services Act (MRTPS Act, 2015) and Maha Parwana Initiative.
          </p>
        </div>

        {/* Search Bar Box */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={inputCertId}
                onChange={(e) => setInputCertId(e.target.value)}
                placeholder="Enter Certificate ID (e.g. MH-2026-MSME-XXXX)"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono text-sm tracking-wider uppercase focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm rounded-xl shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  Verifying...
                </>
              ) : (
                'Verify Authenticity'
              )}
            </button>
          </form>

          {/* Quick Demo Helper */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Demo sample:</span>
            <button
              type="button"
              onClick={() => loadDemoCert('MH-2026-MSME-C51A28')}
              className="font-mono text-blue-600 dark:text-blue-400 hover:underline bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900"
            >
              MH-2026-MSME-C51A28 (Udyam Verified)
            </button>
          </div>
        </div>

        {/* Results Area */}
        {loading && (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-12 h-12 mx-auto rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
            <p className="mt-4 font-semibold text-slate-700 dark:text-slate-300">Contacting Government of Maharashtra Ledger...</p>
            <p className="text-xs text-slate-400">Verifying cryptographic hash and departmental timestamps</p>
          </div>
        )}

        {!loading && certData && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-emerald-300 dark:border-emerald-800/60 overflow-hidden"
          >
            {/* Success Banner */}
            <div className="p-6 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">Official Authenticity Confirmation</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-white text-emerald-800">MRTPS 2015</span>
                  </div>
                  <h2 className="text-xl font-black mt-0.5">GENUINE & OFFICIALLY APPROVED</h2>
                </div>
              </div>

              <div className="text-right sm:text-right">
                <p className="text-xs text-emerald-100 uppercase tracking-wider">Certificate ID</p>
                <p className="font-mono font-bold text-base text-white">{certData.certificateId}</p>
              </div>
            </div>

            {/* Verification Content Body */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Authorized Enterprise</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">{certData.businessName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {certData.industryType} • {certData.sector || 'MSME'} Sector
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Location: {certData.location?.district || 'Mumbai'}, {certData.location?.state || 'Maharashtra'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Approved Statutory Clearance</p>
                  <p className="text-lg font-bold text-blue-700 dark:text-blue-400 mt-1">{certData.approvalName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{certData.department}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Source: {certData.source || 'MAITRI 2.0 Gateway'}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Issue Date</p>
                  <p className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    {new Date(certData.issuedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                    {certData.slaCompliance || 'Maha Parwana 48-Hour Guarantee Met'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Validity Period</p>
                  <p className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    {certData.validUntil 
                      ? new Date(certData.validUntil).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
                      : 'Valid for 3 Years'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Legally binding clearance</p>
                </div>
              </div>

              {/* Anti-Fraud Hash Banner */}
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <span className="font-bold text-blue-900 dark:text-blue-200">Cryptographically Verified Record: </span>
                    <span className="text-blue-800 dark:text-blue-300">
                      Timestamp: {new Date(certData.verifiedAt || Date.now()).toUTCString()}
                    </span>
                  </div>
                </div>

                <a
                  href={`http://localhost:5000${certData.certificateUrl || `/uploads/certificates/${certData.certificateId}.pdf`}`}
                  download={`${certData.certificateId}.pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg shadow transition shrink-0 flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Stamped PDF
                </a>
              </div>
            </div>
          </motion.div>
        )}

        {!loading && hasSearched && errorMsg && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900 rounded-2xl text-center"
          >
            <div className="w-12 h-12 mx-auto rounded-full bg-rose-100 dark:bg-rose-900/60 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-3">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-rose-900 dark:text-rose-200">Certificate Verification Failed</h3>
            <p className="mt-1 text-sm text-rose-700 dark:text-rose-300 max-w-md mx-auto">{errorMsg}</p>
            <div className="mt-4 p-3 bg-white/60 dark:bg-slate-900/60 rounded-xl max-w-lg mx-auto text-xs text-slate-600 dark:text-slate-400">
              <p className="font-semibold text-slate-800 dark:text-slate-200">Anti-Fraud Advisory:</p>
              <p className="mt-0.5">
                If you have been presented with a physical or digital certificate bearing this number, it is not authentic or has been revoked under the MRTPS Act. Please alert the MAITRI vigilance cell.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
