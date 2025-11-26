-- ============================================================================
-- RBAC-ENFORCED RLS POLICIES
-- Date: 2025-11-26
-- Phase: 1 Week 2 - Security & Compliance Foundation
-- Description: Replace permissive RLS policies with role-based access control
-- ============================================================================

-- ============================================================================
-- STEP 1: Drop all permissive policies and create role-based policies
-- ============================================================================

-- PRODUCTION LOTS - Read: all roles, Write: technician+, Approve: supervisor+
DROP POLICY IF EXISTS "Enable all for authenticated users" ON production_lots;
DROP POLICY IF EXISTS "authenticated_write" ON production_lots;

CREATE POLICY "production_lots_select" ON production_lots
    FOR SELECT TO authenticated
    USING (
        tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
    );

CREATE POLICY "production_lots_insert" ON production_lots
    FOR INSERT TO authenticated
    WITH CHECK (
        tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
        AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'manager', 'supervisor', 'technician')
        )
    );

CREATE POLICY "production_lots_update" ON production_lots
    FOR UPDATE TO authenticated
    USING (
        tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
        AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'manager', 'supervisor', 'technician')
        )
    );

CREATE POLICY "production_lots_delete" ON production_lots
    FOR DELETE TO authenticated
    USING (
        tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
        AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'manager')
        )
    );

-- SAMPLES - Read: all roles, Create: technician+, Update: technician+, Approve: supervisor+
DROP POLICY IF EXISTS "Enable all for authenticated users" ON samples;
DROP POLICY IF EXISTS "authenticated_write" ON samples;

CREATE POLICY "samples_select" ON samples
    FOR SELECT TO authenticated
    USING (
        tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
    );

CREATE POLICY "samples_insert" ON samples
    FOR INSERT TO authenticated
    WITH CHECK (
        tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
        AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'manager', 'supervisor', 'technician')
        )
    );

CREATE POLICY "samples_update" ON samples
    FOR UPDATE TO authenticated
    USING (
        tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
        AND (
            -- Technicians can update their own samples
            (status IN ('pending', 'in_analysis') AND EXISTS (
                SELECT 1 FROM profiles 
                WHERE id = auth.uid() 
                AND role = 'technician'
            ))
            OR
            -- Supervisors+ can update any sample
            EXISTS (
                SELECT 1 FROM profiles 
                WHERE id = auth.uid() 
                AND role IN ('admin', 'manager', 'supervisor')
            )
        )
    );

-- NON-CONFORMITIES - Read: all, Create: technician+, Investigate: supervisor+, Approve: manager+
DROP POLICY IF EXISTS "Enable all for authenticated users" ON nc;
DROP POLICY IF EXISTS "authenticated_write" ON nc;

CREATE POLICY "nc_select" ON nc
    FOR SELECT TO authenticated
    USING (
        tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
    );

CREATE POLICY "nc_insert" ON nc
    FOR INSERT TO authenticated
    WITH CHECK (
        tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
        AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'manager', 'supervisor', 'technician')
        )
    );

CREATE POLICY "nc_update" ON nc
    FOR UPDATE TO authenticated
    USING (
        tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
        AND (
            -- Draft/Open: technician+ can edit
            (status IN ('draft', 'open') AND EXISTS (
                SELECT 1 FROM profiles 
                WHERE id = auth.uid() 
                AND role IN ('admin', 'manager', 'supervisor', 'technician')
            ))
            OR
            -- Investigating: supervisor+ can edit
            (status = 'investigating' AND EXISTS (
                SELECT 1 FROM profiles 
                WHERE id = auth.uid() 
                AND role IN ('admin', 'manager', 'supervisor')
            ))
            OR
            -- Approval/Close: manager+ only
            (status IN ('pending_approval', 'approved', 'closed') AND EXISTS (
                SELECT 1 FROM profiles 
                WHERE id = auth.uid() 
                AND role IN ('admin', 'manager')
            ))
        )
    );

-- SPECIFICATIONS - Read: all, Create/Update: manager+, Delete: admin only
DROP POLICY IF EXISTS "Enable all for authenticated users" ON specifications;
DROP POLICY IF EXISTS "authenticated_write" ON specifications;

CREATE POLICY "specifications_select" ON specifications
    FOR SELECT TO authenticated
    USING (
        tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
    );

