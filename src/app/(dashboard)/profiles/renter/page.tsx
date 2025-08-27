'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser,
  faPhone,
  faEnvelope,
  faMapMarkerAlt,
  faClipboardList,
  faCalendarCheck,
  faDollarSign,
  faStar,
  faBuilding,
  faCogs,
  faHandshake,
  faEye,
  faEdit,
  faFlag,
  faUserSlash,
  faStickyNote,
  faFileAlt,
  faComment,
  faCheckCircle,
  faTimesCircle,
  faClock,
  faExclamationTriangle,
  faCrown,
  faShieldAlt
} from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

// Mock renter data with dual role capability
const mockRenterData = {
  id: '1',
  name: 'Mohammed Hassan',
  email: 'mohammed.hassan@email.com',
  phone: '+966 56 555 0123',
  location: 'Jeddah, Saudi Arabia',
  profileImage: null,
  joinDate: '2023-05-10',
  lastLogin: '2024-01-18',
  
  // Renter activities
  totalRequests: 12,
  totalBookings: 8,
  totalSpent: 45600,
  avgBookingValue: 5700,
  completionRate: 95.5,
  renterRating: 4.6,
  
  // Owner activities (if applicable)
  isAlsoOwner: true,
  ownerData: {
    totalEquipment: 3,
    totalRentalsAsOwner: 24,
    revenueEarned: 89400,
    ownerRating: 4.8
  },
  
  // Status and verification
  status: 'active',
  verificationLevel: 'verified',
  accountType: 'business', // 'individual' or 'business'
  internalNotes: 'Reliable customer with good payment history.'
};

const mockRequests = [
  {
    id: 'REQ-001',
    equipmentType: 'Excavator',
    category: 'Construction',
    description: 'Large excavator needed for foundation work',
    location: 'Jeddah - Al Hamra',
    startDate: '2024-01-15',
    endDate: '2024-01-22',
    status: 'completed',
    submittedDate: '2024-01-10',
    budget: 8000,
    offersReceived: 5
  },
  {
    id: 'REQ-002',
    equipmentType: 'Mobile Crane',
    category: 'Construction',
    description: 'Mobile crane for material lifting',
    location: 'Riyadh - Al Olaya',
    startDate: '2024-01-25',
    endDate: '2024-01-27',
    status: 'pending',
    submittedDate: '2024-01-20',
    budget: 4500,
    offersReceived: 2
  }
];

const mockBookings = [
  {
    id: 'BK-001',
    equipmentName: 'CAT 320D Excavator',
    ownerName: 'Al-Rashid Equipment Co.',
    ownerId: 'o1',
    startDate: '2024-01-15',
    endDate: '2024-01-22',
    totalAmount: 7800,
    status: 'completed',
    location: 'Jeddah',
    rating: 5,
    comment: 'Excellent equipment and service'
  },
  {
    id: 'BK-002',
    equipmentName: 'Liebherr Mobile Crane',
    ownerName: 'Gulf Heavy Machinery',
    ownerId: 'o2',
    startDate: '2024-01-25',
    endDate: '2024-01-27',
    totalAmount: 4200,
    status: 'active',
    location: 'Riyadh',
    rating: null,
    comment: null
  }
];

const mockRatings = [
  {
    id: '1',
    bookingId: 'BK-001',
    equipmentName: 'CAT 320D Excavator',
    ownerName: 'Al-Rashid Equipment Co.',
    ownerId: 'o1',
    rating: 5,
    comment: 'Excellent equipment in perfect condition. Owner was very professional and responsive.',
    date: '2024-01-23',
    categories: {
      equipmentCondition: 5,
      ownerCommunication: 5,
      delivery: 5,
      value: 4
    }
  },
  {
    id: '2',
    bookingId: 'BK-003',
    equipmentName: 'JCB 540-200 Telehandler',
    ownerName: 'Kuwait Equipment Rental',
    ownerId: 'o3',
    rating: 4,
    comment: 'Good equipment, minor delays in delivery but overall satisfied.',
    date: '2024-01-20',
    categories: {
      equipmentCondition: 4,
      ownerCommunication: 4,
      delivery: 3,
      value: 4
    }
  }
];

const mockDocuments = [
  {
    id: '1',
    type: 'Project Permit',
    projectName: 'Jeddah Commercial Complex',
    status: 'approved',
    uploadDate: '2023-12-15',
    expiryDate: '2024-12-15',
    fileUrl: '#'
  },
  {
    id: '2',
    type: 'Company License',
    projectName: 'General Business License',
    status: 'approved',
    uploadDate: '2023-05-10',
    expiryDate: '2025-05-10',
    fileUrl: '#'
  }
];

