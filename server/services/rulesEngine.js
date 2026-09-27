const Approval = require('../models/Approval');

/**
 * Matches approvals for a given business profile.
 * 
 * @param {Object} businessProfile - The business profile document
 * @returns {Promise<Array>} - Array of matched approvals
 */
const matchApprovals = async (businessProfile) => {
  const { industryType, sector } = businessProfile;

  let matchedApprovals = await Approval.find({
    applicableIndustryTypes: industryType,
    applicableSectors: sector
  }).populate('dependsOn', '_id'); // We just need the ID or basic info to build the roadmap

  // Fallback if no specific approvals are found for this edge-case combination
  if (matchedApprovals.length === 0) {
    matchedApprovals = await Approval.find({
      name: { $in: ['Udyam Registration', 'GST Registration', 'Trade License'] }
    });
  }

  return matchedApprovals;
};

module.exports = { matchApprovals };
