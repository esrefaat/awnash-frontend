'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser,
  faBuilding,
  faPhone,
  faEnvelope,
  faCheckCircle,
  faTimesCircle,
  faCogs,
  faDollarSign,
  faCalendarAlt,
  faEye,
  faEdit,
  faFileAlt,
  faComments,
  faExclamationTriangle,
  faUserSlash,
  faKey,
  faStar,
  faMapMarkerAlt,
  faUsers,
  faHandshake
} from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

// Mock owner data
const mockOwnerData = {
  id: '1',
  name: 'Ahmed Construction LLC',
  ownerName: 'Ahmed Al-Rashid',
  companyName: 'Ahmed Construction LLC',
  phone: '+966 50 123 4567',
  email: 'ahmed@construction-llc.com',
  profileImage: null,
  companyLogo: null,
  status: 'verified',
  joinedDate: '2023-03-15',
  lastLogin: '2024-01-20',
  location: 'Riyadh, Saudi Arabia',
  totalEquipment: 12,
  totalRentalsAsOwner: 156,
  totalRentalsAsRenter: 23,
  totalRevenue: 485000,
  monthlyRevenue: 42500,
  rating: 4.8,
  completionRate: 98.5,
  responseTime: '2 hours',
  verificationDate: '2023-03-20'
};

const mockEquipmentData = [
  {
    id: '1',
    name: 'Caterpillar 320D Excavator',
    image: '/api/placeholder/120/80',
    size: 'Large',
    status: 'active',
    rentals: 45,
    revenue: 125000,
    location: 'Riyadh',
    dailyRate: 800
  },
  {
    id: '2',
    name: 'Komatsu WA320 Wheel Loader',
    image: '/api/placeholder/120/80',
    size: 'Medium',
    status: 'active',
    rentals: 32,
    revenue: 89000,
    location: 'Jeddah',
    dailyRate: 650
  },
  {
    id: '3',
    name: 'Volvo A30G Articulated Hauler',
    image: '/api/placeholder/120/80',
    size: 'Large',
    status: 'maintenance',
    rentals: 28,
    revenue: 76000,
    location: 'Dammam',
    dailyRate: 720
  }
];

const mockBookingsAsOwner = [
  {
    id: '1',
    equipmentName: 'Caterpillar 320D Excavator',
    renterName: 'Mohammed Hassan',
    startDate: '2024-01-15',
    endDate: '2024-01-22',
    totalAmount: 5600,
    status: 'completed',
    duration: 7
  },
  {
    id: '2',
    equipmentName: 'Komatsu WA320 Wheel Loader',
    renterName: 'Sarah Construction',
    startDate: '2024-01-18',
    endDate: '2024-01-25',
    totalAmount: 4550,
    status: 'active',
    duration: 7
  }
];

const mockDocuments = [
  {
    id: '1',
    type: 'Business License',
    status: 'approved',
    uploadDate: '2023-03-15',
    expiryDate: '2024-03-15',
    fileUrl: '#'
  },
  {
    id: '2',
    type: 'Tax Registration',
    status: 'approved',
    uploadDate: '2023-03-15',
    expiryDate: '2025-03-15',
    fileUrl: '#'
  },
  {
    id: '3',
    type: 'Equipment Operator License',
    status: 'pending',
    uploadDate: '2024-01-10',
    expiryDate: '2025-01-10',
    fileUrl: '#'
  }
];

const mockMessages = [
  {
    id: '1',
    with: 'Mohammed Hassan',
    equipment: 'Caterpillar 320D Excavator',
    lastMessage: 'The equipment is ready for pickup tomorrow at 8 AM.',
    timestamp: '2024-01-20 14:30',
    status: 'read'
  }
];

