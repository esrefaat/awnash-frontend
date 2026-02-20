import { renderHook, act, waitFor } from '@testing-library/react';
import { useDisputes } from './useDisputes';
import { disputeService } from '@/services/disputeService';

jest.mock('@/services/disputeService', () => ({
  disputeService: {
    listDisputes: jest.fn(),
    getDispute: jest.fn(),
    getActivities: jest.fn(),
    getStats: jest.fn(),
    assignAdmin: jest.fn(),
    escalate: jest.fn(),
    resolve: jest.fn(),
    close: jest.fn(),
  },
}));

const mockService = disputeService as jest.Mocked<typeof disputeService>;

describe('useDisputes', () => {
  beforeEach(() => jest.clearAllMocks());

  it('fetches disputes list', async () => {
    const mockData = { data: [{ id: '1', status: 'open' }], total: 1 };
    mockService.listDisputes.mockResolvedValue(mockData as any);

    const { result } = renderHook(() => useDisputes());

    await act(async () => {
      await result.current.fetchDisputes({ status: 'open' });
    });

    expect(mockService.listDisputes).toHaveBeenCalledWith({ status: 'open' });
    expect(result.current.disputes).toEqual(mockData.data);
    expect(result.current.total).toBe(1);
    expect(result.current.loading).toBe(false);
  });

  it('sets error on fetchDisputes failure', async () => {
    mockService.listDisputes.mockRejectedValue(new Error('Network fail'));

    const { result } = renderHook(() => useDisputes());

    await act(async () => {
      await result.current.fetchDisputes();
    });

    expect(result.current.error).toBe('Network fail');
    expect(result.current.loading).toBe(false);
  });

  it('fetches stats', async () => {
    const stats = { total: 10, open: 5, resolved: 5 };
    mockService.getStats.mockResolvedValue(stats as any);

    const { result } = renderHook(() => useDisputes());

    await act(async () => {
      await result.current.fetchStats();
    });

    expect(result.current.stats).toEqual(stats);
  });

  it('fetches single dispute', async () => {
    const dispute = { id: '1', status: 'open' };
    mockService.getDispute.mockResolvedValue(dispute as any);

    const { result } = renderHook(() => useDisputes());

    await act(async () => {
      await result.current.fetchDispute('1');
    });

    expect(result.current.currentDispute).toEqual(dispute);
    expect(result.current.loading).toBe(false);
  });

  it('fetches activities', async () => {
    const activities = [{ id: 'a1', type: 'comment' }];
    mockService.getActivities.mockResolvedValue(activities as any);

    const { result } = renderHook(() => useDisputes());

    await act(async () => {
      await result.current.fetchActivities('1');
    });

    expect(result.current.activities).toEqual(activities);
  });

  it('assigns admin and updates state', async () => {
    const initial = { id: '1', status: 'open' };
    const updated = { id: '1', status: 'open', assignedTo: 'admin1' };
    mockService.listDisputes.mockResolvedValue({ data: [initial], total: 1 } as any);
    mockService.assignAdmin.mockResolvedValue(updated as any);

    const { result } = renderHook(() => useDisputes());

    await act(async () => {
      await result.current.fetchDisputes();
    });
    await act(async () => {
      await result.current.assignAdmin('1', 'admin1');
    });

    expect(mockService.assignAdmin).toHaveBeenCalledWith('1', 'admin1');
    expect(result.current.currentDispute).toEqual(updated);
  });

  it('escalates dispute', async () => {
    const updated = { id: '1', status: 'escalated' };
    mockService.escalate.mockResolvedValue(updated as any);

    const { result } = renderHook(() => useDisputes());

    await act(async () => {
      await result.current.escalateDispute('1', 'urgent');
    });

    expect(mockService.escalate).toHaveBeenCalledWith('1', 'urgent');
    expect(result.current.currentDispute).toEqual(updated);
  });

  it('resolves dispute', async () => {
    const updated = { id: '1', status: 'resolved' };
    const payload = { resolution: 'refund', amount: 100 };
    mockService.resolve.mockResolvedValue(updated as any);

    const { result } = renderHook(() => useDisputes());

    await act(async () => {
      await result.current.resolveDispute('1', payload as any);
    });

    expect(mockService.resolve).toHaveBeenCalledWith('1', payload);
  });

  it('closes dispute', async () => {
    const updated = { id: '1', status: 'closed' };
    mockService.close.mockResolvedValue(updated as any);

    const { result } = renderHook(() => useDisputes());

    await act(async () => {
      await result.current.closeDispute('1');
    });

    expect(mockService.close).toHaveBeenCalledWith('1');
  });
});