const RenterProfile: React.FC = () => {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [activeTab, setActiveTab] = useState('requests');
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [internalNotes, setInternalNotes] = useState(mockRenterData.internalNotes);

  // In a real app, fetch renter data based on ID
  useEffect(() => {
    // Fetch renter data
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
      case 'active':
      case 'completed':
      case 'verified':
        return `${baseClasses} bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200`;
      case 'pending':
        return `${baseClasses} bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200`;
      case 'cancelled':
      case 'rejected':
        return `${baseClasses} bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200`;
      case 'flagged':
        return `${baseClasses} bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200`;
      default:
        return `${baseClasses} bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200`;
    }
  };

  const getRoleBadge = () => {
    if (mockRenterData.isAlsoOwner) {
      return (
        <div className={cn("flex items-center space-x-2", isRTL && "space-x-reverse")}>
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 flex items-center">
            <FontAwesomeIcon icon={faUser} className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
            Renter
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center">
            <FontAwesomeIcon icon={faBuilding} className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
            Owner
          </span>
        </div>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 flex items-center">
        <FontAwesomeIcon icon={faUser} className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
        Renter Only
      </span>
    );
  };

  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <FontAwesomeIcon
            key={star}
            icon={faStar}
            className={`h-4 w-4 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'} ${isRTL ? 'ml-1' : 'mr-1'}`}
          />
        ))}
        <span className={`${isRTL ? 'mr-2' : 'ml-2'} text-sm text-gray-600`}>{rating}/5</span>
      </div>
    );
  };

  const renderRequestsTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Equipment Requests History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className={`px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                  Request ID
                </th>
                <th className={`px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                  Equipment Type
                </th>
                <th className={`px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                  Location
                </th>
                <th className={`px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                  Period
                </th>
                <th className={`px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                  Budget
                </th>
                <th className={`px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                  Status
                </th>
                <th className={`px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                  Offers
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {mockRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 dark:text-blue-400">
                    {request.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{request.equipmentType}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{request.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {request.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{request.startDate} - {request.endDate}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Submitted: {request.submittedDate}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {request.budget.toLocaleString()} SAR
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStatusBadge(request.status)}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {request.offersReceived}
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
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Bookings as Renter</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className={`px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                  Equipment
                </th>
                <th className={`px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                  Owner
                </th>
                <th className={`px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                  Period
                </th>
                <th className={`px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                  Amount
                </th>
                <th className={`px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                  Status
                </th>
                <th className={`px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                  Rating
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {mockBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{booking.equipmentName}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{booking.location}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div 
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 cursor-pointer"
                      onClick={() => router.push(`/owners/${booking.ownerId}`)}
                      title="View Owner Profile"
                    >
                      {booking.ownerName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {booking.startDate} - {booking.endDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {booking.totalAmount.toLocaleString()} SAR
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStatusBadge(booking.status)}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {booking.rating ? (
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faStar} className={`h-4 w-4 text-yellow-400 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                        <span className="text-sm text-gray-900">{booking.rating}/5</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Pending</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderRatingsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Ratings & Reviews Given</h3>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            {mockRatings.map((rating) => (
              <div key={rating.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-medium text-gray-900">{rating.equipmentName}</h4>
                    <p 
                      className="text-sm text-blue-600 hover:text-blue-900 cursor-pointer"
                      onClick={() => router.push(`/owners/${rating.ownerId}`)}
                    >
                      {rating.ownerName}
                    </p>
                    <p className="text-sm text-gray-500">Booking: {rating.bookingId}</p>
                  </div>
                  <div className="text-right">
                    {renderStarRating(rating.rating)}
                    <p className="text-sm text-gray-500 mt-1">{rating.date}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500">Equipment Condition</p>
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={faStar} className={`h-3 w-3 text-yellow-400 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                      <span className="text-sm">{rating.categories.equipmentCondition}/5</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Communication</p>
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={faStar} className={`h-3 w-3 text-yellow-400 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                      <span className="text-sm">{rating.categories.ownerCommunication}/5</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Delivery</p>
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={faStar} className={`h-3 w-3 text-yellow-400 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                      <span className="text-sm">{rating.categories.delivery}/5</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Value</p>
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={faStar} className={`h-3 w-3 text-yellow-400 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                      <span className="text-sm">{rating.categories.value}/5</span>
                    </div>
                  </div>
                </div>
                
                {rating.comment && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start">
                      <FontAwesomeIcon icon={faComment} className={`h-4 w-4 text-gray-400 mt-1 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      <p className="text-sm text-gray-700">{rating.comment}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>  
      </div>
    </div>
  );

  const renderDocumentsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Legal Documents</h3>
          <p className="text-sm text-gray-600 mt-1">Project permits and company documents</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockDocuments.map((doc) => (
              <div key={doc.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <FontAwesomeIcon icon={faFileAlt} className={`h-5 w-5 text-blue-700 ${isRTL ? 'ml-2' : 'mr-2'}`} /> 
                    <h4 className="font-medium text-gray-900">{doc.type}</h4>
                  </div>
                  <span className={getStatusBadge(doc.status)}>
                    {doc.status}
                  </span>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>Project: {doc.projectName}</div>
                  <div>Uploaded: {doc.uploadDate}</div>
                  <div>Expires: {doc.expiryDate}</div>
                </div>
                <div className={cn("flex space-x-2 mt-4", isRTL && "space-x-reverse")}>
                  <button className="flex-1 px-3 py-2 bg-blue-700 text-white text-sm rounded-lg hover:bg-blue-800">
                    <FontAwesomeIcon icon={faEye} className={`${isRTL ? 'ml-1' : 'mr-1'}`} />
                    View
                  </button>
                </div>
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
                  {mockRenterData.profileImage ? (
                    <img 
                      src={mockRenterData.profileImage} 
                      alt="Profile" 
                      className="w-20 h-20 rounded-xl bg-gray-200"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-blue-700 flex items-center justify-center">
                      <FontAwesomeIcon icon={faUser} className="h-10 w-10 text-white" />
                    </div>
                  )}
                  <div className={`absolute -bottom-2 ${isRTL ? 'left-1' : 'right-2'}`}> 
                    {mockRenterData.verificationLevel === 'verified' ? (
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
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{mockRenterData.name}</h1>
                  <div className={cn("flex items-center mt-2 space-x-4", isRTL && "space-x-reverse")}>
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <FontAwesomeIcon icon={faPhone} className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {mockRenterData.phone}
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <FontAwesomeIcon icon={faEnvelope} className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {mockRenterData.email}
                    </div>
                  </div>
                  <div className={cn("flex items-center mt-2 space-x-4", isRTL && "space-x-reverse")}>  
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {mockRenterData.location}
                    </div>
                    {getRoleBadge()}
                  </div>
                  <div className="flex items-center mt-2">
                    <span className={`${getStatusBadge(mockRenterData.status)} ${isRTL ? 'ml-2' : 'mr-2'}`}>
                      {mockRenterData.status}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Member since {mockRenterData.joinDate}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className={cn("flex space-x-3", isRTL && "space-x-reverse")}>  
                <button 
                  className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 font-medium"
                  onClick={() => setShowNotesModal(true)}
                >
                  <FontAwesomeIcon icon={faStickyNote} className={`${isRTL ? 'ml-2' : 'mr-2'}`} />
                  Notes
                </button>
                <button className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-medium">
                  <FontAwesomeIcon icon={faFlag} className={`${isRTL ? 'ml-2' : 'mr-2'}`} />
                  Flag User
                </button>
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium">
                  <FontAwesomeIcon icon={faUserSlash} className={`${isRTL ? 'ml-2' : 'mr-2'}`} />
                  Disable
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <StatCard
            title="Total Requests"
            value={mockRenterData.totalRequests}
            subtitle="Equipment requests"
            icon={faClipboardList}
            color="text-white"
            bgColor="bg-blue-700"
          />
          <StatCard
            title="Bookings Completed"
            value={mockRenterData.totalBookings}
            subtitle="As renter"
            icon={faCalendarCheck}
            color="text-white"
            bgColor="bg-green-600"
          />
          <StatCard
            title="Total Spent"
            value={`${mockRenterData.totalSpent.toLocaleString()} SAR`}
            subtitle={`Avg: ${mockRenterData.avgBookingValue.toLocaleString()} SAR`}
            icon={faDollarSign}
            color="text-white"
            bgColor="bg-yellow-500"
          />
          <StatCard
            title="Renter Rating"
            value={mockRenterData.renterRating}
            subtitle={`${mockRenterData.completionRate}% completion`}
            icon={faStar}
            color="text-white"
            bgColor="bg-purple-600"
          />
          {mockRenterData.isAlsoOwner && (
            <>
              <StatCard
                title="Owner Equipment"
                value={mockRenterData.ownerData.totalEquipment}
                subtitle="Listed equipment"
                icon={faCogs}
                color="text-white"
                bgColor="bg-indigo-600"
              />
              <StatCard
                title="Owner Revenue"
                value={`${mockRenterData.ownerData.revenueEarned.toLocaleString()} SAR`}
                subtitle={`${mockRenterData.ownerData.ownerRating}/5 rating`}
                icon={faHandshake}
                color="text-white"
                bgColor="bg-blue-600"
              />
            </>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className={cn("-mb-px flex space-x-8 px-6", isRTL && "space-x-reverse")}>
              {[
                { id: 'requests', label: 'Requests', icon: faClipboardList },
                { id: 'bookings', label: 'Bookings', icon: faCalendarCheck },
                { id: 'ratings', label: 'Ratings Given', icon: faStar },
                { id: 'documents', label: 'Documents', icon: faFileAlt }
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
            {activeTab === 'requests' && renderRequestsTab()}
            {activeTab === 'bookings' && renderBookingsTab()}
            {activeTab === 'ratings' && renderRatingsTab()}
            {activeTab === 'documents' && renderDocumentsTab()}
          </div>
        </div>

        {/* Notes Modal */}
        {showNotesModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-96 max-w-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Internal Notes</h3>
              <textarea
                className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="Add internal notes about this renter..."
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
              />
              <div className={cn("flex space-x-3 mt-4", isRTL && "space-x-reverse")}>
                <button
                  className="flex-1 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800"
                  onClick={() => setShowNotesModal(false)}
                >
                  Save Notes
                </button>
                <button
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
                  onClick={() => setShowNotesModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RenterProfile; 