
import { useState } from "react";
import { 
  Calendar, 
  Clock, 
  User, 
  ChevronRight,
  Check,
  X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

// Mock appointment data
const mockAppointments = [
  {
    id: "1",
    patientName: "Sarah Johnson",
    patientEmail: "sarah.j@example.com",
    date: "2023-06-15",
    time: "09:30 AM",
    doctor: "Dr. Michael Chen",
    specialty: "Cardiologist",
    status: "upcoming",
    notes: "Follow-up on recent test results"
  },
  {
    id: "2",
    patientName: "Robert Davis",
    patientEmail: "robert.d@example.com",
    date: "2023-06-15",
    time: "11:00 AM",
    doctor: "Dr. Emily Wong",
    specialty: "Dermatologist",
    status: "upcoming",
    notes: "Annual skin checkup"
  },
  {
    id: "3",
    patientName: "James Wilson",
    patientEmail: "james.w@example.com",
    date: "2023-06-14",
    time: "02:15 PM",
    doctor: "Dr. Lisa Martinez",
    specialty: "Neurologist",
    status: "completed",
    notes: "Headache assessment"
  },
  {
    id: "4",
    patientName: "Maria Garcia",
    patientEmail: "maria.g@example.com",
    date: "2023-06-14",
    time: "04:00 PM",
    doctor: "Dr. John Smith",
    specialty: "General Practitioner",
    status: "cancelled",
    notes: "Rescheduled to next week"
  }
];

const AppointmentCard = ({ appointment }: { appointment: typeof mockAppointments[0] }) => {
  const navigate = useNavigate();
  
  const statusColors = {
    upcoming: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
  };

  return (
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-lg">{appointment.patientName}</h3>
            <div className="text-muted-foreground text-sm">{appointment.patientEmail}</div>
            
            <div className="flex items-center mt-2 text-sm">
              <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
              <span>{appointment.date}</span>
              <Clock className="h-4 w-4 ml-3 mr-1 text-muted-foreground" />
              <span>{appointment.time}</span>
            </div>
            
            <div className="flex items-center mt-1 text-sm">
              <User className="h-4 w-4 mr-1 text-muted-foreground" />
              <span>{appointment.doctor} ({appointment.specialty})</span>
            </div>
            
            <div className="mt-3">
              <Badge 
                className={`${statusColors[appointment.status as keyof typeof statusColors]} bg-opacity-20`}
              >
                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
              </Badge>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="flex items-center"
              onClick={() => navigate(`/admin/appointments/${appointment.id}`)}
            >
              View <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
            
            {appointment.status === "upcoming" && (
              <>
                <Button size="sm" variant="default" className="flex items-center">
                  <Check className="h-4 w-4 mr-1" /> Complete
                </Button>
                <Button size="sm" variant="destructive" className="flex items-center">
                  <X className="h-4 w-4 mr-1" /> Cancel
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const AdminAppointments = () => {
  const [activeTab, setActiveTab] = useState("all");
  
  const filteredAppointments = mockAppointments.filter(appointment => {
    if (activeTab === "all") return true;
    return appointment.status === activeTab;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Appointments</h1>
        <Button>+ New Appointment</Button>
      </div>
      
      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-6">
          {filteredAppointments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <p className="text-center text-muted-foreground">No appointments found</p>
              </CardContent>
            </Card>
          ) : (
            <div>
              {filteredAppointments.map(appointment => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAppointments;
