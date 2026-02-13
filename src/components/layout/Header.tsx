'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppTranslation, SUPPORTED_LANGUAGES } from '@/hooks/useAppTranslation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBell,
  faGlobe,
  faSignOutAlt,
  faUserCircle,
  faCog,
  faTachometerAlt,
  faUsers,
  faBuilding,
  faTruck,
  faClipboardList,
  faCalendarCheck,
  faCalendarAlt,
  faFileAlt,
  faCreditCard,
  faChartLine,
  faUserShield,
  faLanguage,
  faMapMarkerAlt,
  faGavel,
  faEnvelope,
  faBullhorn,
  faCogs
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '@/contexts/AuthContext';
import ThemeToggle from '@/components/ui/ThemeToggle';
import type { User } from '@/types';

const Header: React.FC = () => {
  const { t, isRTL, language, changeLanguage } = useAppTranslation();
  const { user: userRaw, logout } = useAuth();
  const user = userRaw as User | null;
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    {
      key: 'dashboard',
      icon: faTachometerAlt,
      label: t('nav.dashboard'),
      path: '/dashboard'
    },
    {
      key: 'users',
      icon: faUsers,
      label: t('nav.users'),
      path: '/users'
    },
    {
      key: 'owners',
      icon: faBuilding,
      label: t('nav.owners'),
      path: '/owners'
    },
    {
      key: 'equipment',
      icon: faTruck,
      label: t('nav.equipment'),
      path: '/equipment'
    },
    {
      key: 'requests',
      icon: faClipboardList,
      label: t('nav.requests'),
      path: '/requests'
    },
    {
      key: 'bookings',
      icon: faCalendarCheck,
      label: t('nav.bookings'),
      path: '/bookings'
    },
    {
      key: 'payments',
      icon: faCreditCard,
      label: t('nav.payments'),
      path: '/payments'
    },
    {
      key: 'reports',
      icon: faChartLine,
      label: t('nav.financialReports'),
      path: '/reports/commission'
    },
    {
      key: 'documents',
      icon: faFileAlt,
      label: t('nav.documents'),
      path: '/documents'
    },
    {
      key: 'settings',
      icon: faCog,
      label: t('nav.settings'),
      path: '/settings'
    },
    {
      key: 'admin-settings',
      icon: faUserShield,
      label: t('nav.adminSettings'),
      path: '/settings/admin'
    },
    {
      key: 'content-manager',
      icon: faLanguage,
      label: t('nav.contentManager'),
      path: '/content-manager'
    },
    {
      key: 'region-management',
      icon: faMapMarkerAlt,
      label: t('nav.regionManagement'),
      path: '/region-management'
    },
    {
      key: 'disputes',
      icon: faGavel,
      label: t('nav.disputes'),
      path: '/disputes'
    },
    {
      key: 'notifications',
      icon: faBell,
      label: t('nav.notifications'),
      path: '/notifications'
    },
    {
      key: 'message-templates',
      icon: faEnvelope,
      label: t('nav.messageTemplates'),
      path: '/message-templates'
    },
    {
      key: 'campaign-creator',
      icon: faBullhorn,
      label: t('nav.campaignCreator'),
      path: '/campaign-creator'
    },
    {
      key: 'operational-calendar',
      icon: faCalendarAlt,
      label: t('nav.operationalCalendar'),
      path: '/operational-calendar'
    },
    {
      key: 'trigger-rules',
      icon: faCogs,
      label: t('nav.triggerRules'),
      path: '/trigger-rules'
    }
  ];

  const getPageTitle = () => {
    const currentPath = pathname;

    // Define page titles based on pathname
    const pageTitles: { [key: string]: { en: string; ar: string } } = {
      '/overview/main-dashboard': { en: 'Main Dashboard', ar: 'لوحة التحكم الرئيسية' },
      '/overview/modern-dashboard': { en: 'Modern Dashboard', ar: 'لوحة التحكم الحديثة' },
      '/overview/user-dashboard': { en: 'User Dashboard', ar: 'لوحة تحكم المستخدم' },
      '/rentals/bookings': { en: 'All Bookings', ar: 'جميع الحجوزات' },
      '/rentals/requests': { en: 'Quote Requests', ar: 'طلبات الأسعار' },
      '/rentals/live-map': { en: 'Live Rental Map', ar: 'خريطة التأجير الحية' },
      '/rentals/calendar': { en: 'Booking Calendar', ar: 'تقويم الحجوزات' },
      '/rentals/disputes': { en: 'Dispute Resolution', ar: 'حل النزاعات' },
      '/equipment/list': { en: 'Equipment List', ar: 'قائمة المعدات' },
      '/equipment/all': { en: 'All Equipment', ar: 'جميع المعدات' },
      '/equipment/add': { en: 'Add Equipment', ar: 'إضافة معدة' },
      '/users/all': { en: 'All Users', ar: 'جميع المستخدمين' },
      '/users/analytics': { en: 'User Analytics', ar: 'تحليلات المستخدمين' },
      '/users/documents': { en: 'Document Verification', ar: 'التحقق من المستندات' },
      '/users/regions': { en: 'Region Management', ar: 'إدارة المناطق' },
      '/settings/general': { en: 'General Settings', ar: 'الإعدادات العامة' },
      '/settings/admin': { en: 'Admin Settings', ar: 'إعدادات المشرف' },
      '/finance/reports': { en: 'Financial Reports', ar: 'التقارير المالية' },
      '/finance/payments': { en: 'Payment Management', ar: 'إدارة المدفوعات' },
      '/finance/invoices': { en: 'Invoices', ar: 'الفواتير' },
      '/content/articles': { en: 'Articles', ar: 'المقالات' },
      '/content/banners': { en: 'Banners & Promotions', ar: 'اللافتات والعروض' },
      '/content/message-templates': { en: 'Message Templates', ar: 'قوالب الرسائل' },
      '/engagement/campaigns-create': { en: 'Create Campaign', ar: 'إنشاء حملة' },
      '/engagement/campaigns-analytics': { en: 'Campaign Analytics', ar: 'تحليلات الحملات' },
      '/engagement/trigger-rules': { en: 'Trigger Rules', ar: 'قواعد التشغيل' },
      '/engagement/notifications': { en: 'Notifications Center', ar: 'مركز الإشعارات' }
    };

    const pageTitle = pageTitles[currentPath || ''];
    if (pageTitle) {
      return isRTL ? pageTitle.ar : pageTitle.en;
    }

    // Fallback to Dashboard
    return isRTL ? 'لوحة التحكم' : 'Dashboard';
  };

  const cycleLanguage = () => {
    const codes = SUPPORTED_LANGUAGES.map(l => l.code);
    const currentIndex = codes.indexOf(language);
    const nextIndex = (currentIndex + 1) % codes.length;
    changeLanguage(codes[nextIndex]);
  };

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (!user) return isRTL ? 'مستخدم غير معروف' : 'Unknown User';

    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }

    return user.email?.split('@')[0] || (isRTL ? 'مستخدم' : 'User');
  };

  // Get user role display
  const getUserRoleDisplay = () => {
    if (!user) return '';

    const roleMap = {
      admin: { en: 'System Admin', ar: 'مدير النظام' },
      owner: { en: 'Equipment Owner', ar: 'مالك معدات' },
      renter: { en: 'Equipment Renter', ar: 'مستأجر معدات' }
    };

    const validRoles = ['admin', 'owner', 'renter'];
    if (validRoles.includes(user.role)) {
      const role = roleMap[user.role as 'admin' | 'owner' | 'renter'];
      return role ? (isRTL ? role.ar : role.en) : user.role;
    }
    return user.role;
  };

  // Get display label for current language
  const getCurrentLanguageLabel = () => {
    const current = SUPPORTED_LANGUAGES.find(l => l.code === language);
    return current?.name || language;
  };

  return (
    <header
      className="sticky top-0 z-30 border-b border-border bg-card px-6 py-4"
      style={{
        fontFamily: isRTL ? 'var(--awnash-font-arabic)' : 'var(--awnash-font-english)'
      }}
    >
      <div className="flex items-center justify-between">
        {/* Page Title */}
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {getPageTitle()}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isRTL ? 'إدارة منصة أوناش للمعدات الثقيلة' : 'Heavy Equipment Rental Platform Management'}
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="p-2 rounded-lg border border-border hover:bg-muted transition-colors flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faGlobe} className="text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                {getCurrentLanguageLabel()}
              </span>
            </button>

            {isLangMenuOpen && (
              <div
                className="absolute top-full mt-2 end-0 w-40 rounded-lg shadow-lg border border-border bg-card py-2 z-50"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      changeLanguage(lang.code);
                      setIsLangMenuOpen(false);
                    }}
                    className={`w-full text-start px-4 py-2 text-sm transition-colors ${
                      language === lang.code
                        ? 'text-foreground bg-muted font-semibold'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications */}
          <button className="p-2 rounded-lg hover:bg-muted transition-colors relative">
            <FontAwesomeIcon icon={faBell} className="text-muted-foreground text-lg" />
            <span
              className="absolute -top-1 -end-1 w-5 h-5 rounded-full text-xs font-bold text-black flex items-center justify-center"
              style={{ backgroundColor: 'var(--awnash-primary)' }}
            >
              3
            </span>
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <div>
                <p className="text-sm font-semibold text-foreground text-end">
                  {getUserDisplayName()}
                </p>
                <p className="text-xs text-muted-foreground text-end">
                  {getUserRoleDisplay()}
                </p>
              </div>
              <FontAwesomeIcon icon={faUserCircle} className="text-2xl text-muted-foreground" />
            </button>

            {/* User Dropdown Menu */}
            {isUserMenuOpen && (
              <div
                className="absolute top-full mt-2 end-0 w-48 rounded-lg shadow-lg border border-border bg-card py-2 z-50"
                style={{
                  fontFamily: isRTL ? 'var(--awnash-font-arabic)' : 'var(--awnash-font-english)'
                }}
              >
                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground hover:bg-muted"
                >
                  <FontAwesomeIcon icon={faUserCircle} />
                  <span>{isRTL ? 'الملف الشخصي' : 'Profile'}</span>
                </Link>
                <Link
                  href="/settings/general"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground hover:bg-muted"
                >
                  <FontAwesomeIcon icon={faCog} />
                  <span>{isRTL ? 'الإعدادات' : 'Settings'}</span>
                </Link>
                <hr className="my-2 border-border" />
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-900/30 w-full text-start"
                >
                  <FontAwesomeIcon icon={faSignOutAlt} />
                  <span>{isRTL ? 'تسجيل الخروج' : 'Logout'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
