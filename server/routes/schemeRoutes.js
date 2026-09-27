const express = require('express');
const router = express.Router();
const BusinessProfile = require('../models/BusinessProfile');
const { matchSchemes } = require('../services/schemeMatcher');

router.get('/:profileId', async (req, res, next) => {
  try {
    const { profileId } = req.params;
    const profile = await BusinessProfile.findById(profileId);
    
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const { matchedSchemes, allSchemes } = await matchSchemes(profile);
    
    res.json({
      success: true,
      data: { matchedSchemes, allSchemes }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
