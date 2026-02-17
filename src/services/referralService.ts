import { transformKeysToCamelCase, transformKeysToSnakeCase } from '@/lib/caseTransform';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3007/v1';

// ============================================
// TYPES
// ============================================

export interface ReferralConfig {
  id: string;
  referrerRewardAmount: number;
  referredUserRewardAmount: number;
  rewardPayoutMethod: 'wallet_credit' | 'cash_payout';
  maxReferralsPerUser: number;
  isActive: boolean;
  updatedAt: string;
}

export interface UpdateReferralConfigDto {
  referrerRewardAmount?: number;
  referredUserRewardAmount?: number;
  rewardPayoutMethod?: 'wallet_credit' | 'cash_payout';
  maxReferralsPerUser?: number;
  isActive?: boolean;
}

export interface ReferralUser {
  id: string;
  fullName: string;
}

export interface Referral {
  id: string;
  referrer: ReferralUser;
  referredUser: ReferralUser;
  status: 'registered' | 'qualified' | 'rewarded' | 'expired';
  createdAt: string;
  qualifiedAt: string | null;
  rewardedAt: string | null;
}

export interface ReferralStats {
  totalReferrals: number;
  qualified: number;
  rewarded: number;
  pending: number;
  totalRewardsPaid: number;
  currency: string;
}

export interface PaginatedReferrals {
  referrals: Referral[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ReferralFilters {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// ============================================
// SERVICE
// ============================================

class ReferralService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    let body = options.body;
    if (body && typeof body === 'string') {
      try {
        const parsed = JSON.parse(body);
        body = JSON.stringify(transformKeysToSnakeCase(parsed));
      } catch {
        // Not JSON, use as-is
      }
    }

    const defaultOptions: RequestInit = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const response = await fetch(url, { ...defaultOptions, ...options, body });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return transformKeysToCamelCase(data) as T;
  }

  // ============================================
  // ADMIN CONFIG
  // ============================================

  async getConfig(): Promise<ReferralConfig> {
    return this.makeRequest<ReferralConfig>('/referral/admin/config');
  }

  async updateConfig(config: UpdateReferralConfigDto): Promise<ReferralConfig> {
    return this.makeRequest<ReferralConfig>('/referral/admin/config', {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  }

  // ============================================
  // ADMIN REFERRALS
  // ============================================

  async getAdminReferrals(filters: ReferralFilters = {}): Promise<PaginatedReferrals> {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    return this.makeRequest<PaginatedReferrals>(
      `/referral/admin/referrals?${params.toString()}`
    );
  }

  async getAdminStats(): Promise<ReferralStats> {
    return this.makeRequest<ReferralStats>('/referral/admin/stats');
  }

  // ============================================
  // UTILITY
  // ============================================

  formatStatus(status: string): string {
    const labels: Record<string, string> = {
      registered: 'Pending',
      qualified: 'Qualified',
      rewarded: 'Rewarded',
      expired: 'Expired',
    };
    return labels[status] || status;
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      registered: 'bg-yellow-100 text-yellow-800',
      qualified: 'bg-green-100 text-green-800',
      rewarded: 'bg-blue-100 text-blue-800',
      expired: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }
}

export const referralService = new ReferralService();
