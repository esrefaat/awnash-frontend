'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

const Regions: React.FC = () => {
  const { t, currentLanguage } = useLanguage();
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <MapPin className={cn("h-5 w-5", isRTL ? "ml-2" : "mr-2")} />
          <h1 className="text-2xl font-bold text-gray-900">
            {t('region_management')}
          </h1>
        </div>
        <p className="text-gray-600 mt-1">
          {currentLanguage.code === 'ar' 
            ? 'إدارة المناطق الجغرافية وتوفر الخدمات'
            : 'Manage geographical regions and service availability'
          }
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className={cn("h-5 w-5", isRTL ? "ml-2" : "mr-2")} />
            {currentLanguage.code === 'ar' ? 'إدارة المناطق' : 'Region Management'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            {currentLanguage.code === 'ar' 
              ? 'صفحة إدارة المناطق قيد التطوير...'
              : 'Region management page under development...'
            }
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Regions; 