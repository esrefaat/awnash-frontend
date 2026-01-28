import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';

import { Badge } from '@/components/ui/Badge';

interface User {
  id: string;
  fullName: string;
  mobileNumber: string;
  email?: string;
  role: string;
  roles: string[];
  permissions: string[];
  permissionsOverride?: Record<string, boolean>;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  city?: string;
  lastLogin?: string;
}

interface CreateUserForm {
  fullName: string;
  mobileNumber: string;
  email: string;
  password: string;
  role: string;
  city: string;
  isActive: boolean;
  sendInvite: boolean;
}

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [form, setForm] = useState<CreateUserForm>({
    fullName: '',
    mobileNumber: '',
    email: '',
    password: '',
    role: 'support_agent',
    city: '',
    isActive: true,
    sendInvite: false
  });

  const [errors, setErrors] = useState<Partial<CreateUserForm>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roleOptions = [
    { value: 'super_admin', label: 'Super Admin', permissions: 35 },
    { value: 'booking_admin', label: 'Booking Admin', permissions: 15 },
    { value: 'content_admin', label: 'Content Admin', permissions: 12 },
    { value: 'support_agent', label: 'Support Agent', permissions: 8 },
    { value: 'owner', label: 'Equipment Owner', permissions: 9 },
    { value: 'renter', label: 'Renter', permissions: 7 },
    { value: 'hybrid', label: 'Hybrid User', permissions: 16 }
  ];

  const roleColors: Record<string, string> = {
    super_admin: 'bg-purple-900 text-purple-300',
    booking_admin: 'bg-blue-900 text-blue-300',
    content_admin: 'bg-green-900 text-green-300',
    support_agent: 'bg-yellow-900 text-yellow-300',
    owner: 'bg-orange-900 text-orange-300',
    renter: 'bg-gray-700 text-gray-300',
    hybrid: 'bg-indigo-900 text-indigo-300'
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateUserForm> = {};

    if (!form.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!form.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!/^\+[1-9]\d{1,14}$/.test(form.mobileNumber)) {
      newErrors.mobileNumber = 'Please enter a valid mobile number with country code (e.g., +966501234567)';
    }

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!form.sendInvite && !form.password.trim()) {
      newErrors.password = 'Password is required when not sending invite';
    } else if (!form.sendInvite && form.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newUser: User = {
        id: Date.now().toString(),
        fullName: form.fullName,
        mobileNumber: form.mobileNumber,
        email: form.email || undefined,
        role: form.role,
        roles: [form.role],
        permissions: getPermissionsForRole(form.role),
        isVerified: !form.sendInvite,
        isActive: form.isActive,
        city: form.city || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      onSuccess(newUser);
      resetForm();
    } catch (error) {
      console.error('Failed to create user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPermissionsForRole = (role: string): string[] => {
    const permissionMap: Record<string, string[]> = {
      super_admin: [
        'system:configure', 'roles:manage', 'user:create', 'user:read', 'user:update', 'user:delete',
        'booking:create', 'booking:read', 'booking:update', 'booking:delete', 'booking:approve',
        'equipment:create', 'equipment:read', 'equipment:update', 'equipment:delete', 'equipment:approve',
        'payment:create', 'payment:read', 'payment:update', 'payment:refund',
        'article:create', 'article:read', 'article:update', 'article:delete', 'article:publish', 'article:approve', 'article:schedule', 'article:list',
        'dashboard:view', 'analytics:view', 'audit:view', 'reports:generate'
      ],
      booking_admin: [
        'booking:create', 'booking:read', 'booking:update', 'booking:approve',
        'payment:read', 'payment:update', 'user:read', 'equipment:read',
        'dashboard:view', 'analytics:view'
      ],
      content_admin: [
        'equipment:create', 'equipment:read', 'equipment:update',
        'lead:create', 'lead:read', 'lead:update', 'lead:convert',
        'article:create', 'article:read', 'article:update', 'article:publish', 'article:schedule', 'article:list',
        'user:read', 'dashboard:view'
      ],
      support_agent: [
        'user:read', 'booking:read', 'equipment:read', 'payment:read',
        'lead:read', 'article:read', 'article:list', 'dashboard:view'
      ],
      owner: [
        'equipment:create', 'equipment:read', 'equipment:update',
        'booking:read', 'booking:update', 'payment:read', 'dashboard:view'
      ],
      renter: [
        'booking:create', 'booking:read', 'equipment:read',
        'payment:create', 'payment:read', 'dashboard:view'
      ],
      hybrid: [
        'equipment:create', 'equipment:read', 'equipment:update',
        'booking:create', 'booking:read', 'booking:update',
        'payment:create', 'payment:read', 'dashboard:view'
      ]
    };

    return permissionMap[role] || [];
  };

  const resetForm = () => {
    setForm({
      fullName: '',
      mobileNumber: '',
      email: '',
      password: '',
      role: 'support_agent',
      city: '',
      isActive: true,
      sendInvite: false
    });
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const selectedRole = roleOptions.find(role => role.value === form.role);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gray-800 border-gray-700 text-gray-100 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-100">Create New User</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-200 border-b border-gray-600 pb-2">
              Basic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName" className="text-gray-300">
                  Full Name <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setForm(prev => ({ ...prev, fullName: e.target.value }))}
                  className="bg-gray-700 border-gray-600 text-gray-100 rounded-xl mt-1"
                  placeholder="Enter full name"
                />
                {errors.fullName && (
                  <p className="text-red-400 text-sm mt-1">{errors.fullName}</p>
                )}
              </div>

              <div>
                <Label htmlFor="mobileNumber" className="text-gray-300">
                  Mobile Number <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="mobileNumber"
                  type="tel"
                  value={form.mobileNumber}
                  onChange={(e) => setForm(prev => ({ ...prev, mobileNumber: e.target.value }))}
                  className="bg-gray-700 border-gray-600 text-gray-100 rounded-xl mt-1"
                  placeholder="+966501234567"
                />
                {errors.mobileNumber && (
                  <p className="text-red-400 text-sm mt-1">{errors.mobileNumber}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email" className="text-gray-300">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                  className="bg-gray-700 border-gray-600 text-gray-100 rounded-xl mt-1"
                  placeholder="user@awnash.net"
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="city" className="text-gray-300">City</Label>
                <Input
                  id="city"
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm(prev => ({ ...prev, city: e.target.value }))}
                  className="bg-gray-700 border-gray-600 text-gray-100 rounded-xl mt-1"
                  placeholder="Riyadh, Jeddah, etc."
                />
              </div>
            </div>
          </div>

          {/* Role & Permissions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-200 border-b border-gray-600 pb-2">
              Role & Permissions
            </h3>

            <div>
              <Label htmlFor="role" className="text-gray-300">
                User Role <span className="text-red-400">*</span>
              </Label>
              <select
                value={form.role}
                onChange={(e) => setForm(prev => ({ ...prev, role: e.target.value }))}
                className="bg-gray-700 border-gray-600 text-gray-100 rounded-xl mt-1 w-full p-2"
              >
                {roleOptions.map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label} ({role.permissions} permissions)
                  </option>
                ))}
              </select>
              
              {selectedRole && (
                <div className="mt-3 p-3 bg-gray-750 rounded-xl border border-gray-600">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={`${roleColors[form.role]} rounded-full px-3 py-1`}>
                      {selectedRole.label}
                    </Badge>
                    <span className="text-sm text-gray-400">
                      {selectedRole.permissions} permissions included
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">
                    This role will automatically grant the appropriate permissions. 
                    You can customize individual permissions after creating the user.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Authentication */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-200 border-b border-gray-600 pb-2">
              Authentication
            </h3>

            <div className="flex items-center justify-between p-4 bg-gray-750 rounded-xl border border-gray-600">
              <div>
                <Label className="text-gray-300 font-medium">Send Invitation Email/SMS</Label>
                <p className="text-sm text-gray-400 mt-1">
                  User will receive an invitation to set their own password
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.sendInvite}
                  onChange={(e) => setForm(prev => ({ 
                    ...prev, 
                    sendInvite: e.target.checked,
                    password: e.target.checked ? '' : prev.password
                  }))}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 dark:peer-focus:ring-yellow-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FFCC00]"></div>
              </label>
            </div>

            {!form.sendInvite && (
              <div>
                <Label htmlFor="password" className="text-gray-300">
                  Temporary Password <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
                  className="bg-gray-700 border-gray-600 text-gray-100 rounded-xl mt-1"
                  placeholder="Enter temporary password"
                />
                {errors.password && (
                  <p className="text-red-400 text-sm mt-1">{errors.password}</p>
                )}
                <p className="text-sm text-gray-400 mt-1">
                  User will be prompted to change this password on first login
                </p>
              </div>
            )}
          </div>

          {/* Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-200 border-b border-gray-600 pb-2">
              Account Status
            </h3>

            <div className="flex items-center justify-between p-4 bg-gray-750 rounded-xl border border-gray-600">
              <div>
                <Label className="text-gray-300 font-medium">Account Active</Label>
                <p className="text-sm text-gray-400 mt-1">
                  User can login and access the dashboard
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 dark:peer-focus:ring-yellow-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FFCC00]"></div>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-600">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="border-gray-600 text-gray-300 hover:bg-gray-700 rounded-xl px-6"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#FFCC00] hover:bg-[#E6B800] text-black font-semibold rounded-xl px-6"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Creating User...</span>
                </div>
              ) : (
                form.sendInvite ? 'Create & Send Invite' : 'Create User'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserModal; 