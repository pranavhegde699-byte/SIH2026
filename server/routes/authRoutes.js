const express = require('express');
const router = express.Router();
const User = require('../models/User');
const BusinessProfile = require('../models/BusinessProfile');

// Mock Auth - For hackathon purposes, we skip JWT and just return the user object directly.
router.post('/login', async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    let user = await User.findOne({ email, role, password });
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});

router.post('/register', async (req, res, next) => {
  try {
    const { email, password, role, panNumber, department, businessName } = req.body;
    
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    let businessProfileId = null;
    if (role === 'entrepreneur' && businessName) {
      // Auto-create a stub profile for them
      const profile = await BusinessProfile.create({
        businessName,
        email,
        industryType: 'Manufacturing', // default
        sector: 'Micro'
      });
      businessProfileId = profile._id;
    }

    const user = await User.create({
      email,
      password, // In production, bcrypt hash this!
      role,
      panNumber,
      department,
      businessProfileId
    });

    res.status(201).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});

// Officer endpoint: Get applications for their department that are "submitted" (100% verified)
router.get('/officer/applications/:department', async (req, res, next) => {
  try {
    const ApplicationStatus = require('../models/ApplicationStatus');
    const { department } = req.params;
    
    // Find all submitted applications
    const applications = await ApplicationStatus.find({ status: 'submitted' })
      .populate('businessProfileId')
      .populate('approvalId');
      
    // Filter by department
    const departmentApps = applications.filter(app => app.approvalId && app.approvalId.department === department);
    
    res.json({ success: true, data: departmentApps });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
