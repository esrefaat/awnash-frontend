import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language } from '../types';

interface LanguageContextType {
  currentLanguage: Language;
  changeLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', direction: 'ltr' },
  { code: 'ar', name: 'العربية', direction: 'rtl' }
];

const translations = {
  en: {
    'dashboard': 'Dashboard',
    'users': 'Users',
    'equipment': 'Equipment',
    'settings': 'Settings',
    'bookings': 'Bookings',
    'audit_logs': 'Audit Logs',
    'user_management': 'User Management',
    'equipment_moderation': 'Equipment Moderation',
    'revenue': 'Revenue',
    'total_users': 'Total Users',
    'total_equipment': 'Total Equipment',
    'total_bookings': 'Total Bookings',
    'pending_moderation': 'Pending Moderation',
    'search': 'Search',
    'filter': 'Filter',
    'export': 'Export',
    'add_new': 'Add New',
    'edit': 'Edit',
    'delete': 'Delete',
    'approve': 'Approve',
    'reject': 'Reject',
    'view_details': 'View Details',
    'status': 'Status',
    'active': 'Active',
    'inactive': 'Inactive',
    'pending': 'Pending',
    'approved': 'Approved',
    'rejected': 'Rejected',
    'owner': 'Owner',
    'renter': 'Renter',
    'admin': 'Admin',
    'first_name': 'First Name',
    'last_name': 'Last Name',
    'email': 'Email',
    'role': 'Role',
    'created_at': 'Created At',
    'last_login': 'Last Login',
    'language': 'Language',
    'logout': 'Logout',
    'profile': 'Profile',
    'notifications': 'Notifications',
    'welcome_admin': 'Welcome, Admin',
    'awnash_admin': 'Awnash Admin Dashboard',
    'add_new_user': 'Add New User',
    'enter_first_name': 'Enter first name',
    'enter_last_name': 'Enter last name',
    'enter_email': 'Enter email address',
    'cancel': 'Cancel',
    'create_user': 'Create User',
    'creating': 'Creating...',
    'add_equipment': 'Add Equipment',
    'search_equipment': 'Search equipment...',
    'search_bookings': 'Search bookings...',
    'photography': 'Photography',
    'videography': 'Videography',
    'audio': 'Audio',
    'lighting': 'Lighting',
    'confirmed': 'Confirmed',
    'completed': 'Completed',
    'cancelled': 'Cancelled',
    'paid': 'Paid',
    'refunded': 'Refunded',
    'failed': 'Failed',
    'payment_status': 'Payment Status',
    'text_resources_management': 'Text & Resources Management',
    'transaction_user_reports': 'Transaction & User Reports',
    'request_management': 'Request Management',
    'region_management': 'Region Management',
    'equipment_management': 'Equipment Management',
    'permissions_management': 'Permissions Management',
    'reviews_ratings_management': 'Reviews & Ratings Management',
    'system_settings': 'System Settings',
    'activity_log': 'Activity Log',
    'sign_out': 'Sign Out',
    'reports': 'Reports',
    'campaign_management': 'Campaign Management',
    'campaign_analytics': 'Campaign Analytics',
    'operational_calendar': 'Operational Calendar'
  },
  ar: {
    'dashboard': 'لوحة التحكم',
    'users': 'المستخدمون',
    'equipment': 'المعدات',
    'settings': 'الإعدادات',
    'bookings': 'الحجوزات',
    'audit_logs': 'سجلات التدقيق',
    'user_management': 'إدارة المستخدمين',
    'equipment_moderation': 'مراجعة المعدات',
    'revenue': 'الإيرادات',
    'total_users': 'إجمالي المستخدمين',
    'total_equipment': 'إجمالي المعدات',
    'total_bookings': 'إجمالي الحجوزات',
    'pending_moderation': 'في انتظار المراجعة',
    'search': 'بحث',
    'filter': 'تصفية',
    'export': 'تصدير',
    'add_new': 'إضافة جديد',
    'edit': 'تعديل',
    'delete': 'حذف',
    'approve': 'موافقة',
    'reject': 'رفض',
    'view_details': 'عرض التفاصيل',
    'status': 'الحالة',
    'active': 'نشط',
    'inactive': 'غير نشط',
    'pending': 'في الانتظار',
    'approved': 'مقبول',
    'rejected': 'مرفوض',
    'owner': 'مالك',
    'renter': 'مستأجر',
    'admin': 'مدير',
    'first_name': 'الاسم الأول',
    'last_name': 'اسم العائلة',
    'email': 'البريد الإلكتروني',
    'role': 'الدور',
    'created_at': 'تاريخ الإنشاء',
    'last_login': 'آخر تسجيل دخول',
    'language': 'اللغة',
    'logout': 'تسجيل الخروج',
    'profile': 'الملف الشخصي',
    'notifications': 'الإشعارات',
    'welcome_admin': 'مرحباً، المدير',
    'awnash_admin': 'لوحة تحكم أونش الإدارية',
    'add_new_user': 'إضافة مستخدم جديد',
    'enter_first_name': 'أدخل الاسم الأول',
    'enter_last_name': 'أدخل اسم العائلة',
    'enter_email': 'أدخل عنوان البريد الإلكتروني',
    'cancel': 'إلغاء',
    'create_user': 'إنشاء مستخدم',
    'creating': 'جاري الإنشاء...',
    'add_equipment': 'إضافة معدات',
    'search_equipment': 'البحث في المعدات...',
    'search_bookings': 'البحث في الحجوزات...',
    'photography': 'التصوير الفوتوغرافي',
    'videography': 'التصوير المرئي',
    'audio': 'الصوت',
    'lighting': 'الإضاءة',
    'confirmed': 'مؤكد',
    'completed': 'مكتمل',
    'cancelled': 'ملغي',
    'paid': 'مدفوع',
    'refunded': 'مسترد',
    'failed': 'فشل',
    'payment_status': 'حالة الدفع',
    'text_resources_management': 'إدارة النصوص والمنابع',
    'transaction_user_reports': 'تقارير العملاء و المستخدمين',
    'request_management': 'إدارة الطلبات',
    'region_management': 'إدارة المناطق',
    'equipment_management': 'إدارة المعدات',
    'permissions_management': 'إدارة الصلاحيات',
    'reviews_ratings_management': 'إدارة المراجعات والتقييمات',
    'system_settings': 'إعدادات النظام',
    'activity_log': 'سجل الأنشطة',
    'sign_out': 'تسجيل الخروج',
    'reports': 'التقارير',
    'campaign_management': 'إدارة الحملات',
    'campaign_analytics': 'تحليلات الحملات',
    'operational_calendar': 'التقويم التشغيلي'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(languages[0]);

  useEffect(() => {
    // Set the HTML direction attribute
    document.documentElement.setAttribute('dir', currentLanguage.direction);
    document.documentElement.setAttribute('lang', currentLanguage.code);
  }, [currentLanguage]);

  const changeLanguage = (language: Language) => {
    setCurrentLanguage(language);
    localStorage.setItem('admin-language', language.code);
  };

  const t = (key: string): string => {
    return translations[currentLanguage.code][key as keyof typeof translations.en] || key;
  };

  useEffect(() => {
    const savedLanguage = localStorage.getItem('admin-language');
    if (savedLanguage) {
      const language = languages.find(lang => lang.code === savedLanguage);
      if (language) {
        setCurrentLanguage(language);
      }
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ currentLanguage, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export { languages }; 