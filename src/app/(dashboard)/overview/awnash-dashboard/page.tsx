'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, 
  faUserTie,
  faBox, 
  faClipboardList,
  faCalendarCheck,
  faDollarSign,
  faArrowUp,
  faArrowDown,
  faEye,
  faMapMarkerAlt,
  faStar,
  faCheck,
  faClock,
  faTimes
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
  Cell
} from 'recharts';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { cn } from '@/lib/utils';
import { useChartTooltipStyle } from '@/hooks/useChartTooltipStyle';
import { Button } from '@/components/ui/Button';

// Mock data for Awnash platform
const platformStats = {
  totalRequesters: 1247,
  requesterGrowth: 15.2,
  totalOwners: 386,
  ownerGrowth: 8.7,
  totalEquipment: 2843,
  equipmentGrowth: 12.3,
  activeRequests: 156,
  requestGrowth: 22.4,
  totalBookings: 892,
  bookingGrowth: 18.6,
  totalRevenue: 245000,
  revenueGrowth: 28.1
};

const bookingsTrendData = [
  { month: 'Jul', bookings: 45 },
  { month: 'Aug', bookings: 62 },
  { month: 'Sep', bookings: 58 },
  { month: 'Oct', bookings: 78 },
  { month: 'Nov', bookings: 85 },
  { month: 'Dec', bookings: 92 }
];

const equipmentBreakdownData = [
  { name: 'Excavators', value: 35, color: '#1E40AF' },
  { name: 'Cranes', value: 25, color: '#F59E0B' },
  { name: 'Bulldozers', value: 20, color: '#10B981' },
  { name: 'Loaders', value: 12, color: '#EF4444' },
  { name: 'Others', value: 8, color: '#8B5CF6' }
];

const recentBookings = [
  {
    id: 'BK-001',
    requester: 'Al-Rashid Construction',
    requesterId: 'r1',
    owner: 'Heavy Equipment Co.',
    ownerId: 'o1',
    equipment: 'CAT 320D Excavator',
    location: 'Riyadh, Saudi Arabia',
    startDate: '2024-01-25',
    duration: '7 days',
    amount: 12500,
    status: 'confirmed',
    rating: 4.8
  },
  {
    id: 'BK-002',
    requester: 'Gulf Projects LLC',
    requesterId: 'r2',
    owner: 'Machinery Rentals',
    ownerId: 'o2',
    equipment: 'Liebherr LTM 1050',
    location: 'Dubai, UAE',
    startDate: '2024-01-28',
    duration: '3 days',
    amount: 8900,
    status: 'pending',
    rating: null
  },
  {
    id: 'BK-003',
    requester: 'Construction Masters',
    requesterId: 'r3',
    owner: 'Equipment Plus',
    ownerId: 'o3',
    equipment: 'JCB 3CX Backhoe',
    location: 'Kuwait City, Kuwait',
    startDate: '2024-01-30',
    duration: '5 days',
    amount: 6700,
    status: 'completed',
    rating: 4.6
  },
  {
    id: 'BK-004',
    requester: 'Modern Builders',
    requesterId: 'r4',
    owner: 'Industrial Equipment',
    ownerId: 'o4',
    equipment: 'Caterpillar D6T',
    location: 'Doha, Qatar',
    startDate: '2024-02-01',
    duration: '10 days',
    amount: 15800,
    status: 'confirmed',
    rating: null
  }
];

