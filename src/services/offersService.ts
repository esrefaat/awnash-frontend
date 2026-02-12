/**
 * Offers Service
 * 
 * Service for handling offers-related API calls
 */

import { transformKeysToCamelCase, transformKeysToSnakeCase } from '@/lib/caseTransform';

export interface Offer {
  id: string;
  requestId: string;
  equipmentId?: string;
  dailyRate: number;
  currency: string;
  price: number;
  expiresAt: string;
  notes: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  images: string[];
  documents: string[];
  includesDelivery?: boolean;
  owner: {
    id: string;
    name: string;
    avatarUrl?: string;
    rating?: number;
    totalReviews?: number;
  } | null;
  // Legacy field for backward compatibility
  bidder?: {
    id: string;
    fullName: string;
    email: string;
    mobileNumber?: string;
    role?: string;
  };
  equipment?: {
    id: string;
    name: string;
    equipmentType: string;
    size: string;
    city: string;
    imageUrls: string[];
  };
  request?: {
    id: string;
    equipmentType: string;
    requester: {
      id: string;
      name?: string;
      fullName?: string;
      email?: string;
    };
    startDate: string;
    endDate: string;
  };
  isNew?: boolean;
}

export interface CreateOfferData {
  requestId: string;
  equipmentId?: string;
  dailyRate?: number;
  price?: number;
  currency?: string;
  expiresAt?: string;
  notes?: string;
  includesDelivery?: boolean;
  driverId?: string;
  images?: string[];
  documents?: string[];
}

export interface PaginatedOffersResponse {
  data: Offer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3007/v1';

class OffersService {
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
      
      const data = await this.makeRequest<any>(`/offers?${params}`, { method: 'GET' });
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
      
      const data = await this.makeRequest<any>(`/offers/me?${params}`, { method: 'GET' });
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
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      const data = await this.makeRequest<any>(`/offers/request/${requestId}?${params}`, { method: 'GET' });
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
      
      return await this.makeRequest<any>(`/offers/available-requests?${params}`, { method: 'GET' });
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
      return await this.makeRequest<Offer>(`/offers/${offerId}`, { method: 'GET' });
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
      const result = await this.makeRequest<any>('/offers', {
        method: 'POST',
        body: JSON.stringify(offerData),
      });
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
      return await this.makeRequest<{ success: boolean; message: string; offer: Offer }>(
        `/offers/${offerId}/accept`,
        { method: 'POST' }
      );
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
      return await this.makeRequest<{ success: boolean; message: string; offer: Offer }>(
        `/offers/${offerId}/reject`,
        {
          method: 'POST',
          body: JSON.stringify({ reason }),
        }
      );
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
        totalPages: 0,
      }
    };
  }

  private normalizeResponse(data: any): PaginatedOffersResponse {
    let offers: Offer[] = [];
    let pagination = {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    };
    
    if (data && data.data && Array.isArray(data.data)) {
      offers = data.data;
      pagination = data.pagination || {
        page: data.page || 1,
        limit: data.limit || 10,
        total: data.total || offers.length,
        totalPages: data.totalPages || Math.ceil((data.total || offers.length) / (data.limit || 10)),
      };
    } else if (data && Array.isArray(data)) {
      offers = data;
      pagination = {
        page: 1,
        limit: data.length,
        total: data.length,
        totalPages: 1,
      };
    }
    
    return { data: offers, pagination };
  }
}

export const offersService = new OffersService();
