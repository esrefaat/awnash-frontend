import { useState, useRef } from 'react';
import type { EquipmentFormValues } from '@/components/modals/EquipmentModal';

export function useEquipmentForm({
  initialValues,
  isEditing = false,
  onSubmit,
}: {
  initialValues: EquipmentFormValues;
  isEditing?: boolean;
  onSubmit: (values: EquipmentFormValues) => Promise<void>;
}) {
  const [form, setForm] = useState<EquipmentFormValues>(initialValues);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>(initialValues.image_urls || []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingImages(true);
    setFormError('');
    try {
      const formData = new FormData();
      Array.from(files).forEach(file => formData.append('images', file));
      const res = await fetch('http://localhost:3001/api/equipment/image-upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to upload images');
      }
      setImagePreviews(prev => [...prev, ...data.data]);
      setForm(f => ({ ...f, image_urls: [...f.image_urls, ...data.data] }));
    } catch (err: any) {
      setFormError(err.message || 'Failed to upload images');
    } finally {
      setUploadingImages(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleImageReorder = (newList: any[]) => {
    const newUrls = newList.map(item => item.url || item);
    setImagePreviews(newUrls);
    setForm(f => ({ ...f, image_urls: newUrls }));
  };

  const handleRemoveImage = (idx: number) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== idx));
    setForm(f => ({ ...f, image_urls: f.image_urls.filter((_, i) => i !== idx) }));
  };

  const handleModalSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFormLoading(true);
    setFormError('');
    setFormSuccess('');
    try {
      await onSubmit(form);
      setFormSuccess(isEditing ? 'Equipment updated successfully!' : 'Equipment added successfully!');
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit form');
    } finally {
      setFormLoading(false);
    }
  };

  return {
    form,
    setForm,
    formLoading,
    formError,
    formSuccess,
    uploadingImages,
    imagePreviews,
    fileInputRef,
    handleFormChange,
    handleImageUpload,
    handleImageReorder,
    handleRemoveImage,
    handleModalSubmit,
    setFormError,
    setFormSuccess,
    setImagePreviews,
  };
} 