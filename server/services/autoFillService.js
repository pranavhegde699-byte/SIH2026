const Document = require('../models/Document');

/**
 * Auto-fill service: aggregates all extractedFields from a profile's uploaded
 * documents into one merged object. If the same field appears in multiple
 * documents, the most recently uploaded value wins.
 */
const buildAutoFillData = async (businessProfileId) => {
  const documents = await Document.find({
    businessProfileId,
    uploadStatus: { $in: ['uploaded', 'verified'] },
    extractedFields: { $ne: null }
  }).sort({ uploadedAt: 1 }); // oldest first so newer overwrites

  const merged = {};

  for (const doc of documents) {
    if (doc.extractedFields && typeof doc.extractedFields === 'object') {
      Object.assign(merged, doc.extractedFields);
    }
  }

  return merged;
};

module.exports = { buildAutoFillData };
