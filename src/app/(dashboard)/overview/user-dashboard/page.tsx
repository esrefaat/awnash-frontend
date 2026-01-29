'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faToggleOn,
  faToggleOff,
  faTruck,
  faCalendarCheck,
  faFileAlt,
  faDollarSign,
  faCheckCircle,
  faTimesCircle,
  faClock,
  faExclamationTriangle,
  faPlus,
  faUpload,
  faSearch,
  faEye,
  faEdit,
  faMapMarkerAlt,
  faCalendarAlt,
  faThumbsUp,
  faArrowUp,
  faArrowDown,
  faBell,
  faShieldAlt,
  faWrench,
  faHandshake,
  faChartLine,
  faFlag
} from '@fortawesome/free-solid-svg-icons';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

// Types
interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  roles: ('owner' | 'renter')[];
  profilePicture?: string;
  verificationStatus: 'verified' | 'pending' | 'incomplete';
  joinDate: string;
}

interface BookingSummary {
  activeBookings: number;
  totalRentals: number;
  pendingOffers: number;
  totalSpent: number;
  upcomingBookings: number;
}

interface OwnerSummary {
  activeEquipment: number;
  totalRevenue: number;
  rentalsInProgress: number;
  documentsVerified: number;
  totalEquipment: number;
  pendingVerification: number;
}

interface RecentBooking {
  id: string;
  equipmentName: string;
  ownerName: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'confirmed' | 'completed' | 'cancelled';
  amount: number;
  location: string;
}

interface EquipmentItem {
  id: string;
  name: string;
  category: string;
  status: 'available' | 'booked' | 'maintenance';
  dailyRate: number;
  totalBookings: number;
  revenue: number;
  location: string;
  documentStatus: 'verified' | 'pending' | 'expired';
}

interface Offer {
  id: string;
  equipmentName: string;
  renterName: string;
  amount: number;
  duration: number;
  status: 'pending' | 'accepted' | 'rejected';
  date: string;
}

const UserDashboard: React.FC = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  // Mock user data
  const [user] = useState<UserProfile>({
    id: 'user-001',
    name: 'Ahmed Al-Mansouri',
    email: 'ahmed.almansouri@example.com',
    phone: '+971 50 123 4567',
    roles: ['owner', 'renter'],
    verificationStatus: 'verified',
    joinDate: '2024-01-15'
  });

  const [currentRole, setCurrentRole] = useState<'owner' | 'renter'>('renter');
  
  // Summary data
  const [renterSummary] = useState<BookingSummary>({
    activeBookings: 3,
    totalRentals: 27,
    pendingOffers: 5,
    totalSpent: 125000,
    upcomingBookings: 2
  });

  const [ownerSummary] = useState<OwnerSummary>({
    activeEquipment: 8,
    totalRevenue: 340000,
    rentalsInProgress: 5,
    documentsVerified: 7,
    totalEquipment: 12,
    pendingVerification: 1
  });

  // Recent activity data
  const [recentBookings] = useState<RecentBooking[]>([
    {
      id: 'BK-001',
      equipmentName: 'CAT 320D Excavator',
      ownerName: 'Omar Al-Sabah',
      startDate: '2024-06-22',
      endDate: '2024-06-29',
      status: 'active',
      amount: 18500,
      location: 'Dubai Industrial City'
    },
    {
      id: 'BK-002',
      equipmentName: 'Liebherr LTM 1100 Crane',
      ownerName: 'Fatima Al-Zahra',
      startDate: '2024-06-20',
      endDate: '2024-06-27',
      status: 'confirmed',
      amount: 45000,
      location: 'Abu Dhabi Port'
    },
    {
      id: 'BK-003',
      equipmentName: 'Komatsu D85 Bulldozer',
      ownerName: 'Hassan Al-Khalil',
      startDate: '2024-06-15',
      endDate: '2024-06-22',
      status: 'completed',
      amount: 22000,
      location: 'Sharjah Free Zone'
    }
  ]);

  const [myEquipment] = useState<EquipmentItem[]>([
    {
      id: 'EQ-001',
      name: 'CAT 330 Excavator',
      category: 'Excavators',
      status: 'booked',
      dailyRate: 2200,
      totalBookings: 15,
      revenue: 67500,
      location: 'Riyadh Industrial',
      documentStatus: 'verified'
    },
    {
      id: 'EQ-002',
      name: 'Volvo A40G Dump Truck',
      category: 'Trucks',
      status: 'available',
      dailyRate: 1800,
      totalBookings: 8,
      revenue: 28000,
      location: 'Kuwait City',
      documentStatus: 'verified'
    },
    {
      id: 'EQ-003',
      name: 'JCB 540-200 Telehandler',
      category: 'Telehandlers',
      status: 'maintenance',
      dailyRate: 950,
      totalBookings: 12,
      revenue: 22800,
      location: 'Doha Port',
      documentStatus: 'pending'
    }
  ]);

  const [recentOffers] = useState<Offer[]>([
    {
      id: 'OF-001',
      equipmentName: 'CAT 330 Excavator',
      renterName: 'Sara Al-Khalifa',
      amount: 15000,
      duration: 7,
      status: 'pending',
      date: '2024-06-20'
    },
    {
      id: 'OF-002',
      equipmentName: 'Volvo A40G Dump Truck',
      renterName: 'Mohammed Al-Kuwari',
      amount: 12000,
      duration: 5,
      status: 'accepted',
      date: '2024-06-19'
    }
  ]);



  // Helper functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-500', text: isRTL ? 'نشط' : 'Active' },
      confirmed: { color: 'bg-blue-500', text: isRTL ? 'مؤكد' : 'Confirmed' },
      completed: { color: 'bg-purple-500', text: isRTL ? 'مكتمل' : 'Completed' },
      cancelled: { color: 'bg-red-500', text: isRTL ? 'ملغي' : 'Cancelled' },
      available: { color: 'bg-green-500', text: isRTL ? 'متاح' : 'Available' },
      booked: { color: 'bg-blue-500', text: isRTL ? 'محجوز' : 'Booked' },
      maintenance: { color: 'bg-yellow-500', text: isRTL ? 'صيانة' : 'Maintenance' },
      pending: { color: 'bg-yellow-500', text: isRTL ? 'قيد الانتظار' : 'Pending' },
      accepted: { color: 'bg-green-500', text: isRTL ? 'مقبول' : 'Accepted' },
      rejected: { color: 'bg-red-500', text: isRTL ? 'مرفوض' : 'Rejected' },
      verified: { color: 'bg-green-500', text: isRTL ? 'مُتحقق' : 'Verified' },
      expired: { color: 'bg-red-500', text: isRTL ? 'منتهي' : 'Expired' }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span className={cn(`px-2 py-1 rounded-full text-xs font-medium text-white`, config.color)}>
        {config.text}
      </span>
    );
  };

  const canSwitchRoles = user.roles.length > 1;

  return (
    <div className={cn("min-h-screen bg-gray-900", isRTL ? 'font-arabic' : 'font-montserrat')} dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Role Toggle - Move to top of content */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between mb-6">
          {/* Welcome Section */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon={faUser} className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                {isRTL ? `مرحباً، ${user.name}` : `Welcome, ${user.name}`}
              </h1>
              <div className="flex items-center gap-2">
                <span className={cn('px-2 py-1 rounded-full text-xs font-medium text-black', 
                  currentRole === 'owner' ? 'bg-yellow-500' : 'bg-blue-500')}>
                  {currentRole === 'owner' 
                    ? (isRTL ? 'مالك المعدات' : 'Equipment Owner')
                    : (isRTL ? 'مستأجر' : 'Renter')
                  }
                </span>
                {user.verificationStatus === 'verified' && (
                  <FontAwesomeIcon icon={faCheckCircle} className="h-4 w-4 text-green-500" />
                )}
              </div>
            </div>
          </div>

          {/* Role Toggle */}
          {canSwitchRoles && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-300">
                {isRTL ? 'عرض كـ:' : 'View as:'}
              </span>
              <button
                onClick={() => setCurrentRole(currentRole === 'owner' ? 'renter' : 'owner')}
                className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                <FontAwesomeIcon 
                  icon={currentRole === 'owner' ? faToggleOn : faToggleOff} 
                  className="h-4 w-4 text-blue-500" 
                />
                <span className="text-sm text-white">
                  {currentRole === 'owner' 
                    ? (isRTL ? 'مالك' : 'Owner')
                    : (isRTL ? 'مستأجر' : 'Renter')
                  }
                </span>
              </button>
            </div>
          )}
        </div>
              {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {currentRole === 'renter' ? (
            <>
              {/* Active Bookings */}
              <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">
                      {isRTL ? 'الحجوزات النشطة' : 'Active Bookings'}
                    </p>
                    <p className="text-2xl font-bold text-white">{renterSummary.activeBookings}</p>
                  </div>
                  <div className="w-12 h-12 bg-awnash-accent rounded-2xl flex items-center justify-center">
                    <FontAwesomeIcon icon={faCalendarCheck} className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <FontAwesomeIcon icon={faArrowUp} className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-500">
                    {isRTL ? '+2 هذا الأسبوع' : '+2 this week'}
                  </span>
                </div>
              </div>

              {/* Total Rentals */}
              <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">
                      {isRTL ? 'إجمالي الإيجارات' : 'Total Rentals'}
                    </p>
                    <p className="text-2xl font-bold text-white">{renterSummary.totalRentals}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center">
                    <FontAwesomeIcon icon={faTruck} className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>

              {/* Pending Offers */}
              <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">
                      {isRTL ? 'العروض المعلقة' : 'Pending Offers'}
                    </p>
                    <p className="text-2xl font-bold text-white">{renterSummary.pendingOffers}</p>
                  </div>
                  <div className="w-12 h-12 bg-awnash-primary rounded-2xl flex items-center justify-center">
                    <FontAwesomeIcon icon={faClock} className="h-6 w-6 text-black" />
                  </div>
                </div>
              </div>

              {/* Total Spent */}
              <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">
                      {isRTL ? 'إجمالي المصروفات' : 'Total Spent'}
                    </p>
                    <p className="text-2xl font-bold text-white">{formatCurrency(renterSummary.totalSpent)}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                    <FontAwesomeIcon icon={faDollarSign} className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Active Equipment */}
              <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">
                      {isRTL ? 'المعدات النشطة' : 'Active Equipment'}
                    </p>
                    <p className="text-2xl font-bold text-white">{ownerSummary.activeEquipment}</p>
                    <p className="text-xs text-gray-400">
                      {isRTL ? `من أصل ${ownerSummary.totalEquipment}` : `of ${ownerSummary.totalEquipment} total`}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                    <FontAwesomeIcon icon={faTruck} className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>

              {/* Total Revenue */}
              <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">
                      {isRTL ? 'إجمالي الإيرادات' : 'Total Revenue'}
                    </p>
                    <p className="text-2xl font-bold text-white">{formatCurrency(ownerSummary.totalRevenue)}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                    <FontAwesomeIcon icon={faDollarSign} className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <FontAwesomeIcon icon={faArrowUp} className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-500">
                    {isRTL ? '+18% هذا الشهر' : '+18% this month'}
                  </span>
                </div>
              </div>

              {/* Rentals In Progress */}
              <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">
                      {isRTL ? 'الإيجارات الجارية' : 'Rentals In Progress'}
                    </p>
                    <p className="text-2xl font-bold text-white">{ownerSummary.rentalsInProgress}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
                    <FontAwesomeIcon icon={faHandshake} className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>

              {/* Documents Verified */}
              <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">
                      {isRTL ? 'الوثائق المُتحققة' : 'Documents Verified'}
                    </p>
                    <p className="text-2xl font-bold text-white">{ownerSummary.documentsVerified}</p>
                    {ownerSummary.pendingVerification > 0 && (
                      <p className="text-xs text-yellow-500">
                        {isRTL ? `${ownerSummary.pendingVerification} في الانتظار` : `${ownerSummary.pendingVerification} pending`}
                      </p>
                    )}
                  </div>
                  <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center', 
                    ownerSummary.pendingVerification > 0 ? 'bg-yellow-500' : 'bg-green-600')}>
                    <FontAwesomeIcon 
                      icon={ownerSummary.pendingVerification > 0 ? faExclamationTriangle : faShieldAlt} 
                      className={cn('h-6 w-6', ownerSummary.pendingVerification > 0 ? 'text-black' : 'text-white')} 
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 shadow-lg mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">
            {isRTL ? 'الإجراءات السريعة' : 'Quick Actions'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {currentRole === 'renter' ? (
              <>
                <Button variant="accent" className="flex items-center gap-3 p-4 h-auto justify-start">
                  <FontAwesomeIcon icon={faSearch} className="h-5 w-5" />
                  <span className="font-medium">
                    {isRTL ? 'البحث عن معدات' : 'Request Equipment'}
                  </span>
                </Button>
                <Button variant="dark" className="flex items-center gap-3 p-4 h-auto justify-start">
                  <FontAwesomeIcon icon={faFileAlt} className="h-5 w-5" />
                  <span className="font-medium">
                    {isRTL ? 'حجوزاتي' : 'My Bookings'}
                  </span>
                </Button>
                <Button variant="dark" className="flex items-center gap-3 p-4 h-auto justify-start">
                  <FontAwesomeIcon icon={faUpload} className="h-5 w-5" />
                  <span className="font-medium">
                    {isRTL ? 'رفع الوثائق' : 'Upload Documents'}
                  </span>
                </Button>
              </>
            ) : (
              <>
                <Button variant="accent" className="flex items-center gap-3 p-4 h-auto justify-start">
                  <FontAwesomeIcon icon={faPlus} className="h-5 w-5" />
                  <span className="font-medium">
                    {isRTL ? 'إضافة معدة' : 'Add Equipment'}
                  </span>
                </Button>
                <Button variant="dark" className="flex items-center gap-3 p-4 h-auto justify-start">
                  <FontAwesomeIcon icon={faChartLine} className="h-5 w-5" />
                  <span className="font-medium">
                    {isRTL ? 'تقارير الإيرادات' : 'Revenue Reports'}
                  </span>
                </Button>
                <Button variant="default" className="flex items-center gap-3 p-4 h-auto justify-start">
                  <FontAwesomeIcon icon={faUpload} className="h-5 w-5" />
                  <span className="font-medium">
                    {isRTL ? 'رفع الوثائق' : 'Upload Documents'}
                  </span>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Tables/Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {currentRole === 'renter' ? (
            <>
              {/* Recent Bookings */}
              <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-white mb-4">
                  {isRTL ? 'الحجوزات الأخيرة' : 'Recent Bookings'}
                </h3>
                <div className="space-y-3">
                  {recentBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-white">{booking.equipmentName}</h4>
                        <p className="text-sm text-gray-400">{booking.ownerName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <FontAwesomeIcon icon={faMapMarkerAlt} className="h-3 w-3 text-gray-500" />
                          <span className="text-xs text-gray-500">{booking.location}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(booking.status)}
                        <p className="text-sm font-medium text-white mt-1">{formatCurrency(booking.amount)}</p>
                        <p className="text-xs text-gray-400">{formatDate(booking.startDate)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming Rentals */}
              <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-white mb-4">
                  {isRTL ? 'الإيجارات القادمة' : 'Upcoming Rentals'}
                </h3>
                <div className="space-y-3">
                  {recentBookings.filter(b => b.status === 'confirmed').map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-white">{booking.equipmentName}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <FontAwesomeIcon icon={faCalendarAlt} className="h-3 w-3 text-gray-500" />
                          <span className="text-xs text-gray-500">
                            {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="text-blue-400 hover:text-blue-300">
                          <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* My Equipment */}
              <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-white mb-4">
                  {isRTL ? 'معداتي' : 'My Equipment'}
                </h3>
                <div className="space-y-3">
                  {myEquipment.map((equipment) => (
                    <div key={equipment.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-white">{equipment.name}</h4>
                        <p className="text-sm text-gray-400">{equipment.category}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <FontAwesomeIcon icon={faMapMarkerAlt} className="h-3 w-3 text-gray-500" />
                          <span className="text-xs text-gray-500">{equipment.location}</span>
                          {equipment.documentStatus === 'pending' && (
                            <span className="px-1 py-0.5 bg-yellow-500 text-black text-xs rounded">
                              {isRTL ? 'وثائق معلقة' : 'Docs Pending'}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(equipment.status)}
                        <p className="text-sm font-medium text-white mt-1">{formatCurrency(equipment.revenue)}</p>
                        <p className="text-xs text-gray-400">{equipment.totalBookings} bookings</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Offers */}
              <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-white mb-4">
                  {isRTL ? 'العروض الواردة' : 'Recent Offers'}
                </h3>
                <div className="space-y-3">
                  {recentOffers.map((offer) => (
                    <div key={offer.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-white">{offer.equipmentName}</h4>
                        <p className="text-sm text-gray-400">{offer.renterName}</p>
                        <p className="text-xs text-gray-500">
                          {offer.duration} {isRTL ? 'أيام' : 'days'} • {formatDate(offer.date)}
                        </p>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(offer.status)}
                        <p className="text-sm font-medium text-white mt-1">{formatCurrency(offer.amount)}</p>
                        {offer.status === 'pending' && (
                          <div className="flex gap-1 mt-1">
                            <Button variant="success" size="sm" className="px-2 py-1 h-auto text-xs">
                              ✓
                            </Button>
                            <Button variant="destructive" size="sm" className="px-2 py-1 h-auto text-xs">
                              ✗
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard; 