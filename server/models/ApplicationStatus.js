const mongoose = require('mongoose');

const statusHistoryEntrySchema = new mongoose.Schema({
  status: { type: String, required: true },
  changedAt: { type: Date, default: Date.now }
}, { _id: false });

const applicationStatusSchema = new mongoose.Schema({
  businessProfileId: { type: mongoose.Schema.Types.ObjectId, ref: 'BusinessProfile', required: true },
  approvalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Approval', required: true },
  status: { 
    type: String, 
    enum: ['not_started', 'documents_pending', 'submitted', 'under_review', 'approved', 'rejected'], 
    default: 'not_started' 
  },
  submittedAt: { type: Date },
  expectedCompletionDate: { type: Date },
  lastUpdatedAt: { type: Date, default: Date.now },
  statusHistory: [statusHistoryEntrySchema],
  notes: { type: String },
  // Digital Certificate (P2)
  certificateId: { type: String, sparse: true, index: true },
  certificateIssuedAt: { type: Date },
  certificateValidUntil: { type: Date },
  certificateUrl: { type: String },
  // SLA Statutory Deadline (P2)
  slaDeadline: { type: Date },
  slaDurationHours: { type: Number, default: 48 }
});

// Unique compound index — one status record per profile+approval pair
applicationStatusSchema.index({ businessProfileId: 1, approvalId: 1 }, { unique: true });

// Push to history and update timestamp on every save
applicationStatusSchema.pre('save', function(next) {
  this.lastUpdatedAt = new Date();
  // Push to history if status changed (check modified path)
  if (this.isModified('status')) {
    this.statusHistory.push({ status: this.status, changedAt: new Date() });
  }
  next();
});

module.exports = mongoose.model('ApplicationStatus', applicationStatusSchema);
