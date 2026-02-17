'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '@/components/ui/Button';
import {
  faGavel,
  faSearch,
  faEye,
  faExclamationTriangle,
  faClock,
  faCheckCircle,
  faTimesCircle,
  faTimes,
  faComment,
  faArrowUp,
  faUserShield,
  faBalanceScale,
} from '@fortawesome/free-solid-svg-icons';
import { useDisputes } from '@/hooks/useDisputes';
import type {
  Dispute,
  DisputeStatus,
  DisputeReason,
  DisputeActivity,
  ResolveDisputePayload,
} from '@/types/dispute';

const STATUS_CONFIG: Record<DisputeStatus, { label: string; color: string; icon: typeof faGavel }> = {
  open: { label: 'Open', color: 'bg-blue-100 text-blue-800', icon: faExclamationTriangle },
  awaiting_response: { label: 'Awaiting Response', color: 'bg-yellow-100 text-yellow-800', icon: faClock },
  under_review: { label: 'Under Review', color: 'bg-purple-100 text-purple-800', icon: faEye },
  escalated: { label: 'Escalated', color: 'bg-red-100 text-red-800', icon: faArrowUp },
  resolved: { label: 'Resolved', color: 'bg-green-100 text-green-800', icon: faCheckCircle },
  closed: { label: 'Closed', color: 'bg-gray-100 text-gray-800', icon: faTimesCircle },
};

const REASON_LABELS: Record<DisputeReason, string> = {
  damage: 'Equipment Damage',
  late_return: 'Late Return',
  wrong_equipment: 'Wrong Equipment',
  no_show: 'No Show',
  quality_issue: 'Quality Issue',
  billing_issue: 'Billing Issue',
  safety_concern: 'Safety Concern',
  penalty_challenge: 'Penalty Challenge',
  other: 'Other',
};

