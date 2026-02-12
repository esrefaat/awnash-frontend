"use client";

import React, { useState, useEffect } from "react";
import { Shield, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";

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

interface PermissionsMatrixModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onSave: (permissions: Record<string, boolean>) => void;
}

interface PermissionModule {
  name: string;
  label: string;
  permissions: {
    action: string;
    label: string;
    description: string;
  }[];
}

// =============================================================================
// Permission Modules Data
// =============================================================================

const permissionModules: PermissionModule[] = [
  {
    name: "system",
    label: "System Management",
    permissions: [
      { action: "configure", label: "Configure", description: "System configuration and settings" },
      { action: "backup", label: "Backup", description: "System backup operations" },
      { action: "restore", label: "Restore", description: "System restore operations" },
    ],
  },
  {
    name: "roles",
    label: "Role Management",
    permissions: [
      { action: "manage", label: "Manage", description: "Create, edit, and delete roles" },
      { action: "assign", label: "Assign", description: "Assign roles to users" },
    ],
  },
  {
    name: "user",
    label: "User Management",
    permissions: [
      { action: "create", label: "Create", description: "Create new users" },
      { action: "read", label: "View", description: "View user information" },
      { action: "update", label: "Edit", description: "Edit user information" },
      { action: "delete", label: "Delete", description: "Delete users" },
      { action: "verify", label: "Verify", description: "Verify user accounts" },
      { action: "list", label: "List", description: "List all users" },
    ],
  },
  {
    name: "booking",
    label: "Booking Management",
    permissions: [
      { action: "create", label: "Create", description: "Create new bookings" },
      { action: "read", label: "View", description: "View booking details" },
      { action: "update", label: "Edit", description: "Edit booking information" },
      { action: "delete", label: "Delete", description: "Cancel/delete bookings" },
      { action: "approve", label: "Approve", description: "Approve booking requests" },
      { action: "list", label: "List", description: "List all bookings" },
    ],
  },
  {
    name: "equipment",
    label: "Equipment Management",
    permissions: [
      { action: "create", label: "Create", description: "Add new equipment" },
      { action: "read", label: "View", description: "View equipment details" },
      { action: "update", label: "Edit", description: "Edit equipment information" },
      { action: "delete", label: "Delete", description: "Remove equipment" },
      { action: "approve", label: "Approve", description: "Approve equipment listings" },
      { action: "list", label: "List", description: "List all equipment" },
    ],
  },
  {
    name: "payment",
    label: "Payment Management",
    permissions: [
      { action: "create", label: "Create", description: "Process payments" },
      { action: "read", label: "View", description: "View payment information" },
      { action: "update", label: "Edit", description: "Edit payment details" },
      { action: "refund", label: "Refund", description: "Process refunds" },
      { action: "list", label: "List", description: "List all payments" },
    ],
  },
  {
    name: "article",
    label: "Article Management",
    permissions: [
      { action: "create", label: "Create", description: "Create new articles" },
      { action: "read", label: "View", description: "View article information" },
      { action: "update", label: "Edit", description: "Update article content" },
      { action: "delete", label: "Delete", description: "Delete articles" },
      { action: "publish", label: "Publish", description: "Publish articles" },
      { action: "approve", label: "Approve", description: "Approve articles for publication" },
      { action: "schedule", label: "Schedule", description: "Schedule articles for future publishing" },
      { action: "list", label: "List", description: "List all articles" },
    ],
  },
  {
    name: "analytics",
    label: "Analytics & Reports",
    permissions: [
      { action: "view", label: "View", description: "View analytics dashboards" },
      { action: "export", label: "Export", description: "Export analytics data" },
    ],
  },
  {
    name: "dashboard",
    label: "Dashboard Access",
    permissions: [{ action: "view", label: "View", description: "Access main dashboard" }],
  },
  {
    name: "audit",
    label: "Audit & Logs",
    permissions: [{ action: "view", label: "View", description: "View audit logs and system activity" }],
  },
  {
    name: "reports",
    label: "Report Generation",
    permissions: [{ action: "generate", label: "Generate", description: "Generate and download reports" }],
  },
];

// =============================================================================
// Toggle Component
// =============================================================================

interface ToggleProps {
  checked: boolean;
  onChange: () => void;
  status: "inherited" | "granted" | "denied" | "none";
}

