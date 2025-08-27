'use client';

import React, { useState } from 'react';
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
  faUndo,
  faTimes,
  faSave,
  faLanguage,
  faInfoCircle,
  faCopy,
  faHistory,
  faPlus,
  faCode,
  faUser,
  faTruck,
  faCalendarCheck,
  faFileAlt,
  faDollarSign,
  faExclamationTriangle,
  faCheckCircle,
  faTimesCircle,
  faQuestionCircle,
  faClock,
  faDownload,
  faUpload
} from '@fortawesome/free-solid-svg-icons';

interface MessageTemplate {
  id: string;
  name: string;
  triggerEvent: string;
  channel: 'email' | 'sms' | 'in_app';
  lastUpdated: string;
  isActive: boolean;
  content: {
    en: {
      subject?: string;
      title: string;
      body: string;
    };
    ar: {
      subject?: string;
      title: string;
      body: string;
    };
  };
  placeholders: string[];
  category: 'booking' | 'document' | 'payment' | 'system' | 'user';
}

interface Placeholder {
  key: string;
  description: string;
  example: string;
}

const SystemMessageTemplates: React.FC = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [activeChannel, setActiveChannel] = useState<'all' | 'email' | 'sms' | 'in_app'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [editLanguage, setEditLanguage] = useState<'en' | 'ar'>('en');
  const [showPlaceholderHelp, setShowPlaceholderHelp] = useState(false);

  // Mock templates data
  const [templates, setTemplates] = useState<MessageTemplate[]>([
    {
      id: 'TPL-001',
      name: 'Booking Confirmation',
      triggerEvent: 'When a booking is confirmed by owner',
      channel: 'email',
      lastUpdated: '2024-06-15T10:30:00Z',
      isActive: true,
      category: 'booking',
      content: {
        en: {
          subject: 'Booking Confirmed - {equipment_name}',
          title: 'Your booking has been confirmed!',
          body: 'Dear {user_name},\n\nGreat news! Your booking for {equipment_name} has been confirmed by {owner_name}.\n\nBooking Details:\n• Booking ID: {booking_id}\n• Equipment: {equipment_name}\n• Duration: {start_date} to {end_date}\n• Total Cost: {total_amount} SAR\n\nPlease ensure you have all required documents ready for pickup.\n\nBest regards,\nAwnash Team'
        },
        ar: {
          subject: 'تأكيد الحجز - {equipment_name}',
          title: 'تم تأكيد حجزك!',
          body: 'عزيزي {user_name}،\n\nأخبار رائعة! تم تأكيد حجزك لـ {equipment_name} من قبل {owner_name}.\n\nتفاصيل الحجز:\n• رقم الحجز: {booking_id}\n• المعدة: {equipment_name}\n• المدة: من {start_date} إلى {end_date}\n• التكلفة الإجمالية: {total_amount} ريال سعودي\n\nيرجى التأكد من وجود جميع الوثائق المطلوبة للاستلام.\n\nمع أطيب التحيات،\nفريق أونش'
        }
      },
      placeholders: ['user_name', 'equipment_name', 'owner_name', 'booking_id', 'start_date', 'end_date', 'total_amount']
    },
    {
      id: 'TPL-002',
      name: 'Document Rejected',
      triggerEvent: 'When uploaded documents are rejected',
      channel: 'in_app',
      lastUpdated: '2024-06-14T16:45:00Z',
      isActive: true,
      category: 'document',
      content: {
        en: {
          title: 'Document Verification Failed',
          body: 'Your {document_type} has been rejected due to: {rejection_reason}. Please upload a new document that meets our requirements.'
        },
        ar: {
          title: 'فشل في التحقق من الوثيقة',
          body: 'تم رفض {document_type} الخاص بك بسبب: {rejection_reason}. يرجى رفع وثيقة جديدة تلبي متطلباتنا.'
        }
      },
      placeholders: ['document_type', 'rejection_reason']
    },
    {
      id: 'TPL-003',
      name: 'Payment Reminder',
      triggerEvent: 'When payment is overdue',
      channel: 'sms',
      lastUpdated: '2024-06-13T11:20:00Z',
      isActive: true,
      category: 'payment',
      content: {
        en: {
          title: 'Payment Reminder',
          body: 'Reminder: Payment of {amount} SAR for booking {booking_id} is overdue. Pay now to avoid penalties. Link: {payment_link}'
        },
        ar: {
          title: 'تذكير دفع',
          body: 'تذكير: دفعة {amount} ريال سعودي للحجز {booking_id} متأخرة. ادفع الآن لتجنب الغرامات. الرابط: {payment_link}'
        }
      },
      placeholders: ['amount', 'booking_id', 'payment_link']
    },
    {
      id: 'TPL-004',
      name: 'Equipment Return Reminder',
      triggerEvent: 'One day before return date',
      channel: 'email',
      lastUpdated: '2024-06-12T09:15:00Z',
      isActive: true,
      category: 'booking',
      content: {
        en: {
          subject: 'Return Reminder - {equipment_name}',
          title: 'Equipment Return Reminder',
          body: 'Dear {user_name},\n\nThis is a friendly reminder that your rental of {equipment_name} is due for return tomorrow ({return_date}).\n\nReturn Location: {return_location}\nReturn Time: {return_time}\n\nPlease ensure the equipment is cleaned and in good condition.\n\nThank you,\nAwnash Team'
        },
        ar: {
          subject: 'تذكير الإرجاع - {equipment_name}',
          title: 'تذكير إرجاع المعدة',
          body: 'عزيزي {user_name}،\n\nهذا تذكير ودود بأن إيجار {equipment_name} مستحق الإرجاع غداً ({return_date}).\n\nموقع الإرجاع: {return_location}\nوقت الإرجاع: {return_time}\n\nيرجى التأكد من أن المعدة نظيفة وفي حالة جيدة.\n\nشكراً لك،\nفريق أونش'
        }
      },
      placeholders: ['user_name', 'equipment_name', 'return_date', 'return_location', 'return_time']
    },
    {
      id: 'TPL-005',
      name: 'Account Verification',
      triggerEvent: 'When user account needs verification',
      channel: 'in_app',
      lastUpdated: '2024-06-11T14:30:00Z',
      isActive: true,
      category: 'user',
      content: {
        en: {
          title: 'Account Verification Required',
          body: 'Welcome to Awnash! To complete your registration, please verify your account by uploading the required documents.'
        },
        ar: {
          title: 'مطلوب التحقق من الحساب',
          body: 'مرحباً بك في أونش! لإكمال تسجيلك، يرجى التحقق من حسابك عن طريق رفع الوثائق المطلوبة.'
        }
      },
      placeholders: ['user_name']
    }
  ]);

  // Available placeholders
  const availablePlaceholders: Placeholder[] = [
    { key: 'user_name', description: 'User\'s full name', example: 'Ahmed Mohammed' },
    { key: 'equipment_name', description: 'Name of the equipment', example: 'Caterpillar 320D Excavator' },
    { key: 'owner_name', description: 'Equipment owner name', example: 'Gulf Heavy Equipment' },
    { key: 'booking_id', description: 'Unique booking identifier', example: 'BK-2024-001' },
    { key: 'start_date', description: 'Booking start date', example: '15 June 2024' },
    { key: 'end_date', description: 'Booking end date', example: '22 June 2024' },
    { key: 'total_amount', description: 'Total booking amount', example: '15,000' },
    { key: 'document_type', description: 'Type of document', example: 'Insurance Certificate' },
    { key: 'rejection_reason', description: 'Reason for rejection', example: 'Document expired' },
    { key: 'amount', description: 'Payment amount', example: '5,000' },
    { key: 'payment_link', description: 'Payment URL', example: 'https://pay.awnash.com/abc123' },
    { key: 'return_date', description: 'Equipment return date', example: '22 June 2024' },
    { key: 'return_location', description: 'Return location', example: 'Riyadh Depot' },
    { key: 'return_time', description: 'Return time', example: '10:00 AM' }
  ];

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email': return faEnvelope;
      case 'sms': return faSms;
      case 'in_app': return faBell;
      default: return faBell;
    }
  };

  const getChannelColor = (channel: string) => {
    switch (channel) {
      case 'email': return 'bg-blue-100 text-blue-800';
      case 'sms': return 'bg-green-100 text-green-800';
      case 'in_app': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'booking': return faCalendarCheck;
      case 'document': return faFileAlt;
      case 'payment': return faDollarSign;
      case 'system': return faExclamationTriangle;
      case 'user': return faUser;
      default: return faBell;
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesChannel = activeChannel === 'all' || template.channel === activeChannel;
    const matchesSearch = 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.triggerEvent.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.content.en.body.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesChannel && matchesSearch;
  });

  const handleEditTemplate = (template: MessageTemplate) => {
    setEditingTemplate({ ...template });
    setEditLanguage('en');
  };

  const handleSaveTemplate = () => {
    if (editingTemplate) {
      setTemplates(templates.map(t => 
        t.id === editingTemplate.id ? { ...editingTemplate, lastUpdated: new Date().toISOString() } : t
      ));
      setEditingTemplate(null);
    }
  };

  const insertPlaceholder = (placeholder: string) => {
    if (editingTemplate) {
      const currentContent = editingTemplate.content[editLanguage].body;
      const newContent = currentContent + `{${placeholder}}`;
      
      setEditingTemplate({
        ...editingTemplate,
        content: {
          ...editingTemplate.content,
          [editLanguage]: {
            ...editingTemplate.content[editLanguage],
            body: newContent
          }
        }
      });
    }
  };

  const getChannelCount = (channel: string) => {
    if (channel === 'all') return templates.length;
    return templates.filter(t => t.channel === channel).length;
  };

  const StatCard = ({ title, value, subtitle, icon, bgColor, textColor }: any) => (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400 mb-2">{title}</p>
          <p className={`text-3xl font-bold mb-2 ${textColor}`}>{value}</p>
          {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
        </div>
        <div className={`flex h-16 w-16 items-center justify-center rounded-xl ${bgColor}`}>
          <FontAwesomeIcon icon={icon} className="h-8 w-8 text-white" />
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
            {isRTL ? 'قوالب رسائل النظام' : 'System Message Templates'}
          </h1>
          <p className="text-gray-400">
            {isRTL ? 'إدارة وتحرير الرسائل الآلية المرسلة للمستخدمين' : 'Manage and edit automated messages sent to users'}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title={isRTL ? "إجمالي القوالب" : "Total Templates"}
            value={templates.length}
            subtitle={isRTL ? "قوالب نشطة" : "Active templates"}
            icon={faFileAlt}
            bgColor="bg-blue-600"
            textColor="text-blue-400"
          />
          <StatCard
            title={isRTL ? "قوالب البريد الإلكتروني" : "Email Templates"}
            value={templates.filter(t => t.channel === 'email').length}
            subtitle={isRTL ? "رسائل إلكترونية" : "Email messages"}
            icon={faEnvelope}
            bgColor="bg-green-600"
            textColor="text-green-400"
          />
          <StatCard
            title={isRTL ? "قوالب الرسائل النصية" : "SMS Templates"}
            value={templates.filter(t => t.channel === 'sms').length}
            subtitle={isRTL ? "رسائل نصية" : "Text messages"}
            icon={faSms}
            bgColor="bg-yellow-600"
            textColor="text-yellow-400"
          />
          <StatCard
            title={isRTL ? "إشعارات التطبيق" : "In-App Notifications"}
            value={templates.filter(t => t.channel === 'in_app').length}
            subtitle={isRTL ? "إشعارات داخلية" : "Push notifications"}
            icon={faBell}
            bgColor="bg-purple-600"
            textColor="text-purple-400"
          />
        </div>

        {/* Tabs and Search */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg">
          <div className="border-b border-gray-700">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-6">
              {/* Channel Tabs */}
              <nav className={cn("-mb-px flex space-x-4 overflow-x-auto", isRTL && "space-x-reverse")}>
                {[
                  { id: 'all', label: isRTL ? 'الكل' : 'All', icon: faFileAlt },
                  { id: 'email', label: isRTL ? 'البريد الإلكتروني' : 'Email', icon: faEnvelope },
                  { id: 'sms', label: isRTL ? 'الرسائل النصية' : 'SMS', icon: faSms },
                  { id: 'in_app', label: isRTL ? 'إشعارات التطبيق' : 'In-App', icon: faBell }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveChannel(tab.id as any)}
                    className={`py-4 px-3 border-b-2 font-medium text-sm flex items-center whitespace-nowrap ${
                      activeChannel === tab.id
                        ? 'border-blue-700 text-blue-400'
                        : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                    }`}
                  >
                    <FontAwesomeIcon icon={tab.icon} className={`${isRTL ? 'ml-2' : 'mr-2'}`} />  
                    {tab.label}
                    <span className={`px-2 py-1 bg-gray-600 text-gray-200 rounded-full text-xs ${isRTL ? 'mr-2' : 'ml-2'}`}>    
                      {getChannelCount(tab.id)}
                    </span>
                  </button>
                ))}
              </nav>

              {/* Search */}
              <div className={`mt-4 lg:mt-0 ${isRTL ? 'lg:mr-6' : 'lg:ml-6'}`}>
                <div className="relative max-w-md">
                  <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder={isRTL ? 'البحث في القوالب...' : 'Search templates...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Templates Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className={`px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                    {isRTL ? 'اسم القالب' : 'Template Name'}
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                    {isRTL ? 'حدث التشغيل' : 'Trigger Event'}
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                    {isRTL ? 'القناة' : 'Channel'}
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                    {isRTL ? 'آخر تحديث' : 'Last Updated'}
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                    {isRTL ? 'الإجراءات' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredTemplates.map((template) => (
                  <tr key={template.id} className="hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FontAwesomeIcon 
                          icon={getCategoryIcon(template.category)} 
                          className={`h-5 w-5 text-blue-400 ${isRTL ? 'ml-3' : 'mr-3'}`} 
                        />
                        <div>
                          <div className="text-sm font-medium text-white">{template.name}</div>
                          <div className="text-xs text-gray-400">{template.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-300 max-w-xs">
                        {template.triggerEvent}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getChannelColor(template.channel)}`}>
                        <FontAwesomeIcon icon={getChannelIcon(template.channel)} className={`${isRTL ? 'ml-1' : 'mr-1'}`} />  
                        {template.channel.charAt(0).toUpperCase() + template.channel.slice(1).replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {new Date(template.lastUpdated).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className={cn("flex space-x-2", isRTL && "space-x-reverse")}>
                        <button
                          onClick={() => handleEditTemplate(template)}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                          title={isRTL ? 'تحرير' : 'Edit'}
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button
                          onClick={() => setSelectedTemplate(template)}
                          className="text-green-400 hover:text-green-300 transition-colors"
                          title={isRTL ? 'معاينة' : 'Preview'}
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                        <button
                          className="text-yellow-400 hover:text-yellow-300 transition-colors"
                          title={isRTL ? 'إعادة تعيين' : 'Reset'}
                        >
                          <FontAwesomeIcon icon={faUndo} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit Template Modal */}
        {editingTemplate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                  {isRTL ? 'تحرير القالب' : 'Edit Template'} - {editingTemplate.name}
                </h2>
                <div className={cn("flex items-center space-x-4", isRTL && "space-x-reverse")}>
                  {/* Language Toggle */}
                                      <div className={cn("flex items-center space-x-2", isRTL && "space-x-reverse")}>
                    <button
                      onClick={() => setEditLanguage('en')}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        editLanguage === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300'
                      }`}
                    >
                      EN
                    </button>
                    <button
                      onClick={() => setEditLanguage('ar')}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        editLanguage === 'ar' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300'
                      }`}
                    >
                      AR
                    </button>
                  </div>
                  <button
                    onClick={() => setEditingTemplate(null)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <FontAwesomeIcon icon={faTimes} className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Main Edit Area */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Subject Line (for email) */}
                    {editingTemplate.channel === 'email' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          {isRTL ? 'موضوع الرسالة' : 'Subject Line'}
                        </label>
                        <input
                          type="text"
                          value={editingTemplate.content[editLanguage].subject || ''}
                          onChange={(e) => setEditingTemplate({
                            ...editingTemplate,
                            content: {
                              ...editingTemplate.content,
                              [editLanguage]: {
                                ...editingTemplate.content[editLanguage],
                                subject: e.target.value
                              }
                            }
                          })}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                          placeholder={isRTL ? 'أدخل موضوع الرسالة...' : 'Enter subject line...'}
                        />
                      </div>
                    )}

                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {isRTL ? 'العنوان' : 'Title'}
                      </label>
                      <input
                        type="text"
                        value={editingTemplate.content[editLanguage].title}
                        onChange={(e) => setEditingTemplate({
                          ...editingTemplate,
                          content: {
                            ...editingTemplate.content,
                            [editLanguage]: {
                              ...editingTemplate.content[editLanguage],
                              title: e.target.value
                            }
                          }
                        })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                        placeholder={isRTL ? 'أدخل العنوان...' : 'Enter title...'}
                      />
                    </div>

                    {/* Message Body */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {isRTL ? 'نص الرسالة' : 'Message Body'}
                      </label>
                      <textarea
                        rows={editingTemplate.channel === 'sms' ? 3 : 8}
                        value={editingTemplate.content[editLanguage].body}
                        onChange={(e) => setEditingTemplate({
                          ...editingTemplate,
                          content: {
                            ...editingTemplate.content,
                            [editLanguage]: {
                              ...editingTemplate.content[editLanguage],
                              body: e.target.value
                            }
                          }
                        })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                        placeholder={isRTL ? 'أدخل نص الرسالة...' : 'Enter message body...'}
                      />
                      {editingTemplate.channel === 'sms' && (
                        <p className="text-xs text-gray-400 mt-1">
                          {isRTL ? `الأحرف: ${editingTemplate.content[editLanguage].body.length}/160` : `Characters: ${editingTemplate.content[editLanguage].body.length}/160`}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Sidebar - Placeholders */}
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-white">
                          {isRTL ? 'المتغيرات المتاحة' : 'Available Placeholders'}
                        </h3>
                        <button
                          onClick={() => setShowPlaceholderHelp(!showPlaceholderHelp)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <FontAwesomeIcon icon={faQuestionCircle} />
                        </button>
                      </div>
                      
                      {showPlaceholderHelp && (
                        <div className="bg-blue-900 border border-blue-700 rounded-lg p-3 mb-4">
                          <p className="text-blue-200 text-sm">
                            {isRTL ? 'انقر على أي متغير لإدراجه في النص' : 'Click any placeholder to insert it into the text'}
                          </p>
                        </div>
                      )}

                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {availablePlaceholders.map((placeholder) => (
                          <div
                            key={placeholder.key}
                            onClick={() => insertPlaceholder(placeholder.key)}
                            className="bg-gray-700 rounded-lg p-3 cursor-pointer hover:bg-gray-600 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <code className="text-yellow-400 text-sm">{`{${placeholder.key}}`}</code>
                              <FontAwesomeIcon icon={faPlus} className="text-gray-400 h-3 w-3" />
                            </div>
                            <p className="text-gray-300 text-xs mt-1">{placeholder.description}</p>
                            <p className="text-gray-500 text-xs">{isRTL ? 'مثال:' : 'e.g.:'} {placeholder.example}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className={cn("flex space-x-3 pt-6 border-t border-gray-700", isRTL && "space-x-reverse")}>
                  <button
                    onClick={handleSaveTemplate}
                    className="flex items-center px-6 py-3 bg-awnash-primary text-black rounded-2xl hover:bg-awnash-primary-hover font-medium transition-colors shadow-lg"
                  >
                    <FontAwesomeIcon icon={faSave} className={`${isRTL ? 'ml-2' : 'mr-2'}`} />  
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
                    className="flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors"
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
            <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-2xl max-w-2xl w-full">
              <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                  {isRTL ? 'معاينة القالب' : 'Template Preview'}
                </h2>
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6">
                {/* Preview based on channel */}
                {selectedTemplate.channel === 'email' && (
                  <div className="bg-white rounded-lg p-6 text-black">
                    <div className="border-b pb-4 mb-4">
                      <h3 className="font-semibold">Subject: {selectedTemplate.content.en.subject}</h3>
                      <p className="text-sm text-gray-600">From: noreply@awnash.com</p>
                    </div>
                    <h2 className="text-xl font-bold mb-4">{selectedTemplate.content.en.title}</h2>
                    <div className="whitespace-pre-line">{selectedTemplate.content.en.body}</div>
                  </div>
                )}

                {selectedTemplate.channel === 'sms' && (
                  <div className="bg-green-100 rounded-lg p-4 max-w-xs mx-auto">
                    <div className="flex items-center mb-2">
                      <FontAwesomeIcon icon={faSms} className={`text-green-600 ${isRTL ? 'ml-2' : 'mr-2'}`} />  
                      <span className="text-sm text-green-800 font-medium">SMS Message</span>
                    </div>
                    <p className="text-green-900">{selectedTemplate.content.en.body}</p>
                  </div>
                )}

                {selectedTemplate.channel === 'in_app' && (
                  <div className="bg-gray-100 rounded-lg p-4 border-l-4 border-blue-500">
                    <div className="flex items-center mb-2">
                      <FontAwesomeIcon icon={faBell} className={`text-blue-600 ${isRTL ? 'ml-2' : 'mr-2'}`} />  
                      <span className="text-sm text-gray-600 font-medium">Push Notification</span>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">{selectedTemplate.content.en.title}</h3>
                    <p className="text-gray-700">{selectedTemplate.content.en.body}</p>
                  </div>
                )}

                <div className="mt-6 pt-4 border-t border-gray-600">
                  <p className="text-sm text-gray-400">
                    {isRTL ? 'هذه معاينة لكيفية ظهور الرسالة للمستخدمين' : 'This is a preview of how the message will appear to users'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemMessageTemplates; 