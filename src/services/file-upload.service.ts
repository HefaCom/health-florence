import { uploadData, remove, list, getUrl } from 'aws-amplify/storage';
import { v4 as uuidv4 } from 'uuid';

export interface UploadedFile {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
  category?: string;
  description?: string;
}

export interface FileUploadOptions {
  category?: string;
  description?: string;
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  folder?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

class FileUploadService {
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB default
  private readonly ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  private readonly ALLOWED_DOCUMENT_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg',
    'image/png'
  ];

  /**
   * Upload a file to S3
   */
  async uploadFile(
    file: File,
    options: FileUploadOptions = {},
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadedFile> {
    try {
      // Validate file
      this.validateFile(file, options);

      // Generate unique filename
      const fileId = uuidv4();
      const fileExtension = file.name.split('.').pop();
      const fileName = `${fileId}.${fileExtension}`;
      
      // Determine folder based on category
      const folder = this.getFolderPath(options.category, options.folder);
      const key = `${folder}${fileName}`;

      // Upload to S3
      const result = await uploadData({
        key,
        data: file,
        options: {
          contentType: file.type,
          onProgress: (progress) => {
            if (onProgress) {
              onProgress({
                loaded: progress.transferredBytes,
                total: progress.totalBytes,
                percentage: Math.round((progress.transferredBytes / progress.totalBytes) * 100)
              });
            }
          }
        }
      }).result;

      // Get the public URL
      const url = await getUrl({ key });

      return {
        id: fileId,
        name: file.name,
        url: url.url.toString(),
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
        category: options.category,
        description: options.description
      };
    } catch (error: any) {
      console.error('Error uploading file:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(
    files: File[],
    options: FileUploadOptions = {},
    onProgress?: (fileIndex: number, progress: UploadProgress) => void
  ): Promise<UploadedFile[]> {
    const uploadPromises = files.map((file, index) => 
      this.uploadFile(file, options, (progress) => {
        if (onProgress) {
          onProgress(index, progress);
        }
      })
    );

    return Promise.all(uploadPromises);
  }

  /**
   * Delete a file from S3
   */
  async deleteFile(key: string): Promise<void> {
    try {
      await remove({ key });
    } catch (error: any) {
      console.error('Error deleting file:', error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Get file URL
   */
  async getFileUrl(key: string): Promise<string> {
    try {
      const url = await getUrl({ key });
      return url.url.toString();
    } catch (error: any) {
      console.error('Error getting file URL:', error);
      throw new Error(`Failed to get file URL: ${error.message}`);
    }
  }

  /**
   * List files in a folder
   */
  async listFiles(folder: string): Promise<string[]> {
    try {
      const result = await list({ prefix: folder });
      return result.items.map(item => item.key);
    } catch (error: any) {
      console.error('Error listing files:', error);
      throw new Error(`Failed to list files: ${error.message}`);
    }
  }

  /**
   * Validate file before upload
   */
  validateFile(file: File, options: FileUploadOptions): void {
    // Check file size
    const maxSize = options.maxSize || this.MAX_FILE_SIZE;
    if (file.size > maxSize) {
      throw new Error(`File size exceeds maximum allowed size of ${this.formatFileSize(maxSize)}`);
    }

    // Check file type
    const allowedTypes = options.allowedTypes || this.getAllowedTypes(options.category);
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }

    // Check file name
    if (!file.name || file.name.trim() === '') {
      throw new Error('File name cannot be empty');
    }
  }

  /**
   * Get allowed file types based on category
   */
  private getAllowedTypes(category?: string): string[] {
    switch (category) {
      case 'profile-picture':
        return this.ALLOWED_IMAGE_TYPES;
      case 'expert-documents':
      case 'medical-documents':
        return this.ALLOWED_DOCUMENT_TYPES;
      case 'images':
        return this.ALLOWED_IMAGE_TYPES;
      default:
        return [...this.ALLOWED_IMAGE_TYPES, ...this.ALLOWED_DOCUMENT_TYPES];
    }
  }

  /**
   * Get folder path based on category
   */
  private getFolderPath(category?: string, customFolder?: string): string {
    if (customFolder) {
      return customFolder.endsWith('/') ? customFolder : `${customFolder}/`;
    }

    switch (category) {
      case 'profile-picture':
        return 'profile-pictures/';
      case 'expert-documents':
        return 'expert-documents/';
      case 'medical-documents':
        return 'medical-documents/';
      case 'images':
        return 'images/';
      default:
        return 'uploads/';
    }
  }


  /**
   * Get file extension from filename
   */
  getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }

  /**
   * Check if file is an image
   */
  isImageFile(file: File): boolean {
    return file.type && file.type.startsWith('image/');
  }

  /**
   * Check if file is a document
   */
  isDocumentFile(file: File): boolean {
    if (!file.type) return false;
    const documentTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    return documentTypes.includes(file.type);
  }

  /**
   * Generate preview URL for images
   */
  createPreviewUrl(file: File): string {
    if (this.isImageFile(file)) {
      return URL.createObjectURL(file);
    }
    return '';
  }

  /**
   * Revoke preview URL to free memory
   */
  revokePreviewUrl(url: string): void {
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }

  /**
   * Get file icon based on type
   */
  getFileIcon(fileType: string): string {
    if (!fileType) return '📎';
    if (fileType.startsWith('image/')) {
      return '🖼️';
    } else if (fileType === 'application/pdf') {
      return '📄';
    } else if (fileType.includes('word')) {
      return '📝';
    } else if (fileType === 'text/plain') {
      return '📃';
    } else {
      return '📎';
    }
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export const fileUploadService = new FileUploadService();
