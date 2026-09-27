const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  businessProfileId: { type: mongoose.Schema.Types.ObjectId, ref: 'BusinessProfile', required: true },
  approvalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Approval', required: true },
  documentType: { type: String, required: true },
  fileName: { type: String },
  filePath: { type: String },
  uploadStatus: { 
    type: String, 
    enum: ['pending', 'uploaded', 'verified', 'rejected'], 
    default: 'pending' 
  },
  extractedFields: { type: mongoose.Schema.Types.Mixed },
  validationIssues: [{ type: String }],
  uploadedAt: { type: Date }
});

module.exports = mongoose.model('Document', documentSchema);
