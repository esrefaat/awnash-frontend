import { apiService } from './api';

export interface LegalDocument {
  id: string;
  type: string;
  version: string;
  title: string;
  titleAr?: string;
  content: string;
  contentAr?: string;
  isActive: boolean;
  effectiveDate: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PenaltyRecord {
  id: string;
  bookingId: string;
  contractId?: string;
  penaltyType: string;
  chargedToUserId: string;
  amount: number;
  currency: string;
  calculationBase: number;
  appliedRate: number;
  status: string;
  disputeId?: string;
  reason?: string;
  evidenceUrls?: string[];
  resolvedBy?: string;
  resolvedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  chargedToUser?: { id: string; fullName: string };
  booking?: { id: string; status: string; finalPrice: number };
}

export const legalService = {
  // Documents
  async listDocuments(type: string): Promise<LegalDocument[]> {
    const res = await apiService.get<LegalDocument[]>(`/legal/admin/documents?type=${type}`);
    return res.data || [];
  },

  async createDocument(data: {
    type: string;
    version: string;
    title: string;
    titleAr?: string;
    content: string;
    contentAr?: string;
    effectiveDate: string;
  }): Promise<LegalDocument> {
    const res = await apiService.post<LegalDocument>('/legal/admin/documents', data);
    return res.data;
  },

  async updateDocument(id: string, data: Partial<LegalDocument>): Promise<LegalDocument> {
    const res = await apiService.put<LegalDocument>(`/legal/admin/documents/${id}`, data);
    return res.data;
  },

  async activateDocument(id: string): Promise<LegalDocument> {
    const res = await apiService.patch<LegalDocument>(`/legal/admin/documents/${id}/activate`, {});
    return res.data;
  },

  // Penalties
  async listPenalties(filters?: {
    status?: string;
    penaltyType?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: PenaltyRecord[]; total: number }> {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.penaltyType) params.set('penalty_type', filters.penaltyType);
    if (filters?.page) params.set('page', String(filters.page));
    if (filters?.limit) params.set('limit', String(filters.limit));
    const qs = params.toString();
    const res = await apiService.get<PenaltyRecord[]>(`/penalties${qs ? `?${qs}` : ''}`);
    return { data: res.data || [], total: (res as any).total || 0 };
  },

  async approvePenalty(id: string): Promise<PenaltyRecord> {
    const res = await apiService.patch<PenaltyRecord>(`/penalties/${id}/approve`, {});
    return res.data;
  },

  async waivePenalty(id: string, reason?: string): Promise<PenaltyRecord> {
    const res = await apiService.patch<PenaltyRecord>(`/penalties/${id}/waive`, { reason });
    return res.data;
  },

  // Contract PDF
  async getContractPdfUrl(contractId: string): Promise<string> {
    const res = await apiService.get<{ url: string }>(`/legal/contracts/${contractId}/pdf`);
    return res.data?.url || '';
  },

  async generateContractPdf(contractId: string): Promise<{ s3Key: string; url: string }> {
    const res = await apiService.post<{ s3Key: string; url: string }>(`/legal/contracts/${contractId}/pdf`, {});
    return res.data;
  },
};

export default legalService;
