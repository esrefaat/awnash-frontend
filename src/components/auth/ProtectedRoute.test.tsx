import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../../test/helpers/render-with-providers';
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

const mockedUseAuth = useAuth as jest.Mock;

beforeEach(() => {
  mockPush.mockClear();
});

describe('ProtectedRoute', () => {
  it('renders children when authenticated', () => {
    mockedUseAuth.mockReturnValue({
      user: { id: '1', role: 'admin' },
      isAuthenticated: true,
      isLoading: false,
    });

    renderWithProviders(
      <ProtectedRoute>
        <div data-testid="protected-content">Secret</div>
      </ProtectedRoute>,
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('shows loading spinner when isLoading', () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: true,
    });

    renderWithProviders(
      <ProtectedRoute>
        <div>Secret</div>
      </ProtectedRoute>,
    );

    expect(screen.getByText('Checking authentication...')).toBeInTheDocument();
  });

  it('redirects to login when not authenticated', () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });

    renderWithProviders(
      <ProtectedRoute>
        <div data-testid="protected-content">Secret</div>
      </ProtectedRoute>,
    );

    expect(mockPush).toHaveBeenCalledWith('/auth/login');
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('redirects to custom redirectTo path', () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });

    renderWithProviders(
      <ProtectedRoute redirectTo="/custom-login">
        <div>Secret</div>
      </ProtectedRoute>,
    );

    expect(mockPush).toHaveBeenCalledWith('/custom-login');
  });

  it('redirects to /unauthorized when role does not match', () => {
    mockedUseAuth.mockReturnValue({
      user: { id: '1', role: 'renter' },
      isAuthenticated: true,
      isLoading: false,
    });

    renderWithProviders(
      <ProtectedRoute requiredRoles={['admin']}>
        <div data-testid="protected-content">Admin only</div>
      </ProtectedRoute>,
    );

    expect(mockPush).toHaveBeenCalledWith('/unauthorized');
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('renders children when role matches requiredRoles', () => {
    mockedUseAuth.mockReturnValue({
      user: { id: '1', role: 'admin' },
      isAuthenticated: true,
      isLoading: false,
    });

    renderWithProviders(
      <ProtectedRoute requiredRoles={['admin', 'super_admin']}>
        <div data-testid="protected-content">Admin content</div>
      </ProtectedRoute>,
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });
});
