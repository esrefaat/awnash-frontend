'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppTranslation } from '@/hooks/useAppTranslation';
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
  faMoneyBillWave,
  faChevronLeft,
  faShieldHalved
} from '@fortawesome/free-solid-svg-icons';
import { cn } from '../../lib/utils';

interface MenuSubItem {
  key: string;
  icon: any;
  i18nKey: string;
  path: string;
}

interface MenuGroup {
  key: string;
  i18nKey: string;
  icon: any;
  items: MenuSubItem[];
}

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleCollapse }) => {
  const { t, isRTL } = useAppTranslation();
  const pathname = usePathname();
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
      i18nKey: 'sidebar.overview',
      icon: faTachometerAlt,
      items: [
        {
          key: 'main-dashboard',
          icon: faTachometerAlt,
          i18nKey: 'sidebar.mainDashboard',
          path: '/overview/main-dashboard'
        },
        {
          key: 'modern-dashboard',
          icon: faChartLine,
          i18nKey: 'sidebar.modernDashboard',
          path: '/overview/modern-dashboard'
        },
        {
          key: 'user-dashboard',
          icon: faUsers,
          i18nKey: 'sidebar.userDashboard',
          path: '/overview/user-dashboard'
        }
      ]
    },
    {
      key: 'rentals',
      i18nKey: 'sidebar.rentalOperations',
      icon: faCalendarCheck,
      items: [
        {
          key: 'bookings',
          icon: faCalendarCheck,
          i18nKey: 'sidebar.bookings',
          path: '/rentals/bookings'
        },
        {
          key: 'requests',
          icon: faClipboardList,
          i18nKey: 'sidebar.rentalRequests',
          path: '/rentals/requests'
        },
        {
          key: 'live-map',
          icon: faMap,
          i18nKey: 'sidebar.liveRentalMap',
          path: '/rentals/live-map'
        },
        {
          key: 'calendar',
          icon: faCalendarAlt,
          i18nKey: 'sidebar.operationsCalendar',
          path: '/rentals/calendar'
        },
        {
          key: 'disputes',
          icon: faGavel,
          i18nKey: 'sidebar.disputeResolution',
          path: '/rentals/disputes'
        }
      ]
    },
    {
      key: 'equipment-users',
      i18nKey: 'sidebar.equipmentUsers',
      icon: faTruck,
      items: [
        {
          key: 'equipment-list',
          icon: faTruck,
          i18nKey: 'sidebar.equipmentList',
          path: '/equipment/list'
        },
        {
          key: 'all-equipment',
          icon: faTruck,
          i18nKey: 'sidebar.allEquipment',
          path: '/equipment/all'
        },
        {
          key: 'equipment-add',
          icon: faPlus,
          i18nKey: 'sidebar.addEquipment',
          path: '/equipment/add'
        },
        {
          key: 'users-all',
          icon: faUsers,
          i18nKey: 'sidebar.allUsers',
          path: '/users/all'
        },
        {
          key: 'users-analytics',
          icon: faUsers,
          i18nKey: 'sidebar.userAnalytics',
          path: '/users/analytics'
        },
        {
          key: 'users-documents',
          icon: faIdCard,
          i18nKey: 'sidebar.documentVerification',
          path: '/users/documents'
        },
        {
          key: 'region-management',
          icon: faMapMarkerAlt,
          i18nKey: 'sidebar.regionManagement',
          path: '/users/regions'
        }
      ]
    },
    {
      key: 'engagement',
      i18nKey: 'sidebar.marketingEngagement',
      icon: faBullhorn,
      items: [
        {
          key: 'campaign-creator',
          icon: faBullhorn,
          i18nKey: 'sidebar.campaignCreator',
          path: '/engagement/campaigns-create'
        },
        {
          key: 'campaign-analytics',
          icon: faChartLine,
          i18nKey: 'sidebar.campaignAnalytics',
          path: '/engagement/campaigns-analytics'
        },
        {
          key: 'trigger-rules',
          icon: faCogs,
          i18nKey: 'sidebar.triggerRules',
          path: '/engagement/trigger-rules'
        },
        {
          key: 'user-segments',
          icon: faSegments,
          i18nKey: 'sidebar.userSegments',
          path: '/users/modern'
        },
        {
          key: 'notifications',
          icon: faBell,
          i18nKey: 'sidebar.notificationsCenter',
          path: '/engagement/notifications'
        }
      ]
    },
    {
      key: 'content',
      i18nKey: 'sidebar.contentManagement',
      icon: faNewspaper,
      items: [
        {
          key: 'moderation',
          icon: faShieldHalved,
          i18nKey: 'sidebar.mediaModeration',
          path: '/content/moderation'
        },
        {
          key: 'articles',
          icon: faNewspaper,
          i18nKey: 'sidebar.articlesPublishing',
          path: '/content/articles'
        },
        {
          key: 'banners',
          icon: faImage,
          i18nKey: 'sidebar.bannersPromotions',
          path: '/content/banners'
        },
        {
          key: 'brand-colors',
          icon: faFont,
          i18nKey: 'sidebar.brandColors',
          path: '/content/banners'
        },
        {
          key: 'message-templates',
          icon: faEnvelope,
          i18nKey: 'sidebar.messageTemplates',
          path: '/content/message-templates'
        }
      ]
    },
    {
      key: 'finance',
      i18nKey: 'sidebar.financialManagement',
      icon: faDollarSign,
      items: [
        {
          key: 'commission-reports',
          icon: faReceipt,
          i18nKey: 'sidebar.financialReport',
          path: '/finance/reports'
        },
        {
          key: 'payments',
          icon: faCreditCard,
          i18nKey: 'sidebar.paymentManagement',
          path: '/finance/payments'
        },
        {
          key: 'invoices',
          icon: faFileAlt,
          i18nKey: 'sidebar.invoices',
          path: '/finance/invoices'
        },
        {
          key: 'payouts',
          icon: faMoneyBillWave,
          i18nKey: 'sidebar.payouts',
          path: '/finance/payouts'
        }
      ]
    },
    {
      key: 'settings',
      i18nKey: 'sidebar.settings',
      icon: faCog,
      items: [
        {
          key: 'general-settings',
          icon: faCog,
          i18nKey: 'sidebar.generalSettings',
          path: '/settings/general'
        },
        {
          key: 'equipment-config',
          icon: faCogs,
          i18nKey: 'sidebar.equipmentConfig',
          path: '/settings/equipment-config'
        },
        {
          key: 'permissions',
          icon: faUserShield,
          i18nKey: 'sidebar.permissions',
          path: '/settings/admin'
        },
        {
          key: 'user-management',
          icon: faUsers,
          i18nKey: 'sidebar.userManagement',
          path: '/settings/users'
        },
        {
          key: 'roles-permissions',
          icon: faUserShield,
          i18nKey: 'sidebar.rolesPermissions',
          path: '/settings/roles-permissions'
        },
        {
          key: 'audit-log',
          icon: faFileAlt,
          i18nKey: 'sidebar.auditLog',
          path: '/finance/reports'
        }
      ]
    }
  ];

  const authItems: MenuSubItem[] = [
    {
      key: 'forgot-password',
      icon: faKey,
      i18nKey: 'sidebar.resetPassword',
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
          'flex items-center gap-3 rounded-lg transition-colors duration-150',
          isInGroup ? 'px-4 py-2 mb-1' : 'px-3 py-3 mb-1',
          isActive
            ? 'bg-awnash-primary text-black font-semibold shadow-md'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted',
          !isCollapsed && 'text-start',
          isCollapsed ? 'justify-center' : '',
          isInGroup ? 'ms-4' : ''
        )}
        title={isCollapsed ? t(item.i18nKey) : ''}
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
            {t(item.i18nKey)}
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
          'w-full flex items-center gap-3 px-3 py-3 mb-1 rounded-lg transition-colors duration-150 group',
          'text-muted-foreground hover:text-foreground hover:bg-muted font-medium',
          !isCollapsed && 'text-start',
          isCollapsed ? 'justify-center cursor-default' : 'cursor-pointer'
        )}
        disabled={isCollapsed}
        title={isCollapsed ? t(group.i18nKey) : ''}
      >
        <FontAwesomeIcon
          icon={group.icon}
          className={cn('text-sm', isCollapsed ? 'mx-auto' : '')}
        />
        {!isCollapsed && (
          <>
            <span className="font-bold text-sm flex-1">
              {t(group.i18nKey)}
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
        'fixed top-0 h-full z-40 transition-all duration-300 bg-card border-border',
        'start-0 border-e',
        isCollapsed ? 'w-16' : 'w-64',
        isRTL ? 'font-arabic' : 'font-montserrat'
      )}
    >
      {/* Logo Section */}
      <div className={cn(
        'flex items-center justify-between p-[1.45rem] border-b border-border',
        isCollapsed && 'px-3'
      )}>
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-awnash-primary rounded-2xl flex items-center justify-center text-black font-bold text-xl shadow-lg">
              A
            </div>
            <h1 className="text-xl font-bold text-foreground">
              {t('sidebar.brandName')}
            </h1>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg hover:bg-muted text-foreground transition-colors"
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
            <div className="pt-4 border-t border-border mt-6">
              <div className="px-3 py-2 mb-2">
                <span className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider">
                  {t('sidebar.authentication')}
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
