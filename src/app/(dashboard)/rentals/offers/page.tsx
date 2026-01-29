'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'next/navigation';
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
  faToggleOff,
  faDollarSign,
  faImage,
  faNoteSticky,
  faChevronLeft,
  faChevronRight,
  faArrowLeft
} from '@fortawesome/free-solid-svg-icons';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { requestsService, RentalRequest } from '@/services/requestsService';
import { formatSimpleCurrency } from '@/lib/currencyUtils';
import { offersService, Offer, PaginatedOffersResponse } from '@/services/offersService';
import { useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { OfferDetailsModal } from '@/components/modals/OfferDetailsModal';

const OffersManagement: React.FC = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const searchParams = useSearchParams();
  const requestId = searchParams?.get('requestId');
  const router = useRouter();
  
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [showNoResponse, setShowNoResponse] = useState(false);
  
  // Request data state
  const [requestData, setRequestData] = useState<RentalRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Offers data state
  const [offers, setOffers] = useState<Offer[]>([]);
  const [offersLoading, setOffersLoading] = useState(true);
  const [offersError, setOffersError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [loadingMore, setLoadingMore] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [isOfferDetailsModalOpen, setIsOfferDetailsModalOpen] = useState(false);

  // Fetch request data and offers
  useEffect(() => {
    const fetchData = async () => {
      if (!requestId) {
        setError('No request ID provided');
        setLoading(false);
        setOffersLoading(false);
        return;
      }

      try {
        setLoading(true);
        setOffersLoading(true);
        setError(null);
        setOffersError(null);
        
        // Fetch request data and offers in parallel
        const [requestData, offersResponse] = await Promise.all([
          requestsService.getRequestById(requestId),
          offersService.getOffersByRequestId(requestId, 1, 10)
        ]);
        
        setRequestData(requestData);
        setOffers(offersResponse.data);
        setPagination(offersResponse.pagination);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
        setOffersLoading(false);
      }
    };

    fetchData();
  }, [requestId]);

  // Helper function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Helper function to format priority
  const getPriorityBadge = (priority: string) => {
    const priorityMap = {
      low: { color: 'bg-green-100 text-green-800', text: 'Low' },
      medium: { color: 'bg-yellow-100 text-yellow-800', text: 'Medium' },
      high: { color: 'bg-red-100 text-red-800', text: 'High' },
      urgent: { color: 'bg-red-100 text-red-800', text: 'Urgent' }
    };
    
    const priorityInfo = priorityMap[priority as keyof typeof priorityMap] || priorityMap.medium;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityInfo.color}`}>
        {priorityInfo.text}
      </span>
    );
  };

  // Helper function to format status
  const getStatusBadge = (status: string) => {
    const statusMap = {
      open: { color: 'bg-blue-100 text-blue-800', text: 'Open' },
      closed: { color: 'bg-gray-100 text-gray-800', text: 'Closed' },
      in_progress: { color: 'bg-yellow-100 text-yellow-800', text: 'In Progress' }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.open;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
        {statusInfo.text}
      </span>
    );
  };

  // Helper function to format offer status
  const getOfferStatusBadge = (status: string) => {
    const statusMap = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      accepted: { color: 'bg-green-100 text-green-800', text: 'Accepted' },
      rejected: { color: 'bg-red-100 text-red-800', text: 'Rejected' }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.pending;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
        {statusInfo.text}
      </span>
    );
  };

  // Calculate offer statistics
  const offerStats = {
    total: offers.length,
    accepted: offers.filter(offer => offer.status === 'accepted').length,
    pending: offers.filter(offer => offer.status === 'pending').length,
    rejected: offers.filter(offer => offer.status === 'rejected').length,
    average: offers.length > 0 ? offers.reduce((sum, offer) => sum + offer.total_amount, 0) / offers.length : 0,
    urgent: offers.filter(offer => new Date(offer.expires_at) < new Date(Date.now() + 24 * 60 * 60 * 1000)).length // Expires within 24 hours
  };

  // Offer action handlers
  const handleAcceptOffer = async (offerId: string) => {
    try {
      await offersService.acceptOffer(offerId);
      // Refresh offers data
      const updatedOffersResponse = await offersService.getOffersByRequestId(requestId!, 1, 10);
      setOffers(updatedOffersResponse.data);
      setPagination(updatedOffersResponse.pagination);
    } catch (error) {
      console.error('Error accepting offer:', error);
      setError('Failed to accept offer');
    }
  };

  const handleRejectOffer = async (offerId: string) => {
    try {
      await offersService.rejectOffer(offerId);
      // Refresh offers data
      const updatedOffersResponse = await offersService.getOffersByRequestId(requestId!, 1, 10);
      setOffers(updatedOffersResponse.data);
      setPagination(updatedOffersResponse.pagination);
    } catch (error) {
      console.error('Error rejecting offer:', error);
      setError('Failed to reject offer');
    }
  };

  const handleViewOfferDetails = (offer: Offer) => {
    setSelectedOffer(offer);
    setIsOfferDetailsModalOpen(true);
  };

  const handleBackToRequests = () => {
    router.push('/rentals/requests');
  };

  // Infinite scroll functionality
  const loadMoreOffers = useCallback(async () => {
    if (loadingMore || !pagination.hasNextPage || !requestId) return;

    try {
      setLoadingMore(true);
      const nextPage = pagination.page + 1;
      const response = await offersService.getOffersByRequestId(requestId, nextPage, pagination.limit);
      
      setOffers(prev => [...prev, ...response.data]);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error loading more offers:', error);
      setOffersError('Failed to load more offers');
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, pagination.hasNextPage, pagination.page, pagination.limit, requestId]);

  // Intersection Observer for infinite scroll
  const lastOfferElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loadingMore) return;
    
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && pagination.hasNextPage) {
        loadMoreOffers();
      }
    });
    
    if (node) observerRef.current.observe(node);
  }, [loadingMore, pagination.hasNextPage, loadMoreOffers]);

  if (loading) {
    return (
      <div className={cn("min-h-screen bg-gray-900 p-6", isRTL ? 'font-arabic' : 'font-montserrat')} dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="max-w-7xl mx-auto flex items-center justify-center h-64">
          <div className="text-center">
            <div className="loader mb-4"></div>
            <p className="text-gray-400">{isRTL ? 'جاري تحميل بيانات الطلب...' : 'Loading request data...'}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !requestData) {
    return (
      <div className={cn("min-h-screen bg-gray-900 p-6", isRTL ? 'font-arabic' : 'font-montserrat')} dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-6 text-center">
            <FontAwesomeIcon icon={faExclamationTriangle} className="h-8 w-8 text-red-400 mb-4" />
            <h3 className="text-lg font-medium text-red-400 mb-2">
              {isRTL ? 'خطأ في تحميل البيانات' : 'Error Loading Data'}
            </h3>
            <p className="text-red-300">{error || 'Request not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen bg-gray-900 p-6", isRTL ? 'font-arabic' : 'font-montserrat')} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBackToRequests}
              className="flex items-center px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              title={isRTL ? 'العودة إلى الطلبات' : 'Back to Requests'}
            >
              <FontAwesomeIcon icon={faArrowLeft} className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
              {isRTL ? 'العودة' : 'Back'}
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">
                {isRTL ? 'عروض الطلب' : 'Request Offers'}
        </h1>
              <p className="text-gray-400 mt-1">
                {isRTL ? 'عرض وإدارة العروض المقدمة على هذا الطلب' : 'View and manage offers submitted for this request'}
              </p>
            </div>
          </div>
          <div className={cn('flex space-x-3', isRTL && 'space-x-reverse')}>
            <Button variant="default">
              <FontAwesomeIcon icon={faPlus} className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
              {isRTL ? 'عرض جديد' : 'New Offer'}
            </Button>
            <Button variant="accent">
              <FontAwesomeIcon icon={faFileAlt} className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
              {isRTL ? 'تصدير الكل' : 'Export All'}
            </Button>
          </div>
        </div>

        {/* Request Information Card */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">
              {isRTL ? 'تفاصيل الطلب' : 'Request Details'}
            </h2>
            <div className="flex items-center space-x-3">
              {getStatusBadge(requestData.status)}
              {getPriorityBadge(requestData.priority)}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Information Column */}
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-white mb-3">
                  {isRTL ? 'المعلومات الأساسية' : 'Basic Information'}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <FontAwesomeIcon icon={faClipboardList} className="h-4 w-4 text-blue-400" />
                    <span className="text-gray-300 text-sm">{isRTL ? 'معرف الطلب:' : 'Request ID:'}</span>
                    <span className="text-white font-medium">{requestData.requestId}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <FontAwesomeIcon icon={faUser} className="h-4 w-4 text-green-400" />
                    <span className="text-gray-300 text-sm">{isRTL ? 'مقدم الطلب:' : 'Requester:'}</span>
                    <span className="text-white font-medium">{requestData.requester?.fullName}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <FontAwesomeIcon icon={faTruck} className="h-4 w-4 text-purple-400" />
                    <span className="text-gray-300 text-sm">{isRTL ? 'نوع المعدة:' : 'Equipment Type:'}</span>
                    <span className="text-white font-medium capitalize">{requestData.equipmentType}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <FontAwesomeIcon icon={faBuilding} className="h-4 w-4 text-orange-400" />
                    <span className="text-gray-300 text-sm">{isRTL ? 'الحجم:' : 'Size:'}</span>
                    <span className="text-white font-medium capitalize">{requestData.size}</span>
                  </div>
                </div>
              </div>

              {/* Location & Dates */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-white mb-3">
                  {isRTL ? 'الموقع والتواريخ' : 'Location & Dates'}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="h-4 w-4 text-red-400" />
                    <span className="text-gray-300 text-sm">{isRTL ? 'الموقع:' : 'Location:'}</span>
                    <span className="text-white font-medium">{requestData.city}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <FontAwesomeIcon icon={faCalendar} className="h-4 w-4 text-indigo-400" />
                    <span className="text-gray-300 text-sm">{isRTL ? 'تاريخ البداية:' : 'Start Date:'}</span>
                    <span className="text-white font-medium">{formatDate(requestData.start_date)}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <FontAwesomeIcon icon={faCalendar} className="h-4 w-4 text-indigo-400" />
                    <span className="text-gray-300 text-sm">{isRTL ? 'تاريخ النهاية:' : 'End Date:'}</span>
                    <span className="text-white font-medium">{formatDate(requestData.end_date)}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <FontAwesomeIcon icon={faDollarSign} className="h-4 w-4 text-green-400" />
                    <span className="text-gray-300 text-sm">{isRTL ? 'الميزانية القصوى:' : 'Max Budget:'}</span>
                    <span className="text-white font-medium">{formatSimpleCurrency(requestData.max_budget)}</span>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-white mb-3">
                  {isRTL ? 'معلومات إضافية' : 'Additional Information'}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <FontAwesomeIcon icon={faClock} className="h-4 w-4 text-yellow-400" />
                    <span className="text-gray-300 text-sm">{isRTL ? 'الكمية:' : 'Count:'}</span>
                    <span className="text-white font-medium">{requestData.count}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <FontAwesomeIcon icon={faImage} className="h-4 w-4 text-pink-400" />
                    <span className="text-gray-300 text-sm">{isRTL ? 'الصور:' : 'Images:'}</span>
                    <span className="text-white font-medium">{requestData.images?.length || 0}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <FontAwesomeIcon icon={faNoteSticky} className="h-4 w-4 text-cyan-400" />
                    <span className="text-gray-300 text-sm">{isRTL ? 'الملاحظات:' : 'Notes:'}</span>
                    <span className="text-white font-medium">{requestData.note ? 'Yes' : 'No'}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <FontAwesomeIcon icon={faCalendar} className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-300 text-sm">{isRTL ? 'تاريخ الإنشاء:' : 'Created:'}</span>
                    <span className="text-white font-medium">{formatDate(requestData.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {requestData.note && (
                <div className="space-y-3">
                  <h3 className="text-lg font-medium text-white mb-3">
                    {isRTL ? 'الملاحظات' : 'Notes'}
                  </h3>
                  <p className="text-gray-300 bg-gray-700 rounded-lg p-4">
                    {requestData.note}
                  </p>
                </div>
              )}
            </div>

            {/* Images Column */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">
                {isRTL ? 'صور الطلب' : 'Request Images'}
              </h3>
              
              {requestData.images && requestData.images.length > 0 ? (
                <div className="relative">
                  {/* Main Image Display */}
                  <div className="relative w-full h-80 bg-gray-700 rounded-lg overflow-hidden">
                    <img 
                      src={requestData.images[currentImageIndex]} 
                      alt={`Request image ${currentImageIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Image Counter */}
                    <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                      {currentImageIndex + 1} / {requestData.images.length}
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  {requestData.images.length > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentImageIndex(prev => prev === 0 ? requestData.images.length - 1 : prev - 1)}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                      >
                        <FontAwesomeIcon icon={faChevronLeft} className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setCurrentImageIndex(prev => prev === requestData.images.length - 1 ? 0 : prev + 1)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                      >
                        <FontAwesomeIcon icon={faChevronRight} className="h-4 w-4" />
                      </button>
                    </>
                  )}

                  {/* Thumbnail Navigation */}
                  {requestData.images.length > 1 && (
                    <div className="flex justify-center space-x-2 mt-4">
                      {requestData.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-3 h-3 rounded-full transition-colors ${
                            index === currentImageIndex ? 'bg-blue-500' : 'bg-gray-500 hover:bg-gray-400'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-80 bg-gray-700 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <FontAwesomeIcon icon={faImage} className="h-12 w-12 text-gray-500 mb-4" />
                    <p className="text-gray-400">{isRTL ? 'لا توجد صور' : 'No images available'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{isRTL ? 'إجمالي العروض' : 'Total Offers'}</p>
                <p className="text-2xl font-bold text-white">{offerStats.total}</p>
              </div>
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faClipboardList} className="text-white h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{isRTL ? 'مقبولة' : 'Accepted'}</p>
                <p className="text-2xl font-bold text-green-400">{offerStats.accepted}</p>
              </div>
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faCheckCircle} className="text-white h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{isRTL ? 'معلقة' : 'Pending'}</p>
                <p className="text-2xl font-bold text-yellow-400">{offerStats.pending}</p>
              </div>
              <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faClock} className="text-white h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{isRTL ? 'مرفوضة' : 'Rejected'}</p>
                <p className="text-2xl font-bold text-red-400">{offerStats.rejected}</p>
              </div>
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faTimes} className="text-white h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{isRTL ? 'متوسطة' : 'Average'}</p>
                <p className="text-2xl font-bold text-purple-400">{formatSimpleCurrency(offerStats.average)}</p>
              </div>
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faHandshake} className="text-white h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{isRTL ? 'عاجلة' : 'Urgent'}</p>
                <p className="text-2xl font-bold text-orange-400">{offerStats.urgent}</p>
              </div>
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faFlag} className="text-white h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
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
                <option value="accepted">{isRTL ? 'مقبول' : 'Accepted'}</option>
                <option value="pending">{isRTL ? 'معلق' : 'Pending'}</option>
                <option value="rejected">{isRTL ? 'مرفوض' : 'Rejected'}</option>
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
                  {isRTL ? 'إظهار العروض المعلقة فقط' : 'Show pending offers only'}
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

        {/* Main Content - Offers List */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg">
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                {isRTL ? 'قائمة العروض' : 'Offers List'}
              </h3>
              <span className="text-gray-400 text-sm">
                {offers.length} {isRTL ? 'عرض' : 'offers'}
              </span>
            </div>
          </div>

          {/* Offers Content */}
          {offersLoading ? (
            <div className="text-center py-12">
              <div className="loader mb-4"></div>
              <p className="text-gray-400">{isRTL ? 'جاري تحميل العروض...' : 'Loading offers...'}</p>
            </div>
          ) : offers.length === 0 ? (
            <div className="text-center py-12">
              <FontAwesomeIcon icon={faClipboardList} className="h-12 w-12 text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">
                {isRTL ? 'لا توجد عروض' : 'No offers found'}
              </h3>
              <p className="text-gray-500">
                {isRTL ? 'لم يتم تقديم أي عروض على هذا الطلب بعد' : 'No offers have been submitted for this request yet'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {offers.map((offer, index) => (
                <div 
                  key={offer.id} 
                  ref={index === offers.length - 1 ? lastOfferElementRef : null}
                  className="p-6 hover:bg-gray-750 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h4 className="text-lg font-semibold text-white">
                          {offer.equipment?.name || 'Equipment Name'}
                        </h4>
                        {getOfferStatusBadge(offer.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-gray-400 text-sm">{isRTL ? 'مقدم العرض' : 'Owner'}</p>
                          <p className="text-white font-medium">{offer.bidder?.fullName}</p>
                          <p className="text-gray-500 text-sm">{offer.bidder?.email}</p>
                        </div>
                        
                        <div>
                          <p className="text-gray-400 text-sm">{isRTL ? 'المعدة' : 'Equipment'}</p>
                          <p className="text-white font-medium capitalize">{offer.equipment?.equipmentType}</p>
                          <p className="text-gray-500 text-sm">{offer.equipment?.city}</p>
                        </div>
                        
                        <div>
                          <p className="text-gray-400 text-sm">{isRTL ? 'السعر اليومي' : 'Daily Rate'}</p>
                          <p className="text-white font-medium">
                            {formatSimpleCurrency(offer.dailyRate, offer.dailyRateCurrency)}/{isRTL ? 'يوم' : 'day'}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-gray-400 text-sm">{isRTL ? 'المبلغ الإجمالي' : 'Total Amount'}</p>
                          <p className="text-white font-medium">
                            {formatSimpleCurrency(offer.total_amount, offer.total_amount_currency)}
                          </p>
                        </div>
                      </div>
                      
                      {offer.note && (
                        <div className="mb-4">
                          <p className="text-gray-400 text-sm mb-1">{isRTL ? 'الملاحظات' : 'Notes'}</p>
                          <p className="text-gray-300 text-sm bg-gray-700 rounded-lg p-3">
                            {offer.note}
                          </p>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span>{isRTL ? 'تاريخ التقديم:' : 'Submitted:'} {formatDate(offer.createdAt)}</span>
                        <span>{isRTL ? 'ينتهي في:' : 'Expires:'} {formatDate(offer.expires_at)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {offer.status === 'pending' && (
                        <>
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleAcceptOffer(offer.id)}
                          >
                            {isRTL ? 'قبول' : 'Accept'}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRejectOffer(offer.id)}
                          >
                            {isRTL ? 'رفض' : 'Reject'}
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewOfferDetails(offer)}
                        title={isRTL ? 'عرض التفاصيل' : 'View Details'}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
                      </Button>
                    </div>
                                     </div>
                 </div>
               ))}
               
               {/* Loading more indicator */}
               {loadingMore && (
                 <div className="p-6 text-center">
                   <div className="loader mb-2"></div>
                   <p className="text-gray-400 text-sm">{isRTL ? 'جاري تحميل المزيد من العروض...' : 'Loading more offers...'}</p>
                 </div>
               )}
               
               {/* End of results indicator */}
               {!loadingMore && !pagination.hasNextPage && offers.length > 0 && (
                 <div className="p-6 text-center">
                   <p className="text-gray-400 text-sm">{isRTL ? 'تم عرض جميع العروض' : 'All offers loaded'}</p>
                 </div>
               )}
             </div>
          )}
        </div>
      </div>
      
      {/* Offer Details Modal */}
      <OfferDetailsModal
        isOpen={isOfferDetailsModalOpen}
        onClose={() => {
          setIsOfferDetailsModalOpen(false);
          setSelectedOffer(null);
        }}
        offer={selectedOffer}
        isRTL={isRTL}
      />
    </div>
  );
};

export default OffersManagement; 