import { setupFetchMock, mockFetchOnce, mockFetchError } from '../../test/helpers/mock-api';
import { authService } from './authService';

let fetchMock: jest.Mock;

beforeEach(() => {
  fetchMock = setupFetchMock();
});

describe('authService', () => {
  describe('login', () => {
    it('returns user data on success', async () => {
      mockFetchOnce(fetchMock, {
        user: { id: '1', full_name: 'Admin', role: 'admin', mobile_number: '+966500000000', is_verified: true },
      });

      const result = await authService.login({ email: 'admin@test.com', password: 'pass' });

      expect(result.user).toEqual(
        expect.objectContaining({ id: '1', fullName: 'Admin', role: 'admin' }),
      );
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/auth/login'),
        expect.objectContaining({ method: 'POST', credentials: 'include' }),
      );
    });

    it('sends snake_case body', async () => {
      mockFetchOnce(fetchMock, { user: { id: '1' } });
      await authService.login({ mobileNumber: '+966500000000', password: 'pass' });

      const body = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(body).toHaveProperty('mobile_number', '+966500000000');
    });

    it('throws on failed login', async () => {
      mockFetchError(fetchMock, 'Invalid credentials', 401);
      await expect(authService.login({ email: 'x@x.com', password: 'wrong' }))
        .rejects.toThrow('Invalid credentials');
    });
  });

  describe('register', () => {
    it('returns user data on success', async () => {
      mockFetchOnce(fetchMock, {
        user: { id: '2', full_name: 'New User', role: 'renter', mobile_number: '+966511111111', is_verified: false },
      });

      const result = await authService.register({
        fullName: 'New User',
        mobileNumber: '+966511111111',
        password: 'secure123',
      });

      expect(result.user).toEqual(expect.objectContaining({ fullName: 'New User' }));
    });

    it('throws on registration failure', async () => {
      mockFetchError(fetchMock, 'Mobile number already registered', 409);
      await expect(
        authService.register({ fullName: 'Dup', mobileNumber: '+966500000000', password: 'pass' }),
      ).rejects.toThrow('Mobile number already registered');
    });
  });

  describe('logout', () => {
    it('calls POST /auth/logout', async () => {
      mockFetchOnce(fetchMock, {});
      await authService.logout();
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/auth/logout'),
        expect.objectContaining({ method: 'POST', credentials: 'include' }),
      );
    });

    it('does not throw on network error', async () => {
      fetchMock.mockRejectedValueOnce(new Error('Network down'));
      await expect(authService.logout()).resolves.toBeUndefined();
    });
  });

  describe('getCurrentUser', () => {
    it('returns user when authenticated', async () => {
      mockFetchOnce(fetchMock, { id: '1', full_name: 'Admin', role: 'admin', is_verified: true });
      const user = await authService.getCurrentUser();
      expect(user).toEqual(expect.objectContaining({ id: '1', fullName: 'Admin' }));
    });

    it('returns null on 401', async () => {
      mockFetchError(fetchMock, 'Unauthorized', 401);
      const user = await authService.getCurrentUser();
      expect(user).toBeNull();
    });

    it('returns null on network error', async () => {
      fetchMock.mockRejectedValueOnce(new Error('offline'));
      const user = await authService.getCurrentUser();
      expect(user).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('returns true when getCurrentUser succeeds', async () => {
      mockFetchOnce(fetchMock, { id: '1', role: 'admin' });
      expect(await authService.isAuthenticated()).toBe(true);
    });

    it('returns false when getCurrentUser fails', async () => {
      mockFetchError(fetchMock, 'Unauthorized', 401);
      expect(await authService.isAuthenticated()).toBe(false);
    });
  });

  describe('hasRole', () => {
    it('returns true when user has required role', async () => {
      mockFetchOnce(fetchMock, { id: '1', role: 'admin', roles: ['admin', 'manager'] });
      expect(await authService.hasRole('admin')).toBe(true);
    });

    it('checks additional roles array', async () => {
      mockFetchOnce(fetchMock, { id: '1', role: 'user', roles: ['manager'] });
      expect(await authService.hasRole('manager')).toBe(true);
    });

    it('returns false when user lacks role', async () => {
      mockFetchOnce(fetchMock, { id: '1', role: 'renter' });
      expect(await authService.hasRole('admin')).toBe(false);
    });

    it('returns false when not authenticated', async () => {
      mockFetchError(fetchMock, 'Unauthorized', 401);
      expect(await authService.hasRole('admin')).toBe(false);
    });
  });

  describe('hasPermission / hasAnyPermission / hasAllPermissions', () => {
    it('hasPermission returns true when permission exists', async () => {
      mockFetchOnce(fetchMock, { id: '1', role: 'admin', permissions: ['users.read', 'users.write'] });
      expect(await authService.hasPermission('users.read')).toBe(true);
    });

    it('hasPermission returns false when missing', async () => {
      mockFetchOnce(fetchMock, { id: '1', role: 'admin', permissions: ['users.read'] });
      expect(await authService.hasPermission('users.delete')).toBe(false);
    });

    it('hasAnyPermission returns true if any match', async () => {
      mockFetchOnce(fetchMock, { id: '1', role: 'admin', permissions: ['users.read'] });
      expect(await authService.hasAnyPermission(['users.delete', 'users.read'])).toBe(true);
    });

    it('hasAllPermissions returns false if one is missing', async () => {
      mockFetchOnce(fetchMock, { id: '1', role: 'admin', permissions: ['users.read'] });
      expect(await authService.hasAllPermissions(['users.read', 'users.write'])).toBe(false);
    });

    it('hasAllPermissions returns true when all present', async () => {
      mockFetchOnce(fetchMock, { id: '1', role: 'admin', permissions: ['users.read', 'users.write'] });
      expect(await authService.hasAllPermissions(['users.read', 'users.write'])).toBe(true);
    });
  });

  describe('getAuthHeader', () => {
    it('returns empty object', () => {
      expect(authService.getAuthHeader()).toEqual({});
    });
  });

  describe('validateToken', () => {
    it('delegates to isAuthenticated', async () => {
      mockFetchOnce(fetchMock, { id: '1', role: 'admin' });
      expect(await authService.validateToken()).toBe(true);
    });
  });
});
