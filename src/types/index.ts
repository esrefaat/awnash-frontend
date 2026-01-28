export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'owner' | 'renter' | 'admin';
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  lastLogin?: string;
  avatar?: string;
}

export interface EquipmentType {
  id: string;
  nameAr: string;
  nameEn: string;
  icon?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Equipment {
  id: string;
  title: string;
  description: string;
  category: string;
  equipmentTypeId: string;
  equipmentTypeName: string;
  ownerId: string;
  ownerName: string;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'inactive' | 'flagged';
  price: number;
  location: string;
  images: string[];
  createdAt: string;
  moderatedAt?: string;
  moderatedBy?: string;
  // Additional fields for heavy equipment rental marketplace
  size?: string;
  totalRentals?: number;
  totalRevenue?: number;
}

export interface Booking {
  id: string;
  equipmentId: string;
  equipmentTitle: string;
  equipmentImage?: string;
  renterId: string;
  renterName: string;
  ownerId: string;
  ownerName: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  penalties?: number;
  createdAt: string;
  // Additional fields for heavy equipment rental marketplace
  rentalDays?: number;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId: string;
  details: Record<string, any>;
  timestamp: string;
  ipAddress: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalEquipment: number;
  totalBookings: number;
  pendingModeration: number;
  revenue: number;
  revenueGrowth: number;
}

export interface Language {
  code: 'en' | 'ar' | 'ur';
  name: string;
  direction: 'ltr' | 'rtl';
}

import { IconDefinition } from '@fortawesome/free-solid-svg-icons';

export interface NavItem {
  title: string;
  href: string;
  icon: IconDefinition;
  children?: NavItem[];
} 