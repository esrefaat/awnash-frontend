'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFileInvoice,
  faDownload,
  faSearch,
  faEye,
  faPaperPlane,
  faBan,
  faCheckCircle,
  faSpinner,
  faRefresh,
  faFilePdf,
  faClock,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  invoicesService, 
  Invoice, 
  InvoiceStatus 
} from '@/services/invoicesService';

const InvoicesPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  // State
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<{
    total: number;
    draft: number;
    sent: number;
    paid: number;
    overdue: number;
    cancelled: number;
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | ''>('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  // Fetch invoices
  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await invoicesService.getAllInvoices({
        page,
        limit,
        status: statusFilter || undefined,
        search: search || undefined,
      });
      setInvoices(response.invoices);
      setTotalPages(response.totalPages);
      setTotal(response.total);
    } catch (err) {
      console.error('Failed to fetch invoices:', err);
      setError(err instanceof Error ? err.message : 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  // Fetch statistics
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await invoicesService.getInvoiceStatistics();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchInvoices();
    fetchStats();
  }, [fetchInvoices, fetchStats]);

  // Handle download PDF
  const handleDownloadPdf = async (invoiceId: string, invoiceNumber: string) => {
    try {
      await invoicesService.saveInvoicePdf(invoiceId, `invoice-${invoiceNumber}.pdf`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to download PDF');
    }
  };

  // Handle send invoice
  const handleSendInvoice = async (invoiceId: string) => {
    if (!confirm(isRTL ? 'هل تريد إرسال هذه الفاتورة؟' : 'Are you sure you want to send this invoice?')) {
      return;
    }
    try {
      await invoicesService.sendInvoice(invoiceId);
      fetchInvoices();
      fetchStats();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to send invoice');
    }
  };

  // Handle void invoice
  const handleVoidInvoice = async (invoiceId: string) => {
    const reason = prompt(isRTL ? 'سبب الإلغاء (اختياري):' : 'Cancellation reason (optional):');
    if (reason === null) return; // User cancelled
    
    try {
      await invoicesService.voidInvoice(invoiceId, reason || undefined);
      fetchInvoices();
      fetchStats();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to void invoice');
    }
  };

  // Handle mark as paid
  const handleMarkPaid = async (invoiceId: string) => {
    if (!confirm(isRTL ? 'هل تريد تحديد هذه الفاتورة كمدفوعة؟' : 'Are you sure you want to mark this invoice as paid?')) {
      return;
    }
    try {
      await invoicesService.markAsPaid(invoiceId);
      fetchInvoices();
      fetchStats();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to mark invoice as paid');
    }
  };

  // Export to CSV
  const handleExport = () => {
    if (invoices.length === 0) return;
    
    const csvData = invoices.map(inv => ({
      'Invoice Number': inv.invoiceNumber,
      'Amount': inv.amount,
      'Tax': inv.taxAmount,
      'Total': inv.totalAmount,
      'Currency': inv.currency,
      'Status': inv.status,
      'Issued': inv.issuedAt,
      'Due': inv.dueDate,
      'Paid': inv.paidAt || '',
    }));
    
    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoices-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: InvoiceStatus) => {
    const configs: Record<InvoiceStatus, { className: string; label: string }> = {
      paid: {
        className: 'border-green-500 text-green-500 bg-green-500/10',
        label: isRTL ? 'مدفوع' : 'Paid'
      },
      sent: {
        className: 'border-blue-500 text-blue-500 bg-blue-500/10',
        label: isRTL ? 'مُرسل' : 'Sent'
      },
      draft: {
        className: 'border-gray-500 text-gray-500 bg-gray-500/10',
        label: isRTL ? 'مسودة' : 'Draft'
      },
      overdue: {
        className: 'border-red-500 text-red-500 bg-red-500/10',
        label: isRTL ? 'متأخر' : 'Overdue'
      },
      cancelled: {
        className: 'border-gray-600 text-gray-600 bg-gray-600/10',
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
    return invoicesService.formatCurrency(amount, currency, isRTL ? 'ar-SA' : 'en-US');
  };

  const formatDate = (dateString: string) => {
    return invoicesService.formatDate(dateString, isRTL ? 'ar-SA' : 'en-US');
  };

  return (
    <div className={cn("min-h-screen bg-gray-900", isRTL ? 'font-arabic' : 'font-montserrat')} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-600 rounded-2xl">
                <FontAwesomeIcon icon={faFileInvoice} className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {isRTL ? 'الفواتير' : 'Invoices'}
                </h1>
                <p className="text-gray-400 mt-1">
                  {isRTL ? 'إدارة جميع الفواتير والمستحقات' : 'Manage all invoices and receivables'}
                </p>
              </div>
            </div>
            <Button
              onClick={() => { fetchInvoices(); fetchStats(); }}
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
              <div className="p-3 bg-purple-600 rounded-xl">
                <FontAwesomeIcon icon={faFileInvoice} className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">{isRTL ? 'إجمالي الفواتير' : 'Total Invoices'}</p>
                <p className="text-2xl font-bold text-white">
                  {statsLoading ? '...' : stats?.total || 0}
                </p>
                <p className="text-sm text-purple-400">
                  {formatCurrency(stats?.totalAmount || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-600 rounded-xl">
                <FontAwesomeIcon icon={faCheckCircle} className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">{isRTL ? 'المدفوعة' : 'Paid'}</p>
                <p className="text-2xl font-bold text-white">
                  {statsLoading ? '...' : stats?.paid || 0}
                </p>
                <p className="text-sm text-green-400">
                  {formatCurrency(stats?.paidAmount || 0)}
                </p>
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
                  {statsLoading ? '...' : (stats?.draft || 0) + (stats?.sent || 0)}
                </p>
                <p className="text-sm text-yellow-400">
                  {formatCurrency(stats?.pendingAmount || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-600 rounded-xl">
                <FontAwesomeIcon icon={faExclamationTriangle} className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">{isRTL ? 'متأخرة' : 'Overdue'}</p>
                <p className="text-2xl font-bold text-white">
                  {statsLoading ? '...' : stats?.overdue || 0}
                </p>
                <p className="text-sm text-red-400">{isRTL ? 'فاتورة' : 'invoices'}</p>
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
                  placeholder={isRTL ? 'البحث برقم الفاتورة...' : 'Search by invoice number...'}
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
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value as InvoiceStatus | ''); setPage(1); }}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{isRTL ? 'جميع الحالات' : 'All Status'}</option>
                <option value="draft">{isRTL ? 'مسودة' : 'Draft'}</option>
                <option value="sent">{isRTL ? 'مُرسل' : 'Sent'}</option>
                <option value="paid">{isRTL ? 'مدفوع' : 'Paid'}</option>
                <option value="overdue">{isRTL ? 'متأخر' : 'Overdue'}</option>
                <option value="cancelled">{isRTL ? 'ملغي' : 'Cancelled'}</option>
              </select>
            </div>

            <div></div>

            <div>
              <Button 
                onClick={handleExport}
                className="bg-awnash-primary hover:bg-awnash-primary-hover text-black w-full"
                disabled={invoices.length === 0}
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

        {/* Invoices Table */}
        <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-lg overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <FontAwesomeIcon icon={faSpinner} className="h-8 w-8 text-purple-500 animate-spin" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className={cn('px-6 py-4 text-white font-semibold', isRTL ? 'text-right' : 'text-left')}>
                        {isRTL ? 'رقم الفاتورة' : 'Invoice #'}
                      </th>
                      <th className={cn('px-6 py-4 text-white font-semibold', isRTL ? 'text-right' : 'text-left')}>
                        {isRTL ? 'المبلغ' : 'Amount'}
                      </th>
                      <th className={cn('px-6 py-4 text-white font-semibold', isRTL ? 'text-right' : 'text-left')}>
                        {isRTL ? 'الإجمالي' : 'Total'}
                      </th>
                      <th className={cn('px-6 py-4 text-white font-semibold', isRTL ? 'text-right' : 'text-left')}>
                        {isRTL ? 'تاريخ الإصدار' : 'Issued'}
                      </th>
                      <th className={cn('px-6 py-4 text-white font-semibold', isRTL ? 'text-right' : 'text-left')}>
                        {isRTL ? 'تاريخ الاستحقاق' : 'Due Date'}
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
                    {invoices.map((invoice) => {
                      const daysUntilDue = invoicesService.getDaysUntilDue(invoice);
                      const isOverdue = invoicesService.isOverdue(invoice);
                      
                      return (
                        <tr key={invoice.id} className="hover:bg-gray-700 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-medium text-white">{invoice.invoiceNumber}</p>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-white">{formatCurrency(invoice.amount, invoice.currency)}</p>
                              {invoice.taxAmount > 0 && (
                                <p className="text-sm text-gray-400">
                                  + {formatCurrency(invoice.taxAmount, invoice.currency)} {isRTL ? 'ضريبة' : 'tax'}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-white font-semibold">
                              {formatCurrency(invoice.totalAmount, invoice.currency)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-white">{formatDate(invoice.issuedAt)}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <span className={cn('text-white', isOverdue && 'text-red-400')}>
                                {formatDate(invoice.dueDate)}
                              </span>
                              {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                                <p className={cn('text-sm', daysUntilDue < 0 ? 'text-red-400' : 'text-gray-400')}>
                                  {daysUntilDue < 0 
                                    ? (isRTL ? `متأخر ${Math.abs(daysUntilDue)} يوم` : `${Math.abs(daysUntilDue)} days overdue`)
                                    : (isRTL ? `${daysUntilDue} يوم متبقي` : `${daysUntilDue} days left`)
                                  }
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {getStatusBadge(invoice.status)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                className="p-2 text-blue-400 hover:text-blue-300 hover:bg-gray-600 rounded transition-colors"
                                title={isRTL ? 'عرض التفاصيل' : 'View Details'}
                              >
                                <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
                              </button>
                              
                              <button
                                onClick={() => handleDownloadPdf(invoice.id, invoice.invoiceNumber)}
                                className="p-2 text-purple-400 hover:text-purple-300 hover:bg-gray-600 rounded transition-colors"
                                title={isRTL ? 'تحميل PDF' : 'Download PDF'}
                              >
                                <FontAwesomeIcon icon={faFilePdf} className="h-4 w-4" />
                              </button>
                              
                              {invoice.status === 'draft' && (
                                <button
                                  onClick={() => handleSendInvoice(invoice.id)}
                                  className="p-2 text-green-400 hover:text-green-300 hover:bg-gray-600 rounded transition-colors"
                                  title={isRTL ? 'إرسال' : 'Send'}
                                >
                                  <FontAwesomeIcon icon={faPaperPlane} className="h-4 w-4" />
                                </button>
                              )}
                              
                              {(invoice.status === 'sent' || invoice.status === 'overdue') && (
                                <button
                                  onClick={() => handleMarkPaid(invoice.id)}
                                  className="p-2 text-green-400 hover:text-green-300 hover:bg-gray-600 rounded transition-colors"
                                  title={isRTL ? 'تحديد كمدفوع' : 'Mark as Paid'}
                                >
                                  <FontAwesomeIcon icon={faCheckCircle} className="h-4 w-4" />
                                </button>
                              )}
                              
                              {(invoice.status === 'draft' || invoice.status === 'sent') && (
                                <button
                                  onClick={() => handleVoidInvoice(invoice.id)}
                                  className="p-2 text-red-400 hover:text-red-300 hover:bg-gray-600 rounded transition-colors"
                                  title={isRTL ? 'إلغاء' : 'Void'}
                                >
                                  <FontAwesomeIcon icon={faBan} className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {invoices.length === 0 && !loading && (
                <div className="text-center py-12">
                  <FontAwesomeIcon icon={faFileInvoice} className="h-16 w-16 text-gray-600 mb-4" />
                  <h3 className="text-lg font-medium text-gray-400 mb-2">
                    {isRTL ? 'لا توجد فواتير' : 'No invoices found'}
                  </h3>
                  <p className="text-gray-500">
                    {isRTL ? 'لا توجد فواتير تطابق المعايير المحددة' : 'No invoices match the current filters'}
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

export default InvoicesPage;
