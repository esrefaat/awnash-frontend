import { apiService } from './api';

export interface EquipmentTypeAttributeOption {
  id?: string;
  value: string;
}

export interface EquipmentTypeAttribute {
  id: string;
  label: string;
  unit?: string;
  isRequired: boolean;
  options: EquipmentTypeAttributeOption[];
}

export interface EquipmentCategory {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  nameUr?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EquipmentTypeMarketName {
  id: string;
  equipmentTypeId: string;
  marketCode: string;
  nameEn?: string;
  nameAr?: string;
  nameUr?: string;
  displayOrder?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SupportEquipmentRequirement {
  id?: string;
  equipmentTypeId?: string;
  supportEquipmentTypeId: string;
  supportEquipmentType?: EquipmentType;
  quantity: number;
  isRequired: boolean;
  displayOrder?: number;
}

export interface EquipmentType {
  id: string;
  nameEn: string;
  nameAr: string;
  nameUr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  descriptionUr?: string;
  categoryId: string;
  equipmentCategory?: EquipmentCategory;
  locationMode: 'single' | 'from_to' | 'none';
  serviceMode: 'standard' | 'on_demand';
  requiresTransport?: boolean;
  requiresSupportEquipment?: boolean;
  supportRequirements?: SupportEquipmentRequirement[];
  sizeTypeKey?: string;
  sizeUnit?: string;
  imageUrl?: string;
  displayOrder: number;
  isActive: boolean;
  attributes: EquipmentTypeAttribute[];
  marketNames?: EquipmentTypeMarketName[];
  marketName?: EquipmentTypeMarketName; // Single market name (from query with market param)
  createdAt: string;
  updatedAt: string;
}

export interface CreateEquipmentTypeData {
  nameEn: string;
  nameAr: string;
  nameUr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  descriptionUr?: string;
  categoryId: string;
  locationMode: 'single' | 'from_to' | 'none';
  serviceMode?: 'standard' | 'on_demand';
  requiresTransport?: boolean;
  requiresSupportEquipment?: boolean;
  supportRequirements?: {
    supportEquipmentTypeId: string;
    quantity: number;
    isRequired?: boolean;
    displayOrder?: number;
  }[];
  sizeTypeKey?: string;
  sizeUnit?: string;
  imageUrl?: string;
  displayOrder?: number;
  isActive?: boolean;
  attributes?: {
    label: string;
    unit?: string;
    isRequired?: boolean;
    options?: { value: string }[];
  }[];
}

export interface UpdateEquipmentTypeData extends Partial<CreateEquipmentTypeData> {}

export interface MarketNameData {
  nameEn?: string | null;
  nameAr?: string | null;
  nameUr?: string | null;
  displayOrder?: number;
}

export interface EquipmentTypesResponse {
  data: EquipmentType[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface EquipmentTypeQueryParams {
  search?: string;
  categoryId?: string;
  page?: number;
  limit?: number;
}

class EquipmentTypeService {
  private readonly baseUrl = '/equipment-types';

  async getAll(params?: EquipmentTypeQueryParams): Promise<EquipmentTypesResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.search) queryParams.append('search', params.search);
    if (params?.categoryId) queryParams.append('categoryId', params.categoryId);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const url = `${this.baseUrl}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiService.get<EquipmentTypesResponse>(url);
    // Backend returns { data: [...], total, page, limit, totalPages } directly
    return response as unknown as EquipmentTypesResponse;
  }

  async getById(id: string): Promise<EquipmentType> {
    const response = await apiService.get<EquipmentType>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async create(data: CreateEquipmentTypeData): Promise<EquipmentType> {
    const response = await apiService.post<EquipmentType>(this.baseUrl, data);
    return response.data;
  }

  async update(id: string, data: UpdateEquipmentTypeData): Promise<EquipmentType> {
    const response = await apiService.patch<EquipmentType>(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await apiService.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Get all categories from the categories table
   */
  async getCategories(): Promise<EquipmentCategory[]> {
    const response = await apiService.get<EquipmentCategory[]>(`${this.baseUrl}/categories`);
    return response.data;
  }

  /**
   * Get all categories including inactive (admin only)
   */
  async getAllCategories(): Promise<EquipmentCategory[]> {
    const response = await apiService.get<EquipmentCategory[]>(`${this.baseUrl}/categories/all`);
    // Backend returns array directly, not wrapped in { data: [...] }
    return Array.isArray(response) ? response : (response.data || []);
  }

  /**
   * Update a category
   */
  async updateCategory(id: string, data: Partial<EquipmentCategory>): Promise<EquipmentCategory> {
    const response = await apiService.patch<EquipmentCategory>(`${this.baseUrl}/categories/${id}`, data);
    return response.data;
  }

  /**
   * Bulk update display order for categories
   */
  async updateCategoryDisplayOrder(updates: { id: string; displayOrder: number }[]): Promise<void> {
    await apiService.put(`${this.baseUrl}/categories/reorder`, updates);
  }

  async getByCategorySlug(slug: string): Promise<EquipmentType[]> {
    const response = await apiService.get<EquipmentType[]>(`${this.baseUrl}/category/${slug}`);
    return response.data;
  }

  /**
   * Get equipment types with market-specific names
   */
  async getAllWithMarketNames(marketCode: string, params?: EquipmentTypeQueryParams): Promise<EquipmentTypesResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.search) queryParams.append('search', params.search);
    if (params?.categoryId) queryParams.append('categoryId', params.categoryId);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const url = `${this.baseUrl}/market/${marketCode}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiService.get<EquipmentTypesResponse>(url);
    // Backend returns { data: [...], total, page, limit, totalPages } directly
    // apiService.get returns the parsed JSON, so response IS the EquipmentTypesResponse
    return response as unknown as EquipmentTypesResponse;
  }

