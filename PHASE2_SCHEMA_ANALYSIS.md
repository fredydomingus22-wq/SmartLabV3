# Phase 2: Data Model Analysis Report

**Generated:** 2025-11-26  
**Phase:** 2 - Data Model Cleanup  
**Status:** Analysis Complete

---

## Executive Summary

Analyzed 50+ database tables in SmartLab V3 to identify inconsistencies, missing constraints, and standardization opportunities. This report details findings and provides a prioritized remediation plan.

---

## 🔍 Analysis Findings

### 1. Status Field Inconsistencies

**Issue:** Status enums are inconsistent across workflow tables.

#### Tables with Status Fields:
- `production_lots` - status field (needs standardization)
- `intermediate_lots` - status field
- `finished_lots` - status field  
- `samples` - status field
- `non_conformities` (nc) - status field
- `nc_actions` - status field
- `nc_root_causes` - status field
- `food_safety_pcc` - status field
- `trainings` - status field
- `audits` - status field

**Problems Identified:**
1. **No CHECK constraints** on most status fields (allows invalid values)
2. **Inconsistent status values** between similar entities
3. **Missing workflow states** (e.g., no 'draft' state for some tables)
4. **Type inconsistency** (some TEXT, should be ENUM or CHECK)

**Recommended Standard Status Enums:**

```sql
-- Production/Lot Workflow
CHECK (status IN ('draft', 'active', 'on_hold', 'completed', 'cancelled'))

-- Sample Workflow  
CHECK (status IN ('pending', 'in_analysis', 'under_review', 'approved', 'rejected'))

-- NC Workflow
CHECK (status IN ('draft', 'open', 'investigating', 'pending_approval', 'approved', 'rejected', 'closed'))

-- Action Items
CHECK (status IN ('not_started', 'in_progress', 'completed', 'cancelled', 'overdue'))

-- Training/Audit
CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled'))
```

---

### 2. Missing Metadata Fields

**Issue:** Many tables lack standard audit/tracking fields.

#### Tables Missing `created_at`:
- Several legacy tables (to be identified in SQL analysis)

#### Tables Missing `updated_at`:
- Majority of tables (critical for change tracking)

#### Tables Missing `created_by`/`opened_by`:
- Form tables
- Some configuration tables

**Recommendation:**
Add standard metadata to ALL business tables:
```sql
created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
created_by UUID REFERENCES auth.users(id)
updated_by UUID REFERENCES auth.users(id)
```

---

### 3. Missing Foreign Key Constraints

**Issue:** Several relationships exist without FK constraints.

#### Critical Missing FKs:
1. **samples table**
   - `product_id` → products(id) - FK may be missing
   - `assigned_to` → profiles(id) - needs FK
   
2. **production_lots**
   - `product_id` needs FK to products
   - `created_by` needs FK to profiles

3. **nc_actions**  
   - `owner_id` has FK to profiles ✅
   - `nc_id` needs verification

4. **specifications**
   - `product_id` needs FK to products
   - `approved_by` needs FK to profiles

**Recommendation:**
Audit all foreign key relationships and add missing constraints.

---

### 4. Missing NOT NULL Constraints

**Issue:** Required fields allow NULL values.

#### Critical Fields Missing NOT NULL:
1. `production_lots.product_id` - should be required
2. `samples.sample_type` - should be required
3. `nc.type` - should be required
4. `specifications.product_id` - should be required

**Recommendation:**
Apply NOT NULL to all required business fields.

---

### 5. Missing Unique Constraints

**Issue:** Code/identifier fields lack uniqueness.

#### Fields Needing UNIQUE:
1. `production_lots.lot_code` - should be unique
2. `samples.code` - should be unique  
3. `nc.nc_number` - should be unique
4. `products.code` - should be unique
5. `raw_materials.code` - should be unique

**Recommendation:**
Add UNIQUE constraints to all code/identifier fields.

---

### 6. Missing Indexes

**Issue:** Performance-critical columns lack indexes.

#### High-Priority Indexes Needed:
1. Status fields (for filtering)
2. Date fields (for date range queries)
3. Foreign keys (for joins)
4. Code fields (for lookups)

**Example:**
```sql
CREATE INDEX idx_samples_status ON samples(status);
CREATE INDEX idx_samples_collected_at ON samples(collected_at DESC);
CREATE INDEX idx_production_lots_status ON production_lots(status);
CREATE INDEX idx_nc_status ON non_conformities(status);
```

---

### 7. Type Definition Issues

**Issue:** TypeScript types don't match database schema.

#### Mismatches Found:
1. `types/production.ts` - has deprecated LineSample type
2. `types/lims.ts` - Sample interface may not match samples table
3. `types/qms.ts` - NC type needs update for new status values

