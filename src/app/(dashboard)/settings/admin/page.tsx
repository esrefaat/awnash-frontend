'use client';

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faDollarSign, faComments, faFileContract, faTruck, faUserShield, faClipboardList,
  faSearch, faCheck, faTimes, faEdit, faTrash, faPlus, faSave, faUser, faBuilding, faFile, faCog, faChartLine, faUsers
} from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { usePermissions } from '@/hooks/usePermissions';
import { PermissionGuard, SuperAdminOnly } from '@/components/PermissionGuard';

interface AdminSettings {
  platformCommissionRate: number;
  requesterServiceFee: number;
  cancellationPenaltyRate: number;
  walletCreditLimit: number;
  documentExpiryReminder: boolean;
  autoApproveEquipment: boolean;
  requireDocumentVerification: boolean;
  enableWalletSystem: boolean;
  maxBookingDuration: number;
  minBookingAdvance: number;
  maxChatWindowTime: number;
  chatTimeUnit: 'minutes' | 'hours';
}

interface AuditLogEntry {
  id: string;
  timestamp: string;
  adminName: string;
  adminId: string;
  action: string;
  target: string;
  targetType: 'user' | 'equipment' | 'booking' | 'document' | 'system';
  details: string;
  ipAddress: string;
  success: boolean;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  isActive: boolean;
  createdAt: string;
}

