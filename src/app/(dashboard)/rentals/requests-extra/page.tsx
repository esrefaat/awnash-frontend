'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ClipboardList } from 'lucide-react';

const Requests: React.FC = () => {
  const { t, currentLanguage } = useLanguage();
  const isRTL = currentLanguage.direction === 'rtl';
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {t('request_management')}
        </h1>
        <p className="text-gray-600 mt-1">
          {currentLanguage.code === 'ar' 
            ? 'إدارة طلبات استئجار المعدات'
            : 'Manage equipment rental requests'
          }
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ClipboardList className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />  
            {currentLanguage.code === 'ar' ? 'إدارة الطلبات' : 'Request Management'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            {currentLanguage.code === 'ar' 
              ? 'صفحة إدارة الطلبات قيد التطوير...'
              : 'Request management page under development...'
            }
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Requests; 