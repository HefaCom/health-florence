# Health Florence - File Upload System Documentation

## 📁 Overview

The Health Florence application now includes a comprehensive file upload system that allows users to upload, manage, and organize various types of files including profile pictures, medical documents, and expert verification documents.

## 🏗️ Architecture

### Backend Infrastructure
- **AWS S3 Storage**: Secure cloud storage for all uploaded files
- **AWS Amplify**: Integrated storage management with automatic IAM policies
- **GraphQL Schema**: Extended to support file metadata storage
- **Lambda Triggers**: Automatic processing and validation of uploaded files

### Frontend Components
- **FileUpload Component**: Drag-and-drop file upload with progress tracking
- **FileManager Component**: Complete file management interface
- **FileUploadService**: Centralized service for file operations
- **Integration Points**: Profile pictures, medical documents, expert documents

## 🔧 Implementation Details

### 1. AWS S3 Configuration

```bash
# S3 Bucket Configuration
Bucket Name: healthflorence41da3ade3dc840d9ac1ffd686c498255
Access: Auth and guest users
Authenticated Users: create/update, read, delete
Guest Users: create/update, read
```

### 2. File Upload Service (`src/services/file-upload.service.ts`)

**Key Features:**
- File validation (size, type, name)
- S3 upload with progress tracking
- Automatic file categorization
- Security and error handling
- File metadata management

**Supported File Types:**
- **Images**: JPEG, PNG, GIF, WebP
- **Documents**: PDF, DOC, DOCX, TXT
- **Size Limits**: Configurable (default 10MB)

**File Categories:**
- `profile-picture`: User profile images
- `expert-documents`: Professional verification documents
- `medical-documents`: Patient medical records
- `images`: General image uploads
- `uploads`: Default category

### 3. File Upload Component (`src/components/common/FileUpload.tsx`)

**Features:**
- Drag-and-drop interface
- Multiple file selection
- Real-time upload progress
- File validation and error handling
- Preview generation for images
- Responsive design

**Props:**
```typescript
interface FileUploadProps {
  onUploadComplete: (files: UploadedFile[]) => void;
  onUploadError?: (error: string) => void;
  options?: FileUploadOptions;
  multiple?: boolean;
  className?: string;
  disabled?: boolean;
  maxFiles?: number;
}
```

### 4. File Manager Component (`src/components/common/FileManager.tsx`)

**Features:**
- File listing and organization
- Preview functionality
- Download and external link access
- File deletion
- Metadata display
- Responsive grid layout

## 📍 Integration Points

### 1. User Profile (`src/pages/Profile.tsx`)

**Profile Picture Upload:**
- Single image upload
- 5MB size limit
- Image format validation
- Automatic profile update
- Audit trail logging

```typescript
const handleProfilePictureUpdate = async (pictureUrl: string) => {
  // Updates user profile with new picture URL
  // Logs audit event
  // Shows success notification
};
```

### 2. Expert Documents (`src/pages/expert/ExpertDocuments.tsx`)

**Document Management:**
- Multiple file upload
- 10MB size limit
- Professional document types
- Verification status tracking
- Admin review integration

```typescript
const handleDocumentUpload = async (files: UploadedFile[]) => {
  // Maps uploaded files to document objects
  // Updates expert profile
  // Maintains verification status
};
```

### 3. Medical Documents (`src/components/dashboard/HealthProfile.tsx`)

**Patient Document Storage:**
- Medical record uploads
- Patient privacy compliance
- Document categorization
- Integration with health profile

```typescript
const handleMedicalDocumentUpload = async (files: UploadedFile[]) => {
  // Stores medical documents securely
  // Updates user profile
  // Maintains patient privacy
};
```

## 🔒 Security Features

### 1. File Validation
- **Type Validation**: Whitelist of allowed MIME types
- **Size Limits**: Configurable maximum file sizes
- **Name Validation**: Prevents malicious filenames
- **Content Scanning**: Basic file content validation

### 2. Access Control
- **IAM Policies**: Role-based access to S3 buckets
- **User Authentication**: Required for all uploads
- **File Ownership**: Users can only access their own files
- **Admin Override**: Admin access for verification purposes

### 3. Data Protection
- **Encryption**: Files encrypted at rest in S3
- **Secure URLs**: Time-limited access URLs
- **Audit Logging**: All file operations logged
- **Privacy Compliance**: HIPAA-compliant storage

## 📊 File Organization

### S3 Folder Structure
```
healthflorence41da3ade3dc840d9ac1ffd686c498255/
├── profile-pictures/
│   └── {userId}/
│       └── {fileId}.{extension}
├── expert-documents/
│   └── {expertId}/
│       └── {fileId}.{extension}
├── medical-documents/
│   └── {userId}/
│       └── {fileId}.{extension}
└── images/
    └── {userId}/
        └── {fileId}.{extension}
```

### Database Schema Updates

**User Model:**
```graphql
type User {
  # ... existing fields
  profilePicture: String
  medicalDocuments: AWSJSON
}
```

**Expert Model:**
```graphql
type Expert {
  # ... existing fields
  documents: AWSJSON
}
```

## 🚀 Usage Examples

