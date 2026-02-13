'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTruck,
  faUser,
  faDollarSign,
  faRuler,
  faInfo,
  faMapMarkerAlt,
  faImage,
  faSave,
  faArrowLeft,
  faPlus,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

interface EquipmentFormData {
  type: string;
  brand: string;
  model: string;
  year: number;
  size: string;
  capacity: string;
  details: string;
  dailyRate: number;
  weeklyRate: number;
  monthlyRate: number;
  ownerId: string;
  location: string;
  condition: string;
  specifications: string[];
  images: File[];
}

const AddEquipment: React.FC = () => {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isRTL = i18n.language === 'ar';

  const [formData, setFormData] = useState<EquipmentFormData>({
    type: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    size: '',
    capacity: '',
    details: '',
    dailyRate: 0,
    weeklyRate: 0,
    monthlyRate: 0,
    ownerId: '',
    location: '',
    condition: 'excellent',
    specifications: [],
    images: []
  });

  const [newSpecification, setNewSpecification] = useState('');

  const equipmentTypes = [
    { value: 'excavator', label: isRTL ? 'حفارات' : 'Excavators' },
    { value: 'bulldozer', label: isRTL ? 'جرافات' : 'Bulldozers' },
    { value: 'crane', label: isRTL ? 'رافعات' : 'Mobile Cranes' },
    { value: 'loader', label: isRTL ? 'محملات' : 'Wheel Loaders' },
    { value: 'truck', label: isRTL ? 'شاحنات' : 'Dump Trucks' },
    { value: 'grader', label: isRTL ? 'آلات تسوية' : 'Motor Graders' },
    { value: 'drill', label: isRTL ? 'منصات حفر' : 'Drilling Rigs' },
    { value: 'forklift', label: isRTL ? 'رافعات شوكية' : 'Forklifts' }
  ];

  const owners = [
    { id: 'owner-1', name: 'أحمد المعدات الثقيلة', nameEn: 'Ahmad Heavy Equipment' },
    { id: 'owner-2', name: 'محمد الرافعات', nameEn: 'Mohammed Cranes' },
    { id: 'owner-3', name: 'عبدالله للمعدات', nameEn: 'Abdullah Equipment' },
    { id: 'owner-4', name: 'الشركة الخليجية للآليات', nameEn: 'Gulf Machinery Company' }
  ];

  const conditions = [
    { value: 'excellent', label: isRTL ? 'ممتاز' : 'Excellent' },
    { value: 'good', label: isRTL ? 'جيد' : 'Good' },
    { value: 'fair', label: isRTL ? 'مقبول' : 'Fair' }
  ];

  const handleInputChange = (field: keyof EquipmentFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }));
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const addSpecification = () => {
    if (newSpecification.trim()) {
      setFormData(prev => ({
        ...prev,
        specifications: [...prev.specifications, newSpecification.trim()]
      }));
      setNewSpecification('');
    }
  };

  const removeSpecification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting equipment data:', formData);
    // Add API call here to save equipment
    router.push('/equipment');
  };

  return (
    <div className="space-y-6" style={{ fontFamily: isRTL ? 'var(--awnash-font-arabic)' : 'var(--awnash-font-english)' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/equipment')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--awnash-secondary)' }}>
              {isRTL ? 'إضافة معدة جديدة' : 'Add New Equipment'}
            </h1>
            <p className="text-gray-600 mt-2">
              {isRTL ? 'أدخل تفاصيل المعدة الثقيلة الجديدة' : 'Enter details for the new heavy equipment'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-3">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--awnash-primary)' }}
              >
                <FontAwesomeIcon icon={faTruck} className="text-black" />
              </div>
              <h3 className="text-lg font-semibold" style={{ color: 'var(--awnash-secondary)' }}>
                {isRTL ? 'المعلومات الأساسية' : 'Basic Information'}
              </h3>
            </div>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="form-label">
                  {isRTL ? 'نوع المعدة' : 'Equipment Type'} *
                </label>
                <select
                  className="form-input"
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  required
                >
                  <option value="">{isRTL ? 'اختر نوع المعدة' : 'Select Equipment Type'}</option>
                  {equipmentTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">
                  {isRTL ? 'الماركة' : 'Brand'} *
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.brand}
                  onChange={(e) => handleInputChange('brand', e.target.value)}
                  placeholder={isRTL ? 'مثل: كاتربيلر، كوماتسو' : 'e.g., Caterpillar, Komatsu'}
                  required
                />
              </div>

              <div>
                <label className="form-label">
                  {isRTL ? 'الموديل' : 'Model'} *
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.model}
                  onChange={(e) => handleInputChange('model', e.target.value)}
                  placeholder={isRTL ? 'مثل: 320D, D8T' : 'e.g., 320D, D8T'}
                  required
                />
              </div>

              <div>
                <label className="form-label">
                  {isRTL ? 'سنة الصنع' : 'Year'} *
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.year}
                  onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                  min="1980"
                  max={new Date().getFullYear() + 1}
                  required
                />
              </div>

              <div>
                <label className="form-label">
                  {isRTL ? 'الحجم' : 'Size'}
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.size}
                  onChange={(e) => handleInputChange('size', e.target.value)}
                  placeholder={isRTL ? 'مثل: كبير، متوسط، صغير' : 'e.g., Large, Medium, Small'}
                />
              </div>

              <div>
                <label className="form-label">
                  {isRTL ? 'السعة/القدرة' : 'Capacity'}
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.capacity}
                  onChange={(e) => handleInputChange('capacity', e.target.value)}
                  placeholder={isRTL ? 'مثل: 20 طن، 5 م³' : 'e.g., 20 tons, 5 m³'}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Owner and Location */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-3">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--awnash-accent)' }}
              >
                <FontAwesomeIcon icon={faUser} className="text-foreground" />
              </div>
              <h3 className="text-lg font-semibold" style={{ color: 'var(--awnash-secondary)' }}>
                {isRTL ? 'المالك والموقع' : 'Owner & Location'}
              </h3>
            </div>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">
                  {isRTL ? 'مالك المعدة' : 'Equipment Owner'} *
                </label>
                <select
                  className="form-input"
                  value={formData.ownerId}
                  onChange={(e) => handleInputChange('ownerId', e.target.value)}
                  required
                >
                  <option value="">{isRTL ? 'اختر المالك' : 'Select Owner'}</option>
                  {owners.map(owner => (
                    <option key={owner.id} value={owner.id}>
                      {isRTL ? owner.name : owner.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">
                  {isRTL ? 'الموقع' : 'Location'} *
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder={isRTL ? 'المدينة، المنطقة' : 'City, Region'}
                  required
                />
              </div>

              <div>
                <label className="form-label">
                  {isRTL ? 'حالة المعدة' : 'Condition'} *
                </label>
                <select
                  className="form-input"
                  value={formData.condition}
                  onChange={(e) => handleInputChange('condition', e.target.value)}
                  required
                >
                  {conditions.map(condition => (
                    <option key={condition.value} value={condition.value}>
                      {condition.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-3">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--awnash-success)' }}
              >
                <FontAwesomeIcon icon={faDollarSign} className="text-foreground" />
              </div>
              <h3 className="text-lg font-semibold" style={{ color: 'var(--awnash-secondary)' }}>
                {isRTL ? 'الأسعار' : 'Pricing'}
              </h3>
            </div>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="form-label">
                  {isRTL ? 'السعر اليومي (ريال)' : 'Daily Rate ($)'} *
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.dailyRate}
                  onChange={(e) => handleInputChange('dailyRate', parseFloat(e.target.value))}
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="form-label">
                  {isRTL ? 'السعر الأسبوعي (ريال)' : 'Weekly Rate ($)'}
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.weeklyRate}
                  onChange={(e) => handleInputChange('weeklyRate', parseFloat(e.target.value))}
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="form-label">
                  {isRTL ? 'السعر الشهري (ريال)' : 'Monthly Rate ($)'}
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.monthlyRate}
                  onChange={(e) => handleInputChange('monthlyRate', parseFloat(e.target.value))}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Details and Specifications */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-3">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--awnash-warning)' }}
              >
                <FontAwesomeIcon icon={faInfo} className="text-foreground" />
              </div>
              <h3 className="text-lg font-semibold" style={{ color: 'var(--awnash-secondary)' }}>
                {isRTL ? 'التفاصيل والمواصفات' : 'Details & Specifications'}
              </h3>
            </div>
          </div>
          <div className="card-body space-y-6">
            <div>
              <label className="form-label">
                {isRTL ? 'وصف المعدة' : 'Equipment Description'}
              </label>
              <textarea
                className="form-input"
                rows={4}
                value={formData.details}
                onChange={(e) => handleInputChange('details', e.target.value)}
                placeholder={isRTL ? 'اكتب وصفاً مفصلاً للمعدة...' : 'Write a detailed description of the equipment...'}
              />
            </div>

            <div>
              <label className="form-label">
                {isRTL ? 'المواصفات الفنية' : 'Technical Specifications'}
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  className="form-input flex-1"
                  value={newSpecification}
                  onChange={(e) => setNewSpecification(e.target.value)}
                  placeholder={isRTL ? 'أضف مواصفة فنية...' : 'Add a specification...'}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecification())}
                />
                <Button
                  type="button"
                  onClick={addSpecification}
                  variant="accent"
                  size="icon"
                >
                  <FontAwesomeIcon icon={faPlus} />
                </Button>
              </div>
              {formData.specifications.length > 0 && (
                <div className="space-y-2">
                  {formData.specifications.map((spec, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <span className="flex-1">{spec}</span>
                      <button
                        type="button"
                        onClick={() => removeSpecification(index)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-3">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--awnash-info)' }}
              >
                <FontAwesomeIcon icon={faImage} className="text-foreground" />
              </div>
              <h3 className="text-lg font-semibold" style={{ color: 'var(--awnash-secondary)' }}>
                {isRTL ? 'صور المعدة' : 'Equipment Images'}
              </h3>
            </div>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div>
                <label className="form-label">
                  {isRTL ? 'رفع الصور' : 'Upload Images'}
                </label>
                <input
                  type="file"
                  className="form-input"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {isRTL ? 'يمكنك رفع عدة صور للمعدة' : 'You can upload multiple images of the equipment'}
                </p>
              </div>

              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Equipment ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-foreground rounded-full flex items-center justify-center text-xs"
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            onClick={() => router.push('/equipment')}
            variant="secondary"
          >
            {isRTL ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button
            type="submit"
            variant="default"
          >
            <FontAwesomeIcon icon={faSave} className="mr-2" />
            <span>{isRTL ? 'حفظ المعدة' : 'Save Equipment'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddEquipment; 