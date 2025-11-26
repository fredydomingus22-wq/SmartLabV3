# SmartLab V3 - Implementation Plan for Missing Features

**Based on:** Code Review 2025-11-25  
**Target Completion:** 10 weeks  
**Current Completion:** 40-45% of URS Requirements

---

## Executive Summary

This implementation plan addresses critical gaps identified in the comprehensive code review. The plan is structured in 5 phases prioritizing security, compliance, and data integrity before feature development.

**Strategic Goals:**
1. Achieve regulatory compliance (ISO 17025, 21 CFR Part 11)
2. Implement enterprise-grade security (RBAC, audit trails)
3. Complete core QA/QC workflows
4. Enable intelligent analytics and AI features
5. Reach production-ready status

---

## User Review Required

> [!IMPORTANT]
> **Critical Architecture Decisions Needed**
> 
> 1. **Multi-Tenant Strategy:** Confirm whether to use Row-Level Security (RLS) or Schema-per-Tenant approach
>    - **Recommendation:** RLS for MVP (simpler), Schema-per-Tenant for enterprise scale
>    - **Impact:** Affects all database tables and RLS policies
>
> 2. **Data Model Migration:** Decide on `FinishedLot` vs `LineSample` model
>    - **Current State:** Both models exist, causing confusion
>    - **Recommendation:** Migrate to `LineSample` for better clarity
>    - **Impact:** Requires data migration and query rewrites
>
> 3. **E-Signature Compliance Level:** Choose compliance requirement level
>    - **Option A:** Basic (username + password re-verification)
>    - **Option B:** Advanced (21 CFR Part 11 full compliance with biometrics)
>    - **Recommendation:** Option A for MVP, upgrade to B if needed
>
> 4. **AI/ML Service Provider:** Select AI provider for intelligent features
>    - **Options:** OpenAI GPT-4, Anthropic Claude, Self-hosted LLM
>    - **Recommendation:** OpenAI API initially (already in dependencies)

> [!WARNING]
> **Breaking Changes Ahead**
> 
> Phase 1 and 2 involve database schema changes that may require:
> - Data migration scripts
> - Downtime for deployment
> - Testing of all existing features
> - Update to all TypeScript types

---

## Proposed Changes

### Phase 1: Security & Compliance Foundation (Weeks 1-2)

Priority: 🔴 **CRITICAL**

#### Component: Multi-Tenant Security

##### [MODIFY] Database Schema
- Add `tenant_id UUID` to all core tables
- Create tenant isolation RLS policies
- Add factory membership enforcement

