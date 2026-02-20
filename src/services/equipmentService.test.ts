import { setupFetchMock, mockFetchOnce, mockFetchError } from '../../test/helpers/mock-api';
import { equipmentService } from './equipmentService';

let fetchMock: jest.Mock;

const mockEquipment = {
  id: 'eq1',
  name: 'Crane',
  description: 'A crane',
  equipment_type_id: 'et1',
  city: 'Riyadh',
  status: 'active',
  image_urls: [],
  is_available: true,
  total_rentals: 5,
  total_revenue: '5000',
  daily_rate: '500',
  owner_id: 'o1',
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
};

beforeEach(() => {
  fetchMock = setupFetchMock();
});

describe('equipmentService', () => {
  describe('createEquipment', () => {
    it('sends POST and returns equipment from data wrapper', async () => {
      mockFetchOnce(fetchMock, { data: mockEquipment });

      const result = await equipmentService.createEquipment({
        name: 'Crane',
        description: 'A crane',
        equipmentTypeId: 'et1',
        city: 'Riyadh',
        status: 'active',
        imageUrls: [],
        dailyRate: 500,
        ownerId: 'o1',
      });

      expect(fetchMock.mock.calls[0][1].method).toBe('POST');
      expect(result.id).toBe('eq1');
    });

    it('handles unwrapped response', async () => {
      mockFetchOnce(fetchMock, mockEquipment);
      const result = await equipmentService.createEquipment({
        name: 'Crane', description: '', equipmentTypeId: 'et1',
        city: 'Riyadh', status: 'active', imageUrls: [], dailyRate: 500, ownerId: 'o1',
      });
      expect(result.id).toBe('eq1');
    });
  });

  describe('getEquipment', () => {
    it('handles wrapped response with pagination', async () => {
      mockFetchOnce(fetchMock, {
        data: [mockEquipment],
        pagination: { total: 1, total_pages: 1, page: 1, limit: 10 },
      });

      const result = await equipmentService.getEquipment({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('handles direct array response', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve([mockEquipment, mockEquipment]),
        text: () => Promise.resolve(JSON.stringify([mockEquipment, mockEquipment])),
        headers: new Headers(),
      });

      const result = await equipmentService.getEquipment();

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('returns empty data for unexpected shape', async () => {
      mockFetchOnce(fetchMock, { something: 'else' });
      const result = await equipmentService.getEquipment();
      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('builds query params', async () => {
      mockFetchOnce(fetchMock, { data: [], pagination: { total: 0 } });
      await equipmentService.getEquipment({ search: 'crane', status: 'active', page: 2 });
      const url = fetchMock.mock.calls[0][0] as string;
      expect(url).toContain('search=crane');
      expect(url).toContain('status=active');
      expect(url).toContain('page=2');
    });
  });

  describe('getEquipmentById', () => {
    it('returns equipment from data wrapper', async () => {
      mockFetchOnce(fetchMock, { data: mockEquipment });
      const result = await equipmentService.getEquipmentById('eq1');
      expect(result?.id).toBe('eq1');
    });

    it('returns null on 404', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ message: 'Not found' }),
        headers: new Headers(),
      });

      const result = await equipmentService.getEquipmentById('missing');
      expect(result).toBeNull();
    });

    it('rethrows non-404 errors', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ message: 'Server error' }),
        headers: new Headers(),
      });

      await expect(equipmentService.getEquipmentById('eq1')).rejects.toThrow('Server error');
    });
  });

  describe('updateEquipment', () => {
    const equipmentData = {
      name: 'Crane', description: '', equipmentTypeId: 'et1',
      city: 'Riyadh', status: 'active' as const, imageUrls: [], dailyRate: 500, ownerId: 'o1',
    };

    it('sends PUT and returns updated equipment', async () => {
      mockFetchOnce(fetchMock, { data: { ...mockEquipment, name: 'Updated' } });
      const result = await equipmentService.updateEquipment('eq1', equipmentData);
      expect(fetchMock.mock.calls[0][1].method).toBe('PUT');
      expect(result.name).toBe('Updated');
    });

    it.each([
      [403, 'You can only update your own equipment'],
      [404, 'Equipment not found'],
      [401, 'You are not authorized'],
      [400, 'Validation failed'],
    ])('remaps %d error to user-friendly message', async (status, expectedMsg) => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status,
        json: () => Promise.resolve({ message: 'raw error' }),
        headers: new Headers(),
      });

      await expect(equipmentService.updateEquipment('eq1', equipmentData))
        .rejects.toThrow(expectedMsg);
    });
  });

  describe('deleteEquipment', () => {
    it('sends DELETE request', async () => {
      mockFetchOnce(fetchMock, {});
      await equipmentService.deleteEquipment('eq1');
      expect(fetchMock.mock.calls[0][1].method).toBe('DELETE');
    });

    it.each([
      [403, 'You can only delete your own equipment'],
      [404, 'Equipment not found'],
      [401, 'You are not authorized'],
    ])('remaps %d error to user-friendly message', async (status, expectedMsg) => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status,
        json: () => Promise.resolve({ message: 'raw' }),
        headers: new Headers(),
      });

      await expect(equipmentService.deleteEquipment('eq1')).rejects.toThrow(expectedMsg);
    });
  });
});
