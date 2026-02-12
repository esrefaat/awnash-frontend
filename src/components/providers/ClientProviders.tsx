'use client';

import React from 'react';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/contexts/AuthContext';
import { AlertProvider } from '@/contexts/AlertContext';
import '@/lib/i18n'; // Initialize i18n

interface ClientProvidersProps {
  children: React.ReactNode;
}

/**
 * Client Providers
 *
 * Composes all client-side providers in the correct order:
 * 1. ThemeProvider - Dark/Light mode via next-themes (outermost)
 * 2. AuthProvider - Authentication state
 * 3. AlertProvider - Toast notifications and confirm dialogs (innermost)
 *
 * i18n is initialized via import (no provider needed).
 * RTL direction is handled automatically via i18n language change event.
 */
export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" storageKey="darkMode" enableSystem>
      <AuthProvider>
        <AlertProvider>
          {children}
        </AlertProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
