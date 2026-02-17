import { transformKeysToCamelCase, transformKeysToSnakeCase } from '@/lib/caseTransform';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3007/v1';

// ============================================
// TYPES
// ============================================

export type EscrowStatus =
  | 'pending'
  | 'held'
  | 'partially_released'
  | 'release_pending'
  | 'released'
  | 'refund_pending'
  | 'refunded'
  | 'partial_refund_pending'
  | 'partial_refunded'
  | 'disputed'
  | 'dispute_resolved'
  | 'expired'
  | 'release_failed';

export interface EscrowRecord {
  id: string;
  bookingId: string;
  offerId: string;
  requesterId: string;
  ownerId: string;
  equipmentTypeId?: string;
  // Amounts
  totalChargedAmount: number;
  requesterCommission: number;
  ownerCommission: number;
  escrowAmount: number;
  stage1Amount: number;
  stage2Amount: number;
  vatAmount: number;
  totalPaidOut: number;
  totalRefunded: number;
  cancellationFee: number;
  cancellationFeePercent: number;
  // Rates
  requesterCommissionRate: number;
  ownerCommissionRate: number;
  deliveryPayoutPercentage: number;
  deliveryPayoutCap: number;
  // State
  status: EscrowStatus;
  currency: string;
  // Stage flags
  stage1PaidOut: boolean;
  stage2PaidOut: boolean;
  // Timestamps
  paymentWindowExpiresAt?: string;
  heldAt?: string;
  stage1PaidAt?: string;
  stage2PaidAt?: string;
  releasedAt?: string;
  refundedAt?: string;
  expiredAt?: string;
  createdAt: string;
  updatedAt: string;
  // Settings snapshot
  settingPaymentWindow: number;
  settingDeliveryPayoutPercentage: number;
  settingDeliveryPayoutCap: number;
  settingAutoCancelNoDispatch: number;
  settingDeliveryConfirm: number;
  settingAutoConfirmCompletion: number;
  settingCancellationTiers: Array<{ hoursBeforeStart: number; feePercent: number }>;
  // Gateway references
  gatewayCheckoutId?: string;
  gatewayPaymentId?: string;
  gatewayStage1PayoutId?: string;
  gatewayStage2PayoutId?: string;
  // Audit
  statusHistory: Array<{
    status: EscrowStatus;
    timestamp: string;
    actor?: string;
    note?: string;
  }>;
  cancelledBy?: string;
  adminNotes?: string;
  payoutChannelSnapshot?: {
    iban: string;
    bankName: string;
    beneficiaryName: string;
  };
}

export interface EscrowStats {
  totalHeld: number;
  totalReleased: number;
  totalRefunded: number;
  totalDisputed: number;
  totalExpired: number;
  totalFailed: number;
  heldAmount: number;
  releasedAmount: number;
  refundedAmount: number;
  countByStatus: Record<string, number>;
}

