# SkillVault · Project Implementation & Architecture Overview

> **Smart Education Initiative · SIH25093 · Higher Education Department, Govt. of Jammu & Kashmir**  
> *Centralised, blockchain-verified digital credential repository and AI-driven skill-gap platform for Higher Education Institutions (HEIs).*

---

## 📌 Executive Summary

Colleges and universities struggle with scattered, paper-based, unverified records of extra-curricular activities, technical hackathons, athletic achievements, and community service. This leads to friction during NAAC/NIRF accreditation audits and recruiter evaluations.

**SkillVault** solves this with a unified, role-based platform built around four pillars:
1. **Students**: Upload proof of achievements, track faculty approvals, inspect immutable blockchain verification digests, and benchmark their profiles with an AI skill-gap radar.
2. **Faculty**: Review and digitally validate institutional submissions.
3. **Institutional Admins**: Auto-aggregate verified achievements into structured NAAC Criterion 5 and NIRF metric reports.
4. **Recruiters & Evaluators**: Access instant, tamper-proof student portfolio links via cryptographically secure QR codes.

---

## 🗂️ Complete Directory Structure

```
Project/
├── IMPLEMENTATION_OVERVIEW.md          # Complete project implementation summary (this document)
├── backend/                            # Backend placeholder
│   └── README.md                       # Outlines planned Node.js, Express, S3, GraphQL & AI services
└── frontend/                           # Complete React 19 + Vite application
    ├── README.md                       # Frontend quickstart & backend integration touchpoints
    ├── index.html                      # Percent-encoded SVG favicon, theme-color, OG tags, Google Fonts
    ├── package.json                    # Minimal dependencies (Tailwind v4, Recharts, Lucide, Framer Motion)
    ├── vite.config.js                  # Vite configuration with @tailwindcss/vite plugin
    └── src/
        ├── App.jsx                     # Route declarations, ProtectedRoute & AuthProvider wrapping
        ├── main.jsx                    # React entrypoint (StrictMode)
        ├── index.css                   # PointoPark design system, custom scrollbars, subtle radial glows
        ├── context/
        │   └── AuthContext.jsx         # Role state, clean data merging, credential sanitization, 800ms auth delay
        ├── routes/
        │   └── ProtectedRoute.jsx      # Client-side route guard enforcing authentication & student role
        ├── data/
        │   └── mock.js                 # Realistic student record, timeline items, radar datasets & career paths
        ├── components/
        │   ├── Navbar.jsx              # Sticky header with shield check logo, fast section scrolling & user menu
        │   ├── Footer.jsx              # Institutional copyright, accreditation policies, & security labels
        │   ├── StatCard.jsx            # Animated metric counters & circular SVG verified score ring (94/100)
        │   ├── UploadCard.jsx          # Accessible file upload zone, PDF/image handling & S3 presigned URL comments
        │   ├── Timeline.jsx            # Vertical audit timeline, category & status filters, search input
        │   ├── ProofModal.jsx          # On-chain proof inspection modal with styled PDF placeholder & SHA-256 hash
        │   ├── SkillRadar.jsx          # Dark-mode Recharts Radar Chart, skill gap progress bars & career paths
        │   ├── PortfolioQR.jsx         # Scannable QRCodeSVG, one-click copyable link, demo-data tag & 01-02-03 step cards
        │   └── NotificationToast.jsx   # Interactive floating toast with aria-live="polite"
        └── pages/
            ├── Login.jsx               # Page 1: Split desktop layout, accessible inputs, role tabs, login/signup toggle
            ├── StudentDashboard.jsx    # Page 2: Student dashboard with useRef toast timers & celebratory confetti
            └── ComingSoon.jsx          # Role-aware placeholder for Admin and Recruiter portals (guarded)
```

---

## 🎨 Visual Design System (Inspired by PointoPark)

The user interface follows a modern, calm, dark aesthetic:

| Design Token | Value | Description |
| :--- | :--- | :--- |
| **Base Background** | `#172120` | Deep obsidian forest green-black |
| **Card Surface** | `#1E2B2A` | Elevated surface with `rgba(255, 255, 255, 0.08)` border |
| **Hover Surface** | `#233433` | Interactive card state |
| **Primary Text** | `#F3F1EA` | Off-white silk |
| **Muted Text** | `#9FB0AD` | Calm sage-tinted gray |
| **Primary Accent** | `#B7F34A` | Electric mint/lime for CTAs, active badges, and highlights |
| **Approved Accent**| `#B7F34A` / `#22C55E` | Mint / Emerald for verified status |
| **Pending Accent** | `#F59E0B` | Warm Amber for faculty review queue |
| **Rejected Accent**| `#F43F5E` | Rose for rejected submissions |
| **Serif Font**     | `Fraunces` | Elegant serif for headings with italic accent words |
| **Sans Font**      | `Inter` | Clean sans-serif for UI labels, tables, and body text |

