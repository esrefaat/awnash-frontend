'use client';

import React from 'react';
import { PieChart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

const Analytics: React.FC = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <PieChart className={cn("h-5 w-5", isRTL ? "ml-2" : "mr-2")} />
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <PieChart className={cn("h-5 w-5", isRTL ? "ml-2" : "mr-2")} />
            {i18n.language === 'ar' ? 'التحليلات' : 'Analytics'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            {i18n.language === 'ar' 
              ? 'صفحة التحليلات قيد التطوير...'
              : 'Analytics page under development...'
            }
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics; 