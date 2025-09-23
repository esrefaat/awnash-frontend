export interface EquipmentType {
  value: string;
  label: string;
  arabicLabel: string;
  category?: string;
}

export interface EquipmentSize {
  value: string;
  label: string;
  arabicLabel: string;
}

export interface EquipmentStatus {
  value: string;
  label: string;
  arabicLabel: string;
}

export const EQUIPMENT_TYPES: EquipmentType[] = [
  // Construction Equipment
  { value: 'excavator', label: 'Excavator', arabicLabel: 'حفار', category: 'construction' },
  { value: 'bulldozer', label: 'Bulldozer', arabicLabel: 'بلدوزر', category: 'construction' },
  { value: 'crane', label: 'Crane', arabicLabel: 'رافعة', category: 'construction' },
  { value: 'loader', label: 'Loader', arabicLabel: 'لودر', category: 'construction' },
  { value: 'grader', label: 'Grader', arabicLabel: 'جريدر', category: 'construction' },
  { value: 'roller', label: 'Roller', arabicLabel: 'مدحلة', category: 'construction' },
  { value: 'backhoe', label: 'Backhoe', arabicLabel: 'باكهو', category: 'construction' },
  { value: 'skid_steer', label: 'Skid Steer', arabicLabel: 'سكيد ستير', category: 'construction' },
  
  // Material Handling
  { value: 'forklift', label: 'Forklift', arabicLabel: 'رافعة شوكية', category: 'material_handling' },
  { value: 'pallet_jack', label: 'Pallet Jack', arabicLabel: 'رافعة منصات', category: 'material_handling' },
  { value: 'conveyor', label: 'Conveyor', arabicLabel: 'سير ناقل', category: 'material_handling' },
  { value: 'hoist', label: 'Hoist', arabicLabel: 'رافعة يدوية', category: 'material_handling' },
  
  // Transportation
  { value: 'truck', label: 'Truck', arabicLabel: 'شاحنة', category: 'transportation' },
  { value: 'trailer', label: 'Trailer', arabicLabel: 'مقطورة', category: 'transportation' },
  { value: 'flatbed', label: 'Flatbed Truck', arabicLabel: 'شاحنة مسطحة', category: 'transportation' },
  { value: 'dump_truck', label: 'Dump Truck', arabicLabel: 'شاحنة قلابة', category: 'transportation' },
  { value: 'tanker', label: 'Tanker Truck', arabicLabel: 'شاحنة صهريج', category: 'transportation' },
  
  // Power & Energy
  { value: 'generator', label: 'Generator', arabicLabel: 'مولد كهربائي', category: 'power' },
  { value: 'compressor', label: 'Air Compressor', arabicLabel: 'ضاغط هواء', category: 'power' },
  { value: 'welder', label: 'Welder', arabicLabel: 'معدات لحام', category: 'power' },
  { value: 'pump', label: 'Pump', arabicLabel: 'مضخة', category: 'power' },
  { value: 'transformer', label: 'Transformer', arabicLabel: 'محول كهربائي', category: 'power' },
  
  // Tools & Equipment
  { value: 'drill', label: 'Drill', arabicLabel: 'مثقاب', category: 'tools' },
  { value: 'saw', label: 'Saw', arabicLabel: 'منشار', category: 'tools' },
  { value: 'grinder', label: 'Grinder', arabicLabel: 'مطحنة', category: 'tools' },
  { value: 'jackhammer', label: 'Jackhammer', arabicLabel: 'مطرقة هوائية', category: 'tools' },
  { value: 'scaffolding', label: 'Scaffolding', arabicLabel: 'سقالات', category: 'tools' },
  { value: 'ladder', label: 'Ladder', arabicLabel: 'سلم', category: 'tools' },
  
  // Specialized Equipment
  { value: 'concrete_mixer', label: 'Concrete Mixer', arabicLabel: 'خلاط خرسانة', category: 'specialized' },
  { value: 'asphalt_paver', label: 'Asphalt Paver', arabicLabel: 'فراش أسفلت', category: 'specialized' },
  { value: 'water_truck', label: 'Water Truck', arabicLabel: 'شاحنة مياه', category: 'specialized' },
  { value: 'vacuum_truck', label: 'Vacuum Truck', arabicLabel: 'شاحنة تفريغ', category: 'specialized' },
  { value: 'mobile_crane', label: 'Mobile Crane', arabicLabel: 'رافعة متحركة', category: 'specialized' },
  { value: 'tower_crane', label: 'Tower Crane', arabicLabel: 'رافعة برجية', category: 'specialized' },
  
  // Other
  { value: 'other', label: 'Other', arabicLabel: 'أخرى', category: 'other' }
];

