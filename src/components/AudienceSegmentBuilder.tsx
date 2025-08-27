import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,
  faFilter,
  faPlus,
  faTimes,
  faSave,
  faEdit,
  faTrash,
  faEye,
  faEyeSlash,
  faGlobe,
  faLock,
  faCode,
  faChevronDown,
  faChevronUp,
  faCopy,
  faCheckCircle,
  faExclamationTriangle,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons';

// Filter field options
const filterFields = [
  { key: 'role', label: 'Role', type: 'select', options: ['Renter', 'Owner'] },
  { key: 'city', label: 'City', type: 'select', options: ['Riyadh', 'Dubai', 'Kuwait City', 'Doha', 'Manama', 'Muscat'] },
  { key: 'lastLogin', label: 'Last Login', type: 'date' },
  { key: 'bookingsMade', label: 'Bookings Made', type: 'number' },
  { key: 'rentalsFulfilled', label: 'Rentals Fulfilled', type: 'number' },
  { key: 'equipmentViewed', label: 'Equipment Viewed', type: 'select', options: ['Excavator', 'Crane', 'Bulldozer', 'Loader', 'Dump Truck', 'Forklift'] },
  { key: 'revenueGenerated', label: 'Revenue Generated', type: 'number' },
  { key: 'accountAge', label: 'Account Age (days)', type: 'number' },
  { key: 'documentStatus', label: 'Document Status', type: 'select', options: ['Verified', 'Pending', 'Rejected'] }
];

// Operator options based on field type
const getOperators = (fieldType: string) => {
  switch (fieldType) {
    case 'select':
      return [
        { key: 'equals', label: 'Equals' },
        { key: 'not_equals', label: 'Not Equals' }
      ];
    case 'number':
      return [
        { key: 'equals', label: 'Equals' },
        { key: 'greater_than', label: 'Greater Than' },
        { key: 'less_than', label: 'Less Than' },
        { key: 'between', label: 'Between' }
      ];
    case 'date':
      return [
        { key: 'after', label: 'After' },
        { key: 'before', label: 'Before' },
        { key: 'between', label: 'Between' },
        { key: 'in_last_days', label: 'In Last X Days' }
      ];
    default:
      return [
        { key: 'equals', label: 'Equals' },
        { key: 'contains', label: 'Contains' }
      ];
  }
};

interface FilterCondition {
  id: string;
  field: string;
  operator: string;
  value: string | number;
  secondValue?: string | number; // For "between" operations
  logic: 'AND' | 'OR';
}

interface Segment {
  id: string;
  name: string;
  description: string;
  visibility: 'public' | 'private';
  conditions: FilterCondition[];
  estimatedReach: number;
  createdBy: string;
  createdAt: string;
  lastModified: string;
}

interface AudienceSegmentBuilderProps {
  onSegmentSave?: (segment: Segment) => void;
  existingSegments?: Segment[];
  initialSegment?: Segment;
}

