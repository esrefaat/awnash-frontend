'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, faSearch, faFilter, faPlus, faEdit, faTrash, faUserShield, 
  faCheck, faTimes, faEye, faKey, faBan, faUserCheck, faDownload,
  faSort, faSortUp, faSortDown, faCalendarAlt, faEnvelope, faPhone,
  faMapMarkerAlt, faIdCard, faCrown, faUser, faBuilding, faSave
} from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { usePermissions } from '@/hooks/usePermissions';
import { SuperAdminOnly } from '@/components/PermissionGuard';
import { usersService, User, CreateUserData } from '@/services/usersService';
import PermissionsMatrixModal from '@/components/admin/PermissionsMatrixModal';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  isActive: boolean;
}

const UserManagement: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { user: currentUser, permissions: currentPermissions } = usePermissions();
  
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState<keyof User>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  // Refs for infinite scrolling
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);
  const [userStats, setUserStats] = useState({
    total: 0,
    active: 0,
    verified: 0,
    admins: 0,
    owners: 0,
    renters: 0,
    hybrid: 0
  });
  const [createUserData, setCreateUserData] = useState<CreateUserData>({
    fullName: '',
    mobileNumber: '',
    email: '',
    role: 'renter',
    isActive: true
  });
  const [isCreating, setIsCreating] = useState(false);

  // Role options for filters and forms
  const roles = [
    { id: '1', name: 'super_admin', description: 'Full system access', permissions: [], userCount: 1, isActive: true },
    { id: '2', name: 'booking_admin', description: 'Booking management', permissions: [], userCount: 1, isActive: true },
    { id: '3', name: 'content_admin', description: 'Content management', permissions: [], userCount: 1, isActive: true },
    { id: '4', name: 'support_agent', description: 'Customer support', permissions: [], userCount: 1, isActive: true },
    { id: '5', name: 'owner', description: 'Equipment owner', permissions: [], userCount: 1, isActive: true },
    { id: '6', name: 'renter', description: 'Equipment renter', permissions: [], userCount: 2, isActive: true },
    { id: '7', name: 'hybrid', description: 'Owner and renter', permissions: [], userCount: 1, isActive: true }
  ];

  // Load users data from API with infinite scrolling support
  const loadUsers = useCallback(async (page: number = 1, append: boolean = false) => {
    if (loadingRef.current) return;
    
    try {
      loadingRef.current = true;
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      
      const data = await usersService.getAllUsers({
        page,
        limit: itemsPerPage,
        search: searchTerm,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        sortBy: sortField,
        sortOrder: sortDirection,
      });
      
      // Safety check to ensure data is valid
      if (data && data.users && Array.isArray(data.users)) {
        if (append) {
          setUsers(prev => [...prev, ...data.users]);
        } else {
          setUsers(data.users);
        }
        setTotalUsers(data.total || data.users.length);
        setTotalPages(data.totalPages || 1);
        setCurrentPage(page);
        setHasMore(page < (data.totalPages || 1));
      } else {
        throw new Error('Invalid data format received from API');
      }
    } catch (error) {
      console.error('Failed to load users:', error);
      if (!append) {
        setUsers([]);
        setTotalUsers(0);
        setTotalPages(1);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
      loadingRef.current = false;
    }
  }, [itemsPerPage, searchTerm, roleFilter, statusFilter, sortField, sortDirection]);

  // Load more users for infinite scroll
  const loadMoreUsers = useCallback(() => {
    if (!hasMore || loadingRef.current) return;
    loadUsers(currentPage + 1, true);
  }, [loadUsers, currentPage, hasMore]);

  // Initial load and reload when filters change
  useEffect(() => {
    setCurrentPage(1);
    setHasMore(true);
    loadUsers(1, false);
    loadUserStats();
  }, [searchTerm, roleFilter, statusFilter, sortField, sortDirection]);

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

  const loadUserStats = async () => {
    try {
      const stats = await usersService.getUserStats();
      if (stats) {
        setUserStats(stats);
      }
    } catch (error) {
      console.error('Failed to load user stats:', error);
      // Keep default stats on error
      setUserStats({
        total: 0,
        active: 0,
        verified: 0,
        admins: 0,
        owners: 0,
        renters: 0,
        hybrid: 0
      });
    }
  };

  // Client-side filtering is no longer needed as we filter on the server

  const handleSort = (field: keyof User) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: keyof User) => {
    if (sortField !== field) return faSort;
    return sortDirection === 'asc' ? faSortUp : faSortDown;
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      'super_admin': 'bg-red-600 text-white',
      'booking_admin': 'bg-blue-600 text-white',
      'content_admin': 'bg-green-600 text-white',
      'support_agent': 'bg-yellow-600 text-black',
      'owner': 'bg-purple-600 text-white',
      'renter': 'bg-indigo-600 text-white',
      'hybrid': 'bg-pink-600 text-white'
    };
    return colors[role] || 'bg-gray-600 text-white';
  };

  const getRoleIcon = (role: string) => {
    const icons: Record<string, any> = {
      'super_admin': faCrown,
      'booking_admin': faUserShield,
      'content_admin': faEdit,
      'support_agent': faUser,
      'owner': faBuilding,
      'renter': faUser,
      'hybrid': faUsers
    };
    return icons[role] || faUser;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    const currentPageUsers = getCurrentPageUsers();
    const allSelected = currentPageUsers.every(user => selectedUsers.includes(user.id));
    
    if (allSelected) {
      setSelectedUsers(prev => prev.filter(id => !currentPageUsers.map(u => u.id).includes(id)));
    } else {
      setSelectedUsers(prev => [...new Set([...prev, ...currentPageUsers.map(u => u.id)])]);
    }
  };

  const getCurrentPageUsers = () => {
    // With infinite scroll, return all loaded users
    return users || [];
  };

  const handleBulkAction = async (action: string) => {
    try {
      await usersService.bulkUpdateUsers(selectedUsers, action as 'activate' | 'deactivate' | 'delete');
      setSelectedUsers([]);
      await loadUsers(1, false); // Reload users after bulk action
    } catch (error) {
      console.error('Bulk action failed:', error);
      alert('Failed to perform bulk action. Please try again.');
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleManageRoles = (user: User) => {
    setSelectedUser(user);
    setShowRoleModal(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await usersService.deleteUser(userId);
        await loadUsers(1, false); // Reload users after deletion
      } catch (error) {
        console.error('Delete failed:', error);
        alert('Failed to delete user. Please try again.');
      }
    }
  };

  const handleToggleUserStatus = async (userId: string) => {
    try {
      console.log('Toggling status for user:', userId);
      
      // Make the API call
      const result = await usersService.toggleUserStatus(userId);
      console.log('Toggle result:', result);
      
      // Reload users to get updated data
      await loadUsers(1, false);
      
      // Show success message
      alert('User status updated successfully!');
    } catch (error) {
      console.error('Status toggle failed:', error);
      
      // Better error handling
      let errorMessage = 'Failed to toggle user status. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          errorMessage = 'Authentication required. Please log in again.';
        } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
          errorMessage = 'You do not have permission to perform this action.';
        } else if (error.message.includes('404')) {
          errorMessage = 'User not found.';
        } else if (error.message.includes('500')) {
          errorMessage = 'Server error. Please try again later.';
        }
      }
      
      alert(errorMessage);
    }
  };

  // Handle saving user permissions
  const handleSaveUserPermissions = async (permissions: Record<string, boolean>) => {
    if (!selectedUser) return;

    try {
      await usersService.updateUserPermissions(selectedUser.id, permissions);
      await loadUsers(1, false); // Reload users to get updated data
      setShowRoleModal(false);
      setSelectedUser(null);
      alert('User permissions updated successfully!');
    } catch (error) {
      console.error('Permission update failed:', error);
      alert('Failed to update user permissions. Please try again.');
    }
  };

  const handleCreateUser = async () => {
    try {
      setIsCreating(true);
      await usersService.createUser(createUserData);
      setShowCreateModal(false);
      setCreateUserData({
        fullName: '',
        mobileNumber: '',
        email: '',
        role: 'renter',
        isActive: true
      });
      await loadUsers(1, false); // Reload users after creation
      await loadUserStats(); // Reload stats
    } catch (error) {
      console.error('Create user failed:', error);
      alert('Failed to create user. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateUserChange = (field: keyof CreateUserData, value: any) => {
    setCreateUserData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading users...</div>
      </div>
    );
  }

  return (
    <SuperAdminOnly fallback={
      <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
        <div className="max-w-2xl mx-auto p-8 bg-gray-800 border border-gray-700 rounded-xl text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h1>
          <p className="text-gray-300 mb-4">You need super admin privileges to access user management.</p>
          <div className="text-sm text-gray-400">
            Current user: {currentUser?.email || 'Not logged in'}<br/>
            Current role: {currentUser?.role || 'No role'}<br/>
            Permissions: {currentPermissions.length} total
          </div>
        </div>
      </div>
    }>
      <div className={`min-h-screen bg-gray-900 ${isRTL ? 'font-arabic' : 'font-montserrat'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  {isRTL ? 'إدارة المستخدمين' : 'User Management'}
                </h1>
                <p className="text-gray-400">
                  {isRTL ? 'إدارة حسابات المستخدمين والأدوار والصلاحيات' : 'Manage user accounts, roles, and permissions'}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => setShowCreateModal(true)}
                  variant="accent"
                >
                  <FontAwesomeIcon icon={faPlus} className={`${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {isRTL ? 'إضافة مستخدم' : 'Add User'}
                </Button>
                <Button variant="success">
                  <FontAwesomeIcon icon={faDownload} className={`${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {isRTL ? 'تصدير' : 'Export'}
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-600 rounded-lg">
                    <FontAwesomeIcon icon={faUsers} className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-gray-400 text-sm">Total Users</p>
                    <p className="text-2xl font-bold text-white">{userStats.total}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center">
                  <div className="p-3 bg-green-600 rounded-lg">
                    <FontAwesomeIcon icon={faUserCheck} className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-gray-400 text-sm">Active Users</p>
                    <p className="text-2xl font-bold text-white">{userStats.active}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-600 rounded-lg">
                    <FontAwesomeIcon icon={faIdCard} className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-gray-400 text-sm">Verified Users</p>
                    <p className="text-2xl font-bold text-white">{userStats.verified}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-600 rounded-lg">
                    <FontAwesomeIcon icon={faUserShield} className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-gray-400 text-sm">Admin Users</p>
                    <p className="text-2xl font-bold text-white">{userStats.admins}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg mb-6">
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="relative">
                  <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder={isRTL ? 'البحث عن المستخدمين...' : 'Search users...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Role Filter */}
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">{isRTL ? 'جميع الأدوار' : 'All Roles'}</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.name}>
                      {role.name.replace('_', ' ').toUpperCase()}
                    </option>
                  ))}
                </select>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">{isRTL ? 'جميع الحالات' : 'All Status'}</option>
                  <option value="active">{isRTL ? 'نشط' : 'Active'}</option>
                  <option value="inactive">{isRTL ? 'غير نشط' : 'Inactive'}</option>
                  <option value="verified">{isRTL ? 'موثق' : 'Verified'}</option>
                  <option value="unverified">{isRTL ? 'غير موثق' : 'Unverified'}</option>
                </select>

                {/* Bulk Actions */}
                {selectedUsers.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-400">
                      {selectedUsers.length} selected
                    </span>
                    <Button
                      onClick={() => handleBulkAction('activate')}
                      variant="success"
                      size="sm"
                    >
                      Activate
                    </Button>
                    <Button
                      onClick={() => handleBulkAction('deactivate')}
                      variant="destructive"
                      size="sm"
                    >
                      Deactivate
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <input
                        type="checkbox"
                        checked={getCurrentPageUsers().length > 0 && getCurrentPageUsers().every(user => selectedUsers.includes(user.id))}
                        onChange={handleSelectAll}
                        className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th 
                      className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white"
                      onClick={() => handleSort('fullName')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>{isRTL ? 'الاسم' : 'Name'}</span>
                        <FontAwesomeIcon icon={getSortIcon('fullName')} className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      {isRTL ? 'معلومات الاتصال' : 'Contact'}
                    </th>
                    <th 
                      className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white"
                      onClick={() => handleSort('role')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>{isRTL ? 'الدور' : 'Role'}</span>
                        <FontAwesomeIcon icon={getSortIcon('role')} className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      {isRTL ? 'الحالة' : 'Status'}
                    </th>
                    <th 
                      className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white"
                      onClick={() => handleSort('createdAt')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>{isRTL ? 'تاريخ الإنشاء' : 'Created'}</span>
                        <FontAwesomeIcon icon={getSortIcon('createdAt')} className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      {isRTL ? 'الإجراءات' : 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {getCurrentPageUsers().map((user) => (
                    <tr key={user.id} className="hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleSelectUser(user.id)}
                          className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center">
                              <FontAwesomeIcon icon={getRoleIcon(user.role)} className="h-5 w-5 text-gray-300" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">{user.fullName}</div>
                            <div className="text-sm text-gray-400">ID: {user.id.slice(0, 8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-white">
                          <div className="flex items-center mb-1">
                            <FontAwesomeIcon icon={faPhone} className="h-3 w-3 text-gray-400 mr-2" />
                            {user.mobileNumber}
                          </div>
                          {user.email && (
                            <div className="flex items-center mb-1">
                              <FontAwesomeIcon icon={faEnvelope} className="h-3 w-3 text-gray-400 mr-2" />
                              {user.email}
                            </div>
                          )}
                          {user.city && (
                            <div className="flex items-center">
                              <FontAwesomeIcon icon={faMapMarkerAlt} className="h-3 w-3 text-gray-400 mr-2" />
                              {user.city}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                          <FontAwesomeIcon icon={getRoleIcon(user.role)} className="h-3 w-3 mr-1" />
                          {user.role.replace('_', ' ').toUpperCase()}
                        </span>
                        <div className="text-xs text-gray-400 mt-1">
                          {user.permissions.length} permissions
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col space-y-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            user.isActive ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                          }`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            user.isVerified ? 'bg-blue-600 text-white' : 'bg-yellow-600 text-black'
                          }`}>
                            {user.isVerified ? 'Verified' : 'Unverified'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        <div>{formatDate(user.createdAt)}</div>
                        {user.lastLogin && (
                          <div className="text-xs text-gray-500">
                            Last: {formatDate(user.lastLogin)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={() => handleEditUser(user)}
                            variant="ghost"
                            size="icon"
                            className="text-gray-400 hover:text-blue-400"
                            title="Edit User"
                          >
                            <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleManageRoles(user)}
                            variant="ghost"
                            size="icon"
                            className="text-gray-400 hover:text-purple-400"
                            title="Manage Roles"
                          >
                            <FontAwesomeIcon icon={faUserShield} className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleToggleUserStatus(user.id)}
                            variant="ghost"
                            size="icon"
                            className={
                              user.isActive 
                                ? 'text-gray-400 hover:text-red-400' 
                                : 'text-gray-400 hover:text-green-400'
                            }
                            title={user.isActive ? 'Deactivate User' : 'Activate User'}
                          >
                            <FontAwesomeIcon icon={user.isActive ? faBan : faUserCheck} className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteUser(user.id)}
                            variant="ghost"
                            size="icon"
                            className="text-gray-400 hover:text-red-400"
                            title="Delete User"
                          >
                            <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                          </Button>
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
                <div className="text-sm text-gray-300 text-center">
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

        {/* Create User Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-md">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <h2 className="text-xl font-bold text-white">
                  {isRTL ? 'إضافة مستخدم جديد' : 'Add New User'}
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {isRTL ? 'الاسم الكامل' : 'Full Name'} *
                    </label>
                    <input
                      type="text"
                      value={createUserData.fullName}
                      onChange={(e) => handleCreateUserChange('fullName', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500"
                      placeholder={isRTL ? 'أدخل الاسم الكامل' : 'Enter full name'}
                      required
                    />
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {isRTL ? 'رقم الجوال' : 'Mobile Number'} *
                    </label>
                    <input
                      type="tel"
                      value={createUserData.mobileNumber}
                      onChange={(e) => handleCreateUserChange('mobileNumber', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500"
                      placeholder={isRTL ? '+966xxxxxxxxx' : '+966xxxxxxxxx'}
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {isRTL ? 'البريد الإلكتروني' : 'Email'} ({isRTL ? 'اختياري' : 'Optional'})
                    </label>
                    <input
                      type="email"
                      value={createUserData.email}
                      onChange={(e) => handleCreateUserChange('email', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500"
                      placeholder={isRTL ? 'أدخل البريد الإلكتروني' : 'Enter email address'}
                    />
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {isRTL ? 'الدور' : 'Role'} *
                    </label>
                    <select
                      value={createUserData.role}
                      onChange={(e) => handleCreateUserChange('role', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500"
                      required
                    >
                      <option value="super_admin">Super Admin</option>
                      <option value="booking_admin">Booking Admin</option>
                      <option value="content_admin">Content Admin</option>
                      <option value="support_agent">Support Agent</option>
                      <option value="owner">Owner</option>
                      <option value="renter">Renter</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>

                  {/* Status Toggle */}
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-300">
                      {isRTL ? 'الحالة' : 'Status'}
                    </label>
                    <div className="flex items-center">
                      <span className={`text-sm mr-3 ${createUserData.isActive ? 'text-green-400' : 'text-red-400'}`}>
                        {createUserData.isActive ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'غير نشط' : 'Suspended')}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCreateUserChange('isActive', !createUserData.isActive)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          createUserData.isActive ? 'bg-green-600' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            createUserData.isActive ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Optional Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {isRTL ? 'كلمة المرور المؤقتة' : 'Temporary Password'} ({isRTL ? 'اختياري' : 'Optional'})
                    </label>
                    <input
                      type="password"
                      value={createUserData.password || ''}
                      onChange={(e) => handleCreateUserChange('password', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500"
                      placeholder={isRTL ? 'اتركه فارغاً لإنشاء كلمة مرور تلقائية' : 'Leave empty for auto-generated password'}
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-700">
                <Button
                  onClick={() => setShowCreateModal(false)}
                  variant="ghost"
                  className="text-gray-400 hover:text-white"
                  disabled={isCreating}
                >
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button
                  onClick={handleCreateUser}
                  disabled={isCreating || !createUserData.fullName || !createUserData.mobileNumber}
                  variant="default"
                >
                  {isCreating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                      {isRTL ? 'جاري الإنشاء...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faPlus} className={`${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {isRTL ? 'إنشاء المستخدم' : 'Create User'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-lg">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <h2 className="text-xl font-bold text-white">
                  {isRTL ? 'تعديل المستخدم' : 'Edit User'}
                </h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {isRTL ? 'الاسم الكامل' : 'Full Name'} *
                    </label>
                    <input
                      type="text"
                      value={selectedUser.fullName}
                      onChange={(e) => setSelectedUser(prev => prev ? {...prev, fullName: e.target.value} : null)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500"
                      placeholder={isRTL ? 'أدخل الاسم الكامل' : 'Enter full name'}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {isRTL ? 'البريد الإلكتروني' : 'Email'}
                    </label>
                    <input
                      type="email"
                      value={selectedUser.email || ''}
                      onChange={(e) => setSelectedUser(prev => prev ? {...prev, email: e.target.value} : null)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500"
                      placeholder={isRTL ? 'أدخل البريد الإلكتروني' : 'Enter email address'}
                    />
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {isRTL ? 'رقم الهاتف' : 'Mobile Number'}
                    </label>
                    <input
                      type="tel"
                      value={selectedUser.mobileNumber || ''}
                      onChange={(e) => setSelectedUser(prev => prev ? {...prev, mobileNumber: e.target.value} : null)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500"
                      placeholder={isRTL ? 'أدخل رقم الهاتف' : 'Enter mobile number'}
                    />
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {isRTL ? 'المدينة' : 'City'}
                    </label>
                    <input
                      type="text"
                      value={selectedUser.city || ''}
                      onChange={(e) => setSelectedUser(prev => prev ? {...prev, city: e.target.value} : null)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500"
                      placeholder={isRTL ? 'أدخل المدينة' : 'Enter city'}
                    />
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {isRTL ? 'الدور' : 'Role'} *
                    </label>
                    <select
                      value={selectedUser.role}
                      onChange={(e) => setSelectedUser(prev => prev ? {...prev, role: e.target.value} : null)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500"
                    >
                      <option value="super_admin">Super Admin</option>
                      <option value="booking_admin">Booking Admin</option>
                      <option value="content_admin">Content Admin</option>
                      <option value="support_agent">Support Agent</option>
                      <option value="owner">Owner</option>
                      <option value="renter">Renter</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>

                  {/* Status Toggle */}
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-300">
                      {isRTL ? 'الحالة' : 'Status'}
                    </label>
                    <div className="flex items-center">
                      <span className={`text-sm mr-3 ${selectedUser.isActive ? 'text-green-400' : 'text-red-400'}`}>
                        {selectedUser.isActive ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'غير نشط' : 'Suspended')}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedUser(prev => prev ? {...prev, isActive: !prev.isActive} : null)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          selectedUser.isActive ? 'bg-green-600' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            selectedUser.isActive ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Permission Summary */}
                  <div className="border-t border-gray-600 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Current Permissions:</span>
                      <span className="text-white font-medium">{selectedUser.permissions?.length || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-700">
                <Button
                  onClick={() => setShowEditModal(false)}
                  variant="ghost"
                  className="text-gray-400 hover:text-white"
                >
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button
                  onClick={() => {
                    setShowEditModal(false);
                    setShowRoleModal(true);
                  }}
                  variant="secondary"
                  className="bg-purple-600 hover:bg-purple-700 mr-2"
                >
                  <FontAwesomeIcon icon={faUserShield} className={`${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {isRTL ? 'إدارة الصلاحيات' : 'Manage Permissions'}
                </Button>
                <Button
                  onClick={async () => {
                    try {
                      if (selectedUser) {
                        await usersService.updateUser(selectedUser.id, {
                          fullName: selectedUser.fullName,
                          email: selectedUser.email,
                          mobileNumber: selectedUser.mobileNumber,
                          city: selectedUser.city,
                          role: selectedUser.role,
                          isActive: selectedUser.isActive
                        });
                        setShowEditModal(false);
                        await loadUsers(1, false);
                      }
                    } catch (error) {
                      console.error('Failed to update user:', error);
                      alert('Failed to update user. Please try again.');
                    }
                  }}
                  variant="default"
                >
                  <FontAwesomeIcon icon={faSave} className={`${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {isRTL ? 'حفظ التغييرات' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Permissions Matrix Modal */}
        {showRoleModal && selectedUser && (
          <PermissionsMatrixModal
            user={selectedUser}
            isOpen={showRoleModal}
            onClose={() => setShowRoleModal(false)}
            onSave={handleSaveUserPermissions}
          />
        )}
      </div>
    </SuperAdminOnly>
  );
};

export default UserManagement; 