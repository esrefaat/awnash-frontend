'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGlobe,
  faMobile,
  faSearch,
  faEdit,
  faSave,
  faTimes,
  faPlus,
  faUpload,
  faEye,
  faToggleOn,
  faToggleOff,
  faHistory,
  faCalendar,
  faLink,
  faImage,
  faPlay,
  faLanguage,
  faMapMarkerAlt,
  faFilter,
  faDownload,
  faCode
} from '@fortawesome/free-solid-svg-icons';

interface TextSnippet {
  id: string;
  key: string;
  textEn: string;
  textAr: string;
  location: 'web' | 'app' | 'both';
  screen: string;
  lastEditedBy: string;
  lastEditedDate: string;
  category: string;
}

interface Banner {
  id: string;
  name: string;
  location: string;
  imageUrl: string;
  ctaTextEn: string;
  ctaTextAr: string;
  ctaLink: string;
  startDate: string;
  endDate: string;
  enabled: boolean;
  type: 'image' | 'gif' | 'video';
  placement: string;
}

const ContentManager: React.FC = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [activeTab, setActiveTab] = useState<'snippets' | 'banners'>('snippets');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<'all' | 'web' | 'app' | 'both'>('all');
  const [groupByScreen, setGroupByScreen] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState<string | null>(null);
  const [editingBanner, setEditingBanner] = useState<string | null>(null);

  // Mock text snippets data
  const [textSnippets, setTextSnippets] = useState<TextSnippet[]>([
    {
      id: '1',
      key: 'home.hero_title',
      textEn: 'Find Heavy Equipment Rentals Across the Gulf',
      textAr: 'اعثر على تأجير المعدات الثقيلة في دول الخليج',
      location: 'both',
      screen: 'Homepage',
      lastEditedBy: 'Ahmed Al-Rashid',
      lastEditedDate: '2024-06-15',
      category: 'Hero Section'
    },
    {
      id: '2',
      key: 'home.hero_subtitle',
      textEn: 'Connect with verified equipment owners and renters',
      textAr: 'تواصل مع مالكي ومستأجري المعدات المعتمدين',
      location: 'both',
      screen: 'Homepage',
      lastEditedBy: 'Sara Mohammed',
      lastEditedDate: '2024-06-14',
      category: 'Hero Section'
    },
    {
      id: '3',
      key: 'booking.confirmation_message',
      textEn: 'Your booking request has been submitted successfully',
      textAr: 'تم إرسال طلب الحجز بنجاح',
      location: 'app',
      screen: 'Booking',
      lastEditedBy: 'Omar Abdullah',
      lastEditedDate: '2024-06-13',
      category: 'Notifications'
    },
    {
      id: '4',
      key: 'footer.contact_us',
      textEn: 'Contact Us',
      textAr: 'اتصل بنا',
      location: 'web',
      screen: 'Footer',
      lastEditedBy: 'Fatima Ali',
      lastEditedDate: '2024-06-12',
      category: 'Navigation'
    }
  ]);

  // Mock banners data
  const [banners, setBanners] = useState<Banner[]>([
    {
      id: '1',
      name: 'Homepage Hero Banner',
      location: 'web',
      imageUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=400&fit=crop',
      ctaTextEn: 'Start Renting Today',
      ctaTextAr: 'ابدأ الإيجار اليوم',
      ctaLink: '/register',
      startDate: '2024-06-01',
      endDate: '2024-12-31',
      enabled: true,
      type: 'image',
      placement: 'hero'
    },
    {
      id: '2',
      name: 'Mobile App Promo',
      location: 'app',
      imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=300&fit=crop',
      ctaTextEn: 'Download App',
      ctaTextAr: 'حمل التطبيق',
      ctaLink: 'https://apps.apple.com/awnash',
      startDate: '2024-06-01',
      endDate: '2024-08-31',
      enabled: true,
      type: 'image',
      placement: 'popup'
    },
    {
      id: '3',
      name: 'Equipment Listing Sidebar',
      location: 'both',
      imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=300&h=600&fit=crop',
      ctaTextEn: 'List Your Equipment',
      ctaTextAr: 'أدرج معداتك',
      ctaLink: '/owner/register',
      startDate: '2024-06-01',
      endDate: '2024-12-31',
      enabled: false,
      type: 'image',
      placement: 'sidebar'
    }
  ]);

  const getLocationIcon = (location: string) => {
    switch (location) {
      case 'web': return faGlobe;
      case 'app': return faMobile;
      case 'both': return faCode;
      default: return faGlobe;
    }
  };

  const getLocationColor = (location: string) => {
    switch (location) {
      case 'web': return 'text-blue-400';
      case 'app': return 'text-green-400';
      case 'both': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const filteredSnippets = textSnippets.filter(snippet => {
    const matchesSearch = snippet.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         snippet.textEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         snippet.textAr.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = selectedLocation === 'all' || snippet.location === selectedLocation;
    return matchesSearch && matchesLocation;
  });

  const groupedSnippets = groupByScreen ? 
    filteredSnippets.reduce((acc, snippet) => {
      if (!acc[snippet.screen]) acc[snippet.screen] = [];
      acc[snippet.screen].push(snippet);
      return acc;
    }, {} as Record<string, TextSnippet[]>) : { 'All': filteredSnippets };

  const renderTextSnippetsTab = () => (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {isRTL ? 'البحث' : 'Search'}
            </label>
            <div className="relative">
              <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={isRTL ? 'البحث بالمفتاح أو النص...' : 'Search by key or text...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {isRTL ? 'الموقع' : 'Location'}
            </label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value as any)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{isRTL ? 'جميع المواقع' : 'All Locations'}</option>
              <option value="web">{isRTL ? 'الموقع الإلكتروني' : 'Website'}</option>
              <option value="app">{isRTL ? 'التطبيق' : 'Mobile App'}</option>
              <option value="both">{isRTL ? 'كلاهما' : 'Both'}</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setGroupByScreen(!groupByScreen)}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                groupByScreen 
                  ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <FontAwesomeIcon icon={faFilter} className={`${isRTL ? 'ml-2' : 'mr-2'}`} />
              {isRTL ? 'تجميع بالشاشة' : 'Group by Screen'}
            </button>
          </div>
        </div>
      </div>

      {/* Text Snippets Table */}
      {Object.entries(groupedSnippets).map(([screenName, snippets]) => (
        <div key={screenName} className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700">
            <h3 className="text-xl font-bold text-white">
              {groupByScreen ? screenName : (isRTL ? 'جميع النصوص' : 'All Text Snippets')}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className={`px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                    {isRTL ? 'المفتاح' : 'Key'}
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                    {isRTL ? 'النص (إنجليزي)' : 'Text (English)'}
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                    {isRTL ? 'النص (عربي)' : 'Text (Arabic)'}
                  </th>
                  <th className={`px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                    {isRTL ? 'الموقع' : 'Location'}
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
                {snippets.map((snippet) => (
                  <tr key={snippet.id} className="hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-400">
                      {snippet.key}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300 max-w-xs">
                      <div className="truncate" title={snippet.textEn}>
                        {snippet.textEn}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300 max-w-xs" dir="rtl">
                      <div className="truncate" title={snippet.textAr}>
                        {snippet.textAr}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FontAwesomeIcon 
                          icon={getLocationIcon(snippet.location)} 
                          className={`h-4 w-4 ${getLocationColor(snippet.location)} ${isRTL ? 'ml-2' : 'mr-2'}`}  
                        />
                        <span className="text-sm text-gray-300 capitalize">{snippet.location}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      <div>
                        <div>{snippet.lastEditedBy}</div>
                        <div className="text-xs">{snippet.lastEditedDate}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={cn("flex space-x-2", isRTL && "space-x-reverse")}>  
                        <button
                          onClick={() => setEditingSnippet(snippet.id)}
                          className="text-blue-400 hover:text-blue-300"
                          title={isRTL ? 'تعديل' : 'Edit'}
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button
                          className="text-gray-400 hover:text-gray-300"
                          title={isRTL ? 'التاريخ' : 'History'}
                        >
                          <FontAwesomeIcon icon={faHistory} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* Add New Snippet Button */}
      <div className="flex justify-end">
        <button className="flex items-center px-6 py-3 bg-awnash-primary text-black rounded-2xl hover:bg-awnash-primary-hover font-medium transition-colors shadow-lg">
          <FontAwesomeIcon icon={faPlus} className={`${isRTL ? 'ml-2' : 'mr-2'}`} />
          {isRTL ? 'إضافة نص جديد' : 'Add New Snippet'}
        </button>
      </div>
    </div>
  );

  const renderBannersTab = () => (
    <div className="space-y-6">
      {/* Banner Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {banners.map((banner) => (
          <div key={banner.id} className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg overflow-hidden">
            <div className="relative">
              <img
                src={banner.imageUrl}
                alt={banner.name}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-4 right-4">
                <button
                  onClick={() => {
                    setBanners(banners.map(b => 
                      b.id === banner.id ? { ...b, enabled: !b.enabled } : b
                    ));
                  }}
                  className={`p-2 rounded-full ${
                    banner.enabled 
                      ? 'bg-yellow-600 text-white' 
                      : 'bg-gray-600 text-gray-300'
                  } hover:bg-opacity-80 transition-colors`}
                >
                  <FontAwesomeIcon icon={banner.enabled ? faToggleOn : faToggleOff} />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">{banner.name}</h3>
                <div className="flex items-center">
                  <FontAwesomeIcon 
                    icon={getLocationIcon(banner.location)} 
                    className={`h-4 w-4 ${getLocationColor(banner.location)}`}
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-400 uppercase">
                    {isRTL ? 'نص الدعوة للعمل' : 'CTA Text'}
                  </label>
                  <div className="text-sm text-gray-300">
                    {isRTL ? banner.ctaTextAr : banner.ctaTextEn}
                  </div>
                </div>
                
                <div>
                  <label className="text-xs text-gray-400 uppercase">
                    {isRTL ? 'الفترة' : 'Duration'}
                  </label>
                  <div className="text-sm text-gray-300">
                    {banner.startDate} - {banner.endDate}
                  </div>
                </div>
                
                <div className={cn("flex space-x-2 pt-4", isRTL && "space-x-reverse")}>
                  <button
                    onClick={() => setEditingBanner(banner.id)}
                    className="flex-1 px-4 py-2 bg-awnash-primary text-black rounded-2xl hover:bg-awnash-primary-hover font-medium transition-colors shadow-lg"
                  >
                    <FontAwesomeIcon icon={faEdit} className={`${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {isRTL ? 'تعديل' : 'Edit'}
                  </button>
                  <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors">
                    <FontAwesomeIcon icon={faEye} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Add New Banner Card */}
        <div className="bg-gray-800 rounded-xl border-2 border-dashed border-gray-600 shadow-lg flex items-center justify-center min-h-[400px] hover:border-blue-500 transition-colors cursor-pointer">
          <div className="text-center">
            <FontAwesomeIcon icon={faPlus} className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-400 mb-2">
              {isRTL ? 'إضافة بانر جديد' : 'Add New Banner'}
            </h3>
            <p className="text-sm text-gray-500">
              {isRTL ? 'انقر لإنشاء بانر جديد' : 'Click to create a new banner'}
            </p>
          </div>
        </div>
      </div>

      {/* Preview Controls */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-white mb-4">
          {isRTL ? 'عناصر التحكم في المعاينة' : 'Preview Controls'}
        </h3>
        <div className={cn("flex space-x-4", isRTL && "space-x-reverse")}>
          <button className="flex items-center px-4 py-2 bg-awnash-primary text-black rounded-2xl hover:bg-awnash-primary-hover font-medium transition-colors shadow-lg">
            <FontAwesomeIcon icon={faGlobe} className={`${isRTL ? 'ml-2' : 'mr-2'}`} />
            {isRTL ? 'معاينة الويب' : 'Web Preview'}
          </button>
          <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors">
            <FontAwesomeIcon icon={faMobile} className={`${isRTL ? 'ml-2' : 'mr-2'}`} />
            {isRTL ? 'معاينة الموبايل' : 'Mobile Preview'}
          </button>
          <button className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors">
            <FontAwesomeIcon icon={faHistory} className={`${isRTL ? 'ml-2' : 'mr-2'}`} />
            {isRTL ? 'سجل النسخ' : 'Version History'}
          </button>
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
            {isRTL ? 'مدير محتوى الموقع والتطبيق' : 'Website & App Content Manager'}
          </h1>
          <p className="text-gray-400">
            {isRTL ? 'إدارة النصوص والبانرات الظاهرة للمستخدمين بدون تغيير الكود' : 'Manage user-facing texts and banners without code changes'}
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg">
          <div className="border-b border-gray-700">
            <nav className={cn("-mb-px flex space-x-4 px-6 overflow-x-auto", isRTL && "space-x-reverse")}>
              {[
                { id: 'snippets', label: isRTL ? 'إدارة النصوص' : 'Text Snippets', icon: faLanguage },
                { id: 'banners', label: isRTL ? 'إدارة البانرات' : 'Banner Management', icon: faImage }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-3 border-b-2 font-medium text-sm flex items-center whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-700 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                  }`}
                >
                  <FontAwesomeIcon icon={tab.icon} className={`${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'snippets' && renderTextSnippetsTab()}
            {activeTab === 'banners' && renderBannersTab()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentManager; 