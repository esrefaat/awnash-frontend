'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMoneyBillTransfer,
  faSpinner,
  faRefresh,
  faCheck,
  faTimes,
  faExternalLinkAlt,
  faClock,
  faCheckCircle,
  faTimesCircle,
  faHourglassHalf,
  faSearch,
  faFilter,
  faEye,
  faUniversity,
} from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/Button';
import { payoutsService, PayoutRequest, PayoutStatus, PayoutStats } from '@/services/payoutsService';

const PayoutsPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  // State
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [stats, setStats] = useState<PayoutStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<PayoutStatus | ''>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal state
  const [selectedPayout, setSelectedPayout] = useState<PayoutRequest | null>(null);
  const [actionModal, setActionModal] = useState<'approve' | 'reject' | 'complete' | 'view' | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [transactionRef, setTransactionRef] = useState('');

  // Fetch payouts
  const fetchPayouts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await payoutsService.getAllPayouts({
        page,
        limit,
        status: statusFilter || undefined,
        search: searchQuery || undefined,
      });
      setPayouts(response.data);
      setStats(response.stats);
      setTotalPages(response.pagination.totalPages);
    } catch (err: any) {
      setError(err.message || 'Failed to load payouts');
    } finally {
      setLoading(false);
    }
  }, [page, limit, statusFilter, searchQuery]);

  useEffect(() => {
    fetchPayouts();
  }, [fetchPayouts]);

  // Actions
  const handleApprove = async () => {
    if (!selectedPayout) return;
    setActionLoading(true);
    try {
      await payoutsService.approvePayout(selectedPayout.id);
      setActionModal(null);
      setSelectedPayout(null);
      fetchPayouts();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedPayout || !rejectReason) return;
    setActionLoading(true);
    try {
      await payoutsService.rejectPayout(selectedPayout.id, rejectReason);
      setActionModal(null);
      setSelectedPayout(null);
      setRejectReason('');
      fetchPayouts();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!selectedPayout) return;
    setActionLoading(true);
    try {
      await payoutsService.completePayout(selectedPayout.id, transactionRef || undefined);
      setActionModal(null);
      setSelectedPayout(null);
      setTransactionRef('');
      fetchPayouts();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusIcon = (status: PayoutStatus) => {
    switch (status) {
      case 'pending':
        return faClock;
      case 'approved':
        return faHourglassHalf;
      case 'processing':
        return faSpinner;
      case 'completed':
        return faCheckCircle;
      case 'rejected':
        return faTimesCircle;
      case 'cancelled':
        return faTimes;
      default:
        return faClock;
    }
  };

  const getStatusColor = (status: PayoutStatus) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'approved':
        return 'text-blue-600 bg-blue-50';
      case 'processing':
        return 'text-blue-600 bg-blue-50';
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'rejected':
        return 'text-red-600 bg-red-50';
      case 'cancelled':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6" style={{ fontFamily: isRTL ? 'var(--awnash-font-arabic)' : 'var(--awnash-font-english)' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--awnash-secondary)' }}>
            {isRTL ? 'إدارة الدفعات' : 'Payout Management'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isRTL ? 'مراجعة ومعالجة طلبات الدفع للملاك' : 'Review and process owner payout requests'}
          </p>
        </div>
        <Button variant="secondary" onClick={fetchPayouts} disabled={loading}>
          <FontAwesomeIcon icon={faRefresh} className={loading ? 'animate-spin' : ''} />
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-yellow-100">
                <FontAwesomeIcon icon={faClock} className="text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{isRTL ? 'معلق' : 'Pending'}</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-100">
                <FontAwesomeIcon icon={faHourglassHalf} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{isRTL ? 'مُعتمد' : 'Approved'}</p>
                <p className="text-2xl font-bold">{stats.approved}</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-green-100">
                <FontAwesomeIcon icon={faCheckCircle} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{isRTL ? 'مكتمل' : 'Completed'}</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-red-100">
                <FontAwesomeIcon icon={faTimesCircle} className="text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{isRTL ? 'مرفوض' : 'Rejected'}</p>
                <p className="text-2xl font-bold">{stats.rejected}</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--awnash-primary)' }}>
                <FontAwesomeIcon icon={faMoneyBillTransfer} className="text-black" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{isRTL ? 'المبلغ المعلق' : 'Pending Amount'}</p>
                <p className="text-xl font-bold">{payoutsService.formatCurrency(stats.totalPendingAmount)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isRTL ? 'بحث بالاسم أو البريد...' : 'Search by name or email...'}
                className="form-input pl-10 w-full"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faFilter} className="text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as PayoutStatus | '')}
              className="form-input"
            >
              <option value="">{isRTL ? 'جميع الحالات' : 'All Statuses'}</option>
              <option value="pending">{isRTL ? 'معلق' : 'Pending'}</option>
              <option value="approved">{isRTL ? 'مُعتمد' : 'Approved'}</option>
              <option value="processing">{isRTL ? 'قيد المعالجة' : 'Processing'}</option>
              <option value="completed">{isRTL ? 'مكتمل' : 'Completed'}</option>
              <option value="rejected">{isRTL ? 'مرفوض' : 'Rejected'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="card">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <FontAwesomeIcon icon={faSpinner} className="text-4xl animate-spin text-muted-foreground" />
            </div>
          ) : payouts.length === 0 ? (
            <div className="text-center py-12">
              <FontAwesomeIcon icon={faMoneyBillTransfer} className="text-4xl text-muted-foreground mb-4" />
              <p className="text-gray-500">{isRTL ? 'لا توجد طلبات دفع' : 'No payout requests found'}</p>
            </div>
          ) : (
            <table className="table w-full">
              <thead>
                <tr>
                  <th>{isRTL ? 'المالك' : 'Owner'}</th>
                  <th>{isRTL ? 'المبلغ' : 'Amount'}</th>
                  <th>{isRTL ? 'البنك' : 'Bank'}</th>
                  <th>{isRTL ? 'الحالة' : 'Status'}</th>
                  <th>{isRTL ? 'تاريخ الطلب' : 'Requested'}</th>
                  <th>{isRTL ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((payout) => (
                  <tr key={payout.id}>
                    <td>
                      <div>
                        <p className="font-medium">{payout.owner?.fullName || 'Unknown'}</p>
                        <p className="text-sm text-gray-500">{payout.owner?.email}</p>
                      </div>
                    </td>
                    <td>
                      <span className="font-bold text-lg" style={{ color: 'var(--awnash-primary)' }}>
                        {payoutsService.formatCurrency(payout.amount)}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faUniversity} className="text-muted-foreground" />
                        <div>
                          <p className="font-medium">{payout.bankAccount?.bankName || '-'}</p>
                          <p className="text-sm text-gray-500">{payout.bankAccount?.accountNumber || payout.bankAccount?.iban || ''}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm ${getStatusColor(payout.status)}`}>
                        <FontAwesomeIcon icon={getStatusIcon(payout.status)} className={payout.status === 'processing' ? 'animate-spin' : ''} />
                        {payoutsService.getStatusLabel(payout.status, isRTL)}
                      </span>
                    </td>
                    <td>
                      <p className="text-sm">{payoutsService.formatDate(payout.requestedAt)}</p>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setSelectedPayout(payout); setActionModal('view'); }}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                          title={isRTL ? 'عرض' : 'View'}
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                        {payout.status === 'pending' && (
                          <>
                            <button
                              onClick={() => { setSelectedPayout(payout); setActionModal('approve'); }}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                              title={isRTL ? 'اعتماد' : 'Approve'}
                            >
                              <FontAwesomeIcon icon={faCheck} />
                            </button>
                            <button
                              onClick={() => { setSelectedPayout(payout); setActionModal('reject'); }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              title={isRTL ? 'رفض' : 'Reject'}
                            >
                              <FontAwesomeIcon icon={faTimes} />
                            </button>
                          </>
                        )}
                        {(payout.status === 'approved' || payout.status === 'processing') && (
                          <button
                            onClick={() => { setSelectedPayout(payout); setActionModal('complete'); }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title={isRTL ? 'إتمام' : 'Complete'}
                          >
                            <FontAwesomeIcon icon={faExternalLinkAlt} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t">
            <Button
              variant="secondary"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              {isRTL ? 'السابق' : 'Previous'}
            </Button>
            <span className="text-sm text-gray-600">
              {isRTL ? `صفحة ${page} من ${totalPages}` : `Page ${page} of ${totalPages}`}
            </span>
            <Button
              variant="secondary"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              {isRTL ? 'التالي' : 'Next'}
            </Button>
          </div>
        )}
      </div>

      {/* Action Modals */}
      {actionModal && selectedPayout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            {actionModal === 'view' && (
              <>
                <h3 className="text-lg font-bold mb-4">{isRTL ? 'تفاصيل طلب الدفع' : 'Payout Details'}</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">{isRTL ? 'المالك:' : 'Owner:'}</span>
                    <span className="font-medium">{selectedPayout.owner?.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{isRTL ? 'المبلغ:' : 'Amount:'}</span>
                    <span className="font-bold">{payoutsService.formatCurrency(selectedPayout.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{isRTL ? 'البنك:' : 'Bank:'}</span>
                    <span>{selectedPayout.bankAccount?.bankName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{isRTL ? 'IBAN:' : 'IBAN:'}</span>
                    <span>{selectedPayout.bankAccount?.iban || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{isRTL ? 'الحالة:' : 'Status:'}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedPayout.status)}`}>
                      {payoutsService.getStatusLabel(selectedPayout.status, isRTL)}
                    </span>
                  </div>
                  {selectedPayout.transactionReference && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">{isRTL ? 'مرجع المعاملة:' : 'Transaction Ref:'}</span>
                      <span>{selectedPayout.transactionReference}</span>
                    </div>
                  )}
                  {selectedPayout.rejectionReason && (
                    <div className="mt-3 p-3 bg-red-50 rounded-lg">
                      <p className="text-sm text-red-700"><strong>{isRTL ? 'سبب الرفض:' : 'Rejection Reason:'}</strong></p>
                      <p className="text-red-600">{selectedPayout.rejectionReason}</p>
                    </div>
                  )}
                </div>
                <div className="mt-6 flex justify-end">
                  <Button variant="secondary" onClick={() => setActionModal(null)}>
                    {isRTL ? 'إغلاق' : 'Close'}
                  </Button>
                </div>
              </>
            )}

            {actionModal === 'approve' && (
              <>
                <h3 className="text-lg font-bold mb-4">{isRTL ? 'اعتماد طلب الدفع' : 'Approve Payout'}</h3>
                <p className="text-gray-600 mb-4">
                  {isRTL
                    ? `هل أنت متأكد من اعتماد دفعة ${payoutsService.formatCurrency(selectedPayout.amount)} لـ ${selectedPayout.owner?.fullName}؟`
                    : `Are you sure you want to approve ${payoutsService.formatCurrency(selectedPayout.amount)} payout for ${selectedPayout.owner?.fullName}?`}
                </p>
                <div className="flex justify-end gap-3">
                  <Button variant="secondary" onClick={() => setActionModal(null)} disabled={actionLoading}>
                    {isRTL ? 'إلغاء' : 'Cancel'}
                  </Button>
                  <Button variant="default" onClick={handleApprove} disabled={actionLoading}>
                    {actionLoading ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : (isRTL ? 'اعتماد' : 'Approve')}
                  </Button>
                </div>
              </>
            )}

            {actionModal === 'reject' && (
              <>
                <h3 className="text-lg font-bold mb-4">{isRTL ? 'رفض طلب الدفع' : 'Reject Payout'}</h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isRTL ? 'سبب الرفض *' : 'Rejection Reason *'}
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="form-input w-full"
                    rows={3}
                    placeholder={isRTL ? 'أدخل سبب الرفض...' : 'Enter rejection reason...'}
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="secondary" onClick={() => setActionModal(null)} disabled={actionLoading}>
                    {isRTL ? 'إلغاء' : 'Cancel'}
                  </Button>
                  <Button variant="accent" onClick={handleReject} disabled={actionLoading || !rejectReason}>
                    {actionLoading ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : (isRTL ? 'رفض' : 'Reject')}
                  </Button>
                </div>
              </>
            )}

            {actionModal === 'complete' && (
              <>
                <h3 className="text-lg font-bold mb-4">{isRTL ? 'إتمام الدفعة' : 'Complete Payout'}</h3>
                <p className="text-gray-600 mb-4">
                  {isRTL
                    ? 'أدخل مرجع المعاملة البنكية بعد إتمام التحويل.'
                    : 'Enter the bank transaction reference after completing the transfer.'}
                </p>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isRTL ? 'مرجع المعاملة' : 'Transaction Reference'}
                  </label>
                  <input
                    type="text"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    className="form-input w-full"
                    placeholder="TXN123456789"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="secondary" onClick={() => setActionModal(null)} disabled={actionLoading}>
                    {isRTL ? 'إلغاء' : 'Cancel'}
                  </Button>
                  <Button variant="default" onClick={handleComplete} disabled={actionLoading}>
                    {actionLoading ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : (isRTL ? 'إتمام' : 'Complete')}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PayoutsPage;
