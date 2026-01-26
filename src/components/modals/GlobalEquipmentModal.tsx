import React, { useState, useRef, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCloudUpload,
  faSpinner,
  faImage,
  faCheckCircle,
  faExclamationTriangle,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { cn } from '@/lib/utils';
import { getCitiesForDropdown } from '@/config/cities';
import { 
  getEquipmentSizesForDropdown,
  getEquipmentStatusesForDropdown
} from '@/config/equipment';
import { equipmentTypeService, EquipmentType } from '@/services/equipmentTypeService';
import { equipmentService, Equipment, EquipmentFormData } from '@/services/equipmentService';
import { usersService } from '@/services/usersService';
import { useAuth } from '@/contexts/AuthContext';


interface GlobalEquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  isRTL?: boolean;
  equipmentToEdit?: Equipment | null;
  isEditMode?: boolean;
  onSuccess?: () => void; // Callback for when equipment is successfully added/updated
}

export const GlobalEquipmentModal: React.FC<GlobalEquipmentModalProps> = ({
  isOpen,
  onClose,
  isRTL = false,
  equipmentToEdit = null,
  isEditMode = false,
  onSuccess
}) => {
  const [form, setForm] = useState<EquipmentFormData>({
    name: '',
    description: '',
    equipment_type_id: '',
    size: '',
    city: '',
    status: 'active',
    image_urls: [],
    daily_rate: 0,
    owner_id: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [owners, setOwners] = useState<Array<{id: string, full_name: string, email?: string}>>([]);
  const [loadingOwners, setLoadingOwners] = useState(false);
  const [ownerSearchTerm, setOwnerSearchTerm] = useState('');
  const [showOwnerDropdown, setShowOwnerDropdown] = useState(false);
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([]);
  const [loadingEquipmentTypes, setLoadingEquipmentTypes] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ownerDropdownRef = useRef<HTMLDivElement>(null);

  
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';

  // Filter owners based on search term
  const filteredOwners = owners.filter(owner => 
    owner.full_name.toLowerCase().includes(ownerSearchTerm.toLowerCase()) ||
    (owner.email && owner.email.toLowerCase().includes(ownerSearchTerm.toLowerCase()))
  );

  // Get selected owner display text
  const selectedOwner = owners.find(owner => owner.id === form.owner_id);
  const selectedOwnerText = selectedOwner ? `${selectedOwner.full_name}${selectedOwner.email ? ` (${selectedOwner.email})` : ''}` : '';

  // Initialize form with equipment data when editing
  useEffect(() => {
    if (isEditMode && equipmentToEdit) {
      setForm({
        name: equipmentToEdit.name || '',
        description: equipmentToEdit.description || '',
        equipment_type_id: equipmentToEdit.equipment_type_id || '',
        size: equipmentToEdit.size || '',
        city: equipmentToEdit.city || '',
        status: equipmentToEdit.status || 'active',
        image_urls: equipmentToEdit.image_urls || [],
        daily_rate: parseFloat(equipmentToEdit.daily_rate || '0'),
        owner_id: equipmentToEdit.owner_id || user?.id || ''
      });
      setImagePreviews(equipmentToEdit.image_urls || []);
    } else {
      // Reset form for adding new equipment
      setForm({
        name: '',
        description: '',
        equipment_type_id: '',
        size: '',
        city: '',
        status: 'active',
        image_urls: [],
        daily_rate: 0,
        owner_id: user?.id || '' // Default to current user
      });
      setImagePreviews([]);
    }
    setError('');
    setSuccess('');
  }, [isEditMode, equipmentToEdit, isOpen, user?.id]);

  // Load owners for super admin
  useEffect(() => {
    const loadOwners = async () => {
      if (isSuperAdmin && isOpen) {
        setLoadingOwners(true);
        try {
          const response = await usersService.getAllUsers({ role: 'owner' });
          
          setOwners(response.users.map((user) => ({
            id: user.id,
            full_name: user.full_name,
            email: user.email || ''
          })));
        } catch (error) {
          console.error('Failed to load owners:', error);
        } finally {
          setLoadingOwners(false);
        }
      }
    };

    loadOwners();
  }, [isSuperAdmin, isOpen]);

  // Load equipment types
  useEffect(() => {
    const loadEquipmentTypes = async () => {
      if (isOpen) {
        setLoadingEquipmentTypes(true);
        try {
          const response = await equipmentTypeService.getAll({ limit: 100 });
          setEquipmentTypes(response.data || []);
        } catch (error) {
          console.error('Failed to load equipment types:', error);
          setEquipmentTypes([]);
        } finally {
          setLoadingEquipmentTypes(false);
        }
      }
    };

    loadEquipmentTypes();
  }, [isOpen]);

  // Close owner dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ownerDropdownRef.current && !ownerDropdownRef.current.contains(event.target as Node)) {
        setShowOwnerDropdown(false);
      }
    };

    if (showOwnerDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showOwnerDropdown]);

  // Set owner_id when user is available and form is reset
  useEffect(() => {
    if (user?.id && !isEditMode && form.owner_id === '') {
      setForm(prev => ({
        ...prev,
        owner_id: user.id
      }));
    }
  }, [user?.id, isEditMode, form.owner_id]);

  // Clear success message when error appears
  useEffect(() => {
    if (error) {
      setSuccess('');
    }
  }, [error]);

  const handleInputChange = (field: keyof EquipmentFormData, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleImageUpload = async (file: File) => {
    try {
      setUploadingImages(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3007/api/v1'}/media/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      console.log('Image upload response:', data);
      
      // Handle different response structures
      if (data.data && data.data.url) {
        return data.data.url;
      } else if (data.url) {
        return data.url;
      } else if (data.data && typeof data.data === 'string') {
        return data.data;
      } else {
        console.error('Unexpected upload response structure:', data);
        throw new Error('Invalid response structure from upload API');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    } finally {
      setUploadingImages(false);
    }
  };

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploadingImages(true);
      const newImageUrls: string[] = [];
      const newImagePreviews: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Upload image first
        const uploadedUrl = await handleImageUpload(file);
        console.log('Uploaded URL:', uploadedUrl);
        newImageUrls.push(uploadedUrl);
        
        // Use the server URL for both form data and preview
        // This ensures consistency between what's displayed and what's submitted
        newImagePreviews.push(uploadedUrl);
      }

      console.log('All uploaded URLs:', newImageUrls);
      console.log('All preview URLs (same as uploaded):', newImagePreviews);

      setForm(prev => ({
        ...prev,
        image_urls: [...prev.image_urls, ...newImageUrls]
      }));
      setImagePreviews(prev => [...prev, ...newImagePreviews]);
    } catch (error) {
      setError(isRTL ? 'فشل في رفع الصور' : 'Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleRemoveImage = async (index: number) => {
    const imageUrl = form.image_urls[index];
    const previewUrl = imagePreviews[index];

    try {
      // Extract media ID from URL if it's a server URL
      if (imageUrl.includes('/api/media/')) {
        const mediaId = imageUrl.split('/').pop();
        if (mediaId) {
          await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3007/api/v1'}/media/${mediaId}`, {
            method: 'DELETE',
            credentials: 'include'
          });
        }
      }

      // Remove from form and previews
      setForm(prev => ({
        ...prev,
        image_urls: prev.image_urls.filter((_, i) => i !== index)
      }));
      setImagePreviews(prev => prev.filter((_, i) => i !== index));

      // No need to revoke object URLs since we're using server URLs for previews now
    } catch (error) {
      console.error('Error removing image:', error);
      setError(isRTL ? 'فشل في حذف الصورة' : 'Failed to remove image');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!form.name.trim()) {
      setError(isRTL ? 'اسم المعدة مطلوب' : 'Equipment name is required');
      return;
    }

    if (!form.owner_id) {
      setError(isRTL ? 'يجب تحديد المالك' : 'Owner is required');
      return;
    }
    if (!form.description.trim()) {
      setError(isRTL ? 'وصف المعدة مطلوب' : 'Equipment description is required');
      return;
    }
    if (!form.equipment_type_id) {
      setError(isRTL ? 'نوع المعدة مطلوب' : 'Equipment type is required');
      return;
    }
    if (!form.size) {
      setError(isRTL ? 'حجم المعدة مطلوب' : 'Equipment size is required');
      return;
    }
    if (!form.city) {
      setError(isRTL ? 'المدينة مطلوبة' : 'City is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      console.log('Form data being submitted:', form);
      console.log('Image URLs in form:', form.image_urls);
      console.log('Image previews:', imagePreviews);

      if (isEditMode && equipmentToEdit) {
        // Update existing equipment
        await equipmentService.updateEquipment(equipmentToEdit.id, form);
        setSuccess(isRTL ? 'تم تحديث المعدة بنجاح!' : 'Equipment updated successfully!');
      } else {
        // Create new equipment
        await equipmentService.createEquipment(form);
        setSuccess(isRTL ? 'تم إضافة المعدة بنجاح!' : 'Equipment added successfully!');
      }

      // Call success callback to refresh parent component
      if (onSuccess) {
        onSuccess();
      }

      // Close modal after successful operation (both add and edit)
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (err: any) {
      setError(err.message || (isRTL ? 
        (isEditMode ? 'حدث خطأ أثناء تحديث المعدة' : 'حدث خطأ أثناء إضافة المعدة') : 
        (isEditMode ? 'Error updating equipment' : 'Error adding equipment')
      ));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Clean up image previews
    imagePreviews.forEach(preview => {
      if (preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    });
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      size="lg"
      title={isEditMode ? (isRTL ? 'تعديل المعدة' : 'Edit Equipment') : (isRTL ? 'إضافة معدة جديدة' : 'Add New Equipment')}
    >
      {/* Error/Success Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faExclamationTriangle} className="h-4 w-4 text-red-500" />
            <span className="text-red-700 dark:text-red-400 text-sm">{error}</span>
          </div>
        </div>
      )}

      {success && !error && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faCheckCircle} className="h-4 w-4 text-green-500" />
            <span className="text-green-700 dark:text-green-400 text-sm">{success}</span>
          </div>
        </div>
      )}

            {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Owner Selection (Super Admin Only) */}
        {isSuperAdmin && (
          <div className="md:col-span-2 relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isRTL ? 'المالك' : 'Owner'} *
            </label>
            <div className="relative" ref={ownerDropdownRef}>
              <Input
                type="text"
                value={showOwnerDropdown ? ownerSearchTerm : selectedOwnerText}
                onChange={(e) => {
                  setOwnerSearchTerm(e.target.value);
                  setShowOwnerDropdown(true);
                }}
                onFocus={() => {
                  setShowOwnerDropdown(true);
                  setOwnerSearchTerm('');
                }}
                placeholder={isRTL ? 'ابحث عن المالك...' : 'Search for owner...'}
                required
                disabled={loadingOwners}
                className="w-full"
              />
              
              {showOwnerDropdown && !loadingOwners && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {filteredOwners.length > 0 ? (
                    filteredOwners.map((owner) => (
                      <div
                        key={owner.id}
                        className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm"
                        onClick={() => {
                          handleInputChange('owner_id', owner.id);
                          setShowOwnerDropdown(false);
                          setOwnerSearchTerm('');
                        }}
                      >
                        <div className="font-medium text-gray-900 dark:text-white">
                          {owner.full_name}
                        </div>
                        {owner.email && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {owner.email}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                      {isRTL ? 'لا توجد نتائج' : 'No results found'}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {loadingOwners && (
              <p className="text-sm text-gray-500 mt-1">
                {isRTL ? 'جاري تحميل المالكين...' : 'Loading owners...'}
              </p>
            )}
          </div>
        )}

            {/* Equipment Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isRTL ? 'اسم المعدة' : 'Equipment Name'} *
              </label>
              <Input
                type="text"
                value={form.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder={isRTL ? 'أدخل اسم المعدة' : 'Enter equipment name'}
                required
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isRTL ? 'الوصف' : 'Description'} *
              </label>
              <Textarea
                value={form.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder={isRTL ? 'أدخل وصف المعدة' : 'Enter equipment description'}
                rows={3}
                required
              />
            </div>

            {/* Equipment Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isRTL ? 'نوع المعدة' : 'Equipment Type'} *
              </label>
              <Select
                value={form.equipment_type_id}
                onChange={(e) => handleInputChange('equipment_type_id', e.target.value)}
                required
              >
                <option value="">{isRTL ? 'اختر نوع المعدة' : 'Select equipment type'}</option>
                {loadingEquipmentTypes ? (
                  <option disabled>{isRTL ? 'جاري التحميل...' : 'Loading...'}</option>
                ) : (
                  equipmentTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {isRTL ? type.name_ar : type.name_en}
                    </option>
                  ))
                )}
              </Select>
            </div>

            {/* Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isRTL ? 'الحجم' : 'Size'} *
              </label>
              <Select
                value={form.size}
                onChange={(e) => handleInputChange('size', e.target.value)}
                required
              >
                <option value="">{isRTL ? 'اختر الحجم' : 'Select size'}</option>
                {getEquipmentSizesForDropdown(isRTL).map((size) => (
                  <option key={size.value} value={size.value}>
                    {size.label}
                  </option>
                ))}
              </Select>
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isRTL ? 'المدينة' : 'City'} *
              </label>
              <Select
                value={form.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                required
              >
                <option value="">{isRTL ? 'اختر المدينة' : 'Select city'}</option>
                {getCitiesForDropdown(isRTL).map((city) => (
                  <option key={city.value} value={city.value}>
                    {city.label}
                  </option>
                ))}
              </Select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isRTL ? 'الحالة' : 'Status'}
              </label>
              <Select
                value={form.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
              >
                {getEquipmentStatusesForDropdown(isRTL).map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </Select>
            </div>

            {/* Daily Rate */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isRTL ? 'المعدل اليومي (ريال سعودي)' : 'Daily Rate (SAR)'}
              </label>
              <Input
                type="number"
                value={form.daily_rate}
                onChange={(e) => handleInputChange('daily_rate', parseFloat(e.target.value) || 0)}
                placeholder={isRTL ? 'أدخل المعدل اليومي' : 'Enter daily rate'}
                min="0"
                step="0.01"
              />
              <p className="text-xs text-gray-500 mt-1">
                {isRTL ? 'بالريال السعودي (SAR)' : 'In Saudi Riyals (SAR)'}
              </p>
            </div>

            {/* Image Upload */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isRTL ? 'الصور' : 'Images'}
              </label>
              
              {/* Upload Button */}
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImages}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {uploadingImages ? (
                    <FontAwesomeIcon icon={faSpinner} className="h-4 w-4 animate-spin" />
                  ) : (
                    <FontAwesomeIcon icon={faCloudUpload} className="h-4 w-4" />
                  )}
                  {uploadingImages ? (isRTL ? 'جاري الرفع...' : 'Uploading...') : (isRTL ? 'اختر الصور' : 'Choose Images')}
                </button>
                <p className="text-sm text-gray-500 mt-2">
                  {isRTL ? 'PNG, JPG, GIF حتى 10MB' : 'PNG, JPG, GIF up to 10MB'}
                </p>
              </div>

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FontAwesomeIcon icon={faTimes} className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faSpinner} className="h-4 w-4 animate-spin" />
                  {isEditMode ? (isRTL ? 'جاري التحديث...' : 'Updating...') : (isRTL ? 'جاري الإضافة...' : 'Adding...')}
                </div>
              ) : (
                isEditMode ? (isRTL ? 'تحديث المعدة' : 'Update Equipment') : (isRTL ? 'إضافة المعدة' : 'Add Equipment')
              )}
            </Button>
          </div>
        </form>
    </Modal>
  );
};
