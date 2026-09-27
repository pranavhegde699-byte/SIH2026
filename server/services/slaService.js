/**
 * SLA Service for Maharashtra Right to Public Services Act (MRTPS Act, 2015)
 * & Maha Parwana 48-Hour Green Guarantee
 */

/**
 * Determine statutory SLA in hours based on business category and approval type
 * @param {Object} businessProfile 
 * @param {Object} approval 
 * @returns {number} hours
 */
function getSlaHours(businessProfile, approval) {
  const industry = businessProfile?.industryType || '';
  const sector = businessProfile?.sector || '';
  const approvalName = approval?.name || '';

  // 1. Fast-track 48-Hour Maha Parwana: Micro units, IT/Software, or standard registrations
  if (
    approvalName.toLowerCase().includes('udyam') ||
    approvalName.toLowerCase().includes('trade') ||
    sector === 'Micro' ||
    industry === 'IT/Software'
  ) {
    return 48; // 48 Hours
  }

  // 2. Medium complexity (15 Days = 360 Hours): Small manufacturing, food processing, textiles
  if (
    sector === 'Small' ||
    ['Food Processing', 'Textiles', 'Manufacturing'].includes(industry)
  ) {
    return 15 * 24; // 360 Hours
  }

  // 3. Complex clearances (30 Days = 720 Hours): Medium sector, Pharmaceuticals, Environment CTE/CTO
  return 30 * 24; // 720 Hours
}

/**
 * Compute SLA deadline from submission date and duration
 * @param {Date} submittedAt 
 * @param {number} slaHours 
 * @returns {Date}
 */
function computeSlaDeadline(submittedAt, slaHours = 48) {
  const baseTime = submittedAt ? new Date(submittedAt).getTime() : Date.now();
  return new Date(baseTime + slaHours * 3600 * 1000);
}

/**
 * Calculate remaining SLA time and status metadata
 * @param {Object} application 
 * @returns {Object} { remainingHours, totalHours, percentRemaining, isBreached, statusText }
 */
function getSlaMetadata(application) {
  const now = Date.now();
  const submittedAt = application.submittedAt ? new Date(application.submittedAt).getTime() : now;
  const slaHours = application.slaDurationHours || 48;
  const totalMs = slaHours * 3600 * 1000;
  
  const deadline = application.slaDeadline 
    ? new Date(application.slaDeadline).getTime() 
    : submittedAt + totalMs;

  const msRemaining = deadline - now;
  const hoursRemaining = Math.round(msRemaining / (1000 * 60 * 60));
  const percentRemaining = Math.max(0, Math.min(100, Math.round((msRemaining / totalMs) * 100)));
  const isBreached = msRemaining <= 0;

  let statusText = '';
  if (application.status === 'approved') {
    statusText = 'Completed within SLA';
  } else if (application.status === 'rejected') {
    statusText = 'Closed';
  } else if (isBreached) {
    const overdueHours = Math.abs(hoursRemaining);
    statusText = `SLA BREACHED (${overdueHours}h overdue)`;
  } else if (hoursRemaining < 24) {
    statusText = `${hoursRemaining}h remaining (Due Soon)`;
  } else {
    const days = Math.round(hoursRemaining / 24);
    statusText = `${days} day${days > 1 ? 's' : ''} remaining (${hoursRemaining}h)`;
  }

  return {
    slaDeadline: new Date(deadline),
    slaHours,
    hoursRemaining,
    percentRemaining: isBreached ? 0 : percentRemaining,
    isBreached,
    statusText
  };
}

module.exports = {
  getSlaHours,
  computeSlaDeadline,
  getSlaMetadata
};
