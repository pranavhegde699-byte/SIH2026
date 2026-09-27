/**
 * Build Knowledge Base Script
 * 
 * Reads all Approvals and Schemes from the database, constructs text chunks,
 * embeds them using Gemini's text-embedding-004, and stores the results in
 * the KnowledgeChunk collection.
 * 
 * Run: npm run build-kb
 * Must be re-run if Approval/Scheme data ever changes.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Approval = require('../models/Approval');
const Scheme = require('../models/Scheme');
const KnowledgeChunk = require('../models/KnowledgeChunk');
const { embedText } = require('../services/embeddingService');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const buildKnowledgeBase = async () => {
  try {
    await connectDB();

    const approvals = await Approval.find({});
    const schemes = await Scheme.find({});

    // EDGE CASE: if collections are empty, warn and exit
    if (approvals.length === 0 && schemes.length === 0) {
      console.warn('⚠️  WARNING: Both Approval and Scheme collections are empty!');
      console.warn('   Run "npm run seed" first to populate the database.');
      process.exit(0);
    }

    console.log(`Found ${approvals.length} Approvals and ${schemes.length} Schemes.`);
    console.log('Clearing existing KnowledgeChunk collection...');
    await KnowledgeChunk.deleteMany({});

    const chunks = [];
    let total = approvals.length + schemes.length;
    let processed = 0;

    // Process Approvals
    for (const approval of approvals) {
      const text = [
        `Approval: ${approval.name}`,
        `Department: ${approval.department}`,
        `Description: ${approval.description}`,
        `Applicable Industries: ${approval.applicableIndustryTypes.join(', ')}`,
        `Applicable Sectors: ${approval.applicableSectors.join(', ')}`,
        `Required Documents: ${approval.requiredDocuments.join(', ')}`,
        approval.source ? `Source Portal: ${approval.source}` : ''
      ].filter(Boolean).join('\n');

      const embedding = await embedText(text);
      chunks.push({
        sourceType: 'Approval',
        sourceId: approval._id,
        sourceName: approval.name,
        text,
        embedding
      });

      processed++;
      console.log(`Embedded ${processed}/${total} — ${approval.name}`);
      await sleep(250); // Rate-limit friendly pacing
    }

    // Process Schemes
    for (const scheme of schemes) {
      const text = [
        `Government Scheme: ${scheme.name}`,
        `Department: ${scheme.department}`,
        `Eligibility Criteria: ${scheme.eligibilityCriteria}`,
        `Benefits: ${scheme.benefitDescription}`,
        `Applicable Industries: ${scheme.applicableIndustryTypes.join(', ')}`
      ].filter(Boolean).join('\n');

      const embedding = await embedText(text);
      chunks.push({
        sourceType: 'Scheme',
        sourceId: scheme._id,
        sourceName: scheme.name,
        text,
        embedding
      });

      processed++;
      console.log(`Embedded ${processed}/${total} — ${scheme.name}`);
      await sleep(250);
    }

    // Bulk insert
    await KnowledgeChunk.insertMany(chunks);
    console.log(`\n✅ Knowledge base built successfully! ${chunks.length} chunks stored.`);
    process.exit(0);

  } catch (error) {
    console.error('❌ Error building knowledge base:', error.message);
    process.exit(1);
  }
};

buildKnowledgeBase();
