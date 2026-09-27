const Scheme = require('../models/Scheme');

/**
 * Scheme Matcher Service
 * Matches a business profile to available schemes based on structural data 
 * (industry, sector, investment).
 * 
 * Note: We DO NOT use AI to parse or evaluate the free-text `eligibilityCriteria` 
 * field here. This is a deliberate design choice — AI evaluation can hallucinate 
 * eligibility, so the matching engine acts as a pre-filter, and the user can 
 * read the criteria or ask the RAG chatbot for specific clarification.
 */

const matchSchemes = async (businessProfile) => {
  const allSchemes = await Scheme.find({});
  
  if (!allSchemes || allSchemes.length === 0) {
    return { matchedSchemes: [], allSchemes: [] };
  }

  const { industryType, sector, investmentAmount } = businessProfile;
  
  const matchedSchemes = allSchemes.filter(scheme => {
    // 1. Check Industry
    if (scheme.applicableIndustryTypes && scheme.applicableIndustryTypes.length > 0) {
      if (!scheme.applicableIndustryTypes.includes(industryType) && !scheme.applicableIndustryTypes.includes('Others')) {
        return false;
      }
    }

    // 2. Check Sector (Micro, Small, Medium)
    if (sector && scheme.applicableSectors && scheme.applicableSectors.length > 0) {
      if (!scheme.applicableSectors.includes(sector)) {
        return false;
      }
    }

    // 3. Check Investment Limits
    if (investmentAmount !== undefined && investmentAmount !== null) {
      if (scheme.minInvestment && investmentAmount < scheme.minInvestment) {
        return false;
      }
      if (scheme.maxInvestment && investmentAmount > scheme.maxInvestment) {
        return false;
      }
    }

    return true; // Passed all filters
  });

  return { matchedSchemes, allSchemes };
};

module.exports = { matchSchemes };
