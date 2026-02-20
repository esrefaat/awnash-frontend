import { moderationService } from './moderationService';
import { apiService } from './api';

jest.mock('./api', () => ({
  apiService: {
    get: jest.fn(),
    post: jest.fn(),
  },
  ApiError: class extends Error {
    constructor(message: string, public status: number) { super(message); }
  },
}));

const mockGet = apiService.get as jest.Mock;
const mockPost = apiService.post as jest.Mock;

const makePaginatedResponse = (items: any[], total = items.length, page = 1, limit = 20) => ({
  data: items,
  pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
});

beforeEach(() => jest.clearAllMocks());

describe('moderationService', () => {
  describe('getPendingMedia', () => {
    it('calls correct URL with page and limit', async () => {
      const response = makePaginatedResponse([{ id: 'm1' }]);
      mockGet.mockResolvedValue({ data: response });

      const result = await moderationService.getPendingMedia(2, 10);

      expect(mockGet).toHaveBeenCalledWith('/media/admin/pending?page=2&limit=10');
      expect(result).toEqual(response);
    });

    it('uses defaults page=1 limit=20', async () => {
      mockGet.mockResolvedValue({ data: makePaginatedResponse([]) });

      await moderationService.getPendingMedia();

      expect(mockGet).toHaveBeenCalledWith('/media/admin/pending?page=1&limit=20');
    });
  });

  describe('getFlaggedMedia', () => {
    it('calls correct URL', async () => {
      mockGet.mockResolvedValue({ data: makePaginatedResponse([]) });

      await moderationService.getFlaggedMedia(1, 5);

      expect(mockGet).toHaveBeenCalledWith('/media/admin/flagged?page=1&limit=5');
    });
  });

  describe('approveMedia', () => {
    it('calls post and returns response', async () => {
      const approveResponse = { success: true, message: 'Approved', media: { id: 'm1', status: 'approved', url: 'u' } };
      mockPost.mockResolvedValue({ data: approveResponse });

      const result = await moderationService.approveMedia('m1');

      expect(mockPost).toHaveBeenCalledWith('/media/admin/m1/approve', {});
      expect(result).toEqual(approveResponse);
    });

    it('handles unwrapped response (data is undefined)', async () => {
      const approveResponse = { success: true, message: 'Approved', media: { id: 'm1', status: 'approved', url: 'u' } };
      mockPost.mockResolvedValue(approveResponse);

      const result = await moderationService.approveMedia('m1');

      expect(result).toEqual(approveResponse);
    });
  });

  describe('rejectMedia', () => {
    it('calls post with reason', async () => {
      const rejectResponse = { success: true, message: 'Rejected', media: { id: 'm1', status: 'rejected' } };
      mockPost.mockResolvedValue({ data: rejectResponse });

      const result = await moderationService.rejectMedia('m1', 'inappropriate');

      expect(mockPost).toHaveBeenCalledWith('/media/admin/m1/reject', { reason: 'inappropriate' });
      expect(result).toEqual(rejectResponse);
    });
  });

  describe('getModerationQueue', () => {
    it('delegates to getPendingMedia for "pending" filter', async () => {
      const response = makePaginatedResponse([{ id: 'm1' }]);
      mockGet.mockResolvedValue({ data: response });

      const result = await moderationService.getModerationQueue(1, 20, 'pending');

      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith('/media/admin/pending?page=1&limit=20');
      expect(result).toEqual(response);
    });

    it('delegates to getFlaggedMedia for "flagged" filter', async () => {
      const response = makePaginatedResponse([{ id: 'f1' }]);
      mockGet.mockResolvedValue({ data: response });

      const result = await moderationService.getModerationQueue(1, 20, 'flagged');

      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith('/media/admin/flagged?page=1&limit=20');
      expect(result).toEqual(response);
    });

    it('combines and deduplicates for "all" filter', async () => {
      const pending = makePaginatedResponse([{ id: 'm1' }, { id: 'm2' }], 2);
      const flagged = makePaginatedResponse([{ id: 'm2' }, { id: 'm3' }], 2);

      mockGet
        .mockResolvedValueOnce({ data: pending })
        .mockResolvedValueOnce({ data: flagged });

      const result = await moderationService.getModerationQueue(1, 20, 'all');

      expect(mockGet).toHaveBeenCalledTimes(2);
      expect(result.data).toHaveLength(3);
      expect(result.data.map((m: any) => m.id)).toEqual(['m1', 'm2', 'm3']);
      expect(result.pagination.total).toBe(4);
    });
  });

  describe('getMediaList', () => {
    it('builds query params with all options', async () => {
      mockGet.mockResolvedValue({ data: makePaginatedResponse([]) });

      await moderationService.getMediaList(2, 10, 'pending' as any, 'equipment' as any, true);

      const url = mockGet.mock.calls[0][0] as string;
      expect(url).toContain('page=2');
      expect(url).toContain('limit=10');
      expect(url).toContain('status=pending');
      expect(url).toContain('context=equipment');
      expect(url).toContain('groupByContext=true');
    });

    it('skips status=all from params', async () => {
      mockGet.mockResolvedValue({ data: makePaginatedResponse([]) });

      await moderationService.getMediaList(1, 20, 'all' as any);

      const url = mockGet.mock.calls[0][0] as string;
      expect(url).not.toContain('status=');
    });
  });

  describe('bulkApprove', () => {
    it('approves all and returns success=true', async () => {
      const approveResponse = { success: true, message: 'ok', media: { id: '', status: 'approved', url: '' } };
      mockPost.mockResolvedValue({ data: approveResponse });

      const result = await moderationService.bulkApprove(['m1', 'm2']);

      expect(mockPost).toHaveBeenCalledTimes(2);
      expect(result.success).toBe(true);
      expect(result.results).toHaveLength(2);
    });

    it('handles partial failures gracefully', async () => {
      const approveResponse = { success: true, message: 'ok', media: { id: 'm1', status: 'approved', url: '' } };
      mockPost
        .mockResolvedValueOnce({ data: approveResponse })
        .mockRejectedValueOnce(new Error('server error'));

      const result = await moderationService.bulkApprove(['m1', 'm2']);

      expect(result.success).toBe(false);
      expect(result.results).toHaveLength(1);
    });
  });

  describe('bulkReject', () => {
    it('rejects all with reason', async () => {
      const rejectResponse = { success: true, message: 'ok', media: { id: '', status: 'rejected' } };
      mockPost.mockResolvedValue({ data: rejectResponse });

      const result = await moderationService.bulkReject(['m1', 'm2'], 'spam');

      expect(mockPost).toHaveBeenCalledTimes(2);
      expect(result.success).toBe(true);
      expect(result.results).toHaveLength(2);
    });
  });

  describe('getModerationCounts', () => {
    it('sums pending and flagged totals', async () => {
      mockGet
        .mockResolvedValueOnce({ data: makePaginatedResponse([], 5, 1, 1) })
        .mockResolvedValueOnce({ data: makePaginatedResponse([], 3, 1, 1) });

      const result = await moderationService.getModerationCounts();

      expect(result).toEqual({ pending: 5, flagged: 3, total: 8 });
    });

    it('returns zeros on error', async () => {
      mockGet.mockRejectedValue(new Error('network fail'));

      const result = await moderationService.getModerationCounts();

      expect(result).toEqual({ pending: 0, flagged: 0, total: 0 });
    });
  });

  describe('getMediaUrl', () => {
    it('returns url and status', async () => {
      mockGet.mockResolvedValue({ data: { success: true, url: 'https://cdn/photo.jpg', status: 'approved' } });

      const result = await moderationService.getMediaUrl('m1');

      expect(mockGet).toHaveBeenCalledWith('/media/m1/url');
      expect(result).toEqual(expect.objectContaining({ url: 'https://cdn/photo.jpg', status: 'approved' }));
    });
  });
});
