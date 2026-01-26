export interface EquipmentFormData {
  name: string;
  description: string;
  equipment_type_id: string;
  size: string;
  city: string;
  status: 'active' | 'inactive' | 'suspended' | 'maintenance' | 'booked' | 'pending' | 'rejected';
  image_urls: string[];
  daily_rate: number;
  owner_id: string;
}

export interface Equipment {
  id: string;
  owner_id: string;
  name: string;
  description: string;
  equipment_type_id: string;
  size: string;
  city: string;
  status: 'active' | 'inactive' | 'suspended' | 'maintenance' | 'booked' | 'pending' | 'rejected';
  image_urls: string[];
  is_available: boolean;
  total_rentals: number;
  total_revenue: string;
  daily_rate: string;
  created_at: string;
  updated_at: string;
  owner?: {
    id: string;
    full_name: string;
    email: string;
  };
  equipment_type?: {
    id: string;
    name_en: string;
    name_ar: string;
    name_ur?: string;
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3007/api/v1';

export class EquipmentService {
  private baseUrl = API_BASE_URL;

  async createEquipment(data: EquipmentFormData): Promise<Equipment> {
    const response = await fetch(`${this.baseUrl}/equipment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      const error = new Error(errorData.message || 'Failed to create equipment');
      (error as any).status = response.status;
      (error as any).statusCode = response.status;
      throw error;
    }

    return response.json();
  }

  async getEquipment(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    equipment_type?: string;
    is_available?: string;
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

    const response = await fetch(`${this.baseUrl}/equipment?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      const error = new Error(errorData.message || 'Failed to fetch equipment');
      // Add status code to error object for better error handling
      (error as any).status = response.status;
      (error as any).statusCode = response.status;
      throw error;
    }

    const result = await response.json();
    
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
    const response = await fetch(`${this.baseUrl}/equipment/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      const errorData = await response.json();
      const error = new Error(errorData.message || 'Failed to fetch equipment');
      (error as any).status = response.status;
      (error as any).statusCode = response.status;
      throw error;
    }

    const result = await response.json();
    return result.data || result;
  }

  async updateEquipment(id: string, data: EquipmentFormData): Promise<Equipment> {
    const response = await fetch(`${this.baseUrl}/equipment/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      
      // Handle specific error cases
      if (response.status === 403) {
        throw new Error('You can only update your own equipment. This equipment belongs to another user.');
      } else if (response.status === 404) {
        throw new Error('Equipment not found. It may have been deleted or moved.');
      } else if (response.status === 401) {
        throw new Error('You are not authorized to perform this action. Please log in again.');
      } else if (response.status === 400) {
        // Handle validation errors
        const message = Array.isArray(errorData.message) 
          ? errorData.message.join(', ') 
          : errorData.message;
        throw new Error(`Validation failed: ${message || 'Invalid data provided'}`);
      } else {
        throw new Error(errorData.message || 'Failed to update equipment');
      }
    }

    const result = await response.json();
    return result.data || result;
  }

  async deleteEquipment(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/equipment/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      
      // Handle specific error cases
      if (response.status === 403) {
        throw new Error('You can only delete your own equipment. This equipment belongs to another user.');
      } else if (response.status === 404) {
        throw new Error('Equipment not found. It may have been deleted or moved.');
      } else if (response.status === 401) {
        throw new Error('You are not authorized to perform this action. Please log in again.');
      } else {
        throw new Error(errorData.message || 'Failed to delete equipment');
      }
    }
  }
}

export const equipmentService = new EquipmentService(); 