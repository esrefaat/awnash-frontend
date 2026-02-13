'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '@/components/ui/Button';
import {
  faBell,
  faSearch,
  faFilter,
  faCalendar,
  faEye,
  faTimes,
  faCheck,
  faArchive,
  faExternalLink,
  faUser,
  faBuilding,
  faTruck,
  faFileAlt,
  faExclamationTriangle,
  faCog,
  faCalendarCheck,
  faFlag,
  faShieldAlt,
  faEnvelope,
  faSms,
  faToggleOn,
  faToggleOff,
  faComment,
  faDollarSign,
  faClock,
  faCheckCircle,
  faInfoCircle,
  faWarning
} from '@fortawesome/free-solid-svg-icons';

interface Notification {
  id: string;
  type: 'booking' | 'document' | 'user' | 'system' | 'flagged_content';
  title: string;
  message: string;
  timestamp: string;
  status: 'unread' | 'read' | 'archived';
  linkedEntityId?: string;
  linkedEntityType?: 'booking' | 'user' | 'equipment' | 'document';
  priority: 'low' | 'medium' | 'high' | 'critical';
  triggeredBy?: string;
  metadata?: Record<string, any>;
}

interface NotificationSettings {
  bookingAlerts: boolean;
  documentUpdates: boolean;
  userFlags: boolean;
  systemAlerts: boolean;
  realTimeAlerts: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

const NotificationsCenter: React.FC = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'all' | 'booking' | 'document' | 'user' | 'system' | 'flagged_content' | 'settings'>('all');

