'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Search, Settings, 
  MapPin, Navigation, X, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { equipmentTypeService, EquipmentType, CreateEquipmentTypeData, UpdateEquipmentTypeData } from '@/services/equipmentTypeService';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Toggle } from '@/components/ui/Toggle';

// Types - using the imported EquipmentType from service
interface EquipmentTypeAttribute {
  id: string;
  label: string;
  unit?: string;
  is_required: boolean;
  options: string[];
  optionsInput: string; // Comma-separated input field
}

interface EquipmentTypeFormData {
  name_en: string;
  name_ar: string;
  name_ur: string;
  category: string;
  location_mode: 'single' | 'from_to' | 'none';
  attributes: EquipmentTypeAttribute[];
}

interface FormErrors {
  name_en?: string;
  name_ar?: string;
  category?: string;
  attributes?: { [key: number]: { label?: string } };
  submit?: string;
}

// Skeleton loader component
const TableRowSkeleton: React.FC = () => (
  <tr className="animate-pulse">
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="space-y-2">
        <div className="h-4 bg-gray-600 rounded w-32"></div>
        <div className="h-3 bg-gray-700 rounded w-24"></div>
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="h-6 bg-gray-600 rounded-full w-20"></div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 bg-gray-600 rounded"></div>
        <div className="h-4 bg-gray-600 rounded w-24"></div>
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="h-4 bg-gray-600 rounded w-20"></div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="h-4 bg-gray-600 rounded w-24"></div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 bg-gray-600 rounded"></div>
        <div className="h-8 w-8 bg-gray-600 rounded"></div>
      </div>
    </td>
  </tr>
);

// Inline error message component
const FieldError: React.FC<{ message?: string }> = ({ message }) => {
  if (!message) return null;
  return (
    <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
      <AlertCircle className="h-3 w-3" />
      {message}
    </p>
  );
};

