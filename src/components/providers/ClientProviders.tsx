'use client';

import React from 'react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { DarkModeProvider } from '@/contexts/DarkModeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import '@/lib/i18n'; // Initialize i18n

interface ClientProvidersProps {
  children: React.ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <DarkModeProvider>
      <LanguageProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </LanguageProvider>
    </DarkModeProvider>
  );
} 