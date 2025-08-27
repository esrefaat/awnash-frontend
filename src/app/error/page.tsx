'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ErrorPage } from '../../components/ErrorPage';

interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}

export default function GlobalErrorPage() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    // Try to get error from URL parameters first
    const code = searchParams?.get('code');
    const message = searchParams?.get('message');
    
    if (code && message) {
      setError({
        statusCode: parseInt(code),
        message: decodeURIComponent(message),
        error: 'API Error'
      });
      return;
    }

    // Try to get error from sessionStorage
    try {
      const storedError = sessionStorage.getItem('apiError');
      if (storedError) {
        const parsedError = JSON.parse(storedError);
        setError(parsedError);
        // Clear the stored error
        sessionStorage.removeItem('apiError');
        return;
      }
    } catch (e) {
      console.error('Error parsing stored error:', e);
    }

    // Default error if nothing is found
    setError({
      statusCode: 404,
      message: 'Page not found or error details not available.',
      error: 'Not Found'
    });
  }, [searchParams]);

  if (!error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <ErrorPage
      statusCode={error.statusCode}
      title={error.error}
      message={error.message}
    />
  );
}
