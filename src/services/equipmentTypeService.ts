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

export interface EquipmentType {
  id: string;
  nameEn: string;
  nameAr: string;
  nameUr?: string;
  category: string;
  locationMode: 'single' | 'from_to' | 'none';
  attributes: EquipmentTypeAttribute[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateEquipmentTypeData {
  nameEn: string;
  nameAr: string;
  nameUr?: string;
  category: string;
  locationMode: 'single' | 'from_to' | 'none';
  attributes?: {
    label: string;
    unit?: string;
    isRequired?: boolean;
    options?: { value: string }[];
  }[];
}

export interface UpdateEquipmentTypeData extends Partial<CreateEquipmentTypeData> {}

export interface EquipmentTypesResponse {
  data: EquipmentType[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface EquipmentTypeQueryParams {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
}

class EquipmentTypeService {
  private readonly baseUrl = '/equipment-types';

  async getAll(params?: EquipmentTypeQueryParams): Promise<EquipmentTypesResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.search) queryParams.append('search', params.search);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const url = `${this.baseUrl}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiService.get<EquipmentTypesResponse>(url);
    return response.data;
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

  async getCategories(): Promise<string[]> {
    const response = await apiService.get<string[]>(`${this.baseUrl}/categories`);
    return response.data;
  }

  async getByCategory(category: string): Promise<EquipmentType[]> {
    const response = await apiService.get<EquipmentType[]>(`${this.baseUrl}/category/${category}`);
    return response.data;
  }
}

export const equipmentTypeService = new EquipmentTypeService();

