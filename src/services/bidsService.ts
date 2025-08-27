/**
 * Bids Service
 * 
 * Service for handling bids-related API calls
 */

export interface Bid {
  id: string;
  request_id: string;
  equipment_id: string;
  daily_rate: number;
  daily_rate_currency: string;
  total_amount: number;
  total_amount_currency: string;
  expires_at: string;
  note: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  images: string[];
  documents: string[];
  bidder: {
    id: string;
    full_name: string;
    email: string;
    mobile_number?: string;
    role?: string;
  };
  equipment?: {
    id: string;
    name: string;
    equipment_type: string;
    size: string;
    city: string;
    image_urls: string[];
  };
  request?: {
    id: string;
    equipment_type: string;
    requester: {
      id: string;
      full_name: string;
      email: string;
    };
    start_date: string;
    end_date: string;
  };
  isNew?: boolean;
}

export interface CreateBidData {
  request_id: string;
  equipment_id: string;
  daily_rate: number;
  daily_rate_currency: string;
  total_amount: number;
  total_amount_currency: string;
  expires_at: string;
  note: string;
}

export interface PaginatedBidsResponse {
  data: Bid[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

class BidsService {
  private baseUrl = 'http://localhost:3001';

  async getBidsByRequestId(
    requestId: string, 
    page: number = 1, 
    limit: number = 10
  ): Promise<PaginatedBidsResponse> {
    try {
      console.log('Fetching bids for request:', requestId, 'page:', page, 'limit:', limit);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      const response = await fetch(`${this.baseUrl}/api/booking/bid/${requestId}?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        console.error('Failed to fetch bids:', response.status, response.statusText);
        return {
          data: [],
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPrevPage: false
          }
        };
      }

      const data = await response.json();
      console.log('Bids data received:', data);

      // Handle different response structures
      let bids: Bid[] = [];
      let pagination = {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false
      };
      
      if (data && data.data && Array.isArray(data.data)) {
        bids = data.data;
        pagination = data.pagination || pagination;
      } else if (data && Array.isArray(data)) {
        bids = data;
        pagination = {
          page: 1,
          limit: data.length,
          total: data.length,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false
        };
      } else if (data && typeof data === 'object') {
        // If it's a single bid object, wrap it in an array
        bids = [data];
        pagination = {
          page: 1,
          limit: 1,
          total: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false
        };
      }
      
      console.log('Processed bids:', bids);
      console.log('Pagination:', pagination);
      
      return {
        data: bids,
        pagination
      };
    } catch (error) {
      console.error('Error fetching bids:', error);
      return {
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false
        }
      };
    }
  }

  async createBid(bidData: CreateBidData): Promise<Bid> {
    try {
      const response = await fetch(`${this.baseUrl}/api/booking/bid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(bidData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create bid');
      }

      const result = await response.json();
      return result.bid || result;
    } catch (error) {
      console.error('Error creating bid:', error);
      throw error;
    }
  }

  async updateBid(bidId: string, bidData: Partial<CreateBidData>): Promise<Bid> {
    try {
      const response = await fetch(`${this.baseUrl}/api/booking/bid/${bidId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(bidData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update bid');
      }

      const result = await response.json();
      return result.bid || result;
    } catch (error) {
      console.error('Error updating bid:', error);
      throw error;
    }
  }

  async deleteBid(bidId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/booking/bid/${bidId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete bid');
      }
    } catch (error) {
      console.error('Error deleting bid:', error);
      throw error;
    }
  }

  async acceptBid(bidId: string): Promise<Bid> {
    try {
      const response = await fetch(`${this.baseUrl}/api/booking/bid/${bidId}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to accept bid');
      }

      const result = await response.json();
      return result.bid || result;
    } catch (error) {
      console.error('Error accepting bid:', error);
      throw error;
    }
  }

  async rejectBid(bidId: string): Promise<Bid> {
    try {
      const response = await fetch(`${this.baseUrl}/api/booking/bid/${bidId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reject bid');
      }

      const result = await response.json();
      return result.bid || result;
    } catch (error) {
      console.error('Error rejecting bid:', error);
      throw error;
    }
  }
}

export const bidsService = new BidsService();
