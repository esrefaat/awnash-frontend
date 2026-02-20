import { mediaService } from './mediaService';
import { apiService } from './api';

jest.mock('./api', () => ({
  apiService: {
    get: jest.fn(),
    post: jest.fn(),
    upload: jest.fn(),
  },
}));

const mockGet = apiService.get as jest.Mock;
const mockPost = apiService.post as jest.Mock;
const mockUpload = (apiService as any).upload as jest.Mock;

const originalFetch = global.fetch;

beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = jest.fn();
});

afterEach(() => {
  global.fetch = originalFetch;
});

function createMockFile(name = 'photo.jpg', type = 'image/jpeg', size = 1024): File {
  const blob = new Blob(['x'.repeat(size)], { type });
  return new File([blob], name, { type });
}

describe('mediaService', () => {
  describe('getSignedUrl', () => {
    it('calls apiService.get with correct URL', async () => {
      const signedData = {
        url: 'https://s3.amazonaws.com/bucket',
        fields: { key: 'uploads/photo.jpg' },
        s3Key: 'uploads/photo.jpg',
        s3Folder: 'uploads',
        mediaType: 'image',
        expiresIn: 3600,
        bucket: 'my-bucket',
        region: 'us-east-1',
      };
      mockGet.mockResolvedValue({ data: signedData });

      const result = await mediaService.getSignedUrl('photo.jpg', 'equipment', 'eq1');

      expect(mockGet).toHaveBeenCalledWith(
        '/media/getSignedUrl/photo.jpg?context=equipment&contextId=eq1',
      );
      expect(result).toEqual(signedData);
    });

    it('encodes the filename', async () => {
      mockGet.mockResolvedValue({ data: {} });

      await mediaService.getSignedUrl('my file (1).jpg', 'profile', 'u1');

      expect(mockGet).toHaveBeenCalledWith(
        expect.stringContaining('my%20file%20(1).jpg'),
      );
    });
  });

  describe('completeUpload', () => {
    it('calls apiService.post with all fields', async () => {
      const response = { success: true, message: 'ok', media: { id: 'm1', url: 'u', status: 'pending' } };
      mockPost.mockResolvedValue({ data: response });

      const result = await mediaService.completeUpload(
        'uploads/photo.jpg', 'photo.jpg', 'image/jpeg', 'equipment', 'eq1', 2048,
      );

      expect(mockPost).toHaveBeenCalledWith('/media/s3/complete', {
        s3Key: 'uploads/photo.jpg',
        originalName: 'photo.jpg',
        mimeType: 'image/jpeg',
        context: 'equipment',
        contextId: 'eq1',
        size: 2048,
      });
      expect(result).toEqual(response);
    });
  });

  describe('uploadToS3', () => {
    it('gets signed URL then uploads to S3', async () => {
      const signedData = {
        url: 'https://bucket.s3.us-east-1.amazonaws.com',
        fields: { key: 'uploads/photo.jpg', policy: 'abc', 'x-amz-credential': 'cred' },
        s3Key: 'uploads/photo.jpg',
        s3Folder: 'uploads',
        mediaType: 'image',
        expiresIn: 3600,
        bucket: 'bucket',
        region: 'us-east-1',
      };
      mockGet.mockResolvedValue({ data: signedData });
      (global.fetch as jest.Mock).mockResolvedValue({ ok: true, text: () => Promise.resolve('') });

      const file = createMockFile();
      const result = await mediaService.uploadToS3(file, 'equipment', 'eq1');

      expect(mockGet).toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalledWith(
        signedData.url,
        expect.objectContaining({ method: 'POST' }),
      );
      expect(result).toContain('uploads/photo.jpg');
    });

    it('throws when S3 upload fails', async () => {
      const signedData = {
        url: 'https://bucket.s3.amazonaws.com',
        fields: {},
        s3Key: 'k',
        s3Folder: 'f',
        mediaType: 'image',
        expiresIn: 3600,
        bucket: 'b',
        region: 'us-east-1',
      };
      mockGet.mockResolvedValue({ data: signedData });
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        text: () => Promise.resolve('Access Denied'),
      });

      const file = createMockFile();
      await expect(mediaService.uploadToS3(file, 'equipment', 'eq1'))
        .rejects.toThrow('Upload failed: 403 Forbidden');
    });

    it('returns CloudFront URL when env var is set', async () => {
      process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN = 'cdn.example.com';
      const signedData = {
        url: 'https://bucket.s3.us-east-1.amazonaws.com',
        fields: {},
        s3Key: 'uploads/photo.jpg',
        s3Folder: 'uploads',
        mediaType: 'image',
        expiresIn: 3600,
        bucket: 'bucket',
        region: 'us-east-1',
      };
      mockGet.mockResolvedValue({ data: signedData });
      (global.fetch as jest.Mock).mockResolvedValue({ ok: true, text: () => Promise.resolve('') });

      const file = createMockFile();
      const result = await mediaService.uploadToS3(file, 'equipment', 'eq1');

      expect(result).toBe('https://cdn.example.com/uploads/photo.jpg');
      delete process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN;
    });
  });

  describe('uploadMultipart', () => {
    it('calls apiService.upload with FormData', async () => {
      mockUpload.mockResolvedValue({ data: { id: 'm1', url: 'https://example.com/photo.jpg' } });

      const file = createMockFile();
      const result = await mediaService.uploadMultipart(file, 'profile', 'u1');

      expect(mockUpload).toHaveBeenCalledWith('/media/upload', expect.any(FormData));
      expect(result).toEqual({ id: 'm1', url: 'https://example.com/photo.jpg' });
    });
  });

  describe('upload', () => {
    it('tries S3 first and returns URL on success', async () => {
      const signedData = {
        url: 'https://bucket.s3.us-east-1.amazonaws.com',
        fields: {},
        s3Key: 'uploads/photo.jpg',
        s3Folder: 'uploads',
        mediaType: 'image',
        expiresIn: 3600,
        bucket: 'bucket',
        region: 'us-east-1',
      };
      mockGet.mockResolvedValue({ data: signedData });
      (global.fetch as jest.Mock).mockResolvedValue({ ok: true, text: () => Promise.resolve('') });

      const file = createMockFile();
      const result = await mediaService.upload(file, 'equipment', 'eq1');

      expect(result).toContain('uploads/photo.jpg');
      expect(mockUpload).not.toHaveBeenCalled();
    });

    it('falls back to multipart when S3 fails', async () => {
      mockGet.mockRejectedValue(new Error('S3 unavailable'));
      mockUpload.mockResolvedValue({ data: { id: 'm1', url: 'https://fallback.com/photo.jpg' } });

      const file = createMockFile();
      const result = await mediaService.upload(file, 'equipment', 'eq1');

      expect(mockUpload).toHaveBeenCalled();
      expect(result).toBe('https://fallback.com/photo.jpg');
    });
  });
});
