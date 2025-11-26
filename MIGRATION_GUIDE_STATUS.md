# Status Value Migration Guide

**Date:** 2025-11-26  
**Phase:** Phase 2 - Data Model Cleanup

---

## Overview

As part of Phase 2, all status values have been standardized from Portuguese to English. The database has been updated, and all application code should now use the new English values.

---

## Status Value Changes

### Production Lots

| Old Value (Portuguese) | New Value (English) | Description |
|------------------------|---------------------|-------------|
| `aguardando_ordem` | `draft` | Awaiting order/Draft |
| `em_producao` | `active` | In production/Active |
| `open` | `active` | Open/Active |
| `concluido` | `completed` | Completed |
| `cancelado` | `cancelled` | Cancelled |
| *(new)* | `on_hold` | On hold/Paused |

### Samples

| Old Value | New Value | Description |
|-----------|-----------|-------------|
| `pending` | `pending` | ✅ No change |
| *(new)* | `in_analysis` | Currently being analyzed |
| *(new)* | `under_review` | Awaiting review/approval |
| `approved` | `approved` | ✅ No change |
| `rejected` | `rejected` | ✅ No change |

### Non-Conformities

All NC status values are new:
- `draft` - Draft, not yet opened
- `open` - Opened, awaiting investigation
- `investigating` - Under investigation
- `pending_approval` - Awaiting manager approval
- `approved` - Approved
- `rejected` - Rejected
- `closed` - Closed/Resolved

---

## Code Migration

### Before (Old Code)

```typescript
// ❌ Old Portuguese values
const status = 'aguardando_ordem';
const lot = { status: 'em_producao' };

if (lot.status === 'aguardando_ordem') {
  // ...
}
```

### After (New Code)

```typescript
// ✅ New English values with constants
import { PRODUCTION_LOT_STATUS } from '@/lib/constants/status';

const status = PRODUCTION_LOT_STATUS.DRAFT;
const lot = { status: PRODUCTION_LOT_STATUS.ACTIVE };

if (lot.status === PRODUCTION_LOT_STATUS.DRAFT) {
  // ...
}
```

---

## Using the Status Constants

Import from the centralized constants file:

```typescript
import { 
  PRODUCTION_LOT_STATUS,
  SAMPLE_STATUS,
  NC_STATUS,
  PRODUCTION_LOT_STATUS_LABELS,
  STATUS_COLORS
} from '@/lib/constants/status';

// Creating records
const newLot = {
  code: 'LOT-001',
  status: PRODUCTION_LOT_STATUS.DRAFT, // 'draft'
};

// Displaying labels
const label = PRODUCTION_LOT_STATUS_LABELS[lot.status]; // 'Draft'

// Badge colors
const color = STATUS_COLORS[lot.status]; // 'gray'
```

---

## Database Constraints

The database now enforces valid status values via CHECK constraints:

```sql
-- Production lots can only have these values:
CHECK (status IN ('draft', 'active', 'on_hold', 'completed', 'cancelled'))

-- Samples can only have these values:
CHECK (status IN ('pending', 'in_analysis', 'under_review', 'approved', 'rejected'))

-- Non-conformities can only have these values:
CHECK (status IN ('draft', 'open', 'investigating', 'pending_approval', 'approved', 'rejected', 'closed'))
```

**Important:** Attempting to insert/update with invalid status values will now result in a database error.

---

## Files That Need Updating

Search for and update these patterns:

1. **Status value strings:**
   - `'aguardando_ordem'` → `PRODUCTION_LOT_STATUS.DRAFT`
   - `'em_producao'` → `PRODUCTION_LOT_STATUS.ACTIVE`

2. **Status comparisons:**
   ```typescript
   // Before
   if (lot.status === 'aguardando_ordem') { }
   
   // After
   import { PRODUCTION_LOT_STATUS } from '@/lib/constants/status';
   if (lot.status === PRODUCTION_LOT_STATUS.DRAFT) { }
   ```

3. **Status options in forms:**
   ```typescript
   // Before
   const options = ['aguardando_ordem', 'em_producao', 'concluido'];
   
   // After
   const options = Object.values(PRODUCTION_LOT_STATUS);
   ```

---

## Testing Checklist

After migration, test:

- [ ] Production lot creation with new status values
- [ ] Production lot status transitions work
- [ ] Sample workflow (pending → in_analysis → under_review → approved)
- [ ] NC workflow (draft → open → investigating → closed)
- [ ] Status badges display correct colors
- [ ] Status filters work in list views
- [ ] No database constraint violations

---

## Rollback Plan

If issues arise, Portuguese values can be temporarily restored:

```sql
UPDATE production_lots SET status = 'aguardando_ordem' WHERE status = 'draft';
UPDATE production_lots SET status = 'em_producao' WHERE status = 'active';
-- etc...

-- Remove constraints
ALTER TABLE production_lots DROP CONSTRAINT production_lots_status_check;
```

---

*Migration completed: 2025-11-26*  
*Updated database schema enforces English status values*
