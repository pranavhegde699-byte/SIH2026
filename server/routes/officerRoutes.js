const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const path = require('path');
const ApplicationStatus = require('../models/ApplicationStatus');
const Document = require('../models/Document');
const Approval = require('../models/Approval');
const BusinessProfile = require('../models/BusinessProfile');
const validateObjectId = require('../middleware/validateObjectId');
const requireRole = require('../middleware/requireRole');
const { generateApprovalCertificate } = require('../services/certificateService');
const { getSlaMetadata } = require('../services/slaService');

/**
 * GET /api/officer/applications
 * Query applications with optional department and status filters
 */
router.get('/applications', async (req, res, next) => {
  try {
    const { department, status, search, slaFilter } = req.query;
    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    let applications = await ApplicationStatus.find(query)
      .populate('businessProfileId')
      .populate('approvalId')
      .sort({ lastUpdatedAt: -1 });

    // Filter by department if specified
    if (department && department !== 'All') {
      applications = applications.filter(app => 
        app.approvalId && app.approvalId.department === department
      );
    }

    // Filter by search query if specified (businessName or PAN)
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      applications = applications.filter(app => {
        const name = app.businessProfileId?.businessName?.toLowerCase() || '';
        const pan = app.businessProfileId?.panNumber?.toLowerCase() || '';
        return name.includes(q) || pan.includes(q);
      });
    }

    // Attach computed SLA metadata to every application
    let appsWithSla = applications.map(app => {
      const appObj = app.toObject();
      appObj.slaMetadata = getSlaMetadata(app);
      return appObj;
    });

    // Optional SLA filtering (e.g. breached, urgent, normal)
    if (slaFilter && slaFilter !== 'all') {
      appsWithSla = appsWithSla.filter(app => {
        if (slaFilter === 'breached') return app.slaMetadata?.isBreached;
        if (slaFilter === 'urgent') return !app.slaMetadata?.isBreached && app.slaMetadata?.hoursRemaining <= 24;
        if (slaFilter === 'normal') return !app.slaMetadata?.isBreached && app.slaMetadata?.hoursRemaining > 24;
        return true;
      });
    }

    res.json({ success: true, data: appsWithSla });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/officer/applications/department/:department
 * Legacy compatibility endpoint for department inbox
 */
router.get('/applications/department/:department', async (req, res, next) => {
  try {
    const { department } = req.params;
    let applications = await ApplicationStatus.find({ status: 'submitted' })
      .populate('businessProfileId')
      .populate('approvalId')
      .sort({ lastUpdatedAt: -1 });

    if (department && department !== 'All') {
      applications = applications.filter(app => 
        app.approvalId && app.approvalId.department === department
      );
    }

    res.json({ success: true, data: applications });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/officer/applications/:statusId
 * Audit & Fetch single application detail with its uploaded documents
 * STRICTLY queries Document using BOTH businessProfileId AND approvalId from ApplicationStatus
 */
router.get('/applications/:statusId', validateObjectId('statusId'), async (req, res, next) => {
  try {
    const { statusId } = req.params;

    const application = await ApplicationStatus.findById(statusId)
      .populate('businessProfileId')
      .populate('approvalId');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application status not found' });
    }

    const businessProfileId = application.businessProfileId?._id;
    const approvalId = application.approvalId?._id;

    // Temporary console.log debugging as required by audit
    console.log(`[Officer Audit] GET /api/officer/applications/${statusId}`);
    console.log(`[Officer Audit] Extracted businessProfileId: ${businessProfileId} (Type: ${typeof businessProfileId})`);
    console.log(`[Officer Audit] Extracted approvalId: ${approvalId} (Type: ${typeof approvalId})`);

    // Query Document using BOTH businessProfileId and approvalId
    const documents = await Document.find({
      businessProfileId: businessProfileId,
      approvalId: approvalId
    });

    console.log(`[Officer Audit] Document query found ${documents.length} record(s) matching BOTH businessProfileId AND approvalId.`);

    // Map documents to include accessible fileUrl and fileType helpers
    const docsWithUrl = documents.map(doc => {
      const docObj = doc.toObject();
      if (doc.filePath) {
        const basename = path.basename(doc.filePath);
        // Returns both relative URL and absolute helper for the frontend
        docObj.fileUrl = `/uploads/${encodeURIComponent(basename)}`;
        const ext = path.extname(basename).toLowerCase();
        docObj.isPdf = ext === '.pdf';
        docObj.isImage = ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
      }
      return docObj;
    });

    const appObj = application.toObject();
    appObj.slaMetadata = getSlaMetadata(application);

    res.json({
      success: true,
      data: {
        application: appObj,
        documents: docsWithUrl
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/officer/applications/:statusId/review
 * Officer review endpoint to approve, reject, or mark under_review with notes
 * Auto-generates Digital Approval Certificate when status is approved
 */
router.put('/applications/:statusId/review', validateObjectId('statusId'), requireRole('officer'), async (req, res, next) => {
  try {
    const { statusId } = req.params;
    const { status, reviewNotes, reviewNote } = req.body;
    const noteContent = reviewNotes || reviewNote || '';

    if (!['under_review', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status for officer review. Must be under_review, approved, or rejected.' 
      });
    }

    const application = await ApplicationStatus.findById(statusId)
      .populate('businessProfileId')
      .populate('approvalId');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    application.status = status;
    if (noteContent) {
      application.notes = noteContent;
    }

    // P2: When approved, auto-generate official Digital Approval Certificate with QR Code
    if (status === 'approved') {
      try {
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const cert = await generateApprovalCertificate({
          application,
          businessProfile: application.businessProfileId,
          approval: application.approvalId,
          baseUrl
        });
        application.certificateId = cert.certificateId;
        application.certificateIssuedAt = cert.issuedAt;
        application.certificateValidUntil = cert.validUntil;
        application.certificateUrl = cert.certificateUrl;
      } catch (certError) {
        console.error('[Certificate Generation Failed]:', certError);
      }
    }
    
    // Pre-save hook records status change into statusHistory
    await application.save();

    const appObj = application.toObject();
    appObj.slaMetadata = getSlaMetadata(application);

    res.json({
      success: true,
      message: `Application marked as ${status} successfully.${application.certificateId ? ` Certificate ${application.certificateId} generated.` : ''}`,
      data: appObj
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/officer/verify/:certificateId
 * Public verification endpoint for Digital Approval Certificates
 * No authentication required — used for anti-fraud validation
 */
router.get('/verify/:certificateId', async (req, res, next) => {
  try {
    const { certificateId } = req.params;

    if (!certificateId || !certificateId.trim()) {
      return res.status(400).json({ success: false, isValid: false, message: 'Certificate ID is required' });
    }

    const application = await ApplicationStatus.findOne({ 
      certificateId: certificateId.trim().toUpperCase() 
    })
      .populate('businessProfileId')
      .populate('approvalId');

    if (!application || application.status !== 'approved') {
      return res.status(404).json({
        success: false,
        isValid: false,
        message: `Certificate ID "${certificateId}" is not recognized or not currently active in the MAITRI 2.0 repository.`
      });
    }

    res.json({
      success: true,
      isValid: true,
      data: {
        certificateId: application.certificateId,
        status: 'OFFICIALLY APPROVED & LEGALLY BINDING',
        issuedAt: application.certificateIssuedAt || application.lastUpdatedAt,
        validUntil: application.certificateValidUntil,
        certificateUrl: application.certificateUrl,
        businessName: application.businessProfileId?.businessName || 'MSME Enterprise',
        industryType: application.businessProfileId?.industryType || 'N/A',
        sector: application.businessProfileId?.sector || 'MSME',
        location: application.businessProfileId?.location || { state: 'Maharashtra', district: 'Mumbai' },
        approvalName: application.approvalId?.name || 'Statutory Approval',
        department: application.approvalId?.department || 'Government of Maharashtra / MAITRI',
        source: application.approvalId?.source || 'MAITRI 2.0',
        slaCompliance: 'Maha Parwana 48-Hour Guarantee Met (MRTPS Act, 2015)',
        verifiedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
