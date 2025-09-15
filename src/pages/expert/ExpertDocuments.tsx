import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { expertService } from '@/services/expert.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { 
  FileText, 
  Upload, 
  Download,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Trash2,
  Calendar,
  Shield
} from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
}

const REQUIRED_DOCUMENTS = [
  { type: 'medical_license', name: 'Medical License', required: true },
  { type: 'board_certification', name: 'Board Certification', required: true },
  { type: 'liability_insurance', name: 'Professional Liability Insurance', required: true },
  { type: 'dea_registration', name: 'DEA Registration', required: false },
  { type: 'malpractice_insurance', name: 'Malpractice Insurance', required: false },
  { type: 'hospital_privileges', name: 'Hospital Privileges', required: false }
];

export default function ExpertDocuments() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    loadDocuments();
  }, [user]);

  const loadDocuments = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const expert = await expertService.getExpertByUserId(user.id);
      
      if (expert?.documents) {
        try {
          const documents = typeof expert.documents === 'string' 
            ? JSON.parse(expert.documents) 
            : expert.documents;
          setDocuments(documents as Document[]);
        } catch (error) {
          console.error('Error parsing documents:', error);
          setDocuments([]);
        }
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // TODO: Implement actual file upload to AWS S3 or similar
      await new Promise(resolve => setTimeout(resolve, 2000));

      clearInterval(progressInterval);
      setUploadProgress(100);

      // For now, add a mock document
      const newDocument: Document = {
        id: `doc_${Date.now()}`,
        name: files[0].name,
        type: 'medical_license', // This should be determined by the user
        url: URL.createObjectURL(files[0]),
        uploadedAt: new Date().toISOString(),
        status: 'pending'
      };

      setDocuments(prev => [...prev, newDocument]);
      
      // Update expert profile with new document
      const expert = await expertService.getExpertByUserId(user.id);
      if (expert) {
        await expertService.updateExpertSimple({
          id: expert.id,
          documents: JSON.stringify([...documents, newDocument])
        });
      }

      toast.success('Document uploaded successfully!');
    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast.error(error.message || 'Failed to upload document');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      
      // Update expert profile
      const expert = await expertService.getExpertByUserId(user.id);
      if (expert) {
        await expertService.updateExpertSimple({
          id: expert.id,
          documents: JSON.stringify(documents.filter(doc => doc.id !== documentId))
        });
      }

      toast.success('Document deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting document:', error);
      toast.error(error.message || 'Failed to delete document');
    }
  };

  const getDocumentStatus = (type: string) => {
    const doc = documents.find(d => d.type === type);
    if (!doc) return { status: 'missing', badge: 'Missing' };
    
    switch (doc.status) {
      case 'approved':
        return { status: 'approved', badge: 'Approved' };
      case 'rejected':
        return { status: 'rejected', badge: 'Rejected' };
      default:
        return { status: 'pending', badge: 'Pending Review' };
    }
  };

  const getVerificationProgress = () => {
    const requiredDocs = REQUIRED_DOCUMENTS.filter(doc => doc.required);
    const approvedDocs = requiredDocs.filter(doc => {
      const docStatus = getDocumentStatus(doc.type);
      return docStatus.status === 'approved';
    });
    
    return (approvedDocs.length / requiredDocs.length) * 100;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Document Management</h1>
          <p className="text-gray-600">Upload and manage your professional documents for verification</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="file"
            id="document-upload"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            onChange={handleFileUpload}
            className="hidden"
            disabled={isUploading}
          />
          <Button 
            onClick={() => document.getElementById('document-upload')?.click()}
            disabled={isUploading}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {isUploading ? 'Uploading...' : 'Upload Document'}
          </Button>
        </div>
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Uploading document...</span>
                <span className="text-sm text-gray-600">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Verification Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Verification Progress
          </CardTitle>
          <CardDescription>
            Complete your document verification to become a verified expert
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Verification Progress</span>
              <span className="text-sm text-gray-600">{getVerificationProgress().toFixed(0)}%</span>
            </div>
            <Progress value={getVerificationProgress()} className="w-full" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {REQUIRED_DOCUMENTS.map((doc) => {
              const docStatus = getDocumentStatus(doc.type);
              return (
                <div key={doc.type} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">{doc.name}</p>
                      {doc.required && (
                        <Badge variant="outline" className="text-xs">Required</Badge>
                      )}
                    </div>
                  </div>
                  <Badge className={getStatusColor(docStatus.status)}>
                    {docStatus.badge}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Uploaded Documents
          </CardTitle>
          <CardDescription>
            Manage your uploaded documents and track their verification status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No documents uploaded</h3>
              <p className="text-gray-600 mb-4">
                Upload your professional documents to start the verification process
              </p>
              <Button 
                onClick={() => document.getElementById('document-upload')?.click()}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Upload First Document
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="font-medium">{doc.name}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(doc.status)}>
                      {doc.status === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {doc.status === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
                      {doc.status === 'pending' && <AlertCircle className="h-3 w-3 mr-1" />}
                      {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                    </Badge>
                    
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Document Upload Guidelines</h3>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>• Upload clear, high-quality scans or photos of your documents</li>
                <li>• Ensure all text is readable and documents are not expired</li>
                <li>• Accepted formats: PDF, JPG, PNG, DOC, DOCX</li>
                <li>• Maximum file size: 10MB per document</li>
                <li>• Verification typically takes 2-5 business days</li>
                <li>• You'll receive email notifications about verification status</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
