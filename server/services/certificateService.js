const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const CERTIFICATES_DIR = path.join(__dirname, '..', 'uploads', 'certificates');

// Ensure certificates directory exists
if (!fs.existsSync(CERTIFICATES_DIR)) {
  fs.mkdirSync(CERTIFICATES_DIR, { recursive: true });
}

/**
 * Generate a unique Certificate ID in format: MH-2026-MSME-XXXX
 */
function generateCertificateId() {
  const hex = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `MH-2026-MSME-${hex}`;
}

/**
 * Generate Digital Approval Certificate PDF with QR Code
 * @param {Object} params
 * @param {Object} params.application - ApplicationStatus document
 * @param {Object} params.businessProfile - BusinessProfile document
 * @param {Object} params.approval - Approval document
 * @param {string} [params.baseUrl] - Base URL for QR verification link
 * @returns {Promise<{ certificateId: string, certificateUrl: string, issuedAt: Date, validUntil: Date }>}
 */
async function generateApprovalCertificate({ application, businessProfile, approval, baseUrl = 'http://localhost:5173' }) {
  const certificateId = application.certificateId || generateCertificateId();
  const issuedAt = application.certificateIssuedAt || new Date();
  
  // Valid for 3 years
  const validUntil = new Date(issuedAt);
  validUntil.setFullYear(validUntil.getFullYear() + 3);

  const fileName = `${certificateId}.pdf`;
  const filePath = path.join(CERTIFICATES_DIR, fileName);
  const relativeUrl = `/uploads/certificates/${fileName}`;

  // Generate QR Code containing the public verification URL
  const verifyUrl = `${baseUrl.replace(/\/$/, '')}/verify/${certificateId}`;
  const qrBuffer = await QRCode.toBuffer(verifyUrl, {
    width: 140,
    margin: 1,
    color: {
      dark: '#1e3a8a', // Deep navy
      light: '#ffffff'
    }
  });

  // Create Landscape A4 PDF Document (841.89 x 595.28 points)
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margins: { top: 30, bottom: 30, left: 30, right: 30 },
      info: {
        Title: `Statutory Approval Certificate - ${certificateId}`,
        Author: 'Government of Maharashtra - UdyogSetu MAITRI 2.0',
        Subject: `Regulatory Approval for ${businessProfile.businessName}`,
        Keywords: 'MAITRI, UdyogSetu, MRTPS, MSME, Statutory Certificate'
      }
    });

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    const pageWidth = 841.89;
    const pageHeight = 595.28;

    // --- BORDERS & ORNAMENTS ---
    // Outer Border (Gold)
    doc.lineWidth(4)
       .strokeColor('#d97706')
       .rect(20, 20, pageWidth - 40, pageHeight - 40)
       .stroke();

    // Inner Border (Deep Navy)
    doc.lineWidth(1.5)
       .strokeColor('#1e3a8a')
       .rect(26, 26, pageWidth - 52, pageHeight - 52)
       .stroke();

    // Decorative corner notches
    const drawCorner = (x, y) => {
      doc.save()
         .fillColor('#d97706')
         .circle(x, y, 4)
         .fill()
         .restore();
    };
    drawCorner(32, 32);
    drawCorner(pageWidth - 32, 32);
    drawCorner(32, pageHeight - 32);
    drawCorner(pageWidth - 32, pageHeight - 32);

    // --- WATERMARK ---
    doc.save()
       .fontSize(52)
       .fillColor('#f1f5f9')
       .opacity(0.4)
       .rotate(-22, { origin: [pageWidth / 2, pageHeight / 2] })
       .text('MAHARASHTRA GOVT • MAITRI 2.0', pageWidth / 2 - 320, pageHeight / 2 - 20)
       .restore();

    // --- HEADER ---
    doc.fillColor('#1e3a8a')
       .fontSize(13)
       .font('Helvetica-Bold')
       .text('GOVERNMENT OF MAHARASHTRA', 0, 42, { align: 'center', letterSpacing: 2 });

    doc.fillColor('#475569')
       .fontSize(10)
       .font('Helvetica')
       .text('MAITRI 2.0 SINGLE WINDOW GATEWAY • DIRECTORATE OF INDUSTRIES', 0, 60, { align: 'center' });

    doc.fillColor('#b45309')
       .fontSize(8.5)
       .font('Helvetica-Bold')
       .text('UNDER MAHARASHTRA RIGHT TO PUBLIC SERVICES ACT (MRTPS ACT, 2015)', 0, 75, { align: 'center', letterSpacing: 1 });

    // Ribbon / Title separator line
    doc.lineWidth(0.8)
       .strokeColor('#e2e8f0')
       .moveTo(80, 94)
       .lineTo(pageWidth - 80, 94)
       .stroke();

    // Main Certificate Title
    doc.fillColor('#0f172a')
       .fontSize(22)
       .font('Helvetica-Bold')
       .text('DIGITAL CERTIFICATE OF STATUTORY APPROVAL', 0, 108, { align: 'center' });

    doc.fillColor('#64748b')
       .fontSize(10)
       .font('Helvetica-Oblique')
       .text('This is an authentic, digitally verified regulatory clearance issued under the Maharashtra Parwana Initiative.', 0, 134, { align: 'center' });

    // --- CERTIFICATE NUMBER BADGE ---
    const badgeX = 58;
    const badgeY = 158;
    const badgeWidth = pageWidth - 116;
    doc.save()
       .roundedRect(badgeX, badgeY, badgeWidth, 34, 4)
       .fillColor('#f8fafc')
       .fill()
       .strokeColor('#cbd5e1')
       .lineWidth(1)
       .stroke()
       .restore();

    doc.fillColor('#1e3a8a')
       .fontSize(11)
       .font('Helvetica-Bold')
       .text(`CERTIFICATE ID: ${certificateId}`, badgeX + 16, badgeY + 11);

    doc.fillColor('#047857')
       .fontSize(10)
       .font('Helvetica-Bold')
       .text('● STATUS: OFFICIALLY APPROVED & LEGALLY BINDING', badgeX + badgeWidth - 360, badgeY + 11, { align: 'right' });

    // --- MAIN CONTENT GRID ---
    const contentTop = 210;
    const col1X = 64;
    const col2X = 470;

    // Helper for key-value rows
    const drawField = (label, value, x, y, width = 360) => {
      doc.fillColor('#64748b')
         .fontSize(9)
         .font('Helvetica')
         .text(label.toUpperCase(), x, y);
      
      doc.fillColor('#0f172a')
         .fontSize(12)
         .font('Helvetica-Bold')
         .text(value, x, y + 13, { width, ellipsis: true });
    };

    // Column 1: Enterprise & Clearance
    drawField('Authorized Enterprise / Entity', businessProfile.businessName || 'MSME Enterprise', col1X, contentTop);
    drawField('Industry Category & Sector', `${businessProfile.industryType || 'General'} • ${businessProfile.sector || 'MSME'} Sector`, col1X, contentTop + 44);
    drawField('Statutory Clearance Granted', approval.name || 'Statutory Approval', col1X, contentTop + 88, 380);
    drawField('Issuing Authority / Department', approval.department || 'Government of Maharashtra / MAITRI', col1X, contentTop + 132, 380);

    // Column 2: Date & Jurisdiction
    const formattedIssued = issuedAt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const formattedValid = validUntil.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    drawField('Date of Approval', formattedIssued, col2X, contentTop, 160);
    drawField('Validity Period', `Valid until ${formattedValid} (3 Years)`, col2X, contentTop + 44, 200);
    drawField('Jurisdiction & Location', `${businessProfile.location?.district || 'Mumbai'}, Maharashtra`, col2X, contentTop + 88, 200);
    drawField('SLA Compliance', 'Maha Parwana 48-Hour Guarantee Met', col2X, contentTop + 132, 200);

    // --- QR CODE EMBED (Bottom Right) ---
    const qrX = pageWidth - 190;
    const qrY = 380;

    doc.image(qrBuffer, qrX, qrY, { width: 120, height: 120 });

    doc.fillColor('#475569')
       .fontSize(7.5)
       .font('Helvetica-Bold')
       .text('SCAN TO VERIFY', qrX, qrY + 124, { width: 120, align: 'center' });
    doc.fillColor('#94a3b8')
       .fontSize(6.5)
       .font('Helvetica')
       .text('Anti-Fraud Cloud Ledger', qrX, qrY + 135, { width: 120, align: 'center' });

    // --- STATUTORY DISCLAIMER & SIGNATURE (Bottom Left) ---
    const bottomY = 405;
    doc.fillColor('#64748b')
       .fontSize(8)
       .font('Helvetica')
       .text(
         'This document is an electronically generated statutory certificate under the Maharashtra Right to Public Services Act (MRTPS Act, 2015). ' +
         'It does not require a physical ink signature. Its legal validity can be instantly verified by scanning the embedded QR code or by visiting the official portal.',
         col1X, bottomY, { width: 440, lineGap: 2 }
       );

    // Signature Line
    doc.lineWidth(0.8)
       .strokeColor('#cbd5e1')
       .moveTo(col1X, bottomY + 55)
       .lineTo(col1X + 220, bottomY + 55)
       .stroke();

    doc.fillColor('#0f172a')
       .fontSize(9)
       .font('Helvetica-Bold')
       .text('Digital Regulatory Officer', col1X, bottomY + 60);

    doc.fillColor('#64748b')
       .fontSize(8)
       .font('Helvetica')
       .text('MAITRI 2.0 Regulatory Authority, Maharashtra', col1X, bottomY + 72);

    // Footer bar
    doc.fillColor('#94a3b8')
       .fontSize(7.5)
       .text(`Verification URL: ${verifyUrl} • Generated on ${new Date().toISOString()}`, 0, pageHeight - 38, { align: 'center' });

    doc.end();

    stream.on('finish', () => {
      resolve({
        certificateId,
        certificateUrl: relativeUrl,
        issuedAt,
        validUntil
      });
    });

    stream.on('error', (err) => {
      reject(err);
    });
  });
}

module.exports = {
  generateApprovalCertificate,
  generateCertificateId
};
