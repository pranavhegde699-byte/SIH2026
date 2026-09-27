const mongoose = require('mongoose');

const businessProfileSchema = new mongoose.Schema({
  businessName: { 
    type: String, 
    required: [true, 'Business Name is required'], 
    trim: true, 
    minlength: [2, 'Business Name must be at least 2 characters long'],
    maxlength: [200, 'Business Name cannot exceed 200 characters']
  },
  industryType: { 
    type: String, 
    required: [true, 'Industry Type is required'],
    enum: {
      values: ['Manufacturing', 'IT/Software', 'Food Processing', 'Textiles', 'Pharmaceuticals', 'Others'],
      message: '{VALUE} is not a supported industry type'
    }
  },
  sector: { 
    type: String,
    enum: {
      values: ['Micro', 'Small', 'Medium'],
      message: '{VALUE} is not a supported sector'
    }
  },
  investmentAmount: { 
    type: Number,
    min: [0, 'Investment amount must be a positive number']
  },
  location: {
    state: { type: String, trim: true },
    district: { type: String, trim: true }
  },
  employeeCount: { 
    type: Number,
    min: [0, 'Employee count must be a positive number']
  },
  businessActivity: { type: String },
  email: { type: String, trim: true }, // optional — needed for reminder emails
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('BusinessProfile', businessProfileSchema);
