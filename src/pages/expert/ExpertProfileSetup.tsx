import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { expertService, CreateExpertInput } from '@/services/expert.service';
import { userService } from '@/services/user.service';
import { NotificationService, NotificationType } from '@/services/NotificationService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  User,
  Stethoscope,
  GraduationCap,
  Award,
  Globe,
  Building,
  Clock,
  DollarSign,
  FileText,
  Plus,
  X,
  Save,
  Loader2
} from 'lucide-react';

const SPECIALIZATIONS = [
  'Cardiology',
  'Dermatology',
  'Endocrinology',
  'Gastroenterology',
  'General Practice',
  'Gynecology',
  'Neurology',
  'Oncology',
  'Ophthalmology',
  'Orthopedics',
  'Pediatrics',
  'Psychiatry',
  'Pulmonology',
  'Radiology',
  'Surgery',
  'Urology',
  'Other'
];

const LANGUAGES = [
  'English',
  'Spanish',
  'French',
  'German',
  'Italian',
  'Portuguese',
  'Russian',
  'Chinese',
  'Japanese',
  'Korean',
  'Arabic',
  'Hindi',
  'Other'
];

export default function ExpertProfileSetup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<CreateExpertInput>>({
    specialization: '',
    subSpecializations: [],
    licenseNumber: '',
    yearsOfExperience: 0,
    education: [''],
    certifications: [''],
    languages: ['English'],
    practiceName: '',
    practiceAddress: '',
    practicePhone: '',
    practiceEmail: '',
    practiceWebsite: '',
    consultationFee: 0,
    services: [''],
    bio: '',
    isVerified: false,
    isActive: true,
    verificationStatus: 'pending'
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Check if user already has an expert profile
    const checkExistingProfile = async () => {
      try {
        // First, clean up any duplicate profiles
        await expertService.cleanupDuplicateProfiles(user.id);

        const hasProfile = await expertService.hasExpertProfile(user.id);

        if (hasProfile) {
          toast.info('You already have an expert profile');
          navigate('/expert/dashboard');
        }
      } catch (error) {
        console.error('Error checking existing profile:', error);
      }
    };

    checkExistingProfile();
  }, [user, navigate]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayInputChange = (field: string, index: number, value: string) => {
    setFormData(prev => {
      const array = [...(prev[field as keyof CreateExpertInput] as string[] || [])];
      array[index] = value;
      return {
        ...prev,
        [field]: array
      };
    });
  };

  const addArrayItem = (field: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field as keyof CreateExpertInput] as string[] || []), '']
    }));
  };

  const removeArrayItem = (field: string, index: number) => {
    setFormData(prev => {
      const array = [...(prev[field as keyof CreateExpertInput] as string[] || [])];
      array.splice(index, 1);
      return {
        ...prev,
        [field]: array
      };
    });
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('User not authenticated');
      return;
    }

    // Debug: Check user role and authentication
    console.log('Current user:', user);
    console.log('User role:', user.role);
    console.log('User ID:', user.id);

    // Check if user role is set to expert
    if (user.role !== 'expert') {
      toast.error('Your account is not set up as an expert. Please contact support.');
      return;
    }

    setIsLoading(true);
    try {
      const expertData: CreateExpertInput = {
        id: `expert_${user.id}_${Date.now()}`, // Generate unique ID
        userId: user.id,
        ...formData as CreateExpertInput
      };

      console.log('Expert data to create:', expertData);

      await expertService.createExpert(expertData);

      // Notify admins
      try {
        const admins = await userService.getUsersByRole('admin');
        const notificationPromises = admins.map(admin =>
          NotificationService.createNotification(
            admin.id,
            NotificationType.SYSTEM,
            'New Expert Application',
            `New expert application from ${user.firstName} ${user.lastName} (${formData.specialization})`,
            { expertId: expertData.id, applicantId: user.id },
            '/admin/expert-review'
          )
        );
        await Promise.all(notificationPromises);
      } catch (notifyError) {
        console.warn('Failed to notify admins:', notifyError);
      }

      toast.success('Expert profile created successfully!');
      navigate('/expert/dashboard');
    } catch (error: any) {
      console.error('Error creating expert profile:', error);
      toast.error(error.message || 'Failed to create expert profile');
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep1 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Basic Information
        </CardTitle>
        <CardDescription>Tell us about your medical specialization and credentials</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="specialization">Primary Specialization *</Label>
          <Select
            value={formData.specialization}
            onValueChange={(value) => handleInputChange('specialization', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your specialization" />
            </SelectTrigger>
            <SelectContent>
              {SPECIALIZATIONS.map((spec) => (
                <SelectItem key={spec} value={spec}>{spec}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Sub-specializations</Label>
          {formData.subSpecializations?.map((spec, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={spec}
                onChange={(e) => handleArrayInputChange('subSpecializations', index, e.target.value)}
                placeholder="e.g., Interventional Cardiology"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeArrayItem('subSpecializations', index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addArrayItem('subSpecializations')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Sub-specialization
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="licenseNumber">License Number *</Label>
          <Input
            id="licenseNumber"
            value={formData.licenseNumber}
            onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
            placeholder="Enter your medical license number"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="yearsOfExperience">Years of Experience *</Label>
          <Input
            id="yearsOfExperience"
            type="number"
            value={formData.yearsOfExperience}
            onChange={(e) => handleInputChange('yearsOfExperience', parseInt(e.target.value))}
            placeholder="0"
            min="0"
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          Education & Certifications
        </CardTitle>
        <CardDescription>Add your educational background and professional certifications</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Education</Label>
          {formData.education?.map((edu, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={edu}
                onChange={(e) => handleArrayInputChange('education', index, e.target.value)}
                placeholder="e.g., MD - Harvard Medical School"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeArrayItem('education', index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addArrayItem('education')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Education
          </Button>
        </div>

        <div className="space-y-2">
          <Label>Certifications</Label>
          {formData.certifications?.map((cert, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={cert}
                onChange={(e) => handleArrayInputChange('certifications', index, e.target.value)}
                placeholder="e.g., Board Certified in Cardiology"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeArrayItem('certifications', index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addArrayItem('certifications')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Certification
          </Button>
        </div>

        <div className="space-y-2">
          <Label>Languages Spoken</Label>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((lang) => (
              <Badge
                key={lang}
                variant={formData.languages?.includes(lang) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => {
                  const current = formData.languages || [];
                  const updated = current.includes(lang)
                    ? current.filter(l => l !== lang)
                    : [...current, lang];
                  handleInputChange('languages', updated);
                }}
              >
                {lang}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Practice Information
        </CardTitle>
        <CardDescription>Provide details about your practice and services</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="practiceName">Practice Name</Label>
          <Input
            id="practiceName"
            value={formData.practiceName}
            onChange={(e) => handleInputChange('practiceName', e.target.value)}
            placeholder="Enter your practice name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="practiceAddress">Practice Address</Label>
          <Textarea
            id="practiceAddress"
            value={formData.practiceAddress}
            onChange={(e) => handleInputChange('practiceAddress', e.target.value)}
            placeholder="Enter your practice address"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="practicePhone">Practice Phone</Label>
            <Input
              id="practicePhone"
              value={formData.practicePhone}
              onChange={(e) => handleInputChange('practicePhone', e.target.value)}
              placeholder="Enter practice phone number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="practiceEmail">Practice Email</Label>
            <Input
              id="practiceEmail"
              type="email"
              value={formData.practiceEmail}
              onChange={(e) => handleInputChange('practiceEmail', e.target.value)}
              placeholder="Enter practice email"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="practiceWebsite">Practice Website</Label>
          <Input
            id="practiceWebsite"
            value={formData.practiceWebsite}
            onChange={(e) => handleInputChange('practiceWebsite', e.target.value)}
            placeholder="https://your-practice-website.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="consultationFee">Consultation Fee ($)</Label>
          <Input
            id="consultationFee"
            type="number"
            value={formData.consultationFee}
            onChange={(e) => handleInputChange('consultationFee', parseFloat(e.target.value))}
            placeholder="0"
            min="0"
            step="0.01"
          />
        </div>

        <div className="space-y-2">
          <Label>Services Offered</Label>
          {formData.services?.map((service, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={service}
                onChange={(e) => handleArrayInputChange('services', index, e.target.value)}
                placeholder="e.g., General Consultation"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeArrayItem('services', index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addArrayItem('services')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Service
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep4 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Bio & Final Details
        </CardTitle>
        <CardDescription>Tell patients about yourself and complete your profile</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="bio">Professional Bio</Label>
          <Textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            placeholder="Tell patients about your experience, approach to care, and what makes you unique..."
            rows={6}
          />
        </div>

        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Profile Summary</h4>
          <div className="space-y-2 text-sm text-blue-800">
            <p><strong>Specialization:</strong> {formData.specialization}</p>
            <p><strong>Experience:</strong> {formData.yearsOfExperience} years</p>
            <p><strong>License:</strong> {formData.licenseNumber}</p>
            {formData.practiceName && <p><strong>Practice:</strong> {formData.practiceName}</p>}
            {formData.consultationFee && <p><strong>Fee:</strong> ${formData.consultationFee}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      default: return renderStep1();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Expert Profile</h1>
          <p className="text-gray-600">Complete your profile to start connecting with patients</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step <= currentStep
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600'
                  }`}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={`w-16 h-1 mx-2 ${step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>Basic Info</span>
            <span>Education</span>
            <span>Practice</span>
            <span>Bio</span>
          </div>
        </div>

        {renderCurrentStep()}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            Previous
          </Button>

          <div className="flex gap-2">
            {currentStep < 4 ? (
              <Button onClick={nextStep}>
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Create Profile
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 