# Implementation Plan - SmartLab Enterprise (SmartLabV3)

## Overview
This document is the single source of truth for executing the two roadmaps:
1. UX & Accessibility Roadmap: improvements for user experience, role-based UI, accessibility, and visual consistency.
2. General Review Roadmap: security, data governance, testing, CI/CD, performance, and documentation.

The plan follows AGENTS.md (UI & design system, coding practices) and respects the folder structure in Architecture.md.

---

## Structure of the Plan
| Section | Purpose |
|---------|---------|
| 0 - Preparation | Align stakeholders, capture role requirements, generate baseline reports. |
| 1 - Design Tokens & Tailwind Config | Centralize UI constants, update `tailwind.config.ts`. |
| 2 - Role-Based Sidebar | Filter navigation by RBAC, add ARIA labels and tooltips. |
| 3 - Role-Specific Dashboards | Build three dashboard variants (Tech, Supervisor, Manager). |
| 4 - Fast-Action FAB | Floating Action Button for quick creation of lots / samples. |
| 5 - Accessible Forms | Refactor forms with react-hook-form, Zod schemas, ARIA error handling. |
| 6 - Consistent Feedback | Unified toast system, skeleton loaders, loading spinners. |
| 7 - Automated Accessibility Checks | axe-core integration in CI. |
| 8 - Security (RLS, MFA, Audit Trail) | Apply row-level security, enable MFA, audit tables and triggers. |
| 9 - Tests (Unit, Integration, E2E) | Jest + React Testing Library + Playwright. |
| 10 - CI/CD Pipelines | Lint -> Test -> Build -> Deploy (Vercel). |
| 11 - Backup / Restore | Daily Supabase dump, restore script, verification. |
| 12 - Performance Optimisation | Lazy loading, caching, Lighthouse target < 2s. |
| 13 - Governance UI (Admin Settings) | Export/Import JSON, preview impact. |
| 14 - Documentation | Update `ARCHITECTURE.md`, `README.md`, `UX_GUIDE.md`, `DEVOPS_GUIDE.md`. |
| 15 - Review & Sign-off | Stakeholder demo, acceptance checklist. |

---

## Timeline (2-week sprints)
| Sprint | Weeks | Primary Deliverables |
|-------|-------|----------------------|
| Sprint 1 | 1-2 | 0-Preparation (role matrix, gap report). |
| Sprint 2 | 3-4 | 1-Design Tokens, 2-RLS draft, MFA enable. |
| Sprint 3 | 5-6 | 2-RLS policies applied, 3-Sidebar role filter. |
| Sprint 4 | 7-8 | 3-Dashboard Tech, 4-FAB prototype. |
| Sprint 5 | 9-10 | 3-Dashboard Supervisor, 5-Accessible Forms (core). |
| Sprint 6 | 11-12 | 5-Forms completed, 6-Toast system, 7-A11Y CI. |
| Sprint 7 | 13-14 | 8-Audit trail, 9-Unit & integration tests. |
| Sprint 8 | 15-16 | 9-Playwright e2e, 10-CI/CD pipelines. |
| Sprint 9 | 17-18 | 11-Backup scripts, 12-Performance tuning. |
| Sprint 10 | 19-20 | 13-Admin Settings export/import, 14-Docs update. |
| Sprint 11 | 21-22 | 15-Demo, stakeholder sign-off, final QA. |

Total: ~22 weeks (5 months). Overlap between UX and security tasks is allowed; assumes 2 frontend, 1 backend/DB, 1 QA, 1 DevOps.

---

## RACI Matrix
| Activity | Product Owner | Tech Lead | Front-end | Back-end/DB | UX Lead | QA Lead | DevOps |
|----------|---------------|-----------|-----------|-------------|---------|---------|--------|
| Define role matrix | R | C | I | I | A | I | I |
| Design tokens & Tailwind | I | A | R | I | C | I | I |
| Sidebar RBAC implementation | I | A | R | C (policy) | C | I | I |
| Dashboard variants | I | A | R | C (queries) | C | I | I |
| FAB & modal | I | A | R | C (API) | C | I | I |
| Accessible forms | I | A | R | I | R | C | I |
| Toast & loading UI | I | A | R | I | C | I | I |
| A11Y CI integration | I | A | I | I | R | C | I |
| RLS policies & MFA | I | A | I | R | I | I | I |
| Audit-trail tables & triggers | I | A | I | R | I | I | I |
| Unit / integration tests | I | A | R | R | I | R | I |
| Playwright e2e tests | I | A | R | I | I | R | I |
| CI/CD pipelines | I | A | I | I | I | I | R |
| Backup / restore scripts | I | A | I | R | I | I | R |
| Performance tuning | I | A | R | C | I | I | I |
| Admin Settings UI (export/import) | I | A | R | C | C | I | I |
| Documentation updates | A | C | I | I | R | I | R |
| Demo & sign-off | A | C | C | C | C | R | C |

