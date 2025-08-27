import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faTimes, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import { LocationPicker } from '@/components/LocationPicker';

export interface RequestFormValues {
  equipment_type: string;
  status: 'open' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  images: string[];
  start_date: string;
  end_date: string;
  size: 'small' | 'medium' | 'large';
  max_budget: number;
  city: string;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  location_address: string | null;
  note: string;
}

interface RequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RequestFormValues) => Promise<void>;
  loading?: boolean;
}

export const RequestModal: React.FC<RequestModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [form, setForm] = useState<RequestFormValues>({
    equipment_type: '',
    status: 'open',
    priority: 'medium',
    images: [],
    start_date: '',
    end_date: '',
    size: 'medium',
    max_budget: 0,
    city: '',
    location: null,
    latitude: null,
    longitude: null,
    location_address: null,
    note: ''
  });

  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [mediaIds, setMediaIds] = useState<string[]>([]);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'max_budget' ? parseFloat(value) || 0 : value
    }));
  };

  const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    setSelectedLocation(location);
    setForm(prev => ({
      ...prev,
      latitude: location.lat,
      longitude: location.lng,
      location: `${location.lat},${location.lng}`, // Format as "lat,lng" string
      location_address: location.address // Store the full address
    }));
    setShowLocationPicker(false);
  };

  const clearLocation = () => {
    setSelectedLocation(null);
    setForm(prev => ({
      ...prev,
      latitude: null,
      longitude: null,
      location: null,
      location_address: null
    }));
  };

  const uploadImageToServer = async (file: File): Promise<{ url: string; id?: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('alt_text', '');
    formData.append('description', '');

    const response = await fetch('http://localhost:3001/api/media/upload', {
      method: 'POST',
      credentials: 'include', // Use HTTP-only cookies for authentication
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to upload image');
    }

    const result = await response.json();
    console.log('Upload response:', result); // Debug the response structure
    
    // Try different possible response structures
    if (result.data && result.data.url) {
      return { url: result.data.url, id: result.data.id || result.id };
    } else if (result.url) {
      return { url: result.url, id: result.id };
    } else if (result.data && typeof result.data === 'string') {
      return { url: result.data, id: result.id };
    } else if (typeof result === 'string') {
      return { url: result, id: undefined };
    } else {
      throw new Error('Invalid response structure from upload API');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploadingImages(true);
    setUploadingCount(files.length);
    setError('');

    try {
      const newImageUrls: string[] = [];
      const newUploadedUrls: string[] = [];

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
      newImageUrls.push(...previewUrls);

      // Update previews immediately
      setImageUrls(prev => [...prev, ...newImageUrls]);

      // Upload each file to server
      const newMediaIds: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const uploadResult = await uploadImageToServer(file);
          newUploadedUrls.push(uploadResult.url);
          if (uploadResult.id) {
            newMediaIds.push(uploadResult.id);
          }
        } catch (error: any) {
          console.error(`Failed to upload image ${i + 1}:`, error);
          // Remove the preview for failed uploads
          setImageUrls(prev => prev.filter((_, index) => index !== prev.length - files.length + i));
          throw new Error(`Failed to upload image ${i + 1}: ${error.message}`);
        }
      }

      // Update the form with uploaded URLs
      setUploadedImageUrls(prev => [...prev, ...newUploadedUrls]);
      setMediaIds(prev => [...prev, ...newMediaIds]);
      setForm(prev => ({
        ...prev,
        images: [...prev.images, ...newUploadedUrls]
      }));

    } catch (error: any) {
      setError(error.message || (isRTL ? 'حدث خطأ أثناء رفع الصور' : 'Error uploading images'));
    } finally {
      setUploadingImages(false);
      setUploadingCount(0);
      // Clear the file input
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const deleteMediaFromServer = async (mediaId: string): Promise<void> => {
    const response = await fetch(`http://localhost:3001/api/media/${mediaId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include' // Use HTTP-only cookies for authentication
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete media');
    }
  };

  const removeImage = async (index: number) => {
    try {
      // Delete from server if we have a media ID
      if (mediaIds[index]) {
        await deleteMediaFromServer(mediaIds[index]);
      }
      
      // Remove from local state
      setImageUrls(prev => prev.filter((_, i) => i !== index));
      setUploadedImageUrls(prev => prev.filter((_, i) => i !== index));
      setMediaIds(prev => prev.filter((_, i) => i !== index));
      setForm(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
    } catch (error: any) {
      console.error('Failed to delete image:', error);
      setError(error.message || (isRTL ? 'فشل في حذف الصورة' : 'Failed to delete image'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await onSubmit(form);
      setSuccess(isRTL ? 'تم إرسال الطلب بنجاح!' : 'Request submitted successfully!');
      setTimeout(() => {
        onClose();
        setForm({
          equipment_type: '',
          status: 'open',
          priority: 'medium',
          images: [],
          start_date: '',
          end_date: '',
          size: 'medium',
          max_budget: 0,
          city: '',
          location: null,
          latitude: null,
          longitude: null,
          location_address: null,
          note: ''
        });
        setImageUrls([]);
        setUploadedImageUrls([]);
        setMediaIds([]);
        setSuccess('');
      }, 1500);
    } catch (err: any) {
      setError(err.message || (isRTL ? 'حدث خطأ أثناء إرسال الطلب' : 'Error submitting request'));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isRTL ? 'طلب استئجار جديد' : 'New Rental Request'}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Equipment Type */}
          <div>
            <label htmlFor="equipment_type" className="block text-sm font-medium mb-2 text-white">
              {isRTL ? 'نوع المعدة' : 'Equipment Type'}
            </label>
            <Select
              id="equipment_type"
              name="equipment_type"
              value={form.equipment_type}
              onChange={handleFormChange}
              required
            >
              <option value="">{isRTL ? 'اختر نوع المعدة' : 'Select Equipment Type'}</option>
              <option value="excavator">{isRTL ? 'حفار' : 'Excavator'}</option>
              <option value="crane">{isRTL ? 'رافعة' : 'Crane'}</option>
              <option value="bulldozer">{isRTL ? 'جرافة' : 'Bulldozer'}</option>
              <option value="loader">{isRTL ? 'محمل' : 'Loader'}</option>
              <option value="truck">{isRTL ? 'شاحنة' : 'Truck'}</option>
            </Select>
          </div>



          {/* Priority */}
          <div>
            <label htmlFor="priority" className="block text-sm font-medium mb-2 text-white">
              {isRTL ? 'الأولوية' : 'Priority'}
            </label>
            <Select
              id="priority"
              name="priority"
              value={form.priority}
              onChange={handleFormChange}
              required
            >
              <option value="low">{isRTL ? 'منخفضة' : 'Low'}</option>
              <option value="medium">{isRTL ? 'متوسطة' : 'Medium'}</option>
              <option value="high">{isRTL ? 'عالية' : 'High'}</option>
              <option value="urgent">{isRTL ? 'عاجلة' : 'Urgent'}</option>
            </Select>
          </div>

          {/* Size */}
          <div>
            <label htmlFor="size" className="block text-sm font-medium mb-2 text-white">
              {isRTL ? 'الحجم' : 'Size'}
            </label>
            <Select
              id="size"
              name="size"
              value={form.size}
              onChange={handleFormChange}
              required
            >
              <option value="small">{isRTL ? 'صغير' : 'Small'}</option>
              <option value="medium">{isRTL ? 'متوسط' : 'Medium'}</option>
              <option value="large">{isRTL ? 'كبير' : 'Large'}</option>
            </Select>
          </div>

          {/* Start Date */}
          <div>
            <label htmlFor="start_date" className="block text-sm font-medium mb-2 text-white">
              {isRTL ? 'تاريخ البداية' : 'Start Date'}
            </label>
            <Input
              id="start_date"
              name="start_date"
              type="datetime-local"
              value={form.start_date}
              onChange={handleFormChange}
              required
            />
          </div>

          {/* End Date */}
          <div>
            <label htmlFor="end_date" className="block text-sm font-medium mb-2 text-white">
              {isRTL ? 'تاريخ النهاية' : 'End Date'}
            </label>
            <Input
              id="end_date"
              name="end_date"
              type="datetime-local"
              value={form.end_date}
              onChange={handleFormChange}
              required
            />
          </div>

          {/* City */}
          <div>
            <label htmlFor="city" className="block text-sm font-medium mb-2 text-white">
              {isRTL ? 'المدينة' : 'City'}
            </label>
            <Input
              id="city"
              name="city"
              value={form.city}
              onChange={handleFormChange}
              placeholder={isRTL ? 'مثال: الرياض' : 'e.g., Riyadh'}
              required
            />
          </div>

          {/* Location Picker */}
          <div>
            <label className="block text-sm font-medium mb-2 text-white">
              {isRTL ? 'الموقع الدقيق' : 'Exact Location'}
            </label>
            <div className="space-y-2">
              {selectedLocation ? (
                <div className="bg-gray-700 border border-gray-600 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-300">{selectedLocation.address}</p>
                      <p className="text-xs text-gray-400">
                        {isRTL ? 'الإحداثيات:' : 'Coordinates:'} {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={clearLocation}
                      className="text-red-400 hover:text-red-300 ml-2"
                      title={isRTL ? 'حذف الموقع' : 'Clear location'}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 bg-gray-700 text-center">
                  <p className="text-sm text-gray-400 mb-2">
                    {isRTL ? 'لم يتم تحديد موقع بعد' : 'No location selected yet'}
                  </p>
                </div>
              )}
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowLocationPicker(true)}
                className="w-full"
              >
                <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
                {isRTL ? 'اختر موقع من الخريطة' : 'Pick Location from Map'}
              </Button>
            </div>
          </div>

          {/* Max Budget */}
          <div>
            <label htmlFor="max_budget" className="block text-sm font-medium mb-2 text-white">
              {isRTL ? 'الميزانية القصوى (ريال)' : 'Max Budget (SAR)'}
            </label>
            <Input
              id="max_budget"
              name="max_budget"
              type="number"
              value={form.max_budget}
              onChange={handleFormChange}
              placeholder="0.00"
              min="0"
              step="0.01"
              required
            />
          </div>
        </div>

        {/* Images Upload */}
        <div>
          <label className="block text-sm font-medium mb-2 text-white">
            {isRTL ? 'الصور (اختياري)' : 'Images (Optional)'}
          </label>
          <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 bg-gray-700">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
              disabled={uploadingImages}
            />
            <label htmlFor="image-upload" className={`flex flex-col items-center ${uploadingImages ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
              <FontAwesomeIcon icon={faUpload} className="h-8 w-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-300">
                {uploadingImages 
                  ? (isRTL ? 'جاري رفع الصور...' : 'Uploading images...')
                  : (isRTL ? 'انقر لرفع الصور' : 'Click to upload images')
                }
              </span>
            </label>
          </div>
          
          {/* Image Previews */}
          {imageUrls.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-300 mb-2">
                {isRTL ? 'الصور المرفقة' : 'Attached Images'} ({imageUrls.length})
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {imageUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-gray-600"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjMzc0MTUxIi8+Cjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pgo8L3N2Zz4K';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs transition-colors duration-200"
                      title={isRTL ? 'حذف الصورة' : 'Remove image'}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                    {uploadingImages && index >= imageUrls.length - uploadingCount && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                        <div className="text-white text-xs">
                          {isRTL ? 'جاري الرفع...' : 'Uploading...'}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Note */}
        <div>
          <label htmlFor="note" className="block text-sm font-medium mb-2 text-white">
            {isRTL ? 'ملاحظات إضافية' : 'Additional Notes'}
          </label>
          <Textarea
            id="note"
            name="note"
            value={form.note}
            onChange={handleFormChange}
            placeholder={isRTL ? 'أضف أي تفاصيل إضافية حول الطلب...' : 'Add any additional details about the request...'}
            rows={3}
          />
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="text-red-400 text-sm bg-red-900/20 border border-red-700 p-3 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="text-green-400 text-sm bg-green-900/20 border border-green-700 p-3 rounded">
            {success}
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end gap-3">
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
                <span className="loader mr-2" />
                {isRTL ? 'جاري الإرسال...' : 'Submitting...'}
              </span>
            ) : (
              isRTL ? 'إرسال الطلب' : 'Submit Request'
            )}
          </Button>
        </div>
      </form>

      {/* Location Picker Modal */}
      <LocationPicker
        isOpen={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onLocationSelect={handleLocationSelect}
        initialLocation={selectedLocation}
        isRTL={isRTL}
      />
    </Modal>
  );
}; 