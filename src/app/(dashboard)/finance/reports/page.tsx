'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDollarSign,
  faChartLine,
  faHandshake,
  faUsers,
  faExclamationTriangle,
  faDownload,
  faFilter,
  faCalendar,
  faSearch,
  faFileExcel,
  faFilePdf,
  faCog,
  faEye,
  faMoneyBillWave,
  faPercentage,
  faBuilding
} from '@fortawesome/free-solid-svg-icons';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { useChartTooltipStyle } from '@/hooks/useChartTooltipStyle';

interface BookingFinancial {
  id: string;
  equipmentName: string;
  ownerName: string;
  ownerId: string;
  renterName: string;
  renterId: string;
  bookingValue: number;
  commissionEarned: number;
  serviceFee: number;
  status: 'completed' | 'pending' | 'cancelled';
  date: string;
  category: string;
}

const CommissionReports: React.FC = () => {
  const router = useRouter();
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { contentStyle, labelStyle, itemStyle } = useChartTooltipStyle();
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '2024-01-01',
    end: '2024-12-31'
  });
  const [selectedOwner, setSelectedOwner] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(false);

  // Mock financial data
  const financialSummary = {
    totalRevenue: 2850000, // SAR
    totalCommission: 428500, // 15% average commission
    totalServiceFees: 142500, // 5% average service fee
    averageBookingValue: 18950,
    refundsIssued: 45000,
    penaltiesCollected: 23500,
    netProfit: 549000 // Commission + Service Fees - Refunds + Penalties
  };

  // Revenue trend data (last 12 months)
  const getMonthName = (month: string) => {
    const monthMap: { [key: string]: string } = {
      'Jan': isRTL ? 'يناير' : 'Jan',
      'Feb': isRTL ? 'فبراير' : 'Feb', 
      'Mar': isRTL ? 'مارس' : 'Mar',
      'Apr': isRTL ? 'أبريل' : 'Apr',
      'May': isRTL ? 'مايو' : 'May',
      'Jun': isRTL ? 'يونيو' : 'Jun',
      'Jul': isRTL ? 'يوليو' : 'Jul',
      'Aug': isRTL ? 'أغسطس' : 'Aug',
      'Sep': isRTL ? 'سبتمبر' : 'Sep',
      'Oct': isRTL ? 'أكتوبر' : 'Oct',
      'Nov': isRTL ? 'نوفمبر' : 'Nov',
      'Dec': isRTL ? 'ديسمبر' : 'Dec'
    };
    return monthMap[month] || month;
  };

  const revenueTrendData = [
    { month: getMonthName('Jan'), monthKey: 'Jan', revenue: 185000, commission: 27750, serviceFees: 9250 },
    { month: getMonthName('Feb'), monthKey: 'Feb', revenue: 220000, commission: 33000, serviceFees: 11000 },
    { month: getMonthName('Mar'), monthKey: 'Mar', revenue: 265000, commission: 39750, serviceFees: 13250 },
    { month: getMonthName('Apr'), monthKey: 'Apr', revenue: 195000, commission: 29250, serviceFees: 9750 },
    { month: getMonthName('May'), monthKey: 'May', revenue: 285000, commission: 42750, serviceFees: 14250 },
    { month: getMonthName('Jun'), monthKey: 'Jun', revenue: 320000, commission: 48000, serviceFees: 16000 },
    { month: getMonthName('Jul'), monthKey: 'Jul', revenue: 290000, commission: 43500, serviceFees: 14500 },
    { month: getMonthName('Aug'), monthKey: 'Aug', revenue: 275000, commission: 41250, serviceFees: 13750 },
    { month: getMonthName('Sep'), monthKey: 'Sep', revenue: 310000, commission: 46500, serviceFees: 15500 },
    { month: getMonthName('Oct'), monthKey: 'Oct', revenue: 345000, commission: 51750, serviceFees: 17250 },
    { month: getMonthName('Nov'), monthKey: 'Nov', revenue: 280000, commission: 42000, serviceFees: 14000 },
    { month: getMonthName('Dec'), monthKey: 'Dec', revenue: 365000, commission: 54750, serviceFees: 18250 }
  ];

  // Revenue breakdown by category
  const revenueBreakdownData = [
    { name: isRTL ? 'الحفارات' : 'Excavators', value: 35, amount: 997500, color: '#1E40AF' },
    { name: isRTL ? 'الرافعات' : 'Cranes', value: 28, amount: 798000, color: '#F59E0B' },
    { name: isRTL ? 'الجرافات' : 'Bulldozers', value: 20, amount: 570000, color: '#10B981' },
    { name: isRTL ? 'اللوادر' : 'Loaders', value: 10, amount: 285000, color: '#EF4444' },
    { name: isRTL ? 'النقل' : 'Transport', value: 7, amount: 199500, color: '#8B5CF6' }
  ];

  // Mock booking financial data
  const mockBookings: BookingFinancial[] = [
    {
      id: 'BK-2024-001',
      equipmentName: 'CAT 390F Excavator',
      ownerName: 'Al-Rashid Heavy Equipment',
      ownerId: 'o1',
      renterName: 'Gulf Construction LLC',
      renterId: 'r1',
      bookingValue: 28500,
      commissionEarned: 4275, // 15%
      serviceFee: 1425, // 5%
      status: 'completed',
      date: '2024-06-15',
      category: 'Excavators'
    },
    {
      id: 'BK-2024-002',
      equipmentName: 'Liebherr LTM 1100 Crane',
      ownerName: 'Emirates Lifting Solutions',
      ownerId: 'o2',
      renterName: 'Saudi Steel Works',
      renterId: 'r2',
      bookingValue: 45000,
      commissionEarned: 6750, // 15%
      serviceFee: 2250, // 5%
      status: 'completed',
      date: '2024-06-14',
      category: 'Cranes'
    },
    {
      id: 'BK-2024-003',
      equipmentName: 'CAT D8T Bulldozer',
      ownerName: 'Kuwait Heavy Machinery',
      ownerId: 'o3',
      renterName: 'Bahrain Infrastructure',
      renterId: 'r3',
      bookingValue: 32000,
      commissionEarned: 4800, // 15%
      serviceFee: 1600, // 5%
      status: 'pending',
      date: '2024-06-13',
      category: 'Bulldozers'
    },
    {
      id: 'BK-2024-004',
      equipmentName: 'JCB 540-200 Telehandler',
      ownerName: 'Qatar Equipment Rental',
      ownerId: 'o4',
      renterName: 'Dubai Port Authority',
      renterId: 'r4',
      bookingValue: 12500,
      commissionEarned: 1875, // 15%
      serviceFee: 625, // 5%
      status: 'completed',
      date: '2024-06-12',
      category: 'Loaders'
    }
  ];

  const StatCard = ({ title, value, subtitle, icon, color, bgColor, trend }: any) => (
    <div className={`bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-lg hover:shadow-xl transition-all ${isRTL ? 'text-right' : 'text-left'}`}>
      <div className="flex items-center justify-between">
        <div className={isRTL ? 'order-2' : 'order-1'}>
          <p className="text-sm font-medium text-gray-400 mb-2">{title}</p>
          <p className="text-3xl font-bold text-white mb-2">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-400">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center mt-2 ">
              <FontAwesomeIcon 
                icon={faChartLine} 
                className={`h-3 w-3 ${trend > 0 ? 'text-green-400' : 'text-red-400'} ${isRTL ? 'ml-1' : 'mr-1'}`}
              />
              <span className={`text-sm font-medium ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {Math.abs(trend)}%
              </span>
              <span className={`text-sm text-gray-500 ${isRTL ? 'mr-1' : 'ml-1'}`}>
                {isRTL ? 'مقارنة بالشهر الماضي' : 'vs last month'}
              </span>
            </div>
          )}
        </div>
        <div className={`flex h-16 w-16 items-center justify-center rounded-xl ${bgColor} ${isRTL ? 'order-1' : 'order-2'}`}>
          <FontAwesomeIcon icon={icon} className={`h-8 w-8 ${color}`} />
        </div>
      </div>
    </div>
  );

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium";
    switch (status.toLowerCase()) {
      case 'completed':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'cancelled':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Custom tooltip formatters for Arabic support
  const formatTooltipLabel = (label: string) => {
    return label;
  };

  const formatTooltipValue = (value: any, name: string) => {
    const arabicLabels: { [key: string]: string } = {
      'revenue': isRTL ? 'الإيرادات' : 'Revenue',
      'commission': isRTL ? 'العمولة' : 'Commission', 
      'serviceFees': isRTL ? 'رسوم الخدمة' : 'Service Fees'
    };
    
    return [
      formatCurrency(value),
      arabicLabels[name] || name
    ];
  };

  const exportToCSV = () => {
    const csvData = mockBookings.map(booking => ({
      'Booking ID': booking.id,
      'Equipment': booking.equipmentName,
      'Owner': booking.ownerName,
      'Renter': booking.renterName,
      'Booking Value': booking.bookingValue,
      'Commission': booking.commissionEarned,
      'Service Fee': booking.serviceFee,
      'Status': booking.status,
      'Date': booking.date
    }));
    
    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'commission-report.csv';
    a.click();
  };

  const exportToPDF = () => {
    // In a real app, this would generate a PDF report
    console.log('Exporting to PDF...');
  };

  return (
    <div className={`min-h-screen bg-gray-900 ${isRTL ? 'font-arabic' : 'font-montserrat'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {isRTL ? 'تقارير العمولات والمالية' : 'Commission & Financial Reports'}
            </h1>
            <p className="text-gray-400">
              {isRTL ? 'تتبع إيرادات المنصة والعمولات والمقاييس المالية الرئيسية' : 'Track platform revenue, commissions, and key financial metrics'}
            </p>
          </div>
          <div className="flex gap-3 mt-4 lg:mt-0 ">
            <button 
              onClick={exportToCSV}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors "
            >
              <FontAwesomeIcon icon={faFileExcel} className={isRTL ? 'ml-2' : 'mr-2'} />
              {isRTL ? 'تصدير CSV' : 'Export CSV'}
            </button>
            <button 
              onClick={exportToPDF}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors "
            >
              <FontAwesomeIcon icon={faFilePdf} className={isRTL ? 'ml-2' : 'mr-2'} />
              {isRTL ? 'تصدير PDF' : 'Export PDF'}
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title={isRTL ? "إجمالي الإيرادات" : "Total Platform Revenue"}
            value={formatCurrency(financialSummary.totalRevenue)}
            subtitle={isRTL ? "إيرادات المنصة الكاملة" : "Complete platform revenue"}
            icon={faDollarSign}
            color="text-white"
            bgColor="bg-blue-700"
            trend={12.5}
          />
          <StatCard
            title={isRTL ? "إجمالي العمولات" : "Total Commission"}
            value={formatCurrency(financialSummary.totalCommission)}
            subtitle={isRTL ? "عمولات من المالكين" : "Commission from Owners"}
            icon={faPercentage}
            color="text-white"
            bgColor="bg-yellow-500"
            trend={8.3}
          />
          <StatCard
            title={isRTL ? "رسوم الخدمة" : "Service Fees"}
            value={formatCurrency(financialSummary.totalServiceFees)}
            subtitle={isRTL ? "رسوم من المستأجرين" : "Fees from Renters"}
            icon={faHandshake}
            color="text-white"
            bgColor="bg-green-600"
            trend={15.7}
          />
          <StatCard
            title={isRTL ? "متوسط قيمة الحجز" : "Avg Booking Value"}
            value={formatCurrency(financialSummary.averageBookingValue)}
            subtitle={isRTL ? "متوسط قيمة الحجز" : "Per booking average"}
            icon={faChartLine}
            color="text-white"
            bgColor="bg-purple-600"
            trend={-2.1}
          />
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title={isRTL ? "المبالغ المستردة" : "Refunds Issued"}
            value={formatCurrency(financialSummary.refundsIssued)}
            subtitle={isRTL ? "إجمالي المبالغ المستردة" : "Total refunds processed"}
            icon={faExclamationTriangle}
            color="text-white"
            bgColor="bg-red-600"
            trend={-5.2}
          />
          <StatCard
            title={isRTL ? "الغرامات المحصلة" : "Penalties Collected"}
            value={formatCurrency(financialSummary.penaltiesCollected)}
            subtitle={isRTL ? "غرامات الإلغاء والتأخير" : "Cancellation & delay penalties"}
            icon={faMoneyBillWave}
            color="text-white"
            bgColor="bg-orange-600"
            trend={22.8}
          />
          <StatCard
            title={isRTL ? "صافي الربح" : "Net Profit"}
            value={formatCurrency(financialSummary.netProfit)}
            subtitle={isRTL ? "الربح بعد خصم المصاريف" : "After deducting expenses"}
            icon={faChartLine}
            color="text-white"
            bgColor="bg-indigo-600"
            trend={18.4}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Trend Chart */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-lg">
            <h3 className="text-xl font-bold text-white mb-6">
              {isRTL ? 'اتجاه الإيرادات الشهرية' : 'Monthly Revenue Trend'}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="month" 
                  stroke="#9CA3AF" 
                  fontSize={12}
                  style={{ fontFamily: isRTL ? 'var(--font-arabic)' : 'var(--font-montserrat)' }}
                />
                <YAxis 
                  stroke="#9CA3AF" 
                  fontSize={12}
                  style={{ fontFamily: isRTL ? 'var(--font-arabic)' : 'var(--font-montserrat)' }}
                />
                <Tooltip 
                  contentStyle={contentStyle}
                  labelFormatter={formatTooltipLabel}
                  formatter={formatTooltipValue}
                  labelStyle={labelStyle}
                  itemStyle={itemStyle}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#1E40AF" 
                  strokeWidth={3}
                  dot={{ fill: '#1E40AF', strokeWidth: 2, r: 4 }}
                  name="revenue"
                />
                <Line 
                  type="monotone" 
                  dataKey="commission" 
                  stroke="#F59E0B" 
                  strokeWidth={2}
                  dot={{ fill: '#F59E0B', strokeWidth: 2, r: 3 }}
                  name="commission"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue Breakdown Pie Chart */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-lg">
            <h3 className="text-xl font-bold text-white mb-6">
              {isRTL ? 'توزيع الإيرادات حسب الفئة' : 'Revenue Breakdown by Category'}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={revenueBreakdownData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {revenueBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={contentStyle}
                  formatter={(value: any, name: string, props: any) => [
                    `${value}% (${formatCurrency(props.payload.amount)})`,
                    name
                  ]}
                  labelStyle={labelStyle}
                  itemStyle={itemStyle}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-3 mt-4">
              {revenueBreakdownData.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div 
                    className={`w-4 h-4 rounded-full ${isRTL ? 'ml-2' : 'mr-2'}`}   
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-gray-300">{item.name}</span>
                  <span className="text-sm font-bold text-white ml-auto">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-lg mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {isRTL ? 'المالك' : 'Owner'}
              </label>
              <select
                value={selectedOwner}
                onChange={(e) => setSelectedOwner(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{isRTL ? 'جميع المالكين' : 'All Owners'}</option>
                <option value="o1">Al-Rashid Heavy Equipment</option>
                <option value="o2">Emirates Lifting Solutions</option>
                <option value="o3">Kuwait Heavy Machinery</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {isRTL ? 'الفئة' : 'Category'}
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{isRTL ? 'جميع الفئات' : 'All Categories'}</option>
                <option value="Excavators">{isRTL ? 'الحفارات' : 'Excavators'}</option>
                <option value="Cranes">{isRTL ? 'الرافعات' : 'Cranes'}</option>
                <option value="Bulldozers">{isRTL ? 'الجرافات' : 'Bulldozers'}</option>
                <option value="Loaders">{isRTL ? 'اللوادر' : 'Loaders'}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bookings Financial Table */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700">
            <h3 className="text-xl font-bold text-white">
              {isRTL ? 'تفاصيل الحجوزات المالية' : 'Bookings Financial Details'}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className={`px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                    {isRTL ? 'رقم الحجز' : 'Booking ID'}
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                    {isRTL ? 'المعدة' : 'Equipment'}
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                    {isRTL ? 'المالك' : 'Owner'}
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                    {isRTL ? 'المستأجر' : 'Renter'}
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                    {isRTL ? 'قيمة الحجز' : 'Booking Value'}
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                    {isRTL ? 'العمولة' : 'Commission'}
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                    {isRTL ? 'رسوم الخدمة' : 'Service Fee'}
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                    {isRTL ? 'الحالة' : 'Status'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {mockBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-400">
                      {booking.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {booking.equipmentName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span 
                        className="text-sm text-blue-400 hover:text-blue-300 cursor-pointer"
                        onClick={() => router.push(`/owners/${booking.ownerId}`)}
                        title="View Owner Profile"
                      >
                        {booking.ownerName}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span 
                        className="text-sm text-blue-400 hover:text-blue-300 cursor-pointer"
                        onClick={() => router.push(`/renters/${booking.renterId}`)}
                        title="View Renter Profile"
                      >
                        {booking.renterName}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {formatCurrency(booking.bookingValue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-yellow-400">
                      {formatCurrency(booking.commissionEarned)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-400">
                      {formatCurrency(booking.serviceFee)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(booking.status)}>
                        {isRTL 
                          ? booking.status === 'completed' 
                            ? 'مكتمل' 
                            : booking.status === 'pending' 
                            ? 'قيد الانتظار' 
                            : 'ملغي'
                          : booking.status
                        }
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommissionReports; 