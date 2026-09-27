import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from '../api/axios';
import { 
  ShieldCheck, FileText, CheckCircle2, XCircle, Clock, ArrowLeft, 
  ExternalLink, Eye, AlertTriangle, Building, MapPin, Check, X, 
  Download, FileImage, Maximize2, Send, Award
} from 'lucide-react';
import SlaBadge from '../components/SlaBadge';

const OfficerApplicationDetail = () => {
  const { statusId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [reviewModal, setReviewModal] = useState({ open: false, action: null });
  const [reviewNote, setReviewNote] = useState('');
  const [previewImage, setPreviewImage] = useState(null);

  const backendBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

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
    fetchApplication();
    // eslint-disable-next-line
  }, [statusId]);

  const fetchApplication = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/officer/applications/${statusId}`);
      setData(res.data.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load application details.');
      toast.error('Could not load application details');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewAction = async (status) => {
    try {
      setActionLoading(true);
      await axios.put(`/api/officer/applications/${statusId}/review`, {
        status,
        reviewNotes: reviewNote
      }, {
        headers: { 'x-user-role': 'officer' }
      });
      toast.success(`Application marked as ${status} successfully!`);
      setReviewModal({ open: false, action: null });
      setReviewNote('');
      await fetchApplication();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update review status.');
    } finally {
      setActionLoading(false);
    }
  };

  const getFullFileUrl = (fileUrl) => {
    if (!fileUrl) return '';
    return fileUrl.startsWith('http') ? fileUrl : `${backendBase}${fileUrl}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 text-slate-900 dark:text-white">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400 font-semibold text-sm">Loading Application Dossier...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-900 dark:text-white">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 text-center max-w-md w-full">
          <AlertTriangle className="h-14 w-14 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">{error || 'Application not found'}</p>
          <Link to="/officer-dashboard" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl transition-colors shadow-sm text-sm">
            Return to Officer Desk
          </Link>
        </div>
      </div>
    );
  }

  const { application, documents } = data;
  const business = application.businessProfileId || {};
  const approval = application.approvalId || {};

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link
            to="/officer-dashboard"
            className="inline-flex items-center text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-2 rounded-xl shadow-sm transition-colors"
          >
            <ArrowLeft size={16} className="mr-2 text-blue-500" /> Back to Review Inbox
          </Link>
          <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
            Dossier ID: {application._id}
          </span>
        </div>

        {/* Application Header Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-6 mb-6">
            <div>
              <div className="flex items-center gap-2.5 mb-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {business.businessName || 'Business Profile'}
                </h1>
                <span className="bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-blue-200 dark:border-blue-800">
                  PAN: {business.panNumber || 'NOT SPECIFIED'}
                </span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                  application.status === 'approved' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' :
                  application.status === 'rejected' ? 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300' :
                  application.status === 'submitted' ? 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300' :
                  'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                }`}>
                  {application.status?.replace('_', ' ')}
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Application for <strong className="text-slate-900 dark:text-white">{approval.name}</strong> • Department: <strong className="text-blue-600 dark:text-blue-400">{approval.department}</strong>
              </p>

              {/* Statutory SLA Countdown (P2) */}
              <div className="mt-3 max-w-sm">
                <SlaBadge 
                  deadline={application.slaDeadline || application.expectedCompletionDate}
                  submittedAt={application.submittedAt}
                  status={application.status}
                  durationHours={application.slaDurationHours || 48}
                  showProgress={true}
                />
              </div>

              {/* Digital Certificate Badge when Approved (P2) */}
              {application.status === 'approved' && application.certificateId && (
                <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Award size={18} className="text-amber-600 dark:text-amber-400" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-amber-800 dark:text-amber-300">Official Certificate Issued</p>
                      <p className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">{application.certificateId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`/verify/${application.certificateId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold"
                    >
                      Verify Authenticity
                    </a>
                    <a
                      href={`http://localhost:5000${application.certificateUrl || `/uploads/certificates/${application.certificateId}.pdf`}`}
                      download={`${application.certificateId}.pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-1.5 px-3 rounded-lg text-xs transition-colors shadow-sm"
                    >
                      <Download size={13} /> PDF
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Officer Actions */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {application.status !== 'approved' && (
                <button
                  onClick={() => setReviewModal({ open: true, action: 'approve' })}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
                >
                  <Check size={16} /> Approve
                </button>
              )}
              {application.status !== 'rejected' && (
                <button
                  onClick={() => setReviewModal({ open: true, action: 'reject' })}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-red-500/20 flex items-center gap-1.5"
                >
                  <X size={16} /> Reject
                </button>
              )}
              {application.status === 'submitted' && (
                <button
                  onClick={() => handleReviewAction('under_review')}
                  disabled={actionLoading}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5"
                >
                  <Clock size={16} /> Mark Under Review
                </button>
              )}
            </div>
          </div>

          {/* Business Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs sm:text-sm">
            <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 text-xs block mb-1">Industry Type</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{business.industryType || 'N/A'}</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 text-xs block mb-1">MSME Classification</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{business.sector || 'N/A'}</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 text-xs block mb-1">Jurisdiction / Location</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                {business.location?.district ? `${business.location.district}, ` : ''}{business.location?.state || 'Maharashtra'}
              </span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 text-xs block mb-1">Submission Date</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {application.submittedAt ? new Date(application.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently'}
              </span>
            </div>
          </div>

          {application.notes && (
            <div className="mt-4 p-3.5 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-2xl text-xs sm:text-sm text-amber-900 dark:text-amber-200">
              <strong>Official Remarks:</strong> {application.notes}
            </div>
          )}
        </div>

        {/* Uploaded Documents Dossier */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="text-blue-500" size={22} /> Uploaded Documents Dossier ({documents.length})
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Review attached files, algorithmic OCR checks, and statutory authenticity validation.
              </p>
            </div>
          </div>

          {documents.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 text-center">
              <AlertTriangle className="mx-auto text-slate-400 mb-3" size={40} />
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No Documents Found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">No uploaded files are associated with this application record.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {documents.map((doc, index) => {
                const fullUrl = getFullFileUrl(doc.fileUrl);
                return (
                  <div key={doc._id || index} className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                    
                    {/* Document Header */}
                    <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-950/50">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900 dark:text-white">{doc.documentType}</h3>
                          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                            doc.uploadStatus === 'verified' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' :
                            doc.uploadStatus === 'rejected' ? 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300' :
                            'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                          }`}>
                            {doc.uploadStatus}
                          </span>
                        </div>
                        {doc.fileName && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">File: {doc.fileName}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {fullUrl && (
                          <a
                            href={fullUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-blue-500 text-slate-700 dark:text-slate-200 text-xs font-bold px-3 py-2 rounded-xl transition-colors shadow-sm"
                          >
                            <ExternalLink size={14} /> Open in New Tab
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Document Content & Viewer */}
                    <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                      
                      {/* Left: OCR & Validation Details */}
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Algorithmic Verification Result</h4>
                        
                        {doc.validationIssues && doc.validationIssues.length > 0 ? (
                          <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-2xl p-4">
                            <p className="text-xs font-bold text-red-800 dark:text-red-300 flex items-center mb-1">
                              <AlertTriangle size={14} className="mr-1.5" /> Automated Verification Warnings
                            </p>
                            <ul className="list-disc list-inside text-xs text-red-700 dark:text-red-300 space-y-1">
                              {doc.validationIssues.map((issue, idx) => (
                                <li key={idx}>{issue}</li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-3.5 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                            <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                            <span>Passed algorithmic layout & data authenticity verification.</span>
                          </div>
                        )}

                        {doc.extractedFields && Object.keys(doc.extractedFields).length > 0 && (
                          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2.5 pb-1 border-b border-slate-100 dark:border-slate-800">
                              OCR Extracted Identity Fields
                            </p>
                            <div className="space-y-1.5">
                              {Object.entries(doc.extractedFields).map(([k, v]) => (
                                <div key={k} className="flex justify-between text-xs">
                                  <span className="text-slate-500 capitalize">{k.replace(/([A-Z])/g, ' $1')}:</span>
                                  <span className="font-semibold text-slate-900 dark:text-white">{String(v)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <p className="text-[11px] text-slate-400">
                          Uploaded Timestamp: {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleString('en-IN') : 'N/A'}
                        </p>
                      </div>

                      {/* Right: Embedded Viewer */}
                      <div className="bg-slate-100 dark:bg-slate-950 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 flex flex-col items-center">
                        <div className="w-full flex justify-between items-center mb-2 px-1 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                          <span>Live Document Viewer</span>
                          {doc.isImage && (
                            <span className="text-[11px] text-blue-500">Click image to enlarge</span>
                          )}
                        </div>

                        {doc.isImage ? (
                          <div 
                            className="relative group cursor-pointer w-full bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 flex items-center justify-center max-h-[320px]"
                            onClick={() => setPreviewImage(fullUrl)}
                          >
                            <img 
                              src={fullUrl} 
                              alt={doc.documentType} 
                              className="w-full h-auto max-h-[320px] object-contain transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-2">
                              <Maximize2 size={18} /> Enlarge Image
                            </div>
                          </div>
                        ) : doc.isPdf ? (
                          <div className="w-full">
                            <iframe 
                              src={`${fullUrl}#toolbar=0`} 
                              title={doc.documentType} 
                              className="w-full h-[320px] rounded-xl border border-slate-300 dark:border-slate-700 bg-white"
                            />
                            <a
                              href={fullUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 w-full inline-flex items-center justify-center gap-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold py-2 px-4 rounded-xl text-xs transition-colors shadow-sm"
                            >
                              <FileText size={14} className="text-blue-500" /> Open Fullscreen PDF
                            </a>
                          </div>
                        ) : (
                          <div className="w-full h-[200px] flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 p-6 text-center">
                            <FileText size={36} className="text-slate-400 mb-2" />
                            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{doc.fileName || 'Document File'}</p>
                            {fullUrl && (
                              <a
                                href={fullUrl}
                                download
                                className="mt-3 inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold text-xs hover:underline"
                              >
                                <Download size={14} /> Download File
                              </a>
                            )}
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Review Modal */}
      {reviewModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1.5">
              {reviewModal.action === 'approve' ? 'Approve Statutory Clearance' : 'Reject Application Dossier'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-4">
              {reviewModal.action === 'approve' 
                ? 'Confirm approval for this compliance certificate. This will notify the citizen and advance their regulatory roadmap.' 
                : 'Provide a reason for rejection so the citizen can correct discrepancies and resubmit.'}
            </p>

            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Officer Review Remarks {reviewModal.action === 'reject' && <span className="text-red-500">*</span>}
              </label>
              <textarea
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder={reviewModal.action === 'approve' ? "Approved after verification of technical layout and fire NOC standards." : "State specific defects or missing clearances..."}
                rows="4"
                className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setReviewModal({ open: false, action: null })}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading || (reviewModal.action === 'reject' && !reviewNote.trim())}
                onClick={() => handleReviewAction(reviewModal.action === 'approve' ? 'approved' : 'rejected')}
                className={`px-5 py-2 text-xs sm:text-sm font-bold text-white rounded-xl transition-colors shadow-sm disabled:opacity-50 ${
                  reviewModal.action === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {actionLoading ? 'Submitting...' : `Confirm ${reviewModal.action === 'approve' ? 'Approval' : 'Rejection'}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Enlarge Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 cursor-pointer"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-2xl p-2 border border-slate-200 dark:border-slate-800" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full p-2 z-10 transition-colors"
            >
              <X size={18} />
            </button>
            <img src={previewImage} alt="Document Enlarge" className="w-full h-auto max-h-[85vh] object-contain rounded-xl" />
          </div>
        </div>
      )}

    </div>
  );
};

export default OfficerApplicationDetail;
