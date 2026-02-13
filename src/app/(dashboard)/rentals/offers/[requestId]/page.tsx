'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarAlt,
  faSearch,
  faFilter,
  faDownload,
  faEye,
  faFlag,
  faCheck,
  faExpand,
  faTruck,
  faUser,
  faBuilding,
  faMapMarkerAlt,
  faDollarSign,
  faCheckCircle,
  faTimesCircle,
  faClock,
  faPlay,
  faSort,
  faChevronDown,
  faChevronUp,
  faExternalLink,
  faExclamationTriangle,
  faFileExport,
  faCalendarCheck,
  faToggleOn,
  faToggleOff,
  faHandshake,
  faSpinner,
  faArrowLeft
} from '@fortawesome/free-solid-svg-icons';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

// Interfaces based on actual API response (camelCase to match backend)
interface Offer {
  id: string;
  createdAt: string;
  expiresAt: string;
  updatedAt: string;
  dailyRate: string;
  dailyRateCurrency: string;
  totalAmount: string;
  totalAmountCurrency: string;
  note?: string;
  equipment: {
    id: string;
    name: string;
    description: string;
    equipmentType: string;
    size: string;
    status: string;
    imageUrls: string[];
    city: string;
    dailyRate: string;
    totalRentals: number;
    totalRevenue: string;
    createdAt: string;
    updatedAt: string;
    owner: {
      id: string;
      fullName: string;
    };
  };
  request: {
    id: string;
    equipmentType: string;
    equipmentName: string;
    status: string;
    priority: string;
    images: string[];
    startDate: string;
    endDate: string;
    size: string;
    maxBudget: number;
    maxBudgetCurrency: string;
    city: string;
    note: string;
    requestId: string;
    createdAt: string;
    requester: {
      id: string;
      fullName: string;
    };
  };
}

interface ApiResponse {
  data: Offer[];
  page: number;
  limit: number;
  total: number;
}