### Signature Typography Pattern
Every section header features an uppercase eyebrow tag, accompanied by a heading where **one key word is set in italic serif using the `#B7F34A` accent color**:
- Eyebrow: `SMART EDUCATION, VERIFIED` → Heading: `Every achievement, *verified.*`
- Eyebrow: `STUDENT DASHBOARD` → Heading: `Welcome back, *Aarav.*`
- Eyebrow: `ACCREDITATION SUBMISSION` → Heading: `Upload *Achievement*`
- Eyebrow: `IMMUTABLE ACTIVITY LOG` → Heading: `Activity *Timeline*`
- Eyebrow: `AI POWERED CAREER VECTORIZATION` → Heading: `Skill-Gap & Career *Dashboard*`
- Eyebrow: `TAMPER-PROOF DISTRIBUTION` → Heading: `Verified Portfolio & *Recruiter QR*`

---

## 📄 Detailed Page Implementations

### Page 1: Login & Registration (`/`)
- **Desktop Split Layout**:
  - **Left Story Panel**: Eyebrow badge, main heading with italic mint accent, subtext, 3 feature cards (*Faculty-approved*, *Blockchain-verified QR*, *AI skill-gap insights*), and the Government of Jammu & Kashmir attribution.
  - **Right Login Card**:
    - 3 Segmented Pill Tabs: **Student** | **Recruiter** | **Admin**. Icons, headings, and helper copy update dynamically.
    - Mode toggle between **Log in** and **Sign up**.
    - Form fields automatically reset when toggling modes or switching roles to avoid state bleed.
    - Password starts as an empty string (`''`).
    - Full keyboard accessibility with unique `id` and `htmlFor` pairings, and proper `autoComplete` attributes (`email`, `current-password`, `new-password`, `name`, `organization`).
    - Password visibility toggle (Eye / EyeOff icon).
    - Inline error messages equipped with `role="alert"`.
    - "Forgot password?" triggers a non-intrusive `<NotificationToast>` (`"Demo mode: password reset is not connected yet."`) instead of a browser `alert()`.
    - Simulated 800ms network delay with animated loading spinner.
    - Quick-fill demo buttons in the top header for instant evaluation.
    - Post-login navigation: verifies `location.state.from` and redirects appropriately if matching the logged-in role; otherwise routes to default (`/student` or `/coming-soon`).

### Page 2: Student Welcome & Dashboard (`/student`)
Protected by `ProtectedRoute.jsx` (redirects unauthenticated users to `/`).

1. **Welcome Hero & Stat Metrics**:
   - Personalized greeting (`"Welcome back, Priya."` or `"Welcome back, Aarav."`), student institution (`NIT Srinagar`), roll number (`2022BCSE042`), and semester details.
   - Quick pill CTAs: `"Upload achievement →"` (scrolls to upload section) and `"Share my portfolio"` (scrolls to recruiter QR).
   - 4 animated stat counters: *Total Records*, *Approved*, *In Review*, *Rejected*.
   - Circular SVG gauge rendering the **Verified Score (94/100)** with cohort percentile ranking.

2. **Upload Achievement Card**:
   - Drag-and-drop zone with keyboard accessibility (`tabIndex={0}`, Enter/Space key support, visible focus ring), file validation (<10MB), and image/document preview.
   - Sets `fileUrl: null` and `fileType: 'pdf'` for PDF uploads (no random stock photos).
   - Clear architectural comments documenting future **AWS S3 Presigned URL** upload streaming.
   - Form inputs with `id` and `htmlFor` associations: Title, Category (*Technical, Sports, Cultural, Research, Internship, Volunteering*), Date, Description.
   - On submission, adds a new *Pending* record to the local timeline, displays a success toast, and fires celebratory confetti.

3. **Activity Timeline**:
   - Vertical timeline connected with category icons (Code, Trophy, Sparkles, Book, Briefcase, Heart).
   - Segmented filter tabs (*All*, *Approved*, *Pending*, *Rejected*) displaying live counts.
   - Category dropdown filter + instant search box.
   - For approved items:
     - Short blockchain hash chip (e.g., `0x7f4c…e6d1`).
     - `"View proof"` button opening the modal.
   - For rejected items: Displays formal evaluator feedback and reason for rejection.

4. **Proof Modal (On-Chain Certificate Inspection)**:
   - For image proofs: renders visual preview with digital watermark status.
   - For PDF documents: renders an elegant styled placeholder card with file icon, filename, and label `"PDF document · preview unavailable in demo"` (zero external image calls).
   - Subtle demo-data notice: `"Demo data: not a live blockchain record"`.
   - Full SHA-256 cryptographic hash with one-click copy utility.
   - Block number (`Block #1,849,204`), timestamp, consensus network (`Govt. J&K EduLedger PoA`), and NAAC Criterion 5 eligibility.

5. **AI Skill-Gap & Career Dashboard**:
   - Dark-mode **Recharts Radar Chart** comparing *Your Verified Skills* vs *Industry Benchmark* across three target archetypes:
     - **Full-Stack Developer** (84% match)
     - **Data Analyst** (78% match)
     - **ML Engineer** (72% match)
   - Actionable skill gap progress bars displaying percentage deltas and concrete recommendations.
   - 3 Career path recommendations with salary brackets, market growth indicators, and matched competencies.

