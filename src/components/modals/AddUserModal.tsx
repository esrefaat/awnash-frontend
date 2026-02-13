"use client";

import React, { useState } from "react";
import { Loader2, AlertTriangle, UserPlus, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppTranslation } from "@/hooks/useAppTranslation";
import { usersService, User } from "@/services/usersService";

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

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserAdded: (user: User) => void;
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
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
    </div>
  )
);
StyledSelect.displayName = "StyledSelect";

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
        {required && <span className="text-awnash-primary ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose, onUserAdded }) => {
  const { t, isRTL } = useAppTranslation();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    mobileNumber: "",
    email: "",
    role: "requester",
    isActive: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      const user = await usersService.createUser({
        fullName: formData.fullName,
        mobileNumber: formData.mobileNumber,
        email: formData.email || undefined,
        role: formData.role,
        isActive: formData.isActive,
      });

      onUserAdded(user);
      setFormData({
        fullName: "",
        mobileNumber: "",
        email: "",
        role: "requester",
        isActive: true,
      });
      onClose();
    } catch (err: any) {
      console.error("Failed to create user:", err);
      setError(err.message || (isRTL ? "فشل في إنشاء المستخدم" : "Failed to create user"));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    if (field === "isActive") {
      setFormData((prev) => ({ ...prev, isActive: value === "true" }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
    if (error) setError("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-md max-h-[90vh] overflow-y-auto bg-muted border-border"
        dir={isRTL ? "rtl" : "ltr"}
      >
        {/* Header */}
        <DialogHeader className="border-b border-border pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <UserPlus className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-foreground">
                {t("users.addNewUser") || "Add New User"}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                {isRTL ? "أدخل بيانات المستخدم الجديد" : "Enter new user details"}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-xl flex items-start gap-3 bg-red-500/10 border border-red-500/20">
            <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-red-300">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <FormField label={t("full_name") || "Full Name"} required>
            <StyledInput
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
              placeholder={isRTL ? "أدخل الاسم الكامل" : "Enter full name"}
            />
          </FormField>

          {/* Mobile Number */}
          <FormField label={t("common.phone") || "Mobile Number"} required>
            <StyledInput
              type="tel"
              required
              value={formData.mobileNumber}
              onChange={(e) => handleChange("mobileNumber", e.target.value)}
              placeholder={isRTL ? "أدخل رقم الجوال" : "Enter mobile number"}
            />
          </FormField>

          {/* Email */}
          <FormField label={t("common.email") || "Email"}>
            <StyledInput
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder={isRTL ? "أدخل البريد الإلكتروني" : "Enter email (optional)"}
            />
          </FormField>

          {/* Role */}
          <FormField label={t("users.role") || "Role"} required>
            <StyledSelect
              value={formData.role}
              onChange={(e) => handleChange("role", e.target.value)}
            >
              <option value="requester">{isRTL ? "طالب" : "Requester"}</option>
              <option value="owner">{isRTL ? "مالك" : "Owner"}</option>
              <option value="hybrid">{isRTL ? "هجين" : "Hybrid"}</option>
            </StyledSelect>
          </FormField>

          {/* Status */}
          <FormField label={t("common.status") || "Status"} required>
            <StyledSelect
              value={formData.isActive ? "active" : "inactive"}
              onChange={(e) =>
                handleChange("isActive", e.target.value === "active" ? "true" : "false")
              }
            >
              <option value="active">{isRTL ? "نشط" : "Active"}</option>
              <option value="inactive">{isRTL ? "غير نشط" : "Inactive"}</option>
            </StyledSelect>
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
              {t("common.cancel") || "Cancel"}
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-awnash-primary hover:bg-awnash-primary-hover text-black font-medium"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("common.creating") || "Creating..."}
                </span>
              ) : (
                t("users.createUser") || "Create User"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserModal;
