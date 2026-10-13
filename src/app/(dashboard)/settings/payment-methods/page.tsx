'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCreditCard,
  faSave,
  faSpinner,
  faToggleOn,
  faToggleOff,
} from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/Button';
import { settingsService, PaymentMethod } from '@/services/settingsService';

const PAYMENT_METHOD_META: Record<string, { en: string; ar: string; icon: string }> = {
  mada: { en: 'MADA', ar: 'مدى', icon: '💳' },
  visa: { en: 'Visa', ar: 'فيزا', icon: '💳' },
  mastercard: { en: 'Mastercard', ar: 'ماستركارد', icon: '💳' },
  apple_pay: { en: 'Apple Pay', ar: 'آبل باي', icon: '🍎' },
  google_pay: { en: 'Google Pay', ar: 'جوجل باي', icon: '📱' },
  stc_pay: { en: 'STC Pay', ar: 'STC Pay', icon: '📲' },
};

const PaymentMethodsPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dirtyMethods, setDirtyMethods] = useState<Record<string, boolean>>({});

  const fetchMethods = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await settingsService.getPaymentMethods();
      setMethods(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMethods();
  }, [fetchMethods]);

  const handleToggle = (key: string, currentEnabled: boolean) => {
    setDirtyMethods((prev) => ({
      ...prev,
      [key]: !currentEnabled,
    }));
    setMethods((prev) =>
      prev.map((m) => (m.key === key ? { ...m, enabled: !currentEnabled } : m)),
    );
    setSuccess(null);
  };

  const handleSave = async () => {
    if (Object.keys(dirtyMethods).length === 0) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await settingsService.updatePaymentMethods(dirtyMethods);
      setDirtyMethods({});
      setSuccess(isRTL ? 'تم حفظ التغييرات بنجاح' : 'Payment methods updated successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const hasDirtyChanges = Object.keys(dirtyMethods).length > 0;

  return (
    <div className="p-6 max-w-4xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FontAwesomeIcon icon={faCreditCard} className="text-2xl text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-900">
            {isRTL ? 'طرق الدفع' : 'Payment Methods'}
          </h1>
        </div>
        {hasDirtyChanges && (
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? (
              <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
            ) : (
              <FontAwesomeIcon icon={faSave} />
            )}
            {isRTL ? 'حفظ التغييرات' : 'Save Changes'}
          </Button>
        )}
      </div>

      {/* Description */}
      <p className="text-gray-600 mb-6">
        {isRTL
          ? 'تحكم في طرق الدفع المتاحة للمستخدمين. الطرق المعطلة لن تظهر في التطبيق.'
          : 'Control which payment methods are available to users. Disabled methods will not appear in the app.'}
      </p>

      {/* Status Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          {success}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <FontAwesomeIcon icon={faSpinner} className="animate-spin text-3xl text-gray-400" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
          {methods.map((method) => {
            const meta = PAYMENT_METHOD_META[method.key];
            const isDirty = method.key in dirtyMethods;

            return (
              <div
                key={method.key}
                className={`flex items-center justify-between p-5 hover:bg-gray-50 transition-colors ${isDirty ? 'bg-amber-50' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{meta?.icon || '💳'}</span>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {isRTL ? meta?.ar || method.key : meta?.en || method.key}
                    </p>
                    <p className="text-sm text-gray-500">{method.label}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle(method.key, method.enabled)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    method.enabled
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  <FontAwesomeIcon
                    icon={method.enabled ? faToggleOn : faToggleOff}
                    className="text-lg"
                  />
                  {method.enabled
                    ? isRTL ? 'مفعّل' : 'Enabled'
                    : isRTL ? 'معطّل' : 'Disabled'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Info Note */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-700">
          {isRTL
            ? '⚠️ ملاحظة: Apple Pay و Google Pay يتطلبان إعداد خاص في البوابة قبل التفعيل.'
            : '⚠️ Note: Apple Pay and Google Pay require portal setup before enabling.'}
        </p>
      </div>
    </div>
  );
};

export default PaymentMethodsPage;
