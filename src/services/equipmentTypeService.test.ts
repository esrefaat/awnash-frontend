import { equipmentTypeService } from './equipmentTypeService';
import { apiService } from './api';

jest.mock('./api', () => ({
  apiService: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockApiService = apiService as jest.Mocked<typeof apiService>;

const mockType = {
  id: 'et1',
  nameEn: 'Crane',
  nameAr: 'رافعة',
  categoryId: 'cat1',
  locationMode: 'single',
  serviceMode: 'standard',
  displayOrder: 1,
  isActive: true,
  attributes: [],
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

afterEach(() => jest.clearAllMocks());

describe('equipmentTypeService', () => {
  describe('getAll', () => {
    it('calls apiService.get with correct URL and returns response directly', async () => {
      const response = { data: [mockType], total: 1, page: 1, limit: 10, totalPages: 1 };
      mockApiService.get.mockResolvedValue(response as any);

      const result = await equipmentTypeService.getAll({ search: 'crane', page: 2, limit: 5 });

      expect(mockApiService.get).toHaveBeenCalledWith(
        expect.stringContaining('/equipment-types?'),
      );
      const url = mockApiService.get.mock.calls[0][0];
      expect(url).toContain('search=crane');
      expect(url).toContain('page=2');
      expect(url).toContain('limit=5');
      expect(result).toEqual(response);
    });

    it('omits empty params', async () => {
      mockApiService.get.mockResolvedValue({ data: [] } as any);
      await equipmentTypeService.getAll();
      expect(mockApiService.get).toHaveBeenCalledWith('/equipment-types');
    });
  });

  describe('getById', () => {
    it('extracts response.data', async () => {
      mockApiService.get.mockResolvedValue({ data: mockType } as any);
      const result = await equipmentTypeService.getById('et1');
      expect(mockApiService.get).toHaveBeenCalledWith('/equipment-types/et1');
      expect(result).toEqual(mockType);
    });
  });

  describe('create', () => {
    it('calls apiService.post and returns response.data', async () => {
      mockApiService.post.mockResolvedValue({ data: mockType } as any);
      const data = { nameEn: 'Crane', nameAr: 'رافعة', categoryId: 'cat1', locationMode: 'single' as const };
      const result = await equipmentTypeService.create(data);
      expect(mockApiService.post).toHaveBeenCalledWith('/equipment-types', data);
      expect(result).toEqual(mockType);
    });
  });

  describe('update', () => {
    it('calls apiService.patch and returns response.data', async () => {
      mockApiService.patch.mockResolvedValue({ data: { ...mockType, nameEn: 'Updated' } } as any);
      const result = await equipmentTypeService.update('et1', { nameEn: 'Updated' });
      expect(mockApiService.patch).toHaveBeenCalledWith('/equipment-types/et1', { nameEn: 'Updated' });
      expect(result.nameEn).toBe('Updated');
    });
  });

  describe('delete', () => {
    it('calls apiService.delete', async () => {
      mockApiService.delete.mockResolvedValue(undefined as any);
      await equipmentTypeService.delete('et1');
      expect(mockApiService.delete).toHaveBeenCalledWith('/equipment-types/et1');
    });
  });

  describe('getCategories', () => {
    it('returns response.data', async () => {
      const categories = [{ id: 'cat1', slug: 'aerial', nameEn: 'Aerial' }];
      mockApiService.get.mockResolvedValue({ data: categories } as any);
      const result = await equipmentTypeService.getCategories();
      expect(result).toEqual(categories);
    });
  });

  describe('getAllCategories', () => {
    it('handles direct array response', async () => {
      const categories = [{ id: 'cat1', slug: 'aerial', nameEn: 'Aerial' }];
      mockApiService.get.mockResolvedValue(categories as any);
      const result = await equipmentTypeService.getAllCategories();
      expect(result).toEqual(categories);
    });

    it('handles wrapped response', async () => {
      const categories = [{ id: 'cat1', slug: 'aerial', nameEn: 'Aerial' }];
      mockApiService.get.mockResolvedValue({ data: categories } as any);
      const result = await equipmentTypeService.getAllCategories();
      expect(result).toEqual(categories);
    });

    it('returns empty array for missing data', async () => {
      mockApiService.get.mockResolvedValue({} as any);
      const result = await equipmentTypeService.getAllCategories();
      expect(result).toEqual([]);
    });
  });

  describe('toggleActive', () => {
    it('calls PUT on toggle-active endpoint and returns data', async () => {
      const toggled = { ...mockType, isActive: false };
      mockApiService.put.mockResolvedValue({ data: toggled } as any);
      const result = await equipmentTypeService.toggleActive('et1');
      expect(mockApiService.put).toHaveBeenCalledWith('/equipment-types/et1/toggle-active', {});
      expect(result.isActive).toBe(false);
    });
  });

  describe('getAllWithMarketNames', () => {
    it('builds URL with market code and params', async () => {
      const response = { data: [mockType], total: 1, page: 1, limit: 10, totalPages: 1 };
      mockApiService.get.mockResolvedValue(response as any);

      const result = await equipmentTypeService.getAllWithMarketNames('SA', { categoryId: 'cat1' });

      expect(mockApiService.get).toHaveBeenCalledWith(
        expect.stringContaining('/equipment-types/market/SA'),
      );
      const url = mockApiService.get.mock.calls[0][0];
      expect(url).toContain('categoryId=cat1');
      expect(result).toEqual(response);
    });
  });

  describe('getMarketNames', () => {
    it('returns response.data', async () => {
      const names = [{ id: 'mn1', equipmentTypeId: 'et1', marketCode: 'SA', nameEn: 'Crane SA' }];
      mockApiService.get.mockResolvedValue({ data: names } as any);
      const result = await equipmentTypeService.getMarketNames('et1');
      expect(mockApiService.get).toHaveBeenCalledWith('/equipment-types/et1/market-names');
      expect(result).toEqual(names);
    });
  });

  describe('upsertMarketName', () => {
    it('calls PUT with correct path and data', async () => {
      const marketName = { id: 'mn1', nameEn: 'Local Crane' };
      mockApiService.put.mockResolvedValue({ data: marketName } as any);
      const result = await equipmentTypeService.upsertMarketName('et1', 'SA', { nameEn: 'Local Crane' });
      expect(mockApiService.put).toHaveBeenCalledWith(
        '/equipment-types/et1/market-names/SA',
        { nameEn: 'Local Crane' },
      );
      expect(result).toEqual(marketName);
    });
  });

  describe('getAvailableSupportEquipmentTypes', () => {
    it('handles direct array response', async () => {
      mockApiService.get.mockResolvedValue([mockType] as any);
      const result = await equipmentTypeService.getAvailableSupportEquipmentTypes('et1');
      expect(result).toEqual([mockType]);
      expect(mockApiService.get).toHaveBeenCalledWith(
        expect.stringContaining('equipmentTypeId=et1'),
      );
    });

    it('handles wrapped response', async () => {
      mockApiService.get.mockResolvedValue({ data: [mockType] } as any);
      const result = await equipmentTypeService.getAvailableSupportEquipmentTypes();
      expect(result).toEqual([mockType]);
    });
  });

  describe('getSupportRequirements', () => {
    it('handles direct array response', async () => {
      const reqs = [{ supportEquipmentTypeId: 'et2', quantity: 1, isRequired: true }];
      mockApiService.get.mockResolvedValue(reqs as any);
      const result = await equipmentTypeService.getSupportRequirements('et1');
      expect(result).toEqual(reqs);
    });

    it('handles wrapped response', async () => {
      const reqs = [{ supportEquipmentTypeId: 'et2', quantity: 1, isRequired: true }];
      mockApiService.get.mockResolvedValue({ data: reqs } as any);
      const result = await equipmentTypeService.getSupportRequirements('et1');
      expect(result).toEqual(reqs);
    });
  });

  describe('updateDisplayOrder', () => {
    it('calls PUT on reorder endpoint', async () => {
      mockApiService.put.mockResolvedValue(undefined as any);
      const updates = [{ id: 'et1', displayOrder: 1 }, { id: 'et2', displayOrder: 2 }];
      await equipmentTypeService.updateDisplayOrder(updates);
      expect(mockApiService.put).toHaveBeenCalledWith('/equipment-types/reorder', updates);
    });
  });

  describe('bulkUpdateMarketNames', () => {
    it('calls PUT with market code in path', async () => {
      mockApiService.put.mockResolvedValue(undefined as any);
      const updates = [{ equipmentTypeId: 'et1', nameEn: 'New Name' }];
      await equipmentTypeService.bulkUpdateMarketNames('SA', updates);
      expect(mockApiService.put).toHaveBeenCalledWith('/equipment-types/market-names/SA/bulk', updates);
    });
  });
});
