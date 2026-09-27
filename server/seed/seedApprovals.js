require('dotenv').config();
const mongoose = require('mongoose');
const Approval = require('../models/Approval');
const connectDB = require('../config/db');

// This is seed/mock data simulating what would be fetched from MAITRI/NSWS APIs in production.
// No live government API is called.

const approvalsData = [
  {
    name: 'Udyam Registration',
    department: 'Ministry of MSME',
    applicableIndustryTypes: ['Manufacturing', 'IT/Software', 'Food Processing', 'Textiles', 'Pharmaceuticals', 'Others'],
    applicableSectors: ['Micro', 'Small', 'Medium'],
    description: 'Basic registration for MSME status.',
    requiredDocuments: ['Aadhaar Card', 'PAN Card', 'Bank Account Details'],
    source: 'NSWS'
  },
  {
    name: 'Trade License',
    department: 'Local Municipal Corporation',
    applicableIndustryTypes: ['Manufacturing', 'IT/Software', 'Food Processing', 'Textiles', 'Pharmaceuticals', 'Others'],
    applicableSectors: ['Micro', 'Small', 'Medium'],
    description: 'Permission to carry out a particular trade or business.',
    requiredDocuments: ['Premises Proof', 'ID Proof', 'NOC from Neighbors'],
    source: 'MAITRI'
  },
  {
    name: 'Building Plan Approval',
    department: 'Town Planning Department',
    applicableIndustryTypes: ['Manufacturing', 'Food Processing', 'Textiles', 'Pharmaceuticals'],
    applicableSectors: ['Micro', 'Small', 'Medium'],
    description: 'Approval of factory/building layout before construction.',
    requiredDocuments: ['Land Ownership Proof', 'Architectural Drawings', 'Structural Details'],
    source: 'MAITRI'
  },
  {
    name: 'Fire NOC',
    department: 'Fire Services Department',
    applicableIndustryTypes: ['Manufacturing', 'Food Processing', 'Textiles', 'Pharmaceuticals', 'Others'],
    applicableSectors: ['Small', 'Medium'],
    description: 'No Objection Certificate for fire safety compliance.',
    requiredDocuments: ['Building Plan Approval', 'Fire Safety Measures Checklist', 'Premises Layout'],
    source: 'MAITRI'
  },
  {
    name: 'Pollution Control Board Consent to Establish (CTE)',
    department: 'State Pollution Control Board',
    applicableIndustryTypes: ['Manufacturing', 'Food Processing', 'Textiles', 'Pharmaceuticals'],
    applicableSectors: ['Micro', 'Small', 'Medium'],
    description: 'Initial consent required before establishing the unit.',
    requiredDocuments: ['Project Report', 'Site Plan', 'Details of Effluent Treatment'],
    source: 'NSWS'
  },
  {
    name: 'Pollution Control Board Consent to Operate (CTO)',
    department: 'State Pollution Control Board',
    applicableIndustryTypes: ['Manufacturing', 'Food Processing', 'Textiles', 'Pharmaceuticals'],
    applicableSectors: ['Micro', 'Small', 'Medium'],
    description: 'Consent required before commencing production/operations.',
    requiredDocuments: ['CTE Copy', 'Installation Certificate of Pollution Control Equipment'],
    source: 'NSWS'
  },
  {
    name: 'Factory License under Factories Act',
    department: 'Directorate of Industrial Safety and Health',
    applicableIndustryTypes: ['Manufacturing', 'Food Processing', 'Textiles', 'Pharmaceuticals'],
    applicableSectors: ['Micro', 'Small', 'Medium'],
    description: 'Mandatory license for manufacturing units with 10+ employees using power.',
    requiredDocuments: ['Factory Layout Plan', 'List of Machinery', 'Details of Employees'],
    source: 'MAITRI'
  },
  {
    name: 'GST Registration',
    department: 'CBIC / State Commercial Tax Department',
    applicableIndustryTypes: ['Manufacturing', 'IT/Software', 'Food Processing', 'Textiles', 'Pharmaceuticals', 'Others'],
    applicableSectors: ['Micro', 'Small', 'Medium'],
    description: 'Tax registration for supply of goods and services.',
    requiredDocuments: ['PAN Card', 'Business Registration Proof', 'Bank Statement', 'Address Proof'],
    source: 'NSWS'
  },
  {
    name: 'Labour Welfare Registration (EPFO & ESIC)',
    department: 'Ministry of Labour and Employment',
    applicableIndustryTypes: ['Manufacturing', 'IT/Software', 'Food Processing', 'Textiles', 'Pharmaceuticals', 'Others'],
    applicableSectors: ['Micro', 'Small', 'Medium'],
    description: 'Registration for employee provident fund and state insurance.',
    requiredDocuments: ['PAN Card', 'GST Certificate', 'List of Employees', 'Bank Details'],
    source: 'NSWS'
  },
  {
    name: 'Shops & Establishment Registration',
    department: 'Labour Department',
    applicableIndustryTypes: ['IT/Software', 'Others'],
    applicableSectors: ['Micro', 'Small', 'Medium'],
    description: 'Registration for commercial establishments and shops.',
    requiredDocuments: ['ID Proof', 'Address Proof of Shop', 'Rent Agreement'],
    source: 'MAITRI'
  },
  {
    name: 'FSSAI License',
    department: 'Food Safety and Standards Authority of India',
    applicableIndustryTypes: ['Food Processing'],
    applicableSectors: ['Micro', 'Small', 'Medium'],
    description: 'Mandatory license for all food-related businesses.',
    requiredDocuments: ['Photo ID', 'List of Food Products', 'Premises Proof'],
    source: 'NSWS'
  },
  {
    name: 'Electricity Connection NOC',
    department: 'State Electricity Board',
    applicableIndustryTypes: ['Manufacturing', 'Food Processing', 'Textiles', 'Pharmaceuticals'],
    applicableSectors: ['Micro', 'Small', 'Medium'],
    description: 'Approval for industrial power connection.',
    requiredDocuments: ['Ownership Proof', 'Estimated Load Details', 'Wiring Certificate'],
    source: 'MAITRI'
  },
  {
    name: 'Professional Tax Registration',
    department: 'State Commercial Tax Department',
    applicableIndustryTypes: ['Manufacturing', 'IT/Software', 'Food Processing', 'Textiles', 'Pharmaceuticals', 'Others'],
    applicableSectors: ['Micro', 'Small', 'Medium'],
    description: 'Registration for tax levied on trades, callings, and employments.',
    requiredDocuments: ['Company Registration Proof', 'PAN Card', 'Bank Account Details'],
    source: 'MAITRI'
  },
  {
    name: 'Drug Manufacturing License',
    department: 'State Drugs Standard Control Organization',
    applicableIndustryTypes: ['Pharmaceuticals'],
    applicableSectors: ['Micro', 'Small', 'Medium'],
    description: 'License required to manufacture allopathic, homeopathic, or ayurvedic drugs.',
    requiredDocuments: ['Site Plan', 'List of Machinery', 'Details of Technical Staff', 'Proof of Constitution'],
    source: 'NSWS'
  },
  {
    name: 'Boiler Registration',
    department: 'Directorate of Boilers',
    applicableIndustryTypes: ['Manufacturing', 'Textiles', 'Food Processing', 'Pharmaceuticals'],
    applicableSectors: ['Small', 'Medium'],
    description: 'Registration of boilers under the Indian Boilers Act.',
    requiredDocuments: ['Manufacturer Certificate', 'Drawing of Boiler', 'Installation details'],
    source: 'MAITRI'
  }
];

