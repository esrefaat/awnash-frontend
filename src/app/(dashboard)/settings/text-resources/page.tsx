'use client';

import React, { useState } from 'react';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { FileText, Plus, Search, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TextResource {
  id: string;
  key: string;
  categoryAr: string;
  categoryEn: string;
  textAr: string;
  textEn: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const TextResources: React.FC = () => {
  const { t, isRTL } = useAppTranslation();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock data
  const textResources: TextResource[] = [
    {
      id: '1',
      key: 'welcome_message',
      categoryAr: 'واجهة المستخدم',
      categoryEn: 'User Interface',
      textAr: 'مرحباً بك في أونش',
      textEn: 'Welcome to Awnash',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      key: 'error_message_404',
      categoryAr: 'رسائل الخطأ',
      categoryEn: 'Error Messages',
      textAr: 'الصفحة غير موجودة',
      textEn: 'Page not found',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ];

  const categories = [
    { value: 'all', labelAr: 'جميع الفئات', labelEn: 'All Categories' },
    { value: 'ui', labelAr: 'واجهة المستخدم', labelEn: 'User Interface' },
    { value: 'errors', labelAr: 'رسائل الخطأ', labelEn: 'Error Messages' },
    { value: 'notifications', labelAr: 'الإشعارات', labelEn: 'Notifications' },
    { value: 'emails', labelAr: 'البريد الإلكتروني', labelEn: 'Email Templates' },
  ];

  const filteredResources = textResources.filter(resource => {
    const matchesSearch = searchTerm === '' || 
      resource.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.textAr.includes(searchTerm) ||
      resource.textEn.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || 
      resource.categoryEn.toLowerCase().includes(selectedCategory);
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('settings.textResourcesManagement')}
          </h1>
          <p className="text-gray-600 mt-1">
            {isRTL 
              ? 'إدارة النصوص والمحتوى متعدد اللغات'
              : 'Manage multilingual text content and resources'
            }
          </p>
        </div>
        <Button className="flex items-center">
          <Plus className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
          {isRTL ? 'إضافة نص جديد' : 'Add New Text'}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className={cn("relative", isRTL && "text-right")}>
            <Search className={cn(
              "absolute top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400",
              isRTL ? "right-3" : "left-3"
            )} />
            <input
              type="text"
              placeholder={isRTL ? 'البحث في النصوص...' : 'Search texts...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={cn(
                "w-full border border-gray-300 rounded-md py-2 px-10 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
                isRTL && "text-right"
              )}
            />
          </div>
        </div>
        <div className="w-full sm:w-48">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={cn(
              "w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
              isRTL && "text-right"
            )}
          >
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {isRTL ? category.labelAr : category.labelEn}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Text Resources Grid */}
      <div className="grid gap-6">
        {filteredResources.map((resource) => (
          <Card key={resource.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className={cn("h-5 w-5 text-primary-600", isRTL ? "ml-3" : "mr-3")} />
                  <div>
                    <CardTitle className="text-lg font-medium">
                      {resource.key}
                    </CardTitle>
                    <p className="text-sm text-gray-500">
                      {isRTL ? resource.categoryAr : resource.categoryEn}
                    </p>
                  </div>
                </div>
                <div className={cn("flex items-center space-x-2", isRTL && "space-x-reverse")}>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isRTL ? 'النص العربي' : 'Arabic Text'}
                  </label>
                  <div className="p-3 bg-gray-50 rounded-md text-right">
                    {resource.textAr}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isRTL ? 'النص الإنجليزي' : 'English Text'}
                  </label>
                  <div className="p-3 bg-gray-50 rounded-md">
                    {resource.textEn}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center">
                  <span className={cn(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                    resource.isActive 
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  )}>
                    {resource.isActive 
                      ? (isRTL ? 'نشط' : 'Active')
                      : (isRTL ? 'غير نشط' : 'Inactive')
                    }
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {isRTL ? 'آخر تحديث:' : 'Last updated:'} {new Date(resource.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {isRTL ? 'لا توجد نصوص' : 'No text resources'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {isRTL 
              ? 'ابدأ بإضافة نص جديد'
              : 'Get started by adding a new text resource'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default TextResources; 