const BusinessProfile = require('../models/BusinessProfile');

exports.createProfile = async (req, res) => {
  try {
    const newProfile = new BusinessProfile(req.body);
    const savedProfile = await newProfile.save();
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
