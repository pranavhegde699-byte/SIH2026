import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function CertificateModal({ isOpen, onClose, certificate }) {
  if (!isOpen || !certificate) return null;

  const {
    certificateId,
    businessName = 'Enterprise',
    industryType = 'MSME',
    sector = 'Small',
    approvalName = 'Statutory Approval',
    department = 'Directorate of Industries',
    issuedAt = new Date(),
    validUntil = new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000),
    certificateUrl
  } = certificate;

  const formattedIssued = new Date(issuedAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const formattedValid = new Date(validUntil).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const verifyUrl = `${window.location.origin}/verify/${certificateId}`;

  const copyCertId = () => {
    navigator.clipboard.writeText(certificateId);
    toast.success('Certificate ID copied to clipboard!');
  };

  const handlePrint = () => {
    window.print();
  };

  const downloadPdfUrl = certificateUrl 
    ? `http://localhost:5000${certificateUrl}` 
    : `http://localhost:5000/uploads/certificates/${certificateId}.pdf`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
              <div>
                <h3 className="text-sm font-bold tracking-wide uppercase">Official Digital Approval Certificate</h3>
                <p className="text-xs text-slate-400">Maharashtra Parwana • MRTPS Act 2015 Compliant</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Close Modal"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Certificate Canvas / Container */}
          <div className="p-6 md:p-8">
            <div className="relative p-6 md:p-8 rounded-xl border-4 border-amber-600/80 bg-gradient-to-br from-amber-50/40 via-white to-amber-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 shadow-inner">
              {/* Inner Decorative Border */}
              <div className="absolute inset-2 border border-blue-900/30 dark:border-blue-500/30 pointer-events-none rounded-lg"></div>

              {/* Watermark */}
              <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
                <p className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white rotate-[-20deg] uppercase tracking-widest text-center">
                  MAITRI 2.0 • GOVT OF MAHARASHTRA
                </p>
              </div>

              {/* Certificate Header */}
              <div className="relative z-10 text-center mb-6">
                <p className="text-xs font-bold text-amber-700 dark:text-amber-500 tracking-widest uppercase">
                  Government of Maharashtra
                </p>
                <h2 className="text-xl md:text-2xl font-black text-blue-950 dark:text-blue-400 tracking-tight mt-1">
                  DIRECTORATE OF INDUSTRIES & MAITRI 2.0
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Single Window Clearance Gateway • Under Maharashtra Right to Public Services Act (MRTPS Act, 2015)
                </p>

                <div className="mt-4 inline-block px-6 py-2 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold text-sm uppercase tracking-wider rounded-md shadow">
                  Certificate of Statutory Approval
                </div>
              </div>

              {/* Certificate ID Badge */}
              <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 p-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur rounded-lg border border-slate-200 dark:border-slate-700 mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">CERTIFICATE NO:</span>
                  <span className="font-mono text-sm font-bold text-blue-700 dark:text-blue-400">{certificateId}</span>
                  <button 
                    onClick={copyCertId}
                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500 transition"
                    title="Copy Certificate ID"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-300 dark:border-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  LEGALLY BINDING & VERIFIED
                </div>
              </div>

              {/* Main Content Details Grid */}
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-6">
                <div className="p-3 bg-white/70 dark:bg-slate-800/50 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                  <p className="text-xs font-semibold text-slate-400 uppercase">Enterprise / Entity</p>
                  <p className="font-bold text-slate-900 dark:text-white text-base mt-0.5">{businessName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{industryType} • {sector} Sector</p>
                </div>

                <div className="p-3 bg-white/70 dark:bg-slate-800/50 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                  <p className="text-xs font-semibold text-slate-400 uppercase">Statutory Clearance</p>
                  <p className="font-bold text-blue-900 dark:text-blue-300 text-base mt-0.5">{approvalName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{department}</p>
                </div>

                <div className="p-3 bg-white/70 dark:bg-slate-800/50 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                  <p className="text-xs font-semibold text-slate-400 uppercase">Date of Approval</p>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{formattedIssued}</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Maha Parwana 48-Hour Guarantee Met</p>
                </div>

                <div className="p-3 bg-white/70 dark:bg-slate-800/50 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                  <p className="text-xs font-semibold text-slate-400 uppercase">Validity Term</p>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{formattedValid}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">3 Years from Date of Issuance</p>
                </div>
              </div>

              {/* QR Code and Disclaimer */}
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
                <div className="max-w-md text-left">
                  <p className="font-semibold text-slate-700 dark:text-slate-300">Statutory Notice:</p>
                  <p className="mt-0.5">
                    This digital clearance certificate is legally valid under the MRTPS Act 2015. 
                    Any person or authority may verify its validity online by scanning the QR code or visiting the public verification portal.
                  </p>
                </div>

                <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${encodeURIComponent(verifyUrl)}`}
                    alt="QR Verification"
                    className="w-16 h-16 rounded"
                  />
                  <div className="text-left">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Scan to Verify</p>
                    <p className="text-xs font-bold text-blue-700 dark:text-blue-400 mt-0.5">MAITRI 2.0</p>
                    <p className="text-[10px] text-slate-500">Anti-Fraud Ledger</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
            <Link
              to={`/verify/${certificateId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Open Public Anti-Fraud Page
            </Link>

            <div className="flex items-center gap-3">
              <button
                onClick={handlePrint}
                className="px-4 py-2 text-sm font-semibold rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              >
                Print
              </button>
              
              <a
                href={downloadPdfUrl}
                download={`${certificateId}.pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 rounded-xl shadow-md transition"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Stamped PDF
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
