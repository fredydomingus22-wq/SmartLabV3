# Production Readiness Plan — SmartLab Enterprise

This plan operationalizes **urs-enterprise.md** to take SmartLab Enterprise to production. It maps URS functional areas to concrete engineering deliverables, environments, and quality gates that must be satisfied before go-live.

## Objectives
- Fulfill URS functional coverage for QA/QC, LIMS, Food Safety, QMS, materials/suppliers, equipment/reagents, configuration engines, dashboards/IA, and multi-tenant security.
- Achieve production-grade reliability via RLS, MFA, audit trail, backups, observability, CI/CD, and performance budgets.
- Provide validation evidence (tests, dry-runs, SOPs) for each URS requirement before production cutover.

## Phase 0 — Foundations & Governance
- **Security baseline**: Enforce Supabase RLS on all business tables; enable MFA for privileged roles; implement audit tables/triggers for INSERT/UPDATE/DELETE on critical entities (lots, analyses, NC, PCC/OPRP, specs, suppliers, reagents).
- **Tenant isolation**: Verify row policies prevent cross-plant data leakage; seed multi-tenant fixtures for automated tests.
- **Access model**: Align RBAC roles with URS personas (Technician, Supervisor, QA Manager, Food Safety Manager, Supplier Manager, Maintenance, Admin) and wire permissions into the app router middleware.
- **Data migrations**: Freeze schema, apply outstanding migrations, and validate against Architecture/Domain Model diagrams.

## Phase 1 — Production Lots & Traceability (URS 3.1)
- **Lot creation flows**: Harden Create Parent Lot, Intermediate, and Final lot forms with dynamic fields, required metadata (line/turno/OP/SKU), and status transitions (draft → active → closed/cancelled).
- **Specification engine hookup**: Auto-load min/target/max + units per SKU/line/turno; enforce validation with visual flags on deviations.
- **Traceability views**: Provide parent ⇄ child chain navigation (raw → parent → intermediate → final → analyses → NC/PCC) with linked IDs and breadcrumbs.
- **Sampling integration**: Load sampling plans per product/line/turno; schedule sample creation tasks for active lots.

## Phase 2 — LIMS & Lab Operations (URS 3.2)
- **Samples lifecycle**: Implement pending → in_analysis → review → approved workflow with timestamps and responsible analysts.
- **Analysis forms**: Parameter-driven forms supporting attachments, auto-limits, units, uncertainty; capture electronic signatures on approval.
- **Operational dashboard**: KPIs for total analyses/24h, pending by priority, RFT, analyst ranking, lots awaiting release; include filters by plant/line.
- **Result validation**: Flag out-of-spec results, trigger NC/hold workflows, and notify supervisors.

## Phase 3 — Food Safety / HACCP (URS 3.3)
- **PRP/OPRP/PCC registry**: CRUD screens capturing critical limits, measured values, evidence uploads, and immediate actions; require approvals per role.
- **HACCP plan builder**: Process flow with hazard identification, risk matrix, and PCC/OPRP tagging; store versioned plans per line/product.
- **Monitoring & alerts**: Breach detection with notifications, dashboard tiles for overdue checks/calibration, and escalation rules.

## Phase 4 — QMS (URS 3.4)
- **NC management**: Create NC linked to analyses/lots, severity classification, evidence attachments, and status workflow (open → containment → corrective → verified → closed).
- **8D reports**: Full D1–D8 capture with signatures; enforce manager closure; exportable PDF.
- **Audits**: Checklist builder, scheduling, evidence capture, and automatic findings report; integrate with NC for follow-up actions.

## Phase 5 — Materials, Suppliers, Equipment, Reagents (URS 3.5 & 3.6)
- **Raw materials & lots**: Intake with COA upload, quality evaluation, approval/reject/quarantine flows; link to suppliers and traceability chain.
- **Supplier governance**: Audit records, annual scoring, NC history, and approved vendor list views.
- **Equipment**: Calibration schedules, expiry alerts, maintenance logs.
- **Reagents**: Inventory (in/out), validity and consumption history, alerts for low stock/expiration.

## Phase 6 — Configuration Engines (URS 3.7)
- **Form Builder**: UI to compose dynamic forms with parameters, units, limits, and validation rules.
- **Parameter Builder**: Central catalog of parameters with metadata and unit management.
- **Specification Engine**: Rules to assign specs by product/line/turno/shift and effectivity dates; APIs consumed by lot/analysis forms.
- **Sampling Plan Engine**: Frequency and exceptions per product/line/turno; hooks to auto-generate sampling tasks.

