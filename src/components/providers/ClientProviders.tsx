'use client';

import React from 'react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { DarkModeProvider } from '@/contexts/DarkModeContext';
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
 * 1. DarkModeProvider - Theme management (outermost)
 * 2. LanguageProvider - i18n and RTL support
 * 3. AuthProvider - Authentication state
 * 4. AlertProvider - Toast notifications and confirm dialogs (innermost)
 * 
 * This composition pattern ensures providers are properly nested
 * and can access each other's context when needed.
 */
export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <DarkModeProvider>
      <LanguageProvider>
        <AuthProvider>
          <AlertProvider>
            {children}
          </AlertProvider>
        </AuthProvider>
      </LanguageProvider>
    </DarkModeProvider>
  );
} 