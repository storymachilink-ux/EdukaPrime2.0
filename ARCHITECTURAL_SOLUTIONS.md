# EduKaPrime Access Control - Architectural Solutions

**Status:** Three complete architectural solutions with migration paths and implementation code

**User Request:**
> "Vamos estudar oque esta acontecendo e a melhor implementacao. para que eu possa gerenciar planos e atribuir aos usuarios da melhor forma, onde eu possa ter a selecao do que cada plano libera para o usuario. estude o codigo me faca perguntas de banco de dados tudo que precisar para essa implementacao ser perfeita, sempre atualizada com banco de dados"

**Current Problem Summary:**
- Three conflicting access control systems exist (plano_minimo, junction tables, available_for_plans)
- New items created are NOT assigned to plans (invisible to users)
- Videos and Bonus pages don't filter by plan at all
- hasAccess() doesn't check plan features

---

## SOLUTION 1: The "Clean Array" Approach ✅ RECOMMENDED

### Overview
**Single source of truth:** `available_for_plans` INTEGER[] array on each item. Remove all other systems.

**Philosophy:**
- Simplest to understand and maintain
- Fastest queries (no joins to junction tables)
- Consistent with current code (Atividades/PaperCrafts already using this)
- Perfect for SaaS with clear plan tiers

### Database Changes Required

#### 1.1 Remove Legacy Columns from Item Tables

```sql
-- Remove plano_minimo from atividades
ALTER TABLE atividades DROP COLUMN IF EXISTS plano_minimo;

-- Remove plano_minimo from videos
ALTER TABLE videos DROP COLUMN IF EXISTS plano_minimo;

-- Remove plano_minimo from bonus
ALTER TABLE bonus DROP COLUMN IF EXISTS plano_minimo;

-- Remove plano_minimo from papercrafts (if exists)
ALTER TABLE papercrafts DROP COLUMN IF EXISTS plano_minimo;
```

#### 1.2 Ensure available_for_plans Column Exists on All Items

```sql
-- Ensure atividades has available_for_plans
ALTER TABLE atividades
ADD COLUMN available_for_plans INTEGER[] DEFAULT '{1,2,3,4}'
WHERE available_for_plans IS NULL;

-- Ensure videos has available_for_plans
ALTER TABLE videos
ADD COLUMN available_for_plans INTEGER[] DEFAULT '{1,2,3,4}'
WHERE available_for_plans IS NULL;

-- Ensure bonus has available_for_plans
ALTER TABLE bonus
ADD COLUMN available_for_plans INTEGER[] DEFAULT '{1,2,3,4}'
WHERE available_for_plans IS NULL;

-- Already exists in papercrafts
```

#### 1.3 Update Existing Items (All items available for all paid plans)

```sql
-- Update atividades
UPDATE atividades
SET available_for_plans = '{1,2,3,4}'
WHERE available_for_plans IS NULL OR available_for_plans = '{}';

-- Update videos
UPDATE videos
SET available_for_plans = '{1,2,3,4}'
WHERE available_for_plans IS NULL OR available_for_plans = '{}';

-- Update bonus
UPDATE bonus
SET available_for_plans = '{1,2,3,4}'
WHERE available_for_plans IS NULL OR available_for_plans = '{}';
```

#### 1.4 Optional: Keep Junction Tables for Reference (But Don't Use)

```sql
-- Archive junction tables (don't delete, in case you need to reference them)
-- Comment out these operations if you want to keep them
ALTER TABLE plan_atividades RENAME TO plan_atividades_ARCHIVED;
ALTER TABLE plan_videos RENAME TO plan_videos_ARCHIVED;
ALTER TABLE plan_bonus RENAME TO plan_bonus_ARCHIVED;
ALTER TABLE plan_papercrafts RENAME TO plan_papercrafts_ARCHIVED;
```

#### 1.5 Drop Unused plan_features Table

```sql
-- Optional: This table is not used anymore
DROP TABLE IF EXISTS plan_features CASCADE;
```

### Code Changes Required

#### 1.5.1 Update GestaoAtividades.tsx (Admin Create/Edit)