const OffersManagement: React.FC = () => {
  const { i18n } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const isRTL = i18n.language === 'ar';
  
  const requestId = params?.requestId as string;
  
  // Redirect to 404 if no requestId is provided
  useEffect(() => {
    if (!requestId) {
      router.push('/404');
    }
  }, [requestId, router]);

  // State management
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [equipmentTypeFilter, setEquipmentTypeFilter] = useState<string>('all');
  const [ownerRenterFilter, setOwnerRenterFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedOffers, setSelectedOffers] = useState<string[]>([]);
  const [showExpiringSoon, setShowExpiringSoon] = useState(false);
  const [showHighValue, setShowHighValue] = useState(false);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [paginationLoading, setPaginationLoading] = useState(false);

  // Fetch offers from API with request filter
  const fetchOffers = async (pageNum: number = 1, append: boolean = false) => {
    try {
      setLoading(!append);
      setPaginationLoading(!!append);
      setError('');

      if (!requestId) {
        router.push('/404');
        return;
      }

      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3007/v1'}/offers/request/${requestId}?page=${pageNum}`;

      const response = await fetch(url, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          router.push('/404');
          return;
        }
        throw new Error('Failed to fetch offers');
      }

      const result: ApiResponse = await response.json();
      
      if (append) {
        setOffers(prev => [...prev, ...result.data]);
      } else {
        setOffers(result.data);
      }
      
      setPage(pageNum);
      setTotalPages(Math.ceil(result.total / result.limit));
    } catch (err: any) {
      setError(err.message || 'Failed to load offers');
      // If it's a network error or invalid request, redirect to 404
      if (err.message.includes('Failed to fetch') || err.message.includes('Invalid')) {
        setTimeout(() => {
          router.push('/404');
        }, 2000);
      }
    } finally {
      setLoading(false);
      setPaginationLoading(false);
    }
  };

  // Load offers on component mount and when requestId changes
  useEffect(() => {
    if (requestId) {
      fetchOffers(1);
    }
  }, [requestId]);

  // Load more offers
  const handleLoadMore = async () => {
    if (page >= totalPages) return;
    fetchOffers(page + 1, true);
  };

  // Filter functions
  const filteredOffers = offers.filter(offer => {
    const matchesSearch = 
      offer.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.request.requestId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.equipment.owner.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.request.requester.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || offer.request.status === statusFilter;
    const matchesCity = cityFilter === 'all' || offer.equipment.city === cityFilter;
    const matchesEquipmentType = equipmentTypeFilter === 'all' || offer.equipment.equipmentType === equipmentTypeFilter;
    const matchesOwnerRenter = !ownerRenterFilter || 
      offer.equipment.owner.fullName.toLowerCase().includes(ownerRenterFilter.toLowerCase()) ||
      offer.request.requester.fullName.toLowerCase().includes(ownerRenterFilter.toLowerCase());
    
    const matchesDateRange = !dateRange.start || !dateRange.end || 
      (new Date(offer.request.startDate) >= new Date(dateRange.start) && 
       new Date(offer.request.startDate) <= new Date(dateRange.end));
    
    const today = new Date();
    const expiresAt = new Date(offer.expiresAt);
    const matchesExpiringSoon = !showExpiringSoon || 
      (expiresAt > today && expiresAt.getTime() - today.getTime() < 24 * 60 * 60 * 1000); // Within 24 hours
    
    const matchesHighValue = !showHighValue || parseFloat(offer.totalAmount) > 20000;
    
    return matchesSearch && matchesStatus && matchesCity && matchesEquipmentType && 
           matchesOwnerRenter && matchesDateRange && matchesExpiringSoon && matchesHighValue;
  });

  // Sort functions
  const sortedOffers = [...filteredOffers].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'createdAt':
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
        break;
      case 'startDate':
        aValue = new Date(a.request.startDate);
        bValue = new Date(b.request.startDate);
        break;
      case 'totalAmount':
        aValue = parseFloat(a.totalAmount);
        bValue = parseFloat(b.totalAmount);
        break;
      case 'dailyRate':
        aValue = parseFloat(a.dailyRate);
        bValue = parseFloat(b.dailyRate);
        break;
      case 'expiresAt':
        aValue = new Date(a.expiresAt);
        bValue = new Date(b.expiresAt);
        break;
      default:
        aValue = a.id;
        bValue = b.id;
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Statistics
  const stats = {
    total: offers.length,
    pending: offers.filter(o => o.request.status === 'open').length,
    accepted: offers.filter(o => o.request.status === 'fulfilled').length,
    rejected: offers.filter(o => o.request.status === 'cancelled').length,
    expired: offers.filter(o => {
      const today = new Date();
      const expiresAt = new Date(o.expiresAt);
      return expiresAt < today;
    }).length,
    expiringSoon: offers.filter(o => {
      const today = new Date();
      const expiresAt = new Date(o.expiresAt);
      return expiresAt > today && expiresAt.getTime() - today.getTime() < 24 * 60 * 60 * 1000;
    }).length
  };

  // Helper functions
  const getStatusBadge = (status: string) => {
    const styles = {
      open: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      fulfilled: 'bg-green-100 text-green-800 border border-green-200',
      cancelled: 'bg-red-100 text-red-800 border border-red-200',
      expired: 'bg-gray-100 text-gray-800 border border-gray-200'
    };
    
    const labels = {
      open: isRTL ? 'قيد الانتظار' : 'Pending',
      fulfilled: isRTL ? 'مقبول' : 'Accepted',
      cancelled: isRTL ? 'مرفوض' : 'Rejected',
      expired: isRTL ? 'منتهي الصلاحية' : 'Expired'
    };

    return (
      <span className={cn('px-2 py-1 rounded-full text-xs font-medium', styles[status as keyof typeof styles])}>
        {labels[status as keyof typeof labels]}
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

  const formatCurrency = (amount: string, currency: string) => {
    return new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(parseFloat(amount));
  };

  const handleSelectAll = () => {
    if (selectedOffers.length === sortedOffers.length) {
      setSelectedOffers([]);
    } else {
      setSelectedOffers(sortedOffers.map(offer => offer.id));
    }
  };

  const handleSelectOffer = (offerId: string) => {
    setSelectedOffers(prev => 
      prev.includes(offerId) 
        ? prev.filter(id => id !== offerId)
        : [...prev, offerId]
    );
  };

  const handleBulkExport = () => {
    console.log('Exporting offers:', selectedOffers);
  };

  const handleBulkFlag = () => {
    console.log('Flagging offers:', selectedOffers);
  };

  const handleBackToRequests = () => {
    router.push('/rentals/requests');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} className="h-8 w-8 text-awnash-primary animate-spin mb-4" />
          <p className="text-muted-foreground">{isRTL ? 'جاري تحميل العروض...' : 'Loading offers...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen bg-background p-6", isRTL ? 'font-arabic' : 'font-montserrat')} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <div className="flex items-center space-x-4 mb-2">
              <button
                onClick={handleBackToRequests}
                className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <FontAwesomeIcon icon={faArrowLeft} className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
                {isRTL ? 'العودة إلى الطلبات' : 'Back to Requests'}
              </button>
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              {isRTL ? 'عروض الطلب' : 'Request Offers'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {requestId 
                ? `${isRTL ? 'عروض الطلب' : 'Offers for request'}: ${requestId}`
                : (isRTL ? 'مراقبة وإدارة جميع العروض المقدمة على طلبات الاستئجار' : 'Monitor and manage all offers submitted for rental requests')
              }
            </p>
          </div>
          <div className={cn('flex space-x-2', isRTL && 'space-x-reverse')}>
            <Button variant="dark">
              <FontAwesomeIcon icon={faFileExport} className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
              {isRTL ? 'تصدير' : 'Export'}
            </Button>
            <Button variant="default">
              <FontAwesomeIcon icon={faHandshake} className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
              {isRTL ? 'عرض جديد' : 'New Offer'}
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">{isRTL ? 'إجمالي العروض' : 'Total Offers'}</p>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              </div>
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faHandshake} className="text-foreground h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">{isRTL ? 'قيد الانتظار' : 'Pending'}</p>
                <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
              </div>
              <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faClock} className="text-foreground h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">{isRTL ? 'مقبول' : 'Accepted'}</p>
                <p className="text-2xl font-bold text-green-400">{stats.accepted}</p>
              </div>
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faCheckCircle} className="text-foreground h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">{isRTL ? 'مرفوض' : 'Rejected'}</p>
                <p className="text-2xl font-bold text-red-400">{stats.rejected}</p>
              </div>
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faTimesCircle} className="text-foreground h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">{isRTL ? 'منتهي الصلاحية' : 'Expired'}</p>
                <p className="text-2xl font-bold text-muted-foreground">{stats.expired}</p>
              </div>
              <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-foreground h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">{isRTL ? 'ينتهي قريباً' : 'Expiring Soon'}</p>
                <p className="text-2xl font-bold text-orange-400">{stats.expiringSoon}</p>
              </div>
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faCalendarCheck} className="text-foreground h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div className="relative">
              <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input
                type="text"
                placeholder={isRTL ? 'البحث في العروض...' : 'Search offers...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-awnash-primary"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-awnash-primary"
            >
              <option value="all">{isRTL ? 'جميع الحالات' : 'All Status'}</option>
              <option value="open">{isRTL ? 'قيد الانتظار' : 'Pending'}</option>
              <option value="fulfilled">{isRTL ? 'مقبول' : 'Accepted'}</option>
              <option value="cancelled">{isRTL ? 'مرفوض' : 'Rejected'}</option>
            </select>

            {/* City Filter */}
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="px-4 py-2 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-awnash-primary"
            >
              <option value="all">{isRTL ? 'جميع المدن' : 'All Cities'}</option>
              <option value="Riyadh">Riyadh</option>
              <option value="Kuwait City">Kuwait City</option>
              <option value="Dubai">Dubai</option>
              <option value="Doha">Doha</option>
              <option value="Manama">Manama</option>
            </select>

            {/* Equipment Type Filter */}
            <select
              value={equipmentTypeFilter}
              onChange={(e) => setEquipmentTypeFilter(e.target.value)}
              className="px-4 py-2 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-awnash-primary"
            >
              <option value="all">{isRTL ? 'جميع الأنواع' : 'All Types'}</option>
              <option value="excavator">{isRTL ? 'حفارات' : 'Excavators'}</option>
              <option value="crane">{isRTL ? 'رافعات' : 'Cranes'}</option>
              <option value="bulldozer">{isRTL ? 'جرافات' : 'Bulldozers'}</option>
              <option value="transport">{isRTL ? 'نقل' : 'Transport'}</option>
              <option value="telehandler">{isRTL ? 'رافعات شوكية' : 'Telehandlers'}</option>
            </select>
          </div>

          {/* Additional Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="expiringSoon"
                checked={showExpiringSoon}
                onChange={(e) => setShowExpiringSoon(e.target.checked)}
                className="rounded border-border bg-muted text-awnash-primary focus:ring-awnash-primary"
              />
              <label htmlFor="expiringSoon" className="text-sm text-muted-foreground">
                {isRTL ? 'ينتهي قريباً' : 'Expiring Soon'}
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="highValue"
                checked={showHighValue}
                onChange={(e) => setShowHighValue(e.target.checked)}
                className="rounded border-border bg-muted text-awnash-primary focus:ring-awnash-primary"
              />
              <label htmlFor="highValue" className="text-sm text-muted-foreground">
                {isRTL ? 'قيمة عالية' : 'High Value'}
              </label>
            </div>

            {/* Date Range */}
            <div className="flex items-center space-x-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="px-3 py-1 bg-muted border border-border rounded text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-awnash-primary"
              />
              <span className="text-muted-foreground">-</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="px-3 py-1 bg-muted border border-border rounded text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-awnash-primary"
              />
            </div>
          </div>
        </div>

        {/* Offers Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <input
                type="checkbox"
                checked={selectedOffers.length === sortedOffers.length && sortedOffers.length > 0}
                onChange={handleSelectAll}
                className="rounded border-border bg-muted text-awnash-primary focus:ring-awnash-primary"
              />
              <span className="text-foreground font-medium">
                {selectedOffers.length > 0 
                  ? `${selectedOffers.length} ${isRTL ? 'عرض محدد' : 'offers selected'}`
                  : `${sortedOffers.length} ${isRTL ? 'عرض' : 'offers'}`
                }
              </span>
            </div>
            
            {selectedOffers.length > 0 && (
              <div className={cn('flex space-x-2', isRTL && 'space-x-reverse')}>
                <Button
                  variant="accent"
                  size="sm"
                  onClick={handleBulkExport}
                >
                  {isRTL ? 'تصدير' : 'Export'}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkFlag}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {isRTL ? 'وضع علامة' : 'Flag'}
                </Button>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {isRTL ? 'عرض' : 'Offer'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {isRTL ? 'المعدة' : 'Equipment'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {isRTL ? 'المالك' : 'Owner'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {isRTL ? 'المستأجر' : 'Renter'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {isRTL ? 'التواريخ' : 'Dates'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {isRTL ? 'المبلغ' : 'Amount'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {isRTL ? 'الحالة' : 'Status'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {isRTL ? 'إجراءات' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {sortedOffers.map((offer) => (
                  <tr key={offer.id} className="hover:bg-muted transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-foreground">{offer.id}</div>
                        <div className="text-xs text-muted-foreground">{offer.request.requestId}</div>
                        <div className="text-xs text-gray-500">{formatDate(offer.createdAt)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img
                          src={offer.equipment.imageUrls[0] || '/api/placeholder/80/60'}
                          alt={offer.equipment.name}
                          className="w-10 h-10 rounded-lg object-cover mr-3"
                          onError={(e) => {
                            e.currentTarget.src = '/api/placeholder/80/60';
                          }}
                        />
                        <div>
                          <div className="text-sm font-medium text-foreground">{offer.equipment.name}</div>
                          <div className="text-xs text-muted-foreground">{offer.equipment.equipmentType}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm text-foreground">{offer.equipment.owner.fullName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm text-foreground">{offer.request.requester.fullName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-foreground">{formatDate(offer.request.startDate)} - {formatDate(offer.request.endDate)}</div>
                      <div className="text-xs text-muted-foreground">
                        {isRTL ? 'ينتهي' : 'Expires'}: {formatDate(offer.expiresAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-foreground">{formatCurrency(offer.totalAmount, offer.totalAmountCurrency)}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatCurrency(offer.dailyRate, offer.dailyRateCurrency)}/{isRTL ? 'يوم' : 'day'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-2">
                        {getStatusBadge(offer.request.status)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={cn('flex space-x-2', isRTL && 'space-x-reverse')}>
                        <button
                          className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                          title={isRTL ? 'عرض التفاصيل' : 'View Details'}
                        >
                          <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
                        </button>
                        <button
                          className="p-2 text-green-400 hover:text-green-300 transition-colors"
                          title={isRTL ? 'قبول العرض' : 'Accept Offer'}
                        >
                          <FontAwesomeIcon icon={faCheck} className="h-4 w-4" />
                        </button>
                        <button
                          className="p-2 text-orange-400 hover:text-orange-300 transition-colors"
                          title={isRTL ? 'وضع علامة' : 'Flag'}
                        >
                          <FontAwesomeIcon icon={faFlag} className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {sortedOffers.length === 0 && !loading && (
            <div className="text-center py-12">
              <FontAwesomeIcon icon={faHandshake} className="h-12 w-12 text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                {isRTL ? 'لا توجد عروض' : 'No offers found'}
              </h3>
              <p className="text-gray-500">
                {requestId 
                  ? (isRTL ? 'لا توجد عروض لهذا الطلب' : 'No offers found for this request')
                  : (isRTL ? 'لا توجد عروض تطابق المعايير المحددة' : 'No offers match the selected criteria')
                }
              </p>
            </div>
          )}
        </div>

        {/* Load More Button */}
        {page < totalPages && (
          <div className="flex justify-center mt-6">
            <Button 
              variant="default"
              onClick={handleLoadMore} 
              disabled={paginationLoading}
            >
              {paginationLoading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                  {isRTL ? 'جارٍ التحميل...' : 'Loading...'}
                </>
              ) : (
                isRTL ? 'تحميل المزيد' : 'Load More'
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OffersManagement; 