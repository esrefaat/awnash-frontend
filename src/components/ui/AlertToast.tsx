'use client';

import React from 'react';
import { useAlert, AlertType } from '@/contexts/AlertContext';
import { cn } from '@/lib/utils';

/**
 * Icon components for different alert types
 */
const AlertIcons: Record<AlertType, React.ReactNode> = {
  success: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

/**
 * Color classes for different alert types
 */
const alertStyles: Record<AlertType, string> = {
  success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200',
  error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200',
  info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200',
};

const iconStyles: Record<AlertType, string> = {
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-yellow-500',
  info: 'text-blue-500',
};

/**
 * Alert Toast Container
 * 
 * Displays all active alerts as toast notifications.
 * Add this component once in your layout, typically in the root layout.
 * 
 * @example
 * ```tsx
 * // In app/layout.tsx or similar
 * <ClientProviders>
 *   {children}
 *   <AlertToast />
 * </ClientProviders>
 * ```
 */
export function AlertToast() {
  const { alerts, dismissAlert } = useAlert();

  if (alerts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={cn(
            'flex items-start gap-3 p-4 rounded-lg border shadow-lg',
            'animate-in slide-in-from-right duration-300',
            alertStyles[alert.type || 'info']
          )}
          role="alert"
        >
          {/* Icon */}
          <span className={cn('flex-shrink-0', iconStyles[alert.type || 'info'])}>
            {AlertIcons[alert.type || 'info']}
          </span>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            {alert.title && (
              <h4 className="font-medium text-sm mb-1">{alert.title}</h4>
            )}
            <p className="text-sm opacity-90">{alert.message}</p>
          </div>
          
          {/* Dismiss button */}
          <button
            onClick={() => dismissAlert(alert.id)}
            className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
            aria-label="Dismiss"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}

/**
 * Confirm Dialog
 * 
 * Displays a confirmation dialog when showConfirm is called.
 * Add this component once in your layout.
 */
export function ConfirmDialog() {
  const { confirmState, handleConfirmResponse } = useAlert();

  if (!confirmState?.visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={() => handleConfirmResponse(false)}
      />
      
      {/* Dialog */}
      <div className="relative bg-white dark:bg-card rounded-lg shadow-xl max-w-md w-full mx-4 p-6 animate-in zoom-in-95 duration-200">
        {/* Title */}
        <h2 className="text-lg font-semibold text-gray-900 dark:text-foreground mb-2">
          {confirmState.title}
        </h2>
        
        {/* Message */}
        <p className="text-gray-600 dark:text-muted-foreground mb-6">
          {confirmState.message}
        </p>
        
        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => handleConfirmResponse(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-foreground bg-gray-100 dark:bg-muted hover:bg-gray-200 dark:hover:bg-muted/80 rounded-lg transition-colors"
          >
            {confirmState.cancelText}
          </button>
          <button
            onClick={() => handleConfirmResponse(true)}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
              confirmState.confirmVariant === 'destructive'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            )}
          >
            {confirmState.confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Combined Alert Components
 * 
 * Use this to add both toast and confirm dialog to your app.
 */
export function AlertComponents() {
  return (
    <>
      <AlertToast />
      <ConfirmDialog />
    </>
  );
}

export default AlertToast;
