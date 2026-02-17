'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { referralService, ReferralConfig, UpdateReferralConfigDto } from '@/services/referralService';

export default function ReferralProgramSettingsPage() {
  const { t } = useTranslation();
  const [config, setConfig] = useState<ReferralConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState<UpdateReferralConfigDto>({
    referrerRewardAmount: 0,
    referredUserRewardAmount: 0,
    rewardPayoutMethod: 'wallet_credit',
    maxReferralsPerUser: 0,
    isActive: false,
  });

  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true);
      const data = await referralService.getConfig();
      setConfig(data);
      setForm({
        referrerRewardAmount: Number(data.referrerRewardAmount),
        referredUserRewardAmount: Number(data.referredUserRewardAmount),
        rewardPayoutMethod: data.rewardPayoutMethod,
        maxReferralsPerUser: data.maxReferralsPerUser,
        isActive: data.isActive,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load config');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const updated = await referralService.updateConfig(form);
      setConfig(updated);
      setSuccess('Referral program settings saved successfully.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Referral Program Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Configure reward amounts, payout method, and referral limits.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
          {success}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        {/* Enable/Disable Toggle */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Program Status</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Enable or disable the referral program for all users.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500" />
            </label>
          </div>
        </div>

        {/* Reward Amounts */}
        <div className="p-6 border-b border-gray-100 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">Reward Amounts</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Referrer Reward (SAR)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.referrerRewardAmount}
                onChange={(e) => setForm({ ...form, referrerRewardAmount: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              />
              <p className="text-xs text-gray-400 mt-1">Amount the referrer earns per qualified referral.</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Referred User Reward (SAR)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.referredUserRewardAmount}
                onChange={(e) => setForm({ ...form, referredUserRewardAmount: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              />
              <p className="text-xs text-gray-400 mt-1">Amount the new user earns after their first paid booking.</p>
            </div>
          </div>
        </div>

        {/* Payout Method */}
        <div className="p-6 border-b border-gray-100 space-y-3">
          <h3 className="text-sm font-semibold text-gray-900">Payout Method</h3>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="payoutMethod"
                value="wallet_credit"
                checked={form.rewardPayoutMethod === 'wallet_credit'}
                onChange={() => setForm({ ...form, rewardPayoutMethod: 'wallet_credit' })}
                className="w-4 h-4 text-yellow-500 focus:ring-yellow-400"
              />
              <span className="text-sm text-gray-700">Wallet Credit</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="payoutMethod"
                value="cash_payout"
                checked={form.rewardPayoutMethod === 'cash_payout'}
                onChange={() => setForm({ ...form, rewardPayoutMethod: 'cash_payout' })}
                className="w-4 h-4 text-yellow-500 focus:ring-yellow-400"
              />
              <span className="text-sm text-gray-700">Cash Payout</span>
            </label>
          </div>
        </div>

        {/* Max Referrals */}
        <div className="p-6 border-b border-gray-100">
          <label className="block text-sm font-semibold text-gray-900 mb-1">
            Max Referrals Per User
          </label>
          <input
            type="number"
            min="0"
            value={form.maxReferralsPerUser}
            onChange={(e) => setForm({ ...form, maxReferralsPerUser: parseInt(e.target.value) || 0 })}
            className="w-48 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
          />
          <p className="text-xs text-gray-400 mt-1">Set to 0 for unlimited referrals.</p>
        </div>

        {/* Save Button */}
        <div className="p-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-yellow-500 text-white text-sm font-semibold rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
