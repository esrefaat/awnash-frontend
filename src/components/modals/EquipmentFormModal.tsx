"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Upload, Loader2, CheckCircle2, AlertTriangle, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCitiesForDropdown } from "@/config/cities";
import { getEquipmentStatusesForDropdown } from "@/config/equipment";
import {
  equipmentTypeService,
  EquipmentType,
} from "@/services/equipmentTypeService";
import {
  equipmentService,
  Equipment,
  EquipmentFormData,
} from "@/services/equipmentService";
import { usersService } from "@/services/usersService";
import { useAuth } from "@/contexts/AuthContext";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";

// =============================================================================
// Types
// =============================================================================

interface EquipmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  isRTL?: boolean;
  equipmentToEdit?: Equipment | null;
  isEditMode?: boolean;
  onSuccess?: () => void;
}

interface Owner {
  id: string;
  fullName: string;
  email?: string;
}

// =============================================================================
// Styled Components
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

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const StyledTextarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "w-full px-4 py-3 rounded-lg resize-none",
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
StyledTextarea.displayName = "StyledTextarea";

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
          // Force option styling for cross-browser compatibility
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

// =============================================================================
// Alert Component
// =============================================================================

interface AlertProps {
  type: "error" | "success";
  message: string;
}

function Alert({ type, message }: AlertProps) {
  const isError = type === "error";
  return (
    <div
      className={cn(
        "mb-6 p-4 rounded-xl flex items-start gap-3",
        isError
          ? "bg-red-500/10 border border-red-500/20"
          : "bg-green-500/10 border border-green-500/20"
      )}
    >
      {isError ? (
        <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
      ) : (
        <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
      )}
      <span className={cn("text-sm", isError ? "text-red-300" : "text-green-300")}>
        {message}
      </span>
    </div>
  );
}

// =============================================================================
// Form Field Component
// =============================================================================

interface FormFieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
  className?: string;
}

function FormField({ label, required, children, hint, className }: FormFieldProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {label}
        {required && <span className="text-awnash-primary ml-1">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-500 mt-1.5">{hint}</p>}
    </div>
  );
}

// =============================================================================
// Owner Search Dropdown
// =============================================================================

interface OwnerSearchProps {
  owners: Owner[];
  selectedOwnerId: string;
  onSelect: (ownerId: string) => void;
  isLoading: boolean;
  isRTL: boolean;
}

