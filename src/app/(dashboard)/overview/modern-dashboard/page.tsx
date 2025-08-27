'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDollarSign,
  faUsers,
  faBox,
  faCalendarAlt,
  faChartLine,
  faEye,
  faFilter,
  faDownload,
  faClock,
  faCheckCircle,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { cn } from '@/lib/utils';

const ModernDashboard: React.FC = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  // Enhanced tooltip styles for dark mode
  const tooltipStyle = {
    backgroundColor: '#111827',
    border: '1px solid #374151',
    borderRadius: '8px',
    color: '#F9FAFB',
    fontSize: '14px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
    padding: '12px'
  };

  const formatTooltipValue = (value: any, name: string) => {
    if (name === 'revenue') {
      return [
        new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-US', {
          style: 'currency',
          currency: 'SAR',
          minimumFractionDigits: 0
        }).format(value),
        isRTL ? 'الإيرادات' : 'Revenue'
      ];
    }
    if (name === 'users') {
      return [
        value.toLocaleString(isRTL ? 'ar-SA' : 'en-US'),
        isRTL ? 'المستخدمون' : 'Users'
      ];
    }
    return [
      value.toLocaleString(isRTL ? 'ar-SA' : 'en-US'),
      name
    ];
  };

  const getMonthName = (month: string) => {
    const monthMap: { [key: string]: string } = {
      'Jan': isRTL ? 'يناير' : 'Jan',
      'Feb': isRTL ? 'فبراير' : 'Feb', 
      'Mar': isRTL ? 'مارس' : 'Mar',
      'Apr': isRTL ? 'أبريل' : 'Apr',
      'May': isRTL ? 'مايو' : 'May',
      'Jun': isRTL ? 'يونيو' : 'Jun'
    };
    return monthMap[month] || month;
  };

  const StatCard = ({ title, value, growth, icon, color }: any) => (
    <div className={cn("bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-lg hover:shadow-xl transition-all", isRTL ? 'text-right' : 'text-left')}>
      <div className="flex items-center justify-between">
        <div className={isRTL ? 'order-2' : 'order-1'}>
          <p className="text-sm font-medium text-gray-400 mb-2">{title}</p>
          <p className="text-3xl font-bold text-white mb-2">{value}</p>
          <div className="flex items-center">
            <span className={cn("text-sm font-medium", growth >= 0 ? 'text-green-400' : 'text-red-400')}>
              {growth >= 0 ? '+' : ''}{growth}%
            </span>
            <span className={cn("text-sm text-gray-500", isRTL ? 'mr-1' : 'ml-1')}>
              {isRTL ? 'مقارنة بالشهر الماضي' : 'vs last month'}
            </span>
          </div>
        </div>
        <div className={cn("flex h-16 w-16 items-center justify-center rounded-xl", color, isRTL ? 'order-1' : 'order-2')}>
          <FontAwesomeIcon icon={icon} className="h-8 w-8 text-white" />
        </div>
      </div>
    </div>
  );

  const WorkflowCard = ({ title, description, status, type, icon }: any) => (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-lg hover:shadow-xl transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className={cn("flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600", isRTL ? 'order-2' : 'order-1')}>
          <FontAwesomeIcon icon={icon} className="h-6 w-6 text-white" />
        </div>
        <div className={cn(isRTL ? 'order-1' : 'order-2')}>
          <span className={cn(
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
            status === 'Available' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          )}>
            {status}
          </span>
        </div>
      </div>
      <h3 className={cn("text-lg font-bold text-white mb-2", isRTL ? 'text-right' : 'text-left')}>{title}</h3>
      <p className={cn("text-gray-400", isRTL ? 'text-right' : 'text-left')}>{description}</p>
    </div>
  );

  // Sample data with Arabic month names
  const stats = {
    totalRevenue: 2850000,
    revenueGrowth: 12.5,
    totalUsers: 15420,
    userGrowth: 8.3,
    totalEquipment: 3250,
    equipmentGrowth: 15.7,
    totalBookings: 8760,
    bookingGrowth: -2.1
  };

  const revenueData = [
    { month: getMonthName('Jan'), revenue: 185000 },
    { month: getMonthName('Feb'), revenue: 220000 },
    { month: getMonthName('Mar'), revenue: 265000 },
    { month: getMonthName('Apr'), revenue: 195000 },
    { month: getMonthName('May'), revenue: 285000 },
    { month: getMonthName('Jun'), revenue: 320000 }
  ];

  const categoryData = [
    { name: isRTL ? 'الحفارات' : 'Excavators', value: 35, color: '#1E40AF' },
    { name: isRTL ? 'الرافعات' : 'Cranes', value: 28, color: '#F59E0B' },
    { name: isRTL ? 'الجرافات' : 'Bulldozers', value: 20, color: '#10B981' },
    { name: isRTL ? 'اللوادر' : 'Loaders', value: 17, color: '#EF4444' }
  ];

  const userGrowthData = [
    { date: getMonthName('Jan'), users: 1250 },
    { date: getMonthName('Feb'), users: 1420 },
    { date: getMonthName('Mar'), users: 1680 },
    { date: getMonthName('Apr'), users: 1390 },
    { date: getMonthName('May'), users: 1850 },
    { date: getMonthName('Jun'), users: 2100 }
  ];

  return (
    <div className={cn("min-h-screen bg-gray-900 space-y-8", isRTL ? 'font-arabic' : 'font-montserrat')} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            {isRTL ? 'لوحة التحكم الحديثة' : 'Modern Dashboard'}
          </h1>
          <p className="text-gray-400">
            {isRTL ? 'نظرة شاملة على أداء المنصة والمقاييس الرئيسية' : 'Comprehensive overview of platform performance and key metrics'}
          </p>
        </div>
        <div className={cn("flex items-center space-x-3", isRTL && "space-x-reverse")}>
          <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 border border-gray-600 rounded-lg hover:bg-gray-700">
            <FontAwesomeIcon icon={faFilter} className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
            {isRTL ? 'تصفية' : 'Filter'}
          </button>
          <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
            <FontAwesomeIcon icon={faDownload} className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
            {isRTL ? 'تصدير التقرير' : 'Export Report'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={isRTL ? "إجمالي الإيرادات" : "Total Revenue"}
          value={new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-US', {
            style: 'currency',
            currency: 'SAR',
            minimumFractionDigits: 0
          }).format(stats.totalRevenue)}
          growth={stats.revenueGrowth}
          icon={faDollarSign}
          color="bg-gradient-to-r from-green-500 to-green-700"
        />
        <StatCard
          title={isRTL ? "إجمالي المستخدمين" : "Total Users"}
          value={stats.totalUsers.toLocaleString(isRTL ? 'ar-SA' : 'en-US')}
          growth={stats.userGrowth}
          icon={faUsers}
          color="bg-gradient-to-r from-blue-500 to-blue-700"
        />
        <StatCard
          title={isRTL ? "المعدات المدرجة" : "Equipment Listed"}
          value={stats.totalEquipment.toLocaleString(isRTL ? 'ar-SA' : 'en-US')}
          growth={stats.equipmentGrowth}
          icon={faBox}
          color="bg-gradient-to-r from-purple-500 to-purple-700"
        />
        <StatCard
          title={isRTL ? "إجمالي الحجوزات" : "Total Bookings"}
          value={stats.totalBookings.toLocaleString(isRTL ? 'ar-SA' : 'en-US')}
          growth={stats.bookingGrowth}
          icon={faCalendarAlt}
          color="bg-gradient-to-r from-orange-500 to-orange-700"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">
              {isRTL ? 'اتجاهات الإيرادات' : 'Revenue Trends'}
            </h3>
            <select className="text-sm border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-1">
              <option>{isRTL ? 'آخر 6 أشهر' : 'Last 6 months'}</option>
              <option>{isRTL ? 'السنة الماضية' : 'Last year'}</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="month" 
                stroke="#9CA3AF"
                style={{ fontFamily: isRTL ? 'var(--font-arabic)' : 'var(--font-montserrat)' }}
              />
              <YAxis 
                stroke="#9CA3AF"
                style={{ fontFamily: isRTL ? 'var(--font-arabic)' : 'var(--font-montserrat)' }}
              />
              <Tooltip 
                contentStyle={tooltipStyle}
                formatter={formatTooltipValue}
                labelStyle={{ 
                  color: '#F9FAFB', 
                  fontWeight: 'bold',
                  fontFamily: isRTL ? 'var(--font-arabic)' : 'var(--font-montserrat)' 
                }}
                itemStyle={{ 
                  color: '#F9FAFB',
                  fontFamily: isRTL ? 'var(--font-arabic)' : 'var(--font-montserrat)' 
                }}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3B82F6" 
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
                name="revenue"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Equipment Categories */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-6">
            {isRTL ? 'فئات المعدات' : 'Equipment Categories'}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#111827',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB',
                  fontSize: '14px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                  padding: '12px'
                }}
                formatter={(value: any, name: string) => [
                  `${value}%`,
                  name
                ]}
                labelStyle={{ 
                  color: '#F9FAFB', 
                  fontWeight: 'bold',
                  fontFamily: isRTL ? 'var(--font-arabic)' : 'var(--font-montserrat)' 
                }}
                itemStyle={{ 
                  color: '#F9FAFB',
                  fontFamily: isRTL ? 'var(--font-arabic)' : 'var(--font-montserrat)' 
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {categoryData.map((item, index) => (
              <div key={index} className="flex items-center">
                <div 
                  className={cn("w-3 h-3 rounded-full", isRTL ? "ml-2" : "mr-2")}
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm text-gray-400">{item.name}</span>
                <span className={cn("text-sm font-medium text-white", isRTL ? "mr-auto" : "ml-auto")}>{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Growth Chart */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-white mb-6">
          {isRTL ? 'نمو المستخدمين' : 'User Growth'}
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={userGrowthData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="date" 
              stroke="#9CA3AF"
              style={{ fontFamily: isRTL ? 'var(--font-arabic)' : 'var(--font-montserrat)' }}
            />
            <YAxis 
              stroke="#9CA3AF"
              style={{ fontFamily: isRTL ? 'var(--font-arabic)' : 'var(--font-montserrat)' }}
            />
            <Tooltip 
              contentStyle={tooltipStyle}
              formatter={formatTooltipValue}
              labelStyle={{ 
                color: '#F9FAFB', 
                fontWeight: 'bold',
                fontFamily: isRTL ? 'var(--font-arabic)' : 'var(--font-montserrat)' 
              }}
              itemStyle={{ 
                color: '#F9FAFB',
                fontFamily: isRTL ? 'var(--font-arabic)' : 'var(--font-montserrat)' 
              }}
            />
            <Line 
              type="monotone" 
              dataKey="users" 
              stroke="#10B981" 
              strokeWidth={3}
              dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              name="users"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Workflow Cards */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">
          {isRTL ? 'سير العمل الإداري' : 'Management Workflows'}
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <WorkflowCard
            title={isRTL ? "وكيل تحليل المستخدمين" : "User Analytics Agent"}
            description={isRTL ? "يحلل تلقائياً أنماط سلوك المستخدمين ويولد رؤى للمشاركة الأفضل" : "Automatically analyzes user behavior patterns and generates insights for better engagement."}
            status={isRTL ? "متاح" : "Available"}
            type="analytics"
            icon={faUsers}
          />
          <WorkflowCard
            title={isRTL ? "محسن الإيرادات" : "Revenue Optimizer"}
            description={isRTL ? "ينشئ استراتيجيات تحسين الإيرادات بناءً على أنماط الحجز وتحليل الأسعار" : "Creates revenue optimization strategies based on booking patterns and pricing analysis."}
            status={isRTL ? "متاح" : "Available"}
            type="optimization"
            icon={faDollarSign}
          />
          <WorkflowCard
            title={isRTL ? "متنبئ المعدات" : "Equipment Predictor"}
            description={isRTL ? "يتنبأ باتجاهات الطلب على المعدات للمساعدة في تحسين المخزون والتسعير" : "Predicts equipment demand trends to help optimize inventory and pricing."}
            status={isRTL ? "قريباً" : "Coming Soon"}
            type="prediction"
            icon={faBox}
          />
          <WorkflowCard
            title={isRTL ? "تجميع العملاء" : "Client Segmentation"}
            description={isRTL ? "يجمع العملاء بناءً على أنماط الاستخدام وينشئ استراتيجيات تسويق مستهدفة" : "Segments clients based on usage patterns and generates targeted marketing strategies."}
            status={isRTL ? "متاح" : "Available"}
            type="segmentation"
            icon={faChartLine}
          />
          <WorkflowCard
            title={isRTL ? "توقع الحجوزات" : "Booking Forecast"}
            description={isRTL ? "يتوقع اتجاهات الحجز والأنماط الموسمية لتخطيط أفضل للموارد" : "Forecasts booking trends and seasonal patterns for better resource planning."}
            status={isRTL ? "قريباً" : "Coming Soon"}
            type="forecast"
            icon={faCalendarAlt}
          />
          <WorkflowCard
            title={isRTL ? "مراقب الأداء" : "Performance Monitor"}
            description={isRTL ? "يراقب أداء النظام وينشئ تقارير آلية عن المقاييس الرئيسية" : "Monitors system performance and generates automated reports on key metrics."}
            status={isRTL ? "متاح" : "Available"}
            type="monitoring"
            icon={faEye}
          />
        </div>
      </div>
    </div>
  );
};

export default ModernDashboard;