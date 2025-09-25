# Article Operations Added to Permissions Matrix

## Summary
Successfully added comprehensive article management permissions to the Awnash platform's permission matrix system.

## Changes Made

### 🗄️ Database Updates

#### 1. Added Article Permissions
Added 8 new permissions to the `auth.permissions` table:
- `article:create` - Create new articles
- `article:read` - View article information  
- `article:update` - Update article content
- `article:delete` - Delete articles
- `article:publish` - Publish articles
- `article:approve` - Approve articles for publication
- `article:schedule` - Schedule articles for future publishing
- `article:list` - List all articles

#### 2. Updated Role Permissions
**Super Admin Role:**
- All 8 article permissions (full access)

**Content Admin Role:**  
- `article:create`, `article:read`, `article:update`, `article:publish`, `article:schedule`, `article:list`
- (No delete or approve permissions - maintains workflow control)

**Support Agent Role:**
- `article:read`, `article:list` (read-only access)

### 🎨 Frontend Updates

#### 1. Permissions Matrix Modal (`PermissionsMatrixModal.tsx`)
Added new "Article Management" section with all 8 article permissions:
```typescript
{
  name: 'article',
  label: 'Article Management', 
  permissions: [
    { action: 'create', label: 'Create', description: 'Create new articles' },
    { action: 'read', label: 'View', description: 'View article information' },
    { action: 'update', label: 'Edit', description: 'Update article content' },
    { action: 'delete', label: 'Delete', description: 'Delete articles' },
    { action: 'publish', label: 'Publish', description: 'Publish articles' },
    { action: 'approve', label: 'Approve', description: 'Approve articles for publication' },
    { action: 'schedule', label: 'Schedule', description: 'Schedule articles for future publishing' },
    { action: 'list', label: 'List', description: 'List all articles' }
  ]
}
```

#### 2. Create User Modal (`CreateUserModal.tsx`)
Updated role permission mappings to include article permissions:
- **Super Admin**: All article permissions
- **Content Admin**: Content management permissions (create, read, update, publish, schedule, list)
- **Support Agent**: Read-only permissions (read, list)

### 🔧 Backend Updates

#### 1. Articles Controller (`articles.controller.ts`)
Migrated from role-based to permission-based authorization:
- **Before**: Used `@Roles(UserRole.SUPER_ADMIN, UserRole.CONTENT_ADMIN)`
- **After**: Uses `@Permissions('article:create')`, `@Permissions('article:read')`, etc.
- Added `PermissionsGuard` for granular permission checking
- Each endpoint now requires specific article permissions:
  - `POST /content/articles` → `article:create`
  - `GET /content/articles` → `article:list`
  - `GET /content/articles/:id` → `article:read`
  - `PATCH /content/articles/:id` → `article:update`
  - `DELETE /content/articles/:id` → `article:delete`
  - `PATCH /content/articles/:id/share` → `article:read`

### 📊 Permission Matrix Status

**Total Permissions in System**: 43 (was 35)
**Article Permissions**: 8

**Role Permission Counts**:
- Super Admin: 8 article permissions 
- Content Admin: 6 article permissions
- Support Agent: 2 article permissions
- Other roles: 0 article permissions

## Files Modified

### Frontend
- `src/components/admin/PermissionsMatrixModal.tsx`
- `src/components/admin/CreateUserModal.tsx`

### Backend  
- `src/content/articles/articles.controller.ts`
- `add-article-permissions.sql` (new)
- `update-role-article-permissions.sql` (new)

## Benefits

1. **Granular Control**: Individual permissions for each article operation
2. **Role Flexibility**: Different roles have appropriate article access levels
3. **Security**: Permission-based guards provide fine-grained authorization
4. **Scalability**: Easy to add new article-related permissions in future
5. **Audit Trail**: Clear permission requirements for each operation

## Testing

- ✅ Permissions added to database successfully
- ✅ Role-permission mappings created
- ✅ Frontend permissions matrix updated
- ✅ Backend controller updated with permission guards
- ✅ Permission counts verified per role

## Next Steps

1. **Test Article Creation**: Verify users with `article:create` permission can create articles
2. **Test Role Restrictions**: Ensure support agents can only read/list articles
3. **UI Integration**: Connect permissions to UI element visibility
4. **Permission Inheritance**: Consider adding permission groups for easier management

The article operations are now fully integrated into the platform's comprehensive permissions system!
