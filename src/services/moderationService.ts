/**
 * Moderation Service
 * 
 * Handles API calls for admin media moderation functionality.
 * Includes endpoints for listing pending/flagged media and approve/reject actions.
 */

import { apiService, ApiError } from './api';

// Types
export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  PDF = 'pdf',
  DOCUMENT = 'document'
}

export enum MediaStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  FLAGGED = 'flagged'
}

export interface ModerationLabel {
  name: string;
  confidence: number;
}

export type MediaContext = 'request' | 'equipment' | 'equipment-type' | 'chat' | 'profile' | 'dispute' | 'video-thumbnail';

export interface MediaFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  mediaType: MediaType;
  url: string;
  s3Key?: string;
  s3Folder: string;
  status: MediaStatus;
  thumbnailUrl?: string;
  size?: number;
  width?: string;
  height?: string;
  duration?: string;
  altText?: string;
  description?: string;
  uploadedBy: string;
  context?: MediaContext;
  contextId?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  moderationLabels?: ModerationLabel[];
  moderationScore?: number;
  moderatedAt?: string;
  moderatedBy?: string;
  moderator?: {
    id: string;
    name: string;
  };
  rejectionReason?: string;
}

export interface ContextGroup {
  context: string;
  contextId: string;
  count: number;
  files: MediaFile[];
}

export interface PaginatedMediaWithGroupsResponse extends PaginatedMediaResponse {
  contextGroups?: { [key: string]: ContextGroup };
}

