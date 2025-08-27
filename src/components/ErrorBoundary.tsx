'use client';

import React, { Component, ReactNode } from 'react';
import { ErrorPage } from './ErrorPage';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  statusCode?: number;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Check if it's an API error with status code
    if (error.message.includes('403') || error.message.includes('Forbidden')) {
      return { hasError: true, error, statusCode: 403 };
    }
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      return { hasError: true, error, statusCode: 401 };
    }
    if (error.message.includes('404') || error.message.includes('Not Found')) {
      return { hasError: true, error, statusCode: 404 };
    }
    if (error.message.includes('500') || error.message.includes('Server Error')) {
      return { hasError: true, error, statusCode: 500 };
    }
    
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorPage
          statusCode={this.state.statusCode}
          title={this.state.error?.message}
        />
      );
    }

    return this.props.children;
  }
}

// Hook for handling API errors in functional components
export const useErrorHandler = () => {
  const handleApiError = (error: any, customMessage?: string) => {
    console.error('API Error:', error);
    
    // Check if it's a response error
    if (error?.response?.status) {
      const statusCode = error.response.status;
      const message = error.response?.data?.message || customMessage || error.message;
      
      // You can throw an error to trigger the error boundary
      // or handle it differently based on your needs
      throw new Error(`${statusCode}: ${message}`);
    }
    
    // Handle network errors or other issues
    throw new Error(customMessage || error.message || 'An unexpected error occurred');
  };

  return { handleApiError };
};
