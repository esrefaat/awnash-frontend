'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, 
  faSearch, 
  faFilter, 
  faDownload, 
  faPlus,
  faEye,
  faEdit,
  faTrash,
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faDollarSign,
  faCalendarAlt,
  faStar,
  faSort,
  faChartLine,
  faUserShield,
  faUserTie,
  faUserCog,
  faCrown
} from '@fortawesome/free-solid-svg-icons';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

// Mock user data
const usersData = [
  {
    id: 1,
    name: 'Ahmed Al-Rashid',
    email: 'ahmed.rashid@email.com',
    phone: '+966 50 123 4567',
    location: 'Riyadh, Saudi Arabia',
    role: 'Admin',
    status: 'Active',
    joinedDate: '2023-01-15',
    lastLogin: '2024-01-20',
    totalBookings: 45,
    totalSpent: 12500,
    rating: 4.8
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '+971 55 987 6543',
    location: 'Dubai, UAE',
    role: 'Equipment Owner',
    status: 'Active',
    joinedDate: '2023-03-22',
    lastLogin: '2024-01-19',
    totalBookings: 32,
    totalSpent: 8900,
    rating: 4.6
  },
  {
    id: 3,
    name: 'Mohammed Hassan',
    email: 'mohammed.h@email.com',
    phone: '+966 56 555 0123',
    location: 'Jeddah, Saudi Arabia',
    role: 'Renter',
    status: 'Active',
    joinedDate: '2023-05-10',
    lastLogin: '2024-01-18',
    totalBookings: 18,
    totalSpent: 5600,
    rating: 4.4
  },
  {
    id: 4,
    name: 'Lisa Chen',
    email: 'lisa.chen@email.com',
    phone: '+65 9876 5432',
    location: 'Singapore',
    role: 'Equipment Owner',
    status: 'Inactive',
    joinedDate: '2023-07-05',
    lastLogin: '2023-12-15',
    totalBookings: 8,
    totalSpent: 2200,
    rating: 4.2
  },
  {
    id: 5,
    name: 'Omar Al-Zahra',
    email: 'omar.zahra@email.com',
    phone: '+965 9988 7766',
    location: 'Kuwait City, Kuwait',
    role: 'Moderator',
    status: 'Active',
    joinedDate: '2023-09-18',
    lastLogin: '2024-01-21',
    totalBookings: 62,
    totalSpent: 18700,
    rating: 4.9
  }
];

const userRoleData = [
  { name: 'Renters', value: 45, color: '#3B82F6' },
  { name: 'Equipment Owners', value: 35, color: '#10B981' },
  { name: 'Moderators', value: 15, color: '#F59E0B' },
  { name: 'Admins', value: 5, color: '#EF4444' }
];

const userGrowthData = [
  { month: 'Jul', users: 120 },
  { month: 'Aug', users: 145 },
  { month: 'Sep', users: 189 },
  { month: 'Oct', users: 234 },
  { month: 'Nov', users: 298 },
  { month: 'Dec', users: 356 },
  { month: 'Jan', users: 412 }
];

const activityData = [
  { hour: '00', logins: 5 },
  { hour: '04', logins: 8 },
  { hour: '08', logins: 45 },
  { hour: '12', logins: 78 },
  { hour: '16', logins: 92 },
  { hour: '20', logins: 56 }
];

