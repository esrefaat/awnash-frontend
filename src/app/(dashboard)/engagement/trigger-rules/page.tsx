'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCogs,
  faPlay,
  faPause,
  faPlus,
  faTimes,
  faSave,
  faEdit,
  faTrash,
  faEye,
  faClock,
  faCalendarAlt,
  faUsers,
  faEnvelope,
  faBell,
  faFlag,
  faExclamationTriangle,
  faToggleOn,
  faToggleOff,
  faCode,
  faHistory,
  faFilter,
  faChartLine,
  faUserClock,
  faCalendarCheck,
  faFileAlt,
  faTruck,
  faMapMarkerAlt,
  faChevronDown,
  faChevronUp,
  faInfoCircle,
  faCheckCircle,
  faTimesCircle
} from '@fortawesome/free-solid-svg-icons';

// Trigger types
const triggerTypes = [
  { key: 'kpi', label: 'KPI-based', description: 'Based on metrics and numbers' },
  { key: 'behavior', label: 'Behavior-based', description: 'Based on user actions' },
  { key: 'time', label: 'Time-based', description: 'Based on schedules' }
];

// Condition template interface
interface ConditionTemplate {
  key: string;
  label: string;
  field: string;
  operators: string[];
  hasCity?: boolean;
}

// Condition templates
const conditionTemplates: Record<string, ConditionTemplate[]> = {
  kpi: [
    { key: 'daily_bookings', label: 'Daily bookings', field: 'bookings_today', operators: ['<', '>', '=', '>=', '<='] },
    { key: 'city_bookings', label: 'Bookings in city', field: 'city_bookings', operators: ['<', '>', '='], hasCity: true },
    { key: 'revenue_today', label: 'Revenue today', field: 'revenue_today', operators: ['<', '>', '=', '>=', '<='] },
    { key: 'equipment_utilization', label: 'Equipment utilization', field: 'utilization_rate', operators: ['<', '>', '='] }
  ],
  behavior: [
    { key: 'owners_inactive', label: 'Owners inactive for', field: 'owner_inactive_days', operators: ['>', '>='] },
    { key: 'equipment_views_no_booking', label: 'Equipment views without booking', field: 'views_no_booking', operators: ['>', '>='] },
    { key: 'failed_payments', label: 'Failed payment attempts', field: 'failed_payments', operators: ['>', '>='] },
    { key: 'incomplete_profiles', label: 'Incomplete user profiles', field: 'incomplete_profiles', operators: ['>', '='] }
  ],
  time: [
    { key: 'document_expiry', label: 'Document expiry in next', field: 'document_expiry_days', operators: ['<', '<='] },
    { key: 'booking_reminder', label: 'Booking reminder before', field: 'booking_reminder_hours', operators: ['='] },
    { key: 'maintenance_due', label: 'Equipment maintenance due in', field: 'maintenance_due_days', operators: ['<', '<='] }
  ]
};

// Action types
const actionTypes = [
  { key: 'launch_campaign', label: 'Launch Campaign', icon: faBell, description: 'Send automated campaign' },
  { key: 'send_notification', label: 'Send Notification', icon: faEnvelope, description: 'Send immediate message' },
  { key: 'flag_users', label: 'Flag Users', icon: faFlag, description: 'Mark users for follow-up' },
  { key: 'notify_admin', label: 'Notify Admin', icon: faExclamationTriangle, description: 'Send admin alert' }
];

// Scheduling options
const scheduleOptions = [
  { key: '15min', label: 'Every 15 minutes', value: 15 },
  { key: 'hourly', label: 'Hourly', value: 60 },
  { key: 'daily', label: 'Daily', value: 1440 },
  { key: 'weekly', label: 'Weekly', value: 10080 }
];

interface TriggerCondition {
  id: string;
  type: string;
  field: string;
  operator: string;
  value: string | number;
  city?: string;
  logic: 'AND' | 'OR';
}

interface TriggerAction {
  id: string;
  type: string;
  config: {
    campaignId?: string;
    messageTemplate?: string;
    notificationText?: string;
    flagReason?: string;
  };
}

interface TriggerRule {
  id: string;
  name: string;
  isActive: boolean;
  triggerType: string;
  conditions: TriggerCondition[];
  actions: TriggerAction[];
  schedule: {
    frequency: string;
    limitPerExecution: number;
  };
  lastTriggered?: string;
  executionCount: number;
  createdAt: string;
}

