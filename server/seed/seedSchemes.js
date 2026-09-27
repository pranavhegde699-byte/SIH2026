require('dotenv').config();
const mongoose = require('mongoose');
const Scheme = require('../models/Scheme');
const connectDB = require('../config/db');

// Realistic government schemes with matching parameters added (Day 6)
const schemesData = [
  {
    name: 'Credit Linked Capital Subsidy Scheme (CLCSS)',
    department: 'Ministry of MSME',
    eligibilityCriteria: 'MSEs upgrading their technology with institutional finance.',
    benefitDescription: '15% capital subsidy up to ₹15 Lakhs for technology upgradation.',
    applicableIndustryTypes: ['Manufacturing', 'Food Processing', 'Textiles', 'Pharmaceuticals'],
    applicableSectors: ['Micro', 'Small'],
    maxInvestment: 10000000 // up to 1Cr
  },
  {
    name: 'Prime Minister Employment Generation Programme (PMEGP)',
    department: 'KVIC / Ministry of MSME',
    eligibilityCriteria: 'Any individual above 18 years, or SHGs. New projects in manufacturing or service sector.',
    benefitDescription: 'Margin money subsidy ranging from 15% to 35% of project cost.',
    applicableIndustryTypes: ['Manufacturing', 'IT/Software', 'Food Processing', 'Textiles', 'Others'],
    applicableSectors: ['Micro'],
    maxInvestment: 5000000 // up to 50 Lakhs in manufacturing
  },
  {
    name: 'Interest Subsidy Scheme',
    department: 'Directorate of Industries',
    eligibilityCriteria: 'MSMEs availing term loan from scheduled commercial banks.',
    benefitDescription: '5% interest subsidy on term loan up to a maximum limit for 5 years.',
    applicableIndustryTypes: ['Manufacturing', 'IT/Software', 'Food Processing'],
    applicableSectors: ['Micro', 'Small', 'Medium']
  },
  {
    name: 'Stamp Duty Exemption for MSMEs',
    department: 'Revenue Department',
    eligibilityCriteria: 'New MSME units purchasing land or leasing sheds.',
    benefitDescription: '100% exemption on stamp duty for registration of land/shed.',
    applicableIndustryTypes: ['Manufacturing', 'IT/Software', 'Food Processing', 'Textiles', 'Pharmaceuticals', 'Others'],
    applicableSectors: ['Micro', 'Small', 'Medium']
  },
  {
    name: 'Lean Manufacturing Competitiveness Scheme',
    department: 'Ministry of MSME',
    eligibilityCriteria: 'Manufacturing MSMEs aiming to improve productivity and reduce waste.',
    benefitDescription: 'Financial assistance for engaging Lean Manufacturing consultants.',
    applicableIndustryTypes: ['Manufacturing', 'Food Processing', 'Textiles', 'Pharmaceuticals'],
    applicableSectors: ['Small', 'Medium'],
    minInvestment: 1000000 // Only makes sense for larger ops
  }
];

const seedSchemes = async () => {
  try {
    await connectDB();
    console.log('Clearing existing Scheme data...');
    await Scheme.deleteMany({});
    
    console.log('Inserting seed Scheme data...');
    await Scheme.insertMany(schemesData);
    
    console.log('Scheme data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding Schemes:', error);
    process.exit(1);
  }
};

seedSchemes();