// Form-level error banner
const ErrorBanner: React.FC<{ message?: string; onDismiss: () => void }> = ({ message, onDismiss }) => {
  if (!message) return null;
  return (
    <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg flex items-start gap-3">
      <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm text-red-300">{message}</p>
      </div>
      <button onClick={onDismiss} className="text-red-400 hover:text-red-300">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

const EquipmentTypesPage: React.FC = () => {
  const isRTL = false; // TODO: Implement proper RTL detection

  // State
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingType, setEditingType] = useState<EquipmentType | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  
  // Form state
  const [form, setForm] = useState<EquipmentTypeFormData>({
    name_en: '',
    name_ar: '',
    name_ur: '',
    category: '',
    location_mode: 'single',
    attributes: []
  });

  // Validation errors state
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Default categories
  const defaultCategories = [
    'Construction', 'Transport', 'Material Handling', 'Power', 'Other'
  ];

  // Location modes
  const locationModes = [
    { value: 'single', label: 'Single Location', icon: MapPin },
    { value: 'from_to', label: 'From/To (Transport)', icon: Navigation },
    { value: 'none', label: 'None', icon: X }
  ];

  // Validation rules
  const validateField = (field: string, value: string): string | undefined => {
    switch (field) {
      case 'name_en':
        if (!value.trim()) return 'English name is required';
        if (value.length < 2) return 'English name must be at least 2 characters';
        if (value.length > 200) return 'English name must be less than 200 characters';
        return undefined;
      case 'name_ar':
        if (!value.trim()) return 'Arabic name is required';
        if (value.length < 2) return 'Arabic name must be at least 2 characters';
        if (value.length > 200) return 'Arabic name must be less than 200 characters';
        return undefined;
      case 'category':
        if (!value.trim()) return 'Category is required';
        return undefined;
      default:
        return undefined;
    }
  };

  const validateAttributeLabel = (label: string): string | undefined => {
    if (!label.trim()) return 'Attribute label is required';
    if (label.length < 1) return 'Label must be at least 1 character';
    if (label.length > 100) return 'Label must be less than 100 characters';
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    newErrors.name_en = validateField('name_en', form.name_en);
    newErrors.name_ar = validateField('name_ar', form.name_ar);
    newErrors.category = validateField('category', form.category);
    
    // Validate attributes
    const attributeErrors: { [key: number]: { label?: string } } = {};
    form.attributes.forEach((attr, index) => {
      const labelError = validateAttributeLabel(attr.label);
      if (labelError) {
        attributeErrors[index] = { label: labelError };
      }
    });
    
    if (Object.keys(attributeErrors).length > 0) {
      newErrors.attributes = attributeErrors;
    }
    
    setErrors(newErrors);
    
    // Return true if no errors
    return !newErrors.name_en && !newErrors.name_ar && !newErrors.category && 
           Object.keys(attributeErrors).length === 0;
  };

  // Handle field blur for inline validation
  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const value = form[field as keyof EquipmentTypeFormData];
    if (typeof value === 'string') {
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [typesResponse, categoriesResponse] = await Promise.all([
        equipmentTypeService.getAll({ limit: 100 }),
        equipmentTypeService.getCategories()
      ]);
      
      setEquipmentTypes(typesResponse.data || []);
      setCategories(Array.isArray(categoriesResponse) ? categoriesResponse : ((categoriesResponse as any)?.data || defaultCategories));
    } catch (error) {
      console.error('Failed to load data:', error);
      setCategories(defaultCategories);
    } finally {
      setLoading(false);
    }
  };

  // Filter types
  const filteredTypes = equipmentTypes.filter(type => {
    const matchesSearch = !searchTerm || 
      type.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      type.nameAr.includes(searchTerm) ||
      (type.nameUr && type.nameUr.includes(searchTerm));
    
    const matchesCategory = !selectedCategory || type.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Form handlers
  const handleInputChange = (field: keyof EquipmentTypeFormData, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const addAttribute = () => {
    const newAttribute: EquipmentTypeAttribute = {
      id: Date.now().toString(),
      label: '',
      unit: '',
      is_required: false,
      options: [],
      optionsInput: '' // Empty comma-separated input
    };
    setForm(prev => ({
      ...prev,
      attributes: [...prev.attributes, newAttribute]
    }));
  };

  const removeAttribute = (index: number) => {
    setForm(prev => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index)
    }));
    // Clear attribute errors
    if (errors.attributes?.[index]) {
      const newAttrErrors = { ...errors.attributes };
      delete newAttrErrors[index];
      setErrors(prev => ({ ...prev, attributes: newAttrErrors }));
    }
  };

  const updateAttribute = (index: number, field: keyof EquipmentTypeAttribute, value: any) => {
    setForm(prev => ({
      ...prev,
      attributes: prev.attributes.map((attr, i) => 
        i === index ? { ...attr, [field]: value } : attr
      )
    }));
    
    // Clear attribute label error when typing
    if (field === 'label' && errors.attributes?.[index]?.label) {
      const newAttrErrors = { ...errors.attributes };
      delete newAttrErrors[index];
      setErrors(prev => ({ 
        ...prev, 
        attributes: Object.keys(newAttrErrors).length > 0 ? newAttrErrors : undefined 
      }));
    }
  };

  // Handle options input change (comma-separated)
  const handleOptionsInputChange = (attributeIndex: number, value: string) => {
    setForm(prev => ({
      ...prev,
      attributes: prev.attributes.map((attr, i) => 
        i === attributeIndex 
          ? { 
              ...attr, 
              optionsInput: value,
              // Parse comma-separated values, filter empty ones
              options: value
                .split(',')
                .map(opt => opt.trim())
                .filter(opt => opt.length > 0)
            }
          : attr
      )
    }));
  };

  // Modal handlers
  const openAddModal = () => {
    setForm({
      name_en: '',
      name_ar: '',
      name_ur: '',
      category: '',
      location_mode: 'single',
      attributes: []
    });
    setErrors({});
    setTouched({});
    setIsEditMode(false);
    setEditingType(null);
    setIsModalOpen(true);
  };

  const openEditModal = (type: EquipmentType) => {
    // Transform API response (camelCase) to form state (snake_case)
    setForm({
      name_en: type.nameEn,
      name_ar: type.nameAr,
      name_ur: type.nameUr || '',
      category: type.category,
      location_mode: type.locationMode,
      attributes: (type.attributes || []).map(attr => {
        // Transform { value: string }[] back to string[]
        const optionsArray = attr.options?.map(opt => 
          typeof opt === 'string' ? opt : opt.value
        ) || [];
        return {
          id: attr.id,
          label: attr.label,
          unit: attr.unit || '',
          is_required: attr.isRequired,
          options: optionsArray,
          optionsInput: optionsArray.join(', ') // Convert to comma-separated string
        };
      })
    });
    setErrors({});
    setTouched({});
    setIsEditMode(true);
    setEditingType(type);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({
      name_en: true,
      name_ar: true,
      category: true
    });
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      setFormLoading(true);
      setErrors(prev => ({ ...prev, submit: undefined }));
      
      // Transform form data from snake_case to camelCase for API
      const apiData: CreateEquipmentTypeData = {
        nameEn: form.name_en,
        nameAr: form.name_ar,
        nameUr: form.name_ur || undefined,
        category: form.category,
        locationMode: form.location_mode,
        attributes: form.attributes
          .filter(attr => attr.label.trim()) // Filter out attributes without labels
          .map(attr => ({
            label: attr.label,
            unit: attr.unit || undefined,
            isRequired: attr.is_required,
            // Transform string[] to { value: string }[] for backend
            // Options already parsed from comma-separated input
            options: attr.options
              .filter(opt => opt.trim() !== '')
              .map(opt => ({ value: opt }))
          }))
      };
      
      if (isEditMode && editingType) {
        await equipmentTypeService.update(editingType.id, apiData);
      } else {
        await equipmentTypeService.create(apiData);
      }
      
      setIsModalOpen(false);
      loadData();
    } catch (error: any) {
      console.error('Failed to save equipment type:', error);
      // Extract error message from API response
      const errorMessage = error?.message || 'Failed to save equipment type. Please try again.';
      setErrors(prev => ({ ...prev, submit: errorMessage }));
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (type: EquipmentType) => {
    if (!confirm(isRTL ? 'هل أنت متأكد من حذف هذا النوع؟' : 'Are you sure you want to delete this type?')) {
      return;
    }

    try {
      await equipmentTypeService.delete(type.id);
      loadData();
    } catch (error: any) {
      console.error('Failed to delete equipment type:', error);
      const errorMessage = error?.message || 'Failed to delete equipment type';
      // Show error inline instead of alert
      setErrors(prev => ({ ...prev, submit: errorMessage }));
    }
  };

  const getLocationModeLabel = (mode: string) => {
    const modeConfig = locationModes.find(m => m.value === mode);
    return modeConfig ? modeConfig.label : mode;
  };

  return (
    <div 
      className={cn("container mx-auto p-6 space-y-6", isRTL && "text-right")} 
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className={cn("text-2xl font-bold text-white font-montserrat", isRTL && "font-cairo")}>
            {isRTL ? 'أنواع المعدات' : 'Equipment Types'}
          </h1>
          <p className={cn("text-gray-400 mt-1", isRTL && "font-cairo")}>
            {isRTL ? 'إدارة أنواع المعدات المختلفة في النظام' : 'Manage different equipment types in the system'}
          </p>
        </div>
        <Button
          onClick={openAddModal}
          className="bg-[#FFCC00] hover:bg-[#E6B800] text-black font-medium px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          {isRTL ? 'إضافة نوع جديد' : 'Add New Type'}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder={isRTL ? 'البحث في أنواع المعدات...' : 'Search equipment types...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={cn("pl-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400", isRTL && "font-cairo")}
            />
          </div>
        </div>
        <div className="sm:w-48">
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          >
            <option value="">{isRTL ? 'جميع الفئات' : 'All Categories'}</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Content */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className={cn("px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider", isRTL && "text-right font-cairo")}>
                  {isRTL ? 'الاسم' : 'Name'}
                </th>
                <th className={cn("px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider", isRTL && "text-right font-cairo")}>
                  {isRTL ? 'الفئة' : 'Category'}
                </th>
                <th className={cn("px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider", isRTL && "text-right font-cairo")}>
                  {isRTL ? 'نمط الموقع' : 'Location Mode'}
                </th>
                <th className={cn("px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider", isRTL && "text-right font-cairo")}>
                  {isRTL ? 'الخصائص' : 'Attributes'}
                </th>
                <th className={cn("px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider", isRTL && "text-right font-cairo")}>
                  {isRTL ? 'تاريخ الإنشاء' : 'Created'}
                </th>
                <th className={cn("px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider", isRTL && "text-right font-cairo")}>
                  {isRTL ? 'الإجراءات' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                // Skeleton loaders
                <>
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                </>
              ) : (
                filteredTypes.map((type) => (
                  <tr key={type.id} className="hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className={cn("text-sm font-medium text-white", isRTL && "font-cairo")}>
                          {isRTL ? type.nameAr : type.nameEn}
                        </div>
                        {!isRTL && type.nameAr && (
                          <div className="text-sm text-gray-400 font-cairo">{type.nameAr}</div>
                        )}
                        {type.nameUr && (
                          <div className="text-sm text-gray-400 font-cairo">{type.nameUr}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="secondary" className="bg-gray-600 text-gray-200">
                        {type.category}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {type.locationMode === 'single' && <MapPin className="h-4 w-4 text-gray-400" />}
                        {type.locationMode === 'from_to' && <Navigation className="h-4 w-4 text-gray-400" />}
                        {type.locationMode === 'none' && <X className="h-4 w-4 text-gray-400" />}
                        <span className="text-sm text-gray-300">
                          {getLocationModeLabel(type.locationMode)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-300">
                        {type.attributes?.length || 0} {isRTL ? 'خاصية' : 'attributes'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {new Date(type.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => openEditModal(type)}
                          variant="ghost"
                          size="sm"
                          className="text-[#0073E6] hover:text-[#0056B3] hover:bg-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(type)}
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300 hover:bg-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {!loading && filteredTypes.length === 0 && (
          <div className="text-center py-12">
            <Settings className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-white font-cairo">
              {isRTL ? 'لا توجد أنواع معدات' : 'No equipment types'}
            </h3>
            <p className="mt-1 text-sm text-gray-400">
              {isRTL ? 'ابدأ بإضافة نوع معدة جديد' : 'Get started by adding a new equipment type'}
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditMode ? (isRTL ? 'تعديل نوع المعدة' : 'Edit Equipment Type') : (isRTL ? 'إضافة نوع معدة جديد' : 'Add New Equipment Type')}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Banner */}
          <ErrorBanner 
            message={errors.submit} 
            onDismiss={() => setErrors(prev => ({ ...prev, submit: undefined }))} 
          />

          {/* Names */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={cn("block text-sm font-medium text-gray-300 mb-2", isRTL && "font-cairo")}>
                {isRTL ? 'الاسم بالإنجليزية' : 'English Name'} <span className="text-red-400">*</span>
              </label>
              <Input
                type="text"
                value={form.name_en}
                onChange={(e) => handleInputChange('name_en', e.target.value)}
                onBlur={() => handleBlur('name_en')}
                className={cn(
                  "dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400",
                  touched.name_en && errors.name_en && "border-red-500 focus:border-red-500"
                )}
                placeholder={isRTL ? 'أدخل الاسم بالإنجليزية' : 'Enter English name'}
              />
              {touched.name_en && <FieldError message={errors.name_en} />}
            </div>
            <div>
              <label className={cn("block text-sm font-medium text-gray-300 mb-2 font-cairo")}>
                {isRTL ? 'الاسم بالعربية' : 'Arabic Name'} <span className="text-red-400">*</span>
              </label>
              <Input
                type="text"
                value={form.name_ar}
                onChange={(e) => handleInputChange('name_ar', e.target.value)}
                onBlur={() => handleBlur('name_ar')}
                className={cn(
                  "dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400 font-cairo",
                  touched.name_ar && errors.name_ar && "border-red-500 focus:border-red-500"
                )}
                placeholder={isRTL ? 'أدخل الاسم بالعربية' : 'Enter Arabic name'}
                dir="rtl"
              />
              {touched.name_ar && <FieldError message={errors.name_ar} />}
            </div>
          </div>

          <div>
            <label className={cn("block text-sm font-medium text-gray-300 mb-2 font-cairo")}>
              {isRTL ? 'الاسم بالأردية' : 'Urdu Name'}
            </label>
            <Input
              type="text"
              value={form.name_ur}
              onChange={(e) => handleInputChange('name_ur', e.target.value)}
              className="dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400 font-cairo"
              placeholder={isRTL ? 'أدخل الاسم بالأردية (اختياري)' : 'Enter Urdu name (optional)'}
              dir="rtl"
            />
          </div>

          {/* Category */}
          <div>
            <label className={cn("block text-sm font-medium text-gray-300 mb-2", isRTL && "font-cairo")}>
              {isRTL ? 'الفئة' : 'Category'} <span className="text-red-400">*</span>
            </label>
            <Select
              value={form.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              onBlur={() => handleBlur('category')}
              className={cn(
                "dark:bg-gray-800 dark:border-gray-700 dark:text-white",
                touched.category && errors.category && "border-red-500 focus:border-red-500"
              )}
            >
              <option value="">{isRTL ? 'اختر الفئة' : 'Select category'}</option>
              {(categories.length > 0 ? categories : defaultCategories).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>
            {touched.category && <FieldError message={errors.category} />}
          </div>

          {/* Location Mode */}
          <div>
            <label className={cn("block text-sm font-medium text-gray-300 mb-2", isRTL && "font-cairo")}>
              {isRTL ? 'نمط الموقع' : 'Location Mode'} <span className="text-red-400">*</span>
            </label>
            <Select
              value={form.location_mode}
              onChange={(e) => handleInputChange('location_mode', e.target.value)}
              className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            >
              {locationModes.map((mode) => (
                <option key={mode.value} value={mode.value}>
                  {mode.label}
                </option>
              ))}
            </Select>
          </div>

          {/* Attributes */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className={cn("block text-sm font-medium text-gray-300", isRTL && "font-cairo")}>
                {isRTL ? 'الخصائص' : 'Attributes'}
              </label>
              <Button
                type="button"
                onClick={addAttribute}
                variant="outline"
                size="sm"
                className="text-[#0073E6] border-[#0073E6] hover:bg-[#0073E6] hover:text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                {isRTL ? 'إضافة خاصية' : 'Add Attribute'}
              </Button>
            </div>

            {form.attributes.map((attribute, index) => (
              <div key={attribute.id} className="border border-gray-600 rounded-lg p-4 mb-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className={cn("text-sm font-medium text-gray-300", isRTL && "font-cairo")}>
                    {isRTL ? `الخاصية ${index + 1}` : `Attribute ${index + 1}`}
                  </h4>
                  <Button
                    type="button"
                    onClick={() => removeAttribute(index)}
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Input
                      type="text"
                      value={attribute.label}
                      onChange={(e) => updateAttribute(index, 'label', e.target.value)}
                      placeholder={isRTL ? 'تسمية الخاصية *' : 'Attribute label *'}
                      className={cn(
                        "dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400",
                        errors.attributes?.[index]?.label && "border-red-500 focus:border-red-500"
                      )}
                    />
                    {errors.attributes?.[index]?.label && (
                      <FieldError message={errors.attributes[index].label} />
                    )}
                  </div>
                  <div>
                    <Input
                      type="text"
                      value={attribute.unit || ''}
                      onChange={(e) => updateAttribute(index, 'unit', e.target.value)}
                      placeholder={isRTL ? 'الوحدة (اختياري)' : 'Unit (optional)'}
                      className="dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Toggle
                    checked={attribute.is_required}
                    onChange={(checked) => updateAttribute(index, 'is_required', checked)}
                  />
                  <label className={cn("text-sm text-gray-300", isRTL && "font-cairo")}>
                    {isRTL ? 'مطلوب' : 'Required'}
                  </label>
                </div>

                {/* Attribute Options - Comma-separated input */}
                <div>
                  <label className={cn("text-xs text-gray-400 mb-2 block", isRTL && "font-cairo")}>
                    {isRTL ? 'الخيارات المحددة مسبقاً (افصل بفاصلة)' : 'Predefined Options (comma-separated)'}
                  </label>
                  <Input
                    type="text"
                    value={attribute.optionsInput}
                    onChange={(e) => handleOptionsInputChange(index, e.target.value)}
                    placeholder={isRTL ? 'مثال: خيار1, خيار2, خيار3' : 'e.g., Option 1, Option 2, Option 3'}
                    className="dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400"
                  />
                  {attribute.options.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {attribute.options.map((opt, optIdx) => (
                        <Badge 
                          key={optIdx} 
                          variant="secondary" 
                          className="bg-gray-700 text-gray-300 text-xs"
                        >
                          {opt}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {attribute.options.length === 0 && attribute.optionsInput.trim() === '' && (
                    <p className={cn("text-xs text-gray-500 mt-1", isRTL && "font-cairo")}>
                      {isRTL ? 'لا توجد خيارات - سيكون هذا حقل نص حر' : 'No options - this will be a free text field'}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-600">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={formLoading}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              type="submit"
              disabled={formLoading}
              className="bg-[#FFCC00] hover:bg-[#E6B800] text-black font-medium"
            >
              {formLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
              ) : null}
              {isRTL ? (isEditMode ? 'تحديث' : 'إضافة') : (isEditMode ? 'Update' : 'Add')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EquipmentTypesPage;
