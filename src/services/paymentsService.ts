import { transformKeysToCamelCase, transformKeysToSnakeCase } from '@/lib/caseTransform';

// API Configuration  
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3007/api/v1';

// ============================================
// TYPES
// ============================================

export type TransactionType = 'payment' | 'refund' | 'deposit' | 'penalty';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';
export type PaymentMethod = 'card' | 'bank' | 'wallet' | 'cash';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: TransactionStatus;
  bookingId?: string;
  gatewayTransactionId?: string;
  paymentGateway?: string;
  createdAt: string;
  completedAt?: string;
  // Extended info from detail endpoint
  booking?: {
    id: string;
    equipmentType?: string;
    startDate: string;
    endDate: string;
  };
  user?: {
    id: string;
    fullName: string;
    email?: string;
  };
}

export interface PaymentStats {
  total: number;
  pending: number;
  completed: number;
  failed: number;
  cancelled: number;
  totalAmount: number;
}

export interface PaymentFilters {
  page?: number;
  limit?: number;
  status?: TransactionStatus;
  type?: TransactionType;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface PaymentsResponse {
  transactions: Transaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreatePaymentIntentData {
  bookingId: string;
  amount: number;
  currency?: string;
  paymentMethod?: PaymentMethod;
}

export interface PaymentIntentResponse {
  transactionId: string;
  amount: number;
  currency: string;
  status: string;
  clientSecret?: string;
}

export interface ProcessPaymentData {
  transactionId: string;
  gatewayTransactionId: string;
  status: 'success' | 'failed';
  metadata?: Record<string, unknown>;
}

export interface RefundRequest {
  amount?: number;
  reason?: string;
}

// ============================================
// SERVICE
// ============================================

class PaymentsService {
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
  // PAYMENT HISTORY
  // ============================================

  /**
   * Get paginated payment/transaction history
   */
  async getPaymentHistory(filters: PaymentFilters = {}): Promise<PaymentsResponse> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.status) params.append('status', filters.status);

    const queryString = params.toString();
    const endpoint = `/payments/history${queryString ? `?${queryString}` : ''}`;
    
    const response = await this.makeRequest<{
      success: boolean;
      data: Transaction[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(endpoint);

    return {
      transactions: response.data,
      total: response.pagination.total,
      page: response.pagination.page,
      limit: response.pagination.limit,
      totalPages: response.pagination.totalPages,
    };
  }

  /**
   * Get all transactions for admin (includes all users)
   */
  async getAllTransactions(filters: PaymentFilters = {}): Promise<PaymentsResponse> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.status) params.append('status', filters.status);
    if (filters.type) params.append('type', filters.type);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.search) params.append('search', filters.search);

    const queryString = params.toString();
    const endpoint = `/payments/admin/transactions${queryString ? `?${queryString}` : ''}`;
    
    const response = await this.makeRequest<{
      success: boolean;
      data: Transaction[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(endpoint);

    return {
      transactions: response.data,
      total: response.pagination.total,
      page: response.pagination.page,
      limit: response.pagination.limit,
      totalPages: response.pagination.totalPages,
    };
  }

  /**
   * Get transaction by ID
   */
  async getTransactionById(transactionId: string): Promise<Transaction> {
    const response = await this.makeRequest<{
      success: boolean;
      data: Transaction;
    }>(`/payments/history/${transactionId}`);

    return response.data;
  }

  // ============================================
  // STATISTICS
  // ============================================

  /**
   * Get payment statistics (admin)
   */
  async getPaymentStatistics(): Promise<PaymentStats> {
    const response = await this.makeRequest<{
      success: boolean;
      data: PaymentStats;
    }>('/payments/statistics');

    return response.data;
  }

  // ============================================
  // PAYMENT OPERATIONS
  // ============================================

  /**
   * Create payment intent for a booking
   */
  async createPaymentIntent(data: CreatePaymentIntentData): Promise<PaymentIntentResponse> {
    const response = await this.makeRequest<{
      success: boolean;
      message: string;
      data: PaymentIntentResponse;
    }>('/payments/intent', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    return response.data;
  }

  /**
   * Process payment result after gateway callback
   */
  async processPayment(data: ProcessPaymentData): Promise<{
    transactionId: string;
    status: string;
    completedAt: string;
  }> {
    const response = await this.makeRequest<{
      success: boolean;
      message: string;
      data: {
        transactionId: string;
        status: string;
        completedAt: string;
      };
    }>('/payments/process', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    return response.data;
  }

  /**
   * Request refund for a transaction
   */
  async requestRefund(transactionId: string, data: RefundRequest = {}): Promise<{
    refundTransactionId: string;
    amount: number;
    status: string;
  }> {
    const response = await this.makeRequest<{
      success: boolean;
      message: string;
      data: {
        refundTransactionId: string;
        amount: number;
        status: string;
      };
    }>(`/payments/${transactionId}/refund`, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    return response.data;
  }

  // ============================================
  // ADMIN OPERATIONS
  // ============================================

  /**
   * Approve pending transaction (admin)
   */
  async approveTransaction(transactionId: string): Promise<Transaction> {
    const response = await this.makeRequest<{
      success: boolean;
      data: Transaction;
    }>(`/payments/admin/${transactionId}/approve`, {
      method: 'POST',
    });

    return response.data;
  }

  /**
   * Reject pending transaction (admin)
   */
  async rejectTransaction(transactionId: string, reason?: string): Promise<Transaction> {
    const response = await this.makeRequest<{
      success: boolean;
      data: Transaction;
    }>(`/payments/admin/${transactionId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });

    return response.data;
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
   * Get status badge variant for UI
   */
  getStatusVariant(status: TransactionStatus): 'success' | 'warning' | 'danger' | 'secondary' {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'danger';
      case 'cancelled':
        return 'secondary';
      default:
        return 'secondary';
    }
  }

  /**
   * Get transaction type label
   */
  getTypeLabel(type: TransactionType, isRTL: boolean = false): string {
    const labels: Record<TransactionType, { en: string; ar: string }> = {
      payment: { en: 'Rental Payment', ar: 'دفع إيجار' },
      refund: { en: 'Refund', ar: 'استرداد' },
      deposit: { en: 'Security Deposit', ar: 'ضمان' },
      penalty: { en: 'Penalty', ar: 'غرامة' },
    };
    return isRTL ? labels[type].ar : labels[type].en;
  }

  /**
   * Get payment method label
   */
  getMethodLabel(method: PaymentMethod, isRTL: boolean = false): string {
    const labels: Record<PaymentMethod, { en: string; ar: string }> = {
      card: { en: 'Credit Card', ar: 'بطاقة ائتمان' },
      bank: { en: 'Bank Transfer', ar: 'تحويل بنكي' },
      wallet: { en: 'Wallet', ar: 'محفظة' },
      cash: { en: 'Cash', ar: 'نقدي' },
    };
    return isRTL ? labels[method].ar : labels[method].en;
  }

  /**
   * Get status label
   */
  getStatusLabel(status: TransactionStatus, isRTL: boolean = false): string {
    const labels: Record<TransactionStatus, { en: string; ar: string }> = {
      pending: { en: 'Pending', ar: 'قيد الانتظار' },
      completed: { en: 'Completed', ar: 'مكتمل' },
      failed: { en: 'Failed', ar: 'فشل' },
      cancelled: { en: 'Cancelled', ar: 'ملغي' },
    };
    return isRTL ? labels[status].ar : labels[status].en;
  }
}

export const paymentsService = new PaymentsService();
