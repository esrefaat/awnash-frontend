import { setupFetchMock, mockFetchOnce, mockFetchError } from '../../test/helpers/mock-api';
import { referralService } from './referralService';

let fetchMock: jest.Mock;

beforeEach(() => {
  fetchMock = setupFetchMock();
});

describe('referralService', () => {
  describe('getConfig', () => {
    it('fetches referral configuration', async () => {
      mockFetchOnce(fetchMock, {
        id: 'cfg1',
        referrer_reward_amount: 50,
        referred_user_reward_amount: 25,
        reward_payout_method: 'wallet_credit',
        max_referrals_per_user: 10,
        is_active: true,
      });

      const result = await referralService.getConfig();

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/referral/admin/config'),
        expect.objectContaining({ credentials: 'include' }),
      );
      expect(result.referrerRewardAmount).toBe(50);
      expect(result.isActive).toBe(true);
    });
  });

  describe('updateConfig', () => {
    it('sends PUT with updated config', async () => {
      mockFetchOnce(fetchMock, {
        id: 'cfg1',
        referrer_reward_amount: 75,
        referred_user_reward_amount: 30,
        reward_payout_method: 'wallet_credit',
        max_referrals_per_user: 15,
        is_active: true,
      });

      const result = await referralService.updateConfig({
        referrerRewardAmount: 75,
        maxReferralsPerUser: 15,
      });

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/referral/admin/config'),
        expect.objectContaining({ method: 'PUT' }),
      );
      expect(result.referrerRewardAmount).toBe(75);
    });
  });

  describe('getAdminReferrals', () => {
    it('fetches referrals without filters', async () => {
      mockFetchOnce(fetchMock, {
        referrals: [{ id: 'r1', status: 'registered' }],
        total: 1,
        page: 1,
        limit: 10,
        total_pages: 1,
      });

      const result = await referralService.getAdminReferrals();

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/referral/admin/referrals'),
        expect.any(Object),
      );
      expect(result.referrals).toHaveLength(1);
    });

    it('appends query params from filters', async () => {
      mockFetchOnce(fetchMock, {
        referrals: [],
        total: 0,
        page: 2,
        limit: 5,
        total_pages: 0,
      });

      await referralService.getAdminReferrals({ status: 'qualified', search: 'john', page: 2, limit: 5 });

      const url = fetchMock.mock.calls[0][0] as string;
      expect(url).toContain('status=qualified');
      expect(url).toContain('search=john');
      expect(url).toContain('page=2');
      expect(url).toContain('limit=5');
    });
  });

  describe('getAdminStats', () => {
    it('fetches referral stats', async () => {
      mockFetchOnce(fetchMock, {
        total_referrals: 100,
        qualified: 40,
        rewarded: 20,
        pending: 40,
        total_rewards_paid: 1000,
        currency: 'SAR',
      });

      const result = await referralService.getAdminStats();

      expect(result.totalReferrals).toBe(100);
      expect(result.currency).toBe('SAR');
    });
  });

  describe('error handling', () => {
    it('throws on HTTP error', async () => {
      mockFetchError(fetchMock, 'Forbidden', 403);
      await expect(referralService.getConfig()).rejects.toThrow('Forbidden');
    });
  });

  describe('utility functions', () => {
    it('formatStatus returns human-readable labels', () => {
      expect(referralService.formatStatus('registered')).toBe('Pending');
      expect(referralService.formatStatus('qualified')).toBe('Qualified');
      expect(referralService.formatStatus('rewarded')).toBe('Rewarded');
      expect(referralService.formatStatus('expired')).toBe('Expired');
    });

    it('formatStatus falls back to raw status for unknown values', () => {
      expect(referralService.formatStatus('unknown')).toBe('unknown');
    });

    it('getStatusColor returns correct CSS classes', () => {
      expect(referralService.getStatusColor('registered')).toBe('bg-yellow-100 text-yellow-800');
      expect(referralService.getStatusColor('qualified')).toBe('bg-green-100 text-green-800');
      expect(referralService.getStatusColor('rewarded')).toBe('bg-blue-100 text-blue-800');
      expect(referralService.getStatusColor('expired')).toBe('bg-gray-100 text-gray-800');
    });

    it('getStatusColor returns fallback for unknown status', () => {
      expect(referralService.getStatusColor('unknown')).toBe('bg-gray-100 text-gray-800');
    });
  });
});