function Toggle({ checked, onChange, status }: ToggleProps) {
  const bgColor =
    status === "inherited"
      ? "peer-checked:bg-blue-500"
      : status === "granted"
        ? "peer-checked:bg-green-500"
        : status === "denied"
          ? "peer-checked:bg-red-500"
          : "peer-checked:bg-awnash-accent";

  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only peer"
      />
      <div
        className={cn(
          "relative w-11 h-6 rounded-full transition-colors",
          "bg-gray-600",
          bgColor,
          "after:content-[''] after:absolute after:top-[2px] after:left-[2px]",
          "after:bg-white after:border-gray-300 after:border after:rounded-full",
          "after:h-5 after:w-5 after:transition-all",
          "peer-checked:after:translate-x-full peer-checked:after:border-white"
        )}
      />
    </label>
  );
}

// =============================================================================
// Module Card Component
// =============================================================================

interface ModuleCardProps {
  module: PermissionModule;
  grantedCount: number;
  overriddenCount: number;
  onClick: () => void;
}

function ModuleCard({ module, grantedCount, overriddenCount, onClick }: ModuleCardProps) {
  const total = module.permissions.length;
  const percentage = (grantedCount / total) * 100;

  return (
    <div
      onClick={onClick}
      className={cn(
        "p-4 bg-gray-900/50 border border-gray-700 rounded-xl cursor-pointer",
        "hover:border-awnash-accent transition-colors"
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-white">{module.label}</h3>
        <Badge variant="outline" className="border-gray-600 text-gray-400 text-xs">
          {grantedCount}/{total}
        </Badge>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Granted:</span>
          <span className="text-green-400">{grantedCount}</span>
        </div>
        {overriddenCount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Overridden:</span>
            <span className="text-awnash-primary">{overriddenCount}</span>
          </div>
        )}
      </div>

      <div className="mt-3 w-full bg-gray-700 rounded-full h-2">
        <div
          className="bg-awnash-accent h-2 rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

const PermissionsMatrixModal: React.FC<PermissionsMatrixModalProps> = ({
  user,
  isOpen,
  onClose,
  onSave,
}) => {
  const [customPermissions, setCustomPermissions] = useState<Record<string, boolean>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (user.permissionsOverride) {
      setCustomPermissions(user.permissionsOverride);
    } else {
      const rolePermissions: Record<string, boolean> = {};
      (user.permissions || []).forEach((permission) => {
        rolePermissions[permission] = true;
      });
      setCustomPermissions(rolePermissions);
    }
  }, [user]);

  const getPermissionKey = (module: string, action: string) => `${module}:${action}`;

  const isPermissionGranted = (module: string, action: string): boolean => {
    const key = getPermissionKey(module, action);
    return customPermissions[key] === true;
  };

  const isPermissionInherited = (module: string, action: string): boolean => {
    const key = getPermissionKey(module, action);
    return (user.permissions || []).includes(key);
  };

  const isPermissionOverridden = (module: string, action: string): boolean => {
    return isPermissionInherited(module, action) !== isPermissionGranted(module, action);
  };

  const getPermissionStatus = (
    module: string,
    action: string
  ): "inherited" | "granted" | "denied" | "none" => {
    const isInherited = isPermissionInherited(module, action);
    const isGranted = isPermissionGranted(module, action);

    if (isInherited && isGranted) return "inherited";
    if (!isInherited && isGranted) return "granted";
    if (isInherited && !isGranted) return "denied";
    return "none";
  };

  const togglePermission = (module: string, action: string) => {
    const key = getPermissionKey(module, action);
    setCustomPermissions((prev) => ({
      ...prev,
      [key]: !isPermissionGranted(module, action),
    }));
    setHasChanges(true);
  };

  const resetToRoleDefaults = () => {
    const rolePermissions: Record<string, boolean> = {};
    (user.permissions || []).forEach((permission) => {
      rolePermissions[permission] = true;
    });
    setCustomPermissions(rolePermissions);
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave(customPermissions);
    setHasChanges(false);
  };

  const handleClose = () => {
    if (hasChanges) {
      if (window.confirm("You have unsaved changes. Are you sure you want to close?")) {
        onClose();
        setHasChanges(false);
      }
    } else {
      onClose();
    }
  };

  const getTotalGrantedPermissions = () => Object.values(customPermissions).filter(Boolean).length;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden bg-gray-800 border-gray-700 flex flex-col">
        {/* Header */}
        <DialogHeader className="border-b border-gray-700 pb-4 mb-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold text-white">
                  Permissions Matrix
                </DialogTitle>
                <p className="text-sm text-gray-400 mt-0.5">
                  Managing permissions for {user.fullName} ({user.role})
                </p>
              </div>
            </div>
            <div className="text-end">
              <p className="text-sm text-gray-400">Total Permissions</p>
              <p className="text-2xl font-bold text-awnash-primary">
                {getTotalGrantedPermissions()}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid grid-cols-4 lg:grid-cols-6 gap-2 bg-gray-900/50 p-1 rounded-xl mb-4 flex-shrink-0">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-awnash-accent data-[state=active]:text-white text-gray-400"
            >
              Overview
            </TabsTrigger>
            {permissionModules.slice(0, 5).map((module) => (
              <TabsTrigger
                key={module.name}
                value={module.name}
                className="data-[state=active]:bg-awnash-accent data-[state=active]:text-white text-gray-400 text-xs"
              >
                {module.label.split(" ")[0]}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="overflow-y-auto flex-1 space-y-6 pe-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {permissionModules.map((module) => {
                const grantedCount = module.permissions.filter((p) =>
                  isPermissionGranted(module.name, p.action)
                ).length;
                const overriddenCount = module.permissions.filter((p) =>
                  isPermissionOverridden(module.name, p.action)
                ).length;

                return (
                  <ModuleCard
                    key={module.name}
                    module={module}
                    grantedCount={grantedCount}
                    overriddenCount={overriddenCount}
                    onClick={() => setActiveTab(module.name)}
                  />
                );
              })}
            </div>

            <div className="p-4 bg-gray-900/50 border border-gray-700 rounded-xl">
              <h3 className="font-semibold text-white mb-3">Role Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Current Role:</span>
                  <p className="text-white font-medium capitalize">
                    {user.role.replace("_", " ")}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Default Permissions:</span>
                  <p className="text-white font-medium">{user.permissions?.length || 0}</p>
                </div>
                <div>
                  <span className="text-gray-500">Custom Permissions:</span>
                  <p className="text-white font-medium">{getTotalGrantedPermissions()}</p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Module Tabs */}
          {permissionModules.map((module) => (
            <TabsContent key={module.name} value={module.name} className="overflow-y-auto flex-1 pe-2">
              <div className="bg-gray-900/50 border border-gray-700 rounded-xl overflow-hidden">
                <div className="bg-gray-900 px-6 py-4 border-b border-gray-700">
                  <h3 className="text-lg font-semibold text-white">{module.label}</h3>
                  <p className="text-sm text-gray-400">
                    Configure {module.label.toLowerCase()} permissions
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-900/50">
                      <tr>
                        <th className="text-start p-4 font-semibold text-gray-300">Permission</th>
                        <th className="text-start p-4 font-semibold text-gray-300">Description</th>
                        <th className="text-center p-4 font-semibold text-gray-300">Status</th>
                        <th className="text-center p-4 font-semibold text-gray-300">Toggle</th>
                      </tr>
                    </thead>
                    <tbody>
                      {module.permissions.map((permission) => {
                        const status = getPermissionStatus(module.name, permission.action);
                        const statusColors: Record<string, string> = {
                          inherited: "text-blue-400",
                          granted: "text-green-400",
                          denied: "text-red-400",
                          none: "text-gray-500",
                        };

                        return (
                          <tr
                            key={permission.action}
                            className="border-b border-gray-700 hover:bg-gray-900/30"
                          >
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-white">{permission.label}</span>
                                {status === "inherited" && (
                                  <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs">
                                    Inherited
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td className="p-4 text-gray-400 text-sm">{permission.description}</td>
                            <td className="p-4 text-center">
                              <span className={cn("text-sm capitalize", statusColors[status])}>
                                {status === "none" ? "No Permission" : status}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <Toggle
                                checked={isPermissionGranted(module.name, permission.action)}
                                onChange={() => togglePermission(module.name, permission.action)}
                                status={status}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-700 flex-shrink-0">
          <Button
            variant="outline"
            onClick={resetToRoleDefaults}
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <RotateCcw className="h-4 w-4 me-2" />
            Reset to Role Defaults
          </Button>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges}
              className="bg-awnash-primary hover:bg-awnash-primary-hover text-black font-medium disabled:opacity-50"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PermissionsMatrixModal;