---

## Commands & Scripts (to be executed by the agent)
```bash
# 1. Install dependencies
npm ci

# 2. Run lint and type-check
npm run lint && npx tsc --noEmit

# 3. Apply RLS migrations (Supabase CLI)
supabase migration up --project-id <PROJECT_ID>

# 4. Enable MFA for admin users (via Supabase dashboard or API)
#    Manual step - document in DEVOPS_GUIDE.md

# 5. Generate design-tokens file
node scripts/generate-design-tokens.js   # writes components/ui/design-tokens.ts

# 6. Build Tailwind config (watch mode for dev)
npx tailwindcss -i ./app/globals.css -o ./public/tailwind.css --watch

# 7. Run unit and integration tests
npm test

# 8. Run Playwright e2e (headless)
npx playwright test

# 9. CI/CD - GitHub Actions (in .github/workflows/)
#    - ci.yml (lint, test)
#    - cd.yml (build -> Vercel)
#    - a11y.yml (axe core)
#    - backup.yml (daily Supabase dump)

# 10. Deploy to staging (Vercel preview)
vercel --prod   # after merge to main

# 11. Verify performance (Lighthouse CI)
lighthouse-ci https://staging.smartlab.com --output=json --output-path=./lighthouse-report.json

# 12. Backup verification
supabase db dump > backup_$(date +%F).sql
#    Restore in a test project to ensure integrity
```

---

## Acceptance Criteria (Checklist)
- [ ] Design Tokens are used by every UI component (`cn(..., token)` where applicable).
- [ ] Sidebar shows only modules permitted for the logged-in role; icons have `aria-label` and tooltips.
- [ ] Dashboards render the correct KPI cards per role.
- [ ] FAB creates a new lot/sample without page navigation.
- [ ] All forms display accessible error messages (`aria-describedby`).
- [ ] Toast component follows the color palette (emerald, amber, red) and uses `role="alert"`.
- [ ] A11y CI fails the build on any axe violation.
- [ ] RLS policies enforce row-level security for all business tables.
- [ ] MFA is enabled for admin accounts.
- [ ] Audit-trail captures every INSERT/UPDATE/DELETE on critical tables.
- [ ] Unit, integration and e2e tests achieve >= 80% coverage.
- [ ] CI/CD automatically builds, tests and deploys to Vercel on merge.
- [ ] Backup runs daily; a restore test passes.
- [ ] Performance: Lighthouse score > 90% and page load < 2s on 3G.
- [ ] Admin Settings can export/import JSON and shows a preview of impact.
- [ ] Documentation is up-to-date and version-controlled.
- [ ] Stakeholder demo receives sign-off from a Technician, a Supervisor and a Manager.

---

## File Locations (relative to repo root)
- components/ui/design-tokens.ts - design constants.
- components/layout/Sidebar.tsx - updated with RBAC logic.
- app/dashboard/TechDashboard.tsx, SupervisorDashboard.tsx, ManagerDashboard.tsx - role dashboards.
- app/admin/settings/components/SettingsManager.tsx - export/import UI.
- app/_components/FloatingActionButton.tsx - FAB component.
- lib/queries/* - unchanged, but covered by tests.
- supabase/migrations/* - RLS and audit-trail migrations.
- .github/workflows/ci.yml, cd.yml, a11y.yml, backup.yml - CI pipelines.
- scripts/generate-design-tokens.js - helper script.
- docs/UX_GUIDE.md, docs/DEVOPS_GUIDE.md - documentation.

---

## How the Agent Will Execute
1. Read this plan and supporting documents (AGENTS.md, Architecture.md, Modules.md).
2. Create the required files and directories using repo write access (design-tokens, dashboard pages, CI workflow YAMLs).
3. Run the commands listed above (with approval when needed for migrations or external services).
4. Validate each step by checking output and inspecting the repository.
5. Iterate: after each sprint, update the plan with actual dates, mark completed items, and adjust the next sprint scope.
6. Report progress back to the user in a concise summary after every major milestone.

Prepared by the engineering agent following AGENTS.md and the project folder structure.
