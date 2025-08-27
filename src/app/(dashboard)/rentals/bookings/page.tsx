'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
  faToggleOff
} from '@fortawesome/free-solid-svg-icons';
import { cn } from '@/lib/utils';

// Interfaces
interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  rating: number;
}

interface Equipment {
  id: string;
  name: string;
  thumbnail: string;
  category: string;
  model: string;
}

interface Booking {
  id: string;
  equipment: Equipment;
  ownerName: string;
  ownerCompany: string;
  renterName: string;
  renterCompany: string;
  driver: Driver | null;
  startDate: string;
  endDate: string;
  status: 'confirmed' | 'active' | 'completed' | 'cancelled';
  totalAmount: number;
  city: string;
  createdAt: string;
  lastUpdated: string;
  notes?: string;
  extensionRequests: number;
  paymentStatus: 'paid' | 'pending' | 'overdue';
}

const BookingsManagement: React.FC = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [equipmentTypeFilter, setEquipmentTypeFilter] = useState<string>('all');
  const [ownerRenterFilter, setOwnerRenterFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
  const [showUpcomingOnly, setShowUpcomingOnly] = useState(false);
  const [showEndingToday, setShowEndingToday] = useState(false);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Mock data
  const bookings: Booking[] = [
    {
      id: 'BK-2024-001',
      equipment: {
        id: 'eq-001',
        name: 'CAT 320D Excavator',
        thumbnail: '/api/placeholder/80/60',
        category: 'excavators',
        model: '320D'
      },
      ownerName: 'Ahmed Al-Rashid',
      ownerCompany: 'Al-Rashid Heavy Equipment',
      renterName: 'Fatima Al-Zahra',
      renterCompany: 'Gulf Construction Co.',
      driver: {
        id: 'drv-001',
        name: 'Mohammed Hassan',
        licenseNumber: 'DRV-12345',
        rating: 4.8
      },
      startDate: '2024-06-20',
      endDate: '2024-06-27',
      status: 'confirmed',
      totalAmount: 18500,
      city: 'Riyadh',
      createdAt: '2024-06-15T10:30:00Z',
      lastUpdated: '2024-06-16T14:20:00Z',
      extensionRequests: 0,
      paymentStatus: 'paid'
    },
    {
      id: 'BK-2024-002',
      equipment: {
        id: 'eq-002',
        name: 'Liebherr LTM 1100 Crane',
        thumbnail: '/api/placeholder/80/60',
        category: 'cranes',
        model: 'LTM 1100'
      },
      ownerName: 'Omar Al-Sabah',
      ownerCompany: 'Kuwait Lifting Solutions',
      renterName: 'Sara Al-Khalifa',
      renterCompany: 'Modern Infrastructure Ltd.',
      driver: {
        id: 'drv-002',
        name: 'Ali Abdullah',
        licenseNumber: 'DRV-67890',
        rating: 4.9
      },
      startDate: '2024-06-18',
      endDate: '2024-06-25',
      status: 'active',
      totalAmount: 45000,
      city: 'Kuwait City',
      createdAt: '2024-06-12T09:15:00Z',
      lastUpdated: '2024-06-18T08:30:00Z',
      extensionRequests: 1,
      paymentStatus: 'paid'
    },
    {
      id: 'BK-2024-003',
      equipment: {
        id: 'eq-003',
        name: 'Komatsu D85ESS Bulldozer',
        thumbnail: '/api/placeholder/80/60',
        category: 'bulldozers',
        model: 'D85ESS'
      },
      ownerName: 'Nasser Al-Mansouri',
      ownerCompany: 'Emirates Heavy Machinery',
      renterName: 'Layla Al-Qasimi',
      renterCompany: 'Skyline Projects',
      driver: null,
      startDate: '2024-06-10',
      endDate: '2024-06-17',
      status: 'completed',
      totalAmount: 22000,
      city: 'Dubai',
      createdAt: '2024-06-05T16:45:00Z',
      lastUpdated: '2024-06-17T18:00:00Z',
      extensionRequests: 0,
      paymentStatus: 'paid'
    },
    {
      id: 'BK-2024-004',
      equipment: {
        id: 'eq-004',
        name: 'Volvo A40G Dump Truck',
        thumbnail: '/api/placeholder/80/60',
        category: 'transport',
        model: 'A40G'
      },
      ownerName: 'Khalid Al-Thani',
      ownerCompany: 'Qatar Transport Solutions',
      renterName: 'Amina Al-Kuwari',
      renterCompany: 'Desert Roads Co.',
      driver: {
        id: 'drv-003',
        name: 'Ibrahim Al-Shahri',
        licenseNumber: 'DRV-54321',
        rating: 4.7
      },
      startDate: '2024-06-22',
      endDate: '2024-06-29',
      status: 'confirmed',
      totalAmount: 15750,
      city: 'Doha',
      createdAt: '2024-06-17T11:20:00Z',
      lastUpdated: '2024-06-17T11:20:00Z',
      extensionRequests: 0,
      paymentStatus: 'pending'
    },
    {
      id: 'BK-2024-005',
      equipment: {
        id: 'eq-005',
        name: 'JCB 540-200 Telehandler',
        thumbnail: '/api/placeholder/80/60',
        category: 'telehandlers',
        model: '540-200'
      },
      ownerName: 'Yasmin Al-Hashemi',
      ownerCompany: 'Bahrain Equipment Rental',
      renterName: 'Hassan Al-Khalil',
      renterCompany: 'Gulf Port Authority',
      driver: null,
      startDate: '2024-06-05',
      endDate: '2024-06-12',
      status: 'cancelled',
      totalAmount: 8900,
      city: 'Manama',
      createdAt: '2024-06-01T13:30:00Z',
      lastUpdated: '2024-06-03T10:15:00Z',
      extensionRequests: 0,
      paymentStatus: 'overdue'
    }
  ];

  // Filter functions
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.renterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.ownerCompany.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.renterCompany.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    const matchesCity = cityFilter === 'all' || booking.city === cityFilter;
    const matchesEquipmentType = equipmentTypeFilter === 'all' || booking.equipment.category === equipmentTypeFilter;
    const matchesOwnerRenter = !ownerRenterFilter || 
      booking.ownerName.toLowerCase().includes(ownerRenterFilter.toLowerCase()) ||
      booking.renterName.toLowerCase().includes(ownerRenterFilter.toLowerCase());
    
    const matchesDateRange = !dateRange.start || !dateRange.end || 
      (new Date(booking.startDate) >= new Date(dateRange.start) && 
       new Date(booking.startDate) <= new Date(dateRange.end));
    
    const today = new Date().toISOString().split('T')[0];
    const matchesUpcoming = !showUpcomingOnly || new Date(booking.startDate) > new Date(today);
    const matchesEndingToday = !showEndingToday || booking.endDate === today;
    
    return matchesSearch && matchesStatus && matchesCity && matchesEquipmentType && 
           matchesOwnerRenter && matchesDateRange && matchesUpcoming && matchesEndingToday;
  });

  // Statistics
  const stats = {
    total: bookings.length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    active: bookings.filter(b => b.status === 'active').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    totalRevenue: bookings.reduce((sum, b) => sum + b.totalAmount, 0),
    upcomingToday: bookings.filter(b => b.startDate === new Date().toISOString().split('T')[0]).length,
    endingToday: bookings.filter(b => b.endDate === new Date().toISOString().split('T')[0]).length
  };

  // Helper functions
  const getStatusBadge = (status: string) => {
    const styles = {
      confirmed: 'bg-blue-100 text-blue-800 border border-blue-200',
      active: 'bg-green-100 text-green-800 border border-green-200',
      completed: 'bg-purple-100 text-purple-800 border border-purple-200',
      cancelled: 'bg-red-100 text-red-800 border border-red-200'
    };
    
    const labels = {
      confirmed: isRTL ? 'مؤكد' : 'Confirmed',
      active: isRTL ? 'نشط' : 'Active',
      completed: isRTL ? 'مكتمل' : 'Completed',
      cancelled: isRTL ? 'ملغي' : 'Cancelled'
    };

    return (
      <span className={cn('px-2 py-1 rounded-full text-xs font-medium', styles[status as keyof typeof styles])}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const styles = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      overdue: 'bg-red-100 text-red-800'
    };
    
    const labels = {
      paid: isRTL ? 'مدفوع' : 'Paid',
      pending: isRTL ? 'معلق' : 'Pending',
      overdue: isRTL ? 'متأخر' : 'Overdue'
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleSelectAll = () => {
    if (selectedBookings.length === filteredBookings.length) {
      setSelectedBookings([]);
    } else {
      setSelectedBookings(filteredBookings.map(b => b.id));
    }
  };

  const handleSelectBooking = (bookingId: string) => {
    setSelectedBookings(prev => 
      prev.includes(bookingId) 
        ? prev.filter(id => id !== bookingId)
        : [...prev, bookingId]
    );
  };

  const handleBulkExport = () => {
    const selectedData = filteredBookings.filter(b => selectedBookings.includes(b.id));
    console.log('Exporting bookings:', selectedData);
    // Implementation for CSV/Excel export
  };

  const handleBulkFlag = () => {
    console.log('Flagging bookings:', selectedBookings);
    // Implementation for bulk flagging
  };

  return (
    <div className={cn("min-h-screen bg-gray-900 p-6", isRTL ? 'font-arabic' : 'font-montserrat')} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-white">
              {isRTL ? 'إدارة الحجوزات' : 'Bookings Management'}
            </h1>
            <p className="text-gray-400 mt-1">
              {isRTL ? 'عرض وإدارة جميع حجوزات المعدات عبر المنصة' : 'View and manage all equipment bookings across the platform'}
            </p>
          </div>
          <div className={cn('flex space-x-3', isRTL && 'space-x-reverse')}>
            <button className="flex items-center px-4 py-2 bg-awnash-primary text-black rounded-2xl hover:bg-awnash-primary-hover font-medium transition-colors shadow-lg">
              <FontAwesomeIcon icon={faCalendarCheck} className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
              {isRTL ? 'حجز جديد' : 'New Booking'}
            </button>
            <button className="flex items-center px-4 py-2 bg-awnash-accent text-white rounded-2xl hover:bg-awnash-accent-hover font-medium transition-colors shadow-lg">
              <FontAwesomeIcon icon={faFileExport} className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
              {isRTL ? 'تصدير الكل' : 'Export All'}
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{isRTL ? 'إجمالي الحجوزات' : 'Total Bookings'}</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faCalendarAlt} className="text-white h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{isRTL ? 'مؤكدة' : 'Confirmed'}</p>
                <p className="text-2xl font-bold text-blue-400">{stats.confirmed}</p>
              </div>
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faCheckCircle} className="text-white h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{isRTL ? 'نشطة' : 'Active'}</p>
                <p className="text-2xl font-bold text-green-400">{stats.active}</p>
              </div>
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faPlay} className="text-white h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{isRTL ? 'مكتملة' : 'Completed'}</p>
                <p className="text-2xl font-bold text-purple-400">{stats.completed}</p>
              </div>
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faCheck} className="text-white h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{isRTL ? 'ملغية' : 'Cancelled'}</p>
                <p className="text-2xl font-bold text-red-400">{stats.cancelled}</p>
              </div>
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faTimesCircle} className="text-white h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{isRTL ? 'الإيرادات' : 'Revenue'}</p>
                <p className="text-lg font-bold text-yellow-400">{formatCurrency(stats.totalRevenue)}</p>
              </div>
              <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faDollarSign} className="text-black h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{isRTL ? 'تبدأ اليوم' : 'Starting Today'}</p>
                <p className="text-2xl font-bold text-orange-400">{stats.upcomingToday}</p>
              </div>
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faCalendarCheck} className="text-white h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{isRTL ? 'تنتهي اليوم' : 'Ending Today'}</p>
                <p className="text-2xl font-bold text-red-400">{stats.endingToday}</p>
              </div>
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-white h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
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
                  placeholder={isRTL ? 'البحث بالمعرف، المعدة، أو الاسم...' : 'Search by ID, equipment, or name...'}
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
                <option value="confirmed">{isRTL ? 'مؤكد' : 'Confirmed'}</option>
                <option value="active">{isRTL ? 'نشط' : 'Active'}</option>
                <option value="completed">{isRTL ? 'مكتمل' : 'Completed'}</option>
                <option value="cancelled">{isRTL ? 'ملغي' : 'Cancelled'}</option>
              </select>
            </div>

            {/* City Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {isRTL ? 'المدينة' : 'City'}
              </label>
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{isRTL ? 'جميع المدن' : 'All Cities'}</option>
                <option value="Riyadh">{isRTL ? 'الرياض' : 'Riyadh'}</option>
                <option value="Dubai">{isRTL ? 'دبي' : 'Dubai'}</option>
                <option value="Kuwait City">{isRTL ? 'مدينة الكويت' : 'Kuwait City'}</option>
                <option value="Doha">{isRTL ? 'الدوحة' : 'Doha'}</option>
                <option value="Manama">{isRTL ? 'المنامة' : 'Manama'}</option>
              </select>
            </div>

            {/* Equipment Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {isRTL ? 'نوع المعدة' : 'Equipment Type'}
              </label>
              <select
                value={equipmentTypeFilter}
                onChange={(e) => setEquipmentTypeFilter(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{isRTL ? 'جميع الأنواع' : 'All Types'}</option>
                <option value="excavators">{isRTL ? 'الحفارات' : 'Excavators'}</option>
                <option value="cranes">{isRTL ? 'الرافعات' : 'Cranes'}</option>
                <option value="bulldozers">{isRTL ? 'الجرافات' : 'Bulldozers'}</option>
                <option value="transport">{isRTL ? 'النقل' : 'Transport'}</option>
                <option value="telehandlers">{isRTL ? 'الرافعات الشوكية' : 'Telehandlers'}</option>
              </select>
            </div>

            {/* Owner/Renter Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {isRTL ? 'المالك/المستأجر' : 'Owner/Renter'}
              </label>
              <input
                type="text"
                placeholder={isRTL ? 'اسم المالك أو المستأجر' : 'Owner or renter name'}
                value={ownerRenterFilter}
                onChange={(e) => setOwnerRenterFilter(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {isRTL ? 'من تاريخ' : 'Start Date'}
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {isRTL ? 'إلى تاريخ' : 'End Date'}
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setShowUpcomingOnly(!showUpcomingOnly)}
                className={cn('flex items-center px-4 py-2 rounded-lg transition-colors', 
                  showUpcomingOnly ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300')}
              >
                <FontAwesomeIcon icon={showUpcomingOnly ? faToggleOn : faToggleOff} className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
                {isRTL ? 'القادمة فقط' : 'Upcoming Only'}
              </button>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setShowEndingToday(!showEndingToday)}
                className={cn('flex items-center px-4 py-2 rounded-lg transition-colors', 
                  showEndingToday ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300')}
              >
                <FontAwesomeIcon icon={showEndingToday ? faToggleOn : faToggleOff} className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
                {isRTL ? 'تنتهي اليوم' : 'Ending Today'}
              </button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedBookings.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">
                  {selectedBookings.length} {isRTL ? 'حجز محدد' : 'bookings selected'}
                </span>
                <div className={cn('flex space-x-3', isRTL && 'space-x-reverse')}>
                  <button
                    onClick={handleBulkExport}
                    className="flex items-center px-3 py-1 bg-yellow-600 text-black rounded-lg hover:bg-yellow-700 text-sm transition-colors"
                  >
                    <FontAwesomeIcon icon={faDownload} className={cn('h-3 w-3', isRTL ? 'ml-1' : 'mr-1')} />
                    {isRTL ? 'تصدير' : 'Export'}
                  </button>
                  <button
                    onClick={handleBulkFlag}
                    className="flex items-center px-3 py-1 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm transition-colors"
                  >
                    <FontAwesomeIcon icon={faFlag} className={cn('h-3 w-3', isRTL ? 'ml-1' : 'mr-1')} />
                    {isRTL ? 'وضع علامة' : 'Flag'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bookings Table */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg">
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                {isRTL ? 'قائمة الحجوزات' : 'Bookings List'}
              </h3>
              <span className="text-gray-400 text-sm">
                {filteredBookings.length} {isRTL ? 'من' : 'of'} {bookings.length} {isRTL ? 'حجز' : 'bookings'}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3">
                    <input
                      type="checkbox"
                      checked={selectedBookings.length === filteredBookings.length && filteredBookings.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-600 bg-gray-700 text-blue-600"
                    />
                  </th>
                  <th className={cn('px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider', isRTL ? 'text-right' : 'text-left')}>
                    {isRTL ? 'معرف الحجز' : 'Booking ID'}
                  </th>
                  <th className={cn('px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider', isRTL ? 'text-right' : 'text-left')}>
                    {isRTL ? 'المعدة' : 'Equipment'}
                  </th>
                  <th className={cn('px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider', isRTL ? 'text-right' : 'text-left')}>
                    {isRTL ? 'المالك' : 'Owner'}
                  </th>
                  <th className={cn('px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider', isRTL ? 'text-right' : 'text-left')}>
                    {isRTL ? 'المستأجر' : 'Renter'}
                  </th>
                  <th className={cn('px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider', isRTL ? 'text-right' : 'text-left')}>
                    {isRTL ? 'السائق' : 'Driver'}
                  </th>
                  <th className={cn('px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider', isRTL ? 'text-right' : 'text-left')}>
                    {isRTL ? 'تواريخ الحجز' : 'Booking Dates'}
                  </th>
                  <th className={cn('px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider', isRTL ? 'text-right' : 'text-left')}>
                    {isRTL ? 'الحالة' : 'Status'}
                  </th>
                  <th className={cn('px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider', isRTL ? 'text-right' : 'text-left')}>
                    {isRTL ? 'المبلغ الإجمالي' : 'Total Amount'}
                  </th>
                  <th className={cn('px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider', isRTL ? 'text-right' : 'text-left')}>
                    {isRTL ? 'الإجراءات' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedBookings.includes(booking.id)}
                        onChange={() => handleSelectBooking(booking.id)}
                        className="rounded border-gray-600 bg-gray-700 text-blue-600"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-blue-400">{booking.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img 
                          src={booking.equipment.thumbnail} 
                          alt={booking.equipment.name}
                          className="h-12 w-16 object-cover rounded-lg border border-gray-600"
                        />
                        <div className={cn('', isRTL ? 'mr-3' : 'ml-3')}>
                          <div className="text-sm font-medium text-white">{booking.equipment.name}</div>
                          <div className="text-xs text-gray-400">{booking.equipment.model}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-white">{booking.ownerName}</div>
                        <div className="text-xs text-gray-400 flex items-center">
                          <FontAwesomeIcon icon={faBuilding} className={cn('h-3 w-3', isRTL ? 'ml-1' : 'mr-1')} />
                          {booking.ownerCompany}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-white">{booking.renterName}</div>
                        <div className="text-xs text-gray-400 flex items-center">
                          <FontAwesomeIcon icon={faBuilding} className={cn('h-3 w-3', isRTL ? 'ml-1' : 'mr-1')} />
                          {booking.renterCompany}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {booking.driver ? (
                        <div>
                          <div className="text-sm text-white">{booking.driver.name}</div>
                          <div className="text-xs text-gray-400">⭐ {booking.driver.rating}</div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">{isRTL ? 'بدون سائق' : 'No driver'}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm text-white">{formatDate(booking.startDate)} - {formatDate(booking.endDate)}</div>
                        <div className="text-xs text-gray-400 flex items-center">
                          <FontAwesomeIcon icon={faMapMarkerAlt} className={cn('h-3 w-3', isRTL ? 'ml-1' : 'mr-1')} />
                          {booking.city}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        {getStatusBadge(booking.status)}
                        {getPaymentStatusBadge(booking.paymentStatus)}
                        {booking.extensionRequests > 0 && (
                          <span className="text-xs text-orange-400">
                            {booking.extensionRequests} {isRTL ? 'طلب تمديد' : 'extension req.'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-white">{formatCurrency(booking.totalAmount)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={cn('flex space-x-1', isRTL && 'space-x-reverse')}>
                        <button
                          className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                          title={isRTL ? 'عرض' : 'View'}
                        >
                          <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
                        </button>
                        <button
                          className="p-2 text-green-400 hover:text-green-300 transition-colors"
                          title={isRTL ? 'تمديد' : 'Extend'}
                        >
                          <FontAwesomeIcon icon={faExpand} className="h-4 w-4" />
                        </button>
                        <button
                          className="p-2 text-orange-400 hover:text-orange-300 transition-colors"
                          title={isRTL ? 'وضع علامة' : 'Flag'}
                        >
                          <FontAwesomeIcon icon={faFlag} className="h-4 w-4" />
                        </button>
                        <button
                          className="p-2 text-purple-400 hover:text-purple-300 transition-colors"
                          title={isRTL ? 'تحديد كمكتمل' : 'Mark as Completed'}
                        >
                          <FontAwesomeIcon icon={faCheck} className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredBookings.length === 0 && (
            <div className="text-center py-12">
              <FontAwesomeIcon icon={faCalendarAlt} className="h-12 w-12 text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">
                {isRTL ? 'لا توجد حجوزات' : 'No bookings found'}
              </h3>
              <p className="text-gray-500">
                {isRTL ? 'لا توجد حجوزات تطابق المعايير المحددة' : 'No bookings match the selected criteria'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingsManagement; 