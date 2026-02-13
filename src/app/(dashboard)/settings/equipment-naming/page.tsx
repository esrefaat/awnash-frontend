'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Edit2,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Save,
  Filter,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  equipmentTypeService,
  EquipmentType,
  EquipmentCategory,
  EquipmentTypeMarketName,
  MarketNameData,
} from '@/services/equipmentTypeService';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Toggle } from '@/components/ui/Toggle';
import { Badge } from '@/components/ui/Badge';

// Market codes for dropdown
const MARKETS = [
  { code: 'SA', name: 'Saudi Arabia', nameAr: 'السعودية' },
  { code: 'AE', name: 'UAE', nameAr: 'الإمارات' },
  { code: 'PK', name: 'Pakistan', nameAr: 'باكستان' },
];

interface EditableMarketName {
  nameEn: string;
  nameAr: string;
  nameUr: string;
  displayOrder: number | null;
}

interface EditingRow {
  id: string;
  marketName: EditableMarketName;
}

export default function EquipmentNamingPage() {
  // State
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([]);
  const [categories, setCategories] = useState<EquipmentCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedMarket, setSelectedMarket] = useState<string>('SA');

  // Editing state
  const [editingRow, setEditingRow] = useState<EditingRow | null>(null);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [typesResponse, categoriesResponse] = await Promise.all([
        equipmentTypeService.getAllWithMarketNames(selectedMarket, {
          search: search || undefined,
          category: selectedCategory || undefined,
          limit: 100,
        }),
        equipmentTypeService.getAllCategories(),
      ]);

      setEquipmentTypes(typesResponse.data || []);
      setCategories(categoriesResponse || []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load equipment types');
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, selectedMarket]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Start editing a row
  const startEditing = (type: EquipmentType) => {
    const marketName = type.marketName;
    setEditingRow({
      id: type.id,
      marketName: {
        nameEn: marketName?.nameEn || '',
        nameAr: marketName?.nameAr || '',
        nameUr: marketName?.nameUr || '',
        displayOrder: marketName?.displayOrder ?? null,
      },
    });
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingRow(null);
  };

  // Save market name
  const saveMarketName = async (typeId: string) => {
    if (!editingRow || editingRow.id !== typeId) return;

    try {
      setSaving(typeId);
      const data: MarketNameData = {
        nameEn: editingRow.marketName.nameEn || undefined,
        nameAr: editingRow.marketName.nameAr || undefined,
        nameUr: editingRow.marketName.nameUr || undefined,
        displayOrder: editingRow.marketName.displayOrder ?? undefined,
      };

      await equipmentTypeService.upsertMarketName(typeId, selectedMarket, data);
      setEditingRow(null);
      await fetchData();
    } catch (err) {
      console.error('Failed to save market name:', err);
      setError('Failed to save market name');
    } finally {
      setSaving(null);
    }
  };

  // Toggle active status
  const toggleActive = async (typeId: string) => {
    try {
      setSaving(typeId);
      await equipmentTypeService.toggleActive(typeId);
      await fetchData();
    } catch (err) {
      console.error('Failed to toggle active status:', err);
      setError('Failed to toggle status');
    } finally {
      setSaving(null);
    }
  };

  // Update editing field
  const updateEditingField = (field: keyof EditableMarketName, value: string | number | null) => {
    if (!editingRow) return;
    setEditingRow({
      ...editingRow,
      marketName: {
        ...editingRow.marketName,
        [field]: value,
      },
    });
  };

  // Get category name by slug
  const getCategoryName = (categorySlug: string) => {
    const category = categories.find(c => c.slug === categorySlug);
    return category?.nameEn || categorySlug;
  };

  // Render market name cell (editable or display)
  const renderMarketNameCell = (type: EquipmentType, field: 'nameEn' | 'nameAr' | 'nameUr') => {
    const isEditing = editingRow?.id === type.id;
    const marketName = type.marketName;
    const displayValue = marketName?.[field] || '-';
    const isRTL = field === 'nameAr';

    if (isEditing) {
      return (
        <Input
          value={editingRow.marketName[field]}
          onChange={(e) => updateEditingField(field, e.target.value)}
          className={cn('w-full text-sm', isRTL && 'text-right')}
          dir={isRTL ? 'rtl' : 'ltr'}
          placeholder={`Market ${field.replace('name', '')}`}
        />
      );
    }

    return (
      <span className={cn('text-sm', isRTL && 'text-right block', !marketName?.[field] && 'text-gray-500')}>
        {displayValue}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Equipment Naming</h1>
          <p className="text-muted-foreground mt-1">
            Manage equipment type names and market-specific terminology
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search equipment types..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {(categories || []).map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.nameEn}
              </option>
            ))}
          </Select>

          {/* Market Selector */}
          <Select
            value={selectedMarket}
            onChange={(e) => setSelectedMarket(e.target.value)}
          >
            {MARKETS.map((market) => (
              <option key={market.code} value={market.code}>
                {market.name} ({market.code})
              </option>
            ))}
          </Select>

          {/* Refresh Button */}
          <Button variant="outline" onClick={fetchData} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/50 border border-red-700 rounded-lg p-4">
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {/* Table */}
      <div className="bg-card rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Equipment Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Base Name (EN)
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Base Name (AR)
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Market Name (EN)
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Market Name (AR)
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Order
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-4">
                      <div className="h-4 bg-gray-600 rounded w-32"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 bg-gray-600 rounded w-24"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 bg-gray-600 rounded w-28"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 bg-gray-600 rounded w-28"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 bg-gray-600 rounded w-28"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 bg-gray-600 rounded w-28"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 bg-gray-600 rounded w-12"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 bg-gray-600 rounded w-16"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 bg-gray-600 rounded w-20"></div>
                    </td>
                  </tr>
                ))
              ) : equipmentTypes.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                    No equipment types found
                  </td>
                </tr>
              ) : (
                equipmentTypes.map((type) => {
                  const isEditing = editingRow?.id === type.id;
                  const isSaving = saving === type.id;

                  return (
                    <tr
                      key={type.id}
                      className={cn(
                        'hover:bg-muted/50 transition-colors',
                        isEditing && 'bg-blue-900/20',
                        !type.isActive && 'opacity-60'
                      )}
                    >
                      {/* Equipment Type Name */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {type.imageUrl ? (
                            <img
                              src={type.imageUrl}
                              alt={type.nameEn}
                              className="h-10 w-10 rounded object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded bg-gray-600 flex items-center justify-center">
                              <span className="text-muted-foreground text-xs">
                                {type.nameEn.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {type.nameEn}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {type.descriptionEn || 'No description'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-4">
                        <Badge variant="default" className="text-xs">
                          {getCategoryName(type.category)}
                        </Badge>
                      </td>

                      {/* Base Name EN */}
                      <td className="px-4 py-4">
                        <span className="text-sm text-muted-foreground">{type.nameEn}</span>
                      </td>

                      {/* Base Name AR */}
                      <td className="px-4 py-4 text-right" dir="rtl">
                        <span className="text-sm text-muted-foreground">{type.nameAr}</span>
                      </td>

                      {/* Market Name EN */}
                      <td className="px-4 py-4">
                        {renderMarketNameCell(type, 'nameEn')}
                      </td>

                      {/* Market Name AR */}
                      <td className="px-4 py-4 text-right" dir="rtl">
                        {renderMarketNameCell(type, 'nameAr')}
                      </td>

                      {/* Display Order */}
                      <td className="px-4 py-4 text-center">
                        {isEditing ? (
                          <Input
                            type="number"
                            value={editingRow.marketName.displayOrder ?? ''}
                            onChange={(e) =>
                              updateEditingField(
                                'displayOrder',
                                e.target.value ? parseInt(e.target.value) : null
                              )
                            }
                            className="w-16 text-center text-sm"
                            placeholder="Auto"
                          />
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            {type.marketName?.displayOrder ?? type.displayOrder}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => toggleActive(type.id)}
                          disabled={isSaving}
                          className={cn(
                            'inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors',
                            type.isActive
                              ? 'bg-green-900/50 text-green-300 hover:bg-green-900/70'
                              : 'bg-red-900/50 text-red-300 hover:bg-red-900/70'
                          )}
                        >
                          {type.isActive ? (
                            <>
                              <Eye className="h-3 w-3" />
                              Active
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-3 w-3" />
                              Hidden
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {isEditing ? (
                            <>
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => saveMarketName(type.id)}
                                disabled={isSaving}
                              >
                                {isSaving ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Check className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={cancelEditing}
                                disabled={isSaving}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startEditing(type)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-card rounded-lg p-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-2">Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-muted-foreground">
          <div>
            <strong className="text-muted-foreground">Base Name:</strong> Standard/textbook name
          </div>
          <div>
            <strong className="text-muted-foreground">Market Name:</strong> Local terminology for {MARKETS.find(m => m.code === selectedMarket)?.name}
          </div>
          <div>
            <strong className="text-muted-foreground">Order:</strong> Display order (lower = first). Empty uses default.
          </div>
          <div>
            <strong className="text-muted-foreground">Status:</strong> Active types appear in app. Hidden types are not selectable.
          </div>
        </div>
      </div>
    </div>
  );
}
