import { transformKeysToCamelCase, transformKeysToSnakeCase } from '@/lib/caseTransform';

export interface EquipmentAttributeValue {
  typeAttributeId: string;
  value: string;
}

export interface EquipmentFormData {
  name: string;
  description: string;
  equipmentTypeId: string;
  size?: string; // Deprecated: use attributes instead
  city: string;
  status: 'active' | 'inactive' | 'suspended' | 'maintenance' | 'booked' | 'pending' | 'rejected';
  imageUrls: string[];
  dailyRate: number;
  ownerId: string;
  attributes?: EquipmentAttributeValue[];
}

export interface Equipment {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  equipmentTypeId: string;
  size?: string; // Deprecated: use attributes instead
  city: string;
  status: 'active' | 'inactive' | 'suspended' | 'maintenance' | 'booked' | 'pending' | 'rejected';
  imageUrls: string[];
  isAvailable: boolean;
  totalRentals: number;
  totalRevenue: string;
  dailyRate: string;
  createdAt: string;
  updatedAt: string;
  owner?: {
    id: string;
    fullName: string;
    email: string;
  };
  equipmentType?: {
    id: string;
    nameEn: string;
    nameAr: string;
    nameUr?: string;
  };
  attributes?: EquipmentAttributeValue[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3007/api/v1';

export class EquipmentService {
  private baseUrl = API_BASE_URL;

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Transform request body to snake_case if present
    let body = options.body;
    if (body && typeof body === 'string') {
      try {
        const parsed = JSON.parse(body);
        body = JSON.stringify(transformKeysToSnakeCase(parsed));
      } catch {
        // Not JSON, use as-is
      }
    }
    
    const response = await fetch(url, {
      ...options,
      body,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.message || `HTTP error! status: ${response.status}`);
      (error as any).status = response.status;
      (error as any).statusCode = response.status;
      throw error;
    }

    const data = await response.json();
    return transformKeysToCamelCase(data) as T;
  }

  async createEquipment(data: EquipmentFormData): Promise<Equipment> {
    const result = await this.makeRequest<any>('/equipment', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return result.data || result;
  }

  async getEquipment(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    equipmentType?: string;
    isAvailable?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<{ data: Equipment[]; total: number; totalPages: number; page: number; limit: number }> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }

    const result = await this.makeRequest<any>(`/equipment?${queryParams.toString()}`, {
      method: 'GET',
    });
    
    // Handle the updated response structure: { data: [...], pagination: {...}, success: boolean, message: string }
    if (result.data && Array.isArray(result.data)) {
      const pagination = result.pagination || {};
      return {
        data: result.data,
        total: pagination.total || result.data.length,
        totalPages: pagination.totalPages || Math.ceil((pagination.total || result.data.length) / (params?.limit || 10)),
        page: pagination.page || params?.page || 1,
        limit: pagination.limit || params?.limit || 10
      };
    } else if (Array.isArray(result)) {
      // Fallback for direct array response
      return {
        data: result,
        total: result.length,
        totalPages: Math.ceil(result.length / (params?.limit || 10)),
        page: 1,
        limit: params?.limit || 10
      };
    } else {
      // Empty response
      return {
        data: [],
        total: 0,
        totalPages: 1,
        page: 1,
        limit: params?.limit || 10
      };
    }
  }

  async getEquipmentById(id: string): Promise<Equipment | null> {
    try {
      const result = await this.makeRequest<any>(`/equipment/${id}`, {
        method: 'GET',
      });
      return result.data || result;
    } catch (error: any) {
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async updateEquipment(id: string, data: EquipmentFormData): Promise<Equipment> {
    try {
      const result = await this.makeRequest<any>(`/equipment/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return result.data || result;
    } catch (error: any) {
      // Handle specific error cases
      if (error.status === 403) {
        throw new Error('You can only update your own equipment. This equipment belongs to another user.');
      } else if (error.status === 404) {
        throw new Error('Equipment not found. It may have been deleted or moved.');
      } else if (error.status === 401) {
        throw new Error('You are not authorized to perform this action. Please log in again.');
      } else if (error.status === 400) {
        throw new Error(`Validation failed: ${error.message || 'Invalid data provided'}`);
      }
      throw error;
    }
  }

  async deleteEquipment(id: string): Promise<void> {
    try {
      await this.makeRequest<any>(`/equipment/${id}`, {
        method: 'DELETE',
      });
    } catch (error: any) {
      // Handle specific error cases
      if (error.status === 403) {
        throw new Error('You can only delete your own equipment. This equipment belongs to another user.');
      } else if (error.status === 404) {
        throw new Error('Equipment not found. It may have been deleted or moved.');
      } else if (error.status === 401) {
        throw new Error('You are not authorized to perform this action. Please log in again.');
      }
      throw error;
    }
  }
}

export const equipmentService = new EquipmentService(); 