# UdyogSetu: Smart Regulatory Planning & Compliance Gateway

UdyogSetu is a comprehensive Smart Regulatory Planning & Cognitive Compliance Gateway designed specifically for MSMEs (Micro, Small & Medium Enterprises) in India. It acts as a bridge between entrepreneurs and government departments, streamlining the complex process of obtaining multiple approvals, clearances, and licenses required to start and operate a business.

## 🚀 Key Features

* **Intelligent Regulatory Roadmap:** Auto-generates a personalized, step-by-step regulatory roadmap based on the business type, sector, and location.
* **Document Management with OCR Extraction:** Seamlessly upload required documents (Aadhaar, PAN, GST, etc.). The system uses Tesseract OCR to automatically extract text and verify document authenticity.
* **Smart Role-Based Access Control (RBAC):** Distinct workflows for Entrepreneurs and Government Officers. Entrepreneurs manage their profiles and submit applications, while Officers have a dedicated dashboard to review, approve, or reject submissions.
* **SLA & Timeline Tracking:** Real-time countdown timers for application reviews based on the MRTPS Act (Maha Parwana 48-hour guarantee), ensuring accountability and transparency.
* **Digital Certificates:** Auto-generates verifiable digital approval certificates with QR codes upon successful clearance by the officer.
* **AI Compliance Assistant:** A built-in chatbot powered by a knowledge base to answer compliance queries, guide users through forms, and explain regulatory requirements.
* **Government Scheme Discovery:** A dedicated module for entrepreneurs to browse, filter, and check their eligibility for various MSME schemes.

## 💻 Tech Stack

**Frontend:**
* React.js (Vite)
* Tailwind CSS
* Framer Motion (Animations)
* Recharts (Data Visualization)
* Lucide React (Icons)

**Backend:**
* Node.js
* Express.js
* MongoDB & Mongoose (Database)
* Tesseract.js (Optical Character Recognition)
* Multer (File Upload Handling)

## 🛠️ Local Setup Instructions

### Prerequisites
* Node.js (v18+)
* MongoDB (Local or Atlas URI)

### 1. Clone the repository
```bash
git clone https://github.com/pranavhegde699-byte/SIH2026.git
cd SIH2026
```

### 2. Setup the Backend
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory and add your environment variables (e.g., `MONGO_URI`, `PORT=5000`).
```bash
npm run dev
```

### 3. Setup the Frontend
Open a new terminal and navigate to the client folder:
```bash
cd client
npm install
```
Create a `.env` file in the `client` directory (if needed, e.g., `VITE_API_URL=http://localhost:5000`).
```bash
npm run dev
```

### 4. Access the Application
Open your browser and navigate to `http://localhost:5173`.

## 👥 User Roles

* **Entrepreneur:** Registers their business, views the required roadmap, uploads necessary documents, and submits applications for official review.
* **Officer:** Logs in to view a dashboard of submitted applications categorized by department. They can review uploaded documents and either approve or reject the application.

---
*Developed for Smart India Hackathon (SIH)*
