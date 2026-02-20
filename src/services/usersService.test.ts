import { setupFetchMock, mockFetchOnce, mockFetchError } from '../../test/helpers/mock-api';
import { usersService } from './usersService';

let fetchMock: jest.Mock;

const mockUser = {
  id: 'u1',
  full_name: 'Test User',
  mobile_number: '+966500000000',
  email: 'test@test.com',
  role: 'renter',
  is_verified: true,
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
};

beforeEach(() => {
  fetchMock = setupFetchMock();
});

describe('usersService', () => {
  describe('getAllUsers', () => {
    it('builds query params from filters', async () => {
      mockFetchOnce(fetchMock, { users: [mockUser], total: 1, page: 1, limit: 10, total_pages: 1 });

      await usersService.getAllUsers({ search: 'test', role: 'admin', page: 2, limit: 20, sortBy: 'name', sortOrder: 'asc' });

      const url = fetchMock.mock.calls[0][0] as string;
      expect(url).toContain('search=test');
      expect(url).toContain('role=admin');
      expect(url).toContain('page=2');
      expect(url).toContain('limit=20');
      expect(url).toContain('sortBy=name');
      expect(url).toContain('sortOrder=asc');
    });

    it('skips "all" values for role and status', async () => {
      mockFetchOnce(fetchMock, { users: [], total: 0, page: 1, limit: 10, total_pages: 1 });

      await usersService.getAllUsers({ role: 'all', status: 'all' });

      const url = fetchMock.mock.calls[0][0] as string;
      expect(url).not.toContain('role=');
      expect(url).not.toContain('status=');
    });

    it('transforms response and adds roles/permissions arrays', async () => {
      mockFetchOnce(fetchMock, { users: [mockUser], total: 1, page: 1, limit: 10, total_pages: 1 });

      const result = await usersService.getAllUsers();

      expect(result.users[0].roles).toEqual(['renter']);
      expect(result.users[0].permissions).toEqual([]);
      expect(result.users[0].isActive).toBe(true);
      expect(result.total).toBe(1);
    });
  });

  describe('getUserById', () => {
    it('returns transformed user', async () => {
      mockFetchOnce(fetchMock, mockUser);
      const user = await usersService.getUserById('u1');
      expect(user.id).toBe('u1');
      expect(user.fullName).toBe('Test User');
      expect(user.roles).toEqual(['renter']);
    });
  });

  describe('createUser', () => {
    it('sends POST with user data', async () => {
      mockFetchOnce(fetchMock, mockUser);

      const user = await usersService.createUser({
        fullName: 'Test User',
        mobileNumber: '+966500000000',
        role: 'renter',
      });

      expect(fetchMock.mock.calls[0][1].method).toBe('POST');
      expect(user.id).toBe('u1');
    });
  });

  describe('updateUser', () => {
    it('sends PUT with updated data', async () => {
      mockFetchOnce(fetchMock, { ...mockUser, full_name: 'Updated' });

      const user = await usersService.updateUser('u1', { fullName: 'Updated' });

      expect(fetchMock.mock.calls[0][1].method).toBe('PUT');
      expect(user.fullName).toBe('Updated');
    });
  });

  describe('deleteUser', () => {
    it('sends DELETE request', async () => {
      mockFetchOnce(fetchMock, {});
      await usersService.deleteUser('u1');
      expect(fetchMock.mock.calls[0][1].method).toBe('DELETE');
      expect(fetchMock.mock.calls[0][0]).toContain('/users/u1');
    });
  });

  describe('toggleUserStatus', () => {
    it('sends PATCH to toggle endpoint', async () => {
      mockFetchOnce(fetchMock, mockUser);
      const user = await usersService.toggleUserStatus('u1');
      expect(fetchMock.mock.calls[0][0]).toContain('/users/u1/toggle-status');
      expect(fetchMock.mock.calls[0][1].method).toBe('PATCH');
      expect(user.roles).toEqual(['renter']);
    });
  });

  describe('bulkUpdateUsers', () => {
    it('sends PATCH with ids and action', async () => {
      mockFetchOnce(fetchMock, {});
      await usersService.bulkUpdateUsers(['u1', 'u2'], 'activate');

      const body = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(body).toEqual(
        expect.objectContaining({ user_ids: ['u1', 'u2'], action: 'activate' }),
      );
    });
  });

  describe('getUserStats', () => {
    it('returns the data portion of the response', async () => {
      const stats = { total: 100, active: 80, verified: 70, admins: 5, owners: 20, renters: 50, hybrid: 5 };
      mockFetchOnce(fetchMock, { data: stats, success: true, message: 'ok' });

      const result = await usersService.getUserStats();
      expect(result).toEqual(stats);
    });
  });

  describe('exportUsers', () => {
    it('returns a Blob', async () => {
      const blobContent = 'csv,data';
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        blob: () => Promise.resolve(new Blob([blobContent])),
        headers: new Headers(),
      });

      const blob = await usersService.exportUsers({ role: 'admin' });
      expect(blob).toBeInstanceOf(Blob);
      const url = fetchMock.mock.calls[0][0] as string;
      expect(url).toContain('role=admin');
    });

    it('throws on export failure', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 500,
        headers: new Headers(),
      });

      await expect(usersService.exportUsers()).rejects.toThrow('Export failed: 500');
    });
  });

  describe('error handling', () => {
    it('throws with server error message', async () => {
      mockFetchError(fetchMock, 'User not found', 404);
      await expect(usersService.getUserById('missing')).rejects.toThrow('User not found');
    });
  });
});
