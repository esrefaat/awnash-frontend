'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarAlt,
  faPlay,
  faTruck,
  faUserCheck,
  faDollarSign,
  faChartLine,
  faMapMarkerAlt,
  faUsers,
  faBuilding,
  faExclamationTriangle,
  faRocket,
  faFlag,
  faEye,
  faArrowUp,
  faArrowDown,
  faFileAlt,
  faIdCard,
  faClock,
  faShieldAlt,
  faCheckCircle,
  faTimesCircle,
  faHeart,
  faChartPie,
  faChartBar,
  faStar,
  faPlus,
  faSearch,
  faFilter
} from '@fortawesome/free-solid-svg-icons';
import { cn } from '@/lib/utils';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Interfaces
interface DashboardStats {
  totalBookings: number;
  activeRentals: number;
  equipmentListed: number;
  verifiedOwners: number;
  monthlyRevenue: number;
  avgBookingValue: number;
  bookingsTrend: number;
  rentalsTrend: number;
  equipmentTrend: number;
  ownersTrend: number;
  revenueTrend: number;
  avgBookingTrend: number;
}

interface RecentBooking {
  id: string;
  equipmentName: string;
  renterName: string;
  amount: number;
  status: string;
  date: string;
}

interface NewUser {
  id: string;
  name: string;
  type: 'owner' | 'renter';
  joinDate: string;
  verified: boolean;
}

interface ExpiringDocument {
  id: string;
  ownerName: string;
  documentType: string;
  expiryDate: string;
  daysLeft: number;
}

