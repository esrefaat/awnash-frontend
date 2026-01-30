import { transformKeysToCamelCase, transformKeysToSnakeCase } from '@/lib/caseTransform';

// API Configuration  
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3007/api/v1';

// ============================================
// TYPES
// ============================================

export interface CommissionSettings {
  ownerCommissionRate: number;
  renterServiceFeeRate: number;
  vatRate: number;
  securityDepositRate: number;
  minimumBookingValue: number;
}

export interface FeePreview {
  baseAmount: number;
  platformFee: number;
  serviceFee: number;
  vatAmount: number;
  totalForRenter: number;
  ownerPayout: number;
  commissionRate: number;
  serviceFeeRate: number;
}

export interface PlatformSetting {
  id: string;
  key: string;
  value: string;
  valueType: string;
  description?: string;
  category: string;
  updatedAt: string;
}

export interface SettingsHistory {
  id: string;
  settingId: string;
  oldValue?: string;
  newValue?: string;
  changedBy?: string;
  changedAt: string;
}

export interface UpdateCommissionSettingsDto {
  ownerCommissionRate?: number;
  renterServiceFeeRate?: number;
  vatRate?: number;
  securityDepositRate?: number;
  minimumBookingValue?: number;
}

// ============================================
// SERVICE
// ============================================

class SettingsService {
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
  // PUBLIC ENDPOINTS (Read only)
  // ============================================

  /**
   * Get current commission settings
   */
  async getCommissionSettings(): Promise<CommissionSettings> {
    const response = await this.makeRequest<{
      success: boolean;
      data: CommissionSettings;
    }>('/settings/commission');

    return response.data;
  }

  /**
   * Preview fees for a given amount
   */
  async previewFees(amount: number): Promise<FeePreview> {
    const response = await this.makeRequest<{
      success: boolean;
      data: FeePreview;
    }>(`/settings/fee-preview?amount=${amount}`);

    return response.data;
  }

  // ============================================
  // ADMIN ENDPOINTS
  // ============================================

  /**
   * Get all platform settings (admin only)
   */
  async getAllSettings(): Promise<PlatformSetting[]> {
    const response = await this.makeRequest<{
      success: boolean;
      data: PlatformSetting[];
    }>('/settings/admin/all');

    return response.data;
  }

  /**
   * Update commission settings (admin only)
   */
  async updateCommissionSettings(settings: UpdateCommissionSettingsDto): Promise<CommissionSettings> {
    const response = await this.makeRequest<{
      success: boolean;
      message: string;
      data: CommissionSettings;
    }>('/settings/admin/commission', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });

    return response.data;
  }

  /**
   * Get settings change history (admin only)
   */
  async getSettingsHistory(settingId?: string, limit: number = 50): Promise<SettingsHistory[]> {
    const params = new URLSearchParams();
    if (settingId) params.append('settingId', settingId);
    params.append('limit', limit.toString());

    const response = await this.makeRequest<{
      success: boolean;
      data: SettingsHistory[];
    }>(`/settings/admin/history?${params.toString()}`);

    return response.data;
  }

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  /**
   * Format percentage for display
   */
  formatPercentage(value: number): string {
    return `${value}%`;
  }

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
   * Get setting category label
   */
  getCategoryLabel(category: string, isRTL: boolean = false): string {
    const labels: Record<string, { en: string; ar: string }> = {
      commission: { en: 'Commission', ar: 'العمولات' },
      tax: { en: 'Tax', ar: 'الضرائب' },
      booking: { en: 'Booking', ar: 'الحجز' },
      payout: { en: 'Payout', ar: 'الدفعات' },
      cancellation: { en: 'Cancellation', ar: 'الإلغاء' },
      general: { en: 'General', ar: 'عام' },
    };
    return isRTL ? labels[category]?.ar || category : labels[category]?.en || category;
  }

  /**
   * Get human-readable setting name
   */
  getSettingLabel(key: string, isRTL: boolean = false): string {
    const labels: Record<string, { en: string; ar: string }> = {
      owner_commission_rate: { en: 'Owner Commission Rate', ar: 'نسبة عمولة المالك' },
      renter_service_fee_rate: { en: 'Renter Service Fee', ar: 'رسوم خدمة المستأجر' },
      vat_rate: { en: 'VAT Rate', ar: 'نسبة ضريبة القيمة المضافة' },
      security_deposit_rate: { en: 'Security Deposit Rate', ar: 'نسبة الضمان' },
      minimum_booking_value: { en: 'Minimum Booking Value', ar: 'الحد الأدنى لقيمة الحجز' },
      payout_threshold: { en: 'Payout Threshold', ar: 'حد الدفع الأدنى' },
      payout_processing_days: { en: 'Payout Processing Days', ar: 'أيام معالجة الدفع' },
      cancellation_fee_percentage: { en: 'Cancellation Fee', ar: 'رسوم الإلغاء' },
      free_cancellation_hours: { en: 'Free Cancellation Hours', ar: 'ساعات الإلغاء المجاني' },
    };
    return isRTL ? labels[key]?.ar || key : labels[key]?.en || key;
  }
}

export const settingsService = new SettingsService();
