import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { getEquipmentTypesForDropdown } from '@/config/equipment';

export type EquipmentFormValues = {
  name: string;
  description: string;
  equipment_type: string;
  size: string;
  status: 'active' | 'inactive';
  image_urls: string[];
  city: string;
};

type EquipmentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  initialValues: EquipmentFormValues;
  isEditing: boolean;
  loading: boolean;
  error?: string;
  success?: string;
  imagePreviews: string[];
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageReorder: (newList: any[]) => void;
  onRemoveImage: (idx: number) => void;
};

export const EquipmentModal: React.FC<EquipmentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialValues,
  isEditing,
  loading,
  error,
  success,
  imagePreviews,
  fileInputRef,
  onFormChange,
  onImageUpload,
  onImageReorder,
  onRemoveImage,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Equipment' : 'Add Equipment'}>
      <form
        onSubmit={onSubmit}
        className="space-y-4"
      >
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
          <Input
            id="name"
            name="name"
            value={initialValues.name}
            onChange={onFormChange}
            required
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
          <Textarea
            id="description"
            name="description"
            value={initialValues.description}
            onChange={onFormChange}
            required
          />
        </div>
        <div>
          <label htmlFor="city" className="block text-sm font-medium mb-1">City</label>
          <Input
            id="city"
            name="city"
            value={initialValues.city}
            onChange={onFormChange}
            required
          />
        </div>
        <div>
          <label htmlFor="equipment_type" className="block text-sm font-medium mb-1">Equipment Type</label>
          <Select
            id="equipment_type"
            name="equipment_type"
            value={initialValues.equipment_type}
            onChange={onFormChange}
            required
          >
            <option value="">Select type</option>
            {getEquipmentTypesForDropdown(false).map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </Select>
        </div>
        <div>
          <label htmlFor="size" className="block text-sm font-medium mb-1">Size</label>
          <Select
            id="size"
            name="size"
            value={initialValues.size}
            onChange={onFormChange}
            required
          >
            <option value="">Select size</option>
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </Select>
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-medium mb-1">Status</label>
          <Select
            id="status"
            name="status"
            value={initialValues.status}
            onChange={onFormChange}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Images</label>
          <input
            type="file"
            multiple
            accept="image/*"
            ref={fileInputRef}
            onChange={onImageUpload}
            className="block w-full text-sm text-gray-500"
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {imagePreviews.map((url, idx) => (
              <div key={idx} className="relative w-16 h-16">
                <img src={url} alt="preview" className="w-16 h-16 object-cover rounded" />
                <button
                  type="button"
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  onClick={() => onRemoveImage(idx)}
                  aria-label="Remove image"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <span className="flex items-center"><span className="loader mr-2" />{isEditing ? 'Updating...' : 'Adding...'}</span>
            ) : (
              isEditing ? 'Update' : 'Add'
            )} Equipment
          </Button>
        </div>
      </form>
    </Modal>
  );
}; 