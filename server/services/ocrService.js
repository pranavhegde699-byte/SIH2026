const Tesseract = require('tesseract.js');
const fs = require('fs');
const pdfParse = require('pdf-parse');

/**
 * Lightweight extraction layer.
 * Note: This is not a production document-understanding system.
 */
const extractFields = (text, documentType) => {
  const fields = {};
  const issues = [];
  
  if (!text || text.trim().length === 0) {
    issues.push("Could not extract text from document — please upload a clearer copy.");
    return { extractedFields: {}, validationIssues: issues };
  }

  // Basic generic regex extraction
  const dateMatch = text.match(/\b\d{2}[\/\-]\d{2}[\/\-]\d{4}\b/);
  if (dateMatch) fields.dateFound = dateMatch[0];

  const pinMatch = text.match(/\b\d{6}\b/);
  if (pinMatch) fields.pinCode = pinMatch[0];

  // Specific rule-based validation
  if (documentType.toLowerCase().includes('pan')) {
    const panMatch = text.match(/[A-Z]{5}[0-9]{4}[A-Z]/);
    if (panMatch) {
      fields.panNumber = panMatch[0];
    } else {
      issues.push("PAN number not detected — please verify the document.");
    }
  }

  if (documentType.toLowerCase().includes('aadhaar')) {
    const aadhaarMatch = text.match(/\b\d{4}\s\d{4}\s\d{4}\b/);
    if (aadhaarMatch) {
      fields.aadhaarNumber = aadhaarMatch[0];
    } else {
      issues.push("Aadhaar number pattern not detected — please verify.");
    }
  }

  return { extractedFields: fields, validationIssues: issues };
};

const processDocument = async (filePath, mimeType, documentType) => {
  try {
    let extractedText = '';

    if (mimeType === 'application/pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      extractedText = data.text;
      
      // If pdf-parse found no text, we might try OCR on PDF, but tesseract.js 
      // natively prefers images. For a prototype, we'll assume text PDFs work 
      // via pdf-parse, and if it's blank, it falls back to the generic issue message.
    } else if (mimeType.startsWith('image/')) {
      const result = await Tesseract.recognize(filePath, 'eng');
      extractedText = result.data.text;
    }

    return extractFields(extractedText, documentType);
  } catch (error) {
    console.error("OCR Service Error:", error);
    throw new Error('Failed to process document text extraction');
  }
};

module.exports = { processDocument };
