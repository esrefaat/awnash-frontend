'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faEye,
  faEdit,
  faTrash, 
  faFilter, 
  faSearch,
  faSpinner,
  faCheckCircle,
  faTimesCircle,
  faClock,
  faAngleDown,
  faAngleUp
} from '@fortawesome/free-solid-svg-icons';
import { cn } from '@/lib/utils';
import { EquipmentFormModal } from '@/components/modals/EquipmentFormModal';
import { equipmentService, Equipment } from '@/services/equipmentService';
import { equipmentTypeService, EquipmentType } from '@/services/equipmentTypeService';
import { useApiErrorHandler } from '@/hooks/useApiErrorHandler';
import { InlineErrorPage } from '@/components/InlineErrorPage';

// Component state
const EquipmentAddPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { handleApiError, error: apiError } = useApiErrorHandler();
  
  // State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Equipment listing state
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [equipmentLoading, setEquipmentLoading] = useState(true);
  const [equipmentError, setEquipmentError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);
  
  // Edit state
  const [isEditMode, setIsEditMode] = useState(false);
  const [equipmentToEdit, setEquipmentToEdit] = useState<Equipment | null>(null);
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    equipmentType: 'all',
    isAvailable: 'all'
  });
  
  // Equipment types for filter dropdown
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([]);
  const [equipmentTypesLoading, setEquipmentTypesLoading] = useState(true);
  
  // Sort
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

  // Handlers
  const handleOpenModal = () => {
    setIsEditMode(false);
    setEquipmentToEdit(null);
    setIsModalOpen(true);
    setError('');
    setSuccess('');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEquipmentToEdit(null);
  };

  const handleModalSuccess = () => {
    // Refresh equipment list after successful add/edit
    fetchEquipment();
  };

  // Fetch equipment data
  const fetchEquipment = async () => {
    try {
      setEquipmentLoading(true);
      setEquipmentError('');
      
      // Prepare parameters for the API call
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
        sortBy,
        sortOrder
      };
      
      // Add filters
      if (filters.search) params.search = filters.search;
      if (filters.status !== 'all') params.status = filters.status;
      if (filters.equipmentType !== 'all') params.equipmentType = filters.equipmentType;
      if (filters.isAvailable !== 'all') params.isAvailable = filters.isAvailable;
      
      // Use the equipment service to fetch data
      const result = await equipmentService.getEquipment(params);
      
      // Update state with the fetched data
      setEquipment(result.data);
      setTotalItems(result.total);
      setTotalPages(result.totalPages);
      
    } catch (err: any) {
      console.error('Failed to fetch equipment:', err);
      
      // Check if it's a permission error first
      if (err?.message?.includes('Missing required permissions')) {
        handleApiError(err);
        return; // Don't continue with normal error handling
      }
      
      handleApiError(err);
      setEquipmentError(err.message || (isRTL ? 'حدث خطأ أثناء جلب المعدات' : 'Error fetching equipment'));
      setEquipment([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setEquipmentLoading(false);
    }
  };

  // Fetch equipment on component mount and when filters change
  useEffect(() => {
    fetchEquipment();
  }, [currentPage, filters, sortBy, sortOrder]);

  // Fetch equipment types for filter dropdown (API returns sorted by displayOrder)
  useEffect(() => {
    const fetchEquipmentTypes = async () => {
      try {
        setEquipmentTypesLoading(true);
        const response = await equipmentTypeService.getAll({ limit: 100 });
        setEquipmentTypes(response.data || []);
      } catch (err) {
        console.error('Failed to fetch equipment types:', err);
        setEquipmentTypes([]);
      } finally {
        setEquipmentTypesLoading(false);
      }
    };
    
    fetchEquipmentTypes();
  }, []);



  // Status badge helper
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string; icon: any }> = {
      active: { 
        color: 'bg-green-500', 
        text: isRTL ? 'نشط' : 'Active',
        icon: faCheckCircle
      },
      inactive: { 
        color: 'bg-gray-500', 
        text: isRTL ? 'غير نشط' : 'Inactive',
        icon: faTimesCircle
      },
      suspended: { 
        color: 'bg-red-500', 
        text: isRTL ? 'معلق' : 'Suspended',
        icon: faTimesCircle
      },
      maintenance: { 
        color: 'bg-yellow-500', 
        text: isRTL ? 'صيانة' : 'Maintenance',
        icon: faClock
      },
      booked: { 
        color: 'bg-blue-500', 
        text: isRTL ? 'محجوز' : 'Booked',
        icon: faClock
      }
    };
    
    return statusConfig[status] || statusConfig.inactive;
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle equipment actions
  const handleViewEquipment = (id: string) => {
    // Navigate to equipment view page
    window.location.href = `/equipment/view/${id}`;
  };

  const handleEditEquipment = (equipment: Equipment) => {
    setIsEditMode(true);
    setEquipmentToEdit(equipment);
    setIsModalOpen(true);
    setError('');
    setSuccess('');
  };

  const handleDeleteEquipment = async (id: string) => {
    if (!confirm(isRTL ? 'هل أنت متأكد من حذف هذه المعدة؟' : 'Are you sure you want to delete this equipment?')) {
      return;
    }
    
    try {
      setError('');
      setSuccess('');
      
      await equipmentService.deleteEquipment(id);
      setSuccess(isRTL ? 'تم حذف المعدة بنجاح!' : 'Equipment deleted successfully!');
      fetchEquipment(); // Refresh the list
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
      
    } catch (err: any) {
      // The service throws Error objects with message property
      let errorMessage = isRTL ? 'حدث خطأ أثناء حذف المعدة' : 'Failed to delete equipment';
      
      if (err.message) {
        // Use the exact message from the service
        errorMessage = err.message;
      } else {
        // Fallback for any other error type
        errorMessage = err.toString();
      }
      
      setError(errorMessage);
      
      // Auto-hide error message after 5 seconds
      setTimeout(() => {
        setError('');
      }, 5000);
    }
  };

  return (
    <div className={cn("min-h-screen bg-gray-900 p-6", isRTL ? 'font-arabic' : 'font-montserrat')} dir={isRTL ? 'rtl' : 'ltr'}>
      {apiError && (apiError.statusCode === 403 || apiError.statusCode === 401) ? (
        <InlineErrorPage
          statusCode={apiError.statusCode}
          title={apiError.error}
          message={apiError.message}
        />
      ) : (
        <>
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {isRTL ? 'إضافة معدة جديدة' : 'Add New Equipment'}
                </h1>
                <p className="text-gray-400">
                  {isRTL ? 'إنشاء معدة جديدة للتأجير. يمكن للمالكين والمدراء فقط إنشاء المعدات.' : 'Create a new equipment item for rental. Only owners and admins can create equipment.'}
                </p>
              </div>
              <button
                onClick={handleOpenModal}
                className={cn('flex items-center px-6 py-3 bg-awnash-primary hover:bg-awnash-primary-hover text-black rounded-2xl font-medium transition-colors shadow-lg', isRTL ? 'space-x-reverse space-x-2' : 'space-x-2')}
              >
                <FontAwesomeIcon icon={faPlus} className="h-5 w-5" />
                <span>{isRTL ? 'إضافة معدة جديدة' : 'Add New Equipment'}</span>
              </button>
            </div>

            {/* Success Messages */}
            {success && (
              <div className="mb-6 p-4 bg-green-900/20 border border-green-500/50 rounded-lg">
                <p className="text-green-400">{success}</p>
              </div>
            )}

        {/* Filters */}
        <div className="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {isRTL ? 'البحث' : 'Search'}
              </label>
              <div className="relative">
                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={isRTL ? 'ابحث عن المعدات...' : 'Search equipment...'}
              />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {isRTL ? 'الحالة' : 'Status'}
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">{isRTL ? 'جميع الحالات' : 'All Statuses'}</option>
                <option value="active">{isRTL ? 'نشط' : 'Active'}</option>
                <option value="inactive">{isRTL ? 'غير نشط' : 'Inactive'}</option>
                <option value="suspended">{isRTL ? 'معلق' : 'Suspended'}</option>
                <option value="maintenance">{isRTL ? 'صيانة' : 'Maintenance'}</option>
                <option value="booked">{isRTL ? 'محجوز' : 'Booked'}</option>
              </select>
            </div>

            {/* Equipment Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {isRTL ? 'نوع المعدة' : 'Equipment Type'}
              </label>
              <select
                value={filters.equipmentType}
                onChange={(e) => setFilters(prev => ({ ...prev, equipmentType: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={equipmentTypesLoading}
              >
                <option value="all">{isRTL ? 'جميع الأنواع' : 'All Types'}</option>
                {equipmentTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {isRTL ? type.nameAr : type.nameEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Availability Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {isRTL ? 'التوفر' : 'Availability'}
              </label>
              <select
                value={filters.isAvailable}
                onChange={(e) => setFilters(prev => ({ ...prev, isAvailable: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">{isRTL ? 'الكل' : 'All'}</option>
                <option value="true">{isRTL ? 'متاح' : 'Available'}</option>
                <option value="false">{isRTL ? 'غير متاح' : 'Not Available'}</option>
              </select>
            </div>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-700">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-300">
                {isRTL ? 'ترتيب حسب:' : 'Sort by:'}
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="created_at">{isRTL ? 'تاريخ الإنشاء' : 'Created Date'}</option>
                <option value="name">{isRTL ? 'الاسم' : 'Name'}</option>
                <option value="equipment_type">{isRTL ? 'النوع' : 'Type'}</option>
                <option value="daily_rate">{isRTL ? 'السعر اليومي' : 'Daily Rate'}</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC')}
                className="p-1 text-gray-400 hover:text-white transition-colors"
              >
                <FontAwesomeIcon icon={sortOrder === 'ASC' ? faAngleUp : faAngleDown} className="h-4 w-4" />
              </button>
            </div>
            <div className="text-sm text-gray-400">
              {isRTL ? `عرض ${equipment.length} من أصل ${totalItems}` : `Showing ${equipment.length} of ${totalItems}`}
            </div>
          </div>
        </div>

        {/* Error and Success Messages */}
        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-500/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <FontAwesomeIcon icon={faTimesCircle} className="h-5 w-5 text-red-400" />
              <p className="text-red-400">{error}</p>
            </div>
          </div>
        )}
        
        {success && (
          <div className="mb-6 bg-green-900/20 border border-green-500/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <FontAwesomeIcon icon={faCheckCircle} className="h-5 w-5 text-green-400" />
              <p className="text-green-400">{success}</p>
            </div>
          </div>
        )}

        {/* Equipment Table */}
        {equipmentLoading ? (
          <div className="bg-gray-800 rounded-xl p-12 text-center border border-gray-700">
            <FontAwesomeIcon icon={faSpinner} className="h-8 w-8 text-blue-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-400">{isRTL ? 'جاري تحميل المعدات...' : 'Loading equipment...'}</p>
          </div>
        ) : equipmentError ? (
          <div className="bg-gray-800 rounded-xl p-6 border border-red-500/50">
            <p className="text-red-400">{equipmentError}</p>
          </div>
        ) : equipment.length === 0 ? (
          <div className="bg-gray-800 rounded-xl p-12 text-center border border-gray-700">
            <FontAwesomeIcon icon={faPlus} className="h-16 w-16 text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {isRTL ? 'لم يتم العثور على معدات' : 'No equipment found'}
            </h3>
            <p className="text-gray-400 mb-6">
              {isRTL ? 'ابدأ بإضافة معداتك الأولى' : 'Start by adding your first equipment'}
            </p>
            <button
              onClick={handleOpenModal}
              className={cn('inline-flex items-center px-6 py-3 bg-awnash-primary hover:bg-awnash-primary-hover text-black rounded-2xl font-medium transition-colors shadow-lg', isRTL ? 'space-x-reverse space-x-2' : 'space-x-2')}
            >
              <FontAwesomeIcon icon={faPlus} className="h-5 w-5" />
              <span>{isRTL ? 'إضافة معدة الآن' : 'Add Equipment Now'}</span>
            </button>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-750">
                  <tr>
                    <th className={cn('px-4 py-4 font-medium text-gray-300', isRTL ? 'text-right' : 'text-left')}>
                      {isRTL ? 'المعدة' : 'Equipment'}
                    </th>
                    <th className={cn('px-4 py-4 font-medium text-gray-300', isRTL ? 'text-right' : 'text-left')}>
                      {isRTL ? 'النوع' : 'Type'}
                    </th>
                    <th className={cn('px-4 py-4 font-medium text-gray-300', isRTL ? 'text-right' : 'text-left')}>
                      {isRTL ? 'الحالة' : 'Status'}
                    </th>
                                         <th className={cn('px-4 py-4 font-medium text-gray-300', isRTL ? 'text-right' : 'text-left')}>
                       {isRTL ? 'السعر اليومي' : 'Daily Rate'}
                    </th>
                     <th className={cn('px-4 py-4 font-medium text-gray-300', isRTL ? 'text-right' : 'text-left')}>
                       {isRTL ? 'الإحصائيات' : 'Stats'}
                    </th>
                    <th className={cn('px-4 py-4 font-medium text-gray-300', isRTL ? 'text-right' : 'text-left')}>
                       {isRTL ? 'تاريخ الإنشاء' : 'Created'}
                    </th>
                    <th className="px-4 py-4 text-center font-medium text-gray-300">
                      {isRTL ? 'الإجراءات' : 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {equipment.map((item) => {
                    const statusBadge = getStatusBadge(item.status);
                    return (
                      <tr key={item.id} className="border-b border-gray-700 hover:bg-gray-800/50">
                        <td className="px-4 py-4">
                          <div>
                            <div className="font-medium text-white">{item.name}</div>
                            <div className="text-sm text-gray-400">{item.city}</div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-gray-300 capitalize">
                          {item.equipmentType}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${statusBadge.color}`}>
                            <FontAwesomeIcon icon={statusBadge.icon} className="h-3 w-3 mr-1" />
                            {statusBadge.text}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-gray-300">
                          ${parseFloat(item.dailyRate || '0').toFixed(2)}/day
                        </td>
                        <td className="px-4 py-4 text-gray-300">
                          <div className="text-sm">
                            <div>{isRTL ? 'التأجيرات:' : 'Rentals:'} {item.totalRentals}</div>
                            <div>{isRTL ? 'الإيرادات:' : 'Revenue:'} ${parseFloat(item.totalRevenue || '0').toFixed(2)}</div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-gray-300">
                          {formatDate(item.createdAt)}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleViewEquipment(item.id)}
                              className="p-2 text-gray-400 hover:text-white transition-colors"
                              title={isRTL ? 'عرض' : 'View'}
                            >
                              <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEditEquipment(item)}
                              className="p-2 text-awnash-primary hover:text-awnash-primary-hover transition-colors"
                              title={isRTL ? 'تعديل' : 'Edit'}
                            >
                              <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteEquipment(item.id)}
                              className="p-2 text-red-400 hover:text-red-300 transition-colors"
                              title={isRTL ? 'حذف' : 'Delete'}
                            >
                              <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-400">
              {isRTL 
                ? `عرض ${(currentPage - 1) * itemsPerPage + 1} إلى ${Math.min(currentPage * itemsPerPage, totalItems)} من أصل ${totalItems}`
                : `Showing ${(currentPage - 1) * itemsPerPage + 1} to ${Math.min(currentPage * itemsPerPage, totalItems)} of ${totalItems}`
              }
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 bg-gray-700 text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
              >
                {isRTL ? 'السابق' : 'Previous'}
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    'px-3 py-2 rounded-lg transition-colors',
                    page === currentPage
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  )}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 bg-gray-700 text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
              >
                {isRTL ? 'التالي' : 'Next'}
              </button>
            </div>
          </div>
        )}

      </div>
        </>
      )}

      {/* Global Equipment Modal - Always render outside conditional */}
      <EquipmentFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        isRTL={isRTL}
        equipmentToEdit={equipmentToEdit}
        isEditMode={isEditMode}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default EquipmentAddPage; 