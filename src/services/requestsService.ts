import { apiService } from './api';

export interface RentalRequest {
  id: string;
  requestId: string;
  equipment_type: string;
  status: string;
  priority: string;
  images: string[];
  start_date: string;
  end_date: string;
  size: string;
  max_budget: number;
  count: number;
  location: {
    x: number;
    y: number;
  };
  city: string;
  location_address: string;
  note: string;
  created_at: string;
  requester: {
    id: string;
    full_name: string;
    mobile_number: string;
    email: string;
    role: string;
    is_verified: boolean;
    created_at: string;
    updated_at: string;
  };
}

export interface CreateRequestData {
  equipment_type: string;
  status: string;
  priority: string;
  images: string[];
  start_date: string;
  end_date: string;
  size: string;
  max_budget: number;
  city: string;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  location_address: string | null;
  note: string;
}

class RequestsService {
  private baseUrl = 'http://localhost:3001';

  async getRequests(): Promise<RentalRequest[]> {
    try {
      const url = `${this.baseUrl}/api/booking/request`;
      
      console.log('Fetching requests from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include'
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to fetch requests: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('API response data:', data);
      
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
      
      console.log('Processed requests:', requests);
      return requests;
    } catch (error) {
      console.error('Error fetching requests:', error);
      // Return empty array on error instead of throwing
      return [];
    }
  }

  async createRequest(requestData: CreateRequestData): Promise<RentalRequest> {
    try {
      const response = await fetch(`${this.baseUrl}/api/booking/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create request');
      }

      const result = await response.json();
      return result.request || result;
    } catch (error) {
      console.error('Error creating request:', error);
      throw error;
    }
  }

  async updateRequest(requestId: string, requestData: Partial<CreateRequestData>): Promise<RentalRequest> {
    try {
      const response = await fetch(`${this.baseUrl}/api/booking/request/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update request');
      }

      const result = await response.json();
      return result.request || result;
    } catch (error) {
      console.error('Error updating request:', error);
      throw error;
    }
  }

  async deleteRequest(requestId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/booking/request/${requestId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete request');
      }
    } catch (error) {
      console.error('Error deleting request:', error);
      throw error;
    }
  }

  async getRequestById(requestId: string): Promise<RentalRequest | null> {
    try {
      console.log('Fetching request by ID:', requestId);
      
      const response = await fetch(`${this.baseUrl}/api/booking/request/${requestId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        console.error('Failed to fetch request:', response.status, response.statusText);
        return null;
      }

      const data = await response.json();
      console.log('Request data received:', data);

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