```typescript
// BEFORE: Sets only plano_minimo (broken)
body: JSON.stringify({
  titulo: modalEdit.titulo,
  descricao: modalEdit.descricao,
  imagem: modalEdit.imagem,
  link_download: modalEdit.link_download,
  faixa_etaria: modalEdit.faixa_etaria,
  categoria: modalEdit.categoria,
  nicho: modalEdit.nicho,
  plano_minimo: modalEdit.plano_minimo,  // ❌ REMOVE THIS
  badge_texto: modalEdit.badge_texto,
  badge_cor: modalEdit.badge_cor,
  badge_text_color: modalEdit.badge_text_color
})

// AFTER: Sets available_for_plans instead
body: JSON.stringify({
  titulo: modalEdit.titulo,
  descricao: modalEdit.descricao,
  imagem: modalEdit.imagem,
  link_download: modalEdit.link_download,
  faixa_etaria: modalEdit.faixa_etaria,
  categoria: modalEdit.categoria,
  nicho: modalEdit.nicho,
  // New field: available_for_plans (default: all paid plans)
  available_for_plans: modalEdit.available_for_plans || [1, 2, 3, 4],
  badge_texto: modalEdit.badge_texto,
  badge_cor: modalEdit.badge_cor,
  badge_text_color: modalEdit.badge_text_color
})
```

Add multi-select UI for choosing which plans get access:

```typescript
// In the modal form, add:
<div className="mb-4">
  <label className="block text-sm font-semibold mb-2">Disponível em:</label>
  <div className="space-y-2">
    {[
      { id: 1, name: 'ESSENCIAL' },
      { id: 2, name: 'EVOLUIR' },
      { id: 3, name: 'PRIME' },
      { id: 4, name: 'VITALÍCIO' }
    ].map(plan => (
      <label key={plan.id} className="flex items-center">
        <input
          type="checkbox"
          checked={modalEdit.available_for_plans?.includes(plan.id) || false}
          onChange={(e) => {
            const plans = modalEdit.available_for_plans || [];
            if (e.target.checked) {
              setModalEdit({
                ...modalEdit,
                available_for_plans: [...plans, plan.id]
              });
            } else {
              setModalEdit({
                ...modalEdit,
                available_for_plans: plans.filter(p => p !== plan.id)
              });
            }
          }}
          className="mr-2"
        />
        {plan.name}
      </label>
    ))}
  </div>
</div>
```

#### 1.5.2 Remove Item Filtering from Admin Forms

The `plano_minimo` select field in the form should be completely removed.

#### 1.5.3 Disable AdminPlanosManager (Or Repurpose It)

Since items are now assigned directly in the creation form, AdminPlanosManager becomes unnecessary. Options:

**Option A: Remove it entirely**
```typescript
// Delete AdminPlanosManager.tsx
// Remove route from App.tsx
```

**Option B: Keep it for bulk reassignment**
```typescript
// Keep AdminPlanosManager but modify it to just update available_for_plans array
// Remove junction table logic entirely
const handleToggleItem = async (type: ItemType, itemId: string, planId: number, isAdding: boolean) => {
  // Get current available_for_plans
  const { data: item } = await supabase
    .from(tableMap[type])
    .select('available_for_plans')
    .eq('id', itemId)
    .single();

  // Update array
  let plans = item.available_for_plans || [];
  if (isAdding && !plans.includes(planId)) {
    plans = [...plans, planId];
  } else if (!isAdding) {
    plans = plans.filter(p => p !== planId);
  }

  // Save back
  await supabase
    .from(tableMap[type])
    .update({ available_for_plans: plans })
    .eq('id', itemId);
};
```

#### 1.5.4 Update Videos.tsx - ADD FILTERING

```typescript
// BEFORE: No filtering (BUG)
const fetchVideos = async () => {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .order('created_at', { ascending: false });
  setVideos(data || []);
};

// AFTER: Filter by available_for_plans
const fetchVideos = async () => {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .order('created_at', { ascending: false });

  const currentPlanId = profile?.active_plan_id || 0;
  const filteredData = (data || []).filter((video) => {
    const availablePlans = video.available_for_plans || [];
    return availablePlans.includes(currentPlanId);
  });
  setVideos(filteredData);
};
```

#### 1.5.5 Update Bonus.tsx - ADD FILTERING

