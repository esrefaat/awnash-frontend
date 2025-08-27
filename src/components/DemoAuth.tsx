import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface DemoUser {
  id: string;
  email: string;
  mobile_number: string;
  role: string;
  roles: string[];
  permissions: string[];
  full_name: string;
  is_verified: boolean;
}

const DEMO_USERS: { [key: string]: DemoUser } = {
  admin: {
    id: '8468611b-cfde-4818-ad13-0ccc861ac062',
    email: 'admin@awnash.net',
    mobile_number: '+966500000001',
    role: 'super_admin',
    roles: ['super_admin'],
    permissions: [
      'booking:read', 'booking:approve', 'user:delete', 'user:create',
      'user:list', 'booking:update', 'analytics:view', 'reports:generate',
      'payment:list', 'equipment:approve', 'payment:update', 'lead:read',
      'lead:delete', 'equipment:delete', 'booking:list', 'lead:convert',
      'booking:create', 'audit:view', 'user:verify', 'roles:manage',
      'system:configure', 'payment:read', 'lead:update', 'equipment:update',
      'booking:delete', 'user:update', 'user:read', 'payment:create',
      'payment:refund', 'dashboard:view', 'equipment:list', 'lead:create',
      'equipment:create', 'equipment:read', 'lead:list'
    ],
    full_name: 'Admin User',
    is_verified: true,
  },
  owner: {
    id: 'owner-uuid-12345',
    email: 'owner@awnash.net',
    mobile_number: '+966500000002',
    role: 'owner',
    roles: ['owner'],
    permissions: [
      'equipment:create', 'equipment:read', 'equipment:update', 'equipment:list',
      'booking:read', 'booking:update', 'booking:list',
      'payment:read', 'payment:list', 'dashboard:view'
    ],
    full_name: 'Equipment Owner',
    is_verified: true,
  },
  renter: {
    id: 'c2c711a4-2bc0-4dbb-b644-70d9ec969754',
    email: 'renter@awnash.net',
    mobile_number: '+966500000003',
    role: 'renter',
    roles: ['renter'],
    permissions: [
      'booking:read', 'booking:list', 'booking:create',
      'payment:read', 'payment:create',
      'equipment:list', 'equipment:read'
    ],
    full_name: 'Equipment Renter',
    is_verified: true,
  },
};

interface DemoAuthProps {
  onLogin: (user: DemoUser) => void;
}

export const DemoAuth: React.FC<DemoAuthProps> = ({ onLogin }) => {
  const [selectedUser, setSelectedUser] = useState<string>('');

  const handleLogin = () => {
    if (selectedUser && DEMO_USERS[selectedUser]) {
      const user = DEMO_USERS[selectedUser];
      
      // Create a mock JWT token for demo purposes
      const mockJwtPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        roles: user.roles,
        permissions: user.permissions,
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours from now
      };

      // Encode as base64 (not secure, just for demo)
      const mockToken = btoa(JSON.stringify(mockJwtPayload));
      
      // Store in localStorage for the demo
      localStorage.setItem('access_token', `header.${mockToken}.signature`);
      localStorage.setItem('admin-user', JSON.stringify(user));
      
      onLogin(user);
    }
  };

  return (
    <Card className="max-w-md mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4">Demo Login - RBAC System</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Choose a demo user to test the RBAC permission system:
      </p>
      
      <div className="space-y-3 mb-4">
        {Object.entries(DEMO_USERS).map(([key, user]) => (
          <div
            key={key}
            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
              selectedUser === key 
                ? 'border-primary bg-primary/5' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedUser(key)}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{user.full_name}</span>
              <Badge variant="outline">{user.role}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {user.permissions.length} permissions
            </p>
          </div>
        ))}
      </div>

      <Button 
        onClick={handleLogin} 
        disabled={!selectedUser}
        className="w-full"
      >
        Login as {selectedUser ? DEMO_USERS[selectedUser].full_name : 'Selected User'}
      </Button>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-700">
          <strong>Note:</strong> This is a demo mode. In production, authentication 
          would go through the secure backend API with proper JWT tokens and HTTP-only cookies.
        </p>
      </div>
    </Card>
  );
}; 