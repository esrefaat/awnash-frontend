'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBell,
  faEnvelope,
  faSms,
  faMobile,
  faGlobe,
  faCog,
  faFileAlt,
  faToggleOn,
  faToggleOff,
  faExclamationTriangle,
  faCheckCircle,
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

type NotificationSettingsTab = 'overview' | 'channels' | 'maintenance';

const NotificationSettingsPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [activeTab, setActiveTab] = useState<NotificationSettingsTab>('overview');
  
  // Mock settings state
  const [channelSettings, setChannelSettings] = useState({
    push: { enabled: true, rateLimit: 10 },
    inApp: { enabled: true, rateLimit: 50 },
    email: { enabled: true, rateLimit: 20 },
    sms: { enabled: false, rateLimit: 5 },
    whatsapp: { enabled: false, rateLimit: 5 },
  });
  
  const [maintenanceMode, setMaintenanceMode] = useState({
    enabled: false,
    message: '',
    allowCritical: true,
  });

  const toggleChannel = (channel: keyof typeof channelSettings) => {
    setChannelSettings(prev => ({
      ...prev,
      [channel]: { ...prev[channel], enabled: !prev[channel].enabled }
    }));
  };

  const SettingCard = ({ 
    title, 
    description, 
    icon, 
    href,
    badge,
  }: { 
    title: string; 
    description: string; 
    icon: typeof faBell;
    href: string;
    badge?: string;
  }) => (
    <Link
      href={href}
      className="block bg-card rounded-xl border border-border p-6 hover:border-blue-500 transition-all group"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
            <FontAwesomeIcon icon={icon} className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-foreground">{title}</h3>
              {badge && (
                <span className="px-2 py-0.5 bg-green-600 text-white text-xs rounded-full">
                  {badge}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
        </div>
        <FontAwesomeIcon 
          icon={faArrowRight} 
          className={`h-5 w-5 text-muted-foreground group-hover:text-blue-400 transition-colors ${isRTL ? 'rotate-180' : ''}`} 
        />
      </div>
    </Link>
  );

  const ChannelToggle = ({
    name,
    icon,
    enabled,
    onToggle,
    description,
  }: {
    name: string;
    icon: typeof faBell;
    enabled: boolean;
    onToggle: () => void;
    description: string;
  }) => (
    <div className="flex items-center justify-between py-4 border-b border-border last:border-0">
      <div className="flex items-center gap-4">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${enabled ? 'bg-blue-600' : 'bg-gray-600'}`}>
          <FontAwesomeIcon icon={icon} className="h-5 w-5 text-white" />
        </div>
        <div>
          <h4 className="font-medium text-foreground">{name}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <button
        onClick={onToggle}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          enabled ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
        }`}
      >
        <FontAwesomeIcon icon={enabled ? faToggleOn : faToggleOff} className="h-5 w-5" />
        <span className="text-sm font-medium">{enabled ? 'Enabled' : 'Disabled'}</span>
      </button>
    </div>
  );

  return (
    <div className={`min-h-screen bg-background ${isRTL ? 'font-arabic' : 'font-montserrat'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            {isRTL ? 'إعدادات الإشعارات' : 'Notification Settings'}
          </h1>
          <p className="text-muted-foreground">
            {isRTL 
              ? 'إدارة قوالب الإشعارات والقنوات وإعدادات النظام'
              : 'Manage notification templates, channels, and system-wide settings'}
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-border mb-8">
          <nav className={cn("flex space-x-6", isRTL && "space-x-reverse")}>
            {[
              { id: 'overview', label: isRTL ? 'نظرة عامة' : 'Overview' },
              { id: 'channels', label: isRTL ? 'القنوات' : 'Channels' },
              { id: 'maintenance', label: isRTL ? 'وضع الصيانة' : 'Maintenance' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as NotificationSettingsTab)}
                className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-card rounded-xl border border-border p-4">
                <p className="text-sm text-muted-foreground">{isRTL ? 'القوالب النشطة' : 'Active Templates'}</p>
                <p className="text-2xl font-bold text-foreground mt-1">40</p>
              </div>
              <div className="bg-card rounded-xl border border-border p-4">
                <p className="text-sm text-muted-foreground">{isRTL ? 'القنوات المفعلة' : 'Enabled Channels'}</p>
                <p className="text-2xl font-bold text-foreground mt-1">3/5</p>
              </div>
              <div className="bg-card rounded-xl border border-border p-4">
                <p className="text-sm text-muted-foreground">{isRTL ? 'اللغات المدعومة' : 'Supported Languages'}</p>
                <p className="text-2xl font-bold text-foreground mt-1">3</p>
              </div>
              <div className="bg-card rounded-xl border border-border p-4">
                <p className="text-sm text-muted-foreground">{isRTL ? 'وضع الصيانة' : 'Maintenance Mode'}</p>
                <p className={`text-2xl font-bold mt-1 ${maintenanceMode.enabled ? 'text-yellow-400' : 'text-green-400'}`}>
                  {maintenanceMode.enabled ? (isRTL ? 'مفعل' : 'ON') : (isRTL ? 'معطل' : 'OFF')}
                </p>
              </div>
            </div>

            {/* Settings Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SettingCard
                title={isRTL ? 'قوالب الإشعارات' : 'Notification Templates'}
                description={isRTL 
                  ? 'إدارة وتحرير قوالب الرسائل بالإنجليزية والعربية والأردية'
                  : 'Manage and edit message templates in English, Arabic, and Urdu'}
                icon={faFileAlt}
                href="/content/message-templates"
                badge="40 templates"
              />
              <SettingCard
                title={isRTL ? 'إعدادات القنوات' : 'Channel Settings'}
                description={isRTL 
                  ? 'تفعيل/تعطيل قنوات الإشعارات وتعيين حدود المعدل'
                  : 'Enable/disable notification channels and set rate limits'}
                icon={faGlobe}
                href="#"
              />
              <SettingCard
                title={isRTL ? 'تفضيلات المستخدم الافتراضية' : 'Default User Preferences'}
                description={isRTL 
                  ? 'تعيين تفضيلات الإشعارات الافتراضية للمستخدمين الجدد'
                  : 'Set default notification preferences for new users'}
                icon={faCog}
                href="#"
              />
              <SettingCard
                title={isRTL ? 'سجل الإشعارات' : 'Notification Logs'}
                description={isRTL 
                  ? 'عرض سجل الإشعارات المرسلة وحالة التسليم'
                  : 'View sent notification history and delivery status'}
                icon={faBell}
                href="/engagement/notifications"
              />
            </div>

            {/* Alert for incomplete setup */}
            <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <FontAwesomeIcon icon={faExclamationTriangle} className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                    {isRTL ? 'إعداد غير مكتمل' : 'Incomplete Setup'}
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    {isRTL 
                      ? 'قنوات SMS و WhatsApp معطلة. قم بتفعيلها لإرسال إشعارات عبر هذه القنوات.'
                      : 'SMS and WhatsApp channels are disabled. Enable them to send notifications via these channels.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Channels Tab */}
        {activeTab === 'channels' && (
          <div className="space-y-6">
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                {isRTL ? 'قنوات الإشعارات' : 'Notification Channels'}
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                {isRTL 
                  ? 'تفعيل أو تعطيل قنوات الإشعارات على مستوى النظام'
                  : 'Enable or disable notification channels system-wide'}
              </p>
              
              <div className="space-y-2">
                <ChannelToggle
                  name={isRTL ? 'إشعارات الدفع' : 'Push Notifications'}
                  icon={faMobile}
                  enabled={channelSettings.push.enabled}
                  onToggle={() => toggleChannel('push')}
                  description={isRTL ? 'إشعارات فورية للأجهزة المحمولة' : 'Real-time alerts to mobile devices'}
                />
                <ChannelToggle
                  name={isRTL ? 'إشعارات التطبيق' : 'In-App Notifications'}
                  icon={faBell}
                  enabled={channelSettings.inApp.enabled}
                  onToggle={() => toggleChannel('inApp')}
                  description={isRTL ? 'إشعارات داخل التطبيق' : 'Notifications within the app'}
                />
                <ChannelToggle
                  name={isRTL ? 'البريد الإلكتروني' : 'Email'}
                  icon={faEnvelope}
                  enabled={channelSettings.email.enabled}
                  onToggle={() => toggleChannel('email')}
                  description={isRTL ? 'رسائل البريد الإلكتروني المفصلة' : 'Detailed email messages'}
                />
                <ChannelToggle
                  name="SMS"
                  icon={faSms}
                  enabled={channelSettings.sms.enabled}
                  onToggle={() => toggleChannel('sms')}
                  description={isRTL ? 'رسائل نصية قصيرة' : 'Short text messages'}
                />
                <ChannelToggle
                  name="WhatsApp"
                  icon={faGlobe}
                  enabled={channelSettings.whatsapp.enabled}
                  onToggle={() => toggleChannel('whatsapp')}
                  description={isRTL ? 'رسائل واتساب' : 'WhatsApp messages'}
                />
              </div>
            </div>

            {/* Provider Configuration */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                {isRTL ? 'إعدادات المزودين' : 'Provider Configuration'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">Firebase Cloud Messaging</span>
                    <span className="flex items-center text-green-400 text-sm">
                      <FontAwesomeIcon icon={faCheckCircle} className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                      {isRTL ? 'متصل' : 'Connected'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Push notifications for Android</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">Apple Push Notification</span>
                    <span className="flex items-center text-yellow-400 text-sm">
                      <FontAwesomeIcon icon={faExclamationTriangle} className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                      {isRTL ? 'غير مهيأ' : 'Not Configured'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Push notifications for iOS</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">SendGrid</span>
                    <span className="flex items-center text-green-400 text-sm">
                      <FontAwesomeIcon icon={faCheckCircle} className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                      {isRTL ? 'متصل' : 'Connected'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Email delivery</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">Twilio</span>
                    <span className="flex items-center text-gray-400 text-sm">
                      <FontAwesomeIcon icon={faExclamationTriangle} className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                      {isRTL ? 'غير مهيأ' : 'Not Configured'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">SMS & WhatsApp</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Maintenance Tab */}
        {activeTab === 'maintenance' && (
          <div className="space-y-6">
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {isRTL ? 'وضع الصيانة' : 'Maintenance Mode'}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {isRTL 
                      ? 'إيقاف جميع الإشعارات مؤقتاً أثناء صيانة النظام'
                      : 'Temporarily pause all notifications during system maintenance'}
                  </p>
                </div>
                <button
                  onClick={() => setMaintenanceMode(prev => ({ ...prev, enabled: !prev.enabled }))}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
                    maintenanceMode.enabled 
                      ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                      : 'bg-gray-600 text-white hover:bg-gray-700'
                  }`}
                >
                  <FontAwesomeIcon icon={maintenanceMode.enabled ? faToggleOn : faToggleOff} className="h-5 w-5" />
                  {maintenanceMode.enabled 
                    ? (isRTL ? 'مفعل' : 'Enabled') 
                    : (isRTL ? 'معطل' : 'Disabled')}
                </button>
              </div>

              {maintenanceMode.enabled && (
                <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg p-4 mb-6">
                  <p className="text-yellow-700 dark:text-yellow-200 text-sm">
                    {isRTL 
                      ? 'وضع الصيانة مفعل. لن يتم إرسال أي إشعارات حتى يتم تعطيله.'
                      : 'Maintenance mode is ON. No notifications will be sent until disabled.'}
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    {isRTL ? 'رسالة الصيانة (اختياري)' : 'Maintenance Message (Optional)'}
                  </label>
                  <textarea
                    rows={3}
                    value={maintenanceMode.message}
                    onChange={(e) => setMaintenanceMode(prev => ({ ...prev, message: e.target.value }))}
                    placeholder={isRTL ? 'أدخل رسالة للمستخدمين...' : 'Enter a message for users...'}
                    className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between py-4">
                  <div>
                    <h4 className="font-medium text-foreground">
                      {isRTL ? 'السماح بالإشعارات الحرجة' : 'Allow Critical Notifications'}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {isRTL 
                        ? 'إرسال الإشعارات ذات الأولوية الحرجة حتى أثناء الصيانة'
                        : 'Send CRITICAL priority notifications even during maintenance'}
                    </p>
                  </div>
                  <button
                    onClick={() => setMaintenanceMode(prev => ({ ...prev, allowCritical: !prev.allowCritical }))}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      maintenanceMode.allowCritical 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-600 text-gray-300'
                    }`}
                  >
                    <FontAwesomeIcon icon={maintenanceMode.allowCritical ? faToggleOn : faToggleOff} className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Scheduled Maintenance */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                {isRTL ? 'الصيانة المجدولة' : 'Scheduled Maintenance'}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {isRTL 
                  ? 'لا توجد صيانة مجدولة حالياً'
                  : 'No scheduled maintenance windows'}
              </p>
              <button className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors">
                {isRTL ? 'جدولة صيانة' : 'Schedule Maintenance'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationSettingsPage;
