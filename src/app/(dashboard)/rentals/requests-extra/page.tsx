'use client';

import React from 'react';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ClipboardList } from 'lucide-react';

const Requests: React.FC = () => {
  const { t, isRTL } = useAppTranslation();
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {t('settings.requestManagement')}
        </h1>
        <p className="text-gray-600 mt-1">
          {isRTL
            ? 'إدارة طلبات استئجار المعدات'
            : 'Manage equipment rental requests'
          }
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ClipboardList className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />  
            {isRTL ? 'إدارة الطلبات' : 'Request Management'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            {isRTL
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