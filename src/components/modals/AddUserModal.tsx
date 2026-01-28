import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { usersService, User } from '../../services/usersService';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserAdded: (user: User) => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({
  isOpen,
  onClose,
  onUserAdded
}) => {
  const { t, currentLanguage } = useLanguage();
  const isRTL = currentLanguage.direction === 'rtl';
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    email: '',
    role: 'requester',
    isActive: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const user = await usersService.createUser({
        fullName: formData.fullName,
        mobileNumber: formData.mobileNumber,
        email: formData.email || undefined,
        role: formData.role,
        isActive: formData.isActive
      });
      
      onUserAdded(user);
      setFormData({
        fullName: '',
        mobileNumber: '',
        email: '',
        role: 'requester',
        isActive: true
      });
      onClose();
    } catch (error) {
      console.error('Failed to create user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    if (field === 'isActive') {
      setFormData(prev => ({ ...prev, isActive: value === 'true' }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('add_new_user')}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Full Name */}
        <div>
          <label className={cn(
            "block text-sm font-medium text-gray-300 mb-2",
            isRTL && "text-right"
          )}>
            {t('full_name') || 'Full Name'} *
          </label>
          <input
            type="text"
            required
            value={formData.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
            className={cn(
              "w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500",
              isRTL && "text-right"
            )}
            placeholder={isRTL ? 'أدخل الاسم الكامل' : 'Enter full name'}
          />
        </div>

        {/* Mobile Number */}
        <div>
          <label className={cn(
            "block text-sm font-medium text-gray-300 mb-2",
            isRTL && "text-right"
          )}>
            {t('mobile_number') || 'Mobile Number'} *
          </label>
          <input
            type="tel"
            required
            value={formData.mobileNumber}
            onChange={(e) => handleChange('mobileNumber', e.target.value)}
            className={cn(
              "w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500",
              isRTL && "text-right"
            )}
            placeholder={isRTL ? 'أدخل رقم الجوال' : 'Enter mobile number'}
          />
        </div>

        {/* Email */}
        <div>
          <label className={cn(
            "block text-sm font-medium text-gray-300 mb-2",
            isRTL && "text-right"
          )}>
            {t('email') || 'Email'}
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className={cn(
              "w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500",
              isRTL && "text-right"
            )}
            placeholder={isRTL ? 'أدخل البريد الإلكتروني' : 'Enter email (optional)'}
          />
        </div>

        {/* Role */}
        <div>
          <label className={cn(
            "block text-sm font-medium text-gray-300 mb-2",
            isRTL && "text-right"
          )}>
            {t('role') || 'Role'} *
          </label>
          <select
            value={formData.role}
            onChange={(e) => handleChange('role', e.target.value)}
            className={cn(
              "w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500",
              isRTL && "text-right"
            )}
          >
            <option value="requester">{isRTL ? 'طالب' : 'Requester'}</option>
            <option value="owner">{isRTL ? 'مالك' : 'Owner'}</option>
            <option value="hybrid">{isRTL ? 'هجين' : 'Hybrid'}</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <label className={cn(
            "block text-sm font-medium text-gray-300 mb-2",
            isRTL && "text-right"
          )}>
            {t('status') || 'Status'} *
          </label>
          <select
            value={formData.isActive ? 'active' : 'inactive'}
            onChange={(e) => handleChange('isActive', e.target.value === 'active' ? 'true' : 'false')}
            className={cn(
              "w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500",
              isRTL && "text-right"
            )}
          >
            <option value="active">{isRTL ? 'نشط' : 'Active'}</option>
            <option value="inactive">{isRTL ? 'غير نشط' : 'Inactive'}</option>
          </select>
        </div>

        {/* Form Actions */}
        <div className={cn(
          "flex justify-end space-x-3 pt-4 border-t border-gray-700",
          isRTL && "space-x-reverse"
        )}>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            {t('cancel') || 'Cancel'}
          </Button>
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? (t('creating') || 'Creating...') : (t('create_user') || 'Create User')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddUserModal; 