export interface EscrowFilters {
  page?: number;
  limit?: number;
  status?: EscrowStatus;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface EscrowListResponse {
  escrows: EscrowRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================
// SERVICE
// ============================================

class EscrowService {
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
  // ADMIN: LIST ESCROWS
  // ============================================

  async getEscrowList(filters: EscrowFilters = {}): Promise<EscrowListResponse> {
    const params = new URLSearchParams();

    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const queryString = params.toString();
    const endpoint = `/escrow/admin/list${queryString ? `?${queryString}` : ''}`;

    const response = await this.makeRequest<{
      success: boolean;
      data: EscrowRecord[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(endpoint);

    return {
      escrows: response.data,
      total: response.pagination.total,
      page: response.pagination.page,
      limit: response.pagination.limit,
      totalPages: response.pagination.totalPages,
    };
  }

  // ============================================
  // ADMIN: STATS
  // ============================================

  async getEscrowStats(): Promise<EscrowStats> {
    const response = await this.makeRequest<{
      success: boolean;
      data: EscrowStats;
    }>('/escrow/admin/stats');

    return response.data;
  }

  // ============================================
  // ADMIN: GET DETAIL
  // ============================================

  async getEscrowById(id: string): Promise<EscrowRecord> {
    return this.makeRequest<EscrowRecord>(`/escrow/${id}`);
  }

  // ============================================
  // ADMIN: ACTIONS
  // ============================================

  async forceRelease(escrowId: string, stage: number, notes?: string): Promise<any> {
    const response = await this.makeRequest<{
      success: boolean;
      payout: any;
    }>(`/escrow/${escrowId}/admin/force-release`, {
      method: 'POST',
      body: JSON.stringify({ stage, notes }),
    });
    return response.payout;
  }

  async forceRefund(escrowId: string, notes?: string): Promise<any> {
    const response = await this.makeRequest<{
      success: boolean;
      escrow: EscrowRecord;
    }>(`/escrow/${escrowId}/admin/force-refund`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
    return response.escrow;
  }

  async retryPayout(escrowId: string): Promise<any> {
    const response = await this.makeRequest<{
      success: boolean;
      payout: any;
    }>(`/escrow/${escrowId}/retry-payout`, {
      method: 'POST',
    });
    return response.payout;
  }

  async resolveDispute(
    escrowId: string,
    refundToRequester?: number,
    payoutToOwner?: number,
    adminNotes?: string
  ): Promise<EscrowRecord> {
    const response = await this.makeRequest<{
      success: boolean;
      escrow: EscrowRecord;
    }>(`/escrow/${escrowId}/resolve-dispute`, {
      method: 'POST',
      body: JSON.stringify({ refundToRequester, payoutToOwner, adminNotes }),
    });
    return response.escrow;
  }

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  formatCurrency(amount: number, currency: string = 'SAR', locale: string = 'en-US'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  }

  getStatusVariant(status: EscrowStatus): 'success' | 'warning' | 'danger' | 'info' | 'secondary' {
    switch (status) {
      case 'released':
      case 'dispute_resolved':
        return 'success';
      case 'held':
      case 'partially_released':
        return 'info';
      case 'pending':
      case 'release_pending':
      case 'refund_pending':
      case 'partial_refund_pending':
        return 'warning';
      case 'refunded':
      case 'partial_refunded':
        return 'secondary';
      case 'expired':
      case 'release_failed':
      case 'disputed':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  getStatusLabel(status: EscrowStatus, isRTL: boolean = false): string {
    const labels: Record<EscrowStatus, { en: string; ar: string }> = {
      pending: { en: 'Pending', ar: 'قيد الانتظار' },
      held: { en: 'Held', ar: 'محتجز' },
      partially_released: { en: 'Partially Released', ar: 'مُفرَج جزئياً' },
      release_pending: { en: 'Release Pending', ar: 'قيد الإفراج' },
      released: { en: 'Released', ar: 'مُفرَج' },
      refund_pending: { en: 'Refund Pending', ar: 'قيد الاسترداد' },
      refunded: { en: 'Refunded', ar: 'مُسترد' },
      partial_refund_pending: { en: 'Partial Refund Pending', ar: 'قيد الاسترداد الجزئي' },
      partial_refunded: { en: 'Partially Refunded', ar: 'مُسترد جزئياً' },
      disputed: { en: 'Disputed', ar: 'متنازع عليه' },
      dispute_resolved: { en: 'Dispute Resolved', ar: 'تم حل النزاع' },
      expired: { en: 'Expired', ar: 'منتهي' },
      release_failed: { en: 'Release Failed', ar: 'فشل الإفراج' },
    };
    return isRTL ? (labels[status]?.ar ?? status) : (labels[status]?.en ?? status);
  }

  // ------------------------------------
  // Reconciliation
  // ------------------------------------

  async runReconciliation(): Promise<{
    runAt: string;
    totalChecked: number;
    totalMismatches: number;
    mismatches: Array<{
      escrowId: string;
      bookingId: string;
      type: string;
      detail: string;
      internalStatus: string;
      gatewayStatus?: string;
    }>;
    staleHeldCount: number;
  }> {
    const res = await this.makeRequest('/escrow/admin/reconciliation', { method: 'POST' });
    return res.data;
  }

  // ------------------------------------
  // Escalated Payouts
  // ------------------------------------

  async getEscalatedPayouts(): Promise<EscrowRecord[]> {
    const res = await this.makeRequest('/escrow/admin/escalated');
    return (res.data || []).map((r: Record<string, unknown>) => transformKeysToCamelCase(r) as unknown as EscrowRecord);
  }

  formatMinutes(minutes: number, isRTL: boolean = false): string {
    if (minutes < 60) return `${minutes} ${isRTL ? 'دقيقة' : 'min'}`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours < 24) {
      if (mins === 0) return `${hours} ${isRTL ? 'ساعة' : 'hr'}`;
      return `${hours}${isRTL ? 'س' : 'h'} ${mins}${isRTL ? 'د' : 'm'}`;
    }
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    if (remHours === 0) return `${days} ${isRTL ? 'يوم' : 'day'}${days > 1 && !isRTL ? 's' : ''}`;
    return `${days}${isRTL ? 'ي' : 'd'} ${remHours}${isRTL ? 'س' : 'h'}`;
  }
}

export const escrowService = new EscrowService();