  /**
   * Toggle equipment type active status
   */
  async toggleActive(id: string): Promise<EquipmentType> {
    const response = await apiService.put<EquipmentType>(`${this.baseUrl}/${id}/toggle-active`, {});
    return response.data;
  }

  /**
   * Update display order for multiple equipment types
   */
  async updateDisplayOrder(updates: { id: string; displayOrder: number }[]): Promise<void> {
    await apiService.put(`${this.baseUrl}/reorder`, updates);
  }

  /**
   * Get all market names for an equipment type
   */
  async getMarketNames(equipmentTypeId: string): Promise<EquipmentTypeMarketName[]> {
    const response = await apiService.get<EquipmentTypeMarketName[]>(`${this.baseUrl}/${equipmentTypeId}/market-names`);
    return response.data;
  }

  /**
   * Get market name for a specific market
   */
  async getMarketName(equipmentTypeId: string, marketCode: string): Promise<EquipmentTypeMarketName | null> {
    const response = await apiService.get<EquipmentTypeMarketName>(`${this.baseUrl}/${equipmentTypeId}/market-names/${marketCode}`);
    return response.data;
  }

  /**
   * Create or update market name
   */
  async upsertMarketName(equipmentTypeId: string, marketCode: string, data: MarketNameData): Promise<EquipmentTypeMarketName> {
    const response = await apiService.put<EquipmentTypeMarketName>(`${this.baseUrl}/${equipmentTypeId}/market-names/${marketCode}`, data);
    return response.data;
  }

  /**
   * Delete market name
   */
  async deleteMarketName(equipmentTypeId: string, marketCode: string): Promise<void> {
    await apiService.delete(`${this.baseUrl}/${equipmentTypeId}/market-names/${marketCode}`);
  }

  /**
   * Bulk update market names for a specific market
   */
  async bulkUpdateMarketNames(
    marketCode: string,
    updates: { equipmentTypeId: string; nameEn?: string; nameAr?: string; nameUr?: string; displayOrder?: number }[]
  ): Promise<void> {
    await apiService.put(`${this.baseUrl}/market-names/${marketCode}/bulk`, updates);
  }

  /**
   * Get equipment types that can be used as support equipment.
   * Excludes the given equipment type and types that would create circular dependencies.
   */
  async getAvailableSupportEquipmentTypes(equipmentTypeId?: string): Promise<EquipmentType[]> {
    const queryParams = new URLSearchParams();
    if (equipmentTypeId) {
      queryParams.append('equipmentTypeId', equipmentTypeId);
    }
    const url = `${this.baseUrl}/support-equipment/available${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiService.get<EquipmentType[]>(url);
    return Array.isArray(response) ? response : (response.data || []);
  }

  /**
   * Get support requirements for a specific equipment type
   */
  async getSupportRequirements(equipmentTypeId: string): Promise<SupportEquipmentRequirement[]> {
    const response = await apiService.get<SupportEquipmentRequirement[]>(`${this.baseUrl}/${equipmentTypeId}/support-requirements`);
    return Array.isArray(response) ? response : (response.data || []);
  }
}

export const equipmentTypeService = new EquipmentTypeService();

