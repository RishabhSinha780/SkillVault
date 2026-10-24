# SkillVault · Frontend Client

SkillVault is a centralised digital credentialing and achievement repository designed for Higher Education Institutions under the Government of Jammu & Kashmir (**Smart Education Initiative · SIH25093**).

This frontend application is built with **React (Vite)**, **Tailwind CSS v4**, **React Router v7**, **Lucide React**, **Framer Motion**, **Recharts**, and **QRCode.react**, adopting the sleek, calm, dark aesthetic inspired by PointoPark.

---

## 🚀 Quick Start Instructions

To run the frontend locally:

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install dependencies (if not already installed)
npm install

# 3. Launch the Vite development server
npm run dev
```

The application will be accessible at `http://localhost:5173`.

---

## 🎨 Theme & Design Guidelines

- **Base Background**: `#172120` (Deep obsidian forest green-black)
- **Surface Cards**: `#1E2B2A` with `rgba(255, 255, 255, 0.08)` borders & `20px - 28px` rounded corners
- **Primary Text**: `#F3F1EA` (Off-white silk)
- **Muted Text**: `#9FB0AD`
- **Primary Accent**: `#B7F34A` (Vibrant electric mint / lime with subtle glow)
- **Status Accents**:
  - Approved: `#B7F34A` / Emerald `#22c55e`
  - Pending: Amber `#F59E0B`
  - Rejected: Rose `#F43F5E`
- **Typography**:
  - Headings: **Fraunces** serif (Google Fonts) with italic accent word styling
  - Body: **Inter** clean sans-serif

---

## 🗺️ Application Routing

- **`/`**: Split-panel Login & Registration screen with 3 role tabs (Student, Recruiter, Admin), password show/hide toggle, and inline validations.
- **`/student`**: Client-side protected Student Dashboard with Welcome Hero, Stat cards, S3-ready Upload card, Activity timeline with blockchain audit proofs, AI Skill-Gap Radar chart, and Recruiter QR code generator.
- **`/coming-soon?role=admin` & `?role=recruiter`**: Dedicated placeholder portal for institutional accreditation teams and enterprise recruiters.

---

## 🔌 Backend & API Integration Roadmap

All mock data is currently encapsulated in `src/data/mock.js` and state is managed via `AuthContext.jsx`. The exact touchpoints where real backend services will be plugged in are detailed below:

### 1. Authentication & Role-Based Access Control (RBAC)
- **Location**: `src/context/AuthContext.jsx` -> `login()` & `logout()`
- **Future Integration**: Replace fake 800ms timer with `POST /api/v1/auth/login` and `POST /api/v1/auth/register`. Store JWT or HTTP-only secure cookie and decode institutional role claims (`student`, `faculty`, `admin`, `recruiter`).

### 2. Proof Uploads via AWS S3 Presigned URLs
- **Location**: `src/components/UploadCard.jsx` -> `handleSubmit()`
- **Future Integration**:
  1. Frontend requests an authorized upload ticket: `POST /api/v1/storage/presigned-url` with `{ filename, fileType, category }`.
  2. Frontend streams the raw binary directly to Amazon S3 via `PUT ${presignedUrl}` with standard progress tracking.
  3. Frontend sends metadata and the S3 key `s3FileKey` to the GraphQL mutation / REST endpoint `POST /api/v1/activities`.

### 3. Faculty Verification & Approval Workflow
- **Location**: `src/components/Timeline.jsx` & Backend Microservice
- **Future Integration**: Faculty dashboard will invoke `POST /api/v1/activities/:id/approve` or `POST /api/v1/activities/:id/reject` with structured accreditation feedback (NAAC Criterion 5 tags).

### 4. Blockchain Hashing & EduLedger Minting
- **Location**: `src/components/ProofModal.jsx` & `src/components/PortfolioQR.jsx`
- **Future Integration**: Once faculty approves an achievement, the backend Python/Node.js blockchain worker computes the SHA-256 digest `H = SHA256(certificate_bytes + metadata + issuer_sig)` and submits a state transition to the Govt. of J&K Proof-of-Authority (PoA) Consortium Node. The resulting transaction hash and block number are returned to the client.

### 5. AI Skill-Gap & Vector Embedding Service
- **Location**: `src/components/SkillRadar.jsx`
- **Future Integration**: A Python FastAPI microservice utilizing `SentenceTransformers` / OpenAI embeddings evaluates the student's verified courseworks and achievements against live job scrapers and NEP 2020 curriculum mandates. Returns dynamic radar vectors, prioritized skill gaps, and customized next-step recommendations.

---

## 🛠️ Tech Stack Summary

- **Bundler & Runtime**: Vite + React 19
- **Styling**: Tailwind CSS v4
- **Routing**: React Router v7
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Data Visualization**: Recharts (Radar, PolarGrid, PolarAngleAxis)
- **Cryptographic QR**: QRCode.react (`QRCodeSVG`)
- **Interactive FX**: Canvas-Confetti
