'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCreditCard,
  faExclamationTriangle,
  faDownload,
  faSearch,
  faCheck,
  faTimes,
  faEye,
  faClock,
  faMoneyBillWave,
  faReceipt,
  faSpinner,
  faRefresh
} from '@fortawesome/free-solid-svg-icons';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  paymentsService, 
  Transaction, 
  TransactionStatus, 
  TransactionType,
  PaymentStats 
} from '@/services/paymentsService';

const PaymentManagement: React.FC = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  // State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TransactionType | ''>('');
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | ''>('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  // Fetch transactions
  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await paymentsService.getAllTransactions({
        page,
        limit,
        status: statusFilter || undefined,
        type: typeFilter || undefined,
        search: search || undefined,
      });
      setTransactions(response.transactions);
      setTotalPages(response.totalPages);
      setTotal(response.total);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, typeFilter, search]);

  // Fetch statistics
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await paymentsService.getPaymentStatistics();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchTransactions();
    fetchStats();
  }, [fetchTransactions, fetchStats]);

  // Handle approve transaction
  const handleApprove = async (transactionId: string) => {
    if (!confirm(isRTL ? 'هل تريد تأكيد هذه المعاملة؟' : 'Are you sure you want to approve this transaction?')) {
      return;
    }
    try {
      await paymentsService.approveTransaction(transactionId);
      fetchTransactions();
      fetchStats();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to approve transaction');
    }
  };

  // Handle reject transaction
  const handleReject = async (transactionId: string) => {
    const reason = prompt(isRTL ? 'سبب الرفض (اختياري):' : 'Rejection reason (optional):');
    if (reason === null) return; // User cancelled
    
    try {
      await paymentsService.rejectTransaction(transactionId, reason || undefined);
      fetchTransactions();
      fetchStats();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to reject transaction');
    }
  };

  // Export to CSV
  const handleExport = () => {
    if (transactions.length === 0) return;
    
    const csvData = transactions.map(tx => ({
      'Transaction ID': tx.id,
      'Type': tx.type,
      'Amount': tx.amount,
      'Currency': tx.currency,
      'Method': tx.method,
      'Status': tx.status,
      'User': tx.user?.fullName || 'N/A',
      'Date': tx.createdAt,
    }));
    
    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: TransactionStatus) => {
    const configs: Record<TransactionStatus, { className: string; label: string }> = {
      completed: {
        className: 'border-green-500 text-green-500 bg-green-500/10',
        label: isRTL ? 'مكتمل' : 'Completed'
      },
      pending: {
        className: 'border-yellow-500 text-yellow-500 bg-yellow-500/10',
        label: isRTL ? 'قيد الانتظار' : 'Pending'
      },
      failed: {
        className: 'border-red-500 text-red-500 bg-red-500/10',
        label: isRTL ? 'فشل' : 'Failed'
      },
      cancelled: {
        className: 'border-gray-500 text-gray-500 bg-gray-500/10',
        label: isRTL ? 'ملغي' : 'Cancelled'
      }
    };

    const config = configs[status];
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (amount: number, currency: string = 'SAR') => {
    return paymentsService.formatCurrency(amount, currency, isRTL ? 'ar-SA' : 'en-US');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={cn("min-h-screen bg-gray-900", isRTL ? 'font-arabic' : 'font-montserrat')} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600 rounded-2xl">
                <FontAwesomeIcon icon={faCreditCard} className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {isRTL ? 'إدارة المدفوعات' : 'Payment Management'}
                </h1>
                <p className="text-gray-400 mt-1">
                  {isRTL ? 'إدارة جميع المعاملات المالية والمدفوعات' : 'Manage all financial transactions and payments'}
                </p>
              </div>
            </div>
            <Button
              onClick={() => { fetchTransactions(); fetchStats(); }}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <FontAwesomeIcon icon={faRefresh} className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
              {isRTL ? 'تحديث' : 'Refresh'}
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600 rounded-xl">
                <FontAwesomeIcon icon={faReceipt} className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">{isRTL ? 'إجمالي المعاملات' : 'Total Transactions'}</p>
                <p className="text-2xl font-bold text-white">
                  {statsLoading ? '...' : stats?.total || 0}
                </p>
                <p className="text-sm text-blue-400">
                  {formatCurrency(stats?.totalAmount || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-600 rounded-xl">
                <FontAwesomeIcon icon={faMoneyBillWave} className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">{isRTL ? 'المكتملة' : 'Completed'}</p>
                <p className="text-2xl font-bold text-white">
                  {statsLoading ? '...' : stats?.completed || 0}
                </p>
                <p className="text-sm text-green-400">{isRTL ? 'معاملة' : 'transactions'}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-600 rounded-xl">
                <FontAwesomeIcon icon={faClock} className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">{isRTL ? 'قيد الانتظار' : 'Pending'}</p>
                <p className="text-2xl font-bold text-white">
                  {statsLoading ? '...' : stats?.pending || 0}
                </p>
                <p className="text-sm text-yellow-400">{isRTL ? 'معاملة' : 'transactions'}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-600 rounded-xl">
                <FontAwesomeIcon icon={faExclamationTriangle} className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">{isRTL ? 'الفاشلة' : 'Failed'}</p>
                <p className="text-2xl font-bold text-white">
                  {statsLoading ? '...' : stats?.failed || 0}
                </p>
                <p className="text-sm text-red-400">{isRTL ? 'معاملة' : 'transactions'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 shadow-lg mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <div className="relative">
                <FontAwesomeIcon 
                  icon={faSearch} 
                  className={cn('absolute top-3 h-4 w-4 text-gray-400', isRTL ? 'right-3' : 'left-3')} 
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder={isRTL ? 'البحث...' : 'Search...'}
                  className={cn(
                    'w-full bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                    isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4',
                    'py-2'
                  )}
                />
              </div>
            </div>

            <div>
              <select 
                value={typeFilter}
                onChange={(e) => { setTypeFilter(e.target.value as TransactionType | ''); setPage(1); }}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{isRTL ? 'جميع الأنواع' : 'All Types'}</option>
                <option value="payment">{isRTL ? 'دفع' : 'Payment'}</option>
                <option value="refund">{isRTL ? 'استرداد' : 'Refund'}</option>
                <option value="deposit">{isRTL ? 'ضمان' : 'Deposit'}</option>
                <option value="penalty">{isRTL ? 'غرامة' : 'Penalty'}</option>
              </select>
            </div>

            <div>
              <select 
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value as TransactionStatus | ''); setPage(1); }}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{isRTL ? 'جميع الحالات' : 'All Status'}</option>
                <option value="completed">{isRTL ? 'مكتمل' : 'Completed'}</option>
                <option value="pending">{isRTL ? 'قيد الانتظار' : 'Pending'}</option>
                <option value="failed">{isRTL ? 'فشل' : 'Failed'}</option>
                <option value="cancelled">{isRTL ? 'ملغي' : 'Cancelled'}</option>
              </select>
            </div>

            <div>
              <Button 
                onClick={handleExport}
                className="bg-awnash-primary hover:bg-awnash-primary-hover text-black w-full"
                disabled={transactions.length === 0}
              >
                <FontAwesomeIcon icon={faDownload} className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
                {isRTL ? 'تصدير' : 'Export'}
              </Button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-8">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Payments Table */}
        <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-lg overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <FontAwesomeIcon icon={faSpinner} className="h-8 w-8 text-blue-500 animate-spin" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className={cn('px-6 py-4 text-white font-semibold', isRTL ? 'text-right' : 'text-left')}>
                        {isRTL ? 'المعاملة' : 'Transaction'}
                      </th>
                      <th className={cn('px-6 py-4 text-white font-semibold', isRTL ? 'text-right' : 'text-left')}>
                        {isRTL ? 'النوع' : 'Type'}
                      </th>
                      <th className={cn('px-6 py-4 text-white font-semibold', isRTL ? 'text-right' : 'text-left')}>
                        {isRTL ? 'المبلغ' : 'Amount'}
                      </th>
                      <th className={cn('px-6 py-4 text-white font-semibold', isRTL ? 'text-right' : 'text-left')}>
                        {isRTL ? 'المستخدم' : 'User'}
                      </th>
                      <th className={cn('px-6 py-4 text-white font-semibold', isRTL ? 'text-right' : 'text-left')}>
                        {isRTL ? 'التاريخ' : 'Date'}
                      </th>
                      <th className={cn('px-6 py-4 text-white font-semibold', isRTL ? 'text-right' : 'text-left')}>
                        {isRTL ? 'الحالة' : 'Status'}
                      </th>
                      <th className={cn('px-6 py-4 text-white font-semibold', isRTL ? 'text-right' : 'text-left')}>
                        {isRTL ? 'الإجراءات' : 'Actions'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-white font-mono text-sm">
                              {transaction.id.substring(0, 8)}...
                            </p>
                            <p className="text-sm text-gray-400">
                              {paymentsService.getMethodLabel(transaction.method, isRTL)}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-white">
                            {paymentsService.getTypeLabel(transaction.type, isRTL)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-white font-semibold">
                            {formatCurrency(transaction.amount, transaction.currency)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <p className="text-white">{transaction.user?.fullName || 'N/A'}</p>
                            <p className="text-gray-400">{transaction.user?.email || ''}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-white">{formatDate(transaction.createdAt)}</span>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(transaction.status)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              className="p-2 text-blue-400 hover:text-blue-300 hover:bg-gray-600 rounded transition-colors"
                              title={isRTL ? 'عرض التفاصيل' : 'View Details'}
                            >
                              <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
                            </button>
                            
                            {transaction.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApprove(transaction.id)}
                                  className="p-2 text-green-400 hover:text-green-300 hover:bg-gray-600 rounded transition-colors"
                                  title={isRTL ? 'تأكيد' : 'Approve'}
                                >
                                  <FontAwesomeIcon icon={faCheck} className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleReject(transaction.id)}
                                  className="p-2 text-red-400 hover:text-red-300 hover:bg-gray-600 rounded transition-colors"
                                  title={isRTL ? 'رفض' : 'Reject'}
                                >
                                  <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {transactions.length === 0 && !loading && (
                <div className="text-center py-12">
                  <FontAwesomeIcon icon={faCreditCard} className="h-16 w-16 text-gray-600 mb-4" />
                  <h3 className="text-lg font-medium text-gray-400 mb-2">
                    {isRTL ? 'لا توجد معاملات' : 'No transactions found'}
                  </h3>
                  <p className="text-gray-500">
                    {isRTL ? 'لا توجد معاملات تطابق المعايير المحددة' : 'No transactions match the current filters'}
                  </p>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-700">
                  <p className="text-sm text-gray-400">
                    {isRTL 
                      ? `عرض ${((page - 1) * limit) + 1}-${Math.min(page * limit, total)} من ${total}`
                      : `Showing ${((page - 1) * limit) + 1}-${Math.min(page * limit, total)} of ${total}`
                    }
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="border-gray-600 text-gray-300"
                    >
                      {isRTL ? 'السابق' : 'Previous'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="border-gray-600 text-gray-300"
                    >
                      {isRTL ? 'التالي' : 'Next'}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentManagement;
