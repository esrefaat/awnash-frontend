'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Search, Filter, Settings, 
  MapPin, Navigation, X, ChevronDown, ChevronUp
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
}

interface EquipmentTypeFormData {
  name_en: string;
  name_ar: string;
  name_ur: string;
  category: string;
  location_mode: 'single' | 'from_to' | 'none';
  attributes: EquipmentTypeAttribute[];
}

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
      type.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      type.name_ar.includes(searchTerm) ||
      (type.name_ur && type.name_ur.includes(searchTerm));
    
    const matchesCategory = !selectedCategory || type.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Form handlers
  const handleInputChange = (field: keyof EquipmentTypeFormData, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const addAttribute = () => {
    const newAttribute: EquipmentTypeAttribute = {
      id: Date.now().toString(),
      label: '',
      unit: '',
      is_required: false,
      options: []
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
  };

  const updateAttribute = (index: number, field: keyof EquipmentTypeAttribute, value: any) => {
    setForm(prev => ({
      ...prev,
      attributes: prev.attributes.map((attr, i) => 
        i === index ? { ...attr, [field]: value } : attr
      )
    }));
  };

  const addAttributeOption = (attributeIndex: number) => {
    setForm(prev => ({
      ...prev,
      attributes: prev.attributes.map((attr, i) => 
        i === attributeIndex 
          ? { ...attr, options: [...attr.options, ''] }
          : attr
      )
    }));
  };

  const updateAttributeOption = (attributeIndex: number, optionIndex: number, value: string) => {
    setForm(prev => ({
      ...prev,
      attributes: prev.attributes.map((attr, i) => 
        i === attributeIndex 
          ? { 
              ...attr, 
              options: attr.options.map((opt, j) => j === optionIndex ? value : opt)
            }
          : attr
      )
    }));
  };

  const removeAttributeOption = (attributeIndex: number, optionIndex: number) => {
    setForm(prev => ({
      ...prev,
      attributes: prev.attributes.map((attr, i) => 
        i === attributeIndex 
          ? { ...attr, options: attr.options.filter((_, j) => j !== optionIndex) }
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
    setIsEditMode(false);
    setEditingType(null);
    setIsModalOpen(true);
  };

  const openEditModal = (type: EquipmentType) => {
    setForm({
      name_en: type.name_en,
      name_ar: type.name_ar,
      name_ur: type.name_ur || '',
      category: type.category,
      location_mode: type.location_mode,
      attributes: type.attributes || []
    });
    setIsEditMode(true);
    setEditingType(type);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.name_en.trim() || !form.name_ar.trim() || !form.category.trim()) {
      alert(isRTL ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill in all required fields');
      return;
    }

    try {
      setFormLoading(true);
      
      if (isEditMode && editingType) {
        await equipmentTypeService.update(editingType.id, form);
      } else {
        await equipmentTypeService.create(form);
      }
      
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Failed to save equipment type:', error);
      alert(isRTL ? 'فشل في حفظ نوع المعدة' : 'Failed to save equipment type');
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
    } catch (error) {
      console.error('Failed to delete equipment type:', error);
      alert(isRTL ? 'فشل في حذف نوع المعدة' : 'Failed to delete equipment type');
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
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0073E6]"></div>
        </div>
      ) : (
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
                {filteredTypes.map((type) => (
                  <tr key={type.id} className="hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className={cn("text-sm font-medium text-white", isRTL && "font-cairo")}>
                          {isRTL ? type.name_ar : type.name_en}
                        </div>
                        {!isRTL && type.name_ar && (
                          <div className="text-sm text-gray-400 font-cairo">{type.name_ar}</div>
                        )}
                        {type.name_ur && (
                          <div className="text-sm text-gray-400 font-cairo">{type.name_ur}</div>
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
                        {type.location_mode === 'single' && <MapPin className="h-4 w-4 text-gray-400" />}
                        {type.location_mode === 'from_to' && <Navigation className="h-4 w-4 text-gray-400" />}
                        {type.location_mode === 'none' && <X className="h-4 w-4 text-gray-400" />}
                        <span className="text-sm text-gray-300">
                          {getLocationModeLabel(type.location_mode)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-300">
                        {type.attributes?.length || 0} {isRTL ? 'خاصية' : 'attributes'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {new Date(type.created_at).toLocaleDateString()}
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
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredTypes.length === 0 && (
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
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditMode ? (isRTL ? 'تعديل نوع المعدة' : 'Edit Equipment Type') : (isRTL ? 'إضافة نوع معدة جديد' : 'Add New Equipment Type')}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Names */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={cn("block text-sm font-medium text-gray-300 mb-2", isRTL && "font-cairo")}>
                {isRTL ? 'الاسم بالإنجليزية' : 'English Name'} *
              </label>
              <Input
                type="text"
                value={form.name_en}
                onChange={(e) => handleInputChange('name_en', e.target.value)}
                required
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400"
                placeholder={isRTL ? 'أدخل الاسم بالإنجليزية' : 'Enter English name'}
              />
            </div>
            <div>
              <label className={cn("block text-sm font-medium text-gray-300 mb-2 font-cairo")}>
                {isRTL ? 'الاسم بالعربية' : 'Arabic Name'} *
              </label>
              <Input
                type="text"
                value={form.name_ar}
                onChange={(e) => handleInputChange('name_ar', e.target.value)}
                required
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400 font-cairo"
                placeholder={isRTL ? 'أدخل الاسم بالعربية' : 'Enter Arabic name'}
                dir="rtl"
              />
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
              {isRTL ? 'الفئة' : 'Category'} *
            </label>
            <Select
              value={form.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              required
              className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            >
              <option value="">{isRTL ? 'اختر الفئة' : 'Select category'}</option>
              {(categories.length > 0 ? categories : defaultCategories).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>
          </div>

          {/* Location Mode */}
          <div>
            <label className={cn("block text-sm font-medium text-gray-300 mb-2", isRTL && "font-cairo")}>
              {isRTL ? 'نمط الموقع' : 'Location Mode'} *
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
                      placeholder={isRTL ? 'تسمية الخاصية' : 'Attribute label'}
                      className="dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400"
                    />
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

                {/* Attribute Options */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className={cn("text-xs text-gray-400", isRTL && "font-cairo")}>
                      {isRTL ? 'الخيارات المحددة مسبقاً' : 'Predefined Options'}
                    </label>
                    <Button
                      type="button"
                      onClick={() => addAttributeOption(index)}
                      variant="ghost"
                      size="sm"
                      className="text-xs text-[#0073E6] hover:text-[#0056B3]"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {isRTL ? 'إضافة خيار' : 'Add Option'}
                    </Button>
                  </div>
                  
                  {attribute.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex gap-2 mb-2">
                      <Input
                        type="text"
                        value={option}
                        onChange={(e) => updateAttributeOption(index, optionIndex, e.target.value)}
                        placeholder={isRTL ? 'قيمة الخيار' : 'Option value'}
                        className="flex-1 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400"
                      />
                      <Button
                        type="button"
                        onClick={() => removeAttributeOption(index, optionIndex)}
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  {attribute.options.length === 0 && (
                    <p className={cn("text-xs text-gray-500", isRTL && "font-cairo")}>
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