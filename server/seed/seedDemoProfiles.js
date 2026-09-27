require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const BusinessProfile = require('../models/BusinessProfile');
const ApplicationStatus = require('../models/ApplicationStatus');
const Approval = require('../models/Approval');

const seedDemoData = async () => {
  try {
    await connectDB();
    console.log('Seeding demo profiles...');

    // Demo Profile 1: Small Textile Manufacturing
    const profile1 = await BusinessProfile.create({
      businessName: 'Vastra Textiles (Demo)',
      industryType: 'Textiles',
      sector: 'Small',
      investmentAmount: 7500000, // 75 Lakhs
      employeeCount: 40,
      businessActivity: 'Manufacturing of cotton yarn and fabrics.',
      location: { state: 'Maharashtra', district: 'Mumbai' },
      email: 'demo1@example.com'
    });

    // Demo Profile 2: Micro Food Processing
    const profile2 = await BusinessProfile.create({
      businessName: 'FreshBites Snacks (Demo)',
      industryType: 'Food Processing',
      sector: 'Micro',
      investmentAmount: 1500000, // 15 Lakhs
      employeeCount: 8,
      businessActivity: 'Processing and packaging of organic snacks.',
      location: { state: 'Karnataka', district: 'Bangalore' },
      email: 'demo2@example.com'
    });

    // Demo Profile 3: Medium IT/Software
    const profile3 = await BusinessProfile.create({
      businessName: 'CloudTech Solutions (Demo)',
      industryType: 'IT/Software',
      sector: 'Medium',
      investmentAmount: 20000000, // 2 Cr
      employeeCount: 150,
      businessActivity: 'SaaS development and cloud consulting.',
      location: { state: 'Telangana', district: 'Hyderabad' },
      email: 'demo3@example.com'
    });

    console.log('Created 3 demo profiles.');

    // Seed realistic statuses for Profile 1 (Vastra Textiles)
    console.log('Seeding ApplicationStatus records for Vastra Textiles...');
    const approvals = await Approval.find({ applicableIndustryTypes: 'Textiles', applicableSectors: 'Small' });
    
    if (approvals.length > 0) {
      const udyam = approvals.find(a => a.name.includes('Udyam'));
      const fire = approvals.find(a => a.name.includes('Fire'));
      const pollution = approvals.find(a => a.name.includes('Consent to Establish'));
      const trade = approvals.find(a => a.name.includes('Trade'));

      const statuses = [];
      
      if (udyam) {
        statuses.push({
          businessProfileId: profile1._id,
          approvalId: udyam._id,
          status: 'approved',
          statusHistory: [{ status: 'approved', changedAt: new Date() }]
        });
      }
      if (fire) {
        statuses.push({
          businessProfileId: profile1._id,
          approvalId: fire._id,
          status: 'submitted',
          expectedCompletionDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
          statusHistory: [{ status: 'submitted', changedAt: new Date() }]
        });
      }
      if (pollution) {
        statuses.push({
          businessProfileId: profile1._id,
          approvalId: pollution._id,
          status: 'documents_pending',
          expectedCompletionDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days (for reminder)
          statusHistory: [{ status: 'documents_pending', changedAt: new Date() }]
        });
      }
      if (trade) {
        statuses.push({
          businessProfileId: profile1._id,
          approvalId: trade._id,
          status: 'not_started',
          statusHistory: [{ status: 'not_started', changedAt: new Date() }]
        });
      }

      await ApplicationStatus.insertMany(statuses);
      console.log(`Created ${statuses.length} status records for Profile 1.`);
    }

    console.log('\n✅ Demo Data Seeded Successfully!');
    console.log('\n--- USE THESE IDs FOR YOUR DEMO ---');
    console.log(`Profile 1 (Textiles, Small - Mixed Statuses): ${profile1._id}`);
    console.log(`Profile 2 (Food Processing, Micro - Fresh state): ${profile2._id}`);
    console.log(`Profile 3 (IT/Software, Medium - Generic approvals): ${profile3._id}`);
    console.log('-----------------------------------');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding demo data:', error);
    process.exit(1);
  }
};

seedDemoData();
