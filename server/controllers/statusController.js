const ApplicationStatus = require('../models/ApplicationStatus');
const BusinessProfile = require('../models/BusinessProfile');
const Approval = require('../models/Approval');
const Document = require('../models/Document');
const { getSlaHours, computeSlaDeadline, getSlaMetadata } = require('../services/slaService');

// Allowed status transitions map
const ALLOWED_TRANSITIONS = {
  'not_started': ['documents_pending'],
  'documents_pending': ['submitted'],
  'submitted': ['under_review'],
  'under_review': ['approved', 'rejected'],
  'approved': [],
  'rejected': ['documents_pending'] // allow resubmission
};

// PUT /api/status/:profileId/:approvalId — manual status update
exports.updateStatus = async (req, res, next) => {
  try {
    const { profileId, approvalId } = req.params;
    const { status, notes, expectedCompletionDate } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    let appStatus = await ApplicationStatus.findOne({ 
      businessProfileId: profileId, 
      approvalId 
    });

    if (!appStatus) {
      return res.status(404).json({ success: false, message: 'Application status not found. Visit the document checklist first.' });
    }

    // Validate transition
    const allowed = ALLOWED_TRANSITIONS[appStatus.status] || [];
    if (!allowed.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid status transition: cannot go from "${appStatus.status}" to "${status}". Allowed next statuses: [${allowed.join(', ')}]` 
      });
    }

    // RBAC: Only officers can move to under_review, approved, or rejected
    const OFFICER_ONLY_STATUSES = ['under_review', 'approved', 'rejected'];
    if (OFFICER_ONLY_STATUSES.includes(status)) {
      const role = req.headers['x-user-role'];
      if (role !== 'officer') {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Only officers can approve, reject, or mark applications under review.'
        });
      }
    }

    appStatus.status = status;
    if (notes !== undefined) appStatus.notes = notes;
    if (expectedCompletionDate) appStatus.expectedCompletionDate = new Date(expectedCompletionDate);
    if (status === 'submitted') {
      appStatus.submittedAt = new Date();
      // Calculate SLA deadline under MRTPS Act
      try {
        const profile = await BusinessProfile.findById(profileId);
        const approval = await Approval.findById(approvalId);
        const slaHours = getSlaHours(profile, approval);
        appStatus.slaDurationHours = slaHours;
        appStatus.slaDeadline = computeSlaDeadline(appStatus.submittedAt, slaHours);
      } catch (err) {
        console.error('Error calculating SLA deadline:', err);
      }
    }

    await appStatus.save(); // pre-save hook handles history + timestamp

    res.json({ success: true, data: appStatus });
  } catch (error) {
    next(error);
  }
};

// GET /api/dashboard/:profileId — aggregation summary
exports.getDashboard = async (req, res, next) => {
  try {
    const { profileId } = req.params;

    const profile = await BusinessProfile.findById(profileId);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const statuses = await ApplicationStatus.find({ businessProfileId: profileId })
      .populate('approvalId');

    const summary = {
      totalApprovals: statuses.length,
      notStarted: 0,
      documentsPending: 0,
      submitted: 0,
      underReview: 0,
      approved: 0,
      rejected: 0,
      upcomingDeadlines: [],
      recentActivity: []
    };

    const fourteenDaysFromNow = new Date();
    fourteenDaysFromNow.setDate(fourteenDaysFromNow.getDate() + 14);

    for (const s of statuses) {
      switch (s.status) {
        case 'not_started': summary.notStarted++; break;
        case 'documents_pending': summary.documentsPending++; break;
        case 'submitted': summary.submitted++; break;
        case 'under_review': summary.underReview++; break;
        case 'approved': summary.approved++; break;
        case 'rejected': summary.rejected++; break;
      }

      // Upcoming deadlines (within 14 days)
      if (s.expectedCompletionDate && s.expectedCompletionDate <= fourteenDaysFromNow && s.expectedCompletionDate >= new Date()) {
        summary.upcomingDeadlines.push({
          approvalId: s.approvalId?._id,
          approvalName: s.approvalId?.name || 'Unknown',
          expectedCompletionDate: s.expectedCompletionDate,
          status: s.status
        });
      }

      // Collect all history entries
      for (const h of s.statusHistory) {
        summary.recentActivity.push({
          approvalId: s.approvalId?._id,
          approvalName: s.approvalId?.name || 'Unknown',
          status: h.status,
          changedAt: h.changedAt
        });
      }
    }

    // Sort deadlines soonest first
    summary.upcomingDeadlines.sort((a, b) => new Date(a.expectedCompletionDate) - new Date(b.expectedCompletionDate));

    // Sort activity by date desc, take last 5
    summary.recentActivity.sort((a, b) => new Date(b.changedAt) - new Date(a.changedAt));
    summary.recentActivity = summary.recentActivity.slice(0, 5);

    // Include the full statuses list for the table view with SLA metadata and Certificate data
    summary.approvals = statuses.map(s => {
      const slaMeta = getSlaMetadata(s);
      return {
        _id: s._id,
        approvalId: s.approvalId?._id,
        approvalName: s.approvalId?.name || 'Unknown',
        department: s.approvalId?.department || '',
        status: s.status,
        submittedAt: s.submittedAt,
        expectedCompletionDate: s.expectedCompletionDate,
        lastUpdatedAt: s.lastUpdatedAt,
        notes: s.notes,
        // SLA tracking
        slaDeadline: s.slaDeadline || slaMeta.slaDeadline,
        slaDurationHours: s.slaDurationHours || slaMeta.slaHours,
        slaMetadata: slaMeta,
        // Certificate
        certificateId: s.certificateId,
        certificateIssuedAt: s.certificateIssuedAt,
        certificateValidUntil: s.certificateValidUntil,
        certificateUrl: s.certificateUrl
      };
    });

    res.json({ success: true, profile, data: summary });
  } catch (error) {
    next(error);
  }
};
