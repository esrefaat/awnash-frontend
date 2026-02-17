'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPercent,
  faUsers,
  faBuilding,
  faSave,
  faEdit,
  faGlobe,
  faCalculator,
  faSpinner,
  faMoneyBill,
  faShieldAlt,
  faRefresh,
  faHistory,
  faLock,
  faClock,
  faTruck,
  faBan,
  faCheckCircle,
  faListOl,
} from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/Button';
import { settingsService, CommissionSettings, FeePreview, EscrowSettings } from '@/services/settingsService';

const CommissionSettingsPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  // State for commission settings
  const [settings, setSettings] = useState<CommissionSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    ownerCommissionRate: 15,
    renterServiceFeeRate: 5,
    vatRate: 15,
    securityDepositRate: 50,
    minimumBookingValue: 500,
  });
  
  // Fee preview state
  const [previewAmount, setPreviewAmount] = useState<number>(10000);
  const [feePreview, setFeePreview] = useState<FeePreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Escrow settings state
  const [escrowSettings, setEscrowSettings] = useState<EscrowSettings | null>(null);
  const [escrowLoading, setEscrowLoading] = useState(true);
  const [escrowEditing, setEscrowEditing] = useState(false);
  const [escrowSaving, setEscrowSaving] = useState(false);
  const [escrowForm, setEscrowForm] = useState({
    paymentWindow: 15,
    deliveryPayoutPercentage: 30,
    deliveryPayoutCap: 5000,
    autoCancelNoDispatch: 2880,
    deliveryConfirm: 1440,
    autoConfirmRatio: 20,
    autoConfirmMin: 1440,
    autoConfirmMax: 10080,
  });

  // Fetch settings from API
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await settingsService.getCommissionSettings();
      setSettings(data);
      setEditForm({
        ownerCommissionRate: data.ownerCommissionRate,
        renterServiceFeeRate: data.renterServiceFeeRate,
        vatRate: data.vatRate,
        securityDepositRate: data.securityDepositRate,
        minimumBookingValue: data.minimumBookingValue,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch fee preview
  const fetchPreview = useCallback(async () => {
    if (previewAmount <= 0) return;
    setPreviewLoading(true);
    try {
      const preview = await settingsService.previewFees(previewAmount);
      setFeePreview(preview);
    } catch (err: any) {
      console.error('Failed to load fee preview:', err);
    } finally {
      setPreviewLoading(false);
    }
  }, [previewAmount]);

  // Fetch escrow settings
  const fetchEscrowSettings = useCallback(async () => {
    setEscrowLoading(true);
    try {
      const data = await settingsService.getEscrowSettings();
      setEscrowSettings(data);
      setEscrowForm({
        paymentWindow: data.paymentWindow,
        deliveryPayoutPercentage: data.deliveryPayoutPercentage,
        deliveryPayoutCap: data.deliveryPayoutCap,
        autoCancelNoDispatch: data.autoCancelNoDispatch,
        deliveryConfirm: data.deliveryConfirm,
        autoConfirmRatio: data.autoConfirmRatio,
        autoConfirmMin: data.autoConfirmMin,
        autoConfirmMax: data.autoConfirmMax,
      });
    } catch {
      // Escrow settings may not be available yet
    } finally {
      setEscrowLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
    fetchEscrowSettings();
  }, [fetchSettings, fetchEscrowSettings]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchPreview();
    }, 500);
    return () => clearTimeout(debounce);
  }, [previewAmount, fetchPreview]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const updatedSettings = await settingsService.updateCommissionSettings(editForm);
      setSettings(updatedSettings);
      setIsEditing(false);
      // Refresh preview with new settings
      fetchPreview();
    } catch (err: any) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (settings) {
      setEditForm({
        ownerCommissionRate: settings.ownerCommissionRate,
        renterServiceFeeRate: settings.renterServiceFeeRate,
        vatRate: settings.vatRate,
        securityDepositRate: settings.securityDepositRate,
        minimumBookingValue: settings.minimumBookingValue,
      });
    }
    setIsEditing(false);
  };

  const handleEscrowSave = async () => {
    setEscrowSaving(true);
    setError(null);
    try {
      const updated = await settingsService.updateEscrowSettings(escrowForm);
      setEscrowSettings(updated);
      setEscrowEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save escrow settings');
    } finally {
      setEscrowSaving(false);
    }
  };

  const handleEscrowCancel = () => {
    if (escrowSettings) {
      setEscrowForm({
        paymentWindow: escrowSettings.paymentWindow,
        deliveryPayoutPercentage: escrowSettings.deliveryPayoutPercentage,
        deliveryPayoutCap: escrowSettings.deliveryPayoutCap,
        autoCancelNoDispatch: escrowSettings.autoCancelNoDispatch,
        deliveryConfirm: escrowSettings.deliveryConfirm,
        autoConfirmRatio: escrowSettings.autoConfirmRatio,
        autoConfirmMin: escrowSettings.autoConfirmMin,
        autoConfirmMax: escrowSettings.autoConfirmMax,
      });
    }
    setEscrowEditing(false);
  };

  const formatMinutesDisplay = (minutes: number): string => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr${hours > 1 ? 's' : ''}`;
    const days = Math.floor(hours / 24);
    const remHrs = hours % 24;
    if (remHrs === 0) return `${days} day${days > 1 ? 's' : ''}`;
    return `${days}d ${remHrs}h`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <FontAwesomeIcon icon={faSpinner} className="text-4xl animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ fontFamily: isRTL ? 'var(--awnash-font-arabic)' : 'var(--awnash-font-english)' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--awnash-secondary)' }}>
            {isRTL ? 'إعدادات العمولات' : 'Commission Settings'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isRTL ? 'إدارة عمولات أوناش والرسوم والضرائب' : 'Manage Awnash commission rates, fees, and taxes'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={fetchSettings}
            disabled={loading}
          >
            <FontAwesomeIcon icon={faRefresh} className={loading ? 'animate-spin' : ''} />
          </Button>
          {!isEditing ? (
            <Button 
              variant="default"
              onClick={() => setIsEditing(true)}
            >
              <FontAwesomeIcon icon={faEdit} className="mr-2" />
              <span>{isRTL ? 'تعديل' : 'Edit'}</span>
            </Button>
          ) : (
            <>
              <Button 
                variant="secondary"
                onClick={handleCancel}
                disabled={saving}
              >
                {isRTL ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button 
                variant="default"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                ) : (
                  <FontAwesomeIcon icon={faSave} className="mr-2" />
                )}
                <span>{isRTL ? 'حفظ' : 'Save'}</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Commission & Fee Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Owner Commission */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--awnash-accent)' }}
              >
                <FontAwesomeIcon icon={faBuilding} className="text-foreground" />
              </div>
              <div>
                <h3 className="font-semibold" style={{ color: 'var(--awnash-secondary)' }}>
                  {isRTL ? 'عمولة الملاك' : 'Owner Commission'}
                </h3>
                <p className="text-sm text-gray-500">
                  {isRTL ? 'خصم من مبلغ المالك' : 'Deducted from owner earnings'}
                </p>
              </div>
            </div>
          </div>
          <div className="card-body">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={isEditing ? editForm.ownerCommissionRate : settings?.ownerCommissionRate}
                  onChange={(e) => setEditForm({ ...editForm, ownerCommissionRate: parseFloat(e.target.value) || 0 })}
                  disabled={!isEditing}
                  className="form-input pr-10 text-2xl font-bold"
                />
                <FontAwesomeIcon 
                  icon={faPercent} 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Renter Service Fee */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--awnash-success)' }}
              >
                <FontAwesomeIcon icon={faUsers} className="text-foreground" />
              </div>
              <div>
                <h3 className="font-semibold" style={{ color: 'var(--awnash-secondary)' }}>
                  {isRTL ? 'رسوم خدمة المستأجر' : 'Renter Service Fee'}
                </h3>
                <p className="text-sm text-gray-500">
                  {isRTL ? 'يضاف إلى فاتورة المستأجر' : 'Added to renter invoice'}
                </p>
              </div>
            </div>
          </div>
          <div className="card-body">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={isEditing ? editForm.renterServiceFeeRate : settings?.renterServiceFeeRate}
                  onChange={(e) => setEditForm({ ...editForm, renterServiceFeeRate: parseFloat(e.target.value) || 0 })}
                  disabled={!isEditing}
                  className="form-input pr-10 text-2xl font-bold"
                />
                <FontAwesomeIcon 
                  icon={faPercent} 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* VAT Rate */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--awnash-warning)' }}
              >
                <FontAwesomeIcon icon={faMoneyBill} className="text-foreground" />
              </div>
              <div>
                <h3 className="font-semibold" style={{ color: 'var(--awnash-secondary)' }}>
                  {isRTL ? 'ضريبة القيمة المضافة' : 'VAT Rate'}
                </h3>
                <p className="text-sm text-gray-500">
                  {isRTL ? 'يطبق على الرسوم' : 'Applied on fees (Saudi Arabia)'}
                </p>
              </div>
            </div>
          </div>
          <div className="card-body">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={isEditing ? editForm.vatRate : settings?.vatRate}
                  onChange={(e) => setEditForm({ ...editForm, vatRate: parseFloat(e.target.value) || 0 })}
                  disabled={!isEditing}
                  className="form-input pr-10 text-2xl font-bold"
                />
                <FontAwesomeIcon 
                  icon={faPercent} 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Security Deposit */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--awnash-info)' }}
              >
                <FontAwesomeIcon icon={faShieldAlt} className="text-foreground" />
              </div>
              <div>
                <h3 className="font-semibold" style={{ color: 'var(--awnash-secondary)' }}>
                  {isRTL ? 'نسبة الضمان' : 'Security Deposit'}
                </h3>
                <p className="text-sm text-gray-500">
                  {isRTL ? 'نسبة من قيمة الحجز' : 'Percentage of booking value'}
                </p>
              </div>
            </div>
          </div>
          <div className="card-body">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="5"
                  value={isEditing ? editForm.securityDepositRate : settings?.securityDepositRate}
                  onChange={(e) => setEditForm({ ...editForm, securityDepositRate: parseFloat(e.target.value) || 0 })}
                  disabled={!isEditing}
                  className="form-input pr-10 text-2xl font-bold"
                />
                <FontAwesomeIcon 
                  icon={faPercent} 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Minimum Booking Value */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'var(--awnash-primary)' }}
            >
              <FontAwesomeIcon icon={faGlobe} className="text-black" />
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: 'var(--awnash-secondary)' }}>
                {isRTL ? 'الحد الأدنى لقيمة الحجز' : 'Minimum Booking Value'}
              </h3>
              <p className="text-sm text-gray-500">
                {isRTL ? 'أقل قيمة مقبولة للحجز' : 'Minimum accepted booking value in SAR'}
              </p>
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="flex items-center gap-4 max-w-md">
            <div className="relative flex-1">
              <input
                type="number"
                min="0"
                step="100"
                value={isEditing ? editForm.minimumBookingValue : settings?.minimumBookingValue}
                onChange={(e) => setEditForm({ ...editForm, minimumBookingValue: parseFloat(e.target.value) || 0 })}
                disabled={!isEditing}
                className="form-input text-xl font-bold"
              />
            </div>
            <span className="text-lg font-medium text-gray-600">SAR</span>
          </div>
        </div>
      </div>

      {/* Fee Calculator / Preview */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'var(--awnash-secondary)' }}
            >
              <FontAwesomeIcon icon={faCalculator} className="text-foreground" />
            </div>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--awnash-secondary)' }}>
              {isRTL ? 'حاسبة الرسوم' : 'Fee Calculator'}
            </h3>
          </div>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isRTL ? 'قيمة الحجز (ريال)' : 'Booking Amount (SAR)'}
              </label>
              <input
                type="number"
                min="0"
                step="100"
                value={previewAmount}
                onChange={(e) => setPreviewAmount(parseFloat(e.target.value) || 0)}
                className="form-input text-xl"
                placeholder="10000"
              />
            </div>

            {/* Preview Results */}
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--awnash-gray-50)' }}>
              {previewLoading ? (
                <div className="flex items-center justify-center py-8">
                  <FontAwesomeIcon icon={faSpinner} className="text-2xl animate-spin text-muted-foreground" />
                </div>
              ) : feePreview ? (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>{isRTL ? 'قيمة الحجز:' : 'Base Amount:'}</span>
                    <span className="font-medium">{settingsService.formatCurrency(feePreview.baseAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{isRTL ? 'عمولة المنصة:' : 'Platform Fee:'}</span>
                    <span className="font-medium text-red-600">
                      -{settingsService.formatCurrency(feePreview.platformFee)} ({feePreview.commissionRate}%)
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{isRTL ? 'رسوم الخدمة:' : 'Service Fee:'}</span>
                    <span className="font-medium text-blue-600">
                      +{settingsService.formatCurrency(feePreview.serviceFee)} ({feePreview.serviceFeeRate}%)
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{isRTL ? 'ضريبة القيمة المضافة:' : 'VAT:'}</span>
                    <span className="font-medium text-orange-600">
                      +{settingsService.formatCurrency(feePreview.vatAmount)}
                    </span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between font-bold">
                    <span>{isRTL ? 'يدفع المستأجر:' : 'Renter Pays:'}</span>
                    <span style={{ color: 'var(--awnash-accent)' }}>
                      {settingsService.formatCurrency(feePreview.totalForRenter)}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>{isRTL ? 'يستلم المالك:' : 'Owner Receives:'}</span>
                    <span style={{ color: 'var(--awnash-success)' }}>
                      {settingsService.formatCurrency(feePreview.ownerPayout)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-4">
                  {isRTL ? 'أدخل قيمة الحجز لمعاينة الرسوم' : 'Enter booking amount to preview fees'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================================================ */}
      {/* ESCROW SETTINGS SECTION */}
      {/* ================================================ */}
      <div className="border-t border-border pt-6 mt-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/30">
              <FontAwesomeIcon icon={faLock} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: 'var(--awnash-secondary)' }}>
                {isRTL ? 'إعدادات الضمان' : 'Escrow Settings'}
              </h2>
              <p className="text-sm text-gray-500">
                {isRTL ? 'نوافذ الوقت والدفعات الجزئية والإلغاء' : 'Time windows, partial payouts, and cancellation settings'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {!escrowEditing ? (
              <Button variant="default" onClick={() => setEscrowEditing(true)} disabled={escrowLoading}>
                <FontAwesomeIcon icon={faEdit} className="mr-2" />
                <span>{isRTL ? 'تعديل' : 'Edit'}</span>
              </Button>
            ) : (
              <>
                <Button variant="secondary" onClick={handleEscrowCancel} disabled={escrowSaving}>
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button variant="default" onClick={handleEscrowSave} disabled={escrowSaving}>
                  {escrowSaving ? (
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                  ) : (
                    <FontAwesomeIcon icon={faSave} className="mr-2" />
                  )}
                  <span>{isRTL ? 'حفظ' : 'Save'}</span>
                </Button>
              </>
            )}
          </div>
        </div>

        {escrowLoading ? (
          <div className="flex items-center justify-center py-12">
            <FontAwesomeIcon icon={faSpinner} className="text-2xl animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Window */}
            <EscrowSettingCard
              icon={faClock}
              color="var(--awnash-warning)"
              title={isRTL ? 'نافذة الدفع' : 'Payment Window'}
              desc={isRTL ? 'الوقت المتاح للطالب للدفع بعد قبول العرض' : 'Time for requester to pay after accepting an offer'}
              value={escrowEditing ? escrowForm.paymentWindow : escrowSettings?.paymentWindow ?? 15}
              onChange={(v) => setEscrowForm({ ...escrowForm, paymentWindow: v })}
              disabled={!escrowEditing}
              unit={isRTL ? 'دقيقة' : 'min'}
              displayText={formatMinutesDisplay(escrowSettings?.paymentWindow ?? 15)}
              isRTL={isRTL}
            />

            {/* Delivery Payout % */}
            <EscrowSettingCard
              icon={faTruck}
              color="var(--awnash-success)"
              title={isRTL ? 'نسبة دفعة التسليم' : 'Delivery Payout %'}
              desc={isRTL ? 'نسبة الضمان المدفوعة عند التسليم (المرحلة 1)' : 'Percentage of escrow released on delivery (Stage 1)'}
              value={escrowEditing ? escrowForm.deliveryPayoutPercentage : escrowSettings?.deliveryPayoutPercentage ?? 30}
              onChange={(v) => setEscrowForm({ ...escrowForm, deliveryPayoutPercentage: v })}
              disabled={!escrowEditing}
              unit="%"
              isRTL={isRTL}
              min={0}
              max={100}
            />

            {/* Delivery Payout Cap */}
            <EscrowSettingCard
              icon={faShieldAlt}
              color="var(--awnash-info)"
              title={isRTL ? 'سقف دفعة التسليم' : 'Delivery Payout Cap'}
              desc={isRTL ? 'الحد الأقصى للمرحلة 1 بغض النظر عن النسبة' : 'Maximum Stage 1 payout regardless of percentage'}
              value={escrowEditing ? escrowForm.deliveryPayoutCap : escrowSettings?.deliveryPayoutCap ?? 5000}
              onChange={(v) => setEscrowForm({ ...escrowForm, deliveryPayoutCap: v })}
              disabled={!escrowEditing}
              unit="SAR"
              isRTL={isRTL}
              step={100}
            />

            {/* Auto-Cancel No Dispatch */}
            <EscrowSettingCard
              icon={faBan}
              color="var(--awnash-accent)"
              title={isRTL ? 'إلغاء تلقائي (لم يرسل)' : 'Auto-Cancel (No Dispatch)'}
              desc={isRTL ? 'إلغاء تلقائي إذا لم يرسل المالك المعدات' : 'Auto-cancel if owner does not dispatch equipment'}
              value={escrowEditing ? escrowForm.autoCancelNoDispatch : escrowSettings?.autoCancelNoDispatch ?? 2880}
              onChange={(v) => setEscrowForm({ ...escrowForm, autoCancelNoDispatch: v })}
              disabled={!escrowEditing}
              unit={isRTL ? 'دقيقة' : 'min'}
              displayText={formatMinutesDisplay(escrowSettings?.autoCancelNoDispatch ?? 2880)}
              isRTL={isRTL}
            />

            {/* Delivery Confirm */}
            <EscrowSettingCard
              icon={faCheckCircle}
              color="var(--awnash-success)"
              title={isRTL ? 'تأكيد التسليم' : 'Delivery Confirm'}
              desc={isRTL ? 'التأكيد التلقائي للتسليم بعد الإرسال' : 'Auto-confirm delivery after dispatch'}
              value={escrowEditing ? escrowForm.deliveryConfirm : escrowSettings?.deliveryConfirm ?? 1440}
              onChange={(v) => setEscrowForm({ ...escrowForm, deliveryConfirm: v })}
              disabled={!escrowEditing}
              unit={isRTL ? 'دقيقة' : 'min'}
              displayText={formatMinutesDisplay(escrowSettings?.deliveryConfirm ?? 1440)}
              isRTL={isRTL}
            />

            {/* Auto-Confirm Ratio */}
            <EscrowSettingCard
              icon={faPercent}
              color="var(--awnash-secondary)"
              title={isRTL ? 'نسبة التأكيد التلقائي' : 'Auto-Confirm Ratio'}
              desc={isRTL ? 'نسبة مدة الإيجار لحساب وقت التأكيد التلقائي' : 'Percentage of rental duration for auto-confirm calculation'}
              value={escrowEditing ? escrowForm.autoConfirmRatio : escrowSettings?.autoConfirmRatio ?? 20}
              onChange={(v) => setEscrowForm({ ...escrowForm, autoConfirmRatio: v })}
              disabled={!escrowEditing}
              unit="%"
              isRTL={isRTL}
              min={0}
              max={100}
            />

            {/* Auto-Confirm Min */}
            <EscrowSettingCard
              icon={faClock}
              color="var(--awnash-info)"
              title={isRTL ? 'حد أدنى تأكيد تلقائي' : 'Auto-Confirm Min'}
              desc={isRTL ? 'أقل وقت تأكيد تلقائي (أرضية)' : 'Minimum auto-confirm time (floor)'}
              value={escrowEditing ? escrowForm.autoConfirmMin : escrowSettings?.autoConfirmMin ?? 1440}
              onChange={(v) => setEscrowForm({ ...escrowForm, autoConfirmMin: v })}
              disabled={!escrowEditing}
              unit={isRTL ? 'دقيقة' : 'min'}
              displayText={formatMinutesDisplay(escrowSettings?.autoConfirmMin ?? 1440)}
              isRTL={isRTL}
            />

            {/* Auto-Confirm Max */}
            <EscrowSettingCard
              icon={faClock}
              color="var(--awnash-warning)"
              title={isRTL ? 'حد أقصى تأكيد تلقائي' : 'Auto-Confirm Max'}
              desc={isRTL ? 'أقصى وقت تأكيد تلقائي (سقف)' : 'Maximum auto-confirm time (ceiling)'}
              value={escrowEditing ? escrowForm.autoConfirmMax : escrowSettings?.autoConfirmMax ?? 10080}
              onChange={(v) => setEscrowForm({ ...escrowForm, autoConfirmMax: v })}
              disabled={!escrowEditing}
              unit={isRTL ? 'دقيقة' : 'min'}
              displayText={formatMinutesDisplay(escrowSettings?.autoConfirmMax ?? 10080)}
              isRTL={isRTL}
            />
          </div>
        )}

        {/* Cancellation Tiers (read-only display for now) */}
        {escrowSettings?.cancellationTiers && escrowSettings.cancellationTiers.length > 0 && (
          <div className="mt-6 card">
            <div className="card-header">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--awnash-accent)' }}>
                  <FontAwesomeIcon icon={faListOl} className="text-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold" style={{ color: 'var(--awnash-secondary)' }}>
                    {isRTL ? 'مستويات رسوم الإلغاء' : 'Cancellation Fee Tiers'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {isRTL ? 'رسوم الإلغاء المتدرجة حسب الوقت المتبقي' : 'Sliding scale fees based on time before booking start'}
                  </p>
                </div>
              </div>
            </div>
            <div className="card-body">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className={`pb-2 font-medium text-gray-500 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {isRTL ? 'ساعات قبل البدء' : 'Hours Before Start'}
                    </th>
                    <th className={`pb-2 font-medium text-gray-500 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {isRTL ? 'رسوم الإلغاء %' : 'Cancellation Fee %'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[...escrowSettings.cancellationTiers].sort((a, b) => b.hoursBeforeStart - a.hoursBeforeStart).map((tier, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="py-2">{tier.hoursBeforeStart}+ {isRTL ? 'ساعة' : 'hours'}</td>
                      <td className="py-2 font-medium">
                        {tier.feePercent === 0 ? (
                          <span className="text-green-600">{isRTL ? 'مجاني' : 'Free'}</span>
                        ) : (
                          <span className="text-red-600">{tier.feePercent}%</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="p-4 rounded-lg border-2 border-dashed border-gray-300">
        <div className="flex items-center gap-2 mb-3">
          <FontAwesomeIcon icon={faHistory} className="text-gray-500" />
          <h4 className="font-semibold text-gray-600">
            {isRTL ? 'ملاحظات مهمة' : 'Important Notes'}
          </h4>
        </div>
        <ul className="text-sm text-gray-600 space-y-2">
          <li>• {isRTL ? 'التغييرات تطبق على الحجوزات الجديدة فقط' : 'Changes apply to new bookings only'}</li>
          <li>• {isRTL ? 'الحجوزات الحالية تحتفظ بالنسب المحفوظة عند إنشائها' : 'Existing bookings retain rates from creation time'}</li>
          <li>• {isRTL ? 'يتم احتساب العمولات والرسوم تلقائياً' : 'Fees are calculated automatically at booking creation'}</li>
          <li>• {isRTL ? 'ضريبة القيمة المضافة تطبق على الرسوم فقط' : 'VAT is applied on fees, not on base amount'}</li>
        </ul>
      </div>
    </div>
  );
};

// ============================================
// ESCROW SETTING CARD COMPONENT
// ============================================

interface EscrowSettingCardProps {
  icon: any;
  color: string;
  title: string;
  desc: string;
  value: number;
  onChange: (v: number) => void;
  disabled: boolean;
  unit: string;
  displayText?: string;
  isRTL: boolean;
  min?: number;
  max?: number;
  step?: number;
}

const EscrowSettingCard: React.FC<EscrowSettingCardProps> = ({
  icon, color, title, desc, value, onChange, disabled, unit, displayText, isRTL, min, max, step,
}) => (
  <div className="card">
    <div className="card-header">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: color }}
        >
          <FontAwesomeIcon icon={icon} className="text-foreground" />
        </div>
        <div>
          <h3 className="font-semibold" style={{ color: 'var(--awnash-secondary)' }}>{title}</h3>
          <p className="text-sm text-gray-500">{desc}</p>
        </div>
      </div>
    </div>
    <div className="card-body">
      <div className="flex items-center gap-3">
        <input
          type="number"
          min={min ?? 0}
          max={max}
          step={step ?? 1}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          disabled={disabled}
          className="form-input text-xl font-bold w-32"
        />
        <span className="text-sm text-gray-500">{unit}</span>
        {displayText && (
          <span className="text-sm text-gray-400 ml-2">({displayText})</span>
        )}
      </div>
    </div>
  </div>
);

export default CommissionSettingsPage;
