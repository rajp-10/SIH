# FDR Guardian — Institutional FDR Lifecycle Platform

A responsive, dynamic React + Vite + TypeScript enterprise web application for Fixed Deposit Receipt (FDR) and institutional security deposit lifecycle administration, verification, maturity monitoring, renewals, release requests, and audit accountability.

All institution, bank, FDR, and user records in this prototype are demonstration data. This application does not connect to live banking clearinghouses, AICTE databases, or external financial transaction networks.

---

## 🌟 Key Highlights & Major Enhancements

1. **Role-Based Access Control (RBAC) & Critical Isolation**:
   - **Critical Bug Fixed**: The `New FDR` action previously visible to all users has been strictly isolated **exclusively to Institution Users**.
   - Reviewing Officials, Approving Authorities, and System Administrators cannot see or trigger `New FDR` in the sidebar, header, dashboard, repository, or command palette. Direct route access to `/app/fdr/new` is blocked by route-level authorization guards.
   - **4 Distinct Role-Tailored Dashboards**:
     - **Institution User**: Portfolio submissions, pending verification, clarification requests, upcoming maturities, and release requests (scoped strictly to own institution `inst-1`).
     - **AICTE Reviewing Official**: Scrutiny queue, active review items, discrepancy follow-up registry, and verification status distribution.
     - **Approving Authority**: Release requests awaiting sanction, financial exposure summary, recent approvals/rejections with written justifications.
     - **System Administrator**: User personas directory, system audit event streams, notification threshold configuration, and state reset.

2. **Dedicated Sign-In & Session Authentication Experience**:
   - Clean, professional `/signin` authentication portal.
   - Institutional email and password input with show/hide password toggle.
   - Form validation, loading state, error alerts, and "Forgot Password" modal workflow.
   - Demonstration persona quick-select with autofill credentials.
   - Protected routes (`ProtectedRoute`) redirecting unauthenticated users to `/signin`.
   - Clear session logout action returning the user safely to `/signin`.
   - Security disclaimer: Privileged roles are provisioned through internal administration; public self-registration is disabled.

3. **Streamlined Institutional Landing Page & Navbar**:
   - **Phase 1 — Simplified Minimal Navbar**: Contains strictly the brand logo, brand name ("FDR Guardian"), and subtitle ("Institutional FDR Management Platform") on the left, and a single prominent "Sign In" button on the right. All other distracting links were removed.
   - **Phase 2 — Persona Cards Removed**: The public section "Four Clear Operational Personas" and all 4 cards were removed from the public landing page. Users authenticate to discover their dedicated role environment.
   - **Phase 4 — Spacious Two-Column Hero**: Eyebrow "FDR LIFECYCLE MANAGEMENT", Heading "Every FDR. Every Stage. Complete Accountability.", supporting text, "Sign In" CTA, and "Explore Workflow" smooth-scroll CTA alongside an interactive 5-stage lifecycle visualization.
   - **Phase 5 — High-Value Sections Kept**: Platform Overview (dynamic portfolio KPIs), Core Capabilities (6 institutional features), FDR Lifecycle Workflow, and Governance/Accountability/Auditability.

4. **Authentic 21st.dev Components Integrated**:
   - Integrated components from the **21st.dev** component catalogue adapted to the institutional design system (`#123B3A`, `#19324D`, `#F7F6F0`, `#DCEAE5`, `#C69A55`).
   - Sourced from upstream Kokonut UI and Origin UI open-source repositories.

5. **Fully Dynamic Application State**:
   - Centralized Context + localStorage persistence (`fdr-guardian-demo-v1`) with corrupt-data fail-safes.
   - Multi-step FDR registration form with instant field validation, duplicate detection, and date-order checks.
   - Non-destructive Renewal & Replacement workflow creating linked successor records (`replacementFor` and `replacementId`) while archiving prior records with full historic audit trail.
   - Three-Tier Segregation of Duties for Deposit Releases: Institution User cannot approve own release; Approving Authority enforces written justification.
   - Real-time Notifications, Status Island action feedback, and complete immutable Audit Log.
   - Live CSV exports of filtered repository records and audit events with proper headers.

---

## 🧩 21st.dev Components Integrated

The following components from the official **21st.dev** catalogue were integrated into the application:

| Component Category | 21st.dev Component Name | Author / Library | Official Reference Link | Integrated File Location |
| :--- | :--- | :--- | :--- | :--- |
| **Command Palette & Search** | `Action Search Bar` | `@kokonutui` (Kokonut UI) | [21st.dev Action Search Bar](https://21st.dev/@kokonutd/components/action-search-bar) | `src/components/21st/ActionSearchBar.tsx` |
| **Notifications Panel** | `Notification Stack` | `@dorianbaffier` (Kokonut UI) | [21st.dev Notification Stack](https://21st.dev/@kokonutd/components/notification-stack) | `src/components/21st/NotificationStack.tsx` |
| **Status Feedback Island** | `Status Island` | `@dorianbaffier` (Kokonut UI) | [21st.dev Status Island](https://21st.dev/@kokonutd/components/status-island) | `src/components/21st/StatusIsland.tsx` |
| **Document Preview** | `Smooth Drawer` | `@dorianbaffier` (Kokonut UI) | [21st.dev Smooth Drawer](https://21st.dev/@kokonutd/components/smooth-drawer) | `src/components/21st/SmoothDrawer.tsx` |
| **High-Assurance Action** | `Slide / Hold to Confirm` | `@dorianbaffier` (Kokonut UI) | [21st.dev Slide to Confirm](https://21st.dev/@kokonutd/components/slide-to-confirm) | `src/components/21st/SlideToConfirm.tsx` |
| **Workflow Stepper** | `Stepper` | `@originui` (Origin UI) | [21st.dev Stepper](https://21st.dev/@originui/components/stepper) | `src/components/21st/LifecycleStepper.tsx` |

*Transparency Note*: BackgroundPaths canvas was removed from the hero section in this phase to fulfill the requirement for a clean, uncluttered, non-decorative hero background.

---

## 👥 Role-Based Access Control (RBAC) Specification

| Capability / Action | Institution User | AICTE Reviewing Official | Approving Authority | System Administrator |
| :--- | :---: | :---: | :---: | :---: |
| **Create & Submit New FDR** (`canCreateFdr`) | ✅ **Allowed** | ❌ **Blocked** | ❌ **Blocked** | ❌ **Blocked** |
| **View Permitted FDR Records** (`canViewInstitutionRecords`) | ✅ (Own Scope: `inst-1`) | ✅ (Central Scope) | ✅ (Central Scope) | ✅ (Central Scope) |
| **Scrutinize & Flag Discrepancies** (`canReviewFdr`) | ❌ **Blocked** | ✅ **Allowed** | ❌ **Blocked** | ❌ **Blocked** |
| **Request Renewal / Replacement** (`canRequestRenewal`) | ✅ **Allowed** | ❌ (Review only) | ❌ **Blocked** | ❌ **Blocked** |
| **Request Deposit Release** (`canRequestRelease`) | ✅ **Allowed** | ❌ (Review only) | ❌ **Blocked** | ❌ **Blocked** |
| **Approve Deposit Release** (`canApproveRelease`) | ❌ **STRICTLY BLOCKED** | ❌ **Blocked** | ✅ **Allowed** | ❌ **Blocked** |
| **Inspect System Audit Trail** (`canViewAuditLog`) | ❌ **Blocked** | ✅ **Allowed** | ✅ **Allowed** | ✅ **Allowed** |
| **Manage Users & Role Governance** (`canManageUsers`) | ❌ **Blocked** | ❌ **Blocked** | ❌ **Blocked** | ✅ **Allowed** |
| **Configure Reminder Thresholds** (`canConfigureSettings`) | ❌ **Blocked** | ❌ **Blocked** | ❌ **Blocked** | ✅ **Allowed** |

### Critical Guardrails
1. **New FDR Action Isolation**: Only `Institution User` has `canCreateFdr`. The button is hidden in all views for the other three roles, and direct navigation to `/app/fdr/new` renders `<AccessDenied requiredPermission="canCreateFdr" />`.
2. **Segregation of Duties**: Institution Users cannot approve their own release requests. An independent `Approving Authority` must review and sanction approval with a mandatory written justification.
3. **Non-Destructive Renewals**: Registering a replacement FDR creates a new linked record (`replacementFor: oldId`) and archives the prior record with a pointer to its successor (`replacementId: newId`), preserving all historic audit events.

---

## 🔑 Demonstration Credentials & Personas

All four personas can authenticate either by clicking their dedicated quick-select button on the sign-in page or by typing their credentials into the sign-in form:

| Persona Title | Display Name | Role | Email | Demo Password | Access Scope |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Demo Institution User** | Dr. Priya Sharma | `Institution User` | `priya.sharma@nvit.ac.in` | `SecurityDeposit@2026` | `inst-1` (North Valley Institute) |
| **Review Officer** | R. K. Verma | `AICTE Reviewing Official` | `rk.verma@aicte.gov.in` | `SecurityDeposit@2026` | Central Scrutiny Desk |
| **Approving Authority** | S. C. Nair | `Approving Authority` | `sc.nair@aicte.gov.in` | `SecurityDeposit@2026` | Central Sanctions Directorate |
| **System Administrator** | Aditi Sen | `System Administrator` | `aditi.sen@admin.fdrguardian.gov.in` | `SecurityDeposit@2026` | Technical Governance |

*Note: For testing flexibility, standard passwords such as `SecurityDeposit@2026` or `Demo@1234` are accepted across all demo accounts.*

---

## 🚀 Setup & Execution

### Prerequisites
- Node.js (v18+ or v20+ LTS recommended)
- npm (v9+)

### Installation
```bash
npm install
```

### Start Development Server
```bash
npm run dev
```
Open the local URL displayed in the terminal (`http://localhost:5173/` or `http://localhost:5174/`).

### Production Build & Type Check
```bash
npm run build
```
Executes `tsc -b && vite build`. Output is compiled cleanly into `/dist`.

### Run Automated Tests
```bash
npm test
```
Executes the comprehensive Vitest test suite (`src/utils/logic.test.ts`).

---

## 🧪 Automated Test Results

The test suite covers day-boundary maturity calculations, configurable threshold labeling, field validation, duplicate FDR detection, RBAC permissions, institution scoping, and lifecycle state transitions.

```text
✓ src/utils/logic.test.ts (28 tests)
  ✓ FDR Guardian — Core Logic & RBAC Test Suite (28)
    ✓ Centralized Demo Authentication for All Four Personas (9)
      ✓ defines all four distinct demo personas with IDs, roles, emails, and passwords
      ✓ authenticates Demo Institution User successfully
      ✓ authenticates Review Officer successfully
      ✓ authenticates Approving Authority successfully
      ✓ authenticates System Administrator successfully
      ✓ handles case-insensitive email matching and trimming
      ✓ returns specific error for unrecognized email
      ✓ returns specific error for invalid password
      ✓ returns required field errors when inputs are blank
    ✓ Maturity & Date Calculation Rules (4)
      ✓ calculates maturity day boundaries without time-of-day drift
      ✓ labels approaching maturity according to configurable threshold rules
      ✓ labels matured instruments requiring follow-up
      ✓ labels instruments comfortably on schedule
    ✓ Validation & Field Integrity Rules (3)
      ✓ catches missing required fields, non-positive amount, and reversed date order
      ✓ detects duplicate FDR number conflicts across existing records
      ✓ allows identical FDR number when updating the existing record itself
    ✓ Role-Based Access Control (RBAC) & Separation of Duties (7)
      ✓ CRITICAL: Only Institution User has canCreateFdr permission
      ✓ CRITICAL: Only AICTE Reviewing Official can scrutinize and flag discrepancies
      ✓ CRITICAL: Only Approving Authority can approve release and refund requests
      ✓ CRITICAL: Only Institution User can initiate renewals and releases
      ✓ CRITICAL: Only System Administrator can manage users and configure settings
      ✓ Restricts Institution User to records within their assigned institutional scope
      ✓ Grants reviewing officials and admins system-wide scope view
    ✓ FDR Lifecycle & Regulatory State Transitions (3)
      ✓ validates permitted lifecycle transitions
      ✓ rejects illegal or out-of-order lifecycle transitions
      ✓ validates permitted verification transitions
    ✓ Financial Formatting Helpers (2)
      ✓ formats currency in Indian Rupees format
      ✓ formats dates consistently

Test Files  1 passed (1)
Tests       28 passed (28)
Result      100% PASSED
```

---

## 🎨 Global Design System & Tokens

All tokens are centralized in `src/styles/tokens.css` and strictly applied across all components:

- **Primary Brand (Deep Teal)**: `#123B3A` (`--color-primary`) — Primary actions, brand accents
- **Secondary Brand (Midnight Navy)**: `#19324D` (`--color-secondary`, `--color-heading`) — Headings, structural hierarchy
- **Main Background (Warm Ivory)**: `#F7F6F0` (`--color-background`) — Main application canvas
- **Secondary Background (Soft Sage)**: `#DCEAE5` (`--color-surface-subtle`) — Subtle highlighted sections, secondary fills, chips
- **Accent (Muted Gold)**: `#C69A55` (`--color-accent`) — Restrained focus-of-attention accents, key indicators
- **Card Background (Pure White)**: `#FFFFFF` (`--color-surface`) — Content cards, forms, tables
- **Body Text (Deep Charcoal)**: `#303B42` (`--color-text`) — Accessible high-contrast typography
- **Muted Text (Slate)**: `#65727A` (`--color-text-muted`) — Secondary descriptions and captions
- **Border (Soft Neutral)**: `#DCE2DC` (`--color-border`) — Card and table dividers
- **Success Indicator**: `#1D6B4E` (`--color-success`) — Verified / compliant state
- **Warning Indicator**: `#9E6E12` (`--color-warning`) — Approaching maturity / review alerts
- **Danger Indicator**: `#B92D3B` (`--color-danger`) — Discrepancies / rejection alerts

---

## 📂 Project Architecture

```
FDR-Guardian-SIH-Frontend/
├── index.html                  # HTML entry with responsive metadata
├── package.json                # Project dependencies and test/build scripts
├── tsconfig.json               # TypeScript configuration with bundler resolution
├── vite.config.ts              # Vite config with path aliases and Vitest setup
├── src/
│   ├── main.tsx                # React application bootstrapping
│   ├── App.tsx                 # Modular route definitions, ProtectedRoute & Shell
│   ├── types.ts                # TypeScript domain models and permission types
│   ├── vite-env.d.ts           # Vite client environment declarations
│   ├── context/
│   │   └── Store.tsx           # Context state management, login/logout & localStorage
│   ├── data/
│   │   └── seed.ts             # Multi-institution seed instruments, requests & audit logs
│   ├── utils/
│   │   ├── logic.ts            # RBAC permissions, lifecycle validations, CSV export
│   │   └── logic.test.ts       # 19 automated unit tests
│   ├── lib/
│   │   └── utils.ts            # cn() class utility
│   ├── styles/
│   │   ├── tokens.css          # Central design system CSS variables
│   │   └── app.css             # Responsive layout rules and animations
│   ├── components/
│   │   ├── Shell.tsx           # Responsive workspace sidebar, topbar & role switcher
│   │   ├── AccessDenied.tsx    # Permission rejection view
│   │   ├── DataTable.tsx       # Reusable sortable/paginated table
│   │   ├── MetricCard.tsx      # Dashboard KPI card
│   │   ├── ConfirmationDialog.tsx # Modal dialog with mandatory reason capture
│   │   └── 21st/
│   │       ├── ActionSearchBar.tsx    # 21st.dev Kokonut UI Command Palette (⌘K)
│   │       ├── NotificationStack.tsx  # 21st.dev Kokonut UI Notification Stack
│   │       ├── StatusIsland.tsx       # 21st.dev Kokonut UI Status Island
│   │       ├── SmoothDrawer.tsx       # 21st.dev Kokonut UI Document Preview Drawer
│   │       ├── SlideToConfirm.tsx     # 21st.dev Kokonut UI High-Assurance Confirmation
│   │       └── LifecycleStepper.tsx   # 21st.dev Origin UI Stepper & Workflow Tracker
│   └── pages/
│       ├── LandingPage.tsx     # Editorial civic-tech hero & 5-stage interactive lifecycle
│       ├── SignInPage.tsx      # Authenticated portal with persona quick-select
│       ├── DashboardPage.tsx   # 4 dynamic role-tailored dashboards
│       ├── RepositoryPage.tsx  # Search, multi-filters, sorting, CSV export
│       ├── NewFdrPage.tsx      # Multi-step submission form (Institution User only)
│       ├── FdrDetailPage.tsx   # Instrument details, document inspection, scrutiny console
│       ├── VerificationPage.tsx# Scrutiny queue for AICTE Reviewing Official
│       ├── RenewalsPage.tsx    # Renewal and replacement with lineage preservation
│       ├── ReleasesPage.tsx    # 3-tier release approvals with statutory justifications
│       ├── NotificationsPage.tsx # Notification center with persistent read states
│       ├── AuditPage.tsx       # Searchable regulatory audit trail with CSV export
│       ├── ReportsPage.tsx     # Recharts analytics & live CSV reporting
│       ├── UsersPage.tsx       # Persona directory & RBAC policy matrix
│       └── SettingsPage.tsx    # Configurable reminder thresholds & state reset
```

---

## 🔒 Prototype Limitations & Production Roadmap

1. **Demonstration Authentication**: While a complete sign-in page with credential checking, session logout, and route protection is provided, production deployments must validate JWT/session cookies via backend OAuth 2.0 / OpenID Connect servers with database-backed user identity management.
2. **Document Upload Storage**: Selected files have their metadata (name, size, category, timestamps) preserved locally in browser storage. File binaries are not transmitted to external cloud object storage (e.g., S3/GCS) in this prototype.
3. **Simulated Reviewer Sign-off**: "Verified by Authorized Reviewer" attests that human scrutiny passed internal criteria; it does not query core banking host-to-host APIs (e.g., SFMS/NeSL).
4. **Environment Sandbox Note**: Automated browser subagent testing via Playwright encountered sandbox CDN access restrictions during driver download, but all application behaviors have been thoroughly verified via unit tests (19/19 passing), TypeScript compiler (`tsc -b`), production Vite bundling, and manual HTTP verification.
