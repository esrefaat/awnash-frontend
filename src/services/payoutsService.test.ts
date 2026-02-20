import { setupFetchMock, mockFetchOnce, mockFetchError } from '../../test/helpers/mock-api';
import { payoutsService } from './payoutsService';

let fetchMock: jest.Mock;

beforeEach(() => {
  fetchMock = setupFetchMock();
});

describe('payoutsService', () => {
  describe('getAllPayouts', () => {
    it('fetches payouts without filters', async () => {
      mockFetchOnce(fetchMock, {
        success: true,
        data: [{ id: '1', amount: 500, status: 'pending' }],
        pagination: { page: 1, limit: 10, total: 1, total_pages: 1 },
        stats: { pending: 1, approved: 0, completed: 0, rejected: 0, total_pending_amount: 500 },
      });

      const result = await payoutsService.getAllPayouts();

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/payouts/admin'),
        expect.objectContaining({ credentials: 'include' }),
      );
      expect(result.data).toHaveLength(1);
    });

    it('appends query params from filters', async () => {
      mockFetchOnce(fetchMock, {
        success: true,
        data: [],
        pagination: { page: 2, limit: 5, total: 0, total_pages: 0 },
        stats: { pending: 0, approved: 0, completed: 0, rejected: 0, total_pending_amount: 0 },
      });

      await payoutsService.getAllPayouts({ page: 2, limit: 5, status: 'approved', search: 'test' });

      const url = fetchMock.mock.calls[0][0] as string;
      expect(url).toContain('page=2');
      expect(url).toContain('limit=5');
      expect(url).toContain('status=approved');
      expect(url).toContain('search=test');
    });
  });

  describe('getPayoutById', () => {
    it('fetches a single payout', async () => {
      mockFetchOnce(fetchMock, { success: true, data: { id: 'p1', amount: 1000 } });

      const result = await payoutsService.getPayoutById('p1');

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/payouts/admin/p1'),
        expect.any(Object),
      );
      expect(result.data.id).toBe('p1');
    });
  });

  describe('approvePayout', () => {
    it('sends POST with notes', async () => {
      mockFetchOnce(fetchMock, { success: true, message: 'Approved' });

      await payoutsService.approvePayout('p1', 'Looks good');

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/payouts/admin/p1/approve'),
        expect.objectContaining({ method: 'POST' }),
      );
      const body = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(body).toHaveProperty('notes', 'Looks good');
    });
  });

  describe('rejectPayout', () => {
    it('sends POST with reason', async () => {
      mockFetchOnce(fetchMock, { success: true, message: 'Rejected' });

      await payoutsService.rejectPayout('p1', 'Insufficient docs');

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/payouts/admin/p1/reject'),
        expect.objectContaining({ method: 'POST' }),
      );
      const body = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(body).toHaveProperty('reason', 'Insufficient docs');
    });
  });

  describe('completePayout', () => {
    it('sends POST with reference and notes', async () => {
      mockFetchOnce(fetchMock, { success: true, message: 'Completed' });

      await payoutsService.completePayout('p1', 'TXN-123', 'Done');

      const body = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(body).toHaveProperty('transaction_reference', 'TXN-123');
      expect(body).toHaveProperty('notes', 'Done');
    });
  });

  describe('verifyBankAccount', () => {
    it('sends POST to verify endpoint', async () => {
      mockFetchOnce(fetchMock, { success: true, message: 'Verified' });

      await payoutsService.verifyBankAccount('ba1');

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/payouts/admin/bank-accounts/ba1/verify'),
        expect.objectContaining({ method: 'POST' }),
      );
    });
  });

  describe('error handling', () => {
    it('throws on HTTP error', async () => {
      mockFetchError(fetchMock, 'Not found', 404);
      await expect(payoutsService.getPayoutById('bad')).rejects.toThrow('Not found');
    });
  });

  describe('utility functions', () => {
    it('formatCurrency formats with SAR', () => {
      const result = payoutsService.formatCurrency(1500);
      expect(result).toContain('1,500');
      expect(result).toContain('SAR');
    });

    it('formatDate returns formatted string', () => {
      const result = payoutsService.formatDate('2024-06-15T10:30:00Z');
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('getStatusVariant returns correct variants', () => {
      expect(payoutsService.getStatusVariant('pending')).toBe('warning');
      expect(payoutsService.getStatusVariant('completed')).toBe('success');
      expect(payoutsService.getStatusVariant('rejected')).toBe('danger');
      expect(payoutsService.getStatusVariant('approved')).toBe('info');
      expect(payoutsService.getStatusVariant('cancelled')).toBe('default');
    });

    it('getStatusLabel returns English labels by default', () => {
      expect(payoutsService.getStatusLabel('pending')).toBe('Pending');
      expect(payoutsService.getStatusLabel('completed')).toBe('Completed');
    });

    it('getStatusLabel returns Arabic labels when isRTL', () => {
      expect(payoutsService.getStatusLabel('pending', true)).toBe('معلق');
      expect(payoutsService.getStatusLabel('completed', true)).toBe('مكتمل');
    });

    it('getTransactionTypeLabel returns English labels by default', () => {
      expect(payoutsService.getTransactionTypeLabel('credit_booking_completed')).toBe('Booking Completed');
      expect(payoutsService.getTransactionTypeLabel('debit_payout')).toBe('Payout');
    });

    it('getTransactionTypeLabel returns Arabic labels when isRTL', () => {
      expect(payoutsService.getTransactionTypeLabel('credit_booking_completed', true)).toBe('حجز مكتمل');
    });

    it('getTransactionTypeLabel falls back to type string for unknown types', () => {
      expect(payoutsService.getTransactionTypeLabel('unknown_type')).toBe('unknown_type');
    });
  });
});
