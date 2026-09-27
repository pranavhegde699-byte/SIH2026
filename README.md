# UdyogSetu: Smart Regulatory Planning & Cognitive Compliance Gateway

![UdyogSetu Banner](https://via.placeholder.com/1200x300.png?text=UdyogSetu+Smart+Compliance+Gateway)

## 📖 Introduction
**UdyogSetu** is an advanced, end-to-end Smart Regulatory Planning and Cognitive Compliance Gateway built for Micro, Small & Medium Enterprises (MSMEs) in India. The process of setting up a business requires interacting with multiple government agencies (like the Ministry of MSME, State Pollution Control Boards, Municipal Corporations, etc.) to get NOCs, licenses, and clearances. 

UdyogSetu eliminates the friction of this fragmented process by providing a unified, AI-driven platform. It automatically calculates the precise regulatory roadmap an enterprise needs based on its specific attributes, securely processes and verifies their documents using OCR, and routes the applications directly to the relevant government officers for review—all bound by strict Service Level Agreement (SLA) timelines.

---

## ✨ Core Features & Modules

### 1. 🧭 Intelligent Regulatory Roadmap Generator
Instead of manually researching which licenses are needed, entrepreneurs input their business details (Industry Type, Sector, Investment Amount). The rules engine evaluates these parameters against compliance matrices to generate a personalized, chronological roadmap of necessary approvals (e.g., Udyam Registration -> Trade License -> Fire NOC -> Pollution CTE).

### 2. 📄 Automated Document Management & Verification (OCR)
When an entrepreneur uploads a mandatory document (like an Aadhaar card or PAN card), UdyogSetu doesn't just store the PDF. 
- It processes the document using **Tesseract OCR**.
- It extracts the text to cross-check for required keywords (e.g., matching the PAN number with the business profile).
- Status auto-updates: When all required documents for an approval are uploaded and verified, the application is automatically submitted to the officer's queue.

### 3. 🔐 Smart Role-Based Access Control (RBAC)
The system is built on a strict role-based architecture:
* **Entrepreneurs (Citizens):** Have access to their personal dashboard, can create business profiles, track the roadmap progress, upload documents, and interact with the AI assistant.
* **Government Officers (Admins):** Log in to a specialized Officer Dashboard filtered by their specific department (or view all departments). They see an inbox of submitted applications, can review the extracted OCR data, view uploaded PDFs, and execute Approve/Reject decisions.

### 4. ⏳ SLA & Timeline Tracking (MRTPS Compliance)
To ensure government accountability, UdyogSetu implements an SLA tracker inspired by the Maharashtra Right to Public Services (MRTPS) Act and the Maha Parwana framework.
- Each approval has a predefined time limit (e.g., 48 hours, 7 days).
- Countdown timers are visible on both the entrepreneur's dashboard and the officer's inbox.
- Applications nearing their breach time are flagged as "Urgent" in the officer's dashboard.

### 5. 🤖 AI Compliance Assistant
A contextual AI chatbot is embedded directly into the platform. Built using RAG (Retrieval-Augmented Generation) principles, it queries a built-in knowledge base to answer specific regulatory questions (e.g., "What documents do I need for a Fire NOC in the chemical manufacturing sector?"). 

### 6. 📜 Digital Certificates
Once a government officer approves an application, the system dynamically generates a secure, downloadable Digital Certificate (in PDF format). It features a unique Application ID, timestamps, and a QR code for future verification.

### 7. 🎯 Government Scheme Discovery
A dedicated portal where MSMEs can browse various government schemes (e.g., PMEGP, CGTMSE). The system matches the entrepreneur's profile against scheme eligibility criteria to recommend the best financial aid options.

---

## 🏗️ Technical Architecture & Stack

The project is built on a modern **MERN** (MongoDB, Express, React, Node.js) architecture.

### **Frontend (Client)**
- **Framework:** React.js (Bootstrapped with Vite for high performance)
- **Styling:** Tailwind CSS for a highly responsive, modern, and accessible UI.
- **Animations:** Framer Motion for smooth page transitions and micro-interactions.
- **Data Visualization:** Recharts for analytics on the Officer Dashboard.
- **Icons & UI Elements:** Lucide React.
- **Routing:** React Router DOM.

### **Backend (Server)**
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (using Mongoose ODM)
- **Document Processing:** Tesseract.js (Optical Character Recognition)
- **File Uploads:** Multer (handling multipart/form-data)
- **Authentication:** Custom Role-Based Auth via API Headers.

---

## 📂 Database Schema Overview

The MongoDB database consists of several interconnected collections:

1. **Users:** Stores authentication credentials, roles (`entrepreneur` or `officer`), and department assignments.
2. **BusinessProfiles:** Stores enterprise details (Name, PAN, Industry Type, Sector).
3. **Approvals:** The static catalog of all possible government licenses, mapping which departments issue them and what documents are required.
4. **ApplicationStatus:** The crucial junction table tracking the state of a specific approval for a specific business profile. (States: `not_started`, `documents_pending`, `submitted`, `under_review`, `approved`, `rejected`).
5. **Documents:** Tracks individual uploaded files, their AWS S3/local file paths, and OCR verification statuses.
6. **Schemes:** Catalog of government schemes with eligibility criteria.

---

## 🚀 Local Development Setup

Follow these steps to run UdyogSetu locally on your machine.

### Prerequisites
- Node.js (v18.0.0 or higher)
- MongoDB (Local instance or MongoDB Atlas URI)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/pranavhegde699-byte/SIH2026.git
cd SIH2026
```

### 2. Configure & Start the Backend Server
```bash
# Navigate to the server directory
cd server

# Install dependencies
npm install

# Create environment variables file
# Create a .env file and add the following:
# PORT=5000
# MONGO_URI=mongodb://localhost:27017/udyogsetu  (Or your Atlas URL)

# Start the development server
npm run dev
```
*The backend API will be running at `http://localhost:5000`.*

### 3. Configure & Start the Frontend Client
Open a **new terminal window**.
```bash
# Navigate to the client directory
cd client

# Install dependencies
npm install

# Create environment variables file
# Create a .env file and add:
# VITE_API_URL=http://localhost:5000

# Start the Vite development server
npm run dev
```
*The application UI will be running at `http://localhost:5173`.*

---

## 🚦 Usage Guide: Testing the Flow

To test the complete lifecycle of an application, follow this exact sequence:

1. **Register as an Entrepreneur:**
   - Go to `http://localhost:5173/login`.
   - Create a new account with the role "Entrepreneur".
   - Fill in your mock business details.
2. **Upload Documents:**
   - On your Entrepreneur Dashboard, you will see your auto-generated roadmap.
   - Click on an approval (e.g., "Udyam Registration").
   - Upload the required PDF documents.
   - *Note: Once all required documents are uploaded, the system will automatically submit the application to the government.*
3. **Log out.**
4. **Register as an Officer:**
   - Go back to the login page and create a new account.
   - Set the role to "Officer" and select "All Departments".
5. **Review the Application:**
   - On the Officer Dashboard, you will see the application you just submitted.
   - Click on it to review the extracted document data.
   - Click **Approve** to generate the digital certificate.

---
*Built with ❤️ for the Smart India Hackathon (SIH)*
