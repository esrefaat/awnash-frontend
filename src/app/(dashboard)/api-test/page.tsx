'use client';

import React, { useState } from 'react';
import { usersService } from '@/services/usersService';
import { apiService } from '@/services/api';

const ApiTestPage: React.FC = () => {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testHealthCheck = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3007/v1'}`);
      const data = await response.json();
      setResult(`Health Check: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setResult(`Health Check Error: ${error}`);
    }
    setLoading(false);
  };

  const testUsers = async () => {
    setLoading(true);
    try {
      const response = await usersService.getAllUsers();
      setResult(`Users API: ${JSON.stringify(response, null, 2)}`);
    } catch (error) {
      setResult(`Users API Error: ${error}`);
    }
    setLoading(false);
  };

  const testAuth = async () => {
    setLoading(true);
    try {
      const response = await apiService.get('/auth/profile');
      setResult(`Auth Test: ${JSON.stringify(response, null, 2)}`);
    } catch (error) {
      setResult(`Auth Test Error: ${error}`);
    }
    setLoading(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">API Connection Test</h1>
      
      <div className="space-y-4 mb-6">
        <button
          onClick={testHealthCheck}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Test Health Check
        </button>
        
        <button
          onClick={testUsers}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 ml-4"
        >
          Test Users API
        </button>
        
        <button
          onClick={testAuth}
          disabled={loading}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50 ml-4"
        >
          Test Auth API
        </button>
      </div>

      {loading && <p>Loading...</p>}
      
      <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
        {result || 'Click a button to test API connection'}
      </pre>
    </div>
  );
};

export default ApiTestPage; 