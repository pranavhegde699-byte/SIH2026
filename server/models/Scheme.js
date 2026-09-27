const mongoose = require('mongoose');

const schemeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  department: { type: String },
  eligibilityCriteria: { type: String },
  benefitDescription: { type: String },
  applicableIndustryTypes: [{ type: String }],
  // Added Day 6 for realistic matching:
  applicableSectors: [{ type: String }], // 'Micro', 'Small', 'Medium'
  minInvestment: { type: Number, default: 0 },
  maxInvestment: { type: Number, default: null }
});

module.exports = mongoose.model('Scheme', schemeSchema);
