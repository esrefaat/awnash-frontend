'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartLine,
  faFilter,
  faSearch,
  faEye,
  faEnvelope,
  faCopy,
  faTimes,
  faBell,
  faSms,
  faCalendarAlt,
  faUsers,
  faCheckCircle,
  faTimesCircle,
  faExclamationTriangle,
  faClock,
  faChevronDown,
  faChevronUp,
  faDownload,
  faPlay,
  faPause,
  faPercent,
  faMousePointer,
  faShoppingCart,
  faUserCheck,
  faMapMarkerAlt,
  faPhone,
  faGift,
  faCogs,
  faHandPointer
} from '@fortawesome/free-solid-svg-icons';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useChartTooltipStyle } from '@/hooks/useChartTooltipStyle';

// Campaign interfaces
interface CampaignLog {
  id: string;
  name: string;
  type: 'manual' | 'triggered';
  channels: ('push' | 'email' | 'sms')[];
  createdBy: string;
  targetAudienceSize: number;
  status: 'sent' | 'scheduled' | 'failed' | 'partial';
  sentDate?: string;
  scheduledDate?: string;
  triggerRule?: string;
  description?: string;
  segment?: string;
  metrics: {
    totalSent: number;
    openRate: number;
    clickThroughRate: number;
    smsDeliveryRate: number;
    discountRedemptions: number;
    conversionToBooking: number;
  };
}

interface UserInteraction {
  userId: string;
  userName: string;
  role: 'Renter' | 'Owner';
  city: string;
  deliveryStatus: 'delivered' | 'failed' | 'pending';
  response: 'opened' | 'clicked' | 'booked' | 'redeemed' | 'none';
  timestamp: string;
}

interface CampaignDetail extends CampaignLog {
  userInteractions: UserInteraction[];
  message: {
    push?: { title: string; body: string; };
    email?: { subject: string; body: string; };
    sms?: { body: string; };
  };
  incentive?: {
    type: 'percentage' | 'fixed';
    value: number;
    appliesTo: string;
  };
}

