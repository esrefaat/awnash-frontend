import { DashboardStats, Booking, AuditLog } from '../types';
import { apiService, ApiResponse } from './api';

// Mock data for development
const mockDashboardStats: DashboardStats = {
  totalUsers: 1247,
  totalEquipment: 856,
  totalBookings: 2341,
  pendingModeration: 23,
  revenue: 45670.25,
  revenueGrowth: 12.5
};

const mockRecentBookings: Booking[] = [
  {
    id: '1',
    equipmentId: '1',
    equipmentTitle: 'Professional DSLR Camera',
    renterId: '2',
    renterName: 'Sarah Smith',
    ownerId: '1',
    ownerName: 'John Doe',
    startDate: '2024-01-25T09:00:00Z',
    endDate: '2024-01-27T18:00:00Z',
    totalAmount: 300,
    status: 'confirmed',
    createdAt: '2024-01-20T14:30:00Z'
  },
  {
    id: '2',
    equipmentId: '2',
    equipmentTitle: 'Construction Drill Set',
    renterId: '3',
    renterName: 'Mike Johnson',
    ownerId: '2',
    ownerName: 'Sarah Smith',
    startDate: '2024-01-24T08:00:00Z',
    endDate: '2024-01-24T17:00:00Z',
    totalAmount: 75,
    status: 'pending',
    createdAt: '2024-01-22T10:15:00Z'
  }
];

const mockAuditLogs: AuditLog[] = [
  {
    id: '1',
    userId: 'admin-1',
    userName: 'Admin User',
    action: 'APPROVE_EQUIPMENT',
    resource: 'equipment',
    resourceId: '1',
    details: { previousStatus: 'pending', newStatus: 'approved' },
    timestamp: '2024-01-20T16:45:00Z',
    ipAddress: '192.168.1.100'
  },
  {
    id: '2',
    userId: 'admin-1',
    userName: 'Admin User',
    action: 'UPDATE_USER_STATUS',
    resource: 'user',
    resourceId: '3',
    details: { previousStatus: 'pending', newStatus: 'active' },
    timestamp: '2024-01-20T15:30:00Z',
    ipAddress: '192.168.1.100'
  },
  {
    id: '3',
    userId: 'admin-1',
    userName: 'Admin User',
    action: 'DELETE_EQUIPMENT',
    resource: 'equipment',
    resourceId: '5',
    details: { reason: 'Violates terms of service' },
    timestamp: '2024-01-20T14:20:00Z',
    ipAddress: '192.168.1.100'
  }
];

class DashboardService {
  private useMockData = process.env.NODE_ENV === 'development';

  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    if (this.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return {
        data: mockDashboardStats,
        success: true,
        message: 'Dashboard stats retrieved successfully'
      };
    }

    return apiService.get<DashboardStats>('/dashboard/stats');
  }

  async getRecentBookings(limit: number = 5): Promise<ApiResponse<Booking[]>> {
    if (this.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 400));
      return {
        data: mockRecentBookings.slice(0, limit),
        success: true,
        message: 'Recent bookings retrieved successfully'
      };
    }

    return apiService.get<Booking[]>(`/dashboard/recent-bookings?limit=${limit}`);
  }

  async getRecentAuditLogs(limit: number = 5): Promise<ApiResponse<AuditLog[]>> {
    if (this.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 350));
      return {
        data: mockAuditLogs.slice(0, limit),
        success: true,
        message: 'Recent audit logs retrieved successfully'
      };
    }

    return apiService.get<AuditLog[]>(`/dashboard/recent-audit-logs?limit=${limit}`);
  }

  async getRevenueData(period: 'week' | 'month' | 'year' = 'month'): Promise<ApiResponse<any[]>> {
    if (this.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate mock revenue data based on period
      const generateMockData = () => {
        switch (period) {
          case 'week':
            return Array.from({ length: 7 }, (_, i) => ({
              date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              revenue: Math.floor(Math.random() * 2000) + 500
            }));
          case 'month':
            return Array.from({ length: 30 }, (_, i) => ({
              date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              revenue: Math.floor(Math.random() * 3000) + 1000
            }));
          case 'year':
            return Array.from({ length: 12 }, (_, i) => ({
              month: new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'short' }),
              revenue: Math.floor(Math.random() * 50000) + 20000
            }));
          default:
            return [];
        }
      };

      return {
        data: generateMockData(),
        success: true,
        message: `Revenue data for ${period} retrieved successfully`
      };
    }

    return apiService.get<any[]>(`/dashboard/revenue?period=${period}`);
  }

  async getUserGrowthData(period: 'month' | 'year' = 'month'): Promise<ApiResponse<any[]>> {
    if (this.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const generateMockData = () => {
        if (period === 'month') {
          return Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            newUsers: Math.floor(Math.random() * 50) + 10
          }));
        } else {
          return Array.from({ length: 12 }, (_, i) => ({
            month: new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'short' }),
            newUsers: Math.floor(Math.random() * 1000) + 200
          }));
        }
      };

      return {
        data: generateMockData(),
        success: true,
        message: `User growth data for ${period} retrieved successfully`
      };
    }

    return apiService.get<any[]>(`/dashboard/user-growth?period=${period}`);
  }

  async getEquipmentCategories(): Promise<ApiResponse<any[]>> {
    if (this.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const categories = [
        { name: 'Photography', count: 145, percentage: 25 },
        { name: 'Construction', count: 123, percentage: 21 },
        { name: 'Audio/Visual', count: 98, percentage: 17 },
        { name: 'Sports', count: 87, percentage: 15 },
        { name: 'Automotive', count: 65, percentage: 11 },
        { name: 'Other', count: 64, percentage: 11 }
      ];

      return {
        data: categories,
        success: true,
        message: 'Equipment categories retrieved successfully'
      };
    }

    return apiService.get<any[]>('/dashboard/equipment-categories');
  }

  async getSystemHealth(): Promise<ApiResponse<any>> {
    if (this.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const health = {
        status: 'healthy',
        uptime: '15 days, 4 hours',
        responseTime: '145ms',
        memory: { used: '2.1GB', total: '8GB', percentage: 26 },
        cpu: { usage: '12%' },
        database: { status: 'connected', responseTime: '5ms' },
        storage: { used: '45GB', total: '500GB', percentage: 9 }
      };

      return {
        data: health,
        success: true,
        message: 'System health retrieved successfully'
      };
    }

    return apiService.get<any>('/dashboard/system-health');
  }
}

export const dashboardService = new DashboardService(); 