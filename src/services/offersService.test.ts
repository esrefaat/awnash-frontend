import { setupFetchMock, mockFetchOnce, mockFetchReject } from '../../test/helpers/mock-api';
import { offersService } from './offersService';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3007/v1';

let fetchMock: jest.Mock;

beforeEach(() => {
  fetchMock = setupFetchMock();
});

const sampleOffer = {
  id: 'o1',
  request_id: 'r1',
  daily_rate: 500,
  currency: 'SAR',
  price: 5000,
  status: 'pending',
  notes: '',
  expires_at: '2026-03-01',
  created_at: '2026-02-01',
  updated_at: '2026-02-01',
  images: [],
  documents: [],
  owner: null,
};

// ─── getOffers ───────────────────────────────────────────────

describe('offersService.getOffers', () => {
  it('builds correct query params and normalizes wrapped response', async () => {
    mockFetchOnce(fetchMock, {
      data: [sampleOffer],
      pagination: { page: 2, limit: 10, total: 30, total_pages: 3 },
    });

    const result = await offersService.getOffers(2, 10, 'pending');

    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toBe(`${API}/offers?page=2&limit=10&status=pending`);
    expect(result.data).toHaveLength(1);
    expect(result.data[0].requestId).toBe('r1');
    expect(result.pagination.page).toBe(2);
    expect(result.pagination.totalPages).toBe(3);
  });

  it('normalizes a plain array response', async () => {
    mockFetchOnce(fetchMock, [sampleOffer, sampleOffer]);

    const result = await offersService.getOffers();

    expect(result.data).toHaveLength(2);
    expect(result.pagination.total).toBe(2);
    expect(result.pagination.totalPages).toBe(1);
  });

  it('omits status param when not provided', async () => {
    mockFetchOnce(fetchMock, { data: [], pagination: { page: 1, limit: 20, total: 0, total_pages: 0 } });

    await offersService.getOffers(1, 20);

    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).not.toContain('status');
  });

  it('returns empty response on network error', async () => {
    mockFetchReject(fetchMock, 'Network error');

    const result = await offersService.getOffers();

    expect(result.data).toEqual([]);
    expect(result.pagination.total).toBe(0);
  });
});

// ─── getMyOffers ─────────────────────────────────────────────

describe('offersService.getMyOffers', () => {
  it('calls /offers/me endpoint', async () => {
    mockFetchOnce(fetchMock, { data: [], pagination: { page: 1, limit: 20, total: 0, total_pages: 0 } });

    await offersService.getMyOffers(1, 20, 'accepted');

    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain('/offers/me?');
    expect(url).toContain('status=accepted');
  });
});

// ─── getOffersByRequestId ────────────────────────────────────

describe('offersService.getOffersByRequestId', () => {
  it('calls /offers/request/:id endpoint', async () => {
    mockFetchOnce(fetchMock, { data: [sampleOffer], pagination: { page: 1, limit: 10, total: 1, total_pages: 1 } });

    const result = await offersService.getOffersByRequestId('req-123', 1, 10);

    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain('/offers/request/req-123?');
    expect(result.data).toHaveLength(1);
  });

  it('returns empty response on error', async () => {
    mockFetchReject(fetchMock);

    const result = await offersService.getOffersByRequestId('req-123');

    expect(result.data).toEqual([]);
  });
});

// ─── getOfferById ────────────────────────────────────────────

describe('offersService.getOfferById', () => {
  it('returns the offer on success', async () => {
    mockFetchOnce(fetchMock, sampleOffer);

    const result = await offersService.getOfferById('o1');

    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toBe(`${API}/offers/o1`);
    expect(result).not.toBeNull();
    expect(result!.id).toBe('o1');
  });

  it('returns null on error', async () => {
    mockFetchReject(fetchMock, 'Not found');

    const result = await offersService.getOfferById('missing');

    expect(result).toBeNull();
  });
});

// ─── createOffer ─────────────────────────────────────────────

describe('offersService.createOffer', () => {
  it('sends POST and extracts result.offer', async () => {
    mockFetchOnce(fetchMock, { offer: sampleOffer });

    const result = await offersService.createOffer({ requestId: 'r1', price: 5000 });

    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toBe(`${API}/offers`);
    expect(opts.method).toBe('POST');
    expect(result.id).toBe('o1');
  });

  it('falls back to result when offer key is absent', async () => {
    mockFetchOnce(fetchMock, sampleOffer);

    const result = await offersService.createOffer({ requestId: 'r1' });

    expect(result.id).toBe('o1');
  });
});

// ─── acceptOffer ─────────────────────────────────────────────

describe('offersService.acceptOffer', () => {
  it('calls POST /offers/:id/accept', async () => {
    mockFetchOnce(fetchMock, { success: true, message: 'Accepted', offer: sampleOffer });

    await offersService.acceptOffer('o1');

    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toBe(`${API}/offers/o1/accept`);
    expect(opts.method).toBe('POST');
  });
});

// ─── rejectOffer ─────────────────────────────────────────────

describe('offersService.rejectOffer', () => {
  it('calls POST with reason in body', async () => {
    mockFetchOnce(fetchMock, { success: true, message: 'Rejected', offer: sampleOffer });

    await offersService.rejectOffer('o1', 'Price too high');

    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toBe(`${API}/offers/o1/reject`);
    expect(opts.method).toBe('POST');
    const body = JSON.parse(opts.body as string);
    expect(body.reason).toBe('Price too high');
  });
});
