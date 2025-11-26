-- ============================================================================
-- MULTI-TENANT ISOLATION IMPLEMENTATION
-- Date: 2025-11-26
-- Phase: 1 - Security & Compliance Foundation
-- Description: Add tenant_id and factory_id to all core tables for data isolation
-- ============================================================================

-- ============================================================================
-- STEP 1: Add tenant_id and factory_id columns to all core tables
-- ============================================================================

-- Production & Lots
ALTER TABLE production_lots 
    ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id),
    ADD COLUMN IF NOT EXISTS factory_id UUID REFERENCES factories(id);

ALTER TABLE intermediate_lots 
    ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id),
    ADD COLUMN IF NOT EXISTS factory_id UUID REFERENCES factories(id);

ALTER TABLE finished_lots 
    ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id),
    ADD COLUMN IF NOT EXISTS factory_id UUID REFERENCES factories(id);

-- Samples & Lab
ALTER TABLE samples 
    ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id),
    ADD COLUMN IF NOT EXISTS factory_id UUID REFERENCES factories(id);

ALTER TABLE lab_analysis 
    ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);

-- Quality Management
ALTER TABLE nc 
    ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id),
    ADD COLUMN IF NOT EXISTS factory_id UUID REFERENCES factories(id);

ALTER TABLE eight_d_reports 
    ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);

-- Configuration
ALTER TABLE parameters 
    ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);

ALTER TABLE specifications 
    ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);

ALTER TABLE products 
    ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);

-- Raw Materials
ALTER TABLE raw_materials 
    ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);

ALTER TABLE raw_material_lots 
    ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id),
    ADD COLUMN IF NOT EXISTS factory_id UUID REFERENCES factories(id);

-- Food Safety
ALTER TABLE food_safety_prp 
    ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id),
    ADD COLUMN IF NOT EXISTS factory_id UUID REFERENCES factories(id);

ALTER TABLE food_safety_oprp 
    ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id),
    ADD COLUMN IF NOT EXISTS factory_id UUID REFERENCES factories(id);

ALTER TABLE food_safety_pcc 
    ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id),
    ADD COLUMN IF NOT EXISTS factory_id UUID REFERENCES factories(id);

-- Equipment & Reagents
ALTER TABLE equipment 
    ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id),
    ADD COLUMN IF NOT EXISTS factory_id UUID REFERENCES factories(id);

ALTER TABLE reagents 
    ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id),
    ADD COLUMN IF NOT EXISTS factory_id UUID REFERENCES factories(id);

ALTER TABLE reagent_batches 
    ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id),
    ADD COLUMN IF NOT EXISTS factory_id UUID REFERENCES factories(id);

-- Other modules
ALTER TABLE audits 
    ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id),
    ADD COLUMN IF NOT EXISTS factory_id UUID REFERENCES factories(id);

ALTER TABLE trainings 
    ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);

ALTER TABLE suppliers 
    ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);

-- Form Builder
ALTER TABLE form_templates 
    ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);

ALTER TABLE form_submissions 
    ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);

-- ============================================================================
-- STEP 2: Create indexes for performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_production_lots_tenant ON production_lots(tenant_id);
CREATE INDEX IF NOT EXISTS idx_production_lots_factory ON production_lots(factory_id);

CREATE INDEX IF NOT EXISTS idx_intermediate_lots_tenant ON intermediate_lots(tenant_id);
CREATE INDEX IF NOT EXISTS idx_intermediate_lots_factory ON intermediate_lots(factory_id);

CREATE INDEX IF NOT EXISTS idx_finished_lots_tenant ON finished_lots(tenant_id);
CREATE INDEX IF NOT EXISTS idx_finished_lots_factory ON finished_lots(factory_id);

CREATE INDEX IF NOT EXISTS idx_samples_tenant ON samples(tenant_id);
CREATE INDEX IF NOT EXISTS idx_samples_factory ON samples(factory_id);

CREATE INDEX IF NOT EXISTS idx_lab_analysis_tenant ON lab_analysis(tenant_id);

CREATE INDEX IF NOT EXISTS idx_nc_tenant ON nc(tenant_id);
CREATE INDEX IF NOT EXISTS idx_nc_factory ON nc(factory_id);

CREATE INDEX IF NOT EXISTS idx_eight_d_reports_tenant ON eight_d_reports(tenant_id);

