# SmartLab V3 - Implementation Tasks

**Based on:** Code Review 2025-11-25  
**Target:** 10 weeks to production-ready  
**Current Status:** 40-45% complete

---

## PHASE 1: SECURITY & COMPLIANCE (Weeks 1-2)

### Week 1: Multi-Tenant & Audit Foundation

#### Database Schema Updates
- [ ] Create migration `20251126_add_tenant_isolation.sql`
- [ ] Add `tenant_id UUID` column to production_lots
- [ ] Add `tenant_id UUID` column to intermediate_lots
- [ ] Add `tenant_id UUID` column to finished_lots
- [ ] Add `tenant_id UUID` column to samples
- [ ] Add `tenant_id UUID` column to lab_analysis
- [ ] Add `tenant_id UUID` column to nc
- [ ] Add `tenant_id UUID` column to eight_d_reports
- [ ] Add `tenant_id UUID` column to parameters
- [ ] Add `tenant_id UUID` column to specifications
- [ ] Add `tenant_id UUID` column to products
- [ ] Add `tenant_id UUID` column to raw_materials
- [ ] Add `tenant_id UUID` column to raw_material_lots
- [ ] Add `tenant_id UUID` column to food_safety_prp
- [ ] Add `tenant_id UUID` column to food_safety_oprp
- [ ] Add `tenant_id UUID` column to food_safety_pcc
- [ ] Add `tenant_id UUID` column to equipment
- [ ] Add `tenant_id UUID` column to reagents
- [ ] Add `tenant_id UUID` column to reagent_batches
- [ ] Add `tenant_id UUID` column to audits
- [ ] Add `tenant_id UUID` column to trainings
- [ ] Add `tenant_id UUID` column to suppliers
- [ ] Add `factory_id UUID` column to all production-related tables
- [ ] Create indexes on all tenant_id columns
- [ ] Create indexes on all factory_id columns

#### Audit Trail System
- [ ] Create migration `20251126_audit_triggers.sql`
- [ ] Enhance audit_logs table structure (add tenant_id, ip_address, user_agent)
- [ ] Create universal `audit_changes()` trigger function
- [ ] Apply audit trigger to production_lots
- [ ] Apply audit trigger to intermediate_lots
- [ ] Apply audit trigger to finished_lots
- [ ] Apply audit trigger to samples
- [ ] Apply audit trigger to nc
- [ ] Apply audit trigger to eight_d_reports
- [ ] Apply audit trigger to specifications
- [ ] Apply audit trigger to food_safety_pcc
- [ ] Apply audit trigger to all remaining critical tables (15+)
- [ ] Create `lib/audit.ts` - audit query utilities
- [ ] Implement `getAuditTrail()` function
- [ ] Implement `exportAuditLog()` function for compliance
- [ ] Update `lib/rbac.ts` - integrate `logAction()` calls
- [ ] Create `components/audit/AuditTrail.tsx` component
- [ ] Create `components/audit/AuditTimeline.tsx` visualization
- [ ] Test audit trail captures INSERT operations
- [ ] Test audit trail captures UPDATE operations
- [ ] Test audit trail captures DELETE operations
- [ ] Verify audit logs are immutable (no UPDATE/DELETE allowed)

### Week 2: RBAC & E-Signature

#### RBAC Enforcement
- [ ] Update `lib/rbac.ts` - implement `hasPermission()` function
- [ ] Update `lib/rbac.ts` - fix `checkPermission()` to use permission matrix
- [ ] Create `lib/rbac/permissions.ts` - expanded permission definitions
- [ ] Drop all permissive RLS policies (`USING (true)`)
- [ ] Create new RLS policy for production_lots (tenant + role-based)
- [ ] Create new RLS policy for samples (tenant + role-based)
- [ ] Create new RLS policy for nc (tenant + role-based)
- [ ] Create new RLS policy for specifications (tenant + role-based)
- [ ] Create new RLS policy for parameters (tenant + role-based)
- [ ] Create new RLS policy for food_safety_pcc (tenant + role-based)
- [ ] Create new RLS policies for all 20+ remaining tables
- [ ] Add RBAC checks to all form submissions
- [ ] Add RBAC checks to all approval workflows
- [ ] Add RBAC checks to all delete operations
- [ ] Create `middleware/rbac-check.ts` for route protection
- [ ] Test: Technician cannot approve NC
- [ ] Test: Manager can approve NC
- [ ] Test: Admin has all permissions
- [ ] Test: Auditor is read-only
- [ ] Test: Tenant isolation prevents cross-tenant access