```typescript
// BEFORE: No filtering (BUG)
const fetchBonus = async () => {
  const { data, error } = await supabase
    .from('bonus')
    .select('*')
    .order('created_at', { ascending: false });
  setBonus(data || []);
};

// AFTER: Filter by available_for_plans
const fetchBonus = async () => {
  const { data, error } = await supabase
    .from('bonus')
    .select('*')
    .order('created_at', { ascending: false });

  const currentPlanId = profile?.active_plan_id || 0;
  const filteredData = (data || []).filter((bonus) => {
    const availablePlans = bonus.available_for_plans || [];
    return availablePlans.includes(currentPlanId);
  });
  setBonus(filteredData);
};
```

#### 1.5.6 Simplify planService.ts

```typescript
// Remove unused functions:
// - hasAccessToFeature (no longer needed - we check available_for_plans directly)
// - syncItemPlanAccess (no junction tables anymore)
// - syncAllItemPlanAccess
// - syncAllItemPlanAccessComplete

// Keep these functions:
async function hasAccessToArea(userId: string): Promise<boolean> {
  // Check if user has ANY active subscription with plan_id > 0
  const { data: subscriptions } = await supabase
    .from('user_subscriptions')
    .select('plan_id')
    .eq('user_id', userId)
    .eq('status', 'active')
    .gte('plan_id', 1);

  return (subscriptions?.length ?? 0) > 0;
}

// NEW: Simple function to check if item is available in user's plan
async function hasAccessToItem(
  userId: string,
  itemType: 'atividades' | 'videos' | 'bonus' | 'papercrafts',
  itemId: string
): Promise<boolean> {
  // Get user's active plan
  const { data: user } = await supabase
    .from('users')
    .select('active_plan_id')
    .eq('id', userId)
    .single();

  const planId = user?.active_plan_id || 0;

  // Get item
  const { data: item } = await supabase
    .from(itemType)
    .select('available_for_plans')
    .eq('id', itemId)
    .single();

  const availablePlans = item?.available_for_plans || [];
  return availablePlans.includes(planId);
}
```

#### 1.5.7 Update useFeatureAccess.ts

The current implementation is fine, but simplify the available plans logic:

```typescript
const getAvailablePlans = async (featureName: FeatureName): Promise<Plan[]> => {
  try {
    // Return all paid plans (plan_id > 0)
    // User can upgrade from any free plan to any paid plan
    const plans = await planService.getAllPlans();
    const paidPlans = plans.filter(p => p.id > 0);
    return paidPlans;
  } catch (error) {
    console.error(`❌ Erro ao buscar planos para ${featureName}:`, error);
    return [];
  }
};
```

### How New Items Get Plan Access (Automatic)

When admin creates a new item via GestaoAtividades:
1. Form has "Disponível em:" checkboxes for each plan
2. Admin checks desired plans
3. Item is created with `available_for_plans = [1, 2, 3, 4]` (or selected plans)
4. Item immediately appears in those plans for users

**No extra sync needed!** The data is stored directly on the item.

### How Existing Items Are Migrated

Run the SQL migration above. All existing items get `available_for_plans = '{1,2,3,4}'` by default, making them available to all paid plans. Then:

1. Admin can edit each item to restrict to specific plans
2. Or bulk edit via AdminPlanosManager (if kept)

### Frontend Implementation Changes Summary

| Component | Change | Effort |
|-----------|--------|--------|
| GestaoAtividades.tsx | Add available_for_plans multi-select, remove plano_minimo field | Medium |
| GestaoVideos.tsx | Add available_for_plans multi-select, remove plano_minimo field | Medium |
| GestaoBonus.tsx | Add available_for_plans multi-select, remove plano_minimo field | Medium |
| Videos.tsx | ADD filtering by available_for_plans (currently missing!) | Small |
| Bonus.tsx | ADD filtering by available_for_plans (currently missing!) | Small |
| Atividades.tsx | No change needed (already works) | - |
| AdminPlanosManager.tsx | Remove entirely OR repurpose for bulk edits | Small |
| planService.ts | Remove sync functions, simplify access checking | Small |

### Pros and Cons

**Pros:**
✅ Single source of truth (easiest to understand and maintain)
✅ Fastest queries (direct array inclusion check, no joins)
✅ Already partially implemented (Atividades/PaperCrafts work this way)
✅ Easiest admin UI (checkboxes on create/edit forms)
✅ Perfect for SaaS with distinct plan tiers
✅ Automatic sync (no triggers/functions needed)
✅ Clear default behavior (all items to all plans)
✅ Simplest TypeScript interfaces
✅ Least database complexity

