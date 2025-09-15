import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileUpload, UploadedFile } from '@/services/file-upload.service';
import { fileUploadService } from '@/services/file-upload.service';
import { 
  FileText, 
  Image, 
  Download, 
  Eye, 
  Trash2, 
  Calendar,
  File,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

interface FileManagerProps {
  files: UploadedFile[];
  onFilesUpdate: (files: UploadedFile[]) => void;
  title?: string;
  description?: string;
  uploadOptions?: {
    category?: string;
    maxSize?: number;
    allowedTypes?: string[];
    multiple?: boolean;
    maxFiles?: number;
  };
  showUpload?: boolean;
  showPreview?: boolean;
  showDownload?: boolean;
  showDelete?: boolean;
  className?: string;
}

export const FileManager: React.FC<FileManagerProps> = ({
  files,
  onFilesUpdate,
  title = "Files",
  description = "Manage your uploaded files",
  uploadOptions = {},
  showUpload = true,
  showPreview = true,
  showDownload = true,
  showDelete = true,
  className = ""
}) => {
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadComplete = async (uploadedFiles: UploadedFile[]) => {
    if (uploadedFiles.length === 0) return;

    setIsUploading(true);
    try {
      const updatedFiles = [...files, ...uploadedFiles];
      onFilesUpdate(updatedFiles);
      toast.success(`Successfully uploaded ${uploadedFiles.length} file(s)`);
    } catch (error: any) {
      toast.error('Failed to upload files');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      const updatedFiles = files.filter(file => file.id !== fileId);
      onFilesUpdate(updatedFiles);
      toast.success('File deleted successfully');
    } catch (error: any) {
      toast.error('Failed to delete file');
    }
  };

  const handleDownloadFile = (file: UploadedFile) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreviewFile = (file: UploadedFile) => {
    setPreviewFile(file);
  };

  const getFileIcon = (file: UploadedFile) => {
    if (fileUploadService.isImageFile({ type: file.type } as File)) {
      return <Image className="w-5 h-5 text-blue-500" />;
    }
    return <FileText className="w-5 h-5 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{title}</span>
            <Badge variant="secondary">
              {files.length} file(s)
            </Badge>
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Upload Section */}
          {showUpload && (
            <div className="mb-6">
              <FileUpload
                onUploadComplete={handleUploadComplete}
                options={{
                  category: uploadOptions.category || 'general',
                  maxSize: uploadOptions.maxSize || 10 * 1024 * 1024, // 10MB
                  allowedTypes: uploadOptions.allowedTypes || [
                    'application/pdf',
                    'image/jpeg',
                    'image/png',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                  ],
                  multiple: uploadOptions.multiple !== false,
                  maxFiles: uploadOptions.maxFiles || 10
                }}
                multiple={uploadOptions.multiple !== false}
                maxFiles={uploadOptions.maxFiles || 10}
                disabled={isUploading}
              />
            </div>
          )}

          {/* Files List */}
          {files.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <File className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">No files uploaded</p>
              <p className="text-sm">Upload your first file to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {files.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {getFileIcon(file)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{file.name}</p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>{formatFileSize(file.size)}</span>
                        <span>•</span>
                        <span>{file.type}</span>
                        <span>•</span>
                        <span>{formatDate(file.uploadedAt)}</span>
                      </div>
                      {file.category && (
                        <Badge variant="outline" className="text-xs mt-1">
                          {file.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {showPreview && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePreviewFile(file)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {showDownload && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadFile(file)}
                        className="h-8 w-8 p-0"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(file.url, '_blank')}
                      className="h-8 w-8 p-0"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    
                    {showDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteFile(file.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* File Preview Dialog */}
      <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{previewFile?.name}</DialogTitle>
            <DialogDescription>
              {previewFile && (
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{formatFileSize(previewFile.size)}</span>
                  <span>•</span>
                  <span>{previewFile.type}</span>
                  <span>•</span>
                  <span>{formatDate(previewFile.uploadedAt)}</span>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {previewFile && (
            <div className="mt-4">
              {fileUploadService.isImageFile({ type: previewFile.type } as File) ? (
                <img 
                  src={previewFile.url} 
                  alt={previewFile.name}
                  className="max-w-full h-auto rounded-lg border"
                />
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500 mb-4">Preview not available for this file type</p>
                  <Button onClick={() => window.open(previewFile.url, '_blank')}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open in New Tab
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
