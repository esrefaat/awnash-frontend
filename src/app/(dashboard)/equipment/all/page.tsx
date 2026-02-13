'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch,
  faSort,
  faEye,
  faEdit,
  faFlag,
  faChevronLeft,
  faChevronRight,
  faTruck,
  faUser,
  faCheckCircle,
  faExclamationTriangle,
  faTimesCircle,
  faClock,
  faMapMarkerAlt,
  faTh,
  faList,
  faChartLine,
  faDollarSign
} from '@fortawesome/free-solid-svg-icons';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useChartTooltipStyle } from '@/hooks/useChartTooltipStyle';

interface Equipment {
  id: string;
  name: string;
  nameAr: string;
  category: string;
  categoryAr: string;
  type: string;
  typeAr: string;
  size: string;
  owner: {
    id: string;
    name: string;
    nameAr: string;
    status: 'verified' | 'pending' | 'suspended';
    city: string;
    cityAr: string;
  };
  rentals: number;
  revenue: number;
  verification: 'verified' | 'pending' | 'expired' | 'rejected';
  status: 'active' | 'inactive' | 'booked' | 'maintenance';
  location: string;
  locationAr: string;
  dateAdded: string;
}

const AllEquipmentListing: React.FC = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { contentStyle, labelStyle, itemStyle } = useChartTooltipStyle();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);
  const [sortBy, setSortBy] = useState<'revenue' | 'rentals' | 'newest'>('revenue');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Mock data
  const mockEquipment: Equipment[] = [
    {
      id: 'EQ001',
      name: 'Caterpillar 320D Excavator',
      nameAr: 'حفارة كاتربيلار 320D',
      category: 'Heavy Machinery',
      categoryAr: 'آليات ثقيلة',
      type: 'Excavator',
      typeAr: 'حفارة',
      size: '20 Ton',
      owner: {
        id: 'OW001',
        name: 'Ahmed Construction Co.',
        nameAr: 'شركة أحمد للإنشاءات',
        status: 'verified',
        city: 'Riyadh',
        cityAr: 'الرياض'
      },
      rentals: 45,
      revenue: 125000,
      verification: 'verified',
      status: 'active',
      location: 'Riyadh, King Khalid Airport',
      locationAr: 'الرياض، مطار الملك خالد',
      dateAdded: '2024-01-15'
    },
    {
      id: 'EQ002',
      name: 'JCB 3CX Backhoe Loader',
      nameAr: 'لودر JCB 3CX',
      category: 'Construction Equipment',
      categoryAr: 'معدات البناء',
      type: 'Backhoe Loader',
      typeAr: 'لودر حفار',
      size: '8.5 Ton',
      owner: {
        id: 'OW002',
        name: 'Khalid Equipment Rental',
        nameAr: 'خالد لتأجير المعدات',
        status: 'verified',
        city: 'Jeddah',
        cityAr: 'جدة'
      },
      rentals: 28,
      revenue: 85000,
      verification: 'pending',
      status: 'booked',
      location: 'Jeddah, Industrial Area',
      locationAr: 'جدة، المنطقة الصناعية',
      dateAdded: '2024-02-10'
    },
    {
      id: 'EQ003',
      name: 'Komatsu D85 Bulldozer',
      nameAr: 'بلدوزر كوماتسو D85',
      category: 'Heavy Machinery',
      categoryAr: 'آليات ثقيلة',
      type: 'Bulldozer',
      typeAr: 'بلدوزر',
      size: '25 Ton',
      owner: {
        id: 'OW003',
        name: 'Al-Farouk Heavy Equipment',
        nameAr: 'الفاروق للمعدات الثقيلة',
        status: 'pending',
        city: 'Dammam',
        cityAr: 'الدمام'
      },
      rentals: 12,
      revenue: 45000,
      verification: 'expired',
      status: 'inactive',
      location: 'Dammam, Port Area',
      locationAr: 'الدمام، منطقة الميناء',
      dateAdded: '2024-03-05'
    },
    {
      id: 'EQ004',
      name: 'Volvo EC210 Excavator',
      nameAr: 'حفارة فولفو EC210',
      category: 'Heavy Machinery',
      categoryAr: 'آليات ثقيلة',
      type: 'Excavator',
      typeAr: 'حفارة',
      size: '21 Ton',
      owner: {
        id: 'OW004',
        name: 'Riyadh Heavy Machinery',
        nameAr: 'الرياض للآليات الثقيلة',
        status: 'verified',
        city: 'Riyadh',
        cityAr: 'الرياض'
      },
      rentals: 33,
      revenue: 98000,
      verification: 'verified',
      status: 'active',
      location: 'Riyadh, Industrial City',
      locationAr: 'الرياض، المدينة الصناعية',
      dateAdded: '2024-01-20'
    },
    {
      id: 'EQ005',
      name: 'Liebherr LTM 1030 Crane',
      nameAr: 'رافعة ليبهر LTM 1030',
      category: 'Lifting Equipment',
      categoryAr: 'معدات الرفع',
      type: 'Mobile Crane',
      typeAr: 'رافعة متحركة',
      size: '30 Ton',
      owner: {
        id: 'OW005',
        name: 'Gulf Crane Services',
        nameAr: 'خدمات الرافعات الخليجية',
        status: 'verified',
        city: 'Jeddah',
        cityAr: 'جدة'
      },
      rentals: 18,
      revenue: 72000,
      verification: 'verified',
      status: 'booked',
      location: 'Jeddah, North Corniche',
      locationAr: 'جدة، الكورنيش الشمالي',
      dateAdded: '2024-02-15'
    },
    {
      id: 'EQ006',
      name: 'CAT 966H Wheel Loader',
      nameAr: 'لودر كاتربيلار 966H',
      category: 'Loading Equipment',
      categoryAr: 'معدات التحميل',
      type: 'Wheel Loader',
      typeAr: 'لودر ذو عجلات',
      size: '18 Ton',
      owner: {
        id: 'OW006',
        name: 'Eastern Province Equipment',
        nameAr: 'معدات المنطقة الشرقية',
        status: 'suspended',
        city: 'Dammam',
        cityAr: 'الدمام'
      },
      rentals: 8,
      revenue: 32000,
      verification: 'rejected',
      status: 'maintenance',
      location: 'Dammam, SABIC Area',
      locationAr: 'الدمام، منطقة سابك',
      dateAdded: '2024-03-20'
    }
  ];

  // Logic moved below functions for proper organization


  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { 
        className: 'bg-green-100 text-green-800 border border-green-200', 
        text: isRTL ? 'نشط' : 'Active' 
      },
      inactive: { 
        className: 'bg-gray-100 text-gray-800 border border-gray-200', 
        text: isRTL ? 'غير نشط' : 'Inactive' 
      },
      booked: { 
        className: 'bg-blue-100 text-blue-800 border border-blue-200', 
        text: isRTL ? 'محجوز' : 'Booked' 
      },
      maintenance: { 
        className: 'bg-orange-100 text-orange-800 border border-orange-200', 
        text: isRTL ? 'صيانة' : 'Maintenance' 
      }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge className={config.className}>
        {config.text}
      </Badge>
    );
  };

  const getVerificationBadge = (verification: string) => {
    const verificationConfig = {
      verified: { 
        icon: faCheckCircle, 
        className: 'bg-green-100 text-green-800 border border-green-200', 
        text: isRTL ? 'موثق' : 'Verified' 
      },
      pending: { 
        icon: faClock, 
        className: 'bg-yellow-100 text-yellow-800 border border-yellow-200', 
        text: isRTL ? 'في الانتظار' : 'Pending' 
      },
      expired: { 
        icon: faExclamationTriangle, 
        className: 'bg-orange-100 text-orange-800 border border-orange-200', 
        text: isRTL ? 'منتهي الصلاحية' : 'Expired' 
      },
      rejected: { 
        icon: faTimesCircle, 
        className: 'bg-red-100 text-red-800 border border-red-200', 
        text: isRTL ? 'مرفوض' : 'Rejected' 
      }
    };
    
    const config = verificationConfig[verification as keyof typeof verificationConfig];
    return (
      <Badge className={config.className}>
        <FontAwesomeIcon icon={config.icon} className={cn("h-3 w-3", isRTL ? "ml-1" : "mr-1")} />
        {config.text}
      </Badge>
    );
  };

  const getOwnerStatusIndicator = (status: string) => {
    const ownerStatusConfig = {
      verified: { className: 'text-green-500', text: isRTL ? 'موثق' : 'Verified' },
      pending: { className: 'text-yellow-500', text: isRTL ? 'في الانتظار' : 'Pending' },
      suspended: { className: 'text-red-500', text: isRTL ? 'معلق' : 'Suspended' }
    };
    
    const config = ownerStatusConfig[status as keyof typeof ownerStatusConfig];
    return (
      <span className={cn("text-xs font-medium", config.className)}>
        {config.text}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Chart data calculations
  const categoryAnalytics = mockEquipment.reduce((acc, equipment) => {
    const category = isRTL ? equipment.categoryAr : equipment.category;
    if (acc[category]) {
      acc[category].count += 1;
      acc[category].revenue += equipment.revenue;
    } else {
      acc[category] = {
        count: 1,
        revenue: equipment.revenue,
        color: equipment.category === 'Heavy Machinery' ? '#1E40AF' : 
               equipment.category === 'Construction Equipment' ? '#F59E0B' : 
               equipment.category === 'Lifting Equipment' ? '#10B981' : 
               '#EF4444'
      };
    }
    return acc;
  }, {} as Record<string, { count: number; revenue: number; color: string }>);

  const categoryChartData = Object.entries(categoryAnalytics).map(([category, data]) => ({
    name: category,
    value: data.count,
    revenue: data.revenue,
    color: data.color
  }));

  const statusAnalytics = mockEquipment.reduce((acc, equipment) => {
    const status = equipment.status;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusChartData = Object.entries(statusAnalytics).map(([status, count]) => ({
    name: status === 'active' ? (isRTL ? 'نشط' : 'Active') :
          status === 'booked' ? (isRTL ? 'محجوز' : 'Booked') :
          status === 'inactive' ? (isRTL ? 'غير نشط' : 'Inactive') :
          (isRTL ? 'صيانة' : 'Maintenance'),
    value: count,
    color: status === 'active' ? '#10B981' :
           status === 'booked' ? '#F59E0B' :
           status === 'inactive' ? '#6B7280' : '#EF4444'
  }));

  const cityAnalytics = mockEquipment.reduce((acc, equipment) => {
    const city = isRTL ? equipment.owner.cityAr : equipment.owner.city;
    if (acc[city]) {
      acc[city].count += 1;
      acc[city].revenue += equipment.revenue;
    } else {
      acc[city] = {
        count: 1,
        revenue: equipment.revenue
      };
    }
    return acc;
  }, {} as Record<string, { count: number; revenue: number }>);

  const cityChartData = Object.entries(cityAnalytics).map(([city, data]) => ({
    city,
    count: data.count,
    revenue: data.revenue
  }));

  const revenueDistributionData = mockEquipment.map(equipment => ({
    name: equipment.name.split(' ')[0],
    revenue: equipment.revenue,
    rentals: equipment.rentals
  })).sort((a, b) => b.revenue - a.revenue).slice(0, 6);

  const formatTooltipValue = (value: any, name: string) => {
    if (name === 'revenue') {
      return [
        formatCurrency(value),
        isRTL ? 'الإيرادات' : 'Revenue'
      ];
    }
    if (name === 'count') {
      return [
        value.toLocaleString(isRTL ? 'ar-SA' : 'en-US'),
        isRTL ? 'العدد' : 'Count'
      ];
    }
    return [
      value.toLocaleString(isRTL ? 'ar-SA' : 'en-US'),
      name
    ];
  };

  // Filtering and sorting logic
  const filteredAndSortedEquipment = mockEquipment
    .filter(equipment => 
      equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipment.nameAr.includes(searchTerm) ||
      equipment.id.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aValue: number, bValue: number;
      
      switch (sortBy) {
        case 'revenue':
          aValue = a.revenue;
          bValue = b.revenue;
          break;
        case 'rentals':
          aValue = a.rentals;
          bValue = b.rentals;
          break;
        case 'newest':
          aValue = new Date(a.dateAdded).getTime();
          bValue = new Date(b.dateAdded).getTime();
          break;
        default:
          return 0;
      }
      
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

  const totalPages = Math.ceil(filteredAndSortedEquipment.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentEquipment = filteredAndSortedEquipment.slice(startIndex, startIndex + itemsPerPage);

  const handleSortChange = (newSortBy: 'revenue' | 'rentals' | 'newest') => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  // Table View Component
  const TableView = () => (
    <div className="bg-card rounded-xl border border-border shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className={cn("px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider", isRTL ? 'text-right' : 'text-left')}>
                {isRTL ? 'المعدة' : 'Equipment'}
              </th>
              <th className={cn("px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider", isRTL ? 'text-right' : 'text-left')}>
                {isRTL ? 'المالك' : 'Owner'}
              </th>
              <th className={cn("px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider", isRTL ? 'text-right' : 'text-left')}>
                {isRTL ? 'الموقع' : 'Location'}
              </th>
              <th className={cn("px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider text-center")}>
                {isRTL ? 'الحجوزات' : 'Rentals'}
              </th>
              <th className={cn("px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider text-center")}>
                {isRTL ? 'الإيرادات' : 'Revenue'}
              </th>
              <th className={cn("px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider text-center")}>
                {isRTL ? 'الحالة' : 'Status'}
              </th>
              <th className={cn("px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider text-center")}>
                {isRTL ? 'التوثيق' : 'Verification'}
              </th>
              <th className={cn("px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider text-center")}>
                {isRTL ? 'الإجراءات' : 'Actions'}
              </th>
            </tr>
          </thead>
                     <tbody className="bg-card divide-y divide-border">
             {currentEquipment.map((equipment) => (
              <tr key={equipment.id} className="hover:bg-muted transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className={cn("flex-shrink-0 h-10 w-10 bg-gray-600 rounded-lg flex items-center justify-center", isRTL ? "ml-4" : "mr-4")}>
                      <FontAwesomeIcon icon={faTruck} className="h-5 w-5 text-awnash-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {isRTL ? equipment.nameAr : equipment.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {equipment.id} • {equipment.size}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm">
                    <div className="font-medium text-foreground">
                      {isRTL ? equipment.owner.nameAr : equipment.owner.name}
                    </div>
                    <div className="text-muted-foreground">
                      {isRTL ? equipment.owner.cityAr : equipment.owner.city}
                    </div>
                    <div className="mt-1">
                      {getOwnerStatusIndicator(equipment.owner.status)}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-muted-foreground">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className={cn("h-3 w-3 text-gray-500", isRTL ? "ml-1" : "mr-1")} />
                    {isRTL ? equipment.locationAr : equipment.location}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="text-sm font-medium text-foreground">
                    {equipment.rentals.toLocaleString(isRTL ? 'ar-SA' : 'en-US')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="text-sm font-medium text-awnash-primary">
                    {formatCurrency(equipment.revenue)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {getStatusBadge(equipment.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {getVerificationBadge(equipment.verification)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className={cn("flex items-center justify-center space-x-2", isRTL && "space-x-reverse")}>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="bg-muted border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <FontAwesomeIcon icon={faEye} className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="bg-muted border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <FontAwesomeIcon icon={faEdit} className="h-3 w-3" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Grid View Component (existing component)
  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {currentEquipment.map((equipment) => (
        <Card key={equipment.id} className="bg-card border-border hover:shadow-xl transition-all duration-200">
          <CardContent className="p-6">
            {/* Equipment Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className={cn("w-12 h-12 bg-muted rounded-lg flex items-center justify-center", isRTL ? "ml-3" : "mr-3")}>
                  <FontAwesomeIcon icon={faTruck} className="h-6 w-6 text-awnash-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {isRTL ? equipment.nameAr : equipment.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {equipment.id} • {equipment.size}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusBadge(equipment.status)}
              </div>
            </div>

            {/* Equipment Details */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {isRTL ? 'الفئة:' : 'Category:'}
                </span>
                <span className="text-sm text-foreground">
                  {isRTL ? equipment.categoryAr : equipment.category}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {isRTL ? 'النوع:' : 'Type:'}
                </span>
                <span className="text-sm text-foreground">
                  {isRTL ? equipment.typeAr : equipment.type}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {isRTL ? 'الموقع:' : 'Location:'}
                </span>
                <span className="text-sm text-foreground flex items-center">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className={cn("h-3 w-3 text-gray-500", isRTL ? "ml-1" : "mr-1")} />
                  {isRTL ? equipment.locationAr : equipment.location}
                </span>
              </div>
            </div>

            {/* Owner Information */}
            <div className="border-t border-border pt-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faUser} className={cn("h-4 w-4 text-gray-500", isRTL ? "ml-2" : "mr-2")} />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {isRTL ? equipment.owner.nameAr : equipment.owner.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isRTL ? equipment.owner.cityAr : equipment.owner.city}
                    </p>
                  </div>
                </div>
                {getOwnerStatusIndicator(equipment.owner.status)}
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-awnash-primary">
                  {equipment.rentals.toLocaleString(isRTL ? 'ar-SA' : 'en-US')}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isRTL ? 'حجز' : 'Rentals'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {formatCurrency(equipment.revenue)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isRTL ? 'الإيرادات' : 'Revenue'}
                </div>
              </div>
            </div>

            {/* Verification Status */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">
                {isRTL ? 'حالة التوثيق:' : 'Verification:'}
              </span>
              {getVerificationBadge(equipment.verification)}
            </div>

            {/* Action Buttons */}
            <div className={cn("flex space-x-2", isRTL && "space-x-reverse")}>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 bg-muted border-border text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <FontAwesomeIcon icon={faEye} className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                {isRTL ? 'عرض' : 'View'}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 bg-muted border-border text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <FontAwesomeIcon icon={faEdit} className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                {isRTL ? 'تعديل' : 'Edit'}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-muted border-border text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <FontAwesomeIcon icon={faFlag} className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className={cn("min-h-screen bg-background space-y-6", isRTL ? 'font-arabic' : 'font-montserrat')} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            {isRTL ? 'جميع المعدات' : 'All Equipment'}
          </h1>
          <p className="text-muted-foreground">
            {isRTL ? 'إدارة شاملة لجميع المعدات على المنصة' : 'Comprehensive management of all platform equipment'}
          </p>
          <div className="mt-2">
            <span className="text-sm text-gray-500">
                             {isRTL ? `إجمالي ${filteredAndSortedEquipment.length} معدة` : `Total ${filteredAndSortedEquipment.length} equipment`}
            </span>
          </div>
        </div>
        
        {/* View Toggle */}
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-card rounded-lg border border-border p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className={cn(
                "px-3 py-2",
                viewMode === 'grid' 
                  ? "bg-awnash-primary text-black hover:bg-awnash-primary/90" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <FontAwesomeIcon icon={faTh} className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
              {isRTL ? 'شبكة' : 'Grid'}
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className={cn(
                "px-3 py-2",
                viewMode === 'table' 
                  ? "bg-awnash-primary text-black hover:bg-awnash-primary/90" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <FontAwesomeIcon icon={faList} className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
              {isRTL ? 'جدول' : 'Table'}
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Sort Controls */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-lg">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <div className={cn("absolute inset-y-0 flex items-center pointer-events-none", isRTL ? "right-0 pr-3" : "left-0 pl-3")}>
                <FontAwesomeIcon icon={faSearch} className="h-4 w-4 text-muted-foreground" />
              </div>
              <input
                type="text"
                className={cn(
                  "block w-full py-3 border border-border rounded-lg bg-muted text-foreground placeholder:text-muted-foreground",
                  "focus:ring-2 focus:ring-awnash-primary focus:border-awnash-primary",
                  isRTL ? "pr-10 pl-3 text-right" : "pl-10 pr-3"
                )}
                placeholder={isRTL ? "البحث بالاسم أو الرقم أو الاسم العربي..." : "Search by name, ID, or Arabic name..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Sort Controls */}
          <div className={cn("flex items-center space-x-3", isRTL && "space-x-reverse")}>
            <span className="text-sm text-muted-foreground">
              {isRTL ? 'ترتيب حسب:' : 'Sort by:'}
            </span>
            <Button
              variant={sortBy === 'revenue' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSortChange('revenue')}
              className={cn(
                "flex items-center space-x-1",  
                sortBy === 'revenue' 
                  ? "bg-awnash-primary text-black hover:bg-awnash-primary/90" 
                  : "bg-muted border-border text-muted-foreground hover:bg-muted hover:text-foreground",
                isRTL && "space-x-reverse"
              )}
            >
              <span>{isRTL ? 'الإيرادات' : 'Revenue'}</span>
              {sortBy === 'revenue' && (
                <FontAwesomeIcon 
                  icon={faSort} 
                  className={cn("h-3 w-3", sortOrder === 'desc' ? 'rotate-180' : '')} 
                />
              )}
            </Button>
            <Button
              variant={sortBy === 'rentals' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSortChange('rentals')}
              className={cn(
                "flex items-center space-x-1",
                sortBy === 'rentals' 
                  ? "bg-awnash-primary text-black hover:bg-awnash-primary/90" 
                  : "bg-muted border-border text-muted-foreground hover:bg-muted hover:text-foreground",
                isRTL && "space-x-reverse"
              )}
            >
              <span>{isRTL ? 'الحجوزات' : 'Rentals'}</span>
              {sortBy === 'rentals' && (
                <FontAwesomeIcon 
                  icon={faSort} 
                  className={cn("h-3 w-3", sortOrder === 'desc' ? 'rotate-180' : '')} 
                />
              )}
            </Button>
            <Button
              variant={sortBy === 'newest' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSortChange('newest')}
              className={cn(
                "flex items-center space-x-1",
                sortBy === 'newest' 
                  ? "bg-awnash-primary text-black hover:bg-awnash-primary/90" 
                  : "bg-muted border-border text-muted-foreground hover:bg-muted hover:text-foreground",
                isRTL && "space-x-reverse"
              )}
            >
              <span>{isRTL ? 'الأحدث' : 'Newest'}</span>
              {sortBy === 'newest' && (
                <FontAwesomeIcon 
                  icon={faSort} 
                  className={cn("h-3 w-3", sortOrder === 'desc' ? 'rotate-180' : '')} 
                />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Analytics Dashboard */}
      <div className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-card rounded-xl border border-border p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {isRTL ? 'إجمالي المعدات' : 'Total Equipment'}
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {mockEquipment.length.toLocaleString(isRTL ? 'ar-SA' : 'en-US')}
                </p>
                <div className="flex items-center mt-1">
                  <span className="text-sm text-green-400">
                    {statusAnalytics.active || 0} {isRTL ? 'نشط' : 'active'}
                  </span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
                <FontAwesomeIcon icon={faTruck} className="h-6 w-6 text-foreground" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {isRTL ? 'إجمالي الإيرادات' : 'Total Revenue'}
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {formatCurrency(mockEquipment.reduce((sum, eq) => sum + eq.revenue, 0))}
                </p>
                <div className="flex items-center mt-1">
                  <span className="text-sm text-green-400">
                    {isRTL ? 'متوسط' : 'Avg'} {formatCurrency(mockEquipment.reduce((sum, eq) => sum + eq.revenue, 0) / mockEquipment.length)}
                  </span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-600">
                <FontAwesomeIcon icon={faDollarSign} className="h-6 w-6 text-foreground" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {isRTL ? 'إجمالي الحجوزات' : 'Total Rentals'}
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {mockEquipment.reduce((sum, eq) => sum + eq.rentals, 0).toLocaleString(isRTL ? 'ar-SA' : 'en-US')}
                </p>
                <div className="flex items-center mt-1">
                  <span className="text-sm text-yellow-400">
                    {isRTL ? 'متوسط' : 'Avg'} {Math.round(mockEquipment.reduce((sum, eq) => sum + eq.rentals, 0) / mockEquipment.length)} {isRTL ? 'لكل معدة' : 'per equipment'}
                  </span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600">
                <FontAwesomeIcon icon={faChartLine} className="h-6 w-6 text-foreground" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {isRTL ? 'المعدات المتاحة' : 'Available Equipment'}
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {(statusAnalytics.active || 0).toLocaleString(isRTL ? 'ar-SA' : 'en-US')}
                </p>
                <div className="flex items-center mt-1">
                  <span className="text-sm text-blue-400">
                    {Math.round(((statusAnalytics.active || 0) / mockEquipment.length) * 100)}% {isRTL ? 'من الإجمالي' : 'of total'}
                  </span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600">
                <FontAwesomeIcon icon={faCheckCircle} className="h-6 w-6 text-foreground" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Equipment by Category */}
          <div className="bg-card rounded-xl border border-border p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-foreground mb-6">
              {isRTL ? 'توزيع المعدات حسب الفئة' : 'Equipment by Category'}
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={contentStyle}
                  formatter={formatTooltipValue}
                  labelStyle={labelStyle}
                  itemStyle={itemStyle}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-1 gap-2 mt-4">
              {categoryChartData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className={cn("w-3 h-3 rounded-full", isRTL ? "ml-2" : "mr-2")} 
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Equipment Status */}
          <div className="bg-card rounded-xl border border-border p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-foreground mb-6">
              {isRTL ? 'حالة المعدات' : 'Equipment Status'}
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={contentStyle}
                  formatter={formatTooltipValue}
                  labelStyle={labelStyle}
                  itemStyle={itemStyle}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-1 gap-2 mt-4">
              {statusChartData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className={cn("w-3 h-3 rounded-full", isRTL ? "ml-2" : "mr-2")} 
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue by City */}
          <div className="bg-card rounded-xl border border-border p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-foreground mb-6">
              {isRTL ? 'الإيرادات حسب المدينة' : 'Revenue by City'}
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={cityChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="city" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip 
                  contentStyle={contentStyle}
                  formatter={formatTooltipValue}
                  labelStyle={labelStyle}
                  itemStyle={itemStyle}
                />
                <Bar 
                  dataKey="revenue" 
                  fill="#3B82F6" 
                  name="revenue"
                  radius={[4, 4, 0, 0]}
                  style={{ cursor: 'pointer' }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Revenue Equipment */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-foreground mb-6">
            {isRTL ? 'أعلى المعدات إيراداً' : 'Top Revenue Equipment'}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueDistributionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={contentStyle}
                formatter={formatTooltipValue}
                labelStyle={labelStyle}
                itemStyle={itemStyle}
              />
              <Bar 
                dataKey="revenue" 
                fill="#10B981" 
                name="revenue"
                radius={[4, 4, 0, 0]}
                style={{ cursor: 'pointer' }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Equipment Display */}
      {viewMode === 'grid' ? <GridView /> : <TableView />}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-card rounded-xl border border-border p-4">
          <div className="text-sm text-muted-foreground">
                         {isRTL 
               ? `عرض ${startIndex + 1}-${Math.min(startIndex + itemsPerPage, filteredAndSortedEquipment.length)} من ${filteredAndSortedEquipment.length}`
               : `Showing ${startIndex + 1}-${Math.min(startIndex + itemsPerPage, filteredAndSortedEquipment.length)} of ${filteredAndSortedEquipment.length}`
             }
          </div>
          
          <div className={cn("flex items-center space-x-2", isRTL && "space-x-reverse")}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="bg-muted border-border text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
            >
              <FontAwesomeIcon 
                icon={isRTL ? faChevronRight : faChevronLeft} 
                className="h-4 w-4" 
              />
            </Button>
            
            <div className={cn("flex items-center space-x-1", isRTL && "space-x-reverse")}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    "w-10 h-10",
                    currentPage === page 
                      ? "bg-awnash-primary text-black hover:bg-awnash-primary/90" 
                      : "bg-muted border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {page.toLocaleString(isRTL ? 'ar-SA' : 'en-US')}
                </Button>
              ))}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="bg-muted border-border text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
            >
              <FontAwesomeIcon 
                icon={isRTL ? faChevronLeft : faChevronRight} 
                className="h-4 w-4" 
              />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllEquipmentListing; 