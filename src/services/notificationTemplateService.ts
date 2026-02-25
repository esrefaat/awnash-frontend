import { transformKeysToCamelCase, transformKeysToSnakeCase } from '@/lib/caseTransform';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3007/v1';

// ============================================
// TYPES
// ============================================

export type NotificationPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type RecipientType = 'requester' | 'owner' | 'driver' | 'all';
export type NotificationChannel = 'push' | 'in_app' | 'email' | 'sms' | 'whatsapp';

export interface NotificationTemplate {
  id: string;
  eventCode: string;
  recipientType: RecipientType;
  titleEn: string;
  titleAr: string;
  titleUr: string;
  bodyEn: string;
  bodyAr: string;
  bodyUr: string;
  variables: string[];
  defaultPriority: NotificationPriority;
  defaultChannels: NotificationChannel[];
  requiresUserAction: boolean;
  androidChannelId: string;
  iosSound: string;
  iosBadgeIncrement: number;
  deepLinkTemplate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationTemplateListItem {
  id: string;
  eventCode: string;
  recipientType: RecipientType;
  titleEn: string;
  titleAr: string;
  titleUr: string;
  defaultPriority: NotificationPriority;
  defaultChannels: NotificationChannel[];
  isActive: boolean;
  updatedAt: string;
}

export interface UpdateNotificationTemplateDto {
  titleEn?: string;
  titleAr?: string;
  titleUr?: string;
  bodyEn?: string;
  bodyAr?: string;
  bodyUr?: string;
  defaultPriority?: NotificationPriority;
  defaultChannels?: NotificationChannel[];
  isActive?: boolean;
  deepLinkTemplate?: string;
}

export interface TemplatePreviewRequest {
  templateId: string;
  language: 'en' | 'ar' | 'ur';
  sampleData: Record<string, string>;
}

export interface TemplatePreviewResponse {
  title: string;
  body: string;
  renderedDeepLink?: string;
}

export interface TemplateVariable {
  key: string;
  description: string;
  example: string;
  required: boolean;
}

export interface EventVariables {
  eventCode: string;
  variables: TemplateVariable[];
}

// ============================================
// API FUNCTIONS
// ============================================

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    if (response.status === 401) {
      window.location.href = '/login';
      throw new Error('Session expired');
    }
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `Request failed with status ${response.status}`);
  }
  
  const text = await response.text();
  if (!text) return null as T;
  
  const data = JSON.parse(text);
  return transformKeysToCamelCase(data) as T;
}

export async function getNotificationTemplates(filters?: {
  eventCode?: string;
  recipientType?: RecipientType;
  channel?: NotificationChannel;
  isActive?: boolean;
}): Promise<NotificationTemplateListItem[]> {
  const params = new URLSearchParams();
  if (filters?.eventCode) params.append('eventCode', filters.eventCode);
  if (filters?.recipientType) params.append('recipientType', filters.recipientType);
  if (filters?.channel) params.append('channel', filters.channel);
  if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));
  
  const queryString = params.toString();
  const url = `${API_BASE_URL}/admin/notifications/templates${queryString ? `?${queryString}` : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  
  return handleResponse<NotificationTemplateListItem[]>(response);
}

export async function getNotificationTemplate(id: string): Promise<NotificationTemplate> {
  const response = await fetch(`${API_BASE_URL}/admin/notifications/templates/${id}`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  
  return handleResponse<NotificationTemplate>(response);
}

export async function updateNotificationTemplate(
  id: string,
  data: UpdateNotificationTemplateDto
): Promise<NotificationTemplate> {
  const response = await fetch(`${API_BASE_URL}/admin/notifications/templates/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  return handleResponse<NotificationTemplate>(response);
}

export async function toggleNotificationTemplate(id: string, isActive: boolean): Promise<NotificationTemplate> {
  const response = await fetch(`${API_BASE_URL}/admin/notifications/templates/${id}/toggle`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isActive }),
  });
  
  return handleResponse<NotificationTemplate>(response);
}

export async function previewNotificationTemplate(
  request: TemplatePreviewRequest
): Promise<TemplatePreviewResponse> {
  const response = await fetch(`${API_BASE_URL}/admin/notifications/preview-template`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transformKeysToSnakeCase(request)),
  });
  
  return handleResponse<TemplatePreviewResponse>(response);
}

export async function getTemplateVariables(eventCode: string): Promise<EventVariables> {
  const response = await fetch(`${API_BASE_URL}/admin/notifications/template-variables?eventCode=${eventCode}`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  
  return handleResponse<EventVariables>(response);
}

export async function testNotification(params: {
  templateId: string;
  userId: string;
  sampleData?: Record<string, string>;
}): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE_URL}/admin/notifications/test`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transformKeysToSnakeCase(params)),
  });
  
  return handleResponse<{ success: boolean; message: string }>(response);
}

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getChannelLabel(channel: NotificationChannel): string {
  const labels: Record<NotificationChannel, string> = {
    push: 'Push',
    in_app: 'In-App',
    email: 'Email',
    sms: 'SMS',
    whatsapp: 'WhatsApp',
  };
  return labels[channel] || channel;
}

export function getPriorityColor(priority: NotificationPriority): string {
  const colors: Record<NotificationPriority, string> = {
    CRITICAL: 'bg-red-100 text-red-800',
    HIGH: 'bg-orange-100 text-orange-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    LOW: 'bg-green-100 text-green-800',
  };
  return colors[priority] || 'bg-gray-100 text-gray-800';
}

export function getRecipientLabel(recipientType: RecipientType): string {
  const labels: Record<RecipientType, string> = {
    requester: 'Requester',
    owner: 'Owner',
    driver: 'Driver',
    all: 'All Users',
  };
  return labels[recipientType] || recipientType;
}

export function formatEventCode(eventCode: string): string {
  return eventCode
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
