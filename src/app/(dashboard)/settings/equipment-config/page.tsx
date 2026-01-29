'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, Edit, Trash2, Search, Settings, 
  MapPin, Navigation, X, AlertCircle,
  Edit2, Check, Loader2, Eye, EyeOff,
  GripVertical, Save, Layers, Tag, Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  equipmentTypeService, 
  EquipmentType, 
  EquipmentCategory,
  CreateEquipmentTypeData, 
  UpdateEquipmentTypeData,
  MarketNameData
} from '@/services/equipmentTypeService';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Toggle } from '@/components/ui/Toggle';

// =============================================================================
// TYPES & CONSTANTS
// =============================================================================

interface EquipmentTypeAttribute {
  id: string;
  label: string;
  unit?: string;
  is_required: boolean;
  options: string[];
  optionsInput: string;
}

interface EquipmentTypeFormData {
  name_en: string;
  name_ar: string;
  name_ur: string;
  categoryId: string;
  location_mode: 'single' | 'from_to' | 'none';
  attributes: EquipmentTypeAttribute[];
}

interface FormErrors {
  name_en?: string;
  name_ar?: string;
  categoryId?: string;
  attributes?: { [key: number]: { label?: string } };
  submit?: string;
}

const MARKETS = [
  { code: 'SA', name: 'Saudi Arabia', nameAr: 'السعودية' },
  { code: 'AE', name: 'UAE', nameAr: 'الإمارات' },
  { code: 'PK', name: 'Pakistan', nameAr: 'باكستان' },
];

const locationModes = [
  { value: 'single', label: 'Single Location', icon: MapPin },
  { value: 'from_to', label: 'From/To (Transport)', icon: Navigation },
  { value: 'none', label: 'None', icon: X }
];

type TabType = 'categories' | 'types' | 'naming';

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

const TableRowSkeleton: React.FC<{ cols?: number }> = ({ cols = 6 }) => (
  <tr className="animate-pulse">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-600 rounded w-24"></div>
      </td>
    ))}
  </tr>
);

const FieldError: React.FC<{ message?: string }> = ({ message }) => {
  if (!message) return null;
  return (
    <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
      <AlertCircle className="h-3 w-3" />
      {message}
    </p>
  );
};

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

// =============================================================================
// TAB: CATEGORIES
// =============================================================================

