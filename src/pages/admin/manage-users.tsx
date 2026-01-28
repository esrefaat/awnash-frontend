import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Dialog } from '@/components/ui/Dialog';
import { Tooltip } from '@/components/ui/Tooltip';
import { usePermissions } from '@/hooks/usePermissions';
import { PermissionGuard, SuperAdminOnly } from '@/components/PermissionGuard';

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

interface UserFilters {
  role: string;
  status: string;
  search: string;
  dateFrom: string;
  dateTo: string;
}

const ManageUsers: React.FC = () => {
  const { hasPermission } = usePermissions();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const [filters, setFilters] = useState<UserFilters>({
    role: '',
    status: '',
    search: '',
    dateFrom: '',
    dateTo: ''
  });

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockUsers: User[] = [
      {
        id: '1',
        fullName: 'Ahmed Al-Rashid',
        mobileNumber: '+966500000001',
        email: 'admin@awnash.net',
        role: 'super_admin',
        roles: ['super_admin'],
        permissions: ['system:configure', 'roles:manage', 'user:create', 'user:delete'],
        isVerified: true,
        isActive: true,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-12-06T12:00:00Z',
        city: 'Riyadh',
        lastLogin: '2024-12-06T11:45:00Z'
      },
      {
        id: '2',
        fullName: 'Fatima Al-Zahra',
        mobileNumber: '+966500000002',
        email: 'booking.admin@awnash.net',
        role: 'booking_admin',
        roles: ['booking_admin'],
        permissions: ['booking:create', 'booking:approve', 'payment:read'],
        isVerified: true,
        isActive: true,
        createdAt: '2024-02-20T14:15:00Z',
        updatedAt: '2024-12-05T16:30:00Z',
        city: 'Jeddah',
        lastLogin: '2024-12-05T16:20:00Z'
      },
      {
        id: '3',
        fullName: 'Omar Hassan',
        mobileNumber: '+966500000003',
        email: 'content@awnash.net',
        role: 'content_admin',
        roles: ['content_admin'],
        permissions: ['equipment:read', 'equipment:update', 'lead:manage'],
        isVerified: true,
        isActive: false,
        createdAt: '2024-03-10T09:00:00Z',
        updatedAt: '2024-11-20T10:15:00Z',
        city: 'Dammam',
        lastLogin: '2024-11-20T10:10:00Z'
      },
      {
        id: '4',
        fullName: 'Sarah Al-Mutairi',
        mobileNumber: '+966500000004',
        email: 'support@awnash.net',
        role: 'support_agent',
        roles: ['support_agent'],
        permissions: ['user:read', 'booking:read', 'equipment:read'],
        isVerified: true,
        isActive: true,
        createdAt: '2024-04-05T11:45:00Z',
        updatedAt: '2024-12-04T13:20:00Z',
        city: 'Mecca',
        lastLogin: '2024-12-04T13:15:00Z'
      }
    ];

    setUsers(mockUsers);
    setFilteredUsers(mockUsers);
    setLoading(false);
  }, []);

  // Filter users based on current filters
  useEffect(() => {
    let filtered = users;

    if (filters.role) {
      filtered = filtered.filter(user => user.role === filters.role);
    }

    if (filters.status) {
      filtered = filtered.filter(user => 
        filters.status === 'active' ? user.isActive : !user.isActive
      );
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(user => 
        user.fullName.toLowerCase().includes(searchLower) ||
        user.mobileNumber.includes(searchLower) ||
        (user.email && user.email.toLowerCase().includes(searchLower))
      );
    }

    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [filters, users]);

  const roleColors: Record<string, string> = {
    super_admin: 'bg-purple-900 text-purple-300',
    booking_admin: 'bg-blue-900 text-blue-300',
    content_admin: 'bg-green-900 text-green-300',
    support_agent: 'bg-yellow-900 text-yellow-300',
    owner: 'bg-orange-900 text-orange-300',
    renter: 'bg-gray-700 text-gray-300',
    hybrid: 'bg-indigo-900 text-indigo-300'
  };

  const roleOptions = [
    { value: '', label: 'All Roles' },
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'booking_admin', label: 'Booking Admin' },
    { value: 'content_admin', label: 'Content Admin' },
    { value: 'support_agent', label: 'Support Agent' },
    { value: 'owner', label: 'Equipment Owner' },
    { value: 'renter', label: 'Renter' },
    { value: 'hybrid', label: 'Hybrid' }
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'suspended', label: 'Suspended' }
  ];

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setIsDetailDrawerOpen(true);
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setIsCreateModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(prev => prev.filter(user => user.id !== userId));
    }
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, isActive: !user.isActive }
        : user
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + pageSize);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-64 mb-6"></div>
            <div className="bg-gray-800 rounded-2xl p-6">
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-16 bg-gray-700 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SuperAdminOnly fallback={
      <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
        <Card className="max-w-2xl mx-auto p-8 bg-gray-800 border-gray-700 text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h1>
          <p className="text-gray-300">You need super admin privileges to access user management.</p>
        </Card>
      </div>
    }>
      <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-100 font-montserrat">Manage Users</h1>
              <p className="text-gray-400 mt-2">
                View, create, and manage admin dashboard users with role-based permissions
              </p>
            </div>
            
            <PermissionGuard permission="user:create">
              <Button 
                onClick={handleCreateUser}
                className="bg-[#FFCC00] hover:bg-[#E6B800] text-black font-semibold px-6 py-3 rounded-2xl shadow-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add New User
              </Button>
            </PermissionGuard>
          </div>

          {/* Filters */}
          <Card className="bg-gray-800 border-gray-700 p-6 mb-6 rounded-2xl shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
                <Input
                  placeholder="Search by name or mobile..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="bg-gray-700 border-gray-600 text-gray-100 rounded-xl"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                <select
                  value={filters.role}
                  onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
                  className="bg-gray-700 border-gray-600 text-gray-100 rounded-xl w-full p-2"
                >
                  {roleOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="bg-gray-700 border-gray-600 text-gray-100 rounded-xl w-full p-2"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => setFilters({ role: '', status: '', search: '', dateFrom: '', dateTo: '' })}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 rounded-xl"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </Card>

          {/* Users Table */}
          <Card className="bg-gray-800 border-gray-700 rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-750 border-b border-gray-600">
                  <tr>
                    <th className="text-left p-4 font-semibold text-gray-200">User</th>
                    <th className="text-left p-4 font-semibold text-gray-200">Role</th>
                    <th className="text-left p-4 font-semibold text-gray-200">Contact</th>
                    <th className="text-left p-4 font-semibold text-gray-200">Status</th>
                    <th className="text-left p-4 font-semibold text-gray-200">Created</th>
                    <th className="text-left p-4 font-semibold text-gray-200">Last Login</th>
                    <th className="text-right p-4 font-semibold text-gray-200">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((user) => (
                    <tr 
                      key={user.id}
                      onClick={() => handleUserClick(user)}
                      className="border-b border-gray-700 hover:bg-gray-750 cursor-pointer transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-[#0073E6] rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {user.fullName.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-200">{user.fullName}</p>
                            <p className="text-sm text-gray-400">{user.city || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <Badge className={`${roleColors[user.role]} rounded-full px-3 py-1`}>
                          {user.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                      </td>
                      
                      <td className="p-4">
                        <div>
                          <p className="text-gray-200 font-mono text-sm">{user.mobileNumber}</p>
                          {user.email && (
                            <p className="text-gray-400 text-sm">{user.email}</p>
                          )}
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                          <span className={`text-sm ${user.isActive ? 'text-green-400' : 'text-red-400'}`}>
                            {user.isActive ? 'Active' : 'Suspended'}
                          </span>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <span className="text-gray-300 text-sm" title={formatDateTime(user.createdAt)}>
                          {formatDate(user.createdAt)}
                        </span>
                      </td>
                      
                      <td className="p-4">
                        {user.lastLogin ? (
                          <span className="text-gray-300 text-sm" title={formatDateTime(user.lastLogin)}>
                            {formatDate(user.lastLogin)}
                          </span>
                        ) : (
                          <span className="text-gray-500 text-sm">Never</span>
                        )}
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center justify-end space-x-2">
                          <PermissionGuard permission="user:update">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleUserStatus(user.id);
                              }}
                              className="text-gray-400 hover:text-[#FFCC00] p-2"
                              title="Toggle Status"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                  d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                              </svg>
                            </Button>
                          </PermissionGuard>
                          
                          <PermissionGuard permission="user:update">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditUser(user);
                              }}
                              className="text-gray-400 hover:text-[#0073E6] p-2"
                              title="Edit User"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </Button>
                          </PermissionGuard>
                          
                          <PermissionGuard permission="user:delete">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteUser(user.id);
                              }}
                              className="text-gray-400 hover:text-red-400 p-2"
                              title="Delete User"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </Button>
                          </PermissionGuard>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {paginatedUsers.length === 0 && (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  <p className="text-gray-400 text-lg">No users found</p>
                  <p className="text-gray-500 text-sm">Try adjusting your filters</p>
                </div>
              )}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="border-t border-gray-700 px-6 py-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-400">
                    Showing {startIndex + 1} to {Math.min(startIndex + pageSize, filteredUsers.length)} of {filteredUsers.length} users
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      Previous
                    </Button>
                    <span className="px-4 py-2 text-gray-300">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
        
                 {/* Simple User Detail Modal */}
         {selectedUser && isDetailDrawerOpen && (
           <Dialog open={isDetailDrawerOpen} onOpenChange={(open) => !open && setIsDetailDrawerOpen(false)}>
             <div className="bg-gray-800 p-6 max-w-2xl mx-auto rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-100">User Details</h2>
                <Button variant="ghost" onClick={() => setIsDetailDrawerOpen(false)} className="text-gray-400 hover:text-gray-200">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-[#0073E6] rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xl">
                      {selectedUser.fullName.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-100">{selectedUser.fullName}</h3>
                    <Badge className={`mt-2 rounded-full px-3 py-1 ${roleColors[selectedUser.role]}`}>
                      {selectedUser.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="block text-gray-400 mb-1">Mobile Number</label>
                    <p className="text-gray-200 font-mono">{selectedUser.mobileNumber}</p>
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">Email</label>
                    <p className="text-gray-200">{selectedUser.email || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">City</label>
                    <p className="text-gray-200">{selectedUser.city || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">Status</label>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${selectedUser.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className={`${selectedUser.isActive ? 'text-green-400' : 'text-red-400'}`}>
                        {selectedUser.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-600 pt-4">
                  <label className="block text-gray-400 mb-2">Permissions ({selectedUser.permissions.length})</label>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {selectedUser.permissions.map((permission) => (
                      <Badge
                        key={permission}
                        variant="outline"
                        className="border-gray-500 text-gray-300 text-xs"
                      >
                        {permission}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    onClick={() => {
                      setIsDetailDrawerOpen(false);
                      setIsEditModalOpen(true);
                    }}
                    className="flex-1 bg-[#0073E6] hover:bg-[#005BB5] text-white rounded-xl"
                  >
                    Edit User
                  </Button>
                  <Button
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700 rounded-xl"
                  >
                    View Audit Log
                  </Button>
                </div>
              </div>
            </div>
          </Dialog>
        )}
        
                 {/* Modal placeholders - would be implemented with actual modals */}
         {isCreateModalOpen && (
           <Dialog open={isCreateModalOpen} onOpenChange={(open) => !open && setIsCreateModalOpen(false)}>
             <div className="bg-gray-800 p-6 max-w-lg mx-auto rounded-2xl text-center">
               <h3 className="text-xl font-semibold text-gray-100 mb-4">Create User Modal</h3>
               <p className="text-gray-400 mb-6">
                 This would open the CreateUserModal component with a full form for adding new users.
               </p>
               <Button onClick={() => setIsCreateModalOpen(false)} className="bg-[#FFCC00] text-black">
                 Close
               </Button>
             </div>
           </Dialog>
         )}
         
         {isEditModalOpen && selectedUser && (
           <Dialog open={isEditModalOpen} onOpenChange={(open) => !open && setIsEditModalOpen(false)}>
             <div className="bg-gray-800 p-6 max-w-lg mx-auto rounded-2xl text-center">
               <h3 className="text-xl font-semibold text-gray-100 mb-4">Edit User Modal</h3>
               <p className="text-gray-400 mb-6">
                 This would open the EditUserModal component for editing {selectedUser.fullName}.
               </p>
               <Button onClick={() => setIsEditModalOpen(false)} className="bg-[#0073E6] text-white">
                 Close
               </Button>
             </div>
           </Dialog>
         )}
         
         {isPermissionsModalOpen && selectedUser && (
           <Dialog open={isPermissionsModalOpen} onOpenChange={(open) => !open && setIsPermissionsModalOpen(false)}>
             <div className="bg-gray-800 p-6 max-w-lg mx-auto rounded-2xl text-center">
               <h3 className="text-xl font-semibold text-gray-100 mb-4">Permissions Matrix</h3>
               <p className="text-gray-400 mb-6">
                 This would open the PermissionsMatrixModal component for managing {selectedUser.fullName}'s permissions.
               </p>
               <Button onClick={() => setIsPermissionsModalOpen(false)} className="bg-[#FFCC00] text-black">
                 Close
               </Button>
             </div>
           </Dialog>
         )}
      </div>
    </SuperAdminOnly>
  );
};

export default ManageUsers; 