const CampaignAnalytics: React.FC = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { contentStyle, labelStyle, itemStyle } = useChartTooltipStyle();

  // State management
  const [filters, setFilters] = useState({
    channel: '',
    type: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    search: ''
  });

  const [selectedCampaign, setSelectedCampaign] = useState<CampaignDetail | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Mock campaign data
  const mockCampaigns: CampaignLog[] = [
    {
      id: '1',
      name: 'Equipment Promotion - Weekend Special',
      type: 'manual',
      channels: ['push', 'email'],
      createdBy: 'Ahmed Admin',
      targetAudienceSize: 2450,
      status: 'sent',
      sentDate: '2024-01-15T10:00:00Z',
      segment: 'Active Renters - All Cities',
      metrics: {
        totalSent: 2450,
        openRate: 68.5,
        clickThroughRate: 12.3,
        smsDeliveryRate: 0,
        discountRedemptions: 89,
        conversionToBooking: 5.8
      }
    },
    {
      id: '2',
      name: 'Document Expiry Reminder',
      type: 'triggered',
      channels: ['sms', 'push'],
      createdBy: 'System Auto',
      targetAudienceSize: 156,
      status: 'sent',
      sentDate: '2024-01-14T08:30:00Z',
      triggerRule: 'Document expiry in 7 days',
      segment: 'Users with expiring documents',
      metrics: {
        totalSent: 156,
        openRate: 85.2,
        clickThroughRate: 45.6,
        smsDeliveryRate: 97.4,
        discountRedemptions: 0,
        conversionToBooking: 23.1
      }
    },
    {
      id: '3',
      name: 'New Owner Onboarding',
      type: 'triggered',
      channels: ['email'],
      createdBy: 'System Auto',
      targetAudienceSize: 45,
      status: 'sent',
      sentDate: '2024-01-13T14:15:00Z',
      triggerRule: 'New user registration (Owner)',
      segment: 'New Owners (< 7 days)',
      metrics: {
        totalSent: 45,
        openRate: 77.8,
        clickThroughRate: 31.1,
        smsDeliveryRate: 0,
        discountRedemptions: 12,
        conversionToBooking: 15.6
      }
    },
    {
      id: '4',
      name: 'Low Activity Re-engagement',
      type: 'manual',
      channels: ['push', 'email', 'sms'],
      createdBy: 'Sarah Marketing',
      targetAudienceSize: 890,
      status: 'partial',
      sentDate: '2024-01-12T16:45:00Z',
      segment: 'Inactive Users (>30 days)',
      metrics: {
        totalSent: 712,
        openRate: 42.1,
        clickThroughRate: 8.7,
        smsDeliveryRate: 89.3,
        discountRedemptions: 34,
        conversionToBooking: 3.2
      }
    },
    {
      id: '5',
      name: 'Flash Sale - Riyadh Equipment',
      type: 'manual',
      channels: ['push', 'sms'],
      createdBy: 'Mohammed Sales',
      targetAudienceSize: 1200,
      status: 'scheduled',
      scheduledDate: '2024-01-16T09:00:00Z',
      segment: 'Active Renters - Riyadh',
      metrics: {
        totalSent: 0,
        openRate: 0,
        clickThroughRate: 0,
        smsDeliveryRate: 0,
        discountRedemptions: 0,
        conversionToBooking: 0
      }
    }
  ];

  // Mock chart data
  const campaignTypeData = [
    { name: 'Manual', value: 3, color: '#3B82F6' },
    { name: 'Triggered', value: 2, color: '#F59E0B' }
  ];

  const performanceData = [
    { date: 'Jan 10', openRate: 65.2, ctr: 11.5, conversion: 4.8 },
    { date: 'Jan 11', openRate: 70.1, ctr: 13.2, conversion: 6.1 },
    { date: 'Jan 12', openRate: 42.1, ctr: 8.7, conversion: 3.2 },
    { date: 'Jan 13', openRate: 77.8, ctr: 31.1, conversion: 15.6 },
    { date: 'Jan 14', openRate: 85.2, ctr: 45.6, conversion: 23.1 },
    { date: 'Jan 15', openRate: 68.5, ctr: 12.3, conversion: 5.8 }
  ];

  const channelDistribution = [
    { name: 'Email', value: 40, color: '#3B82F6' },
    { name: 'Push', value: 35, color: '#F59E0B' },
    { name: 'SMS', value: 25, color: '#10B981' }
  ];

  // Mock campaign detail
  const getCampaignDetail = (campaignId: string): CampaignDetail => {
    const campaign = mockCampaigns.find(c => c.id === campaignId);
    if (!campaign) throw new Error('Campaign not found');

    return {
      ...campaign,
      userInteractions: [
        {
          userId: '1',
          userName: 'Ahmed Al-Rashid',
          role: 'Renter',
          city: 'Riyadh',
          deliveryStatus: 'delivered',
          response: 'booked',
          timestamp: '2024-01-15T10:05:00Z'
        },
        {
          userId: '2',
          userName: 'Sarah Johnson',
          role: 'Owner',
          city: 'Dubai',
          deliveryStatus: 'delivered',
          response: 'clicked',
          timestamp: '2024-01-15T10:12:00Z'
        },
        {
          userId: '3',
          userName: 'Mohammed Al-Kuwari',
          role: 'Renter',
          city: 'Doha',
          deliveryStatus: 'delivered',
          response: 'opened',
          timestamp: '2024-01-15T10:18:00Z'
        },
        {
          userId: '4',
          userName: 'Fatima Al-Sabah',
          role: 'Owner',
          city: 'Kuwait City',
          deliveryStatus: 'failed',
          response: 'none',
          timestamp: '2024-01-15T10:00:00Z'
        }
      ],
      message: {
        push: {
          title: 'Weekend Equipment Special!',
          body: 'Get 20% off all excavator rentals this weekend. Book now!'
        },
        email: {
          subject: 'Exclusive Weekend Offer - 20% Off Equipment Rentals',
          body: 'Don\'t miss out on our exclusive weekend offer...'
        }
      },
      incentive: {
        type: 'percentage',
        value: 20,
        appliesTo: 'Excavator rentals'
      }
    };
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      sent: { color: 'bg-green-600', icon: faCheckCircle, text: isRTL ? 'مُرسل' : 'Sent' },
      scheduled: { color: 'bg-blue-600', icon: faClock, text: isRTL ? 'مجدول' : 'Scheduled' },
      failed: { color: 'bg-red-600', icon: faTimesCircle, text: isRTL ? 'فشل' : 'Failed' },
      partial: { color: 'bg-yellow-600', icon: faExclamationTriangle, text: isRTL ? 'جزئي' : 'Partial' }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${config.color}`}>
        <FontAwesomeIcon icon={config.icon} className={`${isRTL ? 'ml-1' : 'mr-1'}`} /> 
        {config.text}
      </span>
    );
  };

  const getChannelIcons = (channels: string[]) => {
    const iconMap = {
      push: { icon: faBell, color: 'text-purple-400' },
      email: { icon: faEnvelope, color: 'text-blue-400' },
      sms: { icon: faSms, color: 'text-green-400' }
    };

    return channels.map(channel => {
      const config = iconMap[channel as keyof typeof iconMap];
      return (
        <FontAwesomeIcon
          key={channel}
          icon={config.icon}
          className={`${config.color} ${isRTL ? 'ml-1' : 'mr-1'}`}  
          title={channel}
        />
      );
    });
  };

  const filteredCampaigns = mockCampaigns.filter(campaign => {
    if (filters.channel && !campaign.channels.includes(filters.channel as any)) return false;
    if (filters.type && campaign.type !== filters.type) return false;
    if (filters.status && campaign.status !== filters.status) return false;
    if (filters.search && !campaign.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const openCampaignDetail = (campaignId: string) => {
    const detail = getCampaignDetail(campaignId);
    setSelectedCampaign(detail);
    setShowDetailModal(true);
  };

  const renderFilters = () => (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {isRTL ? 'القناة' : 'Channel'}
          </label>
          <select
            value={filters.channel}
            onChange={(e) => setFilters({ ...filters, channel: e.target.value })}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{isRTL ? 'جميع القنوات' : 'All Channels'}</option>
            <option value="push">{isRTL ? 'إشعارات فورية' : 'Push'}</option>
            <option value="email">{isRTL ? 'بريد إلكتروني' : 'Email'}</option>
            <option value="sms">{isRTL ? 'رسائل نصية' : 'SMS'}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {isRTL ? 'النوع' : 'Type'}
          </label>
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{isRTL ? 'جميع الأنواع' : 'All Types'}</option>
            <option value="manual">{isRTL ? 'يدوي' : 'Manual'}</option>
            <option value="triggered">{isRTL ? 'مُشغل تلقائياً' : 'Triggered'}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {isRTL ? 'الحالة' : 'Status'}
          </label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{isRTL ? 'جميع الحالات' : 'All Status'}</option>
            <option value="sent">{isRTL ? 'مُرسل' : 'Sent'}</option>
            <option value="scheduled">{isRTL ? 'مجدول' : 'Scheduled'}</option>
            <option value="failed">{isRTL ? 'فشل' : 'Failed'}</option>
            <option value="partial">{isRTL ? 'جزئي' : 'Partial'}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {isRTL ? 'من تاريخ' : 'From Date'}
          </label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {isRTL ? 'إلى تاريخ' : 'To Date'}
          </label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {isRTL ? 'بحث' : 'Search'}
          </label>
          <div className="relative">
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 pl-10"
              placeholder={isRTL ? 'ابحث عن حملة...' : 'Search campaigns...'}
            />
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderCampaignTable = () => (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                {isRTL ? 'اسم الحملة' : 'Campaign Name'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                {isRTL ? 'النوع' : 'Type'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                {isRTL ? 'القنوات' : 'Channels'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                {isRTL ? 'الجمهور' : 'Audience'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                {isRTL ? 'الحالة' : 'Status'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                {isRTL ? 'التاريخ' : 'Date'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                {isRTL ? 'الإجراءات' : 'Actions'}
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {filteredCampaigns.map((campaign) => (
              <tr key={campaign.id} className="hover:bg-gray-750 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-white">{campaign.name}</div>
                    {campaign.triggerRule && (
                      <div className="text-xs text-gray-400 flex items-center">
                        <FontAwesomeIcon icon={faCogs} className={`${isRTL ? 'ml-1' : 'mr-1'}`} />  
                        {campaign.triggerRule}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    campaign.type === 'manual' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {campaign.type === 'manual' ? (isRTL ? 'يدوي' : 'Manual') : (isRTL ? 'تلقائي' : 'Triggered')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={cn("flex items-center space-x-1", isRTL && "space-x-reverse")}>
                    {getChannelIcons(campaign.channels)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-300">
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={faUsers} className={`${isRTL ? 'ml-1' : 'mr-1'} text-gray-400`} />  
                      {campaign.targetAudienceSize.toLocaleString()}
                    </div>
                    {campaign.segment && (
                      <div className="text-xs text-gray-500 mt-1">{campaign.segment}</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(campaign.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {campaign.status === 'scheduled' ? (
                    <div>
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faClock} className={`${isRTL ? 'ml-1' : 'mr-1'} text-blue-400`} />  
                        {new Date(campaign.scheduledDate!).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(campaign.scheduledDate!).toLocaleTimeString()}
                      </div>
                    </div>
                  ) : (
                    <div>
                                             <div>{campaign.sentDate ? new Date(campaign.sentDate).toLocaleDateString() : 'Not sent'}</div>
                       <div className="text-xs text-gray-500">
                         {campaign.sentDate ? new Date(campaign.sentDate).toLocaleTimeString() : ''}
                       </div>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  <div className={cn("flex items-center space-x-2", isRTL && "space-x-reverse")}>
                    <button
                      onClick={() => openCampaignDetail(campaign.id)}
                      className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                      title={isRTL ? 'عرض التحليلات' : 'View Analytics'}
                    >
                      <FontAwesomeIcon icon={faChartLine} />
                    </button>
                    <button
                      className="p-2 text-green-400 hover:text-green-300 transition-colors"
                      title={isRTL ? 'عرض الرسالة' : 'View Message'}
                    >
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                    <button
                      className="p-2 text-gray-400 hover:text-gray-300 transition-colors"
                      title={isRTL ? 'نسخ' : 'Duplicate'}
                    >
                      <FontAwesomeIcon icon={faCopy} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCharts = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Campaign Types Chart */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          {isRTL ? 'أنواع الحملات' : 'Campaign Types'}
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={campaignTypeData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, value }) => `${name}: ${value}`}
              labelLine={false}
              style={{ fill: '#F9FAFB', fontSize: '12px', fontWeight: 'bold' }}
            >
              {campaignTypeData.map((entry, index) => (
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
      </div>

      {/* Performance Over Time */}
      <div className="lg:col-span-2 bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          {isRTL ? 'الأداء عبر الزمن' : 'Performance Over Time'}
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip 
              contentStyle={contentStyle}
              labelStyle={labelStyle}
              itemStyle={itemStyle}
            />
            <Legend />
            <Line type="monotone" dataKey="openRate" stroke="#3B82F6" name="Open Rate %" />
            <Line type="monotone" dataKey="ctr" stroke="#F59E0B" name="CTR %" />
            <Line type="monotone" dataKey="conversion" stroke="#10B981" name="Conversion %" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderDetailModal = () => {
    if (!selectedCampaign || !showDetailModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">
              {selectedCampaign.name}
            </h2>
            <button
              onClick={() => setShowDetailModal(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <FontAwesomeIcon icon={faTimes} className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">
                  {isRTL ? 'نظرة عامة' : 'Overview'}
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">{isRTL ? 'النوع:' : 'Type:'}</span>
                    <span className="text-white">{selectedCampaign.type === 'manual' ? (isRTL ? 'يدوي' : 'Manual') : (isRTL ? 'تلقائي' : 'Triggered')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">{isRTL ? 'القنوات:' : 'Channels:'}</span>
                    <div className={cn("flex space-x-1", isRTL && "space-x-reverse")}>
                      {getChannelIcons(selectedCampaign.channels)}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">{isRTL ? 'الجمهور:' : 'Audience:'}</span>
                    <span className="text-white">{selectedCampaign.targetAudienceSize.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">{isRTL ? 'الحالة:' : 'Status:'}</span>
                    {getStatusBadge(selectedCampaign.status)}
                  </div>
                </div>
              </div>

              {/* Delivery Stats */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">
                  {isRTL ? 'إحصائيات التسليم' : 'Delivery Stats'}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">
                      {selectedCampaign.metrics.totalSent.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-400">{isRTL ? 'إجمالي المُرسل' : 'Total Sent'}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {selectedCampaign.metrics.openRate}%
                    </div>
                    <div className="text-xs text-gray-400">{isRTL ? 'معدل الفتح' : 'Open Rate'}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">
                      {selectedCampaign.metrics.clickThroughRate}%
                    </div>
                    <div className="text-xs text-gray-400">{isRTL ? 'معدل النقر' : 'CTR'}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">
                      {selectedCampaign.metrics.conversionToBooking}%
                    </div>
                    <div className="text-xs text-gray-400">{isRTL ? 'معدل التحويل' : 'Conversion'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* User Interactions */}
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4">
                {isRTL ? 'تفاعل المستخدمين' : 'User Interactions'}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-600">
                      <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider py-2">
                        {isRTL ? 'المستخدم' : 'User'}
                      </th>
                      <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider py-2">
                        {isRTL ? 'الدور' : 'Role'}
                      </th>
                      <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider py-2">
                        {isRTL ? 'المدينة' : 'City'}
                      </th>
                      <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider py-2">
                        {isRTL ? 'حالة التسليم' : 'Delivery'}
                      </th>
                      <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider py-2">
                        {isRTL ? 'الاستجابة' : 'Response'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-600">
                    {selectedCampaign.userInteractions.map((interaction) => (
                      <tr key={interaction.userId}>
                        <td className="py-2 text-sm text-white">{interaction.userName}</td>
                        <td className="py-2 text-sm text-gray-300">{interaction.role}</td>
                        <td className="py-2 text-sm text-gray-300">{interaction.city}</td>
                        <td className="py-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                            interaction.deliveryStatus === 'delivered' 
                              ? 'bg-green-100 text-green-800' 
                              : interaction.deliveryStatus === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {interaction.deliveryStatus}
                          </span>
                        </td>
                        <td className="py-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                            interaction.response === 'booked' 
                              ? 'bg-purple-100 text-purple-800'
                              : interaction.response === 'clicked'
                              ? 'bg-blue-100 text-blue-800'
                              : interaction.response === 'opened'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {interaction.response}
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
      </div>
    );
  };

  return (
    <div className={`min-h-screen bg-gray-900 ${isRTL ? 'font-arabic' : 'font-montserrat'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
            <FontAwesomeIcon icon={faChartLine} className={`${isRTL ? 'ml-3' : 'mr-3'} text-blue-400`} />
            {isRTL ? 'سجلات وتحليلات الحملات' : 'Campaign Logs & Analytics'}
          </h1>
          <p className="text-gray-400">
            {isRTL ? 'تتبع أداء الحملات والمقاييس التفصيلية' : 'Track campaign performance and detailed metrics'}
          </p>
        </div>

        {/* Filters */}
        {renderFilters()}

        {/* Charts */}
        {renderCharts()}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {filteredCampaigns.length}
            </div>
            <div className="text-gray-400">
              {isRTL ? 'إجمالي الحملات' : 'Total Campaigns'}
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {filteredCampaigns.reduce((sum, c) => sum + c.metrics.totalSent, 0).toLocaleString()}
            </div>
            <div className="text-gray-400">
              {isRTL ? 'الرسائل المُرسلة' : 'Messages Sent'}
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-2">
              {(filteredCampaigns.reduce((sum, c) => sum + c.metrics.openRate, 0) / filteredCampaigns.length).toFixed(1)}%
            </div>
            <div className="text-gray-400">
              {isRTL ? 'متوسط معدل الفتح' : 'Avg. Open Rate'}
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">
              {(filteredCampaigns.reduce((sum, c) => sum + c.metrics.conversionToBooking, 0) / filteredCampaigns.length).toFixed(1)}%
            </div>
            <div className="text-gray-400">
              {isRTL ? 'متوسط التحويل' : 'Avg. Conversion'}
            </div>
          </div>
        </div>

        {/* Campaign Table */}
        {renderCampaignTable()}

        {/* Detail Modal */}
        {renderDetailModal()}
      </div>
    </div>
  );
};

export default CampaignAnalytics;