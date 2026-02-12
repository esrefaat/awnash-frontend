'use client';

import React from 'react';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Shield } from 'lucide-react';

const Permissions: React.FC = () => {
  const { t, isRTL } = useAppTranslation();
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {t('settings.permissionsManagement')}
        </h1>
        <p className="text-gray-600 mt-1">
          {isRTL
            ? 'إدارة صلاحيات المستخدمين والأدوار'
            : 'Manage user permissions and roles'
          }
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />  
            {isRTL ? 'إدارة الصلاحيات' : 'Permission Management'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            {isRTL
              ? 'صفحة إدارة الصلاحيات قيد التطوير...'
              : 'Permission management page under development...'
            }
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Permissions; 