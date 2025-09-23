'use client';

import React from 'react';
import { Button } from './ui/Button';
import { Card, CardContent } from './ui/Card';
import { AlertTriangle, Home, ArrowLeft, Shield, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ErrorPageProps {
  statusCode?: number;
  title?: string;
  message?: string;
  showBackButton?: boolean;
  showHomeButton?: boolean;
  customIcon?: React.ReactNode;
  className?: string;
}

export const ErrorPage: React.FC<ErrorPageProps> = ({
  statusCode = 403,
  title,
  message,
  showBackButton = true,
  showHomeButton = true,
  customIcon,
  className = '',
}) => {
  const router = useRouter();

  // Default messages based on status code
  const getDefaultContent = () => {
    switch (statusCode) {
      case 403:
        return {
          title: 'Access Forbidden',
          message: 'You are not authorized to access this page. Please contact your administrator if you believe this is an error.',
          icon: <Shield className="h-16 w-16 text-red-500" />
        };
      case 401:
        return {
          title: 'Unauthorized',
          message: 'Please log in to access this page.',
          icon: <Lock className="h-16 w-16 text-yellow-500" />
        };
      case 404:
        return {
          title: 'Page Not Found',
          message: 'The page you are looking for does not exist.',
          icon: <AlertTriangle className="h-16 w-16 text-blue-500" />
        };
      case 500:
        return {
          title: 'Server Error',
          message: 'Something went wrong on our end. Please try again later.',
          icon: <AlertTriangle className="h-16 w-16 text-red-500" />
        };
      default:
        return {
          title: 'Error',
          message: 'An unexpected error occurred. Please try again.',
          icon: <AlertTriangle className="h-16 w-16 text-gray-500" />
        };
    }
  };

  const defaultContent = getDefaultContent();
  const finalTitle = title || defaultContent.title;
  const finalMessage = message || defaultContent.message;
  const finalIcon = customIcon || defaultContent.icon;

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gray-50 p-4 ${className}`}>
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          {/* Status Code */}
          <div className="mb-6">
            <div className="text-6xl font-bold text-gray-300 mb-2">
              {statusCode}
            </div>
          </div>

          {/* Icon */}
          <div className="mb-6 flex justify-center">
            {finalIcon}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {finalTitle}
          </h1>

          {/* Message */}
          <p className="text-gray-600 mb-8 leading-relaxed">
            {finalMessage}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {showBackButton && (
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </Button>
            )}
            
            {showHomeButton && (
              <Button
                onClick={() => router.push('/')}
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Go Home
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Specific error page components for common use cases
export const ForbiddenPage: React.FC<Omit<ErrorPageProps, 'statusCode'>> = (props) => (
  <ErrorPage statusCode={403} {...props} />
);

export const UnauthorizedPage: React.FC<Omit<ErrorPageProps, 'statusCode'>> = (props) => (
  <ErrorPage statusCode={401} {...props} />
);

export const NotFoundPage: React.FC<Omit<ErrorPageProps, 'statusCode'>> = (props) => (
  <ErrorPage statusCode={404} {...props} />
);

export const ServerErrorPage: React.FC<Omit<ErrorPageProps, 'statusCode'>> = (props) => (
  <ErrorPage statusCode={500} {...props} />
);

