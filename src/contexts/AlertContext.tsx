'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

/**
 * Alert Types
 */
export type AlertType = 'success' | 'error' | 'warning' | 'info';

/**
 * Alert Configuration
 */
export interface AlertConfig {
  message: string;
  type?: AlertType;
  title?: string;
  duration?: number; // Auto-dismiss duration in ms (0 = no auto-dismiss)
}

/**
 * Confirm Dialog Configuration
 */
export interface ConfirmConfig {
  message: string;
  title?: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'default' | 'destructive';
}

/**
 * Alert State
 */
interface AlertState extends AlertConfig {
  id: string;
  visible: boolean;
}

/**
 * Confirm State
 */
interface ConfirmState extends ConfirmConfig {
  visible: boolean;
  resolve: ((value: boolean) => void) | null;
}

/**
 * Alert Context Type
 */
interface AlertContextType {
  // Current alerts
  alerts: AlertState[];
  
  // Show alert (pass object, not separate arguments)
  showAlert: (config: AlertConfig) => void;
  
  // Convenience methods
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
  
  // Dismiss alert
  dismissAlert: (id: string) => void;
  
  // Confirm dialog (returns promise)
  showConfirm: (config: ConfirmConfig) => Promise<boolean>;
  
  // Current confirm state
  confirmState: ConfirmState | null;
  
  // Handle confirm response
  handleConfirmResponse: (confirmed: boolean) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

interface AlertProviderProps {
  children: ReactNode;
}

/**
 * Generate unique ID for alerts
 */
function generateId(): string {
  return `alert-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function AlertProvider({ children }: AlertProviderProps) {
  const [alerts, setAlerts] = useState<AlertState[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

  /**
   * Show alert with configuration object
   * IMPORTANT: Always pass an object, not separate arguments
   */
  const showAlert = useCallback((config: AlertConfig) => {
    const id = generateId();
    const alert: AlertState = {
      id,
      visible: true,
      type: config.type || 'info',
      message: config.message,
      title: config.title,
      duration: config.duration ?? 5000, // Default 5 seconds
    };

    setAlerts(prev => [...prev, alert]);

    // Auto-dismiss if duration is set
    if (alert.duration && alert.duration > 0) {
      setTimeout(() => {
        dismissAlert(id);
      }, alert.duration);
    }
  }, []);

  /**
   * Convenience method for success alerts
   */
  const showSuccess = useCallback((message: string, title?: string) => {
    showAlert({ message, title, type: 'success' });
  }, [showAlert]);

  /**
   * Convenience method for error alerts
   */
  const showError = useCallback((message: string, title?: string) => {
    showAlert({ message, title, type: 'error', duration: 8000 }); // Errors stay longer
  }, [showAlert]);

  /**
   * Convenience method for warning alerts
   */
  const showWarning = useCallback((message: string, title?: string) => {
    showAlert({ message, title, type: 'warning' });
  }, [showAlert]);

  /**
   * Convenience method for info alerts
   */
  const showInfo = useCallback((message: string, title?: string) => {
    showAlert({ message, title, type: 'info' });
  }, [showAlert]);

  /**
   * Dismiss alert by ID
   */
  const dismissAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);

  /**
   * Show confirm dialog and return promise
   */
  const showConfirm = useCallback((config: ConfirmConfig): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({
        visible: true,
        message: config.message,
        title: config.title || 'Confirm',
        confirmText: config.confirmText || 'Confirm',
        cancelText: config.cancelText || 'Cancel',
        confirmVariant: config.confirmVariant || 'default',
        resolve,
      });
    });
  }, []);

  /**
   * Handle confirm dialog response
   */
  const handleConfirmResponse = useCallback((confirmed: boolean) => {
    if (confirmState?.resolve) {
      confirmState.resolve(confirmed);
    }
    setConfirmState(null);
  }, [confirmState]);

  const value: AlertContextType = {
    alerts,
    showAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    dismissAlert,
    showConfirm,
    confirmState,
    handleConfirmResponse,
  };

  return (
    <AlertContext.Provider value={value}>
      {children}
    </AlertContext.Provider>
  );
}

/**
 * Hook to use alert context
 * 
 * @example
 * ```tsx
 * const { showAlert, showSuccess, showError, showConfirm } = useAlert();
 * 
 * // Show alert (always pass object)
 * showAlert({ message: 'Operation completed', type: 'success' });
 * 
 * // Convenience methods
 * showSuccess('Saved successfully');
 * showError('Failed to save');
 * 
 * // Confirm dialog
 * const confirmed = await showConfirm({ 
 *   message: 'Are you sure you want to delete?',
 *   confirmVariant: 'destructive' 
 * });
 * if (confirmed) { ... }
 * ```
 */
export function useAlert(): AlertContextType {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}
