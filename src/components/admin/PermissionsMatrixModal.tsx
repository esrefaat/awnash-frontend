import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';

interface User {
  id: string;
  full_name: string;
  mobile_number: string;
  email?: string;
  role: string;
  roles: string[];
  permissions: string[];
  permissions_override?: Record<string, boolean>;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  city?: string;
  last_login?: string;
}

interface PermissionsMatrixModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onSave: (permissions: Record<string, boolean>) => void;
}

interface PermissionModule {
  name: string;
  label: string;
  permissions: {
    action: string;
    label: string;
    description: string;
  }[];
}

const PermissionsMatrixModal: React.FC<PermissionsMatrixModalProps> = ({
  user,
  isOpen,
  onClose,
  onSave
}) => {
  const [customPermissions, setCustomPermissions] = useState<Record<string, boolean>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const permissionModules: PermissionModule[] = [
    {
      name: 'system',
      label: 'System Management',
      permissions: [
        { action: 'configure', label: 'Configure', description: 'System configuration and settings' },
        { action: 'backup', label: 'Backup', description: 'System backup operations' },
        { action: 'restore', label: 'Restore', description: 'System restore operations' }
      ]
    },
    {
      name: 'roles',
      label: 'Role Management',
      permissions: [
        { action: 'manage', label: 'Manage', description: 'Create, edit, and delete roles' },
        { action: 'assign', label: 'Assign', description: 'Assign roles to users' }
      ]
    },
    {
      name: 'user',
      label: 'User Management',
      permissions: [
        { action: 'create', label: 'Create', description: 'Create new users' },
        { action: 'read', label: 'View', description: 'View user information' },
        { action: 'update', label: 'Edit', description: 'Edit user information' },
        { action: 'delete', label: 'Delete', description: 'Delete users' },
        { action: 'verify', label: 'Verify', description: 'Verify user accounts' },
        { action: 'list', label: 'List', description: 'List all users' }
      ]
    },
    {
      name: 'booking',
      label: 'Booking Management',
      permissions: [
        { action: 'create', label: 'Create', description: 'Create new bookings' },
        { action: 'read', label: 'View', description: 'View booking details' },
        { action: 'update', label: 'Edit', description: 'Edit booking information' },
        { action: 'delete', label: 'Delete', description: 'Cancel/delete bookings' },
        { action: 'approve', label: 'Approve', description: 'Approve booking requests' },
        { action: 'list', label: 'List', description: 'List all bookings' }
      ]
    },
    {
      name: 'equipment',
      label: 'Equipment Management',
      permissions: [
        { action: 'create', label: 'Create', description: 'Add new equipment' },
        { action: 'read', label: 'View', description: 'View equipment details' },
        { action: 'update', label: 'Edit', description: 'Edit equipment information' },
        { action: 'delete', label: 'Delete', description: 'Remove equipment' },
        { action: 'approve', label: 'Approve', description: 'Approve equipment listings' },
        { action: 'list', label: 'List', description: 'List all equipment' }
      ]
    },
    {
      name: 'payment',
      label: 'Payment Management',
      permissions: [
        { action: 'create', label: 'Create', description: 'Process payments' },
        { action: 'read', label: 'View', description: 'View payment information' },
        { action: 'update', label: 'Edit', description: 'Edit payment details' },
        { action: 'refund', label: 'Refund', description: 'Process refunds' },
        { action: 'list', label: 'List', description: 'List all payments' }
      ]
    },
    {
      name: 'lead',
      label: 'Lead Management',
      permissions: [
        { action: 'create', label: 'Create', description: 'Create new leads' },
        { action: 'read', label: 'View', description: 'View lead information' },
        { action: 'update', label: 'Edit', description: 'Edit lead details' },
        { action: 'delete', label: 'Delete', description: 'Delete leads' },
        { action: 'convert', label: 'Convert', description: 'Convert leads to customers' },
        { action: 'list', label: 'List', description: 'List all leads' }
      ]
    },
    {
      name: 'analytics',
      label: 'Analytics & Reports',
      permissions: [
        { action: 'view', label: 'View', description: 'View analytics dashboards' },
        { action: 'export', label: 'Export', description: 'Export analytics data' }
      ]
    },
    {
      name: 'dashboard',
      label: 'Dashboard Access',
      permissions: [
        { action: 'view', label: 'View', description: 'Access main dashboard' }
      ]
    },
    {
      name: 'audit',
      label: 'Audit & Logs',
      permissions: [
        { action: 'view', label: 'View', description: 'View audit logs and system activity' }
      ]
    },
    {
      name: 'reports',
      label: 'Report Generation',
      permissions: [
        { action: 'generate', label: 'Generate', description: 'Generate and download reports' }
      ]
    }
  ];

  useEffect(() => {
    if (user.permissions_override) {
      setCustomPermissions(user.permissions_override);
    } else {
      // Initialize with current role permissions
      const rolePermissions: Record<string, boolean> = {};
      (user.permissions || []).forEach(permission => {
        rolePermissions[permission] = true;
      });
      setCustomPermissions(rolePermissions);
    }
  }, [user]);

  const getPermissionKey = (module: string, action: string) => `${module}:${action}`;

  const isPermissionGranted = (module: string, action: string): boolean => {
    const key = getPermissionKey(module, action);
    return customPermissions[key] === true;
  };

  const isPermissionInherited = (module: string, action: string): boolean => {
    const key = getPermissionKey(module, action);
    // Check if this permission is in the user's role permissions (inherited)
    return (user.permissions || []).includes(key);
  };

  const isPermissionOverridden = (module: string, action: string): boolean => {
    const key = getPermissionKey(module, action);
    const isInherited = isPermissionInherited(module, action);
    const isCurrentlyGranted = isPermissionGranted(module, action);
    // It's overridden if the current state differs from the inherited state
    return isInherited !== isCurrentlyGranted;
  };

  const getPermissionStatus = (module: string, action: string): 'inherited' | 'granted' | 'denied' | 'none' => {
    const key = getPermissionKey(module, action);
    const isInherited = isPermissionInherited(module, action);
    const isCurrentlyGranted = isPermissionGranted(module, action);
    
    if (isInherited && isCurrentlyGranted) {
      return 'inherited'; // Permission from role
    } else if (!isInherited && isCurrentlyGranted) {
      return 'granted'; // Override grant
    } else if (isInherited && !isCurrentlyGranted) {
      return 'denied'; // Override deny
    } else {
      return 'none'; // No permission
    }
  };

  const getPermissionColorClass = (status: string): string => {
    switch (status) {
      case 'inherited':
        return 'bg-blue-600 border-blue-500 text-white'; // Blue for inherited from role
      case 'granted':
        return 'bg-green-600 border-green-500 text-white'; // Green for override grant
      case 'denied':
        return 'bg-red-600 border-red-500 text-white'; // Red for override deny
      default:
        return 'bg-gray-600 border-gray-500 text-gray-300'; // Gray for no permission
    }
  };

  const getPermissionIcon = (status: string): string => {
    switch (status) {
      case 'inherited':
        return '👑'; // Crown for inherited
      case 'granted':
        return '✓'; // Check for granted
      case 'denied':
        return '✗'; // X for denied
      default:
        return '';
    }
  };

  const togglePermission = (module: string, action: string) => {
    const key = getPermissionKey(module, action);
    const isCurrentlyGranted = isPermissionGranted(module, action);
    
    setCustomPermissions(prev => ({
      ...prev,
      [key]: !isCurrentlyGranted
    }));
    setHasChanges(true);
  };

  const resetToRoleDefaults = () => {
    const rolePermissions: Record<string, boolean> = {};
    (user.permissions || []).forEach(permission => {
      rolePermissions[permission] = true;
    });
    setCustomPermissions(rolePermissions);
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave(customPermissions);
    setHasChanges(false);
  };

  const handleClose = () => {
    if (hasChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        onClose();
        setHasChanges(false);
      }
    } else {
      onClose();
    }
  };

  const getTotalGrantedPermissions = () => {
    return Object.values(customPermissions).filter(Boolean).length;
  };

  const getModulePermissionCount = (module: PermissionModule) => {
    const granted = module.permissions.filter(p => 
      isPermissionGranted(module.name, p.action)
    ).length;
    return `${granted}/${module.permissions.length}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gray-800 border-gray-700 text-gray-100 max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold text-gray-100">
                Permissions Matrix
              </DialogTitle>
              <p className="text-gray-400 mt-1">
                Managing permissions for {user.full_name} ({user.role})
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Total Permissions</p>
              <p className="text-2xl font-bold text-[#FFCC00]">
                {getTotalGrantedPermissions()}
              </p>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden">
          <TabsList className="grid grid-cols-4 lg:grid-cols-6 gap-2 bg-gray-750 p-1 rounded-xl mb-4">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-[#0073E6] data-[state=active]:text-white text-gray-300"
            >
              Overview
            </TabsTrigger>
            {permissionModules.slice(0, 5).map(module => (
              <TabsTrigger 
                key={module.name}
                value={module.name}
                className="data-[state=active]:bg-[#0073E6] data-[state=active]:text-white text-gray-300 text-xs"
              >
                {module.label.split(' ')[0]}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 overflow-y-auto max-h-[60vh]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {permissionModules.map(module => {
                const grantedCount = module.permissions.filter(p => 
                  isPermissionGranted(module.name, p.action)
                ).length;
                const overriddenCount = module.permissions.filter(p => 
                  isPermissionOverridden(module.name, p.action)
                ).length;

                return (
                  <div
                    key={module.name}
                    onClick={() => setActiveTab(module.name)}
                    className="bg-gray-750 border border-gray-600 rounded-xl p-4 cursor-pointer hover:border-[#0073E6] transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-200">{module.label}</h3>
                      <Badge 
                        variant="outline" 
                        className="border-gray-500 text-gray-300 text-xs"
                      >
                        {getModulePermissionCount(module)}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Granted:</span>
                        <span className="text-green-400">{grantedCount}</span>
                      </div>
                      {overriddenCount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Overridden:</span>
                          <span className="text-[#FFCC00]">{overriddenCount}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-3 w-full bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-[#0073E6] h-2 rounded-full transition-all"
                        style={{ 
                          width: `${(grantedCount / module.permissions.length) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-gray-750 border border-gray-600 rounded-xl p-4">
              <h3 className="font-semibold text-gray-200 mb-3">Role Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Current Role:</span>
                  <p className="text-gray-200 font-medium">{user.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                </div>
                <div>
                  <span className="text-gray-400">Default Permissions:</span>
                  <p className="text-gray-200 font-medium">{user.permissions?.length || 0}</p>
                </div>
                <div>
                  <span className="text-gray-400">Custom Permissions:</span>
                  <p className="text-gray-200 font-medium">{getTotalGrantedPermissions()}</p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Module-specific tabs */}
          {permissionModules.map(module => (
            <TabsContent key={module.name} value={module.name} className="overflow-y-auto max-h-[60vh]">
              <div className="bg-gray-750 border border-gray-600 rounded-xl overflow-hidden">
                <div className="bg-gray-700 px-6 py-4 border-b border-gray-600">
                  <h3 className="text-lg font-semibold text-gray-100">{module.label}</h3>
                  <p className="text-sm text-gray-400">
                    Configure {module.label.toLowerCase()} permissions for this user
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-700">
                      <tr>
                        <th className="text-left p-4 font-semibold text-gray-200">Permission</th>
                        <th className="text-left p-4 font-semibold text-gray-200">Description</th>
                        <th className="text-center p-4 font-semibold text-gray-200">Status</th>
                        <th className="text-center p-4 font-semibold text-gray-200">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {module.permissions.map(permission => {
                        const status = getPermissionStatus(module.name, permission.action);

                        return (
                          <tr key={permission.action} className="border-b border-gray-600 hover:bg-gray-750">
                            <td className="p-4">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-gray-200">
                                  {permission.label}
                                </span>
                                {status === 'inherited' && (
                                  <Badge className="bg-blue-600 border-blue-500 text-white text-xs px-2 py-1">
                                    Inherited
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="text-gray-400 text-sm">
                                {permission.description}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${getPermissionColorClass(status)}`} />
                                <span className={`text-sm ${
                                  status === 'granted' ? 'text-green-400' : status === 'denied' ? 'text-red-400' : 'text-gray-400'
                                }`}>
                                  {status === 'inherited' ? 'Inherited' : status === 'granted' ? 'Granted' : status === 'denied' ? 'Denied' : 'No Permission'}
                                </span>
                              </div>
                            </td>
                            <td className="p-4 text-center">
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={isPermissionGranted(module.name, permission.action)}
                                  onChange={() => togglePermission(module.name, permission.action)}
                                  className="sr-only peer"
                                />
                                <div className={`relative w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white ${
                                  status === 'inherited' && isPermissionGranted(module.name, permission.action) 
                                    ? 'peer-checked:bg-blue-600 bg-gray-600' 
                                    : status === 'granted' 
                                    ? 'peer-checked:bg-green-600 bg-gray-600'
                                    : status === 'denied'
                                    ? 'peer-checked:bg-red-600 bg-gray-600'
                                    : 'peer-checked:bg-[#0073E6] bg-gray-600'
                                }`}></div>
                                {status !== 'none' && (
                                  <span className="ml-2 text-xs">
                                    {getPermissionIcon(status)}
                                  </span>
                                )}
                              </label>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-600">
          <Button
            variant="outline"
            onClick={resetToRoleDefaults}
            className="border-gray-600 text-gray-300 hover:bg-gray-700 rounded-xl"
          >
            Reset to Role Defaults
          </Button>
          
          <div className="flex space-x-4">
            <Button
              variant="outline"
              onClick={handleClose}
              className="border-gray-600 text-gray-300 hover:bg-gray-700 rounded-xl px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges}
              className="bg-[#FFCC00] hover:bg-[#E6B800] text-black font-semibold rounded-xl px-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PermissionsMatrixModal; 