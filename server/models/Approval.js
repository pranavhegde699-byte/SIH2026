const mongoose = require('mongoose');

const approvalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  department: { type: String },
  applicableIndustryTypes: [{ type: String }],
  applicableSectors: [{ type: String }],
  description: { type: String },
  requiredDocuments: [{ type: String }],
  dependsOn: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Approval' }],
  source: { type: String } // "MAITRI" or "NSWS" (mock tag)
});

module.exports = mongoose.model('Approval', approvalSchema);
