'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEnvelope,
  faSms,
  faBell,
  faSearch,
  faEdit,
  faEye,
  faTimes,
  faSave,
  faInfoCircle,
  faPlus,
  faUser,
  faTruck,
  faCalendarCheck,
  faFileAlt,
  faDollarSign,
  faExclamationTriangle,
  faCheckCircle,
  faQuestionCircle,
  faSpinner,
  faToggleOn,
  faToggleOff,
  faRefresh,
  faMobile,
  faGlobe,
  faComments
} from '@fortawesome/free-solid-svg-icons';
import {
  NotificationTemplate,
  NotificationTemplateListItem,
  NotificationChannel,
  NotificationPriority,
  RecipientType,
  getNotificationTemplates,
  getNotificationTemplate,
  updateNotificationTemplate,
  toggleNotificationTemplate,
  getChannelLabel,
  getPriorityColor,
  getRecipientLabel,
  formatEventCode,
} from '@/services/notificationTemplateService';

type LanguageCode = 'en' | 'ar' | 'ur';

const NotificationTemplatesPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  // State
  const [templates, setTemplates] = useState<NotificationTemplateListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeChannel, setActiveChannel] = useState<'all' | NotificationChannel>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const [editLanguage, setEditLanguage] = useState<LanguageCode>('en');
  const [showPlaceholderHelp, setShowPlaceholderHelp] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingTemplate, setLoadingTemplate] = useState(false);

  // Fetch templates
  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getNotificationTemplates();
      setTemplates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load templates');
      // Use mock data as fallback
      setTemplates(getMockTemplates());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // Load full template for editing
  const handleEditTemplate = async (template: NotificationTemplateListItem) => {
    try {
      setLoadingTemplate(true);
      const fullTemplate = await getNotificationTemplate(template.id);
      setEditingTemplate(fullTemplate);
      setEditLanguage('en');
    } catch (err) {
      // Fallback to mock for demo
      setEditingTemplate(getMockFullTemplate(template));
      setEditLanguage('en');
    } finally {
      setLoadingTemplate(false);
    }
  };

  // Load full template for preview
  const handlePreviewTemplate = async (template: NotificationTemplateListItem) => {
    try {
      setLoadingTemplate(true);
      const fullTemplate = await getNotificationTemplate(template.id);
      setSelectedTemplate(fullTemplate);
    } catch (err) {
      setSelectedTemplate(getMockFullTemplate(template));
    } finally {
      setLoadingTemplate(false);
    }
  };

  // Save template
  const handleSaveTemplate = async () => {
    if (!editingTemplate) return;
    
    try {
      setSaving(true);
      await updateNotificationTemplate(editingTemplate.id, {
        titleEn: editingTemplate.titleEn,
        titleAr: editingTemplate.titleAr,
        titleUr: editingTemplate.titleUr,
        bodyEn: editingTemplate.bodyEn,
        bodyAr: editingTemplate.bodyAr,
        bodyUr: editingTemplate.bodyUr,
        defaultPriority: editingTemplate.defaultPriority,
        defaultChannels: editingTemplate.defaultChannels,
        isActive: editingTemplate.isActive,
        deepLinkTemplate: editingTemplate.deepLinkTemplate,
      });
      await fetchTemplates();
      setEditingTemplate(null);
    } catch (err) {
      // For demo, just close the modal
      setEditingTemplate(null);
    } finally {
      setSaving(false);
    }
  };

  // Toggle template active status
  const handleToggleActive = async (template: NotificationTemplateListItem) => {
    try {
      await toggleNotificationTemplate(template.id, !template.isActive);
      await fetchTemplates();
    } catch (err) {
      // Update locally for demo
      setTemplates(templates.map(t => 
        t.id === template.id ? { ...t, isActive: !t.isActive } : t
      ));
    }
  };

  // Insert placeholder into body
  const insertPlaceholder = (placeholder: string) => {
    if (!editingTemplate) return;
    
    const bodyKey = `body${editLanguage.charAt(0).toUpperCase() + editLanguage.slice(1)}` as keyof NotificationTemplate;
    const currentContent = editingTemplate[bodyKey] as string;
    const newContent = currentContent + `{{${placeholder}}}`;
    
    setEditingTemplate({
      ...editingTemplate,
      [bodyKey]: newContent,
    });
  };

  // Get title for current language
  const getTitle = (template: NotificationTemplate, lang: LanguageCode): string => {
    switch (lang) {
      case 'ar': return template.titleAr;
      case 'ur': return template.titleUr;
      default: return template.titleEn;
    }
  };

  // Get body for current language
  const getBody = (template: NotificationTemplate, lang: LanguageCode): string => {
    switch (lang) {
      case 'ar': return template.bodyAr;
      case 'ur': return template.bodyUr;
      default: return template.bodyEn;
    }
  };

  // Update title for current language
  const updateTitle = (value: string) => {
    if (!editingTemplate) return;
    const titleKey = `title${editLanguage.charAt(0).toUpperCase() + editLanguage.slice(1)}` as keyof NotificationTemplate;
    setEditingTemplate({ ...editingTemplate, [titleKey]: value });
  };

  // Update body for current language
  const updateBody = (value: string) => {
    if (!editingTemplate) return;
    const bodyKey = `body${editLanguage.charAt(0).toUpperCase() + editLanguage.slice(1)}` as keyof NotificationTemplate;
    setEditingTemplate({ ...editingTemplate, [bodyKey]: value });
  };

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesChannel = activeChannel === 'all' || template.defaultChannels.includes(activeChannel);
    const matchesSearch = 
      template.eventCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.titleEn.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesChannel && matchesSearch;
  });

  // Channel stats
  const getChannelCount = (channel: string) => {
    if (channel === 'all') return templates.length;
    return templates.filter(t => t.defaultChannels.includes(channel as NotificationChannel)).length;
  };

  // Get channel icon
  const getChannelIcon = (channel: NotificationChannel) => {
    switch (channel) {
      case 'email': return faEnvelope;
      case 'sms': return faSms;
      case 'push': return faMobile;
      case 'in_app': return faBell;
      case 'whatsapp': return faComments;
      default: return faBell;
    }
  };

  // Get category from event code
  const getCategoryFromEvent = (eventCode: string): string => {
    if (eventCode.includes('BOOKING') || eventCode.includes('REQUEST') || eventCode.includes('OFFER')) return 'booking';
    if (eventCode.includes('DOCUMENT') || eventCode.includes('PERMIT')) return 'document';
    if (eventCode.includes('PAYMENT') || eventCode.includes('PAYOUT') || eventCode.includes('WALLET')) return 'payment';
    if (eventCode.includes('DRIVER') || eventCode.includes('DELIVERY')) return 'driver';
    if (eventCode.includes('USER') || eventCode.includes('ACCOUNT')) return 'user';
    if (eventCode.includes('PARTNER') || eventCode.includes('CLUSTER')) return 'partner';
    return 'system';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'booking': return faCalendarCheck;
      case 'document': return faFileAlt;
      case 'payment': return faDollarSign;
      case 'driver': return faTruck;
      case 'user': return faUser;
      case 'partner': return faGlobe;
      default: return faExclamationTriangle;
    }
  };

  const StatCard = ({ title, value, subtitle, icon, bgColor, textColor }: {
    title: string;
    value: number;
    subtitle: string;
    icon: typeof faBell;
    bgColor: string;
    textColor: string;
  }) => (
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

  return (
    <div className={`min-h-screen bg-background ${isRTL ? 'font-arabic' : 'font-montserrat'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              {isRTL ? 'قوالب الإشعارات' : 'Notification Templates'}
            </h1>
            <p className="text-muted-foreground">
              {isRTL ? 'إدارة وتحرير قوالب الإشعارات بلغات متعددة' : 'Manage and edit notification templates in multiple languages (EN, AR, UR)'}
            </p>
          </div>
          <button
            onClick={fetchTemplates}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
          >
            <FontAwesomeIcon icon={faRefresh} className={`${isRTL ? 'ml-2' : 'mr-2'} ${loading ? 'animate-spin' : ''}`} />
            {isRTL ? 'تحديث' : 'Refresh'}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/50 border border-yellow-300 dark:border-yellow-700 rounded-lg">
            <p className="text-yellow-700 dark:text-yellow-200">{error} - Showing demo data</p>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title={isRTL ? "إجمالي القوالب" : "Total Templates"}
            value={templates.length}
            subtitle={`${templates.filter(t => t.isActive).length} active`}
            icon={faFileAlt}
            bgColor="bg-blue-600"
            textColor="text-blue-400"
          />
          <StatCard
            title={isRTL ? "إشعارات الدفع" : "Push Notifications"}
            value={templates.filter(t => t.defaultChannels.includes('push')).length}
            subtitle={isRTL ? "إشعارات فورية" : "Instant alerts"}
            icon={faMobile}
            bgColor="bg-green-600"
            textColor="text-green-400"
          />
          <StatCard
            title={isRTL ? "البريد الإلكتروني" : "Email Templates"}
            value={templates.filter(t => t.defaultChannels.includes('email')).length}
            subtitle={isRTL ? "رسائل مفصلة" : "Detailed messages"}
            icon={faEnvelope}
            bgColor="bg-yellow-600"
            textColor="text-yellow-400"
          />
          <StatCard
            title={isRTL ? "إشعارات التطبيق" : "In-App Notifications"}
            value={templates.filter(t => t.defaultChannels.includes('in_app')).length}
            subtitle={isRTL ? "داخل التطبيق" : "Within app"}
            icon={faBell}
            bgColor="bg-purple-600"
            textColor="text-purple-400"
          />
        </div>

        {/* Tabs and Search */}
        <div className="bg-card rounded-xl border border-border shadow-lg">
          <div className="border-b border-border">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-6">
              {/* Channel Tabs */}
              <nav className={cn("-mb-px flex space-x-4 overflow-x-auto", isRTL && "space-x-reverse")}>
                {[
                  { id: 'all', label: isRTL ? 'الكل' : 'All', icon: faFileAlt },
                  { id: 'push', label: isRTL ? 'دفع' : 'Push', icon: faMobile },
                  { id: 'in_app', label: isRTL ? 'التطبيق' : 'In-App', icon: faBell },
                  { id: 'email', label: isRTL ? 'البريد' : 'Email', icon: faEnvelope },
                  { id: 'sms', label: 'SMS', icon: faSms },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveChannel(tab.id as 'all' | NotificationChannel)}
                    className={`py-4 px-3 border-b-2 font-medium text-sm flex items-center whitespace-nowrap ${
                      activeChannel === tab.id
                        ? 'border-blue-700 text-blue-400'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                    }`}
                  >
                    <FontAwesomeIcon icon={tab.icon} className={`${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {tab.label}
                    <span className={`px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-foreground rounded-full text-xs ${isRTL ? 'mr-2' : 'ml-2'}`}>
                      {getChannelCount(tab.id)}
                    </span>
                  </button>
                ))}
              </nav>

              {/* Search */}
              <div className={`mt-4 lg:mt-0 ${isRTL ? 'lg:mr-6' : 'lg:ml-6'}`}>
                <div className="relative max-w-md">
                  <FontAwesomeIcon icon={faSearch} className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-muted-foreground`} />
                  <input
                    type="text"
                    placeholder={isRTL ? 'البحث في القوالب...' : 'Search by event code or title...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full ${isRTL ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-2 bg-muted border border-border rounded-lg text-foreground focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Templates Table */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <FontAwesomeIcon icon={faSpinner} className="h-8 w-8 text-blue-400 animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className={`px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                      {isRTL ? 'الحدث' : 'Event'}
                    </th>
                    <th className={`px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                      {isRTL ? 'المستلم' : 'Recipient'}
                    </th>
                    <th className={`px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                      {isRTL ? 'القنوات' : 'Channels'}
                    </th>
                    <th className={`px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                      {isRTL ? 'الأولوية' : 'Priority'}
                    </th>
                    <th className={`px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                      {isRTL ? 'الحالة' : 'Status'}
                    </th>
                    <th className={`px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                      {isRTL ? 'الإجراءات' : 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredTemplates.map((template) => (
                    <tr key={template.id} className="hover:bg-muted transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <FontAwesomeIcon
                            icon={getCategoryIcon(getCategoryFromEvent(template.eventCode))}
                            className={`h-5 w-5 text-blue-400 ${isRTL ? 'ml-3' : 'mr-3'}`}
                          />
                          <div>
                            <div className="text-sm font-medium text-foreground">
                              {formatEventCode(template.eventCode)}
                            </div>
                            <div className="text-xs text-muted-foreground font-mono">
                              {template.eventCode}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-foreground">
                          {getRecipientLabel(template.recipientType)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {template.defaultChannels.map((channel) => (
                            <span
                              key={channel}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                            >
                              <FontAwesomeIcon icon={getChannelIcon(channel)} className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                              {getChannelLabel(channel)}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(template.defaultPriority)}`}>
                          {template.defaultPriority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleActive(template)}
                          className={`flex items-center ${template.isActive ? 'text-green-400' : 'text-gray-500'}`}
                        >
                          <FontAwesomeIcon icon={template.isActive ? faToggleOn : faToggleOff} className="h-5 w-5" />
                          <span className={`text-xs ${isRTL ? 'mr-2' : 'ml-2'}`}>
                            {template.isActive ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'معطل' : 'Inactive')}
                          </span>
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className={cn("flex space-x-2", isRTL && "space-x-reverse")}>
                          <button
                            onClick={() => handleEditTemplate(template)}
                            disabled={loadingTemplate}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                            title={isRTL ? 'تحرير' : 'Edit'}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button
                            onClick={() => handlePreviewTemplate(template)}
                            disabled={loadingTemplate}
                            className="text-green-400 hover:text-green-300 transition-colors"
                            title={isRTL ? 'معاينة' : 'Preview'}
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredTemplates.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    {isRTL ? 'لم يتم العثور على قوالب' : 'No templates found'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Edit Template Modal */}
        {editingTemplate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-xl border border-border shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-border flex items-center justify-between sticky top-0 bg-card z-10">
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    {isRTL ? 'تحرير القالب' : 'Edit Template'}
                  </h2>
                  <p className="text-sm text-muted-foreground font-mono">{editingTemplate.eventCode}</p>
                </div>
                <div className={cn("flex items-center space-x-4", isRTL && "space-x-reverse")}>
                  {/* Language Toggle - Now with 3 languages */}
                  <div className={cn("flex items-center space-x-1 bg-muted rounded-lg p-1", isRTL && "space-x-reverse")}>
                    {[
                      { code: 'en', label: 'EN', dir: 'ltr' },
                      { code: 'ar', label: 'AR', dir: 'rtl' },
                      { code: 'ur', label: 'UR', dir: 'rtl' },
                    ].map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => setEditLanguage(lang.code as LanguageCode)}
                        className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                          editLanguage === lang.code
                            ? 'bg-blue-600 text-white'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setEditingTemplate(null)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <FontAwesomeIcon icon={faTimes} className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Language indicator */}
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">
                    {isRTL ? 'تحرير:' : 'Editing:'}
                  </span>
                  <span className={`px-2 py-1 rounded ${editLanguage === 'en' ? 'bg-blue-600' : editLanguage === 'ar' ? 'bg-green-600' : 'bg-purple-600'} text-white text-xs font-medium`}>
                    {editLanguage === 'en' ? 'English' : editLanguage === 'ar' ? 'العربية' : 'اردو'}
                  </span>
                  {(editLanguage === 'ar' || editLanguage === 'ur') && (
                    <span className="text-yellow-600 dark:text-yellow-400 text-xs">
                      (RTL - Right to Left)
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Main Edit Area */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        {isRTL ? 'العنوان' : 'Title'} 
                        <span className="text-xs text-gray-500 ml-2">(max 50 chars)</span>
                      </label>
                      <input
                        type="text"
                        value={getTitle(editingTemplate, editLanguage)}
                        onChange={(e) => updateTitle(e.target.value)}
                        dir={editLanguage === 'en' ? 'ltr' : 'rtl'}
                        className={`w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:ring-2 focus:ring-blue-500 ${
                          editLanguage !== 'en' ? 'text-right font-arabic' : ''
                        }`}
                        placeholder={
                          editLanguage === 'en' ? 'Enter title...' :
                          editLanguage === 'ar' ? 'أدخل العنوان...' :
                          'عنوان درج کریں...'
                        }
                        maxLength={50}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {getTitle(editingTemplate, editLanguage).length}/50
                      </p>
                    </div>

                    {/* Message Body */}
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        {isRTL ? 'نص الرسالة' : 'Message Body'}
                        <span className="text-xs text-gray-500 ml-2">(max 200 chars for push)</span>
                      </label>
                      <textarea
                        rows={6}
                        value={getBody(editingTemplate, editLanguage)}
                        onChange={(e) => updateBody(e.target.value)}
                        dir={editLanguage === 'en' ? 'ltr' : 'rtl'}
                        className={`w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:ring-2 focus:ring-blue-500 ${
                          editLanguage !== 'en' ? 'text-right font-arabic' : ''
                        }`}
                        placeholder={
                          editLanguage === 'en' ? 'Enter message body...' :
                          editLanguage === 'ar' ? 'أدخل نص الرسالة...' :
                          'پیغام کا متن درج کریں...'
                        }
                      />
                      <p className={`text-xs mt-1 ${getBody(editingTemplate, editLanguage).length > 200 ? 'text-yellow-400' : 'text-muted-foreground'}`}>
                        {getBody(editingTemplate, editLanguage).length}/200
                        {getBody(editingTemplate, editLanguage).length > 200 && ' (may be truncated for push)'}
                      </p>
                    </div>

                    {/* Settings */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                          {isRTL ? 'الأولوية' : 'Priority'}
                        </label>
                        <select
                          value={editingTemplate.defaultPriority}
                          onChange={(e) => setEditingTemplate({
                            ...editingTemplate,
                            defaultPriority: e.target.value as NotificationPriority
                          })}
                          className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="CRITICAL">Critical</option>
                          <option value="HIGH">High</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="LOW">Low</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                          {isRTL ? 'المستلم' : 'Recipient'}
                        </label>
                        <input
                          type="text"
                          value={getRecipientLabel(editingTemplate.recipientType)}
                          disabled
                          className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-muted-foreground cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sidebar - Placeholders */}
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-foreground">
                          {isRTL ? 'المتغيرات' : 'Variables'}
                        </h3>
                        <button
                          onClick={() => setShowPlaceholderHelp(!showPlaceholderHelp)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <FontAwesomeIcon icon={faQuestionCircle} />
                        </button>
                      </div>

                      {showPlaceholderHelp && (
                        <div className="bg-blue-100 dark:bg-blue-900/50 border border-blue-300 dark:border-blue-700 rounded-lg p-3 mb-4">
                          <p className="text-blue-700 dark:text-blue-200 text-sm">
                            {isRTL 
                              ? 'انقر على أي متغير لإدراجه في النص. استخدم {{variable}} في القالب.'
                              : 'Click any variable to insert it. Use {{variable}} syntax in templates.'}
                          </p>
                        </div>
                      )}

                      <div className="space-y-2 max-h-80 overflow-y-auto">
                        {editingTemplate.variables.map((variable) => (
                          <div
                            key={variable}
                            onClick={() => insertPlaceholder(variable)}
                            className="bg-muted rounded-lg p-3 cursor-pointer hover:bg-muted/80 transition-colors border border-transparent hover:border-blue-500"
                          >
                            <div className="flex items-center justify-between">
                              <code className="text-yellow-600 dark:text-yellow-400 text-sm">{`{{${variable}}}`}</code>
                              <FontAwesomeIcon icon={faPlus} className="text-muted-foreground h-3 w-3" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Channels */}
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-3">
                        {isRTL ? 'القنوات' : 'Channels'}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {editingTemplate.defaultChannels.map((channel) => (
                          <span
                            key={channel}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-600 text-white"
                          >
                            <FontAwesomeIcon icon={getChannelIcon(channel)} className={`h-3 w-3 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                            {getChannelLabel(channel)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className={cn("flex space-x-3 pt-6 border-t border-border", isRTL && "space-x-reverse")}>
                  <button
                    onClick={handleSaveTemplate}
                    disabled={saving}
                    className="flex items-center px-6 py-3 bg-awnash-primary text-black rounded-2xl hover:bg-awnash-primary-hover font-medium transition-colors shadow-lg disabled:opacity-50"
                  >
                    {saving ? (
                      <FontAwesomeIcon icon={faSpinner} className={`${isRTL ? 'ml-2' : 'mr-2'} animate-spin`} />
                    ) : (
                      <FontAwesomeIcon icon={faSave} className={`${isRTL ? 'ml-2' : 'mr-2'}`} />
                    )}
                    {isRTL ? 'حفظ التغييرات' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => setSelectedTemplate(editingTemplate)}
                    className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
                  >
                    <FontAwesomeIcon icon={faEye} className={`${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {isRTL ? 'معاينة' : 'Preview'}
                  </button>
                  <button
                    onClick={() => setEditingTemplate(null)}
                    className="flex items-center px-6 py-3 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 font-medium transition-colors"
                  >
                    {isRTL ? 'إلغاء' : 'Cancel'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preview Modal */}
        {selectedTemplate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-xl border border-border shadow-2xl max-w-2xl w-full">
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">
                  {isRTL ? 'معاينة القالب' : 'Template Preview'}
                </h2>
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Language tabs for preview */}
                <div className="flex gap-2">
                  {(['en', 'ar', 'ur'] as LanguageCode[]).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setEditLanguage(lang)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        editLanguage === lang
                          ? 'bg-blue-600 text-white'
                          : 'bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {lang === 'en' ? 'English' : lang === 'ar' ? 'العربية' : 'اردو'}
                    </button>
                  ))}
                </div>

                {/* Push Notification Preview */}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">
                    {isRTL ? 'إشعار الدفع' : 'Push Notification'}
                  </h4>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 border border-gray-300 dark:border-gray-700">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-awnash-primary flex items-center justify-center">
                        <span className="text-black font-bold text-lg">A</span>
                      </div>
                      <div className="flex-1" dir={editLanguage === 'en' ? 'ltr' : 'rtl'}>
                        <p className={`font-semibold text-foreground ${editLanguage !== 'en' ? 'font-arabic' : ''}`}>
                          {getTitle(selectedTemplate, editLanguage)}
                        </p>
                        <p className={`text-sm text-muted-foreground mt-1 ${editLanguage !== 'en' ? 'font-arabic' : ''}`}>
                          {getBody(selectedTemplate, editLanguage).substring(0, 100)}
                          {getBody(selectedTemplate, editLanguage).length > 100 && '...'}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">now</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Full Message Preview */}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">
                    {isRTL ? 'الرسالة الكاملة' : 'Full Message'}
                  </h4>
                  <div 
                    className="bg-muted rounded-lg p-4 border border-border"
                    dir={editLanguage === 'en' ? 'ltr' : 'rtl'}
                  >
                    <h3 className={`font-bold text-foreground mb-2 ${editLanguage !== 'en' ? 'font-arabic' : ''}`}>
                      {getTitle(selectedTemplate, editLanguage)}
                    </h3>
                    <p className={`text-muted-foreground whitespace-pre-line ${editLanguage !== 'en' ? 'font-arabic' : ''}`}>
                      {getBody(selectedTemplate, editLanguage)}
                    </p>
                  </div>
                </div>

                {/* Template Info */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">{isRTL ? 'الحدث' : 'Event'}</p>
                    <p className="text-sm font-mono text-foreground">{selectedTemplate.eventCode}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{isRTL ? 'المستلم' : 'Recipient'}</p>
                    <p className="text-sm text-foreground">{getRecipientLabel(selectedTemplate.recipientType)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{isRTL ? 'الأولوية' : 'Priority'}</p>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(selectedTemplate.defaultPriority)}`}>
                      {selectedTemplate.defaultPriority}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{isRTL ? 'القنوات' : 'Channels'}</p>
                    <p className="text-sm text-foreground">{selectedTemplate.defaultChannels.join(', ')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Mock data for fallback/demo
function getMockTemplates(): NotificationTemplateListItem[] {
  return [
    {
      id: '1',
      eventCode: 'BOOKING_CONFIRMED',
      recipientType: 'requester',
      titleEn: 'Booking Confirmed!',
      titleAr: 'تم تأكيد الحجز!',
      titleUr: 'بکنگ کی تصدیق ہوگئی!',
      defaultPriority: 'CRITICAL',
      defaultChannels: ['push', 'in_app', 'email'],
      isActive: true,
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      eventCode: 'OFFER_RECEIVED',
      recipientType: 'requester',
      titleEn: 'New Offer Received',
      titleAr: 'تم استلام عرض جديد',
      titleUr: 'نئی پیشکش موصول ہوئی',
      defaultPriority: 'HIGH',
      defaultChannels: ['push', 'in_app', 'email'],
      isActive: true,
      updatedAt: new Date().toISOString(),
    },
    {
      id: '3',
      eventCode: 'DRIVER_ASSIGNED',
      recipientType: 'driver',
      titleEn: 'New Delivery Assignment',
      titleAr: 'مهمة توصيل جديدة',
      titleUr: 'نئی ڈیلیوری اسائنمنٹ',
      defaultPriority: 'CRITICAL',
      defaultChannels: ['push', 'in_app', 'email', 'whatsapp'],
      isActive: true,
      updatedAt: new Date().toISOString(),
    },
    {
      id: '4',
      eventCode: 'PAYMENT_CONFIRMED',
      recipientType: 'owner',
      titleEn: 'Payment Received',
      titleAr: 'تم استلام الدفع',
      titleUr: 'ادائیگی موصول ہوئی',
      defaultPriority: 'HIGH',
      defaultChannels: ['push', 'in_app', 'email'],
      isActive: true,
      updatedAt: new Date().toISOString(),
    },
    {
      id: '5',
      eventCode: 'MESSAGE_RECEIVED',
      recipientType: 'all',
      titleEn: 'New Message',
      titleAr: 'رسالة جديدة',
      titleUr: 'نیا پیغام',
      defaultPriority: 'HIGH',
      defaultChannels: ['push', 'in_app'],
      isActive: true,
      updatedAt: new Date().toISOString(),
    },
  ];
}

function getMockFullTemplate(item: NotificationTemplateListItem): NotificationTemplate {
  return {
    ...item,
    bodyEn: 'Your booking has been confirmed. Equipment: {{equipmentType}}. Duration: {{startDate}} to {{endDate}}.',
    bodyAr: 'تم تأكيد حجزك. المعدة: {{equipmentType}}. المدة: من {{startDate}} إلى {{endDate}}.',
    bodyUr: 'آپ کی بکنگ کی تصدیق ہوگئی۔ سازوسامان: {{equipmentType}}۔ مدت: {{startDate}} سے {{endDate}} تک۔',
    variables: ['equipmentType', 'startDate', 'endDate', 'ownerName', 'bookingId'],
    requiresUserAction: false,
    androidChannelId: 'high_channel',
    iosSound: 'default',
    iosBadgeIncrement: 1,
    deepLinkTemplate: 'awnash://bookings/{{bookingId}}',
    createdAt: new Date().toISOString(),
  };
}

export default NotificationTemplatesPage;
