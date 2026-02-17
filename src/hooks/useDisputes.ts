'use client';
import { useState, useCallback } from 'react';
import { disputeService } from '@/services/disputeService';
import type {
  Dispute,
  DisputeActivity,
  DisputeStats,
  ResolveDisputePayload,
} from '@/types/dispute';

export function useDisputes() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<DisputeStats | null>(null);
  const [currentDispute, setCurrentDispute] = useState<Dispute | null>(null);
  const [activities, setActivities] = useState<DisputeActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDisputes = useCallback(async (filters?: {
    status?: string;
    reason?: string;
    priority?: string;
    page?: number;
    limit?: number;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const result = await disputeService.listDisputes(filters);
      setDisputes(result.data);
      setTotal(result.total);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch disputes');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const data = await disputeService.getStats();
      setStats(data);
    } catch (err: any) {
      console.error('Failed to fetch dispute stats:', err);
    }
  }, []);

  const fetchDispute = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await disputeService.getDispute(id);
      setCurrentDispute(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dispute');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchActivities = useCallback(async (disputeId: string) => {
    try {
      const data = await disputeService.getActivities(disputeId);
      setActivities(data);
    } catch (err: any) {
      console.error('Failed to fetch activities:', err);
    }
  }, []);

  const assignAdmin = useCallback(async (disputeId: string, adminId: string) => {
    try {
      const updated = await disputeService.assignAdmin(disputeId, adminId);
      setCurrentDispute(updated);
      setDisputes(prev => prev.map(d => d.id === disputeId ? { ...d, ...updated } : d));
    } catch (err: any) {
      throw err;
    }
  }, []);

  const escalateDispute = useCallback(async (disputeId: string, reason?: string) => {
    try {
      const updated = await disputeService.escalate(disputeId, reason);
      setCurrentDispute(updated);
      setDisputes(prev => prev.map(d => d.id === disputeId ? { ...d, ...updated } : d));
    } catch (err: any) {
      throw err;
    }
  }, []);

  const resolveDispute = useCallback(async (disputeId: string, payload: ResolveDisputePayload) => {
    try {
      const updated = await disputeService.resolve(disputeId, payload);
      setCurrentDispute(updated);
      setDisputes(prev => prev.map(d => d.id === disputeId ? { ...d, ...updated } : d));
    } catch (err: any) {
      throw err;
    }
  }, []);

  const closeDispute = useCallback(async (disputeId: string) => {
    try {
      const updated = await disputeService.close(disputeId);
      setCurrentDispute(updated);
      setDisputes(prev => prev.map(d => d.id === disputeId ? { ...d, ...updated } : d));
    } catch (err: any) {
      throw err;
    }
  }, []);

  return {
    disputes,
    total,
    stats,
    currentDispute,
    activities,
    loading,
    error,
    fetchDisputes,
    fetchStats,
    fetchDispute,
    fetchActivities,
    assignAdmin,
    escalateDispute,
    resolveDispute,
    closeDispute,
  };
}
