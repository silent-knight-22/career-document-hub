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

---

## ⚙️ Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/career-document-hub.git
cd career-document-hub
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start the Vite Dev Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Setup Groq API Key
1. Go to the [Groq Console](https://console.groq.com/keys) and generate a free API key.
2. In the Career Document Hub sidebar, click **AI Insights**.
3. Paste your Groq API key (starting with `gsk_`).
4. Select your preferred model (e.g. `llama-3.3-70b-versatile` for text or let it auto-detect).
5. Start summarizing documents!

---

## 📄 License
This project is licensed under the MIT License.