const TriggerRulesBuilder: React.FC = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [rule, setRule] = useState<TriggerRule>({
    id: '',
    name: '',
    isActive: false,
    triggerType: 'kpi',
    conditions: [{
      id: '1',
      type: 'daily_bookings',
      field: 'bookings_today',
      operator: '<',
      value: '',
      logic: 'AND'
    }],
    actions: [{
      id: '1',
      type: 'launch_campaign',
      config: {}
    }],
    schedule: {
      frequency: 'hourly',
      limitPerExecution: 1
    },
    executionCount: 0,
    createdAt: new Date().toISOString()
  });

  const [showPreview, setShowPreview] = useState(true);
  const [showExecutionLog, setShowExecutionLog] = useState(false);

  // Mock data
  const savedCampaigns = [
    { id: '1', name: 'Low Activity Alert', type: 'Email' },
    { id: '2', name: 'Equipment Promotion', type: 'Push' },
    { id: '3', name: 'Document Reminder', type: 'SMS' }
  ];

  const mockExecutions = [
    { date: '2024-01-15 10:00', triggered: true, affected: 25, action: 'Sent campaign to inactive owners' },
    { date: '2024-01-15 09:00', triggered: false, affected: 0, action: 'No users met criteria' },
    { date: '2024-01-15 08:00', triggered: true, affected: 12, action: 'Flagged users with incomplete profiles' }
  ];

  const updateRule = (updates: Partial<TriggerRule>) => {
    setRule(prev => ({ ...prev, ...updates }));
  };

  const addCondition = () => {
    const newCondition: TriggerCondition = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'daily_bookings',
      field: 'bookings_today',
      operator: '<',
      value: '',
      logic: 'AND'
    };
    updateRule({ conditions: [...rule.conditions, newCondition] });
  };

  const updateCondition = (conditionId: string, updates: Partial<TriggerCondition>) => {
    const updatedConditions = rule.conditions.map(condition =>
      condition.id === conditionId ? { ...condition, ...updates } : condition
    );
    updateRule({ conditions: updatedConditions });
  };

  const removeCondition = (conditionId: string) => {
    if (rule.conditions.length > 1) {
      const updatedConditions = rule.conditions.filter(condition => condition.id !== conditionId);
      updateRule({ conditions: updatedConditions });
    }
  };

  const addAction = () => {
    const newAction: TriggerAction = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'launch_campaign',
      config: {}
    };
    updateRule({ actions: [...rule.actions, newAction] });
  };

  const updateAction = (actionId: string, updates: Partial<TriggerAction>) => {
    const updatedActions = rule.actions.map(action =>
      action.id === actionId ? { ...action, ...updates } : action
    );
    updateRule({ actions: updatedActions });
  };

  const removeAction = (actionId: string) => {
    if (rule.actions.length > 1) {
      const updatedActions = rule.actions.filter(action => action.id !== actionId);
      updateRule({ actions: updatedActions });
    }
  };

  const getConditionLabel = (condition: TriggerCondition) => {
    const template = Object.values(conditionTemplates).flat().find(t => t.key === condition.type);
    return template?.label || condition.type;
  };

  const generateRulePreview = () => {
    let preview = `IF `;
    
    rule.conditions.forEach((condition, index) => {
      if (index > 0) {
        preview += ` ${condition.logic} `;
      }
      
      const label = getConditionLabel(condition);
      preview += `${label} ${condition.operator} ${condition.value}`;
      
      if (condition.city) {
        preview += ` in ${condition.city}`;
      }
    });

    preview += ` THEN `;
    
    rule.actions.forEach((action, index) => {
      if (index > 0) {
        preview += ` AND `;
      }
      
      const actionType = actionTypes.find(a => a.key === action.type);
      preview += actionType?.label || action.type;
    });

    return preview;
  };

  const renderConditionBuilder = () => (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">
          {isRTL ? 'منشئ الشروط' : 'Condition Builder'}
        </h3>
        <button
          onClick={addCondition}
          className="flex items-center px-4 py-2 bg-awnash-primary text-black rounded-2xl hover:bg-awnash-primary-hover font-medium transition-colors shadow-lg"
        >
          <FontAwesomeIcon icon={faPlus} className={`${isRTL ? 'ml-2' : 'mr-2'}`} />  
          {isRTL ? 'إضافة شرط' : 'Add Condition'}
        </button>
      </div>

      <div className="space-y-4">
        {rule.conditions.map((condition, index) => {
          const availableConditions = conditionTemplates[rule.triggerType as keyof typeof conditionTemplates] || [];
          const selectedTemplate = availableConditions.find(t => t.key === condition.type);

          return (
            <div key={condition.id} className="bg-muted rounded-lg p-4 border border-border">
              {index > 0 && (
                <div className="flex items-center mb-4">
                  <select
                    value={condition.logic}
                    onChange={(e) => updateCondition(condition.id, { logic: e.target.value as 'AND' | 'OR' })}
                    className="px-3 py-1 bg-gray-600 border border-gray-500 rounded text-foreground text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="AND">AND</option>
                    <option value="OR">OR</option>
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    {isRTL ? 'الشرط' : 'Condition'}
                  </label>
                  <select
                    value={condition.type}
                    onChange={(e) => {
                      const newTemplate = availableConditions.find(t => t.key === e.target.value);
                      updateCondition(condition.id, { 
                        type: e.target.value,
                        field: newTemplate?.field || '',
                        operator: newTemplate?.operators[0] || '<',
                        value: ''
                      });
                    }}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-foreground text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    {availableConditions.map(template => (
                      <option key={template.key} value={template.key}>
                        {template.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    {isRTL ? 'المشغل' : 'Operator'}
                  </label>
                  <select
                    value={condition.operator}
                    onChange={(e) => updateCondition(condition.id, { operator: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-foreground text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    {selectedTemplate?.operators.map(op => (
                      <option key={op} value={op}>{op}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    {isRTL ? 'القيمة' : 'Value'}
                  </label>
                  <input
                    type="number"
                    value={condition.value}
                    onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-foreground text-sm focus:ring-2 focus:ring-blue-500"
                    placeholder={isRTL ? 'أدخل القيمة...' : 'Enter value...'}
                  />
                </div>

                <div className={cn("flex items-center space-x-2", isRTL && "space-x-reverse")}>
                  {rule.conditions.length > 1 && (
                    <button
                      onClick={() => removeCondition(condition.id)}
                      className="p-2 bg-red-600 text-foreground rounded hover:bg-red-700 transition-colors"
                      title={isRTL ? 'حذف الشرط' : 'Remove condition'}
                    >
                      <FontAwesomeIcon icon={faTimes} className="text-sm" />
                    </button>
                  )}
                </div>
              </div>

              {selectedTemplate?.hasCity && (
                <div className="mt-4">
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    {isRTL ? 'المدينة' : 'City'}
                  </label>
                  <select
                    value={condition.city || ''}
                    onChange={(e) => updateCondition(condition.id, { city: e.target.value })}
                    className="w-full md:w-1/3 px-3 py-2 bg-gray-600 border border-gray-500 rounded text-foreground text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{isRTL ? 'اختر مدينة...' : 'Select city...'}</option>
                    <option value="Riyadh">Riyadh</option>
                    <option value="Dubai">Dubai</option>
                    <option value="Kuwait City">Kuwait City</option>
                    <option value="Doha">Doha</option>
                    <option value="Manama">Manama</option>
                    <option value="Muscat">Muscat</option>
                  </select>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderActionBuilder = () => (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">
          {isRTL ? 'منشئ الإجراءات' : 'Action Builder'}
        </h3>
        <button
          onClick={addAction}
          className="flex items-center px-4 py-2 bg-awnash-primary text-black rounded-2xl hover:bg-awnash-primary-hover font-medium transition-colors shadow-lg"
        >
          <FontAwesomeIcon icon={faPlus} className={`${isRTL ? 'ml-2' : 'mr-2'}`} />  
          {isRTL ? 'إضافة إجراء' : 'Add Action'}
        </button>
      </div>

      <div className="space-y-4">
        {rule.actions.map((action, index) => {
          const actionType = actionTypes.find(a => a.key === action.type);

          return (
            <div key={action.id} className="bg-muted rounded-lg p-4 border border-border">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    {isRTL ? 'نوع الإجراء' : 'Action Type'}
                  </label>
                  <select
                    value={action.type}
                    onChange={(e) => updateAction(action.id, { type: e.target.value, config: {} })}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-foreground text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    {actionTypes.map(type => (
                      <option key={type.key} value={type.key}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    {isRTL ? 'التكوين' : 'Configuration'}
                  </label>
                  {action.type === 'launch_campaign' ? (
                    <select
                      value={action.config.campaignId || ''}
                      onChange={(e) => updateAction(action.id, { 
                        config: { ...action.config, campaignId: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-foreground text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">{isRTL ? 'اختر حملة...' : 'Select campaign...'}</option>
                      {savedCampaigns.map(campaign => (
                        <option key={campaign.id} value={campaign.id}>
                          {campaign.name}
                        </option>
                      ))}
                    </select>
                  ) : action.type === 'send_notification' ? (
                    <input
                      type="text"
                      value={action.config.messageTemplate || ''}
                      onChange={(e) => updateAction(action.id, {
                        config: { ...action.config, messageTemplate: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-foreground text-sm focus:ring-2 focus:ring-blue-500"
                      placeholder={isRTL ? 'نص الرسالة...' : 'Message text...'}
                    />
                  ) : action.type === 'flag_users' ? (
                    <input
                      type="text"
                      value={action.config.flagReason || ''}
                      onChange={(e) => updateAction(action.id, {
                        config: { ...action.config, flagReason: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-foreground text-sm focus:ring-2 focus:ring-blue-500"
                      placeholder={isRTL ? 'سبب العلامة...' : 'Flag reason...'}
                    />
                  ) : (
                    <input
                      type="text"
                      value={action.config.notificationText || ''}
                      onChange={(e) => updateAction(action.id, {
                        config: { ...action.config, notificationText: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-foreground text-sm focus:ring-2 focus:ring-blue-500"
                      placeholder={isRTL ? 'نص التنبيه...' : 'Alert text...'}
                    />
                  )}
                </div>

                <div className={cn("flex items-center space-x-2", isRTL && "space-x-reverse")}>
                  {rule.actions.length > 1 && (
                    <button
                      onClick={() => removeAction(action.id)}
                      className="p-2 bg-red-600 text-foreground rounded hover:bg-red-700 transition-colors"
                      title={isRTL ? 'حذف الإجراء' : 'Remove action'}
                    >
                      <FontAwesomeIcon icon={faTimes} className="text-sm" />
                    </button>
                  )}
                </div>
              </div>

              {actionType && (
                <div className="mt-2 text-muted-foreground text-xs flex items-center">
                  <FontAwesomeIcon icon={actionType.icon} className={`${isRTL ? 'ml-2' : 'mr-2'}`} />  
                  {actionType.description}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderScheduling = () => (
    <div className="bg-card rounded-xl border border-border p-6">
      <h3 className="text-lg font-semibold text-foreground mb-6">
        {isRTL ? 'إعدادات الجدولة' : 'Scheduling Options'}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            {isRTL ? 'تكرار التشغيل' : 'Run Frequency'}
          </label>
          <select
            value={rule.schedule.frequency}
            onChange={(e) => updateRule({
              schedule: { ...rule.schedule, frequency: e.target.value }
            })}
            className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:ring-2 focus:ring-blue-500"
          >
            {scheduleOptions.map(option => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            {isRTL ? 'الحد الأقصى للتنفيذ' : 'Max Per Execution'}
          </label>
          <input
            type="number"
            value={rule.schedule.limitPerExecution}
            onChange={(e) => updateRule({
              schedule: { ...rule.schedule, limitPerExecution: parseInt(e.target.value) || 1 }
            })}
            className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:ring-2 focus:ring-blue-500"
            min="1"
            max="1000"
          />
        </div>
      </div>
    </div>
  );

  const renderPreview = () => (
    <div className="bg-muted rounded-lg p-6 border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center">
          <FontAwesomeIcon icon={faCode} className={`${isRTL ? 'ml-2' : 'mr-2'} text-purple-400`} />
          {isRTL ? 'معاينة القاعدة' : 'Rule Preview'}
        </h3>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <FontAwesomeIcon icon={showPreview ? faChevronUp : faChevronDown} />
        </button>
      </div>

      {showPreview && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <h4 className="text-muted-foreground font-medium mb-2">
              {isRTL ? 'منطق القاعدة' : 'Rule Logic'}
            </h4>
            <p className="text-blue-200 text-sm leading-relaxed">
              {generateRulePreview()}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <h4 className="text-muted-foreground font-medium mb-2">
                {isRTL ? 'الحالة' : 'Status'}
              </h4>
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full ${isRTL ? 'ml-2' : 'mr-2'} ${rule.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-foreground text-sm">
                  {rule.isActive ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'غير نشط' : 'Inactive')}
                </span>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <h4 className="text-muted-foreground font-medium mb-2">
                {isRTL ? 'التكرار' : 'Frequency'}
              </h4>
              <p className="text-foreground text-sm">
                {scheduleOptions.find(s => s.key === rule.schedule.frequency)?.label}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderExecutionLog = () => (
    <div className="bg-muted rounded-lg p-6 border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center">
          <FontAwesomeIcon icon={faHistory} className={`${isRTL ? 'ml-2' : 'mr-2'} text-green-400`} />  
          {isRTL ? 'سجل التنفيذ' : 'Execution Log'}
        </h3>
        <button
          onClick={() => setShowExecutionLog(!showExecutionLog)}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <FontAwesomeIcon icon={showExecutionLog ? faChevronUp : faChevronDown} />
        </button>
      </div>

      {showExecutionLog && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">{rule.executionCount}</div>
              <div className="text-muted-foreground text-sm">{isRTL ? 'مرات التنفيذ' : 'Total Executions'}</div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-400">156</div>
              <div className="text-muted-foreground text-sm">{isRTL ? 'المستخدمون المتأثرون' : 'Users Affected'}</div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400">92%</div>
              <div className="text-muted-foreground text-sm">{isRTL ? 'معدل النجاح' : 'Success Rate'}</div>
            </div>
          </div>

          <div>
            <h4 className="text-muted-foreground font-medium mb-3">
              {isRTL ? 'آخر التنفيذات' : 'Recent Executions'}
            </h4>
            <div className="space-y-2">
              {mockExecutions.map((execution, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-card rounded-lg">
                  <div className="flex items-center">
                    <FontAwesomeIcon 
                      icon={execution.triggered ? faCheckCircle : faTimesCircle} 
                      className={`${isRTL ? 'ml-3' : 'mr-3'} ${execution.triggered ? 'text-green-400' : 'text-gray-500'}`}  
                    />
                    <div>
                      <div className="text-foreground text-sm">{execution.action}</div>
                      <div className="text-muted-foreground text-xs">{execution.date}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-blue-400 font-medium">{execution.affected}</div>
                    <div className="text-muted-foreground text-xs">{isRTL ? 'متأثر' : 'affected'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className={`min-h-screen bg-background ${isRTL ? 'font-arabic' : 'font-montserrat'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center">
            <FontAwesomeIcon icon={faCogs} className={`${isRTL ? 'ml-3' : 'mr-3'} text-blue-400`} />  
            {isRTL ? 'منشئ قواعد التحفيز' : 'Trigger Rules Builder'}
          </h1>
          <p className="text-muted-foreground">
            {isRTL ? 'إنشاء قواعد تلقائية للحملات والإجراءات' : 'Create automated rules for campaigns and actions'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Rule Setup */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-6">
                {isRTL ? 'إعداد القاعدة' : 'Rule Setup'}
              </h3>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      {isRTL ? 'اسم القاعدة' : 'Rule Name'}
                    </label>
                    <input
                      type="text"
                      value={rule.name}
                      onChange={(e) => updateRule({ name: e.target.value })}
                      className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:ring-2 focus:ring-blue-500"
                      placeholder={isRTL ? 'أدخل اسم القاعدة...' : 'Enter rule name...'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      {isRTL ? 'نوع المحفز' : 'Trigger Type'}
                    </label>
                    <select
                      value={rule.triggerType}
                      onChange={(e) => updateRule({ triggerType: e.target.value })}
                      className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:ring-2 focus:ring-blue-500"
                    >
                      {triggerTypes.map(type => (
                        <option key={type.key} value={type.key}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center">
                  <button
                    onClick={() => updateRule({ isActive: !rule.isActive })}
                    className={`p-2 rounded-full transition-colors ${isRTL ? 'ml-3' : 'mr-3'} ${
                      rule.isActive ? 'bg-green-600 text-foreground' : 'bg-gray-600 text-muted-foreground'
                    }`}
                  >
                    <FontAwesomeIcon icon={rule.isActive ? faToggleOn : faToggleOff} />
                  </button>
                  <span className="text-muted-foreground">
                    {rule.isActive ? (isRTL ? 'القاعدة نشطة' : 'Rule Active') : (isRTL ? 'القاعدة غير نشطة' : 'Rule Inactive')}
                  </span>
                </div>
              </div>
            </div>

            {renderConditionBuilder()}
            {renderActionBuilder()}
            {renderScheduling()}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className={cn("flex items-center space-x-3", isRTL && "space-x-reverse")}>
              <button
                onClick={() => {
                  const ruleToSave = { ...rule, id: rule.id || Math.random().toString(36).substr(2, 9) };
                  console.log('Saving rule:', ruleToSave);
                }}
                className="flex items-center px-4 py-2 bg-awnash-primary text-black rounded-2xl hover:bg-awnash-primary-hover font-medium transition-colors shadow-lg"
              >
                <FontAwesomeIcon icon={faSave} className={`${isRTL ? 'ml-2' : 'mr-2'}`} />  
                {isRTL ? 'حفظ القاعدة' : 'Save Rule'}
              </button>
            </div>

            {renderPreview()}
            {renderExecutionLog()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TriggerRulesBuilder; 