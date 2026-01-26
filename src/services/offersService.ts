/**
 * Offers Service
 * 
 * Service for handling offers-related API calls
 */

export interface Offer {
  id: string;
  request_id: string;
  equipment_id?: string;
  daily_rate: number;
  currency: string;
  price: number;
  expires_at: string;
  notes: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'cancelled';
  created_at: string;
  updated_at: string;
  images: string[];
  documents: string[];
  includes_delivery?: boolean;
  owner: {
    id: string;
    name: string;
    avatar_url?: string;
    rating?: number;
    total_reviews?: number;
  } | null;
  // Legacy field for backward compatibility
  bidder?: {
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
      name?: string;
      full_name?: string;
      email?: string;
    };
    start_date: string;
    end_date: string;
  };
  isNew?: boolean;
}

export interface CreateOfferData {
  request_id: string;
  equipment_id?: string;
  daily_rate?: number;
  price?: number;
  currency?: string;
  expires_at?: string;
  notes?: string;
  includes_delivery?: boolean;
  driver_id?: string;
  images?: string[];
  documents?: string[];
}

export interface PaginatedOffersResponse {
  data: Offer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3007/api/v1';

class OffersService {
  private baseUrl = API_BASE_URL;

  /**
   * Get all offers with optional filters
   */
  async getOffers(
    page: number = 1, 
    limit: number = 20,
    status?: string
  ): Promise<PaginatedOffersResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      if (status) {
        params.append('status', status);
      }
      
      const response = await fetch(`${this.baseUrl}/offers?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        console.error('Failed to fetch offers:', response.status, response.statusText);
        return this.emptyResponse();
      }

      const data = await response.json();
      return this.normalizeResponse(data);
    } catch (error) {
      console.error('Error fetching offers:', error);
      return this.emptyResponse();
    }
  }

  /**
   * Get my offers (as owner)
   */
  async getMyOffers(
    page: number = 1, 
    limit: number = 20,
    status?: string
  ): Promise<PaginatedOffersResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      if (status) {
        params.append('status', status);
      }
      
      const response = await fetch(`${this.baseUrl}/offers/me?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        console.error('Failed to fetch my offers:', response.status, response.statusText);
        return this.emptyResponse();
      }

      const data = await response.json();
      return this.normalizeResponse(data);
    } catch (error) {
      console.error('Error fetching my offers:', error);
      return this.emptyResponse();
    }
  }

  /**
   * Get offers for a specific request
   */
  async getOffersByRequestId(
    requestId: string, 
    page: number = 1, 
    limit: number = 10
  ): Promise<PaginatedOffersResponse> {
    try {
      console.log('Fetching offers for request:', requestId, 'page:', page, 'limit:', limit);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      const response = await fetch(`${this.baseUrl}/offers/request/${requestId}?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        console.error('Failed to fetch offers:', response.status, response.statusText);
        return this.emptyResponse();
      }

      const data = await response.json();
      return this.normalizeResponse(data);
    } catch (error) {
      console.error('Error fetching offers:', error);
      return this.emptyResponse();
    }
  }

  /**
   * Get available requests (for owners to make offers on)
   */
  async getAvailableRequests(
    page: number = 1,
    limit: number = 20,
    equipmentType?: string
  ): Promise<any> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      if (equipmentType) {
        params.append('equipment_type', equipmentType);
      }
      
      const response = await fetch(`${this.baseUrl}/offers/available-requests?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch available requests');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching available requests:', error);
      throw error;
    }
  }

  /**
   * Get offer by ID
   */
  async getOfferById(offerId: string): Promise<Offer | null> {
    try {
      const response = await fetch(`${this.baseUrl}/offers/${offerId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching offer:', error);
      return null;
    }
  }

  /**
   * Create a new offer
   */
  async createOffer(offerData: CreateOfferData): Promise<Offer> {
    try {
      const response = await fetch(`${this.baseUrl}/offers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(offerData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create offer');
      }

      const result = await response.json();
      return result.offer || result;
    } catch (error) {
      console.error('Error creating offer:', error);
      throw error;
    }
  }

  /**
   * Accept an offer (as requester)
   */
  async acceptOffer(offerId: string): Promise<{ success: boolean; message: string; offer: Offer }> {
    try {
      const response = await fetch(`${this.baseUrl}/offers/${offerId}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to accept offer');
      }

      return await response.json();
    } catch (error) {
      console.error('Error accepting offer:', error);
      throw error;
    }
  }

  /**
   * Reject an offer (as requester)
   */
  async rejectOffer(offerId: string, reason?: string): Promise<{ success: boolean; message: string; offer: Offer }> {
    try {
      const response = await fetch(`${this.baseUrl}/offers/${offerId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ reason })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reject offer');
      }

      return await response.json();
    } catch (error) {
      console.error('Error rejecting offer:', error);
      throw error;
    }
  }

  private emptyResponse(): PaginatedOffersResponse {
    return {
      data: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        total_pages: 0,
      }
    };
  }

  private normalizeResponse(data: any): PaginatedOffersResponse {
    let offers: Offer[] = [];
    let pagination = {
      page: 1,
      limit: 10,
      total: 0,
      total_pages: 0,
    };
    
    if (data && data.data && Array.isArray(data.data)) {
      offers = data.data;
      pagination = data.pagination || {
        page: data.page || 1,
        limit: data.limit || 10,
        total: data.total || offers.length,
        total_pages: data.total_pages || Math.ceil((data.total || offers.length) / (data.limit || 10)),
      };
    } else if (data && Array.isArray(data)) {
      offers = data;
      pagination = {
        page: 1,
        limit: data.length,
        total: data.length,
        total_pages: 1,
      };
    }
    
    return { data: offers, pagination };
  }
}

export const offersService = new OffersService();

// Legacy exports for backward compatibility
export type Bid = Offer;
export type CreateBidData = CreateOfferData;
export type PaginatedBidsResponse = PaginatedOffersResponse;
export const bidsService = {
  getBidsByRequestId: (requestId: string, page?: number, limit?: number) => 
    offersService.getOffersByRequestId(requestId, page, limit),
  createBid: (data: CreateOfferData) => offersService.createOffer(data),
  acceptBid: (id: string) => offersService.acceptOffer(id),
  rejectBid: (id: string) => offersService.rejectOffer(id),
};
