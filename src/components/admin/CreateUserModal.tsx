"use client";

import React, { useState } from "react";
import { Loader2, UserPlus, ChevronDown, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

// =============================================================================
// Types
// =============================================================================

interface User {
  id: string;
  fullName: string;
  mobileNumber: string;
  email?: string;
  role: string;
  roles: string[];
  permissions: string[];
  permissionsOverride?: Record<string, boolean>;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  city?: string;
  lastLogin?: string;
}

interface CreateUserForm {
  fullName: string;
  mobileNumber: string;
  email: string;
  password: string;
  role: string;
  city: string;
  isActive: boolean;
  sendInvite: boolean;
}

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
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
          "bg-[#1a1f2e] border border-gray-700",
          "text-white",
          "focus:outline-none focus:ring-2 focus:ring-awnash-primary/50 focus:border-awnash-primary",
          "transition-all duration-200",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="absolute end-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
    </div>
  )
);
StyledSelect.displayName = "StyledSelect";

// =============================================================================
// Section Component
// =============================================================================

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
        {title}
      </h3>
      {children}
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
  error?: string;
  className?: string;
}

function FormField({ label, required, children, error, className }: FormFieldProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {label}
        {required && <span className="text-red-400 ms-1">*</span>}
      </label>
      {children}
      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </div>
  );
}

// =============================================================================
// Toggle Switch Component
// =============================================================================

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description: string;
}

function ToggleSwitch({ checked, onChange, label, description }: ToggleSwitchProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl border border-gray-700">
      <div>
        <p className="text-gray-300 font-medium">{label}</p>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div
          className={cn(
            "relative w-11 h-6 rounded-full transition-colors",
            "bg-gray-600 peer-checked:bg-awnash-primary",
            "after:content-[''] after:absolute after:top-[2px] after:left-[2px]",
            "after:bg-white after:border-gray-300 after:border after:rounded-full",
            "after:h-5 after:w-5 after:transition-all",
            "peer-checked:after:translate-x-full peer-checked:after:border-white"
          )}
        />
      </label>
    </div>
  );
}

// =============================================================================
// Constants
// =============================================================================

const roleOptions = [
  { value: "super_admin", label: "Super Admin", permissions: 35 },
  { value: "booking_admin", label: "Booking Admin", permissions: 15 },
  { value: "content_admin", label: "Content Admin", permissions: 12 },
  { value: "support_agent", label: "Support Agent", permissions: 8 },
  { value: "owner", label: "Equipment Owner", permissions: 9 },
  { value: "renter", label: "Renter", permissions: 7 },
  { value: "hybrid", label: "Hybrid User", permissions: 16 },
];

const roleColors: Record<string, string> = {
  super_admin: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  booking_admin: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  content_admin: "bg-green-500/10 text-green-400 border-green-500/20",
  support_agent: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  owner: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  renter: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  hybrid: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
};

// =============================================================================
// Main Component
// =============================================================================

