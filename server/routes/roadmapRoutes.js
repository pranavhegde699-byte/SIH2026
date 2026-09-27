const express = require('express');
const router = express.Router();
const { getRoadmap } = require('../controllers/roadmapController');
const validateObjectId = require('../middleware/validateObjectId');

router.get('/:profileId', validateObjectId('profileId'), getRoadmap);

module.exports = router;