const seedApprovals = async () => {
  try {
    await connectDB();
    console.log('Clearing existing Approval data...');
    await Approval.deleteMany({});
    
    console.log('Inserting seed Approval data (Pass 1 - No dependencies)...');
    const insertedApprovals = await Approval.insertMany(approvalsData);
    
    console.log('Setting up dependencies (Pass 2)...');
    
    // Helper function to find ID by name
    const getId = (name) => {
      const approval = insertedApprovals.find(a => a.name === name);
      return approval ? approval._id : null;
    };

    // Realistic logical dependencies
    const dependencyMap = {
      'Fire NOC': ['Building Plan Approval'],
      'Pollution Control Board Consent to Establish (CTE)': ['Udyam Registration'],
      'Pollution Control Board Consent to Operate (CTO)': ['Pollution Control Board Consent to Establish (CTE)'],
      'Factory License under Factories Act': ['Building Plan Approval', 'Pollution Control Board Consent to Operate (CTO)'],
      'FSSAI License': ['Udyam Registration'],
      'Drug Manufacturing License': ['Pollution Control Board Consent to Establish (CTE)']
    };

    for (const [name, deps] of Object.entries(dependencyMap)) {
      const targetId = getId(name);
      if (targetId) {
        const depIds = deps.map(d => getId(d)).filter(id => id != null);
        await Approval.findByIdAndUpdate(targetId, { $set: { dependsOn: depIds } });
      }
    }
    
    console.log('Approval data seeded successfully with dependencies!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding Approvals:', error);
    process.exit(1);
  }
};

seedApprovals();
