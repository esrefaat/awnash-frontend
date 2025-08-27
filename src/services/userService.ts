import { User } from '../types';
import { apiService, ApiResponse, PaginatedResponse } from './api';

// Mock data for development
const mockUsers: User[] = [
  {
    id: '1',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'owner',
    status: 'active',
    createdAt: '2024-01-15T10:30:00Z',
    lastLogin: '2024-01-20T14:22:00Z',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
  },
  {
    id: '2',
    email: 'sarah.smith@example.com',
    firstName: 'Sarah',
    lastName: 'Smith',
    role: 'renter',
    status: 'active',
    createdAt: '2024-01-10T09:15:00Z',
    lastLogin: '2024-01-19T16:45:00Z',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face'
  },
  {
    id: '3',
    email: 'mike.johnson@example.com',
    firstName: 'Mike',
    lastName: 'Johnson',
    role: 'owner',
    status: 'pending',
    createdAt: '2024-01-18T11:20:00Z',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
  }
];

class UserService {
  private useMockData = false; // Disabled to use real API

  async getUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
    status?: string;
    search?: string;
  }): Promise<ApiResponse<PaginatedResponse<User>>> {
    if (this.useMockData) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let filteredUsers = [...mockUsers];
      
      // Apply filters
      if (params?.role) {
        filteredUsers = filteredUsers.filter(user => user.role === params.role);
      }
      if (params?.status) {
        filteredUsers = filteredUsers.filter(user => user.status === params.status);
      }
      if (params?.search) {
        const searchLower = params.search.toLowerCase();
        filteredUsers = filteredUsers.filter(user => 
          user.firstName.toLowerCase().includes(searchLower) ||
          user.lastName.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
        );
      }

      const page = params?.page || 1;
      const limit = params?.limit || 10;
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedUsers = filteredUsers.slice(start, end);

      return {
        data: {
          data: paginatedUsers,
          pagination: {
            page,
            limit,
            total: filteredUsers.length,
            totalPages: Math.ceil(filteredUsers.length / limit)
          }
        },
        success: true,
        message: 'Users retrieved successfully'
      };
    }

    return apiService.getPaginated<User>('/users', params);
  }

  async getUserById(id: string): Promise<ApiResponse<User>> {
    if (this.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const user = mockUsers.find(u => u.id === id);
      if (!user) {
        throw new Error('User not found');
      }
      return {
        data: user,
        success: true,
        message: 'User retrieved successfully'
      };
    }

    return apiService.get<User>(`/users/${id}`);
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<ApiResponse<User>> {
    if (this.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const newUser: User = {
        ...userData,
        id: (mockUsers.length + 1).toString(),
        createdAt: new Date().toISOString()
      };
      mockUsers.push(newUser);
      return {
        data: newUser,
        success: true,
        message: 'User created successfully'
      };
    }

    return apiService.post<User>('/users', userData);
  }

  async updateUser(id: string, userData: Partial<User>): Promise<ApiResponse<User>> {
    if (this.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const userIndex = mockUsers.findIndex(u => u.id === id);
      if (userIndex === -1) {
        throw new Error('User not found');
      }
      mockUsers[userIndex] = { ...mockUsers[userIndex], ...userData };
      return {
        data: mockUsers[userIndex],
        success: true,
        message: 'User updated successfully'
      };
    }

    return apiService.put<User>(`/users/${id}`, userData);
  }

  async deleteUser(id: string): Promise<ApiResponse<void>> {
    if (this.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const userIndex = mockUsers.findIndex(u => u.id === id);
      if (userIndex === -1) {
        throw new Error('User not found');
      }
      mockUsers.splice(userIndex, 1);
      return {
        data: undefined,
        success: true,
        message: 'User deleted successfully'
      };
    }

    return apiService.delete<void>(`/users/${id}`);
  }

  async updateUserStatus(id: string, status: User['status']): Promise<ApiResponse<User>> {
    return this.updateUser(id, { status });
  }

  async bulkUpdateUsers(userIds: string[], updates: Partial<User>): Promise<ApiResponse<User[]>> {
    if (this.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 700));
      const updatedUsers: User[] = [];
      
      userIds.forEach(id => {
        const userIndex = mockUsers.findIndex(u => u.id === id);
        if (userIndex !== -1) {
          mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates };
          updatedUsers.push(mockUsers[userIndex]);
        }
      });

      return {
        data: updatedUsers,
        success: true,
        message: `${updatedUsers.length} users updated successfully`
      };
    }

    return apiService.put<User[]>('/users/bulk', { userIds, updates });
  }
}

export const userService = new UserService(); 