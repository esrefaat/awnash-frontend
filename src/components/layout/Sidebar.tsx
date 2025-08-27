'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTachometerAlt,
  faCalendarCheck,
  faClipboardList,
  faMap,
  faCalendarAlt,
  faGavel,
  faTruck,
  faPlus,
  faUsers,
  faIdCard,
  faMapMarkerAlt,
  faBullhorn,
  faChartLine,
  faCogs,
  faUsers as faSegments,
  faBell,
  faNewspaper,
  faImage,
  faFont,
  faEnvelope,
  faCog,
  faUserShield,
  faFileAlt,
  faSignInAlt,
  faKey,
  faBars,
  faTimes,
  faChevronUp,
  faChevronRight,
  faDollarSign,
  faCreditCard,
  faReceipt,
  faChevronLeft
} from '@fortawesome/free-solid-svg-icons';
import { cn } from '../../lib/utils';

interface MenuSubItem {
  key: string;
  icon: any;
  label: string;
  labelAr: string;
  path: string;
}

interface MenuGroup {
  key: string;
  label: string;
  labelAr: string;
  icon: any;
  items: MenuSubItem[];
}

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleCollapse }) => {
  const { i18n } = useTranslation();
  const pathname = usePathname();
  const isRTL = i18n.language === 'ar';
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['overview', 'rentals', 'equipment-users']);

  const toggleGroup = (key: string) => {
    setExpandedGroups(prev => 
      prev.includes(key) 
        ? prev.filter(item => item !== key)
        : [...prev, key]
    );
  };

  const isGroupExpanded = (key: string) => expandedGroups.includes(key);

  // Grouped Menu Structure
  const menuGroups: MenuGroup[] = [
    {
      key: 'overview',
      label: 'Overview',
      labelAr: 'نظرة عامة',
      icon: faTachometerAlt,
      items: [
        {
          key: 'main-dashboard',
          icon: faTachometerAlt,
          label: 'Main Dashboard',
          labelAr: 'لوحة التحكم الرئيسية',
          path: '/overview/main-dashboard'
        },
        {
          key: 'modern-dashboard',
          icon: faChartLine,
          label: 'Modern Dashboard',
          labelAr: 'لوحة التحكم الحديثة',
          path: '/overview/modern-dashboard'
        },
        {
          key: 'user-dashboard',
          icon: faUsers,
          label: 'User Dashboard',
          labelAr: 'لوحة تحكم المستخدم',
          path: '/overview/user-dashboard'
        }
      ]
    },
    {
      key: 'rentals',
      label: 'Rental Operations',
      labelAr: 'عمليات التأجير',
      icon: faCalendarCheck,
      items: [
        {
          key: 'bookings',
          icon: faCalendarCheck,
          label: 'Bookings',
          labelAr: 'الحجوزات',
          path: '/rentals/bookings'
        },
        {
          key: 'requests',
          icon: faClipboardList,
          label: 'ٍRental Requests',
          labelAr: 'طلبات التأجير',
          path: '/rentals/requests'
        },
        {
          key: 'live-map',
          icon: faMap,
          label: 'Live Rental Map',
          labelAr: 'الخريطة الحية للتأجير',
          path: '/rentals/live-map'
        },
        {
          key: 'calendar',
          icon: faCalendarAlt,
          label: 'Operations Calendar',
          labelAr: 'جدول العمليات',
          path: '/rentals/calendar'
        },
        {
          key: 'disputes',
          icon: faGavel,
          label: 'Dispute Resolution',
          labelAr: 'حل النزاعات',
          path: '/rentals/disputes'
        }
      ]
    },
    {
      key: 'equipment-users',
      label: 'Equipment & Users',
      labelAr: 'المعدات و العملاء',
      icon: faTruck,
      items: [
        {
          key: 'equipment-list',
          icon: faTruck,
          label: 'Equipment List',
          labelAr: 'قائمة المعدات',
          path: '/equipment/list'
        },
        {
          key: 'all-equipment',
          icon: faTruck,
          label: 'All Equipment',
          labelAr: 'جميع المعدات',
          path: '/equipment/all'
        },
        {
          key: 'equipment-add',
          icon: faPlus,
          label: 'Add Equipment',
          labelAr: 'إضافة معدة',
          path: '/equipment/add'
        },
        {
          key: 'users-all',
          icon: faUsers,
          label: 'All Users',
          labelAr: 'جميع المستخدمين',
          path: '/users/all'
        },
        {
          key: 'users-modern',
          icon: faUsers,
          label: 'Modern Users',
          labelAr: 'المستخدمون المتقدمون',
          path: '/users/modern'
        },
        {
          key: 'users-documents',
          icon: faIdCard,
          label: 'Document Verification',
          labelAr: 'التحقق من الوثائق',
          path: '/users/documents'
        },
        {
          key: 'region-management',
          icon: faMapMarkerAlt,
          label: 'Region Management',
          labelAr: 'إدارة المناطق',
          path: '/users/regions'
        }
      ]
    },
    {
      key: 'engagement',
      label: 'Marketing & Engagement',
      labelAr: 'التفاعل والتسويق',
      icon: faBullhorn,
      items: [
        {
          key: 'campaign-creator',
          icon: faBullhorn,
          label: 'Campaign Creator',
          labelAr: 'إنشاء حملة',
          path: '/engagement/campaigns-create'
        },
        {
          key: 'campaign-analytics',
          icon: faChartLine,
          label: 'Campaign Analytics',
          labelAr: 'تحليل أداء الحملات',
          path: '/engagement/campaigns-analytics'
        },
        {
          key: 'trigger-rules',
          icon: faCogs,
          label: 'Trigger Rules',
          labelAr: 'قواعد التفعيل',
          path: '/engagement/trigger-rules'
        },
        {
          key: 'user-segments',
          icon: faSegments,
          label: 'User Segments',
          labelAr: 'شرائح الجمهور',
          path: '/users/modern'
        },
        {
          key: 'notifications',
          icon: faBell,
          label: 'Notifications Center',
          labelAr: 'مركز الإشعارات',
          path: '/engagement/notifications'
        }
      ]
    },
    {
      key: 'content',
      label: 'Content Managment',
      labelAr: 'إدارة المحتوى',
      icon: faNewspaper,
      items: [
        {
          key: 'articles',
          icon: faNewspaper,
          label: 'Articles Publishing',
          labelAr: 'نشر المقالات',
          path: '/content/articles'
        },
        {
          key: 'banners',
          icon: faImage,
          label: 'Banners & Promotions',
          labelAr: 'اللافتات والعروض',
          path: '/content/banners'
        },
        {
          key: 'brand-colors',
          icon: faFont,
          label: 'Brand & Colors',
          labelAr: 'العلامة التجارية والألوان',
          path: '/content/banners'
        },
        {
          key: 'message-templates',
          icon: faEnvelope,
          label: 'Message Templates',
          labelAr: 'نماذج الرسائل',
          path: '/content/message-templates'
        }
      ]
    },
    {
      key: 'finance',
      label: 'Financial Management',
      labelAr: 'الإدارة المالية',
      icon: faDollarSign,
      items: [
        {
          key: 'commission-reports',
          icon: faReceipt,
          label: 'Financial Report',
          labelAr: 'التقارير المالية',
          path: '/finance/reports'
        },
        {
          key: 'payments',
          icon: faCreditCard,
          label: 'Payment Management',
          labelAr: 'إدارة المدفوعات',
          path: '/finance/payments'
        },
        {
          key: 'invoices',
          icon: faFileAlt,
          label: 'Invoices',
          labelAr: 'الفواتير',
          path: '/finance/invoices'
        }
      ]
    },
    {
      key: 'settings',
      label: 'Settings',
      labelAr: 'الإعدادات',
      icon: faCog,
      items: [
        {
          key: 'general-settings',
          icon: faCog,
          label: 'General Settings',
          labelAr: 'الإعدادات العامة',
          path: '/settings/general'
        },
        {
          key: 'permissions',
          icon: faUserShield,
          label: 'Permissions',
          labelAr: 'الصلاحيات',
          path: '/settings/admin'
        },
        {
          key: 'user-management',
          icon: faUsers,
          label: 'User Management',
          labelAr: 'إدارة المستخدمين',
          path: '/settings/users'
        },
        {
          key: 'roles-permissions',
          icon: faUserShield,
          label: 'Roles & Permissions',
          labelAr: 'الأدوار والصلاحيات',
          path: '/settings/roles-permissions'
        },
        {
          key: 'audit-log',
          icon: faFileAlt,
          label: 'Audit Log',
          labelAr: 'سجل النشاط',
          path: '/finance/reports'
        }
      ]
    }
  ];

  const authItems = [
    {
      key: 'forgot-password',
      icon: faKey,
      label: 'Reset Password',
      labelAr: 'إعادة تعيين كلمة المرور',
      path: '/forgot-password'
    }
  ];

  const renderMenuItem = (item: MenuSubItem, isInGroup = false) => {
    const isActive = pathname === item.path;
    
    return (
      <Link
        key={item.key}
        href={item.path}
        className={cn(
          'flex items-center gap-3 rounded-2xl transition-all duration-200 hover:shadow-lg',
          isInGroup ? 'px-4 py-2 mb-1' : 'px-3 py-3 mb-1',
          isActive
            ? 'bg-awnash-primary text-black font-semibold shadow-lg'
            : 'text-gray-300 hover:text-white hover:bg-gray-700',
          isRTL && !isCollapsed && 'text-right',
          isCollapsed ? 'justify-center' : '',
          isInGroup && isRTL ? 'mr-4' : isInGroup && !isRTL ? 'ml-4' : ''
        )}
        title={isCollapsed ? (isRTL ? item.labelAr : item.label) : ''}
      >
        <FontAwesomeIcon 
          icon={item.icon} 
          className={cn(
            isInGroup ? 'text-sm' : 'text-lg',
            isCollapsed ? 'mx-auto' : ''
          )}
        />
        {!isCollapsed && (
          <span className={cn(
            'font-medium',
            isInGroup ? 'text-sm' : 'text-base'
          )}>
            {isRTL ? item.labelAr : item.label}
          </span>
        )}
      </Link>
    );
  };

  const renderGroupHeader = (group: MenuGroup) => {
    const isExpanded = isGroupExpanded(group.key);
    
    return (
      <button
        onClick={() => !isCollapsed && toggleGroup(group.key)}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-3 mb-2 rounded-2xl transition-all duration-200 group',
          'text-gray-300 hover:text-white hover:bg-gray-700 font-medium',
          isRTL && !isCollapsed && 'text-right',
          isCollapsed ? 'justify-center cursor-default' : 'cursor-pointer'
        )}
        disabled={isCollapsed}
        title={isCollapsed ? (isRTL ? group.labelAr : group.label) : ''}
      >
        <FontAwesomeIcon 
          icon={group.icon} 
          className={cn('text-sm', isCollapsed ? 'mx-auto' : '')}
        />
        {!isCollapsed && (
          <>
            <span className="font-bold text-sm flex-1">
              {isRTL ? group.labelAr : group.label}
            </span>
            <FontAwesomeIcon 
              icon={isExpanded ? faChevronUp : isRTL ? faChevronLeft : faChevronRight} 
              className="text-sm transition-transform duration-200"
            />
          </>
        )}
      </button>
    );
  };

  return (
    <div
      className={cn(
        'fixed top-0 h-full z-40 transition-all duration-300 bg-black border-gray-700',
        isRTL ? 'right-0 border-l' : 'left-0 border-r',
        isCollapsed ? 'w-16' : 'w-64',
        isRTL ? 'font-arabic' : 'font-montserrat'
      )}
    >
      {/* Logo Section */}
      <div className={cn(
        'flex items-center justify-between p-[1.45rem] border-b border-gray-700',
        isCollapsed && 'px-3'
      )}>
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-awnash-primary rounded-2xl flex items-center justify-center text-black font-bold text-xl shadow-lg">
              A
            </div>
            <h1 className="text-xl font-bold text-white">
              {isRTL ? 'أوناش' : 'Awnash'}
            </h1>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg hover:bg-gray-700 text-white transition-colors"
        >
          <FontAwesomeIcon icon={isCollapsed ? faBars : faTimes} />
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="mt-6 px-3 space-y-4 overflow-y-auto max-h-[calc(100vh-100px)]">
        {/* Grouped Menu Items */}
        {menuGroups.map((group) => {
          const isExpanded = isGroupExpanded(group.key);
          
          return (
            <div key={group.key} className="space-y-1">
              {renderGroupHeader(group)}
              
              {/* Group Items */}
              {(!isCollapsed && isExpanded) && (
                <div className="space-y-1">
                  {group.items.map((item) => renderMenuItem(item, true))}
                </div>
              )}
            </div>
          );
        })}

        {/* Authentication Section */}
        {!isCollapsed && (
          <>
            <div className="pt-4 border-t border-gray-700 mt-6">
              <div className="px-3 py-2 mb-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {isRTL ? 'المصادقة' : 'Authentication'}
                </span>
              </div>
              {authItems.map((item) => renderMenuItem(item))}
            </div>
          </>
        )}
      </nav>
    </div>
  );
};

export default Sidebar; 