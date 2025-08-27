'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { userService } from '@/services/userService';
import { User } from '@/types';
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
  const [error, setError] = useState<string | null>(null);

  // Load users from API
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const response = await userService.getUsers();
        
        // Handle the actual API response structure
        const responseData = response as any; // Cast to handle actual API structure
        
        if (responseData && responseData.users && Array.isArray(responseData.users)) {
          setUsers(responseData.users);
          setError(null);
        } else if (responseData && responseData.data && responseData.data.data && Array.isArray(responseData.data.data)) {
          // Fallback for expected API structure
          setUsers(responseData.data.data);
          setError(null);
        } else {
          // Fallback to empty array if response structure is unexpected
          setUsers([]);
          setError('Unexpected response structure from API');
          console.error('Unexpected response structure:', responseData);
        }
      } catch (err) {
        setError('Failed to load users');
        console.error('Error loading users:', err);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  // Helper function to get user display name
  const getUserDisplayName = (user: User) => {
    return `${user.firstName} ${user.lastName}`.trim();
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activityFilter, setActivityFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('bookings');

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
      const matchesSearch = (`${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      
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
    if (role === 'owner') {
      return (
        <span className="px-2 py-1 bg-yellow-500 text-black text-xs rounded-full font-medium">
          {isRTL ? 'مالك المعدات' : 'Owner'}
        </span>
      );
    }
    if (role === 'renter') {
      return (
        <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full font-medium">
          {isRTL ? 'مستأجر' : 'Renter'}
        </span>
      );
    }
    if (role === 'admin') {
      return (
        <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full font-medium">
          {isRTL ? 'مشرف' : 'Admin'}
        </span>
      );
    }
    return null;
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
      {/* Export Button - Move to top of content */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-end mb-6">
          <button className="flex items-center gap-2 px-4 py-2 bg-awnash-accent hover:bg-awnash-accent-hover text-white rounded-2xl transition-colors shadow-lg">
            <FontAwesomeIcon icon={faDownload} className="h-4 w-4" />
            <span className="text-sm font-medium">
              {isRTL ? 'تصدير' : 'Export'}
            </span>
          </button>
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
                            {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-white">{user.full_name || 'Unknown User'}</p>
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
                        <p className="text-sm text-white">{user.email}</p>
                        <p className="text-sm text-gray-400">{user.avatar}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {getStatusBadge(user.status)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-xs text-gray-400">{formatDate(user.createdAt)}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-xs text-gray-400">{formatDate(user.lastLogin || '')}</p>
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
          
          {/* Pagination would go here */}
          <div className="bg-gray-700 px-6 py-4 border-t border-gray-600">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">
                {isRTL ? `عرض ${filteredUsers.length} من أصل ${users.length} مستخدم` : `Showing ${filteredUsers.length} of ${users.length} users`}
              </p>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm">
                  {isRTL ? 'السابق' : 'Previous'}
                </button>
                <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">
                  {isRTL ? 'التالي' : 'Next'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Drawer */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={cn('bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-4xl h-[90vh] overflow-hidden', isRTL ? 'font-arabic' : 'font-montserrat')}>
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {selectedUser.full_name ? selectedUser.full_name.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">{selectedUser.full_name || 'Unknown User'}</h2>
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
            <div className="border-b border-gray-700">
              <div className="flex">
                {[
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
            <div className="p-6 h-full overflow-y-auto">
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
                    <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                      <FontAwesomeIcon icon={faPlus} className="h-4 w-4 text-white" />
                      <span className="text-sm text-white">
                        {isRTL ? 'إضافة ملاحظة' : 'Add Note'}
                      </span>
                    </button>
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
      </div>
  );
};

export default UsersManagement;