**Files Affected:**
- [schema.sql](file:///c:/Users/LENOVO/Documents/Projectos/SmartLabV3/supabase/schema.sql)
- New migration: `20251126_add_tenant_isolation.sql`

```sql
-- Example for production_lots table
ALTER TABLE production_lots ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE production_lots ADD COLUMN factory_id UUID REFERENCES factories(id);

CREATE INDEX idx_production_lots_tenant ON production_lots(tenant_id);
CREATE INDEX idx_production_lots_factory ON production_lots(factory_id);

-- Update RLS policy
DROP POLICY IF EXISTS "authenticated_write" ON production_lots;
CREATE POLICY "tenant_isolation_production_lots"
    ON production_lots FOR SELECT TO authenticated
    USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_members 
            WHERE user_id = auth.uid()
        )
    );
```

**Tables to Update (20 total):**
- production_lots, intermediate_lots, finished_lots
- samples, lab_analysis
- nc, eight_d_reports
- parameters, specifications, products
- raw_materials, raw_material_lots
- food_safety_prp, food_safety_oprp, food_safety_pcc
- equipment, reagents, reagent_batches
- audits, trainings, suppliers

---

##### [NEW] Audit Trail System

**Backend Implementation:**

###### [NEW] [audit-triggers.sql](file:///c:/Users/LENOVO/Documents/Projectos/SmartLabV3/supabase/migrations/20251126_audit_triggers.sql)

Automated database-level audit logging.

```sql
-- Universal audit trigger function
CREATE OR REPLACE FUNCTION audit_changes()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (
        table_name,
        record_id,
        action,
        old_data,
        new_data,
        changed_by,
        changed_at,
        tenant_id
    ) VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW) ELSE NULL END,
        auth.uid(),
        NOW(),
        COALESCE(NEW.tenant_id, OLD.tenant_id)
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply to all critical tables
CREATE TRIGGER audit_production_lots
    AFTER INSERT OR UPDATE OR DELETE ON production_lots
    FOR EACH ROW EXECUTE FUNCTION audit_changes();
-- Repeat for all 20+ critical tables
```

###### [MODIFY] [lib/rbac.ts](file:///c:/Users/LENOVO/Documents/Projectos/SmartLabV3/lib/rbac.ts)

Update RBAC to use permission matrix.

```typescript
export async function hasPermission(permission: string): Promise<boolean> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!profile) return false;

    const permissions = rolePermissions[profile.role as Role];
    return permissions.includes('*') || permissions.includes(permission);
}

// Application-level audit logging
export async function logAction(
    action: string,
    entityType: string,
    entityId: string,
    details?: Record<string, unknown>
) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('audit_logs').insert({
        action,
        entity_type: entityType,
        entity_id: entityId,
        details,
        performed_by: user.id
    });
}
```

###### [NEW] [lib/audit.ts](file:///c:/Users/LENOVO/Documents/Projectos/SmartLabV3/lib/audit.ts)

Audit query utilities.

```typescript
export async function getAuditTrail(
    entityType: string,
    entityId: string
): Promise<AuditLog[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('audit_logs')
        .select(`
            *,
            user:profiles!performed_by(full_name, email)
        `)
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('changed_at', { ascending: false });

    if (error) throw error;
    return data;
}
```

**Frontend Components:**

###### [NEW] [components/audit/AuditTrail.tsx](file:///c:/Users/LENOVO/Documents/Projectos/SmartLabV3/components/audit/AuditTrail.tsx)

Reusable audit trail display component.

---

##### [NEW] E-Signature Module

###### [NEW] [lib/e-signature.ts](file:///c:/Users/LENOVO/Documents/Projectos/SmartLabV3/lib/e-signature.ts)

```typescript
import { createClient } from '@/lib/supabase/client';
import bcrypt from 'bcryptjs';

export interface ESignature {
    id: string;
    user_id: string;
    entity_type: string;
    entity_id: string;
    meaning: 'approved' | 'reviewed' | 'witnessed' | 'performed';
    signature_hash: string;
    signed_at: string;
    ip_address?: string;
    user_agent?: string;
}

export async function captureSignature(
    password: string,
    meaning: ESignature['meaning'],
    entityType: string,
    entityId: string,
    comment?: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = createClient();
    
    // 1. Re-verify user's password via Supabase Auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    // Verify password by attempting to sign in
    const { error: authError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: password
    });

    if (authError) {
        return { success: false, error: 'Invalid password' };
    }

    // 2. Create signature record
    const signatureData = {
        user_id: user.id,
        entity_type: entityType,
        entity_id: entityId,
        meaning,
        signature_hash: await bcrypt.hash(`${user.id}:${Date.now()}`, 10),
        signed_at: new Date().toISOString(),
        comment,
        ip_address: await getClientIP(),
        user_agent: navigator.userAgent
    };

    const { error: insertError } = await supabase
        .from('e_signatures')
        .insert(signatureData);

    if (insertError) {
        return { success: false, error: insertError.message };
    }

    // 3. Audit the signature
    await logAction('e_signature_captured', entityType, entityId, {
        meaning,
        signed_at: signatureData.signed_at
    });

    return { success: true };
}

async function getClientIP(): Promise<string> {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch {
        return 'unknown';
    }
}
```

###### [NEW] [components/e-signature/SignatureDialog.tsx](file:///c:/Users/LENOVO/Documents/Projectos/SmartLabV3/components/e-signature/SignatureDialog.tsx)

Reusable signature capture dialog.

---

##### [MODIFY] RLS Policies

Update all RLS policies from permissive to role-based.

**Example for NC table:**
```sql
-- lib/queries/qms.ts will use this
DROP POLICY IF EXISTS "authenticated_write" ON nc;

CREATE POLICY "nc_read_all" ON nc
    FOR SELECT TO authenticated
    USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "nc_create_technician" ON nc
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('admin', 'manager', 'supervisor', 'technician')
        )
    );

CREATE POLICY "nc_approve_supervisor" ON nc
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('admin', 'manager', 'supervisor')
        )
    );
```

---

### Phase 2: Data Model Cleanup (Week 3)

Priority: 🔴 **CRITICAL**

#### Component: Schema Consolidation

##### [NEW] Consolidated Schema Generator

###### [NEW] [scripts/generate-schema.sh](file:///c:/Users/LENOVO/Documents/Projectos/SmartLabV3/scripts/generate-schema.sh)

```bash
#!/bin/bash
# Generate consolidated schema from live database

supabase db dump --schema public > supabase/schema_consolidated.sql

echo "Schema dumped successfully"
echo "Review and replace schema.sql if correct"
```

##### [MODIFY] Samples Table Migration

###### [NEW] [20251126_consolidate_samples_schema.sql](file:///c:/Users/LENOVO/Documents/Projectos/SmartLabV3/supabase/migrations/20251126_consolidate_samples_schema.sql)

```sql
-- Consolidate samples vs lab_tests confusion

-- 1. If samples table doesn't exist, create it properly
CREATE TABLE IF NOT EXISTS samples (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    
    -- Type and source
    sample_type TEXT NOT NULL CHECK (sample_type IN (
        'environmental_swab',
        'finished_product',
        'intermediate_product',
        'raw_material',
        'water_sample',
        'equipment_swab',
        'personnel_swab',
        'air_sample',
        'other'
    )),
    
    -- Foreign keys (conditional based on type)
    product_id UUID REFERENCES products(id),
    production_lot_id UUID REFERENCES production_lots(id),
    intermediate_lot_id UUID REFERENCES intermediate_lots(id),
    raw_material_lot_id UUID REFERENCES raw_material_lots(id),
    tank_id UUID REFERENCES mixing_tanks(id),
    
    -- Collection info
    collected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    collected_by UUID REFERENCES profiles(id),
    location TEXT,
    
    -- Status workflow
    status TEXT DEFAULT 'pending' CHECK (status IN (
        'pending',
        'in_analysis',
        'under_review',
        'approved',
        'rejected'
    )),
    
    -- Priority
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    
    -- Assignment
    assigned_to UUID REFERENCES profiles(id),
    
    -- Multi-tenant
    tenant_id UUID REFERENCES tenants(id),
    factory_id UUID REFERENCES factories(id),
    
    -- Metadata
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Migrate data from lab_tests if it has different structure
-- INSERT INTO samples (...)
-- SELECT ... FROM lab_tests WHERE ...;

-- 3. Create proper indexes
CREATE INDEX idx_samples_type ON samples(sample_type);
CREATE INDEX idx_samples_status ON samples(status);
CREATE INDEX idx_samples_priority ON samples(priority);
CREATE INDEX idx_samples_product ON samples(product_id);
CREATE INDEX idx_samples_production_lot ON samples(production_lot_id);
CREATE INDEX idx_samples_tenant ON samples(tenant_id);
CREATE INDEX idx_samples_collected_at ON samples(collected_at DESC);

-- 4. Enable RLS
ALTER TABLE samples ENABLE ROW LEVEL SECURITY;

CREATE POLICY "samples_tenant_isolation"
    ON samples FOR SELECT TO authenticated
    USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()
        )
    );
```

##### [MODIFY] Type Definitions

###### [MODIFY] [types/lims.ts](file:///c:/Users/LENOVO/Documents/Projectos/SmartLabV3/types/lims.ts)

Consolidate and fix sample types.

```typescript
export interface Sample {
    id: string;
    code: string;
    
    // Type discriminator
    sample_type: 
        | 'environmental_swab'
        | 'finished_product'
        | 'intermediate_product'
        | 'raw_material'
        | 'water_sample'
        | 'equipment_swab'
        | 'personnel_swab'
        | 'air_sample'
        | 'other';
    
    // Conditional foreign keys
    product_id?: string;
    production_lot_id?: string;
    intermediate_lot_id?: string;
    raw_material_lot_id?: string;
    tank_id?: string;
    
    // Collection
    collected_at: string;
    collected_by?: string;
    location?: string;
    
    // Workflow
    status: 'pending' | 'in_analysis' | 'under_review' | 'approved' | 'rejected';
    priority: 'low' | 'normal' | 'high' | 'urgent';
    assigned_to?: string;
    
    // Multi-tenant
    tenant_id?: string;
    factory_id?: string;
    
    // Relationships
    product?: Product;
    production_lot?: ProductionLot;
    analyses?: LabAnalysis[];
    
    notes?: string;
    created_at: string;
    updated_at: string;
}
```

##### [DELETE] Deprecated Types

###### [MODIFY] [types/production.ts](file:///c:/Users/LENOVO/Documents/Projectos/SmartLabV3/types/production.ts:L84-L98)

Remove `@deprecated` markers and complete migration to LineSample OR remove LineSample entirely.

**Decision Required:** Migrate to LineSample or keep FinishedLot?

**Recommendation:** Keep FinishedLot for now (simpler), remove LineSample types.

---

### Phase 3: Core Workflows Implementation (Weeks 4-6)

Priority: 🟠 **HIGH**

#### Component: LIMS Sample Pipeline

##### [MODIFY] Sample Registration Page

###### [MODIFY] [app/lab/samples/register/page.tsx](file:///c:/Users/LENOVO/Documents/Projectos/SmartLabV3/app/lab/samples/register/page.tsx)

Add Zod validation and proper error handling.

```typescript
import { z } from 'zod';

const sampleSchema = z.object({
    code: z.string().min(3, 'Code must be at least 3 characters'),
    sample_type: z.enum([
        'environmental_swab',
        'finished_product',
        'intermediate_product',
        'raw_material',
        'water_sample',
        'equipment_swab',
        'personnel_swab',
        'air_sample',
        'other'
    ]),
    product_id: z.string().uuid().optional(),
    production_lot_id: z.string().uuid().optional(),
    collected_at: z.string().datetime(),
    priority: z.enum(['low', 'normal', 'high', 'urgent']),
}).refine(data => {
    // Finished product must have production_lot_id
    if (data.sample_type === 'finished_product') {
        return !!data.production_lot_id;
    }
    return true;
}, {
    message: 'Finished product samples must have a production lot',
    path: ['production_lot_id']
});

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = sampleSchema.safeParse(formData);
    if (!validation.success) {
        toast.error(validation.error.errors[0].message);
        return;
    }
    
    // Rest of submission logic
};
```

##### [NEW] Sample Workflow Manager

###### [NEW] [app/lab/samples/workflow/page.tsx](file:///c:/Users/LENOVO/Documents/Projectos/SmartLabV3/app/lab/samples/workflow/page.tsx)

Sample pipeline management (pending → in_analysis → review → approved).

##### [NEW] Analyst Assignment

###### [NEW] [components/lab/SampleAssignment.tsx](file:///c:/Users/LENOVO/Documents/Projectos/SmartLabV3/components/lab/SampleAssignment.tsx)

Drag-and-drop sample assignment to analysts.

---

#### Component: NC Workflow System

##### [NEW] NC Status Machine

###### [NEW] [lib/workflows/nc-workflow.ts](file:///c:/Users/LENOVO/Documents/Projectos/SmartLabV3/lib/workflows/nc-workflow.ts)

```typescript
export type NCStatus = 
    | 'draft'
    | 'open'
    | 'investigating'
    | 'pending_approval'
    | 'approved'
    | 'rejected'
    | 'closed';

export interface NCTransition {
    from: NCStatus;
    to: NCStatus;
    requiredRole: Role[];
    action: string;
}

const ncWorkflow: NCTransition[] = [
    { from: 'draft', to: 'open', requiredRole: ['technician', 'supervisor', 'manager', 'admin'], action: 'submit' },
    { from: 'open', to: 'investigating', requiredRole: ['supervisor', 'manager', 'admin'], action: 'start_investigation' },
    { from: 'investigating', to: 'pending_approval', requiredRole: ['supervisor', 'manager', 'admin'], action: 'complete_investigation' },
    { from: 'pending_approval', to: 'approved', requiredRole: ['manager', 'admin'], action: 'approve' },
    { from: 'pending_approval', to: 'rejected', requiredRole: ['manager', 'admin'], action: 'reject' },
    { from: 'approved', to: 'closed', requiredRole: ['manager', 'admin'], action: 'close_with_signature' },
];

export async function transitionNC(
    ncId: string,
    toStatus: NCStatus,
    comment?: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = createClient();
    
    // 1. Get current NC
    const { data: nc, error: fetchError } = await supabase
        .from('nc')
        .select('status')
        .eq('id', ncId)
        .single();
    
    if (fetchError || !nc) {
        return { success: false, error: 'NC not found' };
    }
    
    // 2. Check if transition is valid
    const transition = ncWorkflow.find(
        t => t.from === nc.status && t.to === toStatus
    );
    
    if (!transition) {
        return { success: false, error: `Invalid transition from ${nc.status} to ${toStatus}` };
    }
    
    // 3. Check permission
    const hasPermission = await checkPermission(transition.requiredRole[0]);
    if (!hasPermission) {
        return { success: false, error: 'Insufficient permissions' };
    }
    
    // 4. Update NC
    const { error: updateError } = await supabase
        .from('nc')
        .update({
            status: toStatus,
            updated_at: new Date().toISOString()
        })
        .eq('id', ncId);
    
    if (updateError) {
        return { success: false, error: updateError.message };
    }
    
    // 5. Log transition
    await logAction(`nc_${transition.action}`, 'nc', ncId, {
        from_status: nc.status,
        to_status: toStatus,
        comment
    });
    
    return { success: true };
}
```

##### [NEW] NC Management Pages

###### [NEW] [app/nc/[id]/page.tsx](file:///c:/Users/LENOVO/Documents/Projectos/SmartLabV3/app/nc/[id]/page.tsx)

NC detail page with workflow actions.

###### [MODIFY] [app/nc/page.tsx](file:///c:/Users/LENOVO/Documents/Projectos/SmartLabV3/app/nc/page.tsx)

Add workflow status filters and bulk actions.

---

#### Component: 8D Report Wizard

##### [NEW] 8D Step-by-Step Component

###### [NEW] [components/qms/8d-wizard/EightDWizard.tsx](file:///c:/Users/LENOVO/Documents/Projectos/SmartLabV3/components/qms/8d-wizard/EightDWizard.tsx)

Multi-step wizard for D1-D8 with validation.

```typescript
const steps = [
    { id: 'd1', title: 'D1: Form Team', component: D1TeamForm },
    { id: 'd2', title: 'D2: Describe Problem', component: D2ProblemDescription },
    { id: 'd3', title: 'D3: Interim Actions', component: D3InterimActions },
    { id: 'd4', title: 'D4: Root Cause', component: D4RootCause },
    { id: 'd5', title: 'D5: Corrective Actions', component: D5CorrectiveActions },
    { id: 'd6', title: 'D6: Implement', component: D6Implementation },
    { id: 'd7', title: 'D7: Prevent Recurrence', component: D7Prevention },
    { id: 'd8', title: 'D8: Congratulate Team', component: D8Closure },
];
```

##### [NEW] Root Cause Analysis Tool

###### [NEW] [components/qms/RootCauseAnalysis.tsx](file:///c:/Users/LENOVO/Documents/Projectos/SmartLabV3/components/qms/RootCauseAnalysis.tsx)

Interactive 5-Why / Fishbone diagram tool.

---

#### Component: PCC Monitoring Workflow

##### [NEW] PCC Verification Page

###### [NEW] [app/food-safety/pcc/verify/page.tsx](file:///c:/Users/LENOVO/Documents/Projectos/SmartLabV3/app/food-safety/pcc/verify/page.tsx)

Real-time PCC monitoring with critical limit checks.

```typescript
// Auto-create NC if critical limit exceeded
if (measuredValue > criticalLimit || measuredValue < lowerLimit) {
    await createNC({
        type: 'critical',
        source: 'pcc_deviation',
        pcc_id: pccId,
        description: `PCC ${pccName} exceeded critical limit: ${measuredValue} ${unit}`,
        immediate_action_required: true
    });
    
    // Send alert
    await sendAlert({
        type: 'critical_pcc_deviation',
        recipients: ['qa_manager', 'production_supervisor'],
        data: { pccName, measuredValue, criticalLimit }
    });
}
```

---

### Phase 4: Analytics & AI Implementation (Weeks 7-8)

Priority: 🟡 **MEDIUM**

#### Component: SPC Calculation Engine

##### [NEW] SPC Statistical Functions

###### [NEW] [lib/spc/calculations.ts](file:///c:/Users/LENOVO/Documents/Projectos/SmartLabV3/lib/spc/calculations.ts)

```typescript
export interface SPCDataPoint {
    value: number;
    timestamp: string;
    subgroup?: number;
}

export interface SPCLimits {
    ucl: number;  // Upper Control Limit
    lcl: number;  // Lower Control Limit
    cl: number;   // Center Line (mean)
    usl?: number; // Upper Spec Limit
    lsl?: number; // Lower Spec Limit
}

export interface SPCCapability {
    cp: number;   // Process Capability
    cpk: number;  // Process Capability Index
    pp: number;   // Process Performance
    ppk: number;  // Process Performance Index
}

export function calculateXbarR(
    data: SPCDataPoint[][],  // Array of subgroups
): SPCLimits {
    // Calculate mean of each subgroup
    const subgroupMeans = data.map(subgroup => 
        subgroup.reduce((sum, point) => sum + point.value, 0) / subgroup.length
    );
    
    // Calculate range of each subgroup
    const subgroupRanges = data.map(subgroup => {
        const values = subgroup.map(p => p.value);
        return Math.max(...values) - Math.min(...values);
    });
    
    // Calculate X-double-bar (grand mean)
    const xBar = subgroupMeans.reduce((sum, mean) => sum + mean, 0) / subgroupMeans.length;
    
    // Calculate R-bar (average range)
    const rBar = subgroupRanges.reduce((sum, range) => sum + range, 0) / subgroupRanges.length;
    
    // Constants for subgroup size
    const n = data[0].length;
    const A2 = getA2Constant(n);
    const D3 = getD3Constant(n);
    const D4 = getD4Constant(n);
    
    return {
        ucl: xBar + (A2 * rBar),
        lcl: xBar - (A2 * rBar),
        cl: xBar
    };
}

export function calculateCpk(
    data: number[],
    usl: number,
    lsl: number
): SPCCapability {
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (data.length - 1);
    const stdDev = Math.sqrt(variance);
    
    const cp = (usl - lsl) / (6 * stdDev);
    const cpkUpper = (usl - mean) / (3 * stdDev);
    const cpkLower = (mean - lsl) / (3 * stdDev);
    const cpk = Math.min(cpkUpper, cpkLower);
    
    // For Pp/Ppk, use population std dev
    const stdDevPop = Math.sqrt(
        data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length
    );
    
    const pp = (usl - lsl) / (6 * stdDevPop);
    const ppk = Math.min(
        (usl - mean) / (3 * stdDevPop),
        (mean - lsl) / (3 * stdDevPop)
    );
    
    return { cp, cpk, pp, ppk };
}

export function detectWesternElectricRules(
    data: SPCDataPoint[],
    limits: SPCLimits
): RuleViolation[] {
    const violations: RuleViolation[] = [];
    
    // Rule 1: Point beyond control limits
    data.forEach((point, index) => {
        if (point.value > limits.ucl || point.value < limits.lcl) {
            violations.push({
                rule: 1,
                description: 'Point beyond control limits',
                index,
                severity: 'critical'
            });
        }
    });
    
    // Rule 2: 9 points in a row on same side of center line
    for (let i = 8; i < data.length; i++) {
        const lastNine = data.slice(i - 8, i + 1);
        const allAbove = lastNine.every(p => p.value > limits.cl);
        const allBelow = lastNine.every(p => p.value < limits.cl);
        
        if (allAbove || allBelow) {
            violations.push({
                rule: 2,
                description: '9 consecutive points on same side',
                index: i,
                severity: 'warning'
            });
        }
    }
    
    // Rules 3-8 implementation...
    
    return violations;
}
```

##### [MODIFY] SPC Dashboard

###### [MODIFY] [app/spc/page.tsx](file:///c:/Users/LENOVO/Documents/Projectos/SmartLabV3/app/spc/page.tsx)

Integrate real calculations and auto-detect violations.

---

#### Component: AI Anomaly Detection

##### [NEW] AI Integration Service

###### [NEW] [lib/ai/anomaly-detector.ts](file:///c:/Users/LENOVO/Documents/Projectos/SmartLabV3/lib/ai/anomaly-detector.ts)

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export async function detectAnomalies(
    parameterName: string,
    measurements: number[],
    context?: {
        trend?: 'increasing' | 'decreasing' | 'stable';
        cpk?: number;
        recentViolations?: string[];
    }
): Promise<{
    hasAnomaly: boolean;
    confidence: number;
    explanation: string;
    suggestedActions: string[];
}> {
    const prompt = `You are a quality control expert analyzing manufacturing data.

Parameter: ${parameterName}
Recent measurements: ${measurements.slice(-20).join(', ')}
${context?.trend ? `Trend: ${context.trend}` : ''}
${context?.cpk ? `Current Cpk: ${context.cpk}` : ''}
${context?.recentViolations ? `Recent violations: ${context.recentViolations.join('; ')}` : ''}

Analyze this data for anomalies or concerning patterns. Consider:
1. Statistical trends
2. Process capability
3. Western Electric rules
4. Industry best practices for beverage manufacturing

Respond in JSON format:
{
    "hasAnomaly": boolean,
    "confidence": 0-100,
    "explanation": "brief explanation",
    "suggestedActions": ["action1", "action2"]
}`;

    const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.3
    });

    return JSON.parse(response.choices[0].message.content!);
}

