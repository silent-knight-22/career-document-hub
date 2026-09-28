# Career Document Hub

An enterprise-grade, premium, AI-powered Career Document Hub designed to streamline document management, digital signatures, resume building, and document intelligence.

Built with **React**, **Vite**, and **Groq Cloud API** (high-speed Llama-3 & Mixtral models).

---

## 🚀 Key Features

*   **AI Document Intelligence (Groq Cloud)**:
    *   Deep, section-wise analysis of contracts, offer letters, NDAs, and resumes.
    *   Client-side PDF text extraction using `pdfjs-dist` to fit within free-tier TPM limits.
    *   Visual document analysis for images (PNG/JPG) using **Llama 4 Scout Vision**.
    *   Source-cited conversational Q&A using cached analysis context (RAG architecture).
    *   Strict JSON formatting enforced via Groq's native JSON Mode.
*   **Digital Signatures & PDF Signer**:
    *   Upload PDF documents and convert pages to high-resolution PNGs in-memory.
    *   Interactive drag-and-drop signature placement.
    *   Clean download of signed documents without server storage dependencies.
*   **Premium Signature Customizer**:
    *   Choose from **11 cursive and calligraphic Google Fonts**.
    *   Customize font weight (Normal / Bold) and size (`32px` to `72px`).
    *   Choose from classic ink swatches or select *any* custom color via a color wheel.
    *   Live interactive preview before saving.
*   **Resume Builder**:
    *   Interactive accordion sections (Personal Info, Education, Experience, Projects, Skills, Certifications).
    *   Autosave to local storage and dynamic completion progress indicator.
*   **Document Vault**:
    *   Secure local document storage with size constraints (3MB for sign docs, 5MB for vault) to prevent QuotaExceeded errors.
*   **Expiry Tracker & Certificates**:
    *   Track document validity and certificate credentials.

---

## 🛠️ Tech Stack

*   **Frontend**: React 18, Vite 8, React Router v6
*   **State Management**: React Context API (`AuthContext`, `ThemeContext`)
*   **Styling**: Pure CSS Custom Properties (Sleek dark mode, glassmorphism, responsive)
*   **AI Integration**: Groq Cloud REST API (OpenAI-compatible chat/completions)
*   **PDF Processing**: `pdfjs-dist` (via `react-pdf`)
*   **Backend (Phase 2+)**: Spring Boot — **not** deployable as Vercel serverless; host separately when ready

---

## ⚙️ Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/silent-knight-22/career-document-hub.git
cd career-document-hub/frontend
```

### 2. Configure environment
```bash
cp .env.example .env
```

| Mode | `VITE_API_URL` |
|------|----------------|
| Local + Spring Boot | `http://localhost:8084/api/v1` (default in `.env.example`) |
| **Phase 1 Vercel (frontend only)** | **Leave empty / unset** — app uses browser **localStorage** (auth, certificates, vault) |
| Later (API hosted elsewhere) | Public API base, e.g. `https://api.example.com/api/v1` |

**Never put Groq API keys or other secrets in `VITE_*` variables** — Vite embeds them in the client bundle. Groq keys are entered in the app UI and stored locally for this demo only.

### 3. Install dependencies
```bash
npm install
```

### 4. Start the Vite Dev Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Setup Groq API Key (AI Insights)
1. Go to the [Groq Console](https://console.groq.com/keys) and generate a free API key.
2. In the app, open **AI Insights**.
3. Paste your Groq API key (starting with `gsk_`).
4. Select a model or leave auto-detect enabled.

---

## 🚀 Production deploy (Phase 1 — frontend on Vercel)

Spring Boot **cannot** run as serverless on Vercel disk. Phase 1 ships the **static SPA only**. Auth remains localStorage — that is expected.

### Build (verify locally)
From repo root:
```bash
npm run build
```
Or:
```bash
cd frontend
npm run build
```
Output: `frontend/dist`.

### `vercel.json` (repo root)
Already configured:
- `buildCommand`: `cd frontend && npm install && npm run build`
- `outputDirectory`: `frontend/dist`
- SPA rewrite: `/(.*) → /index.html`
- Security headers + CSP (`connect-src` includes `https://api.groq.com` and `https://cdn.jsdelivr.net`)
- Long-cache for hashed `/assets/*`

Do **not** set secrets in Vercel env for Phase 1. Leave **`VITE_API_URL` unset** so `isRemoteApiEnabled` stays false (localStorage).

### Deploy with Vercel CLI
```bash
# one-time
npx vercel login

# from repo root — preview (preferred first)
npx vercel

# production only when you are ready
npx vercel --prod
```

### Deploy via Vercel Dashboard
1. Import `https://github.com/silent-knight-22/career-document-hub`
2. Framework: Other / Vite; root stays repo root (uses root `vercel.json`)
3. Env: leave `VITE_API_URL` empty for Phase 1
4. Deploy

### Browser support
Targets modern evergreen browsers (`es2022`): recent Chrome, Edge, Firefox, and Safari. Requires Web Crypto (`crypto.subtle`) for password hashing.

### Known production limits (local-first demo)
- Auth, documents, certificates, and signatures live in **browser localStorage** (not multi-device).
- Groq calls run **from the browser**; move them behind Spring Boot before treating AI as production-grade.
- Forgot-password explains that email reset is not available until the API ships.
- Remote API must be hosted elsewhere (Railway, Render, VM, etc.) — then set `VITE_API_URL` on Vercel and redeploy.

---

## 📄 License
This project is licensed under the MIT License.
