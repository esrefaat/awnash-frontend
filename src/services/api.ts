// API Configuration  
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3007/api/v1';

/**
 * API Service Configuration
 * 
 * This service uses HTTP-only cookies for authentication via 'credentials: include'
 * All API calls should use this service to ensure proper authentication.
 * 
 * Features:
 * - Automatic 401 handling with redirect to login
 * - Consistent error handling
 * - Type-safe responses
 * 
 * Authentication is handled automatically by the browser when credentials: 'include' is set.
 * The server should set HTTP-only cookies during login that will be sent with all requests.
 */

interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Custom API Error with status code and response data
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly data?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  /**
   * Check if error is an authentication error
   */
  isAuthError(): boolean {
    return this.status === 401;
  }

  /**
   * Check if error is a forbidden error
   */
  isForbidden(): boolean {
    return this.status === 403;
  }

  /**
   * Check if error is a not found error
   */
  isNotFound(): boolean {
    return this.status === 404;
  }

  /**
   * Check if error is a validation error
   */
  isValidationError(): boolean {
    return this.status === 400 || this.status === 422;
  }
}

class ApiService {
  private baseUrl: string;
  private isRefreshing: boolean = false;
  private refreshPromise: Promise<boolean> | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Handle 401 errors - redirect to login
   */
  private handleUnauthorized(): void {
    // Clear any stored auth state
    if (typeof window !== 'undefined') {
      // Redirect to login page
      window.location.href = '/login';
    }
  }

  /**
   * Parse error response from API
   */
  private async parseErrorResponse(response: Response): Promise<string> {
    try {
      const errorData = await response.json();
      // Handle different error response formats
      if (typeof errorData.message === 'string') {
        return errorData.message;
      }
      if (Array.isArray(errorData.message)) {
        return errorData.message.join(', ');
      }
      if (errorData.error) {
        return errorData.error;
      }
      return `Request failed with status ${response.status}`;
    } catch {
      return `Request failed with status ${response.status}`;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    skipAuthRedirect: boolean = false
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const config: RequestInit = {
      ...options,
      credentials: 'include', // Use HTTP-only cookies for authentication
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      // Handle 401 Unauthorized
      if (response.status === 401 && !skipAuthRedirect) {
        console.warn('Unauthorized request, redirecting to login');
        this.handleUnauthorized();
        throw new ApiError('Session expired. Please log in again.', 401);
      }

      // Handle other error responses
      if (!response.ok) {
        const errorMessage = await this.parseErrorResponse(response);
        throw new ApiError(errorMessage, response.status);
      }

      // Handle empty responses (204 No Content, etc.)
      const text = await response.text();
      if (!text) {
        return { data: null as T, success: true };
      }

      const data = JSON.parse(text);
      return data;
    } catch (error) {
      // Re-throw ApiError as-is
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Handle network errors
      console.error('API request failed:', error);
      throw new ApiError(
        error instanceof Error ? error.message : 'Network error',
        0
      );
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async getPaginated<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean>
  ): Promise<ApiResponse<PaginatedResponse<T>>> {
    const queryString = params 
      ? '?' + new URLSearchParams(
          Object.entries(params).reduce((acc, [key, value]) => {
            acc[key] = String(value);
            return acc;
          }, {} as Record<string, string>)
        ).toString() 
      : '';
    return this.request<PaginatedResponse<T>>(`${endpoint}${queryString}`);
  }

  /**
   * Make a request without redirecting on 401
   * Useful for checking auth status
   */
  async requestWithoutAuthRedirect<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, options, true);
  }
}

export const apiService = new ApiService();
export type { ApiResponse, PaginatedResponse };

/**
 * Standalone apiFetch function
 * 
 * Alternative to class-based apiService for simpler usage.
 * Includes automatic 401 handling and error parsing.
 * 
 * @example
 * ```typescript
 * // GET request
 * const users = await apiFetch<User[]>('/v1/users');
 * 
 * // POST request
 * const newUser = await apiFetch<User>('/v1/users', {
 *   method: 'POST',
 *   body: JSON.stringify({ name: 'John' }),
 * });
 * 
 * // With custom options
 * const data = await apiFetch<Data>('/v1/data', {
 *   headers: { 'X-Custom-Header': 'value' },
 * });
 * ```
 */
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    // Handle 401 Unauthorized
    if (response.status === 401) {
      console.warn('Unauthorized request, redirecting to login');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new ApiError('Session expired. Please log in again.', 401);
    }

    // Handle other error responses
    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;
      try {
        const errorData = await response.json();
        if (typeof errorData.message === 'string') {
          errorMessage = errorData.message;
        } else if (Array.isArray(errorData.message)) {
          errorMessage = errorData.message.join(', ');
        }
      } catch {
        // Use default error message
      }
      throw new ApiError(errorMessage, response.status);
    }

    // Handle empty responses
    const text = await response.text();
    if (!text) {
      return null as T;
    }

    return JSON.parse(text);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error',
      0
    );
  }
}

/**
 * Convenience wrapper functions
 */
export const api = {
  get: <T>(endpoint: string) => apiFetch<T>(endpoint),
  
  post: <T>(endpoint: string, data: unknown) => 
    apiFetch<T>(endpoint, { 
      method: 'POST', 
      body: JSON.stringify(data) 
    }),
  
  put: <T>(endpoint: string, data: unknown) => 
    apiFetch<T>(endpoint, { 
      method: 'PUT', 
      body: JSON.stringify(data) 
    }),
  
  patch: <T>(endpoint: string, data: unknown) => 
    apiFetch<T>(endpoint, { 
      method: 'PATCH', 
      body: JSON.stringify(data) 
    }),
  
  delete: <T>(endpoint: string) => 
    apiFetch<T>(endpoint, { method: 'DELETE' }),
}; 