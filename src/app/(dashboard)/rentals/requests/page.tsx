'use client';

import React, { useState, useEffect } from 'react';
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
  faFlag,
  faArchive,
  faSearch,
  faFilter,
  faPlus,
  faExternalLink,
  faCheckCircle,
  faExclamationTriangle,
  faTimes,
  faBuilding,
  faHandshake,
  faSort,
  faToggleOn,
  faToggleOff
} from '@fortawesome/free-solid-svg-icons';
import { cn } from '@/lib/utils';
import { RequestModal, RequestFormValues } from '@/components/modals/RequestModal';
import { requestsService, RentalRequest } from '@/services/requestsService';
import { useAuth } from '@/contexts/AuthContext';

const EquipmentRequests: React.FC = () => {
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const isRTL = i18n.language === 'ar';
  
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [showNoResponse, setShowNoResponse] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RentalRequest | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requests, setRequests] = useState<RentalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch requests from backend
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedRequests = await requestsService.getRequests();
        setRequests(fetchedRequests);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch requests');
        console.error('Error fetching requests:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  // Filter functions
  const filteredRequests = (Array.isArray(requests) ? requests : []).filter(request => {
    // Safety checks for required properties
    if (!request || !request.requester?.fullName || !request.id || !request.equipmentType) {
      return false;
    }

    const matchesSearch = 
      (request.requester?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.requestId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.equipmentType || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.city || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || (request.equipmentType === categoryFilter);
    const matchesLocation = locationFilter === 'all' || (request.city === locationFilter);
    const matchesNoResponse = !showNoResponse || request.status === 'open'; // All open requests are considered "no response" for now
    
    return matchesSearch && matchesStatus && matchesCategory && matchesLocation && matchesNoResponse;
  });

  // Statistics
  const stats = {
    total: Array.isArray(requests) ? requests.length : 0,
    open: Array.isArray(requests) ? requests.filter(r => r && r.status === 'open').length : 0,
    fulfilled: Array.isArray(requests) ? requests.filter(r => r && r.status === 'fulfilled').length : 0,
    expired: Array.isArray(requests) ? requests.filter(r => r && r.status === 'expired').length : 0,
    noResponse: Array.isArray(requests) ? requests.filter(r => r && r.status === 'open').length : 0, // Open requests are considered "no response"
    urgent: Array.isArray(requests) ? requests.filter(r => r && r.priority === 'high').length : 0
  };

  // Helper functions
  const getStatusBadge = (status: string) => {
    const styles = {
      open: 'bg-blue-100 text-blue-800 border border-blue-200',
      fulfilled: 'bg-green-100 text-green-800 border border-green-200',
      expired: 'bg-red-100 text-red-800 border border-red-200',
      cancelled: 'bg-gray-100 text-gray-800 border border-gray-200'
    };
    
    const labels = {
      open: isRTL ? 'مفتوح' : 'Open',
      fulfilled: isRTL ? 'مكتمل' : 'Fulfilled',
      expired: isRTL ? 'منتهي الصلاحية' : 'Expired',
      cancelled: isRTL ? 'ملغي' : 'Cancelled'
    };

    return (
      <span className={cn('px-2 py-1 rounded-full text-xs font-medium', styles[status as keyof typeof styles])}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getPriorityBadge = (priority: string, isHigh: boolean) => {
    if (isHigh) {
      return (
        <span className="px-2 py-1 bg-red-500 text-white rounded-full text-xs font-medium flex items-center">
          <FontAwesomeIcon icon={faExclamationTriangle} className={cn('h-3 w-3', isRTL ? 'ml-1' : 'mr-1')} />
          {isRTL ? 'عاجل' : 'Urgent'}
        </span>
      );
    }

    const styles = {
      high: 'bg-orange-100 text-orange-800 border border-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      low: 'bg-gray-100 text-gray-800 border border-gray-200'
    };

    const labels = {
      high: isRTL ? 'عالي' : 'High',
      medium: isRTL ? 'متوسط' : 'Medium',
      low: isRTL ? 'منخفض' : 'Low'
    };

    return (
      <span className={cn('px-2 py-1 rounded-full text-xs font-medium', styles[priority as keyof typeof styles])}>
        {labels[priority as keyof typeof labels]}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Handle new request submission
  const handleSubmitRequest = async (formData: RequestFormValues) => {
    setIsSubmitting(true);
    try {
      const newRequest = await requestsService.createRequest({
        equipmentType: formData.equipmentType,
        status: formData.status,
        priority: formData.priority,
        images: formData.images,
        startDate: formData.startDate,
        endDate: formData.endDate,
        maxBudget: formData.maxBudget,
        city: formData.city,
        location: formData.location,
        latitude: formData.latitude,
        longitude: formData.longitude,
        locationAddress: formData.locationAddress,
        notes: formData.notes
      });

      console.log('Request submitted successfully:', newRequest);
      
      // Add the new request to the local state
      setRequests(prev => [newRequest, ...prev]);
      
      // Close the modal
      setShowRequestModal(false);
      
    } catch (error: any) {
      console.error('Error submitting request:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn("min-h-screen bg-gray-900 p-6", isRTL ? 'font-arabic' : 'font-montserrat')} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-white">
              {isRTL ? 'طلبات استئجار المعدات' : 'Rental Requests'}
            </h1>
            <p className="text-gray-400 mt-1">
              {isRTL ? 'مراقبة جميع طلبات استئجار المعدات الواردة من المستأجرين' : 'Monitor all incoming equipment rental requests from renters'}
            </p>
          </div>
          <button 
            onClick={() => setShowRequestModal(true)}
            className="flex items-center px-4 py-2 bg-awnash-primary text-black rounded-2xl hover:bg-awnash-primary-hover font-medium transition-colors shadow-lg"
          >
            <FontAwesomeIcon icon={faPlus} className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
            {isRTL ? 'طلب جديد' : 'New Request'}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900 border border-red-700 rounded-xl p-4">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faExclamationTriangle} className="h-5 w-5 text-red-400 mr-3" />
              <span className="text-red-200">{error}</span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-12 text-center">
            <div className="flex items-center justify-center">
              <div className="loader mr-3"></div>
              <span className="text-gray-300">{isRTL ? 'جاري تحميل الطلبات...' : 'Loading requests...'}</span>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{isRTL ? 'إجمالي الطلبات' : 'Total Requests'}</p>
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                </div>
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <FontAwesomeIcon icon={faClipboardList} className="text-white h-5 w-5" />
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{isRTL ? 'مفتوحة' : 'Open'}</p>
                  <p className="text-2xl font-bold text-blue-400">{stats.open}</p>
                </div>
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-white h-5 w-5" />
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{isRTL ? 'مكتملة' : 'Fulfilled'}</p>
                  <p className="text-2xl font-bold text-green-400">{stats.fulfilled}</p>
                </div>
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <FontAwesomeIcon icon={faHandshake} className="text-white h-5 w-5" />
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{isRTL ? 'منتهية الصلاحية' : 'Expired'}</p>
                  <p className="text-2xl font-bold text-red-400">{stats.expired}</p>
                </div>
                <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                  <FontAwesomeIcon icon={faTimes} className="text-white h-5 w-5" />
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{isRTL ? 'بدون رد' : 'No Response'}</p>
                  <p className="text-2xl font-bold text-yellow-400">{stats.noResponse}</p>
                </div>
                <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="text-white h-5 w-5" />
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{isRTL ? 'عاجلة' : 'Urgent'}</p>
                  <p className="text-2xl font-bold text-orange-400">{stats.urgent}</p>
                </div>
                <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                  <FontAwesomeIcon icon={faFlag} className="text-white h-5 w-5" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        {!loading && (
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {isRTL ? 'البحث' : 'Search'}
                </label>
                <div className="relative">
                  <FontAwesomeIcon 
                    icon={faSearch} 
                    className={cn('absolute top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4', isRTL ? 'right-3' : 'left-3')} 
                  />
                  <input
                    type="text"
                    placeholder={isRTL ? 'البحث بالاسم، المعرف، أو نوع المعدة...' : 'Search by name, ID, or equipment type...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={cn('w-full py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500', isRTL ? 'pr-10 pl-3' : 'pl-10 pr-3')}
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {isRTL ? 'الحالة' : 'Status'}
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">{isRTL ? 'جميع الحالات' : 'All Status'}</option>
                  <option value="open">{isRTL ? 'مفتوح' : 'Open'}</option>
                  <option value="fulfilled">{isRTL ? 'مكتمل' : 'Fulfilled'}</option>
                  <option value="expired">{isRTL ? 'منتهي الصلاحية' : 'Expired'}</option>
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {isRTL ? 'الفئة' : 'Category'}
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">{isRTL ? 'جميع الفئات' : 'All Categories'}</option>
                                  <option value="excavator">{isRTL ? 'الحفار' : 'Excavator'}</option>
                <option value="crane">{isRTL ? 'الرافعة' : 'Crane'}</option>
                <option value="bulldozer">{isRTL ? 'الجرار' : 'Bulldozer'}</option>
                <option value="loader">{isRTL ? 'المحمل' : 'Loader'}</option>
                <option value="trencher">{isRTL ? 'الحفار الخندق' : 'Trencher'}</option>
                <option value="generator">{isRTL ? 'المولد' : 'Generator'}</option>
                <option value="compactor">{isRTL ? 'المدك' : 'Compactor'}</option>
                <option value="grader">{isRTL ? 'المسوي' : 'Grader'}</option>
                </select>
              </div>

              {/* Location Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {isRTL ? 'الموقع' : 'Location'}
                </label>
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">{isRTL ? 'جميع المواقع' : 'All Locations'}</option>
                  <option value="Riyadh">{isRTL ? 'الرياض' : 'Riyadh'}</option>
                  <option value="Dubai">{isRTL ? 'دبي' : 'Dubai'}</option>
                  <option value="Kuwait City">{isRTL ? 'مدينة الكويت' : 'Kuwait City'}</option>
                  <option value="Doha">{isRTL ? 'الدوحة' : 'Doha'}</option>
                  <option value="Manama">{isRTL ? 'المنامة' : 'Manama'}</option>
                </select>
              </div>
            </div>

            {/* No Response Toggle */}
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-300">
                  {isRTL ? 'إظهار الطلبات بدون رد من المالكين فقط' : 'Show requests with no owner response only'}
                </span>
                <button
                  onClick={() => setShowNoResponse(!showNoResponse)}
                  className={cn('p-2 rounded-full transition-colors', showNoResponse ? 'bg-yellow-600 text-white' : 'bg-gray-600 text-gray-300')}
                >
                  <FontAwesomeIcon icon={showNoResponse ? faToggleOn : faToggleOff} className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Requests Table */}
        {!loading && (
          <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg">
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                {isRTL ? 'قائمة الطلبات' : 'Requests List'}
              </h3>
              <span className="text-gray-400 text-sm">
                {filteredRequests.length} {isRTL ? 'من' : 'of'} {Array.isArray(requests) ? requests.length : 0} {isRTL ? 'طلب' : 'requests'}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className={cn('px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider', isRTL ? 'text-right' : 'text-left')}>
                    <div className="flex items-center">
                      {isRTL ? 'معرف الطلب' : 'Request ID'}
                      <FontAwesomeIcon icon={faSort} className={cn('h-3 w-3 text-gray-400', isRTL ? 'mr-1' : 'ml-1')} />
                    </div>
                  </th>
                  <th className={cn('px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider', isRTL ? 'text-right' : 'text-left')}>
                    {isRTL ? 'مقدم الطلب' : 'Requester'}
                  </th>
                  <th className={cn('px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider', isRTL ? 'text-right' : 'text-left')}>
                    {isRTL ? 'نوع المعدة' : 'Equipment Type'}
                  </th>
                  <th className={cn('px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider', isRTL ? 'text-right' : 'text-left')}>
                    {isRTL ? 'المدة المطلوبة' : 'Duration'}
                  </th>
                  <th className={cn('px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider', isRTL ? 'text-right' : 'text-left')}>
                    {isRTL ? 'تاريخ التقديم' : 'Submission Date'}
                  </th>
                  <th className={cn('px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider', isRTL ? 'text-right' : 'text-left')}>
                    {isRTL ? 'الحالة' : 'Status'}
                  </th>
                  <th className={cn('px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider', isRTL ? 'text-right' : 'text-left')}>
                    {isRTL ? 'الإجراءات' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredRequests.map((request) => {
                  // Safety check - skip rendering if request is invalid
                  if (!request || !request.id || !request.requester?.fullName || !request.equipmentType) {
                    return null;
                  }
                  
                  return (
                  <tr key={request.id} className="hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-blue-400">{request.requestId}</span>
                        {request.priority === 'high' && (
                          <FontAwesomeIcon icon={faExclamationTriangle} className={cn('h-3 w-3 text-red-400', isRTL ? 'mr-2' : 'ml-2')} />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <button 
                          className="text-sm font-medium text-white hover:text-blue-400 transition-colors"
                          onClick={() => setSelectedRequest(request)}
                        >
                          {request.requester.fullName}
                        </button>
                        <div className="text-xs text-gray-400 flex items-center mt-1">
                          <FontAwesomeIcon icon={faBuilding} className={cn('h-3 w-3', isRTL ? 'ml-1' : 'mr-1')} />
                          {request.requester.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm text-white">{request.equipmentType}</div>
                        <div className="text-xs text-gray-400 flex items-center mt-1">
                          <FontAwesomeIcon icon={faMapMarkerAlt} className={cn('h-3 w-3', isRTL ? 'ml-1' : 'mr-1')} />
                          {request.city}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{request.count} {isRTL ? 'قطعة' : 'piece(s)'}</div>
                      <div className="text-xs text-gray-400">
                        {formatDate(request.startDate)} - {formatDate(request.endDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{formatDate(request.createdAt)}</div>
                      <div className="text-xs text-gray-400">
                        {new Date(request.createdAt).toLocaleTimeString(isRTL ? 'ar-SA' : 'en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-2">
                        {getStatusBadge(request.status)}
                        {getPriorityBadge(request.priority, request.priority === 'high')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={cn('flex space-x-2', isRTL && 'space-x-reverse')}>
                        <button
                          onClick={() => window.location.href = `/rentals/offers?requestId=${request.id}`}
                          className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                          title={isRTL ? 'عرض العروض' : 'View Offers'}
                        >
                          <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
                        </button>
                        <button
                          className="p-2 text-orange-400 hover:text-orange-300 transition-colors"
                          title={isRTL ? 'وضع علامة على الطلب' : 'Flag Request'}
                        >
                          <FontAwesomeIcon icon={faFlag} className="h-4 w-4" />
                        </button>
                        <button
                          className="p-2 text-gray-400 hover:text-gray-300 transition-colors"
                          title={isRTL ? 'أرشفة' : 'Archive'}
                        >
                          <FontAwesomeIcon icon={faArchive} className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
                })}
              </tbody>
            </table>
          </div>

          {filteredRequests.length === 0 && (
            <div className="text-center py-12">
              <FontAwesomeIcon icon={faClipboardList} className="h-12 w-12 text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">
                {isRTL ? 'لا توجد طلبات' : 'No requests found'}
              </h3>
              <p className="text-gray-500">
                {isRTL ? 'لا توجد طلبات تطابق المعايير المحددة' : 'No requests match the selected criteria'}
              </p>
            </div>
          )}
        </div>
        )}

      </div>

      {/* Request Modal */}
      <RequestModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onSubmit={handleSubmitRequest}
        loading={isSubmitting}
      />
    </div>
  );
};

export default EquipmentRequests; 