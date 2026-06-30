---
Document: Page Audit
Version: 1.0.0
Status: Completed
Project: Career Document Hub
Repository: career-document-hub
Module: Repository Audit
Phase: Phase 1
Author: Preeti Tewatia
Reviewer: ChatGPT
Created: 2026-06-30
Last Updated: 2026-06-30
Previous Document: 03_COMPONENT_AUDIT.md
Next Document: 05_SERVICE_LAYER.md
---

# Repository Audit — Phase 1
## Page Audit

> [!NOTE]
> This document logs the audit of all route-bound page views, documenting their line counts, custom hooks interactions, route guard configurations, and input/output interfaces.

---

### Navigation
| Previous | Current | Next |
| :--- | :--- | :--- |
| [03 Component Audit](file:///C:/Users/preeti.tewatia/.gemini/antigravity/scratch/career-document-hub/docs/audit/03_COMPONENT_AUDIT.md) | **04 Page Audit** | [05 Service Layer](file:///C:/Users/preeti.tewatia/.gemini/antigravity/scratch/career-document-hub/docs/audit/05_SERVICE_LAYER.md) |

---

## Scope

This document covers:
- Layout and logic audit for all 14 React route views.
- Audit of line counts to verify compliance with the 150-line rule.
- Descriptions of inputs, outputs, hooks, and security guards for each page.

It does **not** cover:
- Presentation subcomponents (covered in `03_COMPONENT_AUDIT.md`).
- Spring Boot backend integration (covered in future Phase 2 documentation).

---

### 1. Page Views Registry & Auditing

The frontend houses **14 distinct page views** connected via `AppRoutes.jsx`. Every page complies with the **150-line rule limit** for optimal legibility and maintainability:

| Page / File Path | Route Path | Lines | Hooks Used | Guard | Inputs / Outputs / Actions |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`pages/auth/Login.jsx`** | `/login` | 113 | `useAuth`, `useNavigate` | Public | **Inputs**: Email, Password.<br>**Outputs**: Redirect to `/dashboard`. |
| **`pages/auth/Register.jsx`** | `/register` | 149 | `useAuth`, `useNavigate` | Public | **Inputs**: Name, Email, Password.<br>**Outputs**: Redirect to `/login`. |
| **`pages/auth/ForgotPassword.jsx`** | `/forgot-password` | 77 | `useNavigate` | Public | **Inputs**: Email address.<br>**Outputs**: Success notification toast. |
| **`pages/Dashboard.jsx`** | `/dashboard` | 119 | `useAuth` | Protected | **Actions**: Renders stats summaries and checklists of recent sign tasks & documents. |
| **`pages/Vault.jsx`** | `/vault` | 144 | `useAuth`, `useDocumentUpload` | Protected | **Inputs**: Drag uploader modal, category search.<br>**Outputs**: PDF/Image files rendering grids. |
| **`pages/Certificates.jsx`** | `/certificates` | 92 | `useAuth` | Protected | **Inputs**: Title, issuer, credentials link, upload files.<br>**Outputs**: Certificate badge display items. |
| **`pages/Expiry.jsx`** | `/expiry` | 122 | `useAuth` | Protected | **Actions**: Renders table rows sorting documents by proximity to their validity expiration dates. |
| **`pages/Resume.jsx`** | `/resume` | 99 | `useResumeState` | Protected | **Inputs**: Accordion form inputs.<br>**Outputs**: Printable/downloadable custom PDF template. |
| **`pages/MySignatures.jsx`** | `/signatures` | 117 | `useAuth` | Protected | **Actions**: Shows user's custom ink/typed signatures with default selection swatches. |
| **`pages/CreateSignature.jsx`** | `/signatures/create` | 95 | `useAuth` | Protected | **Inputs**: Draw brush tool, upload file, or cursive custom text.<br>**Outputs**: Saves signature. |
| **`pages/Documents.jsx`** | `/documents` | 142 | `useAuth` | Protected | **Inputs**: Upload zone modal.<br>**Outputs**: Categorized list of unsigned vs signed files. |
| **`pages/SignDocument.jsx`** | `/documents/sign/:id` | 149 | `useAuth`, `usePdfRenderer`, `useSignatureCanvas` | Protected | **Inputs**: Draggable signature overlay stamp placement.<br>**Outputs**: Client-side compiled signed PDF download. |
| **`pages/DocumentAI.jsx`** | `/ai-insights` | 147 | `useAuth`, `useDocumentAIState` | Protected | **Inputs**: API setup modal, document selection dropdown.<br>**Outputs**: Renders deep summarization tabs & Q&A chat. |
| **`pages/Profile.jsx`** | `/profile` | 150 | `useAuth`, `useTheme` | Protected | **Inputs**: Name, Email, password change fields, theme cycle toggles, and cache wipe button. |

---

### 2. Observations

*   **100% Green Compliance**: Every single page file is strictly at or below 150 lines. The largest pages are `Profile.jsx` (exactly 150 lines) and `Register.jsx` (exactly 149 lines).
*   **Security Isolation**: Public routes (Login, Register, Forgot Password) are isolated. All remaining pages are protected by the `ProtectedRoute.jsx` guard, which verifies active sessions before loading children, redirecting unauthenticated users to `/login`.
*   **Decoupled State**: Page views do not manage complex side effects locally. They call custom hooks (like `useResumeState.js` or `useDocumentAIState.js`) which return pre-packaged reactive variables and action handlers.

---

### 3. Recommendations

1.  **Refactor `Profile.jsx`**: It is currently at exactly 150 lines. If any additional profiles properties are added, decompose the `DangerZone` or `AccountInfo` subcomponents further to keep it green.
2.  **Breadcrumbs Mapping**: Consider centralizing route-to-title breadcrumbs inside `routes/AppRoutes.jsx` to avoid static title mappings across each page container.

---

### 4. References

- [03 Component Audit](file:///C:/Users/preeti.tewatia/.gemini/antigravity/scratch/career-document-hub/docs/audit/03_COMPONENT_AUDIT.md)
- [AppRoutes.jsx](../../frontend/src/routes/AppRoutes.jsx)

---

### 5. Glossary

| Term | Meaning |
| :--- | :--- |
| **Route Guard** | Security component wrapping routes to check authorization parameters |
| **Protected Route** | Navigation endpoint restricted to users with active login sessions |
| **Public Route** | Open access routes (Login, Registration, Password Reset) |

---

### 6. Revision History

| Version | Date | Author | Changes |
| :--- | :--- | :--- | :--- |
| 1.0.0 | 2026-06-30 | Preeti Tewatia | Initial page audit. |
