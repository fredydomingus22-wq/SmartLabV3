-- Fix Missing RLS Policies for Write Operations
-- Date: 2025-11-24
-- Description: Adds 'authenticated_write' policies to tables that only had read access.

-- 1. Technicians
DROP POLICY IF EXISTS "authenticated_write" ON technicians;
CREATE POLICY "authenticated_write" ON technicians
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 2. NC (Non-Conformities)
DROP POLICY IF EXISTS "authenticated_write" ON nc;
CREATE POLICY "authenticated_write" ON nc
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. Audits
DROP POLICY IF EXISTS "authenticated_write" ON audits;
CREATE POLICY "authenticated_write" ON audits
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. Equipment
DROP POLICY IF EXISTS "authenticated_write" ON equipment;
CREATE POLICY "authenticated_write" ON equipment
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. Food Safety (PCC, OPRP, PRP)
DROP POLICY IF EXISTS "authenticated_write" ON food_safety_pcc;
CREATE POLICY "authenticated_write" ON food_safety_pcc
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_write" ON food_safety_oprp;
CREATE POLICY "authenticated_write" ON food_safety_oprp
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_write" ON food_safety_prp;
CREATE POLICY "authenticated_write" ON food_safety_prp
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6. Form Builder (Templates, Fields, Groups)
DROP POLICY IF EXISTS "authenticated_write" ON form_templates;
CREATE POLICY "authenticated_write" ON form_templates
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_write" ON form_fields;
CREATE POLICY "authenticated_write" ON form_fields
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_write" ON form_field_groups;
CREATE POLICY "authenticated_write" ON form_field_groups
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 7. Products & Parameters & Specs
DROP POLICY IF EXISTS "authenticated_write" ON products;
CREATE POLICY "authenticated_write" ON products
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_write" ON parameters;
CREATE POLICY "authenticated_write" ON parameters
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_write" ON specifications;
CREATE POLICY "authenticated_write" ON specifications
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 8. Raw Materials
DROP POLICY IF EXISTS "authenticated_write" ON raw_materials;
CREATE POLICY "authenticated_write" ON raw_materials
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_write" ON raw_material_lots;
CREATE POLICY "authenticated_write" ON raw_material_lots
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 9. Reagents
DROP POLICY IF EXISTS "authenticated_write" ON reagents;
CREATE POLICY "authenticated_write" ON reagents
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_write" ON reagent_batches;
CREATE POLICY "authenticated_write" ON reagent_batches
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 10. SPC (Charts, Predictions, Violations)
DROP POLICY IF EXISTS "authenticated_write" ON spc_charts;
CREATE POLICY "authenticated_write" ON spc_charts
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_write" ON spc_predictions;
CREATE POLICY "authenticated_write" ON spc_predictions
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_write" ON spc_rules_violations;
CREATE POLICY "authenticated_write" ON spc_rules_violations
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 11. Suppliers & Trainings
DROP POLICY IF EXISTS "authenticated_write" ON suppliers;
CREATE POLICY "authenticated_write" ON suppliers
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_write" ON trainings;
CREATE POLICY "authenticated_write" ON trainings
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