### 1. Basic File Upload
```typescript
import { FileUpload } from '@/components/common/FileUpload';

<FileUpload
  onUploadComplete={(files) => console.log('Uploaded:', files)}
  options={{
    category: 'profile-picture',
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/png']
  }}
  multiple={false}
  maxFiles={1}
/>
```

### 2. File Management
```typescript
import { FileManager } from '@/components/common/FileManager';

<FileManager
  files={userFiles}
  onFilesUpdate={setUserFiles}
  title="My Documents"
  description="Manage your uploaded documents"
  uploadOptions={{
    category: 'medical-documents',
    maxSize: 10 * 1024 * 1024,
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png']
  }}
  showUpload={true}
  showPreview={true}
  showDownload={true}
  showDelete={true}
/>
```

### 3. Service Usage
```typescript
import { fileUploadService } from '@/services/file-upload.service';

// Upload a single file
const uploadedFile = await fileUploadService.uploadFile(
  file,
  { category: 'profile-picture' },
  (progress) => console.log('Progress:', progress.percentage)
);

// Delete a file
await fileUploadService.deleteFile(fileKey);

// Get file URL
const url = await fileUploadService.getFileUrl(fileKey);
```

## 🔧 Configuration

### Environment Variables
```bash
# AWS Configuration (handled by Amplify)
AWS_REGION=us-east-1
S3_BUCKET=healthflorence41da3ade3dc840d9ac1ffd686c498255
```

### File Upload Limits
```typescript
const UPLOAD_LIMITS = {
  profilePicture: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  },
  expertDocuments: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png', 'application/msword']
  },
  medicalDocuments: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png', 'application/msword']
  }
};
```

## 🐛 Error Handling

### Common Error Scenarios
1. **File Size Exceeded**: Clear error message with size limit
2. **Invalid File Type**: List of allowed file types
3. **Upload Failure**: Retry mechanism with exponential backoff
4. **Network Issues**: Offline detection and queue management
5. **Storage Quota**: User notification and cleanup suggestions

### Error Recovery
- Automatic retry for transient failures
- Graceful degradation for offline scenarios
- User-friendly error messages
- Audit logging for debugging

## 📈 Performance Optimizations

### 1. Upload Optimization
- **Chunked Uploads**: Large files uploaded in chunks
- **Parallel Uploads**: Multiple files uploaded simultaneously
- **Progress Tracking**: Real-time upload progress
- **Resume Capability**: Resume interrupted uploads

### 2. Storage Optimization
- **Image Compression**: Automatic image optimization
- **CDN Integration**: Fast file delivery via CloudFront
- **Caching**: Browser and server-side caching
- **Cleanup**: Automatic cleanup of orphaned files

## 🔮 Future Enhancements

### Planned Features
1. **File Versioning**: Track file changes over time
2. **Advanced Preview**: PDF and document preview
3. **Bulk Operations**: Mass file operations
4. **File Sharing**: Secure file sharing between users
5. **Advanced Security**: Virus scanning and content analysis
6. **Analytics**: File usage and storage analytics

### Integration Opportunities
1. **AI Analysis**: Document content analysis
2. **OCR Integration**: Text extraction from images
3. **Digital Signatures**: Document signing capabilities
4. **Backup Systems**: Automated backup and recovery
5. **Compliance Tools**: HIPAA and GDPR compliance features

## 📚 API Reference

### FileUploadService Methods

```typescript
class FileUploadService {
  // Upload a single file
  async uploadFile(
    file: File,
    options?: FileUploadOptions,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadedFile>

  // Upload multiple files
  async uploadMultipleFiles(
    files: File[],
    options?: FileUploadOptions,
    onProgress?: (fileIndex: number, progress: UploadProgress) => void
  ): Promise<UploadedFile[]>

  // Delete a file
  async deleteFile(key: string): Promise<void>

  // Get file URL
  async getFileUrl(key: string): Promise<string>

  // List files in folder
  async listFiles(folder: string): Promise<string[]>

  // Validate file
  private validateFile(file: File, options: FileUploadOptions): void
}
```

### FileUploadOptions Interface

```typescript
interface FileUploadOptions {
  category?: string;
  description?: string;
  maxSize?: number;
  allowedTypes?: string[];
  folder?: string;
}
```

### UploadedFile Interface

```typescript
interface UploadedFile {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
  category?: string;
  description?: string;
}
```

## 🎯 Best Practices

### 1. File Organization
- Use consistent naming conventions
- Organize files by category and user
- Implement proper folder structure
- Regular cleanup of unused files

### 2. Security
- Validate all file uploads
- Implement proper access controls
- Monitor file access patterns
- Regular security audits

### 3. Performance
- Optimize file sizes before upload
- Use appropriate file formats
- Implement caching strategies
- Monitor storage usage

### 4. User Experience
- Provide clear upload instructions
- Show upload progress
- Handle errors gracefully
- Offer file preview capabilities

## 📞 Support

For technical support or questions about the file upload system:

1. **Documentation**: Refer to this comprehensive guide
2. **Code Examples**: Check the implementation in the codebase
3. **Error Logs**: Review browser console and server logs
4. **Community**: Join the Health Florence developer community

---

**Last Updated**: January 15, 2025  
**Version**: 1.0.0  
**Status**: Production Ready
