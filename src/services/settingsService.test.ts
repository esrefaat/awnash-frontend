import { setupFetchMock, mockFetchOnce, mockFetchError } from '../../test/helpers/mock-api';
import { settingsService } from './settingsService';

let fetchMock: jest.Mock;

beforeEach(() => {
  fetchMock = setupFetchMock();
});

describe('settingsService', () => {
  describe('getCommissionSettings', () => {
    it('fetches and returns commission settings', async () => {
      mockFetchOnce(fetchMock, {
        success: true,
        data: {
          owner_commission_rate: 15,
          renter_service_fee_rate: 5,
          vat_rate: 15,
          security_deposit_rate: 20,
          minimum_booking_value: 100,
        },
      });

      const result = await settingsService.getCommissionSettings();

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/settings/commission'),
        expect.objectContaining({ credentials: 'include' }),
      );
      expect(result.ownerCommissionRate).toBe(15);
      expect(result.vatRate).toBe(15);
    });
  });

  describe('updateCommissionSettings', () => {
    it('sends PUT with updated settings', async () => {
      mockFetchOnce(fetchMock, {
        success: true,
        message: 'Updated',
        data: {
          owner_commission_rate: 12,
          renter_service_fee_rate: 5,
          vat_rate: 15,
          security_deposit_rate: 20,
          minimum_booking_value: 100,
        },
      });

      const result = await settingsService.updateCommissionSettings({ ownerCommissionRate: 12 });

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/settings/admin/commission'),
        expect.objectContaining({ method: 'PUT' }),
      );
      expect(result.ownerCommissionRate).toBe(12);
    });
  });

  describe('previewFees', () => {
    it('fetches fee preview for a given amount', async () => {
      mockFetchOnce(fetchMock, {
        success: true,
        data: {
          base_amount: 1000,
          platform_fee: 150,
          service_fee: 50,
          vat_amount: 30,
          total_for_renter: 1080,
          owner_payout: 850,
          commission_rate: 15,
          service_fee_rate: 5,
        },
      });

      const result = await settingsService.previewFees(1000);

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/settings/fee-preview?amount=1000'),
        expect.any(Object),
      );
      expect(result.baseAmount).toBe(1000);
    });
  });

  describe('getAllSettings', () => {
    it('fetches all platform settings', async () => {
      mockFetchOnce(fetchMock, {
        success: true,
        data: [
          { id: 's1', key: 'owner_commission_rate', value: '15', value_type: 'number', category: 'commission' },
        ],
      });

      const result = await settingsService.getAllSettings();
      expect(result).toHaveLength(1);
      expect(result[0].key).toBe('owner_commission_rate');
    });
  });

  describe('getEscrowSettings', () => {
    it('fetches escrow settings', async () => {
      mockFetchOnce(fetchMock, {
        success: true,
        data: {
          payment_window: 24,
          delivery_payout_percentage: 30,
          delivery_payout_cap: 5000,
          auto_cancel_no_dispatch: 48,
          delivery_confirm: 72,
          auto_confirm_ratio: 0.5,
          auto_confirm_min: 24,
          auto_confirm_max: 168,
          cancellation_tiers: [{ hours_before_start: 48, fee_percent: 10 }],
        },
      });

      const result = await settingsService.getEscrowSettings();

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/settings/admin/escrow'),
        expect.any(Object),
      );
      expect(result.paymentWindow).toBe(24);
      expect(result.cancellationTiers).toHaveLength(1);
    });
  });

  describe('updateEscrowSettings', () => {
    it('sends PUT with escrow updates', async () => {
      mockFetchOnce(fetchMock, {
        success: true,
        message: 'Updated',
        data: { payment_window: 48 },
      });

      const result = await settingsService.updateEscrowSettings({ paymentWindow: 48 });

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/settings/admin/escrow'),
        expect.objectContaining({ method: 'PUT' }),
      );
      expect(result.paymentWindow).toBe(48);
    });
  });

  describe('getSettingsHistory', () => {
    it('fetches history with optional settingId', async () => {
      mockFetchOnce(fetchMock, {
        success: true,
        data: [{ id: 'h1', setting_id: 's1', old_value: '10', new_value: '15' }],
      });

      const result = await settingsService.getSettingsHistory('s1', 20);

      const url = fetchMock.mock.calls[0][0] as string;
      expect(url).toContain('settingId=s1');
      expect(url).toContain('limit=20');
      expect(result).toHaveLength(1);
    });
  });

  describe('error handling', () => {
    it('throws on HTTP error', async () => {
      mockFetchError(fetchMock, 'Unauthorized', 401);
      await expect(settingsService.getCommissionSettings()).rejects.toThrow('Unauthorized');
    });
  });

  describe('utility functions', () => {
    it('formatPercentage formats value with % sign', () => {
      expect(settingsService.formatPercentage(15)).toBe('15%');
      expect(settingsService.formatPercentage(0)).toBe('0%');
    });

    it('formatCurrency formats with SAR by default', () => {
      const result = settingsService.formatCurrency(2500);
      expect(result).toContain('2,500');
      expect(result).toContain('SAR');
    });

    it('getCategoryLabel returns English labels by default', () => {
      expect(settingsService.getCategoryLabel('commission')).toBe('Commission');
      expect(settingsService.getCategoryLabel('tax')).toBe('Tax');
      expect(settingsService.getCategoryLabel('booking')).toBe('Booking');
    });

    it('getCategoryLabel returns Arabic labels when isRTL', () => {
      expect(settingsService.getCategoryLabel('commission', true)).toBe('العمولات');
    });

    it('getCategoryLabel falls back to raw key for unknown categories', () => {
      expect(settingsService.getCategoryLabel('unknown')).toBe('unknown');
    });

    it('getSettingLabel returns English labels by default', () => {
      expect(settingsService.getSettingLabel('owner_commission_rate')).toBe('Owner Commission Rate');
      expect(settingsService.getSettingLabel('vat_rate')).toBe('VAT Rate');
    });

    it('getSettingLabel returns Arabic labels when isRTL', () => {
      expect(settingsService.getSettingLabel('owner_commission_rate', true)).toBe('نسبة عمولة المالك');
    });

    it('getSettingLabel falls back to raw key for unknown settings', () => {
      expect(settingsService.getSettingLabel('unknown_key')).toBe('unknown_key');
    });
  });
});
