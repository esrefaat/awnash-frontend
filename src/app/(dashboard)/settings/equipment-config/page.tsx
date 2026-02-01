'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, Edit, Trash2, Search, Settings, 
  MapPin, Navigation, X, AlertCircle,
  Edit2, Check, Loader2, Eye, EyeOff,
  GripVertical, Save, Layers, Tag, Globe, ChevronDown,
  Upload, Image as ImageIcon, Link as LinkIcon
} from 'lucide-react';
import { mediaService } from '@/services/mediaService';
import { cn } from '@/lib/utils';
import { 
  equipmentTypeService, 
  EquipmentType, 
  EquipmentCategory,
  CreateEquipmentTypeData, 
  UpdateEquipmentTypeData,
  MarketNameData,
  SupportEquipmentRequirement
} from '@/services/equipmentTypeService';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { Badge } from '@/components/ui/Badge';
import { Toggle } from '@/components/ui/Toggle';
import { Switch } from '@/components/ui/Switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

interface SupportRequirementFormData {
  id: string;
  supportEquipmentTypeId: string;
  quantity: number;
  isRequired: boolean;
}

interface EquipmentTypeFormData {
  name_en: string;
  name_ar: string;
  name_ur: string;
  categoryId: string;
  location_mode: 'single' | 'from_to' | 'none';
  requires_support_equipment: boolean;
  support_requirements: SupportRequirementFormData[];
  attributes: EquipmentTypeAttribute[];
  imageUrl: string;
  imageFile: File | null;
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
// Styled Components (matching EquipmentFormModal exactly)
// =============================================================================

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const StyledInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full h-11 px-4 rounded-lg",
        "bg-gray-900/50 border border-gray-700",
        "text-white placeholder:text-gray-500",
        "focus:outline-none focus:ring-2 focus:ring-awnash-primary/50 focus:border-awnash-primary",
        "transition-all duration-200",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    />
  )
);
StyledInput.displayName = "StyledInput";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
}

const StyledSelect = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          "w-full h-11 px-4 pr-10 rounded-lg appearance-none cursor-pointer",
          "bg-[#1a1f2e] border border-gray-700",
          "text-white",
          "focus:outline-none focus:ring-2 focus:ring-awnash-primary/50 focus:border-awnash-primary",
          "transition-all duration-200",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
        style={{
          colorScheme: 'dark',
        }}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
    </div>
  )
);
StyledSelect.displayName = "StyledSelect";

// Alert Component
interface AlertProps {
  type: "error" | "success";
  message: string;
}

function Alert({ type, message }: AlertProps) {
  const isError = type === "error";
  return (
    <div
      className={cn(
        "px-4 py-3 rounded-lg flex items-center gap-3 mb-4",
        isError ? "bg-red-900/30 border border-red-800" : "bg-green-900/30 border border-green-800"
      )}
    >
      {isError ? (
        <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
      ) : (
        <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
      )}
      <span className={cn("text-sm", isError ? "text-red-300" : "text-green-300")}>
        {message}
      </span>
    </div>
  );
}

// Form Field Component
interface FormFieldProps {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}

function FormField({ label, required, hint, children }: FormFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
        {hint && <span className="text-gray-500 ml-2 text-xs">({hint})</span>}
      </label>
      {children}
    </div>
  );
}

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
// TAB: CATEGORIES (with Drag-and-Drop)
// =============================================================================

