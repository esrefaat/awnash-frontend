export interface City {
  value: string;
  label: string;
  arabicLabel: string;
}

export const SAUDI_CITIES: City[] = [
  // Major Cities
  { value: 'riyadh', label: 'Riyadh', arabicLabel: 'الرياض' },
  { value: 'jeddah', label: 'Jeddah', arabicLabel: 'جدة' },
  { value: 'makkah', label: 'Makkah', arabicLabel: 'مكة المكرمة' },
  { value: 'madinah', label: 'Madinah', arabicLabel: 'المدينة المنورة' },
  { value: 'dammam', label: 'Dammam', arabicLabel: 'الدمام' },
  { value: 'khobar', label: 'Al Khobar', arabicLabel: 'الخبر' },
  { value: 'dhahran', label: 'Dhahran', arabicLabel: 'الظهران' },
  { value: 'taif', label: 'Taif', arabicLabel: 'الطائف' },
  { value: 'tabuk', label: 'Tabuk', arabicLabel: 'تبوك' },
  { value: 'abha', label: 'Abha', arabicLabel: 'أبها' },
  { value: 'khamis_mushait', label: 'Khamis Mushait', arabicLabel: 'خميس مشيط' },
  { value: 'jizan', label: 'Jizan', arabicLabel: 'جازان' },
  { value: 'hail', label: 'Hail', arabicLabel: 'حائل' },
  { value: 'qassim', label: 'Qassim', arabicLabel: 'القصيم' },
  { value: 'buraidah', label: 'Buraidah', arabicLabel: 'بريدة' },
  { value: 'unaizah', label: 'Unaizah', arabicLabel: 'عنيزة' },
  { value: 'arar', label: 'Arar', arabicLabel: 'عرعر' },
  { value: 'sakaka', label: 'Sakaka', arabicLabel: 'سكاكا' },
  { value: 'jubail', label: 'Jubail', arabicLabel: 'الجبيل' },
  { value: 'yanbu', label: 'Yanbu', arabicLabel: 'ينبع' },
  { value: 'rabigh', label: 'Rabigh', arabicLabel: 'رابغ' },
  { value: 'jazan', label: 'Jazan', arabicLabel: 'جازان' },
  { value: 'najran', label: 'Najran', arabicLabel: 'نجران' },
  { value: 'al_ahsa', label: 'Al Ahsa', arabicLabel: 'الأحساء' },
  { value: 'hafr_al_batin', label: 'Hafr Al Batin', arabicLabel: 'حفر الباطن' },
  { value: 'al_kharj', label: 'Al Kharj', arabicLabel: 'الخرج' },
  { value: 'al_majmaah', label: 'Al Majmaah', arabicLabel: 'المجمعة' },
  { value: 'al_zulfi', label: 'Al Zulfi', arabicLabel: 'الزلفي' },
  { value: 'sharurah', label: 'Sharurah', arabicLabel: 'شرورة' },
  { value: 'al_bahah', label: 'Al Bahah', arabicLabel: 'الباحة' },
  { value: 'al_qunfudhah', label: 'Al Qunfudhah', arabicLabel: 'القنفذة' },
  { value: 'al_lith', label: 'Al Lith', arabicLabel: 'الليث' },
  { value: 'al_qurayyat', label: 'Al Qurayyat', arabicLabel: 'القريات' },
  { value: 'al_ula', label: 'Al Ula', arabicLabel: 'العلا' },
  { value: 'al_wajh', label: 'Al Wajh', arabicLabel: 'الوجه' },
  { value: 'duba', label: 'Duba', arabicLabel: 'دبا' },
  { value: 'haql', label: 'Haql', arabicLabel: 'حقل' },
  { value: 'al_bad', label: 'Al Bad', arabicLabel: 'الباد' },
  { value: 'al_juwf', label: 'Al Juwf', arabicLabel: 'الجوف' },
  { value: 'al_rafha', label: 'Al Rafha', arabicLabel: 'الرفحاء' },
  { value: 'al_rumah', label: 'Al Rumah', arabicLabel: 'الرومة' },
  { value: 'al_shaaf', label: 'Al Shaaf', arabicLabel: 'الشعاف' },
  { value: 'al_sulayyil', label: 'Al Sulayyil', arabicLabel: 'السليل' },
  { value: 'al_thadiq', label: 'Al Thadiq', arabicLabel: 'الثادق' },
  { value: 'al_thumamah', label: 'Al Thumamah', arabicLabel: 'الثمامة' },
  { value: 'al_uzlah', label: 'Al Uzlah', arabicLabel: 'العزلة' },
  { value: 'al_washm', label: 'Al Washm', arabicLabel: 'الوشم' },
  { value: 'ash_sharqiyah', label: 'Ash Sharqiyah', arabicLabel: 'الشرقية' },
  { value: 'asir', label: 'Asir', arabicLabel: 'عسير' },
  { value: 'bahah', label: 'Bahah', arabicLabel: 'الباحة' },
  { value: 'eastern_province', label: 'Eastern Province', arabicLabel: 'المنطقة الشرقية' },
  { value: 'hail_region', label: 'Hail Region', arabicLabel: 'منطقة حائل' },
  { value: 'jazan_region', label: 'Jazan Region', arabicLabel: 'منطقة جازان' },
  { value: 'makkah_region', label: 'Makkah Region', arabicLabel: 'منطقة مكة المكرمة' },
  { value: 'madinah_region', label: 'Madinah Region', arabicLabel: 'منطقة المدينة المنورة' },
  { value: 'najran_region', label: 'Najran Region', arabicLabel: 'منطقة نجران' },
  { value: 'northern_borders', label: 'Northern Borders', arabicLabel: 'الحدود الشمالية' },
  { value: 'qassim_region', label: 'Qassim Region', arabicLabel: 'منطقة القصيم' },
  { value: 'riyadh_region', label: 'Riyadh Region', arabicLabel: 'منطقة الرياض' },
  { value: 'tabuk_region', label: 'Tabuk Region', arabicLabel: 'منطقة تبوك' }
];

// Helper function to get city by value
export const getCityByValue = (value: string): City | undefined => {
  return SAUDI_CITIES.find(city => city.value === value);
};

// Helper function to get city label based on language
export const getCityLabel = (value: string, isRTL: boolean = false): string => {
  const city = getCityByValue(value);
  if (!city) return value;
  return isRTL ? city.arabicLabel : city.label;
};

// Helper function to get all cities for dropdown
export const getCitiesForDropdown = (isRTL: boolean = false) => {
  return SAUDI_CITIES.map(city => ({
    value: city.value,
    label: isRTL ? city.arabicLabel : city.label
  }));
};

// Validation function to check for duplicates (for development)
export const validateCities = (): { hasDuplicates: boolean; duplicates: string[] } => {
  const values = SAUDI_CITIES.map(city => city.value);
  const duplicates = values.filter((value, index) => values.indexOf(value) !== index);
  return {
    hasDuplicates: duplicates.length > 0,
    duplicates: [...new Set(duplicates)]
  };
};

// Validate cities on import (development only)
if (process.env.NODE_ENV === 'development') {
  const validation = validateCities();
  if (validation.hasDuplicates) {
    console.warn('Duplicate cities found:', validation.duplicates);
  }
}
