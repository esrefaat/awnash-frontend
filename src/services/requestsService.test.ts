import { setupFetchMock, mockFetchOnce, mockFetchReject } from '../../test/helpers/mock-api';
import { requestsService } from './requestsService';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3007/v1';

let fetchMock: jest.Mock;

beforeEach(() => {
  fetchMock = setupFetchMock();
});

const sampleRequest = {
  id: 'req-1',
  request_id: 'REQ-001',
  equipment_type: 'crane',
  status: 'open',
  priority: 'high',
  images: [],
  start_date: '2026-03-01',
  end_date: '2026-03-15',
  max_budget: 10000,
  count: 1,
  location: { x: 46.7, y: 24.7 },
  city: 'Riyadh',
  location_address: '123 Main St',
  notes: '',
  created_at: '2026-02-01',
  requester: {
    id: 'u1',
    full_name: 'Ali',
    mobile_number: '+966500000000',
    email: 'ali@test.com',
    role: 'requester',
    is_verified: true,
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
  },
};

// ─── getRequests ─────────────────────────────────────────────

describe('requestsService.getRequests', () => {
  it('returns array from nested data.data shape', async () => {
    mockFetchOnce(fetchMock, { data: [sampleRequest] });

    const result = await requestsService.getRequests();

    expect(result).toHaveLength(1);
    expect(result[0].equipmentType).toBe('crane');
  });

  it('returns array when API returns plain array', async () => {
    mockFetchOnce(fetchMock, [sampleRequest, sampleRequest]);

    const result = await requestsService.getRequests();

    expect(result).toHaveLength(2);
  });

  it('wraps single object in array', async () => {
    mockFetchOnce(fetchMock, sampleRequest);

    const result = await requestsService.getRequests();

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('req-1');
  });

  it('returns empty array on network error', async () => {
    mockFetchReject(fetchMock, 'Network error');

    const result = await requestsService.getRequests();

    expect(result).toEqual([]);
  });
});

// ─── createRequest ───────────────────────────────────────────

describe('requestsService.createRequest', () => {
  it('sends POST and extracts result.request', async () => {
    mockFetchOnce(fetchMock, { request: sampleRequest });

    const payload = {
      equipmentType: 'crane',
      status: 'open',
      priority: 'high',
      images: [],
      startDate: '2026-03-01',
      endDate: '2026-03-15',
      maxBudget: 10000,
      city: 'Riyadh',
      location: null,
      latitude: null,
      longitude: null,
      locationAddress: null,
      notes: '',
    };

    const result = await requestsService.createRequest(payload);

    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toBe(`${API}/requests`);
    expect(opts.method).toBe('POST');
    expect(result.id).toBe('req-1');
  });

  it('falls back to raw result when request key is absent', async () => {
    mockFetchOnce(fetchMock, sampleRequest);

    const payload = {
      equipmentType: 'crane', status: 'open', priority: 'high',
      images: [], startDate: '', endDate: '', maxBudget: 0,
      city: '', location: null, latitude: null, longitude: null,
      locationAddress: null, notes: '',
    };

    const result = await requestsService.createRequest(payload);

    expect(result.id).toBe('req-1');
  });
});

// ─── updateRequest ───────────────────────────────────────────

describe('requestsService.updateRequest', () => {
  it('sends PUT to /requests/:id', async () => {
    mockFetchOnce(fetchMock, sampleRequest);

    await requestsService.updateRequest('req-1', { notes: 'updated' });

    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toBe(`${API}/requests/req-1`);
    expect(opts.method).toBe('PUT');
  });
});

// ─── deleteRequest ───────────────────────────────────────────

describe('requestsService.deleteRequest', () => {
  it('sends DELETE to /requests/:id', async () => {
    mockFetchOnce(fetchMock, {});

    await requestsService.deleteRequest('req-1');

    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toBe(`${API}/requests/req-1`);
    expect(opts.method).toBe('DELETE');
  });

  it('throws on network error', async () => {
    mockFetchReject(fetchMock, 'fail');

    await expect(requestsService.deleteRequest('req-1')).rejects.toThrow('fail');
  });
});

// ─── getRequestById ──────────────────────────────────────────

describe('requestsService.getRequestById', () => {
  it('returns request from nested data.data', async () => {
    mockFetchOnce(fetchMock, { data: sampleRequest });

    const result = await requestsService.getRequestById('req-1');

    expect(result).not.toBeNull();
    expect(result!.id).toBe('req-1');
  });

  it('returns request from flat response', async () => {
    mockFetchOnce(fetchMock, sampleRequest);

    const result = await requestsService.getRequestById('req-1');

    expect(result).not.toBeNull();
    expect(result!.equipmentType).toBe('crane');
  });

  it('returns null on error', async () => {
    mockFetchReject(fetchMock, 'not found');

    const result = await requestsService.getRequestById('missing');

    expect(result).toBeNull();
  });
});
