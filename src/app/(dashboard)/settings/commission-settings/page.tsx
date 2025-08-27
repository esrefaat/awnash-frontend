'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPercent,
  faUsers,
  faBuilding,
  faSave,
  faEdit,
  faPlus,
  faTrash,
  faGlobe,
  faCog
} from '@fortawesome/free-solid-svg-icons';

interface CommissionRule {
  id: string;
  type: 'owner' | 'renter';
  entityId?: string;
  entityName?: string;
  commissionRate: number;
  isDefault: boolean;
}

const CommissionSettings: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  const [defaultOwnerCommission, setDefaultOwnerCommission] = useState(15);
  const [defaultRenterCommission, setDefaultRenterCommission] = useState(5);
  const [isEditing, setIsEditing] = useState(false);
  
  // Mock commission rules data
  const [commissionRules, setCommissionRules] = useState<CommissionRule[]>([
    {
      id: 'rule-1',
      type: 'owner',
      entityId: 'owner-123',
      entityName: 'أحمد المعدات الثقيلة',
      commissionRate: 12,
      isDefault: false
    },
    {
      id: 'rule-2',
      type: 'owner',
      entityId: 'owner-456',
      entityName: 'محمد الرافعات',
      commissionRate: 18,
      isDefault: false
    },
    {
      id: 'rule-3',
      type: 'renter',
      entityId: 'renter-789',
      entityName: 'مؤسسة البناء المتطور',
      commissionRate: 3,
      isDefault: false
    }
  ]);

  const handleSaveDefaults = () => {
    // Save default commission rates
    console.log('Saving defaults:', { defaultOwnerCommission, defaultRenterCommission });
    setIsEditing(false);
    // Add success notification here
  };

  const handleDeleteRule = (ruleId: string) => {
    setCommissionRules(prev => prev.filter(rule => rule.id !== ruleId));
  };

  const handleAddRule = (type: 'owner' | 'renter') => {
    // This would open a modal to add a new rule
    console.log('Adding new rule for:', type);
  };

  return (
    <div className="space-y-6" style={{ fontFamily: isRTL ? 'var(--awnash-font-arabic)' : 'var(--awnash-font-english)' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--awnash-secondary)' }}>
            {isRTL ? 'إعدادات العمولات' : 'Commission Settings'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isRTL ? 'إدارة عمولات أوناش للملاك والمستأجرين' : 'Manage Awnash commission rates for owners and renters'}
          </p>
        </div>
        <button 
          className="btn-primary"
          onClick={() => setIsEditing(!isEditing)}
          style={{ 
            backgroundColor: isEditing ? 'var(--awnash-accent)' : 'var(--awnash-primary)',
            color: isEditing ? 'white' : 'var(--awnash-secondary)',
            border: `2px solid ${isEditing ? 'var(--awnash-accent)' : 'var(--awnash-primary)'}`
          }}
        >
          <FontAwesomeIcon icon={isEditing ? faSave : faEdit} />
          <span>{isEditing ? (isRTL ? 'حفظ' : 'Save') : (isRTL ? 'تعديل' : 'Edit')}</span>
        </button>
      </div>

      {/* Default Commission Settings */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'var(--awnash-primary)' }}
            >
              <FontAwesomeIcon icon={faGlobe} className="text-black" />
            </div>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--awnash-secondary)' }}>
              {isRTL ? 'العمولات الافتراضية' : 'Default Commission Rates'}
            </h3>
          </div>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Owner Commission */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'var(--awnash-accent)' }}
                >
                  <FontAwesomeIcon icon={faBuilding} className="text-white" />
                </div>
                <div>
                  <h4 className="font-semibold" style={{ color: 'var(--awnash-secondary)' }}>
                    {isRTL ? 'عمولة الملاك' : 'Owner Commission'}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {isRTL ? 'النسبة المئوية المطبقة على جميع الملاك' : 'Default percentage applied to all owners'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={defaultOwnerCommission}
                    onChange={(e) => setDefaultOwnerCommission(parseFloat(e.target.value))}
                    disabled={!isEditing}
                    className="form-input pr-10"
                    placeholder={isRTL ? 'النسبة المئوية' : 'Percentage'}
                  />
                  <FontAwesomeIcon 
                    icon={faPercent} 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                  />
                </div>
                <div className="text-lg font-bold" style={{ color: 'var(--awnash-primary)' }}>
                  {defaultOwnerCommission}%
                </div>
              </div>
            </div>

            {/* Renter Commission */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'var(--awnash-success)' }}
                >
                  <FontAwesomeIcon icon={faUsers} className="text-white" />
                </div>
                <div>
                  <h4 className="font-semibold" style={{ color: 'var(--awnash-secondary)' }}>
                    {isRTL ? 'عمولة المستأجرين' : 'Renter Commission'}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {isRTL ? 'النسبة المئوية المطبقة على جميع المستأجرين' : 'Default percentage applied to all renters'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={defaultRenterCommission}
                    onChange={(e) => setDefaultRenterCommission(parseFloat(e.target.value))}
                    disabled={!isEditing}
                    className="form-input pr-10"
                    placeholder={isRTL ? 'النسبة المئوية' : 'Percentage'}
                  />
                  <FontAwesomeIcon 
                    icon={faPercent} 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                  />
                </div>
                <div className="text-lg font-bold" style={{ color: 'var(--awnash-primary)' }}>
                  {defaultRenterCommission}%
                </div>
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="mt-6 flex justify-end gap-3">
              <button 
                className="btn-secondary"
                onClick={() => setIsEditing(false)}
              >
                {isRTL ? 'إلغاء' : 'Cancel'}
              </button>
              <button 
                className="btn-primary"
                onClick={handleSaveDefaults}
                style={{ 
                  backgroundColor: 'var(--awnash-primary)',
                  color: 'var(--awnash-secondary)'
                }}
              >
                <FontAwesomeIcon icon={faSave} />
                <span>{isRTL ? 'حفظ التغييرات' : 'Save Changes'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Custom Commission Rules */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold" style={{ color: 'var(--awnash-secondary)' }}>
              {isRTL ? 'العمولات المخصصة' : 'Custom Commission Rules'}
            </h3>
            <div className="flex gap-2">
              <button 
                className="btn-accent"
                onClick={() => handleAddRule('owner')}
              >
                <FontAwesomeIcon icon={faPlus} />
                <span>{isRTL ? 'إضافة مالك' : 'Add Owner'}</span>
              </button>
              <button 
                className="btn-accent"
                onClick={() => handleAddRule('renter')}
              >
                <FontAwesomeIcon icon={faPlus} />
                <span>{isRTL ? 'إضافة مستأجر' : 'Add Renter'}</span>
              </button>
            </div>
          </div>
        </div>
        <div className="card-body">
          <p className="text-gray-600 mb-6">
            {isRTL 
              ? 'قم بتعيين عمولات مخصصة لملاك أو مستأجرين محددين. إذا لم يتم تعيين عمولة مخصصة، ستطبق العمولة الافتراضية.'
              : 'Set custom commission rates for specific owners or renters. If no custom rate is set, the default commission will apply.'
            }
          </p>

          {commissionRules.length === 0 ? (
            <div className="text-center py-8">
              <FontAwesomeIcon icon={faCog} className="text-4xl text-gray-300 mb-4" />
              <p className="text-gray-500">
                {isRTL ? 'لا توجد قواعد عمولة مخصصة' : 'No custom commission rules yet'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>{isRTL ? 'النوع' : 'Type'}</th>
                    <th>{isRTL ? 'الاسم' : 'Name'}</th>
                    <th>{isRTL ? 'معدل العمولة' : 'Commission Rate'}</th>
                    <th>{isRTL ? 'الإجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  {commissionRules.map((rule) => (
                    <tr key={rule.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon 
                            icon={rule.type === 'owner' ? faBuilding : faUsers}
                            className={rule.type === 'owner' ? 'text-blue-600' : 'text-green-600'}
                          />
                          <span className="font-medium">
                            {rule.type === 'owner' 
                              ? (isRTL ? 'مالك' : 'Owner')
                              : (isRTL ? 'مستأجر' : 'Renter')
                            }
                          </span>
                        </div>
                      </td>
                      <td className="font-medium">{rule.entityName}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold" style={{ color: 'var(--awnash-primary)' }}>
                            {rule.commissionRate}%
                          </span>
                          <span className="text-sm text-gray-500">
                            ({isRTL ? 'بدلاً من' : 'instead of'} {rule.type === 'owner' ? defaultOwnerCommission : defaultRenterCommission}%)
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <button 
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title={isRTL ? 'تعديل' : 'Edit'}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button 
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            onClick={() => handleDeleteRule(rule.id)}
                            title={isRTL ? 'حذف' : 'Delete'}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Commission Preview */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--awnash-secondary)' }}>
            {isRTL ? 'معاينة العمولة' : 'Commission Preview'}
          </h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--awnash-gray-50)' }}>
              <h4 className="font-semibold mb-3" style={{ color: 'var(--awnash-secondary)' }}>
                {isRTL ? 'مثال على حجز بقيمة 10,000 ريال' : 'Example booking worth $10,000'}
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>{isRTL ? 'قيمة الحجز:' : 'Booking Amount:'}</span>
                  <span className="font-medium">$10,000</span>
                </div>
                <div className="flex justify-between">
                  <span>{isRTL ? 'عمولة المالك:' : 'Owner Commission:'}</span>
                  <span className="font-medium text-blue-600">
                    ${(10000 * defaultOwnerCommission / 100).toLocaleString()} ({defaultOwnerCommission}%)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{isRTL ? 'عمولة المستأجر:' : 'Renter Commission:'}</span>
                  <span className="font-medium text-green-600">
                    ${(10000 * defaultRenterCommission / 100).toLocaleString()} ({defaultRenterCommission}%)
                  </span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between font-bold">
                  <span>{isRTL ? 'إجمالي عمولة أوناش:' : 'Total Awnash Commission:'}</span>
                  <span style={{ color: 'var(--awnash-primary)' }}>
                    ${((10000 * defaultOwnerCommission / 100) + (10000 * defaultRenterCommission / 100)).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-4 rounded-lg border-2 border-dashed border-gray-300">
              <h4 className="font-semibold mb-3 text-gray-600">
                {isRTL ? 'ملاحظات مهمة' : 'Important Notes'}
              </h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• {isRTL ? 'العمولات المخصصة تلغي العمولات الافتراضية' : 'Custom rates override default rates'}</li>
                <li>• {isRTL ? 'يتم احتساب العمولات تلقائياً عند الدفع' : 'Commissions are calculated automatically on payment'}</li>
                <li>• {isRTL ? 'يمكن تعديل العمولات في أي وقت' : 'Commission rates can be modified anytime'}</li>
                <li>• {isRTL ? 'التغييرات تطبق على الحجوزات الجديدة فقط' : 'Changes apply to new bookings only'}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommissionSettings; 