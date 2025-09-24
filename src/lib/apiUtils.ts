/**
 * API Utilities
 * 
 * Helper functions to ensure consistent authentication and error handling
 * across all API calls in the application.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Creates a fetch configuration with proper authentication headers
 * Uses HTTP-only cookies via credentials: 'include'
 */
export const createAuthenticatedFetchConfig = (
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  body?: any,
  additionalHeaders?: Record<string, string>
): RequestInit => {
  const config: RequestInit = {
    method,
    credentials: 'include', // Use HTTP-only cookies for authentication
    headers: {
      'Content-Type': 'application/json',
      ...additionalHeaders,
    },
  };

  if (body && method !== 'GET') {
    config.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  return config;
};

/**
 * Makes an authenticated API request with proper error handling
 */
export const authenticatedFetch = async <T>(
  endpoint: string,
  config: RequestInit
): Promise<T> => {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

/**
 * Helper for GET requests with authentication
 */
export const authenticatedGet = async <T>(endpoint: string): Promise<T> => {
  const config = createAuthenticatedFetchConfig('GET');
  return authenticatedFetch<T>(endpoint, config);
};

/**
 * Helper for POST requests with authentication
 */
export const authenticatedPost = async <T>(endpoint: string, data: any): Promise<T> => {
  const config = createAuthenticatedFetchConfig('POST', data);
  return authenticatedFetch<T>(endpoint, config);
};

/**
 * Helper for PUT requests with authentication
 */
export const authenticatedPut = async <T>(endpoint: string, data: any): Promise<T> => {
  const config = createAuthenticatedFetchConfig('PUT', data);
  return authenticatedFetch<T>(endpoint, config);
};

/**
 * Helper for DELETE requests with authentication
 */
export const authenticatedDelete = async <T>(endpoint: string): Promise<T> => {
  const config = createAuthenticatedFetchConfig('DELETE');
  return authenticatedFetch<T>(endpoint, config);
};

/**
 * Helper for file uploads with authentication
 */
export const authenticatedFileUpload = async <T>(
  endpoint: string,
  formData: FormData
): Promise<T> => {
  const config: RequestInit = {
    method: 'POST',
    credentials: 'include',
    body: formData,
    // Don't set Content-Type for FormData, let the browser set it with boundary
  };

  return authenticatedFetch<T>(endpoint, config);
};



