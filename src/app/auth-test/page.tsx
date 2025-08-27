'use client';

import { useState, useEffect } from 'react';

export default function AuthTestPage() {
  const [authStatus, setAuthStatus] = useState<any>(null);
  const [permissionsStatus, setPermissionsStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testAuth = async () => {
      try {
        // Test /auth/me endpoint
        console.log('Testing /auth/me endpoint...');
        const authResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/me`, {
          method: 'GET',
          credentials: 'include',
        });

        console.log('Auth response status:', authResponse.status);
        
        if (authResponse.ok) {
          const authData = await authResponse.json();
          setAuthStatus({ success: true, data: authData });
          console.log('Auth data:', authData);

          // Test permissions endpoint
          console.log('Testing /permissions endpoint...');
          const permissionsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/permissions`, {
            method: 'GET',
            credentials: 'include',
          });

          console.log('Permissions response status:', permissionsResponse.status);
          
          if (permissionsResponse.ok) {
            const permissionsData = await permissionsResponse.json();
            setPermissionsStatus({ success: true, data: permissionsData });
            console.log('Permissions data:', permissionsData);
          } else {
            const errorText = await permissionsResponse.text();
            setPermissionsStatus({ success: false, error: errorText, status: permissionsResponse.status });
          }
        } else {
          const errorText = await authResponse.text();
          setAuthStatus({ success: false, error: errorText, status: authResponse.status });
        }
      } catch (error) {
        console.error('Test error:', error);
        setAuthStatus({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      } finally {
        setLoading(false);
      }
    };

    testAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <h1 className="text-2xl font-bold mb-4">Authentication Test</h1>
        <p>Testing authentication...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-6">Authentication Test Results</h1>
      
      <div className="space-y-6">
        {/* Auth Status */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Authentication Status (/auth/me)</h2>
          {authStatus?.success ? (
            <div>
              <p className="text-green-400 mb-2">✅ Authenticated</p>
              <pre className="bg-gray-700 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(authStatus.data, null, 2)}
              </pre>
            </div>
          ) : (
            <div>
              <p className="text-red-400 mb-2">❌ Not Authenticated</p>
              <p className="text-gray-300">Status: {authStatus?.status}</p>
              <p className="text-gray-300">Error: {authStatus?.error}</p>
            </div>
          )}
        </div>

        {/* Permissions Status */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Permissions Status (/permissions)</h2>
          {permissionsStatus?.success ? (
            <div>
              <p className="text-green-400 mb-2">✅ Permissions Loaded</p>
              <p className="text-gray-300 mb-2">
                Permissions Count: {permissionsStatus.data?.data?.permissions?.length || 0}
              </p>
              <pre className="bg-gray-700 p-4 rounded text-sm overflow-auto max-h-64">
                {JSON.stringify(permissionsStatus.data, null, 2)}
              </pre>
            </div>
          ) : (
            <div>
              <p className="text-red-400 mb-2">❌ Permissions Failed</p>
              <p className="text-gray-300">Status: {permissionsStatus?.status}</p>
              <p className="text-gray-300">Error: {permissionsStatus?.error}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="space-x-4">
            <a 
              href="/auth/login" 
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white"
            >
              Go to Login
            </a>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-white"
            >
              Refresh Test
            </button>
            <a 
              href="/settings/roles-permissions" 
              className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded text-white"
            >
              Go to Roles Page
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 