'use client';

import { useState, useCallback } from 'react';

interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}

interface UseApiErrorHandlerReturn {
  error: ApiError | null;
  setError: (error: ApiError | null) => void;
  handleApiError: (error: any) => void;
  clearError: () => void;
  showErrorPage: (error: ApiError) => void;
  showInlineError: (error: ApiError) => void;
}

export const useApiErrorHandler = (): UseApiErrorHandlerReturn => {
  const [error, setError] = useState<ApiError | null>(null);

  const handleApiError = useCallback((error: any) => {
    console.error('API Error:', error);
    
    let apiError: ApiError;
    
    // Handle different error formats
    if (error?.response?.data) {
      // Axios error format
      apiError = {
        statusCode: error.response.status,
        message: error.response.data.message || 'An error occurred',
        error: error.response.data.error
      };
    } else if (error?.status) {
      // Fetch error format
      apiError = {
        statusCode: error.status,
        message: error.message || 'An error occurred',
        error: error.error
      };
    } else if (typeof error === 'string') {
      // String error
      apiError = {
        statusCode: 500,
        message: error,
        error: 'Unknown Error'
      };
    } else if (error?.message) {
      // Plain Error object - check if it's a permission error
      if (error.message.includes('Missing required permissions')) {
        apiError = {
          statusCode: 403,
          message: error.message,
          error: 'Forbidden'
        };
      } else if (error.message.includes('not authorized') || error.message.includes('unauthorized')) {
        apiError = {
          statusCode: 401,
          message: error.message,
          error: 'Unauthorized'
        };
      } else {
        // Generic error
        apiError = {
          statusCode: 500,
          message: error.message,
          error: 'Unknown Error'
        };
      }
    } else {
      // Generic error
      apiError = {
        statusCode: 500,
        message: error?.message || 'An unexpected error occurred',
        error: 'Unknown Error'
      };
    }

    setError(apiError);
    
    // Automatically show inline error for 403/401 errors instead of redirecting
    if (apiError.statusCode === 403 || apiError.statusCode === 401) {
      console.log('Showing inline error for status:', apiError.statusCode);
      showInlineError(apiError);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const showErrorPage = useCallback((error: ApiError) => {
    console.log('showErrorPage called with:', error);
    
    // Store error in sessionStorage for the error page to access
    sessionStorage.setItem('apiError', JSON.stringify(error));
    
    // Navigate to error page - use window.location for more reliable navigation
    const errorUrl = `/error?code=${error.statusCode}&message=${encodeURIComponent(error.message)}`;
    console.log('Navigating to:', errorUrl);
    
    // Use window.location directly for more reliable navigation
    window.location.href = errorUrl;
  }, []);

  // New function to show inline error instead of redirecting
  const showInlineError = useCallback((error: ApiError) => {
    console.log('showInlineError called with:', error);
    setError(error);
  }, []);

  return {
    error,
    setError,
    handleApiError,
    clearError,
    showErrorPage,
    showInlineError
  };
};

// Hook for handling specific permission errors
export const usePermissionErrorHandler = () => {
  const { handleApiError } = useApiErrorHandler();
  
  const handlePermissionError = useCallback((error: any, requiredPermission?: string) => {
    // Check if it's a permission error
    if (error?.response?.data?.message?.includes('Missing required permissions')) {
      const permissionError = {
        statusCode: 403,
        message: `You don't have permission to access this resource.${requiredPermission ? ` Required: ${requiredPermission}` : ''}`,
        error: 'Forbidden'
      };
      
      handleApiError(permissionError);
      return true; // Indicates it was a permission error
    }
    
    return false; // Not a permission error
  }, [handleApiError]);

  return { handlePermissionError };
};
