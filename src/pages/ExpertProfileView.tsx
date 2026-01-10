import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { expertService, Expert } from '@/services/expert.service';
import { expertPatientService } from '@/services/expert-patient.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  Clock,
  DollarSign,
  Plus,
  Check,
  Calendar as CalendarIcon,
  User,
  Award,
  Languages,
  GraduationCap,
  Building,
  PhoneCall
} from 'lucide-react';

interface ExpertProfileViewProps {
  expert?: Expert;
}

export default function ExpertProfileView({ expert: propExpert }: ExpertProfileViewProps) {
  const { expertId } = useParams<{ expertId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [expert, setExpert] = useState<Expert | null>(propExpert || location.state?.expert || null);
  const [isLoading, setIsLoading] = useState(!expert);
  const [isBooking, setIsBooking] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [appointmentType, setAppointmentType] = useState<string>('consultation');
  const [notes, setNotes] = useState<string>('');
  const [isAddingExpert, setIsAddingExpert] = useState(false);

  const availableTimes = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];

  const appointmentTypes = [
    { value: 'consultation', label: 'General Consultation' },
    { value: 'followup', label: 'Follow-up Visit' },
    { value: 'emergency', label: 'Emergency Consultation' },
    { value: 'specialist', label: 'Specialist Consultation' }
  ];

  useEffect(() => {
    if (!expert && expertId) {
      loadExpert();
    }
  }, [expertId, expert]);

  const loadExpert = async () => {
    if (!expertId) return;

    try {
      setIsLoading(true);
      const expertData = await expertService.getExpert(expertId);
      if (expertData) {
        setExpert(expertData);
      } else {
        toast.error('Expert not found');
        navigate('/find-expert');
      }
    } catch (error) {
      console.error('Error loading expert:', error);
      toast.error('Failed to load expert profile');
      navigate('/find-expert');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddExpert = async () => {
    if (!user || !expert) {
      toast.error('Please log in to add experts');
      return;
    }

    setIsAddingExpert(true);
    try {
      // Check if already added
      const hasExpert = await expertPatientService.hasExpert(user.id, expert.id);
      if (hasExpert) {
        toast.info('This expert is already in your list');
        return;
      }

      // Add expert to patient
      await expertPatientService.addExpertToPatient({
        id: `expert_patient_${user.id}_${expert.id}_${Date.now()}`,
        userId: user.id,
        expertId: expert.id,
        status: 'active',
        addedAt: new Date().toISOString()
      });

      toast.success('Expert added to your specialists!');
    } catch (error: any) {
      console.error('Error adding expert:', error);

      if (error.data?.createExpertPatient) {
        toast.success('Expert added to your specialists!');
        return;
      }

      if (error.errors && error.errors.length > 0) {
        const errorMessage = error.errors[0].message;
        if (errorMessage.includes('Not Authorized')) {
          toast.error('Permission denied. Please try again or contact support.');
        } else {
          toast.error(`Failed to add expert: ${errorMessage}`);
        }
      } else {
        toast.error('Failed to add expert. Please try again.');
      }
    } finally {
      setIsAddingExpert(false);
    }
  };

  const handleBookAppointment = async () => {
    if (!user || !expert || !selectedDate || !selectedTime) {
      toast.error('Please select date and time');
      return;
    }

    setIsBooking(true);
    try {
      const appointmentDateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':');
      appointmentDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const appointmentData = {
        id: `appointment_${user.id}_${expert.id}_${Date.now()}`,
        userId: user.id,
        expertId: expert.id,
        date: appointmentDateTime.toISOString(),
        status: 'SCHEDULED',
        type: appointmentType,
        duration: 30, // Default 30 minutes
        notes: notes
      };

      // Navigate to appointments page with pre-filled data
      navigate('/appointments', {
        state: {
          newAppointment: appointmentData,
          expert: expert
        }
      });
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error('Failed to book appointment');
    } finally {
      setIsBooking(false);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-muted-foreground">Loading expert profile...</p>
        </div>
      </div>
    );
  }

  if (!expert) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-foreground mb-2">Expert Not Found</h2>
          <p className="text-gray-600 dark:text-muted-foreground mb-4">The expert you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/find-expert')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Experts
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/find-expert')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Experts
          </Button>

          <div className="bg-white dark:bg-card rounded-lg shadow-sm p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={expert.profileImage} />
                <AvatarFallback className="text-2xl">
                  {expert.user ? getInitials(expert.user.firstName, expert.user.lastName) : 'EX'}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 w-full">
                <div className="flex flex-col gap-4 w-full">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-foreground">
                      {expert.user ? `${expert.user.firstName} ${expert.user.lastName}` : `Dr. ${expert.specialization}`}
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-muted-foreground mb-2">{expert.specialization}</p>

                    <div className="flex items-center gap-4 mb-4">
                      {expert.isVerified && (
                        <Badge variant="default" className="bg-green-600 dark:bg-green-700">
                          <Check className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      <Badge variant="outline">
                        <Award className="h-3 w-3 mr-1" />
                        {expert.yearsOfExperience} years experience
                      </Badge>
                      {expert.consultationFee && (
                        <Badge variant="outline">
                          <DollarSign className="h-3 w-3 mr-1" />
                          ${expert.consultationFee}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <Button
                      variant="outline"
                      onClick={handleAddExpert}
                      disabled={isAddingExpert}
                    >
                      {isAddingExpert ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 dark:border-blue-400 mr-2"></div>
                      ) : (
                        <Plus className="h-4 w-4 mr-2" />
                      )}
                      Add to My Experts
                    </Button>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button>
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          Book Appointment
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Book Appointment</DialogTitle>
                          <DialogDescription>
                            Schedule a consultation with {expert.user ? `${expert.user.firstName} ${expert.user.lastName}` : 'this expert'}
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-foreground">Appointment Type</label>
                            <Select value={appointmentType} onValueChange={setAppointmentType}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {appointmentTypes.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <label className="text-sm font-medium text-foreground">Date</label>
                            <Calendar
                              mode="single"
                              selected={selectedDate}
                              onSelect={setSelectedDate}
                              className="rounded-md border"
                              disabled={(date) => date < new Date()}
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium text-foreground">Time</label>
                            <Select value={selectedTime} onValueChange={setSelectedTime}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select time" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableTimes.map((time) => (
                                  <SelectItem key={time} value={time}>
                                    {time}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <label className="text-sm font-medium text-foreground">Notes (Optional)</label>
                            <Textarea
                              placeholder="Any specific concerns or questions..."
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              rows={3}
                            />
                          </div>

                          <Button
                            onClick={handleBookAppointment}
                            disabled={!selectedDate || !selectedTime || isBooking}
                            className="w-full"
                          >
                            {isBooking ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white dark:border-gray-900 mr-2"></div>
                            ) : (
                              <CalendarIcon className="h-4 w-4 mr-2" />
                            )}
                            Book Appointment
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Expert Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            {expert.bio && (
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-muted-foreground leading-relaxed">{expert.bio}</p>
                </CardContent>
              </Card>
            )}

            {/* Specializations */}
            {expert.subSpecializations && expert.subSpecializations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Sub-specializations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {expert.subSpecializations.map((spec, index) => (
                      <Badge key={index} variant="secondary">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Education & Certifications */}
            {(expert.education && expert.education.length > 0) || (expert.certifications && expert.certifications.length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle>Education & Certifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {expert.education && expert.education.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 dark:text-foreground mb-2">Education</h4>
                      <ul className="space-y-2">
                        {expert.education.map((edu, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-gray-700 dark:text-muted-foreground">{edu}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {expert.certifications && expert.certifications.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 dark:text-foreground mb-2">Certifications</h4>
                      <ul className="space-y-2">
                        {expert.certifications.map((cert, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <Award className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <span className="text-gray-700 dark:text-muted-foreground">{cert}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Languages */}
            {expert.languages && expert.languages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Languages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {expert.languages.map((lang, index) => (
                      <Badge key={index} variant="outline">
                        <Languages className="h-3 w-3 mr-1" />
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Services */}
            {expert.services && expert.services.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {expert.services.map((service, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span className="text-gray-700 dark:text-muted-foreground">{service}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Practice Information */}
            <Card>
              <CardHeader>
                <CardTitle>Practice Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {expert.practiceName && (
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-gray-500 dark:text-muted-foreground" />
                    <span className="text-gray-700 dark:text-muted-foreground">{expert.practiceName}</span>
                  </div>
                )}

                {expert.practiceAddress && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-500 dark:text-muted-foreground mt-0.5" />
                    <span className="text-gray-700 dark:text-muted-foreground">{expert.practiceAddress}</span>
                  </div>
                )}

                {expert.practicePhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500 dark:text-muted-foreground" />
                    <span className="text-gray-700 dark:text-muted-foreground">{expert.practicePhone}</span>
                  </div>
                )}

                {expert.practiceEmail && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500 dark:text-muted-foreground" />
                    <span className="text-gray-700 dark:text-muted-foreground">{expert.practiceEmail}</span>
                  </div>
                )}

                {expert.practiceWebsite && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-gray-500 dark:text-muted-foreground" />
                    <a
                      href={expert.practiceWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.open(`tel:${expert.practicePhone}`, '_self')}
                >
                  <PhoneCall className="h-4 w-4 mr-2" />
                  Call Practice
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.open(`mailto:${expert.practiceEmail}`, '_self')}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>

                {expert.practiceWebsite && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => window.open(expert.practiceWebsite, '_blank')}
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    Visit Website
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* License Information */}
            {expert.licenseNumber && (
              <Card>
                <CardHeader>
                  <CardTitle>License Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600 dark:text-muted-foreground">
                    <p><strong>License Number:</strong> {expert.licenseNumber}</p>
                    <p><strong>Verification Status:</strong> {expert.verificationStatus}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
