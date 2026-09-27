const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['entrepreneur', 'officer'],
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  // Entrepreneur specific fields
  panNumber: {
    type: String,
    sparse: true
  },
  businessProfileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BusinessProfile'
  },
  // Officer specific fields
  department: {
    type: String // e.g., 'Fire Department', 'MPCB', 'MIDC'
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
