# UdyogSetu (Vibecode)

## Smart Regulatory Planning & Cognitive Compliance Gateway for SIH26130

### Overview
UdyogSetu is an intelligent middleware solution designed to solve the cognitive bottleneck in the Maharashtra industrial approval workflow. While the state's MAITRI 2.0 portal successfully digitizes document routing, human officers are overwhelmed by the statutory mandate to approve green/orange category industries within 48 hours under the Maha Parwana initiative.

UdyogSetu acts as an algorithmic compiler, validating engineering plans, administrative PDFs, and legal workflows before submission. This ensures officers only receive pre-verified, deterministic compliance reports, allowing them to meet their Service Level Agreements (SLAs).

### Core Features
**1. Zero-Entry Entity Verification Gateway (Auth)**
Eliminates redundant data entry across 20+ departmental forms by fetching verified business entity data (PAN, GSTIN, DigiLocker incorporation documents) autonomously. Features dual-role login for both Entrepreneurs and Department Officers.

**2. Topological Regulatory Dependency Engine (Roadmap)**
Generates a personalized, interactive Directed Acyclic Graph (DAG) based on initial business parameters (e.g., Red/Orange/Green category, investment size). It maps out sequential blockers and visualizes the fastest legal path for parallel approvals, completely replacing static, confusing checklists.

**3. Multimodal Administrative Document Extractor (OCR)**
Utilizes OCR and language models to process unstructured, text-heavy administrative submissions. It extracts structured entities from complex tables and multi-column formats to auto-fill future compliance requirements.

**4. Officer Verification Dashboard & Insights**
A dedicated portal for government officers to receive and review applications that have reached 100% system accuracy. It features a "Common Errors" analytics widget to identify recurring compliance failure points (e.g., missing digital signatures) for their specific department.

**5. Deterministic Compliance Validator (RAG Chatbot)**
Extracted data and user queries are processed against a localized knowledge base built from state statutes. This acts as an AI Copilot that can deterministically answer eligibility questions regarding government schemes and subsidies mapped to the specific industry.

**6. MRTPS Act SLA Enforcer & Escalation Matrix (Reminders)**
A backend scheduler that actively tracks application lifecycles against the statutory deadlines mandated by the Maharashtra Right to Public Services (MRTPS) Act, 2015. If a department breaches a time limit, the system automatically generates escalation alerts via email.

---

### Excluded Features (Scope & Feasibility Limits)
To ensure a fully functional and legally compliant prototype within the hackathon timeframe, the following originally proposed features were excluded:
* **Live MAITRI 2.0 Integration**: Direct bidirectional API access to live production state portals is firewall-blocked; the project utilizes local mock states for demonstration.
* **Vector-Geometric CAD Pre-Scrutiny Engine**: Excluded due to the complexity of parsing geometric CAD layers (ezdxf) within a 36-hour build window.
* **Regulatory Scraper Alerts**: Excluded as parsing unstructured, inconsistent Indian legal gazettes via automated web scraping is too volatile.

---

### Tech Stack
* **Frontend**: React.js, Tailwind CSS, Vite
* **Backend**: Node.js / Express
* **Database**: MongoDB Atlas (User State, Rules Engine, Schemes)
* **Intelligence**: Google Gemini (RAG, Embeddings, Chatbot)

---

### Setup & Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   ```

2. **Database Setup**
   Ensure you have a MongoDB connection string. Add it to `server/.env`:
   ```
   MONGODB_URI=your_mongo_url
   GEMINI_API_KEY=your_gemini_key
   PORT=5000
   ```

3. **Seed Data**
   ```bash
   cd server
   npm run seed        # Seeds approvals and schemes
   npm run build-kb    # Builds RAG knowledge base
   npm run seed-demo   # Creates realistic demo profiles
   ```

4. **Start Servers**
   ```bash
   # Terminal 1 (Backend)
   cd server && npm run dev
   
   # Terminal 2 (Frontend)
   cd client && npm run dev
   ```