const ModernUsers: React.FC = () => {
  const router = useRouter();
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const filteredUsers = usersData
    .filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(user => statusFilter === 'All' || user.status === statusFilter)
    .filter(user => roleFilter === 'All' || user.role === roleFilter)
    .sort((a, b) => {
      let aValue = a[sortBy as keyof typeof a];
      let bValue = b[sortBy as keyof typeof b];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const StatCard = ({ title, value, change, icon, color }: any) => (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {change && (
            <p className="text-sm text-emerald-400 mt-1">+{change}% this month</p>
          )}
        </div>
        <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", color)}>
          <FontAwesomeIcon icon={icon} className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Admin': return faCrown;
      case 'Moderator': return faUserShield;
      case 'Equipment Owner': return faUserTie;
      default: return faUserCog;
    }
  };

  const getRoleBadge = (role: string) => {
    const styles = {
      Admin: 'bg-red-500/20 text-red-400 border border-red-500/30',
      Moderator: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
      'Equipment Owner': 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
      Renter: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
    };
    return `inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${styles[role as keyof typeof styles]}`;
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      Active: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
      Inactive: 'bg-red-500/20 text-red-400 border border-red-500/30',
      Pending: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
    };
    return `inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${styles[status as keyof typeof styles]}`;
  };

  const customTooltipStyle = {
    backgroundColor: '#111827',
    border: '1px solid #374151',
    borderRadius: '12px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    color: '#F9FAFB',
    fontSize: '14px',
    fontFamily: isRTL ? 'font-arabic' : 'font-montserrat'
  };

  return (
    <div className={cn("min-h-screen bg-gray-900 text-white space-y-6", isRTL ? 'font-arabic' : 'font-montserrat')}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            {isRTL ? 'إدارة المستخدمين' : 'User Management'}
          </h1>
          <p className="text-gray-400 mt-1">
            {isRTL ? 'إدارة مستخدمي المنصة وتحليل أنماط تفاعلهم' : 'Manage platform users and analyze their engagement patterns'}
          </p>
        </div>
        <div className={cn("flex items-center space-x-3", isRTL && "space-x-reverse")}>
          <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 hover:text-white transition-colors">
            <FontAwesomeIcon icon={faDownload} className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
            {isRTL ? 'تصدير المستخدمين' : 'Export Users'}
          </button>
          <button className="flex items-center px-4 py-2 text-sm font-medium text-black bg-awnash-primary rounded-lg hover:bg-awnash-primary/90 transition-colors">
            <FontAwesomeIcon icon={faPlus} className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
            {isRTL ? 'إضافة مستخدم' : 'Add User'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={isRTL ? 'إجمالي المستخدمين' : 'Total Users'}
          value={usersData.length.toLocaleString()}
          change="15"
          icon={faUsers}
          color="bg-gradient-to-r from-blue-400 to-blue-600"
        />
        <StatCard
          title={isRTL ? 'المستخدمون النشطون' : 'Active Users'}
          value={usersData.filter(u => u.status === 'Active').length}
          change="8"
          icon={faChartLine}
          color="bg-gradient-to-r from-emerald-400 to-emerald-600"
        />
        <StatCard
          title={isRTL ? 'إجمالي الإيرادات' : 'Total Revenue'}
          value={`$${usersData.reduce((sum, u) => sum + u.totalSpent, 0).toLocaleString()}`}
          change="23"
          icon={faDollarSign}
          color="bg-gradient-to-r from-purple-400 to-purple-600"
        />
        <StatCard
          title={isRTL ? 'متوسط التقييم' : 'Avg Rating'}
          value={`${(usersData.reduce((sum, u) => sum + u.rating, 0) / usersData.length).toFixed(1)}`}
          change="5"
          icon={faStar}
          color="bg-gradient-to-r from-orange-400 to-orange-600"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {/* User Role Distribution */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-6">
            {isRTL ? 'توزيع أدوار المستخدمين' : 'User Roles'}
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={userRoleData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={5}
                dataKey="value"
              >
                {userRoleData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={customTooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-1 gap-2 mt-4">
            {userRoleData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className={cn("w-3 h-3 rounded-full", isRTL ? "ml-2" : "mr-2")} 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-gray-400">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-white">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* User Growth */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-6">
            {isRTL ? 'نمو المستخدمين' : 'User Growth'}
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip contentStyle={customTooltipStyle} />
              <Line 
                type="monotone" 
                dataKey="users" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Login Activity */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-6">
            {isRTL ? 'نشاط تسجيل الدخول (24 ساعة)' : 'Login Activity (24h)'}
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="hour" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip contentStyle={customTooltipStyle} />
              <Bar 
                dataKey="logins" 
                fill="#10B981" 
                radius={[4, 4, 0, 0]}
                style={{ cursor: 'pointer' }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 shadow-lg">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className={cn("absolute inset-y-0 flex items-center pointer-events-none", isRTL ? "right-0 pr-3" : "left-0 pl-3")}>
                <FontAwesomeIcon icon={faSearch} className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className={cn(
                  "block w-full py-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400",
                  "focus:ring-2 focus:ring-awnash-primary focus:border-awnash-primary",
                  isRTL ? "pr-10 pl-3 text-right" : "pl-10 pr-3"
                )}
                placeholder={isRTL ? "البحث عن المستخدمين..." : "Search users..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <select
              className="border border-gray-600 rounded-lg px-3 py-3 bg-gray-700 text-white focus:ring-2 focus:ring-awnash-primary focus:border-awnash-primary"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">{isRTL ? 'جميع الحالات' : 'All Status'}</option>
              <option value="Active">{isRTL ? 'نشط' : 'Active'}</option>
              <option value="Inactive">{isRTL ? 'غير نشط' : 'Inactive'}</option>
            </select>
            <select
              className="border border-gray-600 rounded-lg px-3 py-3 bg-gray-700 text-white focus:ring-2 focus:ring-awnash-primary focus:border-awnash-primary"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="All">{isRTL ? 'جميع الأدوار' : 'All Roles'}</option>
              <option value="Admin">{isRTL ? 'مشرف' : 'Admin'}</option>
              <option value="Moderator">{isRTL ? 'مدير' : 'Moderator'}</option>
              <option value="Equipment Owner">{isRTL ? 'مالك معدة' : 'Equipment Owner'}</option>
              <option value="Renter">{isRTL ? 'مستأجر' : 'Renter'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">
            {isRTL ? 'قائمة المستخدمين' : 'User List'}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900">
              <tr>
                <th 
                  className={cn(
                    "px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-800 transition-colors",
                    isRTL ? "text-right" : "text-left"
                  )}
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    {isRTL ? 'المستخدم' : 'User'}
                    <FontAwesomeIcon icon={faSort} className={cn("h-3 w-3", isRTL ? "mr-1" : "ml-1")} />
                  </div>
                </th>
                <th className={cn("px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider", isRTL ? "text-right" : "text-left")}>
                  {isRTL ? 'الاتصال' : 'Contact'}
                </th>
                <th className={cn("px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider", isRTL ? "text-right" : "text-left")}>
                  {isRTL ? 'الدور' : 'Role'}
                </th>
                <th className={cn("px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider", isRTL ? "text-right" : "text-left")}>
                  {isRTL ? 'النشاط' : 'Activity'}
                </th>
                <th 
                  className={cn(
                    "px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-800 transition-colors",
                    isRTL ? "text-right" : "text-left"
                  )}
                  onClick={() => handleSort('totalSpent')}
                >
                  <div className="flex items-center">
                    {isRTL ? 'إجمالي الإنفاق' : 'Total Spent'}
                    <FontAwesomeIcon icon={faSort} className={cn("h-3 w-3", isRTL ? "mr-1" : "ml-1")} />
                  </div>
                </th>
                <th className={cn("px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider", isRTL ? "text-right" : "text-left")}>
                  {isRTL ? 'التقييم' : 'Rating'}
                </th>
                <th className={cn("px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider", isRTL ? "text-right" : "text-left")}>
                  {isRTL ? 'الحالة' : 'Status'}
                </th>
                <th className={cn("px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider", isRTL ? "text-left" : "text-right")}>
                  {isRTL ? 'الإجراءات' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-600 flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </span>
                        </div>
                      </div>
                      <div className={cn("flex-1", isRTL ? "mr-4" : "ml-4")}>
                        <div className="text-sm font-medium text-white">{user.name}</div>
                        <div className="text-sm text-gray-400">
                          {isRTL ? 'انضم في' : 'Joined'} {new Date(user.joinedDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">
                      <div className="flex items-center mb-1">
                        <FontAwesomeIcon icon={faEnvelope} className={cn("h-3 w-3 text-gray-500", isRTL ? "ml-1" : "mr-1")} />
                        {user.email}
                      </div>
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faPhone} className={cn("h-3 w-3 text-gray-500", isRTL ? "ml-1" : "mr-1")} />
                        {user.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FontAwesomeIcon 
                        icon={getRoleIcon(user.role)} 
                        className={cn("h-4 w-4 text-gray-500", isRTL ? "ml-2" : "mr-2")} 
                      />
                      <span className={getRoleBadge(user.role)}>
                        {user.role}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">
                      <div>{user.totalBookings} {isRTL ? 'حجوزات' : 'bookings'}</div>
                      <div className="text-xs text-gray-500">
                        {isRTL ? 'آخر دخول:' : 'Last login:'} {new Date(user.lastLogin).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">
                      ${user.totalSpent.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={faStar} className={cn("h-4 w-4 text-yellow-400", isRTL ? "ml-1" : "mr-1")} />
                      <span className="text-sm text-gray-300">{user.rating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStatusBadge(user.status)}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className={cn("flex items-center justify-end space-x-2", isRTL && "space-x-reverse")}>
                      <button 
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                        onClick={() => {
                          if (user.role === 'Equipment Owner') {
                            router.push(`/owners/${user.id}`);
                          } else if (user.role === 'Renter') {
                            router.push(`/renters/${user.id}`);
                          } else {
                            console.log(`View user profile: ${user.id}`);
                          }
                        }}
                        title={
                          user.role === 'Equipment Owner' ? (isRTL ? 'عرض ملف المالك' : 'View Owner Profile') : 
                          user.role === 'Renter' ? (isRTL ? 'عرض ملف المستأجر' : 'View Renter Profile') : 
                          (isRTL ? 'عرض تفاصيل المستخدم' : 'View User Details')
                        }
                      >
                        <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
                      </button>
                      <button className="text-emerald-400 hover:text-emerald-300 transition-colors" title={isRTL ? 'تعديل' : 'Edit'}>
                        <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
                      </button>
                      <button className="text-red-400 hover:text-red-300 transition-colors" title={isRTL ? 'حذف' : 'Delete'}>
                        <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ModernUsers; 