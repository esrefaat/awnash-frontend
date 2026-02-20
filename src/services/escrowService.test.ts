import { setupFetchMock, mockFetchOnce, mockFetchReject } from '../../test/helpers/mock-api';
import { escrowService } from './escrowService';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3007/v1';

let fetchMock: jest.Mock;

beforeEach(() => {
  fetchMock = setupFetchMock();
});

const sampleEscrow = {
  id: 'e1',
  booking_id: 'b1',
  offer_id: 'o1',
  requester_id: 'u1',
  owner_id: 'u2',
  total_charged_amount: 5000,
  escrow_amount: 4500,
  stage1_amount: 2250,
  stage2_amount: 2250,
  status: 'held',
  currency: 'SAR',
  created_at: '2026-02-01',
  updated_at: '2026-02-01',
};

// ─── getEscrowList ──────────────────────────────────────────

describe('escrowService.getEscrowList', () => {
  it('builds query params from filters', async () => {
    mockFetchOnce(fetchMock, {
      success: true,
      data: [sampleEscrow],
      pagination: { page: 1, limit: 20, total: 1, total_pages: 1 },
    });

    const result = await escrowService.getEscrowList({
      page: 2, limit: 10, status: 'held', search: 'test',
    });

    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain('/escrow/admin/list?');
    expect(url).toContain('page=2');
    expect(url).toContain('limit=10');
    expect(url).toContain('status=held');
    expect(url).toContain('search=test');
    expect(result.escrows).toHaveLength(1);
  });

  it('sends no query string when filters are empty', async () => {
    mockFetchOnce(fetchMock, {
      success: true, data: [],
      pagination: { page: 1, limit: 20, total: 0, total_pages: 0 },
    });

    await escrowService.getEscrowList();

    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toBe(`${API}/escrow/admin/list`);
  });
});

// ─── getEscrowStats ─────────────────────────────────────────

describe('escrowService.getEscrowStats', () => {
  it('extracts data from wrapper', async () => {
    const stats = {
      total_held: 10, total_released: 5, total_refunded: 2,
      total_disputed: 1, total_expired: 0, total_failed: 0,
      held_amount: 50000, released_amount: 25000, refunded_amount: 10000,
      count_by_status: { held: 10, released: 5 },
    };
    mockFetchOnce(fetchMock, { success: true, data: stats });

    const result = await escrowService.getEscrowStats();

    expect(result.totalHeld).toBe(10);
    expect(result.releasedAmount).toBe(25000);
  });
});

// ─── getEscrowById ──────────────────────────────────────────

describe('escrowService.getEscrowById', () => {
  it('fetches escrow by id', async () => {
    mockFetchOnce(fetchMock, sampleEscrow);

    const result = await escrowService.getEscrowById('e1');

    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toBe(`${API}/escrow/e1`);
    expect(result.bookingId).toBe('b1');
  });
});

// ─── forceRelease ───────────────────────────────────────────

describe('escrowService.forceRelease', () => {
  it('sends POST with stage and notes', async () => {
    mockFetchOnce(fetchMock, { success: true, payout: { id: 'p1' } });

    await escrowService.forceRelease('e1', 1, 'Admin release');

    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toBe(`${API}/escrow/e1/admin/force-release`);
    expect(opts.method).toBe('POST');
    const body = JSON.parse(opts.body as string);
    expect(body.stage).toBe(1);
    expect(body.notes).toBe('Admin release');
  });
});

// ─── forceRefund ────────────────────────────────────────────

describe('escrowService.forceRefund', () => {
  it('sends POST with notes', async () => {
    mockFetchOnce(fetchMock, { success: true, escrow: sampleEscrow });

    await escrowService.forceRefund('e1', 'Customer complaint');

    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toBe(`${API}/escrow/e1/admin/force-refund`);
    expect(opts.method).toBe('POST');
    const body = JSON.parse(opts.body as string);
    expect(body.notes).toBe('Customer complaint');
  });
});

// ─── retryPayout ────────────────────────────────────────────

describe('escrowService.retryPayout', () => {
  it('sends POST to retry-payout endpoint', async () => {
    mockFetchOnce(fetchMock, { success: true, payout: { id: 'p2' } });

    await escrowService.retryPayout('e1');

    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toBe(`${API}/escrow/e1/retry-payout`);
    expect(opts.method).toBe('POST');
  });
});

// ─── resolveDispute ─────────────────────────────────────────

describe('escrowService.resolveDispute', () => {
  it('sends refund/payout amounts and notes', async () => {
    mockFetchOnce(fetchMock, { success: true, escrow: sampleEscrow });

    await escrowService.resolveDispute('e1', 1000, 3000, 'Split decision');

    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toBe(`${API}/escrow/e1/resolve-dispute`);
    const body = JSON.parse(opts.body as string);
    expect(body.refund_to_requester).toBe(1000);
    expect(body.payout_to_owner).toBe(3000);
    expect(body.admin_notes).toBe('Split decision');
  });
});

// ─── Utility functions ──────────────────────────────────────

describe('escrowService utilities', () => {
  describe('getStatusVariant', () => {
    it.each([
      ['released', 'success'],
      ['dispute_resolved', 'success'],
      ['held', 'info'],
      ['partially_released', 'info'],
      ['pending', 'warning'],
      ['release_pending', 'warning'],
      ['refunded', 'secondary'],
      ['expired', 'danger'],
      ['disputed', 'danger'],
      ['release_failed', 'danger'],
    ] as const)('%s → %s', (status, variant) => {
      expect(escrowService.getStatusVariant(status)).toBe(variant);
    });
  });

  describe('getStatusLabel', () => {
    it('returns English labels', () => {
      expect(escrowService.getStatusLabel('held')).toBe('Held');
      expect(escrowService.getStatusLabel('released')).toBe('Released');
    });

    it('returns Arabic labels when RTL', () => {
      expect(escrowService.getStatusLabel('pending', true)).toBe('قيد الانتظار');
      expect(escrowService.getStatusLabel('refunded', true)).toBe('مُسترد');
    });
  });

  describe('formatMinutes', () => {
    it('shows minutes for < 60', () => {
      expect(escrowService.formatMinutes(45)).toBe('45 min');
      expect(escrowService.formatMinutes(45, true)).toBe('45 دقيقة');
    });

    it('shows hours for 60–1439', () => {
      expect(escrowService.formatMinutes(60)).toBe('1 hr');
      expect(escrowService.formatMinutes(90)).toBe('1h 30m');
      expect(escrowService.formatMinutes(90, true)).toBe('1س 30د');
    });

    it('shows days for >= 1440', () => {
      expect(escrowService.formatMinutes(1440)).toBe('1 day');
      expect(escrowService.formatMinutes(2880)).toBe('2 days');
      expect(escrowService.formatMinutes(1500)).toBe('1d 1h');
      expect(escrowService.formatMinutes(1440, true)).toBe('1 يوم');
      expect(escrowService.formatMinutes(1500, true)).toBe('1ي 1س');
    });
  });

  describe('formatCurrency', () => {
    it('formats with SAR default', () => {
      const formatted = escrowService.formatCurrency(1500);
      expect(formatted).toContain('1,500');
      expect(formatted).toContain('SAR');
    });
  });
});