#### E-Signature Implementation
- [ ] Create migration `20251126_e_signatures_table.sql`
- [ ] Install bcryptjs dependency
- [ ] Create `lib/e-signature.ts` module
- [ ] Implement `captureSignature()` function
- [ ] Implement `verifySignature()` function
- [ ] Implement `getSignatureHistory()` function
- [ ] Add IP address capture utility
- [ ] Create `components/e-signature/SignatureDialog.tsx`
- [ ] Create `components/e-signature/SignatureDisplay.tsx`
- [ ] Add signature capture to NC approval workflow
- [ ] Add signature capture to 8D report closure
- [ ] Add signature capture to specification changes
- [ ] Add signature capture to PCC deviation corrections
- [ ] Add signature capture to batch release
- [ ] Test: Password verification works
- [ ] Test: Invalid password rejected
- [ ] Test: Signature is immutable
- [ ] Test: Signature audit trail captured
- [ ] Create migration to make signature records immutable

#### Integration & Testing
- [ ] Create data migration script for existing data (add default tenant_id)
- [ ] Test multi-tenant isolation end-to-end
- [ ] Test RBAC enforcement end-to-end
- [ ] Test audit trail for all critical operations
- [ ] Test e-signature capture and verification
- [ ] Performance test with 10K+ records
- [ ] Security audit of RLS policies
- [ ] Documentation: Security implementation guide

---

## PHASE 2: DATA MODEL CLEANUP (Week 3)

### Schema Consolidation
- [ ] Run `supabase db dump` to generate current schema
- [ ] Review generated schema vs migrations
- [ ] Create script `scripts/generate-schema.sh`
- [ ] Create consolidated `supabase/schema_v2.sql`
- [ ] Verify all tables from migrations are included
- [ ] Verify all indexes are included
- [ ] Verify all triggers are included
- [ ] Update base `schema.sql` if needed

### Samples Table Resolution
- [ ] Create migration `20251126_consolidate_samples.sql`
- [ ] Decision: Keep samples table or lab_tests? (Document decision)
- [ ] If keeping samples: Ensure proper structure with all foreign keys
- [ ] If keeping lab_tests: Rename to samples and update all references
- [ ] Add all required indexes (type, status, priority, dates)
- [ ] Create proper RLS policies for samples
- [ ] Update `types/lims.ts` to match final schema
- [ ] Update `lib/queries/lab.ts` to use correct table
- [ ] Update all sample registration forms
- [ ] Update all sample analysis pages
- [ ] Test sample creation end-to-end
- [ ] Test sample workflow transitions
- [ ] Migrate any existing data to new structure

### Production Type Cleanup
- [ ] Decision: Keep FinishedLot or migrate to LineSample? (Document)
- [ ] If keeping FinishedLot: Remove LineSample types and references
- [ ] If migrating to LineSample: Create detailed migration plan
- [ ] Update `types/production.ts` - remove all @deprecated markers
- [ ] Update all production queries to use chosen model
- [ ] Update all production forms/pages
- [ ] Test production lot → intermediate → finished flow
- [ ] Update traceability views

### Type-Schema Alignment
- [ ] Review all TypeScript interfaces in `types/`
- [ ] Compare each interface to actual database table
- [ ] Fix mismatches in `types/production.ts`
- [ ] Fix mismatches in `types/lims.ts`
- [ ] Fix mismatches in `types/product.ts`
- [ ] Fix mismatches in `types/qms.ts`
- [ ] Fix mismatches in `types/spc.ts`
- [ ] Replace all `any` types with proper types or `unknown`
- [ ] Add JSDoc comments to complex types
- [ ] Run TypeScript strict mode check
- [ ] Fix all type errors
- [ ] Generate database types: `supabase gen types typescript`

### Testing & Validation
- [ ] Test all CRUD operations with new schema
- [ ] Verify foreign key constraints work correctly
- [ ] Verify indexes improve query performance
- [ ] Test data migrations (if any)
- [ ] Update all integration tests
- [ ] Documentation: Data model architecture doc

---

## PHASE 3: CORE WORKFLOWS (Weeks 4-6)

### Week 4: LIMS Sample Pipeline