export async function suggestRootCause(
    ncDescription: string,
    relatedData: {
        productName: string;
        lotCode: string;
        parametersFailed: string[];
        shift?: string;
        line?: string;
    }
): Promise<{
    likelyRootCauses: string[];
    investigationSteps: string[];
    preventiveMeasures: string[];
}> {
    const prompt = `You are a quality engineer investigating a non-conformity.

Non-conformity: ${ncDescription}
Product: ${relatedData.productName}
Lot: ${relatedData.lotCode}
Failed parameters: ${relatedData.parametersFailed.join(', ')}
${relatedData.shift ? `Shift: ${relatedData.shift}` : ''}
${relatedData.line ? `Line: ${relatedData.line}` : ''}

Based on your expertise in beverage manufacturing, suggest:
1. Most likely root causes (ranked by probability)
2. Investigation steps to confirm root cause
3. Preventive measures to avoid recurrence

Respond in JSON format.`;

    const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.5
    });

    return JSON.parse(response.choices[0].message.content!);
}
```

##### [NEW] AI Assistant UI

###### [MODIFY] [app/ai-assistant/page.tsx](file:///c:/Users/LENOVO/Documents/Projectos/SmartLabV3/app/ai-assistant/page.tsx)

Convert scaffold to functional AI chat interface.

---

### Phase 5: Polish & Production Readiness (Weeks 9-10)

Priority: 🟢 **LOW** (but required for production)

#### Component: Performance Optimization

##### [MODIFY] Query Optimization

Fix N+1 query problems across all query files.

**Example fix:**

```typescript
// Before (N+1 problem)
const lots = await getLots();
for (const lot of lots) {
    lot.analyses = await getAnalyses(lot.id);  // ❌
}

