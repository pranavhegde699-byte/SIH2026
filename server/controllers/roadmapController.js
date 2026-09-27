const BusinessProfile = require('../models/BusinessProfile');
const { matchApprovals } = require('../services/rulesEngine');
const { buildRoadmap } = require('../services/roadmapBuilder');
const mongoose = require('mongoose');

exports.getRoadmap = async (req, res) => {
  try {
    const { profileId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(profileId)) {
      return res.status(400).json({ message: 'Invalid profile ID format' });
    }

    const profile = await BusinessProfile.findById(profileId);
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    const matchedApprovals = await matchApprovals(profile);
    const roadmapStages = buildRoadmap(matchedApprovals);

    res.status(200).json({
      profile,
      matchedApprovals,
      roadmapStages
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
