import apiService from './api';
import type {
  Dispute,
  DisputeActivity,
  DisputeStats,
  ResolveDisputePayload,
} from '@/types/dispute';

export const disputeService = {
  // Admin: list all disputes
  async listDisputes(filters?: {
    status?: string;
    reason?: string;
    priority?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: Dispute[]; total: number }> {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.reason) params.set('reason', filters.reason);
    if (filters?.priority) params.set('priority', filters.priority);
    if (filters?.page) params.set('page', String(filters.page));
    if (filters?.limit) params.set('limit', String(filters.limit));
    const qs = params.toString();
    const res = await apiService.get<Dispute[]>(`/disputes${qs ? `?${qs}` : ''}`);
    return { data: res.data || [], total: (res as any).total || 0 };
  },

  // Get single dispute
  async getDispute(id: string): Promise<Dispute> {
    const res = await apiService.get<Dispute>(`/disputes/${id}`);
    return res.data;
  },

  // Get dispute activities
  async getActivities(id: string): Promise<DisputeActivity[]> {
    const res = await apiService.get<DisputeActivity[]>(`/disputes/${id}/activities`);
    return res.data || [];
  },

  // Get dispute stats
  async getStats(): Promise<DisputeStats> {
    const res = await apiService.get<DisputeStats>('/disputes/stats/overview');
    return res.data;
  },

  // Assign admin reviewer
  async assignAdmin(disputeId: string, adminId: string): Promise<Dispute> {
    const res = await apiService.patch<Dispute>(`/disputes/${disputeId}/assign`, { adminId });
    return res.data;
  },

  // Escalate dispute
  async escalate(disputeId: string, reason?: string): Promise<Dispute> {
    const res = await apiService.patch<Dispute>(`/disputes/${disputeId}/escalate`, { reason });
    return res.data;
  },

  // Resolve dispute
  async resolve(disputeId: string, payload: ResolveDisputePayload): Promise<Dispute> {
    const res = await apiService.post<Dispute>(`/disputes/${disputeId}/resolve`, payload);
    return res.data;
  },

  // Close dispute
  async close(disputeId: string): Promise<Dispute> {
    const res = await apiService.post<Dispute>(`/disputes/${disputeId}/close`, {});
    return res.data;
  },

  // Add admin note
  async addNote(disputeId: string, note: string): Promise<void> {
    await apiService.post(`/disputes/${disputeId}/note`, { note });
  },
};

export default disputeService;
