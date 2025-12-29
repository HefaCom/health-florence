import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { NotificationService, NotificationType } from '@/services/NotificationService';
import {
  User,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Download,
  Shield,
  Award,
  GraduationCap,
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

// Custom query to get experts with user data and documents
const LIST_EXPERTS_FOR_REVIEW = /* GraphQL */ `
  query ListExpertsForReview($filter: ModelExpertFilterInput, $limit: Int, $nextToken: String) {
    listExperts(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        userId
        specialization
        subSpecializations
        licenseNumber
        yearsOfExperience
        education
        certifications
        languages
        practiceName
        practiceAddress
        practicePhone
        practiceEmail
        practiceWebsite
        consultationFee
        services
        bio
        availability
        documents
        isVerified
        isActive
        verificationStatus
        createdAt
        updatedAt
        user {
          id
          email
          firstName
          lastName
          phoneNumber
          createdAt
        }
      }
      nextToken
    }
  }
`;

interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
}

interface Expert {
  id: string;
  userId: string;
  specialization: string;
  subSpecializations?: string[];
  licenseNumber: string;
  yearsOfExperience: number;
  education?: string[];
  certifications?: string[];
  languages?: string[];
  practiceName?: string;
  practiceAddress?: string;
  practicePhone?: string;
  practiceEmail?: string;
  practiceWebsite?: string;
  consultationFee: number;
  services?: string[];
  bio?: string;
  availability?: any;
  documents?: Document[];
  isVerified: boolean;
  isActive: boolean;
  verificationStatus: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    createdAt: string;
  };
}

