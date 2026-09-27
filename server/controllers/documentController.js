const Document = require('../models/Document');
const BusinessProfile = require('../models/BusinessProfile');
const Approval = require('../models/Approval');
const ApplicationStatus = require('../models/ApplicationStatus');
const { processDocument } = require('../services/ocrService');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

/**
 * Helper: auto-derive ApplicationStatus based on document states.
 * Called after each upload and when fetching the checklist.
 */
const autoUpdateApplicationStatus = async (businessProfileId, approvalId) => {
  try {
    const approval = await Approval.findById(approvalId);
    if (!approval) return;

    const documents = await Document.find({ businessProfileId, approvalId });
    
    let appStatus = await ApplicationStatus.findOne({ businessProfileId, approvalId });
    if (!appStatus) {
      appStatus = new ApplicationStatus({ businessProfileId, approvalId, status: 'not_started' });
      await appStatus.save();
    }

    // Only auto-advance if currently not_started or documents_pending
    if (!['not_started', 'documents_pending'].includes(appStatus.status)) return;

    const required = approval.requiredDocuments || [];
    if (required.length === 0) return;

    const uploadedOrVerified = required.every(reqDoc => {
      const doc = documents.find(d => d.documentType === reqDoc);
      return doc && ['uploaded', 'verified'].includes(doc.uploadStatus);
    });

    const hasAnyUpload = documents.length > 0;

    // Move from not_started → documents_pending once any doc is uploaded
    if (hasAnyUpload && appStatus.status === 'not_started') {
      appStatus.status = 'documents_pending';
      await appStatus.save();
    }

    // Move from documents_pending → submitted once ALL required docs are uploaded
    // This auto-submits so officers can immediately see it
    if (uploadedOrVerified && appStatus.status === 'documents_pending') {
      appStatus.status = 'submitted';
      appStatus.submittedAt = new Date();
      await appStatus.save();
      console.log(`[AutoSubmit] Application for profile=${businessProfileId} approval=${approvalId} auto-submitted to officer queue.`);
    }
  } catch (err) {
    console.error('Auto-update status error:', err);
  }
};

exports.uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { businessProfileId, approvalId, documentType } = req.body;

    if (!businessProfileId || !approvalId || !documentType) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    if (!mongoose.Types.ObjectId.isValid(businessProfileId) || !mongoose.Types.ObjectId.isValid(approvalId)) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }

    // Edge case: Foreign key checks
    const profileExists = await BusinessProfile.exists({ _id: businessProfileId });
    const approvalExists = await Approval.exists({ _id: approvalId });

    if (!profileExists || !approvalExists) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ success: false, message: 'Profile or Approval not found' });
    }

    let document = await Document.findOne({ businessProfileId, approvalId, documentType });
    if (!document) {
      document = new Document({
        businessProfileId,
        approvalId,
        documentType,
      });
    }

    document.fileName = req.file.originalname;
    document.filePath = req.file.path;
    document.uploadedAt = new Date();
    document.uploadStatus = 'uploaded';

    // Trigger OCR Extraction
    try {
      const ocrResult = await processDocument(req.file.path, req.file.mimetype, documentType);
      document.extractedFields = ocrResult.extractedFields;
      document.validationIssues = ocrResult.validationIssues;
      
      if (ocrResult.validationIssues.length > 0) {
        document.uploadStatus = 'rejected';
      }
    } catch (ocrErr) {
      console.error("OCR Catch Error:", ocrErr);
      document.uploadStatus = 'rejected';
      document.validationIssues = ['Document processing failed due to corruption or unreadable format.'];
    }

    await document.save();

    // Auto-derive ApplicationStatus after upload
    await autoUpdateApplicationStatus(businessProfileId, approvalId);

    res.status(200).json({
      success: true,
      message: 'Document uploaded successfully',
      data: document
    });

  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

exports.getChecklist = async (req, res, next) => {
  try {
    const { profileId, approvalId } = req.params;

    const approval = await Approval.findById(approvalId);
    if (!approval) {
      return res.status(404).json({ success: false, message: 'Approval not found' });
    }

    // Auto-create ApplicationStatus if it doesn't exist yet
    await autoUpdateApplicationStatus(profileId, approvalId);

    const documents = await Document.find({ businessProfileId: profileId, approvalId });
    const appStatusRecord = await ApplicationStatus.findOne({ businessProfileId: profileId, approvalId });

    // Build checklist response
    const checklist = approval.requiredDocuments.map(reqDocType => {
      const docRecord = documents.find(d => d.documentType === reqDocType);
      if (docRecord) {
        const obj = docRecord.toObject();
        if (docRecord.filePath) {
          obj.fileUrl = `/uploads/${encodeURIComponent(path.basename(docRecord.filePath))}`;
        }
        return obj;
      } else {
        return {
          documentType: reqDocType,
          uploadStatus: 'pending'
        };
      }
    });

    res.status(200).json({
      success: true,
      approvalName: approval.name,
      applicationStatus: appStatusRecord ? appStatusRecord.status : 'not_started',
      checklist
    });

  } catch (error) {
    next(error);
  }
};