#### Sample Registration Enhancement
- [ ] Add Zod validation schema to sample registration
- [ ] Implement client-side validation with error messages
- [ ] Add conditional field display based on sample_type
- [ ] Implement auto-code generation
- [ ] Add barcode scanning support (optional)
- [ ] Create sample templates for common types
- [ ] Add bulk sample registration
- [ ] Test: All sample types can be registered
- [ ] Test: Validation prevents invalid submissions
- [ ] Test: Required fields enforced

#### Sample Workflow System
- [ ] Create `lib/workflows/sample-workflow.ts`
- [ ] Define sample status state machine
- [ ] Implement `transitionSample()` function
- [ ] Create `app/lab/samples/workflow/page.tsx`
- [ ] Implement pending queue view (sorted by priority)
- [ ] Implement in-analysis queue view
- [ ] Implement review queue view
- [ ] Create assignment system (drag & drop)
- [ ] Add analyst workload balancing
- [ ] Add priority escalation (high/urgent samples)
- [ ] Create `components/lab/SampleQueue.tsx`
- [ ] Create `components/lab/SampleCard.tsx`
- [ ] Create `components/lab/SampleAssignment.tsx`
- [ ] Add status transition buttons (Start Analysis, Submit for Review, Approve)
- [ ] Add permission checks for each transition
- [ ] Test: Sample moves through pipeline correctly
- [ ] Test: Only authorized roles can approve
- [ ] Test: Priority samples appear first

#### Analysis Entry & Results
- [ ] Create `app/lab/samples/[id]/analyze/page.tsx`
- [ ] Load parameters dynamically from specifications
- [ ] Display spec limits (LSL, Target, USL) for each parameter
- [ ] Implement result entry form
- [ ] Add real-time validation (in-spec vs out-of-spec)
- [ ] Auto-flag OOS (out-of-spec) results
- [ ] Auto-create NC for critical deviations
- [ ] Add repeat analysis option
- [ ] Add result comments/observations
- [ ] Require e-signature for approval
- [ ] Calculate RFT (Right First Time) metric
- [ ] Test: Parameters load correctly
- [ ] Test: OOS detection works
- [ ] Test: NC auto-creation works

### Week 5: NC & 8D Workflow

#### NC Workflow System
- [ ] Create `lib/workflows/nc-workflow.ts`
- [ ] Define NC status state machine
- [ ] Implement `transitionNC()` function with permission checks
- [ ] Create migration for NC status field update
- [ ] Update `app/nc/page.tsx` - add workflow filters
- [ ] Update `app/nc/[id]/page.tsx` - add workflow actions
- [ ] Create `components/nc/NCStatusBadge.tsx`
- [ ] Create `components/nc/NCActions.tsx` (contextual buttons)
- [ ] Implement "Submit for Investigation" action
- [ ] Implement "Assign Investigator" action
- [ ] Implement "Complete Investigation" action
- [ ] Implement "Approve" action (requires manager+ role)
- [ ] Implement "Reject" action
- [ ] Implement "Close" action (requires e-signature)
- [ ] Add notification system for status changes
- [ ] Test: NC workflow enforces sequence
- [ ] Test: Permissions enforced at each step
- [ ] Test: Cannot close without 8D report

#### 8D Report Wizard
- [ ] Create `components/qms/8d-wizard/EightDWizard.tsx`
- [ ] Create D1 component: Team formation
- [ ] Create D2 component: Problem description (5W2H)
- [ ] Create D3 component: Interim containment actions
- [ ] Create D4 component: Root cause analysis
- [ ] Create `components/qms/RootCauseAnalysis.tsx` (5-Why tool)
- [ ] Create `components/qms/FishboneDiagram.tsx` (Ishikawa)
- [ ] Create D5 component: Permanent corrective actions
- [ ] Create D6 component: Implementation confirmation
- [ ] Create D7 component: Prevention measures
- [ ] Create D8 component: Team congratulations & closure
- [ ] Add step validation (cannot proceed without completing)
- [ ] Add save as draft functionality
- [ ] Add progress indicator
- [ ] Link 8D to parent NC
- [ ] Require e-signature on D8 closure
- [ ] Add effectiveness verification tracking
- [ ] Test: All 8 disciplines captured
- [ ] Test: Cannot skip steps
- [ ] Test: Linked to NC correctly

#### NC Analytics
- [ ] Create `app/nc/analytics/page.tsx`
- [ ] Implement NC Pareto chart (by type, product, line)
- [ ] Implement NC trend over time
- [ ] Implement MTBF (Mean Time Between Failures)
- [ ] Calculate cost of non-quality
- [ ] Show top contributors (products, lines, shifts)
- [ ] Add export to PDF/Excel

