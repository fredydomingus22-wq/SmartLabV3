# Execution Checklist: Missing Tables & RLS Cleanup

## ✅ Phase 1: Migrations Created
- [x] `20251123_create_8d_reports.sql` - Created
- [x] `20251123_create_stock_movements.sql` - Created  
- [x] `20251123_cleanup_duplicate_rls.sql` - Created

## ✅ Phase 2: Code Fixed
- [x] Updated `lib/queries/qms.ts` - Changed all `non_conformities` → `nc`
- [x] Fixed JOIN in `getEightDReports()` - Changed `nc:non_conformities` → `nc:nc`

## 📋 Phase 3: Execute in Supabase (USER ACTION REQUIRED)

### Step 1: Create 8D Reports Table (2 min)
```bash
Execute: supabase/migrations/20251123_create_8d_reports.sql
```
**Expected:** Table `eight_d_reports` created with RLS enabled

### Step 2: Create Stock Movements Table (2 min)
```bash
Execute: supabase/migrations/20251123_create_stock_movements.sql
```
**Expected:** Table `stock_movements` created with RLS enabled

### Step 3: Clean Duplicate RLS Policies (1 min)
```bash
Execute: supabase/migrations/20251123_cleanup_duplicate_rls.sql
```
**Expected:** 
- audits: 2 policies (was 4)
- food_safety_prp: 2 policies (was 4)
- lab_analysis: 3 policies (was 5)
- production_lots: 3 policies (was 5)

## 🧪 Phase 4: Verification (USER ACTION REQUIRED)

### Verify All Tables Exist
```sql
-- Re-run verification script
-- File: supabase/verification/03_missing_tables.sql
```
**Expected Result:** All 26 tables show ✅ EXISTS

### Test Dashboard
1. Reload dashboard in browser
2. Check console for errors
3. Should see NO 406/500 errors

### Test NC Module
1. Go to `/nc` page
2. Try creating a new NC
3. Should work without errors

## 📊 Success Criteria

- [ ] `eight_d_reports` table exists
- [ ] `stock_movements` table exists
- [ ] All 26 expected tables exist
- [ ] No duplicate RLS policies
- [ ] Dashboard loads without 406/500 errors
- [ ] NC creation works
- [ ] Code build passes: `npm run build`

## Next Steps After Completion

1. Add sample data for testing
2. Test 8D report creation flow
3. Test stock movement recording
4. Run full build: `npm run build`
5. Deploy to staging for testing
