jest.mock('./api', () => ({
  apiService: { get: jest.fn() },
  ApiResponse: {},
}));

import { dashboardService } from './dashboardService';
import { apiService } from './api';

const mockGet = apiService.get as jest.Mock;

beforeEach(() => {
  mockGet.mockReset();
});

describe('dashboardService', () => {
  describe('getDashboardStats', () => {
    it('calls apiService.get with correct URL', async () => {
      mockGet.mockResolvedValue({ data: { totalUsers: 10 }, success: true });

      const result = await dashboardService.getDashboardStats();

      expect(mockGet).toHaveBeenCalledWith('/dashboard/stats');
      expect(result.data.totalUsers).toBe(10);
    });
  });

  describe('getRecentBookings', () => {
    it('passes limit parameter', async () => {
      mockGet.mockResolvedValue({ data: [], success: true });

      await dashboardService.getRecentBookings(3);

      expect(mockGet).toHaveBeenCalledWith('/dashboard/recent-bookings?limit=3');
    });

    it('defaults limit to 5', async () => {
      mockGet.mockResolvedValue({ data: [], success: true });

      await dashboardService.getRecentBookings();

      expect(mockGet).toHaveBeenCalledWith('/dashboard/recent-bookings?limit=5');
    });
  });

  describe('getRecentAuditLogs', () => {
    it('passes limit parameter', async () => {
      mockGet.mockResolvedValue({ data: [], success: true });

      await dashboardService.getRecentAuditLogs(10);

      expect(mockGet).toHaveBeenCalledWith('/dashboard/recent-audit-logs?limit=10');
    });
  });

  describe('getRevenueData', () => {
    it('passes period parameter', async () => {
      mockGet.mockResolvedValue({ data: [], success: true });

      await dashboardService.getRevenueData('week');

      expect(mockGet).toHaveBeenCalledWith('/dashboard/revenue?period=week');
    });

    it('defaults period to month', async () => {
      mockGet.mockResolvedValue({ data: [], success: true });

      await dashboardService.getRevenueData();

      expect(mockGet).toHaveBeenCalledWith('/dashboard/revenue?period=month');
    });
  });

  describe('getUserGrowthData', () => {
    it('passes period parameter', async () => {
      mockGet.mockResolvedValue({ data: [], success: true });

      await dashboardService.getUserGrowthData('year');

      expect(mockGet).toHaveBeenCalledWith('/dashboard/user-growth?period=year');
    });
  });

  describe('getEquipmentCategories', () => {
    it('calls correct endpoint', async () => {
      mockGet.mockResolvedValue({ data: [], success: true });

      await dashboardService.getEquipmentCategories();

      expect(mockGet).toHaveBeenCalledWith('/dashboard/equipment-categories');
    });
  });

  describe('getSystemHealth', () => {
    it('calls correct endpoint', async () => {
      mockGet.mockResolvedValue({ data: { status: 'healthy' }, success: true });

      const result = await dashboardService.getSystemHealth();

      expect(mockGet).toHaveBeenCalledWith('/dashboard/system-health');
      expect(result.data.status).toBe('healthy');
    });
  });
});