const AudienceSegmentBuilder: React.FC<AudienceSegmentBuilderProps> = ({
  onSegmentSave,
  existingSegments = [],
  initialSegment
}) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [segment, setSegment] = useState<Segment>(
    initialSegment || {
      id: '',
      name: '',
      description: '',
      visibility: 'public',
      conditions: [
        {
          id: '1',
          field: 'role',
          operator: 'equals',
          value: '',
          logic: 'AND'
        }
      ],
      estimatedReach: 0,
      createdBy: 'Current Admin',
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    }
  );

  const [showPreview, setShowPreview] = useState(true);
  const [showExistingSegments, setShowExistingSegments] = useState(false);
  const [selectedSegmentId, setSelectedSegmentId] = useState<string>('');

  // Mock user data for preview
  const mockUsers = [
    { id: '1', name: 'Ahmed Al-Rashid', role: 'Renter', city: 'Riyadh', bookings: 5, revenue: 2500 },
    { id: '2', name: 'Sarah Johnson', role: 'Owner', city: 'Dubai', bookings: 12, revenue: 8900 },
    { id: '3', name: 'Mohammed Al-Kuwari', role: 'Renter', city: 'Doha', bookings: 2, revenue: 1200 },
    { id: '4', name: 'Fatima Al-Sabah', role: 'Owner', city: 'Kuwait City', bookings: 8, revenue: 5600 },
    { id: '5', name: 'Hassan Al-Khalifa', role: 'Renter', city: 'Manama', bookings: 1, revenue: 450 }
  ];

  const updateSegment = (updates: Partial<Segment>) => {
    setSegment(prev => ({ ...prev, ...updates, lastModified: new Date().toISOString() }));
  };

  const addCondition = () => {
    const newCondition: FilterCondition = {
      id: Math.random().toString(36).substr(2, 9),
      field: 'role',
      operator: 'equals',
      value: '',
      logic: 'AND'
    };
    updateSegment({
      conditions: [...segment.conditions, newCondition]
    });
  };

  const updateCondition = (conditionId: string, updates: Partial<FilterCondition>) => {
    const updatedConditions = segment.conditions.map(condition =>
      condition.id === conditionId ? { ...condition, ...updates } : condition
    );
    updateSegment({ conditions: updatedConditions });
  };

  const removeCondition = (conditionId: string) => {
    if (segment.conditions.length > 1) {
      const updatedConditions = segment.conditions.filter(condition => condition.id !== conditionId);
      updateSegment({ conditions: updatedConditions });
    }
  };

  const calculateEstimatedReach = () => {
    // Mock calculation based on conditions
    let baseUsers = 10000;
    segment.conditions.forEach(condition => {
      if (condition.field === 'role' && condition.value) {
        baseUsers *= 0.6; // Role filter reduces reach
      }
      if (condition.field === 'city' && condition.value) {
        baseUsers *= 0.2; // City filter significantly reduces reach
      }
      if (condition.field === 'bookingsMade' && condition.operator === 'less_than') {
        baseUsers *= 0.4; // Low booking users
      }
    });
    return Math.floor(baseUsers);
  };

  React.useEffect(() => {
    const estimatedReach = calculateEstimatedReach();
    updateSegment({ estimatedReach });
  }, [segment.conditions]);

  const saveSegment = () => {
    const segmentToSave = {
      ...segment,
      id: segment.id || Math.random().toString(36).substr(2, 9)
    };
    onSegmentSave?.(segmentToSave);
  };

  const loadExistingSegment = (segmentId: string) => {
    const existingSegment = existingSegments.find(s => s.id === segmentId);
    if (existingSegment) {
      setSegment(existingSegment);
      setSelectedSegmentId(segmentId);
    }
  };

  const duplicateSegment = () => {
    const duplicatedSegment = {
      ...segment,
      id: '',
      name: `${segment.name} (Copy)`,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };
    setSegment(duplicatedSegment);
    setSelectedSegmentId('');
  };

  const renderFilterCondition = (condition: FilterCondition, index: number) => {
    const field = filterFields.find(f => f.key === condition.field);
    const operators = getOperators(field?.type || 'select');

    return (
      <div key={condition.id} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
        {index > 0 && (
          <div className="flex items-center mb-4">
            <select
              value={condition.logic}
              onChange={(e) => updateCondition(condition.id, { logic: e.target.value as 'AND' | 'OR' })}
              className="px-3 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="AND">AND</option>
              <option value="OR">OR</option>
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          {/* Field Selection */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              {isRTL ? 'الحقل' : 'Field'}
            </label>
            <select
              value={condition.field}
              onChange={(e) => updateCondition(condition.id, { 
                field: e.target.value, 
                operator: getOperators(filterFields.find(f => f.key === e.target.value)?.type || 'select')[0].key,
                value: ''
              })}
              className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:ring-2 focus:ring-blue-500"
            >
              {filterFields.map(field => (
                <option key={field.key} value={field.key}>
                  {isRTL ? field.label : field.label}
                </option>
              ))}
            </select>
          </div>

          {/* Operator Selection */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              {isRTL ? 'المشغل' : 'Operator'}
            </label>
            <select
              value={condition.operator}
              onChange={(e) => updateCondition(condition.id, { operator: e.target.value, value: '' })}
              className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:ring-2 focus:ring-blue-500"
            >
              {operators.map(op => (
                <option key={op.key} value={op.key}>
                  {op.label}
                </option>
              ))}
            </select>
          </div>

          {/* Value Input */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              {isRTL ? 'القيمة' : 'Value'}
            </label>
            {field?.type === 'select' ? (
              <select
                value={condition.value}
                onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{isRTL ? 'اختر...' : 'Select...'}</option>
                {field.options?.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            ) : field?.type === 'date' ? (
              <input
                type={condition.operator === 'in_last_days' ? 'number' : 'date'}
                value={condition.value}
                onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:ring-2 focus:ring-blue-500"
                placeholder={condition.operator === 'in_last_days' ? 'Days' : ''}
              />
            ) : (
              <input
                type={field?.type === 'number' ? 'number' : 'text'}
                value={condition.value}
                onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:ring-2 focus:ring-blue-500"
                placeholder={isRTL ? 'أدخل القيمة...' : 'Enter value...'}
              />
            )}
          </div>

          {/* Actions */}
          <div className={cn("flex items-center space-x-2", isRTL && "space-x-reverse")}>
            {segment.conditions.length > 1 && (
              <button
                onClick={() => removeCondition(condition.id)}
                className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                title={isRTL ? 'حذف الشرط' : 'Remove condition'}
              >
                <FontAwesomeIcon icon={faTimes} className="text-sm" />
              </button>
            )}
          </div>
        </div>

        {/* Second value for "between" operations */}
        {condition.operator === 'between' && (
          <div className="mt-4">
            <label className="block text-xs font-medium text-gray-300 mb-1">
              {isRTL ? 'القيمة الثانية' : 'Second Value'}
            </label>
            <input
              type={field?.type === 'number' ? 'number' : field?.type === 'date' ? 'date' : 'text'}
              value={condition.secondValue || ''}
              onChange={(e) => updateCondition(condition.id, { secondValue: e.target.value })}
              className="w-full md:w-1/4 px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:ring-2 focus:ring-blue-500"
              placeholder={isRTL ? 'القيمة النهائية...' : 'End value...'}
            />
          </div>
        )}
      </div>
    );
  };

  const renderPreview = () => (
    <div className="bg-gray-700 rounded-lg p-6 border border-gray-600">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <FontAwesomeIcon icon={faUsers} className={`${isRTL ? 'ml-2' : 'mr-2'} text-blue-400`} />
          {isRTL ? 'معاينة الجمهور' : 'Audience Preview'}
        </h3>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <FontAwesomeIcon icon={showPreview ? faChevronUp : faChevronDown} />
        </button>
      </div>

      {showPreview && (
        <div className="space-y-4">
          {/* Estimated Reach */}
          <div className="bg-blue-900 border border-blue-700 rounded-lg p-4">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faUsers} className={`text-blue-400 ${isRTL ? 'ml-3' : 'mr-3'}`} />
              <div>
                <h4 className="text-blue-200 font-medium">
                  {isRTL ? 'الوصول المتوقع' : 'Estimated Reach'}
                </h4>
                <p className="text-blue-100 text-2xl font-bold">
                  ~{segment.estimatedReach.toLocaleString()} {isRTL ? 'مستخدم' : 'users'}
                </p>
              </div>
            </div>
          </div>

          {/* Sample Users */}
          <div>
            <h4 className="text-gray-300 font-medium mb-3">
              {isRTL ? 'عينة من المستخدمين المطابقين' : 'Sample Matched Users'}
            </h4>
            <div className="space-y-2">
              {mockUsers.slice(0, 5).map(user => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-600 rounded-lg">
                  <div>
                    <div className="text-white font-medium">{user.name}</div>
                    <div className="text-gray-400 text-sm">
                      {user.role} • {user.city} • {user.bookings} {isRTL ? 'حجوزات' : 'bookings'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 font-medium">{user.revenue} SAR</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderExistingSegments = () => (
    <div className="bg-gray-700 rounded-lg p-6 border border-gray-600">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">
          {isRTL ? 'الشرائح الموجودة' : 'Existing Segments'}
        </h3>
        <button
          onClick={() => setShowExistingSegments(!showExistingSegments)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <FontAwesomeIcon icon={showExistingSegments ? faChevronUp : faChevronDown} />
        </button>
      </div>

      {showExistingSegments && (
        <div className="space-y-3">
          {existingSegments.length === 0 ? (
            <p className="text-gray-400 text-center py-4">
              {isRTL ? 'لا توجد شرائح محفوظة' : 'No saved segments'}
            </p>
          ) : (
            existingSegments.map(existingSegment => (
              <div 
                key={existingSegment.id} 
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedSegmentId === existingSegment.id 
                    ? 'bg-blue-600 border-blue-500' 
                    : 'bg-gray-600 border-gray-500 hover:bg-gray-550'
                }`}
                onClick={() => loadExistingSegment(existingSegment.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium flex items-center">
                      {existingSegment.name}
                      <FontAwesomeIcon 
                        icon={existingSegment.visibility === 'public' ? faGlobe : faLock} 
                        className={`${isRTL ? 'mr-2' : 'ml-2'} text-xs ${existingSegment.visibility === 'public' ? 'text-green-400' : 'text-yellow-400'}`}
                      />
                    </h4>
                    <p className="text-gray-300 text-sm">{existingSegment.description}</p>
                    <p className="text-gray-400 text-xs">
                      ~{existingSegment.estimatedReach.toLocaleString()} {isRTL ? 'مستخدم' : 'users'}
                    </p>
                  </div>
                  <div className={cn("flex items-center space-x-2", isRTL && "space-x-reverse")}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        loadExistingSegment(existingSegment.id);
                      }}
                      className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                      title={isRTL ? 'تحرير' : 'Edit'}
                    >
                      <FontAwesomeIcon icon={faEdit} className="text-sm" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle delete
                      }}
                      className="p-2 text-red-400 hover:text-red-300 transition-colors"
                      title={isRTL ? 'حذف' : 'Delete'}
                    >
                      <FontAwesomeIcon icon={faTrash} className="text-sm" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className={`space-y-6 ${isRTL ? 'font-arabic' : 'font-montserrat'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <FontAwesomeIcon icon={faFilter} className={`${isRTL ? 'ml-3' : 'mr-3'} text-blue-400`} />
          {isRTL ? 'منشئ شرائح الجمهور' : 'Audience Segment Builder'}
        </h2>
        <div className={cn("flex items-center space-x-3", isRTL && "space-x-reverse")}>
          <button
            onClick={duplicateSegment}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors"
          >
            <FontAwesomeIcon icon={faCopy} className={`${isRTL ? 'ml-2' : 'mr-2'}`} />
            {isRTL ? 'نسخ' : 'Duplicate'}
          </button>
          <button
            onClick={saveSegment}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            <FontAwesomeIcon icon={faSave} className={`${isRTL ? 'ml-2' : 'mr-2'}`} />  
            {isRTL ? 'حفظ الشريحة' : 'Save Segment'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Builder */}
        <div className="xl:col-span-2 space-y-6">
          {/* Segment Setup */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              {isRTL ? 'إعداد الشريحة' : 'Segment Setup'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {isRTL ? 'اسم الشريحة' : 'Segment Name'}
                </label>
                <input
                  type="text"
                  value={segment.name}
                  onChange={(e) => updateSegment({ name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  placeholder={isRTL ? 'أدخل اسم الشريحة...' : 'Enter segment name...'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {isRTL ? 'الوصف (اختياري)' : 'Description (Optional)'}
                </label>
                <textarea
                  rows={2}
                  value={segment.description}
                  onChange={(e) => updateSegment({ description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  placeholder={isRTL ? 'وصف الشريحة...' : 'Segment description...'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {isRTL ? 'الرؤية' : 'Visibility'}
                </label>
                <div className={cn("flex items-center space-x-4", isRTL && "space-x-reverse")}>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="public"
                      checked={segment.visibility === 'public'}
                      onChange={(e) => updateSegment({ visibility: e.target.value as 'public' | 'private' })}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded-full border-2 ${isRTL ? 'ml-2' : 'mr-2'} flex items-center justify-center ${
                      segment.visibility === 'public' ? 'bg-green-600 border-green-600' : 'border-gray-400'
                    }`}>
                      {segment.visibility === 'public' && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <FontAwesomeIcon icon={faGlobe} className={`text-green-400 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    <span className="text-gray-300">{isRTL ? 'عام' : 'Public'}</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="private"
                      checked={segment.visibility === 'private'}
                      onChange={(e) => updateSegment({ visibility: e.target.value as 'public' | 'private' })}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded-full border-2 ${isRTL ? 'ml-2' : 'mr-2'} flex items-center justify-center ${
                      segment.visibility === 'private' ? 'bg-yellow-600 border-yellow-600' : 'border-gray-400'
                    }`}>
                      {segment.visibility === 'private' && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <FontAwesomeIcon icon={faLock} className={`text-yellow-400 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    <span className="text-gray-300">{isRTL ? 'خاص' : 'Private'}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Builder */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">
                {isRTL ? 'منشئ الفلاتر' : 'Filter Builder'}
              </h3>
              <button
                onClick={addCondition}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                <FontAwesomeIcon icon={faPlus} className={`${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'إضافة شرط' : 'Add Condition'}
              </button>
            </div>

            <div className="space-y-4">
              {segment.conditions.map((condition, index) => renderFilterCondition(condition, index))}
            </div>

            {segment.conditions.length > 0 && (
              <div className="mt-6 p-4 bg-gray-900 border border-gray-600 rounded-lg">
                <h4 className="text-gray-300 font-medium mb-2 flex items-center">
                  <FontAwesomeIcon icon={faCode} className={`${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {isRTL ? 'معاينة الاستعلام' : 'Query Preview'}
                </h4>
                <code className="text-yellow-400 text-sm">
                  {segment.conditions.map((condition, index) => (
                    <span key={condition.id}>
                      {index > 0 && <span className="text-blue-400"> {condition.logic} </span>}
                      <span className="text-green-400">{condition.field}</span>
                      <span className="text-purple-400"> {condition.operator} </span>
                      <span className="text-orange-400">"{condition.value}"</span>
                      {condition.secondValue && (
                        <span className="text-orange-400"> AND "{condition.secondValue}"</span>
                      )}
                    </span>
                  ))}
                </code>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {renderPreview()}
          {renderExistingSegments()}
        </div>
      </div>
    </div>
  );
};

export default AudienceSegmentBuilder;