const AdminSettings: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { user, permissions } = usePermissions();
  
  const [activeTab, setActiveTab] = useState('platform-fees');
  const [settings, setSettings] = useState<AdminSettings>({
    platformCommissionRate: 15,
    requesterServiceFee: 5,
    cancellationPenaltyRate: 20,
    walletCreditLimit: 10000,
    documentExpiryReminder: true,
    autoApproveEquipment: false,
    requireDocumentVerification: true,
    enableWalletSystem: true,
    maxBookingDuration: 30,
    minBookingAdvance: 24,
    maxChatWindowTime: 60,
    chatTimeUnit: 'minutes'
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAdmin, setSelectedAdmin] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Mock roles data
  const [roles, setRoles] = useState<Role[]>([
    {
      id: '1',
      name: 'super_admin',
      description: 'Full system access with all permissions',
      permissions: ['system:configure', 'roles:manage', 'user:create', 'user:read', 'user:update', 'user:delete', 'booking:approve', 'equipment:approve', 'payment:refund', 'audit:view'],
      userCount: 2,
      isActive: true,
      createdAt: '2024-01-01'
    },
    {
      id: '2',
      name: 'booking_admin',
      description: 'Manage bookings and rental operations',
      permissions: ['booking:create', 'booking:read', 'booking:update', 'booking:approve', 'payment:read', 'user:read', 'equipment:read'],
      userCount: 5,
      isActive: true,
      createdAt: '2024-01-01'
    },
    {
      id: '3',
      name: 'content_admin',
      description: 'Manage equipment listings and content',
      permissions: ['equipment:create', 'equipment:read', 'equipment:update', 'lead:create', 'lead:read', 'lead:convert', 'user:read'],
      userCount: 3,
      isActive: true,
      createdAt: '2024-01-01'
    },
    {
      id: '4',
      name: 'support_agent',
      description: 'Customer support and basic operations',
      permissions: ['user:read', 'booking:read', 'equipment:read', 'payment:read', 'lead:read'],
      userCount: 8,
      isActive: true,
      createdAt: '2024-01-01'
    },
    {
      id: '5',
      name: 'owner',
      description: 'Equipment owners with listing management',
      permissions: ['equipment:create', 'equipment:read', 'equipment:update', 'booking:read', 'payment:read'],
      userCount: 150,
      isActive: true,
      createdAt: '2024-01-01'
    },
    {
      id: '6',
      name: 'renter',
      description: 'Equipment renters with booking capabilities',
      permissions: ['booking:create', 'booking:read', 'equipment:read', 'payment:create', 'payment:read'],
      userCount: 320,
      isActive: true,
      createdAt: '2024-01-01'
    }
  ]);

  // Mock audit log data
  const mockAuditLogs: AuditLogEntry[] = [
    {
      id: '1',
      timestamp: '2024-01-15 14:30:00',
      adminName: 'Ahmed Al-Rashid',
      adminId: 'admin1',
      action: 'Approved',
      target: 'Equipment Listing #EQ-2024-001',
      targetType: 'equipment',
      details: 'Approved Caterpillar 320D excavator for owner Ahmed Mohammed',
      ipAddress: '192.168.1.100',
      success: true
    },
    {
      id: '2',
      timestamp: '2024-01-15 13:45:00',
      adminName: 'Sara Mohammed',
      adminId: 'admin2',
      action: 'Updated',
      target: 'User Profile: Khalid Nasser',
      targetType: 'user',
      details: 'Updated user verification status to verified',
      ipAddress: '192.168.1.101',
      success: true
    },
    {
      id: '3',
      timestamp: '2024-01-15 12:20:00',
      adminName: 'Omar Abdullah',
      adminId: 'admin3',
      action: 'Rejected',
      target: 'Booking Request #BK-2024-045',
      targetType: 'booking',
      details: 'Rejected booking due to incomplete documentation',
      ipAddress: '192.168.1.102',
      success: true
    },
    {
      id: '4',
      timestamp: '2024-01-15 11:15:00',
      adminName: 'Fatima Ali',
      adminId: 'admin4',
      action: 'Deactivated',
      target: 'User Account: Suspicious User',
      targetType: 'user',
      details: 'Deactivated account due to policy violation',
      ipAddress: '192.168.1.103',
      success: true
    },
    {
      id: '5',
      timestamp: '2024-01-15 10:30:00',
      adminName: 'Khalid Nasser',
      adminId: 'admin5',
      action: 'Cancelled',
      target: 'Platform Fee Update',
      targetType: 'system',
      details: 'Cancelled platform fee update operation',
      ipAddress: '192.168.1.104',
      success: false
    }
  ];

  const handleSettingChange = (key: keyof AdminSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = () => {
    console.log('Saving settings:', settings);
    // API call to save settings would go here
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'approved': return <FontAwesomeIcon icon={faCheck} className="h-4 w-4 text-green-400" />;
      case 'rejected': return <FontAwesomeIcon icon={faTimes} className="h-4 w-4 text-red-400" />;
      case 'updated': return <FontAwesomeIcon icon={faEdit} className="h-4 w-4 text-blue-400" />;
      case 'deactivated': return <FontAwesomeIcon icon={faTrash} className="h-4 w-4 text-orange-400" />;
      case 'cancelled': return <FontAwesomeIcon icon={faTimes} className="h-4 w-4 text-gray-400" />;
      default: return <FontAwesomeIcon icon={faCog} className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTargetTypeIcon = (type: string) => {
    switch (type) {
      case 'user': return <FontAwesomeIcon icon={faUser} className="h-4 w-4 text-blue-400" />;
      case 'equipment': return <FontAwesomeIcon icon={faTruck} className="h-4 w-4 text-green-400" />;
      case 'booking': return <FontAwesomeIcon icon={faFileContract} className="h-4 w-4 text-purple-400" />;
      case 'document': return <FontAwesomeIcon icon={faFile} className="h-4 w-4 text-yellow-400" />;
      case 'system': return <FontAwesomeIcon icon={faCog} className="h-4 w-4 text-gray-400" />;
      default: return <FontAwesomeIcon icon={faBuilding} className="h-4 w-4 text-gray-400" />;
    }
  };

  const getRoleColor = (roleName: string) => {
    const colors: Record<string, string> = {
      'super_admin': 'bg-red-600',
      'booking_admin': 'bg-blue-600',
      'content_admin': 'bg-green-600',
      'support_agent': 'bg-yellow-600',
      'owner': 'bg-purple-600',
      'renter': 'bg-indigo-600'
    };
    return colors[roleName] || 'bg-gray-600';
  };

  const ToggleSwitch = ({ enabled, onChange, label }: { enabled: boolean; onChange: (value: boolean) => void; label: string }) => (
    <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
      <label className="text-sm font-medium text-gray-300">{label}</label>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-blue-600' : 'bg-gray-600'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  const NumberInput = ({ 
    label, 
    value, 
    onChange, 
    min = 0, 
    max = 100, 
    step = 1, 
    suffix = '' 
  }: { 
    label: string; 
    value: number; 
    onChange: (value: number) => void; 
    min?: number; 
    max?: number; 
    step?: number; 
    suffix?: string;
  }) => (
    <div className="p-4 bg-gray-700 rounded-lg">
      <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
      <div className="flex items-center">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          min={min}
          max={max}
          step={step}
          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
        />
        {suffix && <span className="ml-2 text-gray-400">{suffix}</span>}
      </div>
    </div>
  );

  return (
    <SuperAdminOnly fallback={
      <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
        <div className="max-w-2xl mx-auto p-8 bg-gray-800 border border-gray-700 rounded-xl text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h1>
          <p className="text-gray-300 mb-4">You need super admin privileges to access admin settings.</p>
          <div className="text-sm text-gray-400">
            Current user: {user?.email || 'Not logged in'}<br/>
            Current role: {user?.role || 'No role'}<br/>
            Permissions: {permissions.length} total
          </div>
        </div>
      </div>
    }>
      <div className={`min-h-screen bg-gray-900 ${isRTL ? 'font-arabic' : 'font-montserrat'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              {isRTL ? 'إعدادات الإدارة وسجل التدقيق' : 'Admin Settings & Audit Log'}
            </h1>
            <p className="text-gray-400">
              {isRTL ? 'تكوين القواعد على مستوى النظام ومراقبة جميع أنشطة الإدارة' : 'Configure system-wide rules and monitor all admin activities'}
            </p>
            {/* Display current user info */}
            <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
              <p className="text-sm text-gray-300">
                <strong>Current Admin:</strong> {user?.email || 'Unknown'} | 
                <strong> Role:</strong> {user?.role || 'Unknown'} | 
                <strong> Permissions:</strong> {permissions.length}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg">
            <div className="border-b border-gray-700">
              <nav className={cn("-mb-px flex space-x-4 px-6 overflow-x-auto", isRTL && "space-x-reverse")}>  
                {[
                  { id: 'platform-fees', label: isRTL ? 'رسوم المنصة' : 'Platform Fees', icon: faDollarSign },
                  { id: 'chat-settings', label: isRTL ? 'إعدادات الدردشة' : 'Chat Settings', icon: faComments },
                  { id: 'roles', label: isRTL ? 'إدارة الأدوار' : 'Role Management', icon: faUsers },
                  { id: 'permissions', label: isRTL ? 'صلاحيات الأدوار' : 'Permissions Matrix', icon: faUserShield },
                  { id: 'audit', label: isRTL ? 'سجل التدقيق' : 'Audit Log', icon: faClipboardList }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-3 border-b-2 font-medium text-sm flex items-center whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-blue-700 text-blue-400'
                        : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                    }`}
                  >
                    <FontAwesomeIcon icon={tab.icon} className={`${isRTL ? 'ml-2' : 'mr-2'}`} />  
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {/* Platform Fees Tab */}
              {activeTab === 'platform-fees' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <NumberInput
                      label="Platform Commission Rate"
                      value={settings.platformCommissionRate}
                      onChange={(value) => handleSettingChange('platformCommissionRate', value)}
                      suffix="%"
                      max={50}
                    />
                    <NumberInput
                      label="Requester Service Fee"
                      value={settings.requesterServiceFee}
                      onChange={(value) => handleSettingChange('requesterServiceFee', value)}
                      suffix="%"
                      max={20}
                    />
                    <NumberInput
                      label="Cancellation Penalty Rate"
                      value={settings.cancellationPenaltyRate}
                      onChange={(value) => handleSettingChange('cancellationPenaltyRate', value)}
                      suffix="%"
                      max={100}
                    />
                    <NumberInput
                      label="Wallet Credit Limit"
                      value={settings.walletCreditLimit}
                      onChange={(value) => handleSettingChange('walletCreditLimit', value)}
                      suffix="SAR"
                      max={100000}
                      step={100}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <ToggleSwitch
                      enabled={settings.enableWalletSystem}
                      onChange={(value) => handleSettingChange('enableWalletSystem', value)}
                      label="Enable Wallet System"
                    />
                    <ToggleSwitch
                      enabled={settings.autoApproveEquipment}
                      onChange={(value) => handleSettingChange('autoApproveEquipment', value)}
                      label="Auto-approve Equipment Listings"
                    />
                  </div>

                  <button
                    onClick={saveSettings}
                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FontAwesomeIcon icon={faSave} className={`${isRTL ? 'ml-2' : 'mr-2'}`} />
                    Save Settings
                  </button>
                </div>
              )}

              {/* Chat Settings Tab */}
              {activeTab === 'chat-settings' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <NumberInput
                      label="Max Chat Window Time"
                      value={settings.maxChatWindowTime}
                      onChange={(value) => handleSettingChange('maxChatWindowTime', value)}
                      suffix={settings.chatTimeUnit}
                      max={1440}
                    />
                    <div className="p-4 bg-gray-700 rounded-lg">
                      <label className="block text-sm font-medium text-gray-300 mb-2">Time Unit</label>
                      <select
                        value={settings.chatTimeUnit}
                        onChange={(e) => handleSettingChange('chatTimeUnit', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="minutes">Minutes</option>
                        <option value="hours">Hours</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={saveSettings}
                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FontAwesomeIcon icon={faSave} className={`${isRTL ? 'ml-2' : 'mr-2'}`} />
                    Save Settings
                  </button>
                </div>
              )}

              {/* Roles Management Tab */}
              {activeTab === 'roles' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">
                      {isRTL ? 'إدارة الأدوار' : 'Role Management'}
                    </h3>
                    <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <FontAwesomeIcon icon={faPlus} className={`${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {isRTL ? 'إضافة دور جديد' : 'Add New Role'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {roles.map((role) => (
                      <div key={role.id} className="bg-gray-700 rounded-lg p-6 border border-gray-600">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${getRoleColor(role.name)}`}></div>
                            <h4 className="text-lg font-semibold text-white capitalize">
                              {role.name.replace('_', ' ')}
                            </h4>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button className="p-2 text-gray-400 hover:text-blue-400 transition-colors">
                              <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-red-400 transition-colors">
                              <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <p className="text-gray-300 text-sm mb-4">{role.description}</p>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400 text-sm">Users:</span>
                            <span className="text-white font-medium">{role.userCount}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400 text-sm">Permissions:</span>
                            <span className="text-white font-medium">{role.permissions?.length || 0}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400 text-sm">Status:</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              role.isActive ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                            }`}>
                              {role.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-600">
                          <div className="flex flex-wrap gap-1">
                            {(role.permissions || []).slice(0, 3).map((permission, index) => (
                              <span key={index} className="px-2 py-1 bg-gray-600 text-gray-300 rounded text-xs">
                                {permission}
                              </span>
                            ))}
                            {(role.permissions?.length || 0) > 3 && (
                              <span className="px-2 py-1 bg-gray-600 text-gray-300 rounded text-xs">
                                +{(role.permissions?.length || 0) - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Permissions Tab */}
              {activeTab === 'permissions' && (
                <div className="space-y-6">
                  <div className="text-center p-8 bg-gray-700 rounded-lg">
                    <FontAwesomeIcon icon={faUserShield} className="h-16 w-16 text-blue-400 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Role & Permission Management</h3>
                    <p className="text-gray-400 mb-4">Manage user roles and their associated permissions</p>
                    <div className="text-sm text-gray-300 bg-gray-800 p-4 rounded border">
                      <p><strong>Your Current Permissions:</strong></p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {permissions.slice(0, 10).map((permission, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-600 text-white rounded text-xs">
                            {permission}
                          </span>
                        ))}
                        {permissions.length > 10 && (
                          <span className="px-2 py-1 bg-gray-600 text-gray-300 rounded text-xs">
                            +{permissions.length - 10} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Audit Log Tab */}
              {activeTab === 'audit' && (
                <div className="space-y-6">
                  {/* Filters */}
                  <div className="bg-gray-700 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Audit Log Filters</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
                        <div className="relative">
                          <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search logs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Admin</label>
                        <select
                          value={selectedAdmin}
                          onChange={(e) => setSelectedAdmin(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">All Admins</option>
                          <option value="admin1">Ahmed Al-Rashid</option>
                          <option value="admin2">Sara Mohammed</option>
                          <option value="admin3">Omar Abdullah</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Action</label>
                        <select
                          value={selectedAction}
                          onChange={(e) => setSelectedAction(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">All Actions</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                          <option value="updated">Updated</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
                        <input
                          type="date"
                          value={dateRange.start}
                          onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
                        <input
                          type="date"
                          value={dateRange.end}
                          onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Audit Log Table */}
                  <div className="bg-gray-700 rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-600">
                      <h3 className="text-xl font-bold text-white">Recent Admin Activities</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-600">
                          <tr>
                            <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider text-left">
                              Timestamp
                            </th>
                            <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider text-left">
                              Admin
                            </th>
                            <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider text-left">
                              Action
                            </th>
                            <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider text-left">
                              Target
                            </th>
                            <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider text-left">
                              Details
                            </th>
                            <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider text-left">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-600">
                          {mockAuditLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-gray-600 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                {log.timestamp}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <FontAwesomeIcon icon={faUserShield} className={`h-4 w-4 text-blue-400 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                                  <span className="text-sm text-gray-300">{log.adminName}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  {getActionIcon(log.action)}
                                  <span className={`text-sm text-gray-300 ${isRTL ? 'mr-2' : 'ml-2'}`}>{log.action}</span>  
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  {getTargetTypeIcon(log.targetType)}
                                  <span className={`text-sm text-gray-300 ${isRTL ? 'mr-2' : 'ml-2'}`}>{log.target}</span>  
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-400 max-w-xs truncate">
                                {log.details}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  log.success 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {log.success ? 'Success' : 'Failed'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </SuperAdminOnly>
  );
};

export default AdminSettings; 