### Week 6: Food Safety Workflows

#### PCC Monitoring System
- [ ] Create `app/food-safety/pcc/verify/page.tsx`
- [ ] Load active PCCs with critical limits
- [ ] Implement real-time measurement entry
- [ ] Add critical limit comparison logic
- [ ] Auto-create NC if limits exceeded
- [ ] Send alert to QA manager on deviation
- [ ] Implement immediate corrective action capture
- [ ] Add verification signature
- [ ] Create `components/food-safety/PCCMonitor.tsx`
- [ ] Create `components/food-safety/CriticalLimitIndicator.tsx`
- [ ] Add trend chart for each PCC
- [ ] Test: Deviation triggers NC
- [ ] Test: Alert sent immediately
- [ ] Test: Signature required for verification

#### OPRP Monitoring
- [ ] Create `app/food-safety/oprp/monitor/page.tsx`
- [ ] Implement OPRP checklist execution
- [ ] Add frequency-based reminders
- [ ] Track OPRP completion rate
- [ ] Link to corrective actions if needed
- [ ] Test: OPRP monitoring workflow

#### PRP Management
- [ ] Create `app/food-safety/prp/page.tsx`
- [ ] Implement PRP activity tracking
- [ ] Add recurring task scheduler
- [ ] Create PRP checklist templates
- [ ] Test: PRP activities logged correctly

#### Integration & Testing
- [ ] Integration test: Sample → OOS → NC → 8D → Closure
- [ ] Integration test: PCC deviation → NC → Corrective action
- [ ] Performance test: 1000+ samples in queue
- [ ] User acceptance test with QA team
- [ ] Documentation: Workflow user guides

---

## PHASE 4: ANALYTICS & AI (Weeks 7-8)

### Week 7: SPC Engine Implementation

#### SPC Calculations
- [ ] Create `lib/spc/calculations.ts`
- [ ] Implement `calculateXbarR()` function
- [ ] Implement `calculateIMR()` function
- [ ] Implement `calculatePChart()` function (for attribute data)  
- [ ] Implement `calculateCpk()` function
- [ ] Implement `calculatePpk()` function
- [ ] Implement control limit calculations (UCL, LCL, CL)
- [ ] Add statistical constants (A2, D3, D4, etc.)
- [ ] Create `lib/spc/constants.ts` for SPC constants
- [ ] Test: Xbar-R calculations match manual calculations
- [ ] Test: Cpk formula correctness
- [ ] Test: Edge cases (all values same, etc.)

#### Western Electric Rules
- [ ] Implement Rule 1: Point beyond control limits
- [ ] Implement Rule 2: 9 points in row on same side
- [ ] Implement Rule 3: 6 points increasing/decreasing
- [ ] Implement Rule 4: 14 points alternating
- [ ] Implement Rule 5: 2/3 points beyond 2σ
- [ ] Implement Rule 6: 4/5 points beyond 1σ
- [ ] Implement Rule 7: 15 points within 1σ (over-control)
- [ ] Implement Rule 8: 8 points beyond 1σ on both sides
- [ ] Create `detectRuleViolations()` function
- [ ] Store violations in `spc_rules_violations` table
- [ ] Test: Each rule detection works correctly

#### SPC Dashboard Enhancement
- [ ] Update `app/spc/page.tsx` - integrate real calculations
- [ ] Create `components/spc/XbarRChart.tsx`
- [ ] Create `components/spc/CapabilityAnalysis.tsx`
- [ ] Display Cpk, Ppk values
- [ ] Color code: Cpk > 1.33 (green), 1.0-1.33 (yellow), < 1.0 (red)
- [ ] Show process capability interpretation
- [ ] Add rule violation markers on charts
- [ ] Create `components/spc/RuleViolationAlert.tsx`
- [ ] Add drill-down to violation details
- [ ] Implement SPC report export (PDF)
- [ ] Test: Charts render correctly
- [ ] Test: Violations displayed properly

#### Automated Monitoring
- [ ] Create Edge Function: `spc-monitor`
- [ ] Run SPC calculations on new measurements
- [ ] Auto-detect violations
- [ ] Create alerts for out-of-control conditions
- [ ] Send notifications to QA team
- [ ] Store predictions in `spc_predictions` table
- [ ] Test: Alerts triggered correctly

### Week 8: AI Integration

