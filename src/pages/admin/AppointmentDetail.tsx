
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

// This would typically come from an API, using mock data for now
const mockAppointments = [
  {
    id: "1",
    patientName: "Sarah Johnson",
    patientEmail: "sarah.j@example.com",
    patientPhone: "+1 (555) 123-4567",
    date: "2023-06-15",
    time: "09:30 AM",
    doctor: "Dr. Michael Chen",
    specialty: "Cardiologist",
    department: "Cardiology",
    location: "Main Hospital - Room 305",
    status: "upcoming",
    notes: "Follow-up on recent test results. Patient has reported feeling better after medication adjustment.",
    medicalHistory: "Hypertension, Hyperlipidemia",
    medications: "Lisinopril 10mg, Atorvastatin 20mg"
  },
  {
    id: "2",
    patientName: "Robert Davis",
    patientEmail: "robert.d@example.com",
    patientPhone: "+1 (555) 987-6543",
    date: "2023-06-15",
    time: "11:00 AM",
    doctor: "Dr. Emily Wong",
    specialty: "Dermatologist",
    department: "Dermatology",
    location: "Medical Center - Room 210",
    status: "upcoming",
    notes: "Annual skin checkup. Patient has concerns about a mole on their back.",
    medicalHistory: "Eczema, Seasonal allergies",
    medications: "Loratadine 10mg"
  },
  {
    id: "3",
    patientName: "James Wilson",
    patientEmail: "james.w@example.com",
    patientPhone: "+1 (555) 456-7890",
    date: "2023-06-14",
    time: "02:15 PM",
    doctor: "Dr. Lisa Martinez",
    specialty: "Neurologist",
    department: "Neurology",
    location: "Specialty Clinic - Room 405",
    status: "completed",
    notes: "Headache assessment. Patient reported severe migraines 2-3 times per week.",
    medicalHistory: "Migraine, Anxiety",
    medications: "Sumatriptan 50mg, Propranolol 40mg"
  },
  {
    id: "4",
    patientName: "Maria Garcia",
    patientEmail: "maria.g@example.com",
    patientPhone: "+1 (555) 234-5678",
    date: "2023-06-14",
    time: "04:00 PM",
    doctor: "Dr. John Smith",
    specialty: "General Practitioner",
    department: "Family Medicine",
    location: "Community Clinic - Room 101",
    status: "cancelled",
    notes: "Rescheduled to next week due to doctor's emergency.",
    medicalHistory: "Type 2 Diabetes, Osteoarthritis",
    medications: "Metformin 1000mg, Acetaminophen 500mg"
  }
];

const AppointmentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const appointment = mockAppointments.find(a => a.id === id);
  
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
    upcoming: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
  };
  
  const handleMarkComplete = () => {
    toast.success("Appointment marked as completed");
    // In a real app, you would update the status via API
    navigate("/admin/appointments");
  };
  
  const handleCancel = () => {
    toast.info("Appointment has been cancelled");
    // In a real app, you would update the status via API
    navigate("/admin/appointments");
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
        
        {appointment.status === "upcoming" && (
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
                className={`${statusColors[appointment.status as keyof typeof statusColors]} bg-opacity-20`}
              >
                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
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
