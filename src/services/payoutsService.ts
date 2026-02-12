import { transformKeysToCamelCase, transformKeysToSnakeCase } from '@/lib/caseTransform';

// API Configuration  
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3007/v1';

// ============================================
// TYPES
// ============================================

export type PayoutStatus = 'pending' | 'approved' | 'processing' | 'completed' | 'rejected' | 'cancelled';

export interface WalletBalance {
  balance: number;
  pendingBalance: number;
  availableBalance: number;
  totalEarned: number;
  totalWithdrawn: number;
  currency: string;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  bookingId?: string;
  payoutRequestId?: string;
  type: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description?: string;
  referenceId?: string;
  createdAt: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountHolderName: string;
  accountNumber?: string;
  iban?: string;
  swiftCode?: string;
  isDefault: boolean;
  isVerified: boolean;
  createdAt: string;
}

export interface PayoutRequest {
  id: string;
  ownerId: string;
  owner?: {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
  };
  amount: number;
  currency: string;
  bankAccountId?: string;
  bankAccount?: BankAccount;
  status: PayoutStatus;
  requestedAt: string;
  processedAt?: string;
  processedBy?: string;
  processor?: {
    id: string;
    fullName: string;
  };
  rejectionReason?: string;
  transactionReference?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PayoutStats {
  pending: number;
  approved: number;
  completed: number;
  rejected: number;
  totalPendingAmount: number;
}

export interface PayoutsResponse {
  success: boolean;
  data: PayoutRequest[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: PayoutStats;
}

export interface PayoutFilters {
  page?: number;
  limit?: number;
  status?: PayoutStatus;
  ownerId?: string;
  search?: string;
}

// ============================================
// SERVICE
// ============================================

class PayoutsService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
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
  // ADMIN ENDPOINTS
  // ============================================

  /**
   * Get all payout requests (admin)
   */
  async getAllPayouts(filters: PayoutFilters = {}): Promise<PayoutsResponse> {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.status) params.append('status', filters.status);
    if (filters.ownerId) params.append('ownerId', filters.ownerId);
    if (filters.search) params.append('search', filters.search);

    const queryString = params.toString();
    return this.makeRequest<PayoutsResponse>(`/payouts/admin${queryString ? `?${queryString}` : ''}`);
  }

  /**
   * Get payout request details (admin)
   */
  async getPayoutById(id: string): Promise<{ success: boolean; data: PayoutRequest }> {
    return this.makeRequest<{ success: boolean; data: PayoutRequest }>(`/payouts/admin/${id}`);
  }

  /**
   * Approve payout request (admin)
   */
  async approvePayout(id: string, notes?: string): Promise<{ success: boolean; message: string }> {
    return this.makeRequest<{ success: boolean; message: string }>(`/payouts/admin/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  }

  /**
   * Reject payout request (admin)
   */
  async rejectPayout(id: string, reason: string): Promise<{ success: boolean; message: string }> {
    return this.makeRequest<{ success: boolean; message: string }>(`/payouts/admin/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  /**
   * Complete payout (admin)
   */
  async completePayout(
    id: string,
    transactionReference?: string,
    notes?: string
  ): Promise<{ success: boolean; message: string }> {
    return this.makeRequest<{ success: boolean; message: string }>(`/payouts/admin/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify({ transactionReference, notes }),
    });
  }

  /**
   * Verify bank account (admin)
   */
  async verifyBankAccount(id: string): Promise<{ success: boolean; message: string }> {
    return this.makeRequest<{ success: boolean; message: string }>(`/payouts/admin/bank-accounts/${id}/verify`, {
      method: 'POST',
    });
  }

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  /**
   * Format currency for display
   */
  formatCurrency(amount: number, currency: string = 'SAR', locale: string = 'en-US'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  }

  /**
   * Format date for display
   */
  formatDate(dateStr: string, locale: string = 'en-US'): string {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateStr));
  }

  /**
   * Get status badge variant
   */
  getStatusVariant(status: PayoutStatus): 'default' | 'success' | 'warning' | 'danger' | 'info' {
    const variants: Record<PayoutStatus, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
      pending: 'warning',
      approved: 'info',
      processing: 'info',
      completed: 'success',
      rejected: 'danger',
      cancelled: 'default',
    };
    return variants[status] || 'default';
  }

  /**
   * Get status label
   */
  getStatusLabel(status: PayoutStatus, isRTL: boolean = false): string {
    const labels: Record<PayoutStatus, { en: string; ar: string }> = {
      pending: { en: 'Pending', ar: 'معلق' },
      approved: { en: 'Approved', ar: 'مُعتمد' },
      processing: { en: 'Processing', ar: 'قيد المعالجة' },
      completed: { en: 'Completed', ar: 'مكتمل' },
      rejected: { en: 'Rejected', ar: 'مرفوض' },
      cancelled: { en: 'Cancelled', ar: 'ملغي' },
    };
    return isRTL ? labels[status]?.ar || status : labels[status]?.en || status;
  }

  /**
   * Get transaction type label
   */
  getTransactionTypeLabel(type: string, isRTL: boolean = false): string {
    const labels: Record<string, { en: string; ar: string }> = {
      credit_booking_completed: { en: 'Booking Completed', ar: 'حجز مكتمل' },
      credit_refund: { en: 'Refund', ar: 'استرداد' },
      credit_adjustment: { en: 'Adjustment (Credit)', ar: 'تعديل (إضافة)' },
      debit_payout: { en: 'Payout', ar: 'دفعة' },
      debit_penalty: { en: 'Penalty', ar: 'غرامة' },
      debit_adjustment: { en: 'Adjustment (Debit)', ar: 'تعديل (خصم)' },
    };
    return isRTL ? labels[type]?.ar || type : labels[type]?.en || type;
  }
}

export const payoutsService = new PayoutsService();