function OwnerSearch({ owners, selectedOwnerId, onSelect, isLoading, isRTL }: OwnerSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOwner = owners.find((o) => o.id === selectedOwnerId);
  const selectedText = selectedOwner
    ? `${selectedOwner.fullName}${selectedOwner.email ? ` (${selectedOwner.email})` : ""}`
    : "";

  const filteredOwners = owners.filter((owner) => {
    const term = searchTerm.toLowerCase();
    return (
      owner.fullName?.toLowerCase().includes(term) ||
      owner.email?.toLowerCase().includes(term)
    );
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <input
          type="text"
          value={isOpen ? searchTerm : selectedText}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
            setSearchTerm("");
          }}
          placeholder={isRTL ? "ابحث عن المالك..." : "Search for owner..."}
          disabled={isLoading}
          className={cn(
            "w-full h-11 pl-10 pr-4 rounded-lg",
            "bg-gray-900/50 border border-gray-700",
            "text-white placeholder:text-gray-500",
            "focus:outline-none focus:ring-2 focus:ring-awnash-primary/50 focus:border-awnash-primary",
            "transition-all duration-200"
          )}
        />
      </div>

      {isOpen && !isLoading && (
        <div className="absolute z-50 w-full mt-2 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
          {filteredOwners.length > 0 ? (
            filteredOwners.map((owner) => (
              <div
                key={owner.id}
                className={cn(
                  "px-4 py-3 cursor-pointer transition-colors",
                  "hover:bg-gray-700/50",
                  selectedOwnerId === owner.id && "bg-awnash-primary/10 border-l-2 border-awnash-primary"
                )}
                onClick={() => {
                  onSelect(owner.id);
                  setIsOpen(false);
                  setSearchTerm("");
                }}
              >
                <div className="font-medium text-white">{owner.fullName || "Unknown"}</div>
                {owner.email && (
                  <div className="text-xs text-gray-400 mt-0.5">{owner.email}</div>
                )}
              </div>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500">
              {isRTL ? "لا توجد نتائج" : "No results found"}
            </div>
          )}
        </div>
      )}

      {isLoading && (
        <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          {isRTL ? "جاري تحميل المالكين..." : "Loading owners..."}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Image Upload Component
// =============================================================================

interface ImageUploadProps {
  images: string[];
  onUpload: (files: FileList) => Promise<void>;
  onRemove: (index: number) => void;
  isUploading: boolean;
  isRTL: boolean;
}

function ImageUpload({ images, onUpload, onRemove, isUploading, isRTL }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        className={cn(
          "border-2 border-dashed border-gray-700 rounded-xl p-8 text-center",
          "bg-gray-900/30 hover:bg-gray-900/50 transition-colors cursor-pointer"
        )}
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => e.target.files && onUpload(e.target.files)}
          className="hidden"
        />
        <div className="flex flex-col items-center gap-3">
          {isUploading ? (
            <Loader2 className="h-10 w-10 text-awnash-primary animate-spin" />
          ) : (
            <div className="h-12 w-12 rounded-full bg-awnash-primary/10 flex items-center justify-center">
              <Upload className="h-6 w-6 text-awnash-primary" />
            </div>
          )}
          <div>
            <p className="text-white font-medium">
              {isUploading
                ? isRTL ? "جاري الرفع..." : "Uploading..."
                : isRTL ? "اختر الصور" : "Choose Images"}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {isRTL ? "PNG, JPG, GIF حتى 10MB" : "PNG, JPG, GIF up to 10MB"}
            </p>
          </div>
        </div>
      </div>

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {images.map((src, index) => (
            <div key={index} className="relative group aspect-square">
              <img
                src={src}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover rounded-lg border border-gray-700"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
              <button
                type="button"
                onClick={() => onRemove(index)}
                className={cn(
                  "absolute top-2 bg-red-500 hover:bg-red-600 text-white",
                  "rounded-full w-7 h-7 flex items-center justify-center",
                  "opacity-0 group-hover:opacity-100 transition-all",
                  "shadow-lg",
                  isRTL ? "left-2" : "right-2"
                )}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export const EquipmentFormModal: React.FC<EquipmentFormModalProps> = ({
  isOpen,
  onClose,
  isRTL = false,
  equipmentToEdit = null,
  isEditMode = false,
  onSuccess,
}) => {
  // Form State
  const [form, setForm] = useState<EquipmentFormData>({
    name: "",
    description: "",
    equipmentTypeId: "",
    city: "",
    status: "active",
    imageUrls: [],
    dailyRate: 0,
    ownerId: "",
    attributes: [],
  });
  const [attributeValues, setAttributeValues] = useState<Record<string, string>>({});

  // UI State
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Data State
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loadingOwners, setLoadingOwners] = useState(false);
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([]);
  const [loadingEquipmentTypes, setLoadingEquipmentTypes] = useState(false);

  const { user } = useAuth();
  const isSuperAdmin = user?.role === "super_admin";

  const selectedEquipmentType = equipmentTypes.find((t) => t.id === form.equipmentTypeId);
  const typeAttributes = selectedEquipmentType?.attributes || [];

  // ==========================================================================
  // Effects
  // ==========================================================================

  useEffect(() => {
    if (isEditMode && equipmentToEdit) {
      setForm({
        name: equipmentToEdit.name || "",
        description: equipmentToEdit.description || "",
        equipmentTypeId: equipmentToEdit.equipmentTypeId || "",
        city: equipmentToEdit.city || "",
        status: equipmentToEdit.status || "active",
        imageUrls: equipmentToEdit.imageUrls || [],
        dailyRate: parseFloat(equipmentToEdit.dailyRate || "0"),
        ownerId: equipmentToEdit.ownerId || user?.id || "",
        attributes: (equipmentToEdit as any).attributes || [],
      });
      setImagePreviews(equipmentToEdit.imageUrls || []);
      const existingAttributes = (equipmentToEdit as any).attributes || [];
      const attrValues: Record<string, string> = {};
      existingAttributes.forEach((attr: { typeAttributeId: string; value: string }) => {
        attrValues[attr.typeAttributeId] = attr.value;
      });
      setAttributeValues(attrValues);
    } else {
      setForm({
        name: "",
        description: "",
        equipmentTypeId: "",
        city: "",
        status: "active",
        imageUrls: [],
        dailyRate: 0,
        ownerId: user?.id || "",
        attributes: [],
      });
      setImagePreviews([]);
      setAttributeValues({});
    }
    setError("");
    setSuccess("");
  }, [isEditMode, equipmentToEdit, isOpen, user?.id]);

  useEffect(() => {
    async function loadOwners() {
      if (isSuperAdmin && isOpen) {
        setLoadingOwners(true);
        try {
          const response = await usersService.getAllUsers({ role: "owner" });
          setOwners(
            response.users.map((u) => ({
              id: u.id,
              fullName: u.fullName,
              email: u.email || "",
            }))
          );
        } catch (err) {
          console.error("Failed to load owners:", err);
        } finally {
          setLoadingOwners(false);
        }
      }
    }
    loadOwners();
  }, [isSuperAdmin, isOpen]);

  useEffect(() => {
    async function loadEquipmentTypes() {
      if (isOpen) {
        setLoadingEquipmentTypes(true);
        try {
          const response = await equipmentTypeService.getAll({ limit: 100 });
          setEquipmentTypes(response.data || []);
        } catch (err) {
          console.error("Failed to load equipment types:", err);
          setEquipmentTypes([]);
        } finally {
          setLoadingEquipmentTypes(false);
        }
      }
    }
    loadEquipmentTypes();
  }, [isOpen]);

  useEffect(() => {
    if (user?.id && !isEditMode && form.ownerId === "") {
      setForm((prev) => ({ ...prev, ownerId: user.id }));
    }
  }, [user?.id, isEditMode, form.ownerId]);

  useEffect(() => {
    const attributes = Object.entries(attributeValues)
      .filter(([_, value]) => value !== "")
      .map(([typeAttributeId, value]) => ({ typeAttributeId, value }));
    setForm((prev) => ({ ...prev, attributes }));
  }, [attributeValues]);

  useEffect(() => {
    if (error) setSuccess("");
  }, [error]);

  // ==========================================================================
  // Handlers
  // ==========================================================================

  function handleInputChange(field: keyof EquipmentFormData, value: any) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
    if (field === "equipmentTypeId") setAttributeValues({});
  }

  function handleAttributeChange(attributeId: string, value: string) {
    setAttributeValues((prev) => ({ ...prev, [attributeId]: value }));
    if (error) setError("");
  }

  async function handleImageUpload(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3007/api/v1"}/media/upload`,
      { method: "POST", credentials: "include", body: formData }
    );
    if (!response.ok) throw new Error("Failed to upload image");
    const data = await response.json();
    if (data.data?.url) return data.data.url;
    if (data.url) return data.url;
    if (data.data && typeof data.data === "string") return data.data;
    throw new Error("Invalid response structure from upload API");
  }

  async function handleImagesUpload(files: FileList) {
    try {
      setUploadingImages(true);
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const url = await handleImageUpload(files[i]);
        newUrls.push(url);
      }
      setForm((prev) => ({ ...prev, imageUrls: [...prev.imageUrls, ...newUrls] }));
      setImagePreviews((prev) => [...prev, ...newUrls]);
    } catch (err) {
      setError(isRTL ? "فشل في رفع الصور" : "Failed to upload images");
    } finally {
      setUploadingImages(false);
    }
  }

  async function handleRemoveImage(index: number) {
    const imageUrl = form.imageUrls[index];
    try {
      if (imageUrl.includes("/api/media/")) {
        const mediaId = imageUrl.split("/").pop();
        if (mediaId) {
          await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3007/api/v1"}/media/${mediaId}`,
            { method: "DELETE", credentials: "include" }
          );
        }
      }
      setForm((prev) => ({ ...prev, imageUrls: prev.imageUrls.filter((_, i) => i !== index) }));
      setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    } catch (err) {
      console.error("Error removing image:", err);
      setError(isRTL ? "فشل في حذف الصورة" : "Failed to remove image");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.name.trim()) {
      setError(isRTL ? "اسم المعدة مطلوب" : "Equipment name is required");
      return;
    }
    if (!form.ownerId) {
      setError(isRTL ? "يجب تحديد المالك" : "Owner is required");
      return;
    }
    if (!form.description.trim()) {
      setError(isRTL ? "وصف المعدة مطلوب" : "Equipment description is required");
      return;
    }
    if (!form.equipmentTypeId) {
      setError(isRTL ? "نوع المعدة مطلوب" : "Equipment type is required");
      return;
    }
    const requiredAttributes = typeAttributes.filter((attr) => attr.isRequired);
    for (const attr of requiredAttributes) {
      if (!attributeValues[attr.id]) {
        setError(isRTL ? `${attr.label} مطلوب` : `${attr.label} is required`);
        return;
      }
    }
    if (!form.city) {
      setError(isRTL ? "المدينة مطلوبة" : "City is required");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      if (isEditMode && equipmentToEdit) {
        await equipmentService.updateEquipment(equipmentToEdit.id, form);
        setSuccess(isRTL ? "تم تحديث المعدة بنجاح!" : "Equipment updated successfully!");
      } else {
        await equipmentService.createEquipment(form);
        setSuccess(isRTL ? "تم إضافة المعدة بنجاح!" : "Equipment added successfully!");
      }

      onSuccess?.();
      setTimeout(() => onClose(), 1500);
    } catch (err: any) {
      setError(
        err.message ||
          (isRTL
            ? isEditMode ? "حدث خطأ أثناء تحديث المعدة" : "حدث خطأ أثناء إضافة المعدة"
            : isEditMode ? "Error updating equipment" : "Error adding equipment")
      );
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    imagePreviews.forEach((preview) => {
      if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    });
    onClose();
  }

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-800 border-gray-700"
        dir={isRTL ? "rtl" : "ltr"}
      >
        {/* Header */}
        <DialogHeader className="border-b border-gray-700 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-awnash-primary/10 flex items-center justify-center">
              <Upload className="h-5 w-5 text-awnash-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-white">
                {isEditMode
                  ? isRTL ? "تعديل المعدة" : "Edit Equipment"
                  : isRTL ? "إضافة معدة جديدة" : "Add New Equipment"}
              </DialogTitle>
              <p className="text-sm text-gray-400 mt-0.5">
                {isRTL ? "أدخل تفاصيل المعدة أدناه" : "Enter the equipment details below"}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Alerts */}
        {error && <Alert type="error" message={error} />}
        {success && !error && <Alert type="success" message={success} />}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Owner (Super Admin Only) */}
          {isSuperAdmin && (
            <FormField label={isRTL ? "المالك" : "Owner"} required>
              <OwnerSearch
                owners={owners}
                selectedOwnerId={form.ownerId}
                onSelect={(id) => handleInputChange("ownerId", id)}
                isLoading={loadingOwners}
                isRTL={isRTL}
              />
            </FormField>
          )}

          {/* Equipment Name */}
          <FormField label={isRTL ? "اسم المعدة" : "Equipment Name"} required>
            <StyledInput
              value={form.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder={isRTL ? "أدخل اسم المعدة" : "Enter equipment name"}
            />
          </FormField>

          {/* Description */}
          <FormField label={isRTL ? "الوصف" : "Description"} required>
            <StyledTextarea
              value={form.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder={isRTL ? "أدخل وصف المعدة" : "Enter equipment description"}
              rows={3}
            />
          </FormField>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Equipment Type */}
            <FormField label={isRTL ? "نوع المعدة" : "Equipment Type"} required>
              <StyledSelect
                value={form.equipmentTypeId}
                onChange={(e) => handleInputChange("equipmentTypeId", e.target.value)}
              >
                <option value="">{isRTL ? "اختر نوع المعدة" : "Select equipment type"}</option>
                {loadingEquipmentTypes ? (
                  <option disabled>{isRTL ? "جاري التحميل..." : "Loading..."}</option>
                ) : (
                  equipmentTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {isRTL ? type.nameAr : type.nameEn}
                    </option>
                  ))
                )}
              </StyledSelect>
            </FormField>

            {/* Dynamic Attributes */}
            {typeAttributes.map((attribute) => (
              <FormField
                key={attribute.id}
                label={`${attribute.label}${attribute.unit ? ` (${attribute.unit})` : ""}`}
                required={attribute.isRequired}
              >
                <StyledSelect
                  value={attributeValues[attribute.id] || ""}
                  onChange={(e) => handleAttributeChange(attribute.id, e.target.value)}
                >
                  <option value="">{isRTL ? "اختر" : "Select"} {attribute.label}</option>
                  {attribute.options.map((option) => (
                    <option key={option.id || option.value} value={option.value}>
                      {option.value}
                    </option>
                  ))}
                </StyledSelect>
              </FormField>
            ))}

            {/* City */}
            <FormField label={isRTL ? "المدينة" : "City"} required className="md:col-start-1">
              <StyledSelect
                value={form.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
              >
                <option value="">{isRTL ? "اختر المدينة" : "Select city"}</option>
                {getCitiesForDropdown(isRTL).map((city) => (
                  <option key={city.value} value={city.value}>{city.label}</option>
                ))}
              </StyledSelect>
            </FormField>

            {/* Status */}
            <FormField label={isRTL ? "الحالة" : "Status"}>
              <StyledSelect
                value={form.status}
                onChange={(e) => handleInputChange("status", e.target.value)}
              >
                {getEquipmentStatusesForDropdown(isRTL).map((status) => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </StyledSelect>
            </FormField>
          </div>

          {/* Daily Rate */}
          <FormField
            label={isRTL ? "المعدل اليومي (ريال سعودي)" : "Daily Rate (SAR)"}
            hint={isRTL ? "بالريال السعودي (SAR)" : "In Saudi Riyals (SAR)"}
          >
            <StyledInput
              type="number"
              value={form.dailyRate}
              onChange={(e) => handleInputChange("dailyRate", parseFloat(e.target.value) || 0)}
              placeholder={isRTL ? "أدخل المعدل اليومي" : "Enter daily rate"}
              min="0"
              step="0.01"
            />
          </FormField>

          {/* Images */}
          <FormField label={isRTL ? "الصور" : "Images"}>
            <ImageUpload
              images={imagePreviews}
              onUpload={handleImagesUpload}
              onRemove={handleRemoveImage}
              isUploading={uploadingImages}
              isRTL={isRTL}
            />
          </FormField>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              {isRTL ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-awnash-primary hover:bg-awnash-primary-hover text-black font-medium"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isEditMode
                    ? isRTL ? "جاري التحديث..." : "Updating..."
                    : isRTL ? "جاري الإضافة..." : "Adding..."}
                </span>
              ) : isEditMode ? (
                isRTL ? "تحديث المعدة" : "Update Equipment"
              ) : isRTL ? (
                "إضافة المعدة"
              ) : (
                "Add Equipment"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