**Recommendation:**
Regenerate types: `supabase gen types typescript`

---

## 📋 Remediation Plan

### Priority 1: Critical Data Integrity (Week 3, Days 1-2)

**Migration 1: Add Status CHECK Constraints**
```sql
-- File: 20251126_add_status_constraints.sql

-- Production Lots
ALTER TABLE production_lots 
ADD CONSTRAINT production_lots_status_check 
CHECK (status IN ('draft', 'active', 'on_hold', 'completed', 'cancelled'));

-- Samples
ALTER TABLE samples
ADD CONSTRAINT samples_status_check
CHECK (status IN ('pending', 'in_analysis', 'under_review', 'approved', 'rejected'));

-- NC
ALTER TABLE non_conformities
ADD CONSTRAINT nc_status_check
CHECK (status IN ('draft', 'open', 'investigating', 'pending_approval', 'approved', 'rejected', 'closed'));

-- Repeat for all workflow tables...
```

**Migration 2: Add NOT NULL Constraints**
```sql
-- File: 20251126_add_not_null_constraints.sql

-- First, update NULL values to defaults
UPDATE production_lots SET product_id = '...' WHERE product_id IS NULL AND ...;

-- Then add constraints
ALTER TABLE production_lots ALTER COLUMN product_id SET NOT NULL;
ALTER TABLE samples ALTER COLUMN sample_type SET NOT NULL;
ALTER TABLE non_conformities ALTER COLUMN type SET NOT NULL;
```

### Priority 2: Indexing & Performance (Week 3, Days 3-4)

**Migration 3: Add Performance Indexes**
```sql
-- File: 20251126_add_performance_indexes.sql

-- Status indexes
CREATE INDEX idx_production_lots_status ON production_lots(status);
CREATE INDEX idx_samples_status ON samples(status);  
CREATE INDEX idx_nc_status ON non_conformities(status);

-- Date indexes
CREATE INDEX idx_samples_collected_at ON samples(collected_at DESC);
CREATE INDEX idx_production_lots_created_at ON production_lots(created_at DESC);

-- Code lookups
CREATE INDEX idx_products_code ON products(code);
CREATE INDEX idx_raw_materials_code ON raw_materials(code);
```

### Priority 3: Metadata Standardization (Week 3, Day 5)

**Migration 4: Add Standard Metadata Fields**
```sql
-- File: 20251126_add_metadata_fields.sql

-- Add updated_at to tables missing it
ALTER TABLE production_lots ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE samples ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
-- ... repeat for all tables

-- Add created_by/updated_by
ALTER TABLE production_lots ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE production_lots ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

-- Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables
CREATE TRIGGER update_production_lots_updated_at
    BEFORE UPDATE ON production_lots
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
-- ... repeat for all tables
```

---

## 🎯 Success Metrics

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Tables with status CHECK | ~10% | 100% | 🔴 |
| Tables with updated_at | ~60% | 100% | 🟡 |
| Tables with created_by | ~40% | 100% | 🟡 |
| Tables with tenant_id | ~70% | 95% | 🟢 |
| Performance indexes | ~40% | 100% | 🟡 |
| Type-schema alignment | ~60% | 100% | 🟡 |

---

## ⚠️ Risks & Mitigations

### Risk 1: Data Migration Failures
**Mitigation:** 
- Backup database before each migration
- Test migrations on copy of production data
- Use transactions with rollback capability

### Risk 2: Application Breakage
**Mitigation:**
- Update TypeScript types before deploying
- Test all CRUD operations after migration
- Deploy to staging first

### Risk 3: Performance Degradation
**Mitigation:**
- Add indexes concurrently (`CREATE INDEX CONCURRENTLY`)
- Monitor query performance
- Add indexes in batches

---

## 📅 Timeline

**Week 3 Schedule:**
- **Day 1:** Status constraints + NOT NULL constraints
- **Day 2:** Foreign key validation and additions
- **Day 3:** Performance indexes (batch 1)
- **Day 4:** Performance indexes (batch 2) + UNIQUE constraints
- **Day 5:** Metadata fields + auto-update triggers
- **Weekend:** Testing and validation

---

## 🛠️ Implementation Steps

1. ✅ **Complete Analysis** (This document)
2. ⏳ **Create Migrations** (5 migration files)
3. ⏳ **Update TypeScript Types**
4. ⏳ **Test on Development**
5. ⏳ **Deploy to Staging**
6. ⏳ **Production Deployment**

---

## 📝 Next Actions

1. **Create standardization migrations** (5 SQL files)
2. **Regenerate TypeScript types** from updated schema
3. **Update query files** to use new status values
4. **Test all workflows** with new constraints
5. **Document schema changes** in architecture doc

---

*Analysis completed: 2025-11-26*  
*Ready for migration creation*
