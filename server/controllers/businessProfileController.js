const BusinessProfile = require('../models/BusinessProfile');
const User = require('../models/User');

exports.createProfile = async (req, res) => {
  try {
    const { userId, ...profileData } = req.body;
    const reqUserId = userId || req.headers['x-user-id'];
    const userRole = req.headers['x-user-role'];

    // If role is officer, forbid creating business profiles
    if (userRole === 'officer') {
      return res.status(403).json({ message: 'Officers cannot create business profiles. Only entrepreneurs can create profiles.' });
    }

    // Require an authenticated user
    let user = null;
    if (reqUserId) {
      user = await User.findById(reqUserId);
    } else if (profileData.email) {
      user = await User.findOne({ email: profileData.email });
    }

    if (!user) {
      return res.status(401).json({ 
        message: 'Authentication required. Please sign in or register as an entrepreneur before creating a business profile.' 
      });
    }

    if (user.role !== 'entrepreneur') {
      return res.status(403).json({ 
        message: 'Only registered entrepreneurs are permitted to create a business profile.' 
      });
    }

    const newProfile = new BusinessProfile(profileData);
    const savedProfile = await newProfile.save();

    // Link to User record
    await User.findByIdAndUpdate(user._id, { businessProfileId: savedProfile._id });

    res.status(201).json(savedProfile);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: 'Validation Error', errors: messages });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const profile = await BusinessProfile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getProfiles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const profiles = await BusinessProfile.find().skip(skip).limit(limit).sort({ createdAt: -1 });
    const total = await BusinessProfile.countDocuments();

    res.status(200).json({
      total,
      page,
      pages: Math.ceil(total / limit),
      data: profiles
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