// After (proper join)
const { data: lots } = await supabase
    .from('production_lots')
    .select(`
        *,
        product:products(*),
        analyses:lab_analysis(
            *,
            parameter:parameters(*)
        )
    `);  // ✅
```

---

#### Component: Testing Infrastructure

##### [NEW] Integration Tests

###### [NEW] [tests/integration/workflows.test.ts](file:///c:/Users/LENOVO/Documents/Projectos/SmartLabV3/tests/integration/workflows.test.ts)

```typescript
describe('NC Workflow', () => {
    it('should enforce status transitions', async () => {
        const nc = await createNC({ type: 'minor' });
        
        // Draft -> Open is allowed
        const result1 = await transitionNC(nc.id, 'open');
        expect(result1.success).toBe(true);
        
        // Open -> Closed is NOT allowed (must go through investigation)
        const result2 = await transitionNC(nc.id, 'closed');
        expect(result2.success).toBe(false);
        expect(result2.error).toContain('Invalid transition');
    });
    
    it('should require proper permissions', async () => {
        // Test with technician role (cannot approve)
        // Test with manager role (can approve)
    });
});
```

---

#### Component: Document Control Module

##### [NEW] Document Management System

###### [NEW] [app/documents/versions/page.tsx](file:///c:/Users/LENOVO/Documents/Projectos/SmartLabV3/app/documents/versions/page.tsx)

Document version control with approval workflow.

###### [NEW] Database tables:

```sql
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    category TEXT,
    current_version_id UUID,
    status TEXT DEFAULT 'draft',
    tenant_id UUID REFERENCES tenants(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE document_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    version_number TEXT NOT NULL,
    file_path TEXT NOT NULL,
    changes_summary TEXT,
    created_by UUID REFERENCES profiles(id),
    approved_by UUID REFERENCES profiles(id),
    approved_at TIMESTAMPTZ,
    status TEXT DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Verification Plan

### Automated Tests

1. **Unit Tests**
   - SPC calculation functions
   - Workflow state machines
   - Permission checks

2. **Integration Tests**
   - Complete NC workflow (draft → closed)
   - Sample pipeline (registration → approval)
   - 8D report creation
   - E-signature validation

3. **E2E Tests** (Playwright)
   - User login → create sample → assign analyst → enter results → approve
   - Create NC → assign → investigate → create 8D → close
   - PCC monitoring → deviation → auto-create NC

### Manual Verification

1. **Security Audit**
   - Verify tenant isolation (user from Tenant A cannot see Tenant B data)
   - Test RBAC (technician cannot approve, manager can)
   - Verify audit trail captures all critical operations

2. **Compliance Check**
   - E-signature meets 21 CFR Part 11 requirements
   - Audit logs are immutable
   - All critical actions are logged

3. **Performance Testing**
   - Dashboard loads in < 2 seconds with 10,000 lots
   - SPC chart renders in < 1 second with 1,000 data points
   - No N+1 queries detected

4. **User Acceptance Testing**
   - QA manager validates NC workflow
   - Lab technician validates sample pipeline
   - Production supervisor validates PCC monitoring

---

## Timeline & Milestones

| Phase | Duration | Deliverable | Success Criteria |
|-------|----------|-------------|------------------|
| **Phase 1** | Weeks 1-2 | Security & Compliance | All tables have tenant_id, RLS enforced, audit trail functional, e-signature working |
| **Phase 2** | Week 3 | Data Model Cleanup | Schema consolidated, type-schema alignment, no deprecated types |
| **Phase 3** | Weeks 4-6 | Core Workflows | NC workflow complete, 8D wizard functional, sample pipeline working, PCC monitoring live |
| **Phase 4** | Weeks 7-8 | Analytics & AI | Real SPC calculations, Cpk/Ppk working, anomaly detection functional, AI suggestions working |
| **Phase 5** | Weeks 9-10 | Production Ready | All tests passing, performance optimized, document control implemented |

**Total Duration:** 10 weeks

---

## Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Breaking changes affect existing data | High | Critical | Create data migration scripts, test on staging first |
| Multi-tenant migration requires downtime | Medium | High | Schedule maintenance window, prepare rollback plan |
| AI costs exceed budget | Medium | Medium | Implement caching, rate limiting, fallback to rule-based |
| E-signature implementation delayed | Low | High | Start early (Phase 1), use simple password re-verification initially |
| Performance issues with large datasets | Medium | Medium | Implement pagination, optimize queries progressively |

---

## Dependencies

### External Services
- ✅ Supabase (already configured)
- ✅ OpenAI API (key in environment)
- ⚠️ Email service for alerts (needed: SendGrid/Resend)

### Development Tools
- ✅ Next.js 14
- ✅ TypeScript
- ✅ Zod validation
- ⚠️ bcryptjs for e-signature (need to add)
- ⚠️ recharts (already installed, needs enhancement)

### Testing Tools
- ✅ Jest (configured)
- ✅ Playwright (configured)
- ⚠️ Testing Library (need more coverage)

---

## Success Metrics

By end of implementation:

✅ **Security:**
- 100% of tables have tenant isolation
- 0 security vulnerabilities in audit
- E-signature functional for all critical approvals

✅ **Completion:**
- 90%+ URS requirements implemented
- All core workflows functional
- Document control module live

✅ **Quality:**
- 80%+ test coverage
- 0 critical bugs
- Dashboard load time < 2 seconds

✅ **Compliance:**
- Passes ISO 17025 audit
- 21 CFR Part 11 e-signature compliant
- Complete audit trail for all critical operations

---

**Next Steps:**
1. Review and approve this implementation plan
2. Make architectural decisions (multi-tenant strategy, data model)
3. Begin Phase 1: Security & Compliance implementation
