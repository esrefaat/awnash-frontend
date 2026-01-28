// API Configuration  
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3007/api/v1';

export interface User {
  id: string;
  fullName: string;
  mobileNumber: string;
  email?: string;
  role: string;
  roles: string[];
  permissions: string[];
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  city?: string;
  totalBookings?: number;
  totalEquipment?: number;
  isSuperAdmin?: boolean;
}

export interface CreateUserData {
  fullName: string;
  mobileNumber: string;
  email?: string;
  role: string;
  isActive?: boolean;
  password?: string;
}

export interface UpdateUserData {
  fullName?: string;
  mobileNumber?: string;
  email?: string;
  role?: string;
  isActive?: boolean;
  city?: string;
}

export interface UserFilters {
  search?: string;
  role?: string;
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

class UsersService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const response = await fetch(url, { ...defaultOptions, ...options });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Get all users with filters and pagination
  async getAllUsers(filters: UserFilters = {}): Promise<UsersResponse> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.role && filters.role !== 'all') params.append('role', filters.role);
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const queryString = params.toString();
    const endpoint = `/users${queryString ? `?${queryString}` : ''}`;
    
    const response = await this.makeRequest<{
      users: any[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(endpoint);

    // The users API returns data directly, not nested in a data object
    return {
      users: response.users.map(user => ({
        ...user,
        roles: [user.role], // Convert single role to array
        permissions: [], // Default empty permissions array (would need RBAC integration)
        isActive: user.isVerified, // Use isVerified as proxy for isActive
      })),
      total: response.total,
      page: response.page,
      limit: response.limit,
      totalPages: response.totalPages,
    };
  }

  // Get user by ID
  async getUserById(userId: string): Promise<User> {
    const response = await this.makeRequest<any>(`/users/${userId}`);

    // Transform the backend response to match the expected frontend interface
    return {
      ...response,
      roles: [response.role],
      permissions: [],
      isActive: response.isVerified,
    };
  }

  // Create new user
  async createUser(userData: CreateUserData): Promise<User> {
    const response = await this.makeRequest<any>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    return {
      ...response,
      roles: [response.role],
      permissions: [],
      isActive: response.isVerified,
    };
  }

  // Update user
  async updateUser(userId: string, userData: UpdateUserData): Promise<User> {
    const response = await this.makeRequest<any>(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });

    return {
      ...response,
      roles: [response.role],
      permissions: [],
      isActive: response.isVerified,
    };
  }

  // Delete user
  async deleteUser(userId: string): Promise<void> {
    return this.makeRequest<void>(`/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // Toggle user status (activate/deactivate)
  async toggleUserStatus(userId: string): Promise<User> {
    const response = await this.makeRequest<any>(`/users/${userId}/toggle-status`, {
      method: 'PATCH',
    });

    // Backend returns user data directly, not wrapped
    return {
      ...response,
      roles: [response.role],
      permissions: [],
      isActive: response.isVerified,
    };
  }

  // Bulk operations
  async bulkUpdateUsers(userIds: string[], action: 'activate' | 'deactivate' | 'delete'): Promise<void> {
    return this.makeRequest<void>('/users/bulk', {
      method: 'PATCH',
      body: JSON.stringify({ userIds, action }),
    });
  }

  // Update user roles
  async updateUserRoles(userId: string, roleIds: string[]): Promise<User> {
    const response = await this.makeRequest<{
      data: any;
      success: boolean;
      message: string;
    }>(`/users/${userId}/roles`, {
      method: 'PATCH',
      body: JSON.stringify({ roleIds }),
    });

    return {
      ...response.data,
      roles: [response.data.role],
      permissions: [],
      isActive: response.data.isVerified,
    };
  }

  // Get user statistics
  async getUserStats(): Promise<{
    total: number;
    active: number;
    verified: number;
    admins: number;
    owners: number;
    renters: number;
    hybrid: number;
  }> {
    const response = await this.makeRequest<{
      data: {
        total: number;
        active: number;
        verified: number;
        admins: number;
        owners: number;
        renters: number;
        hybrid: number;
      };
      success: boolean;
      message: string;
    }>('/users/stats');

    // Return the data portion of the response
    return response.data;
  }

  // Send user invitation
  async sendUserInvitation(userData: CreateUserData): Promise<User> {
    const response = await this.makeRequest<{
      data: any;
      success: boolean;
      message: string;
    }>('/users/invite', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    return {
      ...response.data,
      roles: [response.data.role],
      permissions: [],
      isActive: response.data.isVerified,
    };
  }

  // Reset user password
  async resetUserPassword(userId: string, newPassword?: string): Promise<{ temporaryPassword?: string }> {
    return this.makeRequest<{ temporaryPassword?: string }>(`/users/${userId}/reset-password`, {
      method: 'PATCH',
      body: JSON.stringify({ newPassword }),
    });
  }

  // Update user permissions override
  async updateUserPermissions(userId: string, permissions: Record<string, boolean>): Promise<User> {
    const response = await this.makeRequest<{
      data: any;
      success: boolean;
      message: string;
    }>(`/users/${userId}/permissions`, {
      method: 'PATCH',
      body: JSON.stringify({ permissions }),
    });

    return {
      ...response.data,
      roles: [response.data.role],
      permissions: [],
      isActive: response.data.isVerified,
    };
  }

  // Export users data
  async exportUsers(filters: UserFilters = {}): Promise<Blob> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.role && filters.role !== 'all') params.append('role', filters.role);
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);

    const queryString = params.toString();
    const endpoint = `/users/export${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.status}`);
    }

    return response.blob();
  }
}

export const usersService = new UsersService(); 