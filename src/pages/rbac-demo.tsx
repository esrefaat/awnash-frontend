import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { usePermissions, usePermission } from '@/hooks/usePermissions';
import { 
  PermissionGuard, 
  AdminOnly, 
  SuperAdminOnly, 
  OwnerOnly,
  RenterOnly 
} from '@/components/PermissionGuard';
import { authService } from '@/services/authService';

const RBACDemo: React.FC = () => {
  const { 
    permissions, 
    roles, 
    user, 
    isAuthenticated,
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAllPermissions 
  } = usePermissions();

  const [testResults, setTestResults] = useState<Record<string, boolean>>({});
  const [loginForm, setLoginForm] = useState({ mobile_number: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  // Check backend status on component mount
  useEffect(() => {
    checkBackendStatus();
  }, []);

  const checkBackendStatus = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3007/api/v1'}/healthz`);
      if (response.ok) {
        setBackendStatus('online');
      } else {
        setBackendStatus('offline');
      }
    } catch (error) {
      setBackendStatus('offline');
    }
  };

  // Individual permission hooks
  const canCreateEquipment = usePermission('equipment:create');
  const canManageUsers = usePermission('user:create');
  const canViewDashboard = usePermission('dashboard:view');

  const testPermission = (permission: string) => {
    const result = hasPermission(permission);
    setTestResults(prev => ({ ...prev, [permission]: result }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError('');

    try {
      await authService.login({
        mobile_number: loginForm.mobile_number,
        password: loginForm.password
      });
      // If we get here, login was successful
      window.location.reload();
    } catch (error: any) {
      setLoginError(error.message || 'Network error. Please check if the backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      window.location.reload();
    } catch (error) {
      // Fallback logout
      localStorage.removeItem('access_token');
      localStorage.removeItem('admin-user');
      window.location.reload();
    }
  };

  // Dark mode theme wrapper
  const DarkModeWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {children}
    </div>
  );

  // Authentication form for real API login
  const AuthenticationForm = () => (
    <Card className="max-w-md mx-auto p-6 bg-gray-800 border-gray-700">
      <h2 className="text-xl font-semibold mb-4 text-gray-100">RBAC System - Real Authentication</h2>
      
      {/* Backend Status Indicator */}
      <div className="mb-4 p-3 rounded-lg border border-gray-600">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-300">Backend Status:</span>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              backendStatus === 'online' ? 'bg-green-500' : 
              backendStatus === 'offline' ? 'bg-red-500' : 'bg-yellow-500'
            }`} />
            <span className="text-sm text-gray-300 capitalize">{backendStatus}</span>
          </div>
        </div>
        {backendStatus === 'offline' && (
          <p className="text-xs text-red-400 mt-2">
            Backend server is not responding. Please start the backend server.
          </p>
        )}
      </div>

      {backendStatus === 'online' ? (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="mobile_number" className="text-gray-300">Mobile Number</Label>
            <Input
              id="mobile_number"
              type="text"
              placeholder="+966500000001"
              value={loginForm.mobile_number}
              onChange={(e) => setLoginForm(prev => ({ ...prev, mobile_number: e.target.value }))}
              className="bg-gray-700 border-gray-600 text-gray-100 placeholder:text-gray-400"
              required
            />
          </div>
          <div>
            <Label htmlFor="password" className="text-gray-300">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter password"
              value={loginForm.password}
              onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
              className="bg-gray-700 border-gray-600 text-gray-100 placeholder:text-gray-400"
              required
            />
          </div>
          
          {loginError && (
            <div className="p-3 bg-red-900/50 border border-red-700 rounded text-red-300 text-sm">
              {loginError}
            </div>
          )}

          <Button 
            type="submit" 
            disabled={isLoading || backendStatus !== 'online'}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      ) : (
        <div className="space-y-4">
          <Button 
            onClick={checkBackendStatus}
            variant="outline"
            className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Retry Connection
          </Button>
        </div>
      )}

      <div className="mt-6 p-3 bg-blue-900/30 border border-blue-700 rounded-lg">
        <p className="text-xs text-blue-300 mb-2">
          <strong>Test Credentials:</strong>
        </p>
        <div className="space-y-1 text-xs text-blue-300">
          <p><strong>Admin:</strong> +966500000001 / admin123456</p>
          <p><strong>Owner:</strong> +966500000002 / owner123456</p>
          <p><strong>Renter:</strong> +966500000003 / renter123456</p>
        </div>
      </div>
    </Card>
  );

  if (!isAuthenticated) {
    return (
      <DarkModeWrapper>
        <div className="container mx-auto p-6">
          <h1 className="text-3xl font-bold mb-6 text-center text-gray-100">
            RBAC Permission System Demo
          </h1>
          <AuthenticationForm />
        </div>
      </DarkModeWrapper>
    );
  }

  return (
    <DarkModeWrapper>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-100">RBAC Permission System Demo</h1>
            <p className="text-gray-400">
              This page demonstrates the hybrid RBAC + JWT-based permission system with real API integration.
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Logout
          </Button>
        </div>

        {/* User Information */}
        <Card className="p-6 bg-gray-800 border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-gray-100">Current User Information</h2>
          {user && (
            <div className="space-y-2">
              <p className="text-gray-300"><strong>ID:</strong> {user.id}</p>
              <p className="text-gray-300"><strong>Email:</strong> {user.email}</p>
              <p className="text-gray-300"><strong>Primary Role:</strong> <Badge variant="outline" className="border-gray-600 text-gray-300">{user.role}</Badge></p>
              
              <div className="space-y-2">
                <p className="text-gray-300"><strong>All Roles:</strong></p>
                <div className="flex flex-wrap gap-2">
                  {roles.length > 0 ? (
                    roles.map(role => (
                      <Badge key={role} variant="secondary" className="bg-gray-700 text-gray-300">
                        {role}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-gray-500">No additional roles</span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-gray-300"><strong>Permissions ({permissions.length}):</strong></p>
                <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                  {permissions.length > 0 ? (
                    permissions.map(permission => (
                      <Badge key={permission} variant="outline" className="text-xs border-gray-600 text-gray-400">
                        {permission}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-gray-500">No permissions found</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Permission Testing Section */}
        <Card className="p-6 bg-gray-800 border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-gray-100">Permission Testing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              'equipment:create',
              'equipment:read',
              'equipment:update',
              'equipment:delete',
              'equipment:approve',
              'user:create',
              'user:read',
              'user:update',
              'user:delete',
              'booking:create',
              'booking:read',
              'booking:approve',
              'payment:create',
              'payment:read',
              'dashboard:view',
              'analytics:view',
              'roles:manage',
              'system:configure'
            ].map(permission => (
              <div key={permission} className="flex items-center justify-between p-3 border border-gray-600 rounded-lg bg-gray-750">
                <span className="font-mono text-sm text-gray-300">{permission}</span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => testPermission(permission)}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Test
                  </Button>
                  {testResults[permission] !== undefined && (
                    <Badge variant={testResults[permission] ? 'default' : 'destructive'}>
                      {testResults[permission] ? '✓' : '✗'}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Hook Usage Examples */}
        <Card className="p-6 bg-gray-800 border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-gray-100">Hook Usage Examples</h2>
          <div className="space-y-4">
            <div className="p-4 border border-gray-600 rounded-lg bg-gray-750">
              <h3 className="font-semibold mb-2 text-gray-200">usePermission() Hook</h3>
              <div className="space-y-2">
                <p className="text-gray-300">Can Create Equipment: <Badge variant={canCreateEquipment ? 'default' : 'destructive'}>{canCreateEquipment ? 'Yes' : 'No'}</Badge></p>
                <p className="text-gray-300">Can Manage Users: <Badge variant={canManageUsers ? 'default' : 'destructive'}>{canManageUsers ? 'Yes' : 'No'}</Badge></p>
                <p className="text-gray-300">Can View Dashboard: <Badge variant={canViewDashboard ? 'default' : 'destructive'}>{canViewDashboard ? 'Yes' : 'No'}</Badge></p>
              </div>
            </div>

            <div className="p-4 border border-gray-600 rounded-lg bg-gray-750">
              <h3 className="font-semibold mb-2 text-gray-200">Compound Permission Checks</h3>
              <div className="space-y-2">
                <p className="text-gray-300">Has ANY user permission: <Badge variant={hasAnyPermission(['user:create', 'user:read', 'user:update']) ? 'default' : 'destructive'}>{hasAnyPermission(['user:create', 'user:read', 'user:update']) ? 'Yes' : 'No'}</Badge></p>
                <p className="text-gray-300">Has ALL equipment permissions: <Badge variant={hasAllPermissions(['equipment:create', 'equipment:read', 'equipment:update']) ? 'default' : 'destructive'}>{hasAllPermissions(['equipment:create', 'equipment:read', 'equipment:update']) ? 'Yes' : 'No'}</Badge></p>
              </div>
            </div>
          </div>
        </Card>

        {/* Component-Based Permission Guards */}
        <Card className="p-6 bg-gray-800 border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-gray-100">Component-Based Permission Guards</h2>
          <div className="space-y-4">
            
            <div className="p-4 border border-gray-600 rounded-lg bg-gray-750">
              <h3 className="font-semibold mb-2 text-gray-200">Permission-Based Rendering</h3>
              
              <PermissionGuard permission="equipment:create">
                <div className="p-3 bg-green-900/30 border border-green-700 rounded text-green-300 mb-3">
                  ✅ You can see this because you have 'equipment:create' permission
                </div>
              </PermissionGuard>

              <PermissionGuard permission="system:configure" fallback={
                <div className="p-3 bg-red-900/30 border border-red-700 rounded text-red-300 mb-3">
                  ❌ You cannot see the system configuration section (missing 'system:configure' permission)
                </div>
              }>
                <div className="p-3 bg-green-900/30 border border-green-700 rounded text-green-300 mb-3">
                  ✅ You can see this because you have 'system:configure' permission
                </div>
              </PermissionGuard>

              <PermissionGuard 
                permissions={['user:create', 'user:update']} 
                requireAll={false}
                fallback={<p className="text-red-400 mb-3">❌ You need either user:create OR user:update permission</p>}
              >
                <div className="p-3 bg-blue-900/30 border border-blue-700 rounded text-blue-300 mb-3">
                  ✅ You have at least one user management permission
                </div>
              </PermissionGuard>
            </div>

            <div className="p-4 border border-gray-600 rounded-lg bg-gray-750">
              <h3 className="font-semibold mb-2 text-gray-200">Role-Based Components</h3>
              
              <SuperAdminOnly fallback={<p className="text-orange-400 mb-3">⚠️ Super Admin only section hidden</p>}>
                <div className="p-3 bg-purple-900/30 border border-purple-700 rounded text-purple-300 mb-3">
                  👑 Super Admin Only Section - Ultra Restricted!
                </div>
              </SuperAdminOnly>

              <AdminOnly fallback={<p className="text-orange-400 mb-3">⚠️ Admin only section hidden</p>}>
                <div className="p-3 bg-blue-900/30 border border-blue-700 rounded text-blue-300 mb-3">
                  🛡️ Admin Only Section - Management Tools
                </div>
              </AdminOnly>

              <OwnerOnly fallback={<p className="text-orange-400 mb-3">⚠️ Equipment owner section hidden</p>}>
                <div className="p-3 bg-green-900/30 border border-green-700 rounded text-green-300 mb-3">
                  🏭 Equipment Owner Section - List & Manage Equipment
                </div>
              </OwnerOnly>

              <RenterOnly fallback={<p className="text-orange-400 mb-3">⚠️ Renter section hidden</p>}>
                <div className="p-3 bg-yellow-900/30 border border-yellow-700 rounded text-yellow-300 mb-3">
                  🚜 Renter Section - Browse & Book Equipment
                </div>
              </RenterOnly>
            </div>
          </div>
        </Card>

        {/* API Integration Status */}
        <Card className="p-6 bg-gray-800 border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-gray-100">API Integration Status</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-gray-600 rounded bg-gray-750">
              <span className="text-gray-300">Backend Connection</span>
              <Badge variant={backendStatus === 'online' ? 'default' : 'destructive'}>
                {backendStatus === 'online' ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 border border-gray-600 rounded bg-gray-750">
              <span className="text-gray-300">Authentication Method</span>
              <Badge variant="default">JWT + HTTP-Only Cookies</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border border-gray-600 rounded bg-gray-750">
              <span className="text-gray-300">Permission Source</span>
              <Badge variant="default">Database + JWT Payload</Badge>
            </div>
          </div>
        </Card>
      </div>
    </DarkModeWrapper>
  );
};

export default RBACDemo; 