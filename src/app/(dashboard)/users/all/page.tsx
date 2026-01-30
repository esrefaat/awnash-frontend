'use client';

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { usersService, User } from '@/services/usersService';
import AddUserModal from '@/components/modals/AddUserModal';
import {
  faUsers,
  faSearch,
  faFilter,
  faEye,
  faUserSlash,
  faFlag,
  faEnvelope,
  faEdit,
  faTimes,
  faCheck,
  faExclamationTriangle,
  faCheckCircle,
  faTimesCircle,
  faCrown,
  faShieldAlt,
  faPhone,
  faCalendarAlt,
  faDollarSign,
  faTruck,
  faFileAlt,
  faThumbsUp,
  faComments,
  faSortUp,
  faSortDown,
  faSort,
  faDownload,
  faPlus,
  faMapMarkerAlt,
  faClipboard,
  faHome,
  faBuilding,
  faUserPlus
} from '@fortawesome/free-solid-svg-icons';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

// Types

interface UserBooking {
  id: string;
  equipmentName: string;
  startDate: string;
  endDate: string;
  amount: number;
  status: 'active' | 'completed' | 'cancelled';
}

interface UserEquipment {
  id: string;
  name: string;
  category: string;
  status: 'available' | 'booked' | 'maintenance';
  revenue: number;
  bookings: number;
}

interface UserDocument {
  id: string;
  name: string;
  type: 'license' | 'insurance' | 'certification' | 'other';
  status: 'verified' | 'pending' | 'rejected';
  uploadDate: string;
}

interface UserNote {
  id: string;
  text: string;
  author: string;
  date: string;
  type: 'info' | 'warning' | 'success';
}

