'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import AudienceSegmentBuilder from '@/components/AudienceSegmentBuilder';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import {
  faSave,
  faRocket,
  faEye,
  faClock,
  faCalendarAlt,
  faUsers,
  faEnvelope,
  faSms,
  faBell,
  faGift,
  faPercent,
  faDollarSign,
  faMapMarkerAlt,
  faSearch,
  faTags,
  faFilter,
  faPlus,
  faTimes,
  faToggleOn,
  faToggleOff,
  faEdit,
  faCode,
  faLanguage,
  faQuestionCircle,
  faInfoCircle,
  faExclamationTriangle,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';

interface Campaign {
  id?: string;
  name: string;
  type: 'manual' | 'triggered';
  channels: ('push' | 'email' | 'sms')[];
  startTime: string;
  expiryTime: string;
  runImmediately: boolean;
  messages: {
    en: {
      push?: { title: string; body: string; };
      email?: { subject: string; body: string; };
      sms?: { body: string; };
    };
    ar: {
      push?: { title: string; body: string; };
      email?: { subject: string; body: string; };
      sms?: { body: string; };
    };
  };
  audience: {
    roles: ('renter' | 'owner')[];
    cities: string[];
    activityFilters: string[];
    equipmentInterests: string[];
  };
  incentive: {
    enabled: boolean;
    type: 'percentage' | 'fixed';
    appliesTo: 'commission' | 'rental' | 'both';
    value: number;
    validityDays: number;
  };
  estimatedReach: number;
}