## Phase 7 — Dashboards, IA, and Analytics (URS 4 & 5)
- **Executive overview**: Plant-level KPIs, compliance rates, NC counts, PCC breaches, reagent/maintenance alerts.
- **SPC/IA hooks**: Feed analysis data into SPC engine; placeholders for IA-01..IA-05 detection/forecasting per IA-Engine guidelines.
- **Reporting**: Auto-generated reports for management with export to PDF/CSV; scheduling for weekly/monthly digests.

## Phase 8 — Quality Assurance & Testing
- **Static checks**: eslint, TypeScript strict, lint-staged; block merges on failures.
- **Automated tests**: Unit + integration (Jest/RTL) for hooks/components; E2E (Playwright) for critical flows: lot creation, analysis approval, NC creation, PCC logging, supplier intake.
- **Data integrity tests**: Supabase migration tests and RLS policy tests using seeded tenants.
- **Performance budgets**: Lighthouse P95 < 2s on key pages; bundle size budgets enforced in CI.

## Phase 9 — Observability, Backups, and Operations
- **Monitoring**: Structured logs, error tracking, uptime checks; dashboard for app/API health.
- **Backups & DR**: Daily Supabase backups with restore drill in staging; document RPO/RTO targets.
- **CI/CD**: GitHub Actions pipeline (lint → test → build → deploy to Vercel); gated production deploy with approvals.
- **Runbooks & SOPs**: Incident response, access reviews, on-call rotations, and rollback steps.

## Phase 10 — Cutover & Training
- **Data migration**: Validate import scripts for master data (products, lines, parameters, specs, suppliers).
- **Pilot & UAT**: Run production-like pilot with selected plants; capture issues and sign-off per persona.
- **Training**: Role-based training materials and short videos; in-app help links.
- **Go-live checklist**: Final security review, seed admin accounts with MFA, verify dashboards/alerts, confirm backups, and freeze change window.

## Deliverables & Evidence
- Updated UI flows, Supabase migrations, and configuration seeds per phase.
- Test reports (unit, integration, E2E, RLS), Lighthouse results, backup/restore logs.
- SOPs and governance docs stored in repo (docs/ folder) and linked from README.
- Stakeholder sign-off records for each URS section.

## Execution Backlog (next 30–60 days)
- **Security enforcement (Week 1–2)**: Ship RLS policy parity tests for all business tables, enable MFA on Supabase org, and roll out middleware permission checks for restricted routes (dashboard, production-lots, food-safety, audits).
- **Traceability and specs (Week 2–3)**: Wire specification engine data into lot creation and analysis forms; expose parent/child breadcrumbs across raw → production → intermediate → finished lots; seed sampling plans for CI fixtures.
- **Food safety and QMS flows (Week 3–4)**: Deliver PRP/OPRP/PCC CRUD with approvals and evidence upload; connect NC/8D creation to analyses and PCC breaches; add audit trail hooks for these transactions.
- **Operational dashboards (Week 4–5)**: Publish KPIs for analyses throughput, NC counts, PCC breaches, reagent expiry, and overdue calibrations; include per-plant filters and SLA colors.
- **Cutover rehearsal (Week 5–6)**: Run UAT with seeded tenants, execute backup/restore drill, validate access review SOP, and finalize go-live checklist with sign-offs per persona.

## Test Execution Playbook
- **Static checks**: `npm run lint` and TypeScript compilation must pass before merging.
- **Unit/integration**: `npm test -- --runInBand` covering hooks (queries, permissions), validation schemas, and audit logging helpers; add fixtures for multi-tenant RLS cases.
- **E2E (smoke)**: Playwright flows for lot creation/status change, analysis approval, NC creation, PCC log entry, and supplier intake. Capture screenshots and attach to CI artifacts.
- **Performance**: Run Lighthouse on dashboard, production lots, and food-safety pages; block if P95 > 2s or CLS > 0.1.
- **Data integrity**: Supabase migration tests plus RLS regression suite verifying no cross-tenant reads/writes for raw materials, lots, analyses, NC, PCC.
- **Operational readiness**: Validate monitoring and backup/restore by forcing a controlled failure in staging and confirming alerting plus successful recovery.
