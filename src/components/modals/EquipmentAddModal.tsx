import React, { useState, useRef, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCloudUpload,
  faTimes,
  faSpinner,
  faImage,
  faCheckCircle,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { cn } from '@/lib/utils';
import { getCitiesForDropdown } from '@/config/cities';
import { 
  getEquipmentTypesForDropdown, 
  getEquipmentSizesForDropdown, 
  getEquipmentStatusesForDropdown 
} from '@/config/equipment';
import { Equipment, EquipmentFormData } from '@/services/equipmentService';

interface EquipmentAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EquipmentFormData) => Promise<void>;
  isRTL?: boolean;
  equipmentToEdit?: Equipment | null;
  isEditMode?: boolean;
  error?: string;
  onClearError?: () => void;
}

// Equipment configuration is now imported from global config

export const EquipmentAddModal: React.FC<EquipmentAddModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isRTL = false,
  equipmentToEdit = null,
  isEditMode = false,
  error = '',
  onClearError
}) => {
  const [form, setForm] = useState<EquipmentFormData>({
    name: '',
    description: '',
    equipment_type: '',
    size: '',
    city: '',
    status: 'active',
    image_urls: [],
    daily_rate: 0
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form with equipment data when editing
  useEffect(() => {
    if (isEditMode && equipmentToEdit) {
      setForm({
        name: equipmentToEdit.name,
        description: equipmentToEdit.description,
        equipment_type: equipmentToEdit.equipment_type,
        size: equipmentToEdit.size,
        city: equipmentToEdit.city,
        status: equipmentToEdit.status,
        image_urls: equipmentToEdit.image_urls,
        daily_rate: parseFloat(equipmentToEdit.daily_rate || '0')
      });
      setImagePreviews(equipmentToEdit.image_urls);
    } else {
      // Reset form for adding new equipment
      setForm({
        name: '',
        description: '',
        equipment_type: '',
        size: '',
        city: '',
        status: 'active',
        image_urls: [],
        daily_rate: 0
      });
      setImagePreviews([]);
    }
  }, [isEditMode, equipmentToEdit, isOpen]);

  // Clear success message when error appears
  useEffect(() => {
    if (error) {
      setSuccess('');
    }
  }, [error]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'daily_rate' ? parseFloat(value) || 0 : value
    }));
  };

  const uploadImageToServer = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('alt_text', '');
    formData.append('description', '');

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3007/api/v1'}/media/upload`, {
      method: 'POST',
      credentials: 'include',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to upload image');
    }

    const result = await response.json();
    
    // Handle different response structures
    if (result.data && result.data.url) {
      return result.data.url;
    } else if (result.url) {
      return result.url;
    } else if (result.data && typeof result.data === 'string') {
      return result.data;
    } else if (typeof result === 'string') {
      return result;
    } else {
      throw new Error('Invalid response structure from upload API');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploadingImages(true);
    if (onClearError) onClearError();

    try {
      const newImageUrls: string[] = [];
      const newImagePreviews: string[] = [];

      // Create preview URLs for immediate display
      const previewPromises = Array.from(files).map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const result = e.target?.result as string;
            resolve(result);
          };
          reader.readAsDataURL(file);
        });
      });

      // Wait for all previews to be created
      const previewUrls = await Promise.all(previewPromises);
      newImagePreviews.push(...previewUrls);

      // Update previews immediately
      setImagePreviews(prev => [...prev, ...newImagePreviews]);

      // Upload each file to server
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const imageUrl = await uploadImageToServer(file);
          newImageUrls.push(imageUrl);
        } catch (error: any) {
          console.error(`Failed to upload image ${i + 1}:`, error);
          // Remove the preview for failed uploads
          setImagePreviews(prev => prev.filter((_, index) => index !== prev.length - files.length + i));
          throw new Error(`Failed to upload image ${i + 1}: ${error.message}`);
        }
      }

      // Update the form with uploaded URLs
      setForm(prev => ({
        ...prev,
        image_urls: [...prev.image_urls, ...newImageUrls]
      }));

    } catch (error: any) {
      if (onClearError) onClearError();
      // Note: Image upload errors are handled internally, not passed to parent
    } finally {
      setUploadingImages(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setForm(prev => ({
      ...prev,
      image_urls: prev.image_urls.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onClearError) onClearError();
    setSuccess(''); // Clear any previous success message

    // Validation
    if (!form.name || form.name.length < 2 || form.name.length > 255) {
      if (onClearError) onClearError();
      return;
    }

    if (!form.description || form.description.length < 10 || form.description.length > 2000) {
      if (onClearError) onClearError();
      return;
    }

    if (!form.equipment_type) {
      if (onClearError) onClearError();
      return;
    }

    if (!form.size) {
      if (onClearError) onClearError();
      return;
    }

    if (!form.city) {
      if (onClearError) onClearError();
      return;
    }

    if (form.image_urls.length > 10) {
      if (onClearError) onClearError();
      return;
    }

    try {
      setLoading(true);
      await onSubmit(form);
      setSuccess(isRTL ? 
        (isEditMode ? 'تم تحديث المعدة بنجاح!' : 'تم إضافة المعدة بنجاح!') : 
        (isEditMode ? 'Equipment updated successfully!' : 'Equipment added successfully!')
      );
      
      // Reset form
      setForm({
        name: '',
        description: '',
        equipment_type: '',
        size: '',
        city: '',
        status: 'active',
        image_urls: [],
        daily_rate: 0
      });
      setImagePreviews([]);
      
      // Show success message and close modal automatically
      setSuccess(isRTL ? 
        (isEditMode ? 'تم تحديث المعدة بنجاح' : 'تم إضافة المعدة بنجاح') : 
        (isEditMode ? 'Equipment updated successfully' : 'Equipment added successfully')
      );
      
      // Close modal after success (with a small delay to show the message)
      setTimeout(() => {
        onClose();
        setSuccess('');
      }, 1500);
    } catch (err: any) {
      // Error is handled by the parent component
      throw err; // Re-throw to let parent handle the error
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isRTL ? 
      (isEditMode ? 'تعديل المعدة' : 'إضافة معدة جديدة') : 
      (isEditMode ? 'Edit Equipment' : 'Add New Equipment')
    } size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Required Fields */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white mb-4">
            {isRTL ? 'الحقول المطلوبة' : 'Required Fields'}
          </h3>

          {/* Equipment Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2 text-white">
              {isRTL ? 'اسم المعدة' : 'Equipment Name'} *
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleFormChange}
              placeholder={isRTL ? 'أدخل اسم المعدة' : 'Enter equipment name'}
              required
              minLength={2}
              maxLength={255}
            />
            <p className="text-xs text-gray-400 mt-1">
              {isRTL ? '2-255 حرف' : '2-255 characters'}
            </p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2 text-white">
              {isRTL ? 'الوصف' : 'Description'} *
            </label>
            <Textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleFormChange}
              placeholder={isRTL ? 'أدخل وصف مفصل للمعدة' : 'Enter detailed description of the equipment'}
              required
              minLength={10}
              maxLength={2000}
              rows={4}
            />
            <p className="text-xs text-gray-400 mt-1">
              {isRTL ? '10-2000 حرف' : '10-2000 characters'}
            </p>
          </div>

          {/* Equipment Type */}
          <div>
            <label htmlFor="equipment_type" className="block text-sm font-medium mb-2 text-white">
              {isRTL ? 'نوع المعدة' : 'Equipment Type'} *
            </label>
            <Select
              id="equipment_type"
              name="equipment_type"
              value={form.equipment_type}
              onChange={handleFormChange}
              required
            >
              <option value="">{isRTL ? 'اختر نوع المعدة' : 'Select equipment type'}</option>
              {getEquipmentTypesForDropdown(isRTL).map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </Select>
          </div>

          {/* Size */}
          <div>
            <label htmlFor="size" className="block text-sm font-medium mb-2 text-white">
              {isRTL ? 'الحجم' : 'Size'} *
            </label>
            <Select
              id="size"
              name="size"
              value={form.size}
              onChange={handleFormChange}
              required
            >
              <option value="">{isRTL ? 'اختر الحجم' : 'Select size'}</option>
              {getEquipmentSizesForDropdown(isRTL).map(size => (
                <option key={size.value} value={size.value}>
                  {size.label}
                </option>
              ))}
            </Select>
          </div>

          {/* City */}
          <div>
            <label htmlFor="city" className="block text-sm font-medium mb-2 text-white">
              {isRTL ? 'المدينة' : 'City'} *
            </label>
            <Select
              id="city"
              name="city"
              value={form.city}
              onChange={handleFormChange}
              required
            >
              <option value="">{isRTL ? 'اختر المدينة' : 'Select city'}</option>
              {getCitiesForDropdown(isRTL).map(city => (
                <option key={city.value} value={city.value}>
                  {city.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {/* Optional Fields */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white mb-4">
            {isRTL ? 'الحقول الاختيارية' : 'Optional Fields'}
          </h3>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium mb-2 text-white">
              {isRTL ? 'الحالة' : 'Status'}
            </label>
            <Select
              id="status"
              name="status"
              value={form.status}
              onChange={handleFormChange}
            >
              {getEquipmentStatusesForDropdown(isRTL).map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </Select>
          </div>

          {/* Daily Rate */}
          <div>
            <label htmlFor="daily_rate" className="block text-sm font-medium mb-2 text-white">
              {isRTL ? 'السعر اليومي (ريال سعودي)' : 'Daily Rate (SAR)'}
            </label>
            <Input
              id="daily_rate"
              name="daily_rate"
              type="number"
              value={form.daily_rate}
              onChange={handleFormChange}
              placeholder="0"
              min="0"
              step="0.01"
            />
            <p className="text-xs text-gray-400 mt-1">
              {isRTL ? 'بالريال السعودي' : 'In Saudi Riyals (SAR)'}
            </p>
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium mb-2 text-white">
              {isRTL ? 'الصور' : 'Images'}
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700"
              disabled={uploadingImages}
            />
            <p className="text-xs text-gray-400 mt-1">
              {isRTL ? 'الحد الأقصى 10 صور' : 'Maximum 10 images'}
            </p>

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="mt-4">
                <div className="flex flex-wrap gap-3">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative w-24 h-24">
                      <img 
                        src={preview} 
                        alt={`Preview ${index + 1}`}
                        className="w-24 h-24 object-cover rounded-lg border border-gray-600"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                      >
                        <FontAwesomeIcon icon={faTimes} className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Uploading Indicator */}
            {uploadingImages && (
              <div className="mt-4 flex items-center space-x-2 text-blue-400">
                <FontAwesomeIcon icon={faSpinner} className="h-4 w-4 animate-spin" />
                <span className="text-sm">{isRTL ? 'جاري رفع الصور...' : 'Uploading images...'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Error and Success Messages */}
        {error && (
          <div className="flex items-center space-x-2 text-red-400 bg-red-900/20 border border-red-500/50 rounded-lg p-3">
            <FontAwesomeIcon icon={faExclamationTriangle} className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {success && !error && (
          <div className="flex items-center space-x-2 text-green-400 bg-green-900/20 border border-green-500/50 rounded-lg p-3">
            <FontAwesomeIcon icon={faCheckCircle} className="h-4 w-4" />
            <span className="text-sm">{success}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            {isRTL ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center">
                <FontAwesomeIcon icon={faSpinner} className="h-4 w-4 animate-spin mr-2" />
                {isRTL ? 'جاري الإضافة...' : 'Adding...'}
              </span>
            ) : (
              <span className="flex items-center">
                <FontAwesomeIcon icon={faCloudUpload} className="h-4 w-4 mr-2" />
                {isRTL ? (isEditMode ? 'تحديث المعدة' : 'إضافة المعدة') : (isEditMode ? 'Update Equipment' : 'Add Equipment')}
              </span>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
