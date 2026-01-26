import { useState, useCallback } from 'react';
import { apiService, ApiError } from '@/services/api';

/**
 * Equipment interface matching backend entity
 */
export interface Equipment {
  id: string;
  owner_id: string;
  name: string;
  description: string;
  equipment_type_id: string;
  size: string;
  status: string;
  image_urls?: string[];
  city: string;
  is_available: boolean;
  total_rentals: number;
  total_revenue: number;
  daily_rate: number;
  created_at: string;
  updated_at: string;
}

/**
 * Create Equipment DTO
 */
export interface CreateEquipmentDto {
  name: string;
  description: string;
  equipment_type_id: string;
  size: string;
  city: string;
  daily_rate: number;
  image_urls?: string[];
}

/**
 * Update Equipment DTO
 */
export interface UpdateEquipmentDto {
  name?: string;
  description?: string;
  equipment_type_id?: string;
  size?: string;
  city?: string;
  daily_rate?: number;
  image_urls?: string[];
  is_available?: boolean;
  status?: string;
}

/**
 * Query parameters for listing equipment
 */
export interface EquipmentQueryParams {
  page?: number;
  limit?: number;
  city?: string;
  equipment_type_id?: string;
  status?: string;
  is_available?: boolean;
  search?: string;
}

/**
 * Hook return type
 */
interface UseEquipmentReturn {
  // Data
  equipment: Equipment[];
  currentEquipment: Equipment | null;
  
  // Loading states
  loading: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  
  // Error state
  error: string | null;
  
  // Pagination
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  
  // CRUD operations
  fetchEquipment: (params?: EquipmentQueryParams) => Promise<void>;
  fetchEquipmentById: (id: string) => Promise<Equipment | null>;
  createEquipment: (dto: CreateEquipmentDto) => Promise<Equipment>;
  updateEquipment: (id: string, dto: UpdateEquipmentDto) => Promise<Equipment>;
  deleteEquipment: (id: string) => Promise<void>;
  
  // Utility
  clearError: () => void;
  clearCurrentEquipment: () => void;
}

/**
 * Custom hook for Equipment CRUD operations
 * 
 * Encapsulates API calls with loading and error states.
 * 
 * @example
 * ```tsx
 * const { 
 *   equipment, 
 *   loading, 
 *   error, 
 *   fetchEquipment,
 *   createEquipment,
 *   updateEquipment,
 *   deleteEquipment,
 * } = useEquipment();
 * 
 * // Fetch on mount
 * useEffect(() => {
 *   fetchEquipment({ city: 'Riyadh', limit: 10 });
 * }, [fetchEquipment]);
 * 
 * // Create new equipment
 * const handleCreate = async (data: CreateEquipmentDto) => {
 *   try {
 *     const newEquipment = await createEquipment(data);
 *     showSuccess('Equipment created!');
 *   } catch (err) {
 *     showError('Failed to create equipment');
 *   }
 * };
 * ```
 */
export function useEquipment(): UseEquipmentReturn {
  // Data state
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [currentEquipment, setCurrentEquipment] = useState<Equipment | null>(null);
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Error state
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null>(null);

  /**
   * Fetch equipment list with optional filters
   */
  const fetchEquipment = useCallback(async (params?: EquipmentQueryParams) => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams: Record<string, string | number | boolean> = {};
      if (params?.page) queryParams.page = params.page;
      if (params?.limit) queryParams.limit = params.limit;
      if (params?.city) queryParams.city = params.city;
      if (params?.equipment_type_id) queryParams.equipment_type_id = params.equipment_type_id;
      if (params?.status) queryParams.status = params.status;
      if (params?.is_available !== undefined) queryParams.is_available = params.is_available;
      if (params?.search) queryParams.search = params.search;

      const response = await apiService.getPaginated<Equipment>(
        '/v1/equipment',
        queryParams
      );
      
      setEquipment(response.data.data);
      setPagination(response.data.pagination);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to fetch equipment';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch single equipment by ID
   */
  const fetchEquipmentById = useCallback(async (id: string): Promise<Equipment | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.get<Equipment>(`/v1/equipment/${id}`);
      setCurrentEquipment(response.data);
      return response.data;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to fetch equipment';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create new equipment
   */
  const createEquipment = useCallback(async (dto: CreateEquipmentDto): Promise<Equipment> => {
    setCreating(true);
    setError(null);
    
    try {
      const response = await apiService.post<Equipment>('/v1/equipment', dto);
      // Add to list
      setEquipment(prev => [response.data, ...prev]);
      return response.data;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to create equipment';
      setError(message);
      throw err;
    } finally {
      setCreating(false);
    }
  }, []);

  /**
   * Update equipment
   */
  const updateEquipment = useCallback(async (id: string, dto: UpdateEquipmentDto): Promise<Equipment> => {
    setUpdating(true);
    setError(null);
    
    try {
      const response = await apiService.patch<Equipment>(`/v1/equipment/${id}`, dto);
      
      // Update in list
      setEquipment(prev => prev.map(item => 
        item.id === id ? response.data : item
      ));
      
      // Update current if same
      if (currentEquipment?.id === id) {
        setCurrentEquipment(response.data);
      }
      
      return response.data;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to update equipment';
      setError(message);
      throw err;
    } finally {
      setUpdating(false);
    }
  }, [currentEquipment?.id]);

  /**
   * Delete equipment
   */
  const deleteEquipment = useCallback(async (id: string): Promise<void> => {
    setDeleting(true);
    setError(null);
    
    try {
      await apiService.delete(`/v1/equipment/${id}`);
      
      // Remove from list
      setEquipment(prev => prev.filter(item => item.id !== id));
      
      // Clear current if same
      if (currentEquipment?.id === id) {
        setCurrentEquipment(null);
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to delete equipment';
      setError(message);
      throw err;
    } finally {
      setDeleting(false);
    }
  }, [currentEquipment?.id]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Clear current equipment
   */
  const clearCurrentEquipment = useCallback(() => {
    setCurrentEquipment(null);
  }, []);

  return {
    // Data
    equipment,
    currentEquipment,
    
    // Loading states
    loading,
    creating,
    updating,
    deleting,
    
    // Error
    error,
    
    // Pagination
    pagination,
    
    // CRUD
    fetchEquipment,
    fetchEquipmentById,
    createEquipment,
    updateEquipment,
    deleteEquipment,
    
    // Utility
    clearError,
    clearCurrentEquipment,
  };
}
