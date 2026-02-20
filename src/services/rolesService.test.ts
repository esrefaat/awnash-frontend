import { setupFetchMock, mockFetchOnce, mockFetchError, mockFetchReject } from '../../test/helpers/mock-api';
import { rolesService } from './rolesService';

let fetchMock: jest.Mock;

beforeEach(() => {
  fetchMock = setupFetchMock();
});

describe('rolesService', () => {
  describe('getAllRoles', () => {
    it('returns roles from API on success', async () => {
      mockFetchOnce(fetchMock, {
        success: true,
        message: 'OK',
        data: [
          { id: '1', name: 'admin', description: 'Admin', permissions: ['user:read'], user_count: 3, is_active: true },
        ],
      });

      const roles = await rolesService.getAllRoles();

      expect(roles).toHaveLength(1);
      expect(roles[0].name).toBe('admin');
    });

    it('returns fallback mock data on error', async () => {
      mockFetchReject(fetchMock, 'Network error');

      const roles = await rolesService.getAllRoles();

      expect(roles.length).toBeGreaterThanOrEqual(2);
      expect(roles[0].name).toBe('super_admin');
    });
  });

  describe('getRoleById', () => {
    it('fetches a role by id', async () => {
      mockFetchOnce(fetchMock, {
        success: true,
        message: 'OK',
        data: { id: 'r1', name: 'editor', description: 'Editor', permissions: [], user_count: 0, is_active: true },
      });

      const role = await rolesService.getRoleById('r1');

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/roles/r1'),
        expect.any(Object),
      );
      expect(role.name).toBe('editor');
    });

    it('throws on error', async () => {
      mockFetchError(fetchMock, 'Not found', 404);
      await expect(rolesService.getRoleById('bad')).rejects.toThrow('Not found');
    });
  });

  describe('createRole', () => {
    it('sends POST and returns created role', async () => {
      mockFetchOnce(fetchMock, {
        success: true,
        message: 'Created',
        data: { id: 'new1', name: 'viewer', description: 'View only', permissions: ['user:read'], user_count: 0, is_active: true },
      });

      const role = await rolesService.createRole({ name: 'viewer', description: 'View only', permissionIds: ['p1'] });

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/roles'),
        expect.objectContaining({ method: 'POST' }),
      );
      expect(role.name).toBe('viewer');
    });

    it('returns mock role on error (fallback)', async () => {
      mockFetchReject(fetchMock, 'Server error');

      const role = await rolesService.createRole({ name: 'fallback-role' });

      expect(role.name).toBe('fallback-role');
      expect(role.id).toContain('mock-');
    });
  });

  describe('updateRole', () => {
    it('sends PATCH with update data', async () => {
      mockFetchOnce(fetchMock, {
        success: true,
        message: 'Updated',
        data: { id: 'r1', name: 'updated', description: 'Updated desc', permissions: [], user_count: 0, is_active: true },
      });

      const role = await rolesService.updateRole('r1', { name: 'updated', description: 'Updated desc' });

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/roles/r1'),
        expect.objectContaining({ method: 'PATCH' }),
      );
      expect(role.name).toBe('updated');
    });

    it('throws on error', async () => {
      mockFetchReject(fetchMock, 'Server error');
      await expect(rolesService.updateRole('r1', { name: 'x' })).rejects.toThrow('Server error');
    });
  });

  describe('deleteRole', () => {
    it('sends DELETE request', async () => {
      mockFetchOnce(fetchMock, undefined);

      await rolesService.deleteRole('r1');

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/roles/r1'),
        expect.objectContaining({ method: 'DELETE' }),
      );
    });
  });

  describe('getAllPermissions', () => {
    it('returns permissions from API on success', async () => {
      mockFetchOnce(fetchMock, {
        success: true,
        message: 'OK',
        data: {
          permissions: [{ id: '1', name: 'user:read', resource: 'user', action: 'read' }],
          grouped: { user: [{ id: '1', name: 'user:read', resource: 'user', action: 'read' }] },
        },
      });

      const result = await rolesService.getAllPermissions();

      expect(result.permissions).toHaveLength(1);
      expect(result.grouped).toHaveProperty('user');
    });

    it('returns fallback data on error', async () => {
      mockFetchReject(fetchMock, 'Network error');

      const result = await rolesService.getAllPermissions();

      expect(result.permissions.length).toBeGreaterThan(0);
      expect(result.grouped).toHaveProperty('user');
    });
  });

  describe('assignRoleToUser', () => {
    it('sends POST to assign endpoint', async () => {
      mockFetchOnce(fetchMock, { success: true, message: 'Assigned', data: { roleId: 'r1', userId: 'u1' } });

      await rolesService.assignRoleToUser('r1', 'u1');

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/roles/r1/assign/u1'),
        expect.objectContaining({ method: 'POST' }),
      );
    });
  });

  describe('getRoleUsers', () => {
    it('fetches users for a role with pagination', async () => {
      mockFetchOnce(fetchMock, {
        success: true,
        message: 'OK',
        data: { users: [{ id: 'u1' }], total: 1, page: 1, limit: 10, total_pages: 1 },
      });

      const result = await rolesService.getRoleUsers('r1', 1, 10);

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/roles/r1/users?page=1&limit=10'),
        expect.any(Object),
      );
      expect(result.users).toHaveLength(1);
    });
  });
});
