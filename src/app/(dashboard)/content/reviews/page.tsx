'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

const Reviews: React.FC = () => {
  const { t, currentLanguage } = useLanguage();
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Star className={cn("h-5 w-5", isRTL ? "ml-2" : "mr-2")} />
          <h1 className="text-2xl font-bold text-gray-900">
            {t('reviews_ratings_management')}
          </h1>
        </div>
        <p className="text-gray-600 mt-1">
          {currentLanguage.code === 'ar' 
            ? 'إدارة مراجعات وتقييمات المستخدمين'
            : 'Manage user reviews and ratings'
          }
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {currentLanguage.code === 'ar' ? 'إدارة المراجعات' : 'Review Management'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            {currentLanguage.code === 'ar' 
              ? 'صفحة إدارة المراجعات قيد التطوير...'
              : 'Review management page under development...'
            }
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reviews; 