const CreateUserModal: React.FC<CreateUserModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [form, setForm] = useState<CreateUserForm>({
    fullName: "",
    mobileNumber: "",
    email: "",
    password: "",
    role: "support_agent",
    city: "",
    isActive: true,
    sendInvite: false,
  });

  const [errors, setErrors] = useState<Partial<CreateUserForm>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateUserForm> = {};

    if (!form.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!form.mobileNumber.trim()) {
      newErrors.mobileNumber = "Mobile number is required";
    } else if (!/^\+[1-9]\d{1,14}$/.test(form.mobileNumber)) {
      newErrors.mobileNumber = "Please enter a valid mobile number with country code (e.g., +966501234567)";
    }

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!form.sendInvite && !form.password.trim()) {
      newErrors.password = "Password is required when not sending invite";
    } else if (!form.sendInvite && form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getPermissionsForRole = (role: string): string[] => {
    const permissionMap: Record<string, string[]> = {
      super_admin: [
        "system:configure", "roles:manage", "user:create", "user:read", "user:update", "user:delete",
        "booking:create", "booking:read", "booking:update", "booking:delete", "booking:approve",
        "equipment:create", "equipment:read", "equipment:update", "equipment:delete", "equipment:approve",
        "payment:create", "payment:read", "payment:update", "payment:refund",
        "article:create", "article:read", "article:update", "article:delete", "article:publish",
        "dashboard:view", "analytics:view", "audit:view", "reports:generate",
      ],
      booking_admin: [
        "booking:create", "booking:read", "booking:update", "booking:approve",
        "payment:read", "payment:update", "user:read", "equipment:read",
        "dashboard:view", "analytics:view",
      ],
      content_admin: [
        "equipment:create", "equipment:read", "equipment:update",
        "article:create", "article:read", "article:update", "article:publish",
        "user:read", "dashboard:view",
      ],
      support_agent: [
        "user:read", "booking:read", "equipment:read", "payment:read",
        "article:read", "dashboard:view",
      ],
      owner: [
        "equipment:create", "equipment:read", "equipment:update",
        "booking:read", "booking:update", "payment:read", "dashboard:view",
      ],
      renter: [
        "booking:create", "booking:read", "equipment:read",
        "payment:create", "payment:read", "dashboard:view",
      ],
      hybrid: [
        "equipment:create", "equipment:read", "equipment:update",
        "booking:create", "booking:read", "booking:update",
        "payment:create", "payment:read", "dashboard:view",
      ],
    };
    return permissionMap[role] || [];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const newUser: User = {
        id: Date.now().toString(),
        fullName: form.fullName,
        mobileNumber: form.mobileNumber,
        email: form.email || undefined,
        role: form.role,
        roles: [form.role],
        permissions: getPermissionsForRole(form.role),
        isVerified: !form.sendInvite,
        isActive: form.isActive,
        city: form.city || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      onSuccess(newUser);
      resetForm();
    } catch (error) {
      console.error("Failed to create user:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({
      fullName: "",
      mobileNumber: "",
      email: "",
      password: "",
      role: "support_agent",
      city: "",
      isActive: true,
      sendInvite: false,
    });
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const selectedRole = roleOptions.find((role) => role.value === form.role);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-800 border-gray-700">
        {/* Header */}
        <DialogHeader className="border-b border-gray-700 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <UserPlus className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-white">
                Create New User
              </DialogTitle>
              <p className="text-sm text-gray-400 mt-0.5">
                Add a new user to the system
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Section title="Basic Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Full Name" required error={errors.fullName}>
                <StyledInput
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
                  placeholder="Enter full name"
                />
              </FormField>

              <FormField label="Mobile Number" required error={errors.mobileNumber}>
                <StyledInput
                  type="tel"
                  value={form.mobileNumber}
                  onChange={(e) => setForm((prev) => ({ ...prev, mobileNumber: e.target.value }))}
                  placeholder="+966501234567"
                />
              </FormField>

              <FormField label="Email Address" error={errors.email}>
                <StyledInput
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="user@awnash.net"
                />
              </FormField>

              <FormField label="City">
                <StyledInput
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
                  placeholder="Riyadh, Jeddah, etc."
                />
              </FormField>
            </div>
          </Section>

          {/* Role & Permissions */}
          <Section title="Role & Permissions">
            <FormField label="User Role" required>
              <StyledSelect
                value={form.role}
                onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
              >
                {roleOptions.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label} ({role.permissions} permissions)
                  </option>
                ))}
              </StyledSelect>
            </FormField>

            {selectedRole && (
              <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <Badge className={cn("rounded-full px-3 py-1 border", roleColors[form.role])}>
                    {selectedRole.label}
                  </Badge>
                  <span className="text-sm text-gray-400">
                    {selectedRole.permissions} permissions included
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  This role will automatically grant the appropriate permissions.
                  You can customize individual permissions after creating the user.
                </p>
              </div>
            )}
          </Section>

          {/* Authentication */}
          <Section title="Authentication">
            <ToggleSwitch
              checked={form.sendInvite}
              onChange={(checked) =>
                setForm((prev) => ({
                  ...prev,
                  sendInvite: checked,
                  password: checked ? "" : prev.password,
                }))
              }
              label="Send Invitation Email/SMS"
              description="User will receive an invitation to set their own password"
            />

            {!form.sendInvite && (
              <FormField label="Temporary Password" required error={errors.password}>
                <StyledInput
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter temporary password"
                />
                <p className="text-sm text-gray-500 mt-1">
                  User will be prompted to change this password on first login
                </p>
              </FormField>
            )}
          </Section>

          {/* Account Status */}
          <Section title="Account Status">
            <ToggleSwitch
              checked={form.isActive}
              onChange={(checked) => setForm((prev) => ({ ...prev, isActive: checked }))}
              label="Account Active"
              description="User can login and access the dashboard"
            />
          </Section>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-awnash-primary hover:bg-awnash-primary-hover text-black font-medium"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating User...
                </span>
              ) : form.sendInvite ? (
                "Create & Send Invite"
              ) : (
                "Create User"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserModal;
