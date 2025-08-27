import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { userService } from '../../services/userService';
import { User } from '../../types';
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
    firstName: '',
    lastName: '',
    email: '',
    role: 'renter' as User['role'],
    status: 'active' as User['status']
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const response = await userService.createUser(formData);
      
      if (response.success) {
        onUserAdded(response.data);
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          role: 'renter',
          status: 'active'
        });
        onClose();
      }
    } catch (error) {
      console.error('Failed to create user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('add_new_user')}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* First Name */}
        <div>
          <label className={cn(
            "block text-sm font-medium text-gray-700 mb-2",
            isRTL && "text-right"
          )}>
            {t('first_name')} *
          </label>
          <input
            type="text"
            required
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            className={cn(
              "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500",
              isRTL && "text-right"
            )}
            placeholder={t('enter_first_name')}
          />
        </div>

        {/* Last Name */}
        <div>
          <label className={cn(
            "block text-sm font-medium text-gray-700 mb-2",
            isRTL && "text-right"
          )}>
            {t('last_name')} *
          </label>
          <input
            type="text"
            required
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            className={cn(
              "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500",
              isRTL && "text-right"
            )}
            placeholder={t('enter_last_name')}
          />
        </div>

        {/* Email */}
        <div>
          <label className={cn(
            "block text-sm font-medium text-gray-700 mb-2",
            isRTL && "text-right"
          )}>
            {t('email')} *
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className={cn(
              "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500",
              isRTL && "text-right"
            )}
            placeholder={t('enter_email')}
          />
        </div>

        {/* Role */}
        <div>
          <label className={cn(
            "block text-sm font-medium text-gray-700 mb-2",
            isRTL && "text-right"
          )}>
            {t('role')} *
          </label>
          <select
            value={formData.role}
            onChange={(e) => handleChange('role', e.target.value)}
            className={cn(
              "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500",
              isRTL && "text-right"
            )}
          >
                            <option value="renter">{t('renter')}</option>
            <option value="owner">{t('owner')}</option>
            <option value="admin">{t('admin')}</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <label className={cn(
            "block text-sm font-medium text-gray-700 mb-2",
            isRTL && "text-right"
          )}>
            {t('status')} *
          </label>
          <select
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className={cn(
              "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500",
              isRTL && "text-right"
            )}
          >
            <option value="active">{t('active')}</option>
            <option value="inactive">{t('inactive')}</option>
            <option value="pending">{t('pending')}</option>
          </select>
        </div>

        {/* Form Actions */}
        <div className={cn(
          "flex justify-end space-x-3 pt-4 border-t border-gray-200",
          isRTL && "space-x-reverse"
        )}>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            {t('cancel')}
          </Button>
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? t('creating') : t('create_user')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddUserModal; 