const CampaignCreator: React.FC = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [campaign, setCampaign] = useState<Campaign>({
    name: '',
    type: 'manual',
    channels: [],
    startTime: '',
    expiryTime: '',
    runImmediately: true,
    messages: {
      en: {},
      ar: {}
    },
    audience: {
      roles: [],
      cities: [],
      activityFilters: [],
      equipmentInterests: []
    },
    incentive: {
      enabled: false,
      type: 'percentage',
      appliesTo: 'rental',
      value: 0,
      validityDays: 30
    },
    estimatedReach: 0
  });

  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'ar'>('en');
  const [activeSection, setActiveSection] = useState<string>('setup');
  const [showPreview, setShowPreview] = useState(false);

  // Mock data
  const availableCities = ['Riyadh', 'Dubai', 'Kuwait City', 'Doha', 'Manama', 'Muscat'];
  const activityFilterOptions = [
    'Booked in last 30 days',
    'Never booked',
    'Active this month',
    'High-value customers',
    'New users (< 30 days)',
    'Inactive users (> 90 days)'
  ];
  const equipmentTypes = ['Excavator', 'Crane', 'Bulldozer', 'Loader', 'Dump Truck', 'Forklift'];

  const placeholders = [
    { key: 'user_name', description: 'User\'s name', example: 'Ahmed Mohammed' },
    { key: 'city', description: 'User\'s city', example: 'Riyadh' },
    { key: 'equipment_type', description: 'Equipment of interest', example: 'Excavator' },
    { key: 'discount_amount', description: 'Discount value', example: '20%' },
    { key: 'company_name', description: 'Company name', example: 'Awnash' }
  ];

  const updateCampaign = (updates: Partial<Campaign>) => {
    setCampaign(prev => ({ ...prev, ...updates }));
  };

  const updateMessage = (channel: 'push' | 'email' | 'sms', field: string, value: string) => {
    setCampaign(prev => ({
      ...prev,
      messages: {
        ...prev.messages,
        [currentLanguage]: {
          ...prev.messages[currentLanguage],
          [channel]: {
            ...prev.messages[currentLanguage][channel],
            [field]: value
          }
        }
      }
    }));
  };

  const addAudienceFilter = (type: 'cities' | 'activityFilters' | 'equipmentInterests', value: string) => {
    if (!campaign.audience[type].includes(value)) {
      updateCampaign({
        audience: {
          ...campaign.audience,
          [type]: [...campaign.audience[type], value]
        }
      });
    }
  };

  const removeAudienceFilter = (type: 'cities' | 'activityFilters' | 'equipmentInterests', value: string) => {
    updateCampaign({
      audience: {
        ...campaign.audience,
        [type]: campaign.audience[type].filter(item => item !== value)
      }
    });
  };

  const calculateEstimatedReach = () => {
    // Mock calculation based on filters
    let baseUsers = 10000;
    if (campaign.audience.roles.length > 0 && campaign.audience.roles.length < 2) {
      baseUsers *= 0.6; // Single role selection
    }
    if (campaign.audience.cities.length > 0) {
      baseUsers *= (campaign.audience.cities.length / availableCities.length);
    }
    if (campaign.audience.activityFilters.length > 0) {
      baseUsers *= 0.3; // Activity filters reduce reach
    }
    return Math.floor(baseUsers);
  };

  React.useEffect(() => {
    const estimatedReach = calculateEstimatedReach();
    setCampaign(prev => ({ ...prev, estimatedReach }));
  }, [campaign.audience]);

  const renderCampaignSetup = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            {isRTL ? 'اسم الحملة' : 'Campaign Name'}
          </label>
          <input
            type="text"
            value={campaign.name}
            onChange={(e) => updateCampaign({ name: e.target.value })}
            className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:ring-2 focus:ring-blue-500"
            placeholder={isRTL ? 'أدخل اسم الحملة...' : 'Enter campaign name...'}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            {isRTL ? 'نوع الحملة' : 'Campaign Type'}
          </label>
          <select
            value={campaign.type}
            onChange={(e) => updateCampaign({ type: e.target.value as 'manual' | 'triggered' })}
            className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:ring-2 focus:ring-blue-500"
          >
            <option value="manual">{isRTL ? 'يدوي' : 'Manual'}</option>
            <option value="triggered">{isRTL ? 'مُشغل تلقائياً' : 'Triggered'}</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-3">
          {isRTL ? 'قنوات الإرسال' : 'Channels'}
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { key: 'push', icon: faBell, label: isRTL ? 'إشعارات فورية' : 'Push Notifications' },
            { key: 'email', icon: faEnvelope, label: isRTL ? 'البريد الإلكتروني' : 'Email' },
            { key: 'sms', icon: faSms, label: isRTL ? 'الرسائل النصية' : 'SMS' }
          ].map((channel) => (
            <label key={channel.key} className="flex items-center p-4 bg-muted rounded-lg cursor-pointer hover:bg-muted transition-colors">
              <input
                type="checkbox"
                checked={campaign.channels.includes(channel.key as any)}
                onChange={(e) => {
                  if (e.target.checked) {
                    updateCampaign({ channels: [...campaign.channels, channel.key as any] });
                  } else {
                    updateCampaign({ channels: campaign.channels.filter(c => c !== channel.key) });
                  }
                }}
                className="sr-only"
              />
              <div className={cn("w-4 h-4 rounded border-2 flex items-center justify-center", 
                isRTL ? "ml-3" : "mr-3",
                campaign.channels.includes(channel.key as any) ? 'bg-blue-600 border-blue-600' : 'border-gray-400'
              )}>
                {campaign.channels.includes(channel.key as any) && (
                  <FontAwesomeIcon icon={faCheckCircle} className="text-foreground text-xs" />
                )}
              </div>
              <FontAwesomeIcon icon={channel.icon} className={cn("text-blue-400", isRTL ? "ml-3" : "mr-3")} />
              <span className="text-foreground">{channel.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            {isRTL ? 'وقت البدء' : 'Start Time'}
          </label>
          <input
            type="datetime-local"
            value={campaign.startTime}
            onChange={(e) => updateCampaign({ startTime: e.target.value })}
            disabled={campaign.runImmediately}
            className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            {isRTL ? 'وقت الانتهاء' : 'Expiry Time'}
          </label>
          <input
            type="datetime-local"
            value={campaign.expiryTime}
            onChange={(e) => updateCampaign({ expiryTime: e.target.value })}
            className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex items-center">
        <button
          onClick={() => updateCampaign({ runImmediately: !campaign.runImmediately })}
          className={cn("p-2 rounded-full transition-colors", 
            isRTL ? "ml-3" : "mr-3",
            campaign.runImmediately ? 'bg-yellow-600 text-foreground' : 'bg-gray-600 text-muted-foreground'
          )}
        >
          <FontAwesomeIcon icon={campaign.runImmediately ? faToggleOn : faToggleOff} />
        </button>
        <span className="text-muted-foreground">
          {isRTL ? 'تشغيل فوري' : 'Run Immediately'}
        </span>
      </div>
    </div>
  );

  const renderMessageBuilder = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          {isRTL ? 'منشئ الرسائل' : 'Message Builder'}
        </h3>
        <div className={cn("flex items-center space-x-2", isRTL && "space-x-reverse")}>
          <button
            onClick={() => setCurrentLanguage('en')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              currentLanguage === 'en' ? 'bg-blue-600 text-foreground' : 'bg-gray-600 text-muted-foreground'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setCurrentLanguage('ar')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              currentLanguage === 'ar' ? 'bg-blue-600 text-foreground' : 'bg-gray-600 text-muted-foreground'
            }`}
          >
            AR
          </button>
        </div>
      </div>

      {campaign.channels.includes('push') && (
        <div className="bg-muted rounded-lg p-6">
          <h4 className="text-md font-medium text-foreground mb-4 flex items-center">
            <FontAwesomeIcon icon={faBell} className={cn("text-purple-400", isRTL ? "ml-2" : "mr-2")} />
            {isRTL ? 'الإشعارات الفورية' : 'Push Notifications'}
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                {isRTL ? 'العنوان' : 'Title'}
              </label>
              <input
                type="text"
                value={campaign.messages[currentLanguage].push?.title || ''}
                onChange={(e) => updateMessage('push', 'title', e.target.value)}
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-foreground focus:ring-2 focus:ring-blue-500"
                placeholder={isRTL ? 'عنوان الإشعار...' : 'Notification title...'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                {isRTL ? 'النص' : 'Body'}
              </label>
              <textarea
                rows={3}
                value={campaign.messages[currentLanguage].push?.body || ''}
                onChange={(e) => updateMessage('push', 'body', e.target.value)}
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-foreground focus:ring-2 focus:ring-blue-500"
                placeholder={isRTL ? 'نص الإشعار...' : 'Notification body...'}
              />
            </div>
          </div>
        </div>
      )}

      {campaign.channels.includes('email') && (
        <div className="bg-muted rounded-lg p-6">
          <h4 className="text-md font-medium text-foreground mb-4 flex items-center">
            <FontAwesomeIcon icon={faEnvelope} className={cn("text-blue-400", isRTL ? "ml-2" : "mr-2")} />
            {isRTL ? 'البريد الإلكتروني' : 'Email'}
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                {isRTL ? 'الموضوع' : 'Subject'}
              </label>
              <input
                type="text"
                value={campaign.messages[currentLanguage].email?.subject || ''}
                onChange={(e) => updateMessage('email', 'subject', e.target.value)}
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-foreground focus:ring-2 focus:ring-blue-500"
                placeholder={isRTL ? 'موضوع الرسالة...' : 'Email subject...'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                {isRTL ? 'نص الرسالة' : 'Body'}
              </label>
              <textarea
                rows={6}
                value={campaign.messages[currentLanguage].email?.body || ''}
                onChange={(e) => updateMessage('email', 'body', e.target.value)}
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-foreground focus:ring-2 focus:ring-blue-500"
                placeholder={isRTL ? 'نص الرسالة الإلكترونية...' : 'Email body...'}
              />
            </div>
          </div>
        </div>
      )}

      {campaign.channels.includes('sms') && (
        <div className="bg-muted rounded-lg p-6">
          <h4 className="text-md font-medium text-foreground mb-4 flex items-center">
            <FontAwesomeIcon icon={faSms} className={cn("text-green-400", isRTL ? "ml-2" : "mr-2")} />
            {isRTL ? 'الرسائل النصية' : 'SMS'}
          </h4>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              {isRTL ? 'النص' : 'Message'}
            </label>
            <textarea
              rows={3}
              value={campaign.messages[currentLanguage].sms?.body || ''}
              onChange={(e) => updateMessage('sms', 'body', e.target.value)}
              className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-foreground focus:ring-2 focus:ring-blue-500"
              placeholder={isRTL ? 'نص الرسالة النصية...' : 'SMS message...'}
              maxLength={160}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {campaign.messages[currentLanguage].sms?.body?.length || 0}/160 {isRTL ? 'حرف' : 'characters'}
            </p>
          </div>
        </div>
      )}

      {/* Placeholders Help */}
      <div className="bg-blue-900 border border-blue-700 rounded-lg p-4">
        <h5 className="text-blue-200 font-medium mb-2">
          {isRTL ? 'المتغيرات المتاحة' : 'Available Placeholders'}
        </h5>
        <div className="flex flex-wrap gap-2">
          {placeholders.map((placeholder) => (
            <code key={placeholder.key} className="text-yellow-400 bg-blue-800 px-2 py-1 rounded text-sm">
              {`{${placeholder.key}}`}
            </code>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTargetAudience = () => (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          {isRTL ? 'استهداف الجمهور' : 'Audience Targeting'}
        </h3>
        <p className="text-muted-foreground text-sm mb-4">
          {isRTL ? 'استخدم منشئ الشرائح لتحديد الجمهور المستهدف بدقة' : 'Use the segment builder to precisely define your target audience'}
        </p>
      </div>

      <AudienceSegmentBuilder 
        onSegmentSave={(segment) => {
          // Update campaign audience based on segment
          updateCampaign({ estimatedReach: segment.estimatedReach });
        }}
        existingSegments={[
          {
            id: '1',
            name: 'Active Renters - Riyadh',
            description: 'Renters who made bookings in the last 30 days in Riyadh',
            visibility: 'public',
            conditions: [
              { id: '1', field: 'role', operator: 'equals', value: 'Renter', logic: 'AND' },
              { id: '2', field: 'city', operator: 'equals', value: 'Riyadh', logic: 'AND' },
              { id: '3', field: 'bookingsMade', operator: 'greater_than', value: 0, logic: 'AND' }
            ],
            estimatedReach: 1250,
            createdBy: 'Admin',
            createdAt: '2024-01-15T10:00:00Z',
            lastModified: '2024-01-15T10:00:00Z'
          },
          {
            id: '2',
            name: 'High-Value Owners',
            description: 'Equipment owners with revenue > 5000 SAR',
            visibility: 'public',
            conditions: [
              { id: '1', field: 'role', operator: 'equals', value: 'Owner', logic: 'AND' },
              { id: '2', field: 'revenueGenerated', operator: 'greater_than', value: 5000, logic: 'AND' }
            ],
            estimatedReach: 890,
            createdBy: 'Admin',
            createdAt: '2024-01-10T14:30:00Z',
            lastModified: '2024-01-10T14:30:00Z'
          }
        ]}
      />
    </div>
  );

  const renderIncentive = () => (
    <div className="space-y-6">
      <div className="flex items-center">
        <button
          onClick={() => updateCampaign({
            incentive: {
              ...campaign.incentive,
              enabled: !campaign.incentive?.enabled
            }
          })}
          className={`p-2 rounded-full transition-colors ${isRTL ? 'ml-3' : 'mr-3'} ${  
            campaign.incentive?.enabled ? 'bg-yellow-600 text-foreground' : 'bg-gray-600 text-muted-foreground'
          }`}
        >
          <FontAwesomeIcon icon={campaign.incentive?.enabled ? faToggleOn : faToggleOff} />
        </button>
        <span className="text-muted-foreground">
          {isRTL ? 'تضمين خصم' : 'Include Discount'}
        </span>
      </div>

      {campaign.incentive?.enabled && (
        <div className="space-y-6 bg-muted rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                {isRTL ? 'نوع الخصم' : 'Discount Type'}
              </label>
              <select
                value={campaign.incentive?.type || 'percentage'}
                onChange={(e) => updateCampaign({
                  incentive: {
                    ...campaign.incentive,
                    type: e.target.value as 'percentage' | 'fixed'
                  }
                })}
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-foreground focus:ring-2 focus:ring-blue-500"
              >
                <option value="percentage">{isRTL ? 'نسبة مئوية' : 'Percentage'}</option>
                <option value="fixed">{isRTL ? 'مبلغ ثابت' : 'Fixed Amount'}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                {isRTL ? 'ينطبق على' : 'Applies To'}
              </label>
              <select
                value={campaign.incentive?.appliesTo || 'rental'}
                onChange={(e) => updateCampaign({
                  incentive: {
                    ...campaign.incentive,
                    appliesTo: e.target.value as 'commission' | 'rental' | 'both'
                  }
                })}
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-foreground focus:ring-2 focus:ring-blue-500"
              >
                <option value="rental">{isRTL ? 'رسوم الإيجار' : 'Rental Fee'}</option>
                <option value="commission">{isRTL ? 'العمولة' : 'Commission'}</option>
                <option value="both">{isRTL ? 'كلاهما' : 'Both'}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                {isRTL ? 'القيمة' : 'Value'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={campaign.incentive?.value || ''}
                  onChange={(e) => updateCampaign({
                    incentive: {
                      ...campaign.incentive,
                      value: parseFloat(e.target.value) || 0
                    }
                  })}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-foreground focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <FontAwesomeIcon 
                    icon={campaign.incentive?.type === 'percentage' ? faPercent : faDollarSign} 
                    className="text-muted-foreground" 
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                {isRTL ? 'مدة الصلاحية (أيام)' : 'Validity (Days)'}
              </label>
              <input
                type="number"
                value={campaign.incentive?.validityDays || ''}
                onChange={(e) => updateCampaign({
                  incentive: {
                    ...campaign.incentive,
                    validityDays: parseInt(e.target.value) || 30
                  }
                })}
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-foreground focus:ring-2 focus:ring-blue-500"
                placeholder="30"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const sections = [
    { key: 'setup', label: isRTL ? 'إعداد الحملة' : 'Campaign Setup', icon: faClock },
    { key: 'messages', label: isRTL ? 'الرسائل' : 'Messages', icon: faEnvelope },
    { key: 'audience', label: isRTL ? 'الجمهور' : 'Audience', icon: faUsers },
    { key: 'incentive', label: isRTL ? 'الحافز' : 'Incentive', icon: faGift }
  ];

  return (
    <div className={`min-h-screen bg-background ${isRTL ? 'font-arabic' : 'font-montserrat'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            {isRTL ? 'منشئ الحملات' : 'Campaign Creator'}
          </h1>
          <p className="text-muted-foreground">
            {isRTL ? 'إنشاء وإطلاق حملات تسويقية مستهدفة' : 'Create and launch targeted marketing campaigns'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.key}
                  onClick={() => setActiveSection(section.key)}
                  className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                    activeSection === section.key
                      ? 'bg-blue-600 text-foreground'
                      : 'bg-card text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <FontAwesomeIcon icon={section.icon} className={cn(isRTL ? "ml-3" : "mr-3")} />
                  {section.label}
                </button>
              ))}
            </nav>

            {/* Action Buttons */}
            <div className="mt-8 space-y-3">
              <Button variant="success" className="w-full justify-center">
                <FontAwesomeIcon icon={faRocket} className={cn(isRTL ? "ml-2" : "mr-2")} />
                {isRTL ? 'إطلاق الآن' : 'Launch Now'}
              </Button>
              <Button variant="dark" className="w-full justify-center">
                <FontAwesomeIcon icon={faSave} className={cn(isRTL ? "ml-2" : "mr-2")} />
                {isRTL ? 'حفظ كمسودة' : 'Save Draft'}
              </Button>
              <Button 
                variant="accent"
                onClick={() => setShowPreview(true)}
                className="w-full justify-center"
              >
                <FontAwesomeIcon icon={faEye} className={cn(isRTL ? "ml-2" : "mr-2")} />
                {isRTL ? 'معاينة' : 'Preview'}
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-card rounded-xl border border-border shadow-lg p-6">
              {activeSection === 'setup' && renderCampaignSetup()}
              {activeSection === 'messages' && renderMessageBuilder()}
              {activeSection === 'audience' && renderTargetAudience()}
              {activeSection === 'incentive' && renderIncentive()}
            </div>
          </div>
        </div>

        {/* Preview Modal */}
        {showPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-xl border border-border shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">
                  {isRTL ? 'معاينة الحملة' : 'Campaign Preview'}
                </h2>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{campaign.name || 'Untitled Campaign'}</h3>
                  <div className="flex flex-wrap gap-2">
                    {campaign.channels.map((channel) => (
                      <span key={channel} className="px-2 py-1 bg-blue-600 text-foreground rounded text-sm">
                        {channel.charAt(0).toUpperCase() + channel.slice(1)}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <h4 className="font-medium text-muted-foreground mb-2">
                    {isRTL ? 'الجمهور المستهدف' : 'Target Audience'}
                  </h4>
                  <p className="text-muted-foreground">
                    {campaign.estimatedReach.toLocaleString()} {isRTL ? 'مستخدم' : 'users'}
                  </p>
                </div>

                {campaign.incentive?.enabled && (
                  <div className="border-t border-border pt-4">
                    <h4 className="font-medium text-muted-foreground mb-2">
                      {isRTL ? 'الحافز' : 'Incentive'}
                    </h4>
                    <p className="text-muted-foreground">
                      {campaign.incentive.value}
                      {campaign.incentive.type === 'percentage' ? '%' : ' SAR'} 
                      {isRTL ? ' خصم' : ' discount'} 
                      {isRTL ? ` لمدة ${campaign.incentive.validityDays} أيام` : ` valid for ${campaign.incentive.validityDays} days`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignCreator; 