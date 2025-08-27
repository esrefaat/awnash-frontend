import { EquipmentType } from '../types';

// Default equipment types from the HTML file
const defaultEquipmentTypes: EquipmentType[] = [
  {
    id: '1',
    nameAr: 'دبابات',
    nameEn: 'Motor Graders',
    icon: 'https://readdy.ai/api/search-image?query=icon%2C%203D%20rendering%20of%20a%20yellow%20motor%20grader%20construction%20vehicle%2C%20minimalist%20design%2C%20the%20icon%20should%20take%20up%2070%25%20of%20the%20frame%2C%20isolated%20on%20white%20background%2C%20centered%20composition%2C%20soft%20lighting%2C%20subtle%20shadows%2C%20clean%20and%20modern%20look%2C%20single%20object%20focus&width=200&height=200&seq=1&orientation=squarish',
    description: 'Heavy construction motor graders for road construction and maintenance',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    nameAr: 'دينا',
    nameEn: 'Mini Trucks',
    icon: 'https://readdy.ai/api/search-image?query=icon%2C%203D%20rendering%20of%20a%20yellow%20mini%20truck%20with%20cargo%20bed%2C%20minimalist%20design%2C%20the%20icon%20should%20take%20up%2070%25%20of%20the%20frame%2C%20isolated%20on%20white%20background%2C%20centered%20composition%2C%20soft%20lighting%2C%20subtle%20shadows%2C%20clean%20and%20modern%20look%2C%20single%20object%20focus&width=200&height=200&seq=2&orientation=squarish',
    description: 'Small cargo trucks for local deliveries and light construction work',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    nameAr: 'شيول',
    nameEn: 'Wheel Loaders',
    icon: 'https://readdy.ai/api/search-image?query=icon%2C%203D%20rendering%20of%20a%20yellow%20wheel%20loader%20construction%20vehicle%2C%20minimalist%20design%2C%20the%20icon%20should%20take%20up%2070%25%20of%20the%20frame%2C%20isolated%20on%20white%20background%2C%20centered%20composition%2C%20soft%20lighting%2C%20subtle%20shadows%2C%20clean%20and%20modern%20look%2C%20single%20object%20focus&width=200&height=200&seq=3&orientation=squarish',
    description: 'Heavy duty wheel loaders for material handling and construction',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '4',
    nameAr: 'قلابي',
    nameEn: 'Dump Trucks',
    icon: 'https://readdy.ai/api/search-image?query=icon%2C%203D%20rendering%20of%20a%20yellow%20dump%20truck%2C%20minimalist%20design%2C%20the%20icon%20should%20take%20up%2070%25%20of%20the%20frame%2C%20isolated%20on%20white%20background%2C%20centered%20composition%2C%20soft%20lighting%2C%20subtle%20shadows%2C%20clean%20and%20modern%20look%2C%20single%20object%20focus&width=200&height=200&seq=4&orientation=squarish',
    description: 'Heavy duty dump trucks for material transportation',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '5',
    nameAr: 'حفارة',
    nameEn: 'Excavators',
    icon: 'https://readdy.ai/api/search-image?query=icon%2C%203D%20rendering%20of%20a%20yellow%20excavator%20construction%20machine%2C%20minimalist%20design%2C%20the%20icon%20should%20take%20up%2070%25%20of%20the%20frame%2C%20isolated%20on%20white%20background%2C%20centered%20composition%2C%20soft%20lighting%2C%20subtle%20shadows%2C%20clean%20and%20modern%20look%2C%20single%20object%20focus&width=200&height=200&seq=5&orientation=squarish',
    description: 'Heavy construction excavators for digging and earthmoving',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '6',
    nameAr: 'دركتر',
    nameEn: 'Bulldozers',
    icon: 'https://readdy.ai/api/search-image?query=icon%2C%203D%20rendering%20of%20a%20yellow%20bulldozer%20dozer%2C%20minimalist%20design%2C%20the%20icon%20should%20take%20up%2070%25%20of%20the%20frame%2C%20isolated%20on%20white%20background%2C%20centered%20composition%2C%20soft%20lighting%2C%20subtle%20shadows%2C%20clean%20and%20modern%20look%2C%20single%20object%20focus&width=200&height=200&seq=6&orientation=squarish',
    description: 'Heavy bulldozers for land clearing and earthmoving',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '7',
    nameAr: 'الرافعات',
    nameEn: 'Mobile Cranes',
    icon: 'https://readdy.ai/api/search-image?query=icon%2C%203D%20rendering%20of%20a%20yellow%20mobile%20crane%2C%20minimalist%20design%2C%20the%20icon%20should%20take%20up%2070%25%20of%20the%20frame%2C%20isolated%20on%20white%20background%2C%20centered%20composition%2C%20soft%20lighting%2C%20subtle%20shadows%2C%20clean%20and%20modern%20look%2C%20single%20object%20focus&width=200&height=200&seq=7&orientation=squarish',
    description: 'Mobile construction cranes for heavy lifting operations',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '8',
    nameAr: 'ثلاجات',
    nameEn: 'Refrigerated Trucks',
    icon: 'https://readdy.ai/api/search-image?query=icon%2C%203D%20rendering%20of%20a%20yellow%20refrigerated%20truck%2C%20minimalist%20design%2C%20the%20icon%20should%20take%20up%2070%25%20of%20the%20frame%2C%20isolated%20on%20white%20background%2C%20centered%20composition%2C%20soft%20lighting%2C%20subtle%20shadows%2C%20clean%20and%20modern%20look%2C%20single%20object%20focus&width=200&height=200&seq=8&orientation=squarish',
    description: 'Refrigerated transportation trucks for cold storage delivery',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '9',
    nameAr: 'باب كت',
    nameEn: 'Bobcat Skid Steers',
    icon: 'https://readdy.ai/api/search-image?query=icon%2C%203D%20rendering%20of%20a%20yellow%20Bobcat%20skid%20steer%20loader%2C%20minimalist%20design%2C%20the%20icon%20should%20take%20up%2070%25%20of%20the%20frame%2C%20isolated%20on%20white%20background%2C%20centered%20composition%2C%20soft%20lighting%2C%20subtle%20shadows%2C%20clean%20and%20modern%20look%2C%20single%20object%20focus&width=200&height=200&seq=9&orientation=squarish',
    description: 'Compact skid steer loaders for tight space construction work',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '10',
    nameAr: 'لوبي (سطحة معدات)',
    nameEn: 'Flatbed Haulers',
    icon: 'https://readdy.ai/api/search-image?query=icon%2C%203D%20rendering%20of%20a%20yellow%20flatbed%20hauler%20truck%2C%20minimalist%20design%2C%20the%20icon%20should%20take%20up%2070%25%20of%20the%20frame%2C%20isolated%20on%20white%20background%2C%20centered%20composition%2C%20soft%20lighting%2C%20subtle%20shadows%2C%20clean%20and%20modern%20look%2C%20single%20object%20focus&width=200&height=200&seq=10&orientation=squarish',
    description: 'Flatbed trucks for equipment transportation',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '11',
    nameAr: 'حفار',
    nameEn: 'Drilling Rigs',
    icon: 'https://readdy.ai/api/search-image?query=icon%2C%203D%20rendering%20of%20a%20yellow%20drilling%20rig%2C%20minimalist%20design%2C%20the%20icon%20should%20take%20up%2070%25%20of%20the%20frame%2C%20isolated%20on%20white%20background%2C%20centered%20composition%2C%20soft%20lighting%2C%20subtle%20shadows%2C%20clean%20and%20modern%20look%2C%20single%20object%20focus&width=200&height=200&seq=11&orientation=squarish',
    description: 'Heavy drilling equipment for foundation and well drilling',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '12',
    nameAr: 'السقالات',
    nameEn: 'Scaffolding Systems',
    icon: 'https://readdy.ai/api/search-image?query=icon%2C%203D%20rendering%20of%20a%20yellow%20construction%20scaffolding%20system%2C%20minimalist%20design%2C%20the%20icon%20should%20take%20up%2070%25%20of%20the%20frame%2C%20isolated%20on%20white%20background%2C%20centered%20composition%2C%20soft%20lighting%2C%20subtle%20shadows%2C%20clean%20and%20modern%20look%2C%20single%20object%20focus&width=200&height=200&seq=12&orientation=squarish',
    description: 'Construction scaffolding systems for building work',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '13',
    nameAr: 'الرافعة الشوكية',
    nameEn: 'Forklifts',
    icon: 'https://readdy.ai/api/search-image?query=icon%2C%203D%20rendering%20of%20a%20yellow%20forklift%2C%20minimalist%20design%2C%20the%20icon%20should%20take%20up%2070%25%20of%20the%20frame%2C%20isolated%20on%20white%20background%2C%20centered%20composition%2C%20soft%20lighting%2C%20subtle%20shadows%2C%20clean%20and%20modern%20look%2C%20single%20object%20focus&width=200&height=200&seq=13&orientation=squarish',
    description: 'Industrial forklifts for material handling and warehouse operations',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '14',
    nameAr: 'الباصات',
    nameEn: 'Buses',
    icon: 'https://readdy.ai/api/search-image?query=icon%2C%203D%20rendering%20of%20a%20yellow%20luxury%20bus%2C%20minimalist%20design%2C%20the%20icon%20should%20take%20up%2070%25%20of%20the%20frame%2C%20isolated%20on%20white%20background%2C%20centered%20composition%2C%20soft%20lighting%2C%20subtle%20shadows%2C%20clean%20and%20modern%20look%2C%20single%20object%20focus&width=200&height=200&seq=14&orientation=squarish',
    description: 'Passenger and luxury buses for transportation services',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

class EquipmentTypeService {
  private apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  async getAll(): Promise<EquipmentType[]> {
    try {
      const response = await fetch(`${this.apiUrl}/api/equipment-types`);
      if (!response.ok) {
        // Return default types if API is not available
        return defaultEquipmentTypes;
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching equipment types:', error);
      return defaultEquipmentTypes;
    }
  }

  async getById(id: string): Promise<EquipmentType | null> {
    try {
      const response = await fetch(`${this.apiUrl}/api/equipment-types/${id}`);
      if (!response.ok) {
        return defaultEquipmentTypes.find(type => type.id === id) || null;
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching equipment type:', error);
      return defaultEquipmentTypes.find(type => type.id === id) || null;
    }
  }

  async create(equipmentType: Omit<EquipmentType, 'id' | 'createdAt' | 'updatedAt'>): Promise<EquipmentType> {
    try {
      const response = await fetch(`${this.apiUrl}/api/equipment-types`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(equipmentType),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create equipment type');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating equipment type:', error);
      throw error;
    }
  }

  async update(id: string, equipmentType: Partial<EquipmentType>): Promise<EquipmentType> {
    try {
      const response = await fetch(`${this.apiUrl}/api/equipment-types/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(equipmentType),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update equipment type');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating equipment type:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/api/equipment-types/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete equipment type');
      }
    } catch (error) {
      console.error('Error deleting equipment type:', error);
      throw error;
    }
  }

  async toggleStatus(id: string): Promise<EquipmentType> {
    try {
      const response = await fetch(`${this.apiUrl}/api/equipment-types/${id}/toggle-status`, {
        method: 'PATCH',
      });
      
      if (!response.ok) {
        throw new Error('Failed to toggle equipment type status');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error toggling equipment type status:', error);
      throw error;
    }
  }
}

export const equipmentTypeService = new EquipmentTypeService(); 