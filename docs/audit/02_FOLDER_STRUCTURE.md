---
Document: Folder Structure Audit
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
Previous Document: 01_REPOSITORY_OVERVIEW.md
Next Document: 03_COMPONENT_AUDIT.md
---

# Repository Audit — Phase 1
## Folder Structure Audit

> [!NOTE]
> This document provides a comprehensive review of the physical folder layout, directory nesting rules, and asset organization inside the frontend project.

---

### Navigation
| Previous | Current | Next |
| :--- | :--- | :--- |
| [01 Repository Overview](file:///C:/Users/preeti.tewatia/.gemini/antigravity/scratch/career-document-hub/docs/audit/01_REPOSITORY_OVERVIEW.md) | **02 Folder Structure** | [03 Component Audit](file:///C:/Users/preeti.tewatia/.gemini/antigravity/scratch/career-document-hub/docs/audit/03_COMPONENT_AUDIT.md) |

---

## Scope

This document covers:
- Directory structure of the `frontend/` application.
- Naming conventions for subfolders and resource types.
- Distribution of styling files and asset locations.

It does **not** cover:
- Specific React component rendering hierarchies.
- API models or Service Layer signatures.
- State Context variables.

---

### 1. Root Level Structure

At the root level, the project separates configuration, audit documentation, and the actual application codebases:

```text
career-document-hub/
├── frontend/               # Complete React+Vite Frontend codebase
├── docs/                   # Documentation and audit logs
│   ├── audit/              # Phase-wise repository audit documents
│   └── README.md           # Master documentation index
├── PRD.md                  # Root Product Requirements Document
├── Frontend-Technical-Design.md # Root Technical Design Document
├── .gitignore              # Multi-project ignore file
└── README.md               # Quickstart guide
```

---

### 2. Frontend Directory Layout

Inside the `frontend/` directory, the code is structured around the `src/` folder:

```text
frontend/
├── public/                 # Static global public assets (favicon, worker script)
├── src/
│   ├── assets/             # Images, SVG icons, and fonts
│   ├── components/         # Reusable presentation and UI component modules
│   │   ├── auth/           # Login/Register password strengths
│   │   ├── certificates/   # Badges, cards, and modal forms
│   │   ├── common/         # Custom Buttons, Inputs, Modals, ThemeToggles
│   │   ├── dashboard/      # StatCards, recent activity trackers
│   │   ├── documentAI/     # Tab panels, setup cards, sidebar lists
│   │   │   └── insights/   # Categorized findings lists
│   │   ├── documents/      # Upload boxes, signature overlay panels
│   │   ├── expiry/         # Expiry rows and validation alerts
│   │   ├── layout/         # Navigation Navbar, Sidebar, ProtectedRoutes
│   │   ├── profile/        # Account profiles and cache management forms
│   │   ├── resume/         # CV inputs accordion and layouts previews
│   │   └── signature/      # Preset grids, drawing canvases, uploads
│   ├── context/            # React state providers (Auth, Theme)
│   ├── hooks/              # Custom state hooks (useResumeState, useChatState)
│   ├── pages/              # Composite layout page containers (strictly < 150 lines)
│   ├── routes/             # Navigation mappings and routes declarations
│   ├── services/           # Service persistence wrappers and Groq API adapters
│   ├── styles/             # Application custom variable definitions
│   └── utils/              # Auxiliary algorithms (signatureMerger)
├── package.json            # Scripts, project libraries, and metadata
└── vite.config.js          # Vite configuration and worker setup
```

---

### 3. File Naming Conventions

*   **JSX Components**: Capitalized camelCase (e.g. `StatCard.jsx`, `PersonalSection.jsx`).
*   **CSS Stylesheets**: Match JSX names exactly (e.g. `StatCard.css` or `Dashboard.css`).
*   **Custom Hooks**: Prefixed with `use` and lowercase camelCase (e.g. `useResumeState.js`, `useChatState.js`).
*   **Services & Utils**: Lowercase camelCase (e.g. `groqService.js`, `signatureMerger.js`).

---

### 4. Observations

*   **No Redundant Files**: The legacy file `geminiService.js` was fully renamed to `groqService.js` and all dead imports were cleaned up.
*   **Clean Subdirectories Separation**: Relocating to `frontend/` ensures that future Spring Boot files (`backend/`) can be initialized side-by-side with no merge conflicts.
*   **Strict 150-Line Component compliance**: Sub-folders in `components/` (like `components/resume/` and `components/documentAI/insights/`) successfully house the decomposed parts, making the pages clean and legible.

---

### 5. Recommendations

1.  **Strict Rule Enforcement**: Ensure any new React component added during backend integration conforms to the JSX file location and lowercase hook naming convention.
2.  **Asset Consolidation**: As the project scales, move custom images from `public/` into `src/assets/` to leverage Vite's bundler compression.

---

### 6. References

- [01 Repository Overview](file:///C:/Users/preeti.tewatia/.gemini/antigravity/scratch/career-document-hub/docs/audit/01_REPOSITORY_OVERVIEW.md)
- [package.json](../../frontend/package.json)

---

### 7. Revision History

| Version | Date | Author | Changes |
| :--- | :--- | :--- | :--- |
| 1.0.0 | 2026-06-30 | Preeti Tewatia | Initial folder structure audit. |