export const EQUIPMENT_SIZES: EquipmentSize[] = [
  { value: 'small', label: 'Small', arabicLabel: 'صغير' },
  { value: 'medium', label: 'Medium', arabicLabel: 'متوسط' },
  { value: 'large', label: 'Large', arabicLabel: 'كبير' },
  { value: 'extra_large', label: 'Extra Large', arabicLabel: 'كبير جداً' },
  { value: 'custom', label: 'Custom', arabicLabel: 'مخصص' }
];

export const EQUIPMENT_STATUSES: EquipmentStatus[] = [
  { value: 'active', label: 'Active', arabicLabel: 'نشط' },
  { value: 'inactive', label: 'Inactive', arabicLabel: 'غير نشط' },
  { value: 'suspended', label: 'Suspended', arabicLabel: 'معلق' },
  { value: 'maintenance', label: 'Maintenance', arabicLabel: 'صيانة' },
  { value: 'booked', label: 'Booked', arabicLabel: 'محجوز' },
  { value: 'out_of_service', label: 'Out of Service', arabicLabel: 'خارج الخدمة' }
];

// Helper function to get equipment type by value
export const getEquipmentTypeByValue = (value: string): EquipmentType | undefined => {
  return EQUIPMENT_TYPES.find(type => type.value === value);
};

// Helper function to get equipment type label based on language
export const getEquipmentTypeLabel = (value: string, isRTL: boolean = false): string => {
  const type = getEquipmentTypeByValue(value);
  if (!type) return value;
  return isRTL ? type.arabicLabel : type.label;
};

// Helper function to get equipment types for dropdown
export const getEquipmentTypesForDropdown = (isRTL: boolean = false) => {
  return EQUIPMENT_TYPES.map(type => ({
    value: type.value,
    label: isRTL ? type.arabicLabel : type.label
  }));
};

// Helper function to get equipment types grouped by category
export const getEquipmentTypesByCategory = (isRTL: boolean = false) => {
  const categories: { [key: string]: Array<{ value: string; label: string }> } = {};
  
  EQUIPMENT_TYPES.forEach(type => {
    const category = type.category || 'other';
    const categoryLabel = isRTL ? getCategoryArabicLabel(category) : getCategoryEnglishLabel(category);
    
    if (!categories[categoryLabel]) {
      categories[categoryLabel] = [];
    }
    
    categories[categoryLabel].push({
      value: type.value,
      label: isRTL ? type.arabicLabel : type.label
    });
  });
  
  return categories;
};

// Helper function to get equipment sizes for dropdown
export const getEquipmentSizesForDropdown = (isRTL: boolean = false) => {
  return EQUIPMENT_SIZES.map(size => ({
    value: size.value,
    label: isRTL ? size.arabicLabel : size.label
  }));
};

// Helper function to get equipment statuses for dropdown
export const getEquipmentStatusesForDropdown = (isRTL: boolean = false) => {
  return EQUIPMENT_STATUSES.map(status => ({
    value: status.value,
    label: isRTL ? status.arabicLabel : status.label
  }));
};

// Helper function to get equipment size label
export const getEquipmentSizeLabel = (value: string, isRTL: boolean = false): string => {
  const size = EQUIPMENT_SIZES.find(s => s.value === value);
  if (!size) return value;
  return isRTL ? size.arabicLabel : size.label;
};

// Helper function to get equipment status label
export const getEquipmentStatusLabel = (value: string, isRTL: boolean = false): string => {
  const status = EQUIPMENT_STATUSES.find(s => s.value === value);
  if (!status) return value;
  return isRTL ? status.arabicLabel : status.label;
};

// Category label helpers
const getCategoryEnglishLabel = (category: string): string => {
  const labels: { [key: string]: string } = {
    construction: 'Construction Equipment',
    material_handling: 'Material Handling',
    transportation: 'Transportation',
    power: 'Power & Energy',
    tools: 'Tools & Equipment',
    specialized: 'Specialized Equipment',
    other: 'Other'
  };
  return labels[category] || 'Other';
};

const getCategoryArabicLabel = (category: string): string => {
  const labels: { [key: string]: string } = {
    construction: 'معدات البناء',
    material_handling: 'مناولة المواد',
    transportation: 'النقل',
    power: 'الطاقة والكهرباء',
    tools: 'الأدوات والمعدات',
    specialized: 'معدات متخصصة',
    other: 'أخرى'
  };
  return labels[category] || 'أخرى';
};



