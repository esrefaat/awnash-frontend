import { legalService } from './legalService';
import { apiService } from './api';

jest.mock('./api', () => ({
  apiService: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
  },
}));

const mockGet = apiService.get as jest.Mock;
const mockPost = apiService.post as jest.Mock;
const mockPut = apiService.put as jest.Mock;
const mockPatch = apiService.patch as jest.Mock;

beforeEach(() => jest.clearAllMocks());

describe('legalService', () => {
  describe('listDocuments', () => {
    it('calls correct URL with type and returns data', async () => {
      const docs = [{ id: '1', type: 'terms' }];
      mockGet.mockResolvedValue({ data: docs });

      const result = await legalService.listDocuments('terms');

      expect(mockGet).toHaveBeenCalledWith('/legal/admin/documents?type=terms');
      expect(result).toEqual(docs);
    });

    it('defaults to empty array when data is missing', async () => {
      mockGet.mockResolvedValue({});

      const result = await legalService.listDocuments('privacy');

      expect(result).toEqual([]);
    });
  });

  describe('createDocument', () => {
    it('posts data and returns created document', async () => {
      const input = {
        type: 'terms',
        version: '1.0',
        title: 'Terms',
        content: 'Content here',
        effectiveDate: '2026-01-01',
      };
      const created = { id: 'doc1', ...input };
      mockPost.mockResolvedValue({ data: created });

      const result = await legalService.createDocument(input);

      expect(mockPost).toHaveBeenCalledWith('/legal/admin/documents', input);
      expect(result).toEqual(created);
    });
  });

  describe('updateDocument', () => {
    it('puts partial data and returns updated document', async () => {
      const updates = { title: 'Updated Terms' };
      mockPut.mockResolvedValue({ data: { id: 'doc1', title: 'Updated Terms' } });

      const result = await legalService.updateDocument('doc1', updates);

      expect(mockPut).toHaveBeenCalledWith('/legal/admin/documents/doc1', updates);
      expect(result).toEqual({ id: 'doc1', title: 'Updated Terms' });
    });
  });

  describe('activateDocument', () => {
    it('patches with empty body', async () => {
      mockPatch.mockResolvedValue({ data: { id: 'doc1', isActive: true } });

      const result = await legalService.activateDocument('doc1');

      expect(mockPatch).toHaveBeenCalledWith('/legal/admin/documents/doc1/activate', {});
      expect(result).toEqual({ id: 'doc1', isActive: true });
    });
  });

  describe('listPenalties', () => {
    it('builds query params from filters', async () => {
      mockGet.mockResolvedValue({ data: [{ id: 'p1' }], total: 1 });

      const result = await legalService.listPenalties({
        status: 'pending',
        penaltyType: 'late_return',
        page: 1,
        limit: 20,
      });

      const url = mockGet.mock.calls[0][0] as string;
      expect(url).toContain('status=pending');
      expect(url).toContain('penalty_type=late_return');
      expect(url).toContain('page=1');
      expect(url).toContain('limit=20');
      expect(result).toEqual({ data: [{ id: 'p1' }], total: 1 });
    });

    it('calls without query string when no filters', async () => {
      mockGet.mockResolvedValue({ data: [] });

      await legalService.listPenalties();

      expect(mockGet).toHaveBeenCalledWith('/penalties');
    });

    it('defaults data to [] and total to 0', async () => {
      mockGet.mockResolvedValue({});

      const result = await legalService.listPenalties();

      expect(result).toEqual({ data: [], total: 0 });
    });
  });

  describe('approvePenalty', () => {
    it('patches with empty body', async () => {
      mockPatch.mockResolvedValue({ data: { id: 'p1', status: 'approved' } });

      const result = await legalService.approvePenalty('p1');

      expect(mockPatch).toHaveBeenCalledWith('/penalties/p1/approve', {});
      expect(result).toEqual({ id: 'p1', status: 'approved' });
    });
  });

  describe('waivePenalty', () => {
    it('patches with reason', async () => {
      mockPatch.mockResolvedValue({ data: { id: 'p1', status: 'waived' } });

      const result = await legalService.waivePenalty('p1', 'goodwill');

      expect(mockPatch).toHaveBeenCalledWith('/penalties/p1/waive', { reason: 'goodwill' });
      expect(result).toEqual({ id: 'p1', status: 'waived' });
    });
  });

  describe('getContractPdfUrl', () => {
    it('returns the URL string', async () => {
      mockGet.mockResolvedValue({ data: { url: 'https://s3/contract.pdf' } });

      const result = await legalService.getContractPdfUrl('c1');

      expect(mockGet).toHaveBeenCalledWith('/legal/contracts/c1/pdf');
      expect(result).toBe('https://s3/contract.pdf');
    });

    it('returns empty string when url is missing', async () => {
      mockGet.mockResolvedValue({ data: {} });

      const result = await legalService.getContractPdfUrl('c1');

      expect(result).toBe('');
    });
  });

  describe('generateContractPdf', () => {
    it('posts and returns s3Key and url', async () => {
      const pdfData = { s3Key: 'contracts/c1.pdf', url: 'https://s3/c1.pdf' };
      mockPost.mockResolvedValue({ data: pdfData });

      const result = await legalService.generateContractPdf('c1');

      expect(mockPost).toHaveBeenCalledWith('/legal/contracts/c1/pdf', {});
      expect(result).toEqual(pdfData);
    });
  });
});
