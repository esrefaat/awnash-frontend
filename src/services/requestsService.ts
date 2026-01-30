import { apiService } from './api';
import { transformKeysToCamelCase, transformKeysToSnakeCase } from '@/lib/caseTransform';

export interface RentalRequest {
  id: string;
  requestId: string;
  requestNumber?: string;
  equipmentType: string;
  equipmentTypeId?: string;
  status: string;
  priority: string;
  images: string[];
  startDate: string;
  endDate: string;
  maxBudget: number;
  count: number;
  location: {
    x: number;
    y: number;
  };
  city: string;
  locationAddress: string;
  notes: string;
  createdAt: string;
  requester: {
    id: string;
    fullName: string;
    mobileNumber: string;
    email: string;
    role: string;
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

export interface CreateRequestData {
  equipmentType: string;
  status: string;
  priority: string;
  images: string[];
  startDate: string;
  endDate: string;
  maxBudget: number;
  city: string;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  locationAddress: string | null;
  notes: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3007/api/v1';

class RequestsService {
  private baseUrl = API_BASE_URL;

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Transform request body to snake_case if present
    let body = options.body;
    if (body && typeof body === 'string') {
      try {
        const parsed = JSON.parse(body);
        body = JSON.stringify(transformKeysToSnakeCase(parsed));
      } catch {
        // Not JSON, use as-is
      }
    }
    
    const response = await fetch(url, {
      ...options,
      body,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return transformKeysToCamelCase(data) as T;
  }

  async getRequests(): Promise<RentalRequest[]> {
    try {
      const data = await this.makeRequest<any>('/requests', { method: 'GET' });
      
      // The API returns data in a nested structure
      let requests: RentalRequest[] = [];
      
      if (data && Array.isArray(data.data)) {
        requests = data.data;
      } else if (Array.isArray(data)) {
        requests = data;
      } else if (data && typeof data === 'object') {
        // If it's a single request object, wrap it in an array
        requests = [data];
      }
      
      return requests;
    } catch (error) {
      console.error('Error fetching requests:', error);
      // Return empty array on error instead of throwing
      return [];
    }
  }

  async createRequest(requestData: CreateRequestData): Promise<RentalRequest> {
    try {
      const result = await this.makeRequest<any>('/requests', {
        method: 'POST',
        body: JSON.stringify(requestData),
      });
      return result.request || result;
    } catch (error) {
      console.error('Error creating request:', error);
      throw error;
    }
  }

  async updateRequest(requestId: string, requestData: Partial<CreateRequestData>): Promise<RentalRequest> {
    try {
      const result = await this.makeRequest<any>(`/requests/${requestId}`, {
        method: 'PUT',
        body: JSON.stringify(requestData),
      });
      return result.request || result;
    } catch (error) {
      console.error('Error updating request:', error);
      throw error;
    }
  }

  async deleteRequest(requestId: string): Promise<void> {
    try {
      await this.makeRequest<any>(`/requests/${requestId}`, { method: 'DELETE' });
    } catch (error) {
      console.error('Error deleting request:', error);
      throw error;
    }
  }

  async getRequestById(requestId: string): Promise<RentalRequest | null> {
    try {
      const data = await this.makeRequest<any>(`/requests/${requestId}`, { method: 'GET' });

      // Handle different response structures
      let requestData = data;
      if (data.data) {
        requestData = data.data;
      }

      return requestData as RentalRequest;
    } catch (error) {
      console.error('Error fetching request by ID:', error);
      return null;
    }
  }
}

export const requestsService = new RequestsService();
