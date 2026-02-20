import { setupFetchMock, mockFetchOnce, mockFetchReject } from '../../test/helpers/mock-api';
import { paymentsService } from './paymentsService';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3007/v1';

let fetchMock: jest.Mock;

beforeEach(() => {
  fetchMock = setupFetchMock();
});

const wrappedList = (txns: unknown[] = []) => ({
  success: true,
  data: txns,
  pagination: { page: 1, limit: 20, total: txns.length, total_pages: 1 },
});

const sampleTxn = {
  id: 't1',
  type: 'payment',
  amount: 1000,
  currency: 'SAR',
  method: 'card',
  status: 'completed',
  created_at: '2026-02-01',
};

// ─── getPaymentHistory ───────────────────────────────────────

describe('paymentsService.getPaymentHistory', () => {
  it('builds query params from filters', async () => {
    mockFetchOnce(fetchMock, wrappedList([sampleTxn]));

    const result = await paymentsService.getPaymentHistory({ page: 2, limit: 10, status: 'pending' });

    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain('/payments/history?');
    expect(url).toContain('page=2');
    expect(url).toContain('limit=10');
    expect(url).toContain('status=pending');
    expect(result.transactions).toHaveLength(1);
  });

  it('sends no query string when filters are empty', async () => {
    mockFetchOnce(fetchMock, wrappedList());

    await paymentsService.getPaymentHistory();

    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toBe(`${API}/payments/history`);
  });
});

// ─── getAllTransactions ──────────────────────────────────────

describe('paymentsService.getAllTransactions', () => {
  it('includes all filter params', async () => {
    mockFetchOnce(fetchMock, wrappedList());

    await paymentsService.getAllTransactions({
      page: 1, limit: 50, status: 'completed', type: 'refund',
      startDate: '2026-01-01', endDate: '2026-02-01', search: 'john',
    });

    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain('/payments/admin/transactions?');
    expect(url).toContain('type=refund');
    expect(url).toContain('startDate=2026-01-01');
    expect(url).toContain('search=john');
  });
});

// ─── getTransactionById ─────────────────────────────────────

describe('paymentsService.getTransactionById', () => {
  it('extracts data from response wrapper', async () => {
    mockFetchOnce(fetchMock, { success: true, data: sampleTxn });

    const result = await paymentsService.getTransactionById('t1');

    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toBe(`${API}/payments/history/t1`);
    expect(result.id).toBe('t1');
  });
});

// ─── createPaymentIntent ────────────────────────────────────

describe('paymentsService.createPaymentIntent', () => {
  it('sends POST with body', async () => {
    const intentData = { transaction_id: 'pi1', amount: 500, currency: 'SAR', status: 'pending' };
    mockFetchOnce(fetchMock, { success: true, message: 'ok', data: intentData });

    const result = await paymentsService.createPaymentIntent({
      bookingId: 'b1', amount: 500,
    });

    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toBe(`${API}/payments/intent`);
    expect(opts.method).toBe('POST');
    expect(result.amount).toBe(500);
  });
});

// ─── approveTransaction ─────────────────────────────────────

describe('paymentsService.approveTransaction', () => {
  it('calls POST /payments/admin/:id/approve', async () => {
    mockFetchOnce(fetchMock, { success: true, data: sampleTxn });

    await paymentsService.approveTransaction('t1');

    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toBe(`${API}/payments/admin/t1/approve`);
    expect(opts.method).toBe('POST');
  });
});

// ─── rejectTransaction ──────────────────────────────────────

describe('paymentsService.rejectTransaction', () => {
  it('sends reason in body', async () => {
    mockFetchOnce(fetchMock, { success: true, data: sampleTxn });

    await paymentsService.rejectTransaction('t1', 'Fraud');

    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toBe(`${API}/payments/admin/t1/reject`);
    const body = JSON.parse(opts.body as string);
    expect(body.reason).toBe('Fraud');
  });
});

// ─── Utility functions ──────────────────────────────────────

describe('paymentsService utilities', () => {
  describe('formatCurrency', () => {
    it('formats SAR by default', () => {
      const formatted = paymentsService.formatCurrency(1500);
      expect(formatted).toContain('1,500');
      expect(formatted).toContain('SAR');
    });

    it('respects custom currency', () => {
      const formatted = paymentsService.formatCurrency(100, 'USD');
      expect(formatted).toContain('$');
    });
  });

  describe('getStatusVariant', () => {
    it.each([
      ['completed', 'success'],
      ['pending', 'warning'],
      ['failed', 'danger'],
      ['cancelled', 'secondary'],
    ] as const)('%s → %s', (status, variant) => {
      expect(paymentsService.getStatusVariant(status)).toBe(variant);
    });
  });

  describe('getTypeLabel', () => {
    it('returns English label by default', () => {
      expect(paymentsService.getTypeLabel('payment')).toBe('Rental Payment');
      expect(paymentsService.getTypeLabel('refund')).toBe('Refund');
    });

    it('returns Arabic label when RTL', () => {
      expect(paymentsService.getTypeLabel('deposit', true)).toBe('ضمان');
      expect(paymentsService.getTypeLabel('penalty', true)).toBe('غرامة');
    });
  });

  describe('getMethodLabel', () => {
    it('returns English labels', () => {
      expect(paymentsService.getMethodLabel('card')).toBe('Credit Card');
      expect(paymentsService.getMethodLabel('bank')).toBe('Bank Transfer');
    });

    it('returns Arabic labels when RTL', () => {
      expect(paymentsService.getMethodLabel('wallet', true)).toBe('محفظة');
      expect(paymentsService.getMethodLabel('cash', true)).toBe('نقدي');
    });
  });

  describe('getStatusLabel', () => {
    it('returns English labels', () => {
      expect(paymentsService.getStatusLabel('pending')).toBe('Pending');
    });

    it('returns Arabic labels when RTL', () => {
      expect(paymentsService.getStatusLabel('completed', true)).toBe('مكتمل');
    });
  });
});
