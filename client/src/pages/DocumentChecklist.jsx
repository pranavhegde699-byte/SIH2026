import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from '../api/axios';
import Breadcrumb from '../components/Breadcrumb';
import { SkeletonChecklist } from '../components/Skeletons';
import { 
  Upload, FileText, CheckCircle2, AlertCircle, Clock, XCircle, 
  FileImage, FileDown, Info, ExternalLink, Send, ArrowRight, ShieldCheck
} from 'lucide-react';

const DocumentChecklist = () => {
  const { profileId, approvalId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [autoFillData, setAutoFillData] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  
  // Upload states
  const [uploadingDocType, setUploadingDocType] = useState(null);
  const [uploadError, setUploadError] = useState('');

  const backendBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  const fetchChecklist = async () => {
    try {
      const response = await axios.get(`/api/documents/checklist/${profileId}/${approvalId}`);
      setData(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch checklist.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAutoFill = async () => {
    try {
      const res = await axios.get(`/api/autofill/${profileId}`);
      if (res.data.data && Object.keys(res.data.data).length > 0) {
        setAutoFillData(res.data.data);
      }
    } catch (err) {
      // Non-critical — silently ignore
    }
  };

  useEffect(() => {
    if (profileId) {
      localStorage.setItem('udyogsetu_profileId', profileId);
    }
    fetchChecklist();
    fetchAutoFill();
    // eslint-disable-next-line
  }, [profileId, approvalId]);

  const handleFileUpload = async (e, documentType) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      const msg = `File ${file.name} is too large. Max 5MB allowed.`;
      setUploadError(msg);
      toast.error(msg);
      return;
    }
    
    if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
      const msg = `File ${file.name} is unsupported. Only PDF/JPG/PNG.`;
      setUploadError(msg);
      toast.error(msg);
      return;
    }

    setUploadError('');
    setUploadingDocType(documentType);

    const formData = new FormData();
    formData.append('document', file);
    formData.append('businessProfileId', profileId);
    formData.append('approvalId', approvalId);
    formData.append('documentType', documentType);

    try {
      await axios.post('/api/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(`${documentType} uploaded and verified!`);
      await fetchChecklist();
      await fetchAutoFill(); // Refresh auto-fill after new upload
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to upload document.';
      setUploadError(msg);
      toast.error(msg);
    } finally {
      setUploadingDocType(null);
      e.target.value = null;
    }
  };

  const handleSubmitApplication = async () => {
    try {
      setSubmitting(true);
      await axios.put(`/api/status/${profileId}/${approvalId}`, { status: 'submitted' }, {
        headers: { 'x-user-role': 'entrepreneur' }
      });
      toast.success('Application submitted to Department Officer!');
      setSubmitMessage('Application successfully submitted to the Department Officer for statutory review.');
      await fetchChecklist();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'uploaded':
        return <span className="flex items-center text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800"><FileDown size={14} className="mr-1"/> Uploaded</span>;
      case 'verified':
        return <span className="flex items-center text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800"><CheckCircle2 size={14} className="mr-1"/> Verified</span>;
      case 'rejected':
        return <span className="flex items-center text-xs font-bold bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 px-3 py-1 rounded-full border border-red-200 dark:border-red-800"><XCircle size={14} className="mr-1"/> Rejected</span>;
      default:
        return <span className="flex items-center text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700"><Clock size={14} className="mr-1"/> Pending</span>;
    }
  };

  if (loading) return <SkeletonChecklist />;

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 text-center max-w-md w-full">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Error</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">{error}</p>
          <Link to={`/roadmap/${profileId}`} className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
            Return to Roadmap
          </Link>
        </div>
      </div>
    );
  }

  const allDocumentsUploaded = data.checklist.every(d => ['uploaded', 'verified'].includes(d.uploadStatus));
  const isSubmittedOrLater = ['submitted', 'under_review', 'approved'].includes(data.applicationStatus);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-10 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <Breadcrumb items={[
          { label: 'Roadmap', to: `/roadmap/${profileId}` },
          { label: data.approvalName }
        ]} />

        {/* Header */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
              Clearance Dossier
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1 mb-1">{data.approvalName}</h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
              Upload statutory verification documents required under Maharashtra single window regulations.
            </p>
          </div>

          {data.applicationStatus && (
            <div className="bg-slate-50 dark:bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Application Status</span>
              <span className={`font-bold capitalize text-sm ${
                data.applicationStatus === 'approved' ? 'text-emerald-500' :
                data.applicationStatus === 'submitted' ? 'text-purple-500' :
                data.applicationStatus === 'under_review' ? 'text-amber-500' : 'text-blue-500'
              }`}>
                {data.applicationStatus.replace('_', ' ')}
              </span>
            </div>
          )}
        </div>

        {/* Auto-fill Banner */}
        {autoFillData && (
          <div className="bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <Info size={18} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-blue-900 dark:text-blue-200 uppercase tracking-wider mb-2">
                  Pre-filled Data from Previous Uploads
                </h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(autoFillData).map(([key, value]) => (
                    <span key={key} className="bg-white dark:bg-slate-900 text-xs px-2.5 py-1 rounded-lg border border-blue-100 dark:border-blue-800/80 text-slate-700 dark:text-slate-300">
                      <span className="text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}: </span>
                      <span className="font-semibold text-slate-900 dark:text-white">{value}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {submitMessage && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-2xl flex items-center gap-3">
            <CheckCircle2 size={24} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <div>
              <p className="font-bold text-sm">{submitMessage}</p>
              <Link to={`/dashboard/${profileId}`} className="text-xs underline font-semibold text-emerald-900 dark:text-emerald-200 mt-0.5 inline-block">
                View status on your Dashboard →
              </Link>
            </div>
          </div>
        )}

        {uploadError && (
          <div className="p-4 bg-red-50 dark:bg-red-950/60 border-l-4 border-red-500 text-red-700 dark:text-red-300 rounded-r-2xl flex items-start text-xs">
            <AlertCircle size={18} className="mr-2 flex-shrink-0 mt-0.5" />
            <p className="font-semibold">{uploadError}</p>
          </div>
        )}

        <div className="space-y-4">
          {data.checklist.map((doc, index) => {
            const isPending = doc.uploadStatus === 'pending';
            const isRejected = doc.uploadStatus === 'rejected';
            const fullDocUrl = doc.fileUrl ? (doc.fileUrl.startsWith('http') ? doc.fileUrl : `${backendBase}${doc.fileUrl}`) : null;

            return (
              <div key={index} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                      <FileText className="text-blue-500" size={22} />
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">{doc.documentType}</h3>
                      {getStatusBadge(doc.uploadStatus)}
                    </div>
                    {doc.fileName && (
                       <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center mt-1 font-mono">
                         <FileImage size={13} className="mr-1 text-slate-400" /> {doc.fileName}
                       </p>
                    )}
                  </div>
                  
                  <div className="flex-shrink-0 flex items-center gap-2">
                    {/* View uploaded file button */}
                    {fullDocUrl && (
                      <a
                        href={fullDocUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-xs font-semibold bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 py-2 px-3 rounded-xl transition-colors"
                      >
                        <ExternalLink size={13} className="mr-1" /> View File
                      </a>
                    )}

                    {(isPending || isRejected) ? (
                      <div className="relative">
                        <input 
                          type="file" 
                          id={`file-${index}`} 
                          className="hidden" 
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload(e, doc.documentType)}
                          disabled={uploadingDocType === doc.documentType}
                        />
                        <label 
                          htmlFor={`file-${index}`}
                          className={`cursor-pointer inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl transition-all shadow-sm text-xs ${uploadingDocType === doc.documentType ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                          {uploadingDocType === doc.documentType ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1.5"></div>
                              <span>Analyzing & Uploading...</span>
                            </>
                          ) : (
                            <>
                              <Upload size={14} className="mr-1.5" /> 
                              <span>{isRejected ? 'Re-Upload Document' : 'Upload Document'}</span>
                            </>
                          )}
                        </label>
                      </div>
                    ) : (
                      <span className="inline-flex items-center justify-center bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold py-2 px-3.5 rounded-xl text-xs">
                        <CheckCircle2 size={14} className="mr-1.5" /> Uploaded
                      </span>
                    )}
                  </div>
                </div>

                {/* Validation Issues & Extracted Fields block */}
                {(!isPending && (doc.validationIssues?.length > 0 || Object.keys(doc.extractedFields || {}).length > 0)) && (
                  <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 p-5 flex flex-col sm:flex-row gap-5">
                    
                    {doc.validationIssues?.length > 0 && (
                      <div className="flex-1 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-xl p-3.5">
                        <h4 className="text-xs font-bold text-red-800 dark:text-red-300 flex items-center mb-1.5">
                          <AlertCircle size={14} className="mr-1.5" /> Automated Checks Result
                        </h4>
                        <ul className="list-disc list-inside text-xs text-red-700 dark:text-red-300 space-y-1">
                          {doc.validationIssues.map((issue, i) => (
                            <li key={i}>{issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {Object.keys(doc.extractedFields || {}).length > 0 && (
                      <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm">
                        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 pb-1 border-b border-slate-100 dark:border-slate-800">
                          OCR Extracted Fields
                        </h4>
                        <div className="space-y-1.5">
                          {Object.entries(doc.extractedFields).map(([key, value]) => (
                            <div key={key} className="flex justify-between text-xs">
                              <span className="text-slate-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                              <span className="font-semibold text-slate-900 dark:text-white">{value}</span>
                            </div>
                          ))}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2 italic">*Verified automatically by UdyogSetu OCR.</p>
                      </div>
                    )}

                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Submit Application Section */}
        {allDocumentsUploaded && !isSubmittedOrLater && (
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 rounded-3xl shadow-xl border border-blue-800/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2">
                <CheckCircle2 className="text-emerald-400" size={22} /> All Required Documents Complete
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm mt-0.5">
                Your dossier has passed automated algorithmic verification. Submit now for statutory officer review.
              </p>
            </div>
            <button
              onClick={handleSubmitApplication}
              disabled={submitting}
              className="bg-white hover:bg-blue-50 text-blue-900 font-bold py-3 px-6 rounded-xl shadow-md transition-all flex items-center gap-2 flex-shrink-0 disabled:opacity-50 text-sm"
            >
              {submitting ? 'Submitting...' : (
                <>
                  <Send size={16} /> 
                  <span>Submit for Official Review</span>
                </>
              )}
            </button>
          </div>
        )}

        {isSubmittedOrLater && (
          <div className="bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-purple-600 dark:text-purple-400" size={26} />
              <div>
                <h3 className="text-base font-bold text-purple-900 dark:text-purple-200">Application Submitted for Review</h3>
                <p className="text-xs sm:text-sm text-purple-700 dark:text-purple-300">
                  Your application is now visible on the departmental officer's review desk.
                </p>
              </div>
            </div>
            <Link
              to={`/dashboard/${profileId}`}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs sm:text-sm transition-colors flex items-center gap-1.5 flex-shrink-0 shadow-sm"
            >
              Track on Dashboard <ArrowRight size={15} />
            </Link>
          </div>
        )}

      </div>
    </div>
  );
};

export default DocumentChecklist;
