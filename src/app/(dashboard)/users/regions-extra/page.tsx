'use client';

import React from 'react';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

const Regions: React.FC = () => {
  const { t, isRTL } = useAppTranslation();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <MapPin className={cn("h-5 w-5", isRTL ? "ml-2" : "mr-2")} />
          <h1 className="text-2xl font-bold text-gray-900">
            {t('settings.regionManagement')}
          </h1>
        </div>
        <p className="text-gray-600 mt-1">
          {isRTL
            ? 'إدارة المناطق الجغرافية وتوفر الخدمات'
            : 'Manage geographical regions and service availability'
          }
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className={cn("h-5 w-5", isRTL ? "ml-2" : "mr-2")} />
            {isRTL ? 'إدارة المناطق' : 'Region Management'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            {isRTL
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