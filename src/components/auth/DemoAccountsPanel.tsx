"use client";

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserShield,
  faCalendarCheck,
  faNewspaper,
  faHeadset,
  faTruck,
  faHandshake,
  faUsers,
  faCopy,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";

interface DemoAccount {
  role: string;
  roleKey: string;
  email: string;
  password: string;
  icon: typeof faUserShield;
  description: string;
  descriptionAr: string;
  color: string;
}

const demoAccounts: DemoAccount[] = [
  {
    role: "Super Admin",
    roleKey: "super_admin",
    email: "superadmin@awnash.net",
    password: "Demo@123",
    icon: faUserShield,
    description: "Full system access",
    descriptionAr: "وصول كامل للنظام",
    color: "bg-purple-500",
  },
  {
    role: "Renter",
    roleKey: "requester",
    email: "renter@awnash.net",
    password: "Demo@123",
    icon: faHandshake,
    description: "Browse and rent equipment",
    descriptionAr: "تصفح واستئجار المعدات",
    color: "bg-teal-500",
  },
  {
    role: "Owner",
    roleKey: "owner",
    email: "owner@awnash.net",
    password: "Demo@123",
    icon: faTruck,
    description: "List and manage equipment",
    descriptionAr: "عرض وإدارة المعدات",
    color: "bg-yellow-500",
  },
  {
    role: "Hybrid",
    roleKey: "hybrid",
    email: "hybrid@awnash.net",
    password: "Demo@123",
    icon: faUsers,
    description: "Owner + Renter",
    descriptionAr: "مالك ومستأجر",
    color: "bg-indigo-500",
  },
  {
    role: "Booking Admin",
    roleKey: "booking_admin",
    email: "bookingadmin@awnash.net",
    password: "Demo@123",
    icon: faCalendarCheck,
    description: "Manage bookings",
    descriptionAr: "إدارة الحجوزات",
    color: "bg-blue-500",
  },
  {
    role: "Content Admin",
    roleKey: "content_admin",
    email: "contentadmin@awnash.net",
    password: "Demo@123",
    icon: faNewspaper,
    description: "Manage articles",
    descriptionAr: "إدارة المقالات",
    color: "bg-green-500",
  },
  {
    role: "Support",
    roleKey: "support_agent",
    email: "support@awnash.net",
    password: "Demo@123",
    icon: faHeadset,
    description: "Customer support",
    descriptionAr: "دعم العملاء",
    color: "bg-orange-500",
  },
];

interface DemoAccountsPanelProps {
  isRTL: boolean;
  onSelectAccount: (email: string, password: string) => void;
}

export const DemoAccountsPanel: React.FC<DemoAccountsPanelProps> = ({
  isRTL,
  onSelectAccount,
}) => {
  const [copiedEmail, setCopiedEmail] = React.useState<string | null>(null);

  const handleCopyEmail = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      setCopiedEmail(email);
      setTimeout(() => setCopiedEmail(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div
      className={cn(
        "w-full lg:w-72 bg-white dark:bg-[#18181b] rounded-2xl shadow-lg p-4 space-y-3 h-fit",
        "border border-gray-200 dark:border-gray-800"
      )}
    >
      {/* Header */}
      <div className="text-center border-b border-gray-200 dark:border-gray-700 pb-2">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white">
          {isRTL ? "حسابات تجريبية" : "Demo Accounts"}
        </h2>
        <p className="text-[10px] text-gray-500 dark:text-gray-400">
          {isRTL ? "انقر للتسجيل السريع" : "Click to quick login"}
        </p>
      </div>

      {/* Account List */}
      <div className="space-y-1.5">
        {demoAccounts.map((account) => (
          <div
            key={account.roleKey}
            className={cn(
              "group relative p-2 rounded-lg border border-gray-200 dark:border-gray-700",
              "hover:border-[#0073E6] hover:bg-gray-50 dark:hover:bg-gray-800/50",
              "transition-all cursor-pointer"
            )}
            onClick={() => onSelectAccount(account.email, account.password)}
          >
            <div className="flex items-center gap-2">
              {/* Icon */}
              <div
                className={cn(
                  "w-8 h-8 rounded-md flex items-center justify-center shrink-0",
                  account.color
                )}
              >
                <FontAwesomeIcon
                  icon={account.icon}
                  className="h-4 w-4 text-white"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-gray-900 dark:text-white">
                    {account.role}
                  </h3>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyEmail(account.email);
                    }}
                    className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                    title={isRTL ? "نسخ البريد" : "Copy email"}
                  >
                    <FontAwesomeIcon
                      icon={copiedEmail === account.email ? faCheck : faCopy}
                      className={cn(
                        "h-2.5 w-2.5",
                        copiedEmail === account.email
                          ? "text-green-500"
                          : "text-gray-400"
                      )}
                    />
                  </button>
                </div>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                  {isRTL ? account.descriptionAr : account.description}
                </p>
              </div>
            </div>

            {/* Quick login indicator */}
            <div
              className={cn(
                "absolute inset-0 flex items-center justify-center bg-[#0073E6]/90 rounded-lg",
                "opacity-0 group-hover:opacity-100 transition-opacity"
              )}
            >
              <span className="text-white text-xs font-medium">
                {isRTL ? "تسجيل الدخول" : "Login"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Note */}
      <div className="text-center pt-1.5 border-t border-gray-200 dark:border-gray-700">
        <p className="text-[10px] text-gray-400 dark:text-gray-500">
          {isRTL ? "كلمة المرور: Demo@123" : "Password: Demo@123"}
        </p>
      </div>
    </div>
  );
};

export default DemoAccountsPanel;