export default function AdminExpertReview() {
  const client = generateClient({ authMode: "apiKey" });
  const [isLoading, setIsLoading] = useState(true);
  const [experts, setExperts] = useState<Expert[]>([]);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    loadExperts();
  }, []);

  const loadExperts = async () => {
    try {
      setIsLoading(true);
      const response: any = await client.graphql({
        query: LIST_EXPERTS_FOR_REVIEW,
        variables: { limit: 100 },
        authMode: "apiKey"
      });

      const expertItems = response?.data?.listExperts?.items || [];
      setExperts(expertItems);
    } catch (error) {
      console.error('Error loading experts:', error);
      toast.error('Failed to load experts for review');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveExpert = async (expertId: string) => {
    try {
      await client.graphql({
        query: /* GraphQL */ `
          mutation UpdateExpertVerification($input: UpdateExpertInput!) {
            updateExpert(input: $input) {
              id
              isVerified
              verificationStatus
            }
          }
        `,
        variables: {
          input: {
            id: expertId,
            isVerified: true,
            verificationStatus: 'verified'
          }
        }
      });

      const expert = experts.find(e => e.id === expertId);
      if (expert) {
        await NotificationService.createNotification(
          expert.userId,
          NotificationType.PROFILE,
          'Expert Profile Approved',
          'Your expert profile has been approved! You can now access all expert features.',
          { expertId },
          '/expert/dashboard'
        );
      }

      toast.success('Expert approved successfully!');
      loadExperts(); // Refresh the list
    } catch (error) {
      console.error('Error approving expert:', error);
      toast.error('Failed to approve expert');
    }
  };

  const handleRejectExpert = async (expertId: string, reason: string) => {
    try {
      await client.graphql({
        query: /* GraphQL */ `
          mutation UpdateExpertVerification($input: UpdateExpertInput!) {
            updateExpert(input: $input) {
              id
              isVerified
              verificationStatus
            }
          }
        `,
        variables: {
          input: {
            id: expertId,
            isVerified: false,
            verificationStatus: 'rejected'
          }
        }
      });

      const expert = experts.find(e => e.id === expertId);
      if (expert) {
        await NotificationService.createNotification(
          expert.userId,
          NotificationType.PROFILE,
          'Expert Profile Rejected',
          `Your expert profile application was rejected: ${reason}`,
          { expertId, reason },
          '/expert/profile-setup'
        );
      }

      toast.success('Expert rejected successfully!');
      loadExperts(); // Refresh the list
    } catch (error) {
      console.error('Error rejecting expert:', error);
      toast.error('Failed to reject expert');
    }
  };

  const getVerificationStatus = (expert: Expert) => {
    if (expert.isVerified) return 'verified';
    if (expert.verificationStatus === 'rejected') return 'rejected';
    if (expert.verificationStatus === 'pending') return 'pending';
    return 'pending';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const filteredExperts = experts.filter(expert => {
    const status = getVerificationStatus(expert);
    return status === activeTab;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading experts for review...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Expert Review & Verification</h1>
          <p className="text-gray-600">Review and verify expert profiles and documents</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="px-3 py-1">
            {experts.length} Total Experts
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expert List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Expert Applications</CardTitle>
              <CardDescription>
                Review expert profiles and documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="verified">Verified</TabsTrigger>
                  <TabsTrigger value="rejected">Rejected</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-4">
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredExperts.map((expert) => {
                      const status = getVerificationStatus(expert);
                      const expertName = `${expert.user.firstName || ''} ${expert.user.lastName || ''}`.trim() || expert.user.email;

                      return (
                        <div
                          key={expert.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedExpert?.id === expert.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'hover:bg-gray-50'
                            }`}
                          onClick={() => setSelectedExpert(expert)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{expertName}</p>
                              <p className="text-sm text-gray-600 truncate">{expert.specialization}</p>
                            </div>
                            <Badge className={getStatusColor(status)}>
                              {getStatusIcon(status)}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}

                    {filteredExperts.length === 0 && (
                      <div className="text-center py-8">
                        <User className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">No {activeTab} experts</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Expert Details */}
        <div className="lg:col-span-2">
          {selectedExpert ? (
            <div className="space-y-6">
              {/* Expert Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h2 className="text-xl">
                            {`${selectedExpert.user.firstName || ''} ${selectedExpert.user.lastName || ''}`.trim() || selectedExpert.user.email}
                          </h2>
                          <p className="text-sm text-gray-600">{selectedExpert.specialization}</p>
                        </div>
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(getVerificationStatus(selectedExpert))}>
                        {getStatusIcon(getVerificationStatus(selectedExpert))}
                        {getVerificationStatus(selectedExpert).charAt(0).toUpperCase() + getVerificationStatus(selectedExpert).slice(1)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Email:</span>
                      <p className="text-gray-600">{selectedExpert.user.email}</p>
                    </div>
                    <div>
                      <span className="font-medium">Phone:</span>
                      <p className="text-gray-600">{selectedExpert.user.phoneNumber || 'Not provided'}</p>
                    </div>
                    <div>
                      <span className="font-medium">Experience:</span>
                      <p className="text-gray-600">{selectedExpert.yearsOfExperience} years</p>
                    </div>
                    <div>
                      <span className="font-medium">License:</span>
                      <p className="text-gray-600">{selectedExpert.licenseNumber}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Professional Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Professional Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedExpert.education && selectedExpert.education.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Education</h4>
                      <ul className="space-y-1">
                        {selectedExpert.education.map((edu, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <GraduationCap className="h-4 w-4 text-blue-500" />
                            <span>{edu}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedExpert.certifications && selectedExpert.certifications.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Certifications</h4>
                      <ul className="space-y-1">
                        {selectedExpert.certifications.map((cert, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <Award className="h-4 w-4 text-green-500" />
                            <span>{cert}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedExpert.practiceName && (
                    <div>
                      <h4 className="font-medium mb-2">Practice Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span>{selectedExpert.practiceName}</span>
                        </div>
                        {selectedExpert.practiceAddress && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span>{selectedExpert.practiceAddress}</span>
                          </div>
                        )}
                        {selectedExpert.practicePhone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-500" />
                            <span>{selectedExpert.practicePhone}</span>
                          </div>
                        )}
                        {selectedExpert.practiceEmail && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-500" />
                            <span>{selectedExpert.practiceEmail}</span>
                          </div>
                        )}
                        {selectedExpert.practiceWebsite && (
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-gray-500" />
                            <a href={selectedExpert.practiceWebsite} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              {selectedExpert.practiceWebsite}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Documents Review */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Document Review
                  </CardTitle>
                  <CardDescription>
                    Review uploaded documents and credentials
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {(() => {
                    let documents = [];
                    try {
                      documents = selectedExpert.documents
                        ? (typeof selectedExpert.documents === 'string'
                          ? JSON.parse(selectedExpert.documents)
                          : selectedExpert.documents)
                        : [];
                    } catch (error) {
                      console.error('Error parsing documents JSON:', error);
                      documents = [];
                    }
                    return documents && documents.length > 0 ? (
                      <div className="space-y-4">
                        {documents.map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <FileText className="h-8 w-8 text-blue-600" />
                              <div>
                                <p className="font-medium">{doc.name}</p>
                                <p className="text-sm text-gray-600">
                                  Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(doc.status)}>
                                {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                              </Badge>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">No documents uploaded</p>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>

              {/* Bio */}
              {selectedExpert.bio && (
                <Card>
                  <CardHeader>
                    <CardTitle>Professional Bio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{selectedExpert.bio}</p>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              {getVerificationStatus(selectedExpert) === 'pending' && (
                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-blue-900">Review Actions</h3>
                        <p className="text-sm text-blue-800">Approve or reject this expert application</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleRejectExpert(selectedExpert.id, 'Please provide more information')}
                          variant="outline"
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          <ThumbsDown className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                        <Button
                          onClick={() => handleApproveExpert(selectedExpert.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <ThumbsUp className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select an Expert</h3>
                <p className="text-gray-600">
                  Choose an expert from the list to review their profile and documents
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
