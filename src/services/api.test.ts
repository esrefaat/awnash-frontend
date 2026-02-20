import { setupFetchMock, mockFetchOnce, mockFetchError, mockFetchReject } from '../../test/helpers/mock-api';
import { ApiError, apiService, apiFetch, api } from './api';

let fetchMock: jest.Mock;

beforeEach(() => {
  fetchMock = setupFetchMock();
});

describe('ApiError', () => {
  it('stores status and data', () => {
    const err = new ApiError('fail', 400, { field: 'name' });
    expect(err.message).toBe('fail');
    expect(err.status).toBe(400);
    expect(err.data).toEqual({ field: 'name' });
    expect(err.name).toBe('ApiError');
  });

  it.each([
    ['isAuthError', 401, true],
    ['isAuthError', 403, false],
    ['isForbidden', 403, true],
    ['isForbidden', 404, false],
    ['isNotFound', 404, true],
    ['isNotFound', 400, false],
    ['isValidationError', 400, true],
    ['isValidationError', 422, true],
    ['isValidationError', 500, false],
  ] as const)('%s returns %s for status %d', (method, status, expected) => {
    const err = new ApiError('test', status);
    expect((err as any)[method]()).toBe(expected);
  });
});

describe('apiService', () => {
  it('GET returns camelCase-transformed data', async () => {
    mockFetchOnce(fetchMock, { user_name: 'Alice', is_active: true });

    const result = await apiService.get('/users/1');

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/users/1'),
      expect.objectContaining({ method: 'GET', credentials: 'include' }),
    );
    expect(result).toEqual(
      expect.objectContaining({ userName: 'Alice', isActive: true }),
    );
  });

  it('POST sends snake_case body', async () => {
    mockFetchOnce(fetchMock, { id: '1' });

    await apiService.post('/users', { fullName: 'Bob' });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body).toEqual({ full_name: 'Bob' });
  });

  it('throws ApiError with status 401 on unauthorized', async () => {
    mockFetchError(fetchMock, 'Unauthorized', 401);

    try {
      await apiService.get('/me');
      fail('should have thrown');
    } catch (e: any) {
      expect(e).toBeInstanceOf(ApiError);
      expect(e.status).toBe(401);
    }
  });

  it('parses array error messages', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ message: ['field1 required', 'field2 invalid'] }),
      text: () => Promise.resolve(''),
      headers: new Headers(),
    });

    await expect(apiService.post('/users', {})).rejects.toThrow('field1 required, field2 invalid');
  });

  it('handles empty 204 response', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 204,
      text: () => Promise.resolve(''),
      headers: new Headers(),
    });

    const result = await apiService.delete('/users/1');
    expect(result).toEqual({ data: null, success: true });
  });

  it('wraps network errors in ApiError with status 0', async () => {
    mockFetchReject(fetchMock, 'DNS lookup failed');

    try {
      await apiService.get('/test');
      fail('should have thrown');
    } catch (e: any) {
      expect(e).toBeInstanceOf(ApiError);
      expect(e.status).toBe(0);
      expect(e.message).toBe('DNS lookup failed');
    }
  });

  it('requestWithoutAuthRedirect throws but skips redirect logic', async () => {
    mockFetchError(fetchMock, 'Unauthorized', 401);

    try {
      await apiService.requestWithoutAuthRedirect('/me');
      fail('should have thrown');
    } catch (e: any) {
      expect(e).toBeInstanceOf(ApiError);
      expect(e.status).toBe(401);
    }
  });

  it('falls back to status-based message when JSON parse fails', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 503,
      json: () => Promise.reject(new Error('not json')),
      text: () => Promise.resolve('not json'),
      headers: new Headers(),
    });

    await expect(apiService.get('/down')).rejects.toThrow('Request failed with status 503');
  });
});

describe('apiFetch', () => {
  it('returns camelCase-transformed data', async () => {
    mockFetchOnce(fetchMock, { first_name: 'Eve' });
    const result = await apiFetch('/users/1');
    expect(result).toEqual({ firstName: 'Eve' });
  });

  it('returns null for empty response', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 204,
      text: () => Promise.resolve(''),
      headers: new Headers(),
    });

    const result = await apiFetch('/empty');
    expect(result).toBeNull();
  });

  it('throws ApiError with 401 on unauthorized', async () => {
    mockFetchError(fetchMock, 'expired', 401);
    await expect(apiFetch('/protected')).rejects.toThrow('Session expired');
  });

  it('throws ApiError on non-ok response', async () => {
    mockFetchError(fetchMock, 'Bad input', 422);
    await expect(apiFetch('/data')).rejects.toThrow('Bad input');
  });

  it('wraps network error in ApiError', async () => {
    mockFetchReject(fetchMock, 'offline');
    try {
      await apiFetch('/test');
      fail('should have thrown');
    } catch (e: any) {
      expect(e).toBeInstanceOf(ApiError);
      expect(e.status).toBe(0);
    }
  });
});

describe('api convenience wrapper', () => {
  it('api.get calls fetch with credentials', async () => {
    mockFetchOnce(fetchMock, { ok: true });
    await api.get('/test');
    expect(fetchMock.mock.calls[0][1]).toEqual(
      expect.objectContaining({ credentials: 'include' }),
    );
  });

  it('api.post sends snake_case body', async () => {
    mockFetchOnce(fetchMock, { id: '1' });
    await api.post('/items', { itemName: 'Crane' });
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body).toEqual({ item_name: 'Crane' });
  });

  it('api.delete uses DELETE method', async () => {
    mockFetchOnce(fetchMock, {});
    await api.delete('/items/1');
    expect(fetchMock.mock.calls[0][1].method).toBe('DELETE');
  });
});
