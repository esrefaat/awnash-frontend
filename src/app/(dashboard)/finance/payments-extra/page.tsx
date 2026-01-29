'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCreditCard,
  faMoneyBillWave,
  faChartLine,
  faUsers,
  faBuilding,
  faCalendar,
  faSearch,
  faFilter,
  faDownload,
  faEye,
  faDollarSign
} from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/Button';

interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  commission: number;
  ownerPayout: number;
  status: 'pending' | 'completed' | 'failed';
  paymentMethod: string;
  date: string;
  requesterName: string;
  requesterId: string;
  ownerName: string;
  ownerId: string;
  equipmentType: string;
}

const Payments: React.FC = () => {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock payment data
  const payments: Payment[] = [
    {
      id: 'PAY-001',
      bookingId: 'BK-2024-001',
      amount: 5000,
      commission: 750,
      ownerPayout: 4250,
      status: 'completed',
      paymentMethod: 'Credit Card',
      date: '2024-06-07',
      requesterName: 'مؤسسة البناء المتطور',
      requesterId: 'r1',
      ownerName: 'أحمد المعدات الثقيلة',
      ownerId: 'o1',
      equipmentType: 'Excavator CAT 320'
    },
    {
      id: 'PAY-002',
      bookingId: 'BK-2024-002',
      amount: 3200,
      commission: 480,
      ownerPayout: 2720,
      status: 'pending',
      paymentMethod: 'Bank Transfer',
      date: '2024-06-06',
      requesterName: 'شركة الخليج للإنشاءات',
      requesterId: 'r2',
      ownerName: 'محمد الرافعات',
      ownerId: 'o2',
      equipmentType: 'Mobile Crane'
    },
    {
      id: 'PAY-003',
      bookingId: 'BK-2024-003',
      amount: 7500,
      commission: 1125,
      ownerPayout: 6375,
      status: 'completed',
      paymentMethod: 'Digital Wallet',
      date: '2024-06-05',
      requesterName: 'الشركة السعودية للمقاولات',
      requesterId: 'r3',
      ownerName: 'عبدالله للمعدات',
      ownerId: 'o3',
      equipmentType: 'Bulldozer D8T'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return isRTL ? 'مكتمل' : 'Completed';
      case 'pending':
        return isRTL ? 'معلق' : 'Pending';
      case 'failed':
        return isRTL ? 'فشل' : 'Failed';
      default:
        return status;
    }
  };

  const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalCommission = payments.reduce((sum, payment) => sum + payment.commission, 0);
  const completedPayments = payments.filter(p => p.status === 'completed').length;
  const pendingPayments = payments.filter(p => p.status === 'pending').length;

  return (
    <div className="space-y-6" style={{ fontFamily: isRTL ? 'var(--awnash-font-arabic)' : 'var(--awnash-font-english)' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--awnash-secondary)' }}>
            {isRTL ? 'إدارة المدفوعات' : 'Payment Management'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isRTL ? 'تتبع وإدارة جميع المدفوعات والعمولات' : 'Track and manage all payments and commissions'}
          </p>
        </div>
        <Button variant="default">
          <FontAwesomeIcon icon={faDownload} className="mr-2" />
          <span>{isRTL ? 'تصدير التقرير' : 'Export Report'}</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {isRTL ? 'إجمالي الإيرادات' : 'Total Revenue'}
                </p>
                <p className="text-2xl font-bold" style={{ color: 'var(--awnash-secondary)' }}>
                  ${totalRevenue.toLocaleString()}
                </p>
              </div>
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--awnash-primary)' }}
              >
                <FontAwesomeIcon icon={faDollarSign} className="text-black text-xl" />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {isRTL ? 'إجمالي العمولات' : 'Total Commission'}
                </p>
                <p className="text-2xl font-bold" style={{ color: 'var(--awnash-secondary)' }}>
                  ${totalCommission.toLocaleString()}
                </p>
              </div>
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--awnash-accent)' }}
              >
                <FontAwesomeIcon icon={faChartLine} className="text-white text-xl" />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {isRTL ? 'المدفوعات المكتملة' : 'Completed Payments'}
                </p>
                <p className="text-2xl font-bold" style={{ color: 'var(--awnash-secondary)' }}>
                  {completedPayments}
                </p>
              </div>
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--awnash-success)' }}
              >
                <FontAwesomeIcon icon={faMoneyBillWave} className="text-white text-xl" />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {isRTL ? 'المدفوعات المعلقة' : 'Pending Payments'}
                </p>
                <p className="text-2xl font-bold" style={{ color: 'var(--awnash-secondary)' }}>
                  {pendingPayments}
                </p>
              </div>
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--awnash-warning)' }}
              >
                <FontAwesomeIcon icon={faCreditCard} className="text-white text-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="card-body">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative">
                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={isRTL ? 'البحث في المدفوعات...' : 'Search payments...'}
                  className="form-input pl-10 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="form-input"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">{isRTL ? 'جميع الحالات' : 'All Status'}</option>
                <option value="completed">{isRTL ? 'مكتمل' : 'Completed'}</option>
                <option value="pending">{isRTL ? 'معلق' : 'Pending'}</option>
                <option value="failed">{isRTL ? 'فشل' : 'Failed'}</option>
              </select>
            </div>
            <Button variant="accent">
              <FontAwesomeIcon icon={faFilter} className="mr-2" />
              <span>{isRTL ? 'تصفية متقدمة' : 'Advanced Filter'}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--awnash-secondary)' }}>
            {isRTL ? 'قائمة المدفوعات' : 'Payments List'}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>{isRTL ? 'رقم الدفع' : 'Payment ID'}</th>
                <th>{isRTL ? 'رقم الحجز' : 'Booking ID'}</th>
                <th>{isRTL ? 'الطالب' : 'Requester'}</th>
                <th>{isRTL ? 'المالك' : 'Owner'}</th>
                <th>{isRTL ? 'نوع المعدة' : 'Equipment'}</th>
                <th>{isRTL ? 'المبلغ' : 'Amount'}</th>
                <th>{isRTL ? 'العمولة' : 'Commission'}</th>
                <th>{isRTL ? 'الحالة' : 'Status'}</th>
                <th>{isRTL ? 'التاريخ' : 'Date'}</th>
                <th>{isRTL ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="font-medium text-blue-600">{payment.id}</td>
                  <td>{payment.bookingId}</td>
                  <td>
                    <span 
                      className="text-blue-600 hover:text-blue-900 cursor-pointer"
                      onClick={() => router.push(`/renters/${payment.requesterId}`)}
                      title="View Renter Profile"
                    >
                      {payment.requesterName}
                    </span>
                  </td>
                  <td>
                    <span 
                      className="text-blue-600 hover:text-blue-900 cursor-pointer"
                      onClick={() => router.push(`/owners/${payment.ownerId}`)}
                      title="View Owner Profile"
                    >
                      {payment.ownerName}
                    </span>
                  </td>
                  <td>{payment.equipmentType}</td>
                  <td className="font-medium">${payment.amount.toLocaleString()}</td>
                  <td className="font-medium text-green-600">${payment.commission}</td>
                  <td>
                    <span className={`badge ${getStatusColor(payment.status)}`}>
                      {getStatusText(payment.status)}
                    </span>
                  </td>
                  <td>{payment.date}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button 
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title={isRTL ? 'عرض التفاصيل' : 'View Details'}
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                      <button 
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title={isRTL ? 'تحميل الفاتورة' : 'Download Invoice'}
                      >
                        <FontAwesomeIcon icon={faDownload} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Payments; 