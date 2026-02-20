import { disputeService } from './disputeService';
import { apiService } from './api';

jest.mock('./api', () => ({
  apiService: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
  },
}));

const mockGet = apiService.get as jest.Mock;
const mockPost = apiService.post as jest.Mock;
const mockPatch = apiService.patch as jest.Mock;

beforeEach(() => jest.clearAllMocks());

describe('disputeService', () => {
  describe('listDisputes', () => {
    it('returns structured data with defaults', async () => {
      mockGet.mockResolvedValue({ data: [{ id: '1' }], total: 1 });

      const result = await disputeService.listDisputes();

      expect(mockGet).toHaveBeenCalledWith('/disputes');
      expect(result).toEqual({ data: [{ id: '1' }], total: 1 });
    });

    it('builds query params from filters', async () => {
      mockGet.mockResolvedValue({ data: [], total: 0 });

      await disputeService.listDisputes({
        status: 'open',
        reason: 'damage',
        priority: 'high',
        page: 2,
        limit: 10,
      });

      expect(mockGet).toHaveBeenCalledWith(
        expect.stringContaining('status=open'),
      );
      expect(mockGet).toHaveBeenCalledWith(
        expect.stringContaining('reason=damage'),
      );
      expect(mockGet).toHaveBeenCalledWith(
        expect.stringContaining('priority=high'),
      );
      expect(mockGet).toHaveBeenCalledWith(
        expect.stringContaining('page=2'),
      );
      expect(mockGet).toHaveBeenCalledWith(
        expect.stringContaining('limit=10'),
      );
    });

    it('defaults data to [] and total to 0 when missing', async () => {
      mockGet.mockResolvedValue({});

      const result = await disputeService.listDisputes();

      expect(result).toEqual({ data: [], total: 0 });
    });
  });

  describe('getDispute', () => {
    it('returns res.data', async () => {
      const dispute = { id: 'd1', status: 'open' };
      mockGet.mockResolvedValue({ data: dispute });

      const result = await disputeService.getDispute('d1');

      expect(mockGet).toHaveBeenCalledWith('/disputes/d1');
      expect(result).toEqual(dispute);
    });
  });

  describe('getActivities', () => {
    it('returns activities array', async () => {
      const activities = [{ id: 'a1', type: 'note' }];
      mockGet.mockResolvedValue({ data: activities });

      const result = await disputeService.getActivities('d1');

      expect(mockGet).toHaveBeenCalledWith('/disputes/d1/activities');
      expect(result).toEqual(activities);
    });

    it('defaults to empty array when data is missing', async () => {
      mockGet.mockResolvedValue({});

      const result = await disputeService.getActivities('d1');

      expect(result).toEqual([]);
    });
  });

  describe('getStats', () => {
    it('returns stats data', async () => {
      const stats = { open: 5, resolved: 10 };
      mockGet.mockResolvedValue({ data: stats });

      const result = await disputeService.getStats();

      expect(mockGet).toHaveBeenCalledWith('/disputes/stats/overview');
      expect(result).toEqual(stats);
    });
  });

  describe('assignAdmin', () => {
    it('calls patch with correct args', async () => {
      const dispute = { id: 'd1', assignedAdmin: 'admin1' };
      mockPatch.mockResolvedValue({ data: dispute });

      const result = await disputeService.assignAdmin('d1', 'admin1');

      expect(mockPatch).toHaveBeenCalledWith('/disputes/d1/assign', { adminId: 'admin1' });
      expect(result).toEqual(dispute);
    });
  });

  describe('escalate', () => {
    it('calls patch with reason', async () => {
      mockPatch.mockResolvedValue({ data: { id: 'd1' } });

      await disputeService.escalate('d1', 'needs review');

      expect(mockPatch).toHaveBeenCalledWith('/disputes/d1/escalate', { reason: 'needs review' });
    });
  });

  describe('resolve', () => {
    it('calls post with payload', async () => {
      const payload = { resolution: 'refund', amount: 100 } as any;
      mockPost.mockResolvedValue({ data: { id: 'd1', status: 'resolved' } });

      const result = await disputeService.resolve('d1', payload);

      expect(mockPost).toHaveBeenCalledWith('/disputes/d1/resolve', payload);
      expect(result).toEqual({ id: 'd1', status: 'resolved' });
    });
  });

  describe('close', () => {
    it('calls post with empty body', async () => {
      mockPost.mockResolvedValue({ data: { id: 'd1', status: 'closed' } });

      const result = await disputeService.close('d1');

      expect(mockPost).toHaveBeenCalledWith('/disputes/d1/close', {});
      expect(result).toEqual({ id: 'd1', status: 'closed' });
    });
  });

  describe('addNote', () => {
    it('calls post with note text', async () => {
      mockPost.mockResolvedValue({});

      await disputeService.addNote('d1', 'Follow up needed');

      expect(mockPost).toHaveBeenCalledWith('/disputes/d1/note', { note: 'Follow up needed' });
    });
  });
});