const OwnerProfile: React.FC = () => {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [activeTab, setActiveTab] = useState('equipment');

  // In a real app, fetch owner data based on ID
  useEffect(() => {
    // Fetch owner data
  }, [id]);

  const StatCard = ({ title, value, subtitle, icon, color, bgColor }: any) => (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm ${isRTL ? 'text-right' : 'text-left'}`}>
      <div className="flex items-center justify-between">
        <div className={isRTL ? 'order-2' : 'order-1'}>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${bgColor} ${isRTL ? 'order-1' : 'order-2'}`}>
          <FontAwesomeIcon icon={icon} className={`h-6 w-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium";
    switch (status.toLowerCase()) {
      case 'verified':
      case 'approved':
      case 'active':
      case 'completed':
        return `${baseClasses} bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200`;
      case 'pending':
        return `${baseClasses} bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200`;
      case 'rejected':
      case 'inactive':
      case 'expired':
        return `${baseClasses} bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200`;
      case 'maintenance':
        return `${baseClasses} bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200`;
      default:
        return `${baseClasses} bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200`;
    }
  };

  const renderEquipmentTab = () => (
    <div className="space-y-6">
      {/* Equipment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 <StatCard
           title="Total Equipment"
           value={mockOwnerData.totalEquipment}
           icon={faCogs}
           color="text-white"
           bgColor="bg-blue-700"
         />
         <StatCard
           title="Total Rentals"
           value={mockEquipmentData.reduce((sum, eq) => sum + eq.rentals, 0)}
           icon={faHandshake}
           color="text-white"
           bgColor="bg-green-600"
         />
         <StatCard
           title="Total Revenue"
           value={`${mockEquipmentData.reduce((sum, eq) => sum + eq.revenue, 0).toLocaleString()} SAR`}
           icon={faDollarSign}
           color="text-white"
           bgColor="bg-yellow-500"
         />
         <StatCard
           title="Active Equipment"
           value={mockEquipmentData.filter(eq => eq.status === 'active').length}
           icon={faCheckCircle}
           color="text-white"
           bgColor="bg-blue-600"
         />
      </div>

      {/* Equipment Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Equipment Inventory</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className={`px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                  Equipment
                </th>
                <th className={`px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                  Size
                </th>
                <th className={`px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                  Status
                </th>
                <th className={`px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                  Rentals
                </th>
                <th className={`px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                  Revenue
                </th>
                <th className={`px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                  Daily Rate
                </th>
                <th className={`px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {mockEquipmentData.map((equipment) => (
                <tr key={equipment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <img className="h-12 w-12 rounded-lg bg-gray-200 dark:bg-gray-600" src={equipment.image} alt="" />
                      </div>
                      <div className={`${isRTL ? 'mr-4' : 'ml-4'}`}>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{equipment.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{equipment.location}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {equipment.size}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStatusBadge(equipment.status)}>
                      {equipment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {equipment.rentals}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {equipment.revenue.toLocaleString()} SAR
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {equipment.dailyRate} SAR/day
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                         <div className={cn("flex space-x-2", isRTL && "space-x-reverse")}>
                       <button className="text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300">
                         <FontAwesomeIcon icon={faEye} />
                       </button>
                       <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                         <FontAwesomeIcon icon={faEdit} />
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

  const renderBookingsTab = () => (
    <div className="space-y-6">
      {/* Bookings Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 <StatCard
           title="Total Bookings"
           value={mockOwnerData.totalRentalsAsOwner}
           icon={faCalendarAlt}
           color="text-white"
           bgColor="bg-blue-700"
         />
         <StatCard
           title="Completion Rate"
           value={`${mockOwnerData.completionRate}%`}
           icon={faCheckCircle}
           color="text-white"
           bgColor="bg-green-600"
         />
         <StatCard
           title="Response Time"
           value={mockOwnerData.responseTime}
           icon={faUser}
           color="text-white"
           bgColor="bg-yellow-500"
         />
         <StatCard
           title="Rating"
           value={mockOwnerData.rating}
           subtitle="Average rating"
           icon={faStar}
           color="text-white"
           bgColor="bg-blue-600"
         />
      </div>

      {/* Bookings Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Bookings as Owner</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className={`px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                  Equipment
                </th>
                <th className={`px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                  Renter
                </th>
                <th className={`px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                  Duration
                </th>
                <th className={`px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                  Amount
                </th>
                <th className={`px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                  Status
                </th>
                <th className={`px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {mockBookingsAsOwner.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {booking.equipmentName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {booking.renterName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {booking.startDate} - {booking.endDate}
                    <div className="text-xs text-gray-500 dark:text-gray-400">{booking.duration} days</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {booking.totalAmount.toLocaleString()} SAR
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStatusBadge(booking.status)}>
                      {booking.status}
                    </span>
                  </td>
                                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                     <button className="text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300">
                       <FontAwesomeIcon icon={faEye} />
                     </button>
                   </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderDocumentsTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Document Verification</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockDocuments.map((doc) => (
              <div key={doc.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                                         <FontAwesomeIcon icon={faFileAlt} className={`h-5 w-5 text-blue-700 dark:text-blue-400 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    <h4 className="font-medium text-gray-900 dark:text-white">{doc.type}</h4>
                  </div>
                  <span className={getStatusBadge(doc.status)}>
                    {doc.status}
                  </span>
                </div>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div>Uploaded: {doc.uploadDate}</div>
                  <div>Expires: {doc.expiryDate}</div>
                </div>
                <div className={cn("flex space-x-2 mt-4", isRTL && "space-x-reverse")}>
                                     <Button variant="accent" size="sm" className="flex-1">
                     <FontAwesomeIcon icon={faEye} className={`${isRTL ? 'ml-1' : 'mr-1'}`}/>
                     View
                   </Button>
                  {doc.status === 'pending' && (
                    <>
                      <Button variant="success" size="sm">
                        <FontAwesomeIcon icon={faCheckCircle} />
                      </Button>
                      <Button variant="destructive" size="sm">
                        <FontAwesomeIcon icon={faTimesCircle} />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderMessagesTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Message History</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {mockMessages.map((message) => (
              <div key={message.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <FontAwesomeIcon icon={faComments} className={`h-5 w-5 text-blue-700 dark:text-blue-400 ${isRTL ? 'ml-2' : 'mr-2'}`}/>
                    <span className="font-medium text-gray-900 dark:text-white">Chat with {message.with}</span>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{message.timestamp}</span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Equipment: {message.equipment}
                </div>
                <div className="text-sm text-gray-800 dark:text-gray-200 mb-3">
                  "{message.lastMessage}"
                </div>
                                 <button className="text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 text-sm font-medium">
                   View Full Conversation
                 </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${isRTL ? 'font-arabic' : 'font-montserrat'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mb-8">
          <div className="p-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
              {/* Profile Info */}
              <div className="flex items-center mb-6 lg:mb-0">
                <div className="relative">
                  {mockOwnerData.companyLogo ? (
                    <img 
                      src={mockOwnerData.companyLogo} 
                      alt="Company Logo" 
                      className="w-20 h-20 rounded-xl bg-gray-200 dark:bg-gray-700"
                    />
                  ) : (
                                       <div className="w-20 h-20 rounded-xl bg-blue-700 flex items-center justify-center">
                     <FontAwesomeIcon icon={faBuilding} className="h-10 w-10 text-white" />
                   </div>
                  )}
                  <div className="absolute -bottom-2 -right-2">
                                         {mockOwnerData.status === 'verified' ? (
                       <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                         <FontAwesomeIcon icon={faCheckCircle} className="h-4 w-4 text-white" />
                       </div>
                     ) : (
                       <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                         <FontAwesomeIcon icon={faExclamationTriangle} className="h-4 w-4 text-white" />
                       </div>
                     )}
                  </div>
                </div>
                <div className={`${isRTL ? 'mr-6' : 'ml-6'}`}>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{mockOwnerData.companyName}</h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">{mockOwnerData.ownerName}</p>
                  <div className={cn("flex items-center mt-2 space-x-4", isRTL && "space-x-reverse")}>
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <FontAwesomeIcon icon={faPhone} className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`}/>
                      {mockOwnerData.phone}
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <FontAwesomeIcon icon={faEnvelope} className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`}/>
                      {mockOwnerData.email}
                    </div>
                  </div>
                  <div className="flex items-center mt-2">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} text-gray-600 dark:text-gray-400`}/>
                    <span className="text-gray-600 dark:text-gray-400">{mockOwnerData.location}</span>
                    <span className={`${getStatusBadge(mockOwnerData.status)} ${isRTL ? 'ml-4' : 'mr-4'}`}> 
                      {mockOwnerData.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className={cn("flex space-x-3", isRTL && "space-x-reverse")}>
                                 <Button variant="accent">
                  <FontAwesomeIcon icon={faEdit} className={`${isRTL ? 'ml-2' : 'mr-2'}`} />
                   Edit Profile
                 </Button>
                 <Button variant="default">
                   <FontAwesomeIcon icon={faKey} className={`${isRTL ? 'ml-2' : 'mr-2'}`} />
                   Reset Password
                 </Button>
                 <Button variant="destructive">
                   <FontAwesomeIcon icon={faUserSlash} className={`${isRTL ? 'ml-2' : 'mr-2'}`} />
                   Deactivate
                 </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                   <StatCard
           title="Total Equipment"
           value={mockOwnerData.totalEquipment}
           subtitle="Listed equipment"
           icon={faCogs}
           color="text-white"
           bgColor="bg-blue-700"
         />
         <StatCard
           title="Owner Rentals"
           value={mockOwnerData.totalRentalsAsOwner}
           subtitle="Equipment rented out"
           icon={faHandshake}
           color="text-white"
           bgColor="bg-green-600"
         />
         <StatCard
           title="Renter Bookings"
           value={mockOwnerData.totalRentalsAsRenter}
           subtitle="Equipment rented"
           icon={faUsers}
           color="text-white"
           bgColor="bg-blue-600"
         />
         <StatCard
           title="Total Revenue"
           value={`${mockOwnerData.totalRevenue.toLocaleString()} SAR`}
           subtitle={`${mockOwnerData.monthlyRevenue.toLocaleString()} SAR this month`}
           icon={faDollarSign}
           color="text-white"
           bgColor="bg-yellow-500"
         />
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className={cn("-mb-px flex space-x-8 px-6", isRTL && "space-x-reverse")}>
              {[
                { id: 'equipment', label: 'Equipment List', icon: faCogs },
                { id: 'bookings', label: 'Bookings as Owner', icon: faCalendarAlt },
                { id: 'documents', label: 'Documents', icon: faFileAlt },
                { id: 'messages', label: 'Messages', icon: faComments }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                                     className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                     activeTab === tab.id
                       ? 'border-blue-700 text-blue-700 dark:text-blue-400'
                       : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                   }`}
                >
                  <FontAwesomeIcon icon={tab.icon} className={`${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'equipment' && renderEquipmentTab()}
            {activeTab === 'bookings' && renderBookingsTab()}
            {activeTab === 'documents' && renderDocumentsTab()}
            {activeTab === 'messages' && renderMessagesTab()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerProfile; 