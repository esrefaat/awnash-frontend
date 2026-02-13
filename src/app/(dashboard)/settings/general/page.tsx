'use client';

import React, { useState, useEffect } from 'react';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Settings as SettingsIcon, Package, Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EquipmentType } from '@/types';
import { equipmentTypeService } from '@/services/equipmentTypeService';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCog,
  faPercent,
  faUsers,
  faBell,
  faLock,
  faDatabase,
  faChevronRight,
  faGlobe,
  faPalette,
  faEnvelope
} from '@fortawesome/free-solid-svg-icons';

const Settings: React.FC = () => {
  const { t, isRTL } = useAppTranslation();
  
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEquipmentTypes();
  }, []);

  const loadEquipmentTypes = async () => {
    try {
      setLoading(true);
      const types = await equipmentTypeService.getAll();
      setEquipmentTypes(types);
    } catch (error) {
      console.error('Error loading equipment types:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await equipmentTypeService.toggleStatus(id);
      await loadEquipmentTypes(); // Refresh the list
    } catch (error) {
      console.error('Error toggling equipment type status:', error);
    }
  };

  const settingsSections = [
    {
      id: 'commission',
      title: isRTL ? 'إعدادات العمولات' : 'Commission Settings',
      description: isRTL ? 'إدارة عمولات أوناش للملاك والمستأجرين' : 'Manage Awnash commission rates for owners and renters',
      icon: faPercent,
      path: '/settings/commission',
      color: 'var(--awnash-primary)',
      bgColor: 'var(--awnash-primary-light)'
    },
    {
      id: 'users',
      title: isRTL ? 'إدارة المستخدمين' : 'User Management',
      description: isRTL ? 'إدارة حسابات المستخدمين والصلاحيات' : 'Manage user accounts and permissions',
      icon: faUsers,
      path: '/users',
      color: 'var(--awnash-accent)',
      bgColor: 'var(--awnash-accent-light)'
    },
    {
      id: 'notifications',
      title: isRTL ? 'إعدادات الإشعارات' : 'Notification Settings',
      description: isRTL ? 'تخصيص الإشعارات والتنبيهات' : 'Customize notifications and alerts',
      icon: faBell,
      path: '/settings/notifications',
      color: 'var(--awnash-warning)',
      bgColor: 'var(--awnash-warning-light)'
    },
    {
      id: 'security',
      title: isRTL ? 'الأمان والخصوصية' : 'Security & Privacy',
      description: isRTL ? 'إعدادات الأمان وحماية البيانات' : 'Security settings and data protection',
      icon: faLock,
      path: '/settings/security',
      color: 'var(--awnash-error)',
      bgColor: 'var(--awnash-error-light)'
    },
    {
      id: 'database',
      title: isRTL ? 'النسخ الاحتياطي' : 'Database Backup',
      description: isRTL ? 'إدارة النسخ الاحتياطي للبيانات' : 'Manage database backups and restoration',
      icon: faDatabase,
      path: '/settings/backup',
      color: 'var(--awnash-info)',
      bgColor: 'var(--awnash-info-light)'
    },
    {
      id: 'appearance',
      title: isRTL ? 'المظهر والثيم' : 'Appearance & Theme',
      description: isRTL ? 'تخصيص مظهر النظام والألوان' : 'Customize system appearance and colors',
      icon: faPalette,
      path: '/settings/appearance',
      color: 'var(--awnash-success)',
      bgColor: 'var(--awnash-success-light)'
    }
  ];

  return (
    <div className="space-y-6" style={{ fontFamily: isRTL ? 'var(--awnash-font-arabic)' : 'var(--awnash-font-english)' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--awnash-secondary)' }}>
            {isRTL ? 'الإعدادات العامة' : 'System Settings'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isRTL ? 'إدارة وتخصيص إعدادات منصة أوناش' : 'Manage and customize Awnash platform settings'}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'var(--awnash-primary)' }}
            >
              <FontAwesomeIcon icon={faCog} className="text-black" />
            </div>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--awnash-secondary)' }}>
              {isRTL ? 'الإعدادات السريعة' : 'Quick Settings'}
            </h3>
          </div>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
              <FontAwesomeIcon icon={faGlobe} className="text-blue-600" />
              <div>
                <p className="font-medium text-sm">{isRTL ? 'اللغة' : 'Language'}</p>
                <p className="text-xs text-gray-600">{isRTL ? 'العربية' : 'English'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
              <FontAwesomeIcon icon={faEnvelope} className="text-green-600" />
              <div>
                <p className="font-medium text-sm">{isRTL ? 'الإشعارات' : 'Notifications'}</p>
                <p className="text-xs text-gray-600">{isRTL ? 'مفعل' : 'Enabled'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
              <FontAwesomeIcon icon={faLock} className="text-red-600" />
              <div>
                <p className="font-medium text-sm">{isRTL ? 'الأمان' : 'Security'}</p>
                <p className="text-xs text-gray-600">{isRTL ? 'عالي' : 'High'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settingsSections.map((section) => (
          <Link
            key={section.id}
            href={section.path}
            className="card group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="card-body">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: section.bgColor }}
                  >
                    <FontAwesomeIcon 
                      icon={section.icon} 
                      className="text-lg"
                      style={{ color: section.color }}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2" style={{ color: 'var(--awnash-secondary)' }}>
                      {section.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {section.description}
                    </p>
                  </div>
                </div>
                <FontAwesomeIcon 
                  icon={faChevronRight} 
                  className={`text-muted-foreground group-hover:text-gray-600 transition-colors ${isRTL ? 'rotate-180' : ''}`}
                />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* System Information */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--awnash-secondary)' }}>
            {isRTL ? 'معلومات النظام' : 'System Information'}
          </h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                {isRTL ? 'إصدار النظام' : 'System Version'}
              </p>
              <p className="font-semibold" style={{ color: 'var(--awnash-secondary)' }}>
                v2.1.0
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                {isRTL ? 'آخر تحديث' : 'Last Updated'}
              </p>
              <p className="font-semibold" style={{ color: 'var(--awnash-secondary)' }}>
                2024-06-07
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                {isRTL ? 'حالة النظام' : 'System Status'}
              </p>
              <span className="badge badge-success">
                {isRTL ? 'نشط' : 'Active'}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                {isRTL ? 'قاعدة البيانات' : 'Database Status'}
              </p>
              <span className="badge badge-success">
                {isRTL ? 'متصل' : 'Connected'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Support Information */}
      <div className="card">
        <div className="card-body">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--awnash-secondary)' }}>
              {isRTL ? 'هل تحتاج مساعدة؟' : 'Need Help?'}
            </h3>
            <p className="text-gray-600 mb-4">
              {isRTL 
                ? 'تواصل مع فريق الدعم الفني لأي استفسارات أو مشاكل'
                : 'Contact our support team for any questions or issues'
              }
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="default">
                {isRTL ? 'تواصل مع الدعم' : 'Contact Support'}
              </Button>
              <Button variant="secondary">
                {isRTL ? 'دليل المستخدم' : 'User Guide'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 