// Sortable Category Row Component
const SortableCategoryRow: React.FC<{
  category: EquipmentCategory;
  isEditing: boolean;
  isSaving: boolean;
  editForm: Partial<EquipmentCategory>;
  onEditFormChange: (form: Partial<EquipmentCategory>) => void;
  onStartEditing: () => void;
  onCancelEditing: () => void;
  onSave: () => void;
  onToggleActive: () => void;
}> = ({
  category,
  isEditing,
  isSaving,
  editForm,
  onEditFormChange,
  onStartEditing,
  onCancelEditing,
  onSave,
  onToggleActive,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={cn(
        'hover:bg-gray-700/50 transition-colors',
        isEditing && 'bg-blue-900/20',
        !category.isActive && 'opacity-60',
        isDragging && 'bg-gray-600'
      )}
    >
      {/* Drag Handle */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-600 rounded"
            title="Drag to reorder"
          >
            <GripVertical className="h-4 w-4 text-gray-400" />
          </button>
          <span className="text-sm text-gray-500 w-6 text-center">{category.displayOrder}</span>
        </div>
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
            onChange={(e) => onEditFormChange({ ...editForm, nameEn: e.target.value })}
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
            onChange={(e) => onEditFormChange({ ...editForm, nameAr: e.target.value })}
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
          onClick={onToggleActive}
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
                onClick={onSave}
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
                onClick={onCancelEditing}
                disabled={isSaving}
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={onStartEditing}
              className="text-[#0073E6] border-[#0073E6] hover:bg-[#0073E6] hover:text-white"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
};

const CategoriesTab: React.FC = () => {
  const [categories, setCategories] = useState<EquipmentCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<EquipmentCategory>>({});
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = categories.findIndex((cat) => cat.id === active.id);
      const newIndex = categories.findIndex((cat) => cat.id === over.id);

      const newCategories = arrayMove(categories, oldIndex, newIndex);
      
      // Update display order values
      const updatedCategories = newCategories.map((cat, index) => ({
        ...cat,
        displayOrder: index + 1,
      }));
      
      setCategories(updatedCategories);

      // Save to backend
      try {
        setReordering(true);
        const updates = updatedCategories.map((cat) => ({
          id: cat.id,
          displayOrder: cat.displayOrder,
        }));
        await equipmentTypeService.updateCategoryDisplayOrder(updates);
      } catch (err) {
        console.error('Failed to save order:', err);
        setError('Failed to save order');
        // Revert on error
        await fetchCategories();
      } finally {
        setReordering(false);
      }
    }
  };

  const startEditing = (category: EquipmentCategory) => {
    setEditingId(category.id);
    setEditForm({
      nameEn: category.nameEn,
      nameAr: category.nameAr,
      nameUr: category.nameUr || '',
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
          <p className="text-sm text-gray-400">Drag to reorder categories. Changes are saved automatically.</p>
        </div>
        {reordering && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving order...
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-700 rounded-lg p-4">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Table */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-24">
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
                  <SortableContext
                    items={categories.map((c) => c.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {categories.map((category) => (
                      <SortableCategoryRow
                        key={category.id}
                        category={category}
                        isEditing={editingId === category.id}
                        isSaving={saving === category.id}
                        editForm={editForm}
                        onEditFormChange={setEditForm}
                        onStartEditing={() => startEditing(category)}
                        onCancelEditing={cancelEditing}
                        onSave={() => saveCategory(category.id)}
                        onToggleActive={() => toggleActive(category)}
                      />
                    ))}
                  </SortableContext>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </DndContext>

      {/* Info */}
      <div className="bg-gray-800 rounded-lg p-4 text-sm text-gray-400">
        <strong className="text-gray-300">Tip:</strong> Drag the handle on the left to reorder categories. 
        The order affects how categories appear in the app and admin interface.
      </div>
    </div>
  );
};

// =============================================================================
// TAB: EQUIPMENT TYPES (with Drag-and-Drop)
// =============================================================================

// Sortable Equipment Type Row Component
const SortableEquipmentTypeRow: React.FC<{
  type: EquipmentType;
  getCategoryName: (categoryId?: string, categorySlug?: string) => string;
  getLocationModeLabel: (mode: string) => string;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
}> = ({ type, getCategoryName, getLocationModeLabel, onEdit, onDelete, onToggleActive }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: type.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={cn(
        'hover:bg-gray-700 transition-colors',
        isDragging && 'bg-gray-600',
        !type.isActive && 'opacity-60'
      )}
    >
      {/* Drag Handle + Order */}
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-600 rounded"
            title="Drag to reorder"
          >
            <GripVertical className="h-4 w-4 text-gray-400" />
          </button>
          <span className="text-xs text-gray-500 w-6">{type.displayOrder}</span>
        </div>
      </td>
      {/* Image */}
      <td className="px-4 py-4 whitespace-nowrap">
        {type.imageUrl ? (
          <img 
            src={type.imageUrl} 
            alt={type.nameEn} 
            className="h-10 w-10 rounded object-cover bg-gray-700"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="h-10 w-10 rounded bg-gray-700 flex items-center justify-center">
            <ImageIcon className="h-5 w-5 text-gray-500" />
          </div>
        )}
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <div>
          <div className="text-sm font-medium text-white">{type.nameEn}</div>
          <div className="text-sm text-gray-400 font-cairo">{type.nameAr}</div>
        </div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <Badge variant="secondary" className="bg-gray-600 text-gray-200">
          {getCategoryName(type.categoryId, type.category)}
        </Badge>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          {type.locationMode === 'single' && <MapPin className="h-4 w-4 text-gray-400" />}
          {type.locationMode === 'from_to' && <Navigation className="h-4 w-4 text-gray-400" />}
          {type.locationMode === 'none' && <X className="h-4 w-4 text-gray-400" />}
          <span className="text-sm text-gray-300">{getLocationModeLabel(type.locationMode)}</span>
        </div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <span className="text-sm text-gray-300">{type.attributes?.length || 0}</span>
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-center">
        <button
          onClick={onToggleActive}
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
      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex items-center gap-2">
          <Button
            onClick={onEdit}
            variant="ghost"
            size="sm"
            className="text-[#0073E6] hover:text-[#0056B3] hover:bg-blue-900"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            onClick={onDelete}
            variant="ghost"
            size="sm"
            className="text-red-400 hover:text-red-300 hover:bg-red-900"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
};

const EquipmentTypesTab: React.FC = () => {
  const isRTL = false;

  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [reordering, setReordering] = useState(false);
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
    requires_support_equipment: false,
    support_requirements: [],
    attributes: [],
    imageUrl: '',
    imageFile: null,
  });
  
  const [imageInputMode, setImageInputMode] = useState<'url' | 'upload'>('upload');
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const [availableSupportTypes, setAvailableSupportTypes] = useState<EquipmentType[]>([]);

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
      
      // API returns sorted by displayOrder
      setEquipmentTypes(typesResponse.data || []);
      setCategories(categoriesResponse || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter types for display
  const filteredTypes = React.useMemo(() => {
    return equipmentTypes.filter(type => {
      const matchesSearch = !searchTerm || 
        type.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        type.nameAr.includes(searchTerm);
      
      const matchesCategory = !selectedCategory || 
        type.categoryId === selectedCategory ||
        type.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [equipmentTypes, searchTerm, selectedCategory]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = filteredTypes.findIndex((t) => t.id === active.id);
      const newIndex = filteredTypes.findIndex((t) => t.id === over.id);

      if (oldIndex === -1 || newIndex === -1) return;

      const reorderedTypes = arrayMove(filteredTypes, oldIndex, newIndex);
      
      // Update display order values for all reordered types
      const updatedTypes = reorderedTypes.map((type, index) => ({
        ...type,
        displayOrder: index + 1,
      }));

      // Update state optimistically
      setEquipmentTypes(prev => {
        // Replace filtered types with updated ones, keep others unchanged
        const filteredIds = new Set(filteredTypes.map(t => t.id));
        const otherTypes = prev.filter(t => !filteredIds.has(t.id));
        return [...otherTypes, ...updatedTypes].sort((a, b) => 
          (a.displayOrder || 0) - (b.displayOrder || 0)
        );
      });

      // Save to backend
      try {
        setReordering(true);
        const updates = updatedTypes.map((type) => ({
          id: type.id,
          displayOrder: type.displayOrder,
        }));
        await equipmentTypeService.updateDisplayOrder(updates);
      } catch (err) {
        console.error('Failed to save order:', err);
        // Revert on error
        await loadData();
      } finally {
        setReordering(false);
      }
    }
  };

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

  // Support Equipment helper functions
  const addSupportRequirement = () => {
    const newRequirement: SupportRequirementFormData = {
      id: Date.now().toString(),
      supportEquipmentTypeId: '',
      quantity: 1,
      isRequired: true
    };
    setForm(prev => ({
      ...prev,
      support_requirements: [...prev.support_requirements, newRequirement]
    }));
  };

  const removeSupportRequirement = (index: number) => {
    setForm(prev => ({
      ...prev,
      support_requirements: prev.support_requirements.filter((_, i) => i !== index)
    }));
  };

  const updateSupportRequirement = (index: number, field: keyof SupportRequirementFormData, value: any) => {
    setForm(prev => ({
      ...prev,
      support_requirements: prev.support_requirements.map((req, i) => 
        i === index ? { ...req, [field]: value } : req
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

  const openAddModal = async () => {
    // Load available support equipment types
    try {
      const supportTypes = await equipmentTypeService.getAvailableSupportEquipmentTypes();
      setAvailableSupportTypes(supportTypes);
    } catch (err) {
      console.error('Failed to load support types:', err);
    }
    
    setForm({
      name_en: '',
      name_ar: '',
      name_ur: '',
      categoryId: '',
      location_mode: 'single',
      requires_support_equipment: false,
      support_requirements: [],
      attributes: [],
      imageUrl: '',
      imageFile: null,
    });
    setImageInputMode('upload');
    setErrors({});
    setTouched({});
    setIsEditMode(false);
    setEditingType(null);
    setIsModalOpen(true);
  };

  const openEditModal = async (type: EquipmentType) => {
    // Load available support equipment types (excluding the current type)
    try {
      const supportTypes = await equipmentTypeService.getAvailableSupportEquipmentTypes(type.id);
      setAvailableSupportTypes(supportTypes);
    } catch (err) {
      console.error('Failed to load support types:', err);
    }
    
    setForm({
      name_en: type.nameEn,
      name_ar: type.nameAr,
      name_ur: type.nameUr || '',
      categoryId: type.categoryId || '',
      location_mode: type.locationMode,
      requires_support_equipment: type.requiresSupportEquipment || false,
      support_requirements: (type.supportRequirements || []).map(req => ({
        id: req.id,
        supportEquipmentTypeId: req.supportEquipmentTypeId,
        quantity: req.quantity,
        isRequired: req.isRequired
      })),
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
      }),
      imageUrl: type.imageUrl || '',
      imageFile: null,
    });
    setImageInputMode(type.imageUrl ? 'url' : 'upload');
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
      
      // Validate support requirements if enabled
      if (form.requires_support_equipment) {
        const invalidReqs = form.support_requirements.filter(r => !r.supportEquipmentTypeId);
        if (invalidReqs.length > 0) {
          setErrors(prev => ({ ...prev, submit: 'Please select an equipment type for all support requirements' }));
          setFormLoading(false);
          return;
        }
      }

      // Handle image upload if a file was selected
      let finalImageUrl = form.imageUrl;
      if (form.imageFile) {
        try {
          setUploadingImage(true);
          // Use a temporary ID for new types, or the actual ID for edits
          const contextId = isEditMode && editingType ? editingType.id : 'new';
          finalImageUrl = await mediaService.upload(form.imageFile, 'equipment-type', contextId);
        } catch (uploadError: any) {
          console.error('Failed to upload image:', uploadError);
          setErrors(prev => ({ ...prev, submit: `Image upload failed: ${uploadError?.message || 'Unknown error'}` }));
          setFormLoading(false);
          setUploadingImage(false);
          return;
        } finally {
          setUploadingImage(false);
        }
      }
      
      const apiData: CreateEquipmentTypeData = {
        nameEn: form.name_en,
        nameAr: form.name_ar,
        nameUr: form.name_ur || undefined,
        categoryId: form.categoryId,
        category: selectedCat?.slug || '', // For backward compatibility
        locationMode: form.location_mode,
        requiresSupportEquipment: form.requires_support_equipment,
        supportRequirements: form.requires_support_equipment
          ? form.support_requirements
              .filter(req => req.supportEquipmentTypeId)
              .map((req, index) => ({
                supportEquipmentTypeId: req.supportEquipmentTypeId,
                quantity: req.quantity,
                isRequired: req.isRequired,
                displayOrder: index
              }))
          : [],
        imageUrl: finalImageUrl || undefined,
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

  const handleToggleActive = async (type: EquipmentType) => {
    try {
      await equipmentTypeService.toggleActive(type.id);
      loadData();
    } catch (error: any) {
      console.error('Failed to toggle active status:', error);
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
          <p className="text-sm text-gray-400">Drag to reorder equipment types. Changes are saved automatically.</p>
        </div>
        <div className="flex items-center gap-4">
          {reordering && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving order...
            </div>
          )}
          <Button
            onClick={openAddModal}
            className="bg-[#FFCC00] hover:bg-[#E6B800] text-black font-medium px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add New Type
          </Button>
        </div>
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

      {/* Equipment Types Table */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase w-16">Order</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase w-14">Image</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Location Mode</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase w-20">Attrs</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase w-24">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase w-24">Actions</th>
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
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <Settings className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-white">No equipment types</h3>
                      <p className="mt-1 text-sm text-gray-400">Get started by adding a new equipment type</p>
                    </td>
                  </tr>
                ) : (
                  <SortableContext
                    items={filteredTypes.map((t) => t.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {filteredTypes.map((type) => (
                      <SortableEquipmentTypeRow
                        key={type.id}
                        type={type}
                        getCategoryName={getCategoryName}
                        getLocationModeLabel={getLocationModeLabel}
                        onEdit={() => openEditModal(type)}
                        onDelete={() => handleDelete(type)}
                        onToggleActive={() => handleToggleActive(type)}
                      />
                    ))}
                  </SortableContext>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </DndContext>

      {/* Add/Edit Modal - Matching EquipmentFormModal structure */}
      <Dialog open={isModalOpen} onOpenChange={(open) => !open && setIsModalOpen(false)}>
        <DialogContent
          className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-800 border-gray-700"
        >
          {/* Header */}
          <DialogHeader className="border-b border-gray-700 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-awnash-primary/10 flex items-center justify-center">
                <Settings className="h-5 w-5 text-awnash-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold text-white">
                  {isEditMode ? "Edit Equipment Type" : "Add New Equipment Type"}
                </DialogTitle>
                <p className="text-sm text-gray-400 mt-0.5">
                  Enter the equipment type details below
                </p>
              </div>
            </div>
          </DialogHeader>

          {/* Alerts */}
          {errors.submit && <Alert type="error" message={errors.submit} />}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Names - English and Arabic in two columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="English Name" required>
                <StyledInput
                  value={form.name_en}
                  onChange={(e) => handleInputChange('name_en', e.target.value)}
                  onBlur={() => handleBlur('name_en')}
                  placeholder="Enter English name"
                  className={touched.name_en && errors.name_en ? "border-red-500" : ""}
                />
                {touched.name_en && errors.name_en && <span className="text-red-400 text-xs mt-1 block">{errors.name_en}</span>}
              </FormField>

              <FormField label="Arabic Name" required>
                <StyledInput
                  value={form.name_ar}
                  onChange={(e) => handleInputChange('name_ar', e.target.value)}
                  onBlur={() => handleBlur('name_ar')}
                  placeholder="Enter Arabic name"
                  dir="rtl"
                  className={cn("font-cairo", touched.name_ar && errors.name_ar ? "border-red-500" : "")}
                />
                {touched.name_ar && errors.name_ar && <span className="text-red-400 text-xs mt-1 block">{errors.name_ar}</span>}
              </FormField>
            </div>

            {/* Urdu Name */}
            <FormField label="Urdu Name" hint="Optional">
              <StyledInput
                value={form.name_ur}
                onChange={(e) => handleInputChange('name_ur', e.target.value)}
                placeholder="Enter Urdu name"
                dir="rtl"
                className="font-cairo"
              />
            </FormField>

            {/* Two Column Layout for Category and Location Mode */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category */}
              <FormField label="Category" required>
                <StyledSelect
                  value={form.categoryId}
                  onChange={(e) => handleInputChange('categoryId', e.target.value)}
                  onBlur={() => handleBlur('categoryId')}
                >
                  <option value="">Select category</option>
                  {categories.filter(c => c.isActive).map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.nameEn}
                    </option>
                  ))}
                </StyledSelect>
                {touched.categoryId && errors.categoryId && <span className="text-red-400 text-xs mt-1 block">{errors.categoryId}</span>}
              </FormField>

              {/* Location Mode */}
              <FormField label="Location Mode" required>
                <StyledSelect
                  value={form.location_mode}
                  onChange={(e) => handleInputChange('location_mode', e.target.value)}
                >
                  {locationModes.map((mode) => (
                    <option key={mode.value} value={mode.value}>
                      {mode.label}
                    </option>
                  ))}
                </StyledSelect>
              </FormField>
            </div>

            {/* Image Upload Section */}
            <div className="space-y-4 border border-gray-700 rounded-xl p-4 bg-gray-900/20">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-300">
                  <ImageIcon className="inline-block h-4 w-4 mr-2" />
                  Equipment Type Image
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setImageInputMode('upload')}
                    className={cn(
                      'px-3 py-1 text-xs rounded-l-lg border transition-colors',
                      imageInputMode === 'upload'
                        ? 'bg-awnash-primary text-black border-awnash-primary'
                        : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                    )}
                  >
                    <Upload className="inline-block h-3 w-3 mr-1" />
                    Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageInputMode('url')}
                    className={cn(
                      'px-3 py-1 text-xs rounded-r-lg border transition-colors',
                      imageInputMode === 'url'
                        ? 'bg-awnash-primary text-black border-awnash-primary'
                        : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                    )}
                  >
                    <LinkIcon className="inline-block h-3 w-3 mr-1" />
                    URL
                  </button>
                </div>
              </div>

              {/* Image Preview */}
              {(form.imageUrl || form.imageFile) && (
                <div className="relative w-full h-40 bg-gray-800 rounded-lg overflow-hidden">
                  <img
                    src={form.imageFile ? URL.createObjectURL(form.imageFile) : form.imageUrl}
                    alt="Equipment type preview"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"%3E%3Cpath stroke="%239CA3AF" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4-4a3 3 0 014.3 0l5 5M14.7 14.7L16 13.4a3 3 0 014.3 0L22 15m-3-5a1 1 0 11-2 0 1 1 0 012 0zM6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"%3E%3C/path%3E%3C/svg%3E';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      handleInputChange('imageUrl', '');
                      handleInputChange('imageFile', null);
                    }}
                    className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 rounded-full text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {imageInputMode === 'upload' ? (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleInputChange('imageFile', file);
                        handleInputChange('imageUrl', ''); // Clear URL when file is selected
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-8 border-2 border-dashed border-gray-600 rounded-lg hover:border-awnash-primary transition-colors flex flex-col items-center gap-2"
                  >
                    <Upload className="h-8 w-8 text-gray-400" />
                    <span className="text-sm text-gray-400">Click to upload image</span>
                    <span className="text-xs text-gray-500">JPG, PNG, WebP, GIF (max 50MB)</span>
                  </button>
                </div>
              ) : (
                <div>
                  <StyledInput
                    value={form.imageUrl}
                    onChange={(e) => {
                      handleInputChange('imageUrl', e.target.value);
                      handleInputChange('imageFile', null); // Clear file when URL is entered
                    }}
                    placeholder="https://example.com/image.jpg"
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Enter a direct link to an image. Make sure it's publicly accessible.
                  </p>
                </div>
              )}
            </div>

          {/* Support Equipment Section */}
          <div className="space-y-4 border border-gray-700 rounded-xl p-4 bg-gray-900/20">
            <div className="flex items-center gap-3">
              <Switch
                checked={form.requires_support_equipment}
                onCheckedChange={(checked) => {
                  handleInputChange('requires_support_equipment', checked);
                  if (!checked) {
                    handleInputChange('support_requirements', []);
                  }
                }}
              />
              <label className="text-sm font-medium text-gray-300">
                Requires Support Equipment
              </label>
            </div>
            
            {form.requires_support_equipment && (
              <div className="space-y-4 mt-4">
                <p className="text-xs text-gray-500">
                  Specify equipment required to operate or transport this equipment type
                </p>
                
                {form.support_requirements.length === 0 && (
                  <div className="text-center py-6 border-2 border-dashed border-gray-700 rounded-xl">
                    <Settings className="mx-auto h-6 w-6 text-gray-500" />
                    <p className="text-sm text-gray-500 mt-2">No support equipment added yet</p>
                  </div>
                )}

                {form.support_requirements.map((requirement, index) => (
                  <div 
                    key={requirement.id} 
                    className="border border-gray-600 rounded-lg p-3 space-y-3 bg-gray-800/50"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-xs text-gray-400">Equipment {index + 1}</span>
                      <Button
                        type="button"
                        onClick={() => removeSupportRequirement(index)}
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20 h-6 w-6 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <Select
                      value={requirement.supportEquipmentTypeId}
                      onChange={(e) => updateSupportRequirement(index, 'supportEquipmentTypeId', e.target.value)}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                    >
                      <option value="">Select equipment type...</option>
                      {availableSupportTypes.map((type) => (
                        <option key={type.id} value={type.id}>{type.nameEn}</option>
                      ))}
                    </Select>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">Quantity</label>
                        <Input
                          type="number"
                          min={1}
                          value={requirement.quantity}
                          onChange={(e) => updateSupportRequirement(index, 'quantity', parseInt(e.target.value) || 1)}
                          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                        />
                      </div>
                      <div className="flex items-end pb-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <Toggle
                            checked={requirement.isRequired}
                            onChange={(checked) => updateSupportRequirement(index, 'isRequired', checked)}
                          />
                          <span className="text-xs text-gray-400">Required</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  onClick={addSupportRequirement}
                  variant="outline"
                  size="sm"
                  className="text-[#0073E6] border-[#0073E6] hover:bg-[#0073E6] hover:text-white w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Support Equipment
                </Button>
              </div>
            )}
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

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-700">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={formLoading}
                className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={formLoading || uploadingImage}
                className="bg-awnash-primary hover:bg-awnash-primary-hover text-black font-medium"
              >
                {formLoading || uploadingImage ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {uploadingImage ? "Uploading image..." : (isEditMode ? "Updating..." : "Adding...")}
                  </span>
                ) : isEditMode ? (
                  "Update Equipment Type"
                ) : (
                  "Add Equipment Type"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
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

      // Sort by displayOrder
      const sortedTypes = (typesResponse.data || []).sort((a, b) => 
        (a.displayOrder || 0) - (b.displayOrder || 0)
      );
      setEquipmentTypes(sortedTypes);
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
  const [activeTab, setActiveTab] = useState<TabType>('types');

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