  // Mock notifications data
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 'NOTIF-001',
      type: 'booking',
      title: 'New Booking Confirmed',
      message: 'Ahmed Construction Co. has confirmed booking BK-2024-001 for Caterpillar 320D Excavator',
      timestamp: '2024-06-15T10:30:00Z',
      status: 'unread',
      linkedEntityId: 'BK-2024-001',
      linkedEntityType: 'booking',
      priority: 'medium',
      triggeredBy: 'Ahmed Construction Co.',
      metadata: { bookingValue: 15000, duration: '7 days' }
    },
    {
      id: 'NOTIF-002',
      type: 'document',
      title: 'Document Verification Required',
      message: 'Gulf Heavy Equipment has uploaded new insurance documents requiring verification',
      timestamp: '2024-06-15T09:15:00Z',
      status: 'unread',
      linkedEntityId: 'DOC-2024-045',
      linkedEntityType: 'document',
      priority: 'high',
      triggeredBy: 'Gulf Heavy Equipment',
      metadata: { documentType: 'Insurance Certificate', expiryDate: '2025-06-15' }
    },
    {
      id: 'NOTIF-003',
      type: 'user',
      title: 'User Account Flagged',
      message: 'Skyline Projects account has been flagged for multiple late returns',
      timestamp: '2024-06-14T16:45:00Z',
      status: 'read',
      linkedEntityId: 'USER-789',
      linkedEntityType: 'user',
      priority: 'high',
      triggeredBy: 'System Auto-Flag',
      metadata: { flagReason: 'Late returns', occurrences: 3 }
    },
    {
      id: 'NOTIF-004',
      type: 'system',
      title: 'System Maintenance Scheduled',
      message: 'Planned maintenance window scheduled for June 20, 2024 from 2:00 AM to 4:00 AM',
      timestamp: '2024-06-14T14:20:00Z',
      status: 'read',
      priority: 'medium',
      triggeredBy: 'System Administrator',
      metadata: { maintenanceType: 'Database optimization', duration: '2 hours' }
    },
    {
      id: 'NOTIF-005',
      type: 'flagged_content',
      title: 'Inappropriate Content Reported',
      message: 'Equipment listing #EQ-2024-156 has been reported for misleading information',
      timestamp: '2024-06-14T11:30:00Z',
      status: 'unread',
      linkedEntityId: 'EQ-2024-156',
      linkedEntityType: 'equipment',
      priority: 'critical',
      triggeredBy: 'Desert Infrastructure',
      metadata: { reportReason: 'Misleading information', reporterType: 'Renter' }
    }
  ]);

  // Mock notification settings
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    bookingAlerts: true,
    documentUpdates: true,
    userFlags: true,
    systemAlerts: true,
    realTimeAlerts: true,
    emailNotifications: false,
    smsNotifications: false
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking': return faCalendarCheck;
      case 'document': return faFileAlt;
      case 'user': return faUser;
      case 'system': return faCog;
      case 'flagged_content': return faFlag;
      default: return faBell;
    }
  };

  const getNotificationColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-blue-400';
      default: return 'text-muted-foreground';
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return isRTL ? `منذ ${diffInMinutes} دقيقة` : `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return isRTL ? `منذ ${hours} ساعة` : `${hours} hours ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return isRTL ? `منذ ${days} يوم` : `${days} days ago`;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (notification.triggeredBy && notification.triggeredBy.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || notification.status === statusFilter;
    const matchesTab = activeTab === 'all' || notification.type === activeTab;
    
    return matchesSearch && matchesStatus && matchesTab;
  });

  const markAsRead = (notificationId: string) => {
    setNotifications(notifications.map(n => 
      n.id === notificationId ? { ...n, status: 'read' } : n
    ));
  };

  const markAsArchived = (notificationId: string) => {
    setNotifications(notifications.map(n => 
      n.id === notificationId ? { ...n, status: 'archived' } : n
    ));
  };

  const getTabCount = (type: string) => {
    if (type === 'all') return notifications.length;
    return notifications.filter(n => n.type === type).length;
  };

  const getUnreadCount = () => {
    return notifications.filter(n => n.status === 'unread').length;
  };

  const StatCard = ({ title, value, subtitle, icon, bgColor, textColor }: any) => (
    <div className="bg-card rounded-xl border border-border p-6 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">{title}</p>
          <p className={`text-3xl font-bold mb-2 ${textColor}`}>{value}</p>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        <div className={`flex h-16 w-16 items-center justify-center rounded-xl ${bgColor}`}>
          <FontAwesomeIcon icon={icon} className="h-8 w-8 text-foreground" />
        </div>
      </div>
    </div>
  );

  const renderNotificationsList = () => (
    <div className="space-y-4">
      {filteredNotifications.map((notification) => (
        <div 
          key={notification.id} 
          className={`bg-card rounded-xl border border-border p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer ${
            notification.status === 'unread' ? 'border-blue-500' : ''
          }`}
          onClick={() => setSelectedNotification(notification)}
        >
          <div className="flex items-start justify-between">
            <div className={cn("flex items-start space-x-4 flex-1", isRTL && "space-x-reverse")}>
              <div className={`p-3 rounded-lg bg-muted`}>
                <FontAwesomeIcon 
                  icon={getNotificationIcon(notification.type)} 
                  className={`h-5 w-5 ${getNotificationColor(notification.priority)}`}
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`text-lg font-semibold ${notification.status === 'unread' ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {notification.title}
                  </h3>
                  <div className={cn("flex items-center space-x-2", isRTL && "space-x-reverse")}>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadgeColor(notification.priority)}`}>
                      {notification.priority.charAt(0).toUpperCase() + notification.priority.slice(1)}
                    </span>
                    {notification.status === 'unread' && (
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                </div>
                
                <p className="text-muted-foreground mb-3 line-clamp-2">
                  {notification.message}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className={cn("flex items-center space-x-4 text-sm text-gray-500", isRTL && "space-x-reverse")}>
                    <span>{getTimeAgo(notification.timestamp)}</span>
                    {notification.triggeredBy && (
                      <span>• {isRTL ? 'بواسطة' : 'by'} {notification.triggeredBy}</span>
                    )}
                    {notification.linkedEntityId && (
                      <span className="text-blue-400">• {notification.linkedEntityId}</span>
                    )}
                  </div>
                  
                  <div className={cn("flex items-center space-x-2", isRTL && "space-x-reverse")}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notification.id);
                      }}
                      className="p-2 text-muted-foreground hover:text-blue-400 transition-colors"
                      title={isRTL ? 'تحديد كمقروء' : 'Mark as read'}
                    >
                      <FontAwesomeIcon icon={faCheck} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsArchived(notification.id);
                      }}
                      className="p-2 text-muted-foreground hover:text-yellow-400 transition-colors"
                      title={isRTL ? 'أرشفة' : 'Archive'}
                    >
                      <FontAwesomeIcon icon={faArchive} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <div className="bg-card rounded-xl border border-border p-6 shadow-lg">
        <h3 className="text-xl font-bold text-foreground mb-6">
          {isRTL ? 'إعدادات الإشعارات' : 'Notification Preferences'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Notification Types */}
          <div className="space-y-4">
            <h4 className="font-medium text-muted-foreground">
              {isRTL ? 'أنواع الإشعارات' : 'Notification Types'}
            </h4>
            
            {[
              { key: 'bookingAlerts', label: isRTL ? 'تنبيهات الحجوزات' : 'Booking Alerts' },
              { key: 'documentUpdates', label: isRTL ? 'تحديثات الوثائق' : 'Document Updates' },
              { key: 'userFlags', label: isRTL ? 'تنبيهات المستخدمين' : 'User Flags' },
              { key: 'systemAlerts', label: isRTL ? 'تنبيهات النظام' : 'System Alerts' }
            ].map((setting) => (
              <div key={setting.key} className="flex items-center justify-between">
                <span className="text-muted-foreground">{setting.label}</span>
                <button
                  onClick={() => setNotificationSettings({
                    ...notificationSettings,
                    [setting.key]: !notificationSettings[setting.key as keyof NotificationSettings]
                  })}
                  className={`p-2 rounded-full transition-colors ${
                    notificationSettings[setting.key as keyof NotificationSettings]
                      ? 'bg-yellow-600 text-foreground'
                      : 'bg-gray-600 text-muted-foreground'
                  }`}
                >
                  <FontAwesomeIcon 
                    icon={notificationSettings[setting.key as keyof NotificationSettings] ? faToggleOn : faToggleOff} 
                  />
                </button>
              </div>
            ))}
          </div>

          {/* Delivery Methods */}
          <div className="space-y-4">
            <h4 className="font-medium text-muted-foreground">
              {isRTL ? 'طرق التوصيل' : 'Delivery Methods'}
            </h4>
            
            {[
              { key: 'realTimeAlerts', label: isRTL ? 'التنبيهات الفورية' : 'Real-time Alerts', icon: faBell },
              { key: 'emailNotifications', label: isRTL ? 'إشعارات البريد الإلكتروني' : 'Email Notifications', icon: faEnvelope },
              { key: 'smsNotifications', label: isRTL ? 'إشعارات الرسائل النصية' : 'SMS Notifications', icon: faSms }
            ].map((setting) => (
              <div key={setting.key} className="flex items-center justify-between">
                <div className="flex items-center">
                  <FontAwesomeIcon icon={setting.icon} className={`h-4 w-4 text-muted-foreground ${isRTL ? 'ml-3' : 'mr-3'}`} />  
                  <span className="text-muted-foreground">{setting.label}</span>
                </div>
                <button
                  onClick={() => setNotificationSettings({
                    ...notificationSettings,
                    [setting.key]: !notificationSettings[setting.key as keyof NotificationSettings]
                  })}
                  className={`p-2 rounded-full transition-colors ${
                    notificationSettings[setting.key as keyof NotificationSettings]
                      ? 'bg-yellow-600 text-foreground'
                      : 'bg-gray-600 text-muted-foreground'
                  }`}
                >
                  <FontAwesomeIcon 
                    icon={notificationSettings[setting.key as keyof NotificationSettings] ? faToggleOn : faToggleOff} 
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <Button variant="default">
            {isRTL ? 'حفظ الإعدادات' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-background ${isRTL ? 'font-arabic' : 'font-montserrat'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            {isRTL ? 'مركز الإشعارات' : 'Notifications Center'}
          </h1>
          <p className="text-muted-foreground">
            {isRTL ? 'عرض وإدارة جميع تنبيهات النظام والأنشطة التشغيلية' : 'View and manage all system alerts and operational notifications'}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title={isRTL ? "غير مقروءة" : "Unread"}
            value={getUnreadCount()}
            subtitle={isRTL ? "إشعارات جديدة" : "New notifications"}
            icon={faBell}
            bgColor="bg-blue-600"
            textColor="text-blue-400"
          />
          <StatCard
            title={isRTL ? "عالية الأولوية" : "High Priority"}
            value={notifications.filter(n => n.priority === 'high' || n.priority === 'critical').length}
            subtitle={isRTL ? "تحتاج انتباه" : "Need attention"}
            icon={faExclamationTriangle}
            bgColor="bg-red-600"
            textColor="text-red-400"
          />
          <StatCard
            title={isRTL ? "اليوم" : "Today"}
            value={notifications.filter(n => new Date(n.timestamp).toDateString() === new Date().toDateString()).length}
            subtitle={isRTL ? "إشعارات اليوم" : "Today's notifications"}
            icon={faCalendar}
            bgColor="bg-green-600"
            textColor="text-green-400"
          />
          <StatCard
            title={isRTL ? "مؤرشفة" : "Archived"}
            value={notifications.filter(n => n.status === 'archived').length}
            subtitle={isRTL ? "إشعارات مؤرشفة" : "Archived notifications"}
            icon={faArchive}
            bgColor="bg-gray-600"
            textColor="text-muted-foreground"
          />
        </div>

        {/* Tabs */}
        <div className="bg-card rounded-xl border border-border shadow-lg">
          <div className="border-b border-border">
            <nav className={cn("-mb-px flex space-x-4 px-6 overflow-x-auto", isRTL && "space-x-reverse")}>
              {[
                { id: 'all', label: isRTL ? 'الكل' : 'All', icon: faBell },
                { id: 'booking', label: isRTL ? 'الحجوزات' : 'Bookings', icon: faCalendarCheck },
                { id: 'document', label: isRTL ? 'الوثائق' : 'Documents', icon: faFileAlt },
                { id: 'user', label: isRTL ? 'المستخدمون' : 'Users', icon: faUser },
                { id: 'system', label: isRTL ? 'النظام' : 'System', icon: faCog },
                { id: 'flagged_content', label: isRTL ? 'محتوى مُبلغ عنه' : 'Flagged', icon: faFlag },
                { id: 'settings', label: isRTL ? 'الإعدادات' : 'Settings', icon: faCog }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-3 border-b-2 font-medium text-sm flex items-center whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-700 text-blue-400'
                      : 'border-transparent text-muted-foreground hover:text-muted-foreground hover:border-border'
                  }`}
                >
                  <FontAwesomeIcon icon={tab.icon} className={`${isRTL ? 'ml-2' : 'mr-2'}`} />  
                  {tab.label}
                  {tab.id !== 'settings' && (
                    <span className={`px-2 py-1 bg-gray-600 text-foreground rounded-full text-xs ${isRTL ? 'mr-2' : 'ml-2'}`}>  
                      {getTabCount(tab.id)}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'settings' ? renderSettingsTab() : (
              <>
                {/* Filters */}
                <div className="bg-muted rounded-xl p-6 mb-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        {isRTL ? 'البحث' : 'Search'}
                      </label>
                      <div className="relative">
                        <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder={isRTL ? 'البحث في الإشعارات...' : 'Search notifications...'}
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-foreground focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Status Filter */}
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        {isRTL ? 'الحالة' : 'Status'}
                      </label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-foreground focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">{isRTL ? 'جميع الحالات' : 'All Status'}</option>
                        <option value="unread">{isRTL ? 'غير مقروءة' : 'Unread'}</option>
                        <option value="read">{isRTL ? 'مقروءة' : 'Read'}</option>
                        <option value="archived">{isRTL ? 'مؤرشفة' : 'Archived'}</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Notifications List */}
                {renderNotificationsList()}
              </>
            )}
          </div>
        </div>

        {/* Notification Detail Modal */}
        {selectedNotification && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-xl border border-border shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">
                  {isRTL ? 'تفاصيل الإشعار' : 'Notification Details'}
                </h2>
                <button
                  onClick={() => setSelectedNotification(null)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Notification Header */}
                <div className={cn("flex items-start space-x-4", isRTL && "space-x-reverse")}>
                  <div className={`p-3 rounded-lg bg-muted`}>
                    <FontAwesomeIcon 
                      icon={getNotificationIcon(selectedNotification.type)} 
                      className={`h-6 w-6 ${getNotificationColor(selectedNotification.priority)}`}
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-semibold text-foreground">
                        {selectedNotification.title}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityBadgeColor(selectedNotification.priority)}`}>
                        {selectedNotification.priority.charAt(0).toUpperCase() + selectedNotification.priority.slice(1)}
                      </span>
                    </div>
                    
                    <p className="text-muted-foreground text-lg">
                      {selectedNotification.message}
                    </p>
                  </div>
                </div>

                {/* Metadata */}
                <div className="bg-muted rounded-lg p-4">
                  <h4 className="font-medium text-foreground mb-3">
                    {isRTL ? 'المعلومات' : 'Information'}
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">{isRTL ? 'الوقت:' : 'Time:'}</span>
                      <span className={`text-foreground ${isRTL ? 'mr-2' : 'ml-2'}`}>{new Date(selectedNotification.timestamp).toLocaleString()}</span>
                    </div>
                    {selectedNotification.triggeredBy && (
                      <div>
                        <span className="text-muted-foreground">{isRTL ? 'بواسطة:' : 'Triggered by:'}</span>
                        <span className={`text-foreground ${isRTL ? 'mr-2' : 'ml-2'}`}>{selectedNotification.triggeredBy}</span>
                      </div>
                    )}
                    {selectedNotification.linkedEntityId && (
                      <div>
                        <span className="text-muted-foreground">{isRTL ? 'مرتبط بـ:' : 'Linked to:'}</span>
                        <span className={`text-blue-400 ${isRTL ? 'mr-2' : 'ml-2'}`}>{selectedNotification.linkedEntityId}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-muted-foreground">{isRTL ? 'النوع:' : 'Type:'}</span>
                      <span className={`text-foreground ${isRTL ? 'mr-2' : 'ml-2'} capitalize`}>{selectedNotification.type.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>

                {/* Additional Metadata */}
                {selectedNotification.metadata && (
                  <div className="bg-muted rounded-lg p-4">
                    <h4 className="font-medium text-foreground mb-3">
                      {isRTL ? 'تفاصيل إضافية' : 'Additional Details'}
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(selectedNotification.metadata).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                          <span className="text-foreground">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className={cn("flex space-x-3 pt-4 border-t border-border", isRTL && "space-x-reverse")}>
                  {selectedNotification.linkedEntityId && (
                    <Button variant="default">
                      <FontAwesomeIcon icon={faExternalLink} className={`${isRTL ? 'ml-2' : 'mr-2'}`} />  
                      {isRTL ? 'عرض السجل' : 'View Related'}
                    </Button>
                  )}
                  <Button
                    variant="default"
                    onClick={() => {
                      markAsRead(selectedNotification.id);
                      setSelectedNotification(null);
                    }}
                  >
                    <FontAwesomeIcon icon={faCheck} className={`${isRTL ? 'ml-2' : 'mr-2'}`} />  
                    {isRTL ? 'تحديد كمقروء' : 'Mark as Read'}
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => {
                      markAsArchived(selectedNotification.id);
                      setSelectedNotification(null);
                    }}
                  >
                    <FontAwesomeIcon icon={faArchive} className={`${isRTL ? 'ml-2' : 'mr-2'}`} />  
                    {isRTL ? 'أرشفة' : 'Archive'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsCenter; 