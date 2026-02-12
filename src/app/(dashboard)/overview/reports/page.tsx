'use client';

import React from 'react';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { BarChart3 } from 'lucide-react';

const Reports: React.FC = () => {
  const { t, isRTL } = useAppTranslation();
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {t('settings.transactionUserReports')}
        </h1>
        <p className="text-gray-600 mt-1">
          {isRTL
            ? 'تقارير العملاء والمالكين المفصلة'
            : 'Detailed client and owner activity reports'
          }
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />  
            {isRTL ? 'تقارير شاملة' : 'Comprehensive Reports'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            {isRTL
              ? 'صفحة التقارير قيد التطوير...'
              : 'Reports page under development...'
            }
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports; 