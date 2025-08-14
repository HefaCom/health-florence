
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ChevronLeft, 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  Pencil,
  Check,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { generateClient } from "aws-amplify/api";
// Custom query to get appointment with expert user data
const GET_APPOINTMENT_WITH_EXPERT_USER = /* GraphQL */ `
  query GetAppointmentWithExpertUser($id: ID!) {
    getAppointment(id: $id) {
      id
      userId
      expertId
      date
      status
      type
      duration
      notes
      symptoms
      diagnosis
      prescription
      followUpDate
      user {
        id
        email
        firstName
        lastName
        phoneNumber
        dateOfBirth
        address
        city
        state
        zipCode
        emergencyContactName
        emergencyContactPhone
        allergies
        medicalConditions
        currentMedications
        height
        weight
        gender
        bloodType
        role
        isActive
        lastLoginAt
        loginCount
        preferences
        notificationSettings
        privacySettings
        subscriptionTier
        subscriptionExpiresAt
        createdAt
        updatedAt
        owner
        __typename
      }
      expert {
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
        availability
        consultationFee
        services
        bio
        profileImage
        coverImage
        isVerified
        isActive
        verificationStatus
        user {
          id
          email
          firstName
          lastName
        }
        createdAt
        updatedAt
        owner
        __typename
      }
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
import { updateAppointment } from "@/graphql/mutations";

const client = generateClient();

type AppointmentStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

interface AppointmentDetailData {
  id: string;
  patientName: string;
  patientEmail?: string;
  patientPhone?: string;
  date: string;
  time: string;
  doctor: string;
  specialty?: string;
  department?: string;
  location?: string;
  status: AppointmentStatus;
  notes?: string;
  medicalHistory?: string;
  medications?: string;
}

const AppointmentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<AppointmentDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const res = await client.graphql({ query: GET_APPOINTMENT_WITH_EXPERT_USER, variables: { id } });
        const a = (res as any).data?.getAppointment;
        if (!a) {
          setAppointment(null);
        } else {
          const d = new Date(a.date);
          setAppointment({
            id: a.id,
            patientName: a.user ? `${a.user.firstName} ${a.user.lastName}` : a.userId,
            patientEmail: a.user?.email,
            date: d.toLocaleDateString(),
            time: d.toLocaleTimeString(),
            doctor: a.expert?.user ? `${a.expert.user.firstName?.trim()} ${a.expert.user.lastName?.trim()}` : a.expert?.specialization || 'Expert',
            specialty: a.expert?.specialization,
            department: a.expert?.practiceName,
            location: a.expert?.practiceAddress,
            status: (a.status as AppointmentStatus) || 'SCHEDULED',
            notes: a.notes || '',
            medicalHistory: Array.isArray(a.symptoms) ? a.symptoms.join(', ') : a.symptoms,
            medications: Array.isArray(a.prescription) ? a.prescription.join(', ') : a.prescription
          });
        }
      } catch (e) {
        console.error('Failed to load appointment', e);
        toast.error('Failed to load appointment');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-xl font-semibold mb-2">Loading appointment...</h2>
        <p className="text-muted-foreground">Please wait</p>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-2xl font-bold mb-4">Appointment Not Found</h2>
        <p className="text-muted-foreground mb-6">The appointment you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate("/admin/appointments")}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Appointments
        </Button>
      </div>
    );
  }
  
  const statusColors = {
    SCHEDULED: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
  };
  
  const handleMarkComplete = async () => {
    try {
      await client.graphql({
        query: updateAppointment,
        variables: { input: { id: appointment.id, status: 'COMPLETED' } }
      });
      toast.success("Appointment marked as completed");
      navigate("/admin/appointments");
    } catch (e) {
      console.error('Failed to update appointment', e);
      toast.error('Failed to update appointment');
    }
  };
  
  const handleCancel = async () => {
    try {
      await client.graphql({
        query: updateAppointment,
        variables: { input: { id: appointment.id, status: 'CANCELLED' } }
      });
      toast.info("Appointment has been cancelled");
      navigate("/admin/appointments");
    } catch (e) {
      console.error('Failed to cancel appointment', e);
      toast.error('Failed to cancel appointment');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => navigate("/admin/appointments")} className="mr-2">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Appointment Details</h1>
        </div>
        
        {appointment.status === "SCHEDULED" && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleMarkComplete}>
              <Check className="mr-2 h-4 w-4" /> Mark Complete
            </Button>
            <Button variant="destructive" onClick={handleCancel}>
              <X className="mr-2 h-4 w-4" /> Cancel
            </Button>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Appointment Information</span>
              <Badge 
                className={`${statusColors[appointment.status]} bg-opacity-20`}
              >
                {appointment.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Date & Time</h3>
                <p className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-primary" />
                  {appointment.date}
                </p>
                <p className="flex items-center mt-1">
                  <Clock className="h-4 w-4 mr-2 text-primary" />
                  {appointment.time}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Doctor</h3>
                <p className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-primary" />
                  {appointment.doctor}
                </p>
                <p className="text-sm ml-6">{appointment.specialty}</p>
                <p className="text-sm ml-6">{appointment.department}</p>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Location</h3>
              <p>{appointment.location}</p>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Notes</h3>
              <p className="text-sm whitespace-pre-line">{appointment.notes}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Name</h3>
              <p>{appointment.patientName}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Contact</h3>
              <p>{appointment.patientEmail}</p>
              <p>{appointment.patientPhone}</p>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Medical History</h3>
              <p className="text-sm">{appointment.medicalHistory}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Current Medications</h3>
              <p className="text-sm">{appointment.medications}</p>
            </div>
            
            <div className="pt-2">
              <Button variant="outline" className="w-full">
                <FileText className="mr-2 h-4 w-4" /> View Full Medical Record
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AppointmentDetail;
