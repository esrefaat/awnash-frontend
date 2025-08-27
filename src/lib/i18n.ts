import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      nav: {
        dashboard: 'Dashboard',
        users: 'Users',
        owners: 'Owners',
        equipment: 'Equipment',
        requests: 'Requests',
        bookings: 'Bookings',
        payments: 'Payments',
        documents: 'Documents',
        settings: 'Settings'
      },
      dashboard: {
        title: 'Dashboard',
        totalRequesters: 'Total Requesters',
        totalOwners: 'Total Owners',
        totalEquipment: 'Total Equipment',
        activeRequests: 'Active Requests',
        totalBookings: 'Total Bookings',
        totalRevenue: 'Total Revenue',
        bookingsTrend: 'Bookings Trend',
        equipmentBreakdown: 'Equipment Breakdown',
        recentBookings: 'Recent Bookings',
        viewAll: 'View All'
      },
      equipment: {
        types: {
          motorGraders: 'Motor Graders',
          miniTrucks: 'Mini Trucks',
          wheelLoaders: 'Wheel Loaders',
          dumpTrucks: 'Dump Trucks',
          excavators: 'Excavators',
          bulldozers: 'Bulldozers',
          mobileCranes: 'Mobile Cranes',
          refrigeratedTrucks: 'Refrigerated Trucks',
          bobcatSkidSteers: 'Bobcat Skid Steers',
          flatbedHaulers: 'Flatbed Haulers',
          drillingRigs: 'Drilling Rigs',
          scaffoldingSystems: 'Scaffolding Systems',
          forklifts: 'Forklifts',
          buses: 'Buses'
        }
      },
      common: {
        add: 'Add',
        edit: 'Edit',
        delete: 'Delete',
        save: 'Save',
        cancel: 'Cancel',
        search: 'Search',
        filter: 'Filter',
        actions: 'Actions',
        status: 'Status',
        date: 'Date',
        name: 'Name',
        email: 'Email',
        phone: 'Phone',
        location: 'Location',
        loading: 'Loading...',
        noData: 'No data available'
      },
      liveRentalsMap: {
        title: 'Live Rentals Map',
        subtitle: 'Monitor and manage active equipment rentals in real-time',
        showFlaggedOnly: 'Show Flagged Only',
        zoomToEndingSoon: 'Zoom to Ending Soon',
        search: {
          city: 'Search by City',
          driver: 'Search by Driver',
          equipment: 'Search by Equipment'
        },
        legend: {
          active: 'Active',
          endingSoon: 'Ending Soon',
          overdue: 'Overdue'
        },
        controls: {
          dragToPan: 'Drag to pan',
          scrollToZoom: 'Scroll to zoom',
          clickMarkers: 'Click markers for details'
        },
        commandCenter: {
          title: 'Command Center',
          assignedDriver: 'ASSIGNED DRIVER',
          rentalDetails: 'RENTAL DETAILS',
          commandActions: 'COMMAND ACTIONS',
          booking: 'Booking',
          flagged: 'Flagged',
          actions: {
            remindDriver: 'Remind Driver',
            remindOwner: 'Remind Owner',
            flagBooking: 'Flag Booking',
            markCompleted: 'Mark as Completed',
            extendRental: 'Extend Rental'
          },
          dialogs: {
            flagBooking: {
              title: 'Flag Booking',
              reason: 'Reason',
              selectReason: 'Select reason...',
              reasons: {
                driverIssue: 'Driver Issue',
                equipmentIssue: 'Equipment Issue',
                lateArrival: 'Late Arrival',
                other: 'Other'
              },
              internalNote: 'Internal Note',
              addNote: 'Add internal note...',
              flagButton: 'Flag Booking'
            },
            markCompleted: {
              title: 'Mark Rental as Completed',
              description: 'This will confirm that the equipment and driver have left the site and record the completion timestamp.',
              cancel: 'Cancel',
              confirm: 'Mark Completed'
            },
            extendRental: {
              title: 'Extend Rental',
              additionalDays: 'Additional Days',
              additionalCost: 'Additional cost',
              extendButton: 'Extend by {{days}} day(s)'
            }
          },
          notifications: {
            reminderSent: 'Reminder sent to {{recipient}}',
            bookingFlagged: 'Booking has been flagged',
            rentalCompleted: 'Rental marked as completed',
            rentalExtended: 'Rental extended by {{days}} day(s)'
          }
        },
        status: {
          active: 'Active',
          'ending-soon': 'Ending Soon',
          endingSoon: 'Ending Soon',
          overdue: 'Overdue'
        }
      }
    }
  },
  ar: {
    translation: {
      nav: {
        dashboard: 'لوحة التحكم',
        users: 'المستخدمون',
        owners: 'الملاك',
        equipment: 'المعدات',
        requests: 'الطلبات',
        bookings: 'الحجوزات',
        payments: 'المدفوعات',
        documents: 'الوثائق',
        settings: 'الإعدادات'
      },
      dashboard: {
        title: 'لوحة التحكم',
        totalRequesters: 'إجمالي الطالبين',
        totalOwners: 'إجمالي الملاك',
        totalEquipment: 'إجمالي المعدات',
        activeRequests: 'الطلبات النشطة',
        totalBookings: 'إجمالي الحجوزات',
        totalRevenue: 'إجمالي الإيرادات',
        bookingsTrend: 'اتجاه الحجوزات',
        equipmentBreakdown: 'تفصيل المعدات',
        recentBookings: 'الحجوزات الأخيرة',
        viewAll: 'عرض الكل'
      },
      equipment: {
        types: {
          motorGraders: 'آلات التسوية',
          miniTrucks: 'الشاحنات الصغيرة',
          wheelLoaders: 'محملات العجلات',
          dumpTrucks: 'شاحنات القلابة',
          excavators: 'الحفارات',
          bulldozers: 'الجرافات',
          mobileCranes: 'الرافعات المتحركة',
          refrigeratedTrucks: 'الشاحنات المبردة',
          bobcatSkidSteers: 'محملات بوبكات',
          flatbedHaulers: 'شاحنات النقل المسطحة',
          drillingRigs: 'منصات الحفر',
          scaffoldingSystems: 'أنظمة السقالات',
          forklifts: 'الرافعات الشوكية',
          buses: 'الحافلات'
        }
      },
      common: {
        add: 'إضافة',
        edit: 'تعديل',
        delete: 'حذف',
        save: 'حفظ',
        cancel: 'إلغاء',
        search: 'بحث',
        filter: 'تصفية',
        actions: 'الإجراءات',
        status: 'الحالة',
        date: 'التاريخ',
        name: 'الاسم',
        email: 'البريد الإلكتروني',
        phone: 'رقم الهاتف',
        location: 'الموقع',
        loading: 'جاري التحميل...',
        noData: 'لا توجد بيانات متاحة'
      },
      liveRentalsMap: {
        title: 'خريطة الإيجارات المباشرة',
        subtitle: 'مراقبة وإدارة إيجارات المعدات النشطة في الوقت الفعلي',
        showFlaggedOnly: 'إظهار المُعلمة فقط',
        zoomToEndingSoon: 'تكبير المنتهية قريباً',
        search: {
          city: 'البحث بالمدينة',
          driver: 'البحث بالسائق',
          equipment: 'البحث بالمعدة'
        },
        legend: {
          active: 'نشط',
          endingSoon: 'ينتهي قريباً',
          overdue: 'متأخر'
        },
        controls: {
          dragToPan: 'اسحب للتنقل',
          scrollToZoom: 'مرر للتكبير',
          clickMarkers: 'اضغط على العلامات للتفاصيل'
        },
        commandCenter: {
          title: 'مركز القيادة',
          assignedDriver: 'السائق المُكلف',
          rentalDetails: 'تفاصيل الإيجار',
          commandActions: 'إجراءات القيادة',
          booking: 'الحجز',
          flagged: 'مُعلم',
          actions: {
            remindDriver: 'تذكير السائق',
            remindOwner: 'تذكير المالك',
            flagBooking: 'تعليم الحجز',
            markCompleted: 'تعليم كمكتمل',
            extendRental: 'تمديد الإيجار'
          },
          dialogs: {
            flagBooking: {
              title: 'تعليم الحجز',
              reason: 'السبب',
              selectReason: 'اختر السبب...',
              reasons: {
                driverIssue: 'مشكلة في السائق',
                equipmentIssue: 'مشكلة في المعدة',
                lateArrival: 'وصول متأخر',
                other: 'أخرى'
              },
              internalNote: 'ملاحظة داخلية',
              addNote: 'أضف ملاحظة داخلية...',
              flagButton: 'تعليم الحجز'
            },
            markCompleted: {
              title: 'تعليم الإيجار كمكتمل',
              description: 'سيؤكد هذا أن المعدة والسائق غادرا الموقع وسيسجل الوقت المكتمل.',
              cancel: 'إلغاء',
              confirm: 'تعليم كمكتمل'
            },
            extendRental: {
              title: 'تمديد الإيجار',
              additionalDays: 'أيام إضافية',
              additionalCost: 'التكلفة الإضافية',
              extendButton: 'تمديد بـ {{days}} يوم/أيام'
            }
          },
          notifications: {
            reminderSent: 'تم إرسال التذكير إلى {{recipient}}',
            bookingFlagged: 'تم تعليم الحجز',
            rentalCompleted: 'تم تعليم الإيجار كمكتمل',
            rentalExtended: 'تم تمديد الإيجار بـ {{days}} يوم/أيام'
          }
        },
        status: {
          active: 'نشط',
          'ending-soon': 'ينتهي قريباً',
          endingSoon: 'ينتهي قريباً',
          overdue: 'متأخر'
        }
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    }
  });

export default i18n; 