export interface PaginatedMediaResponse {
  data: MediaFile[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApproveMediaResponse {
  success: boolean;
  message: string;
  media: {
    id: string;
    status: MediaStatus;
    url: string;
  };
}

export interface RejectMediaResponse {
  success: boolean;
  message: string;
  media: {
    id: string;
    status: MediaStatus;
    rejectionReason?: string;
  };
}

export interface ModerationCounts {
  pending: number;
  flagged: number;
  total: number;
}

// Rejection reason presets for convenience
export const REJECTION_REASON_PRESETS = {
  inappropriateContent: {
    en: 'Contains inappropriate or offensive content',
    ar: 'يحتوي على محتوى غير لائق أو مسيء'
  },
  lowQuality: {
    en: 'Image quality is too low or blurry',
    ar: 'جودة الصورة منخفضة جداً أو ضبابية'
  },
  copyrightViolation: {
    en: 'Potential copyright violation detected',
    ar: 'تم اكتشاف انتهاك محتمل لحقوق النشر'
  },
  misleadingContent: {
    en: 'Content appears misleading or deceptive',
    ar: 'يبدو أن المحتوى مضلل أو خادع'
  },
  notRelevant: {
    en: 'Content not relevant to the listing',
    ar: 'المحتوى غير مرتبط بالإعلان'
  },
  duplicateContent: {
    en: 'Duplicate or repeated content',
    ar: 'محتوى مكرر'
  },
  violatesGuidelines: {
    en: 'Violates community guidelines',
    ar: 'ينتهك إرشادات المجتمع'
  },
  other: {
    en: 'Other (see notes)',
    ar: 'أخرى (انظر الملاحظات)'
  }
};

/**
 * Moderation Service Class
 */
class ModerationService {
  private baseUrl = '/media';

  /**
   * Get list of pending media files for moderation
   */
  async getPendingMedia(page: number = 1, limit: number = 20): Promise<PaginatedMediaResponse> {
    const response = await apiService.get<PaginatedMediaResponse>(
      `${this.baseUrl}/admin/pending?page=${page}&limit=${limit}`
    );
    return response.data;
  }

  /**
   * Get list of flagged media files for review
   */
  async getFlaggedMedia(page: number = 1, limit: number = 20): Promise<PaginatedMediaResponse> {
    const response = await apiService.get<PaginatedMediaResponse>(
      `${this.baseUrl}/admin/flagged?page=${page}&limit=${limit}`
    );
    return response.data;
  }

  /**
   * Get combined pending and flagged media (legacy - use getMediaList for full filtering)
   */
  async getModerationQueue(
    page: number = 1,
    limit: number = 20,
    filter: 'all' | 'pending' | 'flagged' = 'all'
  ): Promise<PaginatedMediaResponse> {
    if (filter === 'pending') {
      return this.getPendingMedia(page, limit);
    }
    if (filter === 'flagged') {
      return this.getFlaggedMedia(page, limit);
    }
    
    // For 'all', fetch both and combine (simplified - in production, backend should handle this)
    const [pending, flagged] = await Promise.all([
      this.getPendingMedia(page, limit),
      this.getFlaggedMedia(page, limit)
    ]);

    // Combine and deduplicate
    const allMedia = [...pending.data, ...flagged.data];
    const uniqueMedia = allMedia.filter((media, index, self) =>
      index === self.findIndex(m => m.id === media.id)
    );

    return {
      data: uniqueMedia,
      pagination: {
        page,
        limit,
        total: pending.pagination.total + flagged.pagination.total,
        totalPages: Math.max(pending.pagination.totalPages, flagged.pagination.totalPages)
      }
    };
  }

  /**
   * Get media list with full filtering support (status, context, grouping)
   */
  async getMediaList(
    page: number = 1,
    limit: number = 20,
    status?: MediaStatus | 'all',
    context?: MediaContext,
    groupByContext: boolean = false
  ): Promise<PaginatedMediaWithGroupsResponse> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    if (status && status !== 'all') {
      params.append('status', status);
    }
    
    if (context) {
      params.append('context', context);
    }
    
    if (groupByContext) {
      params.append('groupByContext', 'true');
    }

    const response = await apiService.get<PaginatedMediaWithGroupsResponse>(
      `${this.baseUrl}/admin/list?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Approve a media file
   */
  async approveMedia(id: string): Promise<ApproveMediaResponse> {
    const response = await apiService.post<ApproveMediaResponse>(
      `${this.baseUrl}/admin/${id}/approve`,
      {}
    );
    // Handle both wrapped {data: {...}} and unwrapped API responses
    return response.data ?? (response as unknown as ApproveMediaResponse);
  }

  /**
   * Reject a media file
   */
  async rejectMedia(id: string, reason?: string): Promise<RejectMediaResponse> {
    const response = await apiService.post<RejectMediaResponse>(
      `${this.baseUrl}/admin/${id}/reject`,
      { reason }
    );
    return response.data;
  }

  /**
   * Bulk approve multiple media files
   */
  async bulkApprove(ids: string[]): Promise<{ success: boolean; results: ApproveMediaResponse[] }> {
    const results = await Promise.allSettled(
      ids.map(id => this.approveMedia(id))
    );

    const successfulResults = results
      .filter((r): r is PromiseFulfilledResult<ApproveMediaResponse> => r.status === 'fulfilled')
      .map(r => r.value);

    return {
      success: successfulResults.length === ids.length,
      results: successfulResults
    };
  }

  /**
   * Bulk reject multiple media files
   */
  async bulkReject(ids: string[], reason?: string): Promise<{ success: boolean; results: RejectMediaResponse[] }> {
    const results = await Promise.allSettled(
      ids.map(id => this.rejectMedia(id, reason))
    );

    const successfulResults = results
      .filter((r): r is PromiseFulfilledResult<RejectMediaResponse> => r.status === 'fulfilled')
      .map(r => r.value);

    return {
      success: successfulResults.length === ids.length,
      results: successfulResults
    };
  }

  /**
   * Get moderation counts for dashboard widget
   */
  async getModerationCounts(): Promise<ModerationCounts> {
    try {
      const [pending, flagged] = await Promise.all([
        this.getPendingMedia(1, 1),
        this.getFlaggedMedia(1, 1)
      ]);

      return {
        pending: pending.pagination.total,
        flagged: flagged.pagination.total,
        total: pending.pagination.total + flagged.pagination.total
      };
    } catch (error) {
      console.error('Failed to fetch moderation counts:', error);
      return { pending: 0, flagged: 0, total: 0 };
    }
  }

  /**
   * Get presigned URL for viewing pending/rejected media
   */
  async getMediaUrl(id: string): Promise<{ url: string; status: MediaStatus }> {
    const response = await apiService.get<{ success: boolean; url: string; status: MediaStatus }>(
      `${this.baseUrl}/${id}/url`
    );
    return response.data;
  }
}

export const moderationService = new ModerationService();
export default moderationService;
