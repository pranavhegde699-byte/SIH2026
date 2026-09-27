import React, { useState, useEffect } from 'react';

/**
 * SlaBadge - Displays dynamic countdown timer and MRTPS Act compliance status
 * @param {Object} props
 * @param {string|Date} props.deadline - Statutory SLA deadline
 * @param {string|Date} props.submittedAt - Submission timestamp
 * @param {string} props.status - Current application status
 * @param {number} [props.durationHours=48] - Total statutory duration in hours
 * @param {boolean} [props.showProgress=false] - Whether to render progress bar
 * @param {string} [props.className] - Additional styling
 */
export default function SlaBadge({
  deadline,
  submittedAt,
  status,
  durationHours = 48,
  showProgress = false,
  className = ''
}) {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const calculateTime = () => {
      if (!deadline && !submittedAt) return null;

      const now = Date.now();
      const start = submittedAt ? new Date(submittedAt).getTime() : now;
      const totalMs = durationHours * 3600 * 1000;
      const end = deadline ? new Date(deadline).getTime() : start + totalMs;

      const msRemaining = end - now;
      const hoursRemaining = Math.round(msRemaining / (1000 * 60 * 60));
      const minutesRemaining = Math.max(0, Math.round(msRemaining / (1000 * 60)));
      const isBreached = msRemaining <= 0;
      const percentRemaining = Math.max(0, Math.min(100, Math.round((msRemaining / totalMs) * 100)));

      return {
        hoursRemaining,
        minutesRemaining,
        isBreached,
        percentRemaining: isBreached ? 0 : percentRemaining,
        overdueHours: Math.abs(hoursRemaining)
      };
    };

    setTimeLeft(calculateTime());
    const interval = setInterval(() => setTimeLeft(calculateTime()), 60000); // update every minute
    return () => clearInterval(interval);
  }, [deadline, submittedAt, durationHours]);

  // Terminal statuses
  if (status === 'approved') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/60 ${className}`}>
        <svg className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
        </svg>
        SLA Met (Approved)
      </span>
    );
  }

  if (status === 'rejected') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700 ${className}`}>
        Closed
      </span>
    );
  }

  if (!['submitted', 'under_review'].includes(status)) {
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 ${className}`}>
        Pending Submission
      </span>
    );
  }

  if (!timeLeft) {
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 ${className}`}>
        Calculating SLA...
      </span>
    );
  }

  // 1. SLA BREACHED (Overdue)
  if (timeLeft.isBreached) {
    return (
      <div className="flex flex-col gap-1">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800 animate-pulse ${className}`}>
          <svg className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          SLA BREACHED ({timeLeft.overdueHours}h overdue)
        </span>
        {showProgress && (
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
            <div className="bg-rose-600 h-1.5 rounded-full w-full"></div>
          </div>
        )}
      </div>
    );
  }

  // 2. Critical / Due Soon (<20% time remaining or <24h)
  const isUrgent = timeLeft.percentRemaining < 20 || timeLeft.hoursRemaining < 24;

  if (isUrgent) {
    return (
      <div className="flex flex-col gap-1">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 ${className}`}>
          <svg className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {timeLeft.hoursRemaining}h remaining (Due Soon)
        </span>
        {showProgress && (
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-amber-500 h-1.5 rounded-full transition-all duration-500" 
              style={{ width: `${timeLeft.percentRemaining}%` }}
            ></div>
          </div>
        )}
      </div>
    );
  }

  // 3. Normal (>50% or healthy time remaining)
  const days = Math.floor(timeLeft.hoursRemaining / 24);
  const displayLabel = days > 1 
    ? `${days} days left (${timeLeft.hoursRemaining}h)` 
    : `${timeLeft.hoursRemaining}h left`;

  return (
    <div className="flex flex-col gap-1">
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/60 ${className}`}>
        <svg className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {displayLabel}
      </span>
      {showProgress && (
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
          <div 
            className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" 
            style={{ width: `${timeLeft.percentRemaining}%` }}
          ></div>
        </div>
      )}
    </div>
  );
}
