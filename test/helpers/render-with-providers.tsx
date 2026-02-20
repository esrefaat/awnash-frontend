import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { AlertProvider } from '@/contexts/AlertContext';

/**
 * Minimal test wrapper that provides AlertProvider without AuthProvider
 * (AuthProvider makes a network call on mount which complicates tests).
 * For tests needing auth, mock useAuth directly.
 */
function TestProviders({ children }: { children: React.ReactNode }) {
  return <AlertProvider>{children}</AlertProvider>;
}

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: TestProviders, ...options });
}

export { TestProviders };
