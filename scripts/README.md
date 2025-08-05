# Post-Codegen Script

## Overview

This script automatically fixes GraphQL queries after running `amplify codegen`. The issue is that `amplify codegen` regenerates GraphQL files from the schema but doesn't include nested relationship fields that we need for the application to work properly.

## Problem

When you run `amplify codegen`, it overwrites the manually added fields in `src/graphql/queries.ts`, causing:
- "Unknown expert" in expert listings
- Missing patient information in appointments
- Authorization errors for nested fields

## Solution

### Option 1: Use the npm script (Recommended)

Instead of running `amplify codegen` directly, use:

```bash
npm run codegen
```

This will:
1. Run `amplify codegen` to regenerate the GraphQL files
2. Automatically run the post-codegen script to add missing fields

### Option 2: Manual execution

If you need to run the script manually:

```bash
node scripts/post-codegen.js
```

## What the script does

1. **Adds `user` field to `listExperts` query** - So expert names show properly instead of "Dr. [specialization]"
2. **Adds `user` and `expert` fields to `listAppointments` query** - So patient and expert information is available
3. **Removes nested fields from mutations** - To prevent GraphQL errors when creating/updating appointments

## Files affected

- `src/graphql/queries.ts` - Adds missing relationship fields
- `src/graphql/mutations.ts` - Removes problematic nested fields

## When to use

Run this script every time you:
- Run `amplify codegen`
- Update the GraphQL schema
- Deploy backend changes

## Troubleshooting

If you still see issues after running the script:

1. Check that the script ran successfully (should see "✅ Post-codegen updates applied successfully")
2. Verify the fields were added by checking `src/graphql/queries.ts`
3. Restart your development server
4. Clear browser cache

## Manual fixes

If the script doesn't work, you can manually add these fields to the queries:

### For listExperts:
Add after `userId`:
```graphql
user {
  id
  email
  firstName
  lastName
  phoneNumber
  # ... other user fields
}
```

### For listAppointments:
Add after `followUpDate`:
```graphql
user {
  # ... user fields
}
expert {
  # ... expert fields with nested user
}
``` 