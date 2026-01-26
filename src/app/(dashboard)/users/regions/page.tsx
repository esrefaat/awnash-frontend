'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMapMarkerAlt,
  faGlobe,
  faDollarSign,
  faHandshake,
  faUsers,
  faTruck,
  faClock,
  faEdit,
  faEye,
  faPlus,
  faToggleOn,
  faToggleOff,
  faPercentage,
  faChartPie,
  faChartBar,
  faCog,
  faSearch,
  faFilter,
  faDownload,
  faBuilding,
  faCity
} from '@fortawesome/free-solid-svg-icons';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useChartTooltipStyle } from '@/hooks/useChartTooltipStyle';

interface Region {
  id: string;
  cityName: string;
  regionName: string;
  totalRevenue: number;
  bookingsCount: number;
  mostRentedCategory: string;
  topEquipmentSize: string;
  ownerCount: number;
  renterCount: number;
  active: boolean;
  vatRate?: number;
  surcharges?: number;
  averageRentalDuration: number;
}

interface RegionSummary {
  totalBookings: number;
  totalRevenue: number;
  activeRenters: number;
  activeOwners: number;
  mostRentedEquipmentType: string;
  averageRentalDuration: number;
}

const RegionManagement: React.FC = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { contentStyle, labelStyle, itemStyle } = useChartTooltipStyle();
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingRegion, setEditingRegion] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Mock regions data
  const [regions, setRegions] = useState<Region[]>([
    {
      id: '1',
      cityName: 'Riyadh',
      regionName: 'Central Region',
      totalRevenue: 1250000,
      bookingsCount: 342,
      mostRentedCategory: 'Excavators',
      topEquipmentSize: 'Medium (6-45 tons)',
      ownerCount: 89,
      renterCount: 156,
      active: true,
      vatRate: 15,
      averageRentalDuration: 12
    },
    {
      id: '2',
      cityName: 'Dubai',
      regionName: 'UAE Emirates',
      totalRevenue: 980000,
      bookingsCount: 287,
      mostRentedCategory: 'Cranes',
      topEquipmentSize: 'Tower (50-200 tons)',
      ownerCount: 67,
      renterCount: 123,
      active: true,
      vatRate: 5,
      averageRentalDuration: 8
    },
    {
      id: '3',
      cityName: 'Kuwait City',
      regionName: 'Kuwait',
      totalRevenue: 675000,
      bookingsCount: 198,
      mostRentedCategory: 'Bulldozers',
      topEquipmentSize: 'Large (300+ HP)',
      ownerCount: 45,
      renterCount: 89,
      active: true,
      vatRate: 0,
      averageRentalDuration: 15
    },
    {
      id: '4',
      cityName: 'Doha',
      regionName: 'Qatar',
      totalRevenue: 540000,
      bookingsCount: 165,
      mostRentedCategory: 'Loaders',
      topEquipmentSize: 'Medium (3-6 cubic yards)',
      ownerCount: 38,
      renterCount: 72,
      active: true,
      vatRate: 0,
      averageRentalDuration: 10
    },
    {
      id: '5',
      cityName: 'Manama',
      regionName: 'Bahrain',
      totalRevenue: 320000,
      bookingsCount: 98,
      mostRentedCategory: 'Transport Trucks',
      topEquipmentSize: 'Heavy Duty (60+ tons)',
      ownerCount: 22,
      renterCount: 45,
      active: true,
      vatRate: 10,
      averageRentalDuration: 6
    },
    {
      id: '6',
      cityName: 'Muscat',
      regionName: 'Oman',
      totalRevenue: 280000,
      bookingsCount: 85,
      mostRentedCategory: 'Excavators',
      topEquipmentSize: 'Mini (1-6 tons)',
      ownerCount: 19,
      renterCount: 38,
      active: false,
      vatRate: 5,
      averageRentalDuration: 9
    }
  ]);

  // Calculate summary data
  const filteredRegions = regions.filter(region => 
    selectedRegion === 'all' || region.regionName === selectedRegion
  ).filter(region =>
    region.cityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    region.regionName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const regionSummary: RegionSummary = {
    totalBookings: filteredRegions.reduce((sum, region) => sum + region.bookingsCount, 0),
    totalRevenue: filteredRegions.reduce((sum, region) => sum + region.totalRevenue, 0),
    activeRenters: filteredRegions.reduce((sum, region) => sum + region.renterCount, 0),
    activeOwners: filteredRegions.reduce((sum, region) => sum + region.ownerCount, 0),
    mostRentedEquipmentType: 'Excavators', // Most common across regions
    averageRentalDuration: Math.round(
      filteredRegions.reduce((sum, region) => sum + region.averageRentalDuration, 0) / filteredRegions.length
    )
  };

  // Chart data
  const revenueByCity = filteredRegions.map(region => ({
    name: region.cityName,
    revenue: region.totalRevenue,
    bookings: region.bookingsCount
  }));

  const equipmentTypeDistribution = [
    { name: isRTL ? 'الحفارات' : 'Excavators', value: 35, count: 120, color: '#1E40AF' },
    { name: isRTL ? 'الرافعات' : 'Cranes', value: 28, count: 96, color: '#F59E0B' },
    { name: isRTL ? 'الجرافات' : 'Bulldozers', value: 20, count: 69, color: '#10B981' },
    { name: isRTL ? 'اللوادر' : 'Loaders', value: 12, count: 41, color: '#EF4444' },
    { name: isRTL ? 'النقل' : 'Transport', value: 5, count: 17, color: '#8B5CF6' }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const StatCard = ({ title, value, subtitle, icon, color, bgColor, trend }: any) => (
    <div className={`bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-lg hover:shadow-xl transition-all ${isRTL ? 'text-right' : 'text-left'}`}>
      <div className="flex items-center justify-between">
        <div className={isRTL ? 'order-2' : 'order-1'}>
          <p className="text-sm font-medium text-gray-400 mb-2">{title}</p>
          <p className="text-3xl font-bold text-white mb-2">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-400">{subtitle}</p>
          )}
        </div>
        <div className={`flex h-16 w-16 items-center justify-center rounded-xl ${bgColor} ${isRTL ? 'order-1' : 'order-2'}`}>
          <FontAwesomeIcon icon={icon} className={`h-8 w-8 ${color}`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-gray-900 ${isRTL ? 'font-arabic' : 'font-montserrat'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            {isRTL ? 'إدارة المناطق الجغرافية' : 'Region Management'}
          </h1>
          <p className="text-gray-400">
            {isRTL ? 'تتبع التوزيع الجغرافي للمعدات والأداء حسب المدينة' : 'Track geographic distribution of equipment rentals and performance by city'}
          </p>
        </div>

        {/* Map View Placeholder */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-lg mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">
              {isRTL ? 'خريطة منطقة الخليج' : 'Gulf Region Map'}
            </h2>
            <div className={cn("flex items-center space-x-4", isRTL && "space-x-reverse")}>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{isRTL ? 'جميع المناطق' : 'All Regions'}</option>
                <option value="Central Region">{isRTL ? 'المنطقة الوسطى' : 'Central Region'}</option>
                <option value="UAE Emirates">{isRTL ? 'الإمارات' : 'UAE Emirates'}</option>
                <option value="Kuwait">{isRTL ? 'الكويت' : 'Kuwait'}</option>
                <option value="Qatar">{isRTL ? 'قطر' : 'Qatar'}</option>
                <option value="Bahrain">{isRTL ? 'البحرين' : 'Bahrain'}</option>
                <option value="Oman">{isRTL ? 'عمان' : 'Oman'}</option>
              </select>
            </div>
          </div>
          
          {/* Map Placeholder */}
          <div className="bg-gray-700 rounded-lg h-64 flex items-center justify-center border-2 border-dashed border-gray-600">
            <div className="text-center">
              <FontAwesomeIcon icon={faGlobe} className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-400 mb-2">
                {isRTL ? 'خريطة تفاعلية' : 'Interactive Map'}
              </h3>
              <p className="text-sm text-gray-500">
                {isRTL ? 'سيتم دمج خريطة تفاعلية هنا لعرض توزيع المعدات' : 'Interactive map integration will be displayed here'}
              </p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <StatCard
            title={isRTL ? "إجمالي الحجوزات" : "Total Bookings"}
            value={regionSummary.totalBookings.toLocaleString()}
            subtitle={isRTL ? "في المناطق المحددة" : "In selected regions"}
            icon={faHandshake}
            color="text-white"
            bgColor="bg-blue-700"
          />
          <StatCard
            title={isRTL ? "إجمالي الإيرادات" : "Total Revenue"}
            value={formatCurrency(regionSummary.totalRevenue)}
            subtitle={isRTL ? "إيرادات الإيجارات" : "From rentals"}
            icon={faDollarSign}
            color="text-white"
            bgColor="bg-green-600"
          />
          <StatCard
            title={isRTL ? "المستأجرون النشطون" : "Active Renters"}
            value={regionSummary.activeRenters}
            subtitle={isRTL ? "مستأجرون مسجلون" : "Registered renters"}
            icon={faUsers}
            color="text-white"
            bgColor="bg-purple-600"
          />
          <StatCard
            title={isRTL ? "المالكون النشطون" : "Active Owners"}
            value={regionSummary.activeOwners}
            subtitle={isRTL ? "مالكو معدات" : "Equipment owners"}
            icon={faBuilding}
            color="text-white"
            bgColor="bg-yellow-500"
          />
          <StatCard
            title={isRTL ? "الأكثر إيجاراً" : "Most Rented"}
            value={isRTL ? "الحفارات" : "Excavators"}
            subtitle={isRTL ? "نوع المعدة" : "Equipment type"}
            icon={faTruck}
            color="text-white"
            bgColor="bg-orange-600"
          />
          <StatCard
            title={isRTL ? "متوسط مدة الإيجار" : "Avg Duration"}
            value={`${regionSummary.averageRentalDuration} ${isRTL ? 'يوم' : 'days'}`}
            subtitle={isRTL ? "مدة الإيجار" : "Rental period"}
            icon={faClock}
            color="text-white"
            bgColor="bg-indigo-600"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue by City Chart */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-lg">
            <h3 className="text-xl font-bold text-white mb-6">
              {isRTL ? 'الإيرادات حسب المدينة' : 'Revenue by City'}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueByCity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip 
                  contentStyle={contentStyle}
                  labelStyle={labelStyle}
                  itemStyle={itemStyle}
                  formatter={(value: any, name: string) => [
                    name === 'revenue' ? formatCurrency(value) : value,
                    name === 'revenue' ? (isRTL ? 'الإيرادات' : 'Revenue') : (isRTL ? 'الحجوزات' : 'Bookings')
                  ]}
                />
                <Bar 
                  dataKey="revenue" 
                  fill="#1E40AF" 
                  name="revenue"
                  style={{ cursor: 'pointer' }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Equipment Type Distribution */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-lg">
            <h3 className="text-xl font-bold text-white mb-6">
              {isRTL ? 'توزيع أنواع المعدات' : 'Equipment Type Distribution'}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={equipmentTypeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {equipmentTypeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={contentStyle}
                  labelStyle={labelStyle}
                  itemStyle={itemStyle}
                  formatter={(value: any, name: string, props: any) => [
                    `${value}% (${props.payload.count} ${isRTL ? 'حجز' : 'bookings'})`,
                    name
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-3 mt-4">
              {equipmentTypeDistribution.map((item, index) => (
                <div key={index} className="flex items-center gap-x-2">
                  <div 
                    className={`w-4 h-4 rounded-full`}   
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-gray-300">{item.name}</span>
                  <span className={`text-sm font-bold text-white ${isRTL ? 'ml-auto' : 'mr-auto'}`}>{item.value}%</span>   
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-lg mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {isRTL ? 'البحث' : 'Search'}
              </label>
              <div className="relative">
                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={isRTL ? 'البحث بالمدينة أو المنطقة...' : 'Search by city or region...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                  showSettings 
                    ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <FontAwesomeIcon icon={faCog} className={`${isRTL ? 'ml-2' : 'mr-2'}`} />  
                {isRTL ? 'إعدادات المناطق' : 'Region Settings'}
              </button>
            </div>
          </div>
        </div>

        {/* Regions Table */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">
                {isRTL ? 'جدول المناطق والمدن' : 'Regions & Cities Table'}
              </h3>
              <button className="flex items-center px-4 py-2 bg-awnash-primary text-black rounded-2xl hover:bg-awnash-primary-hover font-medium transition-colors shadow-lg">
                <FontAwesomeIcon icon={faPlus} className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
                {isRTL ? 'إضافة منطقة' : 'Add Region'}
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className={`px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                    {isRTL ? 'المدينة' : 'City'}
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                    {isRTL ? 'المنطقة' : 'Region'}
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                    {isRTL ? 'إجمالي الإيرادات' : 'Total Revenue'}
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                    {isRTL ? 'عدد الحجوزات' : 'Bookings Count'}
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                    {isRTL ? 'الأكثر إيجاراً' : 'Most Rented'}
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                    {isRTL ? 'المالكون/المستأجرون' : 'Owners/Renters'}
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                    {isRTL ? 'الحالة' : 'Status'}
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                    {isRTL ? 'الإجراءات' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredRegions.map((region) => (
                  <tr key={region.id} className="hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faCity} className={`h-4 w-4 text-blue-400 ${isRTL ? 'ml-2' : 'mr-2'}`} />  
                        <span className="text-sm font-medium text-white">{region.cityName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {region.regionName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-400">
                      {formatCurrency(region.totalRevenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {region.bookingsCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <div>
                        <div className="font-medium">{region.mostRentedCategory}</div>
                        <div className="text-xs text-gray-400">{region.topEquipmentSize}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <div className={cn("flex space-x-4", isRTL && "space-x-reverse")}>
                        <span className="flex items-center">
                          <FontAwesomeIcon icon={faBuilding} className={`h-3 w-3 text-yellow-400 ${isRTL ? 'ml-1' : 'mr-1'}`} />  
                          {region.ownerCount}
                        </span>
                        <span className="flex items-center">
                          <FontAwesomeIcon icon={faUsers} className={`h-3 w-3 text-purple-400 ${isRTL ? 'ml-1' : 'mr-1'}`} />  
                          {region.renterCount}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setRegions(regions.map(r => 
                            r.id === region.id ? { ...r, active: !r.active } : r
                          ));
                        }}
                        className={`p-2 rounded-full ${
                          region.active 
                            ? 'bg-yellow-600 text-white' 
                            : 'bg-gray-600 text-gray-300'
                        } hover:bg-opacity-80 transition-colors`}
                      >
                        <FontAwesomeIcon icon={region.active ? faToggleOn : faToggleOff} />
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={cn("flex space-x-2", isRTL && "space-x-reverse")}>
                        <button
                          className="text-blue-400 hover:text-blue-300"
                          title={isRTL ? 'عرض التفاصيل' : 'View Details'}
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                        <button
                          onClick={() => setEditingRegion(region.id)}
                          className="text-blue-400 hover:text-blue-300"
                          title={isRTL ? 'تعديل المنطقة' : 'Edit Region'}
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Region Settings Panel */}
        {showSettings && (
          <div className="mt-8 bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-lg">
            <h3 className="text-xl font-bold text-white mb-6">
              {isRTL ? 'إعدادات المناطق' : 'Region Settings'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {isRTL ? 'ضريبة القيمة المضافة الافتراضية' : 'Default VAT Rate'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    step="0.1"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="15.0"
                  />
                  <FontAwesomeIcon icon={faPercentage} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {isRTL ? 'الرسوم الإضافية' : 'Additional Surcharges'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                  <FontAwesomeIcon icon={faDollarSign} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              <div className="flex items-end">
                <button className="w-full px-4 py-2 bg-awnash-primary text-black rounded-2xl hover:bg-awnash-primary-hover font-medium transition-colors shadow-lg">
                  {isRTL ? 'حفظ المنطقة' : 'Save Region'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegionManagement; 