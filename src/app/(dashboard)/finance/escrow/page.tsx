'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLock,
  faShieldAlt,
  faMoneyBillWave,
  faExclamationTriangle,
  faSearch,
  faFilter,
  faEye,
  faRedo,
  faArrowRight,
  faArrowLeft,
  faTimes,
  faCheck,
  faClock,
  faSpinner,
  faChevronLeft,
  faChevronRight,
  faHandHoldingUsd,
  faUndoAlt,
  faGavel,
} from '@fortawesome/free-solid-svg-icons';
import {
  escrowService,
  EscrowRecord,
  EscrowStats,
  EscrowStatus,
  EscrowFilters,
} from '@/services/escrowService';

const STATUS_OPTIONS: EscrowStatus[] = [
  'pending', 'held', 'partially_released', 'release_pending', 'released',
  'refund_pending', 'refunded', 'partial_refund_pending', 'partial_refunded',
  'disputed', 'dispute_resolved', 'expired', 'release_failed',
];

const EscrowManagementPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  // Data state
  const [escrows, setEscrows] = useState<EscrowRecord[]>([]);
  const [stats, setStats] = useState<EscrowStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filters, setFilters] = useState<EscrowFilters>({ page: 1, limit: 20 });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<EscrowStatus | ''>('');
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Detail modal
  const [selectedEscrow, setSelectedEscrow] = useState<EscrowRecord | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Escalated payouts
  const [escalatedPayouts, setEscalatedPayouts] = useState<EscrowRecord[]>([]);
  const [escalatedLoading, setEscalatedLoading] = useState(false);

  // Reconciliation
  const [reconResult, setReconResult] = useState<any>(null);
  const [reconLoading, setReconLoading] = useState(false);

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const activeFilters: EscrowFilters = {
        ...filters,
        search: searchTerm || undefined,
        status: statusFilter || undefined,
      };
      const [listResult, statsResult] = await Promise.all([
        escrowService.getEscrowList(activeFilters),
        escrowService.getEscrowStats(),
      ]);
      setEscrows(listResult.escrows);
      setTotalPages(listResult.totalPages);
      setTotalItems(listResult.total);
      setStats(statsResult);
    } catch (err: any) {
      setError(err.message || 'Failed to load escrow data');
    } finally {
      setLoading(false);
    }
  }, [filters, searchTerm, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Search handler
  const handleSearch = () => {
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  // Pagination
  const goToPage = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  // Actions
  const handleForceRelease = async (escrowId: string, stage: number) => {
    if (!confirm(`Force release Stage ${stage} payout?`)) return;
    setActionLoading(true);
    try {
      await escrowService.forceRelease(escrowId, stage);
      fetchData();
      setShowDetail(false);
    } catch (err: any) {
      alert(err.message || 'Failed to force release');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRetryPayout = async (escrowId: string) => {
    setActionLoading(true);
    try {
      await escrowService.retryPayout(escrowId);
      fetchData();
      setShowDetail(false);
    } catch (err: any) {
      alert(err.message || 'Failed to retry payout');
    } finally {
      setActionLoading(false);
    }
  };

  const handleForceRefund = async (escrowId: string) => {
    if (!confirm('Force a full refund on this escrow?')) return;
    setActionLoading(true);
    try {
      await escrowService.forceRefund(escrowId);
      fetchData();
      setShowDetail(false);
    } catch (err: any) {
      alert(err.message || 'Failed to force refund');
    } finally {
      setActionLoading(false);
    }
  };

  const viewDetail = async (escrow: EscrowRecord) => {
    setSelectedEscrow(escrow);
    setShowDetail(true);
  };

  const loadEscalatedPayouts = async () => {
    setEscalatedLoading(true);
    try {
      const data = await escrowService.getEscalatedPayouts();
      setEscalatedPayouts(data);
    } catch (err: any) {
      alert(err.message || 'Failed to load escalated payouts');
    } finally {
      setEscalatedLoading(false);
    }
  };

  const runReconciliation = async () => {
    if (!confirm(isRTL ? 'تشغيل التسوية الآن؟' : 'Run reconciliation now?')) return;
    setReconLoading(true);
    try {
      const result = await escrowService.runReconciliation();
      setReconResult(result);
    } catch (err: any) {
      alert(err.message || 'Reconciliation failed');
    } finally {
      setReconLoading(false);
    }
  };

  // Helpers
  const fmt = (amount: number) => escrowService.formatCurrency(amount);
  const statusLabel = (s: EscrowStatus) => escrowService.getStatusLabel(s, isRTL);
  const statusVariant = (s: EscrowStatus) => escrowService.getStatusVariant(s);

  const badgeClass = (variant: string) => {
    switch (variant) {
      case 'success': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'warning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'danger': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'info': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
          <FontAwesomeIcon icon={faLock} className="text-indigo-600 dark:text-indigo-400 text-xl" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isRTL ? 'إدارة الضمان' : 'Escrow Management'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isRTL ? 'تتبع وإدارة عمليات الضمان والدفع' : 'Track and manage escrow records, payouts, and refunds'}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={faShieldAlt}
            label={isRTL ? 'محتجز حالياً' : 'Currently Held'}
            value={stats.totalHeld}
            amount={fmt(stats.heldAmount)}
            color="blue"
          />
          <StatCard
            icon={faMoneyBillWave}
            label={isRTL ? 'تم الإفراج' : 'Released'}
            value={stats.totalReleased}
            amount={fmt(stats.releasedAmount)}
            color="green"
          />
          <StatCard
            icon={faUndoAlt}
            label={isRTL ? 'مُسترد' : 'Refunded'}
            value={stats.totalRefunded}
            amount={fmt(stats.refundedAmount)}
            color="gray"
          />
          <StatCard
            icon={faExclamationTriangle}
            label={isRTL ? 'يحتاج اهتمام' : 'Needs Attention'}
            value={stats.totalDisputed + stats.totalFailed}
            subLabel={`${stats.totalDisputed} ${isRTL ? 'نزاع' : 'disputed'} · ${stats.totalFailed} ${isRTL ? 'فشل' : 'failed'}`}
            color="red"
          />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <FontAwesomeIcon icon={faSearch} className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
          <input
            type="text"
            placeholder={isRTL ? 'بحث بالمعرف...' : 'Search by ID...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className={`w-full ${isRTL ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-2 border rounded-lg bg-card text-foreground border-border focus:outline-none focus:ring-2 focus:ring-primary`}
          />
        </div>
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faFilter} className="text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as EscrowStatus | '');
              setFilters(prev => ({ ...prev, page: 1 }));
            }}
            className="px-3 py-2 border rounded-lg bg-card text-foreground border-border"
          >
            <option value="">{isRTL ? 'كل الحالات' : 'All Statuses'}</option>
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{escrowService.getStatusLabel(s, isRTL)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <FontAwesomeIcon icon={faSpinner} spin className="text-2xl text-muted-foreground" />
          </div>
        ) : escrows.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            {isRTL ? 'لا توجد سجلات ضمان' : 'No escrow records found'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className={`px-4 py-3 font-medium text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>ID</th>
                  <th className={`px-4 py-3 font-medium text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? 'الحالة' : 'Status'}</th>
                  <th className={`px-4 py-3 font-medium text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? 'المبلغ' : 'Amount'}</th>
                  <th className={`px-4 py-3 font-medium text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? 'الضمان' : 'Escrow'}</th>
                  <th className={`px-4 py-3 font-medium text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? 'المرحلة 1' : 'Stage 1'}</th>
                  <th className={`px-4 py-3 font-medium text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? 'المرحلة 2' : 'Stage 2'}</th>
                  <th className={`px-4 py-3 font-medium text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? 'التاريخ' : 'Date'}</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground text-center">{isRTL ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {escrows.map((escrow) => (
                  <tr key={escrow.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs">{escrow.id.slice(0, 8)}...</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeClass(statusVariant(escrow.status))}`}>
                        {statusLabel(escrow.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium">{fmt(escrow.totalChargedAmount)}</td>
                    <td className="px-4 py-3">{fmt(escrow.escrowAmount)}</td>
                    <td className="px-4 py-3">
                      <span className={escrow.stage1PaidOut ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}>
                        {fmt(escrow.stage1Amount)}
                        {escrow.stage1PaidOut && <FontAwesomeIcon icon={faCheck} className={`${isRTL ? 'mr-1' : 'ml-1'} text-xs`} />}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={escrow.stage2PaidOut ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}>
                        {fmt(escrow.stage2Amount)}
                        {escrow.stage2PaidOut && <FontAwesomeIcon icon={faCheck} className={`${isRTL ? 'mr-1' : 'ml-1'} text-xs`} />}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {new Date(escrow.createdAt).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => viewDetail(escrow)}
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                        title={isRTL ? 'عرض التفاصيل' : 'View Details'}
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <span className="text-sm text-muted-foreground">
              {isRTL ? `${totalItems} سجل` : `${totalItems} records`}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={filters.page === 1}
                onClick={() => goToPage((filters.page ?? 1) - 1)}
                className="p-2 rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FontAwesomeIcon icon={isRTL ? faChevronRight : faChevronLeft} />
              </button>
              <span className="text-sm">
                {filters.page} / {totalPages}
              </span>
              <button
                disabled={filters.page === totalPages}
                onClick={() => goToPage((filters.page ?? 1) + 1)}
                className="p-2 rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FontAwesomeIcon icon={isRTL ? faChevronLeft : faChevronRight} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Escalated Payouts Section */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-amber-500" />
            <h2 className="text-lg font-semibold text-foreground">
              {isRTL ? 'المدفوعات المُصعَّدة' : 'Escalated Payouts'}
            </h2>
            {escalatedPayouts.length > 0 && (
              <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-medium px-2 py-0.5 rounded-full">
                {escalatedPayouts.length}
              </span>
            )}
          </div>
          <button
            onClick={loadEscalatedPayouts}
            disabled={escalatedLoading}
            className="px-3 py-1.5 text-sm rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors disabled:opacity-50"
          >
            {escalatedLoading ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faRedo} />}
            <span className={`${isRTL ? 'mr-1.5' : 'ml-1.5'}`}>{isRTL ? 'تحميل' : 'Load'}</span>
          </button>
        </div>
        {escalatedPayouts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className={`px-4 py-3 font-medium text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>ID</th>
                  <th className={`px-4 py-3 font-medium text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? 'الحجز' : 'Booking'}</th>
                  <th className={`px-4 py-3 font-medium text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? 'المبلغ' : 'Amount'}</th>
                  <th className={`px-4 py-3 font-medium text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? 'المحاولات' : 'Retries'}</th>
                  <th className={`px-4 py-3 font-medium text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? 'تاريخ التصعيد' : 'Escalated At'}</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground text-center">{isRTL ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {escalatedPayouts.map((ep) => (
                  <tr key={ep.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs">{ep.id.slice(0, 8)}...</td>
                    <td className="px-4 py-3 font-mono text-xs">{ep.bookingId?.slice(0, 8) || '—'}...</td>
                    <td className="px-4 py-3 font-medium">{fmt(ep.escrowAmount)}</td>
                    <td className="px-4 py-3">
                      <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs px-2 py-0.5 rounded-full font-medium">
                        {(ep as any).payoutRetryCount || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {(ep as any).payoutEscalatedAt ? new Date((ep as any).payoutEscalatedAt).toLocaleString(isRTL ? 'ar-SA' : 'en-US') : '—'}
                    </td>
                    <td className="px-4 py-3 text-center space-x-2">
                      <button onClick={() => viewDetail(ep)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground" title="View">
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                      <button onClick={() => handleRetryPayout(ep.id)} className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600" title="Retry">
                        <FontAwesomeIcon icon={faRedo} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground text-sm">
            {escalatedLoading
              ? <FontAwesomeIcon icon={faSpinner} spin className="text-xl" />
              : (isRTL ? 'اضغط "تحميل" لعرض المدفوعات المُصعَّدة' : 'Click "Load" to view escalated payouts')}
          </div>
        )}
      </div>

      {/* Reconciliation Section */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faShieldAlt} className="text-indigo-500" />
            <h2 className="text-lg font-semibold text-foreground">
              {isRTL ? 'التسوية' : 'Reconciliation'}
            </h2>
          </div>
          <button
            onClick={runReconciliation}
            disabled={reconLoading}
            className="px-4 py-1.5 text-sm rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors disabled:opacity-50"
          >
            {reconLoading ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faShieldAlt} />}
            <span className={`${isRTL ? 'mr-1.5' : 'ml-1.5'}`}>{isRTL ? 'تشغيل التسوية' : 'Run Reconciliation'}</span>
          </button>
        </div>
        {reconResult ? (
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="text-xs text-muted-foreground mb-1">{isRTL ? 'تم الفحص' : 'Checked'}</div>
                <div className="text-xl font-bold text-foreground">{reconResult.totalChecked}</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="text-xs text-muted-foreground mb-1">{isRTL ? 'عدم التطابق' : 'Mismatches'}</div>
                <div className={`text-xl font-bold ${reconResult.totalMismatches > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {reconResult.totalMismatches}
                </div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="text-xs text-muted-foreground mb-1">{isRTL ? 'ضمانات راكدة' : 'Stale Held'}</div>
                <div className={`text-xl font-bold ${reconResult.staleHeldCount > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                  {reconResult.staleHeldCount}
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {isRTL ? `آخر تشغيل: ${new Date(reconResult.runAt).toLocaleString('ar-SA')}` : `Last run: ${new Date(reconResult.runAt).toLocaleString('en-US')}`}
            </p>
            {reconResult.mismatches && reconResult.mismatches.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">{isRTL ? 'التفاصيل' : 'Mismatch Details'}</h3>
                {reconResult.mismatches.map((m: any, idx: number) => (
                  <div key={idx} className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg text-sm">
                    <div className="flex items-start gap-2">
                      <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 mt-0.5" />
                      <div>
                        <span className="font-medium text-red-700 dark:text-red-400 capitalize">{m.type.replace(/_/g, ' ')}</span>
                        <p className="text-red-600 dark:text-red-300 text-xs mt-0.5">{m.detail}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Escrow: <span className="font-mono">{m.escrowId?.slice(0, 8)}...</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {reconResult.totalMismatches === 0 && (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
                <FontAwesomeIcon icon={faCheck} />
                {isRTL ? 'جميع السجلات متطابقة' : 'All records are in sync'}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground text-sm">
            {reconLoading
              ? <FontAwesomeIcon icon={faSpinner} spin className="text-xl" />
              : (isRTL ? 'اضغط "تشغيل التسوية" لمقارنة السجلات مع بوابة الدفع' : 'Click "Run Reconciliation" to compare records with the payment gateway')}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetail && selectedEscrow && (
        <EscrowDetailModal
          escrow={selectedEscrow}
          isRTL={isRTL}
          onClose={() => { setShowDetail(false); setSelectedEscrow(null); }}
          onForceRelease={handleForceRelease}
          onRetryPayout={handleRetryPayout}
          onForceRefund={handleForceRefund}
          actionLoading={actionLoading}
        />
      )}
    </div>
  );
};

// ============================================
// STAT CARD COMPONENT
// ============================================

interface StatCardProps {
  icon: any;
  label: string;
  value: number;
  amount?: string;
  subLabel?: string;
  color: 'blue' | 'green' | 'red' | 'gray';
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, amount, subLabel, color }) => {
  const colorMap = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    red: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    gray: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${colorMap[color]}`}>
          <FontAwesomeIcon icon={icon} />
        </div>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <div className="text-2xl font-bold text-foreground">{value}</div>
      {amount && <div className="text-sm text-muted-foreground mt-1">{amount}</div>}
      {subLabel && <div className="text-xs text-muted-foreground mt-1">{subLabel}</div>}
    </div>
  );
};

// ============================================
// DETAIL MODAL COMPONENT
// ============================================

interface EscrowDetailModalProps {
  escrow: EscrowRecord;
  isRTL: boolean;
  onClose: () => void;
  onForceRelease: (id: string, stage: number) => void;
  onRetryPayout: (id: string) => void;
  onForceRefund: (id: string) => void;
  actionLoading: boolean;
}

const EscrowDetailModal: React.FC<EscrowDetailModalProps> = ({
  escrow,
  isRTL,
  onClose,
  onForceRelease,
  onRetryPayout,
  onForceRefund,
  actionLoading,
}) => {
  const fmt = (amount: number) => escrowService.formatCurrency(amount);
  const statusLabel = (s: EscrowStatus) => escrowService.getStatusLabel(s, isRTL);
  const fmtDate = (d?: string) => d ? new Date(d).toLocaleString(isRTL ? 'ar-SA' : 'en-US') : '—';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="text-lg font-bold text-foreground">{isRTL ? 'تفاصيل الضمان' : 'Escrow Details'}</h2>
            <span className="text-xs font-mono text-muted-foreground">{escrow.id}</span>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status + Key Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <InfoBox label={isRTL ? 'الحالة' : 'Status'} value={statusLabel(escrow.status)} />
            <InfoBox label={isRTL ? 'العملة' : 'Currency'} value={escrow.currency} />
            <InfoBox label={isRTL ? 'أنشئ في' : 'Created'} value={fmtDate(escrow.createdAt)} />
            <InfoBox label={isRTL ? 'ملغي بواسطة' : 'Cancelled By'} value={escrow.cancelledBy || '—'} />
          </div>

          {/* Financial Breakdown */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">{isRTL ? 'التفاصيل المالية' : 'Financial Breakdown'}</h3>
            <div className="bg-muted/30 rounded-xl p-4 space-y-2 text-sm">
              <Row label={isRTL ? 'إجمالي المحصل' : 'Total Charged'} value={fmt(escrow.totalChargedAmount)} bold />
              <Row label={isRTL ? 'عمولة الطالب' : 'Requester Commission'} value={`${fmt(escrow.requesterCommission)} (${escrow.requesterCommissionRate}%)`} />
              <Row label={isRTL ? 'عمولة المالك' : 'Owner Commission'} value={`${fmt(escrow.ownerCommission)} (${escrow.ownerCommissionRate}%)`} />
              <div className="border-t border-border my-2" />
              <Row label={isRTL ? 'مبلغ الضمان' : 'Escrow Amount'} value={fmt(escrow.escrowAmount)} bold />
              <Row
                label={isRTL ? 'المرحلة 1 (تسليم)' : 'Stage 1 (Delivery)'}
                value={`${fmt(escrow.stage1Amount)} ${escrow.stage1PaidOut ? '✓' : ''}`}
                sub={escrow.stage1PaidAt ? fmtDate(escrow.stage1PaidAt) : undefined}
              />
              <Row
                label={isRTL ? 'المرحلة 2 (إتمام)' : 'Stage 2 (Completion)'}
                value={`${fmt(escrow.stage2Amount)} ${escrow.stage2PaidOut ? '✓' : ''}`}
                sub={escrow.stage2PaidAt ? fmtDate(escrow.stage2PaidAt) : undefined}
              />
              <div className="border-t border-border my-2" />
              <Row label={isRTL ? 'إجمالي المدفوع' : 'Total Paid Out'} value={fmt(escrow.totalPaidOut)} />
              <Row label={isRTL ? 'إجمالي المسترد' : 'Total Refunded'} value={fmt(escrow.totalRefunded)} />
              {escrow.cancellationFee > 0 && (
                <Row label={isRTL ? 'رسوم الإلغاء' : 'Cancellation Fee'} value={`${fmt(escrow.cancellationFee)} (${escrow.cancellationFeePercent}%)`} />
              )}
            </div>
          </div>

          {/* Payout Channel */}
          {escrow.payoutChannelSnapshot && (
            <div>
              <h3 className="font-semibold text-foreground mb-3">{isRTL ? 'قناة الدفع' : 'Payout Channel'}</h3>
              <div className="bg-muted/30 rounded-xl p-4 text-sm space-y-1">
                <Row label="IBAN" value={escrow.payoutChannelSnapshot.iban} />
                <Row label={isRTL ? 'البنك' : 'Bank'} value={escrow.payoutChannelSnapshot.bankName} />
                <Row label={isRTL ? 'المستفيد' : 'Beneficiary'} value={escrow.payoutChannelSnapshot.beneficiaryName} />
              </div>
            </div>
          )}

          {/* Snapshotted Settings */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">{isRTL ? 'إعدادات محفوظة' : 'Snapshotted Settings'}</h3>
            <div className="bg-muted/30 rounded-xl p-4 text-sm space-y-1">
              <Row label={isRTL ? 'نافذة الدفع' : 'Payment Window'} value={escrowService.formatMinutes(escrow.settingPaymentWindow, isRTL)} />
              <Row label={isRTL ? 'نسبة الدفعة الأولى' : 'Delivery Payout %'} value={`${escrow.settingDeliveryPayoutPercentage}%`} />
              <Row label={isRTL ? 'سقف الدفعة الأولى' : 'Delivery Payout Cap'} value={fmt(escrow.settingDeliveryPayoutCap)} />
              <Row label={isRTL ? 'إلغاء تلقائي' : 'Auto-Cancel (no dispatch)'} value={escrowService.formatMinutes(escrow.settingAutoCancelNoDispatch, isRTL)} />
              <Row label={isRTL ? 'تأكيد التسليم' : 'Delivery Confirm'} value={escrowService.formatMinutes(escrow.settingDeliveryConfirm, isRTL)} />
              <Row label={isRTL ? 'تأكيد تلقائي للإتمام' : 'Auto-Confirm Completion'} value={escrowService.formatMinutes(escrow.settingAutoConfirmCompletion, isRTL)} />
            </div>
          </div>

          {/* Gateway References */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">{isRTL ? 'مراجع البوابة' : 'Gateway References'}</h3>
            <div className="bg-muted/30 rounded-xl p-4 text-sm space-y-1">
              <Row label="Checkout ID" value={escrow.gatewayCheckoutId || '—'} />
              <Row label="Payment ID" value={escrow.gatewayPaymentId || '—'} />
              <Row label="Stage 1 Payout ID" value={escrow.gatewayStage1PayoutId || '—'} />
              <Row label="Stage 2 Payout ID" value={escrow.gatewayStage2PayoutId || '—'} />
            </div>
          </div>

          {/* Payout Retry Info (shown for failed/escalated) */}
          {((escrow as any).payoutRetryCount > 0 || (escrow as any).payoutEscalated) && (
            <div>
              <h3 className="font-semibold text-foreground mb-3">{isRTL ? 'معلومات إعادة المحاولة' : 'Payout Retry Info'}</h3>
              <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-sm space-y-1">
                <Row label={isRTL ? 'عدد المحاولات' : 'Retry Count'} value={String((escrow as any).payoutRetryCount || 0)} />
                <Row label={isRTL ? 'آخر محاولة' : 'Last Retry'} value={fmtDate((escrow as any).lastPayoutRetryAt)} />
                <Row label={isRTL ? 'المحاولة التالية' : 'Next Retry'} value={fmtDate((escrow as any).nextPayoutRetryAt)} />
                {(escrow as any).payoutEscalated && (
                  <>
                    <div className="border-t border-amber-300 dark:border-amber-700 my-2" />
                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-medium">
                      <FontAwesomeIcon icon={faExclamationTriangle} />
                      {isRTL ? 'تم التصعيد للمشرف' : 'Escalated to Admin'}
                    </div>
                    <Row label={isRTL ? 'تاريخ التصعيد' : 'Escalated At'} value={fmtDate((escrow as any).payoutEscalatedAt)} />
                  </>
                )}
              </div>
            </div>
          )}

          {/* Status History / Audit Trail */}
          {escrow.statusHistory && escrow.statusHistory.length > 0 && (
            <div>
              <h3 className="font-semibold text-foreground mb-3">{isRTL ? 'سجل الحالة' : 'Status History'}</h3>
              <div className="bg-muted/30 rounded-xl p-4 space-y-2">
                {escrow.statusHistory.map((entry, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <FontAwesomeIcon icon={faClock} className="text-muted-foreground mt-0.5" />
                    <div>
                      <span className="font-medium">{escrowService.getStatusLabel(entry.status, isRTL)}</span>
                      <span className="text-muted-foreground mx-2">—</span>
                      <span className="text-muted-foreground text-xs">{fmtDate(entry.timestamp)}</span>
                      {entry.note && <p className="text-xs text-muted-foreground mt-0.5">{entry.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Admin Actions */}
          <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
            {(escrow.status === 'held' && !escrow.stage1PaidOut) && (
              <ActionButton
                icon={faHandHoldingUsd}
                label={isRTL ? 'إفراج المرحلة 1' : 'Force Stage 1'}
                onClick={() => onForceRelease(escrow.id, 1)}
                loading={actionLoading}
                variant="blue"
              />
            )}
            {(escrow.status === 'partially_released' && !escrow.stage2PaidOut) && (
              <ActionButton
                icon={faHandHoldingUsd}
                label={isRTL ? 'إفراج المرحلة 2' : 'Force Stage 2'}
                onClick={() => onForceRelease(escrow.id, 2)}
                loading={actionLoading}
                variant="blue"
              />
            )}
            {escrow.status === 'release_failed' && (
              <ActionButton
                icon={faRedo}
                label={isRTL ? 'إعادة المحاولة' : 'Retry Payout'}
                onClick={() => onRetryPayout(escrow.id)}
                loading={actionLoading}
                variant="yellow"
              />
            )}
            {(escrow.status === 'held' || escrow.status === 'partially_released') && (
              <ActionButton
                icon={faUndoAlt}
                label={isRTL ? 'إجبار الاسترداد' : 'Force Refund'}
                onClick={() => onForceRefund(escrow.id)}
                loading={actionLoading}
                variant="red"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// HELPER COMPONENTS
// ============================================

const InfoBox: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="bg-muted/30 rounded-lg p-3">
    <div className="text-xs text-muted-foreground mb-1">{label}</div>
    <div className="text-sm font-medium text-foreground">{value}</div>
  </div>
);

const Row: React.FC<{ label: string; value: string; bold?: boolean; sub?: string }> = ({
  label, value, bold, sub,
}) => (
  <div className="flex justify-between items-start">
    <span className="text-muted-foreground">{label}</span>
    <div className="text-right">
      <span className={bold ? 'font-semibold text-foreground' : 'text-foreground'}>{value}</span>
      {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
    </div>
  </div>
);

interface ActionButtonProps {
  icon: any;
  label: string;
  onClick: () => void;
  loading: boolean;
  variant: 'blue' | 'red' | 'yellow';
}

const ActionButton: React.FC<ActionButtonProps> = ({ icon, label, onClick, loading, variant }) => {
  const variantClasses = {
    blue: 'bg-blue-600 hover:bg-blue-700 text-white',
    red: 'bg-red-600 hover:bg-red-700 text-white',
    yellow: 'bg-yellow-600 hover:bg-yellow-700 text-white',
  };

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 ${variantClasses[variant]}`}
    >
      <FontAwesomeIcon icon={loading ? faSpinner : icon} spin={loading} />
      {label}
    </button>
  );
};

export default EscrowManagementPage;
