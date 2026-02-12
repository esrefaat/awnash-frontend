import { transformKeysToCamelCase, transformKeysToSnakeCase } from '@/lib/caseTransform';

// API Configuration  
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3007/v1';

// ============================================
// TYPES
// ============================================

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  status: InvoiceStatus;
  issuedAt: string;
  dueDate: string;
  paidAt?: string;
  bookingId: string;
}

export interface InvoiceDetails extends Invoice {
  booking: {
    id: string;
    equipmentType?: string;
    startDate: string;
    endDate: string;
    numberOfDays: number;
    dailyRate: number;
    location?: string;
  };
  requester: {
    name: string;
    email?: string;
    phone?: string;
  };
  owner: {
    name: string;
    email?: string;
    phone?: string;
  } | null;
}

export interface InvoiceFilters {
  page?: number;
  limit?: number;
  status?: InvoiceStatus;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface InvoicesResponse {
  invoices: Invoice[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================
// SERVICE
// ============================================

class InvoicesService {
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
  // INVOICE LISTING
  // ============================================

  /**
   * Get my invoices (as requester or owner)
   */
  async getMyInvoices(): Promise<Invoice[]> {
    const response = await this.makeRequest<{
      success: boolean;
      data: Invoice[];
    }>('/invoices');

    return response.data;
  }

  /**
   * Get all invoices for admin with filters and pagination
   */
  async getAllInvoices(filters: InvoiceFilters = {}): Promise<InvoicesResponse> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.status) params.append('status', filters.status);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.search) params.append('search', filters.search);

    const queryString = params.toString();
    const endpoint = `/invoices/admin${queryString ? `?${queryString}` : ''}`;
    
    const response = await this.makeRequest<{
      success: boolean;
      data: Invoice[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(endpoint);

    return {
      invoices: response.data,
      total: response.pagination.total,
      page: response.pagination.page,
      limit: response.pagination.limit,
      totalPages: response.pagination.totalPages,
    };
  }

  /**
   * Get invoice by ID
   */
  async getInvoiceById(invoiceId: string): Promise<InvoiceDetails> {
    const response = await this.makeRequest<{
      success: boolean;
      data: InvoiceDetails;
    }>(`/invoices/${invoiceId}`);

    return response.data;
  }

  // ============================================
  // INVOICE OPERATIONS
  // ============================================

  /**
   * Download invoice as PDF
   */
  async downloadInvoicePdf(invoiceId: string): Promise<Blob> {
    const url = `${API_BASE_URL}/invoices/${invoiceId}/pdf`;
    
    const response = await fetch(url, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to download PDF: ${response.status}`);
    }

    return response.blob();
  }

  /**
   * Open invoice PDF in new tab
   */
  async openInvoicePdf(invoiceId: string): Promise<void> {
    const blob = await this.downloadInvoicePdf(invoiceId);
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank');
    // Clean up after a delay
    setTimeout(() => window.URL.revokeObjectURL(url), 1000);
  }

  /**
   * Download invoice PDF as file
   */
  async saveInvoicePdf(invoiceId: string, fileName?: string): Promise<void> {
    const blob = await this.downloadInvoicePdf(invoiceId);
    const url = window.URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || `invoice-${invoiceId}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Send invoice to customer (marks as sent)
   */
  async sendInvoice(invoiceId: string): Promise<{ id: string; status: string }> {
    const response = await this.makeRequest<{
      success: boolean;
      message: string;
      data: { id: string; status: string };
    }>(`/invoices/${invoiceId}/send`, {
      method: 'POST',
    });

    return response.data;
  }

  /**
   * Void/cancel an invoice (admin)
   */
  async voidInvoice(invoiceId: string, reason?: string): Promise<Invoice> {
    const response = await this.makeRequest<{
      success: boolean;
      data: Invoice;
    }>(`/invoices/admin/${invoiceId}/void`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });

    return response.data;
  }

  /**
   * Mark invoice as paid (admin)
   */
  async markAsPaid(invoiceId: string): Promise<Invoice> {
    const response = await this.makeRequest<{
      success: boolean;
      data: Invoice;
    }>(`/invoices/admin/${invoiceId}/mark-paid`, {
      method: 'POST',
    });

    return response.data;
  }

  // ============================================
  // STATISTICS
  // ============================================

  /**
   * Get invoice statistics (admin)
   */
  async getInvoiceStatistics(): Promise<{
    total: number;
    draft: number;
    sent: number;
    paid: number;
    overdue: number;
    cancelled: number;
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
  }> {
    const response = await this.makeRequest<{
      success: boolean;
      data: {
        total: number;
        draft: number;
        sent: number;
        paid: number;
        overdue: number;
        cancelled: number;
        totalAmount: number;
        paidAmount: number;
        pendingAmount: number;
      };
    }>('/invoices/admin/statistics');

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
   * Format date for display
   */
  formatDate(dateString: string, locale: string = 'en-US'): string {
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  /**
   * Get status badge variant for UI
   */
  getStatusVariant(status: InvoiceStatus): 'success' | 'warning' | 'danger' | 'secondary' | 'default' {
    switch (status) {
      case 'paid':
        return 'success';
      case 'sent':
        return 'default';
      case 'draft':
        return 'secondary';
      case 'overdue':
        return 'danger';
      case 'cancelled':
        return 'secondary';
      default:
        return 'secondary';
    }
  }

  /**
   * Get status label
   */
  getStatusLabel(status: InvoiceStatus, isRTL: boolean = false): string {
    const labels: Record<InvoiceStatus, { en: string; ar: string }> = {
      draft: { en: 'Draft', ar: 'مسودة' },
      sent: { en: 'Sent', ar: 'مُرسل' },
      paid: { en: 'Paid', ar: 'مدفوع' },
      overdue: { en: 'Overdue', ar: 'متأخر' },
      cancelled: { en: 'Cancelled', ar: 'ملغي' },
    };
    return isRTL ? labels[status].ar : labels[status].en;
  }

  /**
   * Check if invoice is overdue
   */
  isOverdue(invoice: Invoice): boolean {
    if (invoice.status === 'paid' || invoice.status === 'cancelled') {
      return false;
    }
    return new Date() > new Date(invoice.dueDate);
  }

  /**
   * Get days until due (negative if overdue)
   */
  getDaysUntilDue(invoice: Invoice): number {
    const now = new Date();
    const due = new Date(invoice.dueDate);
    const diffTime = due.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}

export const invoicesService = new InvoicesService();