const AwnashDashboard: React.FC = () => {
  const router = useRouter();
  const { isRTL } = useAppTranslation();
  const { contentStyle, labelStyle, itemStyle } = useChartTooltipStyle();

  const StatCard = ({ title, titleAr, value, growth, icon, color, currency = false }: any) => (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">
            {isRTL ? titleAr : title}
          </p>
          <p className="text-3xl font-bold text-gray-900 mb-3">
            {currency && '$'}{value.toLocaleString()}
          </p>
          <div className="flex items-center">
            <FontAwesomeIcon 
              icon={growth >= 0 ? faArrowUp : faArrowDown} 
              className={`h-4 w-4 ${growth >= 0 ? 'text-green-500' : 'text-red-500'}`}
            />
            <span className={`text-sm font-semibold ${isRTL ? 'mr-1' : 'ml-1'} ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(growth)}%
            </span>
            <span className={`text-sm text-gray-500 ${isRTL ? 'ml-2' : 'mr-2'}`}>vs last month</span>
          </div>
        </div>
        <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${color} shadow-lg`}>
          <FontAwesomeIcon icon={icon} className="h-8 w-8 text-foreground" />
        </div>
      </div>
    </div>
  );

  const getStatusBadge = (status: string) => {
    const styles = {
      confirmed: { bg: 'bg-blue-100', text: 'text-blue-800', icon: faCheck },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: faClock },
      completed: { bg: 'bg-green-100', text: 'text-green-800', icon: faCheck },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: faTimes }
    };
    const style = styles[status as keyof typeof styles];
    return (
      <span className={`inline-flex items-center rounded-xl px-3 py-1 text-xs font-semibold ${style.bg} ${style.text}`}>
        <FontAwesomeIcon icon={style.icon} className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />  
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Requesters"
          titleAr="إجمالي الطالبين"
          value={platformStats.totalRequesters}
          growth={platformStats.requesterGrowth}
          icon={faUsers}
          color="bg-gradient-to-br from-blue-600 to-blue-700"
        />
        <StatCard
          title="Total Owners"
          titleAr="إجمالي المالكين"
          value={platformStats.totalOwners}
          growth={platformStats.ownerGrowth}
          icon={faUserTie}
          color="bg-gradient-to-br from-green-600 to-green-700"
        />
        <StatCard
          title="Total Equipment"
          titleAr="إجمالي المعدات"
          value={platformStats.totalEquipment}
          growth={platformStats.equipmentGrowth}
          icon={faBox}
          color="bg-gradient-to-br from-yellow-500 to-yellow-600"
        />
        <StatCard
          title="Active Requests"
          titleAr="الطلبات النشطة"
          value={platformStats.activeRequests}
          growth={platformStats.requestGrowth}
          icon={faClipboardList}
          color="bg-gradient-to-br from-purple-600 to-purple-700"
        />
        <StatCard
          title="Total Bookings"
          titleAr="إجمالي الحجوزات"
          value={platformStats.totalBookings}
          growth={platformStats.bookingGrowth}
          icon={faCalendarCheck}
          color="bg-gradient-to-br from-indigo-600 to-indigo-700"
        />
        <StatCard
          title="Total Revenue"
          titleAr="إجمالي الإيرادات"
          value={platformStats.totalRevenue}
          growth={platformStats.revenueGrowth}
          icon={faDollarSign}
          color="bg-gradient-to-br from-emerald-600 to-emerald-700"
          currency={true}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Bookings Trend */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              {isRTL ? 'اتجاه الحجوزات' : 'Bookings Trend'}
            </h3>
            <div className={cn("flex items-center space-x-2 text-sm text-gray-500", isRTL && "space-x-reverse")}>
              <span>{isRTL ? 'آخر 6 أشهر' : 'Last 6 months'}</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={bookingsTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#666" fontSize={12} />
              <YAxis stroke="#666" fontSize={12} />
              <Tooltip 
                contentStyle={contentStyle}
                labelStyle={labelStyle}
                itemStyle={itemStyle}
              />
              <Line 
                type="monotone" 
                dataKey="bookings" 
                stroke="#1E40AF" 
                strokeWidth={4}
                dot={{ fill: '#F59E0B', strokeWidth: 3, r: 6 }}
                activeDot={{ r: 8, stroke: '#1E40AF', strokeWidth: 2, fill: '#F59E0B' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Equipment Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            {isRTL ? 'توزيع المعدات' : 'Equipment Breakdown'}
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={equipmentBreakdownData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={8}
                dataKey="value"
              >
                {equipmentBreakdownData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={contentStyle}
                labelStyle={labelStyle}
                itemStyle={itemStyle}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {equipmentBreakdownData.map((item, index) => (
              <div key={index} className="flex items-center">
                <div 
                  className={`w-4 h-4 rounded-full ${isRTL ? 'ml-2' : 'mr-2'} shadow-sm`}
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm text-gray-700 font-medium">{item.name}</span>
                <span className="text-sm font-bold text-gray-900 ml-auto">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">
              {isRTL ? 'الحجوزات الأخيرة' : 'Recent Bookings'}
            </h3>
            <Button variant="ghost" className="text-blue-600 hover:text-blue-800 hover:bg-blue-50">
              <FontAwesomeIcon icon={faEye} className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />   
              {isRTL ? 'عرض الكل' : 'View All'}
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {isRTL ? 'رقم الحجز' : 'Booking ID'}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {isRTL ? 'الطالب' : 'Requester'}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {isRTL ? 'المالك' : 'Owner'}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {isRTL ? 'المعدة' : 'Equipment'}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {isRTL ? 'الموقع' : 'Location'}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {isRTL ? 'المدة' : 'Duration'}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {isRTL ? 'المبلغ' : 'Amount'}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {isRTL ? 'الحالة' : 'Status'}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {isRTL ? 'التقييم' : 'Rating'}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-blue-600">{booking.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div 
                      className="text-sm text-blue-600 hover:text-blue-900 cursor-pointer"
                      onClick={() => router.push(`/renters/${booking.requesterId}`)}
                      title="View Renter Profile"
                    >
                      {booking.requester}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div 
                      className="text-sm text-blue-600 hover:text-blue-900 cursor-pointer"
                      onClick={() => router.push(`/owners/${booking.ownerId}`)}
                      title="View Owner Profile"
                    >
                      {booking.owner}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{booking.equipment}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-600">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'} text-muted-foreground`} />  
                      {booking.location}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{booking.duration}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">${booking.amount.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(booking.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {booking.rating ? (
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faStar} className={`h-4 w-4 text-yellow-400 ${isRTL ? 'ml-1' : 'mr-1'}`} />  
                        <span className="text-sm font-medium text-gray-900">{booking.rating}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Pending</span>
                    )}
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

export default AwnashDashboard; 