#### AI Service Setup
- [ ] Verify OpenAI API key in environment
- [ ] Create `lib/ai/client.ts` - OpenAI client wrapper
- [ ] Implement rate limiting for AI calls
- [ ] Implement caching for repeated queries
- [ ] Add fallback for API failures
- [ ] Track AI usage costs

#### Anomaly Detection
- [ ] Create `lib/ai/anomaly-detector.ts`
- [ ] Implement `detectAnomalies()` function
- [ ] Create prompt template for anomaly analysis
- [ ] Test with real manufacturing data
- [ ] Implement confidence scoring
- [ ] Create `components/ai/AnomalyAlert.tsx`
- [ ] Integrate with SPC dashboard
- [ ] Add user feedback loop (was this helpful?)
- [ ] Test: Anomaly detection accuracy

#### Root Cause Suggestions
- [ ] Implement `suggestRootCause()` function
- [ ] Create prompt template for RCA
- [ ] Integrate with NC detail page
- [ ] Add "Ask AI" button to 8D wizard (D4 step)
- [ ] Display suggested causes with confidence
- [ ] Allow user to accept/reject suggestions
- [ ] Track suggestion accuracy over time
- [ ] Test: Suggestions are relevant

#### AI Assistant Chat
- [ ] Update `app/ai-assistant/page.tsx`
- [ ] Create chat interface with message history
- [ ] Implement context-aware prompts (include user's data)
- [ ] Add pre-defined query templates
- [ ] Implement streaming responses
- [ ] Add capability to query database (function calling)
- [ ] Create `lib/ai/knowledge-base.ts` - RAG implementation
- [ ] Allow file uploads (COA analysis, etc.)
- [ ] Test: Chat maintains context
- [ ] Test: Database queries work correctly

#### Auto-Reports
- [ ] Implement `generateDailyQAReport()` function
- [ ] Create scheduled job to generate reports
- [ ] Email reports to QA team
- [ ] Add PDF generation
- [ ] Test: Reports contain correct data

#### Testing & Optimization
- [ ] Performance test: SPC calculations with 10K points
- [ ] Cost analysis: AI API usage
- [ ] Implement caching to reduce API calls
- [ ] User testing: AI suggestions usefulness
- [ ] Documentation: AI features user guide

---

## PHASE 5: PRODUCTION READINESS (Weeks 9-10)

### Week 9: Performance & Quality

#### Query Optimization
- [ ] Audit all query files for N+1 problems
- [ ] Fix N+1 in `lib/queries/production.ts`
- [ ] Fix N+1 in `lib/queries/dashboard.ts`
- [ ] Fix N+1 in `lib/queries/lab.ts`
- [ ] Fix N+1 in `lib/queries/traceability.ts`
- [ ] Fix N+1 in all remaining query files
- [ ] Add database indexes for common queries
- [ ] Implement query result caching (React Query)
- [ ] Add pagination to all list views
- [ ] Optimize dashboard KPI queries
- [ ] Test: Dashboard loads in < 2 seconds
- [ ] Test: No database query takes > 500ms

#### Code Quality Cleanup
- [ ] Remove all `console.log` statements
- [ ] Replace with proper logger (`lib/logger.ts`)
- [ ] Fix all TypeScript `any` types
- [ ] Run ESLint and fix all warnings
- [ ] Run Prettier to format code
- [ ] Add JSDoc comments to all public functions
- [ ] Review and remove unused imports
- [ ] Review and remove dead code
- [ ] Test: Build passes with zero warnings

#### Input Validation
- [ ] Add Zod schemas to all forms
- [ ] Validate on client side before submission
- [ ] Validate on server side (API routes)
- [ ] Add proper error messages for users
- [ ] Test: Invalid data rejected with clear messages

#### Error Handling
- [ ] Standardize error handling across all queries
- [ ] Create error boundary components
- [ ] Add toast notifications for errors
- [ ] Implement retry logic for transient failures
- [ ] Log errors to monitoring service
- [ ] Test: App displays user-friendly errors
- [ ] Test: Critical errors captured in logs

### Week 10: Testing & Documentation

#### Integration Tests
- [ ] Create `tests/integration/nc-workflow.test.ts`
- [ ] Test: NC draft → open → investigating → approved → closed
- [ ] Test: NC permissions at each step
- [ ] Create `tests/integration/sample-pipeline.test.ts`
- [ ] Test: Sample registration → analysis → review → approval
- [ ] Create `tests/integration/8d-report.test.ts`
- [ ] Test: 8D creation linked to NC
- [ ] Test: All 8 disciplines completed
- [ ] Create `tests/integration/e-signature.test.ts`
- [ ] Test: Signature capture and verification
- [ ] Create `tests/integration/pcc-monitoring.test.ts`
- [ ] Test: PCC deviation auto-creates NC
- [ ] Run all tests and achieve > 80% coverage

#### E2E Tests (Playwright)
- [ ] Create `tests/e2e/complete-qa-flow.spec.ts`
- [ ] Test: User login → create sample → analyze → approve
- [ ] Test: Create NC → investigate → create 8D → close
- [ ] Test: PCC monitoring → deviation → corrective action
- [ ] Test: Production lot creation → traceability view
- [ ] Record all tests as videos
- [ ] Test: All critical paths pass

#### Document Control Module
- [ ] Create migration `20251127_document_control.sql`
- [ ] Create `documents` and `document_versions` tables
- [ ] Create `app/documents/page.tsx` - document list
- [ ] Create `app/documents/[id]/page.tsx` - document detail
- [ ] Create `app/documents/[id]/versions/page.tsx` - version history
- [ ] Implement document upload (Supabase Storage)
- [ ] Implement version control logic
- [ ] Implement approval workflow
- [ ] Add approval signatures
- [ ] Add obsolete document handling
- [ ] Create document distribution tracking
- [ ] Test: Document lifecycle (draft → review → approved → obsolete)
- [ ] Test: Only latest version displayed by default

#### Documentation
- [ ] Create `docs/DEPLOYMENT.md` - deployment guide
- [ ] Create `docs/ARCHITECTURE.md` - updated architecture doc
- [ ] Create `docs/API.md` - API documentation
- [ ] Create `docs/USER_GUIDE.md` - user manual
- [ ] Create `docs/ADMIN_GUIDE.md` - admin setup guide
- [ ] Update `README.md` with current status
- [ ] Create video tutorials for key workflows
- [ ] Document environment variables needed
- [ ] Document database backup/restore procedures

#### Final Testing & Validation
- [ ] Security audit by external auditor
- [ ] Performance testing with production-like data
- [ ] User acceptance testing with QA team
- [ ] Compliance check against ISO 17025
- [ ] Compliance check against 21 CFR Part 11
- [ ] Load testing (100 concurrent users)
- [ ] Stress testing (database with 100K+ records)
- [ ] Browser compatibility testing
- [ ] Mobile responsiveness testing
- [ ] Accessibility audit (WCAG 2.1)

#### Production Deployment Prep
- [ ] Set up production Supabase project
- [ ] Configure production environment variables
- [ ] Set up CI/CD pipeline (GitHub Actions)
- [ ] Configure monitoring (Sentry, LogRocket)
- [ ] Set up email service (SendGrid/Resend)
- [ ] Create database backup strategy
- [ ] Create disaster recovery plan
- [ ] Perform dry-run deployment to staging
- [ ] Create rollback procedure
- [ ] Final security scan
- [ ] Create go-live checklist

---

## Post-Launch (Week 11+)

### Monitoring & Support
- [ ] Monitor error logs daily
- [ ] Track performance metrics
- [ ] Gather user feedback
- [ ] Create bug fix prioritization system
- [ ] Weekly releases with fixes and improvements

### Future Enhancements
- [ ] Mobile app (React Native)
- [ ] Advanced reporting (custom report builder)
- [ ] Integration with ERP systems (SAP, etc.)
- [ ] Predictive maintenance for equipment
- [ ] Advanced AI features (computer vision for inspections)
- [ ] Multi-language support
- [ ] Offline mode for lab tablets

---

## Task Statistics

**Total Tasks:** 487
- Phase 1: 68 tasks
- Phase 2: 42 tasks
- Phase 3: 108 tasks
- Phase 4: 68 tasks
- Phase 5: 91 tasks
- Post-Launch: 110 tasks (future)

**Critical Path Duration:** 10 weeks
**Estimated Effort:** 800-1000 hours (2-3 full-time developers)

---

## Daily Checklist Template

```markdown
## Daily Standup - [Date]

### Yesterday
- [ ] Task completed 1
- [ ] Task completed 2

### Today
- [ ] Task to do 1
- [ ] Task to do 2
- [ ] Task to do 3

### Blockers
- None / [Describe blocker]

### Notes
- [Any important notes]
```

---

**Last Updated:** 2025-11-25  
**Next Review:** Start of each week
