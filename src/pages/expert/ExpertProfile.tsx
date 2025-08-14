import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { expertService } from '@/services/expert.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  User,
  Edit,
  Save,
  X,
  MapPin,
  Phone,
  Mail,
  Globe,
  Award,
  GraduationCap,
  Languages,
  DollarSign,
  Clock,
  Star,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import type { Expert, UpdateExpertInput } from '@/services/expert.service';

export default function ExpertProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [expert, setExpert] = useState<Expert | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Expert>>({});

  console.log('ExpertProfile component rendered, user:', user);

  useEffect(() => {
    console.log('ExpertProfile useEffect triggered, user:', user);
    if (user) {
      loadExpertProfile();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const loadExpertProfile = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      console.log('Loading expert profile for user:', user.id);
      const expertProfile = await expertService.getExpertByUserId(user.id);
      
      console.log('Expert profile result:', expertProfile);
      
      if (expertProfile) {
        setExpert(expertProfile);
        setFormData(expertProfile);
      } else {
        console.log('No expert profile found, staying on page');
        // Don't redirect, just show the "not found" state
      }
    } catch (error) {
      console.error('Error loading expert profile:', error);
      toast.error('Failed to load expert profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData(expert || {});
  };

  const handleSave = async () => {
    if (!expert) return;

    try {
      setIsSaving(true);
      
      // Only include fields that are valid for UpdateExpertInput
      const updateData: UpdateExpertInput = {
        id: expert.id,
        specialization: formData.specialization,
        subSpecializations: formData.subSpecializations,
        licenseNumber: formData.licenseNumber,
        yearsOfExperience: formData.yearsOfExperience,
        education: formData.education,
        certifications: formData.certifications,
        languages: formData.languages,
        practiceName: formData.practiceName,
        practiceAddress: formData.practiceAddress,
        practicePhone: formData.practicePhone,
        practiceEmail: formData.practiceEmail,
        practiceWebsite: formData.practiceWebsite,
        availability: formData.availability,
        consultationFee: formData.consultationFee,
        services: formData.services,
        bio: formData.bio,
        profileImage: formData.profileImage,
        coverImage: formData.coverImage,
        isVerified: formData.isVerified,
        isActive: formData.isActive,
        verificationStatus: formData.verificationStatus
      };

      console.log('Update data being sent:', updateData);

      const updatedExpert = await expertService.updateExpert(updateData);
      setExpert(updatedExpert);
      setFormData(updatedExpert);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Error updating expert profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof Expert, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field: keyof Expert, value: string) => {
    const currentArray = (formData[field] as string[]) || [];
    const newArray = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({
      ...prev,
      [field]: newArray
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!expert) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Expert Profile</h1>
            <p className="text-gray-600">Manage your professional profile and information</p>
          </div>
        </div>
        
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Profile Not Found</h2>
            <p className="text-gray-600 mb-4">You haven't created your expert profile yet.</p>
            <div className="space-y-2">
              <Button onClick={() => navigate('/expert/profile-setup')}>
                Create Profile
              </Button>
              <Button variant="outline" onClick={loadExpertProfile}>
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Expert Profile</h1>
          <p className="text-gray-600">Manage your professional profile and information</p>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <Button onClick={handleEdit} variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <>
              <Button onClick={handleCancel} variant="outline">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Overview */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg">
                  {expert.user?.firstName?.trim()} {expert.user?.lastName?.trim()}
                </h3>
                <p className="text-gray-600">{expert.user?.email}</p>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant={expert.isVerified ? "default" : "secondary"}>
                    {expert.isVerified ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Pending Verification
                      </>
                    )}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={expert.isActive ? "default" : "destructive"}>
                    {expert.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-gray-600">
                    {expert.yearsOfExperience} years experience
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-600">
                    ${expert.consultationFee}/consultation
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Profile Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Specialization */}
          <Card>
            <CardHeader>
              <CardTitle>Specialization</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="specialization">Primary Specialization</Label>
                    <Input
                      id="specialization"
                      value={formData.specialization || ''}
                      onChange={(e) => handleInputChange('specialization', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="subSpecializations">Sub-specializations (comma-separated)</Label>
                    <Input
                      id="subSpecializations"
                      value={(formData.subSpecializations || []).join(', ')}
                      onChange={(e) => handleArrayChange('subSpecializations', e.target.value)}
                      placeholder="e.g., Pediatric, Geriatric, Emergency"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Badge variant="outline" className="text-lg px-3 py-1">
                    {expert.specialization}
                  </Badge>
                  {expert.subSpecializations && expert.subSpecializations.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {expert.subSpecializations.map((spec, index) => (
                        <Badge key={index} variant="secondary">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Practice Information */}
          <Card>
            <CardHeader>
              <CardTitle>Practice Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div>
                    <Label htmlFor="practiceName">Practice Name</Label>
                    <Input
                      id="practiceName"
                      value={formData.practiceName || ''}
                      onChange={(e) => handleInputChange('practiceName', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="practiceAddress">Practice Address</Label>
                    <Input
                      id="practiceAddress"
                      value={formData.practiceAddress || ''}
                      onChange={(e) => handleInputChange('practiceAddress', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="practicePhone">Phone</Label>
                      <Input
                        id="practicePhone"
                        value={formData.practicePhone || ''}
                        onChange={(e) => handleInputChange('practicePhone', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="practiceEmail">Email</Label>
                      <Input
                        id="practiceEmail"
                        type="email"
                        value={formData.practiceEmail || ''}
                        onChange={(e) => handleInputChange('practiceEmail', e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="practiceWebsite">Website</Label>
                    <Input
                      id="practiceWebsite"
                      type="url"
                      value={formData.practiceWebsite || ''}
                      onChange={(e) => handleInputChange('practiceWebsite', e.target.value)}
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  {expert.practiceName && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span>{expert.practiceName}</span>
                    </div>
                  )}
                  {expert.practiceAddress && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{expert.practiceAddress}</span>
                    </div>
                  )}
                  {expert.practicePhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{expert.practicePhone}</span>
                    </div>
                  )}
                  {expert.practiceEmail && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span>{expert.practiceEmail}</span>
                    </div>
                  )}
                  {expert.practiceWebsite && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-gray-500" />
                      <a href={expert.practiceWebsite} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {expert.practiceWebsite}
                      </a>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Education & Certifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Education & Certifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div>
                    <Label htmlFor="education">Education (comma-separated)</Label>
                    <Input
                      id="education"
                      value={(formData.education || []).join(', ')}
                      onChange={(e) => handleArrayChange('education', e.target.value)}
                      placeholder="e.g., Harvard Medical School, Johns Hopkins University"
                    />
                  </div>
                  <div>
                    <Label htmlFor="certifications">Certifications (comma-separated)</Label>
                    <Input
                      id="certifications"
                      value={(formData.certifications || []).join(', ')}
                      onChange={(e) => handleArrayChange('certifications', e.target.value)}
                      placeholder="e.g., Board Certified, ACLS, BLS"
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  {expert.education && expert.education.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Education</h4>
                      <ul className="space-y-1">
                        {expert.education.map((edu, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-blue-500" />
                            <span>{edu}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {expert.certifications && expert.certifications.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Certifications</h4>
                      <ul className="space-y-1">
                        {expert.certifications.map((cert, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <Award className="h-4 w-4 text-green-500" />
                            <span>{cert}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Languages & Services */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Languages className="h-5 w-5" />
                Languages & Services
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div>
                    <Label htmlFor="languages">Languages (comma-separated)</Label>
                    <Input
                      id="languages"
                      value={(formData.languages || []).join(', ')}
                      onChange={(e) => handleArrayChange('languages', e.target.value)}
                      placeholder="e.g., English, Spanish, French"
                    />
                  </div>
                  <div>
                    <Label htmlFor="services">Services (comma-separated)</Label>
                    <Input
                      id="services"
                      value={(formData.services || []).join(', ')}
                      onChange={(e) => handleArrayChange('services', e.target.value)}
                      placeholder="e.g., General Consultation, Emergency Care, Preventive Care"
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  {expert.languages && expert.languages.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Languages</h4>
                      <div className="flex flex-wrap gap-2">
                        {expert.languages.map((lang, index) => (
                          <Badge key={index} variant="outline">
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {expert.services && expert.services.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Services</h4>
                      <div className="flex flex-wrap gap-2">
                        {expert.services.map((service, index) => (
                          <Badge key={index} variant="secondary">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bio */}
          <Card>
            <CardHeader>
              <CardTitle>Bio</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div>
                  <Label htmlFor="bio">Professional Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio || ''}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Tell patients about your experience, approach, and what makes you unique..."
                    rows={4}
                  />
                </div>
              ) : (
                <p className="text-gray-700">
                  {expert.bio || 'No bio available'}
                </p>
              )}
            </CardContent>
          </Card>

          {/* License Information */}
          <Card>
            <CardHeader>
              <CardTitle>License Information</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div>
                  <Label htmlFor="licenseNumber">License Number</Label>
                  <Input
                    id="licenseNumber"
                    value={formData.licenseNumber || ''}
                    onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-gray-500" />
                  <span>License: {expert.licenseNumber}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 