import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { expertService, Expert } from '@/services/expert.service';
import { expertPatientService } from '@/services/expert-patient.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  Search, 
  Filter, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Star, 
  Users, 
  Clock, 
  DollarSign,
  Plus,
  Check,
  X,
  Loader2
} from 'lucide-react';

const SPECIALIZATIONS = [
  'All Specializations',
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
  'Urology'
];

export default function FindExpert() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [experts, setExperts] = useState<Expert[]>([]);
  const [filteredExperts, setFilteredExperts] = useState<Expert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('All Specializations');
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [addingExpert, setAddingExpert] = useState<string | null>(null);

  useEffect(() => {
    loadExperts();
  }, []);

  useEffect(() => {
    filterExperts();
  }, [experts, searchTerm, selectedSpecialization, showVerifiedOnly]);

  const loadExperts = async () => {
    try {
      setIsLoading(true);
      const allExperts = await expertService.getAllExperts();
      setExperts(allExperts);
    } catch (error) {
      console.error('Error loading experts:', error);
      toast.error('Failed to load experts');
    } finally {
      setIsLoading(false);
    }
  };

  const filterExperts = () => {
    let filtered = [...experts];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(expert => 
        expert.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expert.practiceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expert.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expert.subSpecializations?.some(spec => 
          spec.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Filter by specialization
    if (selectedSpecialization !== 'All Specializations') {
      filtered = filtered.filter(expert => 
        expert.specialization === selectedSpecialization
      );
    }

    // Filter by verification status
    if (showVerifiedOnly) {
      filtered = filtered.filter(expert => expert.isVerified);
    }

    setFilteredExperts(filtered);
  };

  const handleAddExpert = async (expertId: string) => {
    if (!user) {
      toast.error('Please log in to add experts');
      return;
    }

    setAddingExpert(expertId);
    try {
      // Check if already added
      const hasExpert = await expertPatientService.hasExpert(user.id, expertId);
      if (hasExpert) {
        toast.info('This expert is already in your list');
        return;
      }

      // Add expert to patient
      await expertPatientService.addExpertToPatient({
        id: `expert_patient_${user.id}_${expertId}_${Date.now()}`, // Generate unique ID
        userId: user.id,
        expertId,
        status: 'active',
        addedAt: new Date().toISOString()
      });

      toast.success('Expert added to your specialists!');
    } catch (error: any) {
      console.error('Error adding expert:', error);
      toast.error(error.message || 'Failed to add expert');
    } finally {
      setAddingExpert(null);
    }
  };

  const handleBookAppointment = (expertId: string) => {
    navigate(`/appointments/new?expertId=${expertId}`);
  };

  const handleViewProfile = (expertId: string) => {
    navigate(`/expert/${expertId}`);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const renderExpertCard = (expert: Expert) => {
    const isAdding = addingExpert === expert.id;
    const hasExpert = false; // This would need to be checked per expert

    return (
      <Card key={expert.id} className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={expert.profileImage} />
                <AvatarFallback className="text-lg">
                  {expert.user ? getInitials(expert.user.firstName, expert.user.lastName) : 'EX'}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-xl">
                  {expert.user ? `${expert.user.firstName} ${expert.user.lastName}` : 'Expert'}
                </CardTitle>
                <CardDescription className="text-base font-medium">
                  {expert.specialization}
                </CardDescription>
                <div className="flex items-center gap-2 mt-1">
                  {expert.isVerified && (
                    <Badge variant="default" className="bg-green-600">
                      <Check className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                  <Badge variant="outline">
                    {expert.yearsOfExperience} years experience
                  </Badge>
                </div>
              </div>
            </div>
            <div className="text-right">
              {expert.consultationFee && (
                <div className="text-lg font-semibold text-green-600">
                  ${expert.consultationFee}
                </div>
              )}
              <div className="text-sm text-gray-500">per consultation</div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {expert.bio && (
            <p className="text-gray-600 line-clamp-3">
              {expert.bio}
            </p>
          )}

          {expert.subSpecializations && expert.subSpecializations.length > 0 && (
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-2">Sub-specializations:</h4>
              <div className="flex flex-wrap gap-1">
                {expert.subSpecializations.map((spec, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {spec}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {expert.languages && expert.languages.length > 0 && (
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-2">Languages:</h4>
              <div className="flex flex-wrap gap-1">
                {expert.languages.slice(0, 3).map((lang, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {lang}
                  </Badge>
                ))}
                {expert.languages.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{expert.languages.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {expert.practiceName && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>{expert.practiceName}</span>
            </div>
          )}

          <Separator />

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewProfile(expert.id)}
              className="flex-1"
            >
              View Profile
            </Button>
            
            {hasExpert ? (
              <Button
                variant="outline"
                size="sm"
                disabled
                className="flex-1"
              >
                <Check className="h-4 w-4 mr-2" />
                Added
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddExpert(expert.id)}
                disabled={isAdding}
                className="flex-1"
              >
                {isAdding ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Add Expert
              </Button>
            )}

            <Button
              size="sm"
              onClick={() => handleBookAppointment(expert.id)}
              className="flex-1"
            >
              Book Appointment
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Expert</h1>
          <p className="text-gray-600">Discover and connect with healthcare specialists</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search experts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
              <SelectTrigger>
                <SelectValue placeholder="Specialization" />
              </SelectTrigger>
              <SelectContent>
                {SPECIALIZATIONS.map((spec) => (
                  <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant={showVerifiedOnly ? "default" : "outline"}
              onClick={() => setShowVerifiedOnly(!showVerifiedOnly)}
              className="flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              Verified Only
            </Button>

            <Button
              variant="outline"
              onClick={loadExperts}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Filter className="h-4 w-4" />
              )}
              Refresh
            </Button>
          </div>
        </div>

        {/* Results */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {isLoading ? 'Loading experts...' : `${filteredExperts.length} experts found`}
            </h2>
            {filteredExperts.length > 0 && (
              <div className="text-sm text-gray-600">
                Showing {filteredExperts.length} of {experts.length} experts
              </div>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : filteredExperts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Users className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No experts found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or filters
            </p>
            <Button onClick={() => {
              setSearchTerm('');
              setSelectedSpecialization('All Specializations');
              setShowVerifiedOnly(false);
            }}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredExperts.map(renderExpertCard)}
          </div>
        )}
      </div>
    </div>
  );
} 