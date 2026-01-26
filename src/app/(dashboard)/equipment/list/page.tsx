'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, Filter, Grid, List, Download, Eye, Edit, Trash2, 
  CheckCircle, XCircle, AlertTriangle, TrendingUp, Package, 
  DollarSign, Activity, ChevronLeft, ChevronRight, ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { equipmentService, Equipment } from '@/services/equipmentService';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/currencyUtils';
import { getEquipmentTypeLabel, getEquipmentSizeLabel, getEquipmentStatusLabel, getEquipmentTypesForDropdown } from '@/config/equipment';
import { getCityLabel } from '@/config/cities';
import { GlobalEquipmentModal } from '@/components/modals/GlobalEquipmentModal';
import { useApiErrorHandler } from '@/hooks/useApiErrorHandler';
import { InlineErrorPage } from '@/components/InlineErrorPage';

// Image Carousel Component for Grid View
const ImageCarousel: React.FC<{ images: string[]; title: string; isRTL: boolean }> = ({ images, title, isRTL }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="h-48 bg-gray-100 flex items-center justify-center">
        <Package className="h-12 w-12 text-gray-400" />
        <span className={`${isRTL ? 'mr-2' : 'ml-2'} text-gray-500 text-sm`}>No Image</span>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="relative h-48 bg-gray-100 overflow-hidden">
      <img
        src={images[currentImageIndex]}
        alt={`${title} - Image ${currentImageIndex + 1}`}
        className="w-full h-full object-cover"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          target.nextElementSibling?.classList.remove('hidden');
        }}
      />
      
      {/* Fallback for failed images */}
      <div className="hidden absolute inset-0 flex items-center justify-center">
        <Package className="h-12 w-12 text-gray-400" />
        <span className={`${isRTL ? 'mr-2' : 'ml-2'} text-gray-500 text-sm`}>Image Error</span>
      </div>

      {/* Navigation arrows */}
      {images.length > 1 && (
        <>
  <button
            onClick={prevImage}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
          >
            <ChevronLeftIcon className="h-4 w-4" />
  </button>
  <button
            onClick={nextImage}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
          >
            <ChevronRightIcon className="h-4 w-4" />
  </button>
          
          {/* Image indicators */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const EquipmentPage: React.FC = () => {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { handleApiError, error } = useApiErrorHandler();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedOwner, setSelectedOwner] = useState<string>('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [equipmentToEdit, setEquipmentToEdit] = useState<Equipment | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [deleteError, setDeleteError] = useState<string>('');
  const [deleteSuccess, setDeleteSuccess] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState<'revenue' | 'rentals' | 'created'>('revenue');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [showFlagged, setShowFlagged] = useState(false);
  const [showUnverified, setShowUnverified] = useState(false);
  const isRTL = i18n.language === 'ar';

  // Summary stats - will be calculated from API data
  const [summaryStats, setSummaryStats] = useState({
    totalEquipment: 0,
    totalRevenue: 0,
    mostRentedCategory: '',
    pendingVerification: 0
  });

  // Get categories from global equipment configuration
  const categories = getEquipmentTypesForDropdown(isRTL).map(type => ({
    value: type.value,
    label: type.label
  }));

  const fetchEquipment = useCallback(async () => {
    try {
      setLoading(true);
      
      // Prepare parameters for the API call
      const params: any = {
        page: currentPage,
        limit: 10,
        sortBy,
        sortOrder
      };
      
      // Add filters
      if (searchTerm) params.search = searchTerm;
      if (selectedStatus && selectedStatus !== 'all') params.status = selectedStatus;
      if (selectedCategory && selectedCategory !== 'all') params.equipment_type = selectedCategory;
      
      // Use the equipment service to fetch data
      const result = await equipmentService.getEquipment(params);
      
      // Update state with the fetched data
      setEquipment(result.data);
      setTotalPages(result.totalPages);
      setTotalPages(Math.ceil(result.total / 10));
      
      // Calculate summary stats from API data
      const totalEquip = result.total || 0;
      const totalRev = result.data.reduce((sum, item) => sum + (parseFloat(item.daily_rate) || 0), 0);
      const pendingVer = result.data.filter(item => item.status === 'pending').length;
      
      setSummaryStats({
        totalEquipment: totalEquip,
        totalRevenue: totalRev,
        mostRentedCategory: 'N/A', // Will need separate API call for this
        pendingVerification: pendingVer
      });
    } catch (error: any) {
      console.error('Failed to fetch equipment:', error);
      
      // Check if it's a permission error first
      if (error?.message?.includes('Missing required permissions')) {
        handleApiError(error);
        return; // Don't continue with normal error handling
      }
      
      handleApiError(error);
      setEquipment([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedStatus, selectedCategory, currentPage, sortBy, sortOrder]);

  useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]);

  const handleStatusChange = async (equipmentId: string, newStatus: Equipment['status']) => {
    try {
      // TODO: Implement API call to update equipment status
      console.log('Update equipment status:', equipmentId, newStatus);
    } catch (error) {
      console.error('Failed to update equipment status:', error);
    }
  };

  const handleDeleteEquipment = async (equipmentId: string) => {
    if (window.confirm(isRTL ? 'هل أنت متأكد من حذف هذه المعدة؟' : 'Are you sure you want to delete this equipment?')) {
      try {
        setDeleteError('');
        setDeleteSuccess('');
        
        // Call the equipment service to delete
        await equipmentService.deleteEquipment(equipmentId);
        
        // Show success message
        setDeleteSuccess(isRTL ? 'تم حذف المعدة بنجاح!' : 'Equipment deleted successfully!');
        
        // Refresh equipment list
        fetchEquipment();
        
        // Auto-hide success message after 3 seconds
        setTimeout(() => {
          setDeleteSuccess('');
        }, 3000);
        
      } catch (error: any) {
        console.error('Failed to delete equipment:', error);
        
        // Check if it's a permission error first
        if (error?.response?.data?.message?.includes('Missing required permissions')) {
          handleApiError(error);
          return;
        }
        
        // The service throws Error objects with message property
        let errorMessage = isRTL ? 'حدث خطأ أثناء حذف المعدة' : 'Failed to delete equipment';
        
        if (error.message) {
          // Use the exact message from the service
          errorMessage = error.message;
        } else {
          // Fallback for any other error type
          errorMessage = error.toString();
        }
        
        setDeleteError(errorMessage);
        
        // Auto-hide error message after 5 seconds
        setTimeout(() => {
          setDeleteError('');
        }, 5000);
      }
    }
  };

  // Modal handlers
  const handleOpenEditModal = (equipment: Equipment) => {
    setEquipmentToEdit(equipment);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEquipmentToEdit(null);
    setIsEditMode(false);
  };

  const handleModalSuccess = () => {
    // Refresh equipment list after successful edit
    fetchEquipment();
  };


  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getStatusBadge = (status: Equipment['status']) => {
    const badges = {
      'active': 'badge-success',
      'inactive': 'badge-secondary', 
      'pending': 'badge-warning',
      'approved': 'badge-success',
      'rejected': 'badge-error',
      'flagged': 'badge-error',
      'maintenance': 'badge-warning',
      'booked': 'badge-info',
      'suspended': 'badge-error'
    };
    return badges[status] || 'badge-secondary';
  };

  // Category icon mapping removed - using images instead

  const exportToCSV = () => {
    const csvData = equipment.map(item => ({
      'Equipment Name': item.name,
      'Category': item.equipment_type,
      'Owner': item.owner?.full_name || 'N/A',
      'Status': item.status,
      'Daily Rate (SAR)': item.daily_rate,
      'Total Rentals': item.total_rentals || 0,
      'Total Revenue (SAR)': item.total_revenue || 0,
      'Location': item.city,
      'Created Date': item.created_at
    }));
    
    // Simple CSV export (in real app, use proper CSV library)
    console.log('Exporting CSV:', csvData);
    alert('CSV export functionality would be implemented here');
  };

  // Equipment is already paginated from API
  const paginatedEquipment = equipment;

  return (
      <div className="space-y-6 p-6">
        {/* Show only error if there's a 403/401 error */}
        {error && (error.statusCode === 403 || error.statusCode === 401) ? (
          <InlineErrorPage
            statusCode={error.statusCode}
            title={error.error}
            message={error.message}
          />
        ) : (
          <>
            {/* Page Header */}
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {t('equipment_overview', 'Equipment Overview')}
                </h1>
                <p className="text-gray-600">
                  {t('equipment_overview_desc', 'Manage heavy equipment rental marketplace')}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
                  className="flex items-center gap-2"
                >
                  {viewMode === 'table' ? <Grid className="h-4 w-4" /> : <List className="h-4 w-4" />}
                  {viewMode === 'table' ? t('grid_view', 'Grid View') : t('table_view', 'Table View')}
                </Button>
                <Button
                  variant="outline"
                  onClick={exportToCSV}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  {t('export_csv', 'Export CSV')}
                </Button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-primary">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {t('total_equipment', 'Total Equipment')}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatNumber(summaryStats.totalEquipment)}
                  </p>
                </div>
                <Package className="h-12 w-12 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {t('total_revenue', 'Total Revenue')}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatCurrency(summaryStats.totalRevenue)}
                  </p>
                </div>
                <DollarSign className="h-12 w-12 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {t('most_rented', 'Most Rented Category')}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {summaryStats.mostRentedCategory}
                  </p>
                </div>
                <TrendingUp className="h-12 w-12 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {t('pending_verification', 'Pending Verification')}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {summaryStats.pendingVerification}
                  </p>
                </div>
                <AlertTriangle className="h-12 w-12 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-6">
            <div className={cn("grid grid-cols-1 md:grid-cols-6 gap-4", isRTL && "text-right")}>
              {/* Search */}
              <div className="relative md:col-span-2">
                <Search className={cn("absolute top-2.5 h-4 w-4 text-gray-400", 
                  isRTL ? "right-3" : "left-3"
                )} />
                <input
                  type="text"
                  placeholder={t('search_equipment_owner', 'Search equipment or owner...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={cn(
                    "w-full rounded-md border border-gray-300 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary",
                    isRTL ? "pr-10 pl-3" : "pl-10 pr-3"
                  )}
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={cn(
                  "rounded-md border border-gray-300 py-2 px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary",
                  isRTL && "text-right"
                )}
              >
                <option value="">{t('all_categories', 'All Categories')}</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
              </select>

              {/* Equipment Type Filter */}
              <select
                value={selectedOwner}
                onChange={(e) => setSelectedOwner(e.target.value)}
                className={cn(
                  "rounded-md border border-gray-300 py-2 px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary",
                  isRTL && "text-right"
                )}
              >
                <option value="">{t('all_types', 'All Equipment Types')}</option>
              <option value="Bulldozer">Bulldozer</option>
              <option value="Excavator">Excavator</option>
              <option value="Mobile Crane">Mobile Crane</option>
              <option value="Telehandler">Telehandler</option>
              <option value="Dump Truck">Dump Truck</option>
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className={cn(
                  "rounded-md border border-gray-300 py-2 px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary",
                  isRTL && "text-right"
                )}
              >
                <option value="">{t('all_statuses', 'All Statuses')}</option>
                <option value="active">{t('active', 'Active')}</option>
                <option value="inactive">{t('inactive', 'Inactive')}</option>
                <option value="pending">{t('pending', 'Pending')}</option>
                <option value="flagged">{t('flagged', 'Flagged')}</option>
              </select>

              {/* Sort By */}
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field as 'revenue' | 'rentals' | 'created');
                  setSortOrder(order as 'asc' | 'desc');
                }}
                className={cn(
                  "rounded-md border border-gray-300 py-2 px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary",
                  isRTL && "text-right"
                )}
              >
                <option value="revenue-desc">{t('highest_revenue', 'Highest Revenue')}</option>
                <option value="revenue-asc">{t('lowest_revenue', 'Lowest Revenue')}</option>
                <option value="rentals-desc">{t('most_rented', 'Most Rented')}</option>
                <option value="rentals-asc">{t('least_rented', 'Least Rented')}</option>
                <option value="created-desc">{t('newest_first', 'Newest First')}</option>
                <option value="created-asc">{t('oldest_first', 'Oldest First')}</option>
              </select>

              {/* Toggle Filters */}
              <div className="flex gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showFlagged}
                    onChange={(e) => setShowFlagged(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  {t('flagged_only', 'Flagged Only')}
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showUnverified}
                    onChange={(e) => setShowUnverified(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  {t('unverified_only', 'Unverified Only')}
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error and Success Messages */}
        {deleteError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <p className="text-red-700">{deleteError}</p>
            </div>
          </div>
        )}
        
        {deleteSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <p className="text-green-700">{deleteSuccess}</p>
            </div>
          </div>
        )}

        {/* Equipment Display */}
        {viewMode === 'table' ? (
          /* Table View */
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                                       <tr>
                     <th className={cn("px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", isRTL && "text-right")}>
                       Equipment
                     </th>
                     <th className={cn("px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", isRTL && "text-right")}>
                       Type
                     </th>
                     <th className={cn("px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", isRTL && "text-right")}>
                       Owner
                     </th>
                     <th className={cn("px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", isRTL && "text-right")}>
                       Daily Rate
                     </th>
                     <th className={cn("px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", isRTL && "text-right")}>
                       City
                     </th>
                     <th className={cn("px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", isRTL && "text-right")}>
                       Status
                     </th>
                     <th className={cn("px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", isRTL && "text-right")}>
                       Actions
                     </th>
                   </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <tr key={index} className="animate-pulse">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-12 w-12 bg-gray-200 rounded"></div>
                            <div className={cn("ml-4", isRTL && "mr-4 ml-0")}>
                              <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                              <div className="h-3 bg-gray-200 rounded w-24"></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                        <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded w-16"></div></td>
                      </tr>
                    ))
                                     ) : paginatedEquipment.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        No equipment found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedEquipment.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-12 w-12 flex-shrink-0">
                                {item.image_urls && item.image_urls.length > 0 ? (
                                <img
                                  src={item.image_urls[0]}
                                  alt={item.name}
                                  className="h-12 w-12 rounded-lg object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    target.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                              ) : (
                                <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                  <Package className="h-6 w-6 text-gray-400" />
                                </div>
                                )}
                              
                              {/* Fallback for failed images */}
                              <div className="hidden h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                <Package className="h-6 w-6 text-gray-400" />
                              </div>
                            </div>
                            <div className={cn("ml-4", isRTL && "mr-4 ml-0")}> 
                               <div className="text-sm font-medium text-gray-900">
                                 {item.name}
                               </div>
                               <div className="text-sm text-gray-500">
                                 {getEquipmentSizeLabel(item.size, isRTL)} • {getCityLabel(item.city, isRTL)}
                               </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                           <div className="text-sm text-gray-700">
                             {getEquipmentTypeLabel(item.equipment_type, isRTL)}
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <div className="text-sm text-gray-700">
                             {item.owner?.full_name || 'N/A'}
                           </div>
                           {item.owner?.email && (
                             <div className="text-xs text-gray-500">
                               {item.owner.email}
                             </div>
                           )}
                        </td>
                        <td className="px-6 py-4">
                           <div className="text-sm text-gray-700">
                             {item.daily_rate ? formatCurrency(item.daily_rate) : 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                             {getCityLabel(item.city, isRTL)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                           <span className={`badge ${getStatusBadge(item.status)}`}>
                             {getEquipmentStatusLabel(item.status, isRTL)}
                           </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className={cn("flex items-center space-x-2", isRTL && "space-x-reverse")}>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-blue-600 hover:text-blue-900"
                              onClick={() => router.push(`/equipment/${item.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-green-600 hover:text-green-900"
                              onClick={() => handleOpenEditModal(item)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {item.status === 'pending' && (
                              <>
                            <Button
                              variant="ghost"
                              size="sm"
                                  onClick={() => handleStatusChange(item.id, 'active')}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleStatusChange(item.id, 'rejected')}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteEquipment(item.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 8 }).map((_, index) => (
              <Card key={index} className="animate-pulse overflow-hidden">
                <div className="h-48 bg-gray-200"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="flex justify-between mb-2">
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))
          ) : paginatedEquipment.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">{t('no_equipment_found', 'No equipment found matching your criteria.')}</p>
            </div>
          ) : (
            paginatedEquipment.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <ImageCarousel images={item.image_urls || []} title={item.name} isRTL={isRTL} />
                  <div className="absolute top-2 right-2">
                    <span className={`badge ${getStatusBadge(item.status)}`}>
                      {getEquipmentStatusLabel(item.status, isRTL)}
                    </span>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                    <p className="text-sm text-gray-600">{getEquipmentSizeLabel(item.size, isRTL)}</p>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        {getEquipmentTypeLabel(item.equipment_type, isRTL)}
                      </span>
                      <span className="font-bold text-green-600">
                        {item.daily_rate ? formatCurrency(item.daily_rate) + '/day' : 'N/A'}
                      </span>
                    </div>

                    <div className="text-xs text-gray-500">
                      👤 {item.owner?.full_name || 'N/A'}
                     </div>
                    {item.owner?.email && (
                      <div className="text-xs text-gray-400 truncate">
                        📧 {item.owner.email}
                      </div>
                    )}

                    <div className="text-xs text-gray-500 truncate">
                      📍 {getCityLabel(item.city, isRTL)}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between pt-2 border-t">
                      <div className={cn("flex space-x-1", isRTL && "space-x-reverse")}>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-blue-600 hover:text-blue-900"
                          onClick={() => router.push(`/equipment/${item.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-green-600 hover:text-green-900"
                          onClick={() => handleOpenEditModal(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteEquipment(item.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {item.status === 'pending' && (
                        <div className={cn("flex space-x-1", isRTL && "space-x-reverse")}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStatusChange(item.id, 'active')}
                            className="text-green-600 hover:text-green-900"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStatusChange(item.id, 'rejected')}
                            className="text-red-600 hover:text-red-900"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            {t('showing_page', 'Showing page')} {currentPage} {t('of', 'of')} {totalPages}
          </div>
          <div className={cn("flex items-center space-x-2", isRTL && "space-x-reverse")}> 
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              {t('previous', 'Previous')}
            </Button>
            
            {/* Page Numbers */}
            <div className={cn("flex space-x-1", isRTL && "space-x-reverse")}>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                if (pageNum > totalPages) return null;
                
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2"
            >
              {t('next', 'Next')}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Global Equipment Modal */}
      <GlobalEquipmentModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        isRTL={isRTL}
        equipmentToEdit={equipmentToEdit}
        isEditMode={isEditMode}
        onSuccess={handleModalSuccess}
      />
          </>
        )}
      </div>
    );
};

export default EquipmentPage; 