**Cons:**
❌ Array doesn't enforce referential integrity (admins could accidentally delete a plan)
❌ Can't track when item was added to plan
❌ Not ideal if you need fine-grained audit logs
❌ If you had significant logic in junction tables, that's lost

**Best For:** This is the right choice for a SaaS app with 5 fixed plans.

---

## SOLUTION 2: The "Junction Tables Only" Approach

### Overview
**Single source of truth:** Junction tables (plan_atividades, plan_videos, plan_bonus, plan_papercrafts). Remove available_for_plans array.

**Philosophy:**
- Normalized database design
- Can track when items were added to plans
- Can store additional metadata per plan-item relationship
- More enterprise-like approach

### Database Changes Required

#### 2.1 Create Missing Indexes

```sql
-- Improve junction table performance
CREATE INDEX idx_plan_atividades_plan_id ON plan_atividades(plan_id);
CREATE INDEX idx_plan_atividades_atividade_id ON plan_atividades(atividade_id);
CREATE INDEX idx_plan_videos_plan_id ON plan_videos(plan_id);
CREATE INDEX idx_plan_videos_video_id ON plan_videos(video_id);
CREATE INDEX idx_plan_bonus_plan_id ON plan_bonus(plan_id);
CREATE INDEX idx_plan_bonus_bonus_id ON plan_bonus(bonus_id);
CREATE INDEX idx_plan_papercrafts_plan_id ON plan_papercrafts(plan_id);
CREATE INDEX idx_plan_papercrafts_papercraft_id ON plan_papercrafts(papercraft_id);
```

#### 2.2 Remove available_for_plans from Item Tables

```sql
ALTER TABLE atividades DROP COLUMN IF EXISTS available_for_plans;
ALTER TABLE videos DROP COLUMN IF EXISTS available_for_plans;
ALTER TABLE bonus DROP COLUMN IF EXISTS available_for_plans;
ALTER TABLE papercrafts DROP COLUMN IF EXISTS available_for_plans;
```

#### 2.3 Remove plano_minimo from Item Tables

```sql
ALTER TABLE atividades DROP COLUMN IF EXISTS plano_minimo;
ALTER TABLE videos DROP COLUMN IF EXISTS plano_minimo;
ALTER TABLE bonus DROP COLUMN IF EXISTS plano_minimo;
```

#### 2.4 Migrate Existing Data to Junction Tables

```sql
-- Determine which plan_id each item belongs to based on current data
-- This is tricky because we don't know which items should go where

-- OPTION A: All existing items to all paid plans
INSERT INTO plan_atividades (plan_id, atividade_id)
SELECT DISTINCT pv.id, a.id
FROM atividades a
CROSS JOIN plans_v2 pv
WHERE pv.id > 0  -- Only paid plans
ON CONFLICT DO NOTHING;

-- Same for videos, bonus, papercrafts...
```

### Code Changes Required

#### 2.4.1 Update item filtering to use JOINs

```typescript
// Videos.tsx - Filter using junction table join
const fetchVideos = async () => {
  const currentPlanId = profile?.active_plan_id || 0;

  const { data, error } = await supabase
    .from('videos')
    .select('*, plan_videos!inner(plan_id)')
    .eq('plan_videos.plan_id', currentPlanId)
    .order('created_at', { ascending: false });

  setVideos(data || []);
};
```

#### 2.4.2 Update planService.ts to use junction tables

```typescript
async function hasAccessToItem(
  userId: string,
  itemType: 'atividades' | 'videos' | 'bonus' | 'papercrafts',
  itemId: string
): Promise<boolean> {
  // Get user's active plan
  const { data: user } = await supabase
    .from('users')
    .select('active_plan_id')
    .eq('id', userId)
    .single();

  const planId = user?.active_plan_id || 0;
  const junctionTable = `plan_${itemType}`;

  // Check if junction entry exists
  const { data, error } = await supabase
    .from(junctionTable)
    .select('id')
    .eq('plan_id', planId)
    .eq(itemType === 'papercrafts' ? 'papercraft_id' : `${itemType.slice(0, -1)}_id`, itemId)
    .single();

  return !!data;
}
```