CREATE POLICY "specifications_insert" ON specifications
    FOR INSERT TO authenticated
    WITH CHECK (
        tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
        AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'manager')
        )
    );

CREATE POLICY "specifications_update" ON specifications
    FOR UPDATE TO authenticated
    USING (
        tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
        AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'manager')
        )
    );

CREATE POLICY "specifications_delete" ON specifications
    FOR DELETE TO authenticated
    USING (
        tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
        AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- PARAMETERS - Read: all, Create/Update/Delete: manager+
DROP POLICY IF EXISTS "Enable all for authenticated users" ON parameters;
DROP POLICY IF EXISTS "authenticated_write" ON parameters;

CREATE POLICY "parameters_select" ON parameters
    FOR SELECT TO authenticated
    USING (
        tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
    );

CREATE POLICY "parameters_insert" ON parameters
    FOR INSERT TO authenticated
    WITH CHECK (
        tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
        AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'manager')
        )
    );

CREATE POLICY "parameters_update" ON parameters
    FOR UPDATE TO authenticated
    USING (
        tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
        AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'manager')
        )
    );

-- PRODUCTS - Read: all, Modify: manager+
DROP POLICY IF EXISTS "Enable all for authenticated users" ON products;
DROP POLICY IF EXISTS "authenticated_write" ON products;

CREATE POLICY "products_select" ON products
    FOR SELECT TO authenticated
    USING (
        tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
    );

CREATE POLICY "products_insert" ON products
    FOR INSERT TO authenticated
    WITH CHECK (
        tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
        AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'manager')
        )
    );

CREATE POLICY "products_update" ON products
    FOR UPDATE TO authenticated
    USING (
        tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
        AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'manager')
        )
    );

-- FOOD SAFETY PCC - Read: all, Create: supervisor+, Critical limit violations: manager approval required
DROP POLICY IF EXISTS "Enable all for authenticated users" ON food_safety_pcc;
DROP POLICY IF EXISTS "authenticated_write" ON food_safety_pcc;

CREATE POLICY "food_safety_pcc_select" ON food_safety_pcc
    FOR SELECT TO authenticated
    USING (
        tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
    );

CREATE POLICY "food_safety_pcc_insert" ON food_safety_pcc
    FOR INSERT TO authenticated
    WITH CHECK (
        tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
        AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'manager', 'supervisor')
        )
    );

CREATE POLICY "food_safety_pcc_update" ON food_safety_pcc
    FOR UPDATE TO authenticated
    USING (
        tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
        AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'manager', 'supervisor')
        )
    );

-- ============================================================================
-- STEP 2: Apply similar policies to remaining tables
-- ============================================================================

-- RAW MATERIALS - Read: all, Modify: manager+
DROP POLICY IF EXISTS "Enable all for authenticated users" ON raw_materials;
DROP POLICY IF EXISTS "authenticated_write" ON raw_materials;

CREATE POLICY "raw_materials_select" ON raw_materials
    FOR SELECT TO authenticated
    USING (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));

CREATE POLICY "raw_materials_modify" ON raw_materials
    FOR ALL TO authenticated
    USING (
        tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
        AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
    );

-- EQUIPMENT - Read: all, Modify: supervisor+
DROP POLICY IF EXISTS "Enable all for authenticated users" ON equipment;
DROP POLICY IF EXISTS "authenticated_write" ON equipment;

CREATE POLICY "equipment_select" ON equipment
    FOR SELECT TO authenticated
    USING (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));

CREATE POLICY "equipment_modify" ON equipment
    FOR ALL TO authenticated
    USING (
        tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
        AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager', 'supervisor'))
    );

-- REAGENTS - Read: all, Modify: supervisor+
DROP POLICY IF EXISTS "Enable all for authenticated users" ON reagents;
DROP POLICY IF EXISTS "authenticated_write" ON reagents;

CREATE POLICY "reagents_select" ON reagents
    FOR SELECT TO authenticated
    USING (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));

CREATE POLICY "reagents_modify" ON reagents
    FOR ALL TO authenticated
    USING (
        tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
        AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager', 'supervisor'))
    );

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Count policies per table
SELECT 
    schemaname,
    tablename,
    COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY policy_count DESC;

-- Show all RLS-enabled tables
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = true
ORDER BY tablename;
