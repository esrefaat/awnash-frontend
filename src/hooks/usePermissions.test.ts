import { renderHook, waitFor } from '@testing-library/react';
import { setupFetchMock, mockFetchOnce, mockFetchError } from '../../test/helpers/mock-api';
import { usePermissions, usePermission, useAnyPermission, useAllPermissions } from './usePermissions';

let fetchMock: jest.Mock;

beforeEach(() => {
  fetchMock = setupFetchMock();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('usePermissions', () => {
  it('loads permissions on mount', async () => {
    mockFetchOnce(fetchMock, {
      id: 'u1',
      email: 'admin@test.com',
      role: 'admin',
      roles: ['editor'],
      permissions: ['user:read', 'user:write'],
    });

    const { result } = renderHook(() => usePermissions());

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    expect(result.current.user).toEqual({ id: 'u1', email: 'admin@test.com', role: 'admin' });
    expect(result.current.permissions).toEqual(['user:read', 'user:write']);
    expect(result.current.roles).toEqual(['admin', 'editor']);
  });

  it('hasPermission returns true for existing permission', async () => {
    mockFetchOnce(fetchMock, {
      id: 'u1',
      email: 'a@b.com',
      role: 'admin',
      permissions: ['user:read', 'user:write'],
    });

    const { result } = renderHook(() => usePermissions());

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    expect(result.current.hasPermission('user:read')).toBe(true);
    expect(result.current.hasPermission('user:delete')).toBe(false);
  });

  it('hasRole returns true for matching role', async () => {
    mockFetchOnce(fetchMock, {
      id: 'u1',
      email: 'a@b.com',
      role: 'admin',
      roles: ['editor'],
      permissions: [],
    });

    const { result } = renderHook(() => usePermissions());

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    expect(result.current.hasRole('admin')).toBe(true);
    expect(result.current.hasRole('editor')).toBe(true);
    expect(result.current.hasRole('viewer')).toBe(false);
  });

  it('hasAnyPermission returns true if at least one matches', async () => {
    mockFetchOnce(fetchMock, {
      id: 'u1',
      email: 'a@b.com',
      role: 'admin',
      permissions: ['user:read'],
    });

    const { result } = renderHook(() => usePermissions());

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    expect(result.current.hasAnyPermission(['user:read', 'user:delete'])).toBe(true);
    expect(result.current.hasAnyPermission(['user:delete', 'user:create'])).toBe(false);
  });

  it('hasAllPermissions returns true only if all match', async () => {
    mockFetchOnce(fetchMock, {
      id: 'u1',
      email: 'a@b.com',
      role: 'admin',
      permissions: ['user:read', 'user:write'],
    });

    const { result } = renderHook(() => usePermissions());

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    expect(result.current.hasAllPermissions(['user:read', 'user:write'])).toBe(true);
    expect(result.current.hasAllPermissions(['user:read', 'user:delete'])).toBe(false);
  });

  it('handles failed auth (non-ok response)', async () => {
    mockFetchError(fetchMock, 'Unauthorized', 401);

    const { result } = renderHook(() => usePermissions());

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.permissions).toEqual([]);
    expect(result.current.user).toBeNull();
  });

  it('handles network error', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => usePermissions());

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.permissions).toEqual([]);
  });
});

describe('usePermission', () => {
  it('returns boolean for a single permission check', async () => {
    mockFetchOnce(fetchMock, {
      id: 'u1',
      email: 'a@b.com',
      role: 'admin',
      permissions: ['user:read'],
    });

    const { result } = renderHook(() => usePermission('user:read'));

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });
});

describe('useAnyPermission', () => {
  it('returns true if any permission matches', async () => {
    mockFetchOnce(fetchMock, {
      id: 'u1',
      email: 'a@b.com',
      role: 'admin',
      permissions: ['user:read'],
    });

    const { result } = renderHook(() => useAnyPermission(['user:read', 'user:write']));

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });
});

describe('useAllPermissions', () => {
  it('returns false if not all permissions match', async () => {
    mockFetchOnce(fetchMock, {
      id: 'u1',
      email: 'a@b.com',
      role: 'admin',
      permissions: ['user:read'],
    });

    const { result } = renderHook(() => useAllPermissions(['user:read', 'user:write']));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    expect(result.current).toBe(false);
  });
});
