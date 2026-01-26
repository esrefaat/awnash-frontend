'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { usePermissions } from '@/hooks/usePermissions';
import { authService } from '@/services/authService';

const DebugAuth: React.FC = () => {
  const { user, permissions, roles, isAuthenticated } = usePermissions();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const gatherDebugInfo = async () => {
      // Get current user from backend (HTTP-only cookies)
      let currentUser = null;
      let authError = null;
      
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3007/api/v1'}/auth/me`, {
          method: 'GET',
          credentials: 'include',
        });
        if (response.ok) {
          currentUser = await response.json();
        } else {
          authError = `HTTP ${response.status}: ${response.statusText}`;
        }
      } catch (error) {
        console.error('Failed to get current user:', error);
        authError = error instanceof Error ? error.message : 'Network error';
      }
      
      setDebugInfo({
        currentUser,
        authError,
        usePermissionsData: { user, permissions, roles, isAuthenticated },
        allCookies: document.cookie,
        localStorage: {
          // Show any remaining localStorage items for debugging
          adminToken: localStorage.getItem('admin-token'),
          adminUser: localStorage.getItem('admin-user'),
          accessToken: localStorage.getItem('access_token'),
        },
        authenticationMethod: 'HTTP-only Cookies',
        timestamp: new Date().toISOString()
      });
    };
    
    gatherDebugInfo();
  }, [user, permissions, roles, isAuthenticated]);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await authService.login({
        mobile_number: '+966500000001',
        password: 'admin123456'
      });
      console.log('Login result:', result);
      
      // Wait a moment then refresh debug info instead of full page reload
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Login failed:', error);
      alert(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOwnerLogin = async () => {
    setIsLoading(true);
    try {
      const result = await authService.login({
        mobile_number: '+966500000002',
        password: 'owner123456'
      });
      console.log('Owner login result:', result);
      
      // Wait a moment then refresh debug info instead of full page reload
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Owner login failed:', error);
      alert(`Owner login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error('Logout failed:', error);
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } finally {
      setIsLoading(false);
    }
  };

  const clearAllAuth = async () => {
    setIsLoading(true);
    try {
      // Call backend logout to clear HTTP-only cookies
      await authService.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
    
    // Clear any legacy localStorage items
    localStorage.removeItem('admin-token');
    localStorage.removeItem('admin-user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    console.log('Cleared all authentication data (HTTP-only cookies + legacy storage)');
    setTimeout(() => {
      window.location.reload();
    }, 500);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-100 mb-4">Authentication Debug</h1>
          <p className="text-gray-400">Debug authentication state and JWT token parsing</p>
          <p className="text-xs text-gray-500 mt-2">Last updated: {debugInfo.timestamp}</p>
        </div>

        {/* Quick Actions */}
        <div className="mb-6 flex flex-wrap gap-4">
          <Button 
            onClick={handleLogin} 
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading ? 'Loading...' : 'Login as Admin'}
          </Button>
          <Button 
            onClick={handleOwnerLogin} 
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? 'Loading...' : 'Login as Owner'}
          </Button>
          <Button 
            onClick={handleLogout} 
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? 'Loading...' : 'Logout'}
          </Button>
          <Button 
            onClick={clearAllAuth} 
            disabled={isLoading}
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            {isLoading ? 'Loading...' : 'Clear All Auth Data'}
          </Button>
        </div>

        {/* Current State Summary */}
        <Card className="bg-gray-800 border-gray-700 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-white">Current Authentication State</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <h3 className="font-semibold text-green-400">Is Authenticated</h3>
              <p className={isAuthenticated ? 'text-green-400' : 'text-red-400'}>
                {isAuthenticated ? 'Yes' : 'No'}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-blue-400">User Role</h3>
              <p className="text-gray-300">{user?.role || 'No role'}</p>
            </div>
            <div>
              <h3 className="font-semibold text-purple-400">Permissions Count</h3>
              <p className="text-gray-300">{permissions.length}</p>
            </div>
            <div>
              <h3 className="font-semibold text-orange-400">Backend Status</h3>
              <p className={debugInfo.authError ? 'text-red-400' : 'text-green-400'}>
                {debugInfo.authError ? 'Error' : 'Connected'}
              </p>
            </div>
          </div>
          {debugInfo.authError && (
            <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded text-red-300 text-sm">
              Backend Error: {debugInfo.authError}
            </div>
          )}
        </Card>

        {/* Detailed Debug Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* usePermissions Hook Data */}
          <Card className="bg-gray-800 border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-4 text-blue-400">usePermissions Hook Data</h2>
            <pre className="text-xs bg-gray-900 p-4 rounded overflow-auto max-h-96 text-gray-300">
              {JSON.stringify({ user, permissions, roles, isAuthenticated }, null, 2)}
            </pre>
          </Card>

          {/* Current User from Backend */}
          <Card className="bg-gray-800 border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-4 text-green-400">Backend User Data (HTTP-only Cookies)</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-sm text-gray-300">Authentication Method</h3>
                <pre className="text-xs bg-gray-900 p-2 rounded text-green-400">
                  {debugInfo.authenticationMethod || 'HTTP-only Cookies'}
                </pre>
              </div>
              
              <div>
                <h3 className="font-semibold text-sm text-gray-300">Current User from /auth/me</h3>
                <pre className="text-xs bg-gray-900 p-2 rounded overflow-auto max-h-48 text-gray-300">
                  {JSON.stringify(debugInfo.currentUser, null, 2)}
                </pre>
              </div>
            </div>
          </Card>

          {/* Legacy Storage (for cleanup) */}
          <Card className="bg-gray-800 border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-4 text-yellow-400">Legacy Storage (Should be Empty)</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-sm text-gray-300">LocalStorage Items</h3>
                <pre className="text-xs bg-gray-900 p-2 rounded overflow-auto max-h-48 text-gray-300">
                  {JSON.stringify(debugInfo.localStorage, null, 2)}
                </pre>
              </div>
            </div>
          </Card>

          {/* All Cookies */}
          <Card className="bg-gray-800 border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-4 text-orange-400">All Cookies</h2>
            <p className="text-sm text-gray-400 mb-2">Note: HTTP-only cookies are not visible here for security</p>
            <pre className="text-xs bg-gray-900 p-4 rounded break-all text-gray-300">
              {debugInfo.allCookies || 'No visible cookies (HTTP-only cookies are hidden)'}
            </pre>
          </Card>
        </div>

        {/* Test Results */}
        <Card className="bg-gray-800 border-gray-700 p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4 text-red-400">Diagnostic Results</h2>
          <div className="space-y-2 text-sm">
            {!isAuthenticated && (
              <div className="text-red-400">❌ User is not authenticated</div>
            )}
            {isAuthenticated && !user && (
              <div className="text-yellow-400">⚠️ Authenticated but no user data</div>
            )}
            {isAuthenticated && user && user.role !== 'super_admin' && (
              <div className="text-yellow-400">⚠️ User role is "{user.role}" instead of "super_admin"</div>
            )}
            {isAuthenticated && user && user.role === 'super_admin' && (
              <div className="text-green-400">✅ User is correctly authenticated as super_admin</div>
            )}
            {permissions.length === 0 && isAuthenticated && (
              <div className="text-yellow-400">⚠️ No permissions found for authenticated user</div>
            )}
            {permissions.length > 0 && (
              <div className="text-green-400">✅ User has {permissions.length} permissions</div>
            )}
            {debugInfo.currentUser && debugInfo.currentUser.role !== user?.role && (
              <div className="text-red-400">❌ Role mismatch: Backend says "{debugInfo.currentUser.role}", usePermissions says "{user?.role}"</div>
            )}
            {debugInfo.currentUser && debugInfo.currentUser.permissions && debugInfo.currentUser.permissions.length !== permissions.length && (
              <div className="text-red-400">❌ Permission count mismatch: Backend has {debugInfo.currentUser.permissions.length}, usePermissions has {permissions.length}</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DebugAuth; 