const CategoriesTab: React.FC = () => {
  const [categories, setCategories] = useState<EquipmentCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<EquipmentCategory>>({});
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const data = await equipmentTypeService.getAllCategories();
      setCategories(data.sort((a, b) => a.displayOrder - b.displayOrder));
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const startEditing = (category: EquipmentCategory) => {
    setEditingId(category.id);
    setEditForm({
      nameEn: category.nameEn,
      nameAr: category.nameAr,
      nameUr: category.nameUr || '',
      displayOrder: category.displayOrder,
      isActive: category.isActive
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveCategory = async (id: string) => {
    try {
      setSaving(id);
      await equipmentTypeService.updateCategory(id, editForm);
      setEditingId(null);
      setEditForm({});
      await fetchCategories();
    } catch (err) {
      console.error('Failed to save category:', err);
      setError('Failed to save category');
    } finally {
      setSaving(null);
    }
  };

  const toggleActive = async (category: EquipmentCategory) => {
    try {
      setSaving(category.id);
      await equipmentTypeService.updateCategory(category.id, { isActive: !category.isActive });
      await fetchCategories();
    } catch (err) {
      console.error('Failed to toggle category:', err);
      setError('Failed to update category');
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-white">Equipment Categories</h2>
          <p className="text-sm text-gray-400">Manage equipment categories and their display order</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-700 rounded-lg p-4">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  English Name
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Arabic Name
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <>
                  <TableRowSkeleton cols={6} />
                  <TableRowSkeleton cols={6} />
                  <TableRowSkeleton cols={6} />
                </>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    No categories found
                  </td>
                </tr>
              ) : (
                categories.map((category) => {
                  const isEditing = editingId === category.id;
                  const isSaving = saving === category.id;

                  return (
                    <tr
                      key={category.id}
                      className={cn(
                        'hover:bg-gray-700/50 transition-colors',
                        isEditing && 'bg-blue-900/20',
                        !category.isActive && 'opacity-60'
                      )}
                    >
                      {/* Display Order */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isEditing ? (
                          <Input
                            type="number"
                            value={editForm.displayOrder ?? ''}
                            onChange={(e) => setEditForm({ ...editForm, displayOrder: parseInt(e.target.value) || 0 })}
                            className="w-20 text-sm"
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <GripVertical className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-300">{category.displayOrder}</span>
                          </div>
                        )}
                      </td>

                      {/* Slug */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <code className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300">
                          {category.slug}
                        </code>
                      </td>

                      {/* English Name */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isEditing ? (
                          <Input
                            value={editForm.nameEn ?? ''}
                            onChange={(e) => setEditForm({ ...editForm, nameEn: e.target.value })}
                            className="w-full text-sm"
                          />
                        ) : (
                          <span className="text-sm font-medium text-white">{category.nameEn}</span>
                        )}
                      </td>

                      {/* Arabic Name */}
                      <td className="px-6 py-4 whitespace-nowrap text-right" dir="rtl">
                        {isEditing ? (
                          <Input
                            value={editForm.nameAr ?? ''}
                            onChange={(e) => setEditForm({ ...editForm, nameAr: e.target.value })}
                            className="w-full text-sm text-right"
                            dir="rtl"
                          />
                        ) : (
                          <span className="text-sm text-gray-300 font-cairo">{category.nameAr}</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => toggleActive(category)}
                          disabled={isSaving}
                          className={cn(
                            'inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors',
                            category.isActive
                              ? 'bg-green-900/50 text-green-300 hover:bg-green-900/70'
                              : 'bg-red-900/50 text-red-300 hover:bg-red-900/70'
                          )}
                        >
                          {category.isActive ? (
                            <>
                              <Eye className="h-3 w-3" />
                              Active
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-3 w-3" />
                              Hidden
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          {isEditing ? (
                            <>
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => saveCategory(category.id)}
                                disabled={isSaving}
                                className="bg-[#FFCC00] hover:bg-[#E6B800] text-black"
                              >
                                {isSaving ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Check className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={cancelEditing}
                                disabled={isSaving}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startEditing(category)}
                              className="text-[#0073E6] border-[#0073E6] hover:bg-[#0073E6] hover:text-white"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info */}
      <div className="bg-gray-800 rounded-lg p-4 text-sm text-gray-400">
        <strong className="text-gray-300">Note:</strong> Categories are seeded during initial setup. 
        You can rename them or change their display order, but the slugs remain constant for data integrity.
      </div>
    </div>
  );
};

// =============================================================================
// TAB: EQUIPMENT TYPES
// =============================================================================

const EquipmentTypesTab: React.FC = () => {
  const isRTL = false;

  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<EquipmentCategory[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingType, setEditingType] = useState<EquipmentType | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  
  const [form, setForm] = useState<EquipmentTypeFormData>({
    name_en: '',
    name_ar: '',
    name_ur: '',
    categoryId: '',
    location_mode: 'single',
    attributes: []
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (field: string, value: string): string | undefined => {
    switch (field) {
      case 'name_en':
        if (!value.trim()) return 'English name is required';
        if (value.length < 2) return 'English name must be at least 2 characters';
        return undefined;
      case 'name_ar':
        if (!value.trim()) return 'Arabic name is required';
        if (value.length < 2) return 'Arabic name must be at least 2 characters';
        return undefined;
      case 'categoryId':
        if (!value.trim()) return 'Category is required';
        return undefined;
      default:
        return undefined;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    newErrors.name_en = validateField('name_en', form.name_en);
    newErrors.name_ar = validateField('name_ar', form.name_ar);
    newErrors.categoryId = validateField('categoryId', form.categoryId);
    
    const attributeErrors: { [key: number]: { label?: string } } = {};
    form.attributes.forEach((attr, index) => {
      if (!attr.label.trim()) {
        attributeErrors[index] = { label: 'Attribute label is required' };
      }
    });
    
    if (Object.keys(attributeErrors).length > 0) {
      newErrors.attributes = attributeErrors;
    }
    
    setErrors(newErrors);
    return !newErrors.name_en && !newErrors.name_ar && !newErrors.categoryId && 
           Object.keys(attributeErrors).length === 0;
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const value = form[field as keyof EquipmentTypeFormData];
    if (typeof value === 'string') {
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [typesResponse, categoriesResponse] = await Promise.all([
        equipmentTypeService.getAll({ limit: 100 }),
        equipmentTypeService.getAllCategories()
      ]);
      
      setEquipmentTypes(typesResponse.data || []);
      setCategories(categoriesResponse || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTypes = equipmentTypes.filter(type => {
    const matchesSearch = !searchTerm || 
      type.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      type.nameAr.includes(searchTerm);
    
    const matchesCategory = !selectedCategory || 
      type.categoryId === selectedCategory ||
      type.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleInputChange = (field: keyof EquipmentTypeFormData, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
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
      optionsInput: ''
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

  const handleOptionsInputChange = (attributeIndex: number, value: string) => {
    setForm(prev => ({
      ...prev,
      attributes: prev.attributes.map((attr, i) => 
        i === attributeIndex 
          ? { 
              ...attr, 
              optionsInput: value,
              options: value.split(',').map(opt => opt.trim()).filter(opt => opt.length > 0)
            }
          : attr
      )
    }));
  };

  const openAddModal = () => {
    setForm({
      name_en: '',
      name_ar: '',
      name_ur: '',
      categoryId: '',
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
    setForm({
      name_en: type.nameEn,
      name_ar: type.nameAr,
      name_ur: type.nameUr || '',
      categoryId: type.categoryId || '',
      location_mode: type.locationMode,
      attributes: (type.attributes || []).map(attr => {
        const optionsArray = attr.options?.map(opt => 
          typeof opt === 'string' ? opt : opt.value
        ) || [];
        return {
          id: attr.id,
          label: attr.label,
          unit: attr.unit || '',
          is_required: attr.isRequired,
          options: optionsArray,
          optionsInput: optionsArray.join(', ')
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
    setTouched({ name_en: true, name_ar: true, categoryId: true });
    
    if (!validateForm()) return;

    try {
      setFormLoading(true);
      setErrors(prev => ({ ...prev, submit: undefined }));
      
      // Find category to get slug for backward compatibility
      const selectedCat = categories.find(c => c.id === form.categoryId);
      
      const apiData: CreateEquipmentTypeData = {
        nameEn: form.name_en,
        nameAr: form.name_ar,
        nameUr: form.name_ur || undefined,
        categoryId: form.categoryId,
        category: selectedCat?.slug || '', // For backward compatibility
        locationMode: form.location_mode,
        attributes: form.attributes
          .filter(attr => attr.label.trim())
          .map(attr => ({
            label: attr.label,
            unit: attr.unit || undefined,
            isRequired: attr.is_required,
            options: attr.options.filter(opt => opt.trim() !== '').map(opt => ({ value: opt }))
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
      setErrors(prev => ({ ...prev, submit: error?.message || 'Failed to save equipment type' }));
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (type: EquipmentType) => {
    if (!confirm('Are you sure you want to delete this type?')) return;

    try {
      await equipmentTypeService.delete(type.id);
      loadData();
    } catch (error: any) {
      console.error('Failed to delete equipment type:', error);
    }
  };

  const getCategoryName = (categoryId?: string, categorySlug?: string) => {
    if (categoryId) {
      const cat = categories.find(c => c.id === categoryId);
      if (cat) return cat.nameEn;
    }
    if (categorySlug) {
      const cat = categories.find(c => c.slug === categorySlug);
      if (cat) return cat.nameEn;
    }
    return categorySlug || 'Unknown';
  };

  const getLocationModeLabel = (mode: string) => {
    const modeConfig = locationModes.find(m => m.value === mode);
    return modeConfig ? modeConfig.label : mode;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Equipment Types</h2>
          <p className="text-sm text-gray-400">Manage equipment types and their attributes</p>
        </div>
        <Button
          onClick={openAddModal}
          className="bg-[#FFCC00] hover:bg-[#E6B800] text-black font-medium px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add New Type
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search equipment types..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
        </div>
        <div className="sm:w-48">
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          >
            <option value="">All Categories</option>
            {categories.filter(c => c.isActive).map((category) => (
              <option key={category.id} value={category.id}>
                {category.nameEn}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Location Mode</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Attributes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <>
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                </>
              ) : filteredTypes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Settings className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-white">No equipment types</h3>
                    <p className="mt-1 text-sm text-gray-400">Get started by adding a new equipment type</p>
                  </td>
                </tr>
              ) : (
                filteredTypes.map((type) => (
                  <tr key={type.id} className="hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-white">{type.nameEn}</div>
                        <div className="text-sm text-gray-400 font-cairo">{type.nameAr}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="secondary" className="bg-gray-600 text-gray-200">
                        {getCategoryName(type.categoryId, type.category)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {type.locationMode === 'single' && <MapPin className="h-4 w-4 text-gray-400" />}
                        {type.locationMode === 'from_to' && <Navigation className="h-4 w-4 text-gray-400" />}
                        {type.locationMode === 'none' && <X className="h-4 w-4 text-gray-400" />}
                        <span className="text-sm text-gray-300">{getLocationModeLabel(type.locationMode)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-300">{type.attributes?.length || 0} attributes</span>
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
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditMode ? 'Edit Equipment Type' : 'Add New Equipment Type'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <ErrorBanner 
            message={errors.submit} 
            onDismiss={() => setErrors(prev => ({ ...prev, submit: undefined }))} 
          />

          {/* Names */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                English Name <span className="text-red-400">*</span>
              </label>
              <Input
                type="text"
                value={form.name_en}
                onChange={(e) => handleInputChange('name_en', e.target.value)}
                onBlur={() => handleBlur('name_en')}
                className={cn(
                  "dark:bg-gray-800 dark:border-gray-700 dark:text-white",
                  touched.name_en && errors.name_en && "border-red-500"
                )}
                placeholder="Enter English name"
              />
              {touched.name_en && <FieldError message={errors.name_en} />}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Arabic Name <span className="text-red-400">*</span>
              </label>
              <Input
                type="text"
                value={form.name_ar}
                onChange={(e) => handleInputChange('name_ar', e.target.value)}
                onBlur={() => handleBlur('name_ar')}
                className={cn(
                  "dark:bg-gray-800 dark:border-gray-700 dark:text-white font-cairo",
                  touched.name_ar && errors.name_ar && "border-red-500"
                )}
                placeholder="Enter Arabic name"
                dir="rtl"
              />
              {touched.name_ar && <FieldError message={errors.name_ar} />}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Urdu Name</label>
            <Input
              type="text"
              value={form.name_ur}
              onChange={(e) => handleInputChange('name_ur', e.target.value)}
              className="dark:bg-gray-800 dark:border-gray-700 dark:text-white font-cairo"
              placeholder="Enter Urdu name (optional)"
              dir="rtl"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Category <span className="text-red-400">*</span>
            </label>
            <SearchableSelect
              value={form.categoryId}
              onChange={(value) => handleInputChange('categoryId', value)}
              onBlur={() => handleBlur('categoryId')}
              options={categories.filter(c => c.isActive).map((category) => ({
                value: category.id,
                label: category.nameEn,
                labelAr: category.nameAr,
              }))}
              placeholder="Select category"
              searchPlaceholder="Search categories..."
              error={!!(touched.categoryId && errors.categoryId)}
            />
            {touched.categoryId && <FieldError message={errors.categoryId} />}
          </div>

          {/* Location Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Location Mode <span className="text-red-400">*</span>
            </label>
            <Select
              value={form.location_mode}
              onChange={(e) => handleInputChange('location_mode', e.target.value)}
              className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            >
              {locationModes.map((mode) => (
                <option key={mode.value} value={mode.value}>{mode.label}</option>
              ))}
            </Select>
          </div>

          {/* Attributes */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-gray-300">Attributes</label>
              <Button
                type="button"
                onClick={addAttribute}
                variant="outline"
                size="sm"
                className="text-[#0073E6] border-[#0073E6] hover:bg-[#0073E6] hover:text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Attribute
              </Button>
            </div>

            {form.attributes.map((attribute, index) => (
              <div key={attribute.id} className="border border-gray-600 rounded-lg p-4 mb-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-medium text-gray-300">Attribute {index + 1}</h4>
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
                      placeholder="Attribute label *"
                      className={cn(
                        "dark:bg-gray-800 dark:border-gray-700 dark:text-white",
                        errors.attributes?.[index]?.label && "border-red-500"
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
                      placeholder="Unit (optional)"
                      className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Toggle
                    checked={attribute.is_required}
                    onChange={(checked) => updateAttribute(index, 'is_required', checked)}
                  />
                  <label className="text-sm text-gray-300">Required</label>
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-2 block">
                    Predefined Options (comma-separated)
                  </label>
                  <Input
                    type="text"
                    value={attribute.optionsInput}
                    onChange={(e) => handleOptionsInputChange(index, e.target.value)}
                    placeholder="e.g., Option 1, Option 2, Option 3"
                    className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                  {attribute.options.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {attribute.options.map((opt, optIdx) => (
                        <Badge key={optIdx} variant="secondary" className="bg-gray-700 text-gray-300 text-xs">
                          {opt}
                        </Badge>
                      ))}
                    </div>
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
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={formLoading}
              className="bg-[#FFCC00] hover:bg-[#E6B800] text-black font-medium"
            >
              {formLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {isEditMode ? 'Update' : 'Add'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

// =============================================================================
// TAB: MARKET NAMING
// =============================================================================

interface EditableMarketName {
  nameEn: string;
  nameAr: string;
  nameUr: string;
  displayOrder: number | null;
}

interface EditingRow {
  id: string;
  marketName: EditableMarketName;
}

const MarketNamingTab: React.FC = () => {
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([]);
  const [categories, setCategories] = useState<EquipmentCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedMarket, setSelectedMarket] = useState<string>('SA');
  const [editingRow, setEditingRow] = useState<EditingRow | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [typesResponse, categoriesResponse] = await Promise.all([
        equipmentTypeService.getAllWithMarketNames(selectedMarket, {
          search: search || undefined,
          category: selectedCategory || undefined,
          limit: 100,
        }),
        equipmentTypeService.getAllCategories(),
      ]);

      setEquipmentTypes(typesResponse.data || []);
      setCategories(categoriesResponse || []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load equipment types');
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, selectedMarket]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const startEditing = (type: EquipmentType) => {
    const marketName = type.marketName;
    setEditingRow({
      id: type.id,
      marketName: {
        nameEn: marketName?.nameEn || '',
        nameAr: marketName?.nameAr || '',
        nameUr: marketName?.nameUr || '',
        displayOrder: marketName?.displayOrder ?? null,
      },
    });
  };

  const cancelEditing = () => {
    setEditingRow(null);
  };

  const saveMarketName = async (typeId: string) => {
    if (!editingRow || editingRow.id !== typeId) return;

    try {
      setSaving(typeId);
      const data: MarketNameData = {
        nameEn: editingRow.marketName.nameEn || undefined,
        nameAr: editingRow.marketName.nameAr || undefined,
        nameUr: editingRow.marketName.nameUr || undefined,
        displayOrder: editingRow.marketName.displayOrder ?? undefined,
      };

      await equipmentTypeService.upsertMarketName(typeId, selectedMarket, data);
      setEditingRow(null);
      await fetchData();
    } catch (err) {
      console.error('Failed to save market name:', err);
      setError('Failed to save market name');
    } finally {
      setSaving(null);
    }
  };

  const toggleActive = async (typeId: string) => {
    try {
      setSaving(typeId);
      await equipmentTypeService.toggleActive(typeId);
      await fetchData();
    } catch (err) {
      console.error('Failed to toggle active status:', err);
      setError('Failed to toggle status');
    } finally {
      setSaving(null);
    }
  };

  const updateEditingField = (field: keyof EditableMarketName, value: string | number | null) => {
    if (!editingRow) return;
    setEditingRow({
      ...editingRow,
      marketName: {
        ...editingRow.marketName,
        [field]: value,
      },
    });
  };

  const getCategoryName = (categorySlug: string) => {
    const category = categories.find(c => c.slug === categorySlug);
    return category?.nameEn || categorySlug;
  };

  const renderMarketNameCell = (type: EquipmentType, field: 'nameEn' | 'nameAr' | 'nameUr') => {
    const isEditing = editingRow?.id === type.id;
    const marketName = type.marketName;
    const displayValue = marketName?.[field] || '-';
    const isRTL = field === 'nameAr';

    if (isEditing) {
      return (
        <Input
          value={editingRow.marketName[field]}
          onChange={(e) => updateEditingField(field, e.target.value)}
          className={cn('w-full text-sm', isRTL && 'text-right')}
          dir={isRTL ? 'rtl' : 'ltr'}
          placeholder={`Market ${field.replace('name', '')}`}
        />
      );
    }

    return (
      <span className={cn('text-sm', isRTL && 'text-right block', !marketName?.[field] && 'text-gray-500')}>
        {displayValue}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-white">Market Naming</h2>
        <p className="text-sm text-gray-400">Manage market-specific equipment terminology</p>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search equipment types..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>{cat.nameEn}</option>
            ))}
          </Select>

          <Select
            value={selectedMarket}
            onChange={(e) => setSelectedMarket(e.target.value)}
          >
            {MARKETS.map((market) => (
              <option key={market.code} value={market.code}>
                {market.name} ({market.code})
              </option>
            ))}
          </Select>

          <Button variant="outline" onClick={fetchData} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-700 rounded-lg p-4">
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {/* Table */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Equipment Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Base Name (EN)</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase">Base Name (AR)</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Market Name (EN)</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase">Market Name (AR)</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase">Status</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRowSkeleton key={i} cols={8} />
                ))
              ) : equipmentTypes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                    No equipment types found
                  </td>
                </tr>
              ) : (
                equipmentTypes.map((type) => {
                  const isEditing = editingRow?.id === type.id;
                  const isSaving = saving === type.id;

                  return (
                    <tr
                      key={type.id}
                      className={cn(
                        'hover:bg-gray-700/50 transition-colors',
                        isEditing && 'bg-blue-900/20',
                        !type.isActive && 'opacity-60'
                      )}
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {type.imageUrl ? (
                            <img src={type.imageUrl} alt={type.nameEn} className="h-10 w-10 rounded object-cover" />
                          ) : (
                            <div className="h-10 w-10 rounded bg-gray-600 flex items-center justify-center">
                              <span className="text-gray-400 text-xs">{type.nameEn.charAt(0)}</span>
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-white">{type.nameEn}</p>
                            <p className="text-xs text-gray-400">{type.descriptionEn || 'No description'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant="default" className="text-xs">{getCategoryName(type.category)}</Badge>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-300">{type.nameEn}</span>
                      </td>
                      <td className="px-4 py-4 text-right" dir="rtl">
                        <span className="text-sm text-gray-300">{type.nameAr}</span>
                      </td>
                      <td className="px-4 py-4">{renderMarketNameCell(type, 'nameEn')}</td>
                      <td className="px-4 py-4 text-right" dir="rtl">{renderMarketNameCell(type, 'nameAr')}</td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => toggleActive(type.id)}
                          disabled={isSaving}
                          className={cn(
                            'inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors',
                            type.isActive
                              ? 'bg-green-900/50 text-green-300 hover:bg-green-900/70'
                              : 'bg-red-900/50 text-red-300 hover:bg-red-900/70'
                          )}
                        >
                          {type.isActive ? <><Eye className="h-3 w-3" />Active</> : <><EyeOff className="h-3 w-3" />Hidden</>}
                        </button>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {isEditing ? (
                            <>
                              <Button size="sm" variant="primary" onClick={() => saveMarketName(type.id)} disabled={isSaving} className="bg-[#FFCC00] hover:bg-[#E6B800] text-black">
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                              </Button>
                              <Button size="sm" variant="outline" onClick={cancelEditing} disabled={isSaving}>
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <Button size="sm" variant="outline" onClick={() => startEditing(type)}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-300 mb-2">Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-400">
          <div><strong className="text-gray-300">Base Name:</strong> Standard/textbook name</div>
          <div><strong className="text-gray-300">Market Name:</strong> Local terminology for {MARKETS.find(m => m.code === selectedMarket)?.name}</div>
          <div><strong className="text-gray-300">Order:</strong> Display order (lower = first)</div>
          <div><strong className="text-gray-300">Status:</strong> Active types appear in app</div>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// MAIN PAGE
// =============================================================================

export default function EquipmentConfigPage() {
  const [activeTab, setActiveTab] = useState<TabType>('categories');

  const tabs = [
    { id: 'categories' as TabType, label: 'Categories', icon: Layers },
    { id: 'types' as TabType, label: 'Equipment Types', icon: Tag },
    { id: 'naming' as TabType, label: 'Market Naming', icon: Globe },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white font-montserrat">Equipment Configuration</h1>
        <p className="text-gray-400 mt-1">Manage equipment categories, types, and market-specific naming</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                  activeTab === tab.id
                    ? 'border-[#FFCC00] text-[#FFCC00]'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                )}
              >
                <Icon className={cn(
                  'h-5 w-5 mr-2',
                  activeTab === tab.id ? 'text-[#FFCC00]' : 'text-gray-500 group-hover:text-gray-400'
                )} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="pt-4">
        {activeTab === 'categories' && <CategoriesTab />}
        {activeTab === 'types' && <EquipmentTypesTab />}
        {activeTab === 'naming' && <MarketNamingTab />}
      </div>
    </div>
  );
}