### Pros and Cons

**Pros:**
✅ Normalized database design (traditional approach)
✅ Can track when items were added to plans (timestamps)
✅ Can add metadata to relationships (e.g., featured, discount_percent)
✅ Enforces referential integrity (can't have orphaned relationships)
✅ Suitable for complex access control scenarios
✅ Can create views for reporting

**Cons:**
❌ More complex queries (requires JOINs)
❌ Slower queries than array inclusion
❌ More database complexity
❌ Admin UI is more complex (requires loading plans then selecting items)
❌ Requires careful migration of existing data
❌ Need to manage junction table constraints
❌ Creates code complexity in multiple places
❌ Not needed for simple plan structure

**Best For:** Enterprise applications with complex hierarchies or multiple access rule types.

---

## SOLUTION 3: The "Hybrid View" Approach

### Overview
**Keep both systems** but synchronize them automatically with SQL triggers.

- **Junction tables:** Source of truth (plan_atividades, etc.)
- **available_for_plans:** Denormalized array (for fast queries)
- **Triggers:** Automatic sync when junction table changes

**Philosophy:**
- Best of both worlds
- Get referential integrity AND fast queries
- Can track history
- Self-healing consistency

### Database Changes Required

#### 3.1 Add Triggers to Maintain Sync

```sql
-- Function to sync available_for_plans when junction table changes
CREATE OR REPLACE FUNCTION sync_atividades_available_plans()
RETURNS TRIGGER AS $$
BEGIN
  -- After insert/delete on plan_atividades, update atividades.available_for_plans
  UPDATE atividades
  SET available_for_plans = (
    SELECT ARRAY_AGG(plan_id ORDER BY plan_id)
    FROM plan_atividades
    WHERE atividade_id = COALESCE(NEW.atividade_id, OLD.atividade_id)
  )
  WHERE id = COALESCE(NEW.atividade_id, OLD.atividade_id);

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_atividades_available_plans
AFTER INSERT OR DELETE ON plan_atividades
FOR EACH ROW EXECUTE FUNCTION sync_atividades_available_plans();

-- Repeat for videos, bonus, papercrafts...
CREATE OR REPLACE FUNCTION sync_videos_available_plans()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE videos
  SET available_for_plans = (
    SELECT ARRAY_AGG(plan_id ORDER BY plan_id)
    FROM plan_videos
    WHERE video_id = COALESCE(NEW.video_id, OLD.video_id)
  )
  WHERE id = COALESCE(NEW.video_id, OLD.video_id);
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_videos_available_plans
AFTER INSERT OR DELETE ON plan_videos
FOR EACH ROW EXECUTE FUNCTION sync_videos_available_plans();

-- Similar for bonus and papercrafts...
```

#### 3.2 Initial Sync of Existing Data

```sql
-- For items with existing available_for_plans, create junction entries
INSERT INTO plan_atividades (plan_id, atividade_id)
SELECT plan_id, id
FROM atividades,
     UNNEST(available_for_plans) AS plan_id
ON CONFLICT DO NOTHING;

-- Same for videos, bonus, papercrafts...
```

### Code Changes Required

#### 3.3.1 Keep AdminPlanosManager (Junction Table Management)

AdminPlanosManager works unchanged - updates junction tables, triggers update arrays automatically.

#### 3.3.2 Keep Item Filtering (Available_for_plans)

All pages keep using `available_for_plans` array for fast filtering.

#### 3.3.3 Add GestaoAtividades Multi-Select

```typescript
// When creating/editing, also update junction table
const handleSaveAtividade = async () => {
  // 1. Save/update atividade record
  const { data: atividade, error } = await supabase
    .from('atividades')
    .upsert({
      id: modalEdit.id,
      titulo: modalEdit.titulo,
      // ... other fields ...
      available_for_plans: modalEdit.available_for_plans // Set directly
    });

  // 2. Also update junction table for consistency
  // First, delete all existing entries
  await supabase
    .from('plan_atividades')
    .delete()
    .eq('atividade_id', atividade.id);

  // Then insert new entries for selected plans
  for (const planId of modalEdit.available_for_plans) {
    await supabase
      .from('plan_atividades')
      .insert({
        plan_id: planId,
        atividade_id: atividade.id
      });
  }
};
```

### Pros and Cons

**Pros:**
✅ Get referential integrity (junction tables)
✅ Get fast queries (available_for_plans arrays)
✅ Self-correcting (triggers maintain sync)
✅ Can add metadata to relationships later
✅ Two separate views of same data (flexibility)
✅ Familiar to database administrators
✅ Can create reports from either view

**Cons:**
❌ Increased database complexity (triggers, more tables)
❌ Harder to understand for developers
❌ Potential for sync bugs if triggers fail
❌ More code to maintain (sync logic)
❌ Triggers can mask data inconsistencies
❌ Slightly more complex admin UI
❌ Overkill for simple SaaS

**Best For:** Applications that might need to add more complex access rules later, or organizations with strict database governance requirements.

---

## COMPARISON MATRIX

| Aspect | Solution 1 (Array) | Solution 2 (Junction) | Solution 3 (Hybrid) |
|--------|-------------------|----------------------|---------------------|
| Complexity | ⭐ Simple | ⭐⭐⭐ Complex | ⭐⭐⭐ Complex |
| Query Speed | ⭐⭐⭐⭐⭐ Fast | ⭐⭐⭐ Moderate | ⭐⭐⭐⭐⭐ Fast |
| Admin Interface | ⭐⭐⭐⭐ Simple | ⭐⭐ Complex | ⭐⭐⭐⭐ Simple |
| Referential Integrity | ⭐⭐ Weak | ⭐⭐⭐⭐⭐ Strong | ⭐⭐⭐⭐⭐ Strong |
| Future Flexibility | ⭐⭐⭐ Good | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐⭐⭐ Excellent |
| Migration Effort | ⭐⭐⭐ Medium | ⭐⭐⭐⭐ High | ⭐⭐⭐⭐ High |
| Code Maintenance | ⭐⭐⭐⭐ Easy | ⭐⭐ Hard | ⭐⭐ Hard |
| Implementation Time | 2-3 hours | 4-6 hours | 5-7 hours |
| Risk of Bugs | ⭐ Low | ⭐⭐ Medium | ⭐⭐ Medium |

---

## RECOMMENDATION

### For Your Use Case:

**USE SOLUTION 1: The "Clean Array" Approach** ✅

**Why:**
1. You have a fixed number of plans (5: GRATUITO, ESSENCIAL, EVOLUIR, PRIME, VITALÍCIO)
2. Item-to-plan relationship is straightforward (item either belongs to plan or doesn't)
3. Simple admin interface (checkboxes on create/edit forms)
4. Atividades/PaperCrafts already using this approach successfully
5. Fastest queries (users see content immediately)
6. Least code to maintain
7. No triggers/RPC functions to debug
8. Self-documenting (check if plan ID in array)

**When to switch:**
- If you need to track when items were added to plans (use Solution 3)
- If you plan 20+ plans with complex hierarchies (use Solution 2)
- If you need audit logs of plan assignments (use Solution 3)

---

## NEXT STEPS

1. **Review this document** - Confirm Solution 1 matches your requirements
2. **Ask any clarification questions** - About database, admin UI, filtering
3. **Approve architecture** - Sign off on the approach
4. **Implementation phase** - I'll execute the migration SQL and code changes

---

## QUESTIONS FOR YOU

Before implementation, please confirm:

1. **Data Migration:** Should all existing items be available for all paid plans (ESSENCIAL, EVOLUIR, PRIME, VITALÍCIO) by default? Or should you select which plans get which items?

2. **Gratuito Plan:** Should GRATUITO users see any items? Or should they get "Access Restricted" modal for everything?

3. **Default for New Items:** When an admin creates a new item, should it default to:
   - All paid plans [1,2,3,4]
   - No plans [] (admin must select)
   - Just the current plan

4. **Admin UI:** Should GestaoAtividades have checkboxes for plan selection, or should AdminPlanosManager be the only place to assign plans?

5. **Keep AdminPlanosManager:** Should this be removed entirely, or kept for bulk reassignment?

6. **Community & Support VIP:** Keep the existing `has_comunidade` and `has_suporte_vip` binary toggles on plans_v2? (These are separate from item-level access)

Please provide these clarifications so I can create the exact SQL migration and code changes you need.
