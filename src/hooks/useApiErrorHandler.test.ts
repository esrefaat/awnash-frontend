import { renderHook, act } from '@testing-library/react';
import { useApiErrorHandler, usePermissionErrorHandler } from './useApiErrorHandler';

const mockSessionStorage: Record<string, string> = {};
const mockSetItem = jest.fn((key: string, value: string) => { mockSessionStorage[key] = value; });

beforeEach(() => {
  Object.keys(mockSessionStorage).forEach(k => delete mockSessionStorage[k]);
  mockSetItem.mockClear();

  Object.defineProperty(window, 'sessionStorage', {
    value: {
      getItem: (key: string) => mockSessionStorage[key] ?? null,
      setItem: mockSetItem,
      removeItem: (key: string) => { delete mockSessionStorage[key]; },
      clear: () => { Object.keys(mockSessionStorage).forEach(k => delete mockSessionStorage[k]); },
    },
    writable: true,
    configurable: true,
  });
});

describe('useApiErrorHandler', () => {
  describe('handleApiError', () => {
    it('handles axios error format', () => {
      const { result } = renderHook(() => useApiErrorHandler());

      act(() => {
        result.current.handleApiError({
          response: {
            status: 400,
            data: { message: 'Validation failed', error: 'Bad Request' },
          },
        });
      });

      expect(result.current.error).toEqual(
        expect.objectContaining({ statusCode: 400, message: 'Validation failed' }),
      );
    });

    it('handles fetch error format', () => {
      const { result } = renderHook(() => useApiErrorHandler());

      act(() => {
        result.current.handleApiError({ status: 404, message: 'Not found', error: 'NotFound' });
      });

      expect(result.current.error).toEqual(
        expect.objectContaining({ statusCode: 404, message: 'Not found' }),
      );
    });

    it('handles string errors', () => {
      const { result } = renderHook(() => useApiErrorHandler());

      act(() => {
        result.current.handleApiError('Something went wrong');
      });

      expect(result.current.error).toEqual(
        expect.objectContaining({ statusCode: 500, message: 'Something went wrong' }),
      );
    });

    it('detects permission errors and sets 403', () => {
      const { result } = renderHook(() => useApiErrorHandler());

      act(() => {
        result.current.handleApiError(new Error('Missing required permissions for this action'));
      });

      expect(result.current.error).toEqual(
        expect.objectContaining({ statusCode: 403, error: 'Forbidden' }),
      );
    });

    it('detects "not authorized" errors and sets 401', () => {
      const { result } = renderHook(() => useApiErrorHandler());

      act(() => {
        result.current.handleApiError(new Error('User is not authorized'));
      });

      expect(result.current.error).toEqual(
        expect.objectContaining({ statusCode: 401, error: 'Unauthorized' }),
      );
    });

    it('detects "unauthorized" errors and sets 401', () => {
      const { result } = renderHook(() => useApiErrorHandler());

      act(() => {
        result.current.handleApiError(new Error('unauthorized access'));
      });

      expect(result.current.error).toEqual(
        expect.objectContaining({ statusCode: 401, error: 'Unauthorized' }),
      );
    });

    it('handles generic Error objects with 500', () => {
      const { result } = renderHook(() => useApiErrorHandler());

      act(() => {
        result.current.handleApiError(new Error('Random failure'));
      });

      expect(result.current.error).toEqual(
        expect.objectContaining({ statusCode: 500, message: 'Random failure' }),
      );
    });

    it('handles null/undefined errors', () => {
      const { result } = renderHook(() => useApiErrorHandler());

      act(() => {
        result.current.handleApiError(null);
      });

      expect(result.current.error).toEqual(
        expect.objectContaining({ statusCode: 500 }),
      );
    });
  });

  describe('clearError', () => {
    it('resets error to null', () => {
      const { result } = renderHook(() => useApiErrorHandler());

      act(() => {
        result.current.handleApiError('test error');
      });
      expect(result.current.error).not.toBeNull();

      act(() => {
        result.current.clearError();
      });
      expect(result.current.error).toBeNull();
    });
  });

  describe('showInlineError', () => {
    it('sets the error state', () => {
      const { result } = renderHook(() => useApiErrorHandler());

      act(() => {
        result.current.showInlineError({ statusCode: 422, message: 'Invalid input' });
      });

      expect(result.current.error).toEqual(
        expect.objectContaining({ statusCode: 422, message: 'Invalid input' }),
      );
    });
  });

  describe('showErrorPage', () => {
    it('stores error in sessionStorage', () => {
      const { result } = renderHook(() => useApiErrorHandler());

      act(() => {
        result.current.showErrorPage({ statusCode: 500, message: 'Server Error' });
      });

      expect(mockSetItem).toHaveBeenCalledWith(
        'apiError',
        expect.stringContaining('"statusCode":500'),
      );
      const stored = JSON.parse(mockSetItem.mock.calls[0][1]);
      expect(stored.statusCode).toBe(500);
      expect(stored.message).toBe('Server Error');
    });
  });
});

describe('usePermissionErrorHandler', () => {
  it('detects permission errors and returns true', () => {
    const { result } = renderHook(() => usePermissionErrorHandler());

    let isPermError: boolean;
    act(() => {
      isPermError = result.current.handlePermissionError({
        response: { data: { message: 'Missing required permissions for resource' } },
      });
    });

    expect(isPermError!).toBe(true);
  });

  it('returns false for non-permission errors', () => {
    const { result } = renderHook(() => usePermissionErrorHandler());

    let isPermError: boolean;
    act(() => {
      isPermError = result.current.handlePermissionError({ response: { data: { message: 'Not found' } } });
    });

    expect(isPermError!).toBe(false);
  });
});
