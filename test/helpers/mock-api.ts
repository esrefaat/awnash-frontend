/**
 * Helpers for mocking the global fetch in service tests.
 */

interface MockFetchResponse {
  ok?: boolean;
  status?: number;
  statusText?: string;
  json?: () => Promise<unknown>;
  text?: () => Promise<string>;
  blob?: () => Promise<Blob>;
  headers?: Headers;
}

/**
 * Create a mock Response-like object that fetch would return.
 */
export function mockResponse(
  body: unknown,
  init: { status?: number; ok?: boolean; statusText?: string } = {}
): MockFetchResponse {
  const status = init.status ?? 200;
  const ok = init.ok ?? (status >= 200 && status < 300);
  const text = typeof body === 'string' ? body : JSON.stringify(body);

  return {
    ok,
    status,
    statusText: init.statusText ?? (ok ? 'OK' : 'Error'),
    json: () => Promise.resolve(typeof body === 'string' ? JSON.parse(body) : body),
    text: () => Promise.resolve(text),
    blob: () => Promise.resolve(new Blob([text])),
    headers: new Headers(),
  };
}

/**
 * Set up global.fetch as a jest.fn(). Returns the mock for chaining.
 */
export function setupFetchMock(): jest.Mock {
  const mockFetch = jest.fn();
  global.fetch = mockFetch as unknown as typeof fetch;
  return mockFetch;
}

/**
 * Queue a single successful response on the fetch mock.
 */
export function mockFetchOnce(mock: jest.Mock, body: unknown, status = 200) {
  mock.mockResolvedValueOnce(mockResponse(body, { status }));
}

/**
 * Queue an error response on the fetch mock.
 */
export function mockFetchError(mock: jest.Mock, message: string, status = 500) {
  mock.mockResolvedValueOnce(
    mockResponse({ message }, { status })
  );
}

/**
 * Queue a network-level failure (fetch rejects).
 */
export function mockFetchReject(mock: jest.Mock, error = 'Network error') {
  mock.mockRejectedValueOnce(new Error(error));
}

/**
 * Restore fetch to its original implementation.
 */
export function restoreFetch() {
  if ('mockRestore' in global.fetch) {
    (global.fetch as jest.Mock).mockRestore();
  }
}