const UsersManagement: React.FC = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  // State
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const limit = 20; // Users per page

  // Refs for infinite scrolling
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  // Load users from API with infinite scroll support
  const loadUsers = useCallback(async (page: number = 1, append: boolean = false) => {
    if (loadingRef.current) return;

    try {
      loadingRef.current = true;
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const response = await usersService.getAllUsers({
        page,
        limit,
      });

      if (append) {
        setUsers(prev => [...prev, ...response.users]);
      } else {
        setUsers(response.users);
      }
      setTotalPages(response.totalPages);
      setTotalUsers(response.total);
      setCurrentPage(page);
      setHasMore(page < response.totalPages);
      setError(null);
    } catch (err) {
      setError('Failed to load users');
      console.error('Error loading users:', err);
      if (!append) {
        setUsers([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
      loadingRef.current = false;
    }
  }, []);

  // Load more users for infinite scroll
  const loadMoreUsers = useCallback(() => {
    if (!hasMore || loadingRef.current) return;
    loadUsers(currentPage + 1, true);
  }, [loadUsers, currentPage, hasMore]);

  // Initial load
  useEffect(() => {
    loadUsers(1, false);
  }, []);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !loadingRef.current) {
          loadMoreUsers();
        }
      },
      {
        root: null,
        rootMargin: '200px',
        threshold: 0,
      }
    );

    observer.observe(sentinelRef.current);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, loadMoreUsers]);

  // Handle user added
  const handleUserAdded = (newUser: User) => {
    loadUsers(1, false); // Refresh the list from page 1
    setShowAddUserModal(false);
  };

  // Handle edit user
  const handleEditUser = (user: User) => {
    // For now, open profile with details tab
    setSelectedUser(user);
    setActiveTab('details');
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activityFilter, setActivityFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('details');

  // Mock data for selected user
  const [userBookings] = useState<UserBooking[]>([
    {
      id: 'BK-001',
      equipmentName: 'CAT 320D Excavator',
      startDate: '2024-06-22',
      endDate: '2024-06-29',
      amount: 18500,
      status: 'active'
    },
    {
      id: 'BK-002',
      equipmentName: 'Liebherr LTM 1100 Crane',
      startDate: '2024-06-15',
      endDate: '2024-06-22',
      amount: 45000,
      status: 'completed'
    }
  ]);

  const [userEquipment] = useState<UserEquipment[]>([
    {
      id: 'EQ-001',
      name: 'CAT 330 Excavator',
      category: 'Excavators',
      status: 'booked',
      revenue: 67500,
      bookings: 15
    },
    {
      id: 'EQ-002',
      name: 'Volvo A40G Dump Truck',
      category: 'Trucks',
      status: 'available',
      revenue: 28000,
      bookings: 8
    }
  ]);

  const [userDocuments] = useState<UserDocument[]>([
    {
      id: 'DOC-001',
      name: 'Commercial License',
      type: 'license',
      status: 'verified',
      uploadDate: '2024-01-20'
    },
    {
      id: 'DOC-002',
      name: 'Equipment Insurance',
      type: 'insurance',
      status: 'verified',
      uploadDate: '2024-01-22'
    },
    {
      id: 'DOC-003',
      name: 'Operator Certification',
      type: 'certification',
      status: 'pending',
      uploadDate: '2024-06-15'
    }
  ]);

  const [userNotes] = useState<UserNote[]>([
    {
      id: 'NOTE-001',
      text: 'User reported payment delay due to bank processing issues. Resolved successfully.',
      author: 'Admin Team',
      date: '2024-06-15',
      type: 'info'
    },
    {
      id: 'NOTE-002',
      text: 'Excellent feedback from multiple equipment owners. Reliable renter.',
      author: 'Support Team',
      date: '2024-06-10',
      type: 'success'
    }
  ]);



  // Filtering and sorting
  const filteredUsers = useMemo(() => {
    let filtered = users.filter(user => {
      const matchesSearch = (user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.mobileNumber?.includes(searchTerm));
      
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      
      // Map status filter to isActive
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && user.isActive) ||
        (statusFilter === 'inactive' && !user.isActive);
      
      const matchesActivity = activityFilter === 'all' || 
        (activityFilter === 'recent' && user.lastLogin && new Date(user.lastLogin) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
      
      return matchesSearch && matchesRole && matchesStatus && matchesActivity;
    });

    // Sorting
    filtered.sort((a, b) => {
      const aValue = a[sortField as keyof User];
      const bValue = b[sortField as keyof User];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });

    return filtered;
  }, [users, searchTerm, roleFilter, statusFilter, activityFilter, sortField, sortDirection]);

  // Helper functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(isRTL ? 'ar-AE' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRoleBadge = (role: string) => {
    const roleConfig: Record<string, { bg: string; text: string; labelEn: string; labelAr: string }> = {
      owner: { bg: 'bg-yellow-500', text: 'text-black', labelEn: 'Owner', labelAr: 'مالك' },
      requester: { bg: 'bg-blue-500', text: 'text-white', labelEn: 'Requester', labelAr: 'طالب' },
      renter: { bg: 'bg-blue-500', text: 'text-white', labelEn: 'Renter', labelAr: 'مستأجر' },
      hybrid: { bg: 'bg-purple-500', text: 'text-white', labelEn: 'Hybrid', labelAr: 'هجين' },
      super_admin: { bg: 'bg-red-500', text: 'text-white', labelEn: 'Super Admin', labelAr: 'مشرف عام' },
      booking_admin: { bg: 'bg-green-500', text: 'text-white', labelEn: 'Booking Admin', labelAr: 'مشرف حجوزات' },
      content_admin: { bg: 'bg-teal-500', text: 'text-white', labelEn: 'Content Admin', labelAr: 'مشرف محتوى' },
      support_agent: { bg: 'bg-orange-500', text: 'text-white', labelEn: 'Support', labelAr: 'دعم' },
      admin: { bg: 'bg-green-500', text: 'text-white', labelEn: 'Admin', labelAr: 'مشرف' },
    };

    const config = roleConfig[role?.toLowerCase()];
    if (!config) {
      return (
        <span className="px-2 py-1 bg-gray-500 text-white text-xs rounded-full font-medium">
          {role || 'Unknown'}
        </span>
      );
    }

    return (
      <span className={cn("px-2 py-1 text-xs rounded-full font-medium", config.bg, config.text)}>
        {isRTL ? config.labelAr : config.labelEn}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-500', text: isRTL ? 'نشط' : 'Active' },
      flagged: { color: 'bg-yellow-500', text: isRTL ? 'مبلغ عنه' : 'Flagged' },
      inactive: { color: 'bg-gray-500', text: isRTL ? 'غير نشط' : 'Inactive' },
      suspended: { color: 'bg-red-500', text: isRTL ? 'موقوف' : 'Suspended' },
      verified: { color: 'bg-green-500', text: isRTL ? 'موثق' : 'Verified' },
      pending: { color: 'bg-yellow-500', text: isRTL ? 'في انتظار' : 'Pending' },
      incomplete: { color: 'bg-orange-500', text: isRTL ? 'غير مكتمل' : 'Incomplete' },
      rejected: { color: 'bg-red-500', text: isRTL ? 'مرفوض' : 'Rejected' }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) {
      // Default fallback for unknown status
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium text-white bg-gray-500">
          {status}
        </span>
      );
    }

    return (
      <span className={cn("px-2 py-1 rounded-full text-xs font-medium text-white", config.color)}>
        {config.text}
      </span>
    );
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return faSort;
    return sortDirection === 'asc' ? faSortUp : faSortDown;
  };

  return (
    <div className={cn("min-h-screen bg-gray-900", isRTL ? 'font-arabic' : 'font-montserrat')} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header with Add User and Export Buttons */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {isRTL ? 'إدارة المستخدمين' : 'User Management'}
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              {isRTL ? `${totalUsers} مستخدم مسجل` : `${totalUsers} registered users`}
            </p>
          </div>
          <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
            <button 
              onClick={() => setShowAddUserModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-awnash-primary hover:bg-awnash-primary/90 text-black rounded-2xl transition-colors shadow-lg font-medium"
            >
              <FontAwesomeIcon icon={faUserPlus} className="h-4 w-4" />
              <span className="text-sm">
                {isRTL ? 'إضافة مستخدم' : 'Add User'}
              </span>
            </button>
            <Button variant="dark">
              <FontAwesomeIcon icon={faDownload} className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">
                {isRTL ? 'تصدير' : 'Export'}
              </span>
            </Button>
          </div>
        </div>
      
        {/* Filters and Search */}
        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 shadow-lg mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <FontAwesomeIcon 
                  icon={faSearch} 
                  className={cn('absolute top-3 h-4 w-4 text-gray-400', isRTL ? 'right-3' : 'left-3')} 
                />
                <input
                  type="text"
                  placeholder={isRTL ? 'البحث عن المستخدمين...' : 'Search users...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={cn(
                    'w-full bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                    isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4',
                    'py-2'
                  )}
                />
              </div>
            </div>

            {/* Role Filter */}
            <div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{isRTL ? 'جميع الأدوار' : 'All Roles'}</option>
                <option value="owner">{isRTL ? 'مالك' : 'Owner'}</option>
                <option value="renter">{isRTL ? 'مستأجر' : 'Renter'}</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{isRTL ? 'جميع الحالات' : 'All Status'}</option>
                <option value="active">{isRTL ? 'نشط' : 'Active'}</option>
                <option value="flagged">{isRTL ? 'مبلغ عنه' : 'Flagged'}</option>
                <option value="inactive">{isRTL ? 'غير نشط' : 'Inactive'}</option>
                <option value="suspended">{isRTL ? 'موقوف' : 'Suspended'}</option>
              </select>
            </div>

            {/* Activity Filter */}
            <div>
              <select
                value={activityFilter}
                onChange={(e) => setActivityFilter(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{isRTL ? 'جميع المستخدمين' : 'All Users'}</option>
                <option value="recent">{isRTL ? 'نشط مؤخراً' : 'Recently Active'}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className={cn('px-6 py-4 text-white font-semibold cursor-pointer hover:bg-gray-600', isRTL ? 'text-right' : 'text-left')}
                      onClick={() => handleSort('name')}>
                    <div className="flex items-center gap-2">
                      <span>{isRTL ? 'الاسم' : 'Name'}</span>
                      <FontAwesomeIcon icon={getSortIcon('name')} className="h-3 w-3" />
                    </div>
                  </th>
                  <th className={cn('px-6 py-4 text-white font-semibold', isRTL ? 'text-right' : 'text-left')}>
                    {isRTL ? 'التواصل' : 'Contact'}
                  </th>
                  <th className={cn('px-6 py-4 text-white font-semibold', isRTL ? 'text-right' : 'text-left')}>
                    {isRTL ? 'الدور' : 'Role'}
                  </th>
                  <th className={cn('px-6 py-4 text-white font-semibold cursor-pointer hover:bg-gray-600', isRTL ? 'text-right' : 'text-left')}
                      onClick={() => handleSort('status')}>
                    <div className="flex items-center gap-2">
                      <span>{isRTL ? 'الحالة' : 'Status'}</span>
                      <FontAwesomeIcon icon={getSortIcon('status')} className="h-3 w-3" />
                    </div>
                  </th>
                  <th className={cn('px-6 py-4 text-white font-semibold cursor-pointer hover:bg-gray-600', isRTL ? 'text-right' : 'text-left')}
                      onClick={() => handleSort('createdAt')}>
                    <div className="flex items-center gap-2">
                      <span>{isRTL ? 'تاريخ التسجيل' : 'Registration Date'}</span>
                      <FontAwesomeIcon icon={getSortIcon('createdAt')} className="h-3 w-3" />
                    </div>
                  </th>
                  <th className={cn('px-6 py-4 text-white font-semibold cursor-pointer hover:bg-gray-600', isRTL ? 'text-right' : 'text-left')}
                      onClick={() => handleSort('lastLogin')}>
                    <div className="flex items-center gap-2">
                      <span>{isRTL ? 'آخر تسجيل دخول' : 'Last Login'}</span>
                      <FontAwesomeIcon icon={getSortIcon('lastLogin')} className="h-3 w-3" />
                    </div>
                  </th>
                  <th className={cn('px-6 py-4 text-white font-semibold', isRTL ? 'text-right' : 'text-left')}>
                    {isRTL ? 'الإجراءات' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-white">{user.fullName || 'Unknown User'}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {/* {user.verificationStatus === 'verified' && (
                              <FontAwesomeIcon icon={faCheckCircle} className="h-3 w-3 text-green-500" />
                            )} */}
                            <span className="text-xs text-gray-400">{user.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm text-white">{user.email || '-'}</p>
                        <p className="text-sm text-gray-400">{user.mobileNumber}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {getStatusBadge(user.isActive ? 'active' : 'inactive')}
                        {user.isVerified && (
                          <span className="block px-2 py-1 rounded-full text-xs font-medium text-white bg-blue-500 w-fit">
                            {isRTL ? 'موثق' : 'Verified'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-xs text-gray-400">{formatDate(user.createdAt)}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-xs text-gray-400">{user.lastLogin ? formatDate(user.lastLogin) : '-'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="p-2 text-blue-400 hover:text-blue-300 hover:bg-gray-600 rounded transition-colors"
                          title={isRTL ? 'عرض الملف' : 'View Profile'}
                        >
                          <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditUser(user)}
                          className="p-2 text-green-400 hover:text-green-300 hover:bg-gray-600 rounded transition-colors"
                          title={isRTL ? 'تعديل' : 'Edit'}
                        >
                          <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
                        </button>
                        <button
                          className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-gray-600 rounded transition-colors"
                          title={isRTL ? 'إيقاف' : 'Suspend'}
                        >
                          <FontAwesomeIcon icon={faUserSlash} className="h-4 w-4" />
                        </button>
                        <button
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-gray-600 rounded transition-colors"
                          title={isRTL ? 'إبلاغ' : 'Flag'}
                        >
                          <FontAwesomeIcon icon={faFlag} className="h-4 w-4" />
                        </button>
                        <button
                          className="p-2 text-green-400 hover:text-green-300 hover:bg-gray-600 rounded transition-colors"
                          title={isRTL ? 'رسالة' : 'Message'}
                        >
                          <FontAwesomeIcon icon={faEnvelope} className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Infinite Scroll Sentinel */}
          <div ref={sentinelRef} className="bg-gray-700 px-6 py-4 border-t border-gray-600">
            {loadingMore ? (
              <div className="flex justify-center items-center py-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-500"></div>
                <span className={cn("text-gray-400 text-sm", isRTL ? "mr-2" : "ml-2")}>
                  {isRTL ? 'جاري تحميل المزيد...' : 'Loading more...'}
                </span>
              </div>
            ) : (
              <div className="text-sm text-gray-400 text-center">
                {hasMore 
                  ? (isRTL ? 'قم بالتمرير لتحميل المزيد' : 'Scroll to load more')
                  : (isRTL 
                      ? `تم عرض ${users.length} من ${totalUsers} مستخدم` 
                      : `Showing ${users.length} of ${totalUsers} users`)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Drawer */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={cn('bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-4xl h-[90vh] flex flex-col', isRTL ? 'font-arabic' : 'font-montserrat')}>
            {/* Drawer Header */}
            <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-gray-700">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {selectedUser.fullName ? selectedUser.fullName.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">{selectedUser.fullName || 'Unknown User'}</h2>
                  <p className="text-sm text-gray-400">{selectedUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
              >
                <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex-shrink-0 border-b border-gray-700">
              <div className="flex overflow-x-auto">
                {[
                  { id: 'details', label: isRTL ? 'التفاصيل' : 'Details', icon: faUsers },
                  { id: 'bookings', label: isRTL ? 'الحجوزات' : 'Bookings', icon: faCalendarAlt },
                  { id: 'equipment', label: isRTL ? 'المعدات' : 'Equipment', icon: faTruck },
                  { id: 'documents', label: isRTL ? 'الوثائق' : 'Documents', icon: faFileAlt },
                  { id: 'notes', label: isRTL ? 'الملاحظات' : 'Notes', icon: faComments }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex items-center gap-2 px-6 py-3 font-medium border-b-2 transition-colors',
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-400'
                        : 'border-transparent text-gray-400 hover:text-white'
                    )}
                  >
                    <FontAwesomeIcon icon={tab.icon} className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              {activeTab === 'details' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-white">
                    {isRTL ? 'معلومات المستخدم' : 'User Information'}
                  </h3>
                  
                  {/* User Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-700 rounded-lg p-4">
                      <p className="text-sm text-gray-400 mb-1">{isRTL ? 'الاسم الكامل' : 'Full Name'}</p>
                      <p className="text-white font-medium">{selectedUser.fullName || '-'}</p>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <p className="text-sm text-gray-400 mb-1">{isRTL ? 'البريد الإلكتروني' : 'Email'}</p>
                      <p className="text-white font-medium">{selectedUser.email || '-'}</p>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <p className="text-sm text-gray-400 mb-1">{isRTL ? 'رقم الجوال' : 'Mobile Number'}</p>
                      <p className="text-white font-medium">{selectedUser.mobileNumber || '-'}</p>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <p className="text-sm text-gray-400 mb-1">{isRTL ? 'الدور' : 'Role'}</p>
                      <div className="mt-1">{getRoleBadge(selectedUser.role)}</div>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <p className="text-sm text-gray-400 mb-1">{isRTL ? 'الحالة' : 'Status'}</p>
                      <div className="flex gap-2 mt-1">
                        {getStatusBadge(selectedUser.isActive ? 'active' : 'inactive')}
                        {selectedUser.isVerified && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium text-white bg-blue-500">
                            {isRTL ? 'موثق' : 'Verified'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <p className="text-sm text-gray-400 mb-1">{isRTL ? 'تاريخ التسجيل' : 'Registered'}</p>
                      <p className="text-white font-medium">{formatDate(selectedUser.createdAt)}</p>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <p className="text-sm text-gray-400 mb-1">{isRTL ? 'آخر تسجيل دخول' : 'Last Login'}</p>
                      <p className="text-white font-medium">{selectedUser.lastLogin ? formatDate(selectedUser.lastLogin) : '-'}</p>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <p className="text-sm text-gray-400 mb-1">{isRTL ? 'المدينة' : 'City'}</p>
                      <p className="text-white font-medium">{selectedUser.city || '-'}</p>
                    </div>
                  </div>

                  {/* Statistics */}
                  <div className="mt-6">
                    <h4 className="text-md font-semibold text-white mb-4">
                      {isRTL ? 'الإحصائيات' : 'Statistics'}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gray-700 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-blue-400">{selectedUser.totalBookings || 0}</p>
                        <p className="text-sm text-gray-400">{isRTL ? 'إجمالي الحجوزات' : 'Total Bookings'}</p>
                      </div>
                      <div className="bg-gray-700 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-green-400">{selectedUser.totalEquipment || 0}</p>
                        <p className="text-sm text-gray-400">{isRTL ? 'المعدات' : 'Equipment'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'bookings' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">
                    {isRTL ? 'سجل الحجوزات' : 'Booking History'}
                  </h3>
                  {userBookings.map((booking) => (
                    <div key={booking.id} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-white">{booking.equipmentName}</h4>
                          <p className="text-sm text-gray-400">
                            {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                          </p>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(booking.status)}
                          <p className="text-white font-medium mt-1">{formatCurrency(booking.amount)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'equipment' && selectedUser.role === 'owner' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">
                    {isRTL ? 'المعدات المملوكة' : 'Owned Equipment'}
                  </h3>
                  {userEquipment.map((equipment) => (
                    <div key={equipment.id} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-white">{equipment.name}</h4>
                          <p className="text-sm text-gray-400">{equipment.category}</p>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(equipment.status)}
                          <p className="text-white font-medium mt-1">{formatCurrency(equipment.revenue)}</p>
                          <p className="text-xs text-gray-400">{equipment.bookings} bookings</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'documents' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">
                    {isRTL ? 'الوثائق المرفوعة' : 'Uploaded Documents'}
                  </h3>
                  {userDocuments.map((doc) => (
                    <div key={doc.id} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-white">{doc.name}</h4>
                          <p className="text-sm text-gray-400 capitalize">{doc.type}</p>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(doc.status)}
                          <p className="text-xs text-gray-400 mt-1">{formatDate(doc.uploadDate)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">
                      {isRTL ? 'ملاحظات الإدارة' : 'Admin Notes'}
                    </h3>
                    <Button variant="accent" size="sm">
                      <FontAwesomeIcon icon={faPlus} className="h-4 w-4 mr-2" />
                      <span className="text-sm">
                        {isRTL ? 'إضافة ملاحظة' : 'Add Note'}
                      </span>
                    </Button>
                  </div>
                  {userNotes.map((note) => (
                    <div key={note.id} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-white text-sm">{note.text}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-gray-400">{note.author}</span>
                            <span className="text-xs text-gray-500">•</span>
                            <span className="text-xs text-gray-400">{formatDate(note.date)}</span>
                          </div>
                        </div>
                        <span className={cn(
                          'px-2 py-1 rounded text-xs font-medium',
                          note.type === 'success' ? 'bg-green-500 text-white' :
                          note.type === 'warning' ? 'bg-yellow-500 text-black' :
                          'bg-blue-500 text-white'
                        )}>
                          {note.type === 'success' ? (isRTL ? 'إيجابي' : 'Success') :
                           note.type === 'warning' ? (isRTL ? 'تحذير' : 'Warning') :
                           (isRTL ? 'معلومات' : 'Info')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
              )}

      {/* Add User Modal */}
      <AddUserModal
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        onUserAdded={handleUserAdded}
      />
      </div>
  );
};

export default UsersManagement;