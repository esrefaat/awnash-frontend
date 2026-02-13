'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, faSearch, faPlus, faEdit, faTrash, faUserShield, 
  faCheck, faTimes, faEye, faSave, faFilter, faSort, faSortUp, faSortDown
} from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { usePermissions } from '@/hooks/usePermissions';
import { SuperAdminOnly } from '@/components/PermissionGuard';
import { rolesService, Role, Permission } from '@/services/rolesService';

interface PermissionModule {
  name: string;
  label: string;
  permissions: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    export: boolean;
  };
}

interface FormData {
  name: string;
  description: string;
  permissions: Record<string, boolean>;
}



// New Permission Matrix Modal Component
const PermissionMatrixModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
  isEdit: boolean;
  permissions: Permission[];
  rolesService: any;
  loadData: () => Promise<void>;
}> = ({ isOpen, onClose, role, isEdit, permissions, rolesService, loadData }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissionMatrix: {} as Record<string, Record<string, boolean>>
  });
  const [isSaving, setIsSaving] = useState(false);

  // Get unique resources and actions from permissions
  const resources = useMemo(() => {
    const uniqueResources = [...new Set(permissions.map((p: Permission) => p.resource))].sort();
    console.log('Available resources:', uniqueResources);
    return uniqueResources;
  }, [permissions]);

  const actions = useMemo(() => {
    const uniqueActions = [...new Set(permissions.map((p: Permission) => p.action))].sort();
    console.log('Available actions:', uniqueActions);
    console.log('Available permissions:', permissions.map(p => `${p.resource}:${p.action}`));
    return uniqueActions;
  }, [permissions]);

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen) {
      if (isEdit && role) {
        // Edit mode - populate with existing role data
        const matrix: Record<string, Record<string, boolean>> = {};
        
        // Initialize matrix with all false
        resources.forEach((resource: string) => {
          matrix[resource] = {};
          actions.forEach((action: string) => {
            matrix[resource][action] = false;
          });
        });

        // Set true for existing permissions
        (role.permissions || []).forEach((permissionName: string) => {
          const permission = permissions.find((p: Permission) => p.name === permissionName);
          if (permission) {
            if (!matrix[permission.resource]) {
              matrix[permission.resource] = {};
            }
            matrix[permission.resource][permission.action] = true;
          }
        });

        setFormData({
          name: role.name,
          description: role.description || '',
          permissionMatrix: matrix
        });
      } else {
        // Create mode - empty form
        const matrix: Record<string, Record<string, boolean>> = {};
        resources.forEach((resource: string) => {
          matrix[resource] = {};
          actions.forEach((action: string) => {
            matrix[resource][action] = false;
          });
        });

        setFormData({
          name: '',
          description: '',
          permissionMatrix: matrix
        });
      }
    }
  }, [isOpen, isEdit, role, resources, actions, permissions]);

  // Handle individual permission toggle
  const handlePermissionToggle = (resource: string, action: string) => {
    setFormData(prev => ({
      ...prev,
      permissionMatrix: {
        ...prev.permissionMatrix,
        [resource]: {
          ...prev.permissionMatrix[resource],
          [action]: !prev.permissionMatrix[resource]?.[action]
        }
      }
    }));
  };

  // Handle select all for a resource (row)
  const handleSelectAllResource = (resource: string) => {
    // Only consider actions that have corresponding permissions in the database
    const availableActions = actions.filter((action: string) => 
      permissions.find((p: Permission) => p.resource === resource && p.action === action)
    );
    
    const allAvailableSelected = availableActions.every((action: string) => 
      formData.permissionMatrix[resource]?.[action]
    );
    
    setFormData(prev => ({
      ...prev,
      permissionMatrix: {
        ...prev.permissionMatrix,
        [resource]: {
          ...prev.permissionMatrix[resource],
          ...availableActions.reduce((acc, action) => ({
            ...acc,
            [action]: !allAvailableSelected
          }), {})
        }
      }
    }));
  };

  // Handle select all for an action (column)
  const handleSelectAllAction = (action: string) => {
    // Only consider resources that have corresponding permissions in the database
    const availableResources = resources.filter((resource: string) => 
      permissions.find((p: Permission) => p.resource === resource && p.action === action)
    );
    
    const allAvailableSelected = availableResources.every((resource: string) => 
      formData.permissionMatrix[resource]?.[action]
    );
    
    setFormData(prev => ({
      ...prev,
      permissionMatrix: {
        ...prev.permissionMatrix,
        ...availableResources.reduce((acc, resource) => ({
          ...acc,
          [resource]: {
            ...prev.permissionMatrix[resource],
            [action]: !allAvailableSelected
          }
        }), {})
      }
    }));
  };

  // Handle select all permissions
  const handleSelectAll = () => {
    // Only consider permissions that actually exist in the database
    const availablePermissions = permissions.map((p: Permission) => ({ resource: p.resource, action: p.action }));
    
    const allAvailableSelected = availablePermissions.every(({ resource, action }) => 
      formData.permissionMatrix[resource]?.[action]
    );
    
    const matrix: Record<string, Record<string, boolean>> = { ...formData.permissionMatrix };
    
    // Initialize matrix structure
    resources.forEach((resource: string) => {
      if (!matrix[resource]) matrix[resource] = {};
      actions.forEach((action: string) => {
        if (matrix[resource][action] === undefined) {
          matrix[resource][action] = false;
        }
      });
    });
    
    // Set available permissions based on toggle state
    availablePermissions.forEach(({ resource, action }) => {
      matrix[resource][action] = !allAvailableSelected;
    });

    setFormData(prev => ({
      ...prev,
      permissionMatrix: matrix
    }));
  };

  // Handle save
  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('Role name is required');
      return;
    }

    try {
      setIsSaving(true);

      // Convert matrix to permission IDs
      const selectedPermissions: string[] = [];
      resources.forEach((resource: string) => {
        actions.forEach((action: string) => {
          if (formData.permissionMatrix[resource]?.[action]) {
            const permission = permissions.find((p: Permission) => p.resource === resource && p.action === action);
            if (permission) {
              selectedPermissions.push(permission.id);
            }
          }
        });
      });

      const roleData = {
        name: formData.name,
        description: formData.description,
        permissionIds: selectedPermissions
      };

      if (isEdit && role) {
        await rolesService.updateRole(role.id, roleData);
      } else {
        await rolesService.createRole(roleData);
      }

      onClose();
      await loadData(); // Reload the roles list
    } catch (error) {
      console.error('Error saving role:', error);
      alert('Failed to save role. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  // Only count available permissions (that exist in the database)
  const availablePermissions = permissions.length;
  const selectedCount = permissions.filter((p: Permission) => 
    formData.permissionMatrix[p.resource]?.[p.action]
  ).length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl border border-border w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {isEdit ? 'Edit Role' : 'Create New Role'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {selectedCount} of {availablePermissions} permissions selected
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <FontAwesomeIcon icon={faTimes} className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Basic Information */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-foreground mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Role Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter role name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter role description"
                />
              </div>
            </div>
          </div>

          {/* Permissions Matrix */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-foreground">Permissions Matrix</h3>
              <button
                onClick={handleSelectAll}
                className="px-4 py-2 bg-blue-600 text-foreground rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                {selectedCount === availablePermissions ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="bg-muted rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-600">
                    <tr>
                      <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        All
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Resource
                      </th>
                      {actions.map((action: string) => (
                        <th key={action} className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          <div className="flex flex-col items-center">
                            <span>{action}</span>
                            <button
                              onClick={() => handleSelectAllAction(action)}
                              className="mt-1 text-xs text-blue-400 hover:text-blue-300"
                            >
                              {resources.filter((resource: string) => 
                                permissions.find((p: Permission) => p.resource === resource && p.action === action)
                              ).every((resource: string) => formData.permissionMatrix[resource]?.[action]) ? 'None' : 'All'}
                            </button>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-600">
                    {resources.map((resource: string) => {
                      const availableActions = actions.filter((action: string) => 
                        permissions.find((p: Permission) => p.resource === resource && p.action === action)
                      );
                      const selectedCount = availableActions.filter((action: string) => 
                        formData.permissionMatrix[resource]?.[action]
                      ).length;
                      
                      return (
                        <tr key={resource} className="hover:bg-muted">
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleSelectAllResource(resource)}
                              className="text-xs text-blue-400 hover:text-blue-300"
                            >
                              {selectedCount === availableActions.length && availableActions.length > 0 ? 'None' : 'All'}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-foreground">
                            <div className="flex items-center justify-between">
                              <span className="capitalize">{resource.replace('_', ' ')}</span>
                              <span className="text-xs text-muted-foreground">
                                {selectedCount}/{availableActions.length}
                              </span>
                            </div>
                          </td>
                          {actions.map((action: string) => {
                            const isChecked = formData.permissionMatrix[resource]?.[action] || false;
                            const permission = permissions.find((p: Permission) => p.resource === resource && p.action === action);
                            
                            return (
                              <td key={action} className="px-4 py-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handlePermissionToggle(resource, action)}
                                  disabled={!permission}
                                  className="w-4 h-4 text-blue-600 bg-muted border-border rounded focus:ring-blue-500 focus:ring-2 disabled:opacity-50"
                                  title={permission ? permission.description : 'Permission not available'}
                                />
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Selected Permissions Summary */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Selected Permissions ({selectedCount})</h4>
            <div className="bg-muted rounded-lg p-4 max-h-32 overflow-y-auto">
              <div className="flex flex-wrap gap-2">
                {resources.map((resource: string) => 
                  actions.map((action: string) => {
                    if (formData.permissionMatrix[resource]?.[action]) {
                      return (
                        <span
                          key={`${resource}:${action}`}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-600 text-foreground"
                        >
                          {resource}:{action}
                        </span>
                      );
                    }
                    return null;
                  })
                )}
                {selectedCount === 0 && (
                  <span className="text-muted-foreground text-sm">No permissions selected</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-4 p-6 border-t border-border bg-gray-750">
          <button
            onClick={onClose}
            className="px-6 py-2 text-muted-foreground hover:text-foreground transition-colors"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !formData.name.trim()}
            className="px-6 py-2 bg-blue-600 text-foreground rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
            {isSaving ? 'Saving...' : (isEdit ? 'Update Role' : 'Create Role')}
          </button>
        </div>
      </div>
    </div>
  );
};

const RolesPermissionsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { user: currentUser, permissions: currentPermissions } = usePermissions();
  
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [groupedPermissions, setGroupedPermissions] = useState<Record<string, Permission[]>>({});
  const [filteredRoles, setFilteredRoles] = useState<Role[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleTypeFilter, setRoleTypeFilter] = useState('all');
  const [sortField, setSortField] = useState<keyof Role>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      setIsLoading(true);
      console.log('Loading roles and permissions...');
      
      // Load roles first
      console.log('Fetching roles...');
      const rolesData = await rolesService.getAllRoles();
      console.log('Loaded roles data:', rolesData);

      // Load permissions separately to isolate the issue
      console.log('Fetching permissions...');
      const permissionsData = await rolesService.getAllPermissions();
      console.log('Loaded permissions data:', permissionsData);

      if (Array.isArray(rolesData)) {
        setRoles(rolesData);
        console.log('Final roles state:', rolesData);
      } else {
        console.error('Roles data is not an array:', rolesData);
        setRoles([]);
      }

      if (permissionsData && permissionsData.permissions) {
        setPermissions(permissionsData.permissions);
        setGroupedPermissions(permissionsData.grouped || {});
        console.log('Final permissions state:', permissionsData.permissions);
        console.log('Final grouped permissions state:', permissionsData.grouped);
      } else {
        console.error('Invalid permissions data structure:', permissionsData);
        console.error('Expected structure: { permissions: Permission[], grouped: Record<string, Permission[]> }');
        console.error('Received:', permissionsData);
        setPermissions([]);
        setGroupedPermissions({});
      }
    } catch (error) {
      console.error('Error loading data:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error
      });
      
      if (error instanceof Error && error.message.includes('401')) {
        console.error('Authentication error - redirecting to login');
        window.location.href = '/auth/login';
      } else if (error instanceof Error && error.message.includes('403')) {
        alert('Permission denied. You need super admin privileges to access this page.');
      } else {
        alert(`Failed to load data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      setRoles([]);
      setPermissions([]);
      setGroupedPermissions({});
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortRoles = useCallback(() => {
    let filtered = roles;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(role => 
        role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role type filter
    if (roleTypeFilter !== 'all') {
      const adminRoles = ['super_admin', 'booking_admin', 'content_admin', 'support_agent'];
      const clientRoles = ['owner', 'renter', 'hybrid'];
      
      if (roleTypeFilter === 'admin') {
        filtered = filtered.filter(role => adminRoles.includes(role.name));
      } else if (roleTypeFilter === 'operational') {
        filtered = filtered.filter(role => ['booking_admin', 'content_admin', 'support_agent'].includes(role.name));
      } else if (roleTypeFilter === 'client') {
        filtered = filtered.filter(role => clientRoles.includes(role.name));
      }
    }

    // Sort
    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue === undefined || bValue === undefined) return 0;
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredRoles(filtered);
  }, [roles, searchTerm, roleTypeFilter, sortField, sortDirection]);

  useEffect(() => {
    loadData();
  }, []);

  // Filter and sort roles whenever roles or filter criteria change
  useEffect(() => {
    filterAndSortRoles();
  }, [filterAndSortRoles]);

  const handleSort = (field: keyof Role) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: keyof Role) => {
    if (sortField !== field) return faSort;
    return sortDirection === 'asc' ? faSortUp : faSortDown;
  };

  const getRoleTypeColor = (roleName: string) => {
    const adminRoles = ['super_admin', 'booking_admin', 'content_admin', 'support_agent'];
    const clientRoles = ['owner', 'renter', 'hybrid'];
    
    if (adminRoles.includes(roleName)) {
      return 'bg-red-600 text-foreground';
    } else if (clientRoles.includes(roleName)) {
      return 'bg-blue-600 text-foreground';
    }
    return 'bg-gray-600 text-foreground';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleCreateRole = () => {
    setSelectedRole(null);
    setIsCreateModalOpen(true);
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setIsEditModalOpen(true);
  };

  const handleDeleteRole = async (roleId: string) => {
    if (confirm('Are you sure you want to delete this role? This action cannot be undone.')) {
      try {
        await rolesService.deleteRole(roleId);
        await loadData();
      } catch (error) {
        console.error('Failed to delete role:', error);
        alert('Failed to delete role. It may have users assigned to it.');
      }
    }
  };



  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-foreground text-xl mb-4">Loading roles and permissions...</div>
          <div className="text-muted-foreground text-sm">
            If this takes too long, you may need to log in again.
          </div>
        </div>
      </div>
    );
  }

  return (
    <SuperAdminOnly fallback={
      <div className="min-h-screen bg-background text-gray-100 p-6">
        <div className="max-w-2xl mx-auto p-8 bg-card border border-border rounded-xl text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-4">You need super admin privileges to manage roles and permissions.</p>
        </div>
      </div>
    }>
      <div className={`min-h-screen bg-background ${isRTL ? 'font-arabic' : 'font-montserrat'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">
                  {isRTL ? 'الأدوار والصلاحيات' : 'Roles & Permissions'}
                </h1>
                <p className="text-muted-foreground">
                  {isRTL ? 'إدارة أدوار النظام والصلاحيات المرتبطة بها' : 'Manage system roles and their associated permissions'}
                </p>
              </div>
              <button
                onClick={handleCreateRole}
                className="flex items-center px-6 py-3 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition-colors font-medium"
              >
                <FontAwesomeIcon icon={faPlus} className={`${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'إضافة دور جديد' : 'Add New Role'}
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-card rounded-xl border border-border shadow-lg mb-6">
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search */}
                <div className="relative">
                  <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder={isRTL ? 'البحث عن الأدوار...' : 'Search roles...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-yellow-500"
                  />
                </div>

                {/* Role Type Filter */}
                <select
                  value={roleTypeFilter}
                  onChange={(e) => setRoleTypeFilter(e.target.value)}
                  className="px-4 py-2 bg-muted border border-border rounded-lg text-foreground focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="all">{isRTL ? 'جميع الأنواع' : 'All Types'}</option>
                  <option value="admin">{isRTL ? 'أدوار الإدارة' : 'Admin Roles'}</option>
                  <option value="operational">{isRTL ? 'أدوار التشغيل' : 'Operational Roles'}</option>
                  <option value="client">{isRTL ? 'أدوار العملاء' : 'Client Roles'}</option>
                </select>

                {/* Stats */}
                <div className="flex items-center justify-end text-sm text-muted-foreground">
                  {filteredRoles.length} of {roles.length} roles
                </div>
              </div>
            </div>
          </div>

          {/* Roles Table */}
          <div className="bg-card rounded-xl border border-border shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th 
                      className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>{isRTL ? 'اسم الدور' : 'Role Name'}</span>
                        <FontAwesomeIcon icon={getSortIcon('name')} className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {isRTL ? 'الوصف' : 'Description'}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {isRTL ? 'المستخدمون المعينون' : 'Assigned Users'}
                    </th>
                    <th 
                      className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground"
                      onClick={() => handleSort('created_at')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>{isRTL ? 'تاريخ الإنشاء' : 'Created At'}</span>
                        <FontAwesomeIcon icon={getSortIcon('created_at')} className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {isRTL ? 'الإجراءات' : 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredRoles.map((role) => (
                    <tr key={role.id} className="hover:bg-muted transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleTypeColor(role.name)}`}>
                              <FontAwesomeIcon icon={faUserShield} className="h-3 w-3 mr-1" />
                              {role.name.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-foreground">{role.description}</div>
                        <div className="text-xs text-muted-foreground">
                          {role.permissions?.length || 0} permissions
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <FontAwesomeIcon icon={faUsers} className="h-4 w-4 text-muted-foreground mr-2" />
                          <span className="text-sm text-foreground font-medium">{role.userCount}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {formatDate(role.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditRole(role)}
                            className="p-2 text-muted-foreground hover:text-blue-400 transition-colors"
                            title="Edit Role"
                          >
                            <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteRole(role.id)}
                            className="p-2 text-muted-foreground hover:text-red-400 transition-colors"
                            title="Delete Role"
                          >
                            <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modals */}
          <PermissionMatrixModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            role={null}
            isEdit={false}
            permissions={permissions}
            rolesService={rolesService}
            loadData={loadData}
          />
          <PermissionMatrixModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            role={selectedRole}
            isEdit={true}
            permissions={permissions}
            rolesService={rolesService}
            loadData={loadData}
          />
        </div>
      </div>
    </SuperAdminOnly>
  );
};

export default RolesPermissionsPage; 