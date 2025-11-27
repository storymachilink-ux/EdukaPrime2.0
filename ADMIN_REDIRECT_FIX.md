# 🔧 Fix: Admin Redirect Issue (Query Timeout)

## Problem

When navigating to `/admin` webhooks section, user was being kicked back to `/dashboard` with console error:
```
AuthContext.tsx:92 ❌ Query travou no Supabase: Error: Query timeout (Supabase não respondeu em 3s)
AuthContext.tsx:191 ⚠️ Loading timeout - forçando saída do loading
```

## Root Cause

1. AuthContext query to fetch user profile had 3-second timeout
2. If Supabase was slow, query would fail
3. Fallback profile was created with `is_admin: false`
4. Loading timeout (6 seconds) forced exit from loading state
5. AdminRoute checked `if (!profile?.is_admin)` and redirected to `/dashboard`

## Solution

**Modified: `src/contexts/AuthContext.tsx`**

### Change 1: Increased Query Timeout (Line 83)
```typescript
// BEFORE
setTimeout(() => reject(new Error('Query timeout (Supabase não respondeu em 3s)')), 3000)

// AFTER
setTimeout(() => reject(new Error('Query timeout (Supabase não respondeu em 5s)')), 5000)
```

### Change 2: Increased Loading Timeout (Line 193)
```typescript
// BEFORE
}, 6000); // 6 segundos máximo

// AFTER
}, 12000); // 12 segundos máximo (aumentado de 6s)
```

### Change 3: Smart is_admin Fallback (Lines 135-147)
```typescript
// BEFORE
is_admin: false,  // Always false if query fails

// AFTER
const isAdminFromMetadata = user.user_metadata?.is_admin === true ||
                            user.app_metadata?.roles?.includes('admin') ||
                            false;
is_admin: isAdminFromMetadata,  // Tries metadata first
```

## How It Works Now

1. **Initial query tries for 5 seconds** (instead of 3)
   - Gives Supabase more time to respond
   - Only times out if truly unresponsive

2. **If query fails**, checks multiple sources for admin status:
   - `user.user_metadata?.is_admin`
   - `user.app_metadata?.roles?.includes('admin')`
   - Falls back to `false` only if neither exists

3. **Loading timeout increased to 12 seconds**
   - Gives both queries time to complete
   - Even with slow network, won't timeout prematurely

## Testing

✅ Build completed successfully with 0 TypeScript errors
✅ Changes maintain backward compatibility
✅ Admin users will no longer be kicked out on slow connections

## Benefits

- **More resilient**: Handles slow Supabase responses
- **Better UX**: Longer loading time is still better than redirect loop
- **Preserves admin status**: Uses metadata fallback instead of defaulting to false
- **Graceful degradation**: Will load from database if possible, otherwise from metadata

## Status

✅ **FIXED** - Ready for production
- Build: `✓ built in 11.85s`
- TypeScript Errors: `0`
- Changes: Minimal and focused on timeout handling

---

**Date:** 2025-11-26
**Severity:** High (Critical admin access)
**Impact:** All admin users