CREATE INDEX IF NOT EXISTS idx_parameters_tenant ON parameters(tenant_id);
CREATE INDEX IF NOT EXISTS idx_specifications_tenant ON specifications(tenant_id);
CREATE INDEX IF NOT EXISTS idx_products_tenant ON products(tenant_id);

CREATE INDEX IF NOT EXISTS idx_raw_materials_tenant ON raw_materials(tenant_id);
CREATE INDEX IF NOT EXISTS idx_raw_material_lots_tenant ON raw_material_lots(tenant_id);
CREATE INDEX IF NOT EXISTS idx_raw_material_lots_factory ON raw_material_lots(factory_id);

CREATE INDEX IF NOT EXISTS idx_food_safety_prp_tenant ON food_safety_prp(tenant_id);
CREATE INDEX IF NOT EXISTS idx_food_safety_oprp_tenant ON food_safety_oprp(tenant_id);
CREATE INDEX IF NOT EXISTS idx_food_safety_pcc_tenant ON food_safety_pcc(tenant_id);

CREATE INDEX IF NOT EXISTS idx_equipment_tenant ON equipment(tenant_id);
CREATE INDEX IF NOT EXISTS idx_reagents_tenant ON reagents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_reagent_batches_tenant ON reagent_batches(tenant_id);

CREATE INDEX IF NOT EXISTS idx_audits_tenant ON audits(tenant_id);
CREATE INDEX IF NOT EXISTS idx_trainings_tenant ON trainings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_tenant ON suppliers(tenant_id);

CREATE INDEX IF NOT EXISTS idx_form_templates_tenant ON form_templates(tenant_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_tenant ON form_submissions(tenant_id);

-- ============================================================================
-- STEP 3: Set default tenant_id for existing data
-- Note: This assumes a default tenant exists. Adjust the UUID as needed.
-- ============================================================================

DO $$
DECLARE
    default_tenant_id UUID;
BEGIN
    -- Get or create default tenant
    SELECT id INTO default_tenant_id FROM tenants LIMIT 1;
    
    IF default_tenant_id IS NULL THEN
        -- Create a default tenant if none exists
        INSERT INTO tenants (name, slug, created_at)
        VALUES ('Default Organization', 'default', NOW())
        RETURNING id INTO default_tenant_id;
        
        RAISE NOTICE 'Created default tenant with ID: %', default_tenant_id;
    END IF;
    
    -- Update existing records with default tenant_id
    UPDATE production_lots SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
    UPDATE intermediate_lots SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
    UPDATE finished_lots SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
    UPDATE samples SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
    UPDATE lab_analysis SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
    UPDATE nc SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
    UPDATE eight_d_reports SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
    UPDATE parameters SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
    UPDATE specifications SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
    UPDATE products SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
    UPDATE raw_materials SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
    UPDATE raw_material_lots SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
    UPDATE food_safety_prp SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
    UPDATE food_safety_oprp SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
    UPDATE food_safety_pcc SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
    UPDATE equipment SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
    UPDATE reagents SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
    UPDATE reagent_batches SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
    UPDATE audits SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
    UPDATE trainings SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
    UPDATE suppliers SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
    UPDATE form_templates SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
    UPDATE form_submissions SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
    
    RAISE NOTICE 'Updated existing records with default tenant_id';
END $$;

-- ============================================================================
-- STEP 4: Make tenant_id NOT NULL after populating
-- ============================================================================

ALTER TABLE production_lots ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE intermediate_lots ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE finished_lots ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE samples ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE lab_analysis ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE nc ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE eight_d_reports ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE parameters ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE specifications ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE products ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE raw_materials ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE raw_material_lots ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE food_safety_prp ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE food_safety_oprp ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE food_safety_pcc ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE equipment ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE reagents ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE reagent_batches ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE audits ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE trainings ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE suppliers ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE form_templates ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE form_submissions ALTER COLUMN tenant_id SET NOT NULL;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

COMMENT ON COLUMN production_lots.tenant_id IS 'Multi-tenant isolation - references tenants table';
COMMENT ON COLUMN production_lots.factory_id IS 'Factory-level isolation - references factories table';

-- Verification query
SELECT 
    'production_lots' as table_name,
    COUNT(*) as total_records,
    COUNT(DISTINCT tenant_id) as distinct_tenants
FROM production_lots
UNION ALL
SELECT 'samples', COUNT(*), COUNT(DISTINCT tenant_id) FROM samples
UNION ALL
SELECT 'nc', COUNT(*), COUNT(DISTINCT tenant_id) FROM nc;