6. **Verified Portfolio & Recruiter QR**:
   - Scannable SVG QR code generated with `qrcode.react`.
   - Subtle demo-data notice: `"Demo data: not a live blockchain record"`.
   - Copyable shareable URL (`https://skillvault.app/verify/STU-2025-0142`) with clipboard copy feedback.
   - 3 Numbered "How verification works" step cards:
     - `01` Faculty Approval
     - `02` SHA-256 Hash Minted
     - `03` Recruiter Instant Scan

7. **Toast Notifications**:
   - Managed via a `useRef` timer (`toastTimeoutRef`) ensuring consecutive toasts refresh cleanly without premature timer dismissals, with cleanup on unmount.
   - Container enhanced with `aria-live="polite"`.

8. **Footer**:
   - Minimalist accreditation references, privacy, terms, and copyright notices.

### Page 3: Coming Soon Portal (`/coming-soon?role=admin` or `recruiter`)
- **Route Guard**: Direct visits while logged out immediately redirect to `/`.
- Uses `currentRole` directly from authentication state to display appropriate module previews:
  - **Admin**: NAAC Criterion 5 & NIRF automated export engine, faculty approval workflows, state EduLedger consensus monitoring.
  - **Recruiter**: Verified talent discovery search, ATS integrations, batch background credential check.
- Interactive CTA to switch directly to the Student Dashboard demo.

---

## 🛠️ Technology Stack & Optimization

| Layer | Technology | Status |
| :--- | :--- | :--- |
| **Framework & Build** | React 19 + Vite 8 | Fast HMR, zero configuration overhead |
| **Styling** | Tailwind CSS v4 + `@tailwindcss/vite` | Modern CSS with theme tokens (PostCSS & Autoprefixer removed) |
| **Routing** | React Router v7 | Client-side routing with role-aware route guards |
| **Icons** | Lucide React | High-contrast, clean SVG icons (unused icons tree-shaken) |
| **Animations** | Framer Motion | Smooth layout transitions, modals, and toasts |
| **Charts** | Recharts | Interactive Radar Charts for skill-gap benchmarking |
| **QR Code** | `qrcode.react` (`QRCodeSVG`) | High-density scannable portfolio links |
| **Micro-Interactions**| `canvas-confetti` | Rewarding feedback on achievement submissions |
| **Code Hygiene** | Oxlint | **0 warnings and 0 errors** |

---

## 🔌 Future Backend Integration Roadmap

While this project is strictly **Frontend-Only**, integration points are prepared with architectural comments:

1. **Authentication (`/frontend/src/context/AuthContext.jsx`)**:
   - Replace simulated 800ms timer with `POST /api/v1/auth/login` and `POST /api/v1/auth/register`.
   - Store secure HTTP-only cookies with JWT session tokens and role claims.
2. **File Storage via S3 Presigned URLs (`/frontend/src/components/UploadCard.jsx`)**:
   - Step 1: Request presigned URL from backend (`POST /api/v1/storage/presigned-url`).
   - Step 2: Directly upload raw file binary from browser to AWS S3 (`PUT presignedUrl`).
   - Step 3: Transmit file metadata and S3 key to backend database (`POST /api/v1/activities`).
3. **Faculty Review Flow (`/frontend/src/components/Timeline.jsx`)**:
   - Faculty portal triggers `POST /api/v1/activities/:id/approve` or `reject` with NAAC tags.
4. **Blockchain Hash Minting (`/frontend/src/components/ProofModal.jsx`)**:
   - Background worker hashes the approved file bytes and metadata using SHA-256 and submits the record to the J&K EduLedger Proof-of-Authority node.
5. **AI Skill-Gap Microservice (`/frontend/src/components/SkillRadar.jsx`)**:
   - Python FastAPI service calculates cosine similarity embeddings between student achievements and industry job descriptors.

---

## ✅ Quality Assurance & Verification Results

- **Linter Check**: Passed `npm run lint` with **0 warnings and 0 errors**.
- **Production Build**: Verified with `npm run build` in `frontend/`. Compiled cleanly in 12.62s with **0 syntax or bundling errors**.
- **Automated Browser Test Suite**:
  - **Student Sign-up**: Registered `"Priya Verma"` (`2023BCSE099`, `NIT Srinagar`); dashboard displayed `"Welcome back, Priya."`.
  - **PDF & Preview Fallback**: Submitted PDF proof; `ProofModal` rendered the styled placeholder card without external image calls.
  - **Toast Overlap**: Rapid clicks on copy actions refreshed toast timers smoothly with `useRef` without premature dismissals.
  - **Keyboard Accessibility**: Verified full keyboard navigation (Tab/Shift+Tab, Enter/Space on drop zone, focus rings). "Forgot password?" rendered custom toast.
  - **Route Protection**: Verified that `/student` and `/coming-soon` reject unauthenticated access and redirect to `/`.

---

## 💻 How to Run Locally

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Visit **`http://localhost:5173`** in your browser.
