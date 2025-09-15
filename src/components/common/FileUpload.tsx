import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, File, Image, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { fileUploadService, FileUploadOptions, UploadedFile, UploadProgress } from '@/services/file-upload.service';
import { toast } from 'sonner';

interface FileUploadProps {
  onUploadComplete: (files: UploadedFile[]) => void;
  onUploadError?: (error: string) => void;
  options?: FileUploadOptions;
  multiple?: boolean;
  className?: string;
  disabled?: boolean;
  maxFiles?: number;
}

interface FileWithPreview extends File {
  preview?: string;
  id: string;
  progress?: number;
  status?: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onUploadComplete,
  onUploadError,
  options = {},
  multiple = false,
  className = '',
  disabled = false,
  maxFiles = 5
}) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled) return;

    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  }, [disabled]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      handleFiles(selectedFiles);
    }
  }, []);

  const handleFiles = useCallback((newFiles: File[]) => {
    if (disabled) return;

    // Check max files limit
    if (files.length + newFiles.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Validate and prepare files
    const validFiles: FileWithPreview[] = [];
    
    newFiles.forEach((file) => {
      try {
        // Validate file
        fileUploadService.validateFile(file, options);
        
        // Create file with preview
        const fileWithPreview: FileWithPreview = Object.assign(file, {
          id: Math.random().toString(36).substr(2, 9),
          preview: fileUploadService.createPreviewUrl(file),
          status: 'pending' as const,
          type: file.type || 'application/octet-stream' // Ensure type is always defined
        });
        
        validFiles.push(fileWithPreview);
      } catch (error: any) {
        toast.error(`Invalid file: ${file.name} - ${error.message}`);
        if (onUploadError) {
          onUploadError(error.message);
        }
      }
    });

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
    }
  }, [files.length, maxFiles, options, onUploadError]);

  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove?.preview) {
        fileUploadService.revokePreviewUrl(fileToRemove.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
  }, []);

  const uploadFiles = useCallback(async () => {
    if (files.length === 0 || isUploading) return;

    setIsUploading(true);
    const uploadedFiles: UploadedFile[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Update file status to uploading
        setFiles(prev => prev.map(f => 
          f.id === file.id ? { ...f, status: 'uploading' as const, progress: 0 } : f
        ));

        try {
          const uploadedFile = await fileUploadService.uploadFile(
            file,
            options,
            (progress: UploadProgress) => {
              setFiles(prev => prev.map(f => 
                f.id === file.id ? { ...f, progress: progress.percentage } : f
              ));
            }
          );

          uploadedFiles.push(uploadedFile);
          
          // Update file status to success
          setFiles(prev => prev.map(f => 
            f.id === file.id ? { ...f, status: 'success' as const, progress: 100 } : f
          ));

        } catch (error: any) {
          // Update file status to error
          setFiles(prev => prev.map(f => 
            f.id === file.id ? { 
              ...f, 
              status: 'error' as const, 
              error: error.message 
            } : f
          ));
          
          toast.error(`Failed to upload ${file.name}: ${error.message}`);
        }
      }

      if (uploadedFiles.length > 0) {
        onUploadComplete(uploadedFiles);
        toast.success(`Successfully uploaded ${uploadedFiles.length} file(s)`);
        
        // Clear successfully uploaded files after a delay
        setTimeout(() => {
          setFiles(prev => prev.filter(f => f.status !== 'success'));
        }, 2000);
      }

    } finally {
      setIsUploading(false);
    }
  }, [files, isUploading, options, onUploadComplete]);

  const openFileDialog = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  const getFileIcon = (file: FileWithPreview) => {
    if (file.type && fileUploadService.isImageFile(file)) {
      return <Image className="w-4 h-4" />;
    }
    return <File className="w-4 h-4" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'uploading':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      default:
        return null;
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Upload Area */}
      <Card 
        className={`
          relative border-2 border-dashed transition-colors cursor-pointer
          ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <div className="p-8 text-center">
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {isDragOver ? 'Drop files here' : 'Upload files'}
          </h3>
          <p className="text-gray-500 mb-4">
            Drag and drop files here, or click to select files
          </p>
          <Button 
            type="button" 
            variant="outline" 
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation();
              openFileDialog();
            }}
          >
            Choose Files
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple={multiple}
            onChange={handleFileInput}
            className="hidden"
            accept={options.allowedTypes?.join(',')}
          />
        </div>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            Selected Files ({files.length}/{maxFiles})
          </h4>
          {files.map((file) => (
            <Card key={file.id} className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  {getFileIcon(file)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-xs">
                        {fileUploadService.formatFileSize(file.size)}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {file.type}
                      </Badge>
                    </div>
                    {file.status === 'uploading' && file.progress !== undefined && (
                      <div className="mt-2">
                        <Progress value={file.progress} className="h-1" />
                        <p className="text-xs text-gray-500 mt-1">
                          {file.progress}% uploaded
                        </p>
                      </div>
                    )}
                    {file.status === 'error' && file.error && (
                      <p className="text-xs text-red-500 mt-1">
                        {file.error}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(file.status || 'pending')}
                  {file.status !== 'uploading' && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                      disabled={isUploading}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {files.length > 0 && (
        <div className="mt-4 flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setFiles([])}
            disabled={isUploading}
          >
            Clear All
          </Button>
          <Button
            type="button"
            onClick={uploadFiles}
            disabled={isUploading || files.every(f => f.status === 'success')}
          >
            {isUploading ? 'Uploading...' : `Upload ${files.length} File(s)`}
          </Button>
        </div>
      )}
    </div>
  );
};
