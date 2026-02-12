'use client';

import React from 'react';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const Reviews: React.FC = () => {
  const { t, isRTL } = useAppTranslation();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Star className={cn("h-5 w-5", isRTL ? "ml-2" : "mr-2")} />
          <h1 className="text-2xl font-bold text-gray-900">
            {t('settings.reviewsRatingsManagement')}
          </h1>
        </div>
        <p className="text-gray-600 mt-1">
          {isRTL 
            ? 'إدارة مراجعات وتقييمات المستخدمين'
            : 'Manage user reviews and ratings'
          }
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {isRTL ? 'إدارة المراجعات' : 'Review Management'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            {isRTL 
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