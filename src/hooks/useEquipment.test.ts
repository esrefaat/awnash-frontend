import { renderHook, act } from '@testing-library/react';
import { useEquipment } from './useEquipment';
import { apiService, ApiError } from '@/services/api';

jest.mock('@/services/api', () => ({
  apiService: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    getPaginated: jest.fn(),
  },
  ApiError: class extends Error {
    constructor(message: string, public status: number) {
      super(message);
      this.name = 'ApiError';
    }
  },
}));

const mockApi = apiService as jest.Mocked<typeof apiService>;

describe('useEquipment', () => {
  beforeEach(() => jest.clearAllMocks());

  it('starts with empty state', () => {
    const { result } = renderHook(() => useEquipment());

    expect(result.current.equipment).toEqual([]);
    expect(result.current.currentEquipment).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.pagination).toBeNull();
  });

  it('fetches equipment list', async () => {
    const mockEquipment = [{ id: '1', name: 'Crane' }];
    mockApi.getPaginated.mockResolvedValue({
      data: { data: mockEquipment, pagination: { page: 1, limit: 10, total: 1, totalPages: 1 } },
      success: true,
    } as any);

    const { result } = renderHook(() => useEquipment());

    await act(async () => {
      await result.current.fetchEquipment({ page: 1, limit: 10, city: 'Riyadh' });
    });

    expect(mockApi.getPaginated).toHaveBeenCalledWith('/v1/equipment', expect.objectContaining({
      page: 1,
      limit: 10,
      city: 'Riyadh',
    }));
    expect(result.current.equipment).toEqual(mockEquipment);
    expect(result.current.loading).toBe(false);
  });

  it('handles fetch error', async () => {
    mockApi.getPaginated.mockRejectedValue(new Error('Server down'));

    const { result } = renderHook(() => useEquipment());

    await act(async () => {
      await result.current.fetchEquipment();
    });

    expect(result.current.error).toBe('Failed to fetch equipment');
    expect(result.current.loading).toBe(false);
  });

  it('fetches equipment by ID', async () => {
    const eq = { id: '1', name: 'Crane' };
    mockApi.get.mockResolvedValue({ data: eq, success: true } as any);

    const { result } = renderHook(() => useEquipment());

    let fetched: any;
    await act(async () => {
      fetched = await result.current.fetchEquipmentById('1');
    });

    expect(fetched).toEqual(eq);
    expect(result.current.currentEquipment).toEqual(eq);
  });

  it('returns null on fetchEquipmentById error', async () => {
    mockApi.get.mockRejectedValue(new Error('Not found'));

    const { result } = renderHook(() => useEquipment());

    let fetched: any;
    await act(async () => {
      fetched = await result.current.fetchEquipmentById('999');
    });

    expect(fetched).toBeNull();
    expect(result.current.error).toBe('Failed to fetch equipment');
  });

  it('creates equipment and adds to list', async () => {
    const newEq = { id: '2', name: 'Excavator' };
    mockApi.post.mockResolvedValue({ data: newEq, success: true } as any);

    const { result } = renderHook(() => useEquipment());

    let created: any;
    await act(async () => {
      created = await result.current.createEquipment({ name: 'Excavator', description: '', equipmentTypeId: 'et1', city: 'Jeddah', dailyRate: 500 });
    });

    expect(created).toEqual(newEq);
    expect(result.current.equipment).toContainEqual(newEq);
    expect(result.current.creating).toBe(false);
  });

  it('updates equipment in list', async () => {
    const eq = { id: '1', name: 'Crane' };
    const updated = { id: '1', name: 'Updated Crane' };
    mockApi.getPaginated.mockResolvedValue({
      data: { data: [eq], pagination: { page: 1, limit: 10, total: 1, totalPages: 1 } },
      success: true,
    } as any);
    mockApi.patch.mockResolvedValue({ data: updated, success: true } as any);

    const { result } = renderHook(() => useEquipment());

    await act(async () => {
      await result.current.fetchEquipment();
    });
    await act(async () => {
      await result.current.updateEquipment('1', { name: 'Updated Crane' });
    });

    expect(result.current.equipment[0].name).toBe('Updated Crane');
  });

  it('deletes equipment from list', async () => {
    const eq = { id: '1', name: 'Crane' };
    mockApi.getPaginated.mockResolvedValue({
      data: { data: [eq], pagination: { page: 1, limit: 10, total: 1, totalPages: 1 } },
      success: true,
    } as any);
    mockApi.delete.mockResolvedValue({ data: null, success: true } as any);

    const { result } = renderHook(() => useEquipment());

    await act(async () => {
      await result.current.fetchEquipment();
    });
    await act(async () => {
      await result.current.deleteEquipment('1');
    });

    expect(result.current.equipment).toEqual([]);
  });

  it('clears error and current equipment', async () => {
    mockApi.get.mockRejectedValue(new Error('fail'));

    const { result } = renderHook(() => useEquipment());

    await act(async () => {
      await result.current.fetchEquipmentById('1');
    });
    expect(result.current.error).not.toBeNull();

    act(() => {
      result.current.clearError();
    });
    expect(result.current.error).toBeNull();

    act(() => {
      result.current.clearCurrentEquipment();
    });
    expect(result.current.currentEquipment).toBeNull();
  });
});
