'use client';

import React from 'react';
import { Button } from './ui/Button';
import { useApiErrorHandler } from '@/hooks/useApiErrorHandler';

export const TestErrorHandling: React.FC = () => {
  const { handleApiError, error } = useApiErrorHandler();

  const test403Error = () => {
    const error = new Error('Missing required permissions: equipment:list');
    (error as any).status = 403;
    (error as any).statusCode = 403;
    handleApiError(error);
  };

  const test401Error = () => {
    const error = new Error('You are not authorized to access this resource');
    (error as any).status = 401;
    (error as any).statusCode = 401;
    handleApiError(error);
  };

  const test500Error = () => {
    const error = new Error('Internal server error');
    (error as any).status = 500;
    (error as any).statusCode = 500;
    handleApiError(error);
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-bold">Test Error Handling</h2>
      <div className="space-y-2">
        <Button onClick={test403Error} variant="outline">
          Test 403 Error
        </Button>
        <Button onClick={test401Error} variant="outline">
          Test 401 Error
        </Button>
        <Button onClick={test500Error} variant="outline">
          Test 500 Error
        </Button>
      </div>
      
      {/* Show current error state */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">
            <strong>Current Error:</strong> {error.statusCode} - {error.message}
          </p>
        </div>
      )}
    </div>
  );
};
