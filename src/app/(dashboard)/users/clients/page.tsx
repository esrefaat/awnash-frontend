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
  faChartLine
} from '@fortawesome/free-solid-svg-icons';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useChartTooltipStyle } from '@/hooks/useChartTooltipStyle';
import { Button } from '@/components/ui/Button';

// Mock client data
const clientsData = [
  {
    id: 1,
    name: 'Ahmed Construction Co.',
    email: 'ahmed@construction.com',
    phone: '+966 50 123 4567',
    location: 'Riyadh, Saudi Arabia',
    totalSpent: 45000,
    bookings: 12,
    lastBooking: '2024-01-15',
    rating: 4.8,
    status: 'Active',
    type: 'Business'
  },
  {
    id: 2,
    name: 'Sarah Photography',
    email: 'sarah@photo.com',
    phone: '+966 55 987 6543',
    location: 'Dubai, UAE',
    totalSpent: 12500,
    bookings: 8,
    lastBooking: '2024-01-10',
    rating: 4.9,
    status: 'Active',
    type: 'Individual'
  },
  {
    id: 3,
    name: 'Tech Solutions LLC',
    email: 'contact@techsol.com',
    phone: '+966 50 555 0123',
    location: 'Jeddah, Saudi Arabia',
    totalSpent: 78000,
    bookings: 25,
    lastBooking: '2024-01-20',
    rating: 4.6,
    status: 'Active',
    type: 'Business'
  },
  {
    id: 4,
    name: 'Omar Events',
    email: 'omar@events.com',
    phone: '+966 56 444 7890',
    location: 'Kuwait City, Kuwait',
    totalSpent: 23000,
    bookings: 15,
    lastBooking: '2023-12-28',
    rating: 4.4,
    status: 'Inactive',
    type: 'Business'
  }
];

const clientTypeData = [
  { name: 'Business', value: 65, color: '#3B82F6' },
  { name: 'Individual', value: 35, color: '#10B981' }
];

const monthlyRevenueData = [
  { month: 'Jan', business: 45000, individual: 12000 },
  { month: 'Feb', business: 52000, individual: 15000 },
  { month: 'Mar', business: 48000, individual: 11000 },
  { month: 'Apr', business: 61000, individual: 18000 },
  { month: 'May', business: 55000, individual: 16000 },
  { month: 'Jun', business: 67000, individual: 21000 }
];

const ModernClients: React.FC = () => {
  const router = useRouter();
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { contentStyle, labelStyle, itemStyle } = useChartTooltipStyle();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const filteredClients = clientsData
    .filter(client => 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(client => statusFilter === 'All' || client.status === statusFilter)
    .filter(client => typeFilter === 'All' || client.type === typeFilter)
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
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className="text-sm text-green-600 mt-1">+{change}% this month</p>
          )}
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
          <FontAwesomeIcon icon={icon} className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  const getStatusBadge = (status: string) => {
    const styles = {
      Active: 'bg-green-100 text-green-800',
      Inactive: 'bg-red-100 text-red-800',
      Pending: 'bg-yellow-100 text-yellow-800'
    };
    return `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status as keyof typeof styles]}`;
  };

  const getTypeBadge = (type: string) => {
    const styles = {
      Business: 'bg-blue-100 text-blue-800',
      Individual: 'bg-purple-100 text-purple-800'
    };
    return `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[type as keyof typeof styles]}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Client Management</h1>
          <p className="text-gray-600 mt-1">
            Manage your clients and analyze their activity patterns
          </p>
        </div>
        <div className={cn("flex items-center space-x-3", isRTL && "space-x-reverse")}>
          <Button variant="outline" className="flex items-center">
            <FontAwesomeIcon icon={faDownload} className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
            Export
          </Button>
          <Button variant="accent" className="flex items-center">
            <FontAwesomeIcon icon={faPlus} className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
            Add Client
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Clients"
          value={clientsData.length.toLocaleString()}
          change="12"
          icon={faUsers}
          color="bg-gradient-to-r from-blue-400 to-blue-600"
        />
        <StatCard
          title="Active Clients"
          value={clientsData.filter(c => c.status === 'Active').length}
          change="8"
          icon={faChartLine}
          color="bg-gradient-to-r from-green-400 to-green-600"
        />
        <StatCard
          title="Total Revenue"
          value={`$${clientsData.reduce((sum, c) => sum + c.totalSpent, 0).toLocaleString()}`}
          change="15"
          icon={faDollarSign}
          color="bg-gradient-to-r from-purple-400 to-purple-600"
        />
        <StatCard
          title="Avg Rating"
          value={`${(clientsData.reduce((sum, c) => sum + c.rating, 0) / clientsData.length).toFixed(1)}`}
          change="3"
          icon={faStar}
          color="bg-gradient-to-r from-orange-400 to-orange-600"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Client Type Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Client Type Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={clientTypeData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {clientTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={contentStyle} labelStyle={labelStyle} itemStyle={itemStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {clientTypeData.map((item, index) => (
              <div key={index} className="flex items-center">
                <div 
                  className={cn("w-3 h-3 rounded-full", isRTL ? "ml-2" : "mr-2")}
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm text-gray-600">{item.name}</span>
                <span className={cn("text-sm font-medium text-gray-900", isRTL ? "mr-auto" : "ml-auto")}>{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Revenue by Client Type */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Monthly Revenue by Client Type</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyRevenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip 
                contentStyle={contentStyle}
                labelStyle={labelStyle}
                itemStyle={itemStyle}
              />
              <Bar dataKey="business" fill="#3B82F6" name="Business" />
              <Bar dataKey="individual" fill="#10B981" name="Individual" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FontAwesomeIcon icon={faSearch} className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="All">All Types</option>
              <option value="Business">Business</option>
              <option value="Individual">Individual</option>
            </select>
          </div>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Client List</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    Client
                    <FontAwesomeIcon icon={faSort} className={cn("h-3 w-3", isRTL ? "mr-1" : "ml-1")} />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('totalSpent')}
                >
                  <div className="flex items-center">
                    Total Spent
                    <FontAwesomeIcon icon={faSort} className={cn("h-3 w-3", isRTL ? "mr-1" : "ml-1")} />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bookings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-600 flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {client.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </span>
                        </div>
                      </div>
                      <div className={cn(isRTL ? "mr-4" : "ml-4")}>
                        <div className="text-sm font-medium text-gray-900">{client.name}</div>
                        <div className="text-sm text-gray-500">
                          <span className={getTypeBadge(client.type)}>
                            {client.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center mb-1">
                        <FontAwesomeIcon icon={faEnvelope} className={cn("h-3 w-3 text-gray-400", isRTL ? "ml-1" : "mr-1")} />
                        {client.email}
                      </div>
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faPhone} className={cn("h-3 w-3 text-gray-400", isRTL ? "ml-1" : "mr-1")} />
                        {client.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className={cn("h-3 w-3 text-gray-400", isRTL ? "ml-1" : "mr-1")} />
                      {client.location}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ${client.totalSpent.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{client.bookings}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={faStar} className={cn("h-4 w-4 text-yellow-400", isRTL ? "ml-1" : "mr-1")} />
                      <span className="text-sm text-gray-900">{client.rating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStatusBadge(client.status)}>
                      {client.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className={cn("flex items-center justify-end space-x-2", isRTL && "space-x-reverse")}>
                      <button 
                        className="text-blue-600 hover:text-blue-900"
                        onClick={() => router.push(`/owners/${client.id}`)}
                        title="View Profile"
                      >
                        <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
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

export default ModernClients; 