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
  faChevronDown,
  faChevronUp,
  faPhone,
  faIdCard,
} from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";

interface DemoAccount {
  role: string;
  roleKey: string;
  email: string;
  phone: string;
  password: string;
  icon: typeof faUserShield;
  description: string;
  descriptionAr: string;
  color: string;
  /** If true, account is info-only (no login action) */
  infoOnly?: boolean;
}

interface DemoSection {
  title: string;
  titleAr: string;
  accounts: DemoAccount[];
  defaultExpanded?: boolean;
}

const demoSections: DemoSection[] = [
  {
    title: "Admin Roles",
    titleAr: "أدوار المسؤولين",
    defaultExpanded: true,
    accounts: [
      {
        role: "Super Admin",
        roleKey: "super_admin",
        email: "superadmin@awnash.net",
        phone: "+966550000001",
        password: "Demo@123",
        icon: faUserShield,
        description: "Full system access",
        descriptionAr: "وصول كامل للنظام",
        color: "bg-purple-500",
      },
      {
        role: "Booking Admin",
        roleKey: "booking_admin",
        email: "bookingadmin@awnash.net",
        phone: "+966550000005",
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
        phone: "+966550000006",
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
        phone: "+966550000007",
        password: "Demo@123",
        icon: faHeadset,
        description: "Customer support",
        descriptionAr: "دعم العملاء",
        color: "bg-orange-500",
      },
      {
        role: "Hybrid",
        roleKey: "hybrid",
        email: "hybrid@awnash.net",
        phone: "+966550000004",
        password: "Demo@123",
        icon: faUsers,
        description: "Owner + Renter",
        descriptionAr: "مالك ومستأجر",
        color: "bg-indigo-500",
      },
    ],
  },
  {
    title: "Owners",
    titleAr: "الملاك",
    defaultExpanded: true,
    accounts: [
      {
        role: "Mohammed Al-Otaibi",
        roleKey: "owner1",
        email: "owner1@awnash.net",
        phone: "+966501111001",
        password: "Owner$Awn@sh#2026",
        icon: faTruck,
        description: "owner1@awnash.net",
        descriptionAr: "محمد العتيبي",
        color: "bg-yellow-500",
      },
      {
        role: "Ahmed Al-Shammari",
        roleKey: "owner2",
        email: "owner2@awnash.net",
        phone: "+966501111002",
        password: "Owner$Awn@sh#2026",
        icon: faTruck,
        description: "owner2@awnash.net",
        descriptionAr: "أحمد الشمري",
        color: "bg-yellow-500",
      },
      {
        role: "Khalid Al-Dosari",
        roleKey: "owner3",
        email: "owner3@awnash.net",
        phone: "+966501111003",
        password: "Owner$Awn@sh#2026",
        icon: faTruck,
        description: "owner3@awnash.net",
        descriptionAr: "خالد الدوسري",
        color: "bg-yellow-500",
      },
      {
        role: "Omar Al-Zahrani",
        roleKey: "owner4",
        email: "owner4@awnash.net",
        phone: "+966501111004",
        password: "Owner$Awn@sh#2026",
        icon: faTruck,
        description: "owner4@awnash.net",
        descriptionAr: "عمر الزهراني",
        color: "bg-yellow-500",
      },
      {
        role: "Nasser Al-Anzi",
        roleKey: "owner5",
        email: "owner5@awnash.net",
        phone: "+966501111005",
        password: "Owner$Awn@sh#2026",
        icon: faTruck,
        description: "owner5@awnash.net",
        descriptionAr: "ناصر العنزي",
        color: "bg-yellow-500",
      },
    ],
  },
  {
    title: "Renters",
    titleAr: "المستأجرين",
    defaultExpanded: true,
    accounts: [
      {
        role: "Abdullah Al-Ghamdi",
        roleKey: "requester1",
        email: "requester1@awnash.net",
        phone: "+966502222001",
        password: "Req$Awn@sh#2026",
        icon: faHandshake,
        description: "requester1@awnash.net",
        descriptionAr: "عبدالله الغامدي",
        color: "bg-teal-500",
      },
      {
        role: "Saud Al-Qahtani",
        roleKey: "requester2",
        email: "requester2@awnash.net",
        phone: "+966502222002",
        password: "Req$Awn@sh#2026",
        icon: faHandshake,
        description: "requester2@awnash.net",
        descriptionAr: "سعود القحطاني",
        color: "bg-teal-500",
      },
      {
        role: "Fahad Al-Harbi",
        roleKey: "requester3",
        email: "requester3@awnash.net",
        phone: "+966502222003",
        password: "Req$Awn@sh#2026",
        icon: faHandshake,
        description: "requester3@awnash.net",
        descriptionAr: "فهد الحربي",
        color: "bg-teal-500",
      },
      {
        role: "Yasser Al-Mutairi",
        roleKey: "requester4",
        email: "requester4@awnash.net",
        phone: "+966502222004",
        password: "Req$Awn@sh#2026",
        icon: faHandshake,
        description: "requester4@awnash.net",
        descriptionAr: "ياسر المطيري",
        color: "bg-teal-500",
      },
      {
        role: "Turki Al-Balawi",
        roleKey: "requester5",
        email: "requester5@awnash.net",
        phone: "+966502222005",
        password: "Req$Awn@sh#2026",
        icon: faHandshake,
        description: "requester5@awnash.net",
        descriptionAr: "تركي البلوي",
        color: "bg-teal-500",
      },
      {
        role: "Rashid Al-Shahri",
        roleKey: "requester6",
        email: "requester6@awnash.net",
        phone: "+966502222006",
        password: "Req$Awn@sh#2026",
        icon: faHandshake,
        description: "requester6@awnash.net",
        descriptionAr: "راشد الشهري",
        color: "bg-teal-500",
      },
    ],
  },
  {
    title: "Drivers — Owner1 (Mohammed)",
    titleAr: "سائقين — مالك1 (محمد العتيبي)",
    defaultExpanded: false,
    accounts: [
      { role: "Mohammed Al-Harbi", roleKey: "driver010", email: "driver966560000010@awnash.net", phone: "+966560000010", password: "", icon: faIdCard, description: "Owner: owner1@awnash.net", descriptionAr: "محمد الحربي", color: "bg-amber-600", infoOnly: true },
      { role: "Ahmed Al-Saeed", roleKey: "driver011", email: "driver966560000011@awnash.net", phone: "+966560000011", password: "", icon: faIdCard, description: "Owner: owner1@awnash.net", descriptionAr: "أحمد السعيد", color: "bg-amber-600", infoOnly: true },
      { role: "Khalid Al-Otaibi", roleKey: "driver012", email: "driver966560000012@awnash.net", phone: "+966560000012", password: "", icon: faIdCard, description: "Owner: owner1@awnash.net", descriptionAr: "خالد العتيبي", color: "bg-amber-600", infoOnly: true },
      { role: "Sultan Al-Qahtani", roleKey: "driver013", email: "driver966560000013@awnash.net", phone: "+966560000013", password: "", icon: faIdCard, description: "Owner: owner1@awnash.net", descriptionAr: "سلطان القحطاني", color: "bg-amber-600", infoOnly: true },
      { role: "Fahad Al-Shammari", roleKey: "driver014", email: "driver966560000014@awnash.net", phone: "+966560000014", password: "", icon: faIdCard, description: "Owner: owner1@awnash.net", descriptionAr: "فهد الشمري", color: "bg-amber-600", infoOnly: true },
    ],
  },
  {
    title: "Drivers — Owner2 (Ahmed)",
    titleAr: "سائقين — مالك2 (أحمد الشمري)",
    defaultExpanded: false,
    accounts: [
      { role: "Abdullah Al-Dosari", roleKey: "driver015", email: "driver966560000015@awnash.net", phone: "+966560000015", password: "", icon: faIdCard, description: "Owner: owner2@awnash.net", descriptionAr: "عبدالله الدوسري", color: "bg-amber-600", infoOnly: true },
      { role: "Saad Al-Anzi", roleKey: "driver016", email: "driver966560000016@awnash.net", phone: "+966560000016", password: "", icon: faIdCard, description: "Owner: owner2@awnash.net", descriptionAr: "سعد العنزي", color: "bg-amber-600", infoOnly: true },
      { role: "Nasser Al-Ghamdi", roleKey: "driver017", email: "driver966560000017@awnash.net", phone: "+966560000017", password: "", icon: faIdCard, description: "Owner: owner2@awnash.net", descriptionAr: "ناصر الغامدي", color: "bg-amber-600", infoOnly: true },
      { role: "Yousef Al-Zahrani", roleKey: "driver018", email: "driver966560000018@awnash.net", phone: "+966560000018", password: "", icon: faIdCard, description: "Owner: owner2@awnash.net", descriptionAr: "يوسف الزهراني", color: "bg-amber-600", infoOnly: true },
      { role: "Omar Al-Mutairi", roleKey: "driver019", email: "driver966560000019@awnash.net", phone: "+966560000019", password: "", icon: faIdCard, description: "Owner: owner2@awnash.net", descriptionAr: "عمر المطيري", color: "bg-amber-600", infoOnly: true },
    ],
  },
  {
    title: "Drivers — Owner3 (Khalid)",
    titleAr: "سائقين — مالك3 (خالد الدوسري)",
    defaultExpanded: false,
    accounts: [
      { role: "Bandar Al-Omari", roleKey: "driver020", email: "driver966560000020@awnash.net", phone: "+966560000020", password: "", icon: faIdCard, description: "Owner: owner3@awnash.net", descriptionAr: "بندر العمري", color: "bg-amber-600", infoOnly: true },
      { role: "Majed Al-Shahri", roleKey: "driver021", email: "driver966560000021@awnash.net", phone: "+966560000021", password: "", icon: faIdCard, description: "Owner: owner3@awnash.net", descriptionAr: "ماجد الشهري", color: "bg-amber-600", infoOnly: true },
      { role: "Hussein Al-Asiri", roleKey: "driver022", email: "driver966560000022@awnash.net", phone: "+966560000022", password: "", icon: faIdCard, description: "Owner: owner3@awnash.net", descriptionAr: "حسين العسيري", color: "bg-amber-600", infoOnly: true },
      { role: "Raed Al-Hamoud", roleKey: "driver023", email: "driver966560000023@awnash.net", phone: "+966560000023", password: "", icon: faIdCard, description: "Owner: owner3@awnash.net", descriptionAr: "رائد الحمود", color: "bg-amber-600", infoOnly: true },
      { role: "Mansour Al-Bugami", roleKey: "driver024", email: "driver966560000024@awnash.net", phone: "+966560000024", password: "", icon: faIdCard, description: "Owner: owner3@awnash.net", descriptionAr: "منصور البقمي", color: "bg-amber-600", infoOnly: true },
    ],
  },
  {
    title: "Drivers — Owner4 (Omar)",
    titleAr: "سائقين — مالك4 (عمر الزهراني)",
    defaultExpanded: false,
    accounts: [
      { role: "Tariq Al-Jabreen", roleKey: "driver025", email: "driver966560000025@awnash.net", phone: "+966560000025", password: "", icon: faIdCard, description: "Owner: owner4@awnash.net", descriptionAr: "طارق الجبرين", color: "bg-amber-600", infoOnly: true },
      { role: "Saleh Al-Rashidi", roleKey: "driver026", email: "driver966560000026@awnash.net", phone: "+966560000026", password: "", icon: faIdCard, description: "Owner: owner4@awnash.net", descriptionAr: "صالح الرشيدي", color: "bg-amber-600", infoOnly: true },
      { role: "Ali Al-Malki", roleKey: "driver027", email: "driver966560000027@awnash.net", phone: "+966560000027", password: "", icon: faIdCard, description: "Owner: owner4@awnash.net", descriptionAr: "علي المالكي", color: "bg-amber-600", infoOnly: true },
      { role: "Ibrahim Al-Thaqafi", roleKey: "driver028", email: "driver966560000028@awnash.net", phone: "+966560000028", password: "", icon: faIdCard, description: "Owner: owner4@awnash.net", descriptionAr: "ابراهيم الثقفي", color: "bg-amber-600", infoOnly: true },
      { role: "Waleed Al-Subai", roleKey: "driver029", email: "driver966560000029@awnash.net", phone: "+966560000029", password: "", icon: faIdCard, description: "Owner: owner4@awnash.net", descriptionAr: "وليد السبيعي", color: "bg-amber-600", infoOnly: true },
    ],
  },
  {
    title: "Drivers — Owner5 (Nasser)",
    titleAr: "سائقين — مالك5 (ناصر العنزي)",
    defaultExpanded: false,
    accounts: [
      { role: "Hamad Al-Sharif", roleKey: "driver030", email: "driver966560000030@awnash.net", phone: "+966560000030", password: "", icon: faIdCard, description: "Owner: owner5@awnash.net", descriptionAr: "حمد الشريف", color: "bg-amber-600", infoOnly: true },
      { role: "Nayef Al-Juhani", roleKey: "driver031", email: "driver966560000031@awnash.net", phone: "+966560000031", password: "", icon: faIdCard, description: "Owner: owner5@awnash.net", descriptionAr: "نايف الجهني", color: "bg-amber-600", infoOnly: true },
      { role: "Mishari Al-Osaimi", roleKey: "driver032", email: "driver966560000032@awnash.net", phone: "+966560000032", password: "", icon: faIdCard, description: "Owner: owner5@awnash.net", descriptionAr: "مشاري العصيمي", color: "bg-amber-600", infoOnly: true },
      { role: "Adel Al-Muzaini", roleKey: "driver033", email: "driver966560000033@awnash.net", phone: "+966560000033", password: "", icon: faIdCard, description: "Owner: owner5@awnash.net", descriptionAr: "عادل المزيني", color: "bg-amber-600", infoOnly: true },
      { role: "Tameem Al-Khalidi", roleKey: "driver034", email: "driver966560000034@awnash.net", phone: "+966560000034", password: "", icon: faIdCard, description: "Owner: owner5@awnash.net", descriptionAr: "تميم الخالدي", color: "bg-amber-600", infoOnly: true },
    ],
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
  const [collapsedSections, setCollapsedSections] = React.useState<Set<string>>(
    () => new Set(demoSections.filter((s) => !s.defaultExpanded).map((s) => s.title))
  );

  const toggleSection = (title: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(title)) {
        next.delete(title);
      } else {
        next.add(title);
      }
      return next;
    });
  };

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
        "w-full lg:w-80 bg-white dark:bg-card rounded-2xl shadow-lg p-4 space-y-3",
        "border border-gray-200 dark:border-border",
        "max-h-[85vh] flex flex-col"
      )}
    >
      {/* Header */}
      <div className="text-center border-b border-gray-200 dark:border-border pb-2 shrink-0">
        <h2 className="text-sm font-bold text-gray-900 dark:text-foreground">
          {isRTL ? "حسابات تجريبية" : "Demo Accounts"}
        </h2>
        <p className="text-[10px] text-gray-500 dark:text-muted-foreground">
          {isRTL ? "انقر للتسجيل السريع" : "Click to quick login"}
        </p>
      </div>

      {/* Scrollable Sections */}
      <div className="overflow-y-auto space-y-3 flex-1 min-h-0 pr-1">
        {demoSections.map((section) => {
          const isCollapsed = collapsedSections.has(section.title);
          return (
            <div key={section.title}>
              {/* Section Header */}
              <button
                type="button"
                onClick={() => toggleSection(section.title)}
                className="flex items-center justify-between w-full px-1 py-1 text-[11px] font-semibold text-gray-500 dark:text-muted-foreground uppercase tracking-wider hover:text-gray-700 dark:hover:text-foreground transition-colors"
              >
                <span>{isRTL ? section.titleAr : section.title} ({section.accounts.length})</span>
                <FontAwesomeIcon
                  icon={isCollapsed ? faChevronDown : faChevronUp}
                  className="h-2.5 w-2.5"
                />
              </button>

              {/* Section Accounts */}
              {!isCollapsed && (
                <div className="space-y-1.5 mt-1">
                  {section.accounts.map((account) => (
                    <div
                      key={account.roleKey}
                      className={cn(
                        "group relative p-2 rounded-lg border border-gray-200 dark:border-border",
                        "transition-all",
                        account.infoOnly
                          ? "cursor-default opacity-90"
                          : "hover:border-[#0073E6] hover:bg-gray-50 dark:hover:bg-muted/50 cursor-pointer"
                      )}
                      onClick={() => !account.infoOnly && onSelectAccount(account.email, account.password)}
                    >
                      <div className="flex items-center gap-2">
                        {/* Icon */}
                        <div
                          className={cn(
                            "w-7 h-7 rounded-md flex items-center justify-center shrink-0",
                            account.color
                          )}
                        >
                          <FontAwesomeIcon
                            icon={account.icon}
                            className="h-3.5 w-3.5 text-white"
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="text-xs font-semibold text-gray-900 dark:text-foreground">
                              {isRTL ? account.descriptionAr : account.role}
                            </h3>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyEmail(account.email);
                              }}
                              className="p-0.5 hover:bg-gray-200 dark:hover:bg-muted rounded transition-colors"
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
                          <p className="text-[10px] text-gray-500 dark:text-muted-foreground truncate">
                            {isRTL ? account.email : account.description}
                          </p>
                          <p className="text-[10px] text-gray-400 dark:text-muted-foreground/70 truncate flex items-center gap-1">
                            <FontAwesomeIcon icon={faPhone} className="h-2 w-2" />
                            <span dir="ltr">{account.phone}</span>
                          </p>
                        </div>
                      </div>

                      {/* Quick login indicator - only for loginable accounts */}
                      {!account.infoOnly && (
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
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Note */}
      <div className="text-center pt-1.5 border-t border-gray-200 dark:border-border shrink-0">
        <p className="text-[10px] text-gray-400 dark:text-muted-foreground">
          {isRTL ? "انقر على أي حساب لتسجيل الدخول" : "Click any account to login"}
        </p>
      </div>
    </div>
  );
};

export default DemoAccountsPanel;
