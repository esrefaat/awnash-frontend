"use client";

import React, { useState, useEffect } from "react";
import { Loader2, AlertTriangle, CheckCircle2, DollarSign, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Autocomplete } from "@/components/ui/Autocomplete";

// =============================================================================
// Types
// =============================================================================

interface OfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string;
  equipmentId?: string;
  equipmentType?: string;
  onOfferSuccess?: () => void;
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
      <label className="block text-sm font-medium text-gray-300 mb-2">
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

export const OfferModal: React.FC<OfferModalProps> = ({
  isOpen,
  onClose,
  requestId,
  equipmentId,
  equipmentType,
  onOfferSuccess,
}) => {
  const [form, setForm] = useState({
    equipmentName: "",
    dailyRate: "",
    currency: "SAR",
    price: "",
    expiresAt: "",
    notes: "",
  });
  const [selectedEquipment, setSelectedEquipment] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm({
        equipmentName: "",
        dailyRate: "",
        currency: "SAR",
        price: "",
        expiresAt: "",
        notes: "",
      });
      setSelectedEquipment(null);
      setError("");
      setSuccess(false);
      setLoading(false);
    }
  }, [isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEquipmentSelect = (equipment: any) => {
    setSelectedEquipment(equipment);
    if (equipment) {
      setForm((prev) => ({
        ...prev,
        equipmentName: equipment.name || equipment.title || "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!form.dailyRate || !form.price || !form.expiresAt) {
      setError("Please fill all required fields.");
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        requestId: requestId,
        dailyRate: parseFloat(form.dailyRate),
        currency: form.currency,
        price: parseFloat(form.price),
        expiresAt: form.expiresAt,
        notes: form.notes,
      };

      if (selectedEquipment?.id) {
        payload.equipmentId = selectedEquipment.id;
      } else if (equipmentId) {
        payload.equipmentId = equipmentId;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3007/v1"}/offers`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Failed to submit offer");
      setSuccess(true);
      onOfferSuccess?.();
      setTimeout(() => onClose(), 1500);
    } catch (err: any) {
      setError(err.message || "Failed to submit offer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-gray-800 border-gray-700">
        {/* Header */}
        <DialogHeader className="border-b border-gray-700 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-white">
                Submit Offer
              </DialogTitle>
              <p className="text-sm text-gray-400 mt-0.5">
                Enter your offer details
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Alerts */}
        {error && <Alert type="error" message={error} />}
        {success && <Alert type="success" message="Offer submitted successfully!" />}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Equipment Search */}
          <FormField label="Equipment Name" required={!equipmentId}>
            <Autocomplete
              value={form.equipmentName}
              onChange={(value) => setForm((prev) => ({ ...prev, equipmentName: value }))}
              onSelect={handleEquipmentSelect}
              placeholder="Search for equipment..."
              disabled={!!equipmentId}
              equipmentType={equipmentType}
            />
          </FormField>

          {/* Daily Rate & Currency */}
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Daily Rate" required className="col-span-2">
              <StyledInput
                name="dailyRate"
                type="number"
                value={form.dailyRate}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </FormField>
            <FormField label="Currency">
              <StyledSelect name="currency" value={form.currency} onChange={handleChange}>
                <option value="SAR">SAR</option>
                <option value="USD">USD</option>
              </StyledSelect>
            </FormField>
          </div>

          {/* Total Price */}
          <FormField label="Total Price" required>
            <StyledInput
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </FormField>

          {/* Expires At */}
          <FormField label="Expires At" required>
            <StyledInput
              name="expiresAt"
              type="datetime-local"
              value={form.expiresAt}
              onChange={handleChange}
            />
          </FormField>

          {/* Notes */}
          <FormField label="Notes">
            <StyledTextarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Add any additional notes..."
            />
          </FormField>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-awnash-primary hover:bg-awnash-primary-hover text-black font-medium"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </span>
              ) : (
                "Submit Offer"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
