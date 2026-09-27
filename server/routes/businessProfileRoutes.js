const express = require('express');
const router = express.Router();
const { createProfile, getProfile, getProfiles } = require('../controllers/businessProfileController');
const validateObjectId = require('../middleware/validateObjectId');

router.post('/', createProfile);
router.get('/', getProfiles);
router.get('/:id', validateObjectId('id'), getProfile);

module.exports = router;
