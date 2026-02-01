/**
 * Media Service
 * 
 * Handles S3 presigned URL generation and direct uploads for the frontend.
 */

import { apiService } from './api';

export interface SignedUrlData {
  url: string;
  fields: Record<string, string>;
  s3Key: string;
  s3Folder: string;
  mediaType: string;
  expiresIn: number;
  bucket: string;
  region: string;
}

export interface UploadCompleteResponse {
  success: boolean;
  message: string;
  media: {
    id: string;
    url: string;
    thumbnailUrl?: string;
    status: string;
  };
}

export type UploadContext = 'request' | 'equipment' | 'equipment-type' | 'chat' | 'profile' | 'dispute';

class MediaService {
  private baseUrl = '/media';

  /**
   * Get a presigned POST URL for direct S3 upload
   * 
   * @param filename - Original filename with extension
   * @param context - Upload context (determines folder structure and access level)
   * @param contextId - ID of the related entity
   * @returns Presigned POST data for direct S3 upload
   */
  async getSignedUrl(
    filename: string, 
    context: UploadContext, 
    contextId: string
  ): Promise<SignedUrlData> {
    const response = await apiService.get<SignedUrlData>(
      `${this.baseUrl}/getSignedUrl/${encodeURIComponent(filename)}?context=${context}&contextId=${contextId}`
    );
    return response.data;
  }

  /**
   * Upload a file directly to S3 using presigned POST
   * 
   * @param file - File to upload
   * @param context - Upload context
   * @param contextId - ID of the related entity
   * @returns The public URL of the uploaded file
   */
  async uploadToS3(
    file: File,
    context: UploadContext,
    contextId: string
  ): Promise<string> {
    // 1. Get presigned POST URL
    const signedData = await this.getSignedUrl(file.name, context, contextId);

    // 2. Build form data for S3 POST
    const formData = new FormData();
    
    // Add all fields from the presigned POST response
    // Order matters: all fields before 'file'
    Object.entries(signedData.fields).forEach(([key, value]) => {
      formData.append(key, value);
    });
    
    // File must be the last field
    formData.append('file', file);

    // 3. Upload directly to S3
    const uploadResponse = await fetch(signedData.url, {
      method: 'POST',
      body: formData,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('S3 upload failed:', errorText);
      throw new Error(`Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
    }

    // 4. Construct the public URL
    // For equipment-type context, files are in public folder and accessible via CloudFront
    const cloudFrontDomain = process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN;
    if (cloudFrontDomain) {
      return `https://${cloudFrontDomain}/${signedData.s3Key}`;
    }
    
    // Fallback to S3 URL
    return `https://${signedData.bucket}.s3.${signedData.region}.amazonaws.com/${signedData.s3Key}`;
  }

  /**
   * Notify backend that an S3 upload completed (saves metadata to DB)
   * This is optional for equipment-type images but useful for tracking
   */
  async completeUpload(
    s3Key: string,
    originalName: string,
    mimeType: string,
    context: UploadContext,
    contextId: string,
    size?: number
  ): Promise<UploadCompleteResponse> {
    const response = await apiService.post<UploadCompleteResponse>(
      `${this.baseUrl}/s3/complete`,
      {
        s3Key,
        originalName,
        mimeType,
        context,
        contextId,
        size,
      }
    );
    return response.data;
  }

  /**
   * Upload file via multipart form (fallback for local dev without S3)
   */
  async uploadMultipart(
    file: File,
    context: UploadContext,
    contextId: string
  ): Promise<{ url: string; id: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('context', context);
    formData.append('contextId', contextId);

    const response = await apiService.upload<{ id: string; url: string }>(
      `${this.baseUrl}/upload`,
      formData
    );
    return response.data;
  }

  /**
   * Upload a file - tries S3 first, falls back to multipart
   */
  async upload(
    file: File,
    context: UploadContext,
    contextId: string
  ): Promise<string> {
    try {
      // Try S3 direct upload first
      return await this.uploadToS3(file, context, contextId);
    } catch (error) {
      console.warn('S3 upload failed, falling back to multipart:', error);
      // Fallback to multipart upload
      const result = await this.uploadMultipart(file, context, contextId);
      return result.url;
    }
  }
}

export const mediaService = new MediaService();
export default mediaService;
