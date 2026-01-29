'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClipboardList,
  faUser,
  faTruck,
  faMapMarkerAlt,
  faCalendar,
  faClock,
  faFileAlt,
  faEye,
  faEdit,
  faCheck,
  faTimes,
  faSearch,
  faFilter,
  faPlus
} from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/Button';

interface EquipmentRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  equipmentType: string;
  withDriver: boolean;
  size: string;
  location: string;
  startDate: string;
  endDate: string;
  duration: string;
  durationType: 'hours' | 'days' | 'months';
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  hasPermit: boolean;
  permitDocument?: string;
  createdAt: string;
  offers: number;
}

const EquipmentRequests: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [equipmentFilter, setEquipmentFilter] = useState('all');

  // Mock requests data
  const requests: EquipmentRequest[] = [
    {
      id: 'REQ-001',
      requesterId: 'renter-123',
      requesterName: 'مؤسسة البناء المتطور',
      equipmentType: 'Excavator',
      withDriver: true,
      size: 'Large',
      location: 'الرياض - العليا',
      startDate: '2024-06-10',
      endDate: '2024-06-20',
      duration: '10',
      durationType: 'days',
      description: 'نحتاج حفارة كبيرة لمشروع بناء مجمع تجاري',
      status: 'pending',
      hasPermit: true,
      permitDocument: 'permit-001.pdf',
      createdAt: '2024-06-07',
      offers: 3
    },
    {
      id: 'REQ-002',
      requesterId: 'renter-456',
      requesterName: 'شركة الخليج للإنشاءات',
      equipmentType: 'Mobile Crane',
      withDriver: true,
      size: 'Medium',
      location: 'جدة - الحمراء',
      startDate: '2024-06-15',
      endDate: '2024-06-25',
      duration: '80',
      durationType: 'hours',
      description: 'رافعة متحركة لرفع مواد البناء في مشروع سكني',
      status: 'approved',
      hasPermit: true,
      permitDocument: 'permit-002.pdf',
      createdAt: '2024-06-06',
      offers: 5
    },
    {
      id: 'REQ-003',
      requesterId: 'renter-789',
      requesterName: 'الشركة السعودية للمقاولات',
      equipmentType: 'Bulldozer',
      withDriver: false,
      size: 'Large',
      location: 'الدمام - الخبر',
      startDate: '2024-07-01',
      endDate: '2024-09-30',
      duration: '3',
      durationType: 'months',
      description: 'جرافة لتسوية الأرض في مشروع طريق جديد',
      status: 'completed',
      hasPermit: true,
      permitDocument: 'permit-003.pdf',
      createdAt: '2024-06-05',
      offers: 2
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return isRTL ? 'في الانتظار' : 'Pending';
      case 'approved':
        return isRTL ? 'موافق عليه' : 'Approved';
      case 'rejected':
        return isRTL ? 'مرفوض' : 'Rejected';
      case 'completed':
        return isRTL ? 'مكتمل' : 'Completed';
      default:
        return status;
    }
  };

  const getDurationText = (duration: string, type: string) => {
    const typeText = {
      hours: isRTL ? 'ساعة' : 'hours',
      days: isRTL ? 'يوم' : 'days',
      months: isRTL ? 'شهر' : 'months'
    };
    return `${duration} ${typeText[type as keyof typeof typeText]}`;
  };

  const pendingRequests = requests.filter(r => r.status === 'pending').length;
  const approvedRequests = requests.filter(r => r.status === 'approved').length;
  const totalOffers = requests.reduce((sum, req) => sum + req.offers, 0);

  return (
    <div className="space-y-6" style={{ fontFamily: isRTL ? 'var(--awnash-font-arabic)' : 'var(--awnash-font-english)' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--awnash-secondary)' }}>
            {isRTL ? 'طلبات المعدات' : 'Equipment Requests'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isRTL ? 'إدارة ومتابعة طلبات استئجار المعدات' : 'Manage and track equipment rental requests'}
          </p>
        </div>
        <Button variant="default">
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          <span>{isRTL ? 'إضافة طلب' : 'Add Request'}</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {isRTL ? 'إجمالي الطلبات' : 'Total Requests'}
                </p>
                <p className="text-2xl font-bold" style={{ color: 'var(--awnash-secondary)' }}>
                  {requests.length}
                </p>
              </div>
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--awnash-primary)' }}
              >
                <FontAwesomeIcon icon={faClipboardList} className="text-black text-xl" />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {isRTL ? 'طلبات في الانتظار' : 'Pending Requests'}
                </p>
                <p className="text-2xl font-bold" style={{ color: 'var(--awnash-secondary)' }}>
                  {pendingRequests}
                </p>
              </div>
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--awnash-warning)' }}
              >
                <FontAwesomeIcon icon={faClock} className="text-white text-xl" />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {isRTL ? 'طلبات موافق عليها' : 'Approved Requests'}
                </p>
                <p className="text-2xl font-bold" style={{ color: 'var(--awnash-secondary)' }}>
                  {approvedRequests}
                </p>
              </div>
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--awnash-success)' }}
              >
                <FontAwesomeIcon icon={faCheck} className="text-white text-xl" />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {isRTL ? 'إجمالي العروض' : 'Total Offers'}
                </p>
                <p className="text-2xl font-bold" style={{ color: 'var(--awnash-secondary)' }}>
                  {totalOffers}
                </p>
              </div>
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--awnash-accent)' }}
              >
                <FontAwesomeIcon icon={faTruck} className="text-white text-xl" />
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
                  placeholder={isRTL ? 'البحث في الطلبات...' : 'Search requests...'}
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
                <option value="pending">{isRTL ? 'في الانتظار' : 'Pending'}</option>
                <option value="approved">{isRTL ? 'موافق عليه' : 'Approved'}</option>
                <option value="rejected">{isRTL ? 'مرفوض' : 'Rejected'}</option>
                <option value="completed">{isRTL ? 'مكتمل' : 'Completed'}</option>
              </select>
              <select
                className="form-input"
                value={equipmentFilter}
                onChange={(e) => setEquipmentFilter(e.target.value)}
              >
                <option value="all">{isRTL ? 'جميع المعدات' : 'All Equipment'}</option>
                <option value="Excavator">{isRTL ? 'حفارات' : 'Excavators'}</option>
                <option value="Mobile Crane">{isRTL ? 'رافعات متحركة' : 'Mobile Cranes'}</option>
                <option value="Bulldozer">{isRTL ? 'جرافات' : 'Bulldozers'}</option>
              </select>
            </div>
            <Button variant="accent">
              <FontAwesomeIcon icon={faFilter} className="mr-2" />
              <span>{isRTL ? 'تصفية متقدمة' : 'Advanced Filter'}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--awnash-secondary)' }}>
            {isRTL ? 'قائمة الطلبات' : 'Requests List'}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>{isRTL ? 'رقم الطلب' : 'Request ID'}</th>
                <th>{isRTL ? 'الطالب' : 'Requester'}</th>
                <th>{isRTL ? 'نوع المعدة' : 'Equipment'}</th>
                <th>{isRTL ? 'الموقع' : 'Location'}</th>
                <th>{isRTL ? 'المدة' : 'Duration'}</th>
                <th>{isRTL ? 'تاريخ البداية' : 'Start Date'}</th>
                <th>{isRTL ? 'مع سائق' : 'With Driver'}</th>
                <th>{isRTL ? 'العروض' : 'Offers'}</th>
                <th>{isRTL ? 'الحالة' : 'Status'}</th>
                <th>{isRTL ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id}>
                  <td className="font-medium text-blue-600">{request.id}</td>
                  <td>{request.requesterName}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faTruck} className="text-gray-400" />
                      <span>{request.equipmentType}</span>
                      <span className="text-xs text-gray-500">({request.size})</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-400" />
                      <span>{request.location}</span>
                    </div>
                  </td>
                  <td>{getDurationText(request.duration, request.durationType)}</td>
                  <td>{request.startDate}</td>
                  <td>
                    <span className={`badge ${request.withDriver ? 'badge-success' : 'badge-info'}`}>
                      {request.withDriver ? (isRTL ? 'نعم' : 'Yes') : (isRTL ? 'لا' : 'No')}
                    </span>
                  </td>
                  <td>
                    <span className="font-medium text-blue-600">{request.offers}</span>
                  </td>
                  <td>
                    <span className={`badge ${getStatusColor(request.status)}`}>
                      {getStatusText(request.status)}
                    </span>
                  </td>
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
                        title={isRTL ? 'تعديل' : 'Edit'}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      {request.hasPermit && (
                        <button 
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title={isRTL ? 'عرض التصريح' : 'View Permit'}
                        >
                          <FontAwesomeIcon icon={faFileAlt} />
                        </button>
                      )}
                      {request.status === 'pending' && (
                        <>
                          <button 
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title={isRTL ? 'موافقة' : 'Approve'}
                          >
                            <FontAwesomeIcon icon={faCheck} />
                          </button>
                          <button 
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title={isRTL ? 'رفض' : 'Reject'}
                          >
                            <FontAwesomeIcon icon={faTimes} />
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
      </div>

      {/* Request Workflow Info */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--awnash-secondary)' }}>
            {isRTL ? 'سير عمل الطلبات' : 'Request Workflow'}
          </h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3" style={{ color: 'var(--awnash-secondary)' }}>
                {isRTL ? 'مراحل الطلب' : 'Request Stages'}
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                    <span className="text-yellow-600 font-bold text-sm">1</span>
                  </div>
                  <span className="text-sm">{isRTL ? 'طلب جديد - في الانتظار' : 'New Request - Pending'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">2</span>
                  </div>
                  <span className="text-sm">{isRTL ? 'استلام العروض من الملاك' : 'Receiving Offers from Owners'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 font-bold text-sm">3</span>
                  </div>
                  <span className="text-sm">{isRTL ? 'اختيار العرض وتأكيد الحجز' : 'Select Offer and Confirm Booking'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <span className="text-purple-600 font-bold text-sm">4</span>
                  </div>
                  <span className="text-sm">{isRTL ? 'الدفع وبداية التنفيذ' : 'Payment and Execution Start'}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3" style={{ color: 'var(--awnash-secondary)' }}>
                {isRTL ? 'معلومات مهمة' : 'Important Information'}
              </h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• {isRTL ? 'يجب رفع تصريح العمل مع كل طلب' : 'Work permit must be uploaded with each request'}</li>
                <li>• {isRTL ? 'يمكن للملاك إرسال عروضهم خلال 24 ساعة' : 'Owners can send offers within 24 hours'}</li>
                <li>• {isRTL ? 'يمكن التواصل مع المالك قبل تأكيد الحجز' : 'Communication with owner before booking confirmation'}</li>
                <li>• {isRTL ? 'يتم احتساب العمولة تلقائياً عند الدفع' : 'Commission calculated automatically on payment'}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentRequests; 