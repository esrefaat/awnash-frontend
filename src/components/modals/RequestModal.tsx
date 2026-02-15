"use client";

import React, { useState } from "react";
import {
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Upload,
  X,
  MapPin,
  ChevronDown,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { LocationPicker } from "@/components/LocationPicker";

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

export interface RequestFormValues {
  equipmentType: string;
  status: "open" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  images: string[];
  startDate: string;
  endDate: string;
  maxBudget: number;
  city: string;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  locationAddress: string | null;
  notes: string;
}

interface RequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RequestFormValues) => Promise<void>;
  loading?: boolean;
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
        "bg-background/50 border border-border",
        "text-foreground placeholder:text-muted-foreground",
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
        "bg-background/50 border border-border",
        "text-foreground placeholder:text-muted-foreground",
        "focus:outline-none focus:ring-2 focus:ring-awnash-primary/50 focus:border-awnash-primary",
        "transition-all duration-200",
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
          "w-full h-11 px-4 pe-10 rounded-lg appearance-none cursor-pointer",
          "bg-card border border-border",
          "text-foreground",
          "focus:outline-none focus:ring-2 focus:ring-awnash-primary/50 focus:border-awnash-primary",
          "transition-all duration-200",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="absolute end-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
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
  className?: string;
}

function FormField({ label, required, children, className }: FormFieldProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-muted-foreground mb-2">
        {label}
        {required && <span className="text-awnash-primary ms-1">*</span>}
      </label>
      {children}
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export const RequestModal: React.FC<RequestModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const [form, setForm] = useState<RequestFormValues>({
    equipmentType: "",
    status: "open",
    priority: "medium",
    images: [],
    startDate: "",
    endDate: "",
    maxBudget: 0,
    city: "",
    location: null,
    latitude: null,
    longitude: null,
    locationAddress: null,
    notes: "",
  });

  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploadingImages, setUploadingImages] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "maxBudget" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    setSelectedLocation(location);
    setForm((prev) => ({
      ...prev,
      latitude: location.lat,
      longitude: location.lng,
      location: `${location.lat},${location.lng}`,
      locationAddress: location.address,
    }));
    setShowLocationPicker(false);
  };

  const clearLocation = () => {
    setSelectedLocation(null);
    setForm((prev) => ({
      ...prev,
      latitude: null,
      longitude: null,
      location: null,
      locationAddress: null,
    }));
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("context", "request");
    formData.append("contextId", crypto.randomUUID());

    const headers: Record<string, string> = {};
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3007/v1"}/media/upload`,
      { method: "POST", credentials: "include", headers, body: formData }
    );

    if (!response.ok) throw new Error("Failed to upload image");

    const result = await response.json();
    if (result.data?.url) return result.data.url;
    if (result.url) return result.url;
    if (result.data && typeof result.data === "string") return result.data;
    throw new Error("Invalid response structure");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploadingImages(true);
    setError("");

    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const url = await uploadImage(files[i]);
        newUrls.push(url);
      }

      setImageUrls((prev) => [...prev, ...newUrls]);
      setForm((prev) => ({ ...prev, images: [...prev.images, ...newUrls] }));
    } catch (err: any) {
      setError(err.message || (isRTL ? "حدث خطأ أثناء رفع الصور" : "Error uploading images"));
    } finally {
      setUploadingImages(false);
      if (e.target) e.target.value = "";
    }
  };

  const removeImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await onSubmit(form);
      setSuccess(isRTL ? "تم إرسال الطلب بنجاح!" : "Request submitted successfully!");
      setTimeout(() => {
        onClose();
        // Reset form
        setForm({
          equipmentType: "",
          status: "open",
          priority: "medium",
          images: [],
          startDate: "",
          endDate: "",
          maxBudget: 0,
          city: "",
          location: null,
          latitude: null,
          longitude: null,
          locationAddress: null,
          notes: "",
        });
        setImageUrls([]);
        setSuccess("");
      }, 1500);
    } catch (err: any) {
      setError(err.message || (isRTL ? "حدث خطأ أثناء إرسال الطلب" : "Error submitting request"));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto bg-muted border-border"
        dir={isRTL ? "rtl" : "ltr"}
      >
        {/* Header */}
        <DialogHeader className="border-b border-border pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-foreground">
                {isRTL ? "طلب استئجار جديد" : "New Rental Request"}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                {isRTL ? "أدخل تفاصيل الطلب" : "Enter request details"}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Alerts */}
        {error && <Alert type="error" message={error} />}
        {success && <Alert type="success" message={success} />}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Equipment Type */}
            <FormField label={isRTL ? "نوع المعدة" : "Equipment Type"} required>
              <StyledSelect
                name="equipmentType"
                value={form.equipmentType}
                onChange={handleFormChange}
              >
                <option value="">{isRTL ? "اختر نوع المعدة" : "Select Equipment Type"}</option>
                <option value="excavator">{isRTL ? "حفار" : "Excavator"}</option>
                <option value="crane">{isRTL ? "رافعة" : "Crane"}</option>
                <option value="bulldozer">{isRTL ? "جرافة" : "Bulldozer"}</option>
                <option value="loader">{isRTL ? "محمل" : "Loader"}</option>
                <option value="truck">{isRTL ? "شاحنة" : "Truck"}</option>
              </StyledSelect>
            </FormField>

            {/* Priority */}
            <FormField label={isRTL ? "الأولوية" : "Priority"} required>
              <StyledSelect name="priority" value={form.priority} onChange={handleFormChange}>
                <option value="low">{isRTL ? "منخفضة" : "Low"}</option>
                <option value="medium">{isRTL ? "متوسطة" : "Medium"}</option>
                <option value="high">{isRTL ? "عالية" : "High"}</option>
                <option value="urgent">{isRTL ? "عاجلة" : "Urgent"}</option>
              </StyledSelect>
            </FormField>

            {/* Start Date */}
            <FormField label={isRTL ? "تاريخ البداية" : "Start Date"} required>
              <StyledInput
                name="startDate"
                type="datetime-local"
                value={form.startDate}
                onChange={handleFormChange}
              />
            </FormField>

            {/* End Date */}
            <FormField label={isRTL ? "تاريخ النهاية" : "End Date"} required>
              <StyledInput
                name="endDate"
                type="datetime-local"
                value={form.endDate}
                onChange={handleFormChange}
              />
            </FormField>

            {/* City */}
            <FormField label={isRTL ? "المدينة" : "City"} required>
              <StyledInput
                name="city"
                value={form.city}
                onChange={handleFormChange}
                placeholder={isRTL ? "مثال: الرياض" : "e.g., Riyadh"}
              />
            </FormField>

            {/* Location Picker */}
            <FormField label={isRTL ? "الموقع الدقيق" : "Exact Location"}>
              <div className="space-y-2">
                {selectedLocation ? (
                  <div className="p-3 bg-background/50 border border-border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-muted-foreground truncate">{selectedLocation.address}</p>
                        <p className="text-xs text-gray-500">
                          {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={clearLocation}
                        className="ms-2 p-1 text-red-400 hover:text-red-300"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-border rounded-lg p-4 bg-background/30 text-center">
                    <p className="text-sm text-gray-500">
                      {isRTL ? "لم يتم تحديد موقع بعد" : "No location selected"}
                    </p>
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowLocationPicker(true)}
                  className="w-full border-border text-muted-foreground hover:bg-muted"
                >
                  <MapPin className="h-4 w-4 me-2" />
                  {isRTL ? "اختر موقع من الخريطة" : "Pick Location from Map"}
                </Button>
              </div>
            </FormField>

            {/* Max Budget */}
            <FormField label={isRTL ? "الميزانية القصوى (ريال)" : "Max Budget (SAR)"} required>
              <StyledInput
                name="maxBudget"
                type="number"
                value={form.maxBudget}
                onChange={handleFormChange}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </FormField>
          </div>

          {/* Images Upload */}
          <FormField label={isRTL ? "الصور (اختياري)" : "Images (Optional)"}>
            <div
              className={cn(
                "border-2 border-dashed border-border rounded-xl p-6 text-center",
                "bg-background/30 hover:bg-background/50 transition-colors cursor-pointer"
              )}
              onClick={() =>
                !uploadingImages && document.getElementById("request-images")?.click()
              }
            >
              <input
                id="request-images"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploadingImages}
              />
              <div className="flex flex-col items-center gap-2">
                {uploadingImages ? (
                  <Loader2 className="h-8 w-8 text-awnash-primary animate-spin" />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <Upload className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  {uploadingImages
                    ? isRTL
                      ? "جاري رفع الصور..."
                      : "Uploading images..."
                    : isRTL
                      ? "انقر لرفع الصور"
                      : "Click to upload images"}
                </p>
              </div>
            </div>

            {/* Image Previews */}
            {imageUrls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                {imageUrls.map((url, index) => (
                  <div key={index} className="relative group aspect-square">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg border border-border"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className={cn(
                        "absolute top-2 bg-red-500 hover:bg-red-600 text-foreground",
                        "rounded-full w-6 h-6 flex items-center justify-center",
                        "opacity-0 group-hover:opacity-100 transition-all",
                        isRTL ? "left-2" : "right-2"
                      )}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </FormField>

          {/* Notes */}
          <FormField label={isRTL ? "ملاحظات إضافية" : "Additional Notes"}>
            <StyledTextarea
              name="notes"
              value={form.notes}
              onChange={handleFormChange}
              placeholder={
                isRTL
                  ? "أضف أي تفاصيل إضافية حول الطلب..."
                  : "Add any additional details about the request..."
              }
              rows={3}
            />
          </FormField>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="border-border text-muted-foreground hover:bg-muted hover:text-foreground"
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
                  {isRTL ? "جاري الإرسال..." : "Submitting..."}
                </span>
              ) : isRTL ? (
                "إرسال الطلب"
              ) : (
                "Submit Request"
              )}
            </Button>
          </div>
        </form>

        {/* Location Picker Modal */}
        <LocationPicker
          isOpen={showLocationPicker}
          onClose={() => setShowLocationPicker(false)}
          onLocationSelect={handleLocationSelect}
          initialLocation={selectedLocation}
          isRTL={isRTL}
        />
      </DialogContent>
    </Dialog>
  );
};
