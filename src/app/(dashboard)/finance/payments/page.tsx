'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCreditCard,
  faDollarSign,
  faExclamationTriangle,
  faDownload,
  faFilter,
  faSearch,
  faCheck,
  faTimes,
  faEye,
  faClock,
  faMoneyBillWave,
  faExchangeAlt,
  faReceipt
} from '@fortawesome/free-solid-svg-icons';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

const PaymentManagement: React.FC = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  // Mock payment data
  const payments = [
    {
      id: 'PAY-001',
      type: 'rental_payment',
      amount: 15500,
      status: 'completed',
      date: '2024-06-20',
      from: 'Ahmed Al-Mansouri',
      to: 'Fatima Al-Zahra',
      equipment: 'CAT 320D Excavator',
      paymentMethod: 'card'
    },
    {
      id: 'PAY-002',
      type: 'payout',
      amount: 12400,
      status: 'pending',
      date: '2024-06-19',
      from: 'Platform',
      to: 'Omar Al-Sabah',
      equipment: 'Liebherr Crane',
      paymentMethod: 'bank_transfer'
    },
    {
      id: 'PAY-003',
      type: 'commission',
      amount: 1550,
      status: 'completed',
      date: '2024-06-18',
      from: 'Transaction Fee',
      to: 'Platform',
      equipment: 'JCB Backhoe',
      paymentMethod: 'automatic'
    }
  ];

  const getStatusBadge = (status: string) => {
    const configs = {
      completed: {
        variant: 'outline' as const,
        className: 'border-green-500 text-green-500 bg-green-500/10',
        label: isRTL ? 'مكتمل' : 'Completed'
      },
      pending: {
        variant: 'outline' as const,
        className: 'border-yellow-500 text-yellow-500 bg-yellow-500/10',
        label: isRTL ? 'قيد المعالجة' : 'Pending'
      },
      failed: {
        variant: 'outline' as const,
        className: 'border-red-500 text-red-500 bg-red-500/10',
        label: isRTL ? 'فشل' : 'Failed'
      }
    };

    const config = configs[status as keyof typeof configs];
    if (!config) return null;

    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getPaymentTypeLabel = (type: string) => {
    const labels = {
      rental_payment: isRTL ? 'دفع إيجار' : 'Rental Payment',
      payout: isRTL ? 'دفع للمالك' : 'Owner Payout',
      commission: isRTL ? 'عمولة المنصة' : 'Platform Commission',
      refund: isRTL ? 'استرداد' : 'Refund'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(isRTL ? 'ar-AE' : 'en-US', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(isRTL ? 'ar-AE' : 'en-US', {
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
          <div className="flex items-center gap-4 mb-6">
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
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-600 rounded-xl">
                <FontAwesomeIcon icon={faMoneyBillWave} className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">{isRTL ? 'المدفوعات اليوم' : 'Today\'s Payments'}</p>
                <p className="text-2xl font-bold text-white">$45,320</p>
                <p className="text-sm text-green-400">15 {isRTL ? 'معاملة' : 'transactions'}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-600 rounded-xl">
                <FontAwesomeIcon icon={faClock} className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">{isRTL ? 'المدفوعات المعلقة' : 'Pending Payments'}</p>
                <p className="text-2xl font-bold text-white">$12,850</p>
                <p className="text-sm text-yellow-400">8 {isRTL ? 'معاملة' : 'transactions'}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-600 rounded-xl">
                <FontAwesomeIcon icon={faExclamationTriangle} className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">{isRTL ? 'المدفوعات الفاشلة' : 'Failed Payments'}</p>
                <p className="text-2xl font-bold text-white">$2,150</p>
                <p className="text-sm text-red-400">3 {isRTL ? 'معاملة' : 'transactions'}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600 rounded-xl">
                <FontAwesomeIcon icon={faReceipt} className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">{isRTL ? 'إجمالي الشهر' : 'Monthly Total'}</p>
                <p className="text-2xl font-bold text-white">$125,430</p>
                <p className="text-sm text-blue-400">245 {isRTL ? 'معاملة' : 'transactions'}</p>
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
                  placeholder={isRTL ? 'البحث في المدفوعات...' : 'Search payments...'}
                  className={cn(
                    'w-full bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                    isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4',
                    'py-2'
                  )}
                />
              </div>
            </div>

            <div>
              <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500">
                <option value="">{isRTL ? 'جميع الأنواع' : 'All Types'}</option>
                <option value="rental_payment">{isRTL ? 'دفع إيجار' : 'Rental Payment'}</option>
                <option value="payout">{isRTL ? 'دفع للمالك' : 'Owner Payout'}</option>
                <option value="commission">{isRTL ? 'عمولة' : 'Commission'}</option>
              </select>
            </div>

            <div>
              <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500">
                <option value="">{isRTL ? 'جميع الحالات' : 'All Status'}</option>
                <option value="completed">{isRTL ? 'مكتمل' : 'Completed'}</option>
                <option value="pending">{isRTL ? 'قيد المعالجة' : 'Pending'}</option>
                <option value="failed">{isRTL ? 'فشل' : 'Failed'}</option>
              </select>
            </div>

            <div>
              <Button className="bg-awnash-primary hover:bg-awnash-primary-hover text-black w-full">
                <FontAwesomeIcon icon={faDownload} className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
                {isRTL ? 'تصدير' : 'Export'}
              </Button>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-lg overflow-hidden">
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
                    {isRTL ? 'من / إلى' : 'From / To'}
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
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-white">{payment.id}</p>
                        <p className="text-sm text-gray-400">{payment.equipment}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white">{getPaymentTypeLabel(payment.type)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white font-semibold">{formatCurrency(payment.amount)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-white">From: {payment.from}</p>
                        <p className="text-gray-400">To: {payment.to}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white">{formatDate(payment.date)}</span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          className="p-2 text-blue-400 hover:text-blue-300 hover:bg-gray-600 rounded transition-colors"
                          title={isRTL ? 'عرض التفاصيل' : 'View Details'}
                        >
                          <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
                        </button>
                        
                        {payment.status === 'pending' && (
                          <>
                            <button
                              className="p-2 text-green-400 hover:text-green-300 hover:bg-gray-600 rounded transition-colors"
                              title={isRTL ? 'تأكيد' : 'Approve'}
                            >
                              <FontAwesomeIcon icon={faCheck} className="h-4 w-4" />
                            </button>
                            <button
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

          {payments.length === 0 && (
            <div className="text-center py-12">
              <FontAwesomeIcon icon={faCreditCard} className="h-16 w-16 text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">
                {isRTL ? 'لا توجد مدفوعات' : 'No payments found'}
              </h3>
              <p className="text-gray-500">
                {isRTL ? 'لا توجد مدفوعات تطابق المعايير المحددة' : 'No payments match the current filters'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentManagement; 