const Dashboard: React.FC = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  // Mock data for the dashboard
  const [stats] = useState<DashboardStats>({
    totalBookings: 1247,
    activeRentals: 89,
    equipmentListed: 456,
    verifiedOwners: 78,
    monthlyRevenue: 2840000,
    avgBookingValue: 22780,
    bookingsTrend: 12.5,
    rentalsTrend: 8.3,
    equipmentTrend: 15.7,
    ownersTrend: 6.2,
    revenueTrend: 18.9,
    avgBookingTrend: 4.1
  });

  // Daily bookings chart data
  const dailyBookingsData = [
    { date: '01', bookings: 12, revenue: 45000 },
    { date: '02', bookings: 8, revenue: 32000 },
    { date: '03', bookings: 15, revenue: 67000 },
    { date: '04', bookings: 22, revenue: 89000 },
    { date: '05', bookings: 18, revenue: 71000 },
    { date: '06', bookings: 25, revenue: 95000 },
    { date: '07', bookings: 20, revenue: 78000 },
    { date: '08', bookings: 28, revenue: 112000 },
    { date: '09', bookings: 24, revenue: 98000 },
    { date: '10', bookings: 32, revenue: 125000 },
    { date: '11', bookings: 29, revenue: 108000 },
    { date: '12', bookings: 35, revenue: 142000 },
    { date: '13', bookings: 31, revenue: 119000 },
    { date: '14', bookings: 27, revenue: 103000 },
    { date: '15', bookings: 38, revenue: 156000 },
    { date: '16', bookings: 34, revenue: 138000 },
    { date: '17', bookings: 41, revenue: 167000 },
    { date: '18', bookings: 37, revenue: 151000 },
    { date: '19', bookings: 33, revenue: 134000 },
    { date: '20', bookings: 45, revenue: 189000 },
    { date: '21', bookings: 42, revenue: 172000 },
    { date: '22', bookings: 39, revenue: 158000 },
    { date: '23', bookings: 48, revenue: 198000 },
    { date: '24', bookings: 44, revenue: 181000 },
    { date: '25', bookings: 52, revenue: 215000 },
    { date: '26', bookings: 49, revenue: 202000 },
    { date: '27', bookings: 46, revenue: 187000 },
    { date: '28', bookings: 55, revenue: 228000 },
    { date: '29', bookings: 51, revenue: 209000 },
    { date: '30', bookings: 58, revenue: 245000 }
  ];

  // Equipment categories pie chart data
  const equipmentCategoriesData = [
    { name: isRTL ? 'الحفارات' : 'Excavators', value: 35, color: '#3B82F6' },
    { name: isRTL ? 'الرافعات' : 'Cranes', value: 28, color: '#10B981' },
    { name: isRTL ? 'الجرافات' : 'Bulldozers', value: 22, color: '#F59E0B' },
    { name: isRTL ? 'الشاحنات' : 'Trucks', value: 15, color: '#EF4444' }
  ];

  // Top cities bar chart data
  const topCitiesData = [
    { city: isRTL ? 'الرياض' : 'Riyadh', bookings: 245, revenue: 890000 },
    { city: isRTL ? 'دبي' : 'Dubai', bookings: 198, revenue: 720000 },
    { city: isRTL ? 'الدوحة' : 'Doha', bookings: 167, revenue: 610000 },
    { city: isRTL ? 'الكويت' : 'Kuwait City', bookings: 134, revenue: 480000 },
    { city: isRTL ? 'المنامة' : 'Manama', bookings: 89, revenue: 320000 }
  ];

  const recentBookings: RecentBooking[] = [
    {
      id: 'BK-2024-001',
      equipmentName: 'CAT 320D Excavator',
      renterName: 'Ahmed Al-Mansouri',
      amount: 18500,
      status: 'confirmed',
      date: '2024-06-20T10:30:00Z'
    },
    {
      id: 'BK-2024-002',
      equipmentName: 'Liebherr LTM 1100 Crane',
      renterName: 'Fatima Al-Zahra',
      amount: 45000,
      status: 'active',
      date: '2024-06-20T09:15:00Z'
    },
    {
      id: 'BK-2024-003',
      equipmentName: 'Komatsu D85 Bulldozer',
      renterName: 'Omar Al-Sabah',
      amount: 22000,
      status: 'completed',
      date: '2024-06-19T16:45:00Z'
    },
    {
      id: 'BK-2024-004',
      equipmentName: 'Volvo A40G Dump Truck',
      renterName: 'Sara Al-Khalifa',
      amount: 15750,
      status: 'pending',
      date: '2024-06-19T14:20:00Z'
    },
    {
      id: 'BK-2024-005',
      equipmentName: 'JCB 540-200 Telehandler',
      renterName: 'Hassan Al-Kuwari',
      amount: 8900,
      status: 'cancelled',
      date: '2024-06-19T11:30:00Z'
    }
  ];

  const newUsers: NewUser[] = [
    {
      id: 'USR-001',
      name: 'Mohammed Al-Rashid',
      type: 'owner',
      joinDate: '2024-06-20',
      verified: true
    },
    {
      id: 'USR-002',
      name: 'Layla Al-Qasimi',
      type: 'renter',
      joinDate: '2024-06-20',
      verified: false
    },
    {
      id: 'USR-003',
      name: 'Khalid Al-Thani',
      type: 'owner',
      joinDate: '2024-06-19',
      verified: true
    },
    {
      id: 'USR-004',
      name: 'Amina Al-Kuwari',
      type: 'renter',
      joinDate: '2024-06-19',
      verified: true
    },
    {
      id: 'USR-005',
      name: 'Nasser Al-Mansouri',
      type: 'owner',
      joinDate: '2024-06-18',
      verified: false
    }
  ];

  const expiringDocuments: ExpiringDocument[] = [
    {
      id: 'DOC-001',
      ownerName: 'Ahmed Al-Rashid Equipment',
      documentType: 'Commercial License',
      expiryDate: '2024-06-25',
      daysLeft: 5
    },
    {
      id: 'DOC-002',
      ownerName: 'Gulf Heavy Machinery',
      documentType: 'Insurance Certificate',
      expiryDate: '2024-06-28',
      daysLeft: 8
    },
    {
      id: 'DOC-003',
      ownerName: 'Emirates Lifting Solutions',
      documentType: 'Safety Certification',
      expiryDate: '2024-07-02',
      daysLeft: 12
    },
    {
      id: 'DOC-004',
      ownerName: 'Kuwait Equipment Rental',
      documentType: 'Operating Permit',
      expiryDate: '2024-07-05',
      daysLeft: 15
    }
  ];

  // Helper functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateOnly = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      confirmed: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      completed: 'bg-purple-100 text-purple-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    
    const labels = {
      confirmed: isRTL ? 'مؤكد' : 'Confirmed',
      active: isRTL ? 'نشط' : 'Active',
      completed: isRTL ? 'مكتمل' : 'Completed',
      pending: isRTL ? 'معلق' : 'Pending',
      cancelled: isRTL ? 'ملغي' : 'Cancelled'
    };

    return (
      <span className={cn('px-2 py-1 rounded-full text-xs font-medium', styles[status as keyof typeof styles])}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getTrendIcon = (trend: number) => {
    return trend >= 0 ? (
      <FontAwesomeIcon icon={faArrowUp} className="h-3 w-3 text-green-500" />
    ) : (
      <FontAwesomeIcon icon={faArrowDown} className="h-3 w-3 text-red-500" />
    );
  };

  const getTrendColor = (trend: number) => {
    return trend >= 0 ? 'text-green-500' : 'text-red-500';
  };

  return (
    <div className={cn("min-h-screen bg-gray-900 p-6", isRTL ? 'font-arabic' : 'font-montserrat')} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-white">
              {isRTL ? 'لوحة التحكم الرئيسية' : 'Dashboard Overview'}
            </h1>
            <p className="text-gray-400 mt-1">
              {isRTL ? 'نظرة سريعة على نشاط المنصة وأداء الإيجارات والرؤى التشغيلية' : 'Quick snapshot of platform activity, rental performance, and operational insights'}
            </p>
          </div>
          <div className="flex gap-4">
            <button className="flex items-center px-6 py-2 bg-awnash-primary hover:bg-awnash-primary-hover text-black rounded-2xl font-medium transition-all shadow-lg hover:shadow-xl">
              <FontAwesomeIcon icon={faRocket} className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
              {isRTL ? 'إطلاق حملة' : 'Launch Campaign'}
            </button>
            <button className="flex items-center px-6 py-2 bg-awnash-accent hover:bg-awnash-accent-hover text-white rounded-2xl font-medium transition-all shadow-lg hover:shadow-xl">
              <FontAwesomeIcon icon={faMapMarkerAlt} className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
              {isRTL ? 'الخريطة المباشرة' : 'Live Map'}
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{isRTL ? 'إجمالي الحجوزات' : 'Total Bookings'}</p>
                <p className="text-2xl font-bold text-white">{stats.totalBookings.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  {getTrendIcon(stats.bookingsTrend)}
                  <span className={cn('text-xs ml-1', getTrendColor(stats.bookingsTrend))}>
                    {Math.abs(stats.bookingsTrend)}%
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-awnash-accent rounded-2xl flex items-center justify-center">
                <FontAwesomeIcon icon={faCalendarAlt} className="text-white h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{isRTL ? 'الإيجارات النشطة' : 'Active Rentals'}</p>
                <p className="text-2xl font-bold text-green-400">{stats.activeRentals}</p>
                <div className="flex items-center mt-1">
                  {getTrendIcon(stats.rentalsTrend)}
                  <span className={cn('text-xs ml-1', getTrendColor(stats.rentalsTrend))}>
                    {Math.abs(stats.rentalsTrend)}%
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center">
                <FontAwesomeIcon icon={faPlay} className="text-white h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{isRTL ? 'المعدات المدرجة' : 'Equipment Listed'}</p>
                <p className="text-2xl font-bold text-purple-400">{stats.equipmentListed}</p>
                <div className="flex items-center mt-1">
                  {getTrendIcon(stats.equipmentTrend)}
                  <span className={cn('text-xs ml-1', getTrendColor(stats.equipmentTrend))}>
                    {Math.abs(stats.equipmentTrend)}%
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center">
                <FontAwesomeIcon icon={faTruck} className="text-white h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{isRTL ? 'الملاك المعتمدون' : 'Verified Owners'}</p>
                <p className="text-2xl font-bold text-orange-400">{stats.verifiedOwners}</p>
                <div className="flex items-center mt-1">
                  {getTrendIcon(stats.ownersTrend)}
                  <span className={cn('text-xs ml-1', getTrendColor(stats.ownersTrend))}>
                    {Math.abs(stats.ownersTrend)}%
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center">
                <FontAwesomeIcon icon={faUserCheck} className="text-white h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{isRTL ? 'الإيرادات الشهرية' : 'Monthly Revenue'}</p>
                <p className="text-lg font-bold text-awnash-primary">{formatCurrency(stats.monthlyRevenue)}</p>
                <div className="flex items-center mt-1">
                  {getTrendIcon(stats.revenueTrend)}
                  <span className={cn('text-xs ml-1', getTrendColor(stats.revenueTrend))}>
                    {Math.abs(stats.revenueTrend)}%
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-awnash-primary rounded-2xl flex items-center justify-center">
                <FontAwesomeIcon icon={faDollarSign} className="text-black h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{isRTL ? 'متوسط قيمة الحجز' : 'Avg. Booking Value'}</p>
                <p className="text-lg font-bold text-indigo-400">{formatCurrency(stats.avgBookingValue)}</p>
                <div className="flex items-center mt-1">
                  {getTrendIcon(stats.avgBookingTrend)}
                  <span className={cn('text-xs ml-1', getTrendColor(stats.avgBookingTrend))}>
                    {Math.abs(stats.avgBookingTrend)}%
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center">
                <FontAwesomeIcon icon={faChartLine} className="text-white h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Daily Bookings Line Chart */}
          <div className="lg:col-span-2 bg-gray-800 rounded-2xl border border-gray-700 p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">
                {isRTL ? 'الحجوزات اليومية خلال آخر 30 يوم' : 'Daily Bookings (Last 30 Days)'}
              </h3>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-awnash-accent text-white rounded-xl text-sm font-medium">
                  {isRTL ? 'الحجوزات' : 'Bookings'}
                </button>
                <button className="px-4 py-2 bg-gray-600 text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-500 transition-colors">
                  {isRTL ? 'الإيرادات' : 'Revenue'}
                </button>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyBookingsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F3F4F6'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="bookings" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Equipment Categories Pie Chart */}
          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-white mb-6">
              {isRTL ? 'فئات المعدات المؤجرة' : 'Equipment Categories Rented'}
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={equipmentCategoriesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {equipmentCategoriesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {equipmentCategoriesData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className={`w-3 h-3 rounded-full ${isRTL ? 'ml-2' : 'mr-2'}`} 
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-sm text-gray-300">{item.name}</span>
                  </div>
                  <span className="text-sm text-white font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Cities Bar Chart */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-6">
            {isRTL ? 'أفضل المدن أداءً' : 'Top Performing Cities'}
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topCitiesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="city" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }}
                />
                <Bar 
                  dataKey="bookings" 
                  fill="#3B82F6" 
                  radius={[4, 4, 0, 0]}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={(data, index) => {
                    // Custom hover effect handled by recharts internally
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tables Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Bookings */}
          <div className="bg-gray-800 rounded-xl border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  {isRTL ? 'الحجوزات الأخيرة' : 'Recent Bookings'}
                </h3>
                <button className="text-blue-400 hover:text-blue-300 text-sm">
                  {isRTL ? 'عرض الكل' : 'View All'}
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">{booking.equipmentName}</div>
                    <div className="text-xs text-gray-400">{booking.renterName}</div>
                    <div className="text-xs text-gray-500">{formatDate(booking.date)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-white">{formatCurrency(booking.amount)}</div>
                    <div className="mt-1">{getStatusBadge(booking.status)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* New Users This Week */}
          <div className="bg-gray-800 rounded-xl border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  {isRTL ? 'المستخدمون الجدد هذا الأسبوع' : 'New Users This Week'}
                </h3>
                <button className="text-blue-400 hover:text-blue-300 text-sm">
                  {isRTL ? 'عرض الكل' : 'View All'}
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {newUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <FontAwesomeIcon icon={user.type === 'owner' ? faBuilding : faUsers} className="text-white h-3 w-3" />
                    </div>
                    <div className={cn('', isRTL ? 'mr-3' : 'ml-3')}>
                      <div className="text-sm font-medium text-white">{user.name}</div>
                      <div className="text-xs text-gray-400">{user.type === 'owner' ? (isRTL ? 'مالك' : 'Owner') : (isRTL ? 'مستأجر' : 'Renter')}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {user.verified && (
                      <FontAwesomeIcon icon={faCheckCircle} className="h-4 w-4 text-green-400" />
                    )}
                    <span className={`text-xs text-gray-500 ${isRTL ? 'mr-2' : 'ml-2'}`}>{formatDateOnly(user.joinDate)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Expiring Documents */}
          <div className="bg-gray-800 rounded-xl border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  {isRTL ? 'الوثائق منتهية الصلاحية' : 'Expiring Documents'}
                </h3>
                <button className="text-yellow-400 hover:text-yellow-300 text-sm">
                  {isRTL ? 'عرض الكل' : 'View All'}
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {expiringDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={cn('w-8 h-8 rounded-full flex items-center justify-center', 
                      doc.daysLeft <= 7 ? 'bg-red-600' : doc.daysLeft <= 14 ? 'bg-yellow-600' : 'bg-orange-600')}>
                      <FontAwesomeIcon icon={faFileAlt} className="text-white h-3 w-3" />
                    </div>
                    <div className={cn('', isRTL ? 'mr-3' : 'ml-3')}>
                      <div className="text-sm font-medium text-white">{doc.ownerName}</div>
                      <div className="text-xs text-gray-400">{doc.documentType}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={cn('text-sm font-medium', 
                      doc.daysLeft <= 7 ? 'text-red-400' : doc.daysLeft <= 14 ? 'text-yellow-400' : 'text-orange-400')}>
                      {doc.daysLeft} {isRTL ? 'يوم' : 'days'}
                    </div>
                    <div className="text-xs text-gray-500">{formatDateOnly(doc.expiryDate)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-6">
            {isRTL ? 'إجراءات سريعة' : 'Quick Actions'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="flex items-center p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <FontAwesomeIcon icon={faRocket} className={cn('h-5 w-5', isRTL ? 'ml-3' : 'mr-3')} />
              <div className={`text-${isRTL ? 'right' : 'left'}`}>
                <div className="font-medium">{isRTL ? 'إطلاق حملة' : 'Launch Campaign'}</div>
                <div className="text-xs opacity-80">{isRTL ? 'حملة تسويقية جديدة' : 'New marketing campaign'}</div>
              </div>
            </button>

            <button className="flex items-center p-4 bg-yellow-600 text-black rounded-lg hover:bg-yellow-700 transition-colors">
              <FontAwesomeIcon icon={faFlag} className={cn('h-5 w-5', isRTL ? 'ml-3' : 'mr-3')} />
              <div className={`text-${isRTL ? 'right' : 'left'}`}>
                <div className="font-medium">{isRTL ? 'الإيجارات المعلمة' : 'Flagged Rentals'}</div>
                <div className="text-xs opacity-80">{isRTL ? 'مراجعة المشاكل' : 'Review issues'}</div>
              </div>
            </button>

            <button className="flex items-center p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <FontAwesomeIcon icon={faMapMarkerAlt} className={cn('h-5 w-5', isRTL ? 'ml-3' : 'mr-3')} />
              <div className={`text-${isRTL ? 'right' : 'left'}`}>
                <div className="font-medium">{isRTL ? 'مراقبة الخريطة المباشرة' : 'Monitor Live Map'}</div>
                <div className="text-xs opacity-80">{isRTL ? 'عرض الإيجارات النشطة' : 'View active rentals'}</div>
              </div>
            </button>

            <button className="flex items-center p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              <FontAwesomeIcon icon={faChartLine} className={cn('h-5 w-5', isRTL ? 'ml-3' : 'mr-3')} />
              <div className={`text-${isRTL ? 'right' : 'left'}`}>
                <div className="font-medium">{isRTL ? 'تقارير التحليلات' : 'Analytics Reports'}</div>
                <div className="text-xs opacity-80">{isRTL ? 'إحصائيات مفصلة' : 'Detailed insights'}</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 