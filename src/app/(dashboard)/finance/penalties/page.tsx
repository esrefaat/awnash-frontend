'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '@/components/ui/Button';
import {
  faExclamationTriangle,
  faCheck,
  faBan,
  faEye,
} from '@fortawesome/free-solid-svg-icons';
import { cn } from '@/lib/utils';
import { legalService, type PenaltyRecord } from '@/services/legalService';

const PENALTY_TYPE_LABELS: Record<string, string> = {
  late_cancel_requester: 'Late Cancel (Requester)',
  late_cancel_owner: 'Late Cancel (Owner)',
  no_show_requester: 'No Show (Requester)',
  no_show_owner: 'No Show (Owner)',
  equipment_damage: 'Equipment Damage',
  early_termination: 'Early Termination',
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  applied: { label: 'Applied', color: 'bg-green-100 text-green-800' },
  disputed: { label: 'Disputed', color: 'bg-red-100 text-red-800' },
  waived: { label: 'Waived', color: 'bg-gray-100 text-gray-800' },
  refunded: { label: 'Refunded', color: 'bg-blue-100 text-blue-800' },
};

export default function PenaltiesPage() {
  const [penalties, setPenalties] = useState<PenaltyRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);

  const fetchPenalties = useCallback(async () => {
    setLoading(true);
    try {
      const result = await legalService.listPenalties({
        status: statusFilter || undefined,
        penaltyType: typeFilter || undefined,
        page,
        limit: 20,
      });
      setPenalties(result.data);
      setTotal(result.total);
    } catch (err) {
      console.error('Failed to load penalties:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter, page]);

  useEffect(() => { fetchPenalties(); }, [fetchPenalties]);

  const handleApprove = async (id: string) => {
    try {
      await legalService.approvePenalty(id);
      fetchPenalties();
    } catch (err) {
      console.error('Failed to approve penalty:', err);
    }
  };

  const handleWaive = async (id: string) => {
    const reason = prompt('Reason for waiving this penalty:');
    if (reason === null) return;
    try {
      await legalService.waivePenalty(id, reason);
      fetchPenalties();
    } catch (err) {
      console.error('Failed to waive penalty:', err);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FontAwesomeIcon icon={faExclamationTriangle} className="text-orange-600" />
          Penalty Management
        </h1>
        <p className="text-sm text-gray-500 mt-1">Review, approve, and manage booking penalties</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All Statuses</option>
          {Object.entries(STATUS_CONFIG).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All Types</option>
          {Object.entries(PENALTY_TYPE_LABELS).map(([key, val]) => (
            <option key={key} value={key}>{val}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Type</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Charged To</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Amount</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Rate</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Created</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
            ) : penalties.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No penalties found</td></tr>
            ) : penalties.map(p => {
              const statusCfg = STATUS_CONFIG[p.status] || { label: p.status, color: '' };
              return (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{PENALTY_TYPE_LABELS[p.penaltyType] || p.penaltyType}</td>
                  <td className="px-4 py-3">{p.chargedToUser?.fullName || p.chargedToUserId}</td>
                  <td className="px-4 py-3 font-medium">{p.currency} {p.amount?.toFixed(2)}</td>
                  <td className="px-4 py-3">{p.appliedRate}%</td>
                  <td className="px-4 py-3">
                    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', statusCfg.color)}>
                      {statusCfg.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {p.status === 'pending' && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleApprove(p.id)} title="Approve">
                            <FontAwesomeIcon icon={faCheck} className="text-green-600" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleWaive(p.id)} title="Waive">
                            <FontAwesomeIcon icon={faBan} className="text-gray-500" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {total > 20 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="text-sm text-gray-500">Showing {(page - 1) * 20 + 1}-{Math.min(page * 20, total)} of {total}</div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
              <Button size="sm" variant="outline" disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