export default function DisputesManagement() {
  const { t } = useTranslation('common');
  const {
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
  } = useDisputes();

  const [statusFilter, setStatusFilter] = useState<string>('');
  const [reasonFilter, setReasonFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [selectedDisputeId, setSelectedDisputeId] = useState<string | null>(null);
  const [showResolveForm, setShowResolveForm] = useState(false);
  const [resolveForm, setResolveForm] = useState<ResolveDisputePayload>({ outcome: 'no_action' });

  useEffect(() => {
    fetchDisputes({ status: statusFilter || undefined, reason: reasonFilter || undefined, page, limit: 20 });
    fetchStats();
  }, [fetchDisputes, fetchStats, statusFilter, reasonFilter, page]);

  const handleViewDispute = useCallback(async (id: string) => {
    setSelectedDisputeId(id);
    await fetchDispute(id);
    await fetchActivities(id);
  }, [fetchDispute, fetchActivities]);

  const handleEscalate = async () => {
    if (!selectedDisputeId) return;
    try {
      await escalateDispute(selectedDisputeId);
      await fetchDispute(selectedDisputeId);
      fetchDisputes({ status: statusFilter || undefined, reason: reasonFilter || undefined, page, limit: 20 });
    } catch { /* handle */ }
  };

  const handleResolve = async () => {
    if (!selectedDisputeId) return;
    try {
      await resolveDispute(selectedDisputeId, resolveForm);
      setShowResolveForm(false);
      await fetchDispute(selectedDisputeId);
      fetchDisputes({ status: statusFilter || undefined, reason: reasonFilter || undefined, page, limit: 20 });
      fetchStats();
    } catch { /* handle */ }
  };

  const handleClose = async () => {
    if (!selectedDisputeId) return;
    try {
      await closeDispute(selectedDisputeId);
      setSelectedDisputeId(null);
      fetchDisputes({ status: statusFilter || undefined, reason: reasonFilter || undefined, page, limit: 20 });
      fetchStats();
    } catch { /* handle */ }
  };

  const filteredDisputes = searchTerm
    ? disputes.filter(d =>
        d.disputeNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.claimant?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.respondent?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : disputes;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground flex items-center gap-2">
            <FontAwesomeIcon icon={faGavel} className="text-indigo-600" />
            Dispute Center
          </h1>
          <p className="text-sm text-gray-500 dark:text-muted-foreground mt-1">Manage and resolve booking disputes</p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {([
            { label: 'Open', value: stats.open, color: 'text-blue-600' },
            { label: 'Awaiting Response', value: stats.awaitingResponse, color: 'text-yellow-600' },
            { label: 'Under Review', value: stats.underReview, color: 'text-purple-600' },
            { label: 'Escalated', value: stats.escalated, color: 'text-red-600' },
            { label: 'Resolved', value: stats.resolved, color: 'text-green-600' },
            { label: 'Total', value: stats.total, color: 'text-gray-900 dark:text-foreground' },
          ]).map(s => (
            <div key={s.label} className="bg-white dark:bg-card rounded-lg border border-gray-200 dark:border-border p-4 text-center">
              <div className={cn('text-2xl font-bold', s.color)}>{s.value}</div>
              <div className="text-xs text-gray-500 dark:text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by dispute #, name..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm dark:bg-card dark:border-border dark:text-foreground"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="border rounded-lg px-3 py-2 text-sm dark:bg-card dark:border-border dark:text-foreground"
        >
          <option value="">All Statuses</option>
          {Object.entries(STATUS_CONFIG).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>
        <select
          value={reasonFilter}
          onChange={e => { setReasonFilter(e.target.value); setPage(1); }}
          className="border rounded-lg px-3 py-2 text-sm dark:bg-card dark:border-border dark:text-foreground"
        >
          <option value="">All Reasons</option>
          {Object.entries(REASON_LABELS).map(([key, val]) => (
            <option key={key} value={key}>{val}</option>
          ))}
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400 text-sm">{error}</div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-card rounded-lg border border-gray-200 dark:border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-muted border-b dark:border-border">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-muted-foreground">Dispute #</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-muted-foreground">Claimant</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-muted-foreground">Respondent</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-muted-foreground">Reason</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-muted-foreground">Priority</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-muted-foreground">Created</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-border">
              {loading && !disputes.length ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400 dark:text-muted-foreground">Loading...</td></tr>
              ) : filteredDisputes.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400 dark:text-muted-foreground">No disputes found</td></tr>
              ) : filteredDisputes.map(d => {
                const statusCfg = STATUS_CONFIG[d.status];
                return (
                  <tr key={d.id} className="hover:bg-gray-50 dark:hover:bg-muted">
                    <td className="px-4 py-3 font-medium text-indigo-600">{d.disputeNumber}</td>
                    <td className="px-4 py-3 dark:text-foreground">{d.claimant?.fullName || '-'}</td>
                    <td className="px-4 py-3 dark:text-foreground">{d.respondent?.fullName || '-'}</td>
                    <td className="px-4 py-3 dark:text-foreground">{REASON_LABELS[d.reason] || d.reason}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'px-2 py-0.5 rounded-full text-xs font-medium',
                        d.priority === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                        d.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                        d.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      )}>
                        {d.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', statusCfg?.color)}>
                        {statusCfg?.label || d.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-muted-foreground">{new Date(d.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDispute(d.id)}
                      >
                        <FontAwesomeIcon icon={faEye} className="mr-1" /> View
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 20 && (
          <div className="flex items-center justify-between px-4 py-3 border-t dark:border-border">
            <div className="text-sm text-gray-500 dark:text-muted-foreground">
              Showing {(page - 1) * 20 + 1}-{Math.min(page * 20, total)} of {total}
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
              <Button size="sm" variant="outline" disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedDisputeId && currentDispute && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-card rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border dark:border-border">
            <div className="flex items-center justify-between p-6 border-b dark:border-border">
              <div>
                <h2 className="text-lg font-bold dark:text-foreground">{currentDispute.disputeNumber}</h2>
                <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', STATUS_CONFIG[currentDispute.status]?.color)}>
                  {STATUS_CONFIG[currentDispute.status]?.label}
                </span>
              </div>
              <button onClick={() => { setSelectedDisputeId(null); setShowResolveForm(false); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <FontAwesomeIcon icon={faTimes} className="text-xl" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Parties */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">Claimant</div>
                  <div className="font-semibold dark:text-foreground">{currentDispute.claimant?.fullName || '-'}</div>
                  <div className="text-sm text-gray-500 dark:text-muted-foreground">{currentDispute.claimant?.mobileNumber}</div>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                  <div className="text-xs text-orange-600 dark:text-orange-400 font-medium mb-1">Respondent</div>
                  <div className="font-semibold dark:text-foreground">{currentDispute.respondent?.fullName || '-'}</div>
                  <div className="text-sm text-gray-500 dark:text-muted-foreground">{currentDispute.respondent?.mobileNumber}</div>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3">
                <div className="flex gap-4 text-sm dark:text-foreground">
                  <div><span className="text-gray-500 dark:text-muted-foreground">Reason:</span> <span className="font-medium">{REASON_LABELS[currentDispute.reason]}</span></div>
                  <div><span className="text-gray-500 dark:text-muted-foreground">Priority:</span> <span className="font-medium capitalize">{currentDispute.priority}</span></div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-muted-foreground mb-1">Description</div>
                  <p className="text-sm bg-gray-50 dark:bg-muted rounded-lg p-3 dark:text-foreground">{currentDispute.description}</p>
                </div>
                {currentDispute.respondentResponse && (
                  <div>
                    <div className="text-sm text-gray-500 dark:text-muted-foreground mb-1">Respondent Response</div>
                    <p className="text-sm bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 dark:text-foreground">{currentDispute.respondentResponse}</p>
                  </div>
                )}
                {currentDispute.responseDeadline && (
                  <div className="text-sm dark:text-foreground">
                    <span className="text-gray-500 dark:text-muted-foreground">Response Deadline:</span>{' '}
                    <span className="font-medium">{new Date(currentDispute.responseDeadline).toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Evidence */}
              {(currentDispute.claimantEvidence?.length || currentDispute.respondentEvidence?.length) && (
                <div className="space-y-2">
                  <div className="text-sm font-medium dark:text-foreground">Evidence</div>
                  {currentDispute.claimantEvidence?.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline block">
                      Claimant evidence #{i + 1}
                    </a>
                  ))}
                  {currentDispute.respondentEvidence?.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-orange-600 dark:text-orange-400 hover:underline block">
                      Respondent evidence #{i + 1}
                    </a>
                  ))}
                </div>
              )}

              {/* Resolution */}
              {currentDispute.resolution && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 space-y-2">
                  <div className="text-sm font-medium text-green-800 dark:text-green-400">Resolution</div>
                  <div className="text-sm dark:text-foreground">Outcome: <span className="font-medium">{currentDispute.resolution.outcome?.replace(/_/g, ' ')}</span></div>
                  {currentDispute.resolution.refundAmount !== undefined && (
                    <div className="text-sm dark:text-foreground">Refund: SAR {currentDispute.resolution.refundAmount}</div>
                  )}
                  {currentDispute.resolution.penaltyAmount !== undefined && (
                    <div className="text-sm dark:text-foreground">Penalty: SAR {currentDispute.resolution.penaltyAmount} ({currentDispute.resolution.penaltyTarget})</div>
                  )}
                  {currentDispute.resolution.adminNotes && (
                    <div className="text-sm text-gray-600 dark:text-muted-foreground">{currentDispute.resolution.adminNotes}</div>
                  )}
                </div>
              )}

              {/* Activity Log */}
              {activities.length > 0 && (
                <div>
                  <div className="text-sm font-medium mb-2 dark:text-foreground">Activity Log</div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {activities.map(a => (
                      <div key={a.id} className="flex gap-3 text-sm">
                        <div className="text-gray-400 dark:text-muted-foreground whitespace-nowrap">{new Date(a.createdAt).toLocaleString()}</div>
                        <div className="dark:text-foreground">
                          <span className="font-medium">{a.actor?.fullName || 'System'}</span>
                          {' - '}
                          <span>{a.description || a.activityType.replace(/_/g, ' ')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resolve Form */}
              {showResolveForm && (
                <div className="bg-gray-50 dark:bg-muted rounded-lg p-4 space-y-3">
                  <div className="text-sm font-medium dark:text-foreground">Resolve Dispute</div>
                  <select
                    value={resolveForm.outcome}
                    onChange={e => setResolveForm(f => ({ ...f, outcome: e.target.value as any }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-card dark:border-border dark:text-foreground"
                  >
                    <option value="no_action">No Action</option>
                    <option value="in_favor_of_claimant">In Favor of Claimant</option>
                    <option value="in_favor_of_respondent">In Favor of Respondent</option>
                    <option value="mutual_agreement">Mutual Agreement</option>
                  </select>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      placeholder="Refund amount (SAR)"
                      value={resolveForm.refundAmount || ''}
                      onChange={e => setResolveForm(f => ({ ...f, refundAmount: Number(e.target.value) || undefined }))}
                      className="border rounded-lg px-3 py-2 text-sm dark:bg-card dark:border-border dark:text-foreground"
                    />
                    <input
                      type="number"
                      placeholder="Penalty amount (SAR)"
                      value={resolveForm.penaltyAmount || ''}
                      onChange={e => setResolveForm(f => ({ ...f, penaltyAmount: Number(e.target.value) || undefined }))}
                      className="border rounded-lg px-3 py-2 text-sm dark:bg-card dark:border-border dark:text-foreground"
                    />
                  </div>
                  <textarea
                    placeholder="Admin notes..."
                    value={resolveForm.adminNotes || ''}
                    onChange={e => setResolveForm(f => ({ ...f, adminNotes: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-card dark:border-border dark:text-foreground"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleResolve}>Confirm Resolution</Button>
                    <Button size="sm" variant="outline" onClick={() => setShowResolveForm(false)}>Cancel</Button>
                  </div>
                </div>
              )}

              {/* Admin Actions */}
              {currentDispute.status !== 'resolved' && currentDispute.status !== 'closed' && !showResolveForm && (
                <div className="flex flex-wrap gap-2 border-t dark:border-border pt-4">
                  <Button size="sm" variant="outline" onClick={handleEscalate}>
                    <FontAwesomeIcon icon={faArrowUp} className="mr-1" /> Escalate
                  </Button>
                  <Button size="sm" onClick={() => setShowResolveForm(true)}>
                    <FontAwesomeIcon icon={faBalanceScale} className="mr-1" /> Resolve
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleClose} className="text-red-600 border-red-300">
                    <FontAwesomeIcon icon={faTimesCircle} className="mr-1" /> Close
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
