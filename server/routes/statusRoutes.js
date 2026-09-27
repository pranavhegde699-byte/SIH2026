const express = require('express');
const router = express.Router();
const { updateStatus, getDashboard } = require('../controllers/statusController');
const { buildAutoFillData } = require('../services/autoFillService');
const { checkAndSendReminders } = require('../services/reminderService');
const validateObjectId = require('../middleware/validateObjectId');
const requireRole = require('../middleware/requireRole');

// Status update (role-based checks are inside the controller — entrepreneurs can submit, only officers can approve/reject)
router.put('/status/:profileId/:approvalId', validateObjectId('profileId'), validateObjectId('approvalId'), updateStatus);

// Dashboard aggregation
router.get('/dashboard/:profileId', validateObjectId('profileId'), getDashboard);

// Auto-fill data
router.get('/autofill/:profileId', validateObjectId('profileId'), async (req, res, next) => {
  try {
    const data = await buildAutoFillData(req.params.profileId);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// Manual reminder trigger (for demo purposes)
router.post('/reminders/trigger', async (req, res, next) => {
  try {
    const result = await checkAndSendReminders();
    res.json({ success: true, message: `Sent ${result.sent} reminder(s). Check server console for Ethereal preview